from datetime import datetime

from pydantic import AwareDatetime, BaseModel, ConfigDict, EmailStr, Field

from app.models import AppointmentStatus


class AppointmentCreate(BaseModel):
    barber_id: int
    service_id: int
    customer_name: str = Field(min_length=2, max_length=100)
    customer_email: EmailStr
    customer_phone: str | None = Field(default=None, max_length=20)
    start_at: AwareDatetime
    notes: str | None = Field(default=None, max_length=500)


class AppointmentStatusUpdate(BaseModel):
    status: AppointmentStatus


class AppointmentRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    barber_id: int
    service_id: int
    customer_name: str
    customer_email: str
    customer_phone: str | None
    start_at: datetime
    end_at: datetime
    status: AppointmentStatus
    notes: str | None
    created_at: datetime


class AvailableSlot(BaseModel):
    start_at: datetime
    end_at: datetime
