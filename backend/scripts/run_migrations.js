/**
 * run_migrations.js
 * Executes all .sql files in src/migrations (sorted by filename).
 * Usage: node scripts/run_migrations.js
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const db = require('../src/db/db');

async function run() {
  try {
    const migrationsDir = path.resolve(__dirname, '..', 'src','db', 'migrations');
    const files = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort();

    console.log('Found migrations:', files);

    for (const file of files) {
      const full = path.join(migrationsDir, file);
      const sql = fs.readFileSync(full, 'utf8');
      if (!sql.trim()) continue;
      console.log('Running', file);
      await db.query(sql);
      console.log('OK', file);
    }

    console.log('All migrations applied.');
    process.exit(0);
  } catch (err) {
    console.error('Migration error', err);
    process.exit(1);
  }
}

run();
