import enum

from sqlalchemy import Enum, String
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class ContactKind(str, enum.Enum):
    VENDOR = "VENDOR"
    CUSTOMER = "CUSTOMER"


class Contact(Base):
    __tablename__ = "contacts"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(255))
    kind: Mapped[ContactKind] = mapped_column(Enum(ContactKind, name="contact_kind"))
    address: Mapped[str | None] = mapped_column(String(500), nullable=True)
