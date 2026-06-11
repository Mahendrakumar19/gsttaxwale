const db = require('./db');

/**
 * Generate a unique referral code: GTW + first 3 of name + last 4 of mobile.
 * If duplicate exists, falls back to GTW + first 3 of name + 4 random digits.
 */
async function generateUniqueReferralCode(name, phone) {
  // Take first name only (before any space), then first 3 letters, uppercase, pad with X
  const firstName = (name || 'USR').trim().split(/\s+/)[0];
  const namePart = firstName.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 3).padEnd(3, 'X');

  // Last 4 digits of phone, pad with 0 if shorter
  const cleanPhone = (phone || '0000').replace(/\D/g, '');
  const phonePart = cleanPhone.slice(-4).padStart(4, '0');

  let code = `GTW${namePart}${phonePart}`;
  
  let isUnique = false;
  let attempts = 0;
  while (!isUnique && attempts < 100) {
    // Check if code exists in User table
    const [existingUser] = await db.query('SELECT id FROM User WHERE referral_code = ?', [code]);
    // Check if code exists in referral_referrers table
    const [existingGuest] = await db.query('SELECT id FROM referral_referrers WHERE referral_id = ?', [code]);
    
    if (!existingUser && !existingGuest) {
      isUnique = true;
    } else {
      attempts++;
      // Generate 4 random digits
      const randomPart = Math.floor(1000 + Math.random() * 9000).toString();
      code = `GTW${namePart}${randomPart}`;
    }
  }
  return code;
}

module.exports = {
  generateUniqueReferralCode
};
