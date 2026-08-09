from typing import List, Dict, Any, Optional
from pydantic import BaseModel

class DashboardStatsResponse(BaseModel):
    user_name: str
    target_role: str
    readiness_score: int
    ats_resume_score: int
    mock_interview_score: int
    aptitude_score: int
    streak_count: int
    total_practice_hours: float
    weak_areas: List[str]
    recent_activities: List[Dict[str, Any]]
    recommendations: List[str]
