const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authMiddleware, requireRole } = require('../middleware/auth');

// Get all devices
router.get('/', authMiddleware, (req, res) => {
  try {
    const devices = db.getAllDevices();
    res.json(devices);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get device by ID
router.get('/:id', authMiddleware, (req, res) => {
  try {
    const device = db.getDeviceById(req.params.id);
    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }
    const latestSensor = db.getLatestSensor(device.id);
    res.json({ ...device, latestSensor });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Toggle device status
router.put('/:id/toggle', authMiddleware, requireRole(['admin']), (req, res) => {
  try {
    const device = db.toggleDeviceStatus(req.params.id);
    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }
    res.json(device);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
