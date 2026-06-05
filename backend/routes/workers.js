const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const db = require('../config/db');
const { authenticate, requireRole } = require('../middleware/auth');

router.get('/', authenticate, (req, res) => {
  let workers = db.workers.map(({ password, ...w }) => w);
  if (req.user.role === 'supervisor') {
    const sup = db.supervisors.find(s => s.id === req.user.id);
    workers = workers.filter(w => sup?.assignedWorkers.includes(w.id));
  }
  workers = workers.map(w => {
    const latest = db.sensorData.filter(s => s.workerId === w.id)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];
    const device = db.devices.find(d => d.workerId === w.id);
    return { ...w, sensorData: latest || null, device: device || null };
  });
  res.json(workers);
});

router.get('/:id', authenticate, (req, res) => {
  const worker = db.workers.find(w => w.id === req.params.id);
  if (!worker) return res.status(404).json({ error: 'Worker not found' });
  const { password, ...w } = worker;
  const sensorHistory = db.sensorData.filter(s => s.workerId === req.params.id)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 50);
  const device = db.devices.find(d => d.workerId === req.params.id);
  res.json({ ...w, sensorHistory, device });
});

router.post('/', authenticate, requireRole('admin'), async (req, res) => {
  const { name, email, password, phone, employeeId, supervisorId, zone } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'Required fields missing' });
  if (db.workers.find(w => w.email === email)) return res.status(400).json({ error: 'Email already exists' });

  const newWorker = {
    id: `w-${uuidv4().slice(0, 8)}`,
    name, email,
    password: await bcrypt.hash(password, 10),
    role: 'worker',
    phone: phone || '',
    employeeId: employeeId || `EMP-${Date.now()}`,
    supervisorId: supervisorId || null,
    deviceId: null,
    zone: zone || 'Unassigned',
    status: 'active',
    createdAt: new Date()
  };

  db.workers.push(newWorker);
  if (supervisorId) {
    const sup = db.supervisors.find(s => s.id === supervisorId);
    if (sup && !sup.assignedWorkers.includes(newWorker.id)) sup.assignedWorkers.push(newWorker.id);
  }

  const { password: _, ...result } = newWorker;
  res.status(201).json(result);
});

router.put('/:id', authenticate, requireRole('admin'), async (req, res) => {
  const idx = db.workers.findIndex(w => w.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Worker not found' });

  const worker = db.workers[idx];
  const updates = { ...req.body };
  if (updates.password) updates.password = await bcrypt.hash(updates.password, 10);
  else delete updates.password;

  // ── ROLE CHANGE: Worker → Supervisor ──────────────────────────
  if (updates.role === 'supervisor' && worker.role === 'worker') {
    // Remove from old supervisor's assignedWorkers
    if (worker.supervisorId) {
      const oldSup = db.supervisors.find(s => s.id === worker.supervisorId);
      if (oldSup) oldSup.assignedWorkers = oldSup.assignedWorkers.filter(id => id !== worker.id);
    }

    // Create new supervisor entry
    const newSupervisor = {
      id: worker.id,
      name: updates.name || worker.name,
      email: updates.email || worker.email,
      password: updates.password || worker.password,
      role: 'supervisor',
      phone: updates.phone || worker.phone || '',
      zone: updates.zone || worker.zone || 'Unassigned',
      assignedWorkers: [],
      status: updates.status || 'active',
      approvalStatus: worker.approvalStatus,
      createdAt: worker.createdAt,
      promotedAt: new Date()
    };

    // Add to supervisors
    db.supervisors.push(newSupervisor);

    // Remove from workers
    db.workers.splice(idx, 1);

    const { password: _, ...result } = newSupervisor;
    return res.json({ ...result, message: `${newSupervisor.name} promoted to Supervisor!` });
  }

  // ── ROLE CHANGE: Supervisor → Worker ──────────────────────────
  if (updates.role === 'worker' && worker.role === 'supervisor') {
    const supIdx = db.supervisors.findIndex(s => s.id === worker.id);
    if (supIdx !== -1) {
      // Unassign all their workers
      const sup = db.supervisors[supIdx];
      sup.assignedWorkers.forEach(wId => {
        const w = db.workers.find(w => w.id === wId);
        if (w) w.supervisorId = null;
      });

      // Create worker entry
      const newWorker = {
        id: worker.id,
        name: updates.name || worker.name,
        email: updates.email || worker.email,
        password: updates.password || worker.password,
        role: 'worker',
        phone: updates.phone || worker.phone || '',
        zone: updates.zone || worker.zone || 'Unassigned',
        employeeId: worker.employeeId || `EMP-${Date.now()}`,
        supervisorId: updates.supervisorId || null,
        deviceId: null,
        status: updates.status || 'active',
        approvalStatus: worker.approvalStatus,
        createdAt: worker.createdAt,
        demotedAt: new Date()
      };

      // Remove from supervisors
      db.supervisors.splice(supIdx, 1);

      // Add to workers
      db.workers.push(newWorker);

      // Assign to new supervisor if specified
      if (updates.supervisorId) {
        const newSup = db.supervisors.find(s => s.id === updates.supervisorId);
        if (newSup && !newSup.assignedWorkers.includes(newWorker.id)) {
          newSup.assignedWorkers.push(newWorker.id);
        }
      }

      const { password: _, ...result } = newWorker;
      return res.json({ ...result, message: `${newWorker.name} moved to Worker role` });
    }
  }

  // ── Normal update (no role change) ────────────────────────────
  // Handle supervisor assignment change
  const oldSupId = worker.supervisorId;
  const newSupId = updates.supervisorId;

  if (oldSupId !== newSupId) {
    // Remove from old supervisor
    if (oldSupId) {
      const oldSup = db.supervisors.find(s => s.id === oldSupId);
      if (oldSup) oldSup.assignedWorkers = oldSup.assignedWorkers.filter(id => id !== worker.id);
    }
    // Add to new supervisor
    if (newSupId) {
      const newSup = db.supervisors.find(s => s.id === newSupId);
      if (newSup && !newSup.assignedWorkers.includes(worker.id)) newSup.assignedWorkers.push(worker.id);
    }
  }

  db.workers[idx] = { ...db.workers[idx], ...updates, id: req.params.id };
  const { password, ...result } = db.workers[idx];
  res.json(result);
});

router.delete('/:id', authenticate, requireRole('admin'), (req, res) => {
  const idx = db.workers.findIndex(w => w.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Worker not found' });
  const worker = db.workers[idx];
  if (worker.supervisorId) {
    const sup = db.supervisors.find(s => s.id === worker.supervisorId);
    if (sup) sup.assignedWorkers = sup.assignedWorkers.filter(id => id !== req.params.id);
  }
  db.workers.splice(idx, 1);
  res.json({ message: 'Worker deleted' });
});

module.exports = router;
