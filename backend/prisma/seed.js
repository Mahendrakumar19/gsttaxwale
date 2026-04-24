const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const DEFAULT_SERVICES = [
  {
    slug: 'itr-filing-individual',
    title: 'Individual ITR Filing',
    description: 'Complete Income Tax Return filing for salaried individuals with expert review and e-filing',
    price: 999,
    features: ['PAN validation', 'Income verification', 'E-filing submission', 'Expert CA review']
  },
  {
    slug: 'gst-registration',
    title: 'GST Registration & Setup',
    description: 'Get your business GST registration done quickly and easily with our expert assistance',
    price: 2499,
    features: ['Online registration', 'Document verification', 'Portal training', '30-day support']
  },
  {
    slug: 'gst-filing-quarterly',
    title: 'GST Filing (Quarterly)',
    description: 'Quarterly GST return filing with complete reconciliation and compliance',
    price: 1299,
    features: ['GSTR-1 & GSTR-2 filing', 'Input-output match', 'Late fee calculation', 'Amendment support']
  },
  {
    slug: 'gst-filing-annual',
    title: 'GST Annual Return (GSTR-9)',
    description: 'Complete annual GST return filing with detailed reconciliation and audit trail',
    price: 1999,
    features: ['Annual reconciliation', 'Audit trail preparation', 'Document compilation', 'Amendment support']
  },
  {
    slug: 'tds-compliance',
    title: 'TDS Compliance & Filing',
    description: 'TDS return preparations, filing, and monthly e-payment guidance',
    price: 1499,
    features: ['TDS calculation', 'Quarterly filing', 'Challan preparation', 'Outstanding TDS tracking']
  },
  {
    slug: 'business-tax-consulting',
    title: 'Business Tax Consulting (2 hrs)',
    description: 'One-on-one tax consultation with our experienced CA for strategic tax planning',
    price: 4999,
    features: ['2-hour consultation', 'Personalized strategy', 'Document review', 'Action plan']
  },
  {
    slug: 'audit-support',
    title: 'Income Tax Audit Support',
    description: 'Complete support during income tax audit with documentation and representation',
    price: 7999,
    features: ['Document compilation', 'Audit defense', 'Notice response', 'Follow-up support']
  },
  {
    slug: 'startup-tax-setup',
    title: 'Startup Tax Setup Package',
    description: 'Complete tax setup for new startups including GST, PAN, and accounting system',
    price: 9999,
    features: ['GST registration', 'PAN registration', 'Accounting setup', '6-month support']
  },
  {
    slug: 'payroll-compliance',
    title: 'Monthly Payroll Compliance',
    description: 'Monthly management of salary processing, TDS, and statutory filings',
    price: 4999,
    features: ['Salary processing', 'TDS filing', 'Statutory compliance', 'Employee reports']
  },
  {
    slug: 'investment-advisory',
    title: 'Tax Saving Investment Advisory',
    description: 'Personalized tax-saving investment advisory tailored to your income profile',
    price: 2999,
    features: ['Income analysis', 'Investment recommendations', 'Tax saving strategies', 'Quarterly review']
  },
  {
    slug: 'nri-tax-filing',
    title: 'NRI Income Tax Filing',
    description: 'Specialized ITR filing for NRIs with foreign asset disclosure and TDS management',
    price: 3999,
    features: ['NRI-specific ITR', 'Foreign asset filing', 'Remittance tracking', 'FATCA compliance']
  },
  {
    slug: 'professional-tax-filing',
    title: 'Professional Income Tax',
    description: 'Tax planning and filing for doctors, lawyers, consultants, and other professionals',
    price: 2499,
    features: ['Professional deduction', 'Business expense analysis', 'Quarterly advance tax', 'Audit support']
  },
  {
    slug: 'capital-gains-planning',
    title: 'Capital Gains Tax Planning',
    description: 'Strategic planning for long-term and short-term capital gains with tax optimization',
    price: 3499,
    features: ['Gain calculation', 'Exemption planning', 'Loss offsetting', 'Investment recommendations']
  },
  {
    slug: 'property-tax-setup',
    title: 'Property & Rental Tax Setup',
    description: 'Complete tax setup for rental income property including documentation and filing',
    price: 2999,
    features: ['Rental income tracking', 'Expense documentation', 'Depreciation calculation', 'Annual ITR filing']
  },
  {
    slug: 'tax-notice-response',
    title: 'Income Tax Notice Response',
    description: 'Expert response to income tax notices and demand letters with full representation',
    price: 5999,
    features: ['Notice analysis', 'Document compilation', 'Written response', 'Meeting support']
  }
];

async function main() {
  try {
    console.log('Starting database seed...');
    
    // Try to create admin user (skip if already exists)
    try {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      const adminUser = await prisma.user.upsert({
        where: { email: 'admin@gsttaxwale.com' },
        update: {},
        create: {
          email: 'admin@gsttaxwale.com',
          password: hashedPassword,
          name: 'Admin User',
          pan: 'AAAAA0000A',
          phone: '+919999999999',
          dateOfBirth: new Date('1985-01-01'),
          gender: 'M',
          address: 'Admin Office',
          city: 'New Delhi',
          state: 'Delhi',
          pincode: '110001',
          role: 'admin',
          status: 'active',
          emailVerified: true,
        },
      });
      
      console.log('✓ Admin user created/verified:', adminUser.email);
    } catch (adminErr) {
      console.log('✓ Admin user already exists, skipping...');
    }
    
    // Try to create test user (skip if already exists)
    try {
      const hashedPassword = await bcrypt.hash('password123', 10);
      
      const testUser = await prisma.user.upsert({
        where: { email: 'user@gsttaxwale.com' },
        update: {},
        create: {
          email: 'user@gsttaxwale.com',
          password: hashedPassword,
          name: 'Demo User',
          pan: 'AAAPD5055K',
          phone: '+919876543210',
          dateOfBirth: new Date('1990-01-01'),
          gender: 'M',
          address: '123 Main Street',
          city: 'New Delhi',
          state: 'Delhi',
          pincode: '110001',
          role: 'user',
          status: 'active',
          emailVerified: true,
        },
      });
      
      console.log('✓ Demo user created/verified:', testUser.email);
    } catch (userErr) {
      console.log('✓ Demo user already exists, skipping...');
    }
    
    // Create default services
    let servicesCreated = 0;
    for (const svc of DEFAULT_SERVICES) {
      const result = await prisma.service.upsert({
        where: { slug: svc.slug },
        update: {
          title: svc.title,
          description: svc.description,
          price: svc.price,
          features: JSON.stringify(svc.features),
        },
        create: {
          slug: svc.slug,
          title: svc.title,
          description: svc.description,
          price: svc.price,
          features: JSON.stringify(svc.features),
        },
      });
      servicesCreated++;
    }
    
    console.log(`✓ ${servicesCreated} services created/updated`);
    
    // Verify the data
    const userCount = await prisma.user.count();
    const serviceCount = await prisma.service.count();
    console.log(`✓ Total users in database: ${userCount}`);
    console.log(`✓ Total services in database: ${serviceCount}`);
    console.log('');
    console.log('📧 Admin Credentials:');
    console.log('   Email: admin@gsttaxwale.com');
    console.log('   Password: admin123');
    console.log('');
    console.log('📧 Demo User Credentials:');
    console.log('   Email: user@gsttaxwale.com');
    console.log('   Password: password123');
    console.log('');
    console.log('✓ Database seed completed successfully!');
    
  } catch(error) {
    console.error('✗ Seed error:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
