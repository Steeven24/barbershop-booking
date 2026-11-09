import logging

import pytest

from app import email
from app.config import settings
from tests.test_availability import book, local_iso


@pytest.fixture
def outbox(monkeypatch):
    sent = []
    monkeypatch.setattr("app.routers.appointments.send_email", sent.append)
    return sent


def set_status(client, appointment, status):
    return client.patch(f"/api/appointments/{appointment['id']}/status", json={"status": status})


def test_booking_sends_received_email(public_client, outbox, barber, service, next_monday):
    book(public_client, barber, service, local_iso(next_monday, 10))

    assert len(outbox) == 1
    message = outbox[0]
    assert message["To"] == "ana@example.com"
    assert message["Subject"].startswith("Recibimos tu reserva")
    body = message.get_body(("plain",)).get_content()
    assert "Haircut" in body and "Carlos" in body and "a las 10:00" in body


def test_status_changes_notify_only_confirm_and_cancel(
    client, outbox, barber, service, next_monday
):
    first = book(client, barber, service, local_iso(next_monday, 9)).json()
    second = book(client, barber, service, local_iso(next_monday, 10)).json()
    outbox.clear()

    set_status(client, first, "confirmed")
    set_status(client, first, "completed")
    set_status(client, second, "cancelled")

    subjects = [m["Subject"].split(" · ")[0] for m in outbox]
    assert subjects == ["Tu cita está confirmada", "Tu cita fue cancelada"]


def test_send_email_without_smtp_only_logs(monkeypatch, caplog):
    monkeypatch.setattr(settings, "smtp_host", None)
    with caplog.at_level(logging.INFO):
        email.send_email(email.build_message("a@example.com", "Hi", "Body"))
    assert "SMTP_HOST not set" in caplog.text


def test_smtp_failure_does_not_raise(monkeypatch, caplog):
    # Nothing listens on port 1, so the connection is refused
    monkeypatch.setattr(settings, "smtp_host", "127.0.0.1")
    monkeypatch.setattr(settings, "smtp_port", 1)
    email.send_email(email.build_message("a@example.com", "Hi", "Body"))
    assert "Could not send email" in caplog.text
