// Test admin login
const axios = require('axios');

const API_URL = process.env.API_URL || 'http://localhost:5000';

async function testAdminLogin() {
  try {
    console.log('🧪 Testing Admin Login...\n');
    
    // Test admin login
    console.log('1️⃣ Testing admin login with correct credentials:');
    const loginRes = await axios.post(`${API_URL}/api/auth/login`, {
      email: 'admin@gsttaxwale.com',
      password: 'admin123'
    });
    
    const { user, token } = loginRes.data.data;
    console.log('✅ Admin login successful!');
    console.log(`   Email: ${user.email}`);
    console.log(`   Name: ${user.name}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Token: ${token.substring(0, 20)}...`);
    
    // Test protected admin endpoint
    console.log('\n2️⃣ Testing protected admin endpoint:');
    try {
      const adminRes = await axios.get(`${API_URL}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Admin access granted!');
      console.log(`   Found ${adminRes.data.data?.users?.length || 'N/A'} users`);
    } catch (err) {
      console.log('❌ Admin endpoint error:', err.response?.data?.message || err.message);
    }
    
    // Test user login (should fail)
    console.log('\n3️⃣ Testing regular user login:');
    const userRes = await axios.post(`${API_URL}/api/auth/login`, {
      email: 'user@gsttaxwale.com',
      password: 'password123'
    });
    
    const userToken = userRes.data.data.token;
    console.log('✅ User login successful!');
    console.log(`   Role: ${userRes.data.data.user.role}`);
    
    // Test user accessing admin endpoint (should fail)
    console.log('\n4️⃣ Testing user accessing admin endpoint (should fail):');
    try {
      await axios.get(`${API_URL}/api/admin/users`, {
        headers: { Authorization: `Bearer ${userToken}` }
      });
      console.log('❌ User was able to access admin endpoint - SECURITY ISSUE!');
    } catch (err) {
      if (err.response?.status === 403) {
        console.log('✅ User access denied as expected!');
        console.log(`   Message: ${err.response.data.message}`);
      } else {
        console.log('❌ Unexpected error:', err.response?.data?.message || err.message);
      }
    }
    
    console.log('\n✨ All tests completed!');
    process.exit(0);
  } catch (err) {
    console.log('❌ Error:', err.response?.data?.message || err.message);
    process.exit(1);
  }
}

testAdminLogin();
