from sqlalchemy import Column, Integer, String, Date, DateTime, Float, ForeignKey
from sqlalchemy.sql import func
from core.database import Base

class MoodLog(Base):
    __tablename__ = "mood_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    date = Column(Date, server_default=func.current_date())
    mood_emoji = Column(String, nullable=False)      # "😊", "😐", "😢" etc
    mood_score = Column(Integer, nullable=False)      # 1-10
    notes = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class StressLog(Base):
    __tablename__ = "stress_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    date = Column(Date, server_default=func.current_date())
    stress_rating = Column(Integer, nullable=False)   # 1-10
    sleep_hours = Column(Float, nullable=True)
    workload_rating = Column(Integer, nullable=True)  # 1-10
    created_at = Column(DateTime(timezone=True), server_default=func.now())