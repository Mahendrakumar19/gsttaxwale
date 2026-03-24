(async () => {
  try {
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@example.com', password: 'AdminPass123!' })
    });
    const login = await loginRes.json();
    console.log('Login status:', loginRes.status);
    console.log('Login body:', JSON.stringify(login, null, 2));

    const token = login.data?.token;
    if (!token) {
      console.error('No token received');
      process.exit(1);
    }

    const meRes = await fetch('http://localhost:5000/api/auth/me', {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const me = await meRes.json();
    console.log('Me status:', meRes.status);
    console.log('Me body:', JSON.stringify(me, null, 2));
  } catch (err) {
    console.error('Request error', err);
    process.exit(1);
  }
})();
