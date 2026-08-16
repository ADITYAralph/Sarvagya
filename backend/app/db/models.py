import datetime
import json
from sqlalchemy import Column, Integer, String, Float, Text, DateTime, Boolean
from app.db.database import Base

class UserProfile(Base):
    __tablename__ = "sarvagya_user_profiles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, default="College Scholar")
    target_role = Column(String, default="Full Stack Software Engineer")
    streak_count = Column(Integer, default=5)
    last_active_date = Column(String, default="")
    total_practice_minutes = Column(Integer, default=140)

class ResumeAnalysis(Base):
    __tablename__ = "sarvagya_resume_analyses"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String)
    target_role = Column(String)
    overall_score = Column(Integer)
    formatting_score = Column(Integer)
    skills_score = Column(Integer)
    impact_score = Column(Integer)
    relevance_score = Column(Integer)
    missing_keywords = Column(Text)  # JSON string list
    matching_skills = Column(Text, nullable=True)   # JSON string list
    suggestions = Column(Text)       # JSON string list
    strengths = Column(Text)         # JSON string list
    # Deep ATS analysis columns
    grade = Column(String, nullable=True)
    total_words = Column(Integer, nullable=True)
    strong_keyword_count = Column(Integer, nullable=True)
    filler_count = Column(Integer, nullable=True)
    word_annotations_json = Column(Text, nullable=True)   # JSON serialized word annotations
    section_scores_json = Column(Text, nullable=True)     # JSON serialized section scores
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class InterviewSession(Base):
    __tablename__ = "sarvagya_interview_sessions"

    id = Column(String, primary_key=True, index=True)
    role = Column(String)
    category = Column(String)  # Technical, Behavioral, System Design, HR
    status = Column(String, default="active")  # active, completed
    current_round = Column(Integer, default=1)
    total_rounds = Column(Integer, default=3)
    overall_score = Column(Float, default=0.0)
    messages_json = Column(Text, default="[]")  # JSON representation of messages
    feedback_summary = Column(Text, default="")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class PracticeRecord(Base):
    __tablename__ = "sarvagya_practice_records"

    id = Column(Integer, primary_key=True, index=True)
    category = Column(String)  # Aptitude, Coding
    title = Column(String)
    difficulty = Column(String)  # Easy, Medium, Hard
    score = Column(Integer, default=0)
    user_submission = Column(Text, default="")
    ai_feedback = Column(Text, default="")
    is_correct = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
