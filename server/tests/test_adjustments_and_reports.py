from datetime import date, timedelta

import pytest
from sqlalchemy import func, select

from app.models import Operation, OperationStatus, OperationType
from app.services.stock import (
    LineInput,
    StockError,
    adjust_stock,
    create_operation,
    dashboard_counts,
    free_qty,
    list_moves,
    mark_todo,
    on_hand_qty,
    validate_operation,
)

TODAY = date(2026, 9, 26)


def receipt(db, seed, qty, product=None, scheduled=TODAY):
    return create_operation(
        db, op_type=OperationType.IN, warehouse_id=seed.wh.id, src_location_id=seed.vendor.id,
        dest_location_id=seed.stock1.id, scheduled_date=scheduled,
        lines=[LineInput((product or seed.desk).id, qty)], responsible_id=seed.user.id, contact_id=seed.contact.id,
    )


def delivery(db, seed, qty, scheduled=TODAY):
    return create_operation(
        db, op_type=OperationType.OUT, warehouse_id=seed.wh.id, src_location_id=seed.stock1.id,
        dest_location_id=seed.customer.id, scheduled_date=scheduled,
        lines=[LineInput(seed.desk.id, qty)], responsible_id=seed.user.id,
    )


def receive(db, seed, qty):
    op = receipt(db, seed, qty)
    mark_todo(db, op.id)
    return validate_operation(db, op.id)


def adjust(db, seed, counted):
    return adjust_stock(
        db, product_id=seed.desk.id, location_id=seed.stock1.id, counted_qty=counted, responsible_id=seed.user.id
    )


# --- adjustments ---

def test_adjust_up_posts_done_adj_from_adjustment_location(db, seed):
    op = adjust(db, seed, 10)
    assert (op.reference, op.type, op.status) == ("WH/ADJ/0001", OperationType.ADJ, OperationStatus.DONE)
    assert (op.src_location_id, op.dest_location_id) == (seed.adjust.id, seed.stock1.id)
    assert op.lines[0].quantity == 10
    assert on_hand_qty(db, seed.desk.id, seed.stock1.id) == 10
    move = list_moves(db)[0]
    assert (move.reference, move.quantity, move.direction) == ("WH/ADJ/0001", 10, "IN")


def test_adjust_down_moves_difference_to_adjustment_location(db, seed):
    receive(db, seed, 50)
    op = adjust(db, seed, 48)
    assert (op.src_location_id, op.dest_location_id, op.lines[0].quantity) == (seed.stock1.id, seed.adjust.id, 2)
    assert on_hand_qty(db, seed.desk.id, seed.stock1.id) == 48
    assert list_moves(db)[0].direction == "OUT"


def test_adjust_to_same_quantity_posts_nothing(db, seed):
    receive(db, seed, 5)
    assert adjust(db, seed, 5) is None
    assert db.scalar(select(func.count(Operation.id)).where(Operation.type == OperationType.ADJ)) == 0


@pytest.mark.parametrize("counted, message", [(-1, "Quantity cannot be negative"), (2.5, "Quantity must be a whole number")])
def test_adjust_rejects_bad_quantity(db, seed, counted, message):
    with pytest.raises(StockError) as exc:
        adjust(db, seed, counted)
    assert (exc.value.field, exc.value.message) == ("counted_qty", message)


def test_adjust_cannot_count_below_reserved(db, seed):
    receive(db, seed, 50)
    mark_todo(db, delivery(db, seed, 5).id)
    with pytest.raises(StockError) as exc:
        adjust(db, seed, 3)
    assert exc.value.field == "counted_qty"
    assert on_hand_qty(db, seed.desk.id, seed.stock1.id) == 50
    op = adjust(db, seed, 48)
    assert op is not None
    assert free_qty(db, seed.desk.id, seed.stock1.id) == 43


def test_adjust_only_on_internal_locations(db, seed):
    with pytest.raises(StockError) as exc:
        adjust_stock(db, product_id=seed.desk.id, location_id=seed.vendor.id, counted_qty=5, responsible_id=seed.user.id)
    assert exc.value.field == "location_id"


def test_adjust_up_readies_waiting_delivery(db, seed):
    waiting = mark_todo(db, delivery(db, seed, 5).id)
    assert waiting.status == OperationStatus.WAITING
    adjust(db, seed, 5)
    db.refresh(waiting)
    assert waiting.status == OperationStatus.READY


# --- move ledger ---

def test_list_moves_directions_search_and_filter(db, seed):
    receive(db, seed, 20)
    out = mark_todo(db, delivery(db, seed, 5).id)
    validate_operation(db, out.id)
    adjust(db, seed, 14)

    moves = list_moves(db)
    assert [(m.reference, m.direction, m.quantity) for m in moves] == [
        ("WH/ADJ/0001", "OUT", 1),
        ("WH/OUT/0001", "OUT", 5),
        ("WH/IN/0001", "IN", 20),
    ]
    assert moves[2].from_location.full_code == "Vendors"
    assert moves[2].to_location.full_code == "WH/Stock1"
    assert moves[2].operation.contact.name == "Azure Interior"

    assert [m.reference for m in list_moves(db, q="azure")] == ["WH/IN/0001"]
    assert [m.reference for m in list_moves(db, q="desk001")] == ["WH/ADJ/0001", "WH/OUT/0001", "WH/IN/0001"]
    assert [m.reference for m in list_moves(db, op_type=OperationType.OUT)] == ["WH/OUT/0001"]


def test_multi_product_reference_gives_one_move_per_product(db, seed):
    op = create_operation(
        db, op_type=OperationType.IN, warehouse_id=seed.wh.id, src_location_id=seed.vendor.id,
        dest_location_id=seed.stock1.id, scheduled_date=TODAY, responsible_id=seed.user.id,
        lines=[LineInput(seed.desk.id, 3), LineInput(seed.chair.id, 4)],
    )
    mark_todo(db, op.id)
    validate_operation(db, op.id)
    assert sorted((m.product.sku, m.quantity) for m in list_moves(db)) == [("CHAIR001", 4), ("DESK001", 3)]


# --- dashboard ---

def test_dashboard_counts(db, seed):
    yesterday, tomorrow = TODAY - timedelta(days=1), TODAY + timedelta(days=1)
    mark_todo(db, receipt(db, seed, 5, scheduled=yesterday).id)   # ready + late
    mark_todo(db, receipt(db, seed, 5).id)                        # ready, today
    receipt(db, seed, 5, scheduled=tomorrow)                      # draft, upcoming
    done = receipt(db, seed, 5, scheduled=yesterday)              # done: not late
    mark_todo(db, done.id)
    validate_operation(db, done.id)

    mark_todo(db, delivery(db, seed, 5, scheduled=yesterday).id)  # ready (stock 5) + late
    mark_todo(db, delivery(db, seed, 99).id)                      # waiting
    delivery(db, seed, 1, scheduled=tomorrow)                     # draft, upcoming

    assert dashboard_counts(db, today=TODAY) == {
        "receipts": {"toReceive": 2, "late": 1, "operations": 1},
        "deliveries": {"toDeliver": 1, "late": 1, "waiting": 1, "operations": 1},
    }
