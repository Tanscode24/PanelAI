import os
from dotenv import load_dotenv

load_dotenv()


# -----------------------------------------
# Agora RTC
# -----------------------------------------

AGORA_APP_ID = os.getenv("AGORA_APP_ID")

AGORA_APP_CERTIFICATE = os.getenv(
    "AGORA_APP_CERTIFICATE"
)


# -----------------------------------------
# Agora Conversational AI
# -----------------------------------------

AGORA_PROJECT_ID = os.getenv(
    "AGORA_PROJECT_ID"
)

AGORA_NOVA_PIPELINE_ID = os.getenv(
    "AGORA_NOVA_PIPELINE_ID"
)

AGORA_MIRA_PIPELINE_ID = os.getenv(
    "AGORA_MIRA_PIPELINE_ID"
)

AGORA_ATLAS_PIPELINE_ID = os.getenv(
    "AGORA_ATLAS_PIPELINE_ID"
)

AGORA_BYTE_PIPELINE_ID = os.getenv(
    "AGORA_BYTE_PIPELINE_ID"
)


# -----------------------------------------
# Agora REST API
# -----------------------------------------

AGORA_CUSTOMER_ID = os.getenv(
    "AGORA_CUSTOMER_ID"
)

AGORA_CUSTOMER_SECRET = os.getenv(
    "AGORA_CUSTOMER_SECRET"
)


# -----------------------------------------
# OpenAI
# -----------------------------------------

OPENAI_API_KEY = os.getenv(
    "OPENAI_API_KEY"
)

OPENAI_MODEL = os.getenv(
    "OPENAI_MODEL",
    "gpt-4o-mini",
)