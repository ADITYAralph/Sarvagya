from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.db.database import engine, Base
from app.routers import resume, interview, practice, dashboard, roadmap

# Create DB tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Sarvagya AI Engine API",
    description="Full-stack AI College Placement Platform powered by FastAPI & NVIDIA NIM API (llama-3.3-70b-instruct)",
    version="1.0.0"
)

# Configure CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(resume.router)
app.include_router(interview.router)
app.include_router(practice.router)
app.include_router(dashboard.router)
app.include_router(roadmap.router)

@app.get("/")
def read_root():
    return {
        "app": "Sarvagya AI Engine API",
        "status": "ok",
        "nvidia_nim_model": settings.NVIDIA_MODEL_NAME,
        "docs_url": "/docs"
    }

@app.get("/health")
@app.get("/api/health")
def health_check():
    from app.services.nvidia_service import nvidia_service
    return {
        "status": "ok",
        "nvidia_live": nvidia_service.is_live(),
        "model": settings.NVIDIA_MODEL_NAME
    }
