from typing import List, Optional, Dict, Any
from pydantic import BaseModel

class StartInterviewRequest(BaseModel):
    role: str = "Full Stack Engineer"
    category: str = "Technical & DSA"

class AnswerSubmitRequest(BaseModel):
    session_id: str
    user_answer: str

class InterviewMessage(BaseModel):
    role: str  # "interviewer" or "candidate"
    content: str
    score: Optional[int] = None
    feedback: Optional[str] = None
    timestamp: Optional[str] = None

class InterviewSessionResponse(BaseModel):
    session_id: str
    role: str
    category: str
    current_round: int
    total_rounds: int
    status: str
    current_question: str
    messages: List[InterviewMessage]
    overall_score: float = 0.0
    summary_report: Optional[Dict[str, Any]] = None
