from datetime import date

from fastapi import APIRouter, Depends
from sqlalchemy import or_, select
from sqlalchemy.orm import Session, selectinload

from app.api.deps import get_current_user
from app.core.database import get_db
from app.core.errors import ApiError
from app.models import (
    Contact,
    Location,
    LocationType,
    Operation,
    OperationLine,
    OperationStatus,
    OperationType,
    User,
    Warehouse,
)
from app.schemas.operations import OperationCreate, OperationOut, OperationUpdate
from app.services import stock

router = APIRouter(prefix="/operations", tags=["operations"])

LOAD_OPTIONS = (
    selectinload(Operation.lines).selectinload(OperationLine.product),
    selectinload(Operation.contact),
    selectinload(Operation.src_location).selectinload(Location.warehouse),
    selectinload(Operation.dest_location).selectinload(Location.warehouse),
    selectinload(Operation.responsible),
)


def _load(db: Session, op_id: int) -> Operation:
    op = db.scalar(
        select(Operation).options(*LOAD_OPTIONS).where(Operation.id == op_id).execution_options(populate_existing=True)
    )
    if op is None:
        raise ApiError(404, "Operation not found")
    return op


def _virtual_location(db: Session, warehouse_id: int, loc_type: LocationType) -> int:
    loc_id = db.scalar(
        select(Location.id).where(Location.warehouse_id == warehouse_id, Location.type == loc_type).limit(1)
    )
    if loc_id is None:
        raise ApiError(422, f"Warehouse has no {loc_type.value.lower()} location")
    return loc_id


def _resolve_locations(
    db: Session, op_type: OperationType, warehouse_id: int, body: OperationUpdate
) -> tuple[int, int]:
    if op_type == OperationType.IN:
        if body.dest_location_id is None:
            raise ApiError(422, "Choose a destination location", "dest_location_id")
        src = body.src_location_id or _virtual_location(db, warehouse_id, LocationType.VENDOR)
        return src, body.dest_location_id
    if body.src_location_id is None:
        raise ApiError(422, "Choose a source location", "src_location_id")
    dest = body.dest_location_id or _virtual_location(db, warehouse_id, LocationType.CUSTOMER)
    return body.src_location_id, dest


def _lines(body: OperationUpdate) -> list[stock.LineInput]:
    return [stock.LineInput(product_id=l.product_id, quantity=l.quantity) for l in body.lines]


@router.get("", response_model=list[OperationOut])
def list_operations(
    type: OperationType | None = None,
    status: OperationStatus | None = None,
    q: str | None = None,
    late: bool = False,
    db: Session = Depends(get_db),
) -> list[Operation]:
    query = (
        select(Operation)
        .options(*LOAD_OPTIONS)
        .outerjoin(Contact, Operation.contact_id == Contact.id)
        .order_by(Operation.id.desc())
    )
    if type is not None:
        query = query.where(Operation.type == type)
    if status is not None:
        query = query.where(Operation.status == status)
    if q:
        pattern = f"%{q.strip()}%"
        query = query.where(or_(Operation.reference.ilike(pattern), Contact.name.ilike(pattern)))
    if late:
        query = query.where(
            Operation.scheduled_date < date.today(),
            Operation.status.not_in((OperationStatus.DONE, OperationStatus.CANCELLED)),
        )
    return list(db.scalars(query))


@router.get("/{op_id}", response_model=OperationOut)
def get_operation(op_id: int, db: Session = Depends(get_db)) -> Operation:
    return _load(db, op_id)


@router.post("", response_model=OperationOut, status_code=201)
def create_operation(
    body: OperationCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> Operation:
    if body.type not in (OperationType.IN, OperationType.OUT):
        raise ApiError(422, "Type must be IN or OUT", "type")
    warehouse_id = body.warehouse_id or db.scalar(select(Warehouse.id).order_by(Warehouse.id).limit(1))
    if warehouse_id is None:
        raise ApiError(422, "Create a warehouse first", "warehouse_id")
    if body.contact_id is None:
        raise ApiError(422, "Choose a contact", "contact_id")
    src, dest = _resolve_locations(db, body.type, warehouse_id, body)
    op = stock.create_operation(
        db,
        op_type=body.type,
        warehouse_id=warehouse_id,
        src_location_id=src,
        dest_location_id=dest,
        scheduled_date=body.scheduled_date,
        lines=_lines(body),
        responsible_id=user.id,
        contact_id=body.contact_id,
    )
    return _load(db, op.id)


@router.put("/{op_id}", response_model=OperationOut)
def update_operation(op_id: int, body: OperationUpdate, db: Session = Depends(get_db)) -> Operation:
    op = _load(db, op_id)
    if body.contact_id is None:
        raise ApiError(422, "Choose a contact", "contact_id")
    src, dest = _resolve_locations(db, op.type, op.warehouse_id, body)
    stock.update_operation(
        db,
        op_id,
        src_location_id=src,
        dest_location_id=dest,
        scheduled_date=body.scheduled_date,
        lines=_lines(body),
        contact_id=body.contact_id,
    )
    return _load(db, op_id)


@router.post("/{op_id}/todo", response_model=OperationOut)
def mark_todo(op_id: int, db: Session = Depends(get_db)) -> Operation:
    stock.mark_todo(db, op_id)
    return _load(db, op_id)


@router.post("/{op_id}/validate", response_model=OperationOut)
def validate_operation(op_id: int, db: Session = Depends(get_db)) -> Operation:
    stock.validate_operation(db, op_id)
    return _load(db, op_id)


@router.post("/{op_id}/cancel", response_model=OperationOut)
def cancel_operation(op_id: int, db: Session = Depends(get_db)) -> Operation:
    stock.cancel_operation(db, op_id)
    return _load(db, op_id)
