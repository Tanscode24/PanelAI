# app/panel_orchestrator.py

from app.interview import (
    get_interview,
    update_interview,
    add_agent_observation,
)


# ============================================================
# PANEL
# ============================================================

PANEL_ORDER = [
    "technical",
    "behavioral",
    "system_design",
    "coding",
]


AGENT_NAMES = {

    "technical": "NOVA",

    "behavioral": "MIRA",

    "system_design": "ATLAS",

    "coding": "BYTE",
}


# ============================================================
# PANEL ORDER
# ============================================================

def get_panel_order(
    session,
):

    if session["interview_type"] != "full-panel":

        return [
            session["interview_type"]
        ]

    return PANEL_ORDER.copy()


# ============================================================
# CURRENT AGENT
# ============================================================

def get_current_agent(
    session,
):

    order = get_panel_order(
        session
    )

    index = session.get(
        "current_panel_index",
        0,
    )

    if index >= len(order):

        return None

    return order[index]


# ============================================================
# AGENT NAME
# ============================================================

def get_agent_name(
    agent_type,
):

    return AGENT_NAMES.get(
        agent_type,
        agent_type,
    )


# ============================================================
# BUILD TRANSCRIPT CONTEXT
# ============================================================

def build_candidate_context(
    session,
):

    transcript = session.get(
        "transcript",
        [],
    )

    lines = []

    for item in transcript:

        speaker = item.get(
            "speaker",
            "unknown",
        )

        text = item.get(
            "text",
            "",
        )

        agent = item.get(
            "agent",
            "",
        )

        if not text:

            continue

        if speaker == "candidate":

            label = "Candidate"

        elif speaker == "agent":

            label = (
                get_agent_name(agent)
                if agent
                else "Interviewer"
            )

        else:

            label = speaker

        lines.append(
            f"{label}: {text}"
        )

    if not lines:

        return (
            "No previous interview "
            "conversation."
        )

    return "\n".join(lines)


# ============================================================
# BUILD AGENT CONTEXT
# ============================================================

def build_agent_context(
    session,
    agent_type,
):

    transcript = (
        build_candidate_context(
            session
        )
    )

    observations = session.get(
        "agent_observations",
        {},
    )

    previous_observations = []

    for agent, notes in observations.items():

        if agent == agent_type:

            continue

        for note in notes:

            previous_observations.append(
                f"{get_agent_name(agent)}: {note}"
            )

    if previous_observations:

        previous_notes = (
            "\n".join(
                previous_observations
            )
        )

    else:

        previous_notes = (
            "No previous interviewer "
            "observations."
        )

    return f"""
CANDIDATE PROFILE

Name:
{session.get("candidate_name", "")}

Role:
{session.get("role", "")}

Experience:
{session.get("experience", "")}

Difficulty:
{session.get("difficulty", "")}

Additional context:
{session.get("context", "")}


PREVIOUS INTERVIEW TRANSCRIPT

{transcript}


PREVIOUS INTERVIEWER OBSERVATIONS

{previous_notes}


CURRENT INTERVIEWER

You are {get_agent_name(agent_type)}.

Specialization:
{agent_type}

Use the previous interview information
to personalize your questions.

Do not repeat questions.

Ask exactly ONE question at a time.

Do not reveal scores.
""".strip()


# ============================================================
# QUESTION COUNT
# ============================================================

def should_switch_agent(
    session,
):

    questions_per_agent = session.get(
        "questions_per_agent",
        2,
    )

    question_number = session.get(
        "question_number",
        0,
    )

    return (
        question_number
        >= questions_per_agent
    )


# ============================================================
# MOVE TO NEXT AGENT
# ============================================================

def move_to_next_agent(
    session_id,
):

    session = get_interview(
        session_id
    )

    if not session:

        return None

    order = get_panel_order(
        session
    )

    current_index = session.get(
        "current_panel_index",
        0,
    )

    next_index = (
        current_index + 1
    )

    # --------------------------------------------------------
    # Panel finished
    # --------------------------------------------------------

    if next_index >= len(order):

        update_interview(
            session_id,

            current_agent=None,

            status="evaluation",
        )

        return {

            "completed": True,

            "current_agent": None,
        }

    # --------------------------------------------------------
    # Move forward
    # --------------------------------------------------------

    next_agent = order[
        next_index
    ]

    update_interview(
        session_id,

        current_panel_index=next_index,

        current_agent=next_agent,

        question_number=0,
    )

    return {

        "completed": False,

        "current_agent": next_agent,

        "agent_name": get_agent_name(
            next_agent
        ),
    }


# ============================================================
# RECORD QUESTION
# ============================================================

def record_agent_question(
    session_id,
    agent_type,
):

    session = get_interview(
        session_id
    )

    if not session:

        return None

    question_number = session.get(
        "question_number",
        0,
    )

    update_interview(
        session_id,

        question_number=(
            question_number + 1
        ),
    )

    return get_interview(
        session_id
    )


# ============================================================
# RECORD OBSERVATION
# ============================================================

def record_observation(
    session_id,
    agent_type,
    observation,
):

    return add_agent_observation(
        session_id,
        agent_type,
        observation,
    )