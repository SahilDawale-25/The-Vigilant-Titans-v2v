from pydantic import BaseModel
from typing import Optional

class EmergencyContactCreate(BaseModel):
    contact_name: str
    relationship: Optional[str] = None
    phone_number: str