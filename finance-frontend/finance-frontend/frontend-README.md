# 💰 Finance Data Processing & Access Control — Frontend

> A colorful, modern React dashboard that connects to the Finance Backend API. Features role-aware navigation, interactive charts, full CRUD for financial records, and user management.

![React](https://img.shields.io/badge/React-18-blue) ![Vite](https://img.shields.io/badge/Vite-5-purple) ![Recharts](https://img.shields.io/badge/Recharts-2-green) ![License](https://img.shields.io/badge/license-ISC-lightgrey)

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Pages & Features](#-pages--features)
- [Role-Based UI](#-role-based-ui)
- [Connecting to the Backend](#-connecting-to-the-backend)
- [Build for Production](#-build-for-production)
- [Design System](#-design-system)

---

## 🌟 Overview

This frontend is the dashboard interface for the **Finance Data Processing and Access Control** project. It is a fully working single-page application that:

- Authenticates users via JWT stored in localStorage
- Shows or hides pages and buttons based on the logged-in user's role
- Displays income, expense, and balance charts powered by real API data
- Lets admin users create, edit, and delete financial records and team members
- Works with the companion backend at `finance-backend/`

---

## 🛠 Tech Stack

| Concern | Choice | Reason |
|---|---|---|
| Framework | React 18 | Component-based, industry standard |
| Build tool | Vite | Fast dev server, instant HMR |
| Routing | React Router v6 | Client-side navigation with protected routes |
| Charts | Recharts | Composable chart library built on D3 |
| Icons | Lucide React | Clean, consistent icon set |
| Styling | Custom CSS variables | Full design control, no framework overhead |
| HTTP | Native fetch | No extra dependency needed |
| Fonts | Syne + DM Sans (Google Fonts) | Distinctive, professional typography |

---

## 📁 Project Structure

```
finance-frontend/
│
├── src/
│   ├── main.jsx                        ← React entry point
│   ├── App.jsx                         ← Router, protected routes, app shell
│   ├── index.css                       ← Global design system (CSS variables, tokens)
│   │
│   ├── api/
│   │   └── client.js                   ← Fetch wrapper + all API call functions
│   │
│   ├── context/
│   │   └── AuthContext.jsx             ← JWT auth state, login/logout
│   │
│   ├── hooks/
│   │   └── useToast.js                 ← Toast notification hook
│   │
│   ├── components/
│   │   ├── Layout/
│   │   │   └── Sidebar.jsx             ← Navigation sidebar with role-aware menu
│   │   └── UI/
│   │       └── index.jsx               ← Shared UI: Modal, Badge, Pagination,
│   │                                      Spinner, Toast, EmptyState, ConfirmModal
│   │
│   └── pages/
│       ├── Login.jsx                   ← Login form with demo quick-fill buttons
│       ├── Dashboard.jsx               ← Stat cards + Area, Bar, Pie charts
│       ├── Records.jsx                 ← Financial records table with CRUD
│       └── Users.jsx                  ← User management table (admin only)
│
├── .env                                ← API URL configuration
├── package.json
├── vite.config.js
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js 18+** — Download from [nodejs.org](https://nodejs.org)
- The **finance-backend** must be running first

### Step 1 — Clone or download the project

```bash
# If cloning from GitHub
git clone https://github.com/YOUR_USERNAME/finance-frontend.git
cd finance-frontend

# If you downloaded a zip — unzip it and cd into the folder
cd finance-frontend
```

### Step 2 — Install dependencies

```bash
npm install
```

### Step 3 — Configure environment

Open `.env` and make sure it points to your running backend:

```env
VITE_API_URL=http://localhost:3000
```

### Step 4 — Start the development server

```bash
npm run dev
```

You should see:
```
  VITE v5.x.x  ready in 300ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.x.x:5173/
```

### Step 5 — Open in your browser

Visit `http://localhost:5173`

You will see the **FinanceOS login page**. Use any of the demo quick-fill buttons or enter credentials manually:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@finance.dev | Password123! |
| Analyst | analyst@finance.dev | Password123! |
| Viewer | viewer@finance.dev | Password123! |

> **Note:** Make sure `npm run seed` has been run in the backend project first. Otherwise there will be no demo users.

---

## ⚙️ Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | URL of the running backend API | `http://localhost:3000` |

> All variables in Vite must be prefixed with `VITE_` to be accessible in the browser.

---

## 📄 Pages & Features

### Login Page (`/login`)

- Email and password form with show/hide password toggle
- Three **demo quick-fill buttons** — click Admin, Analyst, or Viewer to auto-fill credentials
- Error messages for wrong credentials
- Automatic redirect to `/dashboard` (admin/analyst) or `/records` (viewer) after login

---

### Dashboard Page (`/dashboard`)

**Access: analyst and admin only**

Displays a complete financial overview powered by live API data:

**Stat Cards (top row)**
- Total Income — sum of all income records
- Total Expenses — sum of all expense records
- Net Balance — income minus expenses
- Savings Rate — net balance as a percentage of total income

**Charts**
- **Area Chart** — monthly income vs expenses over the last 6 months
- **Pie Chart** — spending breakdown by category with percentage labels
- **Bar Chart** — monthly net balance (green for positive, red for negative)

**Recent Activity Table** — last 6 transactions with link to view all records

---

### Records Page (`/records`)

**Access: all authenticated users**

A full financial records management interface:

**For all roles (viewer, analyst, admin):**
- Paginated table showing all financial records
- Filter bar with controls for: Type, Category, Date From, Date To, Sort By, Sort Order
- Clear filters button

**For admin only (hidden for other roles):**
- Add Record button — opens a modal form
- Edit button on each row — opens pre-filled modal form
- Delete button on each row — opens a confirmation dialog
- Soft delete with immediate feedback

**Record form fields:**
- Type (income or expense)
- Amount
- Category (dropdown with 12 common categories)
- Date
- Notes (optional)

---

### Users Page (`/users`)

**Access: admin only**

Team member management interface:

- Paginated table of all users
- Filter by role (admin, analyst, viewer)
- User avatar initials generated from name
- Role and status badges with colour coding
- Add User button — opens a create form
- Edit button — opens update form (role, status, name)
- Delete button — confirmation dialog before soft-delete

---

## 🎭 Role-Based UI

The frontend enforces the same role restrictions as the backend:

**Sidebar navigation** — menu items are hidden if the user does not have access:
- Dashboard → only shown to analyst and admin
- Users → only shown to admin

**Records page** — Add, Edit, Delete buttons are hidden for viewer and analyst roles. They see a read-only table.

**Route-level protection** — navigating directly to a restricted URL (e.g. `/dashboard` as a viewer) shows an Access Denied page instead of the content.

**Automatic redirect** — viewers are sent to `/records` on login since they cannot access `/dashboard`.

---

## 🔌 Connecting to the Backend

All API communication goes through `src/api/client.js`. It:

- Automatically attaches the JWT token from localStorage to every request
- Parses JSON responses
- Throws structured errors with the message from the API

The API is organized into four groups:

```js
authApi    → /api/auth/*
usersApi   → /api/users/*
recordsApi → /api/records/*
dashboardApi → /api/dashboard/*
```

To point the frontend at a different backend (e.g. deployed on Railway), just update `.env`:
```env
VITE_API_URL=https://your-backend.up.railway.app
```

---

## 📦 Build for Production

```bash
npm run build
```

This creates a `dist/` folder with optimized static files. To preview the production build locally:

```bash
npm run preview
```

### Deploying to Vercel

1. Push the project to GitHub
2. Go to [vercel.com](https://vercel.com) and import the repository
3. Vercel auto-detects Vite — no configuration needed
4. Add this environment variable before deploying:

| Key | Value |
|-----|-------|
| `VITE_API_URL` | Your deployed backend URL |

5. Click Deploy — done in about 60 seconds

---

## 🎨 Design System

The design uses a custom CSS variable system defined in `src/index.css`.

**Colour palette:**

| Token | Value | Used for |
|-------|-------|---------|
| `--violet` | `#7C3AED` | Primary actions, active nav, income stat card |
| `--rose` | `#F43F5E` | Expenses, delete actions, error states |
| `--emerald` | `#10B981` | Net balance, success states, income amounts |
| `--amber` | `#F59E0B` | Savings rate, warnings |
| `--sky` | `#0EA5E9` | Analyst badge, info accents |
| `--ink` | `#0F0A1E` | Primary text, sidebar background |

**Typography:**

| Font | Usage |
|------|-------|
| Syne (Google Fonts) | Headings, labels, stat values — bold and distinctive |
| DM Sans (Google Fonts) | Body text, inputs, buttons — clean and readable |

**Component tokens:**

```css
--r-sm:  8px    /* small radius — inputs, buttons */
--r-md: 14px    /* medium radius — cards, modals */
--r-lg: 20px    /* large radius — main cards */
--r-xl: 28px    /* extra large — modal boxes */
```

---

## 📄 License

ISC
