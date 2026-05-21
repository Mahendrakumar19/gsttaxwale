const nodemailer = require('nodemailer');

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

function getFromAddress() {
  const fromName = process.env.SMTP_FROM_NAME || 'GST Tax Wale';
  const fromEmail = process.env.SMTP_FROM || process.env.SMTP_USER;
  return `"${fromName}" <${fromEmail}>`;
}

function getClientUrl() {
  return process.env.CLIENT_URL || 'https://gsttaxwale.com';
}

/**
 * Send invite email to the referred person
 */
async function sendReferralInviteEmail(referredEmail, referrerName, referralId) {
  try {
    const transporter = createTransporter();
    const from = getFromAddress();
    const clientUrl = getClientUrl();

    await transporter.sendMail({
      from,
      to: referredEmail,
      subject: `${referrerName} referred you to GSTTaxWale 🎉`,
      html: `
        <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: auto; padding: 30px; background: #f8faff; border-radius: 12px;">
          <div style="background: #002B49; padding: 24px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">GST Tax Wale</h1>
            <p style="color: #93c5fd; margin: 8px 0 0 0; font-size: 14px;">Special Invitation</p>
          </div>

          <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e9f0;">
            <h2 style="color: #002B49;">Hello! 👋</h2>
            <p style="color: #4b5e74; line-height: 1.7;">
              Your friend <strong>${referrerName}</strong> has referred you to <strong>GST Tax Wale</strong> — India's trusted platform for GST filings, Income Tax Returns, and business compliance.
            </p>

            <div style="background: #fffbeb; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 20px; margin: 24px 0;">
              <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 12px; text-transform: uppercase; font-weight: bold; letter-spacing: 1px;">Referral ID</p>
              <p style="font-family: monospace; font-size: 24px; font-weight: 900; color: #d97706; margin: 0; letter-spacing: 2px;">${referralId}</p>
            </div>

            <p style="color: #4b5e74; line-height: 1.7;">
              Get dedicated chartered accountants to manage:
            </p>
            <ul style="color: #4b5e74; line-height: 2;">
              <li>GST Registration & Monthly Filings</li>
              <li>Income Tax Return (ITR) filing</li>
              <li>Company & LLP Registrations</li>
              <li>Notices & Compliance Management</li>
            </ul>

            <div style="text-align: center; margin: 28px 0;">
              <a href="${clientUrl}/ref/${referralId}" 
                 style="background: #002B49; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">
                Complete Registration
              </a>
            </div>

            <p style="color: #6b7280; font-size: 13px; line-height: 1.6;">
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
    console.log(`📧 Referral invite sent to referee: ${referredEmail}`);
    return true;
  } catch (err) {
    console.error('sendReferralInviteEmail error:', err);
    return false;
  }
}

/**
 * Send referral confirmation to the referrer
 */
async function sendReferrerConfirmationEmail(referrerEmail, referrerName, refereeName, referralCode) {
  try {
    const transporter = createTransporter();
    const from = getFromAddress();
    const clientUrl = getClientUrl();

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
              <a href="${clientUrl}/contact" 
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
    console.error('sendReferrerConfirmationEmail error:', err);
    return false;
  }
}

/**
 * Send temporary credentials to a converted customer
 */
async function sendOnboardingCredentialsEmail(email, name, temporaryPassword) {
  try {
    const transporter = createTransporter();
    const from = getFromAddress();
    const clientUrl = getClientUrl();

    await transporter.sendMail({
      from,
      to: email,
      subject: `Welcome to GST Tax Wale – Your Account Credentials`,
      html: `
        <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: auto; padding: 30px; background: #f8faff; border-radius: 12px;">
          <div style="background: #002B49; padding: 24px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">GST Tax Wale</h1>
            <p style="color: #93c5fd; margin: 8px 0 0 0; font-size: 14px;">Welcome on Board!</p>
          </div>

          <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e9f0;">
            <h2 style="color: #002B49;">Welcome ${name}! 👋</h2>
            <p style="color: #4b5e74; line-height: 1.7;">
              An account has been created for you on GST Tax Wale. You can now log in to access your user panel, manage documents, purchase services, and track filings.
            </p>

            <div style="background: #f0f7ff; border-left: 4px solid #002B49; border-radius: 8px; padding: 20px; margin: 24px 0;">
              <p style="margin: 0; color: #4b5e74; font-size: 14px;"><strong>Username/Email:</strong> ${email}</p>
              <p style="margin: 8px 0 0 0; color: #4b5e74; font-size: 14px;"><strong>Temporary Password:</strong> <code style="font-family: monospace; font-size: 16px; font-weight: 700; color: #2563eb;">${temporaryPassword}</code></p>
            </div>

            <p style="color: #4b5e74; line-height: 1.7; font-size: 13px;">
              * For security reasons, we strongly recommend changing your password after your first login.
            </p>

            <div style="text-align: center; margin: 28px 0;">
              <a href="${clientUrl}/login" 
                 style="background: #002B49; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">
                Log In to User Panel
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
    console.log(`📧 Onboarding credentials email sent to: ${email}`);
    return true;
  } catch (err) {
    console.error('sendOnboardingCredentialsEmail error:', err);
    return false;
  }
}

module.exports = {
  sendReferralInviteEmail,
  sendReferrerConfirmationEmail,
  sendOnboardingCredentialsEmail
};
