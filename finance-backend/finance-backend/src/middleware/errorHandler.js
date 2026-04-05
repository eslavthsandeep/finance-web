/**
 * errorHandler.js — Global Express Error-Handling Middleware
 *
 * Catches all errors passed to next(err) across the application.
 * Distinguishes between operational errors (expected, safe to expose)
 * and programming errors (unexpected, generic message returned).
 */

const { sendError } = require('../utils/response');

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  let { statusCode = 500, message, code } = err;

  // express-validator passes errors differently — handled in validateRequest
  // JWT errors
  if (err.name === 'JsonWebTokenError')  { statusCode = 401; message = 'Invalid token.'; }
  if (err.name === 'TokenExpiredError')  { statusCode = 401; message = 'Token expired.'; }

  // Log non-operational errors (programming bugs) to stderr
  if (!err.isOperational) {
    console.error('🔴  Unexpected error:', err);
    message = 'Something went wrong. Please try again later.';
    statusCode = 500;
  }

  return sendError(res, message, statusCode);
}

module.exports = errorHandler;
