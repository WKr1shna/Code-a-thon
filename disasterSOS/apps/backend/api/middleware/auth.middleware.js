const jwt = require('jsonwebtoken');
const env = require('../config/env');
const User = require('../models/User.model');

// Middleware to strictly enforce authentication
const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-passwordHash');

    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found in system' });
    }

    if (user.isBanned) {
      return res.status(403).json({ success: false, message: 'Your account has been banned' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Not authorized, token invalid or expired' });
  }
};

// Optional auth to attach user object if token exists without throwing 401
const optionalAuth = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-passwordHash');
    if (user && !user.isBanned) {
      req.user = user;
    }
    next();
  } catch (error) {
    // fail silently for optional authentication
    next();
  }
};

module.exports = { protect, optionalAuth };
