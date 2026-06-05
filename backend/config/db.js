// In-memory database for demo (replace with Firebase in production)
const bcrypt = require('bcryptjs');

const db = {
  admins: [
    {
      id: 'admin-001',
      name: 'Santhosh',
      email: 'rx.santhosh888@gmail.com',
      password: bcrypt.hashSync('santhosh', 10),
      role: 'admin',
      phone: '+91-9999999999',
      createdAt: new Date('2024-01-01')
    }
  ],
  supervisors: [
    {
      id: 'sup-001',
      name: 'John Martinez',
      email: 'john@sewerguard.com',
      password: bcrypt.hashSync('super123', 10),
      role: 'supervisor',
      phone: '+1-555-0101',
      zone: 'Zone A - Downtown',
      assignedWorkers: ['w-001', 'w-002', 'w-003'],
      status: 'active',
      createdAt: new Date('2024-01-15')
    },
    {
      id: 'sup-002',
      name: 'Sarah Johnson',
      email: 'sarah@sewerguard.com',
      password: bcrypt.hashSync('super123', 10),
      role: 'supervisor',
      phone: '+1-555-0102',
      zone: 'Zone B - Industrial',
      assignedWorkers: ['w-004', 'w-005'],
      status: 'active',
      createdAt: new Date('2024-01-20')
    }
  ],
  workers: [
    {
      id: 'w-001',
      name: 'Mike Thompson',
      email: 'mike@sewerguard.com',
      password: bcrypt.hashSync('worker123', 10),
      role: 'worker',
      phone: '+1-555-0201',
      employeeId: 'EMP-001',
      supervisorId: 'sup-001',
      deviceId: 'dev-001',
      zone: 'Zone A - Downtown',
      status: 'active',
      createdAt: new Date('2024-02-01')
    },
    {
      id: 'w-002',
      name: 'Carlos Rodriguez',
      email: 'carlos@sewerguard.com',
      password: bcrypt.hashSync('worker123', 10),
      role: 'worker',
      phone: '+1-555-0202',
      employeeId: 'EMP-002',
      supervisorId: 'sup-001',
      deviceId: 'dev-002',
      zone: 'Zone A - Downtown',
      status: 'active',
      createdAt: new Date('2024-02-05')
    },
    {
      id: 'w-003',
      name: 'David Kim',
      email: 'david@sewerguard.com',
      password: bcrypt.hashSync('worker123', 10),
      role: 'worker',
      phone: '+1-555-0203',
      employeeId: 'EMP-003',
      supervisorId: 'sup-001',
      deviceId: 'dev-003',
      zone: 'Zone A - Downtown',
      status: 'inactive',
      createdAt: new Date('2024-02-10')
    },
    {
      id: 'w-004',
      name: 'James Wilson',
      email: 'james@sewerguard.com',
      password: bcrypt.hashSync('worker123', 10),
      role: 'worker',
      phone: '+1-555-0204',
      employeeId: 'EMP-004',
      supervisorId: 'sup-002',
      deviceId: 'dev-004',
      zone: 'Zone B - Industrial',
      status: 'active',
      createdAt: new Date('2024-02-15')
    },
    {
      id: 'w-005',
      name: 'Robert Chen',
      email: 'robert@sewerguard.com',
      password: bcrypt.hashSync('worker123', 10),
      role: 'worker',
      phone: '+1-555-0205',
      employeeId: 'EMP-005',
      supervisorId: 'sup-002',
      deviceId: 'dev-005',
      zone: 'Zone B - Industrial',
      status: 'active',
      createdAt: new Date('2024-02-20')
    }
  ],
  devices: [
    { id: 'dev-001', workerId: 'w-001', macAddress: 'AA:BB:CC:DD:EE:01', firmwareVersion: '2.1.0', batteryLevel: 85, status: 'online', lastSeen: new Date() },
    { id: 'dev-002', workerId: 'w-002', macAddress: 'AA:BB:CC:DD:EE:02', firmwareVersion: '2.1.0', batteryLevel: 72, status: 'online', lastSeen: new Date() },
    { id: 'dev-003', workerId: 'w-003', macAddress: 'AA:BB:CC:DD:EE:03', firmwareVersion: '2.0.5', batteryLevel: 45, status: 'offline', lastSeen: new Date(Date.now() - 3600000) },
    { id: 'dev-004', workerId: 'w-004', macAddress: 'AA:BB:CC:DD:EE:04', firmwareVersion: '2.1.0', batteryLevel: 91, status: 'online', lastSeen: new Date() },
    { id: 'dev-005', workerId: 'w-005', macAddress: 'AA:BB:CC:DD:EE:05', firmwareVersion: '2.1.0', batteryLevel: 63, status: 'online', lastSeen: new Date() }
  ],
  sensorData: [],
  alerts: [
    {
      id: 'alert-001',
      workerId: 'w-001',
      workerName: 'Mike Thompson',
      supervisorId: 'sup-001',
      type: 'methane',
      message: 'Methane gas level exceeded safe threshold',
      value: 520,
      threshold: 500,
      severity: 'critical',
      status: 'resolved',
      timestamp: new Date(Date.now() - 7200000)
    },
    {
      id: 'alert-002',
      workerId: 'w-004',
      workerName: 'James Wilson',
      supervisorId: 'sup-002',
      type: 'fall',
      message: 'Fall detected',
      severity: 'critical',
      status: 'resolved',
      timestamp: new Date(Date.now() - 3600000)
    },
    {
      id: 'alert-003',
      workerId: 'w-002',
      workerName: 'Carlos Rodriguez',
      supervisorId: 'sup-001',
      type: 'toxic',
      message: 'Toxic gas level warning',
      value: 380,
      threshold: 350,
      severity: 'warning',
      status: 'active',
      timestamp: new Date(Date.now() - 1800000)
    }
  ],
  thresholds: {
    methane: { warning: 300, critical: 500 },
    toxic: { warning: 250, critical: 350 },
  },
  notifications: []
};

// Generate initial sensor data
const workerIds = ['w-001', 'w-002', 'w-003', 'w-004', 'w-005'];
workerIds.forEach(wId => {
  for (let i = 0; i < 20; i++) {
    db.sensorData.push({
      id: `sd-${wId}-${i}`,
      workerId: wId,
      methane: Math.floor(Math.random() * 200 + 50),
      toxic: Math.floor(Math.random() * 150 + 30),
      fallDetected: false,
      sosActivated: false,
      battery: Math.floor(Math.random() * 40 + 50),
      timestamp: new Date(Date.now() - (20 - i) * 60000)
    });
  }
});

module.exports = db;
