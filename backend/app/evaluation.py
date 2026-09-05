# app/evaluation.py

from typing import Any, Dict


# ============================================================
# AGENT WEIGHTS
# ============================================================

AGENT_WEIGHTS = {

    "technical": 0.25,

    "behavioral": 0.25,

    "system_design": 0.25,

    "coding": 0.25,
}


# ============================================================
# AGENT DISPLAY NAMES
# ============================================================

AGENT_NAMES = {

    "technical": "NOVA",

    "behavioral": "MIRA",

    "system_design": "ATLAS",

    "coding": "BYTE",
}


# ============================================================
# SAFE SCORE
# ============================================================

def _safe_score(
    value: Any,
) -> float:

    try:

        score = float(value)

    except (
        TypeError,
        ValueError,
    ):

        return 0.0

    return max(
        0.0,
        min(
            10.0,
            score,
        ),
    )


# ============================================================
# GET SCORES
# ============================================================

def _get_scores(
    session: Dict[str, Any],
) -> Dict[str, float]:

    stored_scores = session.get(
        "agent_scores",
        {},
    )

    scores = {}

    for agent_type in AGENT_WEIGHTS:

        value = stored_scores.get(
            agent_type
        )

        if value is None:

            scores[agent_type] = 0.0

        else:

            scores[agent_type] = (
                _safe_score(value)
            )

    return scores


# ============================================================
# SCORE STATUS
# ============================================================

def _score_status(
    session: Dict[str, Any],
):

    stored_scores = session.get(
        "agent_scores",
        {},
    )

    completed_agents = []

    missing_agents = []

    for agent_type in AGENT_WEIGHTS:

        score = stored_scores.get(
            agent_type
        )

        if score is None:

            missing_agents.append(
                agent_type
            )

        else:

            completed_agents.append(
                agent_type
            )

    return (
        completed_agents,
        missing_agents,
    )


# ============================================================
# STRENGTHS
# ============================================================

def _build_strengths(
    scores: Dict[str, float],
):

    strengths = []

    for agent_type, score in scores.items():

        if score >= 7.5:

            strengths.append({

                "area": agent_type,

                "agent": AGENT_NAMES[
                    agent_type
                ],

                "score": round(
                    score,
                    2,
                ),
            })

    return strengths


# ============================================================
# IMPROVEMENTS
# ============================================================

def _build_improvements(
    scores: Dict[str, float],
):

    improvements = []

    for agent_type, score in scores.items():

        if 0 < score < 6.0:

            improvements.append({

                "area": agent_type,

                "agent": AGENT_NAMES[
                    agent_type
                ],

                "score": round(
                    score,
                    2,
                ),
            })

    return improvements


# ============================================================
# RECOMMENDATION
# ============================================================

def _get_recommendation(
    overall_score: float,
):

    if overall_score >= 8.5:

        return "Strong Hire"

    if overall_score >= 7.0:

        return "Hire"

    if overall_score >= 5.5:

        return "Consider"

    if overall_score >= 4.0:

        return "Weak"

    return "No Hire"


# ============================================================
# EVALUATE INTERVIEW
# ============================================================

def evaluate_interview(
    session: Dict[str, Any],
) -> Dict[str, Any]:

    # --------------------------------------------------------
    # Get scores
    # --------------------------------------------------------

    scores = _get_scores(
        session
    )

    # --------------------------------------------------------
    # Determine score availability
    # --------------------------------------------------------

    (
        completed_agents,
        missing_agents,
    ) = _score_status(
        session
    )

    # --------------------------------------------------------
    # Calculate weighted score
    # --------------------------------------------------------

    weighted_score = 0.0

    total_weight = 0.0

    for agent_type, weight in (
        AGENT_WEIGHTS.items()
    ):

        if agent_type not in completed_agents:

            continue

        weighted_score += (
            scores[agent_type]
            * weight
        )

        total_weight += weight

    # --------------------------------------------------------
    # Calculate overall
    # --------------------------------------------------------

    if total_weight > 0:

        overall_score = (
            weighted_score
            / total_weight
        )

    else:

        overall_score = 0.0

    overall_score = round(
        overall_score,
        2,
    )

    percentage = round(
        overall_score * 10,
        1,
    )

    # --------------------------------------------------------
    # Recommendation
    # --------------------------------------------------------

    recommendation = _get_recommendation(
        overall_score
    )

    # --------------------------------------------------------
    # Strengths
    # --------------------------------------------------------

    strengths = _build_strengths(
        scores
    )

    # --------------------------------------------------------
    # Improvements
    # --------------------------------------------------------

    improvements = _build_improvements(
        scores
    )

    # --------------------------------------------------------
    # Agent results
    # --------------------------------------------------------

    agent_results = {}

    for agent_type in AGENT_WEIGHTS:

        agent_results[agent_type] = {

            "agent": AGENT_NAMES[
                agent_type
            ],

            "score": round(
                scores[agent_type],
                2,
            ),

            "observations": (
                session.get(
                    "agent_observations",
                    {},
                ).get(
                    agent_type,
                    [],
                )
            ),

            "status": (
                "evaluated"
                if agent_type in completed_agents
                else "not_evaluated"
            ),
        }

    # --------------------------------------------------------
    # Return result
    # --------------------------------------------------------

    return {

        "candidate_name": session.get(
            "candidate_name",
            "",
        ),

        "role": session.get(
            "role",
            "",
        ),

        "overall_score": overall_score,

        "percentage": percentage,

        "recommendation": recommendation,

        "scores": {

            "technical": round(
                scores["technical"],
                2,
            ),

            "behavioral": round(
                scores["behavioral"],
                2,
            ),

            "system_design": round(
                scores["system_design"],
                2,
            ),

            "coding": round(
                scores["coding"],
                2,
            ),
        },

        "agent_results": agent_results,

        "strengths": strengths,

        "improvements": improvements,

        "completed_agents": (
            completed_agents
        ),

        "missing_agents": (
            missing_agents
        ),

        "agent_observations": session.get(
            "agent_observations",
            {},
        ),

        "agent_scores": session.get(
            "agent_scores",
            {},
        ),

        "total_questions": len(
            session.get(
                "transcript",
                [],
            )
        ),

        "status": "completed",
    }