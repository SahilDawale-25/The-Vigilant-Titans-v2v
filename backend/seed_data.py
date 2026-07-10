"""
Ha script tumcha logged-in user sathi 2-3 mahinyanche fake
cycle, mood, ani stress logs generate karto — demo sathi charts
poorna bharlele disण्यासाठी.

Run karण्यापूर्वी: tumcha email khali `USER_EMAIL` madhe takva.
"""

import random
from datetime import date, timedelta
from core.database import SessionLocal
from models.user import User
from models.cycle import CycleLog
from models.wellness import MoodLog, StressLog

USER_EMAIL = "sahil12@test.com"   # <-- ithe tumcha actual signup केलेला email takva

db = SessionLocal()

user = db.query(User).filter(User.email == USER_EMAIL).first()

if not user:
    print(f"User with email {USER_EMAIL} not found. Please signup first with this email.")
else:
    today = date.today()

    # ---- Cycle Logs (last 3 cycles, ~28 days apart) ----
    for i in range(3):
        start = today - timedelta(days=28 * (i + 1))
        end = start + timedelta(days=5)
        log = CycleLog(
            user_id=user.id,
            start_date=start,
            end_date=end,
            flow_intensity=random.choice(["light", "medium", "heavy"]),
            symptoms=random.choice(["cramps", "bloating", "headache", "fatigue", "none"]),
        )
        db.add(log)

    # ---- Mood Logs (last 30 days) ----
    moods = [("😊", 9), ("🙂", 7), ("😐", 5), ("😔", 3), ("😢", 1)]
    for i in range(30):
        emoji, score = random.choice(moods)
        log = MoodLog(
            user_id=user.id,
            mood_emoji=emoji,
            mood_score=score,
            notes=None,
        )
        db.add(log)

    # ---- Stress Logs (last 30 days) ----
    for i in range(30):
        log = StressLog(
            user_id=user.id,
            stress_rating=random.randint(2, 8),
            sleep_hours=round(random.uniform(5, 9), 1),
            workload_rating=random.randint(3, 9),
        )
        db.add(log)

    db.commit()
    print(f"Seed data successfully added for {USER_EMAIL}!")

db.close()