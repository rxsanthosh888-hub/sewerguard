const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Dashboard endpoints
router.get('/admin', (req, res) => {
  try {
    const stats = db.getAdminDashboard();
    res.json({ 
      stats: {
        totalWorkers: stats.totalWorkers,
        totalSupervisors: stats.totalSupervisors,
        activeAlerts: stats.activeAlerts,
        onlineDevices: stats.onlineDevices,
        totalDevices: stats.totalDevices,
        totalUsers: db.users.length,
        activeDevices: stats.onlineDevices
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get admin dashboard' });
  }
});

router.get('/stats', (req, res) => {
  try {
    const stats = db.getAdminDashboard();
    res.json({ 
      stats: {
        totalWorkers: stats.totalWorkers,
        totalSupervisors: stats.totalSupervisors,
        activeAlerts: stats.activeAlerts,
        onlineDevices: stats.onlineDevices,
        totalDevices: stats.totalDevices
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

router.get('/overview', (req, res) => {
  try {
    const unresolvedAlerts = db.getUnresolvedAlerts();
    const onlineDevices = db.devices.filter(d => d.status === 'online');
    
    res.json({
      overview: {
        devices: {
          active: onlineDevices.length,
          inactive: db.devices.length - onlineDevices.length,
          total: db.devices.length
        },
        alerts: {
          critical: unresolvedAlerts.filter(a => a.severity === 'critical').length,
          high: unresolvedAlerts.filter(a => a.severity === 'warning').length,
          medium: 0,
          low: 0
        },
        system: {
          uptime: 99.8
        }
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get overview' });
  }
});

router.get('/recent-alerts', (req, res) => {
  try {
    const alerts = db.getUnresolvedAlerts()
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 5)
      .map(alert => ({
        ...alert,
        createdAt: alert.timestamp
      }));
    
    res.json({ alerts });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get recent alerts' });
  }
});

router.get('/device-health', (req, res) => {
  try {
    const devices = db.getAllDevices().map(d => ({
      ...d,
      batteryLevel: d.battery,
      signalStrength: 95
    }));
    
    res.json({ devices });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get device health' });
  }
});

module.exports = router;
