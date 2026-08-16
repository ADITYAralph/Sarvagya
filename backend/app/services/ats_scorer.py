"""
Sarvagya ATS Scorer — Word-Level Resume Analysis Engine
=========================================================
Pure-Python deterministic engine that classifies every word in a resume,
scores across 12 professional dimensions, and produces a granular
analysis comparable to enterprise ATS systems.

No LLM dependency — works fully offline with built-in dictionaries.
"""

import re
import math
import logging
from typing import Dict, Any, List, Tuple, Optional
from collections import Counter

logger = logging.getLogger("sarvagya.ats_scorer")

# ─────────────────────────────────────────────────────────────
# DICTIONARIES
# ─────────────────────────────────────────────────────────────

ACTION_VERBS = {
    # Leadership & Management
    "led", "managed", "directed", "oversaw", "supervised", "coordinated",
    "mentored", "guided", "spearheaded", "championed", "orchestrated",
    "headed", "facilitated", "delegated", "administered",
    # Achievement & Impact
    "achieved", "accomplished", "delivered", "exceeded", "surpassed",
    "attained", "completed", "earned", "generated", "produced",
    "maximized", "outperformed", "secured",
    # Engineering & Technical
    "engineered", "developed", "designed", "implemented", "built",
    "architected", "programmed", "coded", "deployed", "configured",
    "integrated", "automated", "optimized", "refactored", "debugged",
    "compiled", "tested", "migrated", "provisioned", "containerized",
    "scaled", "benchmarked", "profiled", "instrumented", "parallelized",
    "serialized", "modularized", "decoupled", "abstracted",
    # Analysis & Research
    "analyzed", "researched", "evaluated", "assessed", "investigated",
    "examined", "identified", "discovered", "diagnosed", "audited",
    "measured", "quantified", "validated", "benchmarked", "surveyed",
    "forecasted", "modeled", "simulated",
    # Creation & Innovation
    "created", "invented", "pioneered", "initiated", "launched",
    "established", "founded", "introduced", "innovated", "prototyped",
    "conceptualized", "formulated", "devised", "crafted",
    # Improvement & Optimization
    "improved", "enhanced", "upgraded", "streamlined", "accelerated",
    "boosted", "reduced", "minimized", "eliminated", "resolved",
    "transformed", "revamped", "modernized", "consolidated",
    # Communication & Collaboration
    "presented", "communicated", "documented", "published", "reported",
    "collaborated", "partnered", "negotiated", "liaised", "advocated",
    "articulated", "demonstrated", "trained", "educated", "coached",
    # Planning & Strategy
    "planned", "strategized", "proposed", "recommended", "prioritized",
    "forecasted", "budgeted", "allocated", "scheduled", "mapped",
    "outlined", "structured", "organized", "systematized",
    # Data & Analytics
    "extracted", "aggregated", "transformed", "normalized", "visualized",
    "correlated", "segmented", "classified", "clustered", "predicted",
    "scraped", "ingested", "processed", "parsed", "indexed",
}

FILLER_WORDS = {
    # Vague responsibility words
    "responsible", "responsibilities", "duties", "helped", "assisted",
    "involved", "participated", "contributed", "supported", "handled",
    "utilized", "leveraged", "worked",
    # Empty adjectives / buzzwords
    "various", "numerous", "several", "multiple", "diverse",
    "dynamic", "synergy", "synergies", "proactive", "proactively",
    "passionate", "hardworking", "team-player", "detail-oriented",
    "self-motivated", "results-driven", "go-getter", "guru",
    "ninja", "rockstar", "wizard", "hacker", "enthusiastic",
    # Weak qualifiers
    "very", "really", "basically", "just", "simply",
    "actually", "quite", "somewhat", "fairly", "rather",
    # Redundant phrases (detected as bigrams)
    "etc", "hereby", "thereof", "therein", "aforementioned",
    "respectively", "henceforth",
}

FILLER_PHRASES = [
    "responsible for", "worked on", "helped with", "involved in",
    "participated in", "assisted with", "contributed to",
    "duties included", "tasks included", "was tasked with",
    "in charge of", "day to day", "day-to-day activities",
    "team player", "hard worker", "fast learner",
    "detail oriented", "self starter", "results driven",
    "thinking outside the box", "hit the ground running",
    "wear many hats", "go above and beyond",
]

# Technical keywords per role family
ROLE_KEYWORDS: Dict[str, List[str]] = {
    "software": [
        "python", "java", "javascript", "typescript", "c++", "c#", "go", "rust", "ruby",
        "react", "angular", "vue", "next.js", "node.js", "express", "django", "flask",
        "fastapi", "spring", "spring boot", ".net", "asp.net",
        "html", "css", "tailwind", "bootstrap", "sass",
        "sql", "postgresql", "mysql", "mongodb", "redis", "elasticsearch",
        "docker", "kubernetes", "aws", "azure", "gcp", "terraform", "ansible",
        "git", "github", "gitlab", "ci/cd", "jenkins", "github actions",
        "rest", "rest api", "graphql", "grpc", "websocket", "microservices",
        "linux", "bash", "shell", "nginx", "apache",
        "agile", "scrum", "kanban", "jira",
        "unit testing", "pytest", "jest", "mocha", "selenium",
        "design patterns", "solid", "oop", "functional programming",
        "data structures", "algorithms", "system design",
        "oauth", "jwt", "authentication", "authorization",
        "kafka", "rabbitmq", "celery", "cron",
        "webpack", "vite", "babel", "npm", "yarn",
        "prometheus", "grafana", "datadog", "sentry", "logging",
    ],
    "data": [
        "python", "r", "sql", "spark", "hadoop", "hive", "presto",
        "pandas", "numpy", "scipy", "matplotlib", "seaborn", "plotly",
        "scikit-learn", "tensorflow", "pytorch", "keras", "xgboost",
        "machine learning", "deep learning", "nlp", "computer vision",
        "neural network", "cnn", "rnn", "lstm", "transformer", "bert", "gpt",
        "feature engineering", "model training", "hyperparameter",
        "a/b testing", "statistical analysis", "hypothesis testing",
        "tableau", "power bi", "looker",
        "etl", "data pipeline", "airflow", "dbt",
        "snowflake", "redshift", "bigquery", "databricks",
        "docker", "kubernetes", "aws", "azure", "gcp",
        "git", "github", "ci/cd",
        "mlops", "mlflow", "kubeflow", "sagemaker",
    ],
    "devops": [
        "docker", "kubernetes", "terraform", "ansible", "puppet", "chef",
        "aws", "azure", "gcp", "cloud", "iaas", "paas", "saas",
        "ci/cd", "jenkins", "github actions", "gitlab ci", "circleci",
        "linux", "bash", "shell", "powershell",
        "nginx", "apache", "haproxy", "load balancer",
        "prometheus", "grafana", "datadog", "nagios", "elk",
        "python", "go", "bash scripting",
        "git", "github", "gitlab",
        "networking", "tcp/ip", "dns", "ssl/tls", "vpn",
        "security", "iam", "rbac", "vault",
        "microservices", "service mesh", "istio", "envoy",
        "helm", "kustomize", "argocd", "flux",
        "mongodb", "postgresql", "redis", "rabbitmq", "kafka",
    ],
    "product": [
        "product management", "product strategy", "product roadmap",
        "user research", "user stories", "user experience", "ux",
        "a/b testing", "analytics", "kpis", "okrs", "metrics",
        "agile", "scrum", "kanban", "jira", "confluence",
        "figma", "sketch", "wireframe", "prototype",
        "stakeholder", "cross-functional", "go-to-market",
        "sql", "tableau", "amplitude", "mixpanel",
        "market analysis", "competitive analysis",
        "prioritization", "backlog", "sprint planning",
    ],
}

# Section header patterns
SECTION_PATTERNS = {
    "summary": [
        r"(?:professional\s+)?summary", r"objective", r"about\s+me", r"profile",
        r"career\s+(?:summary|objective|profile)",
    ],
    "experience": [
        r"(?:work\s+)?experience", r"employment(?:\s+history)?", r"work\s+history",
        r"professional\s+experience", r"career\s+history",
    ],
    "education": [
        r"education(?:al\s+background)?", r"academic(?:\s+background)?",
        r"qualifications", r"degrees?",
    ],
    "skills": [
        r"(?:technical\s+)?skills", r"competenc(?:ies|e)", r"technologies",
        r"tech(?:nical)?\s+stack", r"tools?\s+(?:and|&)\s+technologies",
        r"areas?\s+of\s+expertise", r"proficienc(?:ies|y)",
    ],
    "projects": [
        r"projects?", r"(?:key\s+)?projects?", r"personal\s+projects?",
        r"academic\s+projects?", r"portfolio",
    ],
    "certifications": [
        r"certifications?", r"licenses?\s+(?:and|&)\s+certifications?",
        r"professional\s+development", r"credentials?",
    ],
    "achievements": [
        r"achievements?", r"awards?\s+(?:and|&)\s+(?:honors?|achievements?)",
        r"honors?", r"recognition",
    ],
    "publications": [
        r"publications?", r"papers?", r"research",
    ],
}

# Metric patterns for quantified impact detection
METRIC_PATTERNS = [
    r"\d+\.?\d*\s*%",           # 40%, 3.5%
    r"\$\s*\d[\d,]*\.?\d*",     # $50,000, $1.2M
    r"\d[\d,]*\.?\d*\s*(?:users?|customers?|clients?|requests?|transactions?)",
    r"\d[\d,]*\.?\d*\s*(?:ms|seconds?|minutes?|hours?|days?)",
    r"\d[\d,]*\.?\d*\s*(?:x|X)\b",  # 3x, 10x
    r"\d[\d,]*\.?\d*\s*(?:k|K|m|M|b|B)\b",  # 50K, 1M
    r"(?:top|bottom)\s*\d+\s*%",
    r"\d+\s*(?:out\s+of|\/)\s*\d+",
    r"#\s*\d+",                  # #1, #3
    r"\d+\+?\s*(?:projects?|repositories|repos?|applications?|apis?|endpoints?|microservices?)",
]


# ─────────────────────────────────────────────────────────────
# HELPER FUNCTIONS
# ─────────────────────────────────────────────────────────────

def _detect_role_family(target_role: str) -> str:
    """Map a target role string to a keyword family."""
    role_lower = target_role.lower()
    
    if any(w in role_lower for w in ["data", "ml", "machine learning", "ai", "analyst", "scientist"]):
        return "data"
    if any(w in role_lower for w in ["devops", "sre", "infrastructure", "cloud", "platform"]):
        return "devops"
    if any(w in role_lower for w in ["product", "program", "project manager"]):
        return "product"
    return "software"


def _detect_sections(text: str) -> List[Dict[str, Any]]:
    """
    Split resume text into labeled sections based on header patterns.
    Returns a list of {name, start_line, end_line, text, lines}.
    """
    lines = text.splitlines()
    section_breaks: List[Tuple[int, str]] = []
    
    for i, line in enumerate(lines):
        stripped = line.strip()
        # Skip page markers
        if stripped.startswith("--- PAGE"):
            continue
        # Only consider short lines as potential headers (< 80 chars)
        if len(stripped) > 80 or len(stripped) < 3:
            continue
        
        stripped_lower = stripped.lower().strip(":-–—|#*_ ")
        
        for section_name, patterns in SECTION_PATTERNS.items():
            for pattern in patterns:
                if re.fullmatch(pattern, stripped_lower, re.IGNORECASE):
                    section_breaks.append((i, section_name))
                    break
            else:
                continue
            break
    
    # Build sections
    sections = []
    if not section_breaks:
        # No sections detected — treat entire text as one block
        sections.append({
            "name": "general",
            "start_line": 0,
            "end_line": len(lines) - 1,
            "text": text,
            "lines": lines,
        })
        return sections
    
    # Content before first header
    if section_breaks[0][0] > 0:
        pre_lines = lines[:section_breaks[0][0]]
        sections.append({
            "name": "header",
            "start_line": 0,
            "end_line": section_breaks[0][0] - 1,
            "text": "\n".join(pre_lines),
            "lines": pre_lines,
        })
    
    for idx, (line_num, sec_name) in enumerate(section_breaks):
        if idx + 1 < len(section_breaks):
            end = section_breaks[idx + 1][0] - 1
        else:
            end = len(lines) - 1
        sec_lines = lines[line_num:end + 1]
        sections.append({
            "name": sec_name,
            "start_line": line_num,
            "end_line": end,
            "text": "\n".join(sec_lines),
            "lines": sec_lines,
        })
    
    return sections


def _tokenize_line(line: str) -> List[Dict[str, Any]]:
    """
    Tokenize a single line into word tokens preserving position.
    Returns list of {word, start_char, end_char, is_punctuation}.
    """
    tokens = []
    for match in re.finditer(r"[A-Za-z0-9#+./\-]+", line):
        tokens.append({
            "word": match.group(),
            "start_char": match.start(),
            "end_char": match.end(),
            "is_punctuation": False,
        })
    return tokens


# ─────────────────────────────────────────────────────────────
# WORD CLASSIFIER
# ─────────────────────────────────────────────────────────────

def classify_word(
    word: str,
    role_family: str,
    surrounding_text: str = ""
) -> Tuple[str, float]:
    """
    Classify a single word and return (classification, impact_score).
    
    Classifications:
        strong_keyword  (+0.5 to +1.0)
        action_verb     (+0.3 to +0.8)
        metric          (+0.6 to +1.0)
        filler          (-0.3 to -0.8)
        buzzword        (-0.1 to -0.4)
        neutral         (0.0)
    """
    word_lower = word.lower().strip(".,;:!?()[]{}\"'")
    
    # Skip very short words
    if len(word_lower) <= 2:
        return ("neutral", 0.0)
    
    # Check if it's a metric (numbers)
    if re.match(r"^\d[\d,.]*[%kKmMbB]?$", word):
        return ("metric", 0.8)
    
    # Check filler words
    if word_lower in FILLER_WORDS:
        return ("filler", -0.5)
    
    # Check action verbs
    if word_lower in ACTION_VERBS:
        return ("action_verb", 0.6)
    
    # Check role-specific keywords
    role_kws = ROLE_KEYWORDS.get(role_family, ROLE_KEYWORDS["software"])
    for kw in role_kws:
        kw_parts = kw.split()
        if len(kw_parts) == 1 and word_lower == kw_parts[0]:
            return ("strong_keyword", 0.8)
        # Multi-word keyword: check if word is part of a known phrase
        if len(kw_parts) > 1 and word_lower in kw_parts:
            context_lower = surrounding_text.lower()
            if kw in context_lower:
                return ("strong_keyword", 0.9)
    
    return ("neutral", 0.0)


# ─────────────────────────────────────────────────────────────
# FILLER PHRASE DETECTOR
# ─────────────────────────────────────────────────────────────

def detect_filler_phrases(text: str) -> List[Dict[str, Any]]:
    """Find weak/filler phrases in the text and suggest rewrites."""
    found = []
    text_lower = text.lower()
    
    rewrites = {
        "responsible for": "Led / Engineered / Designed",
        "worked on": "Built / Developed / Implemented",
        "helped with": "Collaborated on / Drove",
        "involved in": "Spearheaded / Contributed measurably to",
        "participated in": "Contributed to / Co-led",
        "assisted with": "Supported by delivering / Enabled",
        "contributed to": "Drove measurable improvements in",
        "duties included": "Key deliverables:",
        "tasks included": "Core responsibilities:",
        "was tasked with": "Owned and delivered",
        "in charge of": "Led / Managed",
        "team player": "[Remove — demonstrate collaboration through achievements instead]",
        "hard worker": "[Remove — demonstrate work ethic through quantified results instead]",
        "fast learner": "[Remove — show rapid ramp-up with a concrete example instead]",
        "detail oriented": "[Remove — show attention to detail through specific QA/testing achievements]",
        "self starter": "[Remove — demonstrate initiative through a self-initiated project]",
        "results driven": "[Remove — let your quantified bullet points speak for themselves]",
        "thinking outside the box": "[Remove — describe the innovative solution directly]",
    }
    
    for phrase in FILLER_PHRASES:
        # Find all occurrences
        start = 0
        while True:
            idx = text_lower.find(phrase, start)
            if idx == -1:
                break
            # Find the line number
            line_num = text[:idx].count("\n")
            found.append({
                "phrase": text[idx:idx + len(phrase)],
                "location": f"Line {line_num + 1}",
                "line": line_num,
                "char_start": idx,
                "rewrite": rewrites.get(phrase, f"Replace '{phrase}' with a strong action verb + quantified impact."),
            })
            start = idx + len(phrase)
    
    return found


# ─────────────────────────────────────────────────────────────
# METRIC DETECTOR
# ─────────────────────────────────────────────────────────────

def detect_metrics(text: str) -> List[Dict[str, Any]]:
    """Find quantified metrics/numbers in the text."""
    found = []
    for pattern in METRIC_PATTERNS:
        for match in re.finditer(pattern, text, re.IGNORECASE):
            line_num = text[:match.start()].count("\n")
            found.append({
                "text": match.group(),
                "line": line_num,
                "start": match.start(),
                "end": match.end(),
            })
    return found


# ─────────────────────────────────────────────────────────────
# SECTION SCORER
# ─────────────────────────────────────────────────────────────

def score_section(
    section_name: str,
    section_text: str,
    role_family: str
) -> Dict[str, Any]:
    """Score an individual resume section."""
    lines = [l.strip() for l in section_text.splitlines() if l.strip()]
    words = re.findall(r"\b[A-Za-z0-9#+./-]+\b", section_text)
    total_words = len(words)
    
    if total_words == 0:
        return {
            "section_name": section_name,
            "score": 0,
            "keyword_density": 0.0,
            "action_verb_count": 0,
            "metric_count": 0,
            "filler_count": 0,
            "feedback": f"Section '{section_name}' is empty.",
        }
    
    # Classify each word
    keyword_count = 0
    action_count = 0
    filler_count = 0
    metric_count = 0
    
    for word in words:
        cls, _ = classify_word(word, role_family, section_text)
        if cls == "strong_keyword":
            keyword_count += 1
        elif cls == "action_verb":
            action_count += 1
        elif cls == "filler":
            filler_count += 1
        elif cls == "metric":
            metric_count += 1
    
    # Also count metric patterns
    metric_patterns_found = detect_metrics(section_text)
    metric_count = max(metric_count, len(metric_patterns_found))
    
    keyword_density = keyword_count / total_words if total_words > 0 else 0.0
    
    # Score calculation per section type
    score = 50  # baseline
    
    if section_name == "experience":
        # Experience: heavily weight action verbs + metrics
        score += min(20, action_count * 4)
        score += min(15, metric_count * 5)
        score += min(10, keyword_count * 2)
        score -= min(15, filler_count * 3)
        # Penalize short experience sections
        if total_words < 50:
            score -= 10
    elif section_name == "skills":
        # Skills: keyword density is king
        score += min(30, keyword_count * 3)
        score -= min(10, filler_count * 5)
        if total_words < 10:
            score -= 15
    elif section_name == "education":
        score += min(15, keyword_count * 3)
        score += 10 if total_words > 20 else 0
    elif section_name == "projects":
        score += min(20, action_count * 4)
        score += min(15, metric_count * 5)
        score += min(10, keyword_count * 2)
        score -= min(10, filler_count * 3)
    elif section_name == "summary":
        score += min(15, keyword_count * 3)
        score += min(10, action_count * 3)
        score -= min(20, filler_count * 5)
        # Summary should be concise
        if total_words > 80:
            score -= 5
    else:
        score += min(15, keyword_count * 2)
        score += min(10, action_count * 2)
    
    score = max(0, min(100, score))
    
    # Generate feedback
    feedback_parts = []
    if action_count == 0 and section_name in ("experience", "projects"):
        feedback_parts.append("No action verbs detected. Start bullet points with strong verbs like 'Engineered', 'Optimized', 'Deployed'.")
    if metric_count == 0 and section_name in ("experience", "projects"):
        feedback_parts.append("No quantified metrics found. Add numbers (%, $, users, latency) to demonstrate measurable impact.")
    if filler_count > 2:
        feedback_parts.append(f"Found {filler_count} filler/weak words. Replace 'responsible for', 'worked on' with action verbs.")
    if keyword_density > 0.15:
        feedback_parts.append("Strong keyword density — well-optimized for ATS scanning.")
    elif keyword_density < 0.03 and section_name != "education":
        feedback_parts.append("Low keyword density. Add more role-specific technical terms.")
    if not feedback_parts:
        feedback_parts.append("Section is well-structured.")
    
    return {
        "section_name": section_name,
        "score": score,
        "keyword_density": round(keyword_density, 4),
        "action_verb_count": action_count,
        "metric_count": metric_count,
        "filler_count": filler_count,
        "feedback": " ".join(feedback_parts),
    }


# ─────────────────────────────────────────────────────────────
# DIMENSION SCORERS (12 dimensions)
# ─────────────────────────────────────────────────────────────

def _score_keyword_match(words: List[str], role_family: str, text: str) -> int:
    """Dimension 1: Target Role Keyword Match (0-100)."""
    role_kws = ROLE_KEYWORDS.get(role_family, ROLE_KEYWORDS["software"])
    text_lower = text.lower()
    matched = [kw for kw in role_kws if kw.lower() in text_lower]
    ratio = len(matched) / max(1, min(len(role_kws), 25))  # cap denominator at 25 most important
    return min(100, int(ratio * 120))  # slight boost


def _score_action_verbs(words: List[str]) -> int:
    """Dimension 2: Action Verb Usage (0-100)."""
    verbs_found = [w for w in words if w.lower() in ACTION_VERBS]
    unique_verbs = len(set(w.lower() for w in verbs_found))
    # Good resumes have 8-15 unique action verbs
    if unique_verbs >= 12:
        return 100
    elif unique_verbs >= 8:
        return 85
    elif unique_verbs >= 5:
        return 65
    elif unique_verbs >= 3:
        return 45
    elif unique_verbs >= 1:
        return 25
    return 5


def _score_quantified_impact(text: str) -> int:
    """Dimension 3: Quantified Impact / Metrics (0-100)."""
    metrics = detect_metrics(text)
    count = len(metrics)
    if count >= 8:
        return 100
    elif count >= 5:
        return 85
    elif count >= 3:
        return 65
    elif count >= 1:
        return 40
    return 5


def _score_section_completeness(sections: List[Dict[str, Any]]) -> int:
    """Dimension 4: Section Completeness (0-100)."""
    expected = {"experience", "education", "skills", "projects"}
    bonus = {"summary", "certifications", "achievements"}
    
    found_names = {s["name"] for s in sections}
    
    core_present = len(expected & found_names)
    bonus_present = len(bonus & found_names)
    
    score = (core_present / len(expected)) * 80  # core sections worth 80%
    score += min(20, bonus_present * 10)  # bonus sections worth up to 20%
    
    return min(100, int(score))


def _score_formatting(text: str, sections: List[Dict[str, Any]]) -> int:
    """Dimension 5: Formatting & Structure (0-100)."""
    score = 50
    lines = text.splitlines()
    
    # Check for bullet points
    bullet_lines = [l for l in lines if l.strip().startswith(("•", "-", "–", "▪", "›", "»", "*"))]
    if len(bullet_lines) >= 5:
        score += 15
    elif len(bullet_lines) >= 2:
        score += 8
    
    # Check for consistent line lengths (not too long)
    long_lines = [l for l in lines if len(l.strip()) > 120]
    if len(long_lines) == 0:
        score += 10
    elif len(long_lines) <= 3:
        score += 5
    
    # Multiple sections detected
    if len(sections) >= 4:
        score += 15
    elif len(sections) >= 2:
        score += 8
    
    # Not too short, not too long
    total_words = len(re.findall(r"\b\w+\b", text))
    if 200 <= total_words <= 800:
        score += 10
    elif 100 <= total_words <= 1200:
        score += 5
    
    return min(100, max(0, score))


def _score_readability(text: str) -> int:
    """Dimension 6: Readability (0-100)."""
    sentences = re.split(r"[.!?]+", text)
    sentences = [s.strip() for s in sentences if len(s.strip()) > 10]
    
    if not sentences:
        return 30
    
    avg_sentence_len = sum(len(s.split()) for s in sentences) / len(sentences)
    
    # Ideal sentence length: 10-20 words
    if 10 <= avg_sentence_len <= 20:
        score = 85
    elif 7 <= avg_sentence_len <= 25:
        score = 70
    elif 5 <= avg_sentence_len <= 30:
        score = 55
    else:
        score = 35
    
    # Penalize walls of text (very long paragraphs without breaks)
    long_paragraphs = [p for p in text.split("\n\n") if len(p.split()) > 100]
    score -= min(20, len(long_paragraphs) * 10)
    
    return max(0, min(100, score))


def _score_relevance(text: str, target_role: str) -> int:
    """Dimension 7: Role Relevance (0-100)."""
    role_words = [w.lower() for w in target_role.split() if len(w) > 3]
    text_lower = text.lower()
    
    matched_role_words = sum(1 for w in role_words if w in text_lower)
    if not role_words:
        return 50
    
    ratio = matched_role_words / len(role_words)
    base_score = int(ratio * 80)
    
    # Bonus for role title appearing verbatim
    if target_role.lower() in text_lower:
        base_score += 20
    
    return min(100, base_score)


def _score_brevity(text: str) -> int:
    """Dimension 8: Brevity & Conciseness (0-100)."""
    words = text.split()
    word_count = len(words)
    
    # Ideal resume: 300-700 words
    if 300 <= word_count <= 700:
        score = 90
    elif 200 <= word_count <= 900:
        score = 75
    elif 150 <= word_count <= 1200:
        score = 55
    else:
        score = 30
    
    # Penalize repetition
    word_freq = Counter(w.lower() for w in words if len(w) > 4)
    repeated = [w for w, c in word_freq.items() if c > 5 and w not in {"experience", "project", "using"}]
    score -= min(20, len(repeated) * 5)
    
    return max(0, min(100, score))


def _score_technical_depth(text: str, role_family: str) -> int:
    """Dimension 9: Technical Depth (0-100)."""
    role_kws = ROLE_KEYWORDS.get(role_family, ROLE_KEYWORDS["software"])
    text_lower = text.lower()
    
    # Count unique technical terms found
    found = set()
    for kw in role_kws:
        if kw.lower() in text_lower:
            found.add(kw)
    
    unique_count = len(found)
    
    if unique_count >= 20:
        return 100
    elif unique_count >= 15:
        return 85
    elif unique_count >= 10:
        return 70
    elif unique_count >= 6:
        return 55
    elif unique_count >= 3:
        return 35
    return 10


def _score_ats_parsability(text: str) -> int:
    """Dimension 10: ATS Parsability (0-100). Checks for ATS-friendly formatting."""
    score = 70  # baseline assumption
    
    # Penalize common ATS-breaking patterns
    # Tables (multiple tabs)
    tab_lines = [l for l in text.splitlines() if "\t\t" in l]
    score -= min(15, len(tab_lines) * 3)
    
    # Headers/footers with page numbers
    page_markers = len(re.findall(r"page\s+\d+\s+of\s+\d+", text, re.IGNORECASE))
    score -= page_markers * 5
    
    # Very long URLs (ATS sometimes chokes)
    long_urls = re.findall(r"https?://\S{80,}", text)
    score -= len(long_urls) * 3
    
    # Reward clean structure
    if re.search(r"\n\s*\n", text):  # has paragraph breaks
        score += 10
    
    # Standard bullet format
    bullet_count = len(re.findall(r"^[\s]*[•\-–▪›»*]\s", text, re.MULTILINE))
    if bullet_count >= 3:
        score += 10
    
    # Has email
    if re.search(r"[\w.+-]+@[\w-]+\.[\w.]+", text):
        score += 5
    
    # Has phone
    if re.search(r"[\+]?[\d\s\-().]{7,15}", text):
        score += 5
    
    return max(0, min(100, score))


def _score_consistency(text: str) -> int:
    """Dimension 11: Consistency (0-100). Tense, formatting, style."""
    lines = [l.strip() for l in text.splitlines() if len(l.strip()) > 10]
    
    if not lines:
        return 40
    
    score = 70
    
    # Check bullet point consistency
    bullet_styles = set()
    for line in lines:
        if line[0] in "•-–▪›»*":
            bullet_styles.add(line[0])
    
    if len(bullet_styles) <= 1:
        score += 15  # consistent bullet style
    else:
        score -= 10  # inconsistent
    
    # Check for mix of first-person and third-person
    has_first_person = bool(re.search(r"\b(I|my|me|myself)\b", text, re.IGNORECASE))
    # Resumes typically avoid first person
    if has_first_person:
        score -= 10
    else:
        score += 10
    
    return max(0, min(100, score))


def _score_professional_tone(text: str) -> int:
    """Dimension 12: Professional Tone (0-100)."""
    score = 75
    text_lower = text.lower()
    
    # Penalize informal language
    informal_words = ["lol", "gonna", "wanna", "kinda", "stuff", "things", "cool", "awesome", "guy", "dude"]
    informal_count = sum(1 for w in informal_words if f" {w} " in f" {text_lower} ")
    score -= informal_count * 8
    
    # Penalize exclamation marks (unprofessional in resumes)
    exclamation_count = text.count("!")
    score -= min(15, exclamation_count * 5)
    
    # Reward professional formatting
    if re.search(r"\b\d{4}\b", text):  # years mentioned
        score += 5
    
    # Filler word penalty
    filler_count = sum(1 for w in FILLER_WORDS if f" {w} " in f" {text_lower} ")
    score -= min(20, filler_count * 2)
    
    # Action verb bonus
    action_count = sum(1 for w in ACTION_VERBS if f" {w} " in f" {text_lower} ")
    score += min(15, action_count * 2)
    
    return max(0, min(100, score))


# ─────────────────────────────────────────────────────────────
# GRADE CALCULATOR
# ─────────────────────────────────────────────────────────────

def _compute_grade(overall_score: int) -> str:
    """Convert numeric score to letter grade."""
    if overall_score >= 95:
        return "A+"
    elif overall_score >= 90:
        return "A"
    elif overall_score >= 85:
        return "A-"
    elif overall_score >= 80:
        return "B+"
    elif overall_score >= 75:
        return "B"
    elif overall_score >= 70:
        return "B-"
    elif overall_score >= 65:
        return "C+"
    elif overall_score >= 60:
        return "C"
    elif overall_score >= 55:
        return "C-"
    elif overall_score >= 50:
        return "D+"
    elif overall_score >= 45:
        return "D"
    elif overall_score >= 40:
        return "D-"
    return "F"


# ─────────────────────────────────────────────────────────────
# MAIN ANALYSIS ORCHESTRATOR
# ─────────────────────────────────────────────────────────────

def compute_full_analysis(resume_text: str, target_role: str) -> Dict[str, Any]:
    """
    Perform complete word-level ATS analysis.
    
    Returns a comprehensive dictionary containing:
    - 12-dimension scores
    - Per-word annotations
    - Per-section scores
    - Matching/missing skills
    - Filler phrases with rewrites
    - Strengths and suggestions
    """
    role_family = _detect_role_family(target_role)
    sections = _detect_sections(resume_text)
    
    # ── Word-level annotations ──────────────────────────────
    all_words = re.findall(r"\b[A-Za-z0-9#+./-]+\b", resume_text)
    word_annotations = []
    counters = {"strong_keyword": 0, "action_verb": 0, "metric": 0, "filler": 0, "buzzword": 0, "neutral": 0}
    
    # Track positions via line scanning
    lines = resume_text.splitlines()
    global_pos = 0
    for line_idx, line in enumerate(lines):
        for match in re.finditer(r"[A-Za-z0-9#+./-]+", line):
            word = match.group()
            cls, impact = classify_word(word, role_family, line)
            counters[cls] = counters.get(cls, 0) + 1
            
            # Only include non-neutral words to keep payload manageable
            if cls != "neutral":
                word_annotations.append({
                    "word": word,
                    "classification": cls,
                    "impact_score": round(impact, 2),
                    "line": line_idx,
                    "position": match.start(),
                })
            global_pos += 1
    
    # ── Section scores ──────────────────────────────────────
    section_scores = []
    for sec in sections:
        sec_score = score_section(sec["name"], sec["text"], role_family)
        section_scores.append(sec_score)
    
    # ── 12-Dimension Scores ─────────────────────────────────
    dim_keyword_match = _score_keyword_match(all_words, role_family, resume_text)
    dim_action_verbs = _score_action_verbs(all_words)
    dim_quantified = _score_quantified_impact(resume_text)
    dim_section_complete = _score_section_completeness(sections)
    dim_formatting = _score_formatting(resume_text, sections)
    dim_readability = _score_readability(resume_text)
    dim_relevance = _score_relevance(resume_text, target_role)
    dim_brevity = _score_brevity(resume_text)
    dim_tech_depth = _score_technical_depth(resume_text, role_family)
    dim_ats_parsability = _score_ats_parsability(resume_text)
    dim_consistency = _score_consistency(resume_text)
    dim_professional_tone = _score_professional_tone(resume_text)
    
    # ── Overall Score (weighted average) ────────────────────
    weights = {
        "keyword_match": 0.15,
        "action_verbs": 0.10,
        "quantified_impact": 0.12,
        "section_completeness": 0.10,
        "formatting": 0.08,
        "readability": 0.06,
        "relevance": 0.12,
        "brevity": 0.05,
        "technical_depth": 0.10,
        "ats_parsability": 0.05,
        "consistency": 0.03,
        "professional_tone": 0.04,
    }
    
    overall_score = int(
        dim_keyword_match * weights["keyword_match"] +
        dim_action_verbs * weights["action_verbs"] +
        dim_quantified * weights["quantified_impact"] +
        dim_section_complete * weights["section_completeness"] +
        dim_formatting * weights["formatting"] +
        dim_readability * weights["readability"] +
        dim_relevance * weights["relevance"] +
        dim_brevity * weights["brevity"] +
        dim_tech_depth * weights["technical_depth"] +
        dim_ats_parsability * weights["ats_parsability"] +
        dim_consistency * weights["consistency"] +
        dim_professional_tone * weights["professional_tone"]
    )
    overall_score = max(0, min(100, overall_score))
    grade = _compute_grade(overall_score)
    
    # ── Matching & Missing Skills ───────────────────────────
    role_kws = ROLE_KEYWORDS.get(role_family, ROLE_KEYWORDS["software"])
    text_lower = resume_text.lower()
    matching_skills = [kw for kw in role_kws if kw.lower() in text_lower]
    missing_keywords = [kw for kw in role_kws if kw.lower() not in text_lower]
    
    # Limit to most important
    matching_skills = matching_skills[:20]
    missing_keywords = missing_keywords[:15]
    
    # ── Filler Phrases ──────────────────────────────────────
    weak_phrases = detect_filler_phrases(resume_text)
    
    # ── Strengths ───────────────────────────────────────────
    strengths = []
    if dim_keyword_match >= 70:
        strengths.append(f"Strong keyword coverage: {len(matching_skills)} role-relevant skills detected across resume text.")
    if dim_action_verbs >= 70:
        unique_verbs = len(set(w.lower() for w in all_words if w.lower() in ACTION_VERBS))
        strengths.append(f"Excellent action verb usage: {unique_verbs} unique action verbs drive impactful bullet points.")
    if dim_quantified >= 60:
        metric_list = detect_metrics(resume_text)
        strengths.append(f"Quantified achievements: {len(metric_list)} measurable metrics found (%, $, counts).")
    if dim_section_complete >= 75:
        strengths.append("Complete section structure with all core resume sections present.")
    if dim_formatting >= 70:
        strengths.append("Clean, ATS-friendly formatting with consistent structure and bullet points.")
    if dim_tech_depth >= 70:
        strengths.append(f"Deep technical depth: {len(matching_skills)} technologies and frameworks referenced.")
    if not strengths:
        strengths.append("Resume uploaded successfully and parsed for analysis.")
    
    # ── Suggestions ─────────────────────────────────────────
    suggestions = []
    if dim_keyword_match < 60:
        top_missing = ", ".join(missing_keywords[:4])
        suggestions.append(f"Add critical missing keywords: {top_missing} to boost ATS keyword match from {dim_keyword_match}%.")
    if dim_action_verbs < 60:
        suggestions.append("Start more bullet points with strong action verbs (Engineered, Optimized, Deployed, Architected) instead of passive phrases.")
    if dim_quantified < 50:
        suggestions.append("Add quantified metrics to at least 60% of bullet points. Example: 'Reduced API latency by 40% serving 50K daily requests.'")
    if dim_section_complete < 70:
        missing_sections = {"experience", "education", "skills", "projects"} - {s["name"] for s in sections}
        if missing_sections:
            suggestions.append(f"Add missing sections: {', '.join(s.capitalize() for s in missing_sections)}.")
    if len(weak_phrases) > 0:
        top_filler = weak_phrases[0]
        suggestions.append(f"Replace weak phrase \"{top_filler['phrase']}\" ({top_filler['location']}) → {top_filler['rewrite']}")
    if dim_brevity < 50:
        word_count = len(all_words)
        if word_count > 900:
            suggestions.append(f"Resume is {word_count} words — trim to 400-700 words for optimal ATS scanning.")
        elif word_count < 200:
            suggestions.append(f"Resume is only {word_count} words — expand with more detailed achievements and skills.")
    if dim_professional_tone < 60:
        suggestions.append("Remove informal language, excessive exclamation marks, and subjective self-descriptions (e.g., 'passionate', 'hardworking').")
    if not suggestions:
        suggestions.append("Resume is well-optimized. Consider tailoring keywords for each specific job application.")
    
    # ── Build Final Response ────────────────────────────────
    return {
        "overall_score": overall_score,
        "grade": grade,
        # 12 dimensions
        "keyword_match_score": dim_keyword_match,
        "action_verb_score": dim_action_verbs,
        "quantified_impact_score": dim_quantified,
        "section_completeness_score": dim_section_complete,
        "formatting_score": dim_formatting,
        "readability_score": dim_readability,
        "relevance_score": dim_relevance,
        "brevity_score": dim_brevity,
        "technical_depth_score": dim_tech_depth,
        "ats_parsability_score": dim_ats_parsability,
        "consistency_score": dim_consistency,
        "professional_tone_score": dim_professional_tone,
        # Word-level
        "word_annotations": word_annotations,
        "total_words": len(all_words),
        "strong_keyword_count": counters.get("strong_keyword", 0),
        "action_verb_count": counters.get("action_verb", 0),
        "metric_count": counters.get("metric", 0),
        "filler_count": counters.get("filler", 0),
        # Section data
        "section_scores": section_scores,
        # Actionable
        "matching_skills": matching_skills,
        "missing_keywords": missing_keywords,
        "weak_phrases": weak_phrases,
        "strengths": strengths,
        "suggestions": suggestions,
        # Resume text for frontend annotation rendering
        "resume_text": resume_text,
    }
