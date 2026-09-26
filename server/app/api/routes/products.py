from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.errors import ApiError
from app.models import Product
from app.schemas.master import ProductIn, ProductOut

router = APIRouter(prefix="/products", tags=["products"])


def _ensure_unique_sku(db: Session, sku: str, exclude_id: int | None = None) -> None:
    query = select(Product.id).where(Product.sku == sku)
    if exclude_id is not None:
        query = query.where(Product.id != exclude_id)
    if db.scalar(query):
        raise ApiError(409, "SKU already exists", "sku")


@router.get("", response_model=list[ProductOut])
def list_products(search: str | None = None, db: Session = Depends(get_db)) -> list[Product]:
    query = select(Product).order_by(Product.name)
    if search:
        pattern = f"%{search.strip()}%"
        query = query.where(Product.name.ilike(pattern) | Product.sku.ilike(pattern))
    return list(db.scalars(query))


@router.get("/{product_id}", response_model=ProductOut)
def get_product(product_id: int, db: Session = Depends(get_db)) -> Product:
    product = db.get(Product, product_id)
    if product is None:
        raise ApiError(404, "Product not found")
    return product


@router.post("", response_model=ProductOut, status_code=201)
def create_product(body: ProductIn, db: Session = Depends(get_db)) -> Product:
    _ensure_unique_sku(db, body.sku)
    product = Product(**body.model_dump())
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


@router.put("/{product_id}", response_model=ProductOut)
def update_product(product_id: int, body: ProductIn, db: Session = Depends(get_db)) -> Product:
    product = get_product(product_id, db)
    _ensure_unique_sku(db, body.sku, exclude_id=product_id)
    for key, value in body.model_dump().items():
        setattr(product, key, value)
    db.commit()
    db.refresh(product)
    return product
