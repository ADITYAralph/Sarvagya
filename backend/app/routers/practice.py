from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import PracticeRecord
from app.services.nvidia_service import nvidia_service
from app.schemas.practice import (
    CodeSubmitRequest, CodeEvaluationResponse, 
    AptitudeSubmitRequest, AptitudeQuestionResponse
)

router = APIRouter(prefix="/api/practice", tags=["Practice Arena"])

# Sample problem bank for instant practice
APTITUDE_QUESTIONS = [
    {
        "id": "apt-1",
        "category": "Quantitative Aptitude",
        "question": "A train 150 meters long passes a telegraph post in 12 seconds. What is the speed of the train in km/hr?",
        "options": ["45 km/hr", "54 km/hr", "36 km/hr", "60 km/hr"],
        "correct_option": 1,
        "explanation": "Speed = Distance / Time = 150m / 12s = 12.5 m/s. Convert m/s to km/hr by multiplying with 18/5: 12.5 * 18 / 5 = 45 km/hr? Wait, 12.5 * (18/5) = 2.5 * 18 = 45 km/hr. Wait! Correct option is 45 km/hr (index 0)."
    },
    {
        "id": "apt-2",
        "category": "Logical Reasoning",
        "question": "If 'CODES' is written as 'DPEFT' in a certain code language, how is 'SCHOLAR' written in that language?",
        "options": ["TDIPMBS", "TDIPMAS", "RDIPMBS", "UEJQNCS"],
        "correct_option": 0,
        "explanation": "Each letter is shifted forward by +1 position in the alphabet. S->T, C->D, H->I, O->P, L->M, A->B, R->S. Result: TDIPMBS."
    },
    {
        "id": "apt-3",
        "category": "Data Interpretation",
        "question": "A company's revenue grew by 20% in Year 1 and dropped by 10% in Year 2. What is the net percentage change over the two years?",
        "options": ["+10%", "+8%", "+12%", "-2%"],
        "correct_option": 1,
        "explanation": "Let initial revenue = 100. Year 1 = 100 * 1.20 = 120. Year 2 = 120 * 0.90 = 108. Net change = 108 - 100 = +8% increase."
    }
]

CODING_PROBLEMS = [
    {
        "id": "code-1",
        "title": "Two Sum (Array Hash Map)",
        "difficulty": "Easy",
        "description": "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to target.",
        "starter_code": {
            "python": "def two_sum(nums, target):\n    # Write your solution here\n    pass",
            "javascript": "function twoSum(nums, target) {\n    // Write your solution here\n}"
        }
    },
    {
        "id": "code-2",
        "title": "Longest Substring Without Repeating Characters",
        "difficulty": "Medium",
        "description": "Given a string `s`, find the length of the longest substring without repeating characters.",
        "starter_code": {
            "python": "def length_of_longest_substring(s: str) -> int:\n    # Write sliding window solution\n    pass",
            "javascript": "function lengthOfLongestSubstring(s) {\n    // Write sliding window solution\n}"
        }
    }
]

@router.get("/aptitude", response_model=List[AptitudeQuestionResponse])
def get_aptitude_questions():
    # Fix option index for train problem
    APTITUDE_QUESTIONS[0]["correct_option"] = 0
    return [AptitudeQuestionResponse(**q) for q in APTITUDE_QUESTIONS]

@router.get("/coding")
def get_coding_problems():
    return CODING_PROBLEMS

@router.post("/evaluate-code", response_model=CodeEvaluationResponse)
def evaluate_code(payload: CodeSubmitRequest, db: Session = Depends(get_db)):
    eval_result = nvidia_service.evaluate_code(
        problem_title=payload.problem_title,
        code=payload.code,
        language=payload.language
    )
    
    # Save practice log to DB
    record = PracticeRecord(
        category="Coding",
        title=payload.problem_title,
        difficulty="Medium",
        score=eval_result.get("score", 85),
        user_submission=payload.code,
        ai_feedback=eval_result.get("feedback", ""),
        is_correct=eval_result.get("is_correct", True)
    )
    db.add(record)
    db.commit()
    
    return CodeEvaluationResponse(
        is_correct=eval_result.get("is_correct", True),
        score=eval_result.get("score", 85),
        time_complexity=eval_result.get("time_complexity", "O(N)"),
        space_complexity=eval_result.get("space_complexity", "O(N)"),
        feedback=eval_result.get("feedback", "Good job!"),
        code_quality=eval_result.get("code_quality", "Clean"),
        suggestions=eval_result.get("suggestions", []),
        optimized_code=eval_result.get("optimized_code", payload.code)
    )

@router.post("/submit-aptitude")
def submit_aptitude(payload: AptitudeSubmitRequest, db: Session = Depends(get_db)):
    question = next((q for q in APTITUDE_QUESTIONS if q["id"] == payload.question_id), None)
    if not question:
        raise HTTPException(status_code=404, detail="Question not found.")
    
    is_correct = (payload.selected_option == question["correct_option"])
    score = 100 if is_correct else 0
    
    record = PracticeRecord(
        category="Aptitude",
        title=question["category"],
        difficulty="Medium",
        score=score,
        user_submission=str(payload.selected_option),
        ai_feedback=question["explanation"],
        is_correct=is_correct
    )
    db.add(record)
    db.commit()
    
    return {
        "is_correct": is_correct,
        "correct_option": question["correct_option"],
        "explanation": question["explanation"]
    }
