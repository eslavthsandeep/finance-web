/**
 * auth.js — JWT Authentication Middleware
 *
 * Validates the Bearer token from the Authorization header, decodes it,
 * fetches the user from the database, and attaches it to req.user.
 *
 * Any route that requires authentication must use this middleware.
 */

const jwt     = require('jsonwebtoken');
const db      = require('../config/db');
const AppError = require('../utils/AppError');

/**
 * authenticate — Verifies the JWT and attaches req.user.
 */
function authenticate(req, res, next) {
  // 1. Extract token from Authorization header
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('Authentication required. Please provide a Bearer token.', 401, 'NO_TOKEN'));
  }

  const token = authHeader.split(' ')[1];

  // 2. Verify signature and expiry
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return next(new AppError('Your session has expired. Please log in again.', 401, 'TOKEN_EXPIRED'));
    }
    return next(new AppError('Invalid token. Please log in again.', 401, 'INVALID_TOKEN'));
  }

  // 3. Check user still exists and is active
  const user = db.findOne('users', (u) => u.id === decoded.id && !u.deletedAt);
  if (!user) {
    return next(new AppError('The user belonging to this token no longer exists.', 401, 'USER_NOT_FOUND'));
  }

  if (user.status === 'inactive') {
    return next(new AppError('Your account has been deactivated. Contact an administrator.', 403, 'ACCOUNT_INACTIVE'));
  }

  // 4. Attach user to request (without the password)
  const { password: _, ...safeUser } = user;
  req.user = safeUser;

  next();
}

module.exports = { authenticate };
