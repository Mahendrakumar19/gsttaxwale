const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

const db = require('../backend/src/utils/db');

async function check() {
  try {
    const cols = await db.query('DESCRIBE Document');
    console.log(cols);
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}
check();
