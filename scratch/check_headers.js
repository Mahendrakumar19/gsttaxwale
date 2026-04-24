const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/_next/static/css/app/layout.css',
  method: 'GET'
};

const req = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  console.log(`HEADERS: ${JSON.stringify(res.headers, null, 2)}`);
  res.setEncoding('utf8');
  let body = '';
  res.on('data', (chunk) => { body += chunk; });
  res.on('end', () => {
    console.log('BODY START:', body.substring(0, 100));
  });
});

req.on('error', (e) => {
  console.error(`problem with request: ${e.message}`);
});

req.end();
