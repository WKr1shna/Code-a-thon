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

// Start listening
const server = app.listen(env.PORT, () => {
  console.log(`Server running in production-ready mode on port ${env.PORT}`);
});

module.exports = { app, server };
