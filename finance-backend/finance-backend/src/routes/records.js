/**
 * routes/records.js
 *
 * Financial record endpoints with role-based access:
 *
 * GET    /api/records       → viewer, analyst, admin  (list + filter)
 * GET    /api/records/:id   → viewer, analyst, admin  (single record)
 * POST   /api/records       → admin only              (create)
 * PATCH  /api/records/:id   → admin only              (update)
 * DELETE /api/records/:id   → admin only              (soft-delete)
 */

const router = require('express').Router();
const { body, query } = require('express-validator');

const {
  listRecords, getRecord, createRecord, updateRecord, deleteRecord,
} = require('../controllers/recordController');

const { authenticate }       = require('../middleware/auth');
const { authorize, requireMinRole } = require('../middleware/rbac');
const validate               = require('../middleware/validate');

// ── Validation rules ──────────────────────────────────────────────────────────

const createRecordRules = [
  body('amount')
    .notEmpty().withMessage('Amount is required.')
    .isFloat({ gt: 0 }).withMessage('Amount must be a positive number.'),
  body('type')
    .notEmpty().withMessage('Type is required.')
    .isIn(['income', 'expense']).withMessage("Type must be 'income' or 'expense'."),
  body('category')
    .trim()
    .notEmpty().withMessage('Category is required.')
    .isLength({ max: 100 }).withMessage('Category must be at most 100 characters.'),
  body('date')
    .notEmpty().withMessage('Date is required.')
    .isDate({ format: 'YYYY-MM-DD' }).withMessage('Date must be in YYYY-MM-DD format.'),
  body('notes')
    .optional()
    .isLength({ max: 500 }).withMessage('Notes must be at most 500 characters.'),
];

const updateRecordRules = [
  body('amount')
    .optional()
    .isFloat({ gt: 0 }).withMessage('Amount must be a positive number.'),
  body('type')
    .optional()
    .isIn(['income', 'expense']).withMessage("Type must be 'income' or 'expense'."),
  body('category')
    .optional().trim()
    .isLength({ max: 100 }).withMessage('Category must be at most 100 characters.'),
  body('date')
    .optional()
    .isDate({ format: 'YYYY-MM-DD' }).withMessage('Date must be in YYYY-MM-DD format.'),
  body('notes')
    .optional()
    .isLength({ max: 500 }).withMessage('Notes must be at most 500 characters.'),
];

const listRecordsRules = [
  query('type')       .optional().isIn(['income', 'expense']).withMessage("Type must be 'income' or 'expense'."),
  query('dateFrom')   .optional().isDate().withMessage('dateFrom must be a valid date.'),
  query('dateTo')     .optional().isDate().withMessage('dateTo must be a valid date.'),
  query('minAmount')  .optional().isFloat({ gt: 0 }).withMessage('minAmount must be positive.'),
  query('maxAmount')  .optional().isFloat({ gt: 0 }).withMessage('maxAmount must be positive.'),
  query('page')       .optional().isInt({ min: 1 }).withMessage('Page must be a positive integer.'),
  query('limit')      .optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be 1–100.'),
  query('sortBy')     .optional().isIn(['date', 'amount', 'createdAt']).withMessage('Invalid sort field.'),
  query('order')      .optional().isIn(['asc', 'desc']).withMessage("Order must be 'asc' or 'desc'."),
];

// ── Routes ────────────────────────────────────────────────────────────────────

// Read: all authenticated users can view records
router.get('/',
  authenticate,
  authorize('viewer', 'analyst', 'admin'),
  listRecordsRules,
  validate,
  listRecords,
);

router.get('/:id',
  authenticate,
  authorize('viewer', 'analyst', 'admin'),
  getRecord,
);

// Write: admin only
router.post('/',
  authenticate,
  authorize('admin'),
  createRecordRules,
  validate,
  createRecord,
);

router.patch('/:id',
  authenticate,
  authorize('admin'),
  updateRecordRules,
  validate,
  updateRecord,
);

router.delete('/:id',
  authenticate,
  authorize('admin'),
  deleteRecord,
);

module.exports = router;
