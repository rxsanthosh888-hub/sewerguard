const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, (req, res) => {
  let alerts = [...db.alerts];
  if (req.user.role === 'supervisor') {
    const sup = db.supervisors.find(s => s.id === req.user.id);
    alerts = alerts.filter(a => sup?.assignedWorkers.includes(a.workerId));
  } else if (req.user.role === 'worker') {
    alerts = alerts.filter(a => a.workerId === req.user.id);
  }
  const { status, type, limit = 50 } = req.query;
  if (status) alerts = alerts.filter(a => a.status === status);
  if (type) alerts = alerts.filter(a => a.type === type);
  res.json(alerts.slice(0, parseInt(limit)));
});

router.get('/active', authenticate, (req, res) => {
  let alerts = db.alerts.filter(a => a.status === 'active');
  if (req.user.role === 'supervisor') {
    const sup = db.supervisors.find(s => s.id === req.user.id);
    alerts = alerts.filter(a => sup?.assignedWorkers.includes(a.workerId));
  } else if (req.user.role === 'worker') {
    alerts = alerts.filter(a => a.workerId === req.user.id);
  }
  res.json(alerts);
});

router.put('/:id/resolve', authenticate, (req, res) => {
  const alert = db.alerts.find(a => a.id === req.params.id);
  if (!alert) return res.status(404).json({ error: 'Alert not found' });
  alert.status = 'resolved';
  alert.resolvedAt = new Date();
  alert.resolvedBy = req.user.name;
  res.json(alert);
});

module.exports = router;
