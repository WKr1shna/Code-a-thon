const { sendResponse } = require('../utils/response');

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errors = [];

  // Prisma Errors
  if (err.code === 'P2002') {
    statusCode = 409;
    message = 'Duplicate field value entered';
    errors = err.meta?.target || [];
  }

  // Zod Validation Errors
  if (err.name === 'ZodError') {
    statusCode = 400;
    message = 'Validation Error';
    errors = err.errors.map(e => ({ field: e.path.join('.'), message: e.message }));
  }

  console.error(`[ERROR] ${err.name}: ${err.message}`);

  sendResponse(res, statusCode, message, {}, errors);
};

module.exports = errorHandler;
