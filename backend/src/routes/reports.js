const express = require('express');
const router = express.Router();
const db = require('../db/db');
const { requireAuth } = require('../middleware/authMiddleware');

// GET /api/reports/monthly?member_id=&month=&year=
router.get('/monthly', requireAuth, async (req, res) => {
  const { member_id, month, year } = req.query;
  if (!month || !year) return res.status(400).json({ error: 'month and year required' });

  const start = `${year}-${String(month).padStart(2,'0')}-01`;
  const end = new Date(year, month, 0).toISOString().slice(0,10); // last day of month (JS approach not ideal server-side but ok here)
  try {
    // totals by type
    const params = [start, end];
    let whereMember = '';
    if (member_id) {
      params.push(member_id);
      whereMember = `AND member_id = $${params.length}`;
    }
    const totalsQ = `
      SELECT type, SUM(amount) as total
      FROM transactions
      WHERE date >= $1 AND date <= $2 ${whereMember}
      GROUP BY type
    `;
    const totals = await db.query(totalsQ, params);

    // monthly transactions list
    const listQ = `SELECT * FROM transactions WHERE date >= $1 AND date <= $2 ${whereMember} ORDER BY date`;
    const list = await db.query(listQ, params);

    res.json({ totals: totals.rows, transactions: list.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not generate report' });
  }
});

module.exports = router;
