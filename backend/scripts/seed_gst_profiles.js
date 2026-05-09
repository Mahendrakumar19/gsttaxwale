const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    where: { role: 'user' },
    take: 5, // Sample for first 5 users
  });

  for (const user of users) {
    await prisma.gstProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        gstin: `27ABCDE${user.id}Q1Z5`, // Sample GSTIN
        businessName: `${user.name} Enterprises`,
        legalName: user.name,
        state: 'Maharashtra',
        category: 'regular',
      },
    });
    console.log(`✅ GST Profile created for user ${user.id} (${user.email})`);
  }

  console.log('✅ Sample GST profiles seeded!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

