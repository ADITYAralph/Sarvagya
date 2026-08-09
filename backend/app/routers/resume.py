import json
from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import ResumeAnalysis
from app.services.pdf_service import extract_text_from_pdf
from app.services.nvidia_service import nvidia_service
from app.schemas.resume import ResumeAnalysisResponse

router = APIRouter(prefix="/api/resume", tags=["Resume Analysis"])

@router.post("/analyze", response_model=ResumeAnalysisResponse)
async def analyze_resume(
    file: UploadFile = File(...),
    target_role: str = Form("Software Development Engineer (SDE-1)"),
    db: Session = Depends(get_db)
):
    if not file.filename.endswith((".pdf", ".PDF")):
        raise HTTPException(status_code=400, detail="Only PDF files are supported for resume analysis.")
    
    contents = await file.read()
    resume_text = extract_text_from_pdf(contents)
    
    analysis_result = nvidia_service.analyze_resume(resume_text, target_role)
    
    # Save scan to database
    db_scan = ResumeAnalysis(
        filename=file.filename,
        target_role=target_role,
        overall_score=analysis_result.get("overall_score", 80),
        formatting_score=analysis_result.get("formatting_score", 85),
        skills_score=analysis_result.get("skills_score", 75),
        impact_score=analysis_result.get("impact_score", 75),
        relevance_score=analysis_result.get("relevance_score", 80),
        missing_keywords=json.dumps(analysis_result.get("missing_keywords", [])),
        suggestions=json.dumps(analysis_result.get("suggestions", [])),
        strengths=json.dumps(analysis_result.get("strengths", []))
    )
    db.add(db_scan)
    db.commit()
    db.refresh(db_scan)
    
    return ResumeAnalysisResponse(
        id=db_scan.id,
        filename=file.filename,
        target_role=target_role,
        overall_score=analysis_result.get("overall_score", 80),
        formatting_score=analysis_result.get("formatting_score", 85),
        skills_score=analysis_result.get("skills_score", 75),
        impact_score=analysis_result.get("impact_score", 75),
        relevance_score=analysis_result.get("relevance_score", 80),
        missing_keywords=analysis_result.get("missing_keywords", []),
        suggestions=analysis_result.get("suggestions", []),
        strengths=analysis_result.get("strengths", [])
    )

@router.get("/history")
def get_resume_history(db: Session = Depends(get_db)):
    scans = db.query(ResumeAnalysis).order_by(ResumeAnalysis.created_at.desc()).limit(10).all()
    results = []
    for s in scans:
        results.append({
            "id": s.id,
            "filename": s.filename,
            "target_role": s.target_role,
            "overall_score": s.overall_score,
            "created_at": s.created_at.strftime("%Y-%m-%d %H:%M")
        })
    return results
