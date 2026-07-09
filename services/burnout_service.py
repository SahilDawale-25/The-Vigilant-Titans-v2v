def calculate_burnout_score(mood_logs: list, stress_logs: list):
    """
    Simple weighted formula:
    - Low mood score → higher burnout
    - High stress rating → higher burnout
    - Low sleep hours → higher burnout
    Returns score out of 100 (higher = more burnout risk)
    """
    if not mood_logs and not stress_logs:
        return 0, "unknown", "Log your mood and stress a few times to see your burnout risk."

    avg_mood = sum(m.mood_score for m in mood_logs) / len(mood_logs) if mood_logs else 5
    avg_stress = sum(s.stress_rating for s in stress_logs) / len(stress_logs) if stress_logs else 5
    avg_sleep = (
        sum(s.sleep_hours for s in stress_logs if s.sleep_hours) / len([s for s in stress_logs if s.sleep_hours])
        if any(s.sleep_hours for s in stress_logs) else 7
    )

    # Normalize: low mood + high stress + low sleep = high burnout
    mood_component = (10 - avg_mood) * 4        # max 40
    stress_component = avg_stress * 4            # max 40
    sleep_component = max(0, (8 - avg_sleep)) * 2.5  # max ~20

    burnout_score = min(100, round(mood_component + stress_component + sleep_component))

    if burnout_score < 30:
        risk_level = "low"
        message = "You're doing well! Keep up your current balance of rest and activity."
    elif burnout_score < 60:
        risk_level = "moderate"
        message = "You're showing some signs of stress. Consider prioritizing rest this week."
    else:
        risk_level = "high"
        message = "Your recent patterns suggest high burnout risk. Please consider talking to someone you trust or a professional, and prioritize rest."

    return burnout_score, risk_level, message