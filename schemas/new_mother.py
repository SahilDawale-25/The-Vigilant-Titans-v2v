from pydantic import BaseModel
from datetime import date
from typing import Optional

class BabyProfileCreate(BaseModel):
    baby_name: str
    date_of_birth: date

class PostpartumMoodCreate(BaseModel):
    mood_score: int
    sleep_hours: Optional[float] = None
    notes: Optional[str] = None