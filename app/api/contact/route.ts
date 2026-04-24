// API Route: Contact Form
// Endpoint: /api/contact
// Methods: POST (submit contact form)

import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { prisma } from '@/lib/prisma';

/**
 * Initialize email transporter
 */
const getTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });
};

/**
 * POST /api/contact
 * Submit contact form
 * Body: { name: string, email: string, phone?: string, subject: string, message: string }
 * No authentication required
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, subject, message } = body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        {
          error: 'Missing required fields: name, email, subject, message',
        },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Check message length
    if (message.length < 10 || message.length > 5000) {
      return NextResponse.json(
        { error: 'Message must be between 10 and 5000 characters' },
        { status: 400 }
      );
    }

    // Save to database
    const contact = await prisma.contact.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        phone: phone?.trim(),
        subject: subject.trim(),
        message: message.trim(),
        status: 'unread',
      },
    });

    // Try to send email notification to admin
    const emailSent = await sendAdminNotification(name, email, phone, subject, message);

    // Also send confirmation email to user
    const confirmationSent = await sendUserConfirmation(name, email);

    return NextResponse.json(
      {
        status: 'success',
        message: 'Thank you for contacting us. We will get back to you soon.',
        data: {
          contactId: contact.id,
          submitted: true,
          adminNotified: emailSent,
          confirmationSent: confirmationSent,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/contact error:', error);

    return NextResponse.json(
      {
        error: 'Failed to submit contact form',
        message: process.env.NODE_ENV === 'development' ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
}

/**
 * Send email notification to admin
 */
async function sendAdminNotification(
  name: string,
  email: string,
  phone: string | undefined,
  subject: string,
  message: string
): Promise<boolean> {
  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
      console.warn('Email credentials not configured');
      return false;
    }

    const transporter = getTransporter();

    const adminEmail = process.env.SMTP_FROM_EMAIL || 'admin@yourdomain.com';

    await transporter.sendMail({
      from: process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER,
      to: adminEmail,
      replyTo: email,
      subject: `New Contact: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">New Contact Form Submission</h2>
          
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Name:</strong> ${escapeHtml(name)}</p>
            <p><strong>Email:</strong> ${escapeHtml(email)}</p>
            ${phone ? `<p><strong>Phone:</strong> ${escapeHtml(phone)}</p>` : ''}
            <p><strong>Subject:</strong> ${escapeHtml(subject)}</p>
            <p><strong>Message:</strong></p>
            <p style="white-space: pre-wrap;">${escapeHtml(message)}</p>
          </div>

          <p style="color: #666; font-size: 12px;">
            This is an automated message. Please reply to the sender's email address.
          </p>
        </div>
      `,
    });

    // Log email sent
    await prisma.emailLog.create({
      data: {
        to: adminEmail,
        subject: `New Contact: ${subject}`,
        type: 'contact_notification',
        status: 'sent',
      },
    }).catch(err => console.error('Failed to log email:', err));

    return true;
  } catch (error) {
    console.error('Failed to send admin notification:', error);

    // Log email failure
    await prisma.emailLog.create({
      data: {
        to: process.env.SMTP_FROM_EMAIL || 'admin@yourdomain.com',
        subject: `New Contact: ${subject}`,
        type: 'contact_notification',
        status: 'failed',
        errorMsg: String(error),
      },
    }).catch(err => console.error('Failed to log email error:', err));

    return false;
  }
}

/**
 * Send confirmation email to user
 */
async function sendUserConfirmation(name: string, email: string): Promise<boolean> {
  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
      console.warn('Email credentials not configured');
      return false;
    }

    const transporter = getTransporter();

    await transporter.sendMail({
      from: process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER,
      to: email,
      subject: 'We received your message',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Thank You, ${escapeHtml(name)}!</h2>
          
          <p>We've received your contact form submission and will get back to you as soon as possible.</p>

          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Your email:</strong> ${escapeHtml(email)}</p>
            <p style="margin: 0; color: #666; font-size: 12px;">We'll be in touch shortly.</p>
          </div>

          <p>Best regards,<br/>Tax Platform Team</p>
        </div>
      `,
    });

    // Log email sent
    await prisma.emailLog.create({
      data: {
        to: email,
        subject: 'We received your message',
        type: 'contact_confirmation',
        status: 'sent',
      },
    }).catch(err => console.error('Failed to log email:', err));

    return true;
  } catch (error) {
    console.error('Failed to send user confirmation:', error);

    // Log email failure
    await prisma.emailLog.create({
      data: {
        to: email,
        subject: 'We received your message',
        type: 'contact_confirmation',
        status: 'failed',
        errorMsg: String(error),
      },
    }).catch(err => console.error('Failed to log email error:', err));

    return false;
  }
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text: string): string {
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

/**
 * GET /api/contact?id=123
 * Get a specific contact submission (admin only)
 */
export async function GET(request: NextRequest) {
  try {
    // TODO: Add admin authentication check
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Contact ID is required' },
        { status: 400 }
      );
    }

    const contact = await prisma.contact.findUnique({
      where: { id: parseInt(id) },
    });

    if (!contact) {
      return NextResponse.json(
        { error: 'Contact not found' },
        { status: 404 }
      );
    }

    // Mark as read
    await prisma.contact.update({
      where: { id: parseInt(id) },
      data: { status: 'read' },
    });

    return NextResponse.json({
      status: 'success',
      data: { contact },
    });
  } catch (error) {
    console.error('GET /api/contact error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contact' },
      { status: 500 }
    );
  }
}
