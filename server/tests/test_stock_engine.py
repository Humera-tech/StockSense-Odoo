from datetime import date

import pytest
from sqlalchemy import select

from app.models import OperationStatus, OperationType, StockMove, StockQuant
from app.services.stock import (
    InvalidStateError,
    LineInput,
    StockError,
    create_operation,
    mark_todo,
    validate_operation,
)


def make_receipt(db, seed, lines=None):
    return create_operation(
        db,
        op_type=OperationType.IN,
        warehouse_id=seed.wh.id,
        src_location_id=seed.vendor.id,
        dest_location_id=seed.stock1.id,
        scheduled_date=date(2026, 9, 26),
        lines=lines if lines is not None else [LineInput(seed.desk.id, 10)],
        responsible_id=seed.user.id,
        contact_id=seed.contact.id,
    )


def on_hand(db, product_id, location_id):
    quant = db.execute(
        select(StockQuant).where(StockQuant.product_id == product_id, StockQuant.location_id == location_id)
    ).scalar_one_or_none()
    return quant.quantity if quant else 0


# --- sequence / create_operation ---

def test_references_increment_per_type(db, seed):
    r1 = make_receipt(db, seed)
    r2 = make_receipt(db, seed)
    delivery = create_operation(
        db,
        op_type=OperationType.OUT,
        warehouse_id=seed.wh.id,
        src_location_id=seed.stock1.id,
        dest_location_id=seed.customer.id,
        scheduled_date=date(2026, 9, 26),
        lines=[LineInput(seed.desk.id, 1)],
        responsible_id=seed.user.id,
    )
    assert r1.reference == "WH/IN/0001"
    assert r2.reference == "WH/IN/0002"
    assert delivery.reference == "WH/OUT/0001"


def test_create_starts_as_draft_with_responsible(db, seed):
    op = make_receipt(db, seed, [LineInput(seed.desk.id, 10), LineInput(seed.chair.id, 4)])
    assert op.status == OperationStatus.DRAFT
    assert op.responsible_id == seed.user.id
    assert [(l.product_id, l.quantity, l.reserved_qty) for l in op.lines] == [
        (seed.desk.id, 10, 0),
        (seed.chair.id, 4, 0),
    ]


@pytest.mark.parametrize(
    "lines, field",
    [
        ([], "lines"),
        ([("desk", 0)], "lines.0.quantity"),
        ([("desk", -3)], "lines.0.quantity"),
        ([("desk", 2.5)], "lines.0.quantity"),
        ([("desk", 1), ("desk", 2)], "lines.1.product_id"),
    ],
)
def test_create_rejects_bad_lines(db, seed, lines, field):
    line_inputs = [LineInput(getattr(seed, name).id, qty) for name, qty in lines]
    with pytest.raises(StockError) as exc:
        make_receipt(db, seed, line_inputs)
    assert exc.value.field == field


def test_rejected_create_does_not_consume_a_reference(db, seed):
    with pytest.raises(StockError):
        make_receipt(db, seed, [])
    assert make_receipt(db, seed).reference == "WH/IN/0001"


# --- receipt lifecycle ---

def test_receipt_todo_moves_draft_to_ready(db, seed):
    op = mark_todo(db, make_receipt(db, seed).id)
    assert op.status == OperationStatus.READY


def test_todo_only_from_draft(db, seed):
    op = mark_todo(db, make_receipt(db, seed).id)
    with pytest.raises(InvalidStateError):
        mark_todo(db, op.id)


def test_validate_receipt_adds_stock_and_writes_moves(db, seed):
    op = make_receipt(db, seed, [LineInput(seed.desk.id, 10), LineInput(seed.chair.id, 4)])
    mark_todo(db, op.id)
    op = validate_operation(db, op.id)

    assert op.status == OperationStatus.DONE
    assert op.done_at is not None
    assert on_hand(db, seed.desk.id, seed.stock1.id) == 10
    assert on_hand(db, seed.chair.id, seed.stock1.id) == 4

    moves = db.execute(select(StockMove).where(StockMove.operation_id == op.id)).scalars().all()
    assert {(m.product_id, m.quantity, m.from_location_id, m.to_location_id, m.reference) for m in moves} == {
        (seed.desk.id, 10, seed.vendor.id, seed.stock1.id, "WH/IN/0001"),
        (seed.chair.id, 4, seed.vendor.id, seed.stock1.id, "WH/IN/0001"),
    }


def test_second_receipt_adds_to_existing_stock(db, seed):
    for qty in (10, 5):
        op = make_receipt(db, seed, [LineInput(seed.desk.id, qty)])
        mark_todo(db, op.id)
        validate_operation(db, op.id)
    assert on_hand(db, seed.desk.id, seed.stock1.id) == 15


def test_cannot_validate_draft(db, seed):
    op = make_receipt(db, seed)
    with pytest.raises(InvalidStateError):
        validate_operation(db, op.id)
    assert on_hand(db, seed.desk.id, seed.stock1.id) == 0


def test_cannot_validate_twice(db, seed):
    op = make_receipt(db, seed)
    mark_todo(db, op.id)
    validate_operation(db, op.id)
    with pytest.raises(InvalidStateError):
        validate_operation(db, op.id)
    assert on_hand(db, seed.desk.id, seed.stock1.id) == 10
