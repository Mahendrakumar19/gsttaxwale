// ==========================
// MySQL Database Connection
// ==========================
// Load environment variables
require("dotenv").config();

const mysql = require("mysql2");

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

// Handle connection errors
db.connect((err) => {
  if (err) {
    console.error("❌ MySQL Connection Error:", err.message);
    process.exit(1);
  }
  console.log("✅ MySQL Connected:", {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    database: process.env.DB_NAME
  });
});

// Handle connection loss
db.on("error", (err) => {
  console.error("⚠️ Database Error:", err);
  if (err.code === "PROTOCOL_CONNECTION_LOST") {
    console.log("🔄 Reconnecting to database...");
  }
  if (err.code === "ER_CON_COUNT_ERROR") {
    console.log("⚠️ Too many connections to database");
  }
  if (err.code === "ECONNREFUSED") {
    console.log("🔴 Database connection refused");
  }
});

module.exports = db;
