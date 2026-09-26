import enum

from sqlalchemy import Enum, ForeignKey, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class LocationType(str, enum.Enum):
    INTERNAL = "INTERNAL"
    VENDOR = "VENDOR"
    CUSTOMER = "CUSTOMER"
    ADJUSTMENT = "ADJUSTMENT"


class Location(Base):
    __tablename__ = "locations"
    __table_args__ = (UniqueConstraint("warehouse_id", "short_code", name="uq_location_short_code_per_warehouse"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(255))
    short_code: Mapped[str] = mapped_column(String(20))
    warehouse_id: Mapped[int] = mapped_column(ForeignKey("warehouses.id"))
    type: Mapped[LocationType] = mapped_column(Enum(LocationType, name="location_type"))

    warehouse: Mapped["Warehouse"] = relationship(back_populates="locations")

    @property
    def full_code(self) -> str:
        if self.type == LocationType.INTERNAL:
            return f"{self.warehouse.short_code}/{self.short_code}"
        return self.name
