/**
 * adminEmailService.js
 * Central service for all admin-action email notifications to users.
 * All emails are sent from help@gsttaxwale.com via Hostinger SMTP.
 */
const nodemailer = require('nodemailer');

function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '465', 10),
    secure: process.env.SMTP_SECURE === 'true' || process.env.SMTP_PORT === '465',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

const FROM = () =>
  `"${process.env.SMTP_FROM_NAME || 'GST Tax Wale'}" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`;

const SITE = 'https://gsttaxwale.com';
const YEAR = new Date().getFullYear();

const footer = `
  <hr style="border:0;border-top:1px solid #e5e7eb;margin:28px 0;" />
  <p style="font-size:11px;color:#9ca3af;text-align:center;">
    &copy; ${YEAR} GST Tax Wale &bull; <a href="${SITE}" style="color:#9ca3af;">${SITE}</a>
  </p>
`;

const header = (accent = '#2563EB', tagline = '') => `
  <div style="background:${accent};padding:24px 32px;border-radius:10px 10px 0 0;text-align:center;">
    <h1 style="color:#fff;margin:0;font-size:22px;font-family:sans-serif;">GST Tax Wale</h1>
    ${tagline ? `<p style="color:rgba(255,255,255,.7);margin:6px 0 0;font-size:13px;">${tagline}</p>` : ''}
  </div>
`;

async function send(to, subject, html) {
  try {
    const transporter = createTransporter();
    await transporter.sendMail({ from: FROM(), to, subject, html });
    console.log(`📧 [adminEmailService] Sent "${subject}" → ${to}`);
    return true;
  } catch (err) {
    console.error(`📧 [adminEmailService] Failed to send "${subject}" → ${to}:`, err.message);
    return false;
  }
}

/* ─────────────────────────────────────────────────
   1. ACCOUNT CREATED
───────────────────────────────────────────────── */
async function sendAccountCreatedEmail(email, name, password, referenceNumber, referralCode) {
  const subject = '🎉 Your GST Tax Wale Account is Ready';
  const html = `
    <div style="font-family:'Segoe UI',sans-serif;max-width:600px;margin:auto;background:#f8faff;padding:30px;border-radius:12px;">
      ${header('#2563EB', 'Account Created')}
      <div style="background:#fff;padding:30px;border-radius:0 0 10px 10px;border:1px solid #e5e9f0;">
        <h2 style="color:#1e3a5f;margin-top:0;">Welcome, ${name}! 👋</h2>
        <p style="color:#4b5e74;line-height:1.7;">
          Your account has been created by the GST Tax Wale team. Below are your login credentials:
        </p>
        <div style="background:#f0f7ff;border-left:4px solid #2563EB;border-radius:8px;padding:20px;margin:20px 0;">
          <p style="margin:4px 0;color:#374151;"><strong>Login Email:</strong> ${email}</p>
          <p style="margin:4px 0;color:#374151;"><strong>Password:</strong> <code style="font-family:monospace;font-size:15px;font-weight:700;color:#2563eb;">${password}</code></p>
          <p style="margin:4px 0;color:#374151;"><strong>Reference No.:</strong> ${referenceNumber}</p>
          ${referralCode ? `<p style="margin:4px 0;color:#374151;"><strong>Referral Code:</strong> <code style="font-family:monospace;font-weight:700;color:#7c3aed;">${referralCode}</code></p>` : ''}
        </div>
        <p style="color:#ef4444;font-size:13px;font-weight:600;">⚠️ Please change your password immediately after your first login.</p>
        <div style="text-align:center;margin:24px 0;">
          <a href="${SITE}/auth/login" style="background:#2563EB;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:700;font-size:15px;">Log In Now</a>
        </div>
        ${footer}
      </div>
    </div>`;
  return send(email, subject, html);
}

/* ─────────────────────────────────────────────────
   2. PASSWORD RESET BY ADMIN
───────────────────────────────────────────────── */
async function sendPasswordResetEmail(email, name, newPassword) {
  const subject = '🔑 Your Password has been Reset — GST Tax Wale';
  const html = `
    <div style="font-family:'Segoe UI',sans-serif;max-width:600px;margin:auto;background:#f8faff;padding:30px;border-radius:12px;">
      ${header('#dc2626', 'Security Notice')}
      <div style="background:#fff;padding:30px;border-radius:0 0 10px 10px;border:1px solid #e5e9f0;">
        <h2 style="color:#1e3a5f;margin-top:0;">Hi ${name},</h2>
        <p style="color:#4b5e74;line-height:1.7;">
          An administrator has reset your account password. Your new temporary password is:
        </p>
        <div style="background:#fef2f2;border-left:4px solid #dc2626;border-radius:8px;padding:20px;margin:20px 0;text-align:center;">
          <p style="margin:0 0 6px;color:#6b7280;font-size:12px;text-transform:uppercase;font-weight:700;letter-spacing:1px;">New Password</p>
          <code style="font-family:monospace;font-size:24px;font-weight:900;color:#dc2626;letter-spacing:3px;">${newPassword}</code>
        </div>
        <p style="color:#4b5e74;font-size:13px;">Please log in and change your password immediately. If you did not request this, contact our support team.</p>
        <div style="text-align:center;margin:24px 0;">
          <a href="${SITE}/auth/login" style="background:#dc2626;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:700;">Log In & Change Password</a>
        </div>
        ${footer}
      </div>
    </div>`;
  return send(email, subject, html);
}

/* ─────────────────────────────────────────────────
   3. PROFILE UPDATED BY ADMIN
───────────────────────────────────────────────── */
async function sendProfileUpdatedEmail(email, name) {
  const subject = '✏️ Your Profile has been Updated — GST Tax Wale';
  const html = `
    <div style="font-family:'Segoe UI',sans-serif;max-width:600px;margin:auto;background:#f8faff;padding:30px;border-radius:12px;">
      ${header('#0891b2', 'Profile Update')}
      <div style="background:#fff;padding:30px;border-radius:0 0 10px 10px;border:1px solid #e5e9f0;">
        <h2 style="color:#1e3a5f;margin-top:0;">Hi ${name},</h2>
        <p style="color:#4b5e74;line-height:1.7;">
          Your account profile on GST Tax Wale has been updated by an administrator. Your latest details are now saved in the system.
        </p>
        <p style="color:#4b5e74;line-height:1.7;">
          If you did not expect this change or have any questions, please reach out to our support team at <a href="mailto:help@gsttaxwale.com" style="color:#0891b2;">help@gsttaxwale.com</a>.
        </p>
        <div style="text-align:center;margin:24px 0;">
          <a href="${SITE}/dashboard/settings" style="background:#0891b2;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:700;">View My Profile</a>
        </div>
        ${footer}
      </div>
    </div>`;
  return send(email, subject, html);
}

/* ─────────────────────────────────────────────────
   4. DOCUMENT UPLOADED BY ADMIN
───────────────────────────────────────────────── */
async function sendDocumentUploadedEmail(email, name, documents) {
  // documents = [{ title, category, fiscalYear, month }]
  const subject = `📄 ${documents.length} New Document${documents.length > 1 ? 's' : ''} Uploaded — GST Tax Wale`;
  const docRows = documents.map(d => `
    <tr>
      <td style="padding:8px 12px;border-bottom:1px solid #f3f4f6;color:#374151;font-size:14px;">${d.title || d.fileName || 'Document'}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #f3f4f6;color:#374151;font-size:14px;">${d.category?.toUpperCase() || '—'}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #f3f4f6;color:#374151;font-size:14px;">${d.fiscalYear || '—'}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #f3f4f6;color:#374151;font-size:14px;">${d.month || 'General'}</td>
    </tr>`).join('');

  const html = `
    <div style="font-family:'Segoe UI',sans-serif;max-width:620px;margin:auto;background:#f8faff;padding:30px;border-radius:12px;">
      ${header('#059669', 'New Documents Available')}
      <div style="background:#fff;padding:30px;border-radius:0 0 10px 10px;border:1px solid #e5e9f0;">
        <h2 style="color:#1e3a5f;margin-top:0;">Hi ${name}, 📂</h2>
        <p style="color:#4b5e74;line-height:1.7;">
          The GST Tax Wale team has uploaded <strong>${documents.length} document${documents.length > 1 ? 's' : ''}</strong> to your account. You can view and download them from your dashboard.
        </p>
        <table style="width:100%;border-collapse:collapse;margin:20px 0;border-radius:8px;overflow:hidden;border:1px solid #e5e7eb;">
          <thead>
            <tr style="background:#f0fdf4;">
              <th style="padding:10px 12px;text-align:left;font-size:12px;color:#059669;text-transform:uppercase;letter-spacing:1px;">Document</th>
              <th style="padding:10px 12px;text-align:left;font-size:12px;color:#059669;text-transform:uppercase;letter-spacing:1px;">Category</th>
              <th style="padding:10px 12px;text-align:left;font-size:12px;color:#059669;text-transform:uppercase;letter-spacing:1px;">FY</th>
              <th style="padding:10px 12px;text-align:left;font-size:12px;color:#059669;text-transform:uppercase;letter-spacing:1px;">Month</th>
            </tr>
          </thead>
          <tbody>${docRows}</tbody>
        </table>
        <div style="text-align:center;margin:24px 0;">
          <a href="${SITE}/dashboard/documents" style="background:#059669;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:700;">View My Documents</a>
        </div>
        ${footer}
      </div>
    </div>`;
  return send(email, subject, html);
}

/* ─────────────────────────────────────────────────
   5. STATUS CHANGE (e.g. Account activated/deactivated)
───────────────────────────────────────────────── */
async function sendStatusChangedEmail(email, name, newStatus) {
  const isActive = newStatus === 'active';
  const accent = isActive ? '#059669' : '#dc2626';
  const subject = `Account ${isActive ? 'Activated ✅' : 'Deactivated ⛔'} — GST Tax Wale`;
  const html = `
    <div style="font-family:'Segoe UI',sans-serif;max-width:600px;margin:auto;background:#f8faff;padding:30px;border-radius:12px;">
      ${header(accent, 'Account Status Update')}
      <div style="background:#fff;padding:30px;border-radius:0 0 10px 10px;border:1px solid #e5e9f0;">
        <h2 style="color:#1e3a5f;margin-top:0;">Hi ${name},</h2>
        <p style="color:#4b5e74;line-height:1.7;">
          Your GST Tax Wale account status has been updated to <strong style="color:${accent};">${newStatus.toUpperCase()}</strong> by an administrator.
        </p>
        ${isActive
          ? `<p style="color:#4b5e74;">You can now log in and access all services on your dashboard.</p>`
          : `<p style="color:#4b5e74;">If you believe this is an error, please contact support at <a href="mailto:help@gsttaxwale.com" style="color:#dc2626;">help@gsttaxwale.com</a>.</p>`
        }
        <div style="text-align:center;margin:24px 0;">
          <a href="${SITE}/auth/login" style="background:${accent};color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:700;">Go to Dashboard</a>
        </div>
        ${footer}
      </div>
    </div>`;
  return send(email, subject, html);
}

/* ─────────────────────────────────────────────────
   6. DOCUMENT DELETED BY ADMIN
───────────────────────────────────────────────── */
async function sendDocumentDeletedEmail(email, name, docTitle, category, fiscalYear) {
  const subject = `🗑️ A Document has been Removed — GST Tax Wale`;
  const html = `
    <div style="font-family:'Segoe UI',sans-serif;max-width:600px;margin:auto;background:#f8faff;padding:30px;border-radius:12px;">
      ${header('#6b7280', 'Document Removed')}
      <div style="background:#fff;padding:30px;border-radius:0 0 10px 10px;border:1px solid #e5e9f0;">
        <h2 style="color:#1e3a5f;margin-top:0;">Hi ${name},</h2>
        <p style="color:#4b5e74;line-height:1.7;">
          The following document has been removed from your account by an administrator:
        </p>
        <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin:20px 0;">
          <p style="margin:4px 0;color:#374151;"><strong>Document:</strong> ${docTitle || 'Document'}</p>
          <p style="margin:4px 0;color:#374151;"><strong>Category:</strong> ${category?.toUpperCase() || '—'}</p>
          <p style="margin:4px 0;color:#374151;"><strong>Fiscal Year:</strong> ${fiscalYear || '—'}</p>
        </div>
        <p style="color:#4b5e74;font-size:13px;">If you have questions, contact <a href="mailto:help@gsttaxwale.com" style="color:#6b7280;">help@gsttaxwale.com</a>.</p>
        ${footer}
      </div>
    </div>`;
  return send(email, subject, html);
}

module.exports = {
  sendAccountCreatedEmail,
  sendPasswordResetEmail,
  sendProfileUpdatedEmail,
  sendDocumentUploadedEmail,
  sendStatusChangedEmail,
  sendDocumentDeletedEmail,
};
