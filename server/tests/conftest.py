from types import SimpleNamespace

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.database import Base, get_db
from app.core.security import hash_password
from app.main import app
from app.models import (
    Contact,
    Location,
    LocationType,
    Product,
    User,
    Warehouse,
)
from app.models.contact import ContactKind


@pytest.fixture
def db() -> Session:
    engine = create_engine("sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool)
    Base.metadata.create_all(engine)
    session = sessionmaker(bind=engine, autoflush=False)()
    try:
        yield session
    finally:
        session.close()
        engine.dispose()


@pytest.fixture
def seed(db: Session) -> SimpleNamespace:
    user = User(login_id="hamza01", email="hamza@example.com", password_hash="x", name="Hamza")
    wh = Warehouse(name="Main Warehouse", short_code="WH", address="Hyderabad")
    db.add_all([user, wh])
    db.flush()

    stock1 = Location(name="Stock 1", short_code="Stock1", warehouse_id=wh.id, type=LocationType.INTERNAL)
    vendor = Location(name="Vendors", short_code="VENDOR", warehouse_id=wh.id, type=LocationType.VENDOR)
    customer = Location(name="Customers", short_code="CUSTOMER", warehouse_id=wh.id, type=LocationType.CUSTOMER)
    adjust = Location(name="Inventory adjustment", short_code="ADJUST", warehouse_id=wh.id, type=LocationType.ADJUSTMENT)
    contact = Contact(name="Azure Interior", kind=ContactKind.VENDOR)
    desk = Product(sku="DESK001", name="Desk", unit_cost=3000, uom="unit")
    chair = Product(sku="CHAIR001", name="Chair", unit_cost=800, uom="unit")
    db.add_all([stock1, vendor, customer, adjust, contact, desk, chair])
    db.commit()

    return SimpleNamespace(
        user=user, wh=wh, stock1=stock1, vendor=vendor, customer=customer, adjust=adjust,
        contact=contact, desk=desk, chair=chair,
    )


@pytest.fixture
def client(db: Session) -> TestClient:
    app.dependency_overrides[get_db] = lambda: db
    try:
        yield TestClient(app)
    finally:
        app.dependency_overrides.clear()


@pytest.fixture
def auth_client(client: TestClient, seed: SimpleNamespace, db: Session) -> TestClient:
    seed.user.password_hash = hash_password("Secret@123")
    db.commit()
    token = client.post("/api/auth/login", json={"login": "hamza01", "password": "Secret@123"}).json()["access_token"]
    client.headers["Authorization"] = f"Bearer {token}"
    return client
