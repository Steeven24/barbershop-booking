from datetime import date, datetime, timedelta

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.config import settings
from app.models import Appointment, AppointmentStatus, Barber, WorkingHours

ACTIVE_STATUSES = (AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED)


class SchedulingError(Exception):
    pass


def working_window(db: Session, barber_id: int, day: date) -> tuple[datetime, datetime] | None:
    """Opening and closing time of a barber on a given day, in the business timezone."""
    hours = db.scalar(
        select(WorkingHours).where(
            WorkingHours.barber_id == barber_id, WorkingHours.weekday == day.weekday()
        )
    )
    if hours is None:
        return None
    tz = settings.tz
    return (
        datetime.combine(day, hours.start_time, tzinfo=tz),
        datetime.combine(day, hours.end_time, tzinfo=tz),
    )


def busy_ranges(
    db: Session, barber_id: int, start: datetime, end: datetime
) -> list[tuple[datetime, datetime]]:
    rows = db.execute(
        select(Appointment.start_at, Appointment.end_at).where(
            Appointment.barber_id == barber_id,
            Appointment.status.in_(ACTIVE_STATUSES),
            Appointment.start_at < end,
            Appointment.end_at > start,
        )
    )
    return [(row.start_at, row.end_at) for row in rows]


def overlaps(start: datetime, end: datetime, ranges: list[tuple[datetime, datetime]]) -> bool:
    return any(start < busy_end and busy_start < end for busy_start, busy_end in ranges)


def available_slots(
    db: Session, barber: Barber, duration_minutes: int, day: date, now: datetime | None = None
) -> list[tuple[datetime, datetime]]:
    window = working_window(db, barber.id, day)
    if window is None or not barber.is_active:
        return []
    opens, closes = window
    now = now or datetime.now(settings.tz)
    duration = timedelta(minutes=duration_minutes)
    step = timedelta(minutes=settings.slot_step_minutes)
    busy = busy_ranges(db, barber.id, opens, closes)

    slots = []
    start = opens
    while start + duration <= closes:
        end = start + duration
        if start > now and not overlaps(start, end, busy):
            slots.append((start, end))
        start += step
    return slots
