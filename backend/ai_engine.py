"""
AI Engine Module for Sarvagya Placement Platform.
Powered by NVIDIA NIM API (https://integrate.api.nvidia.com/v1) model meta/llama-3.3-70b-instruct.
"""
from app.services.nvidia_service import nvidia_service

def analyze_resume(resume_text: str, target_role: str):
    return nvidia_service.analyze_resume(resume_text, target_role)

def generate_interview_questions(role: str, level: str):
    return nvidia_service.generate_interview_questions(role, level)

def evaluate_interview_answer(role: str, question: str, user_answer: str):
    return nvidia_service.evaluate_interview_answer(role, question, user_answer)

def generate_roadmap(target_role: str, duration_weeks: int = 4):
    return nvidia_service.generate_roadmap(target_role, duration_weeks)

def evaluate_code(problem_title: str, code: str, language: str = "python"):
    return nvidia_service.evaluate_code(problem_title, code, language)
