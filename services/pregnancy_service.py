from datetime import date

def calculate_current_week(due_date: date):
    """
    Pregnancy is ~40 weeks. Due date - 280 days = conception approx.
    Current week = 40 - (weeks remaining until due date)
    """
    today = date.today()
    days_remaining = (due_date - today).days
    weeks_remaining = days_remaining / 7
    current_week = max(1, min(40, round(40 - weeks_remaining)))
    return current_week


def get_closest_week_data(current_week: int, week_data: dict):
    """
    Dataset madhe sagle exact weeks nahiyet, tar saglyat javal chi week data return karto.
    """
    available_weeks = sorted(week_data.keys())
    closest = min(available_weeks, key=lambda w: abs(w - current_week))
    return closest, week_data[closest]