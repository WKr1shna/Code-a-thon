const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../configs/db');
const { sendResponse } = require('../utils/response');

const generateTokens = (userId) => {
  const accessToken = jwt.sign({ id: userId }, process.env.JWT_ACCESS_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
  return { accessToken, refreshToken };
};

exports.register = async (req, res, next) => {
  try {
    const { fullName, email, phoneNumber, password, organization, role } = req.body;

    // Duplicates are handled by Prisma @unique, but let's do explicit check for clear errors
    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, { phoneNumber }] }
    });

    if (existingUser) {
      return sendResponse(res, 409, 'User with this email or phone number already exists.');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: {
        fullName,
        email,
        phoneNumber,
        passwordHash,
        organization,
        role: role || 'VOLUNTEER'
      }
    });

    const { accessToken, refreshToken } = generateTokens(user.id);

    // Save refresh token
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken }
    });

    const { passwordHash: _, refreshToken: __, ...userData } = user;

    sendResponse(res, 201, 'User registered successfully', { user: userData, accessToken, refreshToken });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return sendResponse(res, 401, 'Invalid credentials');
    }

    if (user.isLocked) {
      if (user.lockUntil && user.lockUntil > new Date()) {
        return sendResponse(res, 403, `Account is locked. Try again later.`);
      } else {
        // Unlock
        await prisma.user.update({ where: { id: user.id }, data: { isLocked: false, failedLoginAttempts: 0, lockUntil: null } });
      }
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);

    if (!isMatch) {
      const attempts = user.failedLoginAttempts + 1;
      const updates = { failedLoginAttempts: attempts };
      if (attempts >= 5) {
        updates.isLocked = true;
        updates.lockUntil = new Date(Date.now() + 15 * 60 * 1000); // Lock for 15 mins
      }
      await prisma.user.update({ where: { id: user.id }, data: updates });

      return sendResponse(res, 401, 'Invalid credentials');
    }

    // Success
    const { accessToken, refreshToken } = generateTokens(user.id);
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken, failedLoginAttempts: 0, isLocked: false, lockUntil: null }
    });

    const { passwordHash: _, refreshToken: __, ...userData } = user;
    sendResponse(res, 200, 'Login successful', { user: userData, accessToken, refreshToken });

  } catch (error) {
    next(error);
  }
};

exports.refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return sendResponse(res, 400, 'Refresh token required');

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await prisma.user.findFirst({ where: { id: decoded.id, refreshToken } });

    if (!user) return sendResponse(res, 401, 'Invalid refresh token');

    const tokens = generateTokens(user.id);
    await prisma.user.update({ where: { id: user.id }, data: { refreshToken: tokens.refreshToken } });

    sendResponse(res, 200, 'Tokens refreshed', tokens);
  } catch (error) {
    next(error);
  }
};

exports.logout = async (req, res, next) => {
  try {
    await prisma.user.update({ where: { id: req.user.id }, data: { refreshToken: null } });
    sendResponse(res, 200, 'Logged out successfully');
  } catch (error) {
    next(error);
  }
};
