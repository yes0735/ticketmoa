const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const db = require('./index');

async function initDatabase() {
  if (!db.pool) {
    console.error('DATABASE_URL is not set. Skipping DB init.');
    process.exit(1);
  }

  const schemaPath = path.join(__dirname, 'schema.sql');
  const sql = fs.readFileSync(schemaPath, 'utf8');

  try {
    await db.query(sql);
    console.log('Database schema initialized successfully.');
  } catch (err) {
    console.error('Failed to initialize database:', err.message);
    process.exit(1);
  } finally {
    await db.close();
  }
}

if (require.main === module) {
  initDatabase();
}

module.exports = { initDatabase };
