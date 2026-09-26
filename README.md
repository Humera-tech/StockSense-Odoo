# StockSense — Inventory Management System

> **Odoo × GCET Hyderabad Hackathon 2026**  
> Virtual Round · 26 Sep 2026 · 9:00 AM – 5:00 PM IST  
> Repository: https://github.com/Humera-tech/StockSense-Odoo

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Problem Statement](#problem-statement)
3. [Solution](#solution)
4. [Key Features](#key-features)
5. [Inventory Flow](#inventory-flow)
6. [Architecture](#architecture)
7. [Tech Stack](#tech-stack)
8. [Core Data Model](#core-data-model)
9. [Stock Engine & Inventory Logic](#stock-engine--inventory-logic)
10. [Operation Lifecycles](#operation-lifecycles)
11. [API Overview](#api-overview)
12. [Project Structure](#project-structure)
13. [Local Setup](#local-setup)
14. [Demo Flow](#demo-flow)
15. [Progress & Remaining Work](#progress--remaining-work)
16. [Team & Responsibilities](#team--responsibilities)
17. [Git Workflow](#git-workflow)
18. [Definition of Done](#definition-of-done)

---

## Project Overview

**StockSense** is a modular Inventory Management System built for the Odoo × GCET Hyderabad Hackathon 2026. The goal is to ship a working, demo-able app covering every screen in the StockSense mockup — auth, dashboard, stock, receipts, deliveries, adjustments, move history, warehouses, and locations — backed by a real local PostgreSQL database and a transactional stock engine.

> **Correctness of stock numbers beats visual extras.**

---

## Problem Statement

Businesses tracking inventory through manual registers, spreadsheets, or disconnected tools face:

- No real-time visibility into stock levels across locations
- Error-prone manual updates causing stock mismatches
- No audit trail for stock movements
- Inability to coordinate receipts, deliveries, and internal transfers

**Target users:** Inventory Managers and Warehouse Staff.

---

## Solution

StockSense centralizes all stock operations in one place. Every movement is recorded in an immutable **Stock Ledger**. Stock quantities are always derived from validated operations — no silent overwrites. Every manual edit creates an auditable adjustment move.

---

## Key Features

| Priority | Feature |
|----------|---------|
| **P0** | Login / Sign up with server-enforced validation rules |
| **P0** | Warehouse + Location settings (CRUD) |
| **P0** | Products & stock page (editable; shows **On Hand** / **Free to Use**) |
| **P0** | Receipts — list, form, Draft → Ready → Done lifecycle |
| **P0** | Deliveries — list, form, Draft → **Waiting** → **Ready** → Done lifecycle |
| **P0** | Auto-generated references (`WH/IN/0001`, `WH/OUT/0001`) |
| **P0** | Transactional stock updates on Validate |
| **P0** | Move History list |
| **P0** | Dashboard KPI cards |
| **P1** | Kanban view toggle by status |
| **P1** | Search by reference & contact |
| **P1** | Out-of-stock red line + alert on delivery form |
| **P1** | Print receipt when Done |
| **P1** | Inventory Adjustments |
| **P1** | Forgot password (OTP-based reset) |
| **P2** | Low-stock highlight on stock page |
| **P2** | CSV export of move history |
| **P2** | Dark mode |
| **P2** | Cancel flow polish |

---

## Inventory Flow

```
Step 1 — Receive Goods from Vendor
  Receive 100 kg Steel  →  Stock: +100

Step 2 — Internal Transfer
  Main Store → Production Rack
  Total stock unchanged; location updated

Step 3 — Deliver Finished Goods
  Deliver 20 kg Steel  →  Stock: −20

Step 4 — Adjust Damaged Items
  3 kg Steel damaged  →  Stock: −3
```

Every movement is logged in the **Stock Ledger** (`stock_moves` table). Ledger rows are immutable.

---

## Architecture

```mermaid
graph TD
    FE["React + Vite + Tailwind CSS\n(Pages, forms, list/kanban views,\nprint view)"]
    BE["FastAPI (Python)\n(Auth/JWT · Pydantic validation\nStock Engine · /docs)"]
    DB["PostgreSQL (local)\n(SQLAlchemy models\nAlembic migrations · seed script)"]

    FE -- "REST (JSON)" --> BE
    BE -- "SQLAlchemy" --> DB
```

**Monorepo layout:** `frontend/` (React) · `server/` (FastAPI)  
**API contract:** FastAPI auto-generated `/docs` (Swagger UI)  
**Runs fully offline** — no cloud dependencies.

---

## Tech Stack

| Layer | Choice |
|-------|--------|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS v4, React Router; data fetching via a small `fetch` wrapper (`services/api.ts`) and `useApi` hook |
| **Backend** | Python 3.11+, FastAPI, Uvicorn, Pydantic v2, SQLAlchemy 2.0, Alembic, bcrypt, python-jose (JWT), pytest |
| **Database** | PostgreSQL (local) · SQLite acceptable as fallback via `DATABASE_URL` |
| **Tooling** | GitHub, ESLint, docker-compose |

---

## Core Data Model

| Table | Key Fields | Notes |
|-------|-----------|-------|
| `users` | `id`, `login_id` (unique), `email` (unique), `password_hash`, `name` | Responsible on operations |
| `warehouses` | `id`, `name`, `short_code` (unique), `address` | Seed: `WH` – Main Warehouse |
| `locations` | `id`, `name`, `short_code`, `warehouse_id`, `type` | `type`: `INTERNAL \| VENDOR \| CUSTOMER \| ADJUSTMENT`; seed `WH/Stock1`, `WH/Stock2` + virtual locations |
| `contacts` | `id`, `name`, `kind` (`VENDOR/CUSTOMER`), `address` | e.g. Azure Interior |
| `products` | `id`, `sku`, `name`, `unit_cost`, `uom` | Displayed as `[DESK001] Desk` |
| `stock_quants` | `product_id`, `location_id`, `quantity` — unique(product, location) | Current stock. **Only the stock engine writes here.** |
| `operations` | `id`, `reference` (unique), `type` (`IN/OUT/ADJ`), `warehouse_id`, `contact_id`, `src_location_id`, `dest_location_id`, `scheduled_date`, `status`, `responsible_id`, `done_at` | Receipts, deliveries, and adjustments share one table |
| `operation_lines` | `id`, `operation_id`, `product_id`, `quantity`, `reserved_qty` | `reserved_qty` drives **Free to Use** and **Waiting** |
| `stock_moves` | `id`, `operation_id`, `reference`, `product_id`, `from_location_id`, `to_location_id`, `quantity`, `date` | Immutable ledger → Move History. One row per product line. |
| `sequences` | `warehouse_id`, `op_type`, `next_number` | Generates `WH/IN/0001` etc. inside the create transaction |

### Key Derived Values

| Field | Calculation |
|-------|------------|
| **On Hand** | `SUM(stock_quants.quantity)` across internal locations |
| **Free to Use** | On Hand − qty reserved by **Waiting/Ready** deliveries (Waiting ones hold a partial reservation) |
| **Waiting** | Delivery where ≥1 line has insufficient free stock |
| **Late** | `scheduled_date < today` AND status ≠ Done/Cancelled |

---

## Stock Engine & Inventory Logic

All stock writes go through a single service (`services/stock.py`). Every write runs in a database transaction.

### `createOperation(type, data)`
- Locks the `sequences` row for the warehouse + op type
- Builds reference `<WH short code>/<IN|OUT>/<0001>`
- Inserts operation + lines as **Draft**; sets `responsible = current user`

### `markTodo(op)` — Draft → Ready / Waiting
- **Receipt:** transitions directly to **Ready**
- **Delivery:** checks free qty per line at the source location
  - All lines covered → **Ready** (quantities reserved)
  - Any short line → **Waiting**; short lines flagged red in the UI

### `validate(op)` — Ready → Done
- Allowed only from **Ready**
- Updates `stock_quants` (`+` at destination for IN, `−` at source for OUT)
- Inserts one `stock_moves` row per line; sets `status = Done` + `done_at`
- After any receipt validates: **re-checks all Waiting deliveries** for newly available stock

### `adjust(product, location, countedQty)`
- `diff = counted − current`
- Posts an **ADJ** operation (already Done) with a move from/to the virtual Adjustment location
- The editable stock page calls this — never a silent overwrite

### Guards

| Rule | Behaviour |
|------|-----------|
| No negative quants | Blocked at engine level (HTTP 409) |
| Quantity must be integer > 0 | Pydantic + engine (HTTP 422) |
| Only Draft operations can be edited | HTTP 409 |
| Cannot validate from Waiting | HTTP 409 |
| Cannot validate twice / cancel Done | HTTP 409 |
| Cancel from any other state | Releases reservations and re-checks Waiting deliveries |

---

## Operation Lifecycles

### Receipt

```mermaid
stateDiagram-v2
    [*] --> Draft : createOperation
    Draft --> Ready : To Do
    Ready --> Done : Validate
    Draft --> Cancelled : Cancel
    Ready --> Cancelled : Cancel
```

### Delivery

```mermaid
stateDiagram-v2
    [*] --> Draft : createOperation
    Draft --> Waiting : To Do (stock short)
    Draft --> Ready : To Do (stock available)
    Waiting --> Ready : Receipt validated (auto re-check)
    Ready --> Done : Validate
    Draft --> Cancelled : Cancel
    Waiting --> Cancelled : Cancel
    Ready --> Cancelled : Cancel
```

> Cancel is allowed from any state **except Done**. Cancelling releases all reservations.

---

## API Overview

All errors return `{ error: { field, message } }` so forms can highlight the offending input.

| Method & Route | Purpose |
|---------------|---------|
| `POST /api/auth/signup` | Register (full validation) |
| `POST /api/auth/login` | Authenticate, return JWT |
| `POST /api/auth/forgot` | OTP-based password reset |
| `GET /api/auth/me` | Current user |
| `GET/POST/PUT/DELETE /api/warehouses` | Warehouse CRUD |
| `GET/POST/PUT/DELETE /api/locations` | Location CRUD |
| `GET/POST/PUT /api/products` | Product master data |
| `GET /api/contacts` | Contact list |
| `GET /api/stock?search=` | On Hand / Free to Use per product |
| `POST /api/stock/adjust` | In-place stock edit (creates ADJ operation) |
| `GET /api/dashboard` | `{ receipts: {toReceive, late, operations}, deliveries: {toDeliver, late, waiting, operations} }` |
| `GET /api/operations?type=IN\|OUT&status=&q=` | Filtered list (search by reference & contact) |
| `GET /api/operations/:id` | Detail |
| `POST /api/operations` | Create Draft with lines |
| `PUT /api/operations/:id` | Edit Draft |
| `POST /api/operations/:id/todo` | → Ready / Waiting |
| `POST /api/operations/:id/validate` | → Done |
| `POST /api/operations/:id/cancel` | Cancel |
| `GET /api/moves?q=&type=` | Move history ledger |

### Validation Rules

| Field | Rule | Message |
|-------|------|---------|
| Login ID | 6–12 chars, unique | "Login ID must be 6–12 characters" / "Login ID already taken" |
| Email | Valid format, unique | "Enter a valid email" / "Email already registered" |
| Password | > 8 chars, ≥1 lower, ≥1 upper, ≥1 special | Live checklist under field |
| Re-enter password | Must match | "Passwords do not match" |
| Short code | Uppercase alphanumeric, unique | "Short code already exists" |
| Operation lines | qty integer > 0, no duplicate product | Inline under offending line |
| Stock edit | Counted qty integer ≥ 0 | "Quantity cannot be negative" |

**Server (Pydantic) is the source of truth.** Client-side (zod) rules mirror server rules for fast feedback only.

---

## Project Structure

```
StockSense-Odoo/
├── frontend/                    # React + TypeScript + Vite (Tailwind CSS v4)
│   └── src/
│       ├── pages/
│       │   ├── auth/            # Login, Signup, ForgotPassword, VerifyOTP
│       │   ├── operations/      # Receipts, Deliveries, Adjustments, Transfers, MoveHistory
│       │   ├── products/        # Products, ProductDetails
│       │   ├── settings/        # Warehouse
│       │   ├── profile/
│       │   └── Dashboard.tsx
│       ├── components/
│       │   ├── layout/          # Header, Sidebar
│       │   ├── operations/      # ReceiptForm, DeliveryForm, AdjustmentForm, TransferForm
│       │   ├── dashboard/       # DashboardKPI, DashboardFilters, RecentOperations, StockAlerts
│       │   └── products/
│       ├── context/             # AuthContext
│       ├── routes/              # AppRoutes, ProtectedRoute
│       ├── services/            # authService, inventoryService
│       ├── types/               # auth, inventory, product
│       └── data/                # mockData (placeholder)
└── server/                      # FastAPI backend
    ├── app/
    │   ├── api/routes/          # auth, warehouses, locations, products, contacts, operations, stock
    │   ├── core/                # config, database, security (bcrypt/JWT), error format
    │   ├── models/              # SQLAlchemy ORM (one file per table)
    │   ├── schemas/             # Pydantic request/response models (validation rules)
    │   ├── services/stock.py    # Stock Engine
    │   └── seed.py              # Demo data
    ├── alembic/                 # Migrations
    └── tests/                   # pytest (engine, API, seed)
```

> **Current state:** see [Progress & Remaining Work](#progress--remaining-work).

---

## Local Setup

> The app is designed to run **fully offline** — no cloud services required.

### Frontend

```bash
git clone https://github.com/Humera-tech/StockSense-Odoo.git
cd StockSense-Odoo/frontend
npm install
npm run dev
```

Frontend dev server: `http://localhost:5173`

### Backend

```bash
# Start PostgreSQL (from the repo root)
docker compose up -d

# Install, migrate, seed, run
cd server
python -m venv .venv
.venv\Scripts\activate          # macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
alembic upgrade head
python -m app.seed
uvicorn app.main:app --reload
```

API + Swagger UI: `http://localhost:8000/docs` · Demo login: **`admin01` / `Admin@1234`**

The frontend dev server proxies `/api` to `localhost:8000`, so start the backend first.

> **SQLite fallback:** Set `DATABASE_URL=sqlite:///./stocksense.db` in `server/.env` if Docker is unavailable.

> **Reset demo data:** `alembic downgrade base && alembic upgrade head && python -m app.seed`

> **Tests:** `cd server && pytest`

---

## Demo Flow

1. **Auth** — Sign up with an invalid password → live rule errors. Sign up correctly. Wrong login → "Invalid Login Id or Password". Log in.

2. **Settings** — View warehouse `WH` and locations `WH/Stock1`, `WH/Stock2`. Add a new location.

3. **Stock Page** — `Desk` shows **On Hand: 50 / Free to Use: 45** (5 reserved by a Ready delivery). Edit On Hand to 48 → adjustment appears in Move History.

4. **Receipt** — New → reference auto-fills `WH/IN/0003`, responsible auto-set. Add 10 Desks from Azure Interior → **To Do** → **Validate** → **Print**. On Hand becomes 58.

5. **Delivery** — Order 70 Desks → **To Do** → line turns red + alert, status **Waiting**. Validate the receipt above → delivery auto-moves to **Ready** → **Validate**.

6. **Move History** — IN rows in green, OUT rows in red. Multi-product references split per row. Switch to kanban. Search by "Azure".

7. **Dashboard** — KPI counts update live. Click **Late** to open filtered list. Resize to 375 px to show responsiveness.

---

## Progress & Remaining Work

_Last updated 26 Sep 2026, after the 12:30 checkpoint. Tasks follow the Plan of Action timeline; update this section as items land._

### Checkpoints

| Time | Checkpoint | Status |
|------|-----------|--------|
| 9:40 | Scope + API contract frozen | ✅ |
| 11:00 | Real login via UI; seed data in DB | ✅ |
| 12:30 | End-to-end receipt: create → To Do → Validate → stock up | ✅ |
| 12:30 | `main` green on every laptop | ⚠️ Everyone: pull, then run [Local Setup](#local-setup) once |
| 14:30 | End-to-end delivery incl. Waiting | ✅ (already works: Waiting → auto Ready when a receipt lands) |
| 15:30 | All P0 done, start P1 | ⏳ Needs Adjustments, Move History, live Dashboard |
| 16:20 | Feature freeze | ⏳ |
| 16:50 | Tagged `v1.0` and submitted | ⏳ |

### Done so far

- **Backend:** models + 2 migrations (tested on Postgres and SQLite); stock engine (references, create/edit Draft, To Do with reservations and Waiting, validate, Waiting re-check, cancel); all auth, master-data, operations and stock endpoints; `{ error: { field, message } }` everywhere; auth on every non-auth route; seed script; 52 pytest tests.
- **Frontend:** login / sign up (Login ID + live password checklist) / forgot password + OTP reset wired to the API; top menu shell; Receipts and Deliveries with list, kanban, search and status filter; operation form (auto reference, responsible, line editor, To Do / Validate / Print / Cancel, red short lines + Waiting alert); Stock page (On Hand / Free to Use, new product); Settings → Warehouses and Locations. Verified in a browser at desktop and 375 px.

### Remaining — by person

**Backend — stock engine & queries** (`server/app/services/stock.py`, tests in `server/tests/`)

| When | Task |
|------|------|
| 13:00–14:30 | `adjust_stock(db, product_id, location_id, counted_qty, user_id)`: diff = counted − on hand; post an **ADJ** operation already Done (`WH/ADJ/0001`) with a move to/from the warehouse's ADJUSTMENT location; counted ≥ 0; re-check Waiting deliveries when stock goes up. |
| 13:00–14:30 | `list_moves(db, q, type)`: move ledger rows with product, from/to locations, reference, contact, date and direction (IN / OUT / ADJ) for Move History. |
| 13:00–14:30 | `dashboard_counts(db)`: receipts `{toReceive, late, operations}` and deliveries `{toDeliver, late, waiting, operations}` (late = scheduled before today and not Done/Cancelled; operations = scheduled after today). |
| 14:30–15:30 | Guards for adjustments + tests; run the engine tests against Postgres. (Negative stock, double validate and edit-after-Done guards are already done and tested.) |
| 15:30–17:00 | Bug fixes from QA; review backend changes; final merges. |

**Backend — FastAPI layer** (`server/app/api/routes/`, `server/app/schemas/`)

| When | Task |
|------|------|
| 13:00–14:30 | `GET /api/moves?q=&type=` (new `routes/moves.py`) calling `list_moves`. |
| 13:00–14:30 | `GET /api/dashboard` (new `routes/dashboard.py`) calling `dashboard_counts`. |
| 13:00–14:30 | `POST /api/stock/adjust` `{ product_id, location_id, counted_qty }` → "Quantity cannot be negative" on `counted_qty`. Register the new routers in `app/main.py` as protected routes. |
| 14:30–15:30 | Edge-case validation pass on every endpoint; API tests for the new endpoints in `tests/test_api.py`. (Error shape, auth on every route and list search filters are done.) |
| 15:30–17:00 | Bug fixes from QA; final merges. |

**Frontend — operations screens** (`frontend/src/`)

| When | Task |
|------|------|
| 13:00–14:30 | **Dashboard cards** (`pages/Dashboard.tsx` still shows placeholder zeros): Receipt card "N to receive", late, operations; Delivery card "N to deliver", late, waiting, operations, all from `GET /api/dashboard`. Cards link to filtered lists; the lists already support `?status=READY`, `?status=WAITING` and `?late=1`. |
| 14:30–15:30 | **Move History** (`pages/operations/MoveHistory.tsx`): one row per product line, IN green / OUT red, list + kanban + search, from `GET /api/moves`. Add it to the top menu (`components/layout/Header.tsx`) and routes (`routes/AppRoutes.tsx`). |
| 14:30–15:30 | **Print view** for Done receipts/deliveries: a proper printable layout (Print currently calls `window.print()` with the menu hidden). |
| 15:30–16:20 | Visual consistency and kanban polish. |
| 16:20–17:00 | Final walkthrough. |

**Frontend support — stock UI, QA & release** (`frontend/src/`, repo root)

| When | Task |
|------|------|
| 13:00–14:30 | **Editable stock cells** on the Stock page (`pages/products/Products.tsx`): edit On Hand → `POST /api/stock/adjust`, show the error under the cell. |
| 13:00–14:30 | **Adjustments** page under Operations → Adjustments (`pages/operations/Adjustments.tsx`): list of ADJ operations (reuse `GET /api/operations?type=ADJ`). |
| 13:00–14:30 | Hosted demo **only if required**: the Render static site builds, but it needs a rewrite `/*` → `/index.html`, a hosted API, and an API base URL in `services/api.ts`. The local demo works fully offline. |
| 14:30–15:30 | QA with the demo script below; file issues for anything broken. |
| 15:30–16:20 | Reset + reseed (`alembic downgrade base && alembic upgrade head && python -m app.seed`), rerun the demo, finalize this README. |
| 16:20–17:00 | Tag `v1.0`, verify a fresh clone runs in under 5 minutes, submit by 16:50. |

### Feature status (from the scope list)

| Priority | Feature | Status | Owner |
|----------|---------|--------|-------|
| P0 | Login / Sign up with rules | ✅ | — |
| P0 | Warehouse + Location settings | ✅ | — |
| P0 | Products & stock page | ✅ view + new product · ⏳ editable cells | Frontend |
| P0 | Receipts (list, form, Draft → Ready → Done) | ✅ | — |
| P0 | Deliveries (Draft → Waiting → Ready → Done) | ✅ | — |
| P0 | Auto references `WH/IN/0001` | ✅ | — |
| P0 | Stock updates on Validate | ✅ | — |
| P0 | Move History list | ⏳ | Backend (query) · Backend (API) · Frontend (UI) |
| P0 | Dashboard cards | ⏳ placeholder | Backend (query) · Backend (API) · Frontend (UI) |
| P1 | Kanban toggle by status | ✅ Receipts/Deliveries · ⏳ Move History | Frontend |
| P1 | Search by reference & contact | ✅ | — |
| P1 | Out-of-stock red line + alert | ✅ | — |
| P1 | Print receipt when Done | ✅ basic · ⏳ print layout | Frontend |
| P1 | Adjustments | ⏳ | Backend (engine) · Backend (API) · Frontend (UI) |
| P1 | Late / Waiting counts | ✅ in lists · ⏳ on dashboard | Frontend |
| P1 | Green IN / red OUT in history | ⏳ | Frontend |
| P1 | Forgot password | ✅ OTP reset (code shown on screen in offline demo mode) | — |
| P2 | Low-stock highlight | ✅ out-of-stock rows red | — |
| P2 | CSV export of history | ⏳ stretch, only if P0/P1 are done by 15:30 | Backend (endpoint) · Frontend (button) |
| P2 | Dark mode | ⏳ stretch | Frontend |
| P2 | Cancel flow polish | ✅ cancel with confirm + reservation release | — |

**Demo script blockers:** step 3 (edit On Hand → adjustment in Move History), step 6 (Move History) and step 7 (live Dashboard) need the remaining items above. Steps 1, 2, 4 and 5 work today.

---

## Team & Responsibilities

| Member | Role | Owns | Branches |
|--------|------|------|----------|
| **Backend 1** | Backend — Data & Stock Engine | SQLAlchemy models, Alembic migrations, sequence generator, stock engine (`create / todo / validate / cancel`, reservations, Waiting re-check, adjustments), move ledger, dashboard queries, pytest | `feat/models` · `feat/stock-engine` · `feat/dashboard-queries` |
| **Backend 2** | Backend — FastAPI Layer | FastAPI app structure, routers, Pydantic schemas, auth (signup/login/JWT/forgot), master-data CRUD, operations/moves/dashboard/stock endpoints, CORS, error format | `feat/api-skeleton` · `feat/auth-api` · `feat/master-data-api` · `feat/operations-api` |
| **Frontend 1** | Frontend | Theme tokens, layout shell, reusable `OperationList` (list + kanban + search), Receipt & Delivery forms, line editor, red-line alert, Dashboard, Move History, print view, responsive pass | `feat/ui-shell` · `feat/operation-list` · `feat/operation-form` · `feat/dashboard-ui` · `feat/move-history` |
| **Frontend 2** | Deployment + Frontend Support | Repo setup, branch protection, docker-compose, `.env.example`, seed script, README, QA. Builds simpler screens (~10:30 onwards): Login/Sign up/Forgot password UI, Settings (warehouse, location), Stock page | `chore/repo-setup` · `chore/docker` · `chore/seed` · `feat/auth-ui` · `feat/settings-ui` · `feat/stock-ui` · `docs/readme` |

**Backend contract:** The stock-engine owner exposes plain Python functions in `services/stock.py` (e.g. `validate_operation(db, op_id, user)`) that raise typed errors. The API layer's routers parse/validate input, call these functions, and map errors to HTTP responses. Neither edits the other's files.

---

## Git Workflow

- `main` is **always runnable**. No direct pushes to `main`.
- Each task = `feat/*` branch → PR → one review → merge (squash-free; individual commits kept visible).
- Commit small and often: `feat(stock): reserve qty on delivery todo`
- Target **10+ commits per person** — contributor graphs are a judged criterion.
- **Model changes only via Alembic migrations**, owned exclusively by the stock-engine owner.
- **Merge windows:** 11:00 · 12:30 · 14:30 · 15:30 · 16:20 — rebase on `main` after each.
- **Feature freeze: 16:20.** Tag `v1.0`, submit by 16:50.

---

## Definition of Done

- [ ] Every mockup screen reachable from the menu and working against the real database: Adjustments, Move History and live Dashboard still missing
- [x] Receipt and delivery lifecycles — including **Waiting** — update stock correctly
- [x] References auto-increment per warehouse and type (`WH/IN/0001`, `WH/OUT/0001`)
- [x] All sign-up/login rules enforced server-side with clear error messages
- [ ] List + kanban + search on Receipts, Deliveries, and Move History: Move History missing
- [x] Responsive at 375 px, one consistent color scheme (built screens verified)
- [ ] README with setup steps, stack, and schema; fresh clone runs in under 5 minutes: to verify at 16:20
- [ ] Commits from all team members
