from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Manolle AI Backend", version="1.0.0")

def get_allowed_origins() -> list[str]:
    raw_origins = os.getenv("BACKEND_ALLOWED_ORIGINS", "http://localhost:3000")
    origins = [origin.strip() for origin in raw_origins.split(",") if origin.strip()]
    return origins or ["http://localhost:3000"]


app.add_middleware(
    CORSMiddleware,
    allow_origins=get_allowed_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
async def health_check():
    required_env = [
        "SUPABASE_URL",
        "SUPABASE_SERVICE_ROLE_KEY",
        "STRIPE_SECRET_KEY",
        "STRIPE_WEBHOOK_SECRET",
        "VAPI_PRIVATE_KEY",
        "VAPI_ASSISTANT_ID",
        "VAPI_PHONE_NUMBER_ID",
        "VAPI_WEBHOOK_SECRET",
    ]
    missing_env = [key for key in required_env if not os.getenv(key)]

    return {
        "status": "ok" if not missing_env else "configuration_required",
        "service": "Manolle AI Backend",
        "version": "1.0.0",
        "allowed_origins": get_allowed_origins(),
        "missing_env": missing_env,
    }


@app.get("/api/")
async def root():
    return {"message": "Manolle AI Backend API", "docs": "/docs"}
