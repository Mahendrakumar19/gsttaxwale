// =============================================================================
// AUTH CONTROLLER - Login, OTP, Profile Management
// Note: Signup functionality removed - users created by admin only
// =============================================================================
const authService = require('../services/authService');
const db = require('../utils/db');
const { v4: uuidv4 } = require('uuid');

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
    console.log(`🔑 Verifying password for: ${email}`);
    const isPasswordValid = await authService.comparePassword(password, user.password);
    if (!isPasswordValid) {
      console.log(`❌ Invalid password for: ${email}`);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }
    console.log(`✅ Password verified for: ${email}`);

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

module.exports = {
  login,
  sendOTP,
  verifyOTP,
  forgotPassword,
  verifyPasswordOTP,
  resetPassword,
  getCurrentUser,
  updateProfile,
  logout,
};
