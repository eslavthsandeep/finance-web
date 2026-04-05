/**
 * userController.js
 *
 * Admin-facing user management endpoints:
 *   - List all users (with optional filters)
 *   - Get a specific user
 *   - Update a user (role, status, name)
 *   - Soft-delete a user
 */

const bcrypt  = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const db        = require('../config/db');
const AppError  = require('../utils/AppError');
const { sendSuccess } = require('../utils/response');

function sanitizeUser(user) {
  const { password, ...safe } = user;
  return safe;
}

// ── List users ────────────────────────────────────────────────────────────────

/**
 * GET /api/users
 * Supports query filters: role, status
 * Supports pagination: page, limit
 */
function listUsers(req, res) {
  const { role, status, page = 1, limit = 20 } = req.query;

  let users = db.getAll('users').filter((u) => !u.deletedAt);

  if (role)   users = users.filter((u) => u.role   === role);
  if (status) users = users.filter((u) => u.status === status);

  // Sort newest first
  users.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  // Pagination
  const total    = users.length;
  const pageNum  = Math.max(1, parseInt(page));
  const pageSize = Math.min(100, Math.max(1, parseInt(limit)));
  const start    = (pageNum - 1) * pageSize;
  const paged    = users.slice(start, start + pageSize).map(sanitizeUser);

  return sendSuccess(
    res,
    paged,
    'Users fetched successfully.',
    200,
    { total, page: pageNum, limit: pageSize, totalPages: Math.ceil(total / pageSize) },
  );
}

// ── Get single user ────────────────────────────────────────────────────────────

/**
 * GET /api/users/:id
 */
function getUser(req, res, next) {
  const user = db.findOne('users', (u) => u.id === req.params.id && !u.deletedAt);
  if (!user) return next(new AppError('User not found.', 404, 'USER_NOT_FOUND'));
  return sendSuccess(res, sanitizeUser(user), 'User fetched successfully.');
}

// ── Create user (admin only) ──────────────────────────────────────────────────

/**
 * POST /api/users
 */
async function createUser(req, res, next) {
  try {
    const { name, email, password, role = 'viewer', status = 'active' } = req.body;

    const exists = db.findOne('users', (u) => u.email.toLowerCase() === email.toLowerCase() && !u.deletedAt);
    if (exists) return next(new AppError('Email already in use.', 409, 'EMAIL_TAKEN'));

    const hashed = await bcrypt.hash(password, 10);

    const user = db.insert('users', {
      id:        uuidv4(),
      name:      name.trim(),
      email:     email.toLowerCase().trim(),
      password:  hashed,
      role,
      status,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deletedAt: null,
    });

    return sendSuccess(res, sanitizeUser(user), 'User created successfully.', 201);
  } catch (err) {
    next(err);
  }
}

// ── Update user ───────────────────────────────────────────────────────────────

/**
 * PATCH /api/users/:id
 * Admins can update: name, role, status.
 * Password updates are separate and require bcrypt re-hash.
 */
async function updateUser(req, res, next) {
  try {
    const user = db.findOne('users', (u) => u.id === req.params.id && !u.deletedAt);
    if (!user) return next(new AppError('User not found.', 404, 'USER_NOT_FOUND'));

    // Prevent admin from accidentally locking themselves out
    if (req.params.id === req.user.id && req.body.status === 'inactive') {
      return next(new AppError('You cannot deactivate your own account.', 400, 'SELF_DEACTIVATION'));
    }

    const allowedUpdates = ['name', 'role', 'status'];
    const changes = {};

    for (const key of allowedUpdates) {
      if (req.body[key] !== undefined) changes[key] = req.body[key];
    }

    // Allow password reset
    if (req.body.password) {
      changes.password = await bcrypt.hash(req.body.password, 10);
    }

    changes.updatedAt = new Date().toISOString();

    const updated = db.update('users', req.params.id, changes);
    return sendSuccess(res, sanitizeUser(updated), 'User updated successfully.');
  } catch (err) {
    next(err);
  }
}

// ── Delete user ───────────────────────────────────────────────────────────────

/**
 * DELETE /api/users/:id
 * Soft-deletes the user (sets deletedAt timestamp).
 */
function deleteUser(req, res, next) {
  const user = db.findOne('users', (u) => u.id === req.params.id && !u.deletedAt);
  if (!user) return next(new AppError('User not found.', 404, 'USER_NOT_FOUND'));

  if (req.params.id === req.user.id) {
    return next(new AppError('You cannot delete your own account.', 400, 'SELF_DELETE'));
  }

  db.softDelete('users', req.params.id);
  return sendSuccess(res, null, 'User deleted successfully.');
}

module.exports = { listUsers, getUser, createUser, updateUser, deleteUser };
