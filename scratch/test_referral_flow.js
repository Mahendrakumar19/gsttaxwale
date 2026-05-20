const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

const jwt = require('jsonwebtoken');
const http = require('http');
const config = require('../backend/src/config/index');
const db = require('../backend/src/utils/db');
const ReferralService = require('../backend/src/services/referralService');

const JWT_SECRET = config.jwt.secret || 'ec434a51ba4be676ac157fa92b92aaf2b32569386b3176b2';
const REFERRER_ID = 12; // mahendra@nighwantech.com
const ADMIN_ID = 1;     // admin@gsttaxwale.com

const referrerToken = jwt.sign({ userId: REFERRER_ID, userRole: 'user' }, JWT_SECRET, { expiresIn: '1h' });
const adminToken = jwt.sign({ userId: ADMIN_ID, userRole: 'admin' }, JWT_SECRET, { expiresIn: '1h' });

function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: data
        });
      });
    });

    req.on('error', err => {
      reject(err);
    });

    if (postData) {
      req.write(JSON.stringify(postData));
    }
    req.end();
  });
}

async function runTest() {
  console.log('🏁 Starting Referral System End-to-End Verification...');

  const GUEST_EMAIL = 'testguest_' + Date.now() + '@example.com';
  const GUEST_PHONE = '99999' + Math.floor(10000 + Math.random() * 90000);
  let createdLeadId = null;
  let createdUserId = null;
  let createdTicketId = null;

  try {
    // -------------------------------------------------------------------------
    // Step 1: Request referral landing page to test attribution middleware cookie setting
    // -------------------------------------------------------------------------
    console.log('\n👉 Step 1: Simulating referral click landing request...');
    const step1 = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/ref/GTWMAHENDRA12345',
      method: 'GET'
    });

    console.log('   Response Status:', step1.statusCode);
    const setCookieHeader = step1.headers['set-cookie'];
    if (setCookieHeader) {
      console.log('   Cookie Header set:', setCookieHeader);
    } else {
      console.log('   No Set-Cookie header returned (normal if client already has cookie or cookie exists)');
    }

    // Verify click event is logged in DB
    const clickEvents = await db.query(
      "SELECT id FROM referral_events WHERE referrer_id = ? AND event_type = 'click' ORDER BY created_at DESC LIMIT 1",
      [REFERRER_ID]
    );
    if (clickEvents.length > 0) {
      console.log('   ✅ Success: click event logged in database (ID: ' + clickEvents[0].id + ')');
    } else {
      console.warn('   ⚠️ Warning: click event not found in database');
    }

    // -------------------------------------------------------------------------
    // Step 2: Submit a guest referral lead
    // -------------------------------------------------------------------------
    console.log('\n👉 Step 2: Submitting referral lead intake form...');
    const postDataLead = {
      name: 'Test Referral Guest User',
      email: GUEST_EMAIL,
      phone: GUEST_PHONE,
      serviceInterest: 'Company Registration',
      notes: 'Test lead notes',
      referralCode: 'GTWMAHENDRA12345',
      source: 'referral_landing_page'
    };

    const step2 = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/referrals/lead',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, postDataLead);

    console.log('   Status Code:', step2.statusCode);
    const leadRes = JSON.parse(step2.data);
    console.log('   Response Body:', JSON.stringify(leadRes));

    if (step2.statusCode !== 201 || !leadRes.success) {
      throw new Error('Failed to create referral lead');
    }

    createdLeadId = leadRes.data?.leadId;
    console.log('   ✅ Success: lead registered successfully (ID: ' + createdLeadId + ')');

    // -------------------------------------------------------------------------
    // Step 3: Admin converts guest lead to customer
    // -------------------------------------------------------------------------
    console.log('\n👉 Step 3: Simulating admin conversion...');
    const step3 = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: `/api/admin/referral-leads/${createdLeadId}/convert`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('   Status Code:', step3.statusCode);
    const convertRes = JSON.parse(step3.data);
    console.log('   Response Body:', JSON.stringify(convertRes));

    if (step3.statusCode !== 201 || !convertRes.success) {
      throw new Error('Failed to convert lead to customer');
    }

    createdUserId = convertRes.data?.userId;
    console.log('   ✅ Success: lead converted to user (ID: ' + createdUserId + ')');

    // Verify database links are intact
    const [convertedUser] = await db.query('SELECT id, email, referrer_id FROM User WHERE id = ?', [createdUserId]);
    if (convertedUser && convertedUser.referrer_id === REFERRER_ID) {
      console.log('   ✅ Success: Permanent referral relationship recorded (referrer_id matched)');
    } else {
      throw new Error('Failed to establish permanent referral relationship in User table');
    }

    const [leadRecord] = await db.query('SELECT status, converted_user_id FROM referral_leads WHERE id = ?', [createdLeadId]);
    if (leadRecord && leadRecord.status === 'converted' && leadRecord.converted_user_id === createdUserId) {
      console.log('   ✅ Success: lead status transitioned to converted');
    } else {
      throw new Error('Failed to update lead status during conversion');
    }

    const legacyReferrals = await db.query('SELECT id FROM Referral WHERE refereeId = ?', [createdUserId]);
    if (legacyReferrals.length > 0) {
      console.log('   ✅ Success: legacy Referral table record synced (ID: ' + legacyReferrals[0].id + ')');
    } else {
      throw new Error('Failed to sync backward-compatible Referral record');
    }

    // -------------------------------------------------------------------------
    // Step 4: Verify Purchase Hook & Rules Engine execution
    // -------------------------------------------------------------------------
    console.log('\n👉 Step 4: Simulating service purchase and reward allocation...');
    
    // We will directly call ReferralService.processPurchaseReward to verify rules resolution and ledger credit
    const serviceId = 1; // GST Return Filing
    const orderId = 'TEST_ORDER_999';
    const paymentAmount = 1500.00; // meets minimum threshold for basic rules

    console.log('   Processing reward via ReferralService...');
    const rewardCredited = await ReferralService.processPurchaseReward(
      REFERRER_ID,
      createdUserId,
      orderId,
      paymentAmount,
      serviceId
    );

    console.log('   Reward Credited:', rewardCredited);
    if (!rewardCredited || rewardCredited <= 0) {
      throw new Error('Reward engine returned 0 or null reward');
    }

    console.log('   ✅ Success: Reward engine evaluated and credited: ' + rewardCredited + ' points');

    // Verify ledger balance
    const userBalance = await db.query(
      "SELECT points_wallet FROM User WHERE id = ?",
      [REFERRER_ID]
    );
    console.log('   Referrer cached wallet balance in User table:', userBalance[0].points_wallet);

    const ledgerTx = await db.query(
      "SELECT id, points, type, source FROM wallet_transactions WHERE user_id = ? AND reference_id = ? ORDER BY created_at DESC LIMIT 1",
      [REFERRER_ID, orderId]
    );
    if (ledgerTx.length > 0 && ledgerTx[0].points === rewardCredited) {
      console.log('   ✅ Success: ledger transaction logged (ID: ' + ledgerTx[0].id + ', points: ' + ledgerTx[0].points + ')');
    } else {
      throw new Error('Failed to log transaction in wallet_transactions ledger');
    }

    // -------------------------------------------------------------------------
    // Step 5: Verify points redemption / withdrawal request
    // -------------------------------------------------------------------------
    console.log('\n👉 Step 5: Submitting points redemption request...');

    // Since min redemption is 500 points, let's artificially temporarily credit the referrer wallet with 600 points 
    // to bypass balance checks, then redeem 500 points
    await db.query(
      "UPDATE User SET points_wallet = points_wallet + 600 WHERE id = ?",
      [REFERRER_ID]
    );
    await db.query(
      "INSERT INTO wallet_transactions (user_id, type, source, points, status, description, created_at) VALUES (?, 'credit', 'admin_bonus', 600, 'approved', 'Test manual credit for redemption verification', NOW())",
      [REFERRER_ID]
    );

    const postDataRedeem = {
      pointsToRedeem: 500,
      payoutMethod: 'upi',
      payoutDetails: 'mahendra@upi'
    };

    const step5 = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/referrals/redeem-points',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${referrerToken}`,
        'Content-Type': 'application/json'
      }
    }, postDataRedeem);

    console.log('   Status Code:', step5.statusCode);
    const redeemRes = JSON.parse(step5.data);
    console.log('   Response Body:', JSON.stringify(redeemRes));

    if (step5.statusCode !== 200 || !redeemRes.success) {
      throw new Error('Failed to submit redemption request');
    }

    console.log('   ✅ Success: redemption request accepted');

    // Verify ticket creation
    const tickets = await db.query(
      "SELECT id, subject, description FROM SupportTicket WHERE userId = ? AND category = 'redemption' ORDER BY createdAt DESC LIMIT 1",
      [REFERRER_ID]
    );

    if (tickets.length > 0) {
      createdTicketId = tickets[0].id;
      console.log('   ✅ Success: payout support ticket generated (ID: ' + createdTicketId + ', Subject: ' + tickets[0].subject + ')');
    } else {
      throw new Error('Redemption support ticket was not generated');
    }

    console.log('\n🎉 ALL REFERRAL SYSTEM FEATURES VERIFIED AND RUNNING SUCCESSFULLY!');

  } catch (error) {
    console.error('\n❌ Verification Failed:', error.message);
  } finally {
    // -------------------------------------------------------------------------
    // Step 6: Cleanup Database Records to prevent pollution
    // -------------------------------------------------------------------------
    console.log('\n🧹 Cleaning up test database records...');
    
    if (createdTicketId) {
      await db.query('DELETE FROM SupportTicket WHERE id = ?', [createdTicketId]);
    }
    if (createdUserId) {
      await db.query('DELETE FROM Referral WHERE refereeId = ?', [createdUserId]);
      await db.query('DELETE FROM User WHERE id = ?', [createdUserId]);
    }
    if (createdLeadId) {
      await db.query('DELETE FROM referral_events WHERE referral_lead_id = ?', [createdLeadId]);
      await db.query('DELETE FROM referral_leads WHERE id = ?', [createdLeadId]);
    }

    // Clean up temporary clicks and wallet transactions added during this test run
    await db.query(
      "DELETE FROM referral_events WHERE referrer_id = ? AND (event_type = 'click' OR event_type = 'reward_generated')",
      [REFERRER_ID]
    );
    await db.query(
      "DELETE FROM wallet_transactions WHERE user_id = ? AND (reference_id = 'TEST_ORDER_999' OR description LIKE '%redemption%' OR description LIKE '%Test manual credit%' OR description LIKE '%Withdrawal%')",
      [REFERRER_ID]
    );

    // Reset wallet balance back to initial database state
    const currentRealBalance = await ReferralService.getRedemptionSettings().then(async () => {
      // Recalculate based on current actual database transactions
      const res = await db.query(
        "SELECT SUM(CASE WHEN type = 'credit' THEN points ELSE 0 END) - SUM(CASE WHEN type = 'debit' THEN points ELSE 0 END) as balance FROM wallet_transactions WHERE user_id = ? AND status = 'approved'",
        [REFERRER_ID]
      );
      return res[0].balance || 0;
    });

    await db.query("UPDATE User SET points_wallet = ? WHERE id = ?", [currentRealBalance, REFERRER_ID]);
    console.log('   Reset user 12 balance to actual database balance: ' + currentRealBalance);
    console.log('🧹 Cleanup complete.');
  }
}

runTest();
