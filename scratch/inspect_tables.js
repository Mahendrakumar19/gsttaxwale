const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

const db = require('../backend/src/utils/db');

async function inspect() {
  try {
    const tables = await db.query("SHOW TABLES");
    console.log('Tables in database:', tables.map(t => Object.values(t)[0]));

    const checkLeads = await db.query("SHOW TABLES LIKE 'referral_leads'");
    if (checkLeads.length > 0) {
      const desc = await db.query("DESCRIBE referral_leads");
      console.log('\nreferral_leads columns:');
      console.table(desc);
      const count = await db.query("SELECT COUNT(*) as count FROM referral_leads");
      console.log('referral_leads rows count:', count[0].count);
    } else {
      console.log('\nreferral_leads table does NOT exist.');
    }

    const checkReferrers = await db.query("SHOW TABLES LIKE 'referral_referrers'");
    if (checkReferrers.length > 0) {
      const desc = await db.query("DESCRIBE referral_referrers");
      console.log('\nreferral_referrers columns:');
      console.table(desc);
    } else {
      console.log('\nreferral_referrers table does NOT exist.');
    }
  } catch (err) {
    console.error('Inspection failed:', err);
  } finally {
    process.exit(0);
  }
}

inspect();
