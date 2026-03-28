const express = require("express");
const path = require("path");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes (if needed)
try {
  app.use("/api", require("./src/routes/api"));
} catch (err) {
  console.log("No API routes found, continuing...");
}

// Serve backend routes
const PORT = process.env.PORT || 5000;

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "Server is running" });
});

// Start server
const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`
╔════════════════════════════════════════════════╗
║  🚀 GST Tax Wale Backend Server Started       ║
║                                                ║
║  🔗 API: http://0.0.0.0:${PORT}
║  ✅ Ready for requests                        ║
║                                                ║
╚════════════════════════════════════════════════╝
  `);
});

// Handle graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM signal received: closing HTTP server");
  server.close(() => {
    console.log("HTTP server closed");
  });
});

