from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text

from core.database import get_db, engine, Base
from models.user import User, HealthProfile
from schemas.user import UserCreate, UserResponse

from core.firebase_auth import verify_token

# Ha line sagle tables (users, health_profiles) database madhe automatically banvel
Base.metadata.create_all(bind=engine)

app = FastAPI(title="HerWellness API")

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