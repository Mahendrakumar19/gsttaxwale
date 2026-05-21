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

    // Send Profile Update Notification
    try {
      if (user && user.email) {
        await authService.sendProfileUpdatedEmail(user.email);
        console.log(`📧 User-initiated profile update notification sent to ${user.email}`);
      }
    } catch (mailError) {
      console.error('📧 Failed to send user profile update notification:', mailError);
    }

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
// SEND RESET OTP - Step 1: Send OTP to email or phone for reset
// ────────────────────────────────────────────────────────────────────
async function sendResetOTP(req, res) {
  try {
    const { email, phone } = req.body;

    if (!email && !phone) {
      return res.status(400).json(errorResponse('Email or phone is required'));
    }

    // Find user by email or phone
    const user = await db.findOne('User', email ? { email } : { phone });

    if (!user) {
      return res.status(404).json(errorResponse('User not found'));
    }

    // Generate and store OTP
    const otp = authService.generateOTP();
    const otpExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Delete any existing OTP for this user
    await db.query('DELETE FROM OTP WHERE userId = ?', [user.id]);

    // Create new OTP record
    await db.create('OTP', {
      userId: user.id,
      code: otp,
      expiresAt: otpExpiry,
      verified: false,
    });

    let sent = false;
    if (email) {
      sent = await authService.sendOTPEmail(email, otp);
    } else if (phone) {
      sent = await authService.sendOTPSMS(phone, otp);
    }

    if (!sent) {
      return res.status(500).json(errorResponse('Failed to send OTP. Please try again.'));
    }

    res.status(200).json(successResponse({
      userId: user.id,
      method: email ? 'email' : 'phone',
      target: email || phone
    }, 'OTP sent successfully'));

  } catch (error) {
    console.error('Send reset OTP error:', error);
    res.status(500).json(errorResponse('Failed to send reset OTP'));
  }
}

// ────────────────────────────────────────────────────────────────────
// VERIFY RESET OTP - Step 2: Verify the OTP code
// ────────────────────────────────────────────────────────────────────
async function verifyResetOTP(req, res) {
  try {
    const { userId, code } = req.body;

    if (!userId || !code) {
      return res.status(400).json(errorResponse('User ID and OTP code are required'));
    }

    // Find OTP
    const otpRecord = await db.findOne('OTP', { userId, code });

    if (!otpRecord) {
      return res.status(401).json(errorResponse('Invalid OTP code'));
    }

    if (otpRecord.expiresAt < new Date()) {
      return res.status(401).json(errorResponse('OTP has expired'));
    }

    // Mark OTP as verified
    await db.update('OTP', { id: otpRecord.id }, { verified: true });

    res.status(200).json(successResponse({ userId, verified: true }, 'OTP verified successfully'));
  } catch (error) {
    console.error('Verify reset OTP error:', error);
    res.status(500).json(errorResponse('Failed to verify OTP'));
  }
}

// ────────────────────────────────────────────────────────────────────
// RESET PASSWORD - Step 3: Update password with verified OTP
// ────────────────────────────────────────────────────────────────────
async function resetPassword(req, res) {
  try {
    const { userId, code, newPassword } = req.body;

    if (!userId || !code || !newPassword) {
      return res.status(400).json(errorResponse('Missing required fields'));
    }

    if (newPassword.length < 6) {
      return res.status(400).json(errorResponse('Password must be at least 6 characters'));
    }

    // Verify OTP is still valid and verified
    const otpRecord = await db.findOne('OTP', { 
      userId, 
      code,
      verified: true 
    });

    if (!otpRecord || otpRecord.expiresAt < new Date()) {
      return res.status(401).json(errorResponse('Invalid or session expired. Please start again.'));
    }

    // Hash new password
    const hashedPassword = await authService.hashPassword(newPassword);

    // Update user password
    await db.update('User', { id: userId }, {
      password: hashedPassword,
      lastPasswordChange: new Date(),
    });

    // Send Password Change Notification
    try {
      const user = await db.findOne('User', { id: userId });
      if (user && user.email) {
        await authService.sendPasswordChangedEmail(user.email);
        console.log(`📧 User password reset notification sent to ${user.email}`);
      }
    } catch (mailError) {
      console.error('📧 Failed to send password reset notification:', mailError);
    }

    // Delete OTP record
    await db.delete('OTP', { id: otpRecord.id });

    res.status(200).json(successResponse(null, 'Password reset successfully. You can now login with your new password.'));
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json(errorResponse('Failed to reset password'));
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
 * REGISTER - Create new user account and handle referral
 */
async function register(req, res) {
  try {
    const { name, email, phone, password, referralCode } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json(errorResponse('Name, email and password are required'));
    }

    const cleanPhone = phone ? phone.replace(/\D/g, '') : '';

    // 1. Check if user already exists
    const existingUser = await db.findOne('User', { email });
    if (existingUser) {
      return res.status(400).json(errorResponse('Email already registered'));
    }

    if (cleanPhone) {
      const existingPhone = await db.findOne('User', { phone: cleanPhone });
      if (existingPhone) {
        return res.status(400).json(errorResponse('Phone number already registered'));
      }
    }

    // 2. Hash password
    const hashedPassword = await authService.hashPassword(password);

    // 3. Check if guest referrer exists to reuse code/transfer points
    const { generateUniqueReferralCode } = require('../utils/referralHelper');
    const WalletService = require('../services/walletService');

    let guestReferrer = null;
    if (email) {
      guestReferrer = await db.findOne('referral_referrers', { email });
    }
    if (!guestReferrer && cleanPhone) {
      guestReferrer = await db.findOne('referral_referrers', { mobile: cleanPhone });
    }

    let myReferralCode;
    let pendingPoints = 0;

    if (guestReferrer) {
      myReferralCode = guestReferrer.referral_id;
      pendingPoints = guestReferrer.pending_points || 0;
    } else {
      myReferralCode = await generateUniqueReferralCode(name, cleanPhone);
    }

    // 4. Create User
    const newUser = await db.create('User', {
      name,
      email,
      phone: cleanPhone || null,
      password: hashedPassword,
      role: 'user',
      status: 'active',
      referral_code: myReferralCode,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // 5. If they were a guest referrer, mark guest record as converted and transfer points
    if (guestReferrer) {
      await db.query(
        'UPDATE referral_referrers SET is_customer = 1, converted_user_id = ?, pending_points = 0, updated_at = NOW() WHERE id = ?',
        [newUser.id, guestReferrer.id]
      );

      if (pendingPoints > 0) {
        await WalletService.credit(
          newUser.id,
          pendingPoints,
          'referral_pending_transfer',
          null,
          `Transferred pending points from guest referrals (${pendingPoints} points)`
        );
      }
    }

    // 6. Handle referee relationship / conversion update
    const finalReferralCode = referralCode || req.body.referral_code;
    if (finalReferralCode) {
      // Find if referrer exists
      let referrerUser = await db.findOne('User', { referral_code: finalReferralCode });
      
      // Update/create lead in referral_leads
      const [existingLead] = await db.query(
        'SELECT id, status FROM referral_leads WHERE referred_email = ? OR referred_mobile = ?',
        [email, cleanPhone]
      );

      if (existingLead) {
        await db.query(
          "UPDATE referral_leads SET status = 'converted', converted_user_id = ?, updated_at = NOW() WHERE id = ?",
          [newUser.id, existingLead.id]
        );
      } else {
        await db.create('referral_leads', {
          referrer_referral_id: finalReferralCode,
          referred_name: name,
          referred_mobile: cleanPhone,
          referred_email: email,
          status: 'converted',
          converted_user_id: newUser.id,
          reward_given: 0,
          created_at: new Date(),
          updated_at: new Date()
        });
      }

      // Maintain legacy Referral record compatibility
      if (referrerUser) {
        const [existingReferral] = await db.query(
          'SELECT id FROM Referral WHERE referrerId = ? AND refereeEmail = ?',
          [referrerUser.id, email]
        );

        if (existingReferral) {
          await db.query(
            'UPDATE Referral SET refereeId = ?, referralStatus = "active", updatedAt = NOW() WHERE id = ?',
            [newUser.id, existingReferral.id]
          );
        } else {
          await db.create('Referral', {
            referrerId: referrerUser.id,
            refereeId: newUser.id,
            refereeEmail: email,
            refereePhone: cleanPhone,
            commissionPercent: 10,
            commissionAmount: 0,
            referralStatus: 'active',
            createdAt: new Date(),
            updatedAt: new Date()
          });
        }
      }

      // Track Event
      try {
        await db.create('referral_events', {
          referrer_id: referrerUser ? referrerUser.id : null,
          referee_id: newUser.id,
          event_type: 'conversion',
          metadata: JSON.stringify({
            convertedUserId: newUser.id,
            utm_source: 'self_registration'
          }),
          created_at: new Date()
        });
      } catch (trackErr) {
        console.warn('Could not write referral event:', trackErr.message);
      }
    }

    // 7. Generate Token
    const token = authService.generateToken(newUser.id);

    res.status(201).json(successResponse({
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        referral_code: newUser.referral_code
      },
      token
    }, 'Registration successful'));

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json(errorResponse('Failed to register user: ' + error.message));
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

    // Hash password using authService
    const hashedPassword = await authService.hashPassword(password);

    // Update guest user - convert to full account
    const result = await db.query(
      `UPDATE User SET password = ?, updatedAt = NOW()
       WHERE id = ? AND (password IS NULL OR password = '')`,
      [hashedPassword, guestUserId]
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json(errorResponse('Guest user not found or already converted'));
    }

    // Get updated user
    const users = await db.query(
      'SELECT id, email, name, phone, role FROM User WHERE id = ?',
      [guestUserId]
    );

    if (!users.length) {
      return res.status(404).json(errorResponse('User not found after conversion'));
    }

    const user = users[0];

    // Generate JWT token using authService
    const token = authService.generateToken(user.id);

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
      'SELECT id FROM User WHERE email = ?',
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
      'SELECT id FROM User WHERE email = ?',
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

    // Create guest user - password will remain null
    const result = await db.query(
      `INSERT INTO User (name, email, phone, role, createdAt, updatedAt)
       VALUES (?, ?, ?, 'user', NOW(), NOW())`,
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
async function changePassword(req, res) {
  try {
    const userId = req.userId || (req.user && req.user.id);
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json(errorResponse('Old password and new password are required'));
    }

    if (newPassword.length < 6) {
      return res.status(400).json(errorResponse('New password must be at least 6 characters'));
    }

    // Get user
    const [user] = await db.query('SELECT * FROM `User` WHERE id = ?', [userId]);
    if (!user) {
      return res.status(404).json(errorResponse('User not found'));
    }

    // Verify old password
    const isPasswordValid = await authService.comparePassword(oldPassword, user.password);
    if (!isPasswordValid) {
      return res.status(400).json(errorResponse('Invalid old password'));
    }

    // Hash new password
    const hashedPassword = await authService.hashPassword(newPassword);

    // Update user password
    await db.query('UPDATE `User` SET password = ?, lastPasswordChange = NOW() WHERE id = ?', [hashedPassword, userId]);

    // Send Password Change Notification if we want
    try {
      if (typeof authService.sendPasswordChangedEmail === 'function') {
        await authService.sendPasswordChangedEmail(user.email);
      }
    } catch (mailError) {
      console.error('📧 Failed to send password reset notification:', mailError);
    }

    res.status(200).json(successResponse(null, 'Password changed successfully.'));
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json(errorResponse('Failed to change password'));
  }
}

module.exports = {
  register,
  login,
  adminLogin,
  sendOTP,
  verifyOTP,
  sendResetOTP,
  verifyResetOTP,
  resetPassword,
  changePassword,
  getCurrentUser,
  updateProfile,
  logout,
  convertGuestToAccount,
  checkEmail,
  createGuest,
  sendServicePurchaseOTP,
  verifyServicePurchaseOTP,
};
