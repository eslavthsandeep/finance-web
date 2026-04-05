# 💰 Finance Data Processing & Access Control

> A full-stack finance dashboard system with role-based access control, financial records management, interactive charts, and aggregated analytics.

![Node.js](https://img.shields.io/badge/Node.js-18%2B-brightgreen)
![React](https://img.shields.io/badge/React-18-blue)
![Express](https://img.shields.io/badge/Express-4.18-lightgrey)
![JWT](https://img.shields.io/badge/Auth-JWT-orange)
![License](https://img.shields.io/badge/license-ISC-lightgrey)

---

## 📁 Repository Structure

```
/
├── finance-backend/        ← Node.js + Express REST API
└── finance-frontend/       ← React + Vite dashboard
```

---

## 🌟 Project Overview

This project was built for the **Finance Data Processing and Access Control** backend internship assessment.

The system supports three user roles — **Viewer**, **Analyst**, and **Admin** — each with different levels of access to financial data. The backend provides a complete REST API with JWT authentication and role-based access control. The frontend is a modern React dashboard with interactive charts, record management, and a role-aware interface.

---

## 🛠 Tech Stack

### Backend
| Concern | Technology |
|---|---|
| Runtime | Node.js 18+ |
| Framework | Express.js |
| Authentication | JWT (jsonwebtoken) |
| Password Hashing | bcryptjs |
| Validation | express-validator |
| Database | JSON file store (zero-dependency, swappable) |
| Security | helmet, cors |
| Logging | morgan |

### Frontend
| Concern | Technology |
|---|---|
| Framework | React 18 |
| Build Tool | Vite |
| Routing | React Router v6 |
| Charts | Recharts |
| Icons | Lucide React |
| Styling | Custom CSS variables |

---

## 🔐 Role Model & Permissions

```
viewer (1)  →  analyst (2)  →  admin (3)
```

| Action | Viewer | Analyst | Admin |
|--------|:------:|:-------:|:-----:|
| Login / Register | ✅ | ✅ | ✅ |
| View financial records | ✅ | ✅ | ✅ |
| Access dashboard & charts | ❌ | ✅ | ✅ |
| Create / Edit / Delete records | ❌ | ❌ | ✅ |
| Manage users | ❌ | ❌ | ✅ |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ → [nodejs.org](https://nodejs.org)
- npm (comes with Node.js)

---

### Step 1 — Set up the Backend

```bash
cd finance-backend
npm install
```

The `.env` file is already included. No changes needed for local development:

```env
PORT=3000
JWT_SECRET=finance_super_secret_key_2024_do_not_expose
JWT_EXPIRES_IN=24h
NODE_ENV=development
DB_FILE=./data/db.json
```

Seed the database with demo users and sample records:

```bash
npm run seed
```

You should see:
```
🌱  Seeding database…
   ✓ Created users: admin@finance.dev, analyst@finance.dev, viewer@finance.dev
   ✓ Created 12 financial records
✅  Seed complete!
```

Start the backend server:

```bash
npm start
```

Server runs at → `http://localhost:3000`

Verify it is working:
```
GET http://localhost:3000/health
→ { "status": "ok" }
```

---

### Step 2 — Set up the Frontend

Open a **new terminal window**:

```bash
cd finance-frontend
npm install
npm run dev
```

Frontend runs at → `http://localhost:5173`

---

### Step 3 — Login

Open your browser at `http://localhost:5173`

Use the **demo quick-fill buttons** on the login page or enter credentials manually:

| Role | Email | Password |
|------|-------|----------|
| 🔴 Admin | admin@finance.dev | Password123! |
| 🟡 Analyst | analyst@finance.dev | Password123! |
| 🟢 Viewer | viewer@finance.dev | Password123! |

---

## 📡 Core API Endpoints

Base URL: `http://localhost:3000`

All protected routes require:
```
Authorization: Bearer <your_jwt_token>
```

### Auth
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/register` | Public | Create a new account |
| POST | `/api/auth/login` | Public | Login and receive JWT |
| GET | `/api/auth/me` | All | Get own profile |

### Financial Records
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/records` | All | List records (filters + pagination) |
| GET | `/api/records/:id` | All | Get a single record |
| POST | `/api/records` | Admin | Create a record |
| PATCH | `/api/records/:id` | Admin | Update a record |
| DELETE | `/api/records/:id` | Admin | Soft-delete a record |

### Dashboard Analytics
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/dashboard/summary` | Analyst+ | Total income, expense, balance |
| GET | `/api/dashboard/by-category` | Analyst+ | Spending by category with % |
| GET | `/api/dashboard/trends` | Analyst+ | Monthly or weekly trends |
| GET | `/api/dashboard/recent` | Analyst+ | Latest transactions |

### Users
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/users` | Admin | List all users |
| POST | `/api/users` | Admin | Create a user |
| GET | `/api/users/:id` | Admin | Get a single user |
| PATCH | `/api/users/:id` | Admin | Update role, status, name |
| DELETE | `/api/users/:id` | Admin | Soft-delete a user |

---

## 📊 Dashboard Features

When logged in as **Analyst** or **Admin**, the dashboard shows:

- **Stat Cards** — Total Income, Total Expenses, Net Balance, Savings Rate
- **Area Chart** — Monthly income vs expenses over the last 6 months
- **Pie Chart** — Category-wise spending breakdown with percentages
- **Bar Chart** — Monthly net balance (green = positive, red = negative)
- **Recent Activity** — Latest 6 transactions with quick link to full records

---

## 🗄 Database

The backend uses a **custom JSON file-based persistence layer** at `./finance-backend/data/db.json`.

**Why JSON?**
- Zero external dependencies — runs immediately after `npm install`
- No database server setup required
- The entire store is human-readable and inspectable

**Swapping to a real database:**
`src/config/db.js` is the only file that touches storage. It exposes 7 methods (`getAll`, `findOne`, `findMany`, `insert`, `update`, `delete`, `softDelete`) that map directly to standard ORM operations. Replacing it with Mongoose or Prisma requires **zero changes** to any controller, route, or middleware.

---

## ✅ Available Scripts

### Backend (`finance-backend/`)

| Command | Description |
|---------|-------------|
| `npm start` | Start the production server |
| `npm run dev` | Start with auto-reload on file changes |
| `npm run seed` | Populate database with demo data |
| `npm test` | Run the 44-test integration suite |

### Frontend (`finance-frontend/`)

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the development server |
| `npm run build` | Build optimised production files |
| `npm run preview` | Preview the production build locally |

---

## 🧪 Running Tests

The backend includes a **44-test integration suite** with no external dependencies:

```bash
# Terminal 1 — backend must be running
cd finance-backend
npm start

# Terminal 2 — run all tests
cd finance-backend
npm test
```

**Test coverage:**
- Health check
- User registration, duplicate email, login, wrong password
- Protected route access without token
- Input validation errors
- Records CRUD with correct HTTP status codes
- Role enforcement (viewer / analyst / admin blocked correctly on every route)
- Multi-field filtering and pagination
- All four dashboard analytics endpoints
- Admin-only user management
- Soft delete behaviour (deleted records return 404)
- Unknown route 404 handling

---

## ✨ Features Implemented

### Core Requirements
- ✅ User and Role Management (viewer / analyst / admin)
- ✅ Financial Records CRUD (create, read, update, delete)
- ✅ Dashboard Summary APIs (totals, categories, trends, recent)
- ✅ Access Control Logic (enforced at route level via middleware)
- ✅ Validation and Error Handling (field-level errors, status codes)
- ✅ Data Persistence (JSON file store, swappable architecture)

### Optional Enhancements
- ✅ JWT Authentication with bcrypt password hashing
- ✅ Pagination on all list endpoints
- ✅ Soft deletes for records and users
- ✅ Multi-criteria filtering (type, category, date range, amount range)
- ✅ 44-test integration suite (no testing framework required)
- ✅ Machine-readable error codes on every error response
- ✅ Savings rate calculation in dashboard summary
- ✅ Security headers via helmet
- ✅ HTTP request logging via morgan
- ✅ React frontend with interactive charts (Area, Bar, Pie)
- ✅ Role-aware sidebar navigation (hides inaccessible pages)
- ✅ Toast notifications for all CRUD operations

---

## 🧠 Design Decisions

**1. Soft deletes everywhere**
Records and users set a `deletedAt` timestamp instead of being removed. This preserves the audit trail and allows recovery. All queries filter `deletedAt: null`.

**2. Viewer reads records but not analytics**
Viewers can see raw transaction records (like a data entry clerk) but cannot access aggregated business insights on the dashboard, which are reserved for analyst and above.

**3. Swappable database layer**
`src/config/db.js` is the only file that touches storage. The interface is identical to what any ORM provides, making it a one-file swap to upgrade to a real database.

**4. Generic login error messages**
Both wrong email and wrong password return the same message to prevent user enumeration attacks.

**5. Password never in responses**
The password hash is stripped at the controller level before any response, on every endpoint including admin user management.

**6. Consistent response envelope**
Every API response follows the same `{ success, message, data, meta }` shape so the frontend always knows what to expect.

**7. Machine-readable error codes**
Every error includes a short `code` string (e.g. `INSUFFICIENT_PERMISSIONS`, `EMAIL_TAKEN`) alongside the human-readable message, making frontend error handling straightforward.

---

## 📋 Evaluation Criteria Mapping

| Criterion | Where to look |
|-----------|--------------|
| **Backend Design** | `finance-backend/src/routes/`, `controllers/`, `middleware/` — clear separation of concerns |
| **Logical Thinking** | `middleware/rbac.js` for RBAC, `controllers/dashboardController.js` for aggregation logic |
| **Functionality** | All 6 core requirements implemented — see API Endpoints table above |
| **Code Quality** | Consistent naming, JSDoc comments, single-responsibility functions, no logic in route files |
| **Database & Data Modeling** | `config/db.js` for the persistence interface, `config/seed.js` for the data schema |
| **Validation & Reliability** | `middleware/validate.js`, validation chains in every route file, `middleware/errorHandler.js` |
| **Documentation** | This README — covers both projects, full API reference, role table, design decisions |
| **Additional Thoughtfulness** | 44-test suite, soft deletes, pagination meta, error codes, savings rate, frontend charts |

---

## 📄 License

ISC
