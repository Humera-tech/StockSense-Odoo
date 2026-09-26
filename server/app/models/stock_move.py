from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class StockMove(Base):
    __tablename__ = "stock_moves"

    id: Mapped[int] = mapped_column(primary_key=True)
    operation_id: Mapped[int] = mapped_column(ForeignKey("operations.id"))
    reference: Mapped[str] = mapped_column(String(30), index=True)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id"))
    from_location_id: Mapped[int] = mapped_column(ForeignKey("locations.id"))
    to_location_id: Mapped[int] = mapped_column(ForeignKey("locations.id"))
    quantity: Mapped[int] = mapped_column(Integer)
    date: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    operation: Mapped["Operation"] = relationship(back_populates="moves")
