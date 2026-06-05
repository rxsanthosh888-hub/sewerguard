const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticate, requireRole } = require('../middleware/auth');

router.get('/summary', authenticate, requireRole('admin', 'supervisor'), (req, res) => {
  const totalWorkers = db.workers.length;
  const activeWorkers = db.workers.filter(w => w.status === 'active').length;
  const totalSupervisors = db.supervisors.length;
  const totalAlerts = db.alerts.length;
  const criticalAlerts = db.alerts.filter(a => a.severity === 'critical' && a.status === 'active').length;
  const onlineDevices = db.devices.filter(d => d.status === 'online').length;

  const alertsByType = db.alerts.reduce((acc, a) => {
    acc[a.type] = (acc[a.type] || 0) + 1;
    return acc;
  }, {});

  const alertsBySeverity = db.alerts.reduce((acc, a) => {
    acc[a.severity] = (acc[a.severity] || 0) + 1;
    return acc;
  }, {});

  res.json({
    totalWorkers, activeWorkers, inactiveWorkers: totalWorkers - activeWorkers,
    totalSupervisors, totalAlerts, criticalAlerts, onlineDevices,
    totalDevices: db.devices.length, alertsByType, alertsBySeverity,
    generatedAt: new Date()
  });
});

router.get('/alerts', authenticate, (req, res) => {
  res.json(db.alerts.slice(0, 100));
});

router.get('/workers', authenticate, requireRole('admin'), (req, res) => {
  const workers = db.workers.map(({ password, ...w }) => {
    const supervisor = db.supervisors.find(s => s.id === w.supervisorId);
    const device = db.devices.find(d => d.workerId === w.id);
    const alertCount = db.alerts.filter(a => a.workerId === w.id).length;
    return { ...w, supervisorName: supervisor?.name || 'Unassigned', device, alertCount };
  });
  res.json(workers);
});

module.exports = router;
