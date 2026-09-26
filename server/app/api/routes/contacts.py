from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models import Contact
from app.models.contact import ContactKind
from app.schemas.master import ContactIn, ContactOut

router = APIRouter(prefix="/contacts", tags=["contacts"])


@router.get("", response_model=list[ContactOut])
def list_contacts(
    kind: ContactKind | None = None,
    search: str | None = None,
    db: Session = Depends(get_db),
) -> list[Contact]:
    query = select(Contact).order_by(Contact.name)
    if kind is not None:
        query = query.where(Contact.kind == kind)
    if search:
        query = query.where(Contact.name.ilike(f"%{search.strip()}%"))
    return list(db.scalars(query))


@router.post("", response_model=ContactOut, status_code=201)
def create_contact(body: ContactIn, db: Session = Depends(get_db)) -> Contact:
    contact = Contact(**body.model_dump())
    db.add(contact)
    db.commit()
    db.refresh(contact)
    return contact
