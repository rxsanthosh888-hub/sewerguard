const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../config/db');
const { authenticate } = require('../middleware/auth');

router.get('/admin', authenticate, (req, res) => {
  const totalWorkers = db.workers.length;
  const activeWorkers = db.workers.filter(w => w.status === 'active').length;
  const totalSupervisors = db.supervisors.length;
  const criticalAlerts = db.alerts.filter(a => a.severity === 'critical' && a.status === 'active').length;
  const onlineDevices = db.devices.filter(d => d.status === 'online').length;
  const recentAlerts = db.alerts.slice(0, 10);

  // Simulate live data
  db.workers.filter(w => w.status === 'active').forEach(w => {
    const device = db.devices.find(d => d.workerId === w.id);
    if (device?.status === 'online') {
      const latest = {
        id: uuidv4(),
        workerId: w.id,
        methane: Math.floor(Math.random() * 250 + 50),
        toxic: Math.floor(Math.random() * 180 + 30),
        fallDetected: false,
        sosActivated: false,
        battery: device.batteryLevel,
        timestamp: new Date()
      };
      db.sensorData.push(latest);
      if (db.sensorData.length > 10000) db.sensorData.shift();
      device.lastSeen = new Date();
    }
  });

  res.json({
    stats: {
      totalWorkers, activeWorkers,
      inactiveWorkers: totalWorkers - activeWorkers,
      totalSupervisors, criticalAlerts, onlineDevices,
      totalDevices: db.devices.length
    },
    recentAlerts,
    workers: db.workers.map(({ password, ...w }) => {
      const latest = db.sensorData.filter(s => s.workerId === w.id)
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];
      const device = db.devices.find(d => d.workerId === w.id);
      return { ...w, sensorData: latest, device };
    })
  });
});

router.get('/supervisor', authenticate, (req, res) => {
  const sup = db.supervisors.find(s => s.id === req.user.id);
  if (!sup) return res.status(404).json({ error: 'Not found' });

  const workers = db.workers.filter(w => sup.assignedWorkers.includes(w.id)).map(({ password, ...w }) => {
    const latest = db.sensorData.filter(s => s.workerId === w.id)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];
    const device = db.devices.find(d => d.workerId === w.id);
    const activeAlerts = db.alerts.filter(a => a.workerId === w.id && a.status === 'active');
    return { ...w, sensorData: latest, device, activeAlerts };
  });

  const alerts = db.alerts.filter(a => sup.assignedWorkers.includes(a.workerId)).slice(0, 20);
  const { password, ...supData } = sup;
  res.json({ supervisor: supData, workers, alerts });
});

router.get('/worker', authenticate, (req, res) => {
  const worker = db.workers.find(w => w.id === req.user.id);
  if (!worker) return res.status(404).json({ error: 'Not found' });
  const { password, ...w } = worker;
  const sensorHistory = db.sensorData.filter(s => s.workerId === w.id)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 20);
  const device = db.devices.find(d => d.workerId === w.id);
  const supervisor = db.supervisors.find(s => s.id === w.supervisorId);
  const alerts = db.alerts.filter(a => a.workerId === w.id).slice(0, 10);
  const { password: sp, ...supData } = supervisor || {};
  res.json({
    worker: w, sensorHistory, device,
    supervisor: supervisor ? supData : null,
    alerts
  });
});

module.exports = router;
