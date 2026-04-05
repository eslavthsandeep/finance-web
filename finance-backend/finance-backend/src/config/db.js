/**
 * db.js — Lightweight JSON file-based persistence layer.
 *
 * Acts as a simple key-value store where each collection is an array.
 * On startup, data is loaded from disk (if the file exists).
 * Every write is immediately flushed to disk for durability.
 *
 * This can be swapped for any real DB (PostgreSQL, MongoDB, SQLite)
 * by replacing the methods below — the rest of the codebase stays the same.
 */

const fs   = require('fs');
const path = require('path');

const DB_PATH = path.resolve(process.env.DB_FILE || './data/db.json');

// ── In-memory store ──────────────────────────────────────────────────────────
let _store = {
  users:   [],
  records: [],
};

// ── Bootstrap ─────────────────────────────────────────────────────────────────
function load() {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  if (fs.existsSync(DB_PATH)) {
    try {
      const raw = fs.readFileSync(DB_PATH, 'utf8');
      _store = JSON.parse(raw);
    } catch (_) {
      _store = { users: [], records: [] };
    }
  }
}

function flush() {
  fs.writeFileSync(DB_PATH, JSON.stringify(_store, null, 2), 'utf8');
}

// ── Generic collection helpers ────────────────────────────────────────────────
const db = {
  /**
   * Return a snapshot of the whole collection.
   */
  getAll(collection) {
    return [...(_store[collection] || [])];
  },

  /**
   * Find a single document by predicate.
   */
  findOne(collection, predicate) {
    return (_store[collection] || []).find(predicate) ?? null;
  },

  /**
   * Find all documents matching predicate.
   */
  findMany(collection, predicate) {
    return (_store[collection] || []).filter(predicate);
  },

  /**
   * Insert a new document. Caller must supply `id`.
   */
  insert(collection, doc) {
    if (!_store[collection]) _store[collection] = [];
    _store[collection].push(doc);
    flush();
    return doc;
  },

  /**
   * Update a document in-place. Returns the updated doc or null.
   */
  update(collection, id, changes) {
    const idx = (_store[collection] || []).findIndex((d) => d.id === id);
    if (idx === -1) return null;
    _store[collection][idx] = { ..._store[collection][idx], ...changes };
    flush();
    return _store[collection][idx];
  },

  /**
   * Hard-delete by id. Returns true if something was removed.
   */
  delete(collection, id) {
    const before = (_store[collection] || []).length;
    _store[collection] = (_store[collection] || []).filter((d) => d.id !== id);
    if (_store[collection].length < before) {
      flush();
      return true;
    }
    return false;
  },

  /**
   * Soft-delete: just sets deletedAt timestamp.
   */
  softDelete(collection, id) {
    return db.update(collection, id, { deletedAt: new Date().toISOString() });
  },
};

load();

module.exports = db;
