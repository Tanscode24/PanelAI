# app/auto_scoring.py

"""
Deterministic automatic interview scoring for PanelAI.

No OpenAI or external LLM is used.

The scorer evaluates the transcript using agent-specific
rubrics and returns:
    - score: 0-10
    - observations: list[str]
"""

from typing import Any, Dict, List


AGENT_NAMES = {
    "technical": "NOVA",
    "behavioral": "MIRA",
    "system_design": "ATLAS",
    "coding": "BYTE",
}


# -------------------------------------------------------------------
# Generic helpers
# -------------------------------------------------------------------

def _normalise(text: str) -> str:
    return " ".join((text or "").lower().split())


def _contains_any(text: str, keywords: List[str]) -> int:
    return sum(1 for keyword in keywords if keyword.lower() in text)


def _answer_messages(transcript: List[Dict[str, Any]]) -> List[str]:
    """
    Extract candidate answers from the stored transcript.

    We accept several speaker labels so this works with the
    existing transcript API and frontend variations.
    """

    answers = []

    for item in transcript:
        speaker = str(item.get("speaker", "")).lower().strip()
        text = str(item.get("text", "")).strip()

        if not text:
            continue

        if speaker in {
            "candidate",
            "user",
            "participant",
            "candidate_user",
        }:
            answers.append(text)

    return answers


def _all_candidate_text(transcript: List[Dict[str, Any]]) -> str:
    return _normalise(" ".join(_answer_messages(transcript)))


def _base_score(answer_count: int) -> float:
    """
    Basic participation score.

    0 answers -> 0
    1 answer  -> 4
    2 answers -> 5
    3 answers -> 6
    4+ answers -> 6
    """

    if answer_count <= 0:
        return 0.0

    if answer_count == 1:
        return 4.0

    if answer_count == 2:
        return 5.0

    return 6.0


def _length_bonus(text: str) -> float:
    """
    Rewards reasonably developed answers.

    This intentionally has a small effect so that verbosity
    alone cannot produce a high score.
    """

    words = len(text.split())

    if words >= 300:
        return 1.5

    if words >= 180:
        return 1.0

    if words >= 100:
        return 0.5

    return 0.0


def _clamp_score(score: float) -> float:
    return round(max(0.0, min(10.0, score)), 2)


# -------------------------------------------------------------------
# NOVA - Technical
# -------------------------------------------------------------------

def score_technical(transcript: List[Dict[str, Any]]) -> Dict[str, Any]:
    answers = _answer_messages(transcript)
    text = _all_candidate_text(transcript)

    if not answers:
        return {
            "score": 0.0,
            "observations": [
                "No candidate answers were captured for the technical round."
            ],
        }

    score = _base_score(len(answers))
    observations = []

    technical_keywords = [
        "algorithm",
        "data structure",
        "api",
        "rest",
        "http",
        "database",
        "sql",
        "nosql",
        "python",
        "javascript",
        "typescript",
        "react",
        "backend",
        "frontend",
        "server",
        "cache",
        "redis",
        "queue",
        "docker",
        "kubernetes",
        "testing",
        "unit test",
        "authentication",
        "authorization",
        "complexity",
        "big o",
        "time complexity",
        "space complexity",
        "recursion",
        "array",
        "hash map",
        "tree",
        "graph",
    ]

    count = _contains_any(text, technical_keywords)

    if count >= 8:
        score += 2.0
        observations.append(
            "Strong use of relevant technical concepts."
        )
    elif count >= 4:
        score += 1.0
        observations.append(
            "Demonstrates familiarity with several technical concepts."
        )
    else:
        observations.append(
            "Technical depth could be demonstrated more clearly."
        )

    if "because" in text or "trade-off" in text or "tradeoff" in text:
        score += 0.5
        observations.append(
            "Provides reasoning rather than only short answers."
        )

    if (
        "complexity" in text
        or "big o" in text
        or "o(" in text
    ):
        score += 0.5
        observations.append(
            "Discusses algorithmic complexity."
        )

    score += _length_bonus(text)

    score = _clamp_score(score)

    if score >= 8:
        observations.append(
            "Overall technical performance is strong."
        )
    elif score >= 6:
        observations.append(
            "Technical fundamentals are acceptable with room for deeper explanations."
        )
    else:
        observations.append(
            "Technical responses need more depth and precision."
        )

    return {
        "score": score,
        "observations": observations,
    }


# -------------------------------------------------------------------
# MIRA - Behavioral
# -------------------------------------------------------------------

def score_behavioral(transcript: List[Dict[str, Any]]) -> Dict[str, Any]:
    answers = _answer_messages(transcript)
    text = _all_candidate_text(transcript)

    if not answers:
        return {
            "score": 0.0,
            "observations": [
                "No candidate answers were captured for the behavioral round."
            ],
        }

    score = _base_score(len(answers))
    observations = []

    star_keywords = {
        "situation": "Describes the situation/context.",
        "task": "Explains the task or responsibility.",
        "action": "Explains actions taken.",
        "result": "Describes an outcome or result.",
    }

    star_count = 0

    for keyword, observation in star_keywords.items():
        if keyword in text:
            star_count += 1
            observations.append(observation)

    if star_count >= 3:
        score += 2.0
        observations.append(
            "Answers show a strong structured behavioral format."
        )
    elif star_count >= 2:
        score += 1.0
        observations.append(
            "Answers contain some structured behavioral elements."
        )
    else:
        observations.append(
            "Behavioral answers could use clearer situation, action, and result structure."
        )

    ownership_keywords = [
        "i led",
        "i built",
        "i implemented",
        "i decided",
        "i solved",
        "i improved",
        "i managed",
        "i owned",
        "my responsibility",
        "my role",
    ]

    ownership_count = _contains_any(text, ownership_keywords)

    if ownership_count >= 2:
        score += 1.0
        observations.append(
            "Shows evidence of personal ownership."
        )

    communication_keywords = [
        "communicate",
        "communication",
        "team",
        "collaborate",
        "collaboration",
        "stakeholder",
        "feedback",
        "conflict",
    ]

    if _contains_any(text, communication_keywords) >= 2:
        score += 0.5
        observations.append(
            "Addresses teamwork or communication."
        )

    score += _length_bonus(text)

    score = _clamp_score(score)

    if score >= 8:
        observations.append(
            "Overall behavioral performance is strong."
        )
    elif score >= 6:
        observations.append(
            "Behavioral performance is acceptable with room for stronger examples."
        )
    else:
        observations.append(
            "Behavioral answers need more concrete examples and structure."
        )

    return {
        "score": score,
        "observations": observations,
    }


# -------------------------------------------------------------------
# ATLAS - System Design
# -------------------------------------------------------------------

def score_system_design(transcript: List[Dict[str, Any]]) -> Dict[str, Any]:
    answers = _answer_messages(transcript)
    text = _all_candidate_text(transcript)

    if not answers:
        return {
            "score": 0.0,
            "observations": [
                "No candidate answers were captured for the system-design round."
            ],
        }

    score = _base_score(len(answers))
    observations = []

    architecture_keywords = [
        "architecture",
        "service",
        "microservice",
        "api gateway",
        "load balancer",
        "database",
        "cache",
        "queue",
        "message broker",
        "event",
        "storage",
        "cdn",
        "worker",
    ]

    architecture_count = _contains_any(
        text,
        architecture_keywords,
    )

    if architecture_count >= 6:
        score += 2.0
        observations.append(
            "Discusses multiple system architecture components."
        )
    elif architecture_count >= 3:
        score += 1.0
        observations.append(
            "Identifies several relevant architecture components."
        )
    else:
        observations.append(
            "System architecture could be described in greater detail."
        )

    scalability_keywords = [
        "scale",
        "scaling",
        "horizontal",
        "vertical",
        "load",
        "traffic",
        "throughput",
        "latency",
        "sharding",
        "replication",
        "partition",
    ]

    if _contains_any(text, scalability_keywords) >= 2:
        score += 0.75
        observations.append(
            "Considers scalability and system load."
        )

    tradeoff_keywords = [
        "trade-off",
        "tradeoff",
        "consistency",
        "availability",
        "cap theorem",
        "cost",
        "latency",
        "reliability",
    ]

    if _contains_any(text, tradeoff_keywords) >= 2:
        score += 0.75
        observations.append(
            "Discusses meaningful design trade-offs."
        )

    reliability_keywords = [
        "fault tolerance",
        "failure",
        "retry",
        "backup",
        "redundancy",
        "monitoring",
        "observability",
        "disaster recovery",
        "health check",
    ]

    if _contains_any(text, reliability_keywords) >= 2:
        score += 0.5
        observations.append(
            "Considers reliability or failure handling."
        )

    score += _length_bonus(text)

    score = _clamp_score(score)

    if score >= 8:
        observations.append(
            "Overall system-design performance is strong."
        )
    elif score >= 6:
        observations.append(
            "System-design fundamentals are acceptable with room for deeper trade-off analysis."
        )
    else:
        observations.append(
            "System-design responses need more architecture depth."
        )

    return {
        "score": score,
        "observations": observations,
    }


# -------------------------------------------------------------------
# BYTE - Coding
# -------------------------------------------------------------------

def score_coding(transcript: List[Dict[str, Any]]) -> Dict[str, Any]:
    answers = _answer_messages(transcript)
    text = _all_candidate_text(transcript)

    if not answers:
        return {
            "score": 0.0,
            "observations": [
                "No candidate answers were captured for the coding round."
            ],
        }

    score = _base_score(len(answers))
    observations = []

    algorithm_keywords = [
        "algorithm",
        "approach",
        "iterate",
        "loop",
        "recursion",
        "binary search",
        "two pointer",
        "sliding window",
        "dynamic programming",
        "greedy",
        "hash map",
        "hashmap",
        "stack",
        "queue",
        "tree",
        "graph",
    ]

    algorithm_count = _contains_any(
        text,
        algorithm_keywords,
    )

    if algorithm_count >= 5:
        score += 2.0
        observations.append(
            "Explains a concrete algorithmic approach."
        )
    elif algorithm_count >= 2:
        score += 1.0
        observations.append(
            "Shows awareness of algorithmic techniques."
        )
    else:
        observations.append(
            "Coding approach could be explained more explicitly."
        )

    complexity_keywords = [
        "time complexity",
        "space complexity",
        "big o",
        "o(n)",
        "o(log n)",
        "o(n log n)",
        "complexity",
    ]

    if _contains_any(text, complexity_keywords) >= 1:
        score += 0.75
        observations.append(
            "Discusses time or space complexity."
        )

    edge_case_keywords = [
        "edge case",
        "empty",
        "null",
        "none",
        "duplicate",
        "negative",
        "boundary",
        "overflow",
    ]

    if _contains_any(text, edge_case_keywords) >= 1:
        score += 0.5
        observations.append(
            "Considers edge cases."
        )

    correctness_keywords = [
        "test",
        "testing",
        "example",
        "input",
        "output",
        "expected",
        "validate",
        "correct",
    ]

    if _contains_any(text, correctness_keywords) >= 2:
        score += 0.5
        observations.append(
            "Shows attention to correctness or validation."
        )

    score += _length_bonus(text)

    score = _clamp_score(score)

    if score >= 8:
        observations.append(
            "Overall coding performance is strong."
        )
    elif score >= 6:
        observations.append(
            "Coding fundamentals are acceptable with room for stronger problem-solving detail."
        )
    else:
        observations.append(
            "Coding responses need clearer algorithms, correctness reasoning, and complexity analysis."
        )

    return {
        "score": score,
        "observations": observations,
    }


# -------------------------------------------------------------------
# Main dispatcher
# -------------------------------------------------------------------

SCORERS = {
    "technical": score_technical,
    "behavioral": score_behavioral,
    "system_design": score_system_design,
    "coding": score_coding,
}


def score_agent(
    agent_type: str,
    transcript: List[Dict[str, Any]],
) -> Dict[str, Any]:
    """
    Score one agent's candidate transcript.
    """

    agent_type = str(agent_type).lower().strip()

    scorer = SCORERS.get(agent_type)

    if not scorer:
        raise ValueError(
            f"Unknown agent type: {agent_type}"
        )

    result = scorer(transcript)

    return {
        "agent": AGENT_NAMES.get(agent_type, agent_type),
        "agent_type": agent_type,
        "score": result["score"],
        "observations": result["observations"],
    }


def score_all_agents(
    agent_transcripts: Dict[str, List[Dict[str, Any]]],
) -> Dict[str, Dict[str, Any]]:
    """
    Score every available agent transcript.
    """

    results = {}

    for agent_type in SCORERS:
        transcript = agent_transcripts.get(agent_type, [])

        results[agent_type] = score_agent(
            agent_type,
            transcript,
        )

    return results