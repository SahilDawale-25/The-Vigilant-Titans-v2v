from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.sql import func
from core.database import Base

class UploadedReport(Base):
    __tablename__ = "uploaded_reports"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    file_name = Column(String, nullable=False)
    ai_summary = Column(Text, nullable=True)
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())