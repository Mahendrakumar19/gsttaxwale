const http = require('http');

function checkRoute(path) {
  return new Promise((resolve) => {
    http.get(`http://localhost:3000${path}`, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        console.log(`Path ${path} status:`, res.statusCode);
        try {
          const parsed = JSON.parse(data);
          console.log(`Path ${path} success:`, parsed.success);
        } catch {
          console.log(`Path ${path} content length:`, data.length);
        }
        resolve();
      });
    }).on('error', err => {
      console.error(`Error requesting ${path}:`, err.message);
      resolve();
    });
  });
}

async function run() {
  // Give the server a second to start/restart
  await new Promise(r => setTimeout(r, 2000));
  await checkRoute('/api/sliders');
  await checkRoute('/api/news?limit=6');
  await checkRoute('/api/due-dates?limit=8');
}

run();
