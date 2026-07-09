from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional

class CycleLogCreate(BaseModel):
    start_date: date
    end_date: Optional[date] = None
    flow_intensity: Optional[str] = None
    symptoms: Optional[str] = None

class CycleLogResponse(BaseModel):
    id: int
    start_date: date
    end_date: Optional[date]
    flow_intensity: Optional[str]
    symptoms: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True