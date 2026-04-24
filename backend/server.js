// ==========================
// Next.js + Express Server
// ==========================
// Load environment variables
require("dotenv").config();

const express = require("express");
const next = require("next");
const path = require("path");
const cors = require("cors");

// Initialize Next.js
const dev = process.env.NODE_ENV !== "production";
const app = next({
  dev,
  dir: path.join(__dirname, "../public_html/frontend"),
});

const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = express();

  // Middleware - CORS configuration
  const corsOptions = {
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 200
  };

  // Dynamic origin for dev vs production
  if (process.env.NODE_ENV === 'development') {
    corsOptions.origin = ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000', 'http://127.0.0.1:3001'];
  } else {
    corsOptions.origin = process.env.FRONTEND_URL || 'https://gsttaxwale.com';
  }

  server.use(cors(corsOptions));
  server.use(express.json());
  server.use(express.urlencoded({ extended: true }));

  // Health check endpoint
  server.get("/health", (req, res) => {
    res.json({ status: "ok", environment: process.env.NODE_ENV });
  });

  // Backend API routes (if any exist)
  try {
    server.use("/api", require("./src/routes/api"));
  } catch (err) {
    console.log("⚠️ No API routes found, continuing...");
  }

  // Next.js handler (catch-all for all other routes)
  server.all("*", (req, res) => {
    return handle(req, res);
  });

  // Error handling
  process.on("unhandledRejection", (reason, promise) => {
    console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
  });

  process.on("uncaughtException", (error) => {
    console.error("❌ Uncaught Exception:", error);
    process.exit(1);
  });

  // Start server
  const PORT = process.env.PORT || 3000;
  const httpServer = server.listen(PORT, "0.0.0.0", () => {
    console.log(`
╔════════════════════════════════════════════════╗
║   ✅ Next.js Server Running                   ║
╠════════════════════════════════════════════════╣
║   🌍 URL: http://0.0.0.0:${PORT}
║   📁 Frontend: public_html/frontend            ║
║   ⚙️  Environment: ${process.env.NODE_ENV || "development"}
║   🔧 Database: ${process.env.DATABASE_PROVIDER || "not configured"}
╚════════════════════════════════════════════════╝
    `);
  });

  // Handle graceful shutdown
  process.on("SIGTERM", () => {
    console.log("SIGTERM signal received: closing HTTP server");
    httpServer.close(() => {
      console.log("HTTP server closed");
    });
  });
}).catch((err) => {
  console.error("❌ Failed to prepare Next.js:", err);
  process.exit(1);
});

