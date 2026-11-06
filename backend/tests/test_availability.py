from datetime import datetime, time, timedelta

from app.config import settings


def local_iso(day, hour, minute=0):
    return datetime.combine(day, time(hour, minute), tzinfo=settings.tz).isoformat()


def get_slots(client, barber, service, day):
    params = {"barber_id": barber["id"], "service_id": service["id"], "day": day.isoformat()}
    response = client.get("/api/availability", params=params)
    assert response.status_code == 200
    return [datetime.fromisoformat(s["start_at"]).astimezone(settings.tz) for s in response.json()]


def book(client, barber, service, start_at):
    payload = {
        "barber_id": barber["id"],
        "service_id": service["id"],
        "customer_name": "Ana",
        "customer_email": "ana@example.com",
        "start_at": start_at,
    }
    return client.post("/api/appointments", json=payload)


def test_slots_cover_working_hours(client, barber, service, next_monday):
    slots = get_slots(client, barber, service, next_monday)
    # 09:00 to 11:30 every 15 minutes, last one ends exactly at closing time
    assert len(slots) == 11
    assert slots[0].time() == time(9, 0)
    assert slots[-1].time() == time(11, 30)


def test_no_slots_on_day_off(client, barber, service, next_monday):
    tuesday = next_monday + timedelta(days=1)
    assert get_slots(client, barber, service, tuesday) == []


def test_booked_time_is_removed_from_slots(client, barber, service, next_monday):
    assert book(client, barber, service, local_iso(next_monday, 10)).status_code == 201

    times = {slot.time() for slot in get_slots(client, barber, service, next_monday)}
    assert {time(9, 45), time(10, 0), time(10, 15)}.isdisjoint(times)
    assert {time(9, 30), time(10, 30)} <= times


def test_cancelled_appointment_frees_the_slot(client, barber, service, next_monday):
    appointment = book(client, barber, service, local_iso(next_monday, 10)).json()
    client.patch(f"/api/appointments/{appointment['id']}/status", json={"status": "cancelled"})

    assert len(get_slots(client, barber, service, next_monday)) == 11
