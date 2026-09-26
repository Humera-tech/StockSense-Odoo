from dataclasses import dataclass
from datetime import date, datetime

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models import (
    Contact,
    Location,
    LocationType,
    Operation,
    OperationLine,
    OperationStatus,
    OperationType,
    Product,
    Sequence,
    StockMove,
    StockQuant,
    Warehouse,
)

RESERVING_STATUSES = (OperationStatus.WAITING, OperationStatus.READY)

EXPECTED_LOCATION_TYPES = {
    OperationType.IN: (LocationType.VENDOR, LocationType.INTERNAL),
    OperationType.OUT: (LocationType.INTERNAL, LocationType.CUSTOMER),
}


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


def _validate_lines(db: Session, lines: list[LineInput]) -> None:
    if not lines:
        raise StockError("Add at least one product line", field="lines")
    seen: set[int] = set()
    for i, line in enumerate(lines):
        if isinstance(line.quantity, bool) or not isinstance(line.quantity, int) or line.quantity <= 0:
            raise StockError("Quantity must be a whole number greater than 0", field=f"lines.{i}.quantity")
        if line.product_id in seen:
            raise StockError("Product already added to this operation", field=f"lines.{i}.product_id")
        seen.add(line.product_id)
    existing = set(db.scalars(select(Product.id).where(Product.id.in_(seen))))
    for i, line in enumerate(lines):
        if line.product_id not in existing:
            raise StockError("Product not found", field=f"lines.{i}.product_id")


def _validate_header(
    db: Session,
    op_type: OperationType,
    warehouse_id: int,
    src_location_id: int,
    dest_location_id: int,
    contact_id: int | None,
) -> None:
    if op_type not in EXPECTED_LOCATION_TYPES:
        raise StockError("Only receipts and deliveries can be created here", field="type")
    src_type, dest_type = EXPECTED_LOCATION_TYPES[op_type]
    for field, loc_id, expected in (
        ("src_location_id", src_location_id, src_type),
        ("dest_location_id", dest_location_id, dest_type),
    ):
        loc = db.get(Location, loc_id)
        if loc is None or loc.warehouse_id != warehouse_id:
            raise StockError("Location not found in this warehouse", field=field)
        if loc.type != expected:
            raise StockError(f"Location must be of type {expected.value}", field=field)
    if contact_id is not None and db.get(Contact, contact_id) is None:
        raise StockError("Contact not found", field="contact_id")


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
    warehouse = db.get(Warehouse, warehouse_id)
    if warehouse is None:
        raise NotFoundError("Warehouse not found", field="warehouse_id")
    _validate_header(db, op_type, warehouse_id, src_location_id, dest_location_id, contact_id)
    _validate_lines(db, lines)

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


def update_operation(
    db: Session,
    op_id: int,
    *,
    src_location_id: int,
    dest_location_id: int,
    scheduled_date: date,
    lines: list[LineInput],
    contact_id: int | None = None,
) -> Operation:
    op = _get_operation(db, op_id)
    if op.status != OperationStatus.DRAFT:
        raise InvalidStateError("Only Draft operations can be edited")
    _validate_header(db, op.type, op.warehouse_id, src_location_id, dest_location_id, contact_id)
    _validate_lines(db, lines)

    try:
        op.src_location_id = src_location_id
        op.dest_location_id = dest_location_id
        op.scheduled_date = scheduled_date
        op.contact_id = contact_id
        existing = {l.product_id: l for l in op.lines}
        new_lines = []
        for l in lines:
            line = existing.get(l.product_id) or OperationLine(product_id=l.product_id, reserved_qty=0)
            line.quantity = l.quantity
            new_lines.append(line)
        op.lines = new_lines
        db.commit()
    except Exception:
        db.rollback()
        raise
    db.refresh(op)
    return op


def reserved_qty(db: Session, product_id: int, location_id: int, exclude_line_id: int | None = None) -> int:
    query = (
        select(func.coalesce(func.sum(OperationLine.reserved_qty), 0))
        .join(Operation, OperationLine.operation_id == Operation.id)
        .where(
            OperationLine.product_id == product_id,
            Operation.src_location_id == location_id,
            Operation.status.in_(RESERVING_STATUSES),
        )
    )
    if exclude_line_id is not None:
        query = query.where(OperationLine.id != exclude_line_id)
    return int(db.scalar(query))


def on_hand_qty(db: Session, product_id: int, location_id: int) -> int:
    qty = db.scalar(
        select(StockQuant.quantity).where(StockQuant.product_id == product_id, StockQuant.location_id == location_id)
    )
    return qty or 0


def free_qty(db: Session, product_id: int, location_id: int) -> int:
    return on_hand_qty(db, product_id, location_id) - reserved_qty(db, product_id, location_id)


@dataclass
class StockLevel:
    product: Product
    on_hand: int
    free_to_use: int


def stock_levels(
    db: Session,
    search: str | None = None,
    warehouse_id: int | None = None,
    location_id: int | None = None,
) -> list[StockLevel]:
    def scoped(query):
        query = query.where(Location.type == LocationType.INTERNAL)
        if warehouse_id is not None:
            query = query.where(Location.warehouse_id == warehouse_id)
        if location_id is not None:
            query = query.where(Location.id == location_id)
        return query

    on_hand = dict(
        db.execute(
            scoped(
                select(StockQuant.product_id, func.sum(StockQuant.quantity))
                .join(Location, StockQuant.location_id == Location.id)
                .group_by(StockQuant.product_id)
            )
        ).all()
    )
    reserved = dict(
        db.execute(
            scoped(
                select(OperationLine.product_id, func.sum(OperationLine.reserved_qty))
                .join(Operation, OperationLine.operation_id == Operation.id)
                .join(Location, Operation.src_location_id == Location.id)
                .where(Operation.status.in_(RESERVING_STATUSES))
                .group_by(OperationLine.product_id)
            )
        ).all()
    )

    products = select(Product).order_by(Product.name)
    if search:
        pattern = f"%{search.strip()}%"
        products = products.where(Product.name.ilike(pattern) | Product.sku.ilike(pattern))

    levels = []
    for product in db.scalars(products):
        qty = int(on_hand.get(product.id) or 0)
        levels.append(StockLevel(product, qty, qty - int(reserved.get(product.id) or 0)))
    return levels


def _reserve(db: Session, op: Operation) -> bool:
    """Reserve as much as is free for each line; returns True when every line is fully covered."""
    db.flush()
    all_covered = True
    for line in op.lines:
        on_hand = on_hand_qty(db, line.product_id, op.src_location_id)
        held_by_others = reserved_qty(db, line.product_id, op.src_location_id, exclude_line_id=line.id)
        line.reserved_qty = max(0, min(line.quantity, on_hand - held_by_others))
        db.flush()
        if line.reserved_qty < line.quantity:
            all_covered = False
    return all_covered


def _recheck_waiting(db: Session, location_id: int) -> None:
    waiting = db.scalars(
        select(Operation)
        .where(
            Operation.type == OperationType.OUT,
            Operation.status == OperationStatus.WAITING,
            Operation.src_location_id == location_id,
        )
        .order_by(Operation.scheduled_date, Operation.id)
    ).all()
    for op in waiting:
        if _reserve(db, op):
            op.status = OperationStatus.READY


def mark_todo(db: Session, op_id: int) -> Operation:
    op = _get_operation(db, op_id)
    if op.status != OperationStatus.DRAFT:
        raise InvalidStateError("Only Draft operations can be marked To Do")

    try:
        if op.type == OperationType.IN:
            op.status = OperationStatus.READY
        elif op.type == OperationType.OUT:
            op.status = OperationStatus.READY if _reserve(db, op) else OperationStatus.WAITING
        else:
            raise InvalidStateError("Adjustments are posted directly and have no To Do step")
        db.commit()
    except Exception:
        db.rollback()
        raise
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
    if op.status == OperationStatus.WAITING:
        raise InvalidStateError("Some products are not in stock yet; this operation is still Waiting")
    if op.status != OperationStatus.READY:
        raise InvalidStateError("Only Ready operations can be validated")

    src = db.get(Location, op.src_location_id)
    dest = db.get(Location, op.dest_location_id)

    try:
        for i, line in enumerate(op.lines):
            # Quants are only tracked for internal locations; vendor/customer/adjustment are virtual.
            if src.type == LocationType.INTERNAL:
                quant = _lock_quant(db, line.product_id, src.id)
                if quant.quantity < line.quantity:
                    raise InsufficientStockError("Not enough stock to validate", field=f"lines.{i}.quantity")
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
        if dest.type == LocationType.INTERNAL:
            _recheck_waiting(db, dest.id)
        db.commit()
    except Exception:
        db.rollback()
        raise
    db.refresh(op)
    return op


def cancel_operation(db: Session, op_id: int) -> Operation:
    op = _get_operation(db, op_id)
    if op.status == OperationStatus.DONE:
        raise InvalidStateError("Done operations cannot be cancelled")
    if op.status == OperationStatus.CANCELLED:
        raise InvalidStateError("Operation is already cancelled")

    try:
        released = any(line.reserved_qty for line in op.lines)
        for line in op.lines:
            line.reserved_qty = 0
        op.status = OperationStatus.CANCELLED
        if released:
            _recheck_waiting(db, op.src_location_id)
        db.commit()
    except Exception:
        db.rollback()
        raise
    db.refresh(op)
    return op
