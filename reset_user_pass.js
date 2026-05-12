require('dotenv').config();
const db = require('./backend/src/utils/db');
const bcrypt = require('bcryptjs');

async function main() {
  try {
    const hashed = await bcrypt.hash('user123', 10);
    await db.query('UPDATE User SET password = ? WHERE email = ?', [hashed, 'user@gsttaxwale.com']);
    console.log('Password reset to user123 for user@gsttaxwale.com');
    process.exit(0);
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
}
main();
