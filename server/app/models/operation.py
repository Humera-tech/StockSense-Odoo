import enum
from datetime import date, datetime

from sqlalchemy import Date, DateTime, Enum, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class OperationType(str, enum.Enum):
    IN = "IN"
    OUT = "OUT"
    ADJ = "ADJ"


class OperationStatus(str, enum.Enum):
    DRAFT = "DRAFT"
    WAITING = "WAITING"
    READY = "READY"
    DONE = "DONE"
    CANCELLED = "CANCELLED"


class Operation(Base):
    __tablename__ = "operations"

    id: Mapped[int] = mapped_column(primary_key=True)
    reference: Mapped[str] = mapped_column(String(30), unique=True, index=True)
    type: Mapped[OperationType] = mapped_column(Enum(OperationType, name="operation_type"))
    warehouse_id: Mapped[int] = mapped_column(ForeignKey("warehouses.id"))
    contact_id: Mapped[int | None] = mapped_column(ForeignKey("contacts.id"), nullable=True)
    src_location_id: Mapped[int] = mapped_column(ForeignKey("locations.id"))
    dest_location_id: Mapped[int] = mapped_column(ForeignKey("locations.id"))
    scheduled_date: Mapped[date] = mapped_column(Date)
    status: Mapped[OperationStatus] = mapped_column(
        Enum(OperationStatus, name="operation_status"), default=OperationStatus.DRAFT
    )
    responsible_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    done_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    lines: Mapped[list["OperationLine"]] = relationship(back_populates="operation", cascade="all, delete-orphan")
    moves: Mapped[list["StockMove"]] = relationship(back_populates="operation")
