from pydantic import BaseModel
from typing import Optional

class MenopauseLogCreate(BaseModel):
    symptoms: Optional[str] = None
    severity: int