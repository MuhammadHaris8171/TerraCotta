const express = require('express');
const router = express.Router();
const db = require('../db/db');
const { requireAdmin } = require('../middleware/authMiddleware');

// GET /api/audit?entity_type=&page=&limit=
router.get('/', requireAdmin, async (req, res) => {
  const { entity_type, page = 1, limit = 50 } = req.query;
  const offset = (page - 1) * limit;
  const params = [];
  let where = '';
  if (entity_type) {
    params.push(entity_type);
    where = `WHERE entity_type = $${params.length}`;
  }
  params.push(limit, offset);
  const q = `SELECT * FROM audit_logs ${where} ORDER BY performed_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`;
  const r = await db.query(q, params);
  res.json({ logs: r.rows });
});

module.exports = router;
