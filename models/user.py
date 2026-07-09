from sqlalchemy import Column, Integer, String, Date, DateTime, ForeignKey, Float
from sqlalchemy.sql import func
from core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    dob = Column(Date, nullable=True)
    age_bracket = Column(String, nullable=True)      # e.g. "teen", "adult", "pregnant", "new_mother", "menopause"
    life_stage = Column(String, nullable=True)
    preferred_language = Column(String, default="en")
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class HealthProfile(Base):
    __tablename__ = "health_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    height_cm = Column(Float, nullable=True)
    weight_kg = Column(Float, nullable=True)
    base_conditions = Column(String, nullable=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())