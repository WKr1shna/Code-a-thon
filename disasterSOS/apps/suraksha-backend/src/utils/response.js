exports.sendResponse = (res, statusCode, message, data = {}, errors = []) => {
  return res.status(statusCode).json({
    success: statusCode >= 200 && statusCode < 300,
    message,
    data,
    errors
  });
};
