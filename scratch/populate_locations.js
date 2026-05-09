require('dotenv').config();
const db = require('../backend/src/utils/db');

const locations = [
  {
    name: 'Patna Head Office',
    address: '102, Shanti Complex, Boring Road, Patna, Bihar - 800001',
    city: 'Patna',
    state: 'Bihar',
    pincode: '800001',
    phone: '+91 7739301568',
    email: 'help@gsttaxwale.com',
    mapUrl: 'https://maps.google.com/?q=Boring+Road+Patna',
    active: 1
  },
  {
    name: 'Delhi Corporate Office',
    address: 'Sector 62, Noida, NCR Delhi - 201301',
    city: 'Noida',
    state: 'UP',
    pincode: '201301',
    phone: '+91 9999999999',
    email: 'delhi@gsttaxwale.com',
    mapUrl: 'https://maps.google.com/?q=Sector+62+Noida',
    active: 1
  }
];

async function populate() {
  try {
    for (const loc of locations) {
      console.log(`Inserting ${loc.name}...`);
      await db.query(
        'INSERT INTO Location (name, address, city, state, pincode, phone, email, mapUrl, active, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())',
        [loc.name, loc.address, loc.city, loc.state, loc.pincode, loc.phone, loc.email, loc.mapUrl, loc.active]
      );
    }
    console.log('Locations populated successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Population failed:', err);
    process.exit(1);
  }
}

populate();
