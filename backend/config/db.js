// In-Memory Database for SewerGuard
// This resets on server restart - ready to connect to Firebase/MongoDB

const { v4: uuidv4 } = require('uuid');
const bcryptjs = require('bcryptjs');

class Database {
  constructor() {
    this.users = [];
    this.workers = [];
    this.supervisors = [];
    this.devices = [];
    this.sensors = [];
    this.alerts = [];
    this.initializeDemoData();
  }

  initializeDemoData() {
    // Demo Users
    const adminPassword = bcryptjs.hashSync('admin123', 10);
    const superPassword = bcryptjs.hashSync('super123', 10);
    const workerPassword = bcryptjs.hashSync('worker123', 10);

    this.users = [
      {
        id: 'user_admin_1',
        email: 'admin@sewerguard.com',
        password: adminPassword,
        name: 'Admin User',
        role: 'admin',
        createdAt: new Date(),
      },
      {
        id: 'user_supervisor_1',
        email: 'john@sewerguard.com',
        password: superPassword,
        name: 'John Supervisor',
        role: 'supervisor',
        createdAt: new Date(),
      },
      {
        id: 'user_supervisor_2',
        email: 'sarah@sewerguard.com',
        password: superPassword,
        name: 'Sarah Supervisor',
        role: 'supervisor',
        createdAt: new Date(),
      },
      {
        id: 'user_worker_1',
        email: 'mike@sewerguard.com',
        password: workerPassword,
        name: 'Mike Worker',
        role: 'worker',
        createdAt: new Date(),
      },
      {
        id: 'user_worker_2',
        email: 'carlos@sewerguard.com',
        password: workerPassword,
        name: 'Carlos Worker',
        role: 'worker',
        createdAt: new Date(),
      },
    ];

    // Demo Supervisors
    this.supervisors = [
      {
        id: 'super_1',
        userId: 'user_supervisor_1',
        name: 'John Supervisor',
        email: 'john@sewerguard.com',
        phone: '+91-98765-43210',
        zone: 'Zone A',
        assignedWorkers: ['worker_1', 'worker_2'],
        createdAt: new Date(),
      },
      {
        id: 'super_2',
        userId: 'user_supervisor_2',
        name: 'Sarah Supervisor',
        email: 'sarah@sewerguard.com',
        phone: '+91-98765-43211',
        zone: 'Zone B',
        assignedWorkers: ['worker_3'],
        createdAt: new Date(),
      },
    ];

    // Demo Workers
    this.workers = [
      {
        id: 'worker_1',
        userId: 'user_worker_1',
        name: 'Mike Worker',
        email: 'mike@sewerguard.com',
        employeeId: 'EMP001',
        phone: '+91-98765-43212',
        zone: 'Zone A',
        supervisorId: 'super_1',
        deviceId: 'AA:BB:CC:DD:EE:01',
        status: 'active',
        createdAt: new Date(),
      },
      {
        id: 'worker_2',
        userId: 'user_worker_2',
        name: 'Carlos Worker',
        email: 'carlos@sewerguard.com',
        employeeId: 'EMP002',
        phone: '+91-98765-43213',
        zone: 'Zone A',
        supervisorId: 'super_1',
        deviceId: 'AA:BB:CC:DD:EE:02',
        status: 'active',
        createdAt: new Date(),
      },
      {
        id: 'worker_3',
        userId: 'user_worker_1',
        name: 'Test Worker',
        email: 'test@sewerguard.com',
        employeeId: 'EMP003',
        phone: '+91-98765-43214',
        zone: 'Zone B',
        supervisorId: 'super_2',
        deviceId: 'AA:BB:CC:DD:EE:03',
        status: 'active',
        createdAt: new Date(),
      },
    ];

    // Demo Devices
    this.devices = [
      {
        id: 'AA:BB:CC:DD:EE:01',
        workerId: 'worker_1',
        firmware: 'v1.0.0',
        battery: 85,
        status: 'online',
        lastSeen: new Date(),
        createdAt: new Date(),
      },
      {
        id: 'AA:BB:CC:DD:EE:02',
        workerId: 'worker_2',
        firmware: 'v1.0.0',
        battery: 92,
        status: 'online',
        lastSeen: new Date(),
        createdAt: new Date(),
      },
      {
        id: 'AA:BB:CC:DD:EE:03',
        workerId: 'worker_3',
        firmware: 'v1.0.0',
        battery: 65,
        status: 'offline',
        lastSeen: new Date(Date.now() - 3600000),
        createdAt: new Date(),
      },
    ];

    // Demo Sensors (current readings)
    this.sensors = [
      {
        id: 'sensor_1',
        deviceId: 'AA:BB:CC:DD:EE:01',
        methane: 250,
        toxic: 120,
        fallDetected: false,
        sosActivated: false,
        battery: 85,
        timestamp: new Date(),
      },
      {
        id: 'sensor_2',
        deviceId: 'AA:BB:CC:DD:EE:02',
        methane: 150,
        toxic: 80,
        fallDetected: false,
        sosActivated: false,
        battery: 92,
        timestamp: new Date(),
      },
      {
        id: 'sensor_3',
        deviceId: 'AA:BB:CC:DD:EE:03',
        methane: 420,
        toxic: 280,
        fallDetected: true,
        sosActivated: false,
        battery: 65,
        timestamp: new Date(Date.now() - 5000),
      },
    ];

    // Demo Alerts
    this.alerts = [
      {
        id: 'alert_1',
        workerId: 'worker_3',
        type: 'methane_warning',
        value: 420,
        severity: 'warning',
        message: 'Methane level warning',
        timestamp: new Date(Date.now() - 600000),
        status: 'unresolved',
        resolvedAt: null,
        resolvedBy: null,
      },
      {
        id: 'alert_2',
        workerId: 'worker_3',
        type: 'fall_detected',
        value: null,
        severity: 'critical',
        message: 'Fall detected',
        timestamp: new Date(Date.now() - 300000),
        status: 'unresolved',
        resolvedAt: null,
        resolvedBy: null,
      },
      {
        id: 'alert_3',
        workerId: 'worker_1',
        type: 'toxic_warning',
        value: 200,
        severity: 'warning',
        message: 'Toxic gas warning',
        timestamp: new Date(Date.now() - 86400000),
        status: 'resolved',
        resolvedAt: new Date(Date.now() - 85000000),
        resolvedBy: 'user_admin_1',
      },
    ];
  }

  // User methods
  findUserByEmail(email) {
    return this.users.find((u) => u.email === email);
  }

  findUserById(id) {
    return this.users.find((u) => u.id === id);
  }

  createUser(userData) {
    const user = {
      id: uuidv4(),
      ...userData,
      createdAt: new Date(),
    };
    this.users.push(user);
    return user;
  }

  // Worker methods
  getAllWorkers() {
    return this.workers;
  }

  getWorkerById(id) {
    return this.workers.find((w) => w.id === id);
  }

  createWorker(workerData) {
    const worker = {
      id: uuidv4(),
      ...workerData,
      createdAt: new Date(),
    };
    this.workers.push(worker);
    return worker;
  }

  updateWorker(id, updates) {
    const worker = this.getWorkerById(id);
    if (worker) {
      Object.assign(worker, updates);
    }
    return worker;
  }

  deleteWorker(id) {
    const index = this.workers.findIndex((w) => w.id === id);
    if (index !== -1) {
      this.workers.splice(index, 1);
      return true;
    }
    return false;
  }

  // Supervisor methods
  getAllSupervisors() {
    return this.supervisors;
  }

  getSupervisorById(id) {
    return this.supervisors.find((s) => s.id === id);
  }

  createSupervisor(supervisorData) {
    const supervisor = {
      id: uuidv4(),
      ...supervisorData,
      createdAt: new Date(),
    };
    this.supervisors.push(supervisor);
    return supervisor;
  }

  updateSupervisor(id, updates) {
    const supervisor = this.getSupervisorById(id);
    if (supervisor) {
      Object.assign(supervisor, updates);
    }
    return supervisor;
  }

  deleteSupervisor(id) {
    const index = this.supervisors.findIndex((s) => s.id === id);
    if (index !== -1) {
      this.supervisors.splice(index, 1);
    }
    return true;
  }

  // Device methods
  getAllDevices() {
    return this.devices;
  }

  getDeviceById(id) {
    return this.devices.find((d) => d.id === id);
  }

  createDevice(deviceData) {
    const device = {
      ...deviceData,
      createdAt: new Date(),
    };
    this.devices.push(device);
    return device;
  }

  updateDevice(id, updates) {
    const device = this.getDeviceById(id);
    if (device) {
      Object.assign(device, updates, { lastSeen: new Date() });
    }
    return device;
  }

  toggleDeviceStatus(id) {
    const device = this.getDeviceById(id);
    if (device) {
      device.status = device.status === 'online' ? 'offline' : 'online';
      device.lastSeen = new Date();
    }
    return device;
  }

  // Sensor methods
  getLatestSensor(deviceId) {
    return this.sensors
      .filter((s) => s.deviceId === deviceId)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];
  }

  getAllLatestSensors() {
    const latest = {};
    this.sensors.forEach((sensor) => {
      if (
        !latest[sensor.deviceId] ||
        new Date(sensor.timestamp) > new Date(latest[sensor.deviceId].timestamp)
      ) {
        latest[sensor.deviceId] = sensor;
      }
    });
    return Object.values(latest);
  }

  addSensorReading(sensorData) {
    const reading = {
      id: uuidv4(),
      ...sensorData,
      timestamp: new Date(),
    };
    this.sensors.push(reading);

    // Update device
    const device = this.getDeviceById(sensorData.deviceId);
    if (device) {
      device.battery = sensorData.battery;
      device.status = 'online';
      device.lastSeen = new Date();
    }

    return reading;
  }

  // Alert methods
  getAllAlerts() {
    return this.alerts;
  }

  getAlertById(id) {
    return this.alerts.find((a) => a.id === id);
  }

  createAlert(alertData) {
    const alert = {
      id: uuidv4(),
      ...alertData,
      timestamp: new Date(),
      status: 'unresolved',
      resolvedAt: null,
      resolvedBy: null,
    };
    this.alerts.push(alert);
    return alert;
  }

  resolveAlert(id, userId) {
    const alert = this.getAlertById(id);
    if (alert) {
      alert.status = 'resolved';
      alert.resolvedAt = new Date();
      alert.resolvedBy = userId;
    }
    return alert;
  }

  getWorkerAlerts(workerId) {
    return this.alerts.filter((a) => a.workerId === workerId);
  }

  getUnresolvedAlerts() {
    return this.alerts.filter((a) => a.status === 'unresolved');
  }

  // Dashboard methods
  getAdminDashboard() {
    const unresolvedAlerts = this.getUnresolvedAlerts();
    const onlineDevices = this.devices.filter((d) => d.status === 'online');

    return {
      totalWorkers: this.workers.length,
      totalSupervisors: this.supervisors.length,
      activeAlerts: unresolvedAlerts.length,
      onlineDevices: onlineDevices.length,
      totalDevices: this.devices.length,
    };
  }

  getSupervisorDashboard(supervisorId) {
    const supervisor = this.getSupervisorById(supervisorId);
    if (!supervisor) return null;

    const assignedWorkers = this.workers.filter(
      (w) => w.supervisorId === supervisorId
    );
    const workerIds = assignedWorkers.map((w) => w.id);
    const alerts = this.alerts.filter(
      (a) => workerIds.includes(a.workerId) && a.status === 'unresolved'
    );

    return {
      supervisorName: supervisor.name,
      assignedWorkers: assignedWorkers.length,
      activeAlerts: alerts.length,
      zone: supervisor.zone,
    };
  }

  getWorkerDashboard(workerId) {
    const worker = this.getWorkerById(workerId);
    if (!worker) return null;

    const latestSensor = this.getLatestSensor(worker.deviceId);
    const alerts = this.getWorkerAlerts(workerId);

    return {
      worker,
      latestSensor,
      recentAlerts: alerts.slice(-5).reverse(),
    };
  }
}

module.exports = new Database();
