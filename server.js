const path = require("path");
// Load environment variables from root and backend at the very top
require("dotenv").config({ path: path.join(__dirname, ".env") });
require("dotenv").config({ path: path.join(__dirname, "backend/.env") });

const express = require("express");
const cors = require("cors"); // Restarting to pick up .env changes

const http = require("http");
const fs = require("fs");
const next = require("next");
const compression = require("compression");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const attributionMiddleware = require("./backend/src/middleware/attribution");

// Fallback values for critical env vars
if (!process.env.PORT) process.env.PORT = "3000";
if (!process.env.NODE_ENV) {
  // For Hostinger: npm run dev should set NODE_ENV to development
  process.env.NODE_ENV = "development";
}
if (!process.env.HOST) process.env.HOST = "0.0.0.0";
if (!process.env.JWT_SECRET) process.env.JWT_SECRET = "ec434a51ba4be676ac157fa92b92aaf2b32569386b3176b2";
if (!process.env.DB_HOST) process.env.DB_HOST = "194.59.164.75";

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || "0.0.0.0";
// Auto-detect Hostinger production: if no NODE_ENV set but path contains /domains/ it's production
const isHostingerProd = __dirname.includes('/domains/') || __dirname.includes('\\domains\\');
if (!process.env.NODE_ENV && isHostingerProd) {
  process.env.NODE_ENV = 'production';
}
const NODE_ENV = process.env.NODE_ENV || "development";
const IS_PRODUCTION = NODE_ENV === "production";
const IS_DEVELOPMENT = NODE_ENV === "development";

const FRONTEND_DIR = path.join(__dirname, "frontend");
const BACKEND_DIR = path.join(__dirname, "backend");
const NEXT_BUILD_DIR = path.join(FRONTEND_DIR, ".next");

// ─────────────────────────────────────────────────────────────────────────
// EXPRESS & HTTP SETUP
// ─────────────────────────────────────────────────────────────────────────
const app = express();  
const server = http.createServer(app);

// ─────────────────────────────────────────────────────────────────────────
// PRE-FLIGHT: Check .next build exists before starting in production
// ─────────────────────────────────────────────────────────────────────────
const NEXT_BUILD_ID = path.join(FRONTEND_DIR, ".next", "BUILD_ID");
if (IS_PRODUCTION && !fs.existsSync(NEXT_BUILD_ID)) {
  console.error("\n");
  console.error("╔══════════════════════════════════════════════════════════════╗");
  console.error("║  ❌ MISSING PRODUCTION BUILD — CANNOT START SERVER           ║");
  console.error("╠══════════════════════════════════════════════════════════════╣");
  console.error("║  The frontend/.next directory is missing or incomplete.      ║");
  console.error("║  You must run 'npm run build' before starting the server.    ║");
  console.error("║                                                              ║");
  console.error("║  On Hostinger Terminal:                                      ║");
  console.error("║    cd /home/u963801592/domains/gsttaxwale.com/nodejs         ║");
  console.error("║    npm run build                                             ║");
  console.error("║    npm start                                                 ║");
  console.error("╚══════════════════════════════════════════════════════════════╝");
  console.error("\n");
  process.exit(1);
}

// ─────────────────────────────────────────────────────────────────────────
// NEXT.JS FRONTEND SETUP
// ─────────────────────────────────────────────────────────────────────────
const nextApp = next({ dev: !IS_PRODUCTION, dir: FRONTEND_DIR });
const nextHandler = nextApp.getRequestHandler();

// ─────────────────────────────────────────────────────────────────────────
// CORS & MIDDLEWARE
// ─────────────────────────────────────────────────────────────────────────
const ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:3001",
  "https://gsttaxwale.com",
  "https://www.gsttaxwale.com",
  "http://gsttaxwale.com",
  "http://www.gsttaxwale.com",
  // Hostinger internal preview / staging subdomains
  "https://*.hostingersite.com",
  process.env.FRONTEND_URL,
  // Extra origins via env var (comma-separated)
  ...(process.env.EXTRA_ORIGINS
    ? process.env.EXTRA_ORIGINS.split(",").map(o => o.trim())
    : []),
].filter(Boolean);

// Build a list of regex patterns once at startup (not per-request)
const ALLOWED_ORIGIN_PATTERNS = ALLOWED_ORIGINS.map(origin => {
  if (origin.includes("*")) {
    // Escape all regex special chars EXCEPT *, then replace * with .*
    const escaped = origin.replace(/[-[\]{}()+?.,\\^$|#\s]/g, "\\$&").replace(/\*/g, ".*");
    return new RegExp(`^${escaped}$`);
  }
  return null; // exact match — handled by Set lookup below
});
const ALLOWED_ORIGIN_SET = new Set(ALLOWED_ORIGINS.filter(o => !o.includes("*")));

function isOriginAllowed(origin) {
  // 1. Exact match (fastest)
  if (ALLOWED_ORIGIN_SET.has(origin)) return true;
  // 2. Wildcard pattern match
  return ALLOWED_ORIGIN_PATTERNS.some(pattern => pattern && pattern.test(origin));
}

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (SSR, mobile apps, curl, LiteSpeed crawler)
    if (!origin) return callback(null, true);

    if (isOriginAllowed(origin) || !IS_PRODUCTION) {
      callback(null, true);
    } else {
      console.warn(`⚠️  CORS REJECTED: ${origin}`);
      callback(new Error(`CORS: origin '${origin}' is not allowed`));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
};


app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

if (IS_PRODUCTION) {
  app.use(compression());
}

if (IS_PRODUCTION) {

  app.use(morgan("combined"));
}

// ─────────────────────────────────────────────────────────────────────────
// GLOBAL REQUEST TIMEOUT — prevent 504s from Hostinger CDN
// Hostinger's edge times out after ~30s; we respond with 503 at 25s
// so the client gets a clean error instead of a CDN gateway page.
// ─────────────────────────────────────────────────────────────────────────
const REQUEST_TIMEOUT_MS = 25000;
app.use((req, res, next) => {
  // Skip timeout for static assets — they are fast by definition
  if (req.path.startsWith('/_next/') || req.path.startsWith('/banners/') ||
      req.path.startsWith('/uploads/')) {
    return next();
  }
  const timer = setTimeout(() => {
    if (!res.headersSent) {
      console.error(`⏱️  [TIMEOUT] ${req.method} ${req.originalUrl} exceeded ${REQUEST_TIMEOUT_MS}ms`);
      res.status(503).json({ error: true, message: 'Server is temporarily busy. Please try again.' });
    }
  }, REQUEST_TIMEOUT_MS);
  // Clear timer once response is sent so it doesn't fire late
  res.on('finish', () => clearTimeout(timer));
  res.on('close',  () => clearTimeout(timer));
  next();
});

// Request logging middleware
app.use((req, res, next) => {
  const time = new Date().toISOString().split('T')[1].split('.')[0];
  const method = req.method.padEnd(6);
  const url = req.originalUrl.substring(0, 50).padEnd(50);
  
  res.on('finish', () => {
    const status = res.statusCode;
    const icon = status < 300 ? '✅' : status < 400 ? 'ℹ️ ' : '❌';
    console.log(`${icon} [${time}] ${method} ${url} → ${status}`);
  });
  
  next();
});

// ─────────────────────────────────────────────────────────────────────────
// 1. MOUNT STATIC FILES & API ROUTES IMMEDIATELY (Top-Level)
// These do NOT depend on Next.js preparation and must serve instantly.
// ─────────────────────────────────────────────────────────────────────────

// Backend uploads
if (fs.existsSync(path.join(BACKEND_DIR, "uploads"))) {
  app.use("/uploads", express.static(path.join(BACKEND_DIR, "uploads")));
}

// Next.js static build directory (production)
if (IS_PRODUCTION) {
  const NEXT_STATIC_DIR = path.join(NEXT_BUILD_DIR, "static");
  if (fs.existsSync(NEXT_STATIC_DIR)) {
    app.use("/_next/static", express.static(NEXT_STATIC_DIR, {
      maxAge: "1y",
      immutable: true,
    }));
  }
}

// Public static assets (logo, banners, favicon, hero images)
if (fs.existsSync(path.join(FRONTEND_DIR, "public"))) {
  app.use(express.static(path.join(FRONTEND_DIR, "public")));
}

// 🚀 Backend API Routes
try {
  const mountApi = require(path.join(__dirname, "backend/src/routes/api"));
  mountApi(app);
  console.log("✅ Backend API routes mounted synchronously");
} catch (error) {
  console.error("❌ Failed to mount API routes:", error.message);
}

// Health Checks
app.get("/health", (req, res) => {
  res.json({ status: "OK", service: "unified-server", environment: NODE_ENV });
});
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", api: "active" });
});

// Capture referral cookie/attribution
app.use(attributionMiddleware);

// ─────────────────────────────────────────────────────────────────────────
// 2. NEXT.JS PAGE ROUTER & BOOTSTRAP QUEUE
// ─────────────────────────────────────────────────────────────────────────
let isNextReady = false;
const pendingRequests = [];
const BOOTSTRAP_TIMEOUT_MS = 25000;

// Catch-all handler for Next.js frontend pages
app.all("*", (req, res) => {
  if (isNextReady) {
    return nextHandler(req, res);
  }

  console.log(`⏳ [BOOTSTRAP] Queueing page request ${req.method} ${req.originalUrl}...`);

  const timer = setTimeout(() => {
    if (!res.headersSent) {
      console.error(`⏱️  [BOOTSTRAP TIMEOUT] ${req.method} ${req.originalUrl} — Next.js preparing`);
      res.status(503).json({ error: true, message: "Server starting up. Please refresh." });
    }
  }, BOOTSTRAP_TIMEOUT_MS);

  pendingRequests.push({ req, res, timer });
});

// Global Express Error Handler
app.use((err, req, res, next) => {
  const status = err.status || 500;
  console.error(`❌ [ERROR] ${req.method} ${req.path} → ${err.message}`);
  res.status(status).json({
    error: true,
    message: err.message || "Internal Server Error",
  });
});

// ─────────────────────────────────────────────────────────────────────────
// 3. ASYNC NEXT.JS PREPARE & SERVER LISTEN
// ─────────────────────────────────────────────────────────────────────────
nextApp.prepare().then(() => {
  console.log("✅ Next.js frontend prepared");
  isNextReady = true;

  // Flush any page requests queued during startup
  if (pendingRequests.length > 0) {
    console.log(`🚀 [BOOTSTRAP] Next.js prepared! Flushing ${pendingRequests.length} queued page requests.`);
    while (pendingRequests.length > 0) {
      const { req: pReq, res: pRes, timer } = pendingRequests.shift();
      clearTimeout(timer);
      if (!pRes.headersSent) {
        nextHandler(pReq, pRes);
      }
    }
  }

  // Single server instance guard for Hostinger Passenger vs CLI
  if (require.main === module && !server.listening) {
    server.listen(PORT, HOST, () => {
      console.log(`
╔════════════════════════════════════════════════════════════╗
║  🎯 TAX PLATFORM SERVER STARTED                           ║
╠════════════════════════════════════════════════════════════╣
║  🌐 URL: http://localhost:${PORT}                          ║
║  ⚙️  Mode: ${NODE_ENV.toUpperCase()}                       ║
║  📦 Type: ${IS_DEVELOPMENT ? 'Development (npm run dev)' : 'Production (npm start)'}   ║
╚════════════════════════════════════════════════════════════╝
      `);
    });
  }

}).catch((error) => {
  console.error("\n❌ [FATAL] Failed to start Next.js:", error);
  process.exit(1);
});

// Graceful shutdown
const handleShutdown = (signal) => {
  console.log(`\n⏹️  [SHUTDOWN] Received ${signal}`);
  server.close(() => {
    console.log("✅ Server closed\n");
    process.exit(0);
  });
};

process.on("SIGINT", () => handleShutdown("SIGINT"));
process.on("SIGTERM", () => handleShutdown("SIGTERM"));

module.exports = app;
