const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// ────────────────────────────────────────────────────────────────────
// PASSWORD HASHING
// ────────────────────────────────────────────────────────────────────
async function hashPassword(password) {
  const rounds = parseInt(process.env.BCRYPT_ROUNDS || 10);
  return await bcrypt.hash(password, rounds);
}

async function comparePassword(password, hashedPassword) {
  return await bcrypt.compare(password, hashedPassword);
}

// ────────────────────────────────────────────────────────────────────
// JWT TOKEN OPERATIONS
// ────────────────────────────────────────────────────────────────────
function generateToken(userId) {
  return jwt.sign(
    { userId, iat: Math.floor(Date.now() / 1000) },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRY || '7d' }
  );
}

function verifyToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
}

// ────────────────────────────────────────────────────────────────────
// API RESPONSE FORMATTING
// ────────────────────────────────────────────────────────────────────
function successResponse(data, message = 'Success') {
  return {
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  };
}

function errorResponse(message, statusCode = 500) {
  return {
    success: false,
    message,
    statusCode,
    timestamp: new Date().toISOString(),
  };
}

// ────────────────────────────────────────────────────────────────────
// VALIDATION HELPERS
// ────────────────────────────────────────────────────────────────────
function validateEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

function validatePassword(password) {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return regex.test(password);
}

// ────────────────────────────────────────────────────────────────────
// ERROR CLASSES
// ────────────────────────────────────────────────────────────────────
class APIError extends Error {
  constructor(message, status = 500) {
    super(message);
    this.status = status;
  }
}

// ────────────────────────────────────────────────────────────────────
// PAGINATION HELPER
// ────────────────────────────────────────────────────────────────────
function getPaginationParams(page = 1, limit = 20) {
  const skip = (parseInt(page) - 1) * parseInt(limit);
  return {
    skip,
    take: parseInt(limit),
    page: parseInt(page),
  };
}

module.exports = {
  hashPassword,
  comparePassword,
  generateToken,
  verifyToken,
  successResponse,
  errorResponse,
  validateEmail,
  validatePassword,
  APIError,
  getPaginationParams,
};
