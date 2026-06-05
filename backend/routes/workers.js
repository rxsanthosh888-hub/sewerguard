const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authMiddleware, requireRole } = require('../middleware/auth');

// Get all workers
router.get('/', authMiddleware, (req, res) => {
  try {
    const workers = db.getAllWorkers();
    const workersWithSensors = workers.map((w) => ({
      ...w,
      latestSensor: db.getLatestSensor(w.deviceId),
      tasksCompleted: 0,
      assignedDevices: [w.deviceId]
    }));
    res.json({ workers: workersWithSensors, total: workersWithSensors.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get worker by ID
router.get('/:id', authMiddleware, (req, res) => {
  try {
    const worker = db.getWorkerById(req.params.id);
    if (!worker) {
      return res.status(404).json({ error: 'Worker not found' });
    }

    const latestSensor = db.getLatestSensor(worker.deviceId);
    const alerts = db.getWorkerAlerts(worker.id);

    res.json({
      ...worker,
      latestSensor,
      recentAlerts: alerts,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create worker
router.post('/', authMiddleware, requireRole(['admin']), (req, res) => {
  try {
    const { name, email, employeeId, phone, zone, supervisorId, deviceId } =
      req.body;

    if (!name || !email || !employeeId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const worker = db.createWorker({
      name,
      email,
      employeeId,
      phone,
      zone,
      supervisorId,
      deviceId,
      status: 'active',
    });

    res.status(201).json(worker);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update worker
router.put('/:id', authMiddleware, requireRole(['admin']), (req, res) => {
  try {
    const worker = db.updateWorker(req.params.id, req.body);
    if (!worker) {
      return res.status(404).json({ error: 'Worker not found' });
    }
    res.json(worker);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete worker
router.delete('/:id', authMiddleware, requireRole(['admin']), (req, res) => {
  try {
    const deleted = db.deleteWorker(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Worker not found' });
    }
    res.json({ message: 'Worker deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
