from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.auth import AdminOnly
from app.database import DbSession
from app.models import Service
from app.schemas.service import ServiceCreate, ServiceRead, ServiceUpdate

router = APIRouter(prefix="/services", tags=["services"])


def get_service_or_404(service_id: int, db: Session) -> Service:
    service = db.get(Service, service_id)
    if service is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Service not found")
    return service


def commit_or_409(db: Session) -> None:
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status.HTTP_409_CONFLICT, "Service name already exists") from None


@router.get("", response_model=list[ServiceRead])
def list_services(db: DbSession, include_inactive: bool = False):
    query = select(Service).order_by(Service.name)
    if not include_inactive:
        query = query.where(Service.is_active.is_(True))
    return db.scalars(query).all()


@router.get("/{service_id}", response_model=ServiceRead)
def get_service(service_id: int, db: DbSession):
    return get_service_or_404(service_id, db)


@router.post(
    "", dependencies=[AdminOnly], response_model=ServiceRead, status_code=status.HTTP_201_CREATED
)
def create_service(data: ServiceCreate, db: DbSession):
    service = Service(**data.model_dump())
    db.add(service)
    commit_or_409(db)
    db.refresh(service)
    return service


@router.patch("/{service_id}", dependencies=[AdminOnly], response_model=ServiceRead)
def update_service(service_id: int, data: ServiceUpdate, db: DbSession):
    service = get_service_or_404(service_id, db)
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(service, field, value)
    commit_or_409(db)
    db.refresh(service)
    return service


@router.delete("/{service_id}", dependencies=[AdminOnly], status_code=status.HTTP_204_NO_CONTENT)
def deactivate_service(service_id: int, db: DbSession):
    service = get_service_or_404(service_id, db)
    service.is_active = False
    db.commit()
