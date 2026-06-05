const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authMiddleware, requireRole } = require('../middleware/auth');

// Admin dashboard
router.get('/admin', authMiddleware, requireRole(['admin']), (req, res) => {
  try {
    const dashboard = db.getAdminDashboard();
    const latestSensors = db.getAllLatestSensors();
    const recentAlerts = db
      .getAllAlerts()
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 10);

    // Calculate average gas levels
    const avgMethane = latestSensors.length > 0
      ? latestSensors.reduce((sum, s) => sum + s.methane, 0) / latestSensors.length
      : 0;
    const avgToxic = latestSensors.length > 0
      ? latestSensors.reduce((sum, s) => sum + s.toxic, 0) / latestSensors.length
      : 0;

    const alertsWithWorkers = recentAlerts.map((a) => {
      const worker = db.getWorkerById(a.workerId);
      return {
        ...a,
        workerName: worker?.name,
        workerEmail: worker?.email,
      };
    });

    res.json({
      ...dashboard,
      avgMethane: Math.round(avgMethane),
      avgToxic: Math.round(avgToxic),
      sensors: latestSensors,
      recentAlerts: alertsWithWorkers,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Supervisor dashboard
router.get('/supervisor', authMiddleware, requireRole(['supervisor']), (req, res) => {
  try {
    // Find supervisor from user ID
    const supervisor = db.supervisors.find((s) => s.userId === req.user.id);
    if (!supervisor) {
      return res.status(404).json({ error: 'Supervisor not found' });
    }

    const dashboard = db.getSupervisorDashboard(supervisor.id);
    const assignedWorkers = db.workers.filter(
      (w) => w.supervisorId === supervisor.id
    );

    const sensors = assignedWorkers
      .map((w) => ({
        worker: w,
        sensor: db.getLatestSensor(w.deviceId),
      }));

    const alerts = db
      .getAllAlerts()
      .filter(
        (a) =>
          assignedWorkers.findIndex((w) => w.id === a.workerId) !== -1
      )
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 10);

    res.json({
      ...dashboard,
      workers: sensors,
      recentAlerts: alerts,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Worker dashboard
router.get('/worker', authMiddleware, requireRole(['worker']), (req, res) => {
  try {
    // Find worker from user ID
    const worker = db.workers.find((w) => w.userId === req.user.id);
    if (!worker) {
      return res.status(404).json({ error: 'Worker not found' });
    }

    const dashboard = db.getWorkerDashboard(worker.id);
    const supervisor = db.getSupervisorById(worker.supervisorId);

    res.json({
      ...dashboard,
      supervisor,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
