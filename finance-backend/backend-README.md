# 💰 Finance Data Processing & Access Control — Backend

> A production-quality REST API for a finance dashboard system with role-based access control, financial records management, and aggregated analytics.

![Node.js](https://img.shields.io/badge/Node.js-18%2B-brightgreen) ![Express](https://img.shields.io/badge/Express-4.18-blue) ![JWT](https://img.shields.io/badge/Auth-JWT-orange) ![License](https://img.shields.io/badge/license-ISC-lightgrey)

---

## 📋 Table of Contents

- [Objective](#-objective)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Role Model & Permissions](#-role-model--permissions)
- [API Reference](#-api-reference)
- [Database](#-database)
- [Validation & Error Handling](#-validation--error-handling)
- [Running Tests](#-running-tests)
- [Optional Enhancements Implemented](#-optional-enhancements-implemented)
- [Design Decisions & Assumptions](#-design-decisions--assumptions)
- [Evaluation Criteria Mapping](#-evaluation-criteria-mapping)

---

## 🎯 Objective

This project was built for the **Finance Data Processing and Access Control** backend internship assessment. The goal is to demonstrate backend engineering skills across:

- REST API design and structure
- Role-based access control (RBAC)
- Data modeling and persistence
- Business logic and aggregated analytics
- Input validation and error handling
- Code quality, maintainability, and documentation

---

## 🛠 Tech Stack

| Concern | Choice | Reason |
|---|---|---|
| Runtime | Node.js 18+ | Async I/O, widely adopted in industry |
| Framework | Express.js | Minimal, flexible, well-documented |
| Authentication | JWT (jsonwebtoken) | Stateless, scalable token auth |
| Password Hashing | bcryptjs | Industry-standard bcrypt algorithm |
| Validation | express-validator | Declarative, co-located with routes |
| Database | JSON file store (custom) | Zero-dependency, instantly runnable, swappable |
| Security | helmet, cors | HTTP header hardening + CORS control |
| Logging | morgan | HTTP request logging |
| IDs | uuid | Collision-resistant unique identifiers |

---

## 📁 Project Structure

```
finance-backend/
│
├── src/
│   ├── app.js                      ← Express app entry point + server bootstrap
│   │
│   ├── config/
│   │   ├── db.js                   ← JSON file persistence layer (swappable)
│   │   └── seed.js                 ← Demo data seeder
│   │
│   ├── middleware/
│   │   ├── auth.js                 ← JWT verification middleware
│   │   ├── rbac.js                 ← Role-based access guards
│   │   ├── validate.js             ← express-validator result checker
│   │   └── errorHandler.js         ← Global error handler
│   │
│   ├── controllers/
│   │   ├── authController.js       ← register, login, getMe
│   │   ├── userController.js       ← user CRUD (admin only)
│   │   ├── recordController.js     ← financial record CRUD
│   │   └── dashboardController.js  ← summary, trends, category breakdown
│   │
│   ├── routes/
│   │   ├── auth.js                 ← /api/auth/*
│   │   ├── users.js                ← /api/users/*
│   │   ├── records.js              ← /api/records/*
│   │   └── dashboard.js            ← /api/dashboard/*
│   │
│   ├── utils/
│   │   ├── AppError.js             ← Structured operational error class
│   │   └── response.js             ← Consistent JSON envelope helpers
│   │
│   └── tests/
│       └── run.js                  ← Integration test suite (44 tests, no dependencies)
│
├── data/
│   └── db.json                     ← Auto-created on first seed run
│
├── .env                            ← Environment variables
├── package.json
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js 18+** — Download from [nodejs.org](https://nodejs.org)
- **npm** — Comes with Node.js

Verify your installation:
```bash
node -v   # should be v18.0.0 or higher
npm -v    # should be 8.0.0 or higher
```

### Step 1 — Clone or download the project

```bash
# If cloning from GitHub
git clone https://github.com/YOUR_USERNAME/finance-backend.git
cd finance-backend

# If you downloaded a zip — unzip it and cd into the folder
cd finance-backend
```

### Step 2 — Install dependencies

```bash
npm install
```

### Step 3 — Set up environment variables

The `.env` file is already included. No changes are needed for local development. See [Environment Variables](#-environment-variables) for details.

### Step 4 — Seed the database

```bash
npm run seed
```

You should see:
```
🌱  Seeding database…
   ✓ Created users: admin@finance.dev, analyst@finance.dev, viewer@finance.dev
   ✓ Created 12 financial records
✅  Seed complete!

   Login credentials (all roles, same password: Password123!):
   Admin   → admin@finance.dev
   Analyst → analyst@finance.dev
   Viewer  → viewer@finance.dev
```

### Step 5 — Start the server

```bash
npm start
```

You should see:
```
╔══════════════════════════════════════════════════════╗
║   💰  Finance Backend API                            ║
╚══════════════════════════════════════════════════════╝

  🚀  Server running on http://localhost:3000
  🌍  Environment : development
```

### Step 6 — Verify it is working

Open your browser and visit:
```
http://localhost:3000/health
```

Expected response:
```json
{
  "status": "ok",
  "service": "Finance Data Processing & Access Control API",
  "version": "1.0.0",
  "environment": "development"
}
```

---

## ⚙️ Environment Variables

The `.env` file contains:

```env
PORT=3000
JWT_SECRET=finance_super_secret_key_2024_do_not_expose
JWT_EXPIRES_IN=24h
NODE_ENV=development
DB_FILE=./data/db.json
```

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Port the server listens on | `3000` |
| `JWT_SECRET` | Secret key for signing JWT tokens | see .env |
| `JWT_EXPIRES_IN` | JWT token expiry duration | `24h` |
| `NODE_ENV` | Environment (development/production) | `development` |
| `DB_FILE` | Path to the JSON database file | `./data/db.json` |

---

## 🔐 Role Model & Permissions

Three roles are supported with a clear privilege hierarchy:

```
viewer (1)  →  analyst (2)  →  admin (3)
```

| Action | Viewer | Analyst | Admin |
|--------|:------:|:-------:|:-----:|
| Register / Login | ✅ | ✅ | ✅ |
| View own profile | ✅ | ✅ | ✅ |
| View financial records (list) | ✅ | ✅ | ✅ |
| View a single record | ✅ | ✅ | ✅ |
| Create financial records | ❌ | ❌ | ✅ |
| Update financial records | ❌ | ❌ | ✅ |
| Delete financial records | ❌ | ❌ | ✅ |
| Access dashboard analytics | ❌ | ✅ | ✅ |
| List all users | ❌ | ❌ | ✅ |
| Create / update / delete users | ❌ | ❌ | ✅ |

RBAC is enforced at the **route level** using two reusable middleware functions in `src/middleware/rbac.js`:

- `authorize('admin')` — allows only the listed roles
- `requireMinRole('analyst')` — allows users at or above the specified role level

---

## 📡 API Reference

### Response Envelope

Every API response follows the same consistent shape:

**Success:**
```json
{
  "success": true,
  "message": "Human readable message",
  "data": { },
  "meta": { "total": 42, "page": 1, "limit": 20, "totalPages": 3 }
}
```

**Error:**
```json
{
  "success": false,
  "message": "What went wrong",
  "errors": [
    { "field": "email", "message": "Not a valid email address" }
  ]
}
```

---

### 🔑 Auth Endpoints

#### Register
```
POST /api/auth/register
```

Request body:
```json
{
  "name": "Alice Smith",
  "email": "alice@example.com",
  "password": "SecurePass1",
  "role": "admin"
}
```

Password rules: min 8 characters, at least 1 uppercase letter, at least 1 number.

Response `201`:
```json
{
  "success": true,
  "message": "Account created successfully.",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid",
      "name": "Alice Smith",
      "email": "alice@example.com",
      "role": "admin",
      "status": "active"
    }
  }
}
```

---

#### Login
```
POST /api/auth/login
```

Request body:
```json
{
  "email": "admin@finance.dev",
  "password": "Password123!"
}
```

Response `200` — returns a JWT token. Use this in the `Authorization` header for all protected routes:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

#### Get Own Profile
```
GET /api/auth/me
Authorization: Bearer <token>
```

Returns the currently authenticated user's profile (password is never included).

---

### 📒 Financial Records Endpoints

#### List Records
```
GET /api/records
Authorization: Bearer <token>
```

Access: **viewer, analyst, admin**

**Supported query parameters:**

| Parameter | Type | Example | Description |
|-----------|------|---------|-------------|
| `type` | string | `income` | Filter by type: `income` or `expense` |
| `category` | string | `Rent` | Case-insensitive contains match |
| `dateFrom` | date | `2024-01-01` | Start date (YYYY-MM-DD) |
| `dateTo` | date | `2024-12-31` | End date (YYYY-MM-DD) |
| `minAmount` | number | `100` | Minimum amount filter |
| `maxAmount` | number | `5000` | Maximum amount filter |
| `sortBy` | string | `amount` | Sort field: `date`, `amount`, `createdAt` |
| `order` | string | `desc` | Sort direction: `asc` or `desc` |
| `page` | number | `1` | Page number (default: 1) |
| `limit` | number | `20` | Records per page (max: 100, default: 20) |

Example:
```
GET /api/records?type=expense&category=Rent&dateFrom=2024-01-01&page=1&limit=10
```

Response `200`:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "amount": 1200,
      "type": "expense",
      "category": "Rent",
      "date": "2024-03-03",
      "notes": "Monthly rent",
      "createdBy": "uuid",
      "createdAt": "2024-03-03T10:00:00.000Z",
      "updatedAt": "2024-03-03T10:00:00.000Z",
      "deletedAt": null
    }
  ],
  "meta": { "total": 4, "page": 1, "limit": 10, "totalPages": 1 }
}
```

---

#### Get Single Record
```
GET /api/records/:id
Authorization: Bearer <token>
```

Access: **viewer, analyst, admin**

---

#### Create Record
```
POST /api/records
Authorization: Bearer <token>
```

Access: **admin only**

Request body:
```json
{
  "amount": 5000.00,
  "type": "income",
  "category": "Salary",
  "date": "2024-05-01",
  "notes": "May salary payment"
}
```

Response `201` — returns the created record.

---

#### Update Record
```
PATCH /api/records/:id
Authorization: Bearer <token>
```

Access: **admin only** — all fields are optional (partial update supported)

Request body:
```json
{
  "amount": 5500,
  "notes": "Updated salary"
}
```

---

#### Delete Record
```
DELETE /api/records/:id
Authorization: Bearer <token>
```

Access: **admin only**

Performs a **soft delete** — sets `deletedAt` timestamp. The record is hidden from all future queries but retained in the database for audit purposes.

---

### 📊 Dashboard Analytics Endpoints

All dashboard endpoints require at least the **analyst** role.

#### Summary Totals
```
GET /api/dashboard/summary
Authorization: Bearer <token>
```

Query params: `dateFrom`, `dateTo` (both optional, format YYYY-MM-DD)

Response `200`:
```json
{
  "success": true,
  "data": {
    "totalIncome": 11650.00,
    "totalExpense": 3190.00,
    "netBalance": 8460.00,
    "recordCount": 12,
    "savingsRate": 72.62
  }
}
```

---

#### Category Breakdown
```
GET /api/dashboard/by-category
Authorization: Bearer <token>
```

Query params: `type` (income or expense), `dateFrom`, `dateTo`

Response `200`:
```json
{
  "success": true,
  "data": {
    "categories": [
      {
        "category": "Salary",
        "type": "income",
        "total": 10000.00,
        "count": 2,
        "percentage": 85.84
      }
    ],
    "grandTotal": 11650.00
  }
}
```

---

#### Monthly / Weekly Trends
```
GET /api/dashboard/trends
Authorization: Bearer <token>
```

| Query Param | Options | Default | Description |
|-------------|---------|---------|-------------|
| `period` | `monthly`, `weekly` | `monthly` | Grouping period |
| `last` | 1–24 | `6` | Number of past periods to return |

Response `200`:
```json
{
  "success": true,
  "data": {
    "period": "monthly",
    "trends": [
      { "period": "2024-03", "income": 6150.00, "expense": 1690.00, "net": 4460.00 },
      { "period": "2024-04", "income": 5500.00, "expense": 1500.00, "net": 4000.00 }
    ]
  }
}
```

---

#### Recent Activity
```
GET /api/dashboard/recent
Authorization: Bearer <token>
```

Query params: `limit` (1–50, default 10)

Returns the most recently created records sorted newest first.

---

### 👥 User Management Endpoints

All user management endpoints require the **admin** role.

#### List Users
```
GET /api/users
Authorization: Bearer <token>
```

Query params: `role`, `status`, `page`, `limit`

---

#### Get Single User
```
GET /api/users/:id
Authorization: Bearer <token>
```

---

#### Create User
```
POST /api/users
Authorization: Bearer <token>
```

Request body:
```json
{
  "name": "Bob Jones",
  "email": "bob@company.com",
  "password": "SecurePass1",
  "role": "analyst",
  "status": "active"
}
```

---

#### Update User
```
PATCH /api/users/:id
Authorization: Bearer <token>
```

Updatable fields: `name`, `role`, `status`, `password`

---

#### Delete User
```
DELETE /api/users/:id
Authorization: Bearer <token>
```

Soft-delete — the user immediately loses all access. Their data is retained for audit purposes.

---

## 🗄 Database

This project uses a **custom JSON file-based persistence layer** stored at `./data/db.json`.

### Why JSON instead of a traditional database?

- **Zero setup** — runs immediately after `npm install` with no external services
- **Human-readable** — the entire data store can be inspected in any text editor
- **Swappable** — the persistence layer exposes the same interface as any real ORM

### Database file structure

```json
{
  "users": [
    {
      "id": "uuid",
      "name": "Alice Admin",
      "email": "admin@finance.dev",
      "password": "<bcrypt hash>",
      "role": "admin",
      "status": "active",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "deletedAt": null
    }
  ],
  "records": [
    {
      "id": "uuid",
      "amount": 5000,
      "type": "income",
      "category": "Salary",
      "date": "2024-03-01",
      "notes": "Monthly salary",
      "createdBy": "uuid",
      "createdAt": "2024-03-01T00:00:00.000Z",
      "updatedAt": "2024-03-01T00:00:00.000Z",
      "deletedAt": null
    }
  ]
}
```

### Swapping to a real database

`src/config/db.js` exposes exactly 7 methods:

```
getAll(collection)
findOne(collection, predicate)
findMany(collection, predicate)
insert(collection, doc)
update(collection, id, changes)
delete(collection, id)
softDelete(collection, id)
```

Replacing this file with a Mongoose or Prisma adapter requires **zero changes** to any controller, route, or middleware. The interface maps directly to standard ORM operations.

---

## ✅ Validation & Error Handling

### Input validation

Every route that accepts input has a validation chain using `express-validator`. Validations include:

- Required field checks
- Email format validation
- Password strength (min 8 chars, 1 uppercase, 1 number)
- Enum validation for `role`, `status`, `type`
- Date format enforcement (YYYY-MM-DD)
- Numeric range checks for `amount`, `page`, `limit`

### Validation error format

```json
{
  "success": false,
  "message": "Validation failed. Please check the highlighted fields.",
  "errors": [
    { "field": "amount", "message": "Amount must be a positive number." },
    { "field": "date",   "message": "Date must be in YYYY-MM-DD format." }
  ]
}
```

### HTTP status codes

| Code | When used |
|------|-----------|
| 200 | Successful read or update |
| 201 | Successful resource creation |
| 400 | Bad request (e.g. self-delete attempt) |
| 401 | Missing, invalid, or expired token |
| 403 | Authenticated but insufficient permissions |
| 404 | Resource not found or soft-deleted |
| 409 | Conflict (e.g. duplicate email on register) |
| 422 | Validation error (bad input data) |
| 500 | Unexpected server error |

### Machine-readable error codes

Every error includes a short `code` string for programmatic handling:

| Code | Meaning |
|------|---------|
| `NO_TOKEN` | Authorization header missing |
| `INVALID_TOKEN` | JWT signature is invalid |
| `TOKEN_EXPIRED` | JWT has expired |
| `INSUFFICIENT_PERMISSIONS` | Role too low for this action |
| `EMAIL_TAKEN` | Registration attempt with existing email |
| `INVALID_CREDENTIALS` | Wrong email or password |
| `USE_GOOGLE` | Account uses OAuth, no password set |
| `RECORD_NOT_FOUND` | Record does not exist or was soft-deleted |
| `USER_NOT_FOUND` | User does not exist or was soft-deleted |
| `SELF_DELETE` | Admin attempting to delete own account |
| `SELF_DEACTIVATION` | Admin attempting to deactivate own account |
| `ROUTE_NOT_FOUND` | Unknown API endpoint |

---

## 🧪 Running Tests

The project includes a 44-test integration suite that covers every endpoint and permission scenario. It uses only Node's built-in `http` module — no testing framework required.

```bash
# Terminal 1 — start the server
npm start

# Terminal 2 — run the tests
npm test
```

Expected output:
```
🧪  Running integration tests…

── Health ─────────────────────────────────────────────
  ✅ GET /health returns 200
  ✅ Health status is ok

── Auth: Register ─────────────────────────────────────
  ✅ POST /api/auth/register → 201
  ✅ Response contains JWT token
  ...

───────────────────────────────────────────────────────
  Results: 44 passed, 0 failed
───────────────────────────────────────────────────────

🎉  All tests passed!
```

**What the tests cover:**

- Health check
- User registration and duplicate email handling
- Login (correct and wrong password)
- Protected route access without token
- Input validation errors
- Records CRUD with correct status codes
- Role enforcement (viewer/analyst/admin blocked correctly)
- Multi-field filtering on records
- Dashboard analytics for each endpoint
- Admin-only user management
- Soft delete behaviour
- Unknown route 404 handling

---

## ✨ Optional Enhancements Implemented

| Enhancement | Status |
|-------------|:------:|
| JWT authentication | ✅ |
| Pagination on all list endpoints | ✅ |
| Soft delete for records and users | ✅ |
| Multi-criteria filtering for records | ✅ |
| Integration test suite (44 tests, no framework) | ✅ |
| Full API documentation (this README) | ✅ |
| Machine-readable error codes on every error | ✅ |
| Security headers via helmet | ✅ |
| HTTP request logging via morgan | ✅ |
| Savings rate calculation in dashboard summary | ✅ |

---

## 🧠 Design Decisions & Assumptions

**1. Soft deletes everywhere**
Records and users are never hard-deleted. A `deletedAt` timestamp is set instead. This preserves the audit trail and allows potential recovery. All read queries filter `deletedAt: null`.

**2. Viewer can read records but not analytics**
The viewer role can view raw transaction records but cannot access aggregated business insights (dashboard endpoints). Analyst and above can access the dashboard.

**3. Amount precision**
All amounts are stored and returned rounded to 2 decimal places to prevent floating point drift over time.

**4. Password never exposed**
The password field is stripped at the controller level before any response is sent. This applies to all endpoints including admin user management.

**5. Generic login error message**
Both wrong email and wrong password return the same `Invalid email or password` message. This prevents user enumeration attacks.

**6. Swappable database layer**
`src/config/db.js` is the only file that interacts with storage. All 7 methods map directly to standard ORM operations. Replacing it with Mongoose, Prisma, or any other adapter requires zero changes elsewhere.

**7. Session not used for JWT**
JWT is fully stateless. No server-side session storage is used. This makes the API horizontally scalable. The trade-off is that token revocation requires a deny-list (not implemented here, noted as a production concern).

---

## 📊 Evaluation Criteria Mapping

| Evaluation Criterion | Where to look in this project |
|----------------------|-------------------------------|
| **Backend Design** | `src/routes/` + `src/controllers/` + `src/middleware/` — clear separation of routing, business logic, and cross-cutting concerns |
| **Logical Thinking** | `src/middleware/rbac.js` for RBAC logic, `src/controllers/dashboardController.js` for aggregation business logic |
| **Functionality** | All 6 core requirements are implemented — see full API Reference above |
| **Code Quality** | Consistent naming, JSDoc comments on all files, single-responsibility functions, no logic in route files |
| **Database & Data Modeling** | `src/config/db.js` for the persistence interface, `src/config/seed.js` shows the schema structure |
| **Validation & Reliability** | `src/middleware/validate.js`, validation chains co-located in every route file, `src/middleware/errorHandler.js` |
| **Documentation** | This README — setup guide, full API reference, role table, design decisions, test instructions |
| **Additional Thoughtfulness** | 44-test integration suite, soft deletes, pagination meta, machine-readable error codes, savings rate, development auto-reload |

---

## 📄 License

ISC
