const express = require('express');
const router = express.Router();
const db = require('../db/db');
const bcrypt = require('bcrypt');
const { requireAdmin, requireAuth } = require('../middleware/authMiddleware'); // we'll add these

// GET /api/users?search=&page=&limit=
router.get('/', requireAdmin, async (req, res) => {
  const { search, page = 1, limit = 25 } = req.query;
  const offset = (page - 1) * limit;
  try {
    const params = [];
    let where = '';
    if (search) {
      params.push(`%${search.toLowerCase()}%`);
      where = `WHERE lower(email) LIKE $${params.length} OR lower(username) LIKE $${params.length}`;
    }
    const q = `SELECT id, email, username, role, status, created_at FROM users ${where} ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);
    const r = await db.query(q, params);
    res.json({ users: r.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/users
router.post('/', requireAdmin, async (req, res) => {
  const { email, username, password, role = 'member' } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  const hashed = await bcrypt.hash(password, 10);
  try {
    const result = await db.query(
      `INSERT INTO users (email, username, password_hash, role, status) VALUES ($1,$2,$3,$4,'active') RETURNING id,email,username,role,status`,
      [email.toLowerCase(), username, hashed, role]
    );
    res.status(201).json({ user: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not create user' });
  }
});

// PUT /api/users/:id
router.put('/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { email, username, role, status } = req.body;
  try {
    await db.query(
      `UPDATE users SET email=$1, username=$2, role=$3, status=$4, updated_at=now() WHERE id=$5`,
      [email.toLowerCase(), username, role, status, id]
    );
    const r = await db.query(`SELECT id,email,username,role,status FROM users WHERE id=$1`, [id]);
    res.json({ user: r.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not update user' });
  }
});
// GET /api/users/:id
router.get('/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const r = await db.query('SELECT id,email,username,role,status,created_at FROM users WHERE id=$1', [id]);
    if (r.rowCount === 0) return res.status(404).json({ error: 'User not found' });
    res.json({ user: r.rows[0] });
  } catch (err) {
    console.error('GET user error', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PATCH /api/users/:id/status
router.patch('/:id/status', requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    await db.query(`UPDATE users SET status=$1, updated_at=now() WHERE id=$2`, [status, id]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Could not update status' });
  }
});

module.exports = router;
