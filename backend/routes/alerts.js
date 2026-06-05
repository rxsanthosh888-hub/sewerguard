const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authMiddleware, requireRole } = require('../middleware/auth');

// Get all alerts
router.get('/', authMiddleware, (req, res) => {
  try {
    const alerts = db.getAllAlerts();
    const withWorkers = alerts.map((alert) => {
      const worker = db.getWorkerById(alert.workerId);
      const device = worker ? db.getDeviceById(worker.deviceId) : null;
      return {
        ...alert,
        createdAt: alert.timestamp,
        workerName: worker?.name,
        workerEmail: worker?.email,
        device: device,
        sensor: db.getLatestSensor(device?.id)
      };
    });
    res.json({ alerts: withWorkers, total: withWorkers.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get alerts for a worker
router.get('/worker/:workerId', authMiddleware, (req, res) => {
  try {
    const alerts = db.getWorkerAlerts(req.params.workerId);
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Resolve alert
router.put('/:id/resolve', authMiddleware, (req, res) => {
  try {
    const alert = db.resolveAlert(req.params.id, req.user.id);
    if (!alert) {
      return res.status(404).json({ error: 'Alert not found' });
    }
    res.json(alert);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
