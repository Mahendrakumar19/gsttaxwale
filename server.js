const express = require("express");
const cors = require("cors");
const path = require("path");
const http = require("http");
const fs = require("fs");
const next = require("next");
const compression = require("compression");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

// Load environment variables from root and backend
require("dotenv").config({ path: path.join(__dirname, ".env") });
require("dotenv").config({ path: path.join(__dirname, "backend/.env") });

// Fallback values for critical env vars
if (!process.env.PORT) process.env.PORT = "3000";
if (!process.env.NODE_ENV) process.env.NODE_ENV = "production";
if (!process.env.HOST) process.env.HOST = "0.0.0.0";
if (!process.env.JWT_SECRET) process.env.JWT_SECRET = "ec434a51ba4be676ac157fa92b92aaf2b32569386b3176b2";
if (!process.env.DB_HOST) process.env.DB_HOST = "194.59.164.75";

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || "0.0.0.0";
const NODE_ENV = process.env.NODE_ENV || "production";
const IS_PRODUCTION = NODE_ENV === "production";

const FRONTEND_DIR = path.join(__dirname, "frontend");
const BACKEND_DIR = path.join(__dirname, "backend");
const NEXT_BUILD_DIR = path.join(FRONTEND_DIR, ".next");

// ─────────────────────────────────────────────────────────────────────────
// STARTUP CHECK
// ─────────────────────────────────────────────────────────────────────────
console.log("\n╔════════════════════════════════════════════════════════════╗");
console.log("║  TAX PLATFORM - UNIFIED SERVER                            ║");
console.log("╚════════════════════════════════════════════════════════════╝\n");

console.log("🔍 Checking frontend build...");
if (!fs.existsSync(NEXT_BUILD_DIR)) {
  console.error("\n❌ FATAL: .next build not found");
  console.error("Run: npm run build\n");
  process.exit(1);
}
console.log("✅ Frontend build verified");

// ─────────────────────────────────────────────────────────────────────────
// EXPRESS & HTTP SETUP
// ─────────────────────────────────────────────────────────────────────────
const app = express();  
const server = http.createServer(app);

// ─────────────────────────────────────────────────────────────────────────
// CORS CONFIGURATION
// ─────────────────────────────────────────────────────────────────────────
const ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://127.0.0.1:3000",
  "https://gsttaxwale.com",
  "https://www.gsttaxwale.com",
  process.env.FRONTEND_URL, // From environment variable
].filter(Boolean); // Remove undefined values

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`⚠️  CORS: Blocked origin: ${origin}`);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true, // Allow credentials (cookies, authorization headers)
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  exposedHeaders: ["X-Total-Count", "X-Page-Count"], // Headers visible to client
  maxAge: 3600, // Preflight request cache time
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Handle preflight requests
app.options("*", cors(corsOptions));

// Body parsers
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Add compression middleware
app.use(compression());

// Add request logging for production
if (IS_PRODUCTION) {
  app.use(morgan("combined"));
}

// Add rate limiting to prevent abuse
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  skip: (req) => req.path === "/health", // Skip health checks
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
});
app.use("/api", limiter);

// Request logging
app.use((req, res, next) => {
  const time = new Date().toISOString().split('T')[1].split('.')[0];
  const method = req.method.padEnd(6);
  const url = req.originalUrl.substring(0, 50).padEnd(50);
  const path = req.path;
  
  // Log API requests in detail
  if (req.originalUrl.includes('/api/')) {
    console.log(`📋 [${time}] API Request: ${method} ${req.originalUrl} (path: ${path})`);
  }
  
  res.on('finish', () => {
    const status = res.statusCode;
    const icon = status < 300 ? '✅' : status < 400 ? 'ℹ️ ' : '❌';
    console.log(`${icon} [${time}] ${method} ${url} → ${status}`);
  });
  
  next();
});

// Improved API error logging
app.use((err, req, res, next) => {
  if (req.originalUrl.startsWith('/api')) {
    console.error(`❌ [API ERROR] ${req.method} ${req.originalUrl} → ${err.message}`);
  }
  next(err);
});

// ─────────────────────────────────────────────────────────────────────────
// HEALTH ENDPOINTS
// ─────────────────────────────────────────────────────────────────────────
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    service: "unified-server",
    environment: NODE_ENV,
    uptime: process.uptime(),
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    api: "active",
    backend: "ready",
    frontend: "enabled",
  });
});

// ─────────────────────────────────────────────────────────────────────────
// MOUNT STATIC FILES
// ─────────────────────────────────────────────────────────────────────────
if (fs.existsSync(path.join(BACKEND_DIR, "uploads"))) {
  app.use("/uploads", express.static(path.join(BACKEND_DIR, "uploads")));
}

if (fs.existsSync(path.join(FRONTEND_DIR, "public"))) {
  app.use(express.static(path.join(FRONTEND_DIR, "public")));
}

// ─────────────────────────────────────────────────────────────────────────
// BACKEND API ROUTES (mounted at /api)
// ─────────────────────────────────────────────────────────────────────────
try {
  const apiRoutes = require("./backend/src/routes/api");
  app.use("/api", apiRoutes);
  console.log("✅ Backend API routes mounted");
} catch (error) {
  console.warn("⚠️  Backend routes not available:", error.message.split('\n')[0]);
}

// ─────────────────────────────────────────────────────────────────────────
// NEXT.JS FRONTEND (all remaining routes)
// ─────────────────────────────────────────────────────────────────────────
const nextApp = next({ dev: !IS_PRODUCTION, dir: FRONTEND_DIR });
const nextHandler = nextApp.getRequestHandler();

// ─────────────────────────────────────────────────────────────────────
// START SERVER (only once)
// ─────────────────────────────────────────────────────────────────────
let serverStarted = false;

nextApp.prepare().then(() => {
  console.log("✅ Next.js frontend prepared");
  
  // Ensure API routes are mounted BEFORE the catch-all
  // All remaining routes go to Next.js as a catch-all
  app.get("/", (req, res) => {
    return nextHandler(req, res);
  });
  
  // Catch-all for all other routes (must be last before error handler)
  app.all("*", (req, res) => {
    return nextHandler(req, res);
  });

  // Error handler (must be absolute last)
  app.use((err, req, res, next) => {
    const isNextStatic = req.path.startsWith('/_next/static');
    
    if (isNextStatic) {
      console.error(`⚠️  [STATIC ERROR] Failed to serve Next.js asset: ${req.path}`);
      console.error(`   Reason: ${err.message}. This usually means the server needs a restart after a new build.`);
    } else {
      console.error(`❌ [ERROR] ${req.method} ${req.path} → ${err.message}`);
    }

    res.status(err.status || 500).json({
      error: true,
      message: isNextStatic 
        ? "Static asset missing - please restart the server" 
        : (err.message || "Internal Server Error"),
      ...(IS_PRODUCTION ? {} : { stack: err.stack }),
    });
  });

  // Start server only once
  if (!serverStarted) {
    serverStarted = true;
    server.listen(PORT, HOST, () => {
      const displayHost = HOST === "0.0.0.0" ? "localhost" : HOST;
      console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║        🎯 TAX PLATFORM SERVER STARTED                      ║
║                                                            ║
╠════════════════════════════════════════════════════════════╣
║                                                            ║
║  🌐 URL:        http://${displayHost}:${PORT}
║  📦 Frontend:    Next.js (${IS_PRODUCTION ? "Production" : "Development"})
║  ⚙️  Backend:     Express API at /api
║  🔒 CORS:        Enabled
║  📝 Mode:        ${NODE_ENV.toUpperCase()}
║  ✅ Status:      Ready
║                                                            ║
╚════════════════════════════════════════════════════════════╝

📖 Health Checks:
   🔗 http://${displayHost}:${PORT}/health
   🔧 http://${displayHost}:${PORT}/api/health
      `);
    });
  }

}).catch((error) => {
  console.error("\n❌ [FATAL] Failed to start Next.js:", error);
  process.exit(1);
});

// ─────────────────────────────────────────────────────────────────────────
// GRACEFUL SHUTDOWN
// ─────────────────────────────────────────────────────────────────────────
const handleShutdown = (signal) => {
  console.log(`\n⏹️  [SHUTDOWN] Received ${signal}, closing gracefully...`);
  
  server.close(() => {
    console.log("✅ [SHUTDOWN] Server closed successfully\n");
    process.exit(0);
  });
  
  // Force exit after 10 seconds
  setTimeout(() => {
    console.error("❌ [SHUTDOWN] Forced exit after timeout\n");
    process.exit(1);
  }, 10000);
};

process.on("SIGINT", () => handleShutdown("SIGINT"));
process.on("SIGTERM", () => handleShutdown("SIGTERM"));

process.on("unhandledRejection", (reason) => {
  console.error("❌ [UNHANDLED] Promise rejection:", reason);
});

process.on("uncaughtException", (error) => {
  console.error("❌ [UNCAUGHT] Exception:", error);
  process.exit(1);
});

module.exports = app;
