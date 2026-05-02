const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function checkAndCreateAdmin() {
  try {
    // Check if admin exists
    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'admin' }
    });
    
    if (existingAdmin) {
      console.log('✅ Admin user already exists:');
      console.log('   Email:', existingAdmin.email);
      console.log('   Name:', existingAdmin.name);
      console.log('   Role:', existingAdmin.role);
      console.log('\n✅ Admin account ready for testing!');
      console.log('   Test credentials:');
      console.log('   Email: ' + existingAdmin.email);
      console.log('   Password: (use the password you created)');
    } else {
      console.log('❌ No admin user found. Creating one...');
      
      // Create a new admin user
      const hashedPassword = await bcrypt.hash('Admin@123456', 10);
      
      const newAdmin = await prisma.user.create({
        data: {
          email: 'admin@gsttaxwale.com',
          password: hashedPassword,
          name: 'Admin User',
          firstName: 'Admin',
          lastName: 'User',
          phone: '+91-9999999999',
          role: 'admin',
          verified: true,
          status: 'active'
        }
      });
      
      console.log('✅ Admin user created successfully!');
      console.log('   ID:', newAdmin.id);
      console.log('   Email:', newAdmin.email);
      console.log('   Name:', newAdmin.name);
      console.log('   Role:', newAdmin.role);
      console.log('\n✅ You can now login with:');
      console.log('   Email: admin@gsttaxwale.com');
      console.log('   Password: Admin@123456');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkAndCreateAdmin();
