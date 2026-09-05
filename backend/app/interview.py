# app/interview.py

import uuid
from datetime import datetime


# ============================================================
# IN-MEMORY INTERVIEW STORAGE
# ============================================================

interview_sessions = {}


# ============================================================
# PANEL ORDER
# ============================================================

PANEL_ORDER = [
    "technical",
    "behavioral",
    "system_design",
    "coding",
]


# ============================================================
# CREATE INTERVIEW
# ============================================================

def create_interview(
    candidate_name: str,
    interview_type: str,
    role: str = "",
    experience: str = "",
    difficulty: str = "medium",
    duration: int = 45,
    context: str = "",
):

    session_id = str(uuid.uuid4())

    if interview_type == "full-panel":
        current_agent = "technical"
    else:
        current_agent = interview_type

    session = {

        # ----------------------------------------------------
        # Basic information
        # ----------------------------------------------------

        "session_id": session_id,

        "candidate_name": candidate_name,

        "interview_type": interview_type,

        "role": role,

        "experience": experience,

        "difficulty": difficulty,

        "duration": duration,

        "context": context,

        # ----------------------------------------------------
        # Lifecycle
        # ----------------------------------------------------

        "started_at": datetime.utcnow().isoformat(),

        "ended_at": None,

        "status": "active",

        # ----------------------------------------------------
        # Panel state
        # ----------------------------------------------------

        "panel_order": (
            PANEL_ORDER.copy()
            if interview_type == "full-panel"
            else [interview_type]
        ),

        "current_panel_index": 0,

        "current_agent": current_agent,

        # ----------------------------------------------------
        # Question tracking
        # ----------------------------------------------------

        "question_number": 0,

        "questions_per_agent": 2,

        # ----------------------------------------------------
        # Agora
        # ----------------------------------------------------

        "channel_name": None,

        "candidate_uid": None,

        "agent_id": None,

        "agent_pipeline_id": None,

        # ----------------------------------------------------
        # Transcript
        # ----------------------------------------------------

        "transcript": [],

        # ----------------------------------------------------
        # Agent observations
        # ----------------------------------------------------

        "agent_observations": {

            "technical": [],

            "behavioral": [],

            "system_design": [],

            "coding": [],
        },

        # ----------------------------------------------------
        # Agent scores
        # ----------------------------------------------------

        "agent_scores": {

            "technical": None,

            "behavioral": None,

            "system_design": None,

            "coding": None,
        },

        # ----------------------------------------------------
        # Final result
        # ----------------------------------------------------

        "result": None,
    }

    interview_sessions[session_id] = session

    return session


# ============================================================
# GET INTERVIEW
# ============================================================

def get_interview(
    session_id: str,
):

    return interview_sessions.get(
        session_id
    )


# ============================================================
# UPDATE INTERVIEW
# ============================================================

def update_interview(
    session_id: str,
    **updates,
):

    session = interview_sessions.get(
        session_id
    )

    if not session:
        return None

    session.update(
        updates
    )

    return session


# ============================================================
# ADD TRANSCRIPT
# ============================================================

def add_transcript(
    session_id: str,
    speaker: str,
    text: str,
    agent: str | None = None,
):

    session = interview_sessions.get(
        session_id
    )

    if not session:
        return None

    message = {

        "id": str(
            uuid.uuid4()
        ),

        "speaker": speaker,

        "agent": agent,

        "text": text,

        "timestamp": (
            datetime.utcnow()
            .isoformat()
        ),
    }

    session["transcript"].append(
        message
    )

    return message


# ============================================================
# ADD AGENT OBSERVATION
# ============================================================

def add_agent_observation(
    session_id: str,
    agent: str,
    observation: str,
):

    session = interview_sessions.get(
        session_id
    )

    if not session:
        return None

    if agent not in session[
        "agent_observations"
    ]:

        session[
            "agent_observations"
        ][agent] = []

    session[
        "agent_observations"
    ][agent].append(
        observation
    )

    return session


# ============================================================
# ADD AGENT SCORE
# ============================================================

def add_agent_score(
    session_id: str,
    agent: str,
    score: float,
):

    session = interview_sessions.get(
        session_id
    )

    if not session:
        return None

    # --------------------------------------------------------
    # Validate score
    # --------------------------------------------------------

    score = float(score)

    if score < 0:
        score = 0.0

    if score > 10:
        score = 10.0

    # --------------------------------------------------------
    # Save score
    # --------------------------------------------------------

    session[
        "agent_scores"
    ][agent] = round(
        score,
        2,
    )

    return session


# ============================================================
# GET AGENT SCORE
# ============================================================

def get_agent_score(
    session_id: str,
    agent: str,
):

    session = interview_sessions.get(
        session_id
    )

    if not session:
        return None

    return session.get(
        "agent_scores",
        {}
    ).get(
        agent
    )


# ============================================================
# END INTERVIEW
# ============================================================

def end_interview(
    session_id: str,
):

    session = interview_sessions.get(
        session_id
    )

    if not session:
        return None

    session["status"] = "completed"

    session["ended_at"] = (
        datetime.utcnow()
        .isoformat()
    )

    return session