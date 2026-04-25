const http = require('http');

async function testCors(origin) {
  console.log(`\nTesting CORS with Origin: ${origin}`);
  
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/health',
      method: 'OPTIONS', // CORS Preflight
      headers: {
        'Origin': origin,
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type'
      }
    };

    const req = http.request(options, (res) => {
      console.log(`Status: ${res.statusCode}`);
      console.log(`Access-Control-Allow-Origin: ${res.headers['access-control-allow-origin'] || 'NONE'}`);
      console.log(`Access-Control-Allow-Credentials: ${res.headers['access-control-allow-credentials'] || 'NONE'}`);
      resolve();
    });

    req.on('error', (e) => {
      console.error(`Error: ${e.message}`);
      resolve();
    });

    req.end();
  });
}

async function runTests() {
  await testCors('http://localhost:3000');
  await testCors('https://gsttaxwale.com');
  await testCors('https://unknown-domain.com'); // Should be allowed in DEV mode
}

runTests();
