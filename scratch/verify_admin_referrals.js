const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

const http = require('http');
const jwt = require('jsonwebtoken');
const config = require('../backend/src/config/index');

const JWT_SECRET = config.jwt.secret || 'ec434a51ba4be676ac157fa92b92aaf2b325693';

function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, headers: res.headers, body: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, rawBody: data });
        }
      });
    });
    req.on('error', (err) => reject(err));
    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

async function verify() {
  const token = jwt.sign(
    { userId: 1, email: 'admin@gsttaxwale.com', role: 'admin' },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  console.log('1. Fetching combined admin referrals list...');
  const res = await makeRequest({
    hostname: 'localhost',
    port: 3000,
    path: '/api/admin/referrals',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  console.log('Status Code:', res.status);
  console.log('Response Success:', res.body?.success);
  console.log('Message:', res.body?.message);

  if (res.body?.success) {
    const list = res.body.data?.referrals || [];
    console.log(`Successfully fetched ${list.length} combined referrals.`);
    if (list.length > 0) {
      console.log('First Referral Item:', {
        id: list[0].id,
        referrerName: list[0].referrerName,
        referredName: list[0].referredName,
        refereeEmail: list[0].refereeEmail,
        leadId: list[0].leadId,
        serviceInterest: list[0].serviceInterest,
        referralStatus: list[0].referralStatus
      });
    }
  } else {
    console.error('Failed response details:', res.body || res.rawBody);
  }

  console.log('\n2. Fetching referrals stats...');
  const statsRes = await makeRequest({
    hostname: 'localhost',
    port: 3000,
    path: '/api/admin/referrals-stats',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  console.log('Stats Status Code:', statsRes.status);
  console.log('Stats Response Success:', statsRes.body?.success);
  if (statsRes.body?.success) {
    console.log('Stats Data:', statsRes.body.data);
  } else {
    console.error('Failed stats response:', statsRes.body || statsRes.rawBody);
  }
}

verify().catch(console.error);
