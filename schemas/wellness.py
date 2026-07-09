from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional

class MoodLogCreate(BaseModel):
    mood_emoji: str
    mood_score: int
    notes: Optional[str] = None

class StressLogCreate(BaseModel):
    stress_rating: int
    sleep_hours: Optional[float] = None
    workload_rating: Optional[int] = None

class BurnoutResponse(BaseModel):
    burnout_score: int
    risk_level: str
    message: str