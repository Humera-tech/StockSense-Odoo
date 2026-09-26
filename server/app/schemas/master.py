import re
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.models import LocationType
from app.models.contact import ContactKind


def _required(message: str):
    def check(value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError(message)
        return value

    return check


def _short_code(value: str) -> str:
    value = value.strip()
    if not re.fullmatch(r"[A-Za-z0-9]{1,10}", value):
        raise ValueError("Short code must be 1–10 letters or digits")
    return value


class WarehouseIn(BaseModel):
    name: str
    short_code: str
    address: str | None = None

    _name = field_validator("name")(_required("Enter a warehouse name"))

    @field_validator("short_code")
    @classmethod
    def _code(cls, v: str) -> str:
        return _short_code(v).upper()


class WarehouseOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    short_code: str
    address: str | None


class LocationIn(BaseModel):
    name: str
    short_code: str
    warehouse_id: int

    _name = field_validator("name")(_required("Enter a location name"))
    _code = field_validator("short_code")(_short_code)


class LocationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    short_code: str
    warehouse_id: int
    type: LocationType
    full_code: str


class ProductIn(BaseModel):
    sku: str
    name: str
    unit_cost: Decimal = Field(ge=0, max_digits=12, decimal_places=2)
    uom: str = "unit"

    @field_validator("sku")
    @classmethod
    def _sku(cls, v: str) -> str:
        v = v.strip().upper()
        if not re.fullmatch(r"[A-Z0-9_-]{1,50}", v):
            raise ValueError("SKU must be 1–50 letters, digits, - or _")
        return v

    _name = field_validator("name")(_required("Enter a product name"))
    _uom = field_validator("uom")(_required("Enter a unit of measure"))


class ProductOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    sku: str
    name: str
    unit_cost: float
    uom: str


class ContactIn(BaseModel):
    name: str
    kind: ContactKind
    address: str | None = None

    _name = field_validator("name")(_required("Enter a contact name"))


class ContactOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    kind: ContactKind
    address: str | None


class StockLevelOut(BaseModel):
    product: ProductOut
    on_hand: int
    free_to_use: int
