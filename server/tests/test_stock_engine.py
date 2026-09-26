from datetime import date

import pytest
from sqlalchemy import select

from app.models import OperationStatus, OperationType, StockMove, StockQuant
from app.services.stock import (
    InvalidStateError,
    LineInput,
    StockError,
    cancel_operation,
    create_operation,
    free_qty,
    mark_todo,
    update_operation,
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


def test_create_rejects_wrong_location_type(db, seed):
    with pytest.raises(StockError) as exc:
        create_operation(
            db,
            op_type=OperationType.IN,
            warehouse_id=seed.wh.id,
            src_location_id=seed.vendor.id,
            dest_location_id=seed.customer.id,
            scheduled_date=date(2026, 9, 26),
            lines=[LineInput(seed.desk.id, 1)],
            responsible_id=seed.user.id,
        )
    assert exc.value.field == "dest_location_id"


def test_create_rejects_unknown_product(db, seed):
    with pytest.raises(StockError) as exc:
        make_receipt(db, seed, [LineInput(9999, 1)])
    assert exc.value.field == "lines.0.product_id"


# --- deliveries: availability, reservations, waiting ---

def receive(db, seed, product, qty):
    op = make_receipt(db, seed, [LineInput(product.id, qty)])
    mark_todo(db, op.id)
    validate_operation(db, op.id)


def make_delivery(db, seed, qty, product=None, scheduled=date(2026, 9, 26)):
    return create_operation(
        db,
        op_type=OperationType.OUT,
        warehouse_id=seed.wh.id,
        src_location_id=seed.stock1.id,
        dest_location_id=seed.customer.id,
        scheduled_date=scheduled,
        lines=[LineInput((product or seed.desk).id, qty)],
        responsible_id=seed.user.id,
    )


def status_and_reserved(db, op):
    db.refresh(op)
    return op.status, op.lines[0].reserved_qty


def test_delivery_in_stock_is_ready_and_reserves(db, seed):
    receive(db, seed, seed.desk, 50)
    op = mark_todo(db, make_delivery(db, seed, 5).id)
    assert status_and_reserved(db, op) == (OperationStatus.READY, 5)
    assert on_hand(db, seed.desk.id, seed.stock1.id) == 50
    assert free_qty(db, seed.desk.id, seed.stock1.id) == 45


def test_delivery_short_goes_waiting_with_partial_reservation(db, seed):
    receive(db, seed, seed.desk, 10)
    op = mark_todo(db, make_delivery(db, seed, 15).id)
    assert status_and_reserved(db, op) == (OperationStatus.WAITING, 10)
    assert free_qty(db, seed.desk.id, seed.stock1.id) == 0


def test_cannot_validate_waiting_delivery(db, seed):
    op = mark_todo(db, make_delivery(db, seed, 5).id)
    with pytest.raises(InvalidStateError):
        validate_operation(db, op.id)


def test_reserved_stock_is_not_free_for_next_delivery(db, seed):
    receive(db, seed, seed.desk, 10)
    first = mark_todo(db, make_delivery(db, seed, 8).id)
    second = mark_todo(db, make_delivery(db, seed, 5).id)
    assert status_and_reserved(db, first) == (OperationStatus.READY, 8)
    assert status_and_reserved(db, second) == (OperationStatus.WAITING, 2)


def test_receipt_validation_readies_waiting_delivery(db, seed):
    receive(db, seed, seed.desk, 10)
    op = mark_todo(db, make_delivery(db, seed, 15).id)
    receive(db, seed, seed.desk, 5)
    assert status_and_reserved(db, op) == (OperationStatus.READY, 15)


def test_waiting_recheck_serves_earliest_scheduled_first(db, seed):
    later = mark_todo(db, make_delivery(db, seed, 5, scheduled=date(2026, 9, 28)).id)
    earlier = mark_todo(db, make_delivery(db, seed, 5, scheduled=date(2026, 9, 27)).id)
    receive(db, seed, seed.desk, 5)
    assert status_and_reserved(db, earlier) == (OperationStatus.READY, 5)
    assert status_and_reserved(db, later) == (OperationStatus.WAITING, 0)


def test_validate_delivery_removes_stock_and_logs_move(db, seed):
    receive(db, seed, seed.desk, 20)
    op = mark_todo(db, make_delivery(db, seed, 5).id)
    op = validate_operation(db, op.id)
    assert op.status == OperationStatus.DONE
    assert on_hand(db, seed.desk.id, seed.stock1.id) == 15
    assert free_qty(db, seed.desk.id, seed.stock1.id) == 15
    move = db.execute(select(StockMove).where(StockMove.operation_id == op.id)).scalar_one()
    assert (move.from_location_id, move.to_location_id, move.quantity) == (seed.stock1.id, seed.customer.id, 5)


# --- cancel / edit ---

def test_cancel_releases_reservation_and_readies_waiting(db, seed):
    receive(db, seed, seed.desk, 10)
    first = mark_todo(db, make_delivery(db, seed, 8).id)
    second = mark_todo(db, make_delivery(db, seed, 5).id)
    first = cancel_operation(db, first.id)
    assert status_and_reserved(db, first) == (OperationStatus.CANCELLED, 0)
    assert status_and_reserved(db, second) == (OperationStatus.READY, 5)
    assert free_qty(db, seed.desk.id, seed.stock1.id) == 5


def test_cannot_cancel_done(db, seed):
    op = make_receipt(db, seed)
    mark_todo(db, op.id)
    validate_operation(db, op.id)
    with pytest.raises(InvalidStateError):
        cancel_operation(db, op.id)


def test_update_draft_replaces_lines(db, seed):
    op = make_receipt(db, seed, [LineInput(seed.desk.id, 10)])
    op = update_operation(
        db,
        op.id,
        src_location_id=seed.vendor.id,
        dest_location_id=seed.stock1.id,
        scheduled_date=date(2026, 9, 30),
        lines=[LineInput(seed.desk.id, 3), LineInput(seed.chair.id, 7)],
        contact_id=seed.contact.id,
    )
    assert op.scheduled_date == date(2026, 9, 30)
    assert [(l.product_id, l.quantity) for l in op.lines] == [(seed.desk.id, 3), (seed.chair.id, 7)]


def test_cannot_edit_after_todo(db, seed):
    op = mark_todo(db, make_receipt(db, seed).id)
    with pytest.raises(InvalidStateError):
        update_operation(
            db,
            op.id,
            src_location_id=seed.vendor.id,
            dest_location_id=seed.stock1.id,
            scheduled_date=date(2026, 9, 30),
            lines=[LineInput(seed.desk.id, 1)],
        )
