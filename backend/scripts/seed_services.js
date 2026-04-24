#!/usr/bin/env node

const mysql = require('mysql2/promise');

const services = [
  {
    slug: 'gst-registration',
    title: 'GST Registration & Filing',
    description: 'Complete GST registration process and quarterly/monthly GST return filing assistance',
    price: 2999,
    features: JSON.stringify([
      'GST Registration guidance',
      'Monthly GSTR-1 filing',
      'Quarterly GSTR-3B filing',
      'ITC (Input Tax Credit) management',
      'GST compliance checks',
      'Annual GST audit'
    ])
  },
  {
    slug: 'income-tax-filing',
    title: 'Income Tax Filing',
    description: 'Professional income tax return filing for individuals and HUFs with expert guidance',
    price: 1999,
    features: JSON.stringify([
      'ITR form selection',
      'Income computation assistance',
      'Deduction optimization',
      'Tax saving strategies',
      'E-filing support',
      'TDS reconciliation'
    ])
  },
  {
    slug: 'company-registration',
    title: 'Company Registration & ROC Filing',
    description: 'Complete company incorporation and annual ROC filing services',
    price: 4999,
    features: JSON.stringify([
      'Company incorporation',
      'Memorandum & Articles drafting',
      'Director registration',
      'Annual ROC filing (MCA)',
      'Compliance calendar management',
      'DIN & CIN assistance'
    ])
  },
  {
    slug: 'tds-filing',
    title: 'TDS Filing',
    description: 'Tax Deducted at Source (TDS) filing and reconciliation services',
    price: 1499,
    features: JSON.stringify([
      'TDS return filing (Form 24Q, 26Q)',
      'TDS reconciliation',
      'Corrective returns',
      'TDS certificate issuance',
      'TDS computation assistance',
      'Quarterly compliance tracking'
    ])
  },
  {
    slug: 'esic-epf',
    title: 'ESIC & EPF Registration',
    description: 'Employee State Insurance & Employees Provident Fund registration and ongoing compliance',
    price: 2499,
    features: JSON.stringify([
      'ESIC registration',
      'EPF registration',
      'Monthly ECR filing',
      'Claim assistance',
      'Compliance calendar',
      'Annual EOY processing'
    ])
  },
  {
    slug: 'trademark-registration',
    title: 'Trademark Registration',
    description: 'Intellectual property protection through trademark registration and maintenance',
    price: 3999,
    features: JSON.stringify([
      'Trademark search & availability',
      'Application filing',
      'Legal support & objection handling',
      'Registration certificate',
      'Renewal assistance',
      '10-year protection validity'
    ])
  }
];

async function seedServices() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || '194.59.164.75',
    user: process.env.DB_USER || 'u963801592_gsttaxwale_use',
    password: process.env.DB_PASSWORD || 'gsttaxwaleNG26',
    database: process.env.DB_NAME || 'u963801592_gsttaxwale',
  });

  try {
    console.log('🌱 Starting service seeding...');

    for (const service of services) {
      try {
        // Check if service already exists
        const [existing] = await connection.query(
          'SELECT id FROM Service WHERE slug = ?',
          [service.slug]
        );

        if (existing.length > 0) {
          console.log(`⏭️  Skipping ${service.title} (already exists)`);
          continue;
        }

        // Insert new service
        const result = await connection.query(
          'INSERT INTO Service (id, slug, title, description, price, features, createdAt, updatedAt) VALUES (UUID(), ?, ?, ?, ?, ?, NOW(), NOW())',
          [service.slug, service.title, service.description, service.price, service.features]
        );

        console.log(`✅ Added: ${service.title}`);
      } catch (err) {
        console.error(`❌ Error adding ${service.title}:`, err.message);
      }
    }

    console.log('\n✨ Service seeding complete!');
    
    // Display all services
    const [allServices] = await connection.query('SELECT id, title, price FROM Service');
    console.log('\n📋 Current services in database:');
    allServices.forEach(s => console.log(`   • ${s.title} - ₹${s.price}`));

  } catch (err) {
    console.error('Database error:', err);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

seedServices();
