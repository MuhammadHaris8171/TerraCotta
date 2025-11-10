require('dotenv').config();
const db = require('../src/db/db');
const bcrypt = require('bcrypt');

async function createAdmin() {
  const email = process.env.ADMIN_EMAIL || 'admin@terracotta.local';
  const username = process.env.ADMIN_USERNAME || 'admin';
  const plain = process.env.ADMIN_PASSWORD || 'Admin123!'; // change in production
  const hashed = await bcrypt.hash(plain, 10);

  try {
    await db.query(
      `INSERT INTO users (email, username, password_hash, role, status)
       VALUES ($1, $2, $3, 'admin', 'active')
       ON CONFLICT (email) DO UPDATE
       SET username = EXCLUDED.username, password_hash = EXCLUDED.password_hash, role='admin', status='active'`,
      [email.toLowerCase(), username, hashed]
    );
    console.log('Admin user created/updated:', email);
    process.exit(0);
  } catch (err) {
    console.error('Error creating admin', err);
    process.exit(1);
  }
}

createAdmin();
