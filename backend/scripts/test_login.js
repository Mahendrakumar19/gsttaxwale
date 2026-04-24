(async () => {
  try {
    const res = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'user@gsttaxwale.com', password: 'password123' })
    });
    const data = await res.text();
    console.log('Status:', res.status);
    console.log('Body:', data);
    
    if (res.status === 200) {
      const json = JSON.parse(data);
      console.log('\n✅ LOGIN SUCCESSFUL!');
      console.log('Token:', json.data.token);
      console.log('User:', json.data.user);
    } else {
      console.log('\n❌ Login failed');
    }
  } catch (err) {
    console.error('Request error', err);
    process.exit(1);
  }
})();
