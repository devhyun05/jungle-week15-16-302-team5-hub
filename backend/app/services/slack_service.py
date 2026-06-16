import csv
from dataclasses import dataclass
from pathlib import Path
from urllib.parse import urlencode

import httpx
from fastapi import HTTPException, status

from app.core.config import BACKEND_DIR, get_settings

settings = get_settings()

SLACK_AUTHORIZE_URL = "https://slack.com/openid/connect/authorize"
SLACK_TOKEN_URL = "https://slack.com/api/openid.connect.token"
SLACK_USER_INFO_URL = "https://slack.com/api/openid.connect.userInfo"


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


def get_allowed_email_set() -> set[str]:
    if not settings.allowed_email_csv_path:
        return set()

    csv_path = Path(settings.allowed_email_csv_path)
    if not csv_path.is_absolute():
        csv_path = BACKEND_DIR / csv_path

    if not csv_path.exists():
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Allowed email CSV file does not exist.",
        )

    allowed_emails: set[str] = set()

    with csv_path.open(newline="", encoding="utf-8") as file:
        reader = csv.reader(file)
        for row in reader:
            if not row:
                continue

            email = row[0].strip().lower()
            if not email or email == "email":
                continue

            allowed_emails.add(email)

    return allowed_emails


def validate_allowed_email(email: str) -> None:
    allowed_emails = get_allowed_email_set()
    if not allowed_emails:
        return

    if email.strip().lower() not in allowed_emails:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This email is not allowed to use Jungle Market.",
        )
