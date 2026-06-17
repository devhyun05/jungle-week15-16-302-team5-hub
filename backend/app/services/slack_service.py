from dataclasses import dataclass
from urllib.parse import urlencode

import httpx
from fastapi import HTTPException, status

from app.core.config import get_settings

settings = get_settings()

SLACK_AUTHORIZE_URL = "https://slack.com/openid/connect/authorize"
SLACK_TOKEN_URL = "https://slack.com/api/openid.connect.token"
SLACK_USER_INFO_URL = "https://slack.com/api/openid.connect.userInfo"
SLACK_LOOKUP_BY_EMAIL_URL = "https://slack.com/api/users.lookupByEmail"


@dataclass(frozen=True)
class SlackUserInfo:
    slack_user_id: str
    slack_team_id: str
    email: str
    username: str
    profile_image_url: str | None


def build_slack_authorize_url(state: str) -> str:
    params = {
        "client_id": settings.slack_client_id,
        "scope": "openid profile email",
        "redirect_uri": settings.slack_redirect_uri,
        "state": state,
        "response_type": "code",
    }

    if settings.allowed_slack_team_id:
        params["team"] = settings.allowed_slack_team_id

    query = urlencode(params)
    return f"{SLACK_AUTHORIZE_URL}?{query}"


async def exchange_code_for_access_token(code: str) -> str:
    async with httpx.AsyncClient(timeout=10) as client:
        response = await client.post(
            SLACK_TOKEN_URL,
            data={
                "client_id": settings.slack_client_id,
                "client_secret": settings.slack_client_secret,
                "code": code,
                "redirect_uri": settings.slack_redirect_uri,
            },
        )

    data = response.json()
    if not data.get("ok") or not data.get("access_token"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to exchange Slack authorization code.",
        )

    return data["access_token"]


async def fetch_slack_user_info(access_token: str) -> SlackUserInfo:
    async with httpx.AsyncClient(timeout=10) as client:
        response = await client.get(
            SLACK_USER_INFO_URL,
            headers={"Authorization": f"Bearer {access_token}"},
        )

    data = response.json()
    if not data.get("ok", True):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to fetch Slack user info.",
        )

    slack_user_id = data.get("https://slack.com/user_id") or data.get("sub")
    slack_team_id = data.get("https://slack.com/team_id")
    email = data.get("email")
    username = data.get("name") or email
    profile_image_url = (
        data.get("picture")
        or data.get("https://slack.com/user_image_512")
        or data.get("https://slack.com/user_image_192")
    )

    if not slack_user_id or not slack_team_id or not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Slack user info is missing required fields.",
        )

    return SlackUserInfo(
        slack_user_id=slack_user_id,
        slack_team_id=slack_team_id,
        email=email,
        username=username,
        profile_image_url=profile_image_url,
    )


def validate_allowed_workspace(slack_team_id: str) -> None:
    if not settings.allowed_slack_team_id:
        return

    if slack_team_id != settings.allowed_slack_team_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This Slack workspace is not allowed.",
        )


async def lookup_slack_user_by_email(email: str) -> SlackUserInfo:
    if not settings.slack_bot_token:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Slack bot token is not configured.",
        )

    async with httpx.AsyncClient(timeout=10) as client:
        response = await client.get(
            SLACK_LOOKUP_BY_EMAIL_URL,
            params={"email": email.strip().lower()},
            headers={"Authorization": f"Bearer {settings.slack_bot_token}"},
        )

    try:
        response.raise_for_status()
        data = response.json()
    except (httpx.HTTPError, ValueError) as error:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Failed to communicate with Slack API.",
        ) from error

    slack_error = data.get("error")
    if slack_error == "users_not_found":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="정글 Slack workspace에 가입된 이메일로 로그인해주세요.",
        )
    if slack_error == "missing_scope":
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Slack app 권한에 users:read, users:read.email이 필요합니다.",
        )
    if slack_error in {"invalid_auth", "not_authed"}:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Slack bot token 설정을 확인해주세요.",
        )
    if data.get("ok") is not True:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Slack workspace 멤버 확인에 실패했습니다.",
        )

    user = data.get("user") or {}
    profile = user.get("profile") or {}
    slack_user_id = user.get("id")
    slack_team_id = user.get("team_id") or settings.allowed_slack_team_id
    slack_email = profile.get("email") or email.strip().lower()
    username = (
        profile.get("display_name")
        or profile.get("real_name")
        or user.get("name")
        or slack_email
    )
    profile_image_url = profile.get("image_512") or profile.get("image_192")

    if not slack_user_id or not slack_team_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Slack user info is missing required fields.",
        )

    validate_allowed_workspace(slack_team_id)

    return SlackUserInfo(
        slack_user_id=slack_user_id,
        slack_team_id=slack_team_id,
        email=slack_email,
        username=username,
        profile_image_url=profile_image_url,
    )
