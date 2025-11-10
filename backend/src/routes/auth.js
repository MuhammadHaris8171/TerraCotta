const express = require('express');
const router = express.Router();
const db = require('../db/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'change_me';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';

function signToken(user) {
  return jwt.sign(
    { userId: user.id, role: user.role, email: user.email },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

  try {
    const result = await db.query('SELECT id, email, username, password_hash, role, status FROM users WHERE email = $1', [email.toLowerCase()]);
    if (result.rowCount === 0) return res.status(401).json({ error: 'Invalid credentials' });

    const user = result.rows[0];
    if (user.status !== 'active') return res.status(403).json({ error: 'Account inactive' });

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });

    const token = signToken(user);
    // optionally return user info without password
    const safeUser = {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role
    };

    res.json({ token, user: safeUser });
  } catch (err) {
    console.error('Login error', err);
    res.status(500).json({ error: 'Server error' });
  }
});
router.post('/register', async (req, res) => {
  try {
    const { email, password, username, full_name } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // normalize
    const emailLower = String(email).trim().toLowerCase();

    // check existing
    const exists = await db.query('SELECT id FROM users WHERE email = $1', [emailLower]);
    if (exists.rowCount > 0) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    // Hash password
    const hashed = await bcrypt.hash(password, 10);

    // Always create as member (prevent privilege escalation)
    const role = 'member';
    const status = 'active'; // change if you want 'pending' for manual approval

    const insertQ = `
      INSERT INTO users (email, username, password_hash, role, status)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, email, username, role, status;
    `;
    const r = await db.query(insertQ, [emailLower, username || null, hashed, role, status]);
    const newUser = r.rows[0];

    // Optionally record audit log (if audit_logs table exists)
    try {
      await db.query(
        `INSERT INTO audit_logs (entity_type, entity_id, action, changes, performed_by)
         VALUES ('user', $1, 'create', $2, $3)`,
        [newUser.id, JSON.stringify(newUser), null]
      );
    } catch (auditErr) {
      // don't fail registration if audit log fails
      console.warn('audit log failed for register:', auditErr?.message || auditErr);
    }

    // Sign JWT so frontend can auto-login
    const token = jwt.sign(
      { userId: newUser.id, role: newUser.role, email: newUser.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
    );

    return res.status(201).json({ token, user: newUser });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});
// simple token verification route
router.get('/me', async (req, res) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'Missing Authorization' });

  const token = auth.replace('Bearer ', '');
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const result = await db.query('SELECT id, email, username, role, status FROM users WHERE id = $1', [payload.userId]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'User not found' });

    const user = result.rows[0];
    res.json({ user });
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
});

module.exports = router;
