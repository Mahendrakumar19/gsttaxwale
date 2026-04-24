// Auth Enhancement Service - Password reset, strength validation
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

const prisma = new PrismaClient();

// Email configuration
const transporter = nodemailer.createTransport({
  service: process.env.SMTP_SERVICE || 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

/**
 * Validate password strength
 */
export function validatePasswordStrength(password: string) {
  const requirements = {
    minLength: password.length >= 8,
    hasUpperCase: /[A-Z]/.test(password),
    hasLowerCase: /[a-z]/.test(password),
    hasNumbers: /\d/.test(password),
    hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  };

  const strength = Object.values(requirements).filter(Boolean).length;

  return {
    valid: requirements.minLength && strength >= 3,
    strength: strength as 1 | 2 | 3 | 4 | 5,
    requirements,
    message: getPasswordStrengthMessage(strength),
  };
}

/**
 * Get password strength message
 */
function getPasswordStrengthMessage(strength: number): string {
  switch (strength) {
    case 1:
      return 'Very weak password';
    case 2:
      return 'Weak password';
    case 3:
      return 'Fair password';
    case 4:
      return 'Good password';
    case 5:
      return 'Strong password';
    default:
      return 'Invalid password';
  }
}

/**
 * Request password reset - send email
 */
export async function requestPasswordReset(email: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't reveal if user exists - security practice
      return {
        success: true,
        message: 'If account exists, password reset link will be sent to email',
      };
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Save token
    const passwordReset = await prisma.passwordReset.create({
      data: {
        userId: user.id,
        token: resetToken,
        expiresAt: resetTokenExpires,
      },
    });

    // Generate reset link
    const resetLink = `${process.env.FRONTEND_URL}/auth/reset-password/${resetToken}`;

    // Send email
    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'noreply@taxtaxwale.com',
      to: email,
      subject: 'Password Reset Request',
      html: `
        <h2>Password Reset Request</h2>
        <p>Click the link below to reset your password:</p>
        <p><a href="${resetLink}">Reset Password</a></p>
        <p>This link expires in 24 hours.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `,
    });

    return {
      success: true,
      message: 'Password reset link sent to email',
    };
  } catch (error: any) {
    console.error('Password reset request failed:', error);
    throw new Error(`Failed to request password reset: ${error.message}`);
  }
}

/**
 * Verify reset token
 */
export async function verifyResetToken(token: string) {
  try {
    const passwordReset = await prisma.passwordReset.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!passwordReset) {
      throw new Error('Invalid reset token');
    }

    if (passwordReset.used) {
      throw new Error('Token already used');
    }

    if (new Date() > passwordReset.expiresAt) {
      throw new Error('Token expired');
    }

    return {
      valid: true,
      userId: passwordReset.userId,
      email: passwordReset.user.email,
    };
  } catch (error: any) {
    throw new Error(`Token verification failed: ${error.message}`);
  }
}

/**
 * Reset password with token
 */
export async function resetPassword(token: string, newPassword: string) {
  try {
    // Verify token
    const verification = await verifyResetToken(token);

    // Validate new password
    const passwordValidation = validatePasswordStrength(newPassword);
    if (!passwordValidation.valid) {
      throw new Error(`${passwordValidation.message}. Password must have at least 8 characters, uppercase, lowercase, and numbers.`);
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password
    await prisma.user.update({
      where: { id: verification.userId },
      data: {
        password: hashedPassword,
        lastPasswordChange: new Date(),
      },
    });

    // Mark token as used
    await prisma.passwordReset.update({
      where: { token },
      data: {
        used: true,
        usedAt: new Date(),
      },
    });

    // Send confirmation email
    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'noreply@taxtaxwale.com',
      to: verification.email,
      subject: 'Password Changed Successfully',
      html: `
        <h2>Password Changed</h2>
        <p>Your password has been reset successfully.</p>
        <p>If you didn't make this change, please contact support immediately.</p>
      `,
    });

    return {
      success: true,
      message: 'Password reset successfully',
    };
  } catch (error: any) {
    console.error('Password reset failed:', error);
    throw error;
  }
}

/**
 * Change password (logged in user)
 */
export async function changePassword(userId: string, currentPassword: string, newPassword: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.password) {
      throw new Error('User not found');
    }

    // Verify current password
    const passwordMatch = await bcrypt.compare(currentPassword, user.password);
    if (!passwordMatch) {
      throw new Error('Current password is incorrect');
    }

    // Validate new password
    const passwordValidation = validatePasswordStrength(newPassword);
    if (!passwordValidation.valid) {
      throw new Error(`${passwordValidation.message}. Password must be stronger.`);
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        lastPasswordChange: new Date(),
      },
    });

    // Send confirmation email
    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'noreply@taxtaxwale.com',
      to: user.email,
      subject: 'Password Changed Successfully',
      html: `
        <h2>Password Changed</h2>
        <p>Your password has been changed successfully.</p>
        <p>If you didn't make this change, please reset your password immediately.</p>
      `,
    });

    return {
      success: true,
      message: 'Password changed successfully',
    };
  } catch (error: any) {
    throw new Error(`Failed to change password: ${error.message}`);
  }
}

export default {
  validatePasswordStrength,
  requestPasswordReset,
  verifyResetToken,
  resetPassword,
  changePassword,
};
