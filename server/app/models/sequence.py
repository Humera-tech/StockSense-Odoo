from sqlalchemy import Enum, ForeignKey, Integer
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base
from app.models.operation import OperationType


class Sequence(Base):
    __tablename__ = "sequences"

    warehouse_id: Mapped[int] = mapped_column(ForeignKey("warehouses.id"), primary_key=True)
    op_type: Mapped[OperationType] = mapped_column(Enum(OperationType, name="operation_type"), primary_key=True)
    next_number: Mapped[int] = mapped_column(Integer, default=1)
