from datetime import datetime, timedelta

from tests.test_availability import book, local_iso


def test_create_appointment_computes_end_time(client, barber, service, next_monday):
    response = book(client, barber, service, local_iso(next_monday, 9, 30))
    assert response.status_code == 201
    body = response.json()
    start, end = datetime.fromisoformat(body["start_at"]), datetime.fromisoformat(body["end_at"])
    assert end - start == timedelta(minutes=30)
    assert body["status"] == "pending"


def test_overlapping_appointment_is_rejected(client, barber, service, next_monday):
    assert book(client, barber, service, local_iso(next_monday, 10)).status_code == 201
    response = book(client, barber, service, local_iso(next_monday, 10, 15))
    assert response.status_code == 409
    assert "already booked" in response.json()["detail"]


def test_outside_working_hours_and_past_are_rejected(client, barber, service, next_monday):
    # Ends at 12:15, after closing time
    assert book(client, barber, service, local_iso(next_monday, 11, 45)).status_code == 409
    assert book(client, barber, service, local_iso(next_monday, 8)).status_code == 409
    last_monday = next_monday - timedelta(weeks=2)
    assert book(client, barber, service, local_iso(last_monday, 10)).status_code == 409


def test_inactive_barber_cannot_be_booked(client, barber, service, next_monday):
    client.delete(f"/api/barbers/{barber['id']}")
    assert book(client, barber, service, local_iso(next_monday, 10)).status_code == 404


def test_status_transitions(client, barber, service, next_monday):
    appointment = book(client, barber, service, local_iso(next_monday, 10)).json()
    url = f"/api/appointments/{appointment['id']}/status"

    assert client.patch(url, json={"status": "completed"}).status_code == 409
    assert client.patch(url, json={"status": "confirmed"}).json()["status"] == "confirmed"
    assert client.patch(url, json={"status": "completed"}).json()["status"] == "completed"
    assert client.patch(url, json={"status": "cancelled"}).status_code == 409


def test_list_appointments_filters_by_day_and_status(client, barber, service, next_monday):
    book(client, barber, service, local_iso(next_monday, 9))
    later = book(client, barber, service, local_iso(next_monday + timedelta(weeks=1), 9)).json()
    client.patch(f"/api/appointments/{later['id']}/status", json={"status": "cancelled"})

    by_day = client.get("/api/appointments", params={"day": next_monday.isoformat()}).json()
    assert len(by_day) == 1
    cancelled = client.get("/api/appointments", params={"status": "cancelled"}).json()
    assert [a["id"] for a in cancelled] == [later["id"]]
    assert (
        client.get(
            "/api/appointments", params={"day": (next_monday + timedelta(days=1)).isoformat()}
        ).json()
        == []
    )
