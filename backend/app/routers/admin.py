from typing import Annotated

from fastapi import APIRouter, Query

from app.auth import AdminOnly
from app.database import DbSession
from app.schemas.stats import StatsResponse
from app.stats import Period, build_stats

router = APIRouter(prefix="/admin", tags=["admin"], dependencies=[AdminOnly])


@router.get("/stats", response_model=StatsResponse)
def get_stats(db: DbSession, period: Annotated[Period, Query()] = "week"):
    """Revenue, attendance, occupancy, team and top services for today, this week or month."""
    return build_stats(db, period)
