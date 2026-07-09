from pydantic import BaseModel
from datetime import date, datetime

class PregnancyProfileCreate(BaseModel):
    due_date: date

class MedicineReminderCreate(BaseModel):
    medicine_name: str
    time_of_day: str