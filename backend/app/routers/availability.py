from datetime import date

from fastapi import APIRouter, HTTPException, status

from app.database import DbSession
from app.models import Barber, Service
from app.scheduling import available_slots
from app.schemas.appointment import AvailableSlot

router = APIRouter(prefix="/availability", tags=["availability"])


@router.get("", response_model=list[AvailableSlot])
def get_availability(barber_id: int, service_id: int, day: date, db: DbSession):
    barber = db.get(Barber, barber_id)
    service = db.get(Service, service_id)
    if barber is None or service is None or not service.is_active:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Barber or service not found")

    slots = available_slots(db, barber, service.duration_minutes, day)
    return [AvailableSlot(start_at=start, end_at=end) for start, end in slots]
