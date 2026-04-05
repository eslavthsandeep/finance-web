/**
 * routes/users.js
 *
 * All user-management routes are restricted to admin only.
 *
 * GET    /api/users         → list all users
 * POST   /api/users         → create user
 * GET    /api/users/:id     → get single user
 * PATCH  /api/users/:id     → update user
 * DELETE /api/users/:id     → soft-delete user
 */

const router   = require('express').Router();
const { body, query } = require('express-validator');

const {
  listUsers, getUser, createUser, updateUser, deleteUser,
} = require('../controllers/userController');

const { authenticate }       = require('../middleware/auth');
const { authorize }          = require('../middleware/rbac');
const validate               = require('../middleware/validate');

// All routes in this file require authentication + admin role
router.use(authenticate, authorize('admin'));

// ── Validation ────────────────────────────────────────────────────────────────

const createUserRules = [
  body('name')
    .trim().notEmpty().withMessage('Name is required.')
    .isLength({ min: 2, max: 80 }).withMessage('Name must be 2-80 characters.'),
  body('email')
    .trim().notEmpty().withMessage('Email is required.')
    .isEmail().withMessage('Provide a valid email.')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required.')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters.')
    .matches(/[A-Z]/).withMessage('Must contain an uppercase letter.')
    .matches(/[0-9]/).withMessage('Must contain a number.'),
  body('role')
    .optional()
    .isIn(['viewer', 'analyst', 'admin']).withMessage("Role must be 'viewer', 'analyst', or 'admin'."),
  body('status')
    .optional()
    .isIn(['active', 'inactive']).withMessage("Status must be 'active' or 'inactive'."),
];

const updateUserRules = [
  body('name')
    .optional().trim()
    .isLength({ min: 2, max: 80 }).withMessage('Name must be 2-80 characters.'),
  body('role')
    .optional()
    .isIn(['viewer', 'analyst', 'admin']).withMessage("Role must be 'viewer', 'analyst', or 'admin'."),
  body('status')
    .optional()
    .isIn(['active', 'inactive']).withMessage("Status must be 'active' or 'inactive'."),
  body('password')
    .optional()
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters.'),
];

const listUsersRules = [
  query('role').optional().isIn(['viewer', 'analyst', 'admin']).withMessage('Invalid role filter.'),
  query('status').optional().isIn(['active', 'inactive']).withMessage('Invalid status filter.'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer.'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100.'),
];

// ── Routes ────────────────────────────────────────────────────────────────────

router.get('/',    listUsersRules,  validate, listUsers);
router.post('/',   createUserRules, validate, createUser);
router.get('/:id',                            getUser);
router.patch('/:id', updateUserRules, validate, updateUser);
router.delete('/:id',                         deleteUser);

module.exports = router;
