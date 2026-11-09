from email.message import EmailMessage
from html import escape

from app.config import settings
from app.email import build_message
from app.models import Appointment, AppointmentStatus

WEEKDAYS = ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"]
MONTHS = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto",
          "septiembre", "octubre", "noviembre", "diciembre"]  # fmt: skip

SUBJECTS = {
    AppointmentStatus.PENDING: "Recibimos tu reserva",
    AppointmentStatus.CONFIRMED: "Tu cita está confirmada",
    AppointmentStatus.CANCELLED: "Tu cita fue cancelada",
}
INTROS = {
    AppointmentStatus.PENDING: "Recibimos tu reserva. Te avisaremos cuando la confirmemos.",
    AppointmentStatus.CONFIRMED: "¡Tu cita está confirmada! Te esperamos.",
    AppointmentStatus.CANCELLED: "Tu cita fue cancelada. Si fue un error, reserva de nuevo.",
}


def format_when(appointment: Appointment) -> str:
    start = appointment.start_at.astimezone(settings.tz)
    return (
        f"{WEEKDAYS[start.weekday()]} {start.day} de {MONTHS[start.month - 1]} a las {start:%H:%M}"
    )


def appointment_email(appointment: Appointment) -> EmailMessage | None:
    """Email for the appointment's current status, or None if that status isn't notified."""
    if appointment.status not in SUBJECTS:
        return None
    first_name = appointment.customer_name.split()[0]
    details = [
        ("Servicio", appointment.service.name),
        ("Barbero", appointment.barber.name),
        ("Fecha", format_when(appointment)),
    ]
    intro = INTROS[appointment.status]

    text = "\n".join(
        [f"Hola {first_name},", "", intro, ""]
        + [f"{label}: {value}" for label, value in details]
        + ["", settings.business_name]
    )
    rows = "".join(
        f'<tr><td style="color:#6b6258;padding:4px 16px 4px 0">{label}</td>'
        f"<td>{escape(value)}</td></tr>"
        for label, value in details
    )
    html = (
        '<div style="font-family:Arial,sans-serif;color:#1f1b16;max-width:480px">'
        f"<p>Hola {escape(first_name)},</p><p>{intro}</p>"
        f'<table style="border-top:3px solid #7a2a26;padding-top:8px">{rows}</table>'
        f'<p style="color:#a8834a">{escape(settings.business_name)}</p></div>'
    )
    subject = f"{SUBJECTS[appointment.status]} · {settings.business_name}"
    return build_message(appointment.customer_email, subject, text, html)
