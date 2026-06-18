from dataclasses import dataclass
from datetime import datetime
from urllib.parse import urlencode

import httpx
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import (
    create_access_token,
    create_refresh_token,
    get_refresh_token_expires_at,
    hash_refresh_token,
)
from app.db.models import User
from app.repositories import auth_token_repository, notification_repository, user_repository
from app.schemas.auth import CurrentUserResponse


GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
GOOGLE_USERINFO_URL = "https://openidconnect.googleapis.com/v1/userinfo"


@dataclass
class GoogleProfile:
    """
    Google userinfo 응답 중 JungleLog에 필요한 값만 모은 자료형이다.

    dict를 그대로 계속 넘기면 어느 key가 필요한지 흐려지므로,
    service 내부에서는 명시적인 dataclass로 바꿔서 사용한다.
    """

    google_sub: str
    email: str
    name: str
    profile_image_url: str | None


@dataclass
class LoginTokenBundle:
    """
    로그인 또는 refresh 성공 후 브라우저 cookie에 내려줄 token 묶음이다.

    access_token은 API 인증용 짧은 token이고,
    refresh_token은 access token 재발급용 긴 token이다.
    """

    access_token: str
    refresh_token: str
    refresh_token_expires_at: datetime


def get_google_login_url(state: str) -> str:
    """
    사용자를 Google 로그인 화면으로 보내기 위한 URL을 만든다.

    state는 CSRF 방어용 임시 문자열이다.
    로그인 시작 시 cookie에 state를 저장하고, callback으로 돌아왔을 때 query state와 비교한다.
    """

    if not settings.google_client_id:
        raise RuntimeError("GOOGLE_CLIENT_ID가 설정되어 있지 않습니다.")

    query_params = {
        "client_id": settings.google_client_id,
        "redirect_uri": settings.google_redirect_uri,
        "response_type": "code",
        "scope": "openid email profile",
        "state": state,
        "prompt": "select_account",
    }

    return f"{GOOGLE_AUTH_URL}?{urlencode(query_params)}"


async def exchange_google_code_for_access_token(code: str) -> str:
    """
    Google callback으로 받은 authorization code를 Google access token으로 교환한다.

    브라우저가 받은 code만으로는 사용자 정보를 알 수 없다.
    백엔드가 Google token endpoint에 client secret과 code를 보내고,
    Google access token을 받아야 userinfo endpoint를 호출할 수 있다.
    """

    if not settings.google_client_secret:
        raise RuntimeError("GOOGLE_CLIENT_SECRET이 설정되어 있지 않습니다.")

    request_data = {
        "client_id": settings.google_client_id,
        "client_secret": settings.google_client_secret,
        "code": code,
        "grant_type": "authorization_code",
        "redirect_uri": settings.google_redirect_uri,
    }

    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.post(
            GOOGLE_TOKEN_URL,
            data=request_data,
            headers={"Accept": "application/json"},
        )

    if response.status_code >= 400:
        raise RuntimeError("Google token 교환에 실패했습니다.")

    token_data = response.json()
    google_access_token = token_data.get("access_token")

    if not google_access_token:
        raise RuntimeError("Google token 응답에 access_token이 없습니다.")

    return google_access_token


async def get_google_profile(google_access_token: str) -> GoogleProfile:
    """
    Google access token으로 사용자의 Google profile을 조회한다.

    여기서 가져오는 `sub`가 users.google_sub에 저장되는 값이다.
    `sub`는 Google 계정의 고유 id라 email보다 로그인 매칭 기준으로 안정적이다.
    """

    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.get(
            GOOGLE_USERINFO_URL,
            headers={
                "Authorization": f"Bearer {google_access_token}",
                "Accept": "application/json",
            },
        )

    if response.status_code >= 400:
        raise RuntimeError("Google 사용자 정보 조회에 실패했습니다.")

    profile_data = response.json()

    if profile_data.get("email_verified") is not True:
        raise RuntimeError("Google 이메일 인증이 확인되지 않았습니다.")

    google_sub = profile_data.get("sub")
    email = profile_data.get("email")

    if not google_sub or not email:
        raise RuntimeError("Google 사용자 정보에 sub 또는 email이 없습니다.")

    name = profile_data.get("name") or email.split("@")[0]
    profile_image_url = profile_data.get("picture")

    return GoogleProfile(
        google_sub=google_sub,
        email=email,
        name=name,
        profile_image_url=profile_image_url,
    )


def get_or_create_google_login_user(
    db: Session,
    google_profile: GoogleProfile,
) -> User:
    """
    Google profile을 JungleLog users 테이블의 User row로 변환한다.

    이미 가입된 Google 계정이면 기존 사용자를 갱신하고,
    처음 보는 Google 계정이면 승인 대기 사용자 또는 초기 관리자로 생성한다.
    """

    existing_user = user_repository.get_user_by_google_sub(
        db=db,
        google_sub=google_profile.google_sub,
    ) or user_repository.get_user_by_email(
        db=db,
        email=google_profile.email,
    )

    user = user_repository.get_or_create_google_user(
        db=db,
        email=google_profile.email,
        google_sub=google_profile.google_sub,
        name=google_profile.name,
        profile_image_url=google_profile.profile_image_url,
    )

    if existing_user is None and user.approval_status == user_repository.APPROVAL_PENDING:
        for admin in user_repository.list_approved_admins(db=db):
            notification_repository.create_notification(
                db=db,
                user_id=admin.id,
                notification_type="approval-pending",
                message=f"{user.name}님이 Google 로그인 후 승인 대기 상태가 되었습니다.",
                link_url="/admin/users",
            )

    return user


def issue_login_tokens(
    db: Session,
    user: User,
    user_agent: str | None,
    ip_address: str | None,
) -> LoginTokenBundle:
    """
    JungleLog access token과 refresh token을 새로 발급한다.

    access token은 JWT 문자열 그대로 cookie에 내려주고,
    refresh token은 원문을 cookie에 내려주되 DB에는 hash만 저장한다.
    """

    access_token = create_access_token(user_id=user.id)
    refresh_token = create_refresh_token()
    refresh_token_hash = hash_refresh_token(refresh_token)
    refresh_token_expires_at = get_refresh_token_expires_at()

    auth_token_repository.create_refresh_token_record(
        db=db,
        user_id=user.id,
        token_hash=refresh_token_hash,
        expires_at=refresh_token_expires_at,
        user_agent=user_agent,
        ip_address=ip_address,
    )

    return LoginTokenBundle(
        access_token=access_token,
        refresh_token=refresh_token,
        refresh_token_expires_at=refresh_token_expires_at,
    )


def rotate_refresh_token(
    db: Session,
    refresh_token: str,
    user_agent: str | None,
    ip_address: str | None,
) -> LoginTokenBundle | None:
    """
    기존 refresh token을 확인하고 새 token 묶음으로 교체한다.

    refresh token rotation은 같은 refresh token을 계속 재사용하지 않게 하는 방식이다.
    정상 refresh가 일어나면 새 refresh token을 발급하고, 기존 token은 revoked_at으로 폐기한다.
    """

    refresh_token_hash = hash_refresh_token(refresh_token)
    refresh_token_record = auth_token_repository.get_refresh_token_by_hash(
        db=db,
        token_hash=refresh_token_hash,
    )

    if refresh_token_record is None:
        return None

    if not auth_token_repository.is_refresh_token_active(refresh_token_record):
        return None

    user = user_repository.get_user_by_id(
        db=db,
        user_id=refresh_token_record.user_id,
    )

    if user is None:
        return None

    token_bundle = issue_login_tokens(
        db=db,
        user=user,
        user_agent=user_agent,
        ip_address=ip_address,
    )
    new_refresh_token_hash = hash_refresh_token(token_bundle.refresh_token)
    new_refresh_token_record = auth_token_repository.get_refresh_token_by_hash(
        db=db,
        token_hash=new_refresh_token_hash,
    )
    replaced_by_token_id = new_refresh_token_record.id if new_refresh_token_record else None

    auth_token_repository.revoke_refresh_token(
        db=db,
        refresh_token=refresh_token_record,
        replaced_by_token_id=replaced_by_token_id,
    )

    return token_bundle


def revoke_refresh_token_value(db: Session, refresh_token: str) -> None:
    """
    cookie로 받은 refresh token 원문을 찾아 폐기한다.

    로그아웃은 access token을 서버에서 따로 저장하지 않기 때문에,
    브라우저 cookie를 지우고 refresh token을 DB에서 폐기하는 방식으로 처리한다.
    """

    refresh_token_hash = hash_refresh_token(refresh_token)
    refresh_token_record = auth_token_repository.get_refresh_token_by_hash(
        db=db,
        token_hash=refresh_token_hash,
    )

    if refresh_token_record is None:
        return

    if refresh_token_record.revoked_at is not None:
        return

    auth_token_repository.revoke_refresh_token(
        db=db,
        refresh_token=refresh_token_record,
    )


def build_current_user_response(user: User) -> CurrentUserResponse:
    """
    SQLAlchemy User model을 /auth/me 응답 schema로 변환한다.

    DB column 이름은 profile_image_url, approval_status처럼 snake_case이고,
    API 응답은 schema alias를 통해 profileImageUrl, approvalStatus로 내려간다.
    """

    return CurrentUserResponse(
        id=user.id,
        email=user.email,
        name=user.name,
        profile_image_url=user.profile_image_url,
        role=user.role,
        approval_status=user.approval_status,
    )
