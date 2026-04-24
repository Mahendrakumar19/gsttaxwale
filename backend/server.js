const express = require("express");
const next = require("next");
const path = require("path");
const cors = require("cors");
const fs = require("fs");

// Load environment variables
require("dotenv").config();

// Initialize Next.js
const dev = process.env.NODE_ENV !== "production";
const FRONTEND_DIR = fs.existsSync(path.join(__dirname, "../frontend")) 
  ? path.join(__dirname, "../frontend")
  : path.join(__dirname, "../public_html/frontend");

console.log(`ℹ️  Next.js dir: ${FRONTEND_DIR}`);

const app = next({ dev, dir: FRONTEND_DIR });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = express();

  // CORS configuration
  const corsOptions = {
    credentials: true,
    origin: dev ? true : (process.env.FRONTEND_URL || 'https://gsttaxwale.com'),
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  };

  server.use(cors(corsOptions));
  server.use(express.json());

  // 1. Next.js Internal Routes (PRIORITY)
  server.all("/_next*", (req, res) => {
    if (req.path.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
    }
    return handle(req, res);
  });

  // 2. Static Assets
  if (!dev) {
    const NEXT_STATIC_DIR = path.join(FRONTEND_DIR, ".next/static");
    if (fs.existsSync(NEXT_STATIC_DIR)) {
      server.use("/_next/static", express.static(NEXT_STATIC_DIR, {
        maxAge: "1y",
        immutable: true,
      }));
    }
  }

  const PUBLIC_DIR = path.join(FRONTEND_DIR, "public");
  if (fs.existsSync(PUBLIC_DIR)) {
    server.use(express.static(PUBLIC_DIR));
  }

  // 3. Health check
  server.get("/health", (req, res) => {
    res.json({ status: "ok", environment: process.env.NODE_ENV });
  });

  // 4. Backend API routes
  try {
    server.use("/api", require("./src/routes/api"));
  } catch (err) {
    console.log("⚠️ No API routes found");
  }

  // 5. Next.js catch-all
  server.all("*", (req, res) => {
    return handle(req, res);
  });

  const PORT = process.env.PORT || 3000;
  server.listen(PORT, "0.0.0.0", () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
  });
}).catch((err) => {
  console.error("❌ Failed to start server:", err);
  process.exit(1);
});
