const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authMiddleware, requireRole } = require('../middleware/auth');

// Get all supervisors
router.get('/', authMiddleware, (req, res) => {
  try {
    const supervisors = db.getAllSupervisors().map(s => {
      const unresolvedAlerts = db.getUnresolvedAlerts().filter(a => {
        const worker = db.workers.find(w => w.id === a.workerId);
        return worker && worker.supervisorId === s.id;
      });
      return {
        ...s,
        status: 'active',
        teamSize: s.assignedWorkers.length,
        activeAlerts: unresolvedAlerts.length,
        resolvedAlerts: db.alerts.filter(a => {
          const worker = db.workers.find(w => w.id === a.workerId);
          return worker && worker.supervisorId === s.id && a.status === 'resolved';
        }).length,
        supervisedWorkers: db.workers.filter(w => w.supervisorId === s.id)
      };
    });
    res.json({ supervisors, total: supervisors.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get supervisor by ID
router.get('/:id', authMiddleware, (req, res) => {
  try {
    const supervisor = db.getSupervisorById(req.params.id);
    if (!supervisor) {
      return res.status(404).json({ error: 'Supervisor not found' });
    }
    res.json(supervisor);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create supervisor
router.post('/', authMiddleware, requireRole(['admin']), (req, res) => {
  try {
    const { name, email, phone, zone } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const supervisor = db.createSupervisor({
      name,
      email,
      phone,
      zone,
      assignedWorkers: [],
    });

    res.status(201).json(supervisor);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update supervisor
router.put('/:id', authMiddleware, requireRole(['admin']), (req, res) => {
  try {
    const supervisor = db.updateSupervisor(req.params.id, req.body);
    if (!supervisor) {
      return res.status(404).json({ error: 'Supervisor not found' });
    }
    res.json(supervisor);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete supervisor
router.delete('/:id', authMiddleware, requireRole(['admin']), (req, res) => {
  try {
    db.deleteSupervisor(req.params.id);
    res.json({ message: 'Supervisor deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
