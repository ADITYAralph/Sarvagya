import json
import asyncio
import logging
from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException
from fastapi.responses import StreamingResponse, JSONResponse
from sqlalchemy.orm import Session
from typing import Optional

from app.db.database import get_db
from app.db.models import ResumeAnalysis
from app.services.doc_service import validate_and_extract
from app.services.nvidia_service import nvidia_service
from app.services.ats_scorer import compute_full_analysis
from app.services.jd_matcher import match_resume_to_jd, get_preset_role_names
from app.schemas.resume import ResumeAnalysisResponse
from app.schemas.ats_schemas import ATSDeepAnalysis, JDMatchResult

logger = logging.getLogger("sarvagya.resume_router")

router = APIRouter(prefix="/api/resume", tags=["Resume Analysis"])


# ─── Preset roles list ──────────────────────────────────────
@router.get("/preset-roles")
def list_preset_roles():
    """Return all available preset job role names for JD matching."""
    return {"roles": get_preset_role_names()}


# ─── Deep ATS Word-Level Analysis (DOCX only) ───────────────
@router.post("/analyze-deep", response_model=ATSDeepAnalysis)
async def analyze_resume_deep(
    file: UploadFile = File(...),
    target_role: str = Form("Full Stack Software Engineer"),
    preset_role: str = Form(""),
    custom_jd: str = Form(""),
    db: Session = Depends(get_db)
):
    """
    Deep word-level ATS analysis for .docx resumes with 12-dimension scoring.
    Optionally cross-references against a preset job role or custom JD for gap analysis.
    
    - file        : .docx Word document (ONLY)
    - target_role : Role name used for ATS scoring keyword matching
    - preset_role : (Optional) Preset role for JD gap analysis
    - custom_jd   : (Optional) Raw JD text for custom gap analysis
    """
    # ── File type enforcement ────────────────────────────────
    filename = file.filename or ""
    ext = ("."+filename.rsplit(".",1)[-1].lower()) if "." in filename else ""
    if ext not in (".docx", ".pdf"):
        raise HTTPException(
            status_code=415,
            detail={
                "error": "INVALID_FILE_TYPE",
                "message": (
                    f"File '{filename}' is not accepted. "
                    "Only .pdf and .docx resume files are supported. "
                    "Please upload your resume in one of these formats."
                )
            }
        )

    contents = await file.read()
    doc_data = validate_and_extract(contents, filename)

    # ── Resume content validation ────────────────────────────
    if not doc_data["is_valid"]:
        return ATSDeepAnalysis(
            overall_score=5, grade="F",
            keyword_match_score=0, action_verb_score=0, quantified_impact_score=0,
            section_completeness_score=0, formatting_score=0, readability_score=0,
            relevance_score=0, brevity_score=0, technical_depth_score=0,
            ats_parsability_score=0, consistency_score=0, professional_tone_score=0,
            total_words=doc_data.get("word_count", 0),
            missing_keywords=["Valid Resume Document"],
            suggestions=["Upload a genuine .pdf or .docx resume with standard sections (Experience, Education, Skills, Projects)."],
            filename=filename, target_role=target_role,
            is_valid=False, error_message=doc_data.get("error_reason", "Invalid document.")
        )

    # ── Run deterministic ATS scoring + NVIDIA LLM concurrently ──

    def _run_deterministic():
        return compute_full_analysis(doc_data["text"], target_role)

    def _run_llm(det_result):
        return nvidia_service.enhance_ats_analysis(
            dict(det_result), doc_data["text"], target_role
        )

    # Start deterministic scorer immediately (fast, ~0.5s)
    analysis = await asyncio.to_thread(_run_deterministic)

    # Run LLM enhancement concurrently with a hard 30s cap
    try:
        analysis = await asyncio.wait_for(
            asyncio.to_thread(_run_llm, analysis),
            timeout=30.0
        )
    except asyncio.TimeoutError:
        logger.warning("NVIDIA NIM enhancement timed out after 30s — returning deterministic result.")
    except Exception as e:
        logger.warning(f"NVIDIA NIM enhancement failed — returning deterministic result: {e}")

    # ── JD Gap Analysis (if requested) ──────────────────────
    jd_match_result = None
    if preset_role.strip() or custom_jd.strip():
        jd_raw = match_resume_to_jd(
            resume_text=doc_data["text"],
            preset_role=preset_role.strip(),
            custom_jd=custom_jd.strip(),
        )
        jd_match_result = JDMatchResult(**jd_raw)

    # ── Persist to DB ────────────────────────────────────────
    try:
        db_scan = ResumeAnalysis(
            filename=filename,
            target_role=target_role,
            overall_score=analysis["overall_score"],
            formatting_score=analysis["formatting_score"],
            skills_score=analysis["keyword_match_score"],
            impact_score=analysis["quantified_impact_score"],
            relevance_score=analysis["relevance_score"],
            matching_skills=json.dumps(analysis.get("matching_skills", [])),
            missing_keywords=json.dumps(analysis.get("missing_keywords", [])),
            suggestions=json.dumps(analysis.get("suggestions", [])),
            strengths=json.dumps(analysis.get("strengths", [])),
            grade=analysis["grade"],
            total_words=analysis["total_words"],
            strong_keyword_count=analysis["strong_keyword_count"],
            filler_count=analysis["filler_count"],
            word_annotations_json=json.dumps(analysis.get("word_annotations", [])[:200]),
            section_scores_json=json.dumps(analysis.get("section_scores", [])),
        )
        db.add(db_scan)
        db.commit()
        db.refresh(db_scan)
    except Exception as e:
        logger.warning(f"Failed to persist deep analysis to DB: {e}")

    # ── Build response ───────────────────────────────────────
    return ATSDeepAnalysis(
        overall_score=analysis["overall_score"],
        grade=analysis["grade"],
        keyword_match_score=analysis["keyword_match_score"],
        action_verb_score=analysis["action_verb_score"],
        quantified_impact_score=analysis["quantified_impact_score"],
        section_completeness_score=analysis["section_completeness_score"],
        formatting_score=analysis["formatting_score"],
        readability_score=analysis["readability_score"],
        relevance_score=analysis["relevance_score"],
        brevity_score=analysis["brevity_score"],
        technical_depth_score=analysis["technical_depth_score"],
        ats_parsability_score=analysis["ats_parsability_score"],
        consistency_score=analysis["consistency_score"],
        professional_tone_score=analysis["professional_tone_score"],
        word_annotations=analysis["word_annotations"],
        total_words=analysis["total_words"],
        strong_keyword_count=analysis["strong_keyword_count"],
        action_verb_count=analysis["action_verb_count"],
        metric_count=analysis["metric_count"],
        filler_count=analysis["filler_count"],
        section_scores=analysis["section_scores"],
        matching_skills=analysis["matching_skills"],
        missing_keywords=analysis["missing_keywords"],
        weak_phrases=analysis["weak_phrases"],
        strengths=analysis["strengths"],
        suggestions=analysis["suggestions"],
        resume_text=analysis.get("resume_text", ""),
        filename=filename,
        target_role=target_role,
        is_valid=True,
        jd_match=jd_match_result,
    )


# ─── SSE Streaming Analysis (DOCX) ─────────────────────────
@router.post("/analyze-stream")
async def analyze_resume_stream(
    file: UploadFile = File(...),
    target_role: str = Form("Full Stack Software Engineer"),
    preset_role: str = Form(""),
    custom_jd: str = Form(""),
):
    """
    SSE streaming endpoint — streams analysis events in real time:
    start → section_score (per section) → word_batch (per 50 words)
    → dimension_scores → jd_match → final_score → done
    """
    filename = file.filename or ""
    ext = ("."+filename.rsplit(".",1)[-1].lower()) if "." in filename else ""
    if ext not in (".docx", ".pdf"):
        raise HTTPException(
            status_code=415,
            detail={"error": "INVALID_FILE_TYPE", "message": "Only .pdf and .docx files are accepted."}
        )

    contents = await file.read()
    doc_data = validate_and_extract(contents, filename)

    async def event_generator():
        yield f"data: {json.dumps({'event': 'start', 'filename': filename, 'target_role': target_role})}\n\n"
        await asyncio.sleep(0.05)

        if not doc_data["is_valid"]:
            yield f"data: {json.dumps({'event': 'error', 'message': doc_data.get('error_reason', 'Invalid document')})}\n\n"
            return

        analysis = compute_full_analysis(doc_data["text"], target_role)

        for sec in analysis.get("section_scores", []):
            yield f"data: {json.dumps({'event': 'section_score', 'section': sec})}\n\n"
            await asyncio.sleep(0.1)

        annotations = analysis.get("word_annotations", [])
        for i in range(0, len(annotations), 50):
            batch = annotations[i:i + 50]
            yield f"data: {json.dumps({'event': 'word_batch', 'batch_index': i // 50, 'words': batch})}\n\n"
            await asyncio.sleep(0.05)

        dimensions = {
            k: analysis[k] for k in [
                "keyword_match_score", "action_verb_score", "quantified_impact_score",
                "section_completeness_score", "formatting_score", "readability_score",
                "relevance_score", "brevity_score", "technical_depth_score",
                "ats_parsability_score", "consistency_score", "professional_tone_score",
            ]
        }
        yield f"data: {json.dumps({'event': 'dimension_scores', 'dimensions': dimensions})}\n\n"
        await asyncio.sleep(0.05)

        # JD matching event
        if preset_role.strip() or custom_jd.strip():
            jd_raw = match_resume_to_jd(doc_data["text"], preset_role.strip(), custom_jd.strip())
            yield f"data: {json.dumps({'event': 'jd_match', **jd_raw})}\n\n"
            await asyncio.sleep(0.05)

        final = {k: v for k, v in analysis.items() if k not in ("word_annotations", "resume_text")}
        final["event"] = "final_score"
        final["resume_text"] = analysis.get("resume_text", "")
        yield f"data: {json.dumps(final)}\n\n"
        yield f"data: {json.dumps({'event': 'done'})}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "Connection": "keep-alive", "X-Accel-Buffering": "no"},
    )


# ─── Scan history ───────────────────────────────────────────
@router.get("/history")
def get_resume_history(db: Session = Depends(get_db)):
    scans = db.query(ResumeAnalysis).order_by(ResumeAnalysis.created_at.desc()).limit(10).all()
    return [
        {
            "id": s.id,
            "filename": s.filename,
            "target_role": s.target_role,
            "overall_score": s.overall_score,
            "grade": getattr(s, "grade", None),
            "created_at": s.created_at.strftime("%Y-%m-%d %H:%M"),
        }
        for s in scans
    ]
