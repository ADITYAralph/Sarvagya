from typing import List, Optional
from pydantic import BaseModel

class CodeSubmitRequest(BaseModel):
    problem_id: str
    problem_title: str
    code: str
    language: str = "python"

class AptitudeSubmitRequest(BaseModel):
    question_id: str
    selected_option: int

class CodeEvaluationResponse(BaseModel):
    is_correct: bool
    score: int
    time_complexity: str
    space_complexity: str
    feedback: str
    code_quality: str
    suggestions: List[str]
    optimized_code: str

class AptitudeQuestionResponse(BaseModel):
    id: str
    category: str
    question: str
    options: List[str]
    correct_option: int
    explanation: str
