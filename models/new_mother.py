from sqlalchemy import Column, Integer, String, Date, DateTime, Float, ForeignKey
from sqlalchemy.sql import func
from core.database import Base

class BabyProfile(Base):
    __tablename__ = "baby_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    baby_name = Column(String, nullable=False)
    date_of_birth = Column(Date, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class PostpartumMoodLog(Base):
    __tablename__ = "postpartum_mood_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    date = Column(Date, server_default=func.current_date())
    mood_score = Column(Integer, nullable=False)   # 1-10
    sleep_hours = Column(Float, nullable=True)
    notes = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())