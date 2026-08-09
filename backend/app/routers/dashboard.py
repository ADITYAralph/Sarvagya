from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.db.database import get_db
from app.db.models import UserProfile, ResumeAnalysis, InterviewSession, PracticeRecord
from app.schemas.dashboard import DashboardStatsResponse

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard & Analytics"])

@router.get("/stats", response_model=DashboardStatsResponse)
def get_dashboard_stats(db: Session = Depends(get_db)):
    user = db.query(UserProfile).first()
    if not user:
        user = UserProfile(
            name="Aditya Kaushik",
            target_role="Full Stack Software Engineer",
            streak_count=5,
            total_practice_minutes=180
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    # Calculate latest ATS resume score
    latest_resume = db.query(ResumeAnalysis).order_by(ResumeAnalysis.created_at.desc()).first()
    ats_score = latest_resume.overall_score if latest_resume else 84

    # Calculate average mock interview score
    interview_avg = db.query(func.avg(InterviewSession.overall_score)).filter(InterviewSession.status == "completed").scalar()
    mock_score = int(round(interview_avg)) if interview_avg and interview_avg > 0 else 88

    # Calculate average aptitude & practice score
    practice_avg = db.query(func.avg(PracticeRecord.score)).scalar()
    aptitude_score = int(round(practice_avg)) if practice_avg and practice_avg > 0 else 82

    # Overall readiness formula
    readiness = int(round((ats_score * 0.35) + (mock_score * 0.40) + (aptitude_score * 0.25)))

    # Fetch recent activity timeline
    recent_activities = []
    
    scans = db.query(ResumeAnalysis).order_by(ResumeAnalysis.created_at.desc()).limit(3).all()
    for s in scans:
        recent_activities.append({
            "type": "Resume Analysis",
            "title": f"Analyzed {s.filename}",
            "score": f"{s.overall_score}/100",
            "timestamp": s.created_at.strftime("%b %d, %H:%M")
        })

    interviews = db.query(InterviewSession).order_by(InterviewSession.created_at.desc()).limit(3).all()
    for iv in interviews:
        recent_activities.append({
            "type": "Mock Interview",
            "title": f"{iv.category} ({iv.role})",
            "score": f"{int(iv.overall_score)}/100" if iv.overall_score > 0 else "In Progress",
            "timestamp": iv.created_at.strftime("%b %d, %H:%M")
        })

    practices = db.query(PracticeRecord).order_by(PracticeRecord.created_at.desc()).limit(3).all()
    for pr in practices:
        recent_activities.append({
            "type": f"{pr.category} Practice",
            "title": pr.title,
            "score": f"{pr.score}/100",
            "timestamp": pr.created_at.strftime("%b %d, %H:%M")
        })

    # Sort combined activities by timestamp if available or keep list
    if not recent_activities:
        recent_activities = [
            {"type": "Resume Analysis", "title": "ATS Resume Check", "score": "84/100", "timestamp": "Today, 14:30"},
            {"type": "Mock Interview", "title": "Technical SDE Interview", "score": "88/100", "timestamp": "Yesterday, 18:15"},
            {"type": "Coding Practice", "title": "Two Sum Optimization", "score": "92/100", "timestamp": "2 days ago"}
        ]

    return DashboardStatsResponse(
        user_name=user.name,
        target_role=user.target_role,
        readiness_score=readiness,
        ats_resume_score=ats_score,
        mock_interview_score=mock_score,
        aptitude_score=aptitude_score,
        streak_count=user.streak_count,
        total_practice_hours=round(user.total_practice_minutes / 60.0, 1),
        weak_areas=[
            "System Architecture & Load Balancing",
            "Docker / Kubernetes Containerization",
            "Advanced Dynamic Programming Edge Cases"
        ],
        recent_activities=recent_activities[:6],
        recommendations=[
            "Schedule a mock interview on System Design to boost your Technical score.",
            "Add quantifiable metrics to your recent full-stack projects in your resume.",
            "Solve 2 Medium DSA graph problems to maintain your 5-day practice streak!"
        ]
    )
