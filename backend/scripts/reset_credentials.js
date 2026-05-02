const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function resetAdminPassword() {
  try {
    const adminEmail = 'admin@gsttaxwale.com';
    const newPassword = 'Admin@123456';
    
    console.log('🔄 Resetting Admin Password');
    console.log('──────────────────────────\n');
    
    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update admin user
    const updatedAdmin = await prisma.user.update({
      where: { email: adminEmail },
      data: {
        password: hashedPassword,
        status: 'active'
      }
    });
    
    console.log('✅ Admin password reset successfully!');
    console.log(`   Email: ${updatedAdmin.email}`);
    console.log(`   Name: ${updatedAdmin.name}`);
    console.log(`   Role: ${updatedAdmin.role}`);
    console.log(`   Status: ${updatedAdmin.status}`);
    
    console.log('\n📝 Login Credentials:');
    console.log('───────────────────');
    console.log(`Email: ${adminEmail}`);
    console.log(`Password: ${newPassword}`);
    
    // Verify the password
    const passwordMatch = await bcrypt.compare(newPassword, updatedAdmin.password);
    console.log(`\n✅ Password verification: ${passwordMatch ? 'PASSED' : 'FAILED'}`);
    
    // Test creating a regular user
    console.log('\n📝 Creating Test Regular User');
    console.log('────────────────────────────');
    
    const testPassword = await bcrypt.hash('User@123456', 10);
    try {
      const testUser = await prisma.user.create({
        data: {
          email: 'testuser@gsttaxwale.com',
          password: testPassword,
          name: 'Test User',
          phone: '+91-9876543210',
          role: 'user',
          status: 'active',
          emailVerified: true
        }
      });
      
      console.log('✅ Test user created successfully!');
      console.log(`   Email: ${testUser.email}`);
      console.log(`   Name: ${testUser.name}`);
      console.log(`   Role: ${testUser.role}`);
      
      console.log('\n📝 Test User Credentials:');
      console.log('────────────────────────');
      console.log(`Email: ${testUser.email}`);
      console.log(`Password: User@123456`);
    } catch (err) {
      if (err.code === 'P2002') {
        console.log('✅ Test user already exists (testuser@gsttaxwale.com)');
      } else {
        console.log('⚠️  Could not create test user:', err.message);
      }
    }
    
    console.log('\n✨ Setup complete! You can now test admin login.\n');
    
  } catch (error) {
    if (error.code === 'P2002') {
      console.log('✅ Test user already exists');
    } else {
      console.error('❌ Error:', error.message);
    }
  } finally {
    await prisma.$disconnect();
  }
}

resetAdminPassword();
