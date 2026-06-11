/**
 * Quick SMTP test — sends a test email from help@gsttaxwale.com
 * Run: node scratch/test_email.js
 */
const nodemailer = require('nodemailer');

const SMTP_HOST = 'smtp.hostinger.com';
const SMTP_PORT = 465;
const SMTP_USER = 'help@gsttaxwale.com';
const SMTP_PASS = 'GTW@gtw@2026';
const TO_EMAIL  = 'mahendrakumaruohyd@gmail.com';

async function main() {
  console.log('🔧 Creating transporter...');
  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: true,          // port 465 → SSL
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
    logger: true,          // print SMTP dialogue
    debug: true,
  });

  console.log('🔍 Verifying SMTP connection...');
  try {
    await transporter.verify();
    console.log('✅ SMTP connection OK — credentials are valid');
  } catch (err) {
    console.error('❌ SMTP verify failed:', err.message);
    process.exit(1);
  }

  console.log(`📤 Sending test email to ${TO_EMAIL}...`);
  try {
    const info = await transporter.sendMail({
      from: `"GST Tax Wale" <${SMTP_USER}>`,
      to: TO_EMAIL,
      subject: '✅ GST Tax Wale — Email Test',
      html: `
        <div style="font-family: sans-serif; max-width: 500px; margin: auto; padding: 30px; border: 1px solid #e5e7eb; border-radius: 12px;">
          <h2 style="color: #002B49;">GST Tax Wale — Test Email</h2>
          <p style="color: #4b5e74;">This is a test email to confirm that SMTP delivery from <strong>help@gsttaxwale.com</strong> is working correctly.</p>
          <p style="color: #6b7280; font-size: 13px;">Sent at: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
          <p style="font-size: 12px; color: #9ca3af; text-align: center;">© ${new Date().getFullYear()} GST Tax Wale</p>
        </div>
      `,
    });
    console.log('✅ Email sent successfully!');
    console.log('   Message ID :', info.messageId);
    console.log('   Accepted   :', info.accepted);
    console.log('   Rejected   :', info.rejected);
  } catch (err) {
    console.error('❌ Send failed:', err.message);
    console.error('   Code      :', err.code);
    console.error('   Response  :', err.response);
  }
}

main();
