const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

const db = require('../backend/src/utils/db');

async function check() {
  try {
    const users = await db.query('SELECT id, name, email, role FROM User WHERE role = "admin"');
    console.log('--- ADMIN USERS ---');
    console.log(users);
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}
check();
