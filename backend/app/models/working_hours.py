from datetime import time

from sqlalchemy import CheckConstraint, ForeignKey, SmallInteger, Time, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class WorkingHours(Base):
    """Weekly schedule of a barber. weekday: 0 = Monday ... 6 = Sunday."""

    __tablename__ = "working_hours"
    __table_args__ = (
        UniqueConstraint("barber_id", "weekday", name="uq_working_hours_barber_weekday"),
        CheckConstraint("weekday BETWEEN 0 AND 6", name="ck_working_hours_weekday"),
        CheckConstraint("start_time < end_time", name="ck_working_hours_range"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    barber_id: Mapped[int] = mapped_column(ForeignKey("barbers.id", ondelete="CASCADE"))
    weekday: Mapped[int] = mapped_column(SmallInteger)
    start_time: Mapped[time] = mapped_column(Time)
    end_time: Mapped[time] = mapped_column(Time)

    barber: Mapped["Barber"] = relationship(back_populates="working_hours")  # noqa: F821
