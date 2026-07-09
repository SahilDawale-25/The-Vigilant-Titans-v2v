from pydantic import BaseModel
from typing import Optional

class HealthTwinInput(BaseModel):
    age: int
    height_cm: float
    weight_kg: float
    avg_sleep_hours: float
    avg_stress_level: int
    exercise_frequency: str
    nutrition_quality: str
    reported_symptoms: Optional[str] = None