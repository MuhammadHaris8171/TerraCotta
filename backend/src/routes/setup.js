const express = require('express');
const router = express.Router();
const db = require('../db/db');
const { requireAdmin } = require('../middleware/authMiddleware');

// GET /api/setup
router.get('/', requireAdmin, async (req, res) => {
  const r = await db.query('SELECT * FROM setup WHERE id=1');
  res.json({ setup: r.rows[0] });
});

// PUT /api/setup
router.put('/', requireAdmin, async (req, res) => {
  const { fiscal_year_start, reporting_months, categories } = req.body;
  await db.query(
    `UPDATE setup SET fiscal_year_start=$1, reporting_months=$2, categories=$3, updated_at=now() WHERE id=1`,
    [fiscal_year_start || null, reporting_months ? JSON.stringify(reporting_months) : null, categories ? JSON.stringify(categories) : null]
  );
  const r = await db.query('SELECT * FROM setup WHERE id=1');
  res.json({ setup: r.rows[0] });
});

module.exports = router;
