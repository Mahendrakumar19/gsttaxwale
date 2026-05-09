require('dotenv').config();
const db = require('../backend/src/utils/db');

const services = [
  { slug: 'itr-filing-individual', name: 'Individual ITR Filing', price: 999, discountPrice: 799 },
  { slug: 'gst-registration', name: 'GST Registration & Setup', price: 2499, discountPrice: 1999 },
  { slug: 'gst-filing-quarterly', name: 'GST Filing (Quarterly)', price: 1299, discountPrice: 999 },
  { slug: 'gst-filing-annual', name: 'GST Annual Return (GSTR-9)', price: 1999, discountPrice: 1499 },
  { slug: 'tds-compliance', name: 'TDS Compliance & Filing', price: 1499, discountPrice: 1199 },
  { slug: 'business-tax-consulting', name: 'Business Tax Consulting (2 hrs)', price: 4999, discountPrice: 3999 },
  { slug: 'audit-support', name: 'Income Tax Audit Support', price: 7999, discountPrice: 6499 },
  { slug: 'startup-tax-setup', name: 'Startup Tax Setup Package', price: 9999, discountPrice: 7999 },
  { slug: 'payroll-compliance', name: 'Monthly Payroll Compliance', price: 4999, discountPrice: 3999 },
  { slug: 'investment-advisory', name: 'Tax Saving Investment Advisory', price: 2999, discountPrice: 2499 },
  { slug: 'nri-tax-filing', name: 'NRI Income Tax Filing', price: 3999, discountPrice: 3499 },
  { slug: 'professional-tax-filing', name: 'Professional Income Tax', price: 2499, discountPrice: 1999 },
  { slug: 'capital-gains-planning', name: 'Capital Gains Tax Planning', price: 3499, discountPrice: 2999 },
  { slug: 'property-tax-setup', name: 'Property & Rental Tax Setup', price: 2999, discountPrice: 2499 },
  { slug: 'tax-notice-response', name: 'Income Tax Notice Response', price: 5999, discountPrice: 4999 }
];

async function populate() {
  try {
    for (const s of services) {
      console.log(`Updating ${s.slug}...`);
      await db.query(
        'UPDATE Service SET name = ?, price = ?, discountPrice = ?, updatedAt = NOW() WHERE slug = ?',
        [s.name, s.price, s.discountPrice, s.slug]
      );
    }
    console.log('Database populated with slashed prices successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Population failed:', err);
    process.exit(1);
  }
}

populate();
