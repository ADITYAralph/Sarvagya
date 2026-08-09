import uuid
import json
from datetime import datetime
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import InterviewSession
from app.services.nvidia_service import nvidia_service

router = APIRouter(prefix="/api/interview", tags=["AI Mock Interviewer"])

class QuestionsRequest(BaseModel):
    role: str = "Software Development Engineer"
    level: str = "Entry-level"

class AnswerEvalRequest(BaseModel):
    role: str = "Software Engineer"
    question: str
    user_answer: str

@router.post("/questions")
def get_interview_questions(payload: QuestionsRequest):
    questions = nvidia_service.generate_interview_questions(payload.role, payload.level)
    return {
        "role": payload.role,
        "level": payload.level,
        "total_questions": len(questions),
        "questions": questions
    }

@router.post("/evaluate-answer")
def evaluate_answer_direct(payload: AnswerEvalRequest):
    return nvidia_service.evaluate_interview_answer(payload.role, payload.question, payload.user_answer)

class StartSessionReq(BaseModel):
    role: str = "Full Stack Engineer"
    category: str = "Technical & DSA"

@router.post("/start")
def start_interview_session(payload: StartSessionReq, db: Session = Depends(get_db)):
    session_id = str(uuid.uuid4())[:8]
    
    questions = nvidia_service.generate_interview_questions(payload.role, "Entry-level")
    first_q = questions[0]["question"] if questions else f"Welcome to your mock interview for {payload.role}! Can you introduce yourself?"
    
    initial_messages = [
        {
            "role": "interviewer",
            "content": first_q,
            "timestamp": datetime.now().strftime("%H:%M")
        }
    ]
    
    db_session = InterviewSession(
        id=session_id,
        role=payload.role,
        category=payload.category,
        status="active",
        current_round=1,
        total_rounds=min(5, len(questions)),
        overall_score=0.0,
        messages_json=json.dumps(initial_messages)
    )
    db.add(db_session)
    db.commit()
    
    return {
        "session_id": session_id,
        "role": payload.role,
        "category": payload.category,
        "current_round": 1,
        "total_rounds": min(5, len(questions)),
        "status": "active",
        "current_question": first_q,
        "messages": initial_messages
    }
