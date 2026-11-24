from datetime import date
from decimal import Decimal

from pydantic import BaseModel


class PeriodTotals(BaseModel):
    revenue: Decimal  # completed appointments only
    completed: int
    no_shows: int
    occupancy: int  # % of working time booked


class DayRevenue(BaseModel):
    date: date
    revenue: Decimal


class BarberStats(BaseModel):
    barber_id: int
    name: str
    appointments: int
    revenue: Decimal
    occupancy: int


class ServiceStats(BaseModel):
    service_id: int
    name: str
    appointments: int
    value: Decimal  # appointments × price


class StatsResponse(BaseModel):
    period: str
    start: date
    end: date
    current: PeriodTotals
    previous: PeriodTotals
    week: list[DayRevenue]
    team: list[BarberStats]
    top_services: list[ServiceStats]
