const db = require('../utils/db');
const { successResponse, errorResponse } = require('../utils/helpers');
const ReferralService = require('../services/referralService');
const nodemailer = require('nodemailer');

/**
 * Generate unique referral code: gtw + first 3 of name + last 4 of mobile
 */
function generateCode(name, phone) {
  const namePart = (name || 'usr').toLowerCase().replace(/[^a-z]/g, '').slice(0, 3).padEnd(3, 'x');
  const phonePart = (phone || '0000').replace(/\D/g, '').slice(-4).padStart(4, '0');
  return `gtw${namePart}${phonePart}`;
}

/**
 * Create a shared nodemailer transporter
 */
function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true' || process.env.SMTP_PORT === '465',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

/**
 * Send referral confirmation email to the REFERRER (person who referred)
 */
async function sendReferrerEmail(referrerEmail, referrerName, refereeName, referralCode) {
  try {
    const transporter = createTransporter();
    const from = `"GST Tax Wale" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`;

    await transporter.sendMail({
      from,
      to: referrerEmail,
      subject: `🎉 Your Referral is Registered – GST Tax Wale`,
      html: `
        <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: auto; padding: 30px; background: #f8faff; border-radius: 12px;">
          <div style="background: #2563EB; padding: 24px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">GST Tax Wale</h1>
            <p style="color: #bfdbfe; margin: 8px 0 0 0; font-size: 14px;">Referral Confirmation</p>
          </div>

          <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e9f0;">
            <h2 style="color: #002B49;">Hi ${referrerName}! 🎉</h2>
            <p style="color: #4b5e74; line-height: 1.7;">
              Thank you for referring <strong>${refereeName}</strong> to GST Tax Wale! Your referral has been successfully registered in our system.
            </p>

            <div style="background: #f0f7ff; border-left: 4px solid #2563EB; border-radius: 8px; padding: 20px; margin: 24px 0;">
              <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 12px; text-transform: uppercase; font-weight: bold; letter-spacing: 1px;">Your Referral Code</p>
              <p style="font-family: monospace; font-size: 28px; font-weight: 900; color: #2563EB; margin: 0; letter-spacing: 4px;">${referralCode}</p>
            </div>

            <p style="color: #4b5e74; line-height: 1.7;">
              Share your unique referral link with more friends and earn exciting rewards for every successful referral!
            </p>

            <div style="text-align: center; margin: 28px 0;">
              <a href="https://gsttaxwale.com/?ref=${referralCode}" 
                 style="background: #2563EB; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">
                View Your Referral Link
              </a>
            </div>

            <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
            <p style="font-size: 12px; color: #9ca3af; text-align: center;">
              &copy; ${new Date().getFullYear()} GST Tax Wale. All rights reserved.
            </p>
          </div>
        </div>
      `,
    });
    console.log(`📧 Referral confirmation sent to referrer: ${referrerEmail}`);
    return true;
  } catch (err) {
    console.error('sendReferrerEmail error:', err);
    return false;
  }
}

/**
 * Send a welcome/invite email to the REFEREE (person who was referred)
 */
async function sendRefereeEmail(refereeEmail, refereeName, referrerName, referralCode) {
  try {
    const transporter = createTransporter();
    const from = `"GST Tax Wale" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`;

    await transporter.sendMail({
      from,
      to: refereeEmail,
      subject: `${referrerName} has referred you to GST Tax Wale! 🎁`,
      html: `
        <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: auto; padding: 30px; background: #f8faff; border-radius: 12px;">
          <div style="background: #002B49; padding: 24px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">GST Tax Wale</h1>
            <p style="color: #93c5fd; margin: 8px 0 0 0; font-size: 14px;">You've been invited!</p>
          </div>

          <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e9f0;">
            <h2 style="color: #002B49;">Hi ${refereeName}! 👋</h2>
            <p style="color: #4b5e74; line-height: 1.7;">
              Your friend <strong>${referrerName}</strong> has referred you to <strong>GST Tax Wale</strong> — India's trusted platform for GST filings, Income Tax Returns, and compliance services.
            </p>

            <div style="background: #fffbeb; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 20px; margin: 24px 0;">
              <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 12px; text-transform: uppercase; font-weight: bold; letter-spacing: 1px;">Use this Referral Code</p>
              <p style="font-family: monospace; font-size: 28px; font-weight: 900; color: #d97706; margin: 0; letter-spacing: 4px;">${referralCode}</p>
            </div>

            <p style="color: #4b5e74; line-height: 1.7;">
              Our team of qualified Chartered Accountants can assist you with:
            </p>
            <ul style="color: #4b5e74; line-height: 2;">
              <li>GST Registration & Filing</li>
              <li>Income Tax Return (ITR) Filing</li>
              <li>Notices & Compliance Management</li>
              <li>Bookkeeping & Accounting</li>
            </ul>

            <div style="text-align: center; margin: 28px 0;">
              <a href="https://gsttaxwale.com/contact" 
                 style="background: #002B49; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">
                Get Started Today
              </a>
            </div>

            <p style="color: #6b7280; font-size: 13px; line-height: 1.6;">
              📞 Call us: <strong>7870778771</strong> | <strong>6182313455</strong><br/>
              📧 Email: <strong>help@gsttaxwale.com</strong><br/>
              🕐 Hours: Mon–Sat, 10 AM – 6 PM IST
            </p>

            <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
            <p style="font-size: 12px; color: #9ca3af; text-align: center;">
              &copy; ${new Date().getFullYear()} GST Tax Wale. All rights reserved.
            </p>
          </div>
        </div>
      `,
    });
    console.log(`📧 Referral invite sent to referee: ${refereeEmail}`);
    return true;
  } catch (err) {
    console.error('sendRefereeEmail error:', err);
    return false;
  }
}

/**
 * Directly generate a referral code and store all details in DB
 */
async function generatePublicReferral(req, res) {
  try {
    const { name, email, phone, refereeName, refereeEmail, refereePhone } = req.body;

    if (!name || !email || !phone) {
      return res.status(400).json(errorResponse('Name, email and phone are required'));
    }

    if (!refereeName || !refereeEmail || !refereePhone) {
      return res.status(400).json(errorResponse('Friend\'s name, email and phone are required'));
    }

    // 1. Find or create referrer user (WITHOUT 'active' column)
    let user = await db.findOne('User', { email });
    if (!user) {
      user = await db.findOne('User', { phone });
    }

    let referralCode;
    let userId;

    if (user) {
      userId = user.id;
      if (user.referral_code) {
        referralCode = user.referral_code;
      } else {
        referralCode = generateCode(user.name, user.phone);
        await db.update('User', { referral_code: referralCode }, { id: user.id });
      }
    } else {
      // Create a pending lead user for the referrer (no 'active' column)
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
        createdAt: new Date(),
        updatedAt: new Date()
      });
      userId = newUser.id;
    }

    // 2. Find or create referee user (WITHOUT 'active' column)
    let refereeUser = await db.findOne('User', { email: refereeEmail });
    if (!refereeUser) {
      refereeUser = await db.findOne('User', { phone: refereePhone });
    }

    let refereeId;
    if (refereeUser) {
      refereeId = refereeUser.id;
    } else {
      const dummyPassword = 'TEMP_' + Math.random().toString(36).slice(-8);
      const newReferee = await db.create('User', {
        name: refereeName,
        email: refereeEmail,
        phone: refereePhone,
        password: dummyPassword,
        role: 'user',
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      });
      refereeId = newReferee.id;
    }

    // 3. Create Referral record if not already existing
    const [existingReferral] = await db.query(
      'SELECT id FROM Referral WHERE referrerId = ? AND refereeEmail = ?',
      [userId, refereeEmail]
    );

    if (!existingReferral) {
      await db.create('Referral', {
        referrerId: userId,
        refereeId,
        refereeEmail,
        refereePhone,
        referralStatus: 'pending',
        commissionPercent: 10,
        commissionAmount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    // 4. Send emails (non-blocking — don't fail the request if email fails)
    Promise.all([
      sendReferrerEmail(email, name, refereeName, referralCode),
      sendRefereeEmail(refereeEmail, refereeName, name, referralCode),
    ]).catch(err => console.error('Email notification error:', err));

    // 5. Track event
    try {
      await ReferralService.trackEvent(userId, null, 'click', {
        action: 'generate_public_code',
        source: 'contact_page'
      });
    } catch (trackErr) {
      console.warn('ReferralService.trackEvent failed (non-fatal):', trackErr.message);
    }

    return res.status(200).json(
      successResponse({ referralCode }, 'Referral submitted successfully! A confirmation email has been sent.')
    );
  } catch (error) {
    console.error('❌ Referral generation error:', error);
    return res.status(500).json(errorResponse('Failed to generate referral code: ' + error.message));
  }
}

module.exports = {
  generatePublicReferral
};
