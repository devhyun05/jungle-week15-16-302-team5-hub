from fastapi import APIRouter, Cookie, Depends, HTTPException, Response, status
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.config import get_settings
from app.core.security import create_oauth_state
from app.db.session import get_db
from app.models.user import User
from app.repositories.user_repository import (
    delete_refresh_token_by_user_id,
    get_user_by_id,
    save_refresh_token,
    verify_stored_refresh_token,
)
from app.schemas.auth import TokenRefreshResponse
from app.schemas.user import UserMe
from app.services.auth_service import login_with_slack_code
from app.services.jwt_service import (
    create_access_token,
    create_refresh_token,
    decode_refresh_token,
    get_refresh_token_expires_at,
)
from app.services.slack_service import build_slack_authorize_url

router = APIRouter(prefix="/auth", tags=["auth"])
settings = get_settings()


def set_auth_cookies(response: Response, access_token: str, refresh_token: str) -> None:
    response.set_cookie(
        key=settings.access_token_cookie_name,
        value=access_token,
        httponly=True,
        secure=settings.cookie_secure,
        samesite=settings.cookie_samesite,
        max_age=settings.access_token_expire_minutes * 60,
    )
    response.set_cookie(
        key=settings.refresh_token_cookie_name,
        value=refresh_token,
        httponly=True,
        secure=settings.cookie_secure,
        samesite=settings.cookie_samesite,
        max_age=settings.refresh_token_expire_days * 24 * 60 * 60,
    )


def clear_auth_cookies(response: Response) -> None:
    response.delete_cookie(settings.access_token_cookie_name)
    response.delete_cookie(settings.refresh_token_cookie_name)


@router.get("/slack/login")
def start_slack_login() -> RedirectResponse:
    # OAuth callback 검증에 사용할 state 값을 만든다.
    state = create_oauth_state()

    # 사용자를 Slack 인증 페이지로 보낸다.
    response = RedirectResponse(build_slack_authorize_url(state=state))

    # callback에서 비교할 수 있도록 같은 state를 쿠키에 저장한다.
    response.set_cookie(
        key=settings.oauth_state_cookie_name,
        value=state,
        httponly=True,
        secure=settings.cookie_secure,
        samesite=settings.cookie_samesite,
        max_age=10 * 60,
    )
    return response


@router.get("/slack/callback")
async def slack_callback(
    code: str,
    state: str,
    db: Session = Depends(get_db),
    saved_state: str | None = Cookie(
        default=None,
        alias=settings.oauth_state_cookie_name,
    ),
) -> RedirectResponse:
    if saved_state is None or saved_state != state:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid OAuth state.",
        )

    _, access_token, refresh_token = await login_with_slack_code(db, code=code)

    response = RedirectResponse(f"{settings.frontend_url}/")
    response.delete_cookie(settings.oauth_state_cookie_name)
    set_auth_cookies(
        response,
        access_token=access_token,
        refresh_token=refresh_token,
    )
    return response


@router.post("/refresh", response_model=TokenRefreshResponse)
def refresh_access_token(
    response: Response,
    db: Session = Depends(get_db),
    refresh_token: str | None = Cookie(
        default=None,
        alias=settings.refresh_token_cookie_name,
    ),
) -> TokenRefreshResponse:
    if refresh_token is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="다시 로그인 하세요.",
        )

    payload = decode_refresh_token(refresh_token)
    user_id = int(payload["sub"])

    if not verify_stored_refresh_token(
        db,
        user_id=user_id,
        refresh_token=refresh_token,
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="접근 권한이 없습니다.",
        )

    user = get_user_by_id(db, user_id=user_id)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="다시 로그인 하세요.",
        )

    access_token = create_access_token(user_id=user.id, role=user.role)
    new_refresh_token = create_refresh_token(user_id=user.id)
    save_refresh_token(
        db,
        user_id=user.id,
        refresh_token=new_refresh_token,
        expires_at=get_refresh_token_expires_at(),
    )

    set_auth_cookies(
        response,
        access_token=access_token,
        refresh_token=new_refresh_token,
    )
    return TokenRefreshResponse(message="Token refreshed.")


@router.get("/me", response_model=UserMe)
def read_me(current_user: User = Depends(get_current_user)) -> UserMe:
    return UserMe.model_validate(current_user)


@router.post("/logout")
def logout(
    response: Response,
    db: Session = Depends(get_db),
    refresh_token: str | None = Cookie(
        default=None,
        alias=settings.refresh_token_cookie_name,
    ),
) -> dict[str, str]:
    if refresh_token is not None:
        try:
            payload = decode_refresh_token(refresh_token)
            delete_refresh_token_by_user_id(db, user_id=int(payload["sub"]))
        except HTTPException:
            pass

    clear_auth_cookies(response)
    return {"message": "Logged out."}
