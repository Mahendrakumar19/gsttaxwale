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
if (!process.env.NODE_ENV) {
  const lifecycle = process.env.npm_lifecycle_event || "";
  process.env.NODE_ENV = lifecycle === "dev" ? "development" : "production";
}
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
// EXPRESS & HTTP SETUP
// ─────────────────────────────────────────────────────────────────────────
const app = express();  
const server = http.createServer(app);

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
  "https://gsttaxwale.com",
  "https://www.gsttaxwale.com",
  process.env.FRONTEND_URL,
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
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
// START SERVER AFTER NEXT.JS PREPARE
// ─────────────────────────────────────────────────────────────────────────
nextApp.prepare().then(() => {
  console.log("✅ Next.js frontend prepared");

  // 1. Next.js Internal Routes (PRIORITY)
  // We use .all() with a wildcard to ensure the prefix is NOT stripped.
  app.all("/_next*", (req, res) => {
    // Force CSS MIME type for dev mode styles to fix "plain text" issue
    if (req.path.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
    }
    return nextHandler(req, res);
  });

  // 2. Health Checks
  app.get("/health", (req, res) => {
    res.json({ status: "OK", service: "unified-server", environment: NODE_ENV });
  });

  app.get("/api/health", (req, res) => {
    res.json({ status: "OK", api: "active" });
  });

  // 3. Static Files
  if (fs.existsSync(path.join(BACKEND_DIR, "uploads"))) {
    app.use("/uploads", express.static(path.join(BACKEND_DIR, "uploads")));
  }
  
  if (IS_PRODUCTION) {
    const NEXT_STATIC_DIR = path.join(NEXT_BUILD_DIR, "static");
    if (fs.existsSync(NEXT_STATIC_DIR)) {
      app.use("/_next/static", express.static(NEXT_STATIC_DIR, {
        maxAge: "1y",
        immutable: true,
      }));
    }
  }

  if (fs.existsSync(path.join(FRONTEND_DIR, "public"))) {
    app.use(express.static(path.join(FRONTEND_DIR, "public")));
  }

  // 4. Backend API Routes
  try {
    const apiRoutes = require("./backend/src/routes/api");
    app.use("/api", apiRoutes);
    console.log("✅ Backend API routes mounted");
  } catch (error) {
    console.warn("⚠️  Backend routes not available");
  }

  // 5. Catch-all for Next.js
  app.all("*", (req, res) => {
    return nextHandler(req, res);
  });

  // Error handler
  app.use((err, req, res, next) => {
    const status = err.status || 500;
    console.error(`❌ [ERROR] ${req.method} ${req.path} → ${err.message}`);
    res.status(status).json({
      error: true,
      message: err.message || "Internal Server Error",
    });
  });

  server.listen(PORT, HOST, () => {
    console.log(`
╔════════════════════════════════════════════════════════════╗
║  🎯 TAX PLATFORM SERVER STARTED                           ║
╠════════════════════════════════════════════════════════════╣
║  🌐 URL: http://localhost:${PORT}                          ║
║  ⚙️  Mode: ${NODE_ENV.toUpperCase()}                          ║
╚════════════════════════════════════════════════════════════╝
    `);
  });
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
