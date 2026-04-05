/**
 * dashboardController.js
 *
 * Aggregated analytics endpoints that power the finance dashboard.
 * All endpoints require at least the 'analyst' role.
 *
 * Endpoints:
 *   GET /api/dashboard/summary      → totals: income, expense, balance
 *   GET /api/dashboard/by-category  → breakdown by category
 *   GET /api/dashboard/trends       → monthly or weekly trends
 *   GET /api/dashboard/recent       → last N transactions
 */

const db = require('../config/db');
const { sendSuccess } = require('../utils/response');

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Returns active (non-deleted) records, optionally within a date range.
 */
function getActiveRecords(dateFrom, dateTo) {
  let records = db.getAll('records').filter((r) => !r.deletedAt);
  if (dateFrom) records = records.filter((r) => r.date >= dateFrom);
  if (dateTo)   records = records.filter((r) => r.date <= dateTo);
  return records;
}

function round2(n) {
  return Math.round(n * 100) / 100;
}

// ── Summary ───────────────────────────────────────────────────────────────────

/**
 * GET /api/dashboard/summary
 * Query: dateFrom, dateTo
 *
 * Returns:
 *   totalIncome, totalExpense, netBalance, recordCount
 */
function getSummary(req, res) {
  const { dateFrom, dateTo } = req.query;
  const records = getActiveRecords(dateFrom, dateTo);

  const totalIncome  = round2(records.filter((r) => r.type === 'income') .reduce((s, r) => s + r.amount, 0));
  const totalExpense = round2(records.filter((r) => r.type === 'expense').reduce((s, r) => s + r.amount, 0));
  const netBalance   = round2(totalIncome - totalExpense);

  return sendSuccess(res, {
    totalIncome,
    totalExpense,
    netBalance,
    recordCount: records.length,
    savingsRate: totalIncome > 0 ? round2((netBalance / totalIncome) * 100) : 0,
    ...(dateFrom || dateTo ? { dateRange: { from: dateFrom || 'all', to: dateTo || 'all' } } : {}),
  }, 'Dashboard summary fetched.');
}

// ── Category breakdown ─────────────────────────────────────────────────────────

/**
 * GET /api/dashboard/by-category
 * Query: type ('income' | 'expense' | both), dateFrom, dateTo
 *
 * Returns array of { category, total, count, percentage }
 */
function getByCategory(req, res) {
  const { type, dateFrom, dateTo } = req.query;
  let records = getActiveRecords(dateFrom, dateTo);
  if (type) records = records.filter((r) => r.type === type);

  const grandTotal = records.reduce((s, r) => s + r.amount, 0);

  const byCategory = {};
  for (const r of records) {
    if (!byCategory[r.category]) byCategory[r.category] = { total: 0, count: 0, type: r.type };
    byCategory[r.category].total += r.amount;
    byCategory[r.category].count += 1;
  }

  const result = Object.entries(byCategory)
    .map(([category, data]) => ({
      category,
      type:       data.type,
      total:      round2(data.total),
      count:      data.count,
      percentage: grandTotal > 0 ? round2((data.total / grandTotal) * 100) : 0,
    }))
    .sort((a, b) => b.total - a.total);

  return sendSuccess(res, { categories: result, grandTotal: round2(grandTotal) }, 'Category breakdown fetched.');
}

// ── Monthly / weekly trends ────────────────────────────────────────────────────

/**
 * GET /api/dashboard/trends
 * Query: period ('monthly' | 'weekly', default 'monthly'), last (number of periods, default 6)
 *
 * Returns array of { period, income, expense, net } sorted oldest → newest.
 */
function getTrends(req, res) {
  const { period = 'monthly', last = 6 } = req.query;
  const records = db.getAll('records').filter((r) => !r.deletedAt);
  const numPeriods = Math.min(24, Math.max(1, parseInt(last)));

  // Build a map: periodKey → { income, expense }
  const buckets = {};

  for (const r of records) {
    let key;
    const d = new Date(r.date);
    if (period === 'weekly') {
      // ISO week: YYYY-W##
      const jan1     = new Date(d.getFullYear(), 0, 1);
      const weekNum  = Math.ceil(((d - jan1) / 86400000 + jan1.getDay() + 1) / 7);
      key = `${d.getFullYear()}-W${String(weekNum).padStart(2, '0')}`;
    } else {
      // Monthly: YYYY-MM
      key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    }

    if (!buckets[key]) buckets[key] = { income: 0, expense: 0 };
    if (r.type === 'income')  buckets[key].income  += r.amount;
    if (r.type === 'expense') buckets[key].expense += r.amount;
  }

  // Sort all keys and take the last N periods
  const sortedKeys = Object.keys(buckets).sort();
  const recentKeys = sortedKeys.slice(-numPeriods);

  const trends = recentKeys.map((key) => ({
    period:  key,
    income:  round2(buckets[key].income),
    expense: round2(buckets[key].expense),
    net:     round2(buckets[key].income - buckets[key].expense),
  }));

  return sendSuccess(res, { period, trends }, 'Trends fetched successfully.');
}

// ── Recent activity ───────────────────────────────────────────────────────────

/**
 * GET /api/dashboard/recent
 * Query: limit (default 10, max 50)
 *
 * Returns the most recently created financial records.
 */
function getRecentActivity(req, res) {
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));

  const records = db
    .getAll('records')
    .filter((r) => !r.deletedAt)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, limit);

  return sendSuccess(res, records, 'Recent activity fetched.');
}

module.exports = { getSummary, getByCategory, getTrends, getRecentActivity };
