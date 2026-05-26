const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');

const env = require('./config/env');
const connectDB = require('./config/db');

// Initialize Firebase Admin (runs initialization logic)
require('./config/firebase');

// Route imports
const authRoutes = require('./routes/auth.routes');
const sosRoutes = require('./routes/sos.routes');
const aiRoutes = require('./routes/ai.routes');
const resourceRoutes = require('./routes/resources.routes');
const volunteerRoutes = require('./routes/volunteers.routes');
const taskRoutes = require('./routes/tasks.routes');
const broadcastRoutes = require('./routes/broadcast.routes');
const responderRoutes = require('./routes/responders.routes');
const adminRoutes = require('./routes/admin.routes');
const uploadRoutes = require('./routes/upload.routes');

const app = express();

// Connect to MongoDB
connectDB();

// Global Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Route Mounts
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/sos', sosRoutes);
app.use('/api/v1/incidents', sosRoutes);
app.use('/api/v1/ai', aiRoutes);
app.use('/api/v1/resources', resourceRoutes);
app.use('/api/v1/volunteers', volunteerRoutes);
app.use('/api/v1/tasks', taskRoutes);
app.use('/api/v1/broadcast', broadcastRoutes);
app.use('/api/v1/responders', responderRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/upload', uploadRoutes);

// Health Check Route
app.get('/health', (req, res) => {
  res.json({ success: true, message: 'Disaster Response API is online and healthy.' });
});

// 404 handler for unmatched routes
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: 'Resource path not found' });
});

// Central Error Handler Middleware
app.use((err, req, res, next) => {
  console.error(`[SERVER-ERROR] ${err.stack || err.message}`);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// Start listening on all network interfaces (0.0.0.0) so other devices can reach this server
const HOST = '0.0.0.0';
const server = app.listen(env.PORT, HOST, () => {
  const { networkInterfaces } = require('os');
  const nets = networkInterfaces();
  let localIP = 'localhost';
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        localIP = net.address;
        break;
      }
    }
  }
  console.log(`✅ Server running in production-ready mode`);
  console.log(`   Local:   http://localhost:${env.PORT}`);
  console.log(`   Network: http://${localIP}:${env.PORT}  ← use this on other devices`);
});

// Initialize Socket.io
const { Server } = require('socket.io');
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Expose io to routes
app.set('io', io);

io.on('connection', (socket) => {
  console.log('New client connected to Socket.IO');
  socket.on('disconnect', () => {
    console.log('Client disconnected from Socket.IO');
  });
});

module.exports = { app, server, io };


// admin@disastersos.com