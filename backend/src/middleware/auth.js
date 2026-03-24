const jwt = require('jsonwebtoken');
const config = require('../config/index');

// ────────────────────────────────────────────────────────────────────
// AUTHENTICATE JWT TOKEN
// ────────────────────────────────────────────────────────────────────
function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Missing or invalid authorization header'
      });
    }

    const token = authHeader.substring(7);
    
    try {
      const decoded = jwt.verify(token, config.jwt.secret);
      req.userId = decoded.userId;
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Authentication error'
    });
  }
}

// ────────────────────────────────────────────────────────────────────
// ADMIN ROLE CHECK
// ────────────────────────────────────────────────────────────────────
function adminOnly(req, res, next) {
  if (req.userRole !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }
  next();
}

// ────────────────────────────────────────────────────────────────────
// CA ROLE CHECK
// ────────────────────────────────────────────────────────────────────
function caOnly(req, res, next) {
  if (req.userRole !== 'ca') {
    return res.status(403).json({
      success: false,
      message: 'CA access required'
    });
  }
  next();
}

// ────────────────────────────────────────────────────────────────────
// ERROR HANDLER MIDDLEWARE
// ────────────────────────────────────────────────────────────────────
function errorHandler(err, req, res, next) {
  console.error('Error:', err);

  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(status).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { 
      stack: err.stack,
      details: err
    })
  });
}

// ────────────────────────────────────────────────────────────────────
// ASYNC HANDLER - Wrapper for async route handlers
// ────────────────────────────────────────────────────────────────────
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = {
  authenticate,
  adminOnly,
  caOnly,
  errorHandler,
  asyncHandler
};
