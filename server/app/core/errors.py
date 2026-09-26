from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.services.stock import InsufficientStockError, InvalidStateError, NotFoundError, StockError


class ApiError(Exception):
    def __init__(self, status_code: int, message: str, field: str | None = None):
        super().__init__(message)
        self.status_code = status_code
        self.message = message
        self.field = field


def error_response(status_code: int, message: str, field: str | None = None) -> JSONResponse:
    return JSONResponse(status_code=status_code, content={"error": {"field": field, "message": message}})


def _stock_status(exc: StockError) -> int:
    if isinstance(exc, NotFoundError):
        return 404
    if isinstance(exc, (InvalidStateError, InsufficientStockError)):
        return 409
    return 422


def register_error_handlers(app: FastAPI) -> None:
    @app.exception_handler(ApiError)
    async def handle_api_error(_: Request, exc: ApiError) -> JSONResponse:
        return error_response(exc.status_code, exc.message, exc.field)

    @app.exception_handler(StockError)
    async def handle_stock_error(_: Request, exc: StockError) -> JSONResponse:
        return error_response(_stock_status(exc), exc.message, exc.field)

    @app.exception_handler(RequestValidationError)
    async def handle_validation_error(_: Request, exc: RequestValidationError) -> JSONResponse:
        first = exc.errors()[0]
        loc = [str(part) for part in first["loc"] if part not in ("body", "query", "path")]
        if first["type"] == "missing":
            message = "This field is required"
        else:
            message = first["msg"].removeprefix("Value error, ")
        return error_response(422, message, ".".join(loc) or None)

    @app.exception_handler(StarletteHTTPException)
    async def handle_http_error(_: Request, exc: StarletteHTTPException) -> JSONResponse:
        return error_response(exc.status_code, str(exc.detail))
