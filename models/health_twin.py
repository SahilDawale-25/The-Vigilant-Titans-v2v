from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.sql import func
from core.database import Base

class HealthTwinProfile(Base):
    __tablename__ = "health_twin_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True)
    age = Column(Integer, nullable=True)
    height_cm = Column(Float, nullable=True)
    weight_kg = Column(Float, nullable=True)
    avg_sleep_hours = Column(Float, nullable=True)
    avg_stress_level = Column(Integer, nullable=True)     # 1-10
    exercise_frequency = Column(String, nullable=True)     # "none", "1-2/week", "3-4/week", "daily"
    nutrition_quality = Column(String, nullable=True)       # "poor", "average", "good", "excellent"
    reported_symptoms = Column(String, nullable=True)       # comma-separated
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())