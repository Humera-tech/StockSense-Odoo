from sqlalchemy import ForeignKey, Integer, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class StockQuant(Base):
    __tablename__ = "stock_quants"
    __table_args__ = (UniqueConstraint("product_id", "location_id", name="uq_quant_product_location"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id"))
    location_id: Mapped[int] = mapped_column(ForeignKey("locations.id"))
    quantity: Mapped[int] = mapped_column(Integer, default=0)
