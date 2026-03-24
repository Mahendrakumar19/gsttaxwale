// =============================================================================
// AUTH SERVICE - Authentication, JWT, OTP handling
// =============================================================================

import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { config } from '../config/index';
import prisma from '../utils/prisma';
import nodemailer from 'nodemailer';

// OTP configuration
const OTP_EXPIRY_MINUTES = 10;
const OTP_LENGTH = 6;

/**
 * Generate JWT token
 */
export function generateToken(userId: string, expiresIn?: string): string {
  return jwt.sign(
    { userId },
    config.jwt.secret,
    { expiresIn: expiresIn || config.jwt.expiry }
  );
}

/**
 * Verify JWT token
 */
export function verifyToken(token: string): { userId: string } | null {
  try {
    const decoded = jwt.verify(token, config.jwt.secret) as { userId: string };
    return decoded;
  } catch (error) {
    return null;
  }
}

/**
 * Hash password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Compare password with hash
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Generate OTP (6-digit random number)
 */
export function generateOTP(): string {
  return Math.floor(Math.random() * 999999)
    .toString()
    .padStart(OTP_LENGTH, '0');
}

/**
 * Send OTP via email
 */
export async function sendOTPEmail(email: string, otp: string): Promise<boolean> {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: config.smtp.user,
        pass: config.smtp.password
      }
    });

    const mailOptions = {
      from: config.smtp.from,
      to: email,
      subject: 'Tax Filing Platform - Verify Your Email',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Email Verification</h2>
          <p>Your OTP (One-Time Password) for Tax Filing Platform is:</p>
          <h1 style="color: #2563eb; font-size: 32px; letter-spacing: 5px;">${otp}</h1>
          <p>This OTP will expire in ${OTP_EXPIRY_MINUTES} minutes.</p>
          <p>If you didn't request this, please ignore this email.</p>
          <hr>
          <p style="color: #666; font-size: 12px;">
            © ${new Date().getFullYear()} Tax Filing Platform. All rights reserved.
          </p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Failed to send OTP email:', error);
    return false;
  }
}

/**
 * Create and save OTP for user
 */
export async function createOTP(userId: string): Promise<string | null> {
  try {
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    // Delete existing OTP
    await prisma.oTP.deleteMany({ where: { userId } });

    // Create new OTP
    await prisma.oTP.create({
      data: {
        userId,
        code: otp,
        expiresAt,
        verified: false
      }
    });

    return otp;
  } catch (error) {
    console.error('Failed to create OTP:', error);
    return null;
  }
}

/**
 * Verify OTP
 */
export async function verifyOTP(userId: string, code: string): Promise<boolean> {
  try {
    const otp = await prisma.oTP.findUnique({
      where: { userId }
    });

    if (!otp) {
      return false;
    }

    // Check if OTP has expired
    if (otp.expiresAt < new Date()) {
      return false;
    }

    // Check if code matches
    if (otp.code !== code) {
      return false;
    }

    // Mark as verified
    await prisma.oTP.update({
      where: { userId },
      data: { verified: true }
    });

    return true;
  } catch (error) {
    console.error('Failed to verify OTP:', error);
    return false;
  }
}

/**
 * Validate PAN number format
 */
export function validatePAN(pan: string): boolean {
  // Indian PAN format: AAAAA0000A
  // 5 letters + 4 digits + 1 letter
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  return panRegex.test(pan.toUpperCase());
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Create user with PAN
 */
export async function createUserWithPAN(
  email: string,
  pan: string,
  name: string,
  password?: string
): Promise<any> {
  try {
    // Validate PAN format
    if (!validatePAN(pan)) {
      throw new Error('Invalid PAN format');
    }

    // Validate email format
    if (!validateEmail(email)) {
      throw new Error('Invalid email format');
    }

    // Check if PAN already exists
    const existingPAN = await prisma.user.findUnique({
      where: { pan: pan.toUpperCase() }
    });

    if (existingPAN) {
      throw new Error('PAN already registered');
    }

    // Check if email already exists
    const existingEmail = await prisma.user.findUnique({
      where: { email }
    });

    if (existingEmail) {
      throw new Error('Email already registered');
    }

    // Hash password if provided
    let hashedPassword = null;
    if (password) {
      hashedPassword = await hashPassword(password);
    }

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        name,
        pan: pan.toUpperCase(),
        password: hashedPassword
      }
    });

    return user;
  } catch (error) {
    throw error;
  }
}

export default {
  generateToken,
  verifyToken,
  hashPassword,
  comparePassword,
  generateOTP,
  sendOTPEmail,
  createOTP,
  verifyOTP,
  validatePAN,
  validateEmail,
  createUserWithPAN
};
