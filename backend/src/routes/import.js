const express = require('express');
const router = express.Router();
const multer = require('multer');
const xlsx = require('xlsx');
const db = require('../db/db');
const { requireAdmin } = require('../middleware/authMiddleware');

const upload = multer({ storage: multer.memoryStorage() });

// POST /api/import (multipart/form-data 'file')
router.post('/', requireAdmin, upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'file required' });
  try {
    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    // Example: import Members sheet
    if (workbook.Sheets['Members']) {
      const data = xlsx.utils.sheet_to_json(workbook.Sheets['Members']);
      for (const row of data) {
        // expected fields: email, username, role, status, password (optional)
        const email = (row.email || '').toLowerCase();
        const username = row.username || '';
        const password = row.password || 'Temp123!';
        const bcrypt = require('bcrypt');
        const hashed = await bcrypt.hash(password, 10);
        await db.query(
          `INSERT INTO users (email, username, password_hash, role, status)
           VALUES ($1,$2,$3,$4,$5)
           ON CONFLICT (email) DO UPDATE SET username=EXCLUDED.username, role=EXCLUDED.role, status=EXCLUDED.status, password_hash=EXCLUDED.password_hash`,
          [email, username, hashed, row.role || 'member', row.status || 'active']
        );
      }
    }

    // similarly parse Income Entry & Expense Entry sheets and insert into transactions
    if (workbook.Sheets['Income Entry']) {
      const inc = xlsx.utils.sheet_to_json(workbook.Sheets['Income Entry']);
      for (const r of inc) {
        await db.query(
          `INSERT INTO transactions (member_id,type,amount,category,description,date,created_by) VALUES ($1,$2,$3,$4,$5,$6,$7)`,
          [r.member_id || null, 'income', r.amount || 0, r.category, r.description, r.date, req.user.userId]
        );
      }
    }
    if (workbook.Sheets['Expense Entry']) {
      const exp = xlsx.utils.sheet_to_json(workbook.Sheets['Expense Entry']);
      for (const r of exp) {
        await db.query(
          `INSERT INTO transactions (member_id,type,amount,category,description,date,created_by) VALUES ($1,$2,$3,$4,$5,$6,$7)`,
          [r.member_id || null, 'expense', r.amount || 0, r.category, r.description, r.date, req.user.userId]
        );
      }
    }

    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Import failed', details: err.message });
  }
});

module.exports = router;
