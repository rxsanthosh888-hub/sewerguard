const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authMiddleware } = require('../middleware/auth');

// Ingest sensor data from ESP32 (no auth required)
router.post('/ingest', (req, res) => {
  try {
    const { deviceId, methane, toxic, fallDetected, sosActivated, battery } =
      req.body;

    if (!deviceId) {
      return res.status(400).json({ error: 'deviceId required' });
    }

    // Add sensor reading
    const reading = db.addSensorReading({
      deviceId,
      methane: methane || 0,
      toxic: toxic || 0,
      fallDetected: fallDetected || false,
      sosActivated: sosActivated || false,
      battery: battery || 0,
    });

    // Check thresholds and create alerts
    const worker = db.workers.find((w) => w.deviceId === deviceId);
    if (worker) {
      // Methane thresholds
      if (methane >= 500) {
        // Check if alert already exists for this type
        const existingAlert = db.alerts.find(
          (a) =>
            a.workerId === worker.id &&
            a.type === 'methane_critical' &&
            a.status === 'unresolved'
        );
        if (!existingAlert) {
          db.createAlert({
            workerId: worker.id,
            type: 'methane_critical',
            value: methane,
            severity: 'critical',
            message: `Methane level critical: ${methane} ppm`,
          });
        }
      } else if (methane >= 300) {
        const existingAlert = db.alerts.find(
          (a) =>
            a.workerId === worker.id &&
            a.type === 'methane_warning' &&
            a.status === 'unresolved'
        );
        if (!existingAlert) {
          db.createAlert({
            workerId: worker.id,
            type: 'methane_warning',
            value: methane,
            severity: 'warning',
            message: `Methane level warning: ${methane} ppm`,
          });
        }
      }

      // Toxic thresholds
      if (toxic >= 350) {
        const existingAlert = db.alerts.find(
          (a) =>
            a.workerId === worker.id &&
            a.type === 'toxic_critical' &&
            a.status === 'unresolved'
        );
        if (!existingAlert) {
          db.createAlert({
            workerId: worker.id,
            type: 'toxic_critical',
            value: toxic,
            severity: 'critical',
            message: `Toxic gas level critical: ${toxic} ppm`,
          });
        }
      } else if (toxic >= 250) {
        const existingAlert = db.alerts.find(
          (a) =>
            a.workerId === worker.id &&
            a.type === 'toxic_warning' &&
            a.status === 'unresolved'
        );
        if (!existingAlert) {
          db.createAlert({
            workerId: worker.id,
            type: 'toxic_warning',
            value: toxic,
            severity: 'warning',
            message: `Toxic gas level warning: ${toxic} ppm`,
          });
        }
      }

      // Fall detection
      if (fallDetected) {
        const existingAlert = db.alerts.find(
          (a) =>
            a.workerId === worker.id &&
            a.type === 'fall_detected' &&
            a.status === 'unresolved'
        );
        if (!existingAlert) {
          db.createAlert({
            workerId: worker.id,
            type: 'fall_detected',
            value: null,
            severity: 'critical',
            message: 'Fall detected',
          });
        }
      }

      // SOS activation
      if (sosActivated) {
        const existingAlert = db.alerts.find(
          (a) =>
            a.workerId === worker.id &&
            a.type === 'sos_activated' &&
            a.status === 'unresolved'
        );
        if (!existingAlert) {
          db.createAlert({
            workerId: worker.id,
            type: 'sos_activated',
            value: null,
            severity: 'critical',
            message: 'SOS button activated',
          });
        }
      }
    }

    res.json({
      success: true,
      message: 'Data received',
      reading,
    });
  } catch (error) {
    console.error('Sensor ingest error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get real-time sensor data
router.get('/realtime', authMiddleware, (req, res) => {
  try {
    const allLatest = db.getAllLatestSensors();
    const withWorkers = allLatest.map((sensor) => {
      const worker = db.workers.find((w) => w.deviceId === sensor.deviceId);
      return {
        ...sensor,
        worker,
      };
    });
    res.json(withWorkers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
