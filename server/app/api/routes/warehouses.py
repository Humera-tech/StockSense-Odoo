from fastapi import APIRouter, Depends, Response
from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.errors import ApiError
from app.models import Location, LocationType, Operation, Sequence, StockQuant, Warehouse
from app.schemas.master import WarehouseIn, WarehouseOut

router = APIRouter(prefix="/warehouses", tags=["warehouses"])

DEFAULT_LOCATIONS = [
    ("Stock", "Stock", LocationType.INTERNAL),
    ("Vendors", "VENDOR", LocationType.VENDOR),
    ("Customers", "CUSTOMER", LocationType.CUSTOMER),
    ("Inventory adjustment", "ADJUST", LocationType.ADJUSTMENT),
]


def _get(db: Session, warehouse_id: int) -> Warehouse:
    warehouse = db.get(Warehouse, warehouse_id)
    if warehouse is None:
        raise ApiError(404, "Warehouse not found")
    return warehouse


def _ensure_unique_code(db: Session, short_code: str, exclude_id: int | None = None) -> None:
    query = select(Warehouse.id).where(Warehouse.short_code == short_code)
    if exclude_id is not None:
        query = query.where(Warehouse.id != exclude_id)
    if db.scalar(query):
        raise ApiError(409, "Short code already exists", "short_code")


@router.get("", response_model=list[WarehouseOut])
def list_warehouses(db: Session = Depends(get_db)) -> list[Warehouse]:
    return list(db.scalars(select(Warehouse).order_by(Warehouse.id)))


@router.get("/{warehouse_id}", response_model=WarehouseOut)
def get_warehouse(warehouse_id: int, db: Session = Depends(get_db)) -> Warehouse:
    return _get(db, warehouse_id)


@router.post("", response_model=WarehouseOut, status_code=201)
def create_warehouse(body: WarehouseIn, db: Session = Depends(get_db)) -> Warehouse:
    _ensure_unique_code(db, body.short_code)
    warehouse = Warehouse(name=body.name, short_code=body.short_code, address=body.address)
    warehouse.locations = [Location(name=n, short_code=c, type=t) for n, c, t in DEFAULT_LOCATIONS]
    db.add(warehouse)
    db.commit()
    db.refresh(warehouse)
    return warehouse


@router.put("/{warehouse_id}", response_model=WarehouseOut)
def update_warehouse(warehouse_id: int, body: WarehouseIn, db: Session = Depends(get_db)) -> Warehouse:
    warehouse = _get(db, warehouse_id)
    _ensure_unique_code(db, body.short_code, exclude_id=warehouse_id)
    warehouse.name = body.name
    warehouse.short_code = body.short_code
    warehouse.address = body.address
    db.commit()
    db.refresh(warehouse)
    return warehouse


@router.delete("/{warehouse_id}", status_code=204)
def delete_warehouse(warehouse_id: int, db: Session = Depends(get_db)) -> Response:
    warehouse = _get(db, warehouse_id)
    location_ids = [loc.id for loc in warehouse.locations]
    has_stock = db.scalar(
        select(StockQuant.id).where(StockQuant.location_id.in_(location_ids), StockQuant.quantity != 0)
    )
    if db.scalar(select(Operation.id).where(Operation.warehouse_id == warehouse_id)) or has_stock:
        raise ApiError(409, "Warehouse has stock or operations and cannot be deleted")
    db.execute(delete(StockQuant).where(StockQuant.location_id.in_(location_ids)))
    db.execute(delete(Sequence).where(Sequence.warehouse_id == warehouse_id))
    db.execute(delete(Location).where(Location.warehouse_id == warehouse_id))
    db.delete(warehouse)
    db.commit()
    return Response(status_code=204)
