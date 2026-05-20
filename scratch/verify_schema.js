const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

const db = require('../backend/src/utils/db');

async function verify() {
  try {
    const leadsCols = await db.query('DESCRIBE referral_leads');
    console.log('--- referral_leads ---');
    console.table(leadsCols.map(c => ({ Field: c.Field, Type: c.Type, Null: c.Null, Key: c.Key })));

    const eventsCols = await db.query('DESCRIBE referral_events');
    console.log('--- referral_events ---');
    console.table(eventsCols.map(c => ({ Field: c.Field, Type: c.Type, Null: c.Null, Key: c.Key })));

    process.exit(0);
  } catch (error) {
    console.error('Verification failed:', error);
    process.exit(1);
  }
}

verify();
