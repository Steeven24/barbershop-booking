from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.auth import AdminOnly
from app.database import DbSession
from app.models import Barber, WorkingHours
from app.schemas.barber import BarberCreate, BarberRead, BarberUpdate
from app.schemas.working_hours import (
    WorkingHoursBase,
    WorkingHoursRead,
    ensure_unique_weekdays,
)

router = APIRouter(prefix="/barbers", tags=["barbers"])


def get_barber_or_404(barber_id: int, db: Session) -> Barber:
    barber = db.get(Barber, barber_id)
    if barber is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Barber not found")
    return barber


@router.get("", response_model=list[BarberRead])
def list_barbers(db: DbSession, include_inactive: bool = False):
    query = select(Barber).order_by(Barber.name)
    if not include_inactive:
        query = query.where(Barber.is_active.is_(True))
    return db.scalars(query).all()


@router.get("/{barber_id}", response_model=BarberRead)
def get_barber(barber_id: int, db: DbSession):
    return get_barber_or_404(barber_id, db)


@router.post(
    "", dependencies=[AdminOnly], response_model=BarberRead, status_code=status.HTTP_201_CREATED
)
def create_barber(data: BarberCreate, db: DbSession):
    barber = Barber(**data.model_dump())
    db.add(barber)
    db.commit()
    db.refresh(barber)
    return barber


@router.patch("/{barber_id}", dependencies=[AdminOnly], response_model=BarberRead)
def update_barber(barber_id: int, data: BarberUpdate, db: DbSession):
    barber = get_barber_or_404(barber_id, db)
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(barber, field, value)
    db.commit()
    db.refresh(barber)
    return barber


@router.delete("/{barber_id}", dependencies=[AdminOnly], status_code=status.HTTP_204_NO_CONTENT)
def deactivate_barber(barber_id: int, db: DbSession):
    # Soft delete: barbers with past appointments must keep their history
    barber = get_barber_or_404(barber_id, db)
    barber.is_active = False
    db.commit()


@router.get("/{barber_id}/working-hours", response_model=list[WorkingHoursRead])
def get_working_hours(barber_id: int, db: DbSession):
    barber = get_barber_or_404(barber_id, db)
    return sorted(barber.working_hours, key=lambda wh: wh.weekday)


@router.put(
    "/{barber_id}/working-hours", dependencies=[AdminOnly], response_model=list[WorkingHoursRead]
)
def replace_working_hours(barber_id: int, data: list[WorkingHoursBase], db: DbSession):
    """Replace the whole weekly schedule. Days not included are days off."""
    barber = get_barber_or_404(barber_id, db)
    try:
        ensure_unique_weekdays(data)
    except ValueError as exc:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_CONTENT, str(exc)) from None

    barber.working_hours.clear()
    db.flush()
    barber.working_hours.extend(WorkingHours(**item.model_dump()) for item in data)
    db.commit()
    db.refresh(barber)
    return sorted(barber.working_hours, key=lambda wh: wh.weekday)
