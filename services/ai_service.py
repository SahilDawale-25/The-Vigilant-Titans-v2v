import os
from groq import Groq
from core.config import GROQ_API_KEY

client = Groq(api_key=GROQ_API_KEY)
MODEL_NAME = "llama-3.3-70b-versatile"


def generate_cycle_insight(cycle_history: list):
    """
    cycle_history: list of dicts jasa [{"start_date": "...", "symptoms": "..."}]
    """
    prompt = f"""
    You are a supportive women's wellness assistant, not a doctor.
    Here is a user's recent menstrual cycle history: {cycle_history}

    Based on this data:
    1. Give a short, warm, 2-3 sentence insight about their cycle pattern.
    2. Suggest one practical, gentle wellness tip (rest, nutrition, or self-care).
    3. Never diagnose any medical condition. Never mention specific diseases.
    4. If symptoms look severe or unusual, gently suggest consulting a doctor.

    Keep the tone caring and concise. Do not use medical jargon.
    """

    response = client.chat.completions.create(
        model=MODEL_NAME,
        messages=[{"role": "user", "content": prompt}],
    )
    return response.choices[0].message.content


def generate_monthly_summary(cycle_count, avg_mood, burnout_score):
    prompt = f"""
    You are a supportive wellness assistant writing a brief monthly summary for a user's health report.

    Data:
    - Number of cycle logs this month: {cycle_count}
    - Average mood score: {avg_mood}/10
    - Burnout risk score: {burnout_score}/100

    Write a warm, encouraging 3-4 sentence summary of their overall wellness this month.
    Include one gentle, practical suggestion for the month ahead.
    Never diagnose. Never mention specific diseases.
    """
    response = client.chat.completions.create(
        model=MODEL_NAME,
        messages=[{"role": "user", "content": prompt}],
    )
    return response.choices[0].message.content


def generate_health_twin_insight(profile_data: dict, wellness_score: int, risk_trends: list):
    prompt = f"""
    You are a supportive AI wellness assistant creating a "Health Twin" summary for a woman
    based on her lifestyle data. You must NEVER diagnose any medical condition or name any disease.

    Profile data: {profile_data}
    Wellness Score: {wellness_score}/100
    Detected lifestyle patterns: {risk_trends}

    Write:
    1. A warm 2-3 sentence overview of her current wellness state.
    2. Two specific, practical preventive lifestyle recommendations (sleep, exercise, nutrition, or stress management).
    3. End with a gentle reminder that this is general wellness guidance, not medical advice.

    Keep the total response under 150 words. Do not use clinical or diagnostic language.
    """
    response = client.chat.completions.create(
        model=MODEL_NAME,
        messages=[{"role": "user", "content": prompt}],
    )
    return response.choices[0].message.content