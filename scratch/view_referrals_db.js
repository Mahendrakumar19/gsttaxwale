const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

const db = require('../backend/src/utils/db');

async function check() {
  try {
    const referrals = await db.query('SELECT * FROM Referral');
    console.log('--- REFERRAL ROWS (' + referrals.length + ') ---');
    console.log(JSON.stringify(referrals, null, 2));

    const leads = await db.query('SELECT * FROM referral_leads');
    console.log('\n--- REFERRAL_LEADS ROWS (' + leads.length + ') ---');
    console.log(JSON.stringify(leads, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}
check();
