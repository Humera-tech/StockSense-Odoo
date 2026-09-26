from dataclasses import dataclass
from datetime import date, datetime

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import (
    Location,
    LocationType,
    Operation,
    OperationLine,
    OperationStatus,
    OperationType,
    Sequence,
    StockMove,
    StockQuant,
    Warehouse,
)


class StockError(Exception):
    def __init__(self, message: str, field: str | None = None):
        super().__init__(message)
        self.message = message
        self.field = field


class NotFoundError(StockError):
    pass


class InvalidStateError(StockError):
    pass


class InsufficientStockError(StockError):
    pass


@dataclass
class LineInput:
    product_id: int
    quantity: int


def next_reference(db: Session, warehouse: Warehouse, op_type: OperationType) -> str:
    seq = db.execute(
        select(Sequence)
        .where(Sequence.warehouse_id == warehouse.id, Sequence.op_type == op_type)
        .with_for_update()
    ).scalar_one_or_none()
    if seq is None:
        seq = Sequence(warehouse_id=warehouse.id, op_type=op_type, next_number=1)
        db.add(seq)
        db.flush()
    number = seq.next_number
    seq.next_number = number + 1
    return f"{warehouse.short_code}/{op_type.value}/{number:04d}"


def _validate_lines(lines: list[LineInput]) -> None:
    if not lines:
        raise StockError("Add at least one product line", field="lines")
    seen: set[int] = set()
    for i, line in enumerate(lines):
        if isinstance(line.quantity, bool) or not isinstance(line.quantity, int) or line.quantity <= 0:
            raise StockError("Quantity must be a whole number greater than 0", field=f"lines.{i}.quantity")
        if line.product_id in seen:
            raise StockError("Product already added to this operation", field=f"lines.{i}.product_id")
        seen.add(line.product_id)


def _get_operation(db: Session, op_id: int) -> Operation:
    op = db.get(Operation, op_id, with_for_update=True)
    if op is None:
        raise NotFoundError("Operation not found")
    return op


def create_operation(
    db: Session,
    *,
    op_type: OperationType,
    warehouse_id: int,
    src_location_id: int,
    dest_location_id: int,
    scheduled_date: date,
    lines: list[LineInput],
    responsible_id: int,
    contact_id: int | None = None,
) -> Operation:
    _validate_lines(lines)
    warehouse = db.get(Warehouse, warehouse_id)
    if warehouse is None:
        raise NotFoundError("Warehouse not found", field="warehouse_id")

    try:
        op = Operation(
            reference=next_reference(db, warehouse, op_type),
            type=op_type,
            warehouse_id=warehouse_id,
            contact_id=contact_id,
            src_location_id=src_location_id,
            dest_location_id=dest_location_id,
            scheduled_date=scheduled_date,
            status=OperationStatus.DRAFT,
            responsible_id=responsible_id,
            lines=[OperationLine(product_id=l.product_id, quantity=l.quantity, reserved_qty=0) for l in lines],
        )
        db.add(op)
        db.commit()
    except Exception:
        db.rollback()
        raise
    db.refresh(op)
    return op


def mark_todo(db: Session, op_id: int) -> Operation:
    op = _get_operation(db, op_id)
    if op.status != OperationStatus.DRAFT:
        raise InvalidStateError("Only Draft operations can be marked To Do")
    if op.type != OperationType.IN:
        raise InvalidStateError("To Do is only supported for receipts so far")
    op.status = OperationStatus.READY
    db.commit()
    db.refresh(op)
    return op


def _lock_quant(db: Session, product_id: int, location_id: int) -> StockQuant:
    quant = db.execute(
        select(StockQuant)
        .where(StockQuant.product_id == product_id, StockQuant.location_id == location_id)
        .with_for_update()
    ).scalar_one_or_none()
    if quant is None:
        quant = StockQuant(product_id=product_id, location_id=location_id, quantity=0)
        db.add(quant)
        db.flush()
    return quant


def validate_operation(db: Session, op_id: int) -> Operation:
    op = _get_operation(db, op_id)
    if op.status != OperationStatus.READY:
        raise InvalidStateError("Only Ready operations can be validated")

    src = db.get(Location, op.src_location_id)
    dest = db.get(Location, op.dest_location_id)

    try:
        for line in op.lines:
            # Quants are only tracked for internal locations; vendor/customer/adjustment are virtual.
            if src.type == LocationType.INTERNAL:
                quant = _lock_quant(db, line.product_id, src.id)
                if quant.quantity < line.quantity:
                    raise InsufficientStockError("Not enough stock to validate", field=f"lines.{line.id}")
                quant.quantity -= line.quantity
            if dest.type == LocationType.INTERNAL:
                _lock_quant(db, line.product_id, dest.id).quantity += line.quantity
            db.add(
                StockMove(
                    operation_id=op.id,
                    reference=op.reference,
                    product_id=line.product_id,
                    from_location_id=src.id,
                    to_location_id=dest.id,
                    quantity=line.quantity,
                )
            )
        op.status = OperationStatus.DONE
        op.done_at = datetime.now()
        db.commit()
    except Exception:
        db.rollback()
        raise
    db.refresh(op)
    return op
