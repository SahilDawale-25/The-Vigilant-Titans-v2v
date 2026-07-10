import os
from dotenv import load_dotenv
from pathlib import Path

# Ha .env file cha exact path shodhto, chahe tumhi kuthlyahi folder madhun run kara
BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / "backend" / ".env")

DATABASE_URL = os.getenv("DATABASE_URL")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GEOAPIFY_API_KEY = os.getenv("GEOAPIFY_API_KEY")