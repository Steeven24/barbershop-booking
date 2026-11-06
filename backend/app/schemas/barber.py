from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class BarberBase(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    phone: str | None = Field(default=None, max_length=20)
    photo_url: str | None = Field(default=None, max_length=500)


class BarberCreate(BarberBase):
    pass


class BarberUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=100)
    phone: str | None = Field(default=None, max_length=20)
    photo_url: str | None = Field(default=None, max_length=500)
    is_active: bool | None = None


class BarberRead(BarberBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    is_active: bool
    created_at: datetime
