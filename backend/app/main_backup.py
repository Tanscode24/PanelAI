# app/main.py

import os

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from app.agora_agent import generate_rtc_token

from app.agora_conversation import (
    start_agent,
    stop_agent,
)

from app.config import (
    AGORA_APP_ID,
    AGORA_NOVA_PIPELINE_ID,
    AGORA_MIRA_PIPELINE_ID,
    AGORA_ATLAS_PIPELINE_ID,
    AGORA_BYTE_PIPELINE_ID,
)

from app.interview import (
    create_interview,
    get_interview,
    update_interview,
    end_interview,
    add_transcript,
    add_agent_observation,
    add_agent_score,
)

from app.prompts import get_interview_prompt

from app.panel_orchestrator import (
    get_panel_order,
    get_current_agent,
    get_agent_name,
    build_candidate_context,
    move_to_next_agent,
    record_agent_question,
    should_switch_agent,
)

from app.evaluation import evaluate_interview


app = FastAPI(
    title="PanelAI Backend"
)


# =========================================================
# CORS
# =========================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================================================
# REQUEST MODELS
# =========================================================

class TokenRequest(BaseModel):

    channel_name: str

    uid: int


class InterviewStartRequest(BaseModel):

    candidate_name: str

    interview_type: str

    role: str = ""

    experience: str = ""

    difficulty: str = "medium"

    duration: int = 45

    context: str = ""


class InterviewEndRequest(BaseModel):

    session_id: str


class AdvanceInterviewRequest(BaseModel):

    session_id: str


class TranscriptRequest(BaseModel):

    session_id: str

    speaker: str

    text: str

    agent: str | None = None


class ObservationRequest(BaseModel):

    session_id: str

    agent: str

    observation: str

    score: float | None = Field(
        default=None,
        ge=0,
        le=10,
    )


class ScoreRequest(BaseModel):

    session_id: str

    agent: str

    score: float = Field(
        ge=0,
        le=10,
    )


# =========================================================
# AGENT MAPPING
# =========================================================

AGENT_PIPELINES = {

    "technical": {

        "name": "NOVA",

        "pipeline_id": (
            AGORA_NOVA_PIPELINE_ID
        ),
    },

    "behavioral": {

        "name": "MIRA",

        "pipeline_id": (
            AGORA_MIRA_PIPELINE_ID
        ),
    },

    "system_design": {

        "name": "ATLAS",

        "pipeline_id": (
            AGORA_ATLAS_PIPELINE_ID
        ),
    },

    "coding": {

        "name": "BYTE",

        "pipeline_id": (
            AGORA_BYTE_PIPELINE_ID
        ),
    },
}


# =========================================================
# ROOT
# =========================================================

@app.get("/")
def root():

    return {

        "message": (
            "PanelAI backend is running"
        ),

        "service": "PanelAI",

        "status": "online",
    }


# =========================================================
# HEALTH CHECK
# =========================================================

@app.get("/api/health")
def health():

    return {

        "status": "ok",

        "service": "PanelAI Backend",

        "agents": {

            "NOVA": bool(
                AGORA_NOVA_PIPELINE_ID
            ),

            "MIRA": bool(
                AGORA_MIRA_PIPELINE_ID
            ),

            "ATLAS": bool(
                AGORA_ATLAS_PIPELINE_ID
            ),

            "BYTE": bool(
                AGORA_BYTE_PIPELINE_ID
            ),
        },

        # Local evaluator.
        # No OpenAI is required.
        "evaluation": True,

        "evaluation_type": "local",
    }


# =========================================================
# AGORA RTC TOKEN
# =========================================================

@app.post("/api/agora/token")
def create_agora_token(
    request: TokenRequest,
):

    try:

        token = generate_rtc_token(

            channel_name=(
                request.channel_name
            ),

            uid=request.uid,
        )

        return {

            "token": token,

            "app_id": AGORA_APP_ID,

            "channel_name": (
                request.channel_name
            ),

            "uid": request.uid,
        }

    except Exception as e:

        raise HTTPException(

            status_code=500,

            detail=(
                "Failed to generate Agora token: "
                f"{str(e)}"
            ),
        )


# =========================================================
# START INTERVIEW
# =========================================================

@app.post("/api/interview/start")
def start_interview(
    request: InterviewStartRequest,
):

    valid_types = [

        "full-panel",

        "technical",

        "behavioral",

        "system_design",

        "coding",
    ]

    if request.interview_type not in valid_types:

        raise HTTPException(

            status_code=400,

            detail=(
                "Invalid interview type. "
                "Choose full-panel, technical, "
                "behavioral, system_design, or coding."
            ),
        )

    # -----------------------------------------------------
    # First interviewer
    # -----------------------------------------------------

    if request.interview_type == "full-panel":

        starting_agent_type = "technical"

    else:

        starting_agent_type = (
            request.interview_type
        )

    # -----------------------------------------------------
    # Agent configuration
    # -----------------------------------------------------

    agent_config = AGENT_PIPELINES[
        starting_agent_type
    ]

    agent_name = agent_config[
        "name"
    ]

    pipeline_id = agent_config[
        "pipeline_id"
    ]

    if not pipeline_id:

        raise HTTPException(

            status_code=500,

            detail=(
                f"{agent_name} pipeline ID "
                "is not configured."
            ),
        )

    # -----------------------------------------------------
    # Create session
    # -----------------------------------------------------

    session = create_interview(

        candidate_name=(
            request.candidate_name
        ),

        interview_type=(
            request.interview_type
        ),

        role=request.role,

        experience=request.experience,

        difficulty=request.difficulty,

        duration=request.duration,

        context=request.context,
    )

    session_id = session[
        "session_id"
    ]

    # -----------------------------------------------------
    # Agora channel
    # -----------------------------------------------------

    channel_name = (
        f"panelai-{session_id}"
    )

    # -----------------------------------------------------
    # Candidate UID
    # -----------------------------------------------------

    candidate_uid = 2001

    # -----------------------------------------------------
    # Candidate token
    # -----------------------------------------------------

    try:

        candidate_token = (
            generate_rtc_token(

                channel_name=channel_name,

                uid=candidate_uid,
            )
        )

    except Exception as e:

        raise HTTPException(

            status_code=500,

            detail=(
                "Failed to generate candidate "
                f"Agora token: {str(e)}"
            ),
        )

    # -----------------------------------------------------
    # Personalized prompt
    # -----------------------------------------------------

    prompt = get_interview_prompt(

        interview_type=(
            starting_agent_type
        ),

        candidate_name=(
            request.candidate_name
        ),

        context=request.context,

        role=request.role,

        experience=request.experience,

        difficulty=request.difficulty,

        transcript="",

        previous_observations="",
    )

    # -----------------------------------------------------
    # Start Agora interviewer
    # -----------------------------------------------------

    try:

        agora_agent = start_agent(

            channel_name=channel_name,

            pipeline_id=pipeline_id,

            prompt=prompt,

            candidate_uid=candidate_uid,
        )

    except Exception as e:

        raise HTTPException(

            status_code=500,

            detail=(
                f"Failed to start {agent_name}: "
                f"{str(e)}"
            ),
        )

    # -----------------------------------------------------
    # Agent ID
    # -----------------------------------------------------

    agent_id = (

        agora_agent.get(
            "agent_id"
        )

        or

        agora_agent.get(
            "agentId"
        )
    )

    # -----------------------------------------------------
    # Save state
    # -----------------------------------------------------

    update_interview(

        session_id,

        channel_name=channel_name,

        candidate_uid=candidate_uid,

        agent_id=agent_id,

        agent_pipeline_id=pipeline_id,

        current_agent=(
            starting_agent_type
        ),

        current_panel_index=0,

        question_number=0,
    )

    updated_session = get_interview(
        session_id
    )

    # -----------------------------------------------------
    # Return
    # -----------------------------------------------------

    return {

        "session_id": session_id,

        "candidate_name": (
            request.candidate_name
        ),

        "interview_type": (
            request.interview_type
        ),

        "status": "active",

        "role": request.role,

        "experience": request.experience,

        "difficulty": request.difficulty,

        "duration": request.duration,

        "context": request.context,

        "agent_type": (
            starting_agent_type
        ),

        "agent_name": agent_name,

        "agent_id": agent_id,

        "app_id": AGORA_APP_ID,

        "channel_name": channel_name,

        "candidate_uid": candidate_uid,

        "candidate_token": candidate_token,

        "prompt": prompt,

        "panel_order": (
            get_panel_order(
                updated_session
            )
        ),

        "current_panel_index": 0,

        "session": updated_session,

        "agora_agent": agora_agent,
    }


# =========================================================
# GET INTERVIEW
# =========================================================

@app.get("/api/interview/{session_id}")
def interview_details(
    session_id: str,
):

    session = get_interview(
        session_id
    )

    if not session:

        raise HTTPException(

            status_code=404,

            detail=(
                "Interview session not found"
            ),
        )

    return session


# =========================================================
# ADD TRANSCRIPT MESSAGE
# =========================================================

@app.post("/api/interview/transcript")
def add_transcript_message(
    request: TranscriptRequest,
):

    session = get_interview(
        request.session_id
    )

    if not session:

        raise HTTPException(

            status_code=404,

            detail=(
                "Interview session not found"
            ),
        )

    if not request.text.strip():

        raise HTTPException(

            status_code=400,

            detail=(
                "Transcript text cannot be empty."
            ),
        )

    message = add_transcript(

        session_id=(
            request.session_id
        ),

        speaker=request.speaker,

        text=request.text.strip(),

        agent=request.agent,
    )

    return {

        "success": True,

        "message": message,
    }


# =========================================================
# ADD AGENT OBSERVATION + OPTIONAL SCORE
# =========================================================

@app.post("/api/interview/observation")
def add_observation(
    request: ObservationRequest,
):

    session = get_interview(
        request.session_id
    )

    if not session:

        raise HTTPException(

            status_code=404,

            detail=(
                "Interview session not found"
            ),
        )

    valid_agents = list(
        AGENT_PIPELINES.keys()
    )

    if request.agent not in valid_agents:

        raise HTTPException(

            status_code=400,

            detail=(
                "Invalid agent. Choose "
                "technical, behavioral, "
                "system_design, or coding."
            ),
        )

    if not request.observation.strip():

        raise HTTPException(

            status_code=400,

            detail=(
                "Observation cannot be empty."
            ),
        )

    # -----------------------------------------------------
    # Save observation
    # -----------------------------------------------------

    updated_session = (
        add_agent_observation(

            session_id=(
                request.session_id
            ),

            agent=request.agent,

            observation=(
                request.observation.strip()
            ),
        )
    )

    # -----------------------------------------------------
    # Save score if supplied
    # -----------------------------------------------------

    if request.score is not None:

        updated_session = add_agent_score(

            session_id=(
                request.session_id
            ),

            agent=request.agent,

            score=request.score,
        )

    return {

        "success": True,

        "agent": request.agent,

        "score": request.score,

        "session": updated_session,
    }


# =========================================================
# ADD AGENT SCORE
# =========================================================

@app.post("/api/interview/score")
def add_score(
    request: ScoreRequest,
):

    session = get_interview(
        request.session_id
    )

    if not session:

        raise HTTPException(

            status_code=404,

            detail=(
                "Interview session not found"
            ),
        )

    valid_agents = list(
        AGENT_PIPELINES.keys()
    )

    if request.agent not in valid_agents:

        raise HTTPException(

            status_code=400,

            detail=(
                "Invalid agent. Choose "
                "technical, behavioral, "
                "system_design, or coding."
            ),
        )

    updated_session = add_agent_score(

        session_id=request.session_id,

        agent=request.agent,

        score=request.score,
    )

    return {

        "success": True,

        "agent": request.agent,

        "score": request.score,

        "session": updated_session,
    }


# =========================================================
# GET CURRENT INTERVIEWER PROMPT
# =========================================================

@app.get(
    "/api/interview/{session_id}/prompt"
)
def get_current_interview_prompt(
    session_id: str,
):

    session = get_interview(
        session_id
    )

    if not session:

        raise HTTPException(

            status_code=404,

            detail=(
                "Interview session not found"
            ),
        )

    current_agent = get_current_agent(
        session
    )

    if not current_agent:

        return {

            "status": "evaluation",

            "agent_type": None,

            "agent_name": None,

            "prompt": None,
        }

    transcript = build_candidate_context(
        session
    )

    observations = session.get(
        "agent_observations",
        {},
    )

    previous_observations = []

    for agent_type, notes in (
        observations.items()
    ):

        if agent_type == current_agent:

            continue

        for note in notes:

            previous_observations.append(

                f"{get_agent_name(agent_type)}: "
                f"{note}"
            )

    previous_observations_text = (
        "\n".join(
            previous_observations
        )
    )

    prompt = get_interview_prompt(

        interview_type=current_agent,

        candidate_name=session.get(
            "candidate_name",
            "",
        ),

        context=session.get(
            "context",
            "",
        ),

        role=session.get(
            "role",
            "",
        ),

        experience=session.get(
            "experience",
            "",
        ),

        difficulty=session.get(
            "difficulty",
            "medium",
        ),

        transcript=transcript,

        previous_observations=(
            previous_observations_text
        ),
    )

    return {

        "session_id": session_id,

        "agent_type": current_agent,

        "agent_name": get_agent_name(
            current_agent
        ),

        "prompt": prompt,
    }


# =========================================================
# RECORD AGENT QUESTION
# =========================================================

@app.post(
    "/api/interview/{session_id}/question"
)
def record_question(
    session_id: str,
):

    session = get_interview(
        session_id
    )

    if not session:

        raise HTTPException(

            status_code=404,

            detail=(
                "Interview session not found"
            ),
        )

    current_agent = get_current_agent(
        session
    )

    if not current_agent:

        return {

            "completed": True,

            "status": "evaluation",
        }

    updated_session = (
        record_agent_question(

            session_id,

            current_agent,
        )
    )

    if not updated_session:

        raise HTTPException(

            status_code=500,

            detail=(
                "Failed to record question."
            ),
        )

    return {

        "success": True,

        "session_id": session_id,

        "agent_type": current_agent,

        "agent_name": get_agent_name(
            current_agent
        ),

        "question_number": (
            updated_session.get(
                "question_number",
                0,
            )
        ),

        "questions_per_agent": (
            updated_session.get(
                "questions_per_agent",
                2,
            )
        ),

        "should_switch": (
            should_switch_agent(
                updated_session
            )
        ),
    }


# =========================================================
# ADVANCE TO NEXT PANEL INTERVIEWER
# =========================================================

@app.post(
    "/api/interview/advance"
)
def advance_interview(
    request: AdvanceInterviewRequest,
):

    session = get_interview(
        request.session_id
    )

    if not session:

        raise HTTPException(

            status_code=404,

            detail=(
                "Interview session not found"
            ),
        )

    current_agent_type = (
        get_current_agent(
            session
        )
    )

    if not current_agent_type:

        return {

            "completed": True,

            "status": "evaluation",

            "message": (
                "Panel interview completed."
            ),
        }

    # -----------------------------------------------------
    # Require all questions
    # -----------------------------------------------------

    if not should_switch_agent(
        session
    ):

        questions_per_agent = (
            session.get(
                "questions_per_agent",
                2,
            )
        )

        question_number = (
            session.get(
                "question_number",
                0,
            )
        )

        raise HTTPException(

            status_code=400,

            detail=(
                f"{get_agent_name(current_agent_type)} "
                f"has completed "
                f"{question_number}/"
                f"{questions_per_agent} "
                "questions. Complete the "
                "current section before advancing."
            ),
        )

    # -----------------------------------------------------
    # Stop current agent
    # -----------------------------------------------------

    current_agent_id = session.get(
        "agent_id"
    )

    stop_response = None

    if current_agent_id:

        try:

            stop_response = stop_agent(
                current_agent_id
            )

        except Exception as e:

            stop_response = {

                "error": str(e)
            }

    # -----------------------------------------------------
    # Move panel
    # -----------------------------------------------------

    transition = move_to_next_agent(

        request.session_id
    )

    if not transition:

        raise HTTPException(

            status_code=500,

            detail=(
                "Failed to advance panel."
            ),
        )

    # -----------------------------------------------------
    # Completed
    # -----------------------------------------------------

    if transition.get(
        "completed"
    ):

        update_interview(

            request.session_id,

            agent_id=None,

            agent_pipeline_id=None,
        )

        return {

            "completed": True,

            "status": "evaluation",

            "message": (
                "All panel interviewers "
                "have completed their sections."
            ),

            "previous_agent": {

                "type": current_agent_type,

                "name": get_agent_name(
                    current_agent_type
                ),
            },

            "stop_response": stop_response,
        }

    # -----------------------------------------------------
    # Next agent
    # -----------------------------------------------------

    next_agent_type = transition[
        "current_agent"
    ]

    next_agent_config = (
        AGENT_PIPELINES[
            next_agent_type
        ]
    )

    next_agent_name = (
        next_agent_config[
            "name"
        ]
    )

    next_pipeline_id = (
        next_agent_config[
            "pipeline_id"
        ]
    )

    if not next_pipeline_id:

        raise HTTPException(

            status_code=500,

            detail=(
                f"{next_agent_name} pipeline ID "
                "is not configured."
            ),
        )

    session = get_interview(
        request.session_id
    )

    # -----------------------------------------------------
    # Transcript
    # -----------------------------------------------------

    transcript = build_candidate_context(
        session
    )

    # -----------------------------------------------------
    # Previous observations
    # -----------------------------------------------------

    observations = session.get(
        "agent_observations",
        {},
    )

    previous_observations = []

    for agent_type, notes in (
        observations.items()
    ):

        if agent_type == next_agent_type:

            continue

        for note in notes:

            previous_observations.append(

                f"{get_agent_name(agent_type)}: "
                f"{note}"
            )

    previous_observations_text = (
        "\n".join(
            previous_observations
        )
    )

    # -----------------------------------------------------
    # Personalized prompt
    # -----------------------------------------------------

    prompt = get_interview_prompt(

        interview_type=next_agent_type,

        candidate_name=session.get(
            "candidate_name",
            "",
        ),

        context=session.get(
            "context",
            "",
        ),

        role=session.get(
            "role",
            "",
        ),

        experience=session.get(
            "experience",
            "",
        ),

        difficulty=session.get(
            "difficulty",
            "medium",
        ),

        transcript=transcript,

        previous_observations=(
            previous_observations_text
        ),
    )

    # -----------------------------------------------------
    # Start next Agora agent
    # -----------------------------------------------------

    try:

        next_agora_agent = start_agent(

            channel_name=session[
                "channel_name"
            ],

            pipeline_id=next_pipeline_id,

            prompt=prompt,

            candidate_uid=session[
                "candidate_uid"
            ],
        )

    except Exception as e:

        raise HTTPException(

            status_code=500,

            detail=(
                f"Failed to start "
                f"{next_agent_name}: "
                f"{str(e)}"
            ),
        )

    # -----------------------------------------------------
    # New agent ID
    # -----------------------------------------------------

    next_agent_id = (

        next_agora_agent.get(
            "agent_id"
        )

        or

        next_agora_agent.get(
            "agentId"
        )
    )

    # -----------------------------------------------------
    # Save next state
    # -----------------------------------------------------

    update_interview(

        request.session_id,

        agent_id=next_agent_id,

        agent_pipeline_id=next_pipeline_id,

        question_number=0,
    )

    return {

        "completed": False,

        "status": "active",

        "previous_agent": {

            "type": current_agent_type,

            "name": get_agent_name(
                current_agent_type
            ),
        },

        "current_agent": {

            "type": next_agent_type,

            "name": next_agent_name,
        },

        "agent_id": next_agent_id,

        "pipeline_id": next_pipeline_id,

        "prompt": prompt,

        "transcript": transcript,

        "stop_response": stop_response,

        "agora_agent": next_agora_agent,
    }


# =========================================================
# FINAL EVALUATION
# =========================================================

@app.post(
    "/api/interview/{session_id}/evaluate"
)
def evaluate_completed_interview(
    session_id: str,
):

    session = get_interview(
        session_id
    )

    if not session:

        raise HTTPException(

            status_code=404,

            detail=(
                "Interview session not found"
            ),
        )

    # -----------------------------------------------------
    # Evaluation only after panel
    # -----------------------------------------------------

    if session.get("status") not in [

        "evaluation",

        "completed",
    ]:

        raise HTTPException(

            status_code=400,

            detail=(
                "Interview must complete "
                "before evaluation."
            ),
        )

    # -----------------------------------------------------
    # Existing result
    # -----------------------------------------------------

    if session.get("result"):

        return {

            "session_id": session_id,

            "status": "completed",

            "result": session[
                "result"
            ],

            "session": session,
        }

    # -----------------------------------------------------
    # Evaluate
    # -----------------------------------------------------

    try:

        result = evaluate_interview(
            session
        )

    except Exception as e:

        raise HTTPException(

            status_code=500,

            detail=(
                "Failed to evaluate interview: "
                f"{str(e)}"
            ),
        )

    # -----------------------------------------------------
    # Save
    # -----------------------------------------------------

    update_interview(

        session_id,

        result=result,

        status="completed",
    )

    updated_session = get_interview(
        session_id
    )

    return {

        "session_id": session_id,

        "status": "completed",

        "result": result,

        "session": updated_session,
    }


# =========================================================
# END INTERVIEW
# =========================================================

@app.post(
    "/api/interview/end"
)
def finish_interview(
    request: InterviewEndRequest,
):

    session = get_interview(
        request.session_id
    )

    if not session:

        raise HTTPException(

            status_code=404,

            detail=(
                "Interview session not found"
            ),
        )

    # -----------------------------------------------------
    # Stop active agent
    # -----------------------------------------------------

    agent_id = session.get(
        "agent_id"
    )

    agora_stop_response = None

    if agent_id:

        try:

            agora_stop_response = stop_agent(
                agent_id
            )

        except Exception as e:

            agora_stop_response = {

                "error": str(e)
            }

    # -----------------------------------------------------
    # Mark completed
    # -----------------------------------------------------

    completed_session = end_interview(
        request.session_id
    )

    return {

        "message": "Interview completed",

        "session": completed_session,

        "agora_agent_stop": (
            agora_stop_response
        ),
    }