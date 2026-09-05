import time

from agora_token_builder import RtcTokenBuilder

from app.config import (
    AGORA_APP_ID,
    AGORA_APP_CERTIFICATE,
)


def generate_rtc_token(
    channel_name: str,
    uid: int,
    expiration_seconds: int = 3600,
) -> str:

    if not AGORA_APP_ID:
        raise ValueError("AGORA_APP_ID is not configured")

    if not AGORA_APP_CERTIFICATE:
        raise ValueError("AGORA_APP_CERTIFICATE is not configured")

    role = 1

    expiration_timestamp = (
        int(time.time()) + expiration_seconds
    )

    token = RtcTokenBuilder.buildTokenWithUid(
        AGORA_APP_ID,
        AGORA_APP_CERTIFICATE,
        channel_name,
        uid,
        role,
        expiration_timestamp,
    )

    return token