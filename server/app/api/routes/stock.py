from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.master import ProductOut, StockLevelOut
from app.services.stock import stock_levels

router = APIRouter(prefix="/stock", tags=["stock"])


@router.get("", response_model=list[StockLevelOut])
def get_stock(
    search: str | None = None,
    warehouse_id: int | None = None,
    location_id: int | None = None,
    db: Session = Depends(get_db),
) -> list[StockLevelOut]:
    return [
        StockLevelOut(product=ProductOut.model_validate(level.product), on_hand=level.on_hand, free_to_use=level.free_to_use)
        for level in stock_levels(db, search=search, warehouse_id=warehouse_id, location_id=location_id)
    ]
