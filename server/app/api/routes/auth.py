import logging
import secrets
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.config import settings
from app.core.database import get_db
from app.core.errors import ApiError
from app.core.security import create_access_token, hash_password, verify_password
from app.models import User
from app.schemas.auth import ForgotIn, ForgotOut, LoginIn, MessageOut, ResetIn, SignupIn, TokenOut, UserOut

router = APIRouter(prefix="/auth", tags=["auth"])
logger = logging.getLogger("stocksense.auth")

OTP_TTL = timedelta(minutes=10)


@router.post("/signup", response_model=UserOut, status_code=201)
def signup(body: SignupIn, db: Session = Depends(get_db)) -> User:
    if db.scalar(select(User.id).where(User.email == body.email)):
        raise ApiError(409, "Email already registered", "email")

    user = User(
        email=body.email,
        name=body.name,
        password_hash=hash_password(body.password),
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user


@router.post("/login", response_model=TokenOut)
def login(body: LoginIn, db: Session = Depends(get_db)) -> TokenOut:
    email = body.login.strip().lower()

    user = db.scalar(
        select(User).where(User.email == email)
    )

    if user is None or not verify_password(body.password, user.password_hash):
        raise ApiError(401, "Invalid email or password")

    return TokenOut(
        access_token=create_access_token(user.id),
        user=UserOut.model_validate(user),
    )


@router.post("/forgot", response_model=ForgotOut)
def forgot_password(body: ForgotIn, db: Session = Depends(get_db)) -> ForgotOut:
    response = ForgotOut(message="If that email is registered, a 6-digit code has been sent to it.")
    user = db.scalar(select(User).where(User.email == body.email))
    if user is None:
        return response

    otp = f"{secrets.randbelow(1_000_000):06d}"
    user.reset_otp_hash = hash_password(otp)
    user.reset_otp_expires_at = datetime.now() + OTP_TTL
    db.commit()
    logger.warning("Password reset code for %s: %s", user.email, otp)
    if settings.show_dev_otp:
        response.dev_otp = otp
    return response


@router.post("/reset", response_model=MessageOut)
def reset_password(body: ResetIn, db: Session = Depends(get_db)) -> MessageOut:
    user = db.scalar(select(User).where(User.email == body.email))
    if (
        user is None
        or user.reset_otp_hash is None
        or user.reset_otp_expires_at is None
        or user.reset_otp_expires_at < datetime.now()
        or not verify_password(body.otp, user.reset_otp_hash)
    ):
        raise ApiError(400, "Invalid or expired code", "otp")
    user.password_hash = hash_password(body.password)
    user.reset_otp_hash = None
    user.reset_otp_expires_at = None
    db.commit()
    return MessageOut(message="Password updated. You can sign in now.")
