from gtts import gTTS
import os
import uuid

AUDIO_DIR = "generated_audio"


def generate_speech_audio(text: str, language_code: str) -> str:
    """
    gTTS vaparun natural-sounding audio file banवतो.
    language_code: "en", "hi", "mr"
    Returns: file path of generated mp3
    """
    os.makedirs(AUDIO_DIR, exist_ok=True)

    # gTTS cha language codes: en, hi, mr (Marathi supported ahe)
    lang_map = {"en": "en", "hi": "hi", "mr": "mr"}
    lang = lang_map.get(language_code, "en")

    filename = f"{AUDIO_DIR}/{uuid.uuid4()}.mp3"
    tts = gTTS(text=text, lang=lang, slow=False)
    tts.save(filename)

    return filename