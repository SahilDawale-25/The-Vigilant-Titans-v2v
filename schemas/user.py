from pydantic import BaseModel, EmailStr
from datetime import date, datetime
from typing import Optional

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    dob: Optional[date] = None
    age_bracket: Optional[str] = None
    preferred_language: Optional[str] = "en"

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    age_bracket: Optional[str]
    preferred_language: str
    created_at: datetime

    class Config:
        from_attributes = True