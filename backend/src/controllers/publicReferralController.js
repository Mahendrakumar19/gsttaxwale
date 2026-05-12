const db = require('../utils/db');
const { successResponse, errorResponse } = require('../utils/helpers');
const ReferralService = require('../services/referralService');

/**
 * Generate unique referral code: GTW + first 3 of name + last 3 of mobile + 3 random
 */
function generateCode(name, phone) {
  const namePart = (name || 'USR').substring(0, 3).toUpperCase().padEnd(3, 'X');
  const phonePart = (phone || '000').slice(-3).padStart(3, '0');
  const randomPart = Math.floor(100 + Math.random() * 900);
  return `GTW${namePart}${phonePart}${randomPart}`;
}

/**
 * Directly generate a referral code (No OTP)
 */
async function generatePublicReferral(req, res) {
  try {
    const { name, email, phone } = req.body;

    if (!name || !email || !phone) {
      return res.status(400).json(errorResponse('Name, email and phone are required'));
    }

    // 1. Check if user already exists
    let user = await db.findOne('User', { email: email });
    if (!user) {
      user = await db.findOne('User', { phone: phone });
    }

    let referralCode;
    let userId;

    if (user) {
      // User exists, get their code or generate one
      userId = user.id;
      if (user.referral_code) {
        referralCode = user.referral_code;
      } else {
        referralCode = generateCode(user.name, user.phone);
        await db.update('User', { referral_code: referralCode }, { id: user.id });
      }
    } else {
      // 2. Create a Lead/Placeholder User
      referralCode = generateCode(name, phone);
      const dummyPassword = 'TEMP_' + Math.random().toString(36).slice(-8);
      
      const newUser = await db.create('User', {
        name,
        email,
        phone,
        password: dummyPassword,
        role: 'user',
        status: 'pending',
        referral_code: referralCode,
        active: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      userId = newUser.id;
    }

    // 3. Track Event: Referral Code Generated
    await ReferralService.trackEvent(userId, null, 'click', { 
      action: 'generate_public_code',
      source: 'contact_page'
    });

    return res.status(200).json(
      successResponse({ referralCode }, 'Referral code generated successfully!')
    );
  } catch (error) {
    console.error('❌ Referral generation error:', error);
    return res.status(500).json(errorResponse('Failed to generate referral code: ' + error.message));
  }
}

module.exports = {
  generatePublicReferral
};
