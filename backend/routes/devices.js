const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticate, requireRole } = require('../middleware/auth');

router.get('/', authenticate, (req, res) => {
  const devices = db.devices.map(d => {
    const worker = db.workers.find(w => w.id === d.workerId);
    return { ...d, workerName: worker?.name || 'Unassigned', workerZone: worker?.zone || '' };
  });
  res.json(devices);
});

router.put('/:id/toggle', authenticate, requireRole('admin'), (req, res) => {
  const device = db.devices.find(d => d.id === req.params.id);
  if (!device) return res.status(404).json({ error: 'Device not found' });
  device.status = device.status === 'online' ? 'offline' : 'online';
  res.json(device);
});

router.get('/:id/data', authenticate, (req, res) => {
  const device = db.devices.find(d => d.id === req.params.id);
  if (!device) return res.status(404).json({ error: 'Not found' });
  const sensorData = db.sensorData.filter(s => s.workerId === device.workerId)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 30);
  res.json({ device, sensorData });
});

module.exports = router;
