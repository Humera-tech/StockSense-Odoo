from fastapi import APIRouter, Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.deps import get_current_user
from app.api.routes import auth, contacts, locations, operations, products, stock, warehouses
from app.core.config import settings
from app.core.errors import register_error_handlers

app = FastAPI(title="StockSense API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
register_error_handlers(app)

api = APIRouter(prefix="/api")
api.include_router(auth.router)

protected = [Depends(get_current_user)]
for module in (warehouses, locations, products, contacts, operations, stock):
    api.include_router(module.router, dependencies=protected)


@api.get("/health", tags=["health"])
def health() -> dict[str, str]:
    return {"status": "ok"}


app.include_router(api)
