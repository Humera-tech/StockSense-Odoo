from fastapi import APIRouter, Depends, Response
from sqlalchemy import delete, func, or_, select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.errors import ApiError
from app.models import Location, LocationType, Operation, StockMove, StockQuant, Warehouse
from app.schemas.master import LocationIn, LocationOut

router = APIRouter(prefix="/locations", tags=["locations"])


def _get_internal(db: Session, location_id: int) -> Location:
    location = db.get(Location, location_id)
    if location is None:
        raise ApiError(404, "Location not found")
    if location.type != LocationType.INTERNAL:
        raise ApiError(409, "System locations cannot be changed")
    return location


def _validate(db: Session, body: LocationIn, exclude_id: int | None = None) -> None:
    if db.get(Warehouse, body.warehouse_id) is None:
        raise ApiError(422, "Choose a warehouse", "warehouse_id")
    query = select(Location.id).where(
        Location.warehouse_id == body.warehouse_id,
        func.lower(Location.short_code) == body.short_code.lower(),
    )
    if exclude_id is not None:
        query = query.where(Location.id != exclude_id)
    if db.scalar(query):
        raise ApiError(409, "Short code already exists", "short_code")


def _in_use(db: Session, location_id: int) -> bool:
    return bool(
        db.scalar(
            select(Operation.id).where(
                or_(Operation.src_location_id == location_id, Operation.dest_location_id == location_id)
            )
        )
        or db.scalar(
            select(StockMove.id).where(
                or_(StockMove.from_location_id == location_id, StockMove.to_location_id == location_id)
            )
        )
        or db.scalar(select(StockQuant.id).where(StockQuant.location_id == location_id, StockQuant.quantity != 0))
    )


@router.get("", response_model=list[LocationOut])
def list_locations(
    warehouse_id: int | None = None,
    type: LocationType | None = None,
    db: Session = Depends(get_db),
) -> list[Location]:
    query = select(Location).order_by(Location.warehouse_id, Location.type, Location.id)
    if warehouse_id is not None:
        query = query.where(Location.warehouse_id == warehouse_id)
    if type is not None:
        query = query.where(Location.type == type)
    return list(db.scalars(query))


@router.post("", response_model=LocationOut, status_code=201)
def create_location(body: LocationIn, db: Session = Depends(get_db)) -> Location:
    _validate(db, body)
    location = Location(
        name=body.name, short_code=body.short_code, warehouse_id=body.warehouse_id, type=LocationType.INTERNAL
    )
    db.add(location)
    db.commit()
    db.refresh(location)
    return location


@router.put("/{location_id}", response_model=LocationOut)
def update_location(location_id: int, body: LocationIn, db: Session = Depends(get_db)) -> Location:
    location = _get_internal(db, location_id)
    _validate(db, body, exclude_id=location_id)
    if body.warehouse_id != location.warehouse_id and _in_use(db, location_id):
        raise ApiError(409, "Location is in use and cannot move to another warehouse", "warehouse_id")
    location.name = body.name
    location.short_code = body.short_code
    location.warehouse_id = body.warehouse_id
    db.commit()
    db.refresh(location)
    return location


@router.delete("/{location_id}", status_code=204)
def delete_location(location_id: int, db: Session = Depends(get_db)) -> Response:
    location = _get_internal(db, location_id)
    if _in_use(db, location_id):
        raise ApiError(409, "Location is in use and cannot be deleted")
    db.execute(delete(StockQuant).where(StockQuant.location_id == location_id))
    db.delete(location)
    db.commit()
    return Response(status_code=204)
