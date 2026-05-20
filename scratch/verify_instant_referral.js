const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

const db = require('../backend/src/utils/db');
const http = require('http');
const jwt = require('jsonwebtoken');
const config = require('../backend/src/config/index');

const JWT_SECRET = config.jwt.secret || 'ec434a51ba4be676ac157fa92b92aaf2b32569386b3176b2';
const ADMIN_ID = 1;
const adminToken = jwt.sign({ userId: ADMIN_ID, userRole: 'admin' }, JWT_SECRET, { expiresIn: '1h' });

function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          data: JSON.parse(data || '{}')
        });
      });
    });
    req.on('error', reject);
    if (postData) {
      req.write(JSON.stringify(postData));
    }
    req.end();
  });
}

async function verify() {
  console.log('🏁 Starting Instant Referral Insertion Verification...\n');
  const timestamp = Date.now();
  const GUEST_EMAIL = `instant_ref_${timestamp}@example.com`;
  const GUEST_PHONE = '9876' + Math.floor(1000 + Math.random() * 9000);
  const GUEST_NAME = 'Instant Verify Guest';
  
  // Referrer is user ID 12
  const REFERRER_ID = 12;

  try {
    // 1. Submit the lead
    console.log('👉 Step 1: Submitting referral lead intake form...');
    const step1 = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/referrals/lead',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      name: GUEST_NAME,
      email: GUEST_EMAIL,
      phone: GUEST_PHONE,
      serviceInterest: 'GST Registration',
      referralCode: 'GTWMAHENDRA12345',
      source: 'referral_landing_page'
    });

    console.log('   Response Status:', step1.statusCode);
    const leadId = step1.data?.data?.leadId;
    console.log('   Lead created with ID:', leadId);

    // 2. Check if a pending Referral record exists immediately in the database
    console.log('\n👉 Step 2: Checking Referral table immediately for pending record...');
    const referrals = await db.query(
      'SELECT id, referrerId, refereeId, refereeEmail, refereePhone, referralStatus, notes FROM Referral WHERE refereeEmail = ?',
      [GUEST_EMAIL]
    );

    if (referrals.length === 1) {
      const ref = referrals[0];
      console.log('   ✅ Success: Referral record created immediately!');
      console.log('   Referral Status:', ref.referralStatus);
      console.log('   Referree Email:', ref.refereeEmail);
      console.log('   Referree Phone:', ref.refereePhone);
      console.log('   Notes/Guest Name:', ref.notes);
      
      if (ref.referralStatus !== 'pending') {
        throw new Error(`Referral status should be 'pending', got ${ref.referralStatus}`);
      }
      if (ref.refereeId !== null) {
        throw new Error(`Referee ID should be null initially, got ${ref.refereeId}`);
      }
    } else {
      throw new Error(`Expected exactly 1 Referral record, found ${referrals.length}`);
    }

    // 3. Convert the lead to user
    console.log('\n👉 Step 3: Simulating admin conversion...');
    const step3 = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: `/api/admin/referral-leads/${leadId}/convert`,
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json' 
      }
    });

    console.log('   Response Status:', step3.statusCode);
    const newUserId = step3.data?.data?.userId;
    const generatedPassword = step3.data?.data?.password;
    console.log('   Converted to User ID:', newUserId);
    console.log('   Generated Password:', generatedPassword);

    // 4. Check if the Referral record was updated to active and refereeId linked (no duplicates)
    console.log('\n👉 Step 4: Verifying the Referral record was updated...');
    const referralsAfter = await db.query(
      'SELECT id, refereeId, referralStatus FROM Referral WHERE refereeEmail = ?',
      [GUEST_EMAIL]
    );

    if (referralsAfter.length === 1) {
      const refAfter = referralsAfter[0];
      console.log('   ✅ Success: Exactly 1 Referral record exists (no duplicates created)!');
      console.log('   Updated Status:', refAfter.referralStatus);
      console.log('   Updated Referee ID:', refAfter.refereeId);

      if (refAfter.referralStatus !== 'active') {
        throw new Error(`Referral status should be 'active' after conversion, got ${refAfter.referralStatus}`);
      }
      if (refAfter.refereeId !== newUserId) {
        throw new Error(`Referee ID should match converted user ID ${newUserId}, got ${refAfter.refereeId}`);
      }
    } else {
      throw new Error(`Expected exactly 1 Referral record, found ${referralsAfter.length}`);
    }

    // Clean up
    console.log('\n🧹 Cleaning up test database records...');
    await db.query('DELETE FROM Referral WHERE refereeEmail = ?', [GUEST_EMAIL]);
    await db.query('DELETE FROM referral_leads WHERE guest_email = ?', [GUEST_EMAIL]);
    await db.query('DELETE FROM User WHERE email = ?', [GUEST_EMAIL]);
    console.log('✅ Cleanup complete. All verification steps passed successfully!');

  } catch (error) {
    console.error('❌ Verification failed:', error);
  } finally {
    process.exit(0);
  }
}

verify();
