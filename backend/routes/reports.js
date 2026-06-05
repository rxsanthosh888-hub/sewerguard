const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authMiddleware, requireRole } = require('../middleware/auth');
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');

// Get report summary
router.get('/summary', authMiddleware, requireRole(['admin']), (req, res) => {
  try {
    const workers = db.getAllWorkers();
    const alerts = db.getAllAlerts();
    const devices = db.getAllDevices();

    const totalAlerts = alerts.length;
    const resolvedAlerts = alerts.filter((a) => a.status === 'resolved').length;
    const unresolvedAlerts = alerts.filter((a) => a.status === 'unresolved').length;

    const criticalAlerts = alerts.filter((a) => a.severity === 'critical').length;
    const warningAlerts = alerts.filter((a) => a.severity === 'warning').length;

    const workersWithAlerts = workers.map((w) => ({
      id: w.id,
      name: w.name,
      email: w.email,
      zone: w.zone,
      alertCount: db.getWorkerAlerts(w.id).length,
    }));

    const alertsByType = {};
    alerts.forEach((a) => {
      alertsByType[a.type] = (alertsByType[a.type] || 0) + 1;
    });

    res.json({
      summary: {
        totalWorkers: workers.length,
        totalDevices: devices.length,
        totalAlerts,
        resolvedAlerts,
        unresolvedAlerts,
        criticalAlerts,
        warningAlerts,
      },
      workersWithAlerts,
      alertsByType,
      recentAlerts: alerts.slice(-10).reverse(),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Download PDF report
router.get('/download/pdf', authMiddleware, requireRole(['admin']), (req, res) => {
  try {
    const doc = new PDFDocument();
    const filename = `sewerguard_report_${new Date().toISOString().split('T')[0]}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    doc.pipe(res);

    // Title
    doc.fontSize(20).font('Helvetica-Bold').text('SewerGuard Safety Report', { align: 'center' });
    doc.fontSize(12).text(new Date().toLocaleDateString(), { align: 'center' });
    doc.moveDown();

    // Summary Stats
    const workers = db.getAllWorkers();
    const alerts = db.getAllAlerts();
    const devices = db.getAllDevices();

    doc.fontSize(14).font('Helvetica-Bold').text('Summary Statistics');
    doc.fontSize(11).font('Helvetica');
    doc.text(`Total Workers: ${workers.length}`);
    doc.text(`Total Devices: ${devices.length}`);
    doc.text(`Total Alerts: ${alerts.length}`);
    doc.text(`Resolved Alerts: ${alerts.filter((a) => a.status === 'resolved').length}`);
    doc.text(`Unresolved Alerts: ${alerts.filter((a) => a.status === 'unresolved').length}`);
    doc.moveDown();

    // Recent Alerts
    doc.fontSize(14).font('Helvetica-Bold').text('Recent Alerts');
    const recentAlerts = alerts.slice(-5).reverse();
    recentAlerts.forEach((alert) => {
      const worker = db.getWorkerById(alert.workerId);
      doc.fontSize(10);
      doc.text(`${worker?.name || 'Unknown'}: ${alert.message} - ${alert.severity}`);
    });

    doc.end();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Download Excel report
router.get('/download/excel', authMiddleware, requireRole(['admin']), async (req, res) => {
  try {
    const workbook = new ExcelJS.Workbook();

    // Summary sheet
    const summarySheet = workbook.addWorksheet('Summary');
    const workers = db.getAllWorkers();
    const alerts = db.getAllAlerts();
    const devices = db.getAllDevices();

    summarySheet.columns = [
      { header: 'Metric', key: 'metric', width: 20 },
      { header: 'Value', key: 'value', width: 20 },
    ];

    summarySheet.addRows([
      { metric: 'Total Workers', value: workers.length },
      { metric: 'Total Devices', value: devices.length },
      { metric: 'Total Alerts', value: alerts.length },
      { metric: 'Resolved Alerts', value: alerts.filter((a) => a.status === 'resolved').length },
      { metric: 'Unresolved Alerts', value: alerts.filter((a) => a.status === 'unresolved').length },
      { metric: 'Critical Alerts', value: alerts.filter((a) => a.severity === 'critical').length },
      { metric: 'Warning Alerts', value: alerts.filter((a) => a.severity === 'warning').length },
    ]);

    // Workers sheet
    const workersSheet = workbook.addWorksheet('Workers');
    workersSheet.columns = [
      { header: 'Name', key: 'name', width: 20 },
      { header: 'Email', key: 'email', width: 25 },
      { header: 'Zone', key: 'zone', width: 15 },
      { header: 'Alert Count', key: 'alertCount', width: 12 },
    ];

    const workersData = workers.map((w) => ({
      name: w.name,
      email: w.email,
      zone: w.zone,
      alertCount: db.getWorkerAlerts(w.id).length,
    }));

    workersSheet.addRows(workersData);

    // Alerts sheet
    const alertsSheet = workbook.addWorksheet('Alerts');
    alertsSheet.columns = [
      { header: 'Worker', key: 'worker', width: 20 },
      { header: 'Type', key: 'type', width: 20 },
      { header: 'Severity', key: 'severity', width: 12 },
      { header: 'Message', key: 'message', width: 30 },
      { header: 'Timestamp', key: 'timestamp', width: 20 },
      { header: 'Status', key: 'status', width: 12 },
    ];

    const alertsData = alerts.map((a) => {
      const worker = db.getWorkerById(a.workerId);
      return {
        worker: worker?.name || 'Unknown',
        type: a.type,
        severity: a.severity,
        message: a.message,
        timestamp: new Date(a.timestamp).toLocaleString(),
        status: a.status,
      };
    });

    alertsSheet.addRows(alertsData);

    const filename = `sewerguard_report_${new Date().toISOString().split('T')[0]}.xlsx`;
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
