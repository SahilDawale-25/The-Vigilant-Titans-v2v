from datetime import date
from data.vaccination_data import VACCINATION_SCHEDULE


def get_vaccination_status(date_of_birth: date):
    today = date.today()
    baby_age_weeks = (today - date_of_birth).days // 7

    schedule_with_status = []
    for item in VACCINATION_SCHEDULE:
        due_date = date_of_birth + (item["age_weeks"] * 7) * (today - today)  # placeholder, fixed below
        due_date = date_of_birth.toordinal() + (item["age_weeks"] * 7)
        from datetime import date as date_cls
        due_date = date_cls.fromordinal(due_date)

        status = "upcoming"
        if baby_age_weeks >= item["age_weeks"]:
            status = "due_or_completed"

        schedule_with_status.append({
            "vaccine": item["vaccine"],
            "due_date": str(due_date),
            "status": status,
        })

    return baby_age_weeks, schedule_with_status