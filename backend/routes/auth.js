const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/db');
const { authenticate, requireRole } = require('../middleware/auth');

// LOGIN
router.post('/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    let user = null;
    const emailLower = email.toLowerCase().trim();
    if (role === 'admin' || !role) user = db.admins.find(a => a.email.toLowerCase() === emailLower);
    if (!user && (role === 'supervisor' || !role)) user = db.supervisors.find(s => s.email.toLowerCase() === emailLower);
    if (!user && (role === 'worker' || !role)) user = db.workers.find(w => w.email.toLowerCase() === emailLower);

    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    // Block only if explicitly pending or rejected
    if (user.approvalStatus === 'pending') {
      return res.status(403).json({ error: 'Account pending admin approval. Please wait.' });
    }
    if (user.approvalStatus === 'rejected') {
      return res.status(403).json({ error: 'Account rejected by admin. Contact administrator.' });
    }
    // approvalStatus === 'approved' OR no approvalStatus (old accounts) = allow

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      process.env.JWT_SECRET || 'sewerguard_secret',
      { expiresIn: '24h' }
    );

    const { password: _, ...userWithoutPassword } = user;
    res.json({ token, user: userWithoutPassword, message: 'Login successful' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// REGISTER — creates pending account
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone, role, zone, employeeId } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'Name, email, password and role are required' });
    }
    if (!['worker', 'supervisor'].includes(role)) {
      return res.status(400).json({ error: 'Only worker or supervisor accounts can self-register' });
    }

    // Check duplicate
    const allUsers = [...db.workers, ...db.supervisors];
    if (allUsers.find(u => u.email === email)) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    // Check pending requests
    if (db.pendingRequests && db.pendingRequests.find(p => p.email === email)) {
      return res.status(400).json({ error: 'Registration request already submitted. Wait for admin approval.' });
    }

    const request = {
      id: uuidv4(),
      name, email,
      password: await bcrypt.hash(password, 10),
      phone: phone || '',
      role,
      zone: zone || 'Unassigned',
      employeeId: employeeId || `EMP-${Date.now()}`,
      approvalStatus: 'pending',
      requestedAt: new Date()
    };

    if (!db.pendingRequests) db.pendingRequests = [];
    db.pendingRequests.push(request);

    res.status(201).json({
      message: 'Registration request submitted! Admin will review and approve your account.',
      requestId: request.id
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET pending requests — admin only
router.get('/pending', authenticate, requireRole('admin'), (req, res) => {
  const pending = (db.pendingRequests || []).filter(r => r.approvalStatus === 'pending');
  res.json(pending.map(({ password, ...r }) => r));
});

// APPROVE request — admin only
router.post('/approve/:id', authenticate, requireRole('admin'), async (req, res) => {
  const request = (db.pendingRequests || []).find(r => r.id === req.params.id);
  if (!request) return res.status(404).json({ error: 'Request not found' });

  request.approvalStatus = 'approved';
  request.approvedAt = new Date();
  request.approvedBy = req.user.name;

  // Password already hashed during registration — use as-is
  const newUser = {
    id: uuidv4(),
    name: request.name,
    email: request.email,
    password: request.password,  // already bcrypt hashed
    phone: request.phone,
    role: request.role,
    zone: request.zone,
    employeeId: request.employeeId,
    approvalStatus: 'approved',
    status: 'active',
    createdAt: new Date()
  };

  if (request.role === 'worker') {
    newUser.supervisorId = null;
    newUser.deviceId = null;
    db.workers.push(newUser);
  } else if (request.role === 'supervisor') {
    newUser.assignedWorkers = [];
    db.supervisors.push(newUser);
  }

  res.json({ message: `${request.name} approved and account created successfully` });
});

// REJECT request — admin only
router.post('/reject/:id', authenticate, requireRole('admin'), (req, res) => {
  const request = (db.pendingRequests || []).find(r => r.id === req.params.id);
  if (!request) return res.status(404).json({ error: 'Request not found' });
  request.approvalStatus = 'rejected';
  request.rejectedAt = new Date();
  res.json({ message: `${request.name} rejected` });
});

router.post('/logout', (req, res) => res.json({ message: 'Logged out successfully' }));

module.exports = router;
