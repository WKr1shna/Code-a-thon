const jwt = require('jsonwebtoken');
const prisma = require('../configs/db');
const { sendResponse } = require('../utils/response');

exports.protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) return sendResponse(res, 401, 'Not authorized, no token');

    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    const user = await prisma.user.findUnique({ where: { id: decoded.id, isDeleted: false } });

    if (!user) return sendResponse(res, 401, 'User no longer exists');

    req.user = user;
    next();
  } catch (error) {
    return sendResponse(res, 401, 'Not authorized, token failed');
  }
};

exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return sendResponse(res, 403, `User role ${req.user.role} is not authorized to access this route`);
    }
    next();
  };
};
