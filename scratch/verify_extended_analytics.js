const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

const http = require('http');
const jwt = require('jsonwebtoken');
const config = require('../backend/src/config/index');

const JWT_SECRET = config.jwt.secret || 'ec434a51ba4be676ac157fa92b92aaf2b325693';

function makeRequest(options) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, rawBody: data });
        }
      });
    });
    req.on('error', (err) => reject(err));
    req.end();
  });
}

async function verify() {
  const token = jwt.sign(
    { userId: 1, email: 'admin@gsttaxwale.com', role: 'admin' },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  console.log('1. Fetching extended admin analytics...');
  const res = await makeRequest({
    hostname: 'localhost',
    port: 3000,
    path: '/api/admin/analytics',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  console.log('Status Code:', res.status);
  console.log('Body success:', res.body?.success);
  if (res.body?.success) {
    const data = res.body.data;
    console.log('Analytics response content verification:');
    console.log('- totalUsers:', data.totalUsers);
    console.log('- totalOrders:', data.totalOrders);
    console.log('- rates:', data.rates);
    console.log('- topServices count:', data.topServices?.length);
    console.log('- pendingTasks tickets count:', data.pendingTasks?.tickets?.length);
    console.log('- pendingTasks orders count:', data.pendingTasks?.orders?.length);
    console.log('\nTop Services Sample:', data.topServices);
    console.log('\nPending Tasks Tickets Sample:', data.pendingTasks?.tickets);
  } else {
    console.error('Failed response details:', res.body || res.rawBody);
  }
}

verify().catch(console.error);
