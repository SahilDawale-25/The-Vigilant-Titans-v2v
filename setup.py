from pathlib import Path

BASE_DIR = Path.cwd()

folders = [
    "frontend/app/(auth)/login",
    "frontend/app/(auth)/signup",
    "frontend/app/(dashboard)/dashboard",
    "frontend/app/(dashboard)/teen-wellness",
    "frontend/app/(dashboard)/cycle-tracker",
    "frontend/app/(dashboard)/pregnancy",
    "frontend/app/(dashboard)/new-mother",
    "frontend/app/(dashboard)/menopause",
    "frontend/app/(dashboard)/mental-wellness",
    "frontend/app/(dashboard)/health-twin",
    "frontend/app/(dashboard)/report-analyzer",
    "frontend/app/(dashboard)/monthly-report",

    "frontend/components/ui",
    "frontend/components/charts",
    "frontend/components/voice-assistant",
    "frontend/components/module-widgets",

    "frontend/lib",
    "frontend/styles",

    "backend",
    "backend/core",
    "backend/models",
    "backend/schemas",
    "backend/routers",
    "backend/services",
    "backend/workers",

    "ai/prompts",
    "ai/knowledge_base",

    "docs",
]

files = [
    "frontend/app/layout.tsx",

    "frontend/lib/api-client.ts",
    "frontend/lib/firebase.ts",

    "backend/main.py",

    "backend/core/config.py",
    "backend/core/security.py",
    "backend/core/database.py",

    "backend/routers/auth.py",
    "backend/routers/teen_wellness.py",
    "backend/routers/cycle_tracking.py",
    "backend/routers/pregnancy.py",
    "backend/routers/new_mother.py",
    "backend/routers/menopause.py",
    "backend/routers/mental_wellness.py",
    "backend/routers/health_twin.py",
    "backend/routers/report_analyzer.py",
    "backend/routers/voice_assistant.py",
    "backend/routers/reports.py",

    "backend/services/ai_orchestrator.py",
    "backend/services/prediction_engine.py",
    "backend/services/rag_service.py",
    "backend/services/pdf_generator.py",

    "backend/workers/reminder_scheduler.py",

    "ai/embeddings_ingest.py",

    "docs/architecture.md",
    "docs/er-diagram.png",
    "docs/pitch-deck/README.md",
]

python_packages = [
    "backend",
    "backend/core",
    "backend/models",
    "backend/schemas",
    "backend/routers",
    "backend/services",
    "backend/workers",
]

print("=" * 60)
print("Creating folder structure...")
print("=" * 60)

for folder in folders:
    path = BASE_DIR / folder
    path.mkdir(parents=True, exist_ok=True)
    print(f"[DIR ] {folder}")

print("\nCreating files...")

for file in files:
    path = BASE_DIR / file
    path.parent.mkdir(parents=True, exist_ok=True)

    if not path.exists():
        path.touch()
        print(f"[FILE] {file}")
    else:
        print(f"[SKIP] {file}")

print("\nCreating __init__.py files...")

for package in python_packages:
    init_file = BASE_DIR / package / "__init__.py"
    if not init_file.exists():
        init_file.touch()
        print(f"[INIT] {package}/__init__.py")

print("\nDone!")
print(f"\nProject initialized successfully inside:\n{BASE_DIR}")