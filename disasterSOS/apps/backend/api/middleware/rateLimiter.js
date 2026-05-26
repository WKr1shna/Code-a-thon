const rateLimit = require('express-rate-limit');

// Strict rate limit for SOS report creation: 150 requests per 10 minutes per phone number/IP (relaxed for dev/presentation)
const sosLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 150,
  message: {
    success: false,
    message: 'Too many SOS alerts reported from this phone number/device. Please wait before submitting another report.'
  },
  keyGenerator: (req) => {
    // Limit by phone number if supplied, otherwise by IP address
    return req.body.phone || req.ip;
  },
  standardHeaders: true,
  legacyHeaders: false
});

// General global rate limiting for API
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: {
    success: false,
    message: 'Too many requests. Please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = { sosLimiter, apiLimiter };
