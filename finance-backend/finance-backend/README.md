# 💰 Finance Data Processing & Access Control Backend

A production-quality REST API for a **finance dashboard system** with role-based access control, financial records management, and aggregated analytics.

---

## Tech Stack

| Concern | Choice | Reason |
|---|---|---|
| Runtime | Node.js 18+ | Async I/O, widely adopted |
| Framework | Express.js | Minimal, flexible, well-documented |
| Auth | JWT (jsonwebtoken) | Stateless, scalable |
| Password hashing | bcryptjs | Industry-standard bcrypt |
| Validation | express-validator | Declarative, co-located with routes |
| Database | JSON file store (custom) | Zero-dependency, swappable |
| Security | helmet, cors | HTTP header hardening |
| Logging | morgan | Request logging |

> **Database note:** The persistence layer (`src/config/db.js`) is a thin wrapper over a JSON file at `./data/db.json`. It uses the same interface (`getAll`, `findOne`, `insert`, `update`, `delete`, `softDelete`) as you'd expect from a real ORM. Swapping to PostgreSQL or MongoDB only requires replacing that file — no controller or route changes needed.

---

## Project Structure

```
finance-backend/
├── src/
│   ├── app.js                    ← Express app + server bootstrap
│   ├── config/
│   │   ├── db.js                 ← JSON persistence layer
│   │   └── seed.js               ← Demo data seeder
│   ├── middleware/
│   │   ├── auth.js               ← JWT verification (authenticate)
│   │   ├── rbac.js               ← Role-based guards (authorize, requireMinRole)
│   │   ├── validate.js           ← express-validator result checker
│   │   └── errorHandler.js       ← Global error handler
│   ├── controllers/
│   │   ├── authController.js     ← register, login, getMe
│   │   ├── userController.js     ← user CRUD (admin)
│   │   ├── recordController.js   ← financial record CRUD
│   │   └── dashboardController.js← summary, trends, category breakdown
│   ├── routes/
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── records.js
│   │   └── dashboard.js
│   ├── utils/
│   │   ├── AppError.js           ← Structured error class
│   │   └── response.js           ← Consistent JSON envelope helpers
│   └── tests/
│       └── run.js                ← Integration test suite (no deps)
├── data/
│   └── db.json                   ← Auto-created on first run
├── .env
├── package.json
└── README.md
```

---

## Setup & Run

### 1. Clone / unzip & install

```bash
npm install
```

### 2. Environment

A `.env` file is included. No changes needed for local development:

```env
PORT=3000
JWT_SECRET=finance_super_secret_key_2024_do_not_expose
JWT_EXPIRES_IN=24h
NODE_ENV=development
DB_FILE=./data/db.json
```

### 3. Seed demo data

```bash
npm run seed
```

Creates three demo users (all with password `Password123!`):

| Role    | Email                  |
|---------|------------------------|
| admin   | admin@finance.dev      |
| analyst | analyst@finance.dev    |
| viewer  | viewer@finance.dev     |

And 12 sample financial records across two months.

### 4. Start the server

```bash
npm start
# or, for auto-reload during development:
npm run dev
```

Server starts at `http://localhost:3000`.

### 5. Run tests

```bash
# In a second terminal (server must be running):
npm test
```

---

## Role Model & Permissions

```
Roles (lowest → highest): viewer → analyst → admin
```

| Endpoint / Action               | viewer | analyst | admin |
|---------------------------------|:------:|:-------:|:-----:|
| POST /api/auth/login            | ✓      | ✓       | ✓     |
| GET  /api/auth/me               | ✓      | ✓       | ✓     |
| GET  /api/records               | ✓      | ✓       | ✓     |
| GET  /api/records/:id           | ✓      | ✓       | ✓     |
| POST /api/records               | ✗      | ✗       | ✓     |
| PATCH /api/records/:id          | ✗      | ✗       | ✓     |
| DELETE /api/records/:id         | ✗      | ✗       | ✓     |
| GET /api/dashboard/*            | ✗      | ✓       | ✓     |
| GET/POST/PATCH/DELETE /api/users| ✗      | ✗       | ✓     |

RBAC is enforced at the route level using two reusable middleware functions:
- `authorize(...roles)` — exact role match
- `requireMinRole(minRole)` — minimum hierarchy level

---

## API Reference

All responses follow a consistent envelope:

```json
{
  "success": true,
  "message": "Human readable message",
  "data": { ... },
  "meta": { "total": 42, "page": 1, "limit": 20, "totalPages": 3 }
}
```

Error responses:

```json
{
  "success": false,
  "message": "What went wrong",
  "errors": [{ "field": "email", "message": "Not a valid email" }]
}
```

---

### 🔐 Auth

#### `POST /api/auth/register`

```json
{
  "name": "Alice",
  "email": "alice@example.com",
  "password": "SecurePass1",
  "role": "admin"
}
```

Response `201`:
```json
{ "success": true, "data": { "token": "eyJ...", "user": { "id": "...", "role": "admin" } } }
```

#### `POST /api/auth/login`

```json
{ "email": "admin@finance.dev", "password": "Password123!" }
```

#### `GET /api/auth/me`

Header: `Authorization: Bearer <token>`

---

### 👥 Users (admin only)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/users` | List users (filter: role, status; paginated) |
| POST | `/api/users` | Create user |
| GET | `/api/users/:id` | Get user |
| PATCH | `/api/users/:id` | Update name/role/status/password |
| DELETE | `/api/users/:id` | Soft-delete user |

**Create user body:**
```json
{
  "name": "Bob",
  "email": "bob@example.com",
  "password": "SecurePass1",
  "role": "analyst",
  "status": "active"
}
```

---

### 📒 Financial Records

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/api/records` | all | List records with filters |
| POST | `/api/records` | admin | Create record |
| GET | `/api/records/:id` | all | Get single record |
| PATCH | `/api/records/:id` | admin | Update record |
| DELETE | `/api/records/:id` | admin | Soft-delete record |

**Create record body:**
```json
{
  "amount": 1500.00,
  "type": "income",
  "category": "Salary",
  "date": "2024-05-01",
  "notes": "May salary payment"
}
```

**List records query params:**

| Param | Type | Example | Description |
|-------|------|---------|-------------|
| `type` | string | `income` | Filter by type |
| `category` | string | `Rent` | Case-insensitive contains |
| `dateFrom` | date | `2024-01-01` | Start date |
| `dateTo` | date | `2024-12-31` | End date |
| `minAmount` | number | `100` | Minimum amount |
| `maxAmount` | number | `5000` | Maximum amount |
| `sortBy` | string | `amount` | `date`, `amount`, `createdAt` |
| `order` | string | `asc` | `asc` or `desc` |
| `page` | number | `1` | Page number |
| `limit` | number | `20` | Records per page (max 100) |

---

### 📊 Dashboard (analyst + admin)

#### `GET /api/dashboard/summary`
Query: `dateFrom`, `dateTo`

```json
{
  "totalIncome": 11650.00,
  "totalExpense": 3190.00,
  "netBalance": 8460.00,
  "recordCount": 12,
  "savingsRate": 72.62
}
```

#### `GET /api/dashboard/by-category`
Query: `type`, `dateFrom`, `dateTo`

```json
{
  "categories": [
    { "category": "Salary", "type": "income", "total": 10000, "count": 2, "percentage": 85.84 }
  ],
  "grandTotal": 11650
}
```

#### `GET /api/dashboard/trends`
Query: `period` (`monthly` | `weekly`), `last` (1–24, default 6)

```json
{
  "period": "monthly",
  "trends": [
    { "period": "2024-03", "income": 6150, "expense": 1690, "net": 4460 },
    { "period": "2024-04", "income": 5500, "expense": 1500, "net": 4000 }
  ]
}
```

#### `GET /api/dashboard/recent`
Query: `limit` (1–50, default 10)

Returns the N most recently created records.

---

## Design Decisions & Assumptions

1. **Soft deletes everywhere** — Records and users are never hard-deleted. `deletedAt` is set instead. This enables audit trails and potential data recovery.

2. **JWT is stateless** — No token blacklist. In production, add a Redis-backed deny-list for logout/revocation.

3. **Password security** — bcrypt with cost factor 10. Registration requires minimum 8 chars + uppercase + number.

4. **Role assignment during registration** — Allowed for demo simplicity. In production, only admins should assign elevated roles.

5. **Amount precision** — All amounts are stored and returned as floats rounded to 2 decimal places.

6. **Viewer can access records but NOT dashboard insights** — Viewers can see raw records (like a data entry clerk) but cannot access aggregated summaries (analyst intelligence).

7. **Error code field** — Every error response includes a machine-readable `code` (e.g. `EMAIL_TAKEN`, `INSUFFICIENT_PERMISSIONS`) alongside the human-readable message.

8. **Database swap path** — `src/config/db.js` is the only file that touches storage. Replacing it with a Prisma/Mongoose/pg adapter requires zero changes elsewhere.

---

## Optional Enhancements Implemented

- ✅ JWT authentication
- ✅ Pagination on all list endpoints
- ✅ Soft delete (users + records)
- ✅ Filtering by multiple criteria
- ✅ API documentation (this README)
- ✅ Integration test suite (no external dependencies)
- ✅ Consistent error response shape with machine-readable error codes
- ✅ Security headers via helmet
- ✅ Request logging via morgan
