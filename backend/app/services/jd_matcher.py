"""
Sarvagya JD Matcher — Job Description vs Resume Gap Analysis
=============================================================
Compares a resume's extracted text against a Job Description (JD) to
identify present, missing, and partial keyword matches from an HR lens.

Supports two modes:
  1. Preset job roles  — curated requirement sets for 25+ common roles
  2. Custom JD text    — user pastes the full job description

No external API needed — pure deterministic NLP.
"""

import re
import logging
from typing import Dict, Any, List, Tuple

logger = logging.getLogger("sarvagya.jd_matcher")


# ─────────────────────────────────────────────────────────────
# PRESET JOB ROLE LIBRARY  (25+ roles)
# ─────────────────────────────────────────────────────────────

PRESET_ROLES: Dict[str, Dict[str, Any]] = {
    # ── Software Engineering ───────────────────────────────────
    "Software Development Engineer (SDE-1)": {
        "required": [
            "data structures", "algorithms", "oop", "python", "java", "c++",
            "rest api", "sql", "git", "unit testing", "problem solving",
        ],
        "preferred": [
            "system design", "agile", "docker", "react", "node.js",
            "microservices", "ci/cd", "aws", "postgresql",
        ],
        "soft_skills": ["communication", "teamwork", "problem solving"],
        "min_experience_years": 0,
        "education": ["b.tech", "b.e.", "bachelor", "computer science", "information technology"],
    },
    "Software Development Engineer (SDE-2)": {
        "required": [
            "system design", "microservices", "rest api", "sql", "nosql",
            "docker", "kubernetes", "ci/cd", "agile", "scrum",
            "python", "java", "javascript", "git", "code review",
        ],
        "preferred": [
            "aws", "azure", "gcp", "kafka", "redis", "elasticsearch",
            "graphql", "terraform", "prometheus", "grafana",
        ],
        "soft_skills": ["leadership", "mentoring", "cross-functional"],
        "min_experience_years": 2,
        "education": ["b.tech", "bachelor", "computer science"],
    },
    "Full Stack Engineer": {
        "required": [
            "react", "node.js", "javascript", "typescript", "rest api",
            "sql", "html", "css", "git", "agile",
        ],
        "preferred": [
            "next.js", "postgresql", "mongodb", "docker", "aws",
            "redux", "tailwind", "graphql", "ci/cd",
        ],
        "soft_skills": ["collaboration", "problem solving"],
        "min_experience_years": 1,
        "education": ["bachelor", "computer science", "b.tech"],
    },
    "Backend Engineer": {
        "required": [
            "python", "java", "go", "rest api", "sql", "postgresql",
            "docker", "git", "microservices", "authentication",
        ],
        "preferred": [
            "kafka", "redis", "kubernetes", "aws", "fastapi", "django",
            "spring boot", "grpc", "celery", "rabbitmq",
        ],
        "soft_skills": ["problem solving", "documentation"],
        "min_experience_years": 1,
        "education": ["bachelor", "computer science"],
    },
    "Frontend Engineer": {
        "required": [
            "react", "javascript", "typescript", "html", "css",
            "responsive design", "git", "rest api",
        ],
        "preferred": [
            "next.js", "vue", "angular", "tailwind", "webpack", "vite",
            "jest", "storybook", "figma", "accessibility",
        ],
        "soft_skills": ["attention to detail", "collaboration"],
        "min_experience_years": 1,
        "education": ["bachelor", "computer science"],
    },

    # ── Data & AI ──────────────────────────────────────────────
    "Data Scientist": {
        "required": [
            "python", "machine learning", "statistics", "sql", "pandas",
            "numpy", "scikit-learn", "data analysis", "model training",
        ],
        "preferred": [
            "tensorflow", "pytorch", "deep learning", "nlp", "spark",
            "tableau", "power bi", "feature engineering", "a/b testing", "mlflow",
        ],
        "soft_skills": ["analytical thinking", "communication", "storytelling"],
        "min_experience_years": 1,
        "education": ["statistics", "mathematics", "computer science", "data science"],
    },
    "Machine Learning Engineer": {
        "required": [
            "python", "machine learning", "tensorflow", "pytorch",
            "scikit-learn", "sql", "docker", "git", "model deployment",
        ],
        "preferred": [
            "mlops", "mlflow", "kubeflow", "kubernetes", "aws sagemaker",
            "feature store", "data pipeline", "airflow", "spark",
        ],
        "soft_skills": ["problem solving", "research"],
        "min_experience_years": 1,
        "education": ["computer science", "mathematics", "data science"],
    },
    "Data Analyst": {
        "required": [
            "sql", "excel", "data analysis", "python", "tableau",
            "visualization", "reporting", "statistics",
        ],
        "preferred": [
            "power bi", "looker", "r", "pandas", "a/b testing",
            "google analytics", "bigquery", "snowflake",
        ],
        "soft_skills": ["analytical thinking", "communication", "attention to detail"],
        "min_experience_years": 0,
        "education": ["statistics", "mathematics", "economics", "computer science"],
    },
    "Data Engineer": {
        "required": [
            "python", "sql", "spark", "airflow", "etl", "data pipeline",
            "aws", "docker", "postgresql", "git",
        ],
        "preferred": [
            "kafka", "databricks", "snowflake", "dbt", "kubernetes",
            "bigquery", "redshift", "terraform", "hadoop",
        ],
        "soft_skills": ["problem solving", "documentation"],
        "min_experience_years": 1,
        "education": ["computer science", "data science", "engineering"],
    },

    # ── DevOps & Cloud ─────────────────────────────────────────
    "DevOps Engineer": {
        "required": [
            "docker", "kubernetes", "ci/cd", "linux", "bash",
            "aws", "terraform", "git", "jenkins", "monitoring",
        ],
        "preferred": [
            "ansible", "helm", "prometheus", "grafana", "argocd",
            "github actions", "vault", "nginx", "python", "go",
        ],
        "soft_skills": ["problem solving", "collaboration", "communication"],
        "min_experience_years": 1,
        "education": ["computer science", "engineering", "information technology"],
    },
    "Cloud Engineer": {
        "required": [
            "aws", "azure", "gcp", "terraform", "docker", "kubernetes",
            "networking", "linux", "iam", "security",
        ],
        "preferred": [
            "ansible", "ci/cd", "python", "go", "cloudformation",
            "serverless", "lambda", "vpc", "load balancer",
        ],
        "soft_skills": ["problem solving", "documentation"],
        "min_experience_years": 1,
        "education": ["computer science", "engineering"],
    },
    "Site Reliability Engineer (SRE)": {
        "required": [
            "linux", "python", "kubernetes", "docker", "monitoring",
            "incident management", "slo", "sla", "observability", "ci/cd",
        ],
        "preferred": [
            "prometheus", "grafana", "datadog", "pagerduty", "elk",
            "terraform", "chaos engineering", "go", "bash",
        ],
        "soft_skills": ["problem solving", "on-call", "communication"],
        "min_experience_years": 2,
        "education": ["computer science", "engineering"],
    },

    # ── Product & Management ───────────────────────────────────
    "Product Manager": {
        "required": [
            "product roadmap", "user research", "agile", "scrum",
            "stakeholder management", "kpis", "jira", "go-to-market",
        ],
        "preferred": [
            "sql", "tableau", "amplitude", "mixpanel", "figma",
            "a/b testing", "okrs", "competitive analysis",
        ],
        "soft_skills": ["leadership", "communication", "strategic thinking"],
        "min_experience_years": 2,
        "education": ["business", "engineering", "mba", "computer science"],
    },
    "Project Manager": {
        "required": [
            "project planning", "agile", "scrum", "risk management",
            "stakeholder communication", "jira", "confluence", "budget management",
        ],
        "preferred": [
            "pmp", "prince2", "ms project", "gantt", "resource allocation",
            "cross-functional", "sprint planning",
        ],
        "soft_skills": ["leadership", "communication", "organization"],
        "min_experience_years": 2,
        "education": ["project management", "business", "engineering"],
    },

    # ── Design ────────────────────────────────────────────────
    "UI/UX Designer": {
        "required": [
            "figma", "user research", "wireframing", "prototyping",
            "usability testing", "design systems", "responsive design",
        ],
        "preferred": [
            "sketch", "adobe xd", "invision", "html", "css",
            "accessibility", "motion design", "framer",
        ],
        "soft_skills": ["empathy", "communication", "attention to detail"],
        "min_experience_years": 1,
        "education": ["design", "human-computer interaction", "arts"],
    },

    # ── Cybersecurity ─────────────────────────────────────────
    "Cybersecurity Analyst": {
        "required": [
            "security", "penetration testing", "siem", "incident response",
            "network security", "vulnerability assessment", "linux",
        ],
        "preferred": [
            "splunk", "kali linux", "owasp", "soc", "firewall",
            "encryption", "iam", "zero trust", "ceh",
        ],
        "soft_skills": ["analytical thinking", "attention to detail", "communication"],
        "min_experience_years": 1,
        "education": ["computer science", "cybersecurity", "information security"],
    },

    # ── Mobile ────────────────────────────────────────────────
    "Android Developer": {
        "required": [
            "android", "kotlin", "java", "android studio", "rest api",
            "mvvm", "jetpack compose", "git",
        ],
        "preferred": [
            "room database", "retrofit", "coroutines", "firebase",
            "play store", "unit testing", "hilt", "ci/cd",
        ],
        "soft_skills": ["problem solving", "attention to detail"],
        "min_experience_years": 1,
        "education": ["computer science", "engineering"],
    },
    "iOS Developer": {
        "required": [
            "swift", "ios", "xcode", "uikit", "swiftui",
            "rest api", "git", "mvvm",
        ],
        "preferred": [
            "combine", "core data", "firebase", "app store",
            "unit testing", "instruments", "ci/cd",
        ],
        "soft_skills": ["problem solving", "attention to detail"],
        "min_experience_years": 1,
        "education": ["computer science", "engineering"],
    },
    "Flutter Developer": {
        "required": [
            "flutter", "dart", "ios", "android", "rest api",
            "firebase", "git", "state management",
        ],
        "preferred": [
            "bloc", "provider", "riverpod", "ci/cd",
            "animations", "responsive ui",
        ],
        "soft_skills": ["problem solving", "collaboration"],
        "min_experience_years": 0,
        "education": ["computer science", "engineering"],
    },

    # ── Emerging / Other ───────────────────────────────────────
    "Blockchain Developer": {
        "required": [
            "solidity", "ethereum", "web3.js", "smart contracts",
            "blockchain", "javascript", "git",
        ],
        "preferred": [
            "hardhat", "truffle", "defi", "nft", "ipfs",
            "rust", "polygon", "react",
        ],
        "soft_skills": ["problem solving", "research"],
        "min_experience_years": 0,
        "education": ["computer science", "engineering"],
    },
    "QA Engineer": {
        "required": [
            "testing", "selenium", "test cases", "bug reporting",
            "agile", "jira", "regression testing", "automation",
        ],
        "preferred": [
            "cypress", "playwright", "pytest", "postman",
            "ci/cd", "api testing", "performance testing",
        ],
        "soft_skills": ["attention to detail", "analytical thinking"],
        "min_experience_years": 0,
        "education": ["computer science", "engineering", "information technology"],
    },
    "Research Engineer / AI Researcher": {
        "required": [
            "python", "deep learning", "pytorch", "tensorflow", "nlp",
            "research", "publications", "mathematics", "statistics",
        ],
        "preferred": [
            "transformers", "hugging face", "llm", "computer vision",
            "reinforcement learning", "latex", "arxiv",
        ],
        "soft_skills": ["analytical thinking", "curiosity", "communication"],
        "min_experience_years": 0,
        "education": ["computer science", "mathematics", "ai", "machine learning"],
    },
    "Business Analyst": {
        "required": [
            "requirements gathering", "stakeholder management", "sql",
            "excel", "process mapping", "documentation", "agile",
        ],
        "preferred": [
            "power bi", "tableau", "jira", "visio",
            "ux", "data analysis", "api testing",
        ],
        "soft_skills": ["communication", "analytical thinking", "problem solving"],
        "min_experience_years": 0,
        "education": ["business", "economics", "computer science"],
    },
}


# ─────────────────────────────────────────────────────────────
# CUSTOM JD TOKENISER
# ─────────────────────────────────────────────────────────────

def _extract_jd_keywords(jd_text: str) -> Tuple[List[str], List[str]]:
    """
    Extract required and preferred keywords from a raw JD text.
    Returns (required_keywords, preferred_keywords).
    """
    jd_lower = jd_text.lower()
    lines = [l.strip() for l in jd_text.splitlines() if l.strip()]

    required: List[str] = []
    preferred: List[str] = []

    # Heuristic: lines under "requirements/must have/required" are required;
    # lines under "nice to have/preferred/bonus" are preferred.
    section = "required"
    for line in lines:
        line_lower = line.lower()
        if any(kw in line_lower for kw in ["preferred", "nice to have", "bonus", "good to have", "desirable", "plus"]):
            section = "preferred"
        elif any(kw in line_lower for kw in ["requirement", "must have", "required", "mandatory", "essential", "qualifications"]):
            section = "required"

        # Extract tech-looking tokens (2+ char, not pure stopwords)
        tokens = re.findall(r"[A-Za-z][A-Za-z0-9+#.\-/]{1,}", line)
        STOPWORDS = {
            "the", "and", "or", "for", "with", "to", "in", "of", "a", "an",
            "is", "are", "be", "will", "you", "we", "our", "your", "have",
            "has", "can", "should", "must", "etc", "us", "this", "that",
            "role", "team", "work", "looking", "candidate", "position", "job",
            "company", "experience", "years", "minimum", "plus", "bonus",
            "ability", "strong", "good", "excellent", "great", "passion",
        }
        for tok in tokens:
            tok_clean = tok.strip().lower()
            if tok_clean not in STOPWORDS and len(tok_clean) > 2:
                if section == "required":
                    required.append(tok_clean)
                else:
                    preferred.append(tok_clean)

    # Deduplicate preserving order
    required = list(dict.fromkeys(required))
    preferred = list(dict.fromkeys(k for k in preferred if k not in required))

    return required[:40], preferred[:25]


# ─────────────────────────────────────────────────────────────
# MAIN MATCHER
# ─────────────────────────────────────────────────────────────

def match_resume_to_jd(
    resume_text: str,
    preset_role: str = "",
    custom_jd: str = "",
) -> Dict[str, Any]:
    """
    Compare resume text against a JD (preset or custom).

    Returns a structured gap analysis dict with:
        jd_match_score      : 0–100
        present_keywords    : list  (in resume + in JD)
        missing_required    : list  (in JD required, NOT in resume)
        missing_preferred   : list  (in JD preferred, NOT in resume)
        partial_matches     : list  (semantic close matches)
        education_gap       : str | None
        experience_gap      : str | None
        jd_recommendations  : list[str]
        match_mode          : "preset" | "custom"
        role_name           : str
    """
    resume_lower = resume_text.lower()

    # ── Mode selection ─────────────────────────────────────────
    if preset_role and preset_role in PRESET_ROLES:
        spec = PRESET_ROLES[preset_role]
        required_kws: List[str] = [k.lower() for k in spec["required"]]
        preferred_kws: List[str] = [k.lower() for k in spec["preferred"]]
        soft_skills: List[str] = [k.lower() for k in spec.get("soft_skills", [])]
        edu_keywords: List[str] = [k.lower() for k in spec.get("education", [])]
        min_exp: int = spec.get("min_experience_years", 0)
        role_name = preset_role
        match_mode = "preset"
    elif custom_jd and custom_jd.strip():
        required_kws, preferred_kws = _extract_jd_keywords(custom_jd)
        soft_skills = []
        edu_keywords = []
        min_exp = 0
        role_name = "Custom JD"
        match_mode = "custom"
    else:
        return {
            "jd_match_score": 0,
            "present_keywords": [],
            "missing_required": [],
            "missing_preferred": [],
            "partial_matches": [],
            "education_gap": None,
            "experience_gap": None,
            "jd_recommendations": ["Provide a preset role or custom JD to run gap analysis."],
            "match_mode": "none",
            "role_name": "",
        }

    # ── Keyword matching ───────────────────────────────────────
    present_required: List[str] = []
    missing_required: List[str] = []
    present_preferred: List[str] = []
    missing_preferred: List[str] = []

    for kw in required_kws:
        if kw in resume_lower:
            present_required.append(kw)
        else:
            missing_required.append(kw)

    for kw in preferred_kws:
        if kw in resume_lower:
            present_preferred.append(kw)
        else:
            missing_preferred.append(kw)

    # All present keywords combined
    present_keywords = present_required + present_preferred

    # ── Partial / semantic matches ─────────────────────────────
    # Simple substring / alias matching
    ALIASES = {
        "javascript": ["js", "node.js", "react", "typescript"],
        "typescript": ["ts"],
        "postgresql": ["postgres", "psql"],
        "kubernetes": ["k8s"],
        "machine learning": ["ml", "sklearn", "scikit"],
        "continuous integration": ["ci/cd", "jenkins", "github actions"],
        "amazon web services": ["aws"],
        "google cloud": ["gcp"],
        "react": ["reactjs", "react.js"],
        "python": ["py", "django", "flask", "fastapi"],
        "docker": ["container", "containerize"],
    }

    partial_matches: List[str] = []
    still_missing: List[str] = []
    for kw in missing_required:
        found_partial = False
        aliases = ALIASES.get(kw, [])
        for alias in aliases:
            if alias in resume_lower:
                partial_matches.append(f"{kw} (via '{alias}')")
                found_partial = True
                break
        if not found_partial:
            still_missing.append(kw)
    missing_required = still_missing

    # ── Score calculation ──────────────────────────────────────
    total_required = max(1, len(required_kws))
    total_preferred = max(1, len(preferred_kws))

    req_score = (len(present_required) + len(partial_matches) * 0.5) / total_required * 70
    pref_score = len(present_preferred) / total_preferred * 20
    soft_score = sum(1 for s in soft_skills if s in resume_lower) / max(1, len(soft_skills)) * 10 if soft_skills else 5

    jd_match_score = min(100, int(req_score + pref_score + soft_score))

    # ── Education gap ──────────────────────────────────────────
    education_gap = None
    if edu_keywords:
        edu_found = any(e in resume_lower for e in edu_keywords)
        if not edu_found:
            education_gap = (
                f"Preferred education background not detected. "
                f"Role typically requires: {', '.join(edu_keywords[:4])}."
            )

    # ── Experience gap ─────────────────────────────────────────
    experience_gap = None
    if min_exp > 0:
        year_matches = re.findall(r"(\d+)\+?\s*(?:years?|yrs?)\s+(?:of\s+)?(?:experience|exp)", resume_lower)
        years_found = max((int(y) for y in year_matches), default=0)
        if years_found < min_exp:
            experience_gap = (
                f"Role requires {min_exp}+ years of experience. "
                f"Resume mentions ~{years_found} year(s). "
                f"Quantify your experience duration more explicitly."
            )

    # ── Recommendations ────────────────────────────────────────
    recommendations: List[str] = []

    if missing_required:
        top = missing_required[:4]
        recommendations.append(
            f"Add these critical required skills to your resume: {', '.join(top)}. "
            "Weave them naturally into your experience bullet points."
        )

    if missing_preferred:
        top_p = missing_preferred[:3]
        recommendations.append(
            f"Preferred skills you could add (bonus points): {', '.join(top_p)}. "
            "Even a side-project or certification referencing these helps."
        )

    if partial_matches:
        recommendations.append(
            f"Use exact JD terminology for these partially matched skills: "
            f"{', '.join(m.split(' (via')[0] for m in partial_matches[:3])}. "
            "Exact keyword matching increases ATS score."
        )

    if education_gap:
        recommendations.append(education_gap)

    if experience_gap:
        recommendations.append(experience_gap)

    if jd_match_score >= 75:
        recommendations.append(
            "Strong JD alignment! Tailor your resume summary to explicitly mention "
            f"'{role_name}' to improve relevance scoring."
        )

    if not recommendations:
        recommendations.append(
            "Excellent match! Your resume covers most of the JD requirements. "
            "Ensure your summary and title align with the role name."
        )

    return {
        "jd_match_score": jd_match_score,
        "present_keywords": present_keywords[:20],
        "missing_required": missing_required[:15],
        "missing_preferred": missing_preferred[:10],
        "partial_matches": partial_matches[:8],
        "education_gap": education_gap,
        "experience_gap": experience_gap,
        "jd_recommendations": recommendations,
        "match_mode": match_mode,
        "role_name": role_name,
    }


def get_preset_role_names() -> List[str]:
    """Return sorted list of all available preset role names."""
    return sorted(PRESET_ROLES.keys())
