"""Business statistics for the admin summary, computed from appointments."""

from collections.abc import Iterable
from datetime import date, datetime, time, timedelta
from typing import Literal

from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.config import settings
from app.models import Appointment, AppointmentStatus, WorkingHours

Period = Literal["day", "week", "month"]
S = AppointmentStatus
# Appointments that use a barber's time (cancelled ones free it again)
BOOKED = (S.PENDING, S.CONFIRMED, S.COMPLETED)


def period_range(period: Period, today: date) -> tuple[date, date]:
    """Inclusive date range of the period containing `today`."""
    if period == "day":
        return today, today
    if period == "week":
        start = today - timedelta(days=today.weekday())
        return start, start + timedelta(days=6)
    start = today.replace(day=1)
    next_month = (start + timedelta(days=32)).replace(day=1)
    return start, next_month - timedelta(days=1)


def previous_range(period: Period, start: date) -> tuple[date, date]:
    """The range to compare with: same weekday last week, last week or last month."""
    if period == "day":
        return start - timedelta(days=7), start - timedelta(days=7)
    if period == "week":
        return start - timedelta(days=7), start - timedelta(days=1)
    return period_range("month", start - timedelta(days=1))


def days_in(start: date, end: date) -> list[date]:
    return [start + timedelta(days=i) for i in range((end - start).days + 1)]


def appointments_between(db: Session, start: date, end: date) -> list[Appointment]:
    tz = settings.tz
    query = (
        select(Appointment)
        .options(joinedload(Appointment.service), joinedload(Appointment.barber))
        .where(
            Appointment.start_at >= datetime.combine(start, time.min, tzinfo=tz),
            Appointment.start_at < datetime.combine(end + timedelta(days=1), time.min, tzinfo=tz),
        )
    )
    return list(db.scalars(query).unique())


def minutes(appointment: Appointment) -> int:
    return int((appointment.end_at - appointment.start_at).total_seconds() // 60)


def working_minutes(hours: Iterable[WorkingHours], days: list[date]) -> int:
    by_weekday = {}
    for h in hours:
        start = h.start_time.hour * 60 + h.start_time.minute
        end = h.end_time.hour * 60 + h.end_time.minute
        by_weekday[h.weekday] = by_weekday.get(h.weekday, 0) + end - start
    return sum(by_weekday.get(day.weekday(), 0) for day in days)
