from groq import Groq
from core.config import GROQ_API_KEY

client = Groq(api_key=GROQ_API_KEY)
MODEL_NAME = "llama-3.3-70b-versatile"

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

    response = client.chat.completions.create(
        model=MODEL_NAME,
        messages=[{"role": "user", "content": prompt}],
    )
    return response.choices[0].message.content