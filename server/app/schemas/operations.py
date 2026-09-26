from datetime import date, datetime

from pydantic import BaseModel, ConfigDict

from app.models import OperationStatus, OperationType
from app.schemas.auth import UserOut
from app.schemas.master import ContactOut, LocationOut, ProductOut


class LineIn(BaseModel):
    product_id: int
    quantity: int


class OperationUpdate(BaseModel):
    contact_id: int | None = None
    scheduled_date: date
    src_location_id: int | None = None
    dest_location_id: int | None = None
    lines: list[LineIn]


class OperationCreate(OperationUpdate):
    type: OperationType
    warehouse_id: int | None = None


class LineOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    product: ProductOut
    quantity: int
    reserved_qty: int


class OperationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    reference: str
    type: OperationType
    status: OperationStatus
    warehouse_id: int
    contact: ContactOut | None
    src_location: LocationOut
    dest_location: LocationOut
    scheduled_date: date
    responsible: UserOut
    done_at: datetime | None
    is_late: bool
    lines: list[LineOut]
