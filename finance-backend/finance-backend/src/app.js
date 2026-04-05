/**
 * app.js — Express Application Entry Point
 *
 * Bootstraps all middleware, mounts route groups, and starts the HTTP server.
 */

require('dotenv').config();

const express = require('express');
const cors    = require('cors');
const helmet  = require('helmet');
const morgan  = require('morgan');

const authRoutes      = require('./routes/auth');
const userRoutes      = require('./routes/users');
const recordRoutes    = require('./routes/records');
const dashboardRoutes = require('./routes/dashboard');
const errorHandler    = require('./middleware/errorHandler');
const AppError        = require('./utils/AppError');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Global Middleware ─────────────────────────────────────────────────────────

// Security headers
app.use(helmet());

// CORS — in production, replace '*' with your frontend origin
app.use(cors({ origin: '*', methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'] }));

// HTTP request logging
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Parse JSON bodies (max 10kb to guard against large payload attacks)
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ── Health Check ──────────────────────────────────────────────────────────────

app.get('/health', (_req, res) => {
  res.json({
    status:      'ok',
    service:     'Finance Data Processing & Access Control API',
    version:     '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    timestamp:   new Date().toISOString(),
  });
});

// ── API Routes ────────────────────────────────────────────────────────────────

app.use('/api/auth',      authRoutes);
app.use('/api/users',     userRoutes);
app.use('/api/records',   recordRoutes);
app.use('/api/dashboard', dashboardRoutes);

// ── Root ──────────────────────────────────────────────────────────────────────

app.get('/', (_req, res) => {
  res.json({
    message: '💰 Finance Data Processing & Access Control API',
    version: '1.0.0',
    docs:    'See README.md for full API documentation.',
    endpoints: {
      health:    'GET /health',
      auth:      'POST /api/auth/login | POST /api/auth/register | GET /api/auth/me',
      users:     'GET|POST /api/users | GET|PATCH|DELETE /api/users/:id',
      records:   'GET|POST /api/records | GET|PATCH|DELETE /api/records/:id',
      dashboard: 'GET /api/dashboard/summary | /by-category | /trends | /recent',
    },
  });
});

// ── 404 Handler ───────────────────────────────────────────────────────────────

app.all('/{*path}', (req, _res, next) => {
  next(new AppError(`Route '${req.method} ${req.originalUrl}' not found.`, 404, 'ROUTE_NOT_FOUND'));
});

// ── Global Error Handler ──────────────────────────────────────────────────────

app.use(errorHandler);

// ── Start Server ──────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log('\n╔══════════════════════════════════════════════════════╗');
  console.log('║   💰  Finance Backend API                            ║');
  console.log('╚══════════════════════════════════════════════════════╝');
  console.log(`\n  🚀  Server running on http://localhost:${PORT}`);
  console.log(`  🌍  Environment : ${process.env.NODE_ENV || 'development'}`);
  console.log(`  📋  API docs    : http://localhost:${PORT}/`);
  console.log(`  🏥  Health      : http://localhost:${PORT}/health`);
  console.log('\n  Run "npm run seed" to populate demo data.\n');
});

module.exports = app; // exported for testing
