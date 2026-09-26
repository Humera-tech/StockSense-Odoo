"""Load demo data. Run from server/: python -m app.seed"""

from datetime import date, timedelta

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.core.security import hash_password
from app.models import Contact, Location, LocationType, OperationType, Product, User, Warehouse
from app.models.contact import ContactKind
from app.services.stock import LineInput, create_operation, mark_todo, validate_operation

DEMO_LOGIN = "admin01"
DEMO_PASSWORD = "Admin@1234"


def seed(db: Session) -> None:
    today = date.today()
    user = User(login_id=DEMO_LOGIN, email="admin@stocksense.local", name="Demo Admin",
                password_hash=hash_password(DEMO_PASSWORD))
    wh = Warehouse(name="Main Warehouse", short_code="WH", address="GCET Campus, Hyderabad")
    wh.locations = [
        Location(name="Stock 1", short_code="Stock1", type=LocationType.INTERNAL),
        Location(name="Stock 2", short_code="Stock2", type=LocationType.INTERNAL),
        Location(name="Vendors", short_code="VENDOR", type=LocationType.VENDOR),
        Location(name="Customers", short_code="CUSTOMER", type=LocationType.CUSTOMER),
        Location(name="Inventory adjustment", short_code="ADJUST", type=LocationType.ADJUSTMENT),
    ]
    contacts = {
        name: Contact(name=name, kind=kind, address=address)
        for name, kind, address in [
            ("Azure Interior", ContactKind.VENDOR, "4557 De Silva St, Fremont"),
            ("Wood Corner", ContactKind.VENDOR, "1839 Arbor Way, Turlock"),
            ("Deco Addict", ContactKind.CUSTOMER, "77 Santa Barbara Rd, Pleasant Hill"),
            ("Gemini Furniture", ContactKind.CUSTOMER, "317 Fairchild Dr, Fairfield"),
        ]
    }
    products = {
        sku: Product(sku=sku, name=name, unit_cost=cost, uom="unit")
        for sku, name, cost in [
            ("DESK001", "Desk", 3000),
            ("CHAIR001", "Office Chair", 1200),
            ("TABLE001", "Dining Table", 5000),
            ("SHELF001", "Bookshelf", 2500),
            ("LAMP001", "Desk Lamp", 600),
        ]
    }
    db.add_all([user, wh, *contacts.values(), *products.values()])
    db.commit()

    locs = {loc.short_code: loc for loc in wh.locations}

    def operation(op_type, contact, scheduled, lines, internal="Stock1"):
        src, dest = (locs["VENDOR"], locs[internal]) if op_type == OperationType.IN else (locs[internal], locs["CUSTOMER"])
        return create_operation(
            db, op_type=op_type, warehouse_id=wh.id, src_location_id=src.id, dest_location_id=dest.id,
            scheduled_date=scheduled, responsible_id=user.id, contact_id=contacts[contact].id,
            lines=[LineInput(products[sku].id, qty) for sku, qty in lines],
        )

    # WH/IN/0001 — done: puts the opening stock on the shelves.
    first = operation(OperationType.IN, "Azure Interior", today - timedelta(days=3),
                      [("DESK001", 50), ("CHAIR001", 40), ("LAMP001", 25)])
    mark_todo(db, first.id)
    validate_operation(db, first.id)

    # WH/IN/0002 — ready and already late.
    late = operation(OperationType.IN, "Wood Corner", today - timedelta(days=1),
                     [("TABLE001", 10), ("SHELF001", 15)], internal="Stock2")
    mark_todo(db, late.id)

    # WH/OUT/0001 — ready: reserves 5 desks, so Desk shows 50 on hand / 45 free to use.
    ready = operation(OperationType.OUT, "Deco Addict", today, [("DESK001", 5)])
    mark_todo(db, ready.id)

    # WH/OUT/0002 — draft.
    operation(OperationType.OUT, "Gemini Furniture", today + timedelta(days=2), [("CHAIR001", 8), ("LAMP001", 4)])


def main() -> None:
    with SessionLocal() as db:
        if db.scalar(select(Warehouse.id).limit(1)) is not None:
            print("Database already has data; skipping seed. Reset with: alembic downgrade base && alembic upgrade head")
            return
        seed(db)
    print(f"Seeded demo data. Log in with {DEMO_LOGIN} / {DEMO_PASSWORD}")


if __name__ == "__main__":
    main()
