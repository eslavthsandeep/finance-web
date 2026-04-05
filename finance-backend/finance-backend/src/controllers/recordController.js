/**
 * recordController.js
 *
 * Financial Records CRUD:
 *   GET    /api/records          → list records (with filters + pagination)
 *   POST   /api/records          → create a record          [admin only]
 *   GET    /api/records/:id      → get a single record
 *   PATCH  /api/records/:id      → update a record          [admin only]
 *   DELETE /api/records/:id      → soft-delete a record     [admin only]
 */

const { v4: uuidv4 } = require('uuid');
const db        = require('../config/db');
const AppError  = require('../utils/AppError');
const { sendSuccess } = require('../utils/response');

// ── List records ──────────────────────────────────────────────────────────────

/**
 * GET /api/records
 *
 * Query params:
 *   type       — 'income' | 'expense'
 *   category   — string (case-insensitive contains match)
 *   dateFrom   — YYYY-MM-DD
 *   dateTo     — YYYY-MM-DD
 *   minAmount  — number
 *   maxAmount  — number
 *   page       — number (default 1)
 *   limit      — number (default 20, max 100)
 *   sortBy     — 'date' | 'amount' | 'createdAt' (default 'date')
 *   order      — 'asc' | 'desc' (default 'desc')
 */
function listRecords(req, res) {
  const {
    type, category, dateFrom, dateTo,
    minAmount, maxAmount,
    page = 1, limit = 20,
    sortBy = 'date', order = 'desc',
  } = req.query;

  // Start with non-deleted records
  let records = db.getAll('records').filter((r) => !r.deletedAt);

  // ── Filters ──────────────────────────────────────────────────────────────────
  if (type)      records = records.filter((r) => r.type === type);
  if (category)  records = records.filter((r) => r.category.toLowerCase().includes(category.toLowerCase()));
  if (dateFrom)  records = records.filter((r) => r.date >= dateFrom);
  if (dateTo)    records = records.filter((r) => r.date <= dateTo);
  if (minAmount) records = records.filter((r) => r.amount >= parseFloat(minAmount));
  if (maxAmount) records = records.filter((r) => r.amount <= parseFloat(maxAmount));

  // ── Sorting ───────────────────────────────────────────────────────────────────
  const validSort  = ['date', 'amount', 'createdAt'];
  const sortKey    = validSort.includes(sortBy) ? sortBy : 'date';
  const sortOrder  = order === 'asc' ? 1 : -1;

  records.sort((a, b) => {
    const valA = sortKey === 'amount' ? a[sortKey] : new Date(a[sortKey]);
    const valB = sortKey === 'amount' ? b[sortKey] : new Date(b[sortKey]);
    return valA < valB ? -sortOrder : valA > valB ? sortOrder : 0;
  });

  // ── Pagination ────────────────────────────────────────────────────────────────
  const total    = records.length;
  const pageNum  = Math.max(1, parseInt(page));
  const pageSize = Math.min(100, Math.max(1, parseInt(limit)));
  const start    = (pageNum - 1) * pageSize;
  const paged    = records.slice(start, start + pageSize);

  return sendSuccess(
    res,
    paged,
    'Records fetched successfully.',
    200,
    { total, page: pageNum, limit: pageSize, totalPages: Math.ceil(total / pageSize) },
  );
}

// ── Get single record ─────────────────────────────────────────────────────────

/**
 * GET /api/records/:id
 */
function getRecord(req, res, next) {
  const record = db.findOne('records', (r) => r.id === req.params.id && !r.deletedAt);
  if (!record) return next(new AppError('Financial record not found.', 404, 'RECORD_NOT_FOUND'));
  return sendSuccess(res, record, 'Record fetched successfully.');
}

// ── Create record ─────────────────────────────────────────────────────────────

/**
 * POST /api/records
 * Body: { amount, type, category, date, notes }
 */
function createRecord(req, res, next) {
  try {
    const { amount, type, category, date, notes = '' } = req.body;

    // Extra semantic validation (schema-level validation handled by validator)
    if (type !== 'income' && type !== 'expense') {
      return next(new AppError("Type must be 'income' or 'expense'.", 422, 'INVALID_TYPE'));
    }

    if (parseFloat(amount) <= 0) {
      return next(new AppError('Amount must be a positive number.', 422, 'INVALID_AMOUNT'));
    }

    const record = db.insert('records', {
      id:        uuidv4(),
      amount:    parseFloat(parseFloat(amount).toFixed(2)),
      type,
      category:  category.trim(),
      date,
      notes:     notes.trim(),
      createdBy: req.user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deletedAt: null,
    });

    return sendSuccess(res, record, 'Financial record created successfully.', 201);
  } catch (err) {
    next(err);
  }
}

// ── Update record ─────────────────────────────────────────────────────────────

/**
 * PATCH /api/records/:id
 */
function updateRecord(req, res, next) {
  try {
    const record = db.findOne('records', (r) => r.id === req.params.id && !r.deletedAt);
    if (!record) return next(new AppError('Financial record not found.', 404, 'RECORD_NOT_FOUND'));

    const allowedUpdates = ['amount', 'type', 'category', 'date', 'notes'];
    const changes = {};

    for (const key of allowedUpdates) {
      if (req.body[key] !== undefined) {
        changes[key] = key === 'amount' ? parseFloat(parseFloat(req.body[key]).toFixed(2)) : req.body[key];
      }
    }

    if (changes.amount !== undefined && changes.amount <= 0) {
      return next(new AppError('Amount must be a positive number.', 422, 'INVALID_AMOUNT'));
    }

    if (changes.type && changes.type !== 'income' && changes.type !== 'expense') {
      return next(new AppError("Type must be 'income' or 'expense'.", 422, 'INVALID_TYPE'));
    }

    changes.updatedAt = new Date().toISOString();

    const updated = db.update('records', req.params.id, changes);
    return sendSuccess(res, updated, 'Record updated successfully.');
  } catch (err) {
    next(err);
  }
}

// ── Delete record ─────────────────────────────────────────────────────────────

/**
 * DELETE /api/records/:id
 * Soft-delete: sets deletedAt so it can be audited or restored.
 */
function deleteRecord(req, res, next) {
  const record = db.findOne('records', (r) => r.id === req.params.id && !r.deletedAt);
  if (!record) return next(new AppError('Financial record not found.', 404, 'RECORD_NOT_FOUND'));

  db.softDelete('records', req.params.id);
  return sendSuccess(res, null, 'Record deleted successfully.');
}

module.exports = { listRecords, getRecord, createRecord, updateRecord, deleteRecord };
