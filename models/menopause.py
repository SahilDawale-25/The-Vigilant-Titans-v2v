from sqlalchemy import Column, Integer, String, Date, DateTime, ForeignKey
from sqlalchemy.sql import func
from core.database import Base

class MenopauseLog(Base):
    __tablename__ = "menopause_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    date = Column(Date, server_default=func.current_date())
    symptoms = Column(String, nullable=True)     # comma-separated: "hot_flashes,mood_swings,insomnia"
    severity = Column(Integer, nullable=False)    # 1-10
    created_at = Column(DateTime(timezone=True), server_default=func.now())