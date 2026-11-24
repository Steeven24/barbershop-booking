"""Business statistics for the admin summary, computed from appointments."""

from collections.abc import Iterable
from datetime import date, datetime, time, timedelta
from decimal import Decimal
from typing import Literal

from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.config import settings
from app.models import Appointment, AppointmentStatus, Barber, WorkingHours
from app.schemas.stats import BarberStats, DayRevenue, PeriodTotals, ServiceStats, StatsResponse

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


def booked_minutes(appointments: Iterable[Appointment], days: list[date]) -> int:
    """Minutes taken by appointments that fall on the given days."""
    tz, wanted = settings.tz, set(days)
    return sum(
        minutes(a)
        for a in appointments
        if a.status in BOOKED and a.start_at.astimezone(tz).date() in wanted
    )


def working_minutes(hours: Iterable[WorkingHours], days: list[date]) -> int:
    by_weekday = {}
    for h in hours:
        start = h.start_time.hour * 60 + h.start_time.minute
        end = h.end_time.hour * 60 + h.end_time.minute
        by_weekday[h.weekday] = by_weekday.get(h.weekday, 0) + end - start
    return sum(by_weekday.get(day.weekday(), 0) for day in days)


def revenue(appointments: Iterable[Appointment]) -> Decimal:
    return sum((a.service.price for a in appointments if a.status == S.COMPLETED), Decimal(0))


def percent(part: int, total: int) -> int:
    return round(part * 100 / total) if total else 0


def totals(
    appointments: list[Appointment], hours: list[WorkingHours], days: list[date]
) -> PeriodTotals:
    booked = booked_minutes(appointments, days)
    return PeriodTotals(
        revenue=revenue(appointments),
        completed=sum(a.status == S.COMPLETED for a in appointments),
        no_shows=sum(a.status == S.NO_SHOW for a in appointments),
        occupancy=percent(booked, working_minutes(hours, days)),
    )


def week_revenue(appointments: list[Appointment], days: list[date]) -> list[DayRevenue]:
    tz = settings.tz
    return [
        DayRevenue(
            date=day,
            revenue=revenue(a for a in appointments if a.start_at.astimezone(tz).date() == day),
        )
        for day in days
    ]


def team_stats(db: Session, appointments: list[Appointment], days: list[date]) -> list[BarberStats]:
    hours_by_barber: dict[int, list[WorkingHours]] = {}
    for h in db.scalars(select(WorkingHours)):
        hours_by_barber.setdefault(h.barber_id, []).append(h)
    # Active barbers, plus inactive ones who still had appointments in the period
    barbers = [
        b for b in db.scalars(select(Barber).order_by(Barber.name))
        if b.is_active or any(a.barber_id == b.id for a in appointments)
    ]  # fmt: skip
    stats = []
    for barber in barbers:
        own = [a for a in appointments if a.barber_id == barber.id]
        booked = [a for a in own if a.status in BOOKED]
        available = working_minutes(hours_by_barber.get(barber.id, []), days)
        stats.append(
            BarberStats(
                barber_id=barber.id,
                name=barber.name,
                appointments=len(booked),
                revenue=revenue(own),
                occupancy=percent(booked_minutes(own, days), available),
            )
        )
    return sorted(stats, key=lambda s: s.occupancy, reverse=True)


def top_services(appointments: list[Appointment], limit: int = 5) -> list[ServiceStats]:
    counts: dict[int, ServiceStats] = {}
    for a in appointments:
        if a.status not in BOOKED:
            continue
        item = counts.setdefault(
            a.service_id,
            ServiceStats(service_id=a.service_id, name=a.service.name, appointments=0, value=0),
        )
        item.appointments += 1
        item.value += a.service.price
    return sorted(counts.values(), key=lambda s: s.appointments, reverse=True)[:limit]


def build_stats(db: Session, period: Period, today: date | None = None) -> StatsResponse:
    today = today or datetime.now(settings.tz).date()
    start, end = period_range(period, today)
    prev_start, prev_end = previous_range(period, start)
    week_start, week_end = period_range("week", today)

    current = appointments_between(db, start, end)
    previous = appointments_between(db, prev_start, prev_end)
    week = appointments_between(db, week_start, week_end)
    active_hours = list(
        db.scalars(select(WorkingHours).join(Barber).where(Barber.is_active.is_(True)))
    )
    # Occupancy of the current period only counts the days elapsed so far
    elapsed = days_in(start, min(end, today))

    return StatsResponse(
        period=period,
        start=start,
        end=end,
        current=totals(current, active_hours, elapsed),
        previous=totals(previous, active_hours, days_in(prev_start, prev_end)),
        week=week_revenue(week, days_in(week_start, week_end)),
        team=team_stats(db, current, elapsed),
        top_services=top_services(current),
    )
