from typing import List, Optional
from pydantic import BaseModel

class ResumeAnalysisRequest(BaseModel):
    target_role: str = "Software Development Engineer (SDE-1)"

class ResumeAnalysisResponse(BaseModel):
    id: Optional[int] = None
    filename: str
    target_role: str
    is_valid: bool = True
    error_message: Optional[str] = None
    overall_score: int
    formatting_score: int
    skills_score: int
    impact_score: int
    relevance_score: int
    matching_skills: List[str] = []
    missing_keywords: List[str] = []
    strengths: List[str] = []
    suggestions: List[str] = []
