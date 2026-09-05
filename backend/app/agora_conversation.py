# app/agora_conversation.py

import base64
import requests

from app.config import (
    AGORA_PROJECT_ID,
    AGORA_CUSTOMER_ID,
    AGORA_CUSTOMER_SECRET,
)

from app.agora_agent import generate_rtc_token


# ============================================================
# AGORA API URLS
# ============================================================

AGORA_JOIN_URL = (
    "https://api.agora.io/api/conversational-ai-agent/v2"
    "/projects/{project_id}/join"
)

AGORA_LEAVE_URL = (
    "https://api.agora.io/api/conversational-ai-agent/v2"
    "/projects/{project_id}/agents/{agent_id}/leave"
)


# ============================================================
# AUTH
# ============================================================

def get_agora_rest_auth() -> str:

    credentials = (
        f"{AGORA_CUSTOMER_ID}:"
        f"{AGORA_CUSTOMER_SECRET}"
    )

    encoded = base64.b64encode(
        credentials.encode()
    ).decode()

    return f"Basic {encoded}"


# ============================================================
# START AGENT
# ============================================================

def start_agent(
    channel_name: str,
    pipeline_id: str,
    prompt: str = "",
    candidate_uid: int = 2001,
):
    """
    Start an Agora Conversational AI agent.

    The published Agent Studio pipeline is used as the base
    configuration.

    The interview-specific prompt is injected through
    properties.llm.system_messages.
    """

    if not AGORA_PROJECT_ID:

        raise RuntimeError(
            "AGORA_PROJECT_ID is not configured."
        )

    if not pipeline_id:

        raise RuntimeError(
            "Agora pipeline ID is not configured."
        )

    # --------------------------------------------------------
    # AI agent UID
    # --------------------------------------------------------

    # UID 0 tells Agora to assign a unique UID.
    #
    # IMPORTANT:
    # The token must match the UID behavior required by Agora.
    #
    # We keep the current working setup here rather than
    # changing the UID strategy unexpectedly.
    agent_uid = 0

    agent_token = generate_rtc_token(
        channel_name=channel_name,
        uid=agent_uid,
    )

    # --------------------------------------------------------
    # API URL
    # --------------------------------------------------------

    url = AGORA_JOIN_URL.format(
        project_id=AGORA_PROJECT_ID
    )

    # --------------------------------------------------------
    # Headers
    # --------------------------------------------------------

    headers = {
        "Authorization": get_agora_rest_auth(),
        "Content-Type": "application/json",
        "Accept": "application/json",
    }

    # --------------------------------------------------------
    # Base properties
    # --------------------------------------------------------

    properties = {
        "channel": channel_name,

        "token": agent_token,

        "agent_rtc_uid": str(agent_uid),

        "remote_rtc_uids": [
            str(candidate_uid)
        ],

        # Agent should remain alive until our backend
        # explicitly stops it.
        "idle_timeout": 0,

        # Enable RTM transcript/event support.
        "advanced_features": {
            "enable_rtm": True,
        },

        "parameters": {
            "data_channel": "rtm",
        },
    }

    # --------------------------------------------------------
    # Personalized LLM prompt
    # --------------------------------------------------------

    if prompt:

        properties["llm"] = {
            "system_messages": [
                {
                    "role": "system",
                    "content": prompt,
                }
            ],

            # Keep enough conversation history for the agent
            # to understand the current interaction.
            "max_history": 50,
        }

    # --------------------------------------------------------
    # Request payload
    # --------------------------------------------------------

    payload = {
        "name": (
            f"panelai-{channel_name}-"
            f"{pipeline_id[:8]}"
        ),

        # Published Agent Studio pipeline.
        #
        # This is intentionally top-level.
        "pipeline_id": pipeline_id,

        "properties": properties,
    }

    # --------------------------------------------------------
    # Request
    # --------------------------------------------------------

    response = requests.post(
        url,
        headers=headers,
        json=payload,
        timeout=30,
    )

    # --------------------------------------------------------
    # Error handling
    # --------------------------------------------------------

    if not response.ok:

        try:
            error_body = response.json()
        except Exception:
            error_body = response.text

        raise RuntimeError(
            "Agora agent start failed: "
            f"HTTP {response.status_code} - "
            f"{error_body}"
        )

    # --------------------------------------------------------
    # Return Agora response
    # --------------------------------------------------------

    return response.json()


# ============================================================
# STOP AGENT
# ============================================================

def stop_agent(
    agent_id: str,
):
    """
    Stop a running Agora Conversational AI agent.
    """

    if not AGORA_PROJECT_ID:

        raise RuntimeError(
            "AGORA_PROJECT_ID is not configured."
        )

    if not agent_id:

        raise RuntimeError(
            "Agent ID is required."
        )

    url = AGORA_LEAVE_URL.format(
        project_id=AGORA_PROJECT_ID,
        agent_id=agent_id,
    )

    headers = {
        "Authorization": get_agora_rest_auth(),
        "Content-Type": "application/json",
        "Accept": "application/json",
    }

    response = requests.post(
        url,
        headers=headers,
        json={},
        timeout=30,
    )

    if not response.ok:

        try:
            error_body = response.json()
        except Exception:
            error_body = response.text

        raise RuntimeError(
            "Agora agent stop failed: "
            f"HTTP {response.status_code} - "
            f"{error_body}"
        )

    return response.json()