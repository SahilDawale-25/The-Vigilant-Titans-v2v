import firebase_admin
from firebase_admin import credentials, auth
from fastapi import HTTPException, Header
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
cred = credentials.Certificate(str(BASE_DIR / "backend" / "firebase-service-account.json"))
firebase_admin.initialize_app(cred)


def verify_token(authorization: str = Header(...)):
    """
    Frontend request madhe Authorization: Bearer <token> header pathvel,
    ha function to token verify karto ani Firebase user info return karto.
    """
    try:
        token = authorization.replace("Bearer ", "")
        decoded_token = auth.verify_id_token(token)
        return decoded_token
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")