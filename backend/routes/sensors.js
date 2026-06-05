const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../config/db');
const { authenticate } = require('../middleware/auth');

// ── Alert Creator ──────────────────────────────────────────────
function createAlert(workerId, type, message, value, threshold, severity) {
  const worker = db.workers.find(w => w.id === workerId);

  // For SOS — always create (no cooldown)
  if (type !== 'sos') {
    const recentAlert = db.alerts.find(a =>
      a.workerId === workerId && a.type === type &&
      new Date() - new Date(a.timestamp) < 300000 && a.status === 'active'
    );
    if (recentAlert) return;
  }

  const alert = {
    id: uuidv4(),
    workerId,
    workerName: worker?.name || 'Unknown',
    workerPhone: worker?.phone || '',
    zone: worker?.zone || '',
    supervisorId: worker?.supervisorId,
    type,
    message,
    value,
    threshold,
    severity,
    status: 'active',
    timestamp: new Date(),
    // Emergency message format
    emergencyMessage: type === 'sos'
      ? `🚨 SEWERGUARD EMERGENCY ALERT\nWorker: ${worker?.name}\nAlert: SOS Button Activated\nZone: ${worker?.zone}\nStatus: IMMEDIATE ATTENTION REQUIRED\nTime: ${new Date().toLocaleString()}`
      : type === 'fall'
      ? `🚨 SEWERGUARD ALERT\nWorker: ${worker?.name}\nAlert: Fall Detected\nZone: ${worker?.zone}\nTime: ${new Date().toLocaleString()}`
      : `⚠️ SEWERGUARD GAS ALERT\nWorker: ${worker?.name}\nAlert: ${type === 'methane' ? 'Methane' : 'Toxic'} Gas - ${value} ppm\nZone: ${worker?.zone}\nTime: ${new Date().toLocaleString()}`
  };

  db.alerts.unshift(alert);
  if (db.alerts.length > 1000) db.alerts.pop();

  console.log(`\n🚨 ALERT CREATED: [${severity.toUpperCase()}] ${type.toUpperCase()} - ${worker?.name} - ${message}`);
  return alert;
}

// ── Sensor Simulation ──────────────────────────────────────────
function simulateSensorData(workerId) {
  const worker = db.workers.find(w => w.id === workerId);
  if (!worker || worker.status !== 'active') return null;
  const device = db.devices.find(d => d.workerId === workerId);
  if (!device || device.status !== 'online') return null;

  const methane     = Math.floor(Math.random() * 280 + 50 + (Math.random() > 0.95 ? 300 : 0));
  const toxic       = Math.floor(Math.random() * 180 + 30 + (Math.random() > 0.95 ? 200 : 0));
  const fallDetected = Math.random() > 0.98;
  const sosActivated = Math.random() > 0.995;

  const entry = {
    id: uuidv4(), workerId, methane, toxic,
    fallDetected, sosActivated,
    battery: device.batteryLevel,
    timestamp: new Date()
  };

  db.sensorData.push(entry);
  if (db.sensorData.length > 10000) db.sensorData.shift();

  device.batteryLevel = Math.max(0, device.batteryLevel - Math.random() * 0.02);
  device.lastSeen = new Date();

  const { thresholds } = db;
  if (methane > thresholds.methane.critical)
    createAlert(workerId, 'methane', `Methane critically high: ${methane} ppm`, methane, thresholds.methane.critical, 'critical');
  else if (methane > thresholds.methane.warning)
    createAlert(workerId, 'methane', `Methane warning: ${methane} ppm`, methane, thresholds.methane.warning, 'warning');

  if (toxic > thresholds.toxic.critical)
    createAlert(workerId, 'toxic', `Toxic gas critically high: ${toxic} ppm`, toxic, thresholds.toxic.critical, 'critical');
  else if (toxic > thresholds.toxic.warning)
    createAlert(workerId, 'toxic', `Toxic gas warning: ${toxic} ppm`, toxic, thresholds.toxic.warning, 'warning');

  if (fallDetected) createAlert(workerId, 'fall', `Fall detected — ${worker.name} may need help`, null, null, 'critical');
  if (sosActivated) createAlert(workerId, 'sos', `🚨 SOS ACTIVATED — ${worker.name} needs immediate help!`, null, null, 'critical');

  return entry;
}

// ── Routes ─────────────────────────────────────────────────────

// Realtime data (polling)
router.get('/realtime', authenticate, (req, res) => {
  db.workers.filter(w => w.status === 'active').forEach(w => simulateSensorData(w.id));
  const data = db.workers.map(worker => {
    const { password, ...w } = worker;
    const latest = db.sensorData.filter(s => s.workerId === worker.id)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];
    const device = db.devices.find(d => d.workerId === worker.id);
    const activeAlerts = db.alerts.filter(a => a.workerId === worker.id && a.status === 'active');
    return { ...w, sensorData: latest, device, activeAlerts };
  });
  res.json(data);
});

router.get('/worker/:workerId', authenticate, (req, res) => {
  const data = db.sensorData.filter(s => s.workerId === req.params.workerId)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 50);
  res.json(data);
});

// ── ESP32 Data Ingest (no auth — IoT device sends here) ────────
router.post('/ingest', (req, res) => {
  try {
    const { deviceId, methane, toxic, fallDetected, sosActivated, battery } = req.body;

    if (!deviceId) return res.status(400).json({ error: 'deviceId required' });

    // Find device by ID or MAC address
    const device = db.devices.find(d => d.id === deviceId || d.macAddress === deviceId);
    if (!device) return res.status(404).json({ error: 'Device not found. Register device first.' });

    const worker = db.workers.find(w => w.id === device.workerId);

    const mVal   = parseFloat(methane)  || 0;
    const tVal   = parseFloat(toxic)    || 0;
    const fVal   = fallDetected === true || fallDetected === 'true' || fallDetected === 1 || fallDetected === '1';
    const sVal   = sosActivated === true || sosActivated === 'true' || sosActivated === 1 || sosActivated === '1';
    const batVal = parseFloat(battery)  || device.batteryLevel;

    const entry = {
      id: uuidv4(),
      workerId: device.workerId,
      methane: mVal, toxic: tVal,
      fallDetected: fVal, sosActivated: sVal,
      battery: batVal,
      timestamp: new Date()
    };

    db.sensorData.push(entry);
    if (db.sensorData.length > 10000) db.sensorData.shift();

    device.batteryLevel = batVal;
    device.lastSeen     = new Date();
    device.status       = 'online';

    const { thresholds } = db;

    // Create alerts based on sensor values
    if (sVal) {
      createAlert(device.workerId, 'sos',
        `🚨 SOS ACTIVATED — ${worker?.name || 'Worker'} pressed emergency button!`,
        null, null, 'critical');
    }
    if (fVal) {
      createAlert(device.workerId, 'fall',
        `Fall detected — ${worker?.name || 'Worker'} may be injured!`,
        null, null, 'critical');
    }
    if (mVal > thresholds.methane.critical) {
      createAlert(device.workerId, 'methane',
        `Methane CRITICAL: ${mVal} ppm (limit: ${thresholds.methane.critical})`,
        mVal, thresholds.methane.critical, 'critical');
    } else if (mVal > thresholds.methane.warning) {
      createAlert(device.workerId, 'methane',
        `Methane WARNING: ${mVal} ppm`,
        mVal, thresholds.methane.warning, 'warning');
    }
    if (tVal > thresholds.toxic.critical) {
      createAlert(device.workerId, 'toxic',
        `Toxic gas CRITICAL: ${tVal} ppm (limit: ${thresholds.toxic.critical})`,
        tVal, thresholds.toxic.critical, 'critical');
    } else if (tVal > thresholds.toxic.warning) {
      createAlert(device.workerId, 'toxic',
        `Toxic gas WARNING: ${tVal} ppm`,
        tVal, thresholds.toxic.warning, 'warning');
    }

    res.json({
      success: true,
      data: entry,
      worker: worker?.name || 'Unknown',
      alertsCreated: sVal || fVal || mVal > thresholds.methane.warning || tVal > thresholds.toxic.warning
    });

  } catch (err) {
    console.error('Ingest error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ── Manual SOS trigger (for testing / app button) ──────────────
router.post('/sos/:workerId', authenticate, (req, res) => {
  const worker = db.workers.find(w => w.id === req.params.workerId);
  if (!worker) return res.status(404).json({ error: 'Worker not found' });

  const alert = createAlert(
    req.params.workerId, 'sos',
    `🚨 SOS ACTIVATED — ${worker.name} needs immediate help!`,
    null, null, 'critical'
  );

  // Add to sensor data
  const device = db.devices.find(d => d.workerId === req.params.workerId);
  db.sensorData.unshift({
    id: uuidv4(), workerId: req.params.workerId,
    methane: 0, toxic: 0,
    fallDetected: false, sosActivated: true,
    battery: device?.batteryLevel || 100,
    timestamp: new Date()
  });

  res.json({ success: true, alert, message: 'SOS alert created — Admin and Supervisor notified' });
});

module.exports = router;
