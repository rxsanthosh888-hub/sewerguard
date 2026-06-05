const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const db = require('../config/db');
const { authenticate, requireRole } = require('../middleware/auth');

router.get('/', authenticate, requireRole('admin'), (req, res) => {
  const supervisors = db.supervisors.map(({ password, ...s }) => ({
    ...s,
    workerCount: s.assignedWorkers.length
  }));
  res.json(supervisors);
});

router.get('/:id', authenticate, (req, res) => {
  const sup = db.supervisors.find(s => s.id === req.params.id);
  if (!sup) return res.status(404).json({ error: 'Supervisor not found' });
  const { password, ...s } = sup;
  const workers = db.workers.filter(w => sup.assignedWorkers.includes(w.id)).map(({ password, ...w }) => w);
  res.json({ ...s, workers });
});

router.post('/', authenticate, requireRole('admin'), async (req, res) => {
  const { name, email, password, phone, zone } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'Required fields missing' });
  if (db.supervisors.find(s => s.email === email)) return res.status(400).json({ error: 'Email exists' });

  const sup = {
    id: `sup-${uuidv4().slice(0, 8)}`,
    name, email,
    password: await bcrypt.hash(password, 10),
    role: 'supervisor',
    phone: phone || '',
    zone: zone || 'Unassigned',
    assignedWorkers: [],
    status: 'active',
    createdAt: new Date()
  };
  db.supervisors.push(sup);
  const { password: _, ...result } = sup;
  res.status(201).json(result);
});

router.put('/:id', authenticate, requireRole('admin'), async (req, res) => {
  const idx = db.supervisors.findIndex(s => s.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  const updates = { ...req.body };
  if (updates.password) updates.password = await bcrypt.hash(updates.password, 10);
  else delete updates.password;
  db.supervisors[idx] = { ...db.supervisors[idx], ...updates, id: req.params.id };
  const { password, ...result } = db.supervisors[idx];
  res.json(result);
});

router.delete('/:id', authenticate, requireRole('admin'), (req, res) => {
  const idx = db.supervisors.findIndex(s => s.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  db.supervisors.splice(idx, 1);
  res.json({ message: 'Supervisor deleted' });
});

router.post('/:id/assign-worker', authenticate, requireRole('admin'), (req, res) => {
  const { workerId } = req.body;
  const sup = db.supervisors.find(s => s.id === req.params.id);
  if (!sup) return res.status(404).json({ error: 'Supervisor not found' });
  if (!sup.assignedWorkers.includes(workerId)) sup.assignedWorkers.push(workerId);
  const worker = db.workers.find(w => w.id === workerId);
  if (worker) worker.supervisorId = req.params.id;
  res.json({ message: 'Worker assigned' });
});

module.exports = router;
