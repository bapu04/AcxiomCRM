# AcxiomCRM — Enterprise Role-Based CRM Application

[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=black)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-4.19-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose%208-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **Repository:** [https://github.com/bapu04/AcxiomCRM](https://github.com/bapu04/AcxiomCRM)  
> **AcxiomCRM** is a production-grade, full-stack MERN (MongoDB, Express, React, Node.js) Customer Relationship Management system built to enterprise specifications. It features strict **Role-Based Access Control (RBAC)**, server-enforced business validation rules, an **append-only tamper-evident audit trail**, an interactive **Chart.js analytics dashboard**, **1-click lead-to-opportunity conversion**, and a **customizable Dark/Light theme**.

---

## 📑 Table of Contents
- [Key Features](#-key-features)
- [System Architecture](#-system-architecture)
- [Pre-Configured Demo Accounts](#-pre-configured-demo-accounts)
- [Screenshots & UI Walkthrough](#-ui-highlights)
- [Project Structure](#-project-structure)
- [Getting Started & Installation](#-getting-started--installation)
- [Environment Configuration](#-environment-configuration)
- [REST API Reference](#-rest-api-reference)
- [Business Rules & Validation](#-business-rules--validation)
- [Security & Audit Logging](#-security--audit-logging)
- [License](#-license)

---

## 🚀 Key Features

### 1. 🛡️ Role-Based Access Control (RBAC)
- **Administrator (`Admin`):** Unrestricted access. Full CRUD across all modules, account creation/editing, role management, temporary lockout release, system reports, and immutable audit logs.
- **Sales Manager (`Manager`):** Team-wide visibility. Full oversight over customer accounts, leads, deals pipeline, team follow-ups, and sales conversion metrics.
- **Sales Executive (`SalesExecutive`):** Scoped visibility. Strictly constrained to customer accounts, leads, opportunities, and activities explicitly assigned to their user ID.

### 2. ☀️ Segmented Dark & Light Theme Switcher
- Fast, accessible segmented pill toggle (`☀️ Light` / `🌙 Dark`) on every navigation bar and landing page.
- Synchronized with `document.documentElement`, `body`, CSS `color-scheme`, and persistent in `localStorage`.
- Zero Flash of Unstyled Content (FOUC) via synchronous pre-hydration header injection.

### 3. 🌐 Modern SaaS Landing Page
- Modern marketing front-page with hero section, live KPI metrics preview, role-based interactive showcase tabs, enterprise feature highlights, and direct authentication entry points.

### 4. 👥 Customer Management
- Complete Customer Master Directory with paginated tables, search by name/email/phone/company, and status filters.
- Strict duplicate-checking: Prevents duplicate email and phone registrations.
- Activity history and relationship mapping for each account.

### 5. 🎯 Lead Management & 1-Click Conversion
- Inbound lead capture with source tracking (Website, Referral, Cold Outreach, Campaign, Partner).
- Lifecycle status tracking: `New` ➔ `Contacted` ➔ `Qualified` ➔ `Unqualified` ➔ `Converted` ➔ `Lost`.
- **One-Click Lead Conversion Modal:** Automatically converts qualified prospects into master Customer records and opens new Opportunity deals in a single atomic transaction.

### 6. 💼 Opportunity Pipeline & Forecasting
- 5 pipeline stages: `Qualification` (20%), `Proposal` (40%), `Negotiation` (70%), `Won` (100%), and `Lost` (0%).
- Real-time **Weighted Pipeline Value** calculation: `Amount × (Probability / 100)`.
- Server-side business constraints: Amount must be `> 0`, probability `0–100%`, and expected close dates cannot be set in the past for open opportunities.

### 7. 📅 Follow-Up Coordination & Reminders
- Schedule customer and lead touchpoints (Calls, Meetings, Emails, Demos).
- Categorized status filters: `Planned`, `Completed`, `Missed`, and `Cancelled`.
- Filter views for `Today`, `Upcoming`, and `Overdue` tasks.
- Prevents scheduling new follow-up tasks earlier than the current date.

### 8. 📊 Analytics Dashboard & Reporting
- Real-time KPI summary widgets (Total Customers, Total Leads, Pipeline Value, Pending Follow-ups, Deal Win Rate).
- **Chart.js** data visualizations: *Opportunity Pipeline by Stage* (Bar Chart) and *Lead Status Breakdown* (Doughnut Chart).
- Comprehensive exportable report views: Pipeline Breakdown, Conversion Rates, and Representative Activity Logs.

### 9. 🔒 Immutable Audit Logging & Account Security
- Tamper-proof, append-only security and business audit log tracking every `LOGIN`, `FAILED_LOGIN`, `LOGOUT`, `CREATE`, `UPDATE`, `DELETE`, and `ROLE_CHANGE`.
- Built-in **JSON Payload Inspector** allowing administrators to view `oldValue` vs. `newValue` diffs.
- Automatic **Account Lockout**: 5 consecutive failed login attempts trigger an automatic 15-minute lockout (with manual Admin unlock override).

---

## 🏛️ System Architecture

AcxiomCRM adopts a multi-tiered, enterprise software architecture:

```
[ Clients / Browsers ]
         │
         ▼
[ Presentation Layer: Vite + React 18 + TailwindCSS + Lucide Icons ]
         │ (HTTP REST / Axios with JWT Interceptor)
         ▼
[ Application Layer: Express.js REST API + Route Authentication & Scoping Middleware ]
         │
         ▼
[ Domain Layer: Business Validation, Lifecycle Workflows, Weighted Pipeline Math ]
         │
         ▼
[ Data Access Layer: Mongoose ODM + Schema Validation + Security Hooks ]
         │
         ▼
[ Database Layer: MongoDB (Local / Atlas / Auto In-Memory Fallback) ]
```

---

## 🔑 Pre-Configured Demo Accounts

On initial launch, the backend seeder automatically initializes three demo user accounts:

| Role | Email Address | Password | Permissions & Scope |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@acxiomcrm.com` | `Admin@12345` | Full CRM Admin, User CRUD, Lockout Control, Audit Logs |
| **Sales Manager** | `manager@acxiomcrm.com` | `Manager@12345` | Team Pipeline Oversight, Leads, Deals, Reports |
| **Sales Executive** | `sales@acxiomcrm.com` | `Sales@12345` | Assigned Customers, Leads, Follow-ups, Activities |

> 💡 **Quick Login:** The Login screen includes one-click demo fill buttons to instantly test any of these roles without typing.

---

## 📂 Project Structure

```
AcxiomCRM/
├── .gitignore                        # Comprehensive root gitignore
├── package.json                      # Monorepo orchestration scripts
├── README.md                         # Project documentation
├── backend/
│   ├── .env.example                  # Environment configuration template
│   ├── package.json
│   └── src/
│       ├── config/
│       │   └── db.js                 # MongoDB connection with In-Memory fallback
│       ├── controllers/              # Business controllers (Auth, Customers, Leads, etc.)
│       ├── middleware/               # Auth, RBAC, Validation & Error Handlers
│       ├── models/                   # Mongoose schemas (User, Customer, Lead, Opportunity, AuditLog)
│       ├── routes/                   # Express REST API routes
│       ├── seeds/
│       │   └── seed.js               # Sample data seeding script
│       ├── services/
│       │   └── auditService.js       # Centralized audit logging service
│       ├── app.js                    # Express application configuration
│       └── server.js                 # HTTP server bootstrap
└── frontend/
    ├── index.html                    # HTML root with pre-hydration theme script
    ├── package.json
    ├── postcss.config.js
    ├── tailwind.config.js
    ├── vite.config.js                # Vite configuration with /api reverse proxy
    └── src/
        ├── api/
        │   └── axiosClient.js        # Axios instance with Bearer token interceptor
        ├── components/               # Navbar, Sidebar, StatCard, Pagination, ConfirmModal
        ├── context/
        │   ├── AuthContext.jsx       # Authentication state provider
        │   └── ThemeContext.jsx      # Light/Dark theme provider & ThemeToggle
        └── pages/
            ├── LandingPage.jsx       # Public marketing SaaS landing page
            ├── Login.jsx             # Login with lockout notifications & quick fill
            ├── Register.jsx          # User registration
            ├── Dashboard.jsx         # Executive KPI summary & Chart.js charts
            ├── Customers.jsx         # Customer directory & contact management
            ├── Leads.jsx             # Lead qualification & 1-click conversion
            ├── Opportunities.jsx     # Deal stages, probability, weighted values
            ├── FollowUps.jsx         # Touchpoint scheduling & overdue reminders
            ├── Reports.jsx           # Sales conversion & pipeline reports
            ├── Users.jsx             # Admin user administration & lockout control
            └── AuditLogs.jsx         # Append-only security audit trail & JSON inspector
```

---

## 🛠️ Getting Started & Installation

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **MongoDB**: *(Optional)* MongoDB running locally on port 27017 or a MongoDB Atlas URI.  
  *Note: If local MongoDB is not detected, AcxiomCRM will automatically launch an **In-Memory MongoDB** instance for immediate, zero-configuration testing!*

### 1. Clone the Repository
```bash
git clone https://github.com/bapu04/AcxiomCRM.git
cd AcxiomCRM
```

### 2. Install All Dependencies
Install dependencies for root, backend, and frontend with a single command:
```bash
npm run install:all
```

### 3. Configure Backend Environment
Copy the example environment file inside `backend/`:
```bash
cp backend/.env.example backend/.env
```
*(The default settings work immediately out-of-the-box with port `5001` and client `5173`).*

### 4. Run the Application
Start both the Backend API and Frontend Dev Server concurrently:
```bash
npm start
```
*(Or use `npm run dev`)*

The services will start at:
- **Frontend Web App:** [http://localhost:5173](http://localhost:5173)
- **Backend REST API:** [http://localhost:5001/api](http://localhost:5001/api)

---

## ⚙️ Environment Configuration

| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `PORT` | `5001` | HTTP Port for the Express backend |
| `NODE_ENV` | `development` | Node environment (`development` / `production`) |
| `MONGODB_URI` | `mongodb://127.0.0.1:27017/acxiomcrm` | MongoDB connection URI (fallback to In-Memory DB) |
| `JWT_SECRET` | `acxiom_crm_jwt_secure_key_2026_production_grade` | Secret key used for signing JWT auth tokens |
| `JWT_EXPIRES_IN` | `7d` | Token expiration duration |
| `CLIENT_URL` | `http://localhost:5173` | Allowed CORS origin for the React frontend |
| `LOCKOUT_TIME_MINUTES` | `15` | Duration of account lockout after repeated failures |
| `MAX_FAILED_LOGIN_ATTEMPTS` | `5` | Maximum failed attempts allowed before lockout |

---

## 📡 REST API Reference

### 🔐 Authentication (`/api/auth`)
- `POST /api/auth/register` — Register a new account
- `POST /api/auth/login` — Authenticate user and receive JWT (enforces lockout rules)
- `GET /api/auth/me` — Retrieve active profile & verified role
- `POST /api/auth/logout` — Terminate session & log audit event

### 👤 Customers (`/api/customers`)
- `GET /api/customers` — List customers with pagination, search, status filters
- `POST /api/customers` — Create customer (enforces unique email & phone)
- `GET /api/customers/:id` — Get customer details & activity history
- `PUT /api/customers/:id` — Update customer information
- `DELETE /api/customers/:id` — Remove customer (Admin & Manager only)

### 🎯 Leads (`/api/leads`)
- `GET /api/leads` — List leads with status/priority filtering
- `POST /api/leads` — Capture new prospect lead
- `GET /api/leads/:id` — Get lead details
- `PUT /api/leads/:id` — Update lead status and details
- `POST /api/leads/:id/convert` — **Convert qualified lead to Customer + Opportunity**
- `DELETE /api/leads/:id` — Remove lead (Admin & Manager only)

### 💼 Opportunities (`/api/opportunities`)
- `GET /api/opportunities` — List sales pipeline opportunities
- `POST /api/opportunities` — Create opportunity (validates amount > 0 and close date)
- `GET /api/opportunities/:id` — Get opportunity details
- `PUT /api/opportunities/:id` — Update stage, probability, and deal value
- `DELETE /api/opportunities/:id` — Delete opportunity (Admin & Manager only)

### 📅 Follow-Ups (`/api/followups`)
- `GET /api/followups` — List follow-ups (`?filter=today|upcoming|overdue`)
- `POST /api/followups` — Schedule follow-up (validates date ≥ today)
- `PATCH /api/followups/:id/complete` — Mark follow-up completed with notes
- `DELETE /api/followups/:id` — Delete follow-up

### 🛡️ Administration & Audit (`/api/users`, `/api/audit-logs`)
- `GET /api/users` — List application users (Admin only)
- `POST /api/users` — Create user with explicit role (Admin only)
- `PUT /api/users/:id` — Update user profile or password (Admin only)
- `PATCH /api/users/:id/status` — Toggle user active/inactive status (Admin only)
- `POST /api/users/:id/unlock` — Release security lockout on user account (Admin only)
- `GET /api/audit-logs` — Query append-only audit trail with module/user filters (Admin only)
- `GET /api/dashboard` — Role-scoped analytics and Chart.js datasets
- `GET /api/reports/*` — Pipeline forecasting and sales conversion reports

---

## 📐 Business Rules & Validation

1. **Email & Phone Uniqueness:** Customer records enforce strict email and phone uniqueness to eliminate duplicate data.
2. **Opportunity Financials:** Active opportunity amounts must be strictly positive (`Amount > 0`), and probability must be within `0%` to `100%`.
3. **Date Consistency:** Expected close dates for open opportunities and scheduled follow-up dates cannot be in the past.
4. **Lead Conversion Flow:** When a lead is marked `Qualified`, the user can convert it. Conversion sets the lead status to `Converted`, links it to the newly created Customer ID and Opportunity ID, and logs a tamper-evident audit entry.

---

## 🔒 Security & Audit Logging

- **Password Security:** Passwords hashed using `bcryptjs` with 10 salt rounds; plaintext passwords are never logged or returned.
- **Account Lockout Policy:** Protects against brute-force attacks by locking accounts for 15 minutes after 5 consecutive failed attempts.
- **Audit Trail:** Append-only log recording IP address, actor role, timestamp, action type, target entity, and payload snapshots.

---

## 📄 License

This project is licensed under the **MIT License** — feel free to use, modify, and distribute for personal and commercial projects.
