from sqlalchemy import Column, Integer, String, Date, DateTime, ForeignKey
from sqlalchemy.sql import func
from core.database import Base

class CycleLog(Base):
    __tablename__ = "cycle_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=True)
    flow_intensity = Column(String, nullable=True)   # "light", "medium", "heavy"
    symptoms = Column(String, nullable=True)          # comma-separated: "cramps,bloating,headache"
    created_at = Column(DateTime(timezone=True), server_default=func.now())