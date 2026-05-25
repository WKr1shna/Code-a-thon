const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const env = require('../config/env');
const User = require('../models/User.model');

const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { userId: user._id, role: user.role, name: user.name, district: user.district },
    env.JWT_SECRET,
    { expiresIn: '15m' }
  );
  const refreshToken = jwt.sign(
    { userId: user._id },
    env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
  return { accessToken, refreshToken };
};

exports.register = async (req, res, next) => {
  try {
    const { name, phone, email, password, role, district, language } = req.body;
    
    // Check user exists
    const userExists = await User.findOne({ $or: [{ email }, { phone }] });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User with this email or phone already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = new User({
      name,
      phone,
      email,
      passwordHash,
      role: role || 'citizen',
      district,
      language: language || 'en'
    });

    const tokens = generateTokens(user);
    user.refreshToken = tokens.refreshToken;
    await user.save();

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          district: user.district,
          language: user.language
        },
        ...tokens
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (user.isBanned) {
      return res.status(403).json({ success: false, message: 'Your account has been banned' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const tokens = generateTokens(user);
    user.refreshToken = tokens.refreshToken;
    await user.save();

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          district: user.district,
          language: user.language
        },
        ...tokens
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ success: false, message: 'Refresh token required' });
    }

    const user = await User.findOne({ refreshToken });
    if (user) {
      user.refreshToken = null;
      await user.save();
    }

    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

exports.refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ success: false, message: 'Refresh token required' });
    }

    let decoded;
    try {
      decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET);
    } catch (err) {
      return res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
    }

    const user = await User.findOne({ _id: decoded.userId, refreshToken });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid session context' });
    }

    const tokens = generateTokens(user);
    user.refreshToken = tokens.refreshToken;
    await user.save();

    res.json({
      success: true,
      data: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    res.json({
      success: true,
      data: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        phone: req.user.phone,
        role: req.user.role,
        district: req.user.district,
        language: req.user.language,
        fcmTokens: req.user.fcmTokens
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.patchMe = async (req, res, next) => {
  try {
    const { name, phone, language } = req.body;
    
    if (name) req.user.name = name;
    if (phone) req.user.phone = phone;
    if (language) req.user.language = language;

    await req.user.save();

    res.json({
      success: true,
      data: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        phone: req.user.phone,
        role: req.user.role,
        district: req.user.district,
        language: req.user.language
      }
    });
  } catch (error) {
    next(error);
  }
};

// Forgot Password Flow
exports.forgotPassword = async (req, res, next) => {
  try {
    const { phone } = req.body;
    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(404).json({ success: false, message: 'No user registered with this phone number' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store OTP on user doc, valid for 10 minutes
    user.refreshToken = otp; // temporarily using refreshToken or custom fields
    // Wait, let's keep it robust and add OTP properties on User.model dynamically or store it
    // We will save OTP directly as refresh token or custom field to avoid DB mutations
    user.refreshToken = `OTP_${otp}_EXP_${Date.now() + 10 * 60 * 1000}`;
    await user.save();

    // Log OTP in developer log
    console.log(`[DEVELOPER-OTP-LOG] OTP for reset: ${otp} (User: ${user.name}, Phone: ${phone})`);

    res.json({
      success: true,
      message: 'OTP has been generated and logged in developer mode. Use it to reset password.'
    });
  } catch (error) {
    next(error);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { phone, otp, newPassword } = req.body;
    const user = await User.findOne({ phone });
    if (!user || !user.refreshToken || !user.refreshToken.startsWith('OTP_')) {
      return res.status(400).json({ success: false, message: 'OTP flow not initialized or invalid request' });
    }

    const parts = user.refreshToken.split('_');
    const storedOtp = parts[1];
    const expiry = parseInt(parts[3], 10);

    if (otp !== storedOtp) {
      return res.status(400).json({ success: false, message: 'Invalid OTP code' });
    }

    if (Date.now() > expiry) {
      return res.status(400).json({ success: false, message: 'OTP has expired' });
    }

    // Hash and update password
    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    user.refreshToken = null; // Clear token
    await user.save();

    res.json({ success: true, message: 'Password has been reset successfully' });
  } catch (error) {
    next(error);
  }
};

exports.registerFCMToken = async (req, res, next) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ success: false, message: 'FCM Token is required' });
    }

    if (!req.user.fcmTokens.includes(token)) {
      req.user.fcmTokens.push(token);
      await req.user.save();
    }

    res.json({ success: true, message: 'FCM token registered successfully' });
  } catch (error) {
    next(error);
  }
};
