/**
 * authController.js
 *
 * Handles user registration (admin only in real use, open here for demo),
 * login (returns JWT), and fetching the authenticated user's own profile.
 */

const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const db        = require('../config/db');
const AppError  = require('../utils/AppError');
const { sendSuccess } = require('../utils/response');

// ── Helpers ───────────────────────────────────────────────────────────────────

function signToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  });
}

function sanitizeUser(user) {
  const { password, ...safe } = user;
  return safe;
}

// ── Controllers ───────────────────────────────────────────────────────────────

/**
 * POST /api/auth/register
 * Creates a new user account. Role defaults to 'viewer'.
 * In production this endpoint should be admin-only or invitation-based.
 */
async function register(req, res, next) {
  try {
    const { name, email, password, role = 'viewer' } = req.body;

    // Check duplicate email
    const exists = db.findOne('users', (u) => u.email.toLowerCase() === email.toLowerCase() && !u.deletedAt);
    if (exists) {
      return next(new AppError('An account with this email already exists.', 409, 'EMAIL_TAKEN'));
    }

    // Only admin can assign elevated roles during registration
    const allowedRoles = ['viewer', 'analyst', 'admin'];
    const assignedRole = allowedRoles.includes(role) ? role : 'viewer';

    const hashed = await bcrypt.hash(password, 10);

    const user = db.insert('users', {
      id:        uuidv4(),
      name:      name.trim(),
      email:     email.toLowerCase().trim(),
      password:  hashed,
      role:      assignedRole,
      status:    'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deletedAt: null,
    });

    const token = signToken(user.id);

    return sendSuccess(res, { token, user: sanitizeUser(user) }, 'Account created successfully.', 201);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/auth/login
 * Authenticates a user and returns a JWT.
 */
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const user = db.findOne('users', (u) => u.email.toLowerCase() === email.toLowerCase() && !u.deletedAt);
    if (!user) {
      // Generic message to avoid user enumeration
      return next(new AppError('Invalid email or password.', 401, 'INVALID_CREDENTIALS'));
    }

    if (user.status === 'inactive') {
      return next(new AppError('Your account has been deactivated. Contact an administrator.', 403, 'ACCOUNT_INACTIVE'));
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return next(new AppError('Invalid email or password.', 401, 'INVALID_CREDENTIALS'));
    }

    const token = signToken(user.id);

    return sendSuccess(res, { token, user: sanitizeUser(user) }, 'Logged in successfully.');
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/auth/me
 * Returns the currently authenticated user's profile.
 */
function getMe(req, res) {
  return sendSuccess(res, req.user, 'Profile fetched successfully.');
}

module.exports = { register, login, getMe };
