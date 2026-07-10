import pdfplumber
import io
from groq import Groq
from core.config import GROQ_API_KEY

client = Groq(api_key=GROQ_API_KEY)
MODEL_NAME = "llama-3.3-70b-versatile"


def extract_text_from_pdf(file_bytes: bytes) -> str:
    text = ""
    with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
    return text


def analyze_report_text(report_text: str) -> str:
    if not report_text.strip():
        return "Could not extract readable text from this file. Please try a clearer scan or a text-based PDF."

    prompt = f"""
    You are a supportive AI assistant helping a woman understand her lab report or prescription
    in simple, plain language. You must NEVER diagnose any medical condition and NEVER tell her
    to start, stop, or change any medication.

    Report content:
    {report_text[:4000]}

    Please:
    1. Summarize what type of report this appears to be (e.g., blood test, prescription).
    2. Explain any values or terms in simple, everyday language (avoid jargon).
    3. Note if any values appear outside a typical general reference range, framed as
       "worth discussing with your doctor" rather than a diagnosis.
    4. End with a clear disclaimer that this is not medical advice and a doctor should
       be consulted for interpretation and next steps.

    Keep the explanation clear, warm, and under 300 words.
    """

    response = client.chat.completions.create(
        model=MODEL_NAME,
        messages=[{"role": "user", "content": prompt}],
    )
    return response.choices[0].message.content