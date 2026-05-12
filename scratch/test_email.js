const nodemailer = require('nodemailer');

async function sendTestEmail() {
  console.log('🚀 Starting SMTP Test...');
  
  const transporter = nodemailer.createTransport({
    host: 'smtp.hostinger.com',
    port: 465,
    secure: true, // true for 465
    auth: {
      user: 'help@gsttaxwale.com',
      pass: 'GTW@gtw@2026',
    },
  });

  const mailOptions = {
    from: '"GST Tax Wale" <help@gsttaxwale.com>',
    to: 'mahendra@nighwantech.com',
    subject: 'SMTP Test - GST Tax Wale',
    text: 'This is a test email to verify SMTP configuration.',
    html: '<b>This is a test email to verify SMTP configuration.</b>',
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully!');
    console.log('Message ID:', info.messageId);
  } catch (error) {
    console.error('❌ Failed to send email:', error);
  }
}

sendTestEmail();
