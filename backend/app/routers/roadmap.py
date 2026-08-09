from fastapi import APIRouter
from pydantic import BaseModel
from app.services.nvidia_service import nvidia_service

router = APIRouter(prefix="/api/roadmap", tags=["Placement Roadmap"])

class RoadmapRequest(BaseModel):
    target_role: str = "Software Development Engineer (SDE-1)"
    duration_weeks: int = 4

@router.post("/generate")
def generate_roadmap_endpoint(payload: RoadmapRequest):
    return nvidia_service.generate_roadmap(payload.target_role, payload.duration_weeks)
