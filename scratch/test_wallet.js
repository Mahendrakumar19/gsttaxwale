const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

const jwt = require('jsonwebtoken');
const http = require('http');
const config = require('../backend/src/config/index');

const token = jwt.sign({ userId: 12 }, config.jwt.secret || 'ec434a51ba4be676ac157fa92b92aaf2b32569386b3176b2', { expiresIn: '7d' });

function requestAPI(path) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        console.log(`Path ${path} status:`, res.statusCode);
        try {
          const parsed = JSON.parse(data);
          console.log(`Path ${path} response:`, JSON.stringify(parsed).substring(0, 300));
        } catch {
          console.log(`Path ${path} content:`, data.substring(0, 300));
        }
        resolve();
      });
    });

    req.on('error', err => {
      console.error(`Error requesting ${path}:`, err.message);
      resolve();
    });

    req.end();
  });
}

async function run() {
  await requestAPI('/api/dashboard/wallet');
  await requestAPI('/api/referrals');
}

run();
