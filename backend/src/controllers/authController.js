// =============================================================================
// AUTH CONTROLLER - Signup, Login, OTP, Profile Management
// =============================================================================
const authService = require('../services/authService');
const prisma = require('../utils/prisma').default || require('../utils/prisma');

// ────────────────────────────────────────────────────────────────────
// SIGNUP - Create new user with PAN
// ────────────────────────────────────────────────────────────────────
async function signup(req, res) {
  try {
    const { email, password, name, pan } = req.body;

    // Validate required fields
    if (!email || !password || !name || !pan) {
      return res.status(400).json({
        success: false,
        message: 'Email, password, name, and PAN are required',
      });
    }

    // Validate PAN format (AAAAA0000A)
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (!panRegex.test(pan.toUpperCase())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid PAN format. Expected: AAAAA0000A',
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format',
      });
    }

    // Check if email already exists
    const existingEmail = await prisma.user.findUnique({ where: { email } });
    if (existingEmail) {
      return res.status(409).json({
        success: false,
        message: 'Email already registered',
      });
    }

    // Check if PAN already exists
    const existingPAN = await prisma.user.findUnique({ where: { pan: pan.toUpperCase() } });
    if (existingPAN) {
      return res.status(409).json({
        success: false,
        message: 'PAN already registered',
      });
    }

    // Hash password and create user
    const hashedPassword = await authService.hashPassword(password);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        pan: pan.toUpperCase(),
        role: 'user',
      },
    });

    // Generate token
    const token = authService.generateToken(user.id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
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
    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to register user',
      error: error.message,
    });
  }
}

// ────────────────────────────────────────────────────────────────────
// LOGIN - Authenticate user with email and password
// ────────────────────────────────────────────────────────────────────
async function login(req, res) {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    // Find user by email
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Verify password
    const isPasswordValid = await authService.comparePassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Generate token
    const token = authService.generateToken(user.id);

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
    const user = await prisma.user.findUnique({ where: { email } });
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
    await prisma.oTP.create({
      data: {
        userId: user.id,
        code: otp,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      },
    });

    res.status(200).json({
      success: true,
      message: 'OTP sent to your email',
      data: { email },
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
    await prisma.oTP.deleteMany({
      where: {
        userId,
        code,
      },
    });

    // Get user
    const user = await prisma.user.findUnique({ where: { id: userId } });

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

    const user = await prisma.user.findUnique({
      where: { id: userId },
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
    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
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
  signup,
  login,
  sendOTP,
  verifyOTP,
  getCurrentUser,
  updateProfile,
  logout,
};
