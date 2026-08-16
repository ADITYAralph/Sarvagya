"""
Pydantic schemas for the deep ATS word-level analysis response.
Includes JDMatchResult for Job Description gap analysis.
"""
from typing import List, Optional, Dict, Any
from pydantic import BaseModel


class WordAnnotation(BaseModel):
    word: str
    classification: str  # strong_keyword | action_verb | metric | filler | buzzword | neutral
    impact_score: float  # -1.0 to +1.0
    line: int
    position: int


class SectionScore(BaseModel):
    section_name: str
    score: int  # 0-100
    keyword_density: float
    action_verb_count: int
    metric_count: int
    filler_count: int
    feedback: str


class WeakPhrase(BaseModel):
    phrase: str
    location: str
    line: int
    char_start: int
    rewrite: str


class ATSDeepAnalysis(BaseModel):
    # Overall
    overall_score: int
    grade: str  # A+ through F

    # 12-Dimension scores (each 0-100)
    keyword_match_score: int
    action_verb_score: int
    quantified_impact_score: int
    section_completeness_score: int
    formatting_score: int
    readability_score: int
    relevance_score: int
    brevity_score: int
    technical_depth_score: int
    ats_parsability_score: int
    consistency_score: int
    professional_tone_score: int

    # Word-level data
    word_annotations: List[WordAnnotation] = []
    total_words: int = 0
    strong_keyword_count: int = 0
    action_verb_count: int = 0
    metric_count: int = 0
    filler_count: int = 0

    # Section data
    section_scores: List[SectionScore] = []

    # Actionable output
    matching_skills: List[str] = []
    missing_keywords: List[str] = []
    weak_phrases: List[WeakPhrase] = []
    strengths: List[str] = []
    suggestions: List[str] = []

    # Resume text for frontend annotation rendering
    resume_text: str = ""

    # Metadata
    filename: Optional[str] = None
    target_role: Optional[str] = None
    is_valid: bool = True
    error_message: Optional[str] = None

    # Optional JD gap analysis (populated when JD is provided)
    jd_match: Optional["JDMatchResult"] = None


class JDMatchResult(BaseModel):
    """Result of matching a resume against a Job Description."""
    jd_match_score: int = 0              # 0-100
    present_keywords: List[str] = []
    missing_required: List[str] = []
    missing_preferred: List[str] = []
    partial_matches: List[str] = []
    education_gap: Optional[str] = None
    experience_gap: Optional[str] = None
    jd_recommendations: List[str] = []
    match_mode: str = "none"             # "preset" | "custom" | "none"
    role_name: str = ""


# Allow ATSDeepAnalysis to reference JDMatchResult (forward ref)
ATSDeepAnalysis.model_rebuild()
