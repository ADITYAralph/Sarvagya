from typing import List, Optional
from pydantic import BaseModel

class ResumeAnalysisRequest(BaseModel):
    target_role: str = "Software Development Engineer (SDE-1)"

class ResumeAnalysisResponse(BaseModel):
    id: Optional[int] = None
    filename: str
    target_role: str
    overall_score: int
    formatting_score: int
    skills_score: int
    impact_score: int
    relevance_score: int
    missing_keywords: List[str]
    strengths: List[str]
    suggestions: List[str]
