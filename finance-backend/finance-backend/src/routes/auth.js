/**
 * routes/auth.js
 *
 * Public authentication routes — no token required.
 *
 * POST /api/auth/register
 * POST /api/auth/login
 * GET  /api/auth/me       (protected)
 */

const router  = require('express').Router();
const { body } = require('express-validator');

const { register, login, getMe } = require('../controllers/authController');
const { authenticate }           = require('../middleware/auth');
const validate                   = require('../middleware/validate');

// ── Validation chains ─────────────────────────────────────────────────────────

const registerRules = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required.')
    .isLength({ min: 2, max: 80 }).withMessage('Name must be between 2 and 80 characters.'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required.')
    .isEmail().withMessage('Please provide a valid email address.')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required.')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters.')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter.')
    .matches(/[0-9]/).withMessage('Password must contain at least one number.'),
  body('role')
    .optional()
    .isIn(['viewer', 'analyst', 'admin']).withMessage("Role must be 'viewer', 'analyst', or 'admin'."),
];

const loginRules = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required.')
    .isEmail().withMessage('Please provide a valid email address.'),
  body('password')
    .notEmpty().withMessage('Password is required.'),
];

// ── Routes ────────────────────────────────────────────────────────────────────

router.post('/register', registerRules, validate, register);
router.post('/login',    loginRules,    validate, login);
router.get( '/me',       authenticate,            getMe);

module.exports = router;
