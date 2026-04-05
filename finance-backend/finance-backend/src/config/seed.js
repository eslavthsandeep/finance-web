/**
 * seed.js — Populates the database with demo users and financial records.
 * Run: npm run seed
 */

require('dotenv').config();
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const db = require('./db');

async function seed() {
  console.log('🌱  Seeding database…');

  // ── Clear existing data ──────────────────────────────────────────────────────
  const existing = db.getAll('users');
  if (existing.length > 0) {
    console.log('   Database already seeded. Skipping.');
    process.exit(0);
  }

  // ── Users ────────────────────────────────────────────────────────────────────
  const password = await bcrypt.hash('Password123!', 10);

  const admin = db.insert('users', {
    id:        uuidv4(),
    name:      'Alice Admin',
    email:     'admin@finance.dev',
    password,
    role:      'admin',
    status:    'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
  });

  const analyst = db.insert('users', {
    id:        uuidv4(),
    name:      'Bob Analyst',
    email:     'analyst@finance.dev',
    password,
    role:      'analyst',
    status:    'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
  });

  const viewer = db.insert('users', {
    id:        uuidv4(),
    name:      'Carol Viewer',
    email:     'viewer@finance.dev',
    password,
    role:      'viewer',
    status:    'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
  });

  console.log(`   ✓ Created users: ${admin.email}, ${analyst.email}, ${viewer.email}`);

  // ── Financial records ────────────────────────────────────────────────────────
  const sampleRecords = [
    { type: 'income',  amount: 5000,  category: 'Salary',      notes: 'Monthly salary',      date: '2024-03-01' },
    { type: 'income',  amount: 800,   category: 'Freelance',   notes: 'Design project',      date: '2024-03-05' },
    { type: 'expense', amount: 1200,  category: 'Rent',        notes: 'Monthly rent',        date: '2024-03-03' },
    { type: 'expense', amount: 200,   category: 'Groceries',   notes: 'Weekly groceries',    date: '2024-03-07' },
    { type: 'expense', amount: 150,   category: 'Utilities',   notes: 'Electricity bill',    date: '2024-03-08' },
    { type: 'income',  amount: 350,   category: 'Investment',  notes: 'Dividend income',     date: '2024-03-10' },
    { type: 'expense', amount: 80,    category: 'Transport',   notes: 'Monthly bus pass',    date: '2024-03-02' },
    { type: 'expense', amount: 60,    category: 'Dining',      notes: 'Team lunch',          date: '2024-03-12' },
    { type: 'income',  amount: 5000,  category: 'Salary',      notes: 'Monthly salary',      date: '2024-04-01' },
    { type: 'expense', amount: 1200,  category: 'Rent',        notes: 'Monthly rent',        date: '2024-04-03' },
    { type: 'expense', amount: 300,   category: 'Groceries',   notes: 'Monthly groceries',   date: '2024-04-09' },
    { type: 'income',  amount: 500,   category: 'Freelance',   notes: 'Logo design',         date: '2024-04-15' },
  ];

  for (const r of sampleRecords) {
    db.insert('records', {
      id:        uuidv4(),
      ...r,
      createdBy: admin.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deletedAt: null,
    });
  }

  console.log(`   ✓ Created ${sampleRecords.length} financial records`);
  console.log('\n✅  Seed complete!\n');
  console.log('   Login credentials (all roles, same password: Password123!):');
  console.log(`   Admin   → ${admin.email}`);
  console.log(`   Analyst → ${analyst.email}`);
  console.log(`   Viewer  → ${viewer.email}`);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
