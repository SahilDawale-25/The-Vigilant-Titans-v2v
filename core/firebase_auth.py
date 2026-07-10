import firebase_admin
from firebase_admin import credentials, auth
from fastapi import HTTPException, Header
from pathlib import Path
import json
import os

BASE_DIR = Path(__file__).resolve().parent.parent

# Production (Render) madhe environment variable vaparto, local madhe file vaparto
firebase_creds_json = os.getenv("FIREBASE_CREDENTIALS_JSON")

if firebase_creds_json:
    cred_dict = json.loads(firebase_creds_json)
    cred = credentials.Certificate(cred_dict)
else:
    cred = credentials.Certificate(str(BASE_DIR / "backend" / "firebase-service-account.json"))

firebase_admin.initialize_app(cred)


def verify_token(authorization: str = Header(...)):
    try:
        token = authorization.replace("Bearer ", "")
        decoded_token = auth.verify_id_token(token)
        return decoded_token
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")