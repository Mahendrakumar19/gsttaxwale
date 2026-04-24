require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIO = require('socket.io');
const { v4: uuidv4 } = require('uuid');

// ─────────────────────────────────────────────────────────────────────
// CORE SETUP
// ─────────────────────────────────────────────────────────────────────
const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3001',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// ─────────────────────────────────────────────────────────────────────
// MIDDLEWARE
// ─────────────────────────────────────────────────────────────────────
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      process.env.FRONTEND_URL,
      'http://localhost:3001',
      'http://localhost:3000',
      'https://gsttaxwale.com',
    ];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request ID middleware
app.use((req, res, next) => {
  req.id = uuidv4();
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ─────────────────────────────────────────────────────────────────────
// ROUTES
// ─────────────────────────────────────────────────────────────────────
const apiRoutes = require('./routes/api');

// API Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'SaaS Platform API is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Mount API routes
app.use('/api', apiRoutes);

// ─────────────────────────────────────────────────────────────────────
// SOCKET.IO REAL-TIME EVENTS
// ─────────────────────────────────────────────────────────────────────
const connectedUsers = new Map();

io.on('connection', (socket) => {
  console.log(`📱 User connected: ${socket.id}`);
  connectedUsers.set(socket.id, socket);

  // User authentication
  socket.on('user:auth', (data) => {
    console.log(`🔐 User authenticated: ${data.userId}`);
    socket.userId = data.userId;
    socket.broadcast.emit('user:online', { userId: data.userId, socketId: socket.id });
  });

  // Report processing started
  socket.on('report:processing', (data) => {
    console.log(`⚙️ Report processing: ${data.reportId}`);
    io.emit('report:status', {
      reportId: data.reportId,
      status: 'processing',
      progress: 0,
    });
  });

  // Report completed
  socket.on('report:completed', (data) => {
    console.log(`✅ Report completed: ${data.reportId}`);
    io.emit('report:status', {
      reportId: data.reportId,
      status: 'completed',
      progress: 100,
      pdfUrl: data.pdfUrl,
    });
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log(`❌ User disconnected: ${socket.id}`);
    connectedUsers.delete(socket.id);
    socket.broadcast.emit('user:offline', { socketId: socket.id });
  });

  // Error handling
  socket.on('error', (error) => {
    console.error(`⚠️ Socket error: ${error}`);
  });
});

// ─────────────────────────────────────────────────────────────────────
// ERROR HANDLING
// ─────────────────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('❌ Error:', err);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
      status: err.status || 500,
      requestId: req.id,
    },
  });
});

app.use((req, res) => {
  res.status(404).json({
    error: {
      message: 'Route not found',
      status: 404,
      path: req.path,
    },
  });
});

// ─────────────────────────────────────────────────────────────────────
// SERVER STARTUP
// ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';

server.listen(PORT, HOST, () => {
  console.log(`
╔════════════════════════════════════════════════╗
║  🚀 SaaS Platform Backend Server Started       ║
║                                                ║
║  🔗 API: http://${HOST}:${PORT}
║  📡 WebSocket: ws://${HOST}:${PORT}
║  🌍 Frontend: ${process.env.FRONTEND_URL}
║  🗄️  Database: ${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}
║                                                ║
╚════════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

module.exports = { app, server, io };
