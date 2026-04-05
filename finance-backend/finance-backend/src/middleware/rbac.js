/**
 * rbac.js — Role-Based Access Control (RBAC) Middleware
 *
 * Role hierarchy (lowest → highest privilege):
 *   viewer  →  analyst  →  admin
 *
 * Permissions matrix:
 * ┌─────────────────────────────┬────────┬─────────┬───────┐
 * │ Action                      │ Viewer │ Analyst │ Admin │
 * ├─────────────────────────────┼────────┼─────────┼───────┤
 * │ View dashboard              │  ✓     │  ✓      │  ✓    │
 * │ View records                │  ✓     │  ✓      │  ✓    │
 * │ Access insights/summary     │  ✗     │  ✓      │  ✓    │
 * │ Create records              │  ✗     │  ✗      │  ✓    │
 * │ Update records              │  ✗     │  ✗      │  ✓    │
 * │ Delete records              │  ✗     │  ✗      │  ✓    │
 * │ Manage users                │  ✗     │  ✗      │  ✓    │
 * └─────────────────────────────┴────────┴─────────┴───────┘
 */

const AppError = require('../utils/AppError');

const ROLE_HIERARCHY = {
  viewer:  1,
  analyst: 2,
  admin:   3,
};

/**
 * authorize(...roles) — Returns a middleware that allows only users whose
 * role is listed in `roles`.
 *
 * Usage:
 *   router.post('/records', authenticate, authorize('admin'), createRecord);
 *   router.get('/records',  authenticate, authorize('viewer', 'analyst', 'admin'), listRecords);
 */
function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Authentication required.', 401, 'NO_AUTH'));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          `Access denied. This action requires one of the following roles: ${roles.join(', ')}. Your role: ${req.user.role}.`,
          403,
          'INSUFFICIENT_PERMISSIONS',
        ),
      );
    }

    next();
  };
}

/**
 * requireMinRole(minRole) — Allows users whose role is >= minRole in hierarchy.
 *
 * Usage:
 *   router.get('/insights', authenticate, requireMinRole('analyst'), getInsights);
 */
function requireMinRole(minRole) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Authentication required.', 401, 'NO_AUTH'));
    }

    const userLevel = ROLE_HIERARCHY[req.user.role] ?? 0;
    const minLevel  = ROLE_HIERARCHY[minRole]       ?? 99;

    if (userLevel < minLevel) {
      return next(
        new AppError(
          `Access denied. Minimum required role: ${minRole}. Your role: ${req.user.role}.`,
          403,
          'INSUFFICIENT_PERMISSIONS',
        ),
      );
    }

    next();
  };
}

module.exports = { authorize, requireMinRole };
