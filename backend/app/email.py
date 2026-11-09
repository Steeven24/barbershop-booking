import logging
import smtplib
from email.message import EmailMessage

from app.config import settings

logger = logging.getLogger(__name__)


def build_message(to: str, subject: str, text: str, html: str | None = None) -> EmailMessage:
    message = EmailMessage()
    message["From"] = f"{settings.business_name} <{settings.email_from}>"
    message["To"] = to
    message["Subject"] = subject
    message.set_content(text)
    if html:
        message.add_alternative(html, subtype="html")
    return message


def send_email(message: EmailMessage) -> None:
    """Send through SMTP, or log the email when SMTP isn't configured (local dev)."""
    if not settings.smtp_host:
        logger.info(
            "Email not sent (SMTP_HOST not set): %s -> %s", message["Subject"], message["To"]
        )
        return
    try:
        with smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=10) as smtp:
            if settings.smtp_starttls:
                smtp.starttls()
            if settings.smtp_user and settings.smtp_password:
                smtp.login(settings.smtp_user, settings.smtp_password)
            smtp.send_message(message)
    except (OSError, smtplib.SMTPException):
        # A failed notification must never break a booking: log it and move on
        logger.exception("Could not send email to %s", message["To"])
