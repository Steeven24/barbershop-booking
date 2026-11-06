from datetime import timedelta

from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select

from app.database import DbSession
from app.models import Appointment, AppointmentStatus, Barber, Service
from app.scheduling import SchedulingError, validate_booking
from app.schemas.appointment import AppointmentCreate, AppointmentRead

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
