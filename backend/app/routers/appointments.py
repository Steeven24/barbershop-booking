from datetime import date, datetime, time, timedelta
from typing import Annotated

from fastapi import APIRouter, HTTPException, Query, status
from sqlalchemy import select

from app.config import settings
from app.database import DbSession
from app.models import Appointment, AppointmentStatus, Barber, Service
from app.scheduling import SchedulingError, validate_booking
from app.schemas.appointment import AppointmentCreate, AppointmentRead, AppointmentStatusUpdate

router = APIRouter(prefix="/appointments", tags=["appointments"])

S = AppointmentStatus
ALLOWED_TRANSITIONS = {
    S.PENDING: {S.CONFIRMED, S.CANCELLED},
    S.CONFIRMED: {S.COMPLETED, S.CANCELLED, S.NO_SHOW},
}


@router.post("", response_model=AppointmentRead, status_code=status.HTTP_201_CREATED)
def create_appointment(data: AppointmentCreate, db: DbSession):
    # Lock the barber row so concurrent bookings for the same barber are serialized
    barber = db.scalar(select(Barber).where(Barber.id == data.barber_id).with_for_update())
    service = db.get(Service, data.service_id)
    if barber is None or not barber.is_active:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Barber not found")
    if service is None or not service.is_active:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Service not found")

    end_at = data.start_at + timedelta(minutes=service.duration_minutes)
    try:
        validate_booking(db, barber.id, data.start_at, end_at)
    except SchedulingError as exc:
        raise HTTPException(status.HTTP_409_CONFLICT, str(exc)) from None

    appointment = Appointment(**data.model_dump(), end_at=end_at)
    db.add(appointment)
    db.commit()
    db.refresh(appointment)
    return appointment


@router.get("", response_model=list[AppointmentRead])
def list_appointments(
    db: DbSession,
    barber_id: int | None = None,
    day: date | None = None,
    status_filter: Annotated[AppointmentStatus | None, Query(alias="status")] = None,
):
    query = select(Appointment).order_by(Appointment.start_at)
    if barber_id is not None:
        query = query.where(Appointment.barber_id == barber_id)
    if day is not None:
        start = datetime.combine(day, time.min, tzinfo=settings.tz)
        query = query.where(
            Appointment.start_at >= start, Appointment.start_at < start + timedelta(days=1)
        )
    if status_filter is not None:
        query = query.where(Appointment.status == status_filter)
    return db.scalars(query).all()


@router.get("/{appointment_id}", response_model=AppointmentRead)
def get_appointment(appointment_id: int, db: DbSession):
    appointment = db.get(Appointment, appointment_id)
    if appointment is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Appointment not found")
    return appointment


@router.patch("/{appointment_id}/status", response_model=AppointmentRead)
def update_appointment_status(appointment_id: int, data: AppointmentStatusUpdate, db: DbSession):
    appointment = get_appointment(appointment_id, db)
    if data.status not in ALLOWED_TRANSITIONS.get(appointment.status, set()):
        raise HTTPException(
            status.HTTP_409_CONFLICT,
            f"Cannot change status from {appointment.status} to {data.status}",
        )
    appointment.status = data.status
    db.commit()
    db.refresh(appointment)
    return appointment
