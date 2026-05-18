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
    const { name, email, message } = req.body;
    const userId = req.user ? req.user.id : 1; // Fallback to user ID 1 for guests

    if (!name || !email || !message) {
      return res.status(400).json(errorResponse('Name, email and message are required'));
    }

    // 1. Create a Support Ticket in the system
    const ticket = await prisma.supportTicket.create({
      data: {
        userId: userId,
        subject: `Contact Form: ${name}`,
        description: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
        category: 'support',
        priority: 'medium',
        status: 'open'
      }
    });

    // 2. Send email to help@gsttaxwale.com
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const fromName = process.env.SMTP_FROM_NAME || 'GST Tax Wale Support';
    const fromEmail = process.env.SMTP_FROM || process.env.SMTP_USER;

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
