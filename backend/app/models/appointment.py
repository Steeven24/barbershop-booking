import enum
from datetime import datetime

from sqlalchemy import CheckConstraint, DateTime, Enum, ForeignKey, Index, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
from app.models.base import TimestampMixin


class AppointmentStatus(enum.StrEnum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    NO_SHOW = "no_show"


class Appointment(TimestampMixin, Base):
    __tablename__ = "appointments"
    __table_args__ = (
        CheckConstraint("start_at < end_at", name="ck_appointments_range"),
        Index("ix_appointments_barber_start", "barber_id", "start_at"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    barber_id: Mapped[int] = mapped_column(ForeignKey("barbers.id", ondelete="RESTRICT"))
    service_id: Mapped[int] = mapped_column(ForeignKey("services.id", ondelete="RESTRICT"))
    customer_name: Mapped[str] = mapped_column(String(100))
    customer_email: Mapped[str] = mapped_column(String(255))
    customer_phone: Mapped[str | None] = mapped_column(String(20))
    start_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    end_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    status: Mapped[AppointmentStatus] = mapped_column(
        Enum(
            AppointmentStatus,
            name="appointment_status",
            values_callable=lambda e: [m.value for m in e],
        ),
        default=AppointmentStatus.PENDING,
    )
    notes: Mapped[str | None] = mapped_column(Text)

    barber: Mapped["Barber"] = relationship()  # noqa: F821
    service: Mapped["Service"] = relationship()  # noqa: F821
