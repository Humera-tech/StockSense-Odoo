from sqlalchemy import select

from app.models import Operation, OperationStatus, OperationType, Warehouse
from app.seed import seed
from app.services.stock import next_reference, stock_levels


def test_seed_matches_demo_script(db):
    seed(db)
    desk = next(level for level in stock_levels(db) if level.product.sku == "DESK001")
    assert (desk.on_hand, desk.free_to_use) == (50, 45)

    statuses = dict(db.execute(select(Operation.reference, Operation.status)).all())
    assert statuses == {
        "WH/IN/0001": OperationStatus.DONE,
        "WH/IN/0002": OperationStatus.READY,
        "WH/OUT/0001": OperationStatus.READY,
        "WH/OUT/0002": OperationStatus.DRAFT,
    }
    wh = db.scalar(select(Warehouse))
    assert next_reference(db, wh, OperationType.IN) == "WH/IN/0003"
