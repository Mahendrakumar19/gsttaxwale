// =============================================================================
// AUTH CONTROLLER - Login, OTP, Profile Management
// Note: Signup functionality removed - users created by admin only
// =============================================================================
const authService = require('../services/authService');
const db = require('../utils/db');
const { v4: uuidv4 } = require('uuid');
const { successResponse, errorResponse } = require('../utils/helpers');
const configUtil = require('../utils/config');


// ────────────────────────────────────────────────────────────────────
// LOGIN - Authenticate user with email and password
// ────────────────────────────────────────────────────────────────────
async function login(req, res) {
  try {
    const { email, password } = req.body;

    console.log(`🔐 LOGIN ATTEMPT: ${email}`);

    // Validate input
    if (!email || !password) {
      console.log(`❌ Missing email or password`);
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    // Find user by email
    console.log(`🔍 Searching for user: ${email}`);
    const user = await db.findOne('User', { email });
    if (!user) {
      console.log(`❌ User not found: ${email}`);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }
    console.log(`✅ User found: ${email} (ID: ${user.id})`);

    // Verify password
    console.log(`🔑 Verifying password for: ${email} (user.role: ${user.role || 'unknown'})`);
    const isPasswordValid = await authService.comparePassword(password, user.password);
    console.log(`🔑 Password hash compare result for ${email}: ${isPasswordValid ? 'MATCH' : 'NO MATCH'}`);
    if (!isPasswordValid) {
      console.log(`❌ Invalid password for: ${email} (role: ${user.role || 'unknown'})`);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }
    console.log(`✅ Password verified for: ${email} (role: ${user.role})`); 

    // Generate token
    console.log(`🎫 Generating JWT token for: ${email}`);
    const token = authService.generateToken(user.id);
    console.log(`✅ Login successful for: ${email}`);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          pan: user.pan,
          role: user.role,
        },
        token,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to login',
      error: error.message,
    });
  }
}

// ────────────────────────────────────────────────────────────────────
// SEND OTP - Send OTP to email
// ────────────────────────────────────────────────────────────────────
async function sendOTP(req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
      });
    }

    // Find user
    const user = await db.findOne('User', { email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Check if OTP is enabled in system settings
    const isOtpEnabled = await configUtil.getSetting('ENABLE_OTP', true);
    
    if (!isOtpEnabled) {
      console.log(`ℹ️ OTP is disabled. Skipping for: ${email}`);
      return res.status(200).json({
        success: true,
        message: 'OTP disabled, you can proceed with any code',
        otpDisabled: true
      });
    }

    // Generate and send OTP
    const otp = authService.generateOTP();
    const sent = await authService.sendOTPEmail(email, otp);

    if (!sent) {
      return res.status(500).json({
        success: false,
        message: 'Failed to send OTP email',
      });
    }


    // Store OTP in database
    await db.create('OTP', {
      userId: user.id,
      otp,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes expiry
    });

    res.status(200).json({
      success: true,
      message: 'OTP sent successfully',
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send OTP',
      error: error.message,
    });
  }
}

// ────────────────────────────────────────────────────────────────────
// VERIFY OTP - Verify OTP code sent to email
// ────────────────────────────────────────────────────────────────────
async function verifyOTP(req, res) {
  try {
    const { userId, code } = req.body;

    if (!userId || !code) {
      return res.status(400).json({
        success: false,
        message: 'User ID and OTP code are required',
      });
    }

    // Check if OTP is enabled
    const isOtpEnabled = await configUtil.getSetting('ENABLE_OTP', true);
    if (!isOtpEnabled) {
      return res.status(200).json({
        success: true,
        message: 'OTP verified (disabled)',
        verified: true
      });
    }


    // Verify OTP
    const isValid = await authService.verifyOTP(userId, code);
    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired OTP',
      });
    }

    // Delete used OTP
    await db.delete('OTP', {
      userId,
      code,
    });

    // Get user
    const user = await db.findOne('User', { id: userId });

    // Generate token
    const token = authService.generateToken(userId);

    res.status(200).json({
      success: true,
      message: 'OTP verified successfully',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          pan: user.pan,
          role: user.role,
        },
        token,
      },
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify OTP',
      error: error.message,
    });
  }
}

// ────────────────────────────────────────────────────────────────────
// GET CURRENT USER - Get authenticated user profile
// ────────────────────────────────────────────────────────────────────
async function getCurrentUser(req, res) {
  try {
    const userId = req.userId;

    const user = await db.findOne('User', { id: userId }, {
      select: {
        id: true,
        email: true,
        name: true,
        pan: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'User fetched successfully',
      data: { user },
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user',
      error: error.message,
    });
  }
}

// ────────────────────────────────────────────────────────────────────
// UPDATE PROFILE - Update user profile information
// ────────────────────────────────────────────────────────────────────
async function updateProfile(req, res) {
  try {
    const userId = req.userId;
    const { name, phone, address, city, state, pincode } = req.body;

    // Build update data
    const updateData = {};
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (address) updateData.address = address;
    if (city) updateData.city = city;
    if (state) updateData.state = state;
    if (pincode) updateData.pincode = pincode;
    updateData.updatedAt = new Date();

    // Update user
    const user = await db.update('User', { id: userId }, updateData, {
      select: {
        id: true,
        email: true,
        name: true,
        pan: true,
        phone: true,
        address: true,
        city: true,
        state: true,
        pincode: true,
        role: true,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: { user },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message,
    });
  }
}

// ────────────────────────────────────────────────────────────────────
// FORGOT PASSWORD - Send OTP to email or phone
// ────────────────────────────────────────────────────────────────────
async function forgotPassword(req, res) {
  try {
    const { email, phone } = req.body;

    if (!email && !phone) {
      return res.status(400).json({
        success: false,
        message: 'Email or phone is required',
      });
    }

    // Find user by email or phone
    let user;
    if (email) {
      user = await db.findOne('User', { email });
    } else if (phone) {
      user = await db.findOne('User', { phone });
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Generate OTP
    const otp = authService.generateOTP();
    const otpExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Store OTP
    await db.create('OTP', {
      userId: user.id,
      code: otp,
      expiresAt: otpExpiry,
      verified: false,
    });

    // Send OTP to email
    if (user.email) {
      await authService.sendOTPEmail(user.email, otp);
    }

    res.status(200).json({
      success: true,
      message: 'OTP sent to registered email',
      data: {
        userId: user.id,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process forgot password request',
      error: error.message,
    });
  }
}

// ────────────────────────────────────────────────────────────────────
// VERIFY PASSWORD RESET OTP - Verify OTP for password reset
// ────────────────────────────────────────────────────────────────────
async function verifyPasswordOTP(req, res) {
  try {
    const { userId, code } = req.body;

    if (!userId || !code) {
      return res.status(400).json({
        success: false,
        message: 'User ID and OTP code are required',
      });
    }

    // Find OTP
    const otpRecord = await db.findOne('OTP', {
      userId,
      code,
    });

    if (!otpRecord || otpRecord.expiresAt < new Date()) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired OTP',
      });
    }

    // Mark OTP as verified
    await db.update('OTP', { id: otpRecord.id }, {
      verified: true,
    });

    res.status(200).json({
      success: true,
      message: 'OTP verified successfully',
      data: {
        userId,
      },
    });
  } catch (error) {
    console.error('Verify password OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify OTP',
      error: error.message,
    });
  }
}

// ────────────────────────────────────────────────────────────────────
// RESET PASSWORD - Update user password with verified OTP
// ────────────────────────────────────────────────────────────────────
async function resetPassword(req, res) {
  try {
    const { userId, code, newPassword } = req.body;

    if (!userId || !code || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'User ID, OTP code, and new password are required',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters',
      });
    }

    // Verify OTP
    const otpRecord = await db.findOne('OTP', {
      userId,
      code,
      verified: true,
    });

    if (!otpRecord || otpRecord.expiresAt < new Date()) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired OTP',
      });
    }

    // Hash new password
    const hashedPassword = await authService.hashPassword(newPassword);

    // Update user password
    await db.update('User', { id: userId }, {
      password: hashedPassword,
      lastPasswordChange: new Date(),
    });

    // Delete OTP record
    await db.delete('OTP', { id: otpRecord.id });

    res.status(200).json({
      success: true,
      message: 'Password reset successfully',
      data: {
        userId,
      },
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset password',
      error: error.message,
    });
  }
}

// ────────────────────────────────────────────────────────────────────
// LOGOUT - Logout user (client-side token deletion)
// ────────────────────────────────────────────────────────────────────
async function logout(req, res) {
  try {
    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
      data: null,
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to logout',
      error: error.message,
    });
  }
}

// ────────────────────────────────────────────────────────────────────
// ADMIN LOGIN - Authenticate admin with email and password
// ────────────────────────────────────────────────────────────────────
async function adminLogin(req, res) {
  try {
    const { email, password } = req.body;

    console.log(`🔐 ADMIN LOGIN ATTEMPT: ${email}`);

    // Validate input
    if (!email || !password) {
      console.log(`❌ Missing email or password`);
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    // Find user by email
    console.log(`🔍 Searching for admin user: ${email}`);
    const user = await db.findOne('User', { email });
    if (!user) {
      console.log(`❌ Admin user not found: ${email}`);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }
    console.log(`✅ User found: ${email} (ID: ${user.id})`);

    // Verify user is admin
    if (user.role !== 'admin') {
      console.log(`❌ Non-admin user attempted admin login: ${email}`);
      return res.status(403).json({
        success: false,
        message: 'Only admin users can access the admin panel',
      });
    }

    // Verify password
    console.log(`🔑 Verifying password for admin: ${email}`);
    const isPasswordValid = await authService.comparePassword(password, user.password);
    console.log(`🔑 Password hash compare result for ${email}: ${isPasswordValid ? 'MATCH' : 'NO MATCH'}`);
    if (!isPasswordValid) {
      console.log(`❌ Invalid password for admin: ${email}`);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }
    console.log(`✅ Admin password verified for: ${email}`);

    // Generate token
    console.log(`🎫 Generating JWT token for admin: ${email}`);
    const token = authService.generateToken(user.id);
    console.log(`✅ Admin login successful for: ${email}`);

    res.status(200).json({
      success: true,
      message: 'Admin login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        token,
      },
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to login as admin',
      error: error.message,
    });
  }
}

/**
 * Convert guest user to full account with password
 */
async function convertGuestToAccount(req, res) {
  const { guestUserId, password } = req.body;

  if (!guestUserId || !password) {
    return res
      .status(400)
      .json(errorResponse('Missing required fields: guestUserId, password'));
  }

  try {
    // Validate password strength
    if (password.length < 6) {
      return res
        .status(400)
        .json(errorResponse('Password must be at least 6 characters'));
    }

    // Hash password
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);

    // Update guest user - convert to full account
    const result = await db.query(
      `UPDATE users SET password = ?, is_guest = 0, updated_at = NOW()
       WHERE id = ? AND is_guest = 1`,
      [hashedPassword, guestUserId]
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json(errorResponse('Guest user not found or already converted'));
    }

    // Get updated user
    const users = await db.query(
      'SELECT id, email, name, phone, role FROM users WHERE id = ?',
      [guestUserId]
    );

    if (!users.length) {
      return res.status(404).json(errorResponse('User not found after conversion'));
    }

    const user = users[0];

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'secret_key',
      { expiresIn: '7d' }
    );

    console.log(`✅ Guest user converted to account | User: ${guestUserId}`);

    return res.status(200).json(
      successResponse('Account created successfully', {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          phone: user.phone,
          role: user.role,
        },
        token,
      })
    );
  } catch (error) {
    console.error('❌ Guest conversion error:', error);
    return res
      .status(500)
      .json(errorResponse('Failed to convert guest to account'));
  }
}

/**
 * Check if email exists in the system
 */
async function checkEmail(req, res) {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json(
      errorResponse('Email is required')
    );
  }

  try {
    const users = await db.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    return res.status(200).json(
      successResponse('Email check completed', {
        exists: users.length > 0,
        userId: users.length > 0 ? users[0].id : null,
      })
    );
  } catch (error) {
    console.error('❌ Check email error:', error);
    return res.status(500).json(errorResponse('Failed to check email'));
  }
}

/**
 * Create guest user for service purchase
 */
async function createGuest(req, res) {
  const { name, email, phone } = req.body;

  if (!name || !email || !phone) {
    return res.status(400).json(
      errorResponse('Missing required fields: name, email, phone')
    );
  }

  try {
    // Check if email already exists
    const existingUsers = await db.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(200).json(
        successResponse('User already exists', {
          userId: existingUsers[0].id,
          isNewUser: false,
        })
      );
    }

    // Create guest user
    const result = await db.query(
      `INSERT INTO users (name, email, phone, role, is_guest, created_at)
       VALUES (?, ?, ?, 'user', 1, NOW())`,
      [name, email, phone]
    );

    const userId = result.insertId;

    console.log(`✅ Guest user created | User: ${userId} | Email: ${email}`);

    return res.status(201).json(
      successResponse('Guest user created', {
        userId,
        isNewUser: true,
      })
    );
  } catch (error) {
    console.error('❌ Create guest error:', error);
    return res.status(500).json(errorResponse('Failed to create guest user'));
  }
}

/**
 * Send OTP for service purchase (to email only)
 */
async function sendServicePurchaseOTP(req, res) {
  const { email, phone } = req.body;

  if (!email) {
    return res.status(400).json(
      errorResponse('Email is required')
    );
  }

  try {
    // Check if OTP is enabled
    const isOtpEnabled = await configUtil.getSetting('ENABLE_OTP', true);
    if (!isOtpEnabled) {
      return res.status(200).json(
        successResponse('OTP is disabled, you can proceed', {
          email,
          otpDisabled: true
        })
      );
    }

    // Generate OTP

    const otp = authService.generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Send OTP to email
    const emailSent = await authService.sendOTPEmail(email, otp);
    if (!emailSent) {
      return res.status(500).json(
        errorResponse('Failed to send OTP to email. Please try again.')
      );
    }

    // SMS OTP is disabled as per user request
    console.log(`✅ Service purchase OTP sent to email | Email: ${email}`);

    // Store OTP in database for verification
    await db.query(
      `INSERT INTO otp_codes (email, phone, code, expires_at, created_at)
       VALUES (?, ?, ?, ?, NOW())
       ON DUPLICATE KEY UPDATE code = VALUES(code), phone = VALUES(phone), expires_at = VALUES(expires_at), created_at = NOW()`,
      [email, phone || null, otp, expiresAt]
    );

    return res.status(200).json(
      successResponse('OTP sent successfully to email', {
        email,
        expiresIn: 600, // 10 minutes in seconds
      })
    );
  } catch (error) {
    console.error('❌ Send service purchase OTP error:', error);
    return res.status(500).json(
      errorResponse(`Failed to send OTP: ${error.message}`)
    );
  }
}

/**
 * Verify OTP for service purchase
 */
async function verifyServicePurchaseOTP(req, res) {
  const { email, phone, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json(
      errorResponse('Email and OTP are required')
    );
  }

  try {
    // Check if OTP is enabled
    const isOtpEnabled = await configUtil.getSetting('ENABLE_OTP', true);
    if (!isOtpEnabled) {
      const tempToken = authService.generateToken('temp_' + email);
      return res.status(200).json(
        successResponse('OTP verified (disabled)', {
          verified: true,
          email,
          phone,
          tempToken,
          canProceedToCheckout: true,
        })
      );
    }

    // Check OTP in database - search by email only for verification

    const otpRecords = await db.query(
      `SELECT id, code, expires_at FROM otp_codes 
       WHERE email = ? 
       ORDER BY created_at DESC 
       LIMIT 1`,
      [email]
    );

    if (otpRecords.length === 0) {
      return res.status(400).json(
        errorResponse('OTP not found. Please request a new OTP.')
      );
    }

    const otpRecord = otpRecords[0];

    // Check if OTP has expired
    if (new Date() > otpRecord.expires_at) {
      return res.status(400).json(
        errorResponse('OTP has expired. Please request a new one.')
      );
    }

    // Check if OTP matches
    if (otpRecord.code !== otp) {
      return res.status(400).json(
        errorResponse('Invalid OTP. Please try again.')
      );
    }

    // Mark OTP as used
    await db.query(
      'UPDATE otp_codes SET verified = 1 WHERE id = ?',
      [otpRecord.id]
    );

    console.log(`✅ Service purchase OTP verified | Email: ${email}`);

    // Generate a temporary token for checkout (no user account yet)
    const tempToken = authService.generateToken('temp_' + email);

    return res.status(200).json(
      successResponse('OTP verified successfully', {
        verified: true,
        email,
        phone,
        tempToken,
        canProceedToCheckout: true,
      })
    );
  } catch (error) {
    console.error('❌ Verify service purchase OTP error:', error);
    return res.status(500).json(
      errorResponse('Failed to verify OTP. Please try again.')
    );
  }
}

module.exports = {
  login,
  adminLogin,
  sendOTP,
  verifyOTP,
  forgotPassword,
  verifyPasswordOTP,
  resetPassword,
  getCurrentUser,
  updateProfile,
  logout,
  convertGuestToAccount,
  checkEmail,
  createGuest,
  sendServicePurchaseOTP,
  verifyServicePurchaseOTP,
};
