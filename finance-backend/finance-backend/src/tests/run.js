/**
 * tests/run.js — Integration test suite
 *
 * Uses Node's built-in http module (no testing framework needed).
 * Covers: auth, RBAC enforcement, records CRUD, dashboard analytics.
 *
 * Run: npm test
 */

require('dotenv').config();

const http = require('http');

const BASE = `http://localhost:${process.env.PORT || 3000}`;

// ── HTTP helper ───────────────────────────────────────────────────────────────

function request(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {}),
      },
    };

    const url = new URL(path, BASE);
    const req = http.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

// ── Test runner ───────────────────────────────────────────────────────────────

let passed = 0;
let failed = 0;

function assert(condition, label) {
  if (condition) {
    console.log(`  ✅ ${label}`);
    passed++;
  } else {
    console.error(`  ❌ ${label}`);
    failed++;
  }
}

async function run() {
  console.log('\n🧪  Running integration tests…\n');

  // ── Health ──────────────────────────────────────────────────────────────────
  console.log('── Health ─────────────────────────────────────────────');
  const health = await request('GET', '/health');
  assert(health.status === 200, 'GET /health returns 200');
  assert(health.body.status === 'ok', 'Health status is ok');

  // ── Auth: register ──────────────────────────────────────────────────────────
  console.log('\n── Auth: Register ─────────────────────────────────────');
  const ts = Date.now();
  const reg = await request('POST', '/api/auth/register', {
    name: 'Test Admin', email: `admin_${ts}@test.com`,
    password: 'Test1234!', role: 'admin',
  });
  assert(reg.status === 201, 'POST /api/auth/register → 201');
  assert(reg.body.data?.token, 'Response contains JWT token');
  assert(reg.body.data?.user?.role === 'admin', 'User role is admin');
  const adminToken = reg.body.data?.token;

  // ── Auth: duplicate email ────────────────────────────────────────────────────
  const dup = await request('POST', '/api/auth/register', {
    name: 'Dup', email: `admin_${ts}@test.com`, password: 'Test1234!',
  });
  assert(dup.status === 409, 'Duplicate email → 409 Conflict');

  // ── Auth: login ──────────────────────────────────────────────────────────────
  console.log('\n── Auth: Login ────────────────────────────────────────');
  const login = await request('POST', '/api/auth/login', {
    email: `admin_${ts}@test.com`, password: 'Test1234!',
  });
  assert(login.status === 200, 'POST /api/auth/login → 200');
  assert(login.body.data?.token, 'Login returns JWT');

  const badLogin = await request('POST', '/api/auth/login', {
    email: `admin_${ts}@test.com`, password: 'WrongPass',
  });
  assert(badLogin.status === 401, 'Wrong password → 401');

  // ── Auth: /me ─────────────────────────────────────────────────────────────────
  const me = await request('GET', '/api/auth/me', null, adminToken);
  assert(me.status === 200, 'GET /api/auth/me → 200');
  assert(!me.body.data?.password, '/me does not expose password');

  const meNoToken = await request('GET', '/api/auth/me');
  assert(meNoToken.status === 401, 'GET /me without token → 401');

  // ── Validation errors ─────────────────────────────────────────────────────────
  console.log('\n── Validation ─────────────────────────────────────────');
  const badReg = await request('POST', '/api/auth/register', { name: 'A', email: 'not-an-email', password: '123' });
  assert(badReg.status === 422, 'Invalid register body → 422');
  assert(Array.isArray(badReg.body.errors), 'Validation response includes errors array');

  // ── Register viewer + analyst ─────────────────────────────────────────────────
  const viewerReg = await request('POST', '/api/auth/register', {
    name: 'Test Viewer', email: `viewer_${ts}@test.com`,
    password: 'Test1234!', role: 'viewer',
  });
  const viewerToken = viewerReg.body.data?.token;

  const analystReg = await request('POST', '/api/auth/register', {
    name: 'Test Analyst', email: `analyst_${ts}@test.com`,
    password: 'Test1234!', role: 'analyst',
  });
  const analystToken = analystReg.body.data?.token;

  // ── Records CRUD ──────────────────────────────────────────────────────────────
  console.log('\n── Records CRUD ───────────────────────────────────────');
  const createRec = await request('POST', '/api/records', {
    amount: 2500, type: 'income', category: 'Salary',
    date: '2024-05-01', notes: 'Test salary entry',
  }, adminToken);
  assert(createRec.status === 201, 'Admin POST /api/records → 201');
  const recordId = createRec.body.data?.id;
  assert(recordId, 'Created record has an id');

  const viewerCreate = await request('POST', '/api/records', {
    amount: 100, type: 'expense', category: 'Food', date: '2024-05-02',
  }, viewerToken);
  assert(viewerCreate.status === 403, 'Viewer cannot create records → 403');

  const analystCreate = await request('POST', '/api/records', {
    amount: 100, type: 'expense', category: 'Food', date: '2024-05-02',
  }, analystToken);
  assert(analystCreate.status === 403, 'Analyst cannot create records → 403');

  const listRec = await request('GET', '/api/records', null, viewerToken);
  assert(listRec.status === 200, 'Viewer GET /api/records → 200');
  assert(Array.isArray(listRec.body.data), 'Records list is an array');
  assert(listRec.body.meta?.total >= 0, 'Pagination meta present');

  const getRec = await request('GET', `/api/records/${recordId}`, null, analystToken);
  assert(getRec.status === 200, 'Analyst GET /api/records/:id → 200');

  const patchRec = await request('PATCH', `/api/records/${recordId}`, { amount: 3000 }, adminToken);
  assert(patchRec.status === 200, 'Admin PATCH /api/records/:id → 200');
  assert(patchRec.body.data?.amount === 3000, 'Amount was updated correctly');

  const viewerPatch = await request('PATCH', `/api/records/${recordId}`, { amount: 1 }, viewerToken);
  assert(viewerPatch.status === 403, 'Viewer cannot update records → 403');

  // ── Records filters ────────────────────────────────────────────────────────────
  console.log('\n── Records Filters ────────────────────────────────────');
  const filterType = await request('GET', '/api/records?type=income', null, adminToken);
  assert(filterType.status === 200, 'Filter by type=income → 200');
  const allIncome = filterType.body.data?.every((r) => r.type === 'income');
  assert(allIncome, 'All returned records are type=income');

  const filterBadType = await request('GET', '/api/records?type=invalid', null, adminToken);
  assert(filterBadType.status === 422, 'Invalid type filter → 422');

  // ── Dashboard ──────────────────────────────────────────────────────────────────
  console.log('\n── Dashboard ──────────────────────────────────────────');
  const summary = await request('GET', '/api/dashboard/summary', null, analystToken);
  assert(summary.status === 200, 'Analyst GET /dashboard/summary → 200');
  assert(typeof summary.body.data?.totalIncome === 'number', 'Summary has totalIncome');
  assert(typeof summary.body.data?.netBalance  === 'number', 'Summary has netBalance');

  const viewerSummary = await request('GET', '/api/dashboard/summary', null, viewerToken);
  assert(viewerSummary.status === 403, 'Viewer cannot access /dashboard/summary → 403');

  const byCat = await request('GET', '/api/dashboard/by-category', null, analystToken);
  assert(byCat.status === 200, 'GET /dashboard/by-category → 200');
  assert(Array.isArray(byCat.body.data?.categories), 'Category breakdown is an array');

  const trends = await request('GET', '/api/dashboard/trends?period=monthly&last=3', null, analystToken);
  assert(trends.status === 200, 'GET /dashboard/trends → 200');
  assert(Array.isArray(trends.body.data?.trends), 'Trends is an array');

  const recent = await request('GET', '/api/dashboard/recent?limit=5', null, adminToken);
  assert(recent.status === 200, 'GET /dashboard/recent → 200');
  assert(recent.body.data?.length <= 5, 'Recent activity respects limit');

  // ── Users (admin only) ────────────────────────────────────────────────────────
  console.log('\n── Users (Admin only) ─────────────────────────────────');
  const usersAdmin = await request('GET', '/api/users', null, adminToken);
  assert(usersAdmin.status === 200, 'Admin GET /api/users → 200');

  const usersViewer = await request('GET', '/api/users', null, viewerToken);
  assert(usersViewer.status === 403, 'Viewer GET /api/users → 403');

  const usersAnalyst = await request('GET', '/api/users', null, analystToken);
  assert(usersAnalyst.status === 403, 'Analyst GET /api/users → 403');

  // ── Soft delete ────────────────────────────────────────────────────────────────
  console.log('\n── Soft Delete ────────────────────────────────────────');
  const delRec = await request('DELETE', `/api/records/${recordId}`, null, adminToken);
  assert(delRec.status === 200, 'Admin DELETE /api/records/:id → 200');

  const getDeleted = await request('GET', `/api/records/${recordId}`, null, adminToken);
  assert(getDeleted.status === 404, 'Soft-deleted record returns 404 → correct');

  // ── 404 ────────────────────────────────────────────────────────────────────────
  console.log('\n── 404 / Unknown routes ───────────────────────────────');
  const notFound = await request('GET', '/api/does-not-exist');
  assert(notFound.status === 404, 'Unknown route → 404');

  // ── Summary ────────────────────────────────────────────────────────────────────
  console.log(`\n${'─'.repeat(55)}`);
  console.log(`  Results: ${passed} passed, ${failed} failed`);
  console.log('─'.repeat(55));

  if (failed > 0) {
    console.error('\n⚠️   Some tests failed.\n');
    process.exit(1);
  } else {
    console.log('\n🎉  All tests passed!\n');
  }
}

run().catch((err) => {
  console.error('\n💥  Test runner crashed:', err.message);
  console.error('    Is the server running? Start with: npm start\n');
  process.exit(1);
});
