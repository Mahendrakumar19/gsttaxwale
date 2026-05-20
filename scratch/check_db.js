const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

const db = require('../backend/src/utils/db');

async function run() {
  try {
    const rows = await db.query('SELECT * FROM Document');
    console.log('Total documents in DB:', rows.length);
    if (rows && rows.length > 0) {
      console.log('Sample rows:', rows.map(r => ({
        id: r.id,
        userId: r.userId,
        title: r.title,
        category: r.category,
        fiscalYear: r.fiscalYear,
        status: r.status
      })));
    }
  } catch (err) {
    console.error('Database error:', err);
  } finally {
    process.exit(0);
  }
}

run();
