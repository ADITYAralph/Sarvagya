"""
Unit tests for the Sarvagya ATS Scorer engine.
Tests word classification, section detection, scoring dimensions, and full analysis.
"""

import pytest
import sys
import os

# Ensure the backend app is importable
sys.path.insert(0, os.path.dirname(__file__))

from app.services.ats_scorer import (
    classify_word,
    detect_filler_phrases,
    detect_metrics,
    score_section,
    compute_full_analysis,
    _detect_role_family,
    _detect_sections,
    _compute_grade,
)


# ─── Sample Resume Texts ───────────────────────────────────

STRONG_RESUME = """
Summary
Experienced Software Engineer with 5+ years building scalable web applications.

Experience
Senior Software Engineer | TechCorp | 2021 - Present
• Engineered a high-throughput REST API using Python and FastAPI, reducing latency by 40% across 100K daily users.
• Architected microservices deployment on Kubernetes with Docker containers, achieving 99.9% uptime.
• Optimized PostgreSQL queries with indexing strategies, improving response times from 800ms to 120ms.
• Led a team of 4 engineers to deliver a real-time analytics dashboard using React and TypeScript.

Software Engineer | StartupXYZ | 2019 - 2021
• Developed full-stack web application using Next.js, Node.js, and MongoDB serving 50K monthly active users.
• Implemented CI/CD pipeline with GitHub Actions, reducing deployment time by 60%.
• Built automated test suite achieving 92% code coverage with Jest and Pytest.

Education
B.Tech Computer Science | IIT Delhi | 2019 | GPA: 8.9/10

Skills
Python, JavaScript, TypeScript, React, Next.js, Node.js, FastAPI, Django,
PostgreSQL, MongoDB, Redis, Docker, Kubernetes, AWS, Git, CI/CD, REST API, GraphQL

Projects
• Real-time Chat Application: Built with WebSocket, Node.js, and Redis pub/sub. Handles 10K concurrent connections.
• ML Pipeline: Deployed TensorFlow model on AWS SageMaker with 95% accuracy for sentiment classification.
"""

WEAK_RESUME = """
I am a hard worker and fast learner who is passionate about technology.

I worked on various projects and was responsible for helping with different tasks.
I participated in team activities and assisted with software development duties.

Skills: computers, Microsoft Office, typing

I am a team player who is detail oriented and self motivated.
"""

MEDIUM_RESUME = """
Experience

Software Developer at Company
- Worked on backend development using Python
- Responsible for building APIs
- Helped with database management

Education
B.Sc. Computer Science, University of XYZ, 2022

Skills
Python, Java, SQL, HTML, CSS, Git
"""


# ─── Word Classification Tests ─────────────────────────────

class TestWordClassification:
    def test_action_verb_detected(self):
        cls, score = classify_word("Engineered", "software")
        assert cls == "action_verb"
        assert score > 0

    def test_action_verb_case_insensitive(self):
        cls, _ = classify_word("OPTIMIZED", "software")
        assert cls == "action_verb"

    def test_filler_word_detected(self):
        cls, score = classify_word("responsible", "software")
        assert cls == "filler"
        assert score < 0

    def test_strong_keyword_detected(self):
        cls, score = classify_word("python", "software")
        assert cls == "strong_keyword"
        assert score > 0

    def test_metric_detected(self):
        cls, score = classify_word("40%", "software")
        assert cls == "metric"
        assert score > 0

    def test_neutral_word(self):
        cls, score = classify_word("the", "software")
        assert cls == "neutral"
        assert score == 0.0

    def test_short_word_neutral(self):
        cls, _ = classify_word("is", "software")
        assert cls == "neutral"

    def test_data_role_keyword(self):
        cls, _ = classify_word("pandas", "data")
        assert cls == "strong_keyword"


# ─── Filler Phrase Detection Tests ─────────────────────────

class TestFillerPhrases:
    def test_detects_responsible_for(self):
        text = "Was responsible for managing the team."
        results = detect_filler_phrases(text)
        assert len(results) >= 1
        assert any("responsible for" in r["phrase"].lower() for r in results)

    def test_detects_worked_on(self):
        text = "I worked on several projects during my tenure."
        results = detect_filler_phrases(text)
        assert len(results) >= 1

    def test_no_false_positives(self):
        text = "Engineered a high-performance API reducing latency by 40%."
        results = detect_filler_phrases(text)
        assert len(results) == 0

    def test_multiple_fillers(self):
        text = "Was responsible for working on various tasks. Helped with database management."
        results = detect_filler_phrases(text)
        assert len(results) >= 2


# ─── Metric Detection Tests ───────────────────────────────

class TestMetricDetection:
    def test_percentage(self):
        results = detect_metrics("Improved performance by 40%")
        assert len(results) >= 1

    def test_dollar_amount(self):
        results = detect_metrics("Generated $50,000 in revenue")
        assert len(results) >= 1

    def test_user_count(self):
        results = detect_metrics("Serving 100K users daily")
        assert len(results) >= 1

    def test_no_metrics(self):
        results = detect_metrics("Worked on a project for the team")
        assert len(results) == 0


# ─── Section Detection Tests ──────────────────────────────

class TestSectionDetection:
    def test_detects_standard_sections(self):
        sections = _detect_sections(STRONG_RESUME)
        section_names = [s["name"] for s in sections]
        assert "experience" in section_names
        assert "education" in section_names
        assert "skills" in section_names

    def test_detects_projects_section(self):
        sections = _detect_sections(STRONG_RESUME)
        section_names = [s["name"] for s in sections]
        assert "projects" in section_names

    def test_weak_resume_minimal_sections(self):
        sections = _detect_sections(WEAK_RESUME)
        section_names = [s["name"] for s in sections]
        # Weak resume may have very few recognized sections
        assert len(sections) >= 1


# ─── Role Family Detection Tests ──────────────────────────

class TestRoleFamily:
    def test_software_engineer(self):
        assert _detect_role_family("Software Engineer") == "software"
    
    def test_data_scientist(self):
        assert _detect_role_family("Data Scientist") == "data"
    
    def test_devops_engineer(self):
        assert _detect_role_family("DevOps Engineer") == "devops"
    
    def test_product_manager(self):
        assert _detect_role_family("Product Manager") == "product"
    
    def test_sde_default_software(self):
        assert _detect_role_family("SDE-1") == "software"


# ─── Grade Calculation Tests ──────────────────────────────

class TestGradeCalculation:
    def test_a_plus(self):
        assert _compute_grade(97) == "A+"
    
    def test_b(self):
        assert _compute_grade(76) == "B"
    
    def test_f(self):
        assert _compute_grade(30) == "F"
    
    def test_boundary_90(self):
        assert _compute_grade(90) == "A"
    
    def test_boundary_0(self):
        assert _compute_grade(0) == "F"


# ─── Section Scoring Tests ────────────────────────────────

class TestSectionScoring:
    def test_experience_section_strong(self):
        experience_text = """
        Experience
        • Engineered a REST API using Python and FastAPI, reducing latency by 40%.
        • Deployed microservices on Kubernetes with Docker achieving 99.9% uptime.
        • Optimized PostgreSQL queries improving response times by 60%.
        """
        result = score_section("experience", experience_text, "software")
        assert result["score"] > 60
        assert result["action_verb_count"] > 0

    def test_skills_section_rich(self):
        skills_text = "Python, JavaScript, TypeScript, React, Docker, Kubernetes, AWS, PostgreSQL, Redis, Git"
        result = score_section("skills", skills_text, "software")
        assert result["score"] > 50
        assert result["keyword_density"] > 0

    def test_empty_section(self):
        result = score_section("experience", "", "software")
        assert result["score"] == 0


# ─── Full Analysis Integration Tests ──────────────────────

class TestFullAnalysis:
    def test_strong_resume_high_score(self):
        result = compute_full_analysis(STRONG_RESUME, "Software Engineer")
        assert result["overall_score"] >= 55
        assert result["grade"] in ("A+", "A", "A-", "B+", "B")
        assert result["strong_keyword_count"] > 5
        assert result["action_verb_count"] > 3
        assert len(result["matching_skills"]) > 5
        assert len(result["word_annotations"]) > 0
        assert len(result["section_scores"]) > 0

    def test_weak_resume_low_score(self):
        result = compute_full_analysis(WEAK_RESUME, "Software Engineer")
        assert result["overall_score"] < 50
        assert result["filler_count"] > 3
        assert len(result["suggestions"]) > 0
        assert len(result["weak_phrases"]) > 0

    def test_deterministic_same_input(self):
        """Same input must produce identical output."""
        r1 = compute_full_analysis(STRONG_RESUME, "Software Engineer")
        r2 = compute_full_analysis(STRONG_RESUME, "Software Engineer")
        assert r1["overall_score"] == r2["overall_score"]
        assert r1["grade"] == r2["grade"]
        assert r1["keyword_match_score"] == r2["keyword_match_score"]

    def test_different_roles_different_scores(self):
        """Different target roles should produce different keyword scores."""
        r_swe = compute_full_analysis(STRONG_RESUME, "Software Engineer")
        r_ds = compute_full_analysis(STRONG_RESUME, "Data Scientist")
        # The SWE resume should score differently for Data Science role
        assert r_swe["keyword_match_score"] != r_ds["keyword_match_score"] or \
               r_swe["technical_depth_score"] != r_ds["technical_depth_score"]

    def test_analysis_has_12_dimensions(self):
        result = compute_full_analysis(STRONG_RESUME, "Software Engineer")
        dimensions = [
            "keyword_match_score", "action_verb_score", "quantified_impact_score",
            "section_completeness_score", "formatting_score", "readability_score",
            "relevance_score", "brevity_score", "technical_depth_score",
            "ats_parsability_score", "consistency_score", "professional_tone_score"
        ]
        for dim in dimensions:
            assert dim in result, f"Missing dimension: {dim}"
            assert 0 <= result[dim] <= 100, f"{dim} out of range: {result[dim]}"

    def test_analysis_has_resume_text(self):
        result = compute_full_analysis(STRONG_RESUME, "Software Engineer")
        assert "resume_text" in result
        assert len(result["resume_text"]) > 0

    def test_medium_resume_middle_score(self):
        result = compute_full_analysis(MEDIUM_RESUME, "Software Developer")
        # Should score between weak and strong
        assert 20 <= result["overall_score"] <= 75
        assert result["filler_count"] > 0  # has "worked on", "responsible for"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
