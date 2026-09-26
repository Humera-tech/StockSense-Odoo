import re

from pydantic import BaseModel, ConfigDict, ValidationInfo, field_validator

EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


def check_password(value: str) -> str:
    if len(value) <= 8:
        raise ValueError("Password must be more than 8 characters")
    if len(value) > 64:
        raise ValueError("Password must be at most 64 characters")
    if not re.search(r"[a-z]", value):
        raise ValueError("Password needs at least one lowercase letter")
    if not re.search(r"[A-Z]", value):
        raise ValueError("Password needs at least one uppercase letter")
    if not re.search(r"[^A-Za-z0-9]", value):
        raise ValueError("Password needs at least one special character")
    return value


def check_email(value: str) -> str:
    value = value.strip().lower()
    if not EMAIL_RE.match(value):
        raise ValueError("Enter a valid email")
    return value


def check_confirm(value: str, info: ValidationInfo) -> str:
    if "password" in info.data and value != info.data["password"]:
        raise ValueError("Passwords do not match")
    return value


class SignupIn(BaseModel):
    login_id: str
    email: str
    name: str
    password: str
    confirm_password: str

    @field_validator("login_id")
    @classmethod
    def _login_id(cls, v: str) -> str:
        v = v.strip()
        if not 6 <= len(v) <= 12:
            raise ValueError("Login ID must be 6–12 characters")
        if re.search(r"\s", v):
            raise ValueError("Login ID cannot contain spaces")
        return v

    _email = field_validator("email")(check_email)

    @field_validator("name")
    @classmethod
    def _name(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Enter your name")
        return v

    _password = field_validator("password")(check_password)
    _confirm = field_validator("confirm_password")(check_confirm)


class LoginIn(BaseModel):
    login: str
    password: str


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    login_id: str
    email: str
    name: str


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class ForgotIn(BaseModel):
    email: str

    _email = field_validator("email")(check_email)


class ForgotOut(BaseModel):
    message: str
    dev_otp: str | None = None


class ResetIn(BaseModel):
    email: str
    otp: str
    password: str
    confirm_password: str

    _email = field_validator("email")(check_email)

    @field_validator("otp")
    @classmethod
    def _otp(cls, v: str) -> str:
        v = v.strip()
        if not re.fullmatch(r"\d{6}", v):
            raise ValueError("Enter the 6-digit code")
        return v

    _password = field_validator("password")(check_password)
    _confirm = field_validator("confirm_password")(check_confirm)


class MessageOut(BaseModel):
    message: str
