// In-Memory Cache Utility for Node.js API Routes
const cacheStore = new Map();

/**
 * Set value in cache with TTL in seconds (default: 300 seconds / 5 mins)
 */
function set(key, value, ttlSeconds = 300) {
  const expiresAt = Date.now() + ttlSeconds * 1000;
  cacheStore.set(key, { value, expiresAt });
}

/**
 * Get value from cache if not expired
 */
function get(key) {
  const cached = cacheStore.get(key);
  if (!cached) return null;
  if (Date.now() > cached.expiresAt) {
    cacheStore.delete(key);
    return null;
  }
  return cached.value;
}

/**
 * Delete key or keys matching prefix pattern
 */
function purge(pattern) {
  for (const key of cacheStore.keys()) {
    if (key.includes(pattern)) {
      cacheStore.delete(key);
    }
  }
}

/**
 * Clear all cache entries
 */
function clear() {
  cacheStore.clear();
}

/**
 * Express middleware for automatic response caching on GET routes
 * @param {number} ttlSeconds - Time to live in seconds (default: 300)
 */
function cacheMiddleware(ttlSeconds = 300) {
  return (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    const key = `cache:${req.originalUrl || req.url}`;
    const cachedData = get(key);

    if (cachedData) {
      res.setHeader('X-Cache', 'HIT');
      res.setHeader('Cache-Control', `public, max-age=${ttlSeconds}, s-maxage=${ttlSeconds}`);
      return res.status(200).json(cachedData);
    }

    // Intercept res.json to capture response payload
    const originalJson = res.json.bind(res);
    res.json = (body) => {
      // Only cache successful 200 responses
      if (res.statusCode >= 200 && res.statusCode < 300) {
        set(key, body, ttlSeconds);
        res.setHeader('X-Cache', 'MISS');
      }
      return originalJson(body);
    };

    next();
  };
}

module.exports = {
  set,
  get,
  purge,
  clear,
  cacheMiddleware,
};
