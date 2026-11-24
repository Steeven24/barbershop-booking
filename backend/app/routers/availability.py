from datetime import date

from fastapi import APIRouter, HTTPException, status

from app.database import DbSession
from app.models import Barber, Service
from app.scheduling import available_slots, next_available_slot
from app.schemas.appointment import AvailableSlot

router = APIRouter(prefix="/availability", tags=["availability"])


def get_barber_and_service(db: DbSession, barber_id: int, service_id: int):
    barber = db.get(Barber, barber_id)
    service = db.get(Service, service_id)
    if barber is None or service is None or not service.is_active:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Barber or service not found")
    return barber, service


@router.get("", response_model=list[AvailableSlot])
def get_availability(barber_id: int, service_id: int, day: date, db: DbSession):
    barber, service = get_barber_and_service(db, barber_id, service_id)
    slots = available_slots(db, barber, service.duration_minutes, day)
    return [AvailableSlot(start_at=start, end_at=end) for start, end in slots]


@router.get("/next", response_model=AvailableSlot | None)
def get_next_available(barber_id: int, service_id: int, db: DbSession):
    """Next free slot in the coming two weeks, or null if the barber is fully booked."""
    barber, service = get_barber_and_service(db, barber_id, service_id)
    slot = next_available_slot(db, barber, service.duration_minutes)
    return AvailableSlot(start_at=slot[0], end_at=slot[1]) if slot else None
