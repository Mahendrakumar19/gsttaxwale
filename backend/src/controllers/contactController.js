const db = require('../utils/db');
const prisma = require('../utils/prisma');
const { successResponse, errorResponse } = require('../utils/helpers');
const nodemailer = require('nodemailer');

/**
 * Handle public contact form submission
 * Creates a ticket and sends email to help@gsttaxwale.com
 */
async function handleContactForm(req, res) {
  try {
    const { name, email, message, phone } = req.body;
    let userId = req.userId || (req.user ? req.user.id : null);

    if (!name || !email || !message) {
      return res.status(400).json(errorResponse('Name, email and message are required'));
    }

    // Fallback: If not logged in, dynamically associate the ticket to the first user
    // in the database to prevent foreign key constraint violations if ID 1 doesn't exist
    if (!userId) {
      const firstUser = await prisma.user.findFirst({
        orderBy: { id: 'asc' }
      });
      userId = firstUser ? firstUser.id : 1;
    }

    // 1. Create a Support Ticket in the system
    const ticket = await prisma.supportTicket.create({
      data: {
        User: {
          connect: { id: userId }
        },
        subject: `Contact Form: ${name}`,
        description: `Name: ${name}\nEmail: ${email}\nPhone: ${phone || 'N/A'}\n\nMessage:\n${message}`,
        category: 'support',
        priority: 'medium',
        status: 'open',
        updatedAt: new Date()
      }
    });

    // 2. Prepare email transporters (resilient to email server down times)
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        secure: process.env.SMTP_SECURE === 'true' || process.env.SMTP_PORT === '465',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      const fromName = process.env.SMTP_FROM_NAME || 'GST Tax Wale Support';
      const fromEmail = process.env.SMTP_FROM || process.env.SMTP_USER;

      // 3. Send email to admin (help@gsttaxwale.com)
      await transporter.sendMail({
        from: `"${fromName}" <${fromEmail}>`,
        to: 'help@gsttaxwale.com',
        replyTo: email,
        subject: `[Support Ticket #${ticket.id}] New Query from ${name}`,
        html: `
          <div style="font-family: sans-serif; padding: 20px; color: #333;">
            <h2 style="color: #2563eb;">New Support Query</h2>
            <p>A new query has been submitted via the contact form.</p>
            
            <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>Name:</strong> ${name}</p>
              <p style="margin: 5px 0;"><strong>Email:</strong> ${email}</p>
              <p style="margin: 5px 0;"><strong>Phone:</strong> ${phone || 'N/A'}</p>
              <p style="margin: 5px 0;"><strong>Ticket ID:</strong> <span style="font-family: monospace;">${ticket.id}</span></p>
            </div>
            
            <div style="border-left: 4px solid #2563eb; padding-left: 15px; margin: 20px 0;">
              <p style="font-weight: bold; margin-bottom: 5px;">Message:</p>
              <p style="white-space: pre-wrap;">${message}</p>
            </div>
            
            <p style="font-size: 0.9em; color: #6b7280;">
              This ticket has been logged in the admin panel. You can respond to the user at ${email}.
            </p>
          </div>
        `
      });

      // 4. Send email to user confirming registration
      await transporter.sendMail({
        from: `"${fromName}" <${fromEmail}>`,
        to: email,
        subject: `Your request is registered - GST Tax Wale [Ticket #${ticket.id}]`,
        html: `
          <div style="font-family: sans-serif; padding: 25px; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
            <div style="text-align: center; margin-bottom: 25px;">
              <h2 style="color: #2563eb; margin: 0; font-size: 24px;">GST Tax Wale</h2>
              <p style="color: #64748b; font-size: 14px; margin: 5px 0 0 0;">Inquiry Registered Successfully</p>
            </div>
            
            <p style="font-size: 16px; line-height: 1.6;">Dear <strong>${name}</strong>,</p>
            
            <p style="font-size: 15px; line-height: 1.6; color: #334155;">
              Thank you for contacting GST Tax Wale. Your request has been successfully registered. Our team of tax experts will review your query and get in touch with you shortly.
            </p>
            
            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 20px; border-radius: 8px; margin: 25px 0;">
              <h3 style="margin-top: 0; color: #0f172a; font-size: 16px;">Ticket Details:</h3>
              <p style="margin: 5px 0; font-size: 14px;"><strong>Ticket ID:</strong> <span style="font-family: monospace; font-weight: bold; color: #2563eb;">#${ticket.id}</span></p>
              <p style="margin: 5px 0; font-size: 14px;"><strong>Category:</strong> Support / Contact Inquiry</p>
              <p style="margin: 5px 0; font-size: 14px;"><strong>Status:</strong> Open / Registered</p>
            </div>
            
            <p style="font-size: 15px; line-height: 1.6; color: #334155;">
              Our support team will contact you soon. If you have any additional information to add, you can reply directly to this email.
            </p>
            
            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
            
            <p style="font-size: 13px; line-height: 1.5; color: #64748b; text-align: center;">
              <strong>GST Tax Wale Support</strong><br />
              Email: <a href="mailto:help@gsttaxwale.com" style="color: #2563eb; text-decoration: none;">help@gsttaxwale.com</a><br />
              Website: <a href="https://gsttaxwale.com" style="color: #2563eb; text-decoration: none;">www.gsttaxwale.com</a>
            </p>
          </div>
        `
      });

      console.log(`✉️ Confirmation and notification emails sent successfully for ticket #${ticket.id}`);
    } catch (emailErr) {
      console.error('⚠️ Nodemailer email dispatch failed (but ticket is saved):', emailErr);
    }

    console.log(`✅ Contact form ticket created: #${ticket.id}`);

    return res.status(200).json(
      successResponse({ ticketId: ticket.id }, 'Message sent successfully. Our team will get back to you soon.')
    );
  } catch (error) {
    console.error('❌ Contact form error:', error);
    return res.status(500).json(errorResponse('Failed to send message: ' + error.message));
  }
}

module.exports = {
  handleContactForm
};
