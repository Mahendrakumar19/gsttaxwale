const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const email = 'admin@example.com';
  const password = 'AdminPass123!';
  const name = 'Administrator';
  const pan = 'ADMINP0000A';

  const hashed = await bcrypt.hash(password, 10);

  const admin = await prisma.user.upsert({
    where: { email },
    update: {
      password: hashed,
      name,
      role: 'admin',
      status: 'active'
    },
    create: {
      email,
      password: hashed,
      name,
      pan,
      role: 'admin',
      status: 'active',
      emailVerified: true
    }
  });

  console.log('Admin upserted:', admin.email);
  console.log('Password:', password);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
