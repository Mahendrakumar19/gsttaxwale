(async () => {
  try {
    const res = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@example.com', password: 'AdminPass123!' })
    });
    const data = await res.text();
    console.log('Status:', res.status);
    console.log('Body:', data);
  } catch (err) {
    console.error('Request error', err);
    process.exit(1);
  }
})();
