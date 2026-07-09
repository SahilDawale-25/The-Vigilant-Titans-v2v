import google.generativeai as genai
from core.config import GEMINI_API_KEY

genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel("gemini-1.5-flash")

LANGUAGE_NAMES = {
    "en": "English",
    "hi": "Hindi",
    "mr": "Marathi",
}


def generate_voice_response(user_query: str, language_code: str, conversation_history: list = None):
    language_name = LANGUAGE_NAMES.get(language_code, "English")
    history_text = ""
    if conversation_history:
        for msg in conversation_history[-6:]:  # last 6 messages for context
            history_text += f"{msg['role']}: {msg['text']}\n"

    prompt = f"""
    You are HerWellness's AI voice assistant — a warm, supportive women's health and
    wellness companion. Respond ONLY in {language_name}, in a natural conversational tone
    suitable for being spoken aloud (short sentences, no markdown, no bullet points).

    You must NEVER diagnose any medical condition. If the question sounds like a medical
    emergency or concerning symptom, gently recommend consulting a doctor.

    Previous conversation:
    {history_text}

    User's question: {user_query}

    Respond in 2-4 short sentences in {language_name} only.
    """

    response = model.generate_content(prompt)
    return response.text