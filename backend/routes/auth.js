const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');
const db = require('../config/db');

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const user = db.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const passwordMatch = await bcryptjs.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'sewerguard_super_secret_jwt_key_2024_enterprise',
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Verify token
router.post('/verify', (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'sewerguard_super_secret_jwt_key_2024_enterprise'
    );

    const user = db.findUserById(decoded.id);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    res.json({ valid: true, user: { id: user.id, email: user.email, role: user.role } });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Get demo users (for testing)
router.get('/demo-users', (req, res) => {
  try {
    const demoUsers = [
      { email: 'admin@sewerguard.com', password: 'admin123', role: 'admin' },
      { email: 'john@sewerguard.com', password: 'super123', role: 'supervisor' },
      { email: 'mike@sewerguard.com', password: 'worker123', role: 'worker' }
    ];
    res.json({ demoUsers });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
