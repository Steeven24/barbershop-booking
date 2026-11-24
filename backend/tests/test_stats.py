from datetime import date, datetime, timedelta

from app.config import settings
from app.models import Appointment, AppointmentStatus
from app.stats import period_range, previous_range

S = AppointmentStatus
MONDAY = date(2026, 11, 23)


def test_period_ranges():
    wednesday = date(2026, 11, 25)
    assert period_range("day", wednesday) == (wednesday, wednesday)
    assert period_range("week", wednesday) == (MONDAY, date(2026, 11, 29))
    assert period_range("month", wednesday) == (date(2026, 11, 1), date(2026, 11, 30))
    assert previous_range("day", wednesday) == (date(2026, 11, 18), date(2026, 11, 18))
    assert previous_range("week", MONDAY) == (date(2026, 11, 16), date(2026, 11, 22))
    assert previous_range("month", date(2026, 12, 1)) == (date(2026, 11, 1), date(2026, 11, 30))


def add_appointments(db_session, barber, service, day, schedule):
    with db_session() as db:
        for hour, minute, status in schedule:
            start = datetime(day.year, day.month, day.day, hour, minute, tzinfo=settings.tz)
            db.add(
                Appointment(
                    barber_id=barber["id"],
                    service_id=service["id"],
                    customer_name="Cliente",
                    customer_email="cliente@example.com",
                    start_at=start,
                    end_at=start + timedelta(minutes=30),
                    status=status,
                )
            )
        db.commit()

