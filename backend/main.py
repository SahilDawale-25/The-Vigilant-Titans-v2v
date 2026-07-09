from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text

from core.database import get_db, engine, Base
from models.user import User, HealthProfile
from schemas.user import UserCreate, UserResponse

from core.firebase_auth import verify_token

from models.cycle import CycleLog
from schemas.cycle import CycleLogCreate, CycleLogResponse
from services.ai_service import generate_cycle_insight
from datetime import date


from models.wellness import MoodLog, StressLog
from schemas.wellness import MoodLogCreate, StressLogCreate, BurnoutResponse
from services.burnout_service import calculate_burnout_score


from models.pregnancy import PregnancyProfile, MedicineReminder
from schemas.pregnancy import PregnancyProfileCreate, MedicineReminderCreate
from data.pregnancy_data import PREGNANCY_WEEKS, EMERGENCY_SYMPTOMS
from services.pregnancy_service import calculate_current_week, get_closest_week_data


from services.report_service import generate_monthly_report
from services.ai_service import generate_monthly_summary
from fastapi.responses import FileResponse

from models.new_mother import BabyProfile, PostpartumMoodLog
from schemas.new_mother import BabyProfileCreate, PostpartumMoodCreate
from data.vaccination_data import BREASTFEEDING_TIPS
from services.new_mother_service import get_vaccination_status

from models.menopause import MenopauseLog
from schemas.menopause import MenopauseLogCreate
from data.menopause_data import LIFESTYLE_TIPS, DIET_RECOMMENDATIONS, BONE_HEALTH_INFO, EXERCISE_PLANS

from models.health_twin import HealthTwinProfile
from schemas.health_twin import HealthTwinInput
from services.health_twin_service import calculate_wellness_score, generate_risk_trends
from services.ai_service import generate_health_twin_insight

from fastapi import UploadFile, File
from models.report_analyzer import UploadedReport
from services.report_analyzer_service import extract_text_from_pdf, analyze_report_text


from services.voice_service import generate_voice_response

from data.teen_data import MYTHS_FACTS
import google.generativeai as genai

# Ha line sagle tables (users, health_profiles) database madhe automatically banvel
Base.metadata.create_all(bind=engine)

app = FastAPI(title="HerWellness API")


@app.get("/dashboard/summary")
def dashboard_summary(user_data: dict = Depends(verify_token)):
    # Ata sathi dummy/sample data return karto — pudhe database madhun real data yeईल
    return {
        "wellness_score": 78,
        "trend_data": [
            {"day": "Mon", "mood": 6, "sleep": 7, "stress": 4},
            {"day": "Tue", "mood": 7, "sleep": 6, "stress": 5},
            {"day": "Wed", "mood": 5, "sleep": 8, "stress": 3},
            {"day": "Thu", "mood": 8, "sleep": 7, "stress": 2},
            {"day": "Fri", "mood": 6, "sleep": 6, "stress": 6},
            {"day": "Sat", "mood": 9, "sleep": 9, "stress": 2},
            {"day": "Sun", "mood": 8, "sleep": 8, "stress": 3},
        ],
        "recommendation": "Your sleep improved this week — keep the consistent bedtime routine going!",
        "upcoming_reminders": [
            {"title": "Log today's mood", "type": "daily"},
            {"title": "Monthly report ready in 12 days", "type": "info"},
        ],
    }


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "HerWellness API is running"}

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.get("/db-check")
def db_check(db: Session = Depends(get_db)):
    result = db.execute(text("SELECT 1"))
    return {"database": "connected", "result": result.scalar()}


@app.post("/users", response_model=UserResponse)
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    new_user = User(
        name=user.name,
        email=user.email,
        dob=user.dob,
        age_bracket=user.age_bracket,
        preferred_language=user.preferred_language,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


@app.get("/users/{user_id}", response_model=UserResponse)
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@app.get("/protected")
def protected_route(user_data: dict = Depends(verify_token)):
    return {"message": "You are authenticated!", "uid": user_data["uid"], "email": user_data.get("email")}


@app.post("/cycle/log", response_model=CycleLogResponse)
def log_cycle(
    cycle: CycleLogCreate,
    user_data: dict = Depends(verify_token),
    db: Session = Depends(get_db),
):
    # Firebase uid varun apla internal user shodhaycha ahe
    user = db.query(User).filter(User.email == user_data.get("email")).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found. Please complete signup first.")

    new_log = CycleLog(
        user_id=user.id,
        start_date=cycle.start_date,
        end_date=cycle.end_date,
        flow_intensity=cycle.flow_intensity,
        symptoms=cycle.symptoms,
    )
    db.add(new_log)
    db.commit()
    db.refresh(new_log)
    return new_log


@app.get("/cycle/history")
def get_cycle_history(
    user_data: dict = Depends(verify_token),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.email == user_data.get("email")).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    logs = db.query(CycleLog).filter(CycleLog.user_id == user.id).order_by(CycleLog.start_date.desc()).all()
    return logs


@app.get("/cycle/insight")
def get_cycle_insight(
    user_data: dict = Depends(verify_token),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.email == user_data.get("email")).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    logs = db.query(CycleLog).filter(CycleLog.user_id == user.id).order_by(CycleLog.start_date.desc()).limit(5).all()

    if not logs:
        return {"insight": "Log your cycle a few times to get personalized AI insights!"}

    cycle_history = [
        {
            "start_date": str(log.start_date),
            "symptoms": log.symptoms or "none reported",
            "flow_intensity": log.flow_intensity or "not specified",
        }
        for log in logs
    ]

    insight = generate_cycle_insight(cycle_history)
    return {"insight": insight}


@app.post("/mood/log")
def log_mood(
    mood: MoodLogCreate,
    user_data: dict = Depends(verify_token),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.email == user_data.get("email")).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    new_log = MoodLog(
        user_id=user.id,
        mood_emoji=mood.mood_emoji,
        mood_score=mood.mood_score,
        notes=mood.notes,
    )
    db.add(new_log)
    db.commit()
    db.refresh(new_log)
    return {"message": "Mood logged successfully"}


@app.post("/stress/log")
def log_stress(
    stress: StressLogCreate,
    user_data: dict = Depends(verify_token),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.email == user_data.get("email")).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    new_log = StressLog(
        user_id=user.id,
        stress_rating=stress.stress_rating,
        sleep_hours=stress.sleep_hours,
        workload_rating=stress.workload_rating,
    )
    db.add(new_log)
    db.commit()
    db.refresh(new_log)
    return {"message": "Stress logged successfully"}


@app.get("/burnout/score", response_model=BurnoutResponse)
def get_burnout_score(
    user_data: dict = Depends(verify_token),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.email == user_data.get("email")).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    mood_logs = db.query(MoodLog).filter(MoodLog.user_id == user.id).order_by(MoodLog.created_at.desc()).limit(7).all()
    stress_logs = db.query(StressLog).filter(StressLog.user_id == user.id).order_by(StressLog.created_at.desc()).limit(7).all()

    score, risk, message = calculate_burnout_score(mood_logs, stress_logs)
    return {"burnout_score": score, "risk_level": risk, "message": message}

@app.post("/pregnancy/profile")
def create_pregnancy_profile(
    profile: PregnancyProfileCreate,
    user_data: dict = Depends(verify_token),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.email == user_data.get("email")).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    existing = db.query(PregnancyProfile).filter(PregnancyProfile.user_id == user.id).first()
    if existing:
        existing.due_date = profile.due_date
        db.commit()
        return {"message": "Pregnancy profile updated"}

    new_profile = PregnancyProfile(user_id=user.id, due_date=profile.due_date)
    db.add(new_profile)
    db.commit()
    return {"message": "Pregnancy profile created"}


@app.get("/pregnancy/week-info")
def get_week_info(
    user_data: dict = Depends(verify_token),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.email == user_data.get("email")).first()
    profile = db.query(PregnancyProfile).filter(PregnancyProfile.user_id == user.id).first()

    if not profile:
        raise HTTPException(status_code=404, detail="No pregnancy profile found. Please set your due date first.")

    current_week = calculate_current_week(profile.due_date)
    closest_week, week_info = get_closest_week_data(current_week, PREGNANCY_WEEKS)

    return {
        "current_week": current_week,
        "closest_available_week": closest_week,
        "baby_size": week_info["baby_size"],
        "baby_size_cm": week_info["baby_size_cm"],
        "development": week_info["development"],
        "tip": week_info["tip"],
        "due_date": str(profile.due_date),
    }


@app.get("/pregnancy/emergency-checklist")
def get_emergency_checklist():
    return {"symptoms": EMERGENCY_SYMPTOMS}


@app.post("/pregnancy/medicine-reminder")
def add_medicine_reminder(
    reminder: MedicineReminderCreate,
    user_data: dict = Depends(verify_token),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.email == user_data.get("email")).first()
    new_reminder = MedicineReminder(
        user_id=user.id,
        medicine_name=reminder.medicine_name,
        time_of_day=reminder.time_of_day,
    )
    db.add(new_reminder)
    db.commit()
    return {"message": "Reminder added"}


@app.get("/pregnancy/medicine-reminders")
def get_medicine_reminders(
    user_data: dict = Depends(verify_token),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.email == user_data.get("email")).first()
    reminders = db.query(MedicineReminder).filter(
        MedicineReminder.user_id == user.id, MedicineReminder.is_active == True
    ).all()
    return reminders

@app.get("/teen/myths-facts")
def get_myths_facts():
    return {"items": MYTHS_FACTS}


@app.post("/teen/anonymous-chat")
def anonymous_chat(payload: dict):
    """
    payload: {"question": "..."}
    No auth required — completely anonymous, no user_id stored.
    """
    question = payload.get("question", "")
    if not question:
        raise HTTPException(status_code=400, detail="Question is required")

    model = genai.GenerativeModel("gemini-1.5-flash")
    prompt = f"""
    You are a kind, patient health educator answering a teenager's anonymous question
    about puberty, periods, or general body health.

    Rules:
    - Keep the answer simple, warm, and age-appropriate (12-18 years old).
    - Never diagnose any medical condition.
    - If the question suggests something concerning (severe pain, very heavy bleeding, etc.),
      gently encourage talking to a parent, guardian, or doctor.
    - Keep the answer under 150 words.
    - Never ask for or reference any personal identifying information.

    Question: {question}
    """

    response = model.generate_content(prompt)
    return {"answer": response.text}


@app.get("/reports/monthly/download")
def download_monthly_report(
    user_data: dict = Depends(verify_token),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.email == user_data.get("email")).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    cycle_logs = db.query(CycleLog).filter(CycleLog.user_id == user.id).all()
    mood_logs = db.query(MoodLog).filter(MoodLog.user_id == user.id).all()
    stress_logs = db.query(StressLog).filter(StressLog.user_id == user.id).all()

    burnout_score, _, _ = calculate_burnout_score(mood_logs, stress_logs)
    avg_mood = round(sum(m.mood_score for m in mood_logs) / len(mood_logs), 1) if mood_logs else 0

    ai_summary = generate_monthly_summary(len(cycle_logs), avg_mood, burnout_score)

    file_path = generate_monthly_report(
        user_name=user.name,
        cycle_logs=cycle_logs,
        mood_logs=mood_logs,
        stress_logs=stress_logs,
        burnout_score=burnout_score,
        ai_summary=ai_summary,
    )

    return FileResponse(
        path=file_path,
        media_type="application/pdf",
        filename="HerWellness_Monthly_Report.pdf",
    )

@app.post("/newmother/baby-profile")
def create_baby_profile(
    baby: BabyProfileCreate,
    user_data: dict = Depends(verify_token),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.email == user_data.get("email")).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    new_baby = BabyProfile(user_id=user.id, baby_name=baby.baby_name, date_of_birth=baby.date_of_birth)
    db.add(new_baby)
    db.commit()
    return {"message": "Baby profile created"}


@app.get("/newmother/vaccination-schedule")
def vaccination_schedule(
    user_data: dict = Depends(verify_token),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.email == user_data.get("email")).first()
    baby = db.query(BabyProfile).filter(BabyProfile.user_id == user.id).first()

    if not baby:
        raise HTTPException(status_code=404, detail="No baby profile found. Please add baby's details first.")

    baby_age_weeks, schedule = get_vaccination_status(baby.date_of_birth)
    return {"baby_name": baby.baby_name, "baby_age_weeks": baby_age_weeks, "schedule": schedule}


@app.get("/newmother/breastfeeding-guidance")
def breastfeeding_guidance():
    return {"tips": BREASTFEEDING_TIPS}


@app.post("/newmother/mood-log")
def log_postpartum_mood(
    mood: PostpartumMoodCreate,
    user_data: dict = Depends(verify_token),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.email == user_data.get("email")).first()
    new_log = PostpartumMoodLog(
        user_id=user.id,
        mood_score=mood.mood_score,
        sleep_hours=mood.sleep_hours,
        notes=mood.notes,
    )
    db.add(new_log)
    db.commit()

    # Concerning pattern check — last 5 logs
    recent_logs = db.query(PostpartumMoodLog).filter(
        PostpartumMoodLog.user_id == user.id
    ).order_by(PostpartumMoodLog.created_at.desc()).limit(5).all()

    low_mood_count = sum(1 for log in recent_logs if log.mood_score <= 3)
    supportive_message = None
    if low_mood_count >= 3:
        supportive_message = (
            "We've noticed you've been having a tough time lately. "
            "You're not alone — please consider talking to someone you trust, "
            "or reach out to a healthcare professional. You deserve support too."
        )

    return {"message": "Mood logged", "supportive_message": supportive_message}


@app.post("/menopause/symptom-log")
def log_menopause_symptom(
    log: MenopauseLogCreate,
    user_data: dict = Depends(verify_token),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.email == user_data.get("email")).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    new_log = MenopauseLog(user_id=user.id, symptoms=log.symptoms, severity=log.severity)
    db.add(new_log)
    db.commit()
    return {"message": "Symptom logged successfully"}


@app.get("/menopause/history")
def menopause_history(
    user_data: dict = Depends(verify_token),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.email == user_data.get("email")).first()
    logs = db.query(MenopauseLog).filter(MenopauseLog.user_id == user.id).order_by(MenopauseLog.date.desc()).limit(10).all()
    return logs


@app.get("/menopause/recommendations")
def menopause_recommendations():
    return {
        "lifestyle_tips": LIFESTYLE_TIPS,
        "diet_recommendations": DIET_RECOMMENDATIONS,
        "bone_health_info": BONE_HEALTH_INFO,
        "exercise_plans": EXERCISE_PLANS,
    }

@app.post("/ai/health-twin/generate")
def generate_health_twin(
    profile: HealthTwinInput,
    user_data: dict = Depends(verify_token),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.email == user_data.get("email")).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    existing = db.query(HealthTwinProfile).filter(HealthTwinProfile.user_id == user.id).first()
    data_dict = profile.dict()

    if existing:
        for key, value in data_dict.items():
            setattr(existing, key, value)
    else:
        existing = HealthTwinProfile(user_id=user.id, **data_dict)
        db.add(existing)

    db.commit()

    wellness_score, bmi = calculate_wellness_score(data_dict)
    risk_trends = generate_risk_trends(wellness_score, data_dict)
    ai_insight = generate_health_twin_insight(data_dict, wellness_score, risk_trends)

    return {
        "wellness_score": wellness_score,
        "bmi": bmi,
        "risk_trends": risk_trends,
        "ai_insight": ai_insight,
    }


@app.get("/ai/health-twin/profile")
def get_health_twin_profile(
    user_data: dict = Depends(verify_token),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.email == user_data.get("email")).first()
    profile = db.query(HealthTwinProfile).filter(HealthTwinProfile.user_id == user.id).first()

    if not profile:
        raise HTTPException(status_code=404, detail="No Health Twin profile found yet.")

    data_dict = {
        "age": profile.age,
        "height_cm": profile.height_cm,
        "weight_kg": profile.weight_kg,
        "avg_sleep_hours": profile.avg_sleep_hours,
        "avg_stress_level": profile.avg_stress_level,
        "exercise_frequency": profile.exercise_frequency,
        "nutrition_quality": profile.nutrition_quality,
        "reported_symptoms": profile.reported_symptoms,
    }

    wellness_score, bmi = calculate_wellness_score(data_dict)
    risk_trends = generate_risk_trends(wellness_score, data_dict)

    return {
        "profile": data_dict,
        "wellness_score": wellness_score,
        "bmi": bmi,
        "risk_trends": risk_trends,
    }

@app.post("/ai/report-analyzer/upload")
async def upload_report(
    file: UploadFile = File(...),
    user_data: dict = Depends(verify_token),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.email == user_data.get("email")).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Please upload a PDF file for now (image support can be added later).")

    file_bytes = await file.read()
    extracted_text = extract_text_from_pdf(file_bytes)
    ai_summary = analyze_report_text(extracted_text)

    new_upload = UploadedReport(
        user_id=user.id,
        file_name=file.filename,
        ai_summary=ai_summary,
    )
    db.add(new_upload)
    db.commit()

    return {"file_name": file.filename, "ai_summary": ai_summary}


@app.get("/ai/report-analyzer/history")
def report_history(
    user_data: dict = Depends(verify_token),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.email == user_data.get("email")).first()
    reports = db.query(UploadedReport).filter(UploadedReport.user_id == user.id).order_by(UploadedReport.uploaded_at.desc()).all()
    return reports

@app.post("/ai/voice-assistant/query")
def voice_assistant_query(
    payload: dict,
    user_data: dict = Depends(verify_token),
):
    """
    payload: {
      "query": "...",
      "language": "en" | "hi" | "mr",
      "history": [{"role": "user"/"assistant", "text": "..."}]
    }
    """
    query = payload.get("query", "")
    language = payload.get("language", "en")
    history = payload.get("history", [])

    if not query:
        raise HTTPException(status_code=400, detail="Query is required")

    response_text = generate_voice_response(query, language, history)
    return {"response": response_text}