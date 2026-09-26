# StockSense API (server)

FastAPI backend for StockSense — auth, master data, operations (receipts/deliveries/adjustments), stock engine, and move history.

## Setup

```bash
cd server
python -m venv .venv
.venv\Scripts\activate       # Windows
pip install -r requirements.txt
cp .env.example .env         # edit DATABASE_URL if needed
```

## Database

Requires a local PostgreSQL instance matching `DATABASE_URL` in `.env`.

```bash
alembic revision --autogenerate -m "init schema"
alembic upgrade head
```

## Run

```bash
uvicorn app.main:app --reload
```

API docs: http://localhost:8000/docs

## Tests

```bash
pytest
```

## Layout

- `app/core/` — settings, DB session/engine, declarative base
- `app/models/` — SQLAlchemy models (one file per table)
- `app/services/` — business logic (stock engine lives here)
- `alembic/` — migrations
