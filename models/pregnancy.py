from sqlalchemy import Column, Integer, String, Date, DateTime, Boolean, ForeignKey
from sqlalchemy.sql import func
from core.database import Base

class PregnancyProfile(Base):
    __tablename__ = "pregnancy_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    due_date = Column(Date, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class MedicineReminder(Base):
    __tablename__ = "medicine_reminders"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    medicine_name = Column(String, nullable=False)
    time_of_day = Column(String, nullable=False)   # "morning", "afternoon", "night"
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())