# StockSense API (server)

FastAPI backend for StockSense — auth, master data, operations (receipts/deliveries), stock engine.

## Setup

```bash
docker compose up -d            # from repo root: local Postgres on :5432
cd server
python -m venv .venv
.venv\Scripts\activate          # macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env            # SQLite fallback is commented in there
alembic upgrade head
python -m app.seed              # demo login: admin01 / Admin@1234
uvicorn app.main:app --reload
```

API docs: http://localhost:8000/docs · Tests: `pytest`

## Layout

- `app/core/` — settings, DB session, security (bcrypt, JWT), error format `{ "error": { "field", "message" } }`
- `app/models/` — SQLAlchemy models (one file per table)
- `app/schemas/` — Pydantic request/response models (all validation rules)
- `app/api/routes/` — routers; they validate input and call the stock engine
- `app/services/stock.py` — stock engine: references, create/edit, To Do (reservations, Waiting), validate, cancel
- `app/seed.py` — demo data built through the stock engine
- `alembic/` — migrations
