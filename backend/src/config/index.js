// =============================================================================
// CONFIGURATION - Environment and app settings
// =============================================================================

const config = {
  // Server
  port: process.env.PORT || 5000,
  host: process.env.HOST || '0.0.0.0',
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Database
  database: {
    url: process.env.DATABASE_URL || 'postgresql://localhost:5432/tax_filing'
  },
  
  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key',
    expiry: process.env.JWT_EXPIRY || '7d'
  },
  
  // AWS S3
  s3: {
    bucket: process.env.AWS_S3_BUCKET || 'tax-filing-bucket',
    region: process.env.AWS_S3_REGION || 'us-east-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    endpoint: process.env.AWS_S3_ENDPOINT
  },
  
  // SMTP Email
  smtp: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    user: process.env.SMTP_USER || '',
    password: process.env.SMTP_PASSWORD || '',
    from: process.env.SMTP_FROM || 'noreply@taxfiling.com'
  },
  
  // Razorpay
  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID || '',
    keySecret: process.env.RAZORPAY_KEY_SECRET || ''
  },
  
  // Frontend
  frontend: {
    url: process.env.FRONTEND_URL || 'https://gsttaxwale.com'
  },
};

module.exports = config;
