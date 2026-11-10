from datetime import time

from pydantic import BaseModel, ConfigDict, Field, model_validator


class WorkingHoursBase(BaseModel):
    weekday: int = Field(ge=0, le=6, description="0 = Monday ... 6 = Sunday")
    start_time: time
    end_time: time

    @model_validator(mode="after")
    def check_range(self):
        if self.start_time >= self.end_time:
            raise ValueError("start_time must be before end_time")
        return self


class WorkingHoursRead(WorkingHoursBase):
    model_config = ConfigDict(from_attributes=True)

    id: int


def ensure_unique_weekdays(items: list[WorkingHoursBase]) -> list[WorkingHoursBase]:
    weekdays = [item.weekday for item in items]
    if len(weekdays) != len(set(weekdays)):
        raise ValueError("Each weekday can only appear once")
    return items
