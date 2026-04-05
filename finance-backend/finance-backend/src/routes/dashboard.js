/**
 * routes/dashboard.js
 *
 * Aggregated analytics — requires at least 'analyst' role.
 *
 * GET /api/dashboard/summary      → totals
 * GET /api/dashboard/by-category  → category breakdown
 * GET /api/dashboard/trends       → monthly/weekly trends
 * GET /api/dashboard/recent       → recent activity
 */

const router = require('express').Router();
const { query } = require('express-validator');

const {
  getSummary, getByCategory, getTrends, getRecentActivity,
} = require('../controllers/dashboardController');

const { authenticate }    = require('../middleware/auth');
const { requireMinRole }  = require('../middleware/rbac');
const validate            = require('../middleware/validate');

// All dashboard routes require authentication + at least analyst privileges
router.use(authenticate, requireMinRole('analyst'));

// ── Validation ─────────────────────────────────────────────────────────────────

const dateRangeRules = [
  query('dateFrom').optional().isDate().withMessage('dateFrom must be YYYY-MM-DD.'),
  query('dateTo')  .optional().isDate().withMessage('dateTo must be YYYY-MM-DD.'),
];

// ── Routes ────────────────────────────────────────────────────────────────────

router.get('/summary',     dateRangeRules, validate, getSummary);
router.get('/by-category', [
  ...dateRangeRules,
  query('type').optional().isIn(['income', 'expense']).withMessage("Type must be 'income' or 'expense'."),
], validate, getByCategory);
router.get('/trends', [
  query('period').optional().isIn(['monthly', 'weekly']).withMessage("Period must be 'monthly' or 'weekly'."),
  query('last')  .optional().isInt({ min: 1, max: 24 }).withMessage('last must be between 1 and 24.'),
], validate, getTrends);
router.get('/recent', [
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('limit must be 1–50.'),
], validate, getRecentActivity);

module.exports = router;
