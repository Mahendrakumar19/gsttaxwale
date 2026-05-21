const db = require('../utils/db');
const { successResponse, errorResponse } = require('../utils/helpers');
const { generateUniqueReferralCode } = require('../utils/referralHelper');
const emailService = require('../services/emailService');

/**
 * Generate public referral code (guest/public users)
 * Maps to POST /api/referrals/generate-public
 */
async function generatePublicReferral(req, res) {
  try {
    const { name, email, phone, refereeName, refereeEmail, refereePhone } = req.body;

    if (!name || !email || !phone) {
      return res.status(400).json(errorResponse('Name, email and phone are required'));
    }

    const cleanPhone = phone.replace(/\D/g, '');

    // 1. Check if user exists in User table
    let user = await db.findOne('User', { email });
    if (!user) {
      user = await db.findOne('User', { phone: cleanPhone });
    }

    let referralCode;

    if (user) {
      // Exists as registered customer
      if (user.referral_code) {
        referralCode = user.referral_code;
      } else {
        referralCode = await generateUniqueReferralCode(user.name, user.phone);
        await db.update('User', { referral_code: referralCode }, { id: user.id });
      }
    } else {
      // Check if already exists in guest referral_referrers table
      let guest = await db.findOne('referral_referrers', { email });
      if (!guest) {
        guest = await db.findOne('referral_referrers', { mobile: cleanPhone });
      }

      if (guest) {
        referralCode = guest.referral_id;
      } else {
        // Create new guest referrer
        referralCode = await generateUniqueReferralCode(name, cleanPhone);
        await db.create('referral_referrers', {
          name,
          email,
          mobile: cleanPhone,
          referral_id: referralCode,
          pending_points: 0,
          is_customer: 0,
          converted_user_id: null,
          created_at: new Date(),
          updated_at: new Date()
        });
      }
    }

    // 2. Handle referee/friend registration if details provided
    if (refereeEmail && refereePhone && refereeName) {
      const cleanRefereePhone = refereePhone.replace(/\D/g, '');

      // Check if lead already exists in referral_leads
      const [existingLead] = await db.query(
        'SELECT id FROM referral_leads WHERE referred_email = ? OR referred_mobile = ?',
        [refereeEmail, cleanRefereePhone]
      );

      if (!existingLead) {
        await db.create('referral_leads', {
          referrer_referral_id: referralCode,
          referred_name: refereeName,
          referred_mobile: cleanRefereePhone,
          referred_email: refereeEmail,
          service_interest: 'General Tax Consultation',
          status: 'pending',
          converted_user_id: null,
          reward_given: 0,
          created_at: new Date(),
          updated_at: new Date()
        });

        // Send invite emails asynchronously (non-blocking)
        emailService.sendReferrerConfirmationEmail(email, name, refereeName, referralCode)
          .catch(err => console.error('Error sending referrer email:', err));
          
        emailService.sendReferralInviteEmail(refereeEmail, name, referralCode)
          .catch(err => console.error('Error sending referee email:', err));
      }
    }

    return res.status(200).json(
      successResponse({ referralCode }, 'Referral submitted successfully! Referral code generated.')
    );
  } catch (error) {
    console.error('❌ Public referral generation error:', error);
    return res.status(500).json(errorResponse('Failed to generate referral code: ' + error.message));
  }
}

module.exports = {
  generatePublicReferral
};
