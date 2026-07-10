"# The-Vigilant-Titans-v2v" 
# 🌸 HerWellness – AI Health Copilot for Women

> **An AI-powered women's healthcare platform that provides personalized wellness tracking, life-stage guidance, AI-powered health insights, medical report summarization, multilingual voice assistance, and educational video guidance through a modern, responsive web application.**

---

# 💡 The Idea

Women's healthcare is often fragmented across multiple applications, with separate solutions for menstrual tracking, pregnancy, postpartum care, menopause, mental wellness, and health education. This fragmented ecosystem forces women to switch between multiple apps throughout different stages of life, resulting in scattered health records, inconsistent wellness tracking, limited personalization, and difficulty understanding medical information.

**HerWellness** solves this challenge by bringing every major stage of women's health into a single AI-powered platform. Instead of replacing healthcare professionals, HerWellness acts as a supportive, non-diagnostic health companion that empowers women to understand their health, monitor long-term wellness trends, organize medical records, access trusted educational content, and prepare for informed conversations with healthcare providers.

---

# ✨ Features

## 🌼 Multi-Stage Women's Health Platform

### 👧 Teen Wellness
- Puberty education
- Menstrual health guidance
- Healthy habit tracking
- Mental wellness resources
- Anonymous AI Health Q&A
- **Educational video guidance** covering puberty, menstrual hygiene, nutrition, emotional well-being, and healthy lifestyle habits

### 🩸 Smart Cycle Tracker
- Cycle logging
- Symptom tracking
- Mood monitoring
- AI-powered period prediction
- Historical trend analysis
- Personalized wellness insights

### 🤰 Pregnancy Companion
- Week-by-week pregnancy tracking
- Baby development milestones
- Medication reminders
- Prenatal wellness guidance
- Emergency checklist

### 👶 New Mother Care
- Postpartum recovery tracking
- Breastfeeding guidance
- Baby vaccination schedules
- Maternal mental wellness monitoring
- **Expert educational videos** covering breastfeeding techniques, newborn care, postpartum recovery, maternal nutrition, and infant wellness

### 🌸 Menopause Support
- Symptom severity tracking
- Lifestyle recommendations
- Bone health awareness
- Nutrition guidance
- Wellness progress monitoring

---

## 🎥 Educational Video Library

A dedicated educational learning hub designed to improve women's health literacy.

Features include:

- Teen Wellness educational videos
- Breastfeeding tutorials
- Newborn care guidance
- Pregnancy wellness education
- Maternal nutrition guidance
- Postpartum recovery videos
- Menstrual hygiene awareness
- Mental wellness education
- Mobile-friendly video playback

---

## 🤖 AI Health Copilot

- Personalized AI wellness guidance
- Lifestyle recommendations
- Health education
- Emotional wellness support
- Context-aware conversations
- Safe, non-diagnostic assistance

---

## 📊 AI Wellness Dashboard

- AI Wellness Score
- Burnout Risk Score
- Mood tracking
- Sleep analytics
- Stress monitoring
- Weekly wellness insights
- Interactive charts powered by Recharts

---

## 🧬 AI Health Twin

Creates a personalized digital wellness profile using:

- Age
- Height & Weight
- Lifestyle habits
- Sleep quality
- Physical activity
- Nutrition
- Mood history

Generates personalized wellness observations and preventive health recommendations.

---

## 📄 AI Medical Report Analyzer

- Upload laboratory reports in PDF format
- Automatic report text extraction
- AI-generated summaries
- Medical terminology simplification
- Highlight abnormal values
- Suggest discussion points for healthcare professionals
- Strictly non-diagnostic

---

## 🎙️ Multilingual AI Voice Assistant

Supports:

- English
- Hindi
- Marathi

Capabilities:

- Speech-to-text interaction
- Natural AI conversations
- Voice responses
- Mobile-friendly interface

---

## 🏥 Safety & Emergency Features

### Nearby Hospital Finder

- Live geolocation
- Nearby hospitals
- Ratings and distance
- Google Maps navigation

### Emergency SMS

- Native messaging integration
- One-tap emergency message
- Pre-filled emergency contacts
- No third-party SMS gateway required

---

## 🔐 Secure Authentication

- Firebase Authentication
- Protected routes
- Secure API authorization
- Firebase Admin SDK token verification

---

# 🛠️ Tech Stack & Tools

## Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- Recharts

## Backend

- FastAPI
- Python
- SQLAlchemy
- Pydantic
- Uvicorn

## Database

- PostgreSQL
- Neon / Supabase

## Authentication

- Firebase Authentication
- Firebase Admin SDK

## Artificial Intelligence

- Groq Cloud API
- Llama 3.3 70B Versatile
- Prompt Engineering
- AI Safety Guardrails

## Voice Processing

- Web Speech API
- Google Text-to-Speech (gTTS)

## Document Processing

- pdfplumber

## Maps & Geolocation

- Navigator Geolocation API
- Geoapify Places API
- Google Maps Deep Links

---

# 🏗️ System Architecture

```text
                Next.js Frontend
                       │
         Firebase Authentication
                       │
          Bearer Token Authentication
                       │
                       ▼
               FastAPI Backend
                       │
       ┌───────────────┼─────────────────┐
       │               │                 │
       ▼               ▼                 ▼
 PostgreSQL      Groq AI Engine     PDF Parser
(SQLAlchemy)   (Llama-3.3-70B)    (pdfplumber)
       │               │
       └───────────────┼─────────────────┘
                       ▼
          AI Wellness Responses
```

---

# 📖 Documentation

## 🔐 Authentication Flow

1. User signs up or logs in using Firebase Authentication.
2. Firebase generates a secure ID Token.
3. The frontend attaches the token to protected API requests.
4. FastAPI verifies the token using Firebase Admin SDK.
5. User-specific records are securely mapped to PostgreSQL through SQLAlchemy.

---

## 🤖 AI Coordination

Instead of directly sending prompts to the language model, HerWellness uses a centralized AI orchestration layer.

Each AI module:

- Collects user health context
- Builds feature-specific prompts
- Injects AI safety instructions
- Removes complex medical jargon
- Restricts clinical diagnosis
- Generates personalized wellness guidance

AI-powered modules include:

- AI Health Copilot
- Cycle Insights
- Teen Wellness Assistant
- Pregnancy Guidance
- Mental Wellness
- AI Health Twin
- Medical Report Analyzer
- Voice Assistant

---

## 🎙️ Voice Assistant Pipeline

```text
User Speech
      │
      ▼
Web Speech API
(Speech-to-Text)
      │
      ▼
FastAPI Backend
      │
      ▼
Prompt Engineering Layer
      │
      ▼
Groq Llama 3.3 70B
      │
      ▼
gTTS Voice Generation
      │
      ▼
MP3 Audio Stream
      │
      ▼
Frontend Playback
```

---

## 📄 AI Medical Report Pipeline

1. Upload laboratory report
2. Extract text using pdfplumber
3. Clean report content
4. Generate structured AI prompt
5. Analyze using Groq LLM
6. Simplify medical terminology
7. Highlight abnormal values
8. Generate concise, non-diagnostic explanation

---

## 📈 Predictive Wellness Analytics

HerWellness transforms daily wellness logs into meaningful insights through lightweight analytical models.

Examples include:

- AI Wellness Score
- Burnout Risk Score
- Mood trend analysis
- Cycle forecasting
- Lifestyle consistency evaluation
- Weekly wellness scoring
- Personalized Health Twin insights

---

# 🌍 Women-Centric Impact

HerWellness is designed specifically to address the evolving healthcare needs of women throughout every stage of life. By combining AI-powered guidance, wellness tracking, multilingual accessibility, and trusted educational resources, the platform helps reduce barriers to healthcare while promoting preventive wellness.

### Key Impact Areas

- Supports women from adolescence through menopause within a single platform.
- Encourages preventive healthcare through continuous wellness tracking.
- Makes healthcare information easier to understand by simplifying complex medical reports.
- Breaks language barriers with multilingual AI support in English, Hindi, and Marathi.
- Provides anonymous AI guidance for teenagers to reduce stigma around sensitive health topics.
- Empowers new mothers with educational videos on breastfeeding, newborn care, postpartum recovery, and maternal wellness.
- Helps users locate nearby hospitals and access emergency assistance during urgent situations.
- Encourages informed conversations with healthcare professionals instead of self-diagnosis.
- Promotes long-term health awareness through personalized wellness insights and AI-powered analytics.

---

# 🛡️ AI Safety & Ethics

HerWellness is intentionally designed as a **health companion**, not a replacement for licensed healthcare professionals.

The AI is explicitly instructed to:

- Never diagnose diseases.
- Never prescribe or modify medications.
- Never replace professional medical advice.
- Encourage users to consult healthcare providers when severe symptoms are detected.
- Explain medical concepts using simple, non-technical language.
- Maintain empathetic, respectful, and supportive conversations.
- Protect user privacy through secure authentication and data handling.

---

# 🎨 User Experience Highlights

- Mobile-first responsive design
- Glassmorphism-inspired interface
- Soft lavender wellness theme
- Smooth animations and transitions
- Interactive wellness dashboards
- AI-powered conversational interface
- Educational video library
- Dynamic health visualizations
- Accessible multilingual experience

---

# 🚀 Future Enhancements

- Wearable device integration
- Apple Health & Google Fit synchronization
- AI-powered nutrition planner
- Medication reminders
- Family health dashboard
- Appointment scheduling
- Telemedicine integration
- Long-term wellness forecasting
- Personalized preventive healthcare recommendations

---

# ❤️ Project Vision

HerWellness aims to make women's healthcare more accessible, understandable, and personalized by combining artificial intelligence, secure cloud technologies, multilingual accessibility, educational content, and intuitive design into one comprehensive wellness platform. Through preventive healthcare, trusted AI guidance, educational video resources, and personalized wellness insights, HerWellness empowers women to confidently manage their health and make informed healthcare decisions throughout every stage of life.
