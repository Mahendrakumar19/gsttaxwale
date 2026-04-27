const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const prisma = require('../utils/prisma');
const { validateEmail, APIError } = require('../utils/helpers');

const OTP_EXPIRY_MINUTES = 10;

async function hashPassword(password) {
  const rounds = parseInt(process.env.BCRYPT_ROUNDS || '10', 10);
  return await bcrypt.hash(password, rounds);
}

async function comparePassword(password, hashed) {
  return await bcrypt.compare(password, hashed);
}

function generateToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRY || '7d' });
}

function verifyToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return null;
  }
}

function generateOTP() {
  return Math.floor(Math.random() * 999999).toString().padStart(6, '0');
}

async function sendOTPEmail(email, otp) {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: email,
      subject: `Your OTP for ${process.env.NEXT_PUBLIC_APP_NAME || 'GST Tax Wale'}`,
      text: `Your OTP is ${otp}. It expires in ${OTP_EXPIRY_MINUTES} minutes.`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
          <h2>Login Verification</h2>
          <p>Your One-Time Password (OTP) is:</p>
          <div style="font-size: 32px; font-weight: bold; color: #2563eb; letter-spacing: 5px; margin: 20px 0;">${otp}</div>
          <p>This code will expire in ${OTP_EXPIRY_MINUTES} minutes.</p>
          <p>If you didn't request this, please ignore this email.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (err) {
    console.error('sendOTPEmail error', err);
    return false;
  }
}

async function sendUserCreatedEmail(email, password, referenceNumber) {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: email,
      subject: `Welcome to ${process.env.NEXT_PUBLIC_APP_NAME || 'GST Tax Wale'} - Your Account Details`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333; line-height: 1.6;">
          <h2 style="color: #2563eb;">Welcome to GST Tax Wale!</h2>
          <p>An administrator has created an account for you. Here are your login credentials:</p>
          
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Email:</strong> ${email}</p>
            <p style="margin: 5px 0;"><strong>Temporary Password:</strong> <span style="font-family: monospace; font-weight: bold; font-size: 1.1em;">${password}</span></p>
            <p style="margin: 5px 0;"><strong>Reference Number:</strong> ${referenceNumber}</p>
          </div>
          
          <p>You can log in at: <a href="https://gsttaxwale.com/auth/login" style="color: #2563eb; font-weight: bold;">gsttaxwale.com/auth/login</a></p>
          
          <p style="color: #6b7280; font-size: 0.9em; margin-top: 20px;">
            <strong>Security Tip:</strong> Please change your password immediately after your first login.
          </p>
          
          <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
          <p style="font-size: 0.8em; color: #9ca3af; text-align: center;">
            &copy; ${new Date().getFullYear()} GST Tax Wale. All rights reserved.
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (err) {
    console.error('sendUserCreatedEmail error', err);
    return false;
  }
}

async function createOTP(userId) {
  try {
    const code = generateOTP();
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
    await prisma.oTP.deleteMany({ where: { userId } });
    await prisma.oTP.create({ data: { userId, code, expiresAt, verified: false } });
    return code;
  } catch (err) {
    console.error('createOTP error', err);
    return null;
  }
}

async function verifyOTP(userId, code) {
  try {
    const otp = await prisma.oTP.findUnique({ where: { userId } });
    if (!otp) return false;
    if (otp.expiresAt < new Date()) return false;
    if (otp.code !== code) return false;
    await prisma.oTP.update({ where: { userId }, data: { verified: true } });
    return true;
  } catch (err) {
    console.error('verifyOTP error', err);
    return false;
  }
}

async function createUserWithPAN(email, pan, name, password) {
  try {
    if (!validateEmail(email)) throw new Error('Invalid email');
    const existingPan = await prisma.user.findUnique({ where: { pan: pan.toUpperCase() } });
    if (existingPan) throw new Error('PAN already registered');
    const existingEmail = await prisma.user.findUnique({ where: { email } });
    if (existingEmail) throw new Error('Email already registered');
    const hashed = password ? await hashPassword(password) : null;
    const user = await prisma.user.create({ data: { email, pan: pan.toUpperCase(), name, password: hashed } });
    return user;
  } catch (err) {
    throw err;
  }
}

async function register(email, password, name, pan) {
  if (!validateEmail(email)) throw new APIError('Invalid email', 400);
  const hashed = await hashPassword(password);
  const user = await prisma.user.create({ data: { email, password: hashed, name, pan: pan ? pan.toUpperCase() : null } });
  const token = generateToken(user.id);
  return { id: user.id, email: user.email, name: user.name, role: user.role, token };
}

async function login(email, password) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new APIError('Invalid email or password', 401);
  const ok = await comparePassword(password, user.password || '');
  if (!ok) throw new APIError('Invalid email or password', 401);
  if (user.status !== 'active') throw new APIError('Account not active', 403);
  const token = generateToken(user.id);
  return { id: user.id, email: user.email, name: user.name, role: user.role, token };
}

async function getUser(userId) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new APIError('User not found', 404);
  return { id: user.id, email: user.email, name: user.name, role: user.role, status: user.status, createdAt: user.createdAt };
}

module.exports = {
  hashPassword,
  comparePassword,
  generateToken,
  verifyToken,
  generateOTP,
  sendOTPEmail,
  createOTP,
  verifyOTP,
  validateEmail,
  createUserWithPAN,
  register,
  login,
  getUser,
  sendUserCreatedEmail,
};
