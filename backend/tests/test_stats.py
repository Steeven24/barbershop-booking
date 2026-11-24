from datetime import date, datetime, timedelta
from decimal import Decimal

from app.config import settings
from app.models import Appointment, AppointmentStatus
from app.stats import build_stats, period_range, previous_range

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


def test_day_stats_count_only_relevant_appointments(db_session, barber, service):
    # The fixture barber works Mondays 09:00-12:00 (180 minutes); the service is $8.50
    add_appointments(db_session, barber, service, MONDAY, [
        (9, 0, S.COMPLETED), (9, 30, S.COMPLETED), (10, 0, S.NO_SHOW),
        (10, 30, S.CANCELLED), (11, 0, S.PENDING),
    ])  # fmt: skip
    add_appointments(db_session, barber, service, MONDAY - timedelta(days=7), [(9, 0, S.COMPLETED)])

    with db_session() as db:
        stats = build_stats(db, "day", today=MONDAY)

    assert stats.current.revenue == Decimal("17.00")
    assert stats.current.completed == 2
    assert stats.current.no_shows == 1
    # Booked = 2 completed + 1 pending = 90 of 180 minutes
    assert stats.current.occupancy == 50
    assert stats.previous.revenue == Decimal("8.50")
    assert stats.previous.completed == 1

    [team] = stats.team
    assert (team.appointments, team.revenue, team.occupancy) == (3, Decimal("17.00"), 50)
    [top] = stats.top_services
    assert (top.name, top.appointments, top.value) == ("Haircut", 3, Decimal("25.50"))
    assert [d.revenue for d in stats.week] == [Decimal("17.00")] + [Decimal(0)] * 6

    # On a Monday only that day of the week has elapsed, so the occupancy matches
    with db_session() as db:
        assert build_stats(db, "week", today=MONDAY).current.occupancy == 50


def test_stats_endpoint_requires_admin(public_client, client):
    assert public_client.get("/api/admin/stats").status_code == 401
    response = client.get("/api/admin/stats", params={"period": "month"})
    assert response.status_code == 200
    body = response.json()
    assert body["period"] == "month"
    assert set(body) >= {"current", "previous", "week", "team", "top_services"}
    assert client.get("/api/admin/stats", params={"period": "year"}).status_code == 422
