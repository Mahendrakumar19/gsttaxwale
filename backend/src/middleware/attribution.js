const db = require('../utils/db');

function parseCookies(cookieHeader) {
  const list = {};
  if (!cookieHeader) return list;
  cookieHeader.split(';').forEach(cookie => {
    const parts = cookie.split('=');
    if (parts.length >= 2) {
      list[parts.shift().trim()] = decodeURIComponent(parts.join('='));
    }
  });
  return list;
}

async function attributionMiddleware(req, res, next) {
  try {
    req.cookies = parseCookies(req.headers.cookie);
    
    let refCode = req.query.ref;
    
    // Check for /ref/CODE route
    const refPathRegex = /^\/ref\/([a-zA-Z0-9]+)$/;
    const match = req.path.match(refPathRegex);
    if (match && !['static', '_next', 'api', 'favicon.ico', 'ref'].includes(match[1])) {
      refCode = match[1];
    }
    
    if (refCode) {
      // Validate if code exists in User table
      const [user] = await db.query('SELECT id, name FROM User WHERE referral_code = ?', [refCode]);
      if (user) {
        // Check if user already has an attribution cookie to avoid overwrite
        if (!req.cookies.gtw_ref) {
          res.cookie('gtw_ref', refCode, {
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
            httpOnly: false, // Accessible by frontend React components
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/'
          });
          req.cookies.gtw_ref = refCode; // Add to current request context
          console.log(`🔗 Referral cookie set: gtw_ref=${refCode}`);
          
          // Track event: referral click
          const trackingMetadata = {
            path: req.path,
            query: req.query,
            ip_address: req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || '',
            user_agent: req.headers['user-agent'] || '',
            utm_source: req.query.utm_source || 'referral_link'
          };

          await db.create('referral_events', {
            referrer_id: user.id,
            event_type: 'click',
            metadata: JSON.stringify(trackingMetadata),
            created_at: new Date()
          });
        }
      }
    }
  } catch (err) {
    console.error('Attribution middleware error:', err);
  }
  next();
}

module.exports = attributionMiddleware;
