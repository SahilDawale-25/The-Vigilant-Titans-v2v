def calculate_wellness_score(data: dict):
    """
    Transparent weighted formula — explainable to judges, not a black box.
    Returns score out of 100 + component breakdown.
    """
    score = 100

    # Sleep component (ideal 7-9 hrs)
    sleep = data["avg_sleep_hours"]
    if sleep < 5:
        score -= 20
    elif sleep < 7:
        score -= 10
    elif sleep > 9:
        score -= 5

    # Stress component (1-10, lower is better)
    stress = data["avg_stress_level"]
    score -= stress * 2  # max -20

    # Exercise component
    exercise_map = {"none": -15, "1-2/week": -5, "3-4/week": 0, "daily": 5}
    score += exercise_map.get(data["exercise_frequency"], -10)

    # Nutrition component
    nutrition_map = {"poor": -15, "average": -5, "good": 0, "excellent": 5}
    score += nutrition_map.get(data["nutrition_quality"], -5)

    # BMI-based component (informational only, never diagnostic language used)
    height_m = data["height_cm"] / 100
    bmi = data["weight_kg"] / (height_m ** 2)
    if bmi < 18.5 or bmi > 30:
        score -= 10
    elif bmi > 25:
        score -= 5

    score = max(0, min(100, round(score)))

    return score, round(bmi, 1)


def generate_risk_trends(score: int, data: dict):
    """
    Rule-based 'risk trend' flags — framed as lifestyle patterns, never diagnoses.
    """
    trends = []

    if data["avg_sleep_hours"] < 6:
        trends.append({"category": "Sleep", "trend": "Below-recommended sleep duration detected", "level": "moderate"})
    if data["avg_stress_level"] >= 7:
        trends.append({"category": "Stress", "trend": "Elevated stress pattern over recent logs", "level": "high"})
    if data["exercise_frequency"] == "none":
        trends.append({"category": "Activity", "trend": "Low physical activity pattern", "level": "moderate"})
    if data["nutrition_quality"] == "poor":
        trends.append({"category": "Nutrition", "trend": "Nutrition quality below recommended levels", "level": "moderate"})

    if not trends:
        trends.append({"category": "Overall", "trend": "No concerning lifestyle patterns detected", "level": "low"})

    return trends