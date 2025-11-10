const express = require('express');
const router = express.Router();
const db = require('../db/db');
const { requireAuth } = require('../middleware/authMiddleware');

// GET /api/transactions?member_id=&type=&from=&to=&page=&limit=
router.get('/', requireAuth, async (req, res) => {
  const { member_id, type, from, to, page = 1, limit = 50 } = req.query;
  const offset = (page - 1) * limit;
  const params = [];
  let where = [];
  if (member_id) { params.push(member_id); where.push(`member_id = $${params.length}`); }
  if (type) { params.push(type); where.push(`type = $${params.length}`); }
  if (from) { params.push(from); where.push(`date >= $${params.length}`); }
  if (to) { params.push(to); where.push(`date <= $${params.length}`); }
  const whereSQL = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const q = `SELECT * FROM transactions ${whereSQL} ORDER BY date DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
  params.push(limit, offset);
  try {
    const r = await db.query(q, params);
    res.json({ transactions: r.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/transactions
router.post('/', requireAuth, async (req, res) => {
  const actorId = req.user.userId;
  const { member_id, type, amount, category, description, date } = req.body;
  if (!type || !amount || !date) return res.status(400).json({ error: 'type, amount and date required' });
  try {
    const r = await db.query(
      `INSERT INTO transactions (member_id, type, amount, category, description, date, created_by) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [member_id || null, type, amount, category, description, date, actorId]
    );
    // write audit log
    await db.query(
      `INSERT INTO audit_logs (entity_type, entity_id, action, changes, performed_by) VALUES ('transaction',$1,'create',$2,$3)`,
      [r.rows[0].id, JSON.stringify(r.rows[0]), actorId]
    );
    res.status(201).json({ transaction: r.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not create transaction' });
  }
});

// PUT /api/transactions/:id
router.put('/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  const actorId = req.user.userId;
  const { member_id, type, amount, category, description, date } = req.body;
  try {
    await db.query(
      `UPDATE transactions SET member_id=$1,type=$2,amount=$3,category=$4,description=$5,date=$6,updated_by=$7,updated_at=now() WHERE id=$8`,
      [member_id || null, type, amount, category, description, date, actorId, id]
    );
    const r = await db.query(`SELECT * FROM transactions WHERE id=$1`, [id]);
    await db.query(
      `INSERT INTO audit_logs (entity_type, entity_id, action, changes, performed_by) VALUES ('transaction',$1,'update',$2,$3)`,
      [id, JSON.stringify(r.rows[0]), actorId]
    );
    res.json({ transaction: r.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not update transaction' });
  }
});

// DELETE /api/transactions/:id
router.delete('/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  const actorId = req.user.userId;
  try {
    await db.query(`DELETE FROM transactions WHERE id=$1`, [id]);
    await db.query(
      `INSERT INTO audit_logs (entity_type, entity_id, action, performed_by) VALUES ('transaction',$1,'delete',$2)`,
      [id, actorId]
    );
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Could not delete' });
  }
});

module.exports = router;
