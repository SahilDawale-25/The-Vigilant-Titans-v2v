from datetime import date, timedelta


def calculate_next_period_prediction(cycle_logs: list):
    """
    Last 3 cycles cha average length vaparून next period date predict karto.
    """
    if len(cycle_logs) < 2:
        return None

    # cycle_logs already start_date descending order madhe yeतात (recent first)
    sorted_logs = sorted(cycle_logs, key=lambda x: x.start_date, reverse=True)
    gaps = []
    for i in range(len(sorted_logs) - 1):
        gap = (sorted_logs[i].start_date - sorted_logs[i + 1].start_date).days
        if 15 <= gap <= 45:  # reasonable cycle length filter
            gaps.append(gap)

    if not gaps:
        return None

    avg_cycle_length = sum(gaps) / len(gaps)
    last_period_start = sorted_logs[0].start_date
    predicted_next = last_period_start + timedelta(days=round(avg_cycle_length))

    return {
        "predicted_date": str(predicted_next),
        "days_until": (predicted_next - date.today()).days,
        "avg_cycle_length": round(avg_cycle_length),
    }


def build_reminder_list(cycle_prediction, medicine_reminders, vaccination_schedule, today=None):
    """
    Sagle sources cha data ekatra karun ek sorted reminder list banवतो.
    """
    if today is None:
        today = date.today()

    reminders = []

    # Period prediction reminder
    if cycle_prediction:
        days_until = cycle_prediction["days_until"]
        if -2 <= days_until <= 7:  # jval ale asel tarach dakhva
            reminders.append({
                "type": "period",
                "title": "Your period is expected soon" if days_until >= 0 else "Your period may be due",
                "date": cycle_prediction["predicted_date"],
                "days_until": days_until,
                "priority": "high" if 0 <= days_until <= 3 else "medium",
            })

    # Medicine reminders (pregnancy)
    for med in medicine_reminders:
        reminders.append({
            "type": "medicine",
            "title": f"Take {med.medicine_name} ({med.time_of_day})",
            "date": str(today),
            "days_until": 0,
            "priority": "high",
        })

    # Vaccination reminders (baby)
    for vac in vaccination_schedule:
        if vac["status"] == "due_or_completed":
            continue
        # Sirf pudhchya 30 divsat yenari vaccine dakhva
        try:
            from datetime import datetime
            vac_date = datetime.strptime(vac["due_date"], "%Y-%m-%d").date()
            days_until = (vac_date - today).days
            if 0 <= days_until <= 30:
                reminders.append({
                    "type": "vaccination",
                    "title": f"Upcoming vaccine: {vac['vaccine']}",
                    "date": vac["due_date"],
                    "days_until": days_until,
                    "priority": "medium",
                })
        except Exception:
            continue

    # Sort: sagله jvलच्या date pahile
    reminders.sort(key=lambda r: r["days_until"])
    return reminders