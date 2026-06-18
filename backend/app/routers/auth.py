import secrets
from urllib.parse import urlencode

from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from fastapi.responses import JSONResponse, RedirectResponse
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.models import User
from app.db.session import get_db
from app.dependencies.auth import get_current_user
from app.schemas.auth import CurrentUserResponse
from app.services import auth_service


router = APIRouter(prefix="/auth", tags=["auth"])


def get_login_error_redirect_response(message: str) -> RedirectResponse:
    """
    OAuth 실패를 백엔드 JSON 에러가 아니라 프론트 로그인 화면 안내로 연결한다.

    사용자가 Google 로그인 중 취소하거나 state 검증에 실패했을 때
    `localhost:8000`의 JSON 응답을 보는 것보다 `/login` 화면에서 다시 시도 안내를 보는 편이 자연스럽다.
    """

    query_string = urlencode({"authError": message})
    response = RedirectResponse(
        url=f"{settings.frontend_url}/login?{query_string}",
        status_code=status.HTTP_303_SEE_OTHER,
    )
    response.delete_cookie(
        key=settings.oauth_state_cookie_name,
        path="/",
        secure=settings.cookie_secure,
        samesite=settings.cookie_samesite,
    )

    return response


def get_request_ip_address(request: Request) -> str | None:
    """
    refresh token 기록에 남길 요청 IP를 가져온다.

    로컬 개발에서는 request.client.host가 보통 127.0.0.1이고,
    배포 환경에서는 프록시 설정에 따라 별도 header 처리로 확장할 수 있다.
    """

    if request.client is None:
        return None

    return request.client.host


def set_auth_cookies(
    response: Response,
    token_bundle: auth_service.LoginTokenBundle,
) -> None:
    """
    access token과 refresh token을 HttpOnly cookie로 내려준다.

    HttpOnly cookie는 JavaScript에서 직접 읽을 수 없으므로 XSS 피해 범위를 줄일 수 있다.
    프론트엔드는 token 값을 들고 다니지 않고, 요청마다 브라우저가 cookie를 자동 전송한다.
    """

    response.set_cookie(
        key=settings.auth_access_cookie_name,
        value=token_bundle.access_token,
        max_age=settings.jwt_access_token_expire_minutes * 60,
        httponly=True,
        secure=settings.cookie_secure,
        samesite=settings.cookie_samesite,
        path="/",
    )
    response.set_cookie(
        key=settings.auth_refresh_cookie_name,
        value=token_bundle.refresh_token,
        max_age=settings.jwt_refresh_token_expire_days * 24 * 60 * 60,
        httponly=True,
        secure=settings.cookie_secure,
        samesite=settings.cookie_samesite,
        path="/",
    )


def delete_auth_cookies(response: Response) -> None:
    """
    브라우저에 저장된 JungleLog 인증 cookie를 삭제한다.

    로그아웃이나 인증 실패 처리 시 access/refresh cookie를 둘 다 지운다.
    """

    response.delete_cookie(
        key=settings.auth_access_cookie_name,
        path="/",
        secure=settings.cookie_secure,
        samesite=settings.cookie_samesite,
    )
    response.delete_cookie(
        key=settings.auth_refresh_cookie_name,
        path="/",
        secure=settings.cookie_secure,
        samesite=settings.cookie_samesite,
    )


@router.get("/google/login")
def start_google_login() -> RedirectResponse:
    """
    Google 로그인 화면으로 사용자를 보낸다.

    직접 로그인 처리를 하는 endpoint가 아니라,
    Google OAuth 서버로 redirect시키는 시작점이다.
    """

    oauth_state = secrets.token_urlsafe(32)

    try:
        google_login_url = auth_service.get_google_login_url(state=oauth_state)
    except RuntimeError as error:
        return get_login_error_redirect_response(message=str(error))

    response = RedirectResponse(
        url=google_login_url,
        status_code=status.HTTP_307_TEMPORARY_REDIRECT,
    )
    response.set_cookie(
        key=settings.oauth_state_cookie_name,
        value=oauth_state,
        max_age=10 * 60,
        httponly=True,
        secure=settings.cookie_secure,
        samesite=settings.cookie_samesite,
        path="/",
    )

    return response


@router.get("/google/callback")
async def handle_google_callback(
    request: Request,
    code: str | None = None,
    state: str | None = None,
    db: Session = Depends(get_db),
) -> RedirectResponse:
    """
    Google 로그인 성공 후 Google이 다시 호출하는 callback endpoint다.

    query string으로 받은 code를 Google access token으로 교환하고,
    Google 사용자 정보를 가져온 뒤 JungleLog 자체 access/refresh token을 발급한다.
    """

    if code is None or state is None:
        return get_login_error_redirect_response(message="Google OAuth callback 값이 부족합니다.")

    saved_state = request.cookies.get(settings.oauth_state_cookie_name)

    if saved_state is None or saved_state != state:
        return get_login_error_redirect_response(message="Google OAuth state가 일치하지 않습니다.")

    try:
        google_access_token = await auth_service.exchange_google_code_for_access_token(code=code)
        google_profile = await auth_service.get_google_profile(
            google_access_token=google_access_token,
        )
        user = auth_service.get_or_create_google_login_user(
            db=db,
            google_profile=google_profile,
        )
        token_bundle = auth_service.issue_login_tokens(
            db=db,
            user=user,
            user_agent=request.headers.get("user-agent"),
            ip_address=get_request_ip_address(request),
        )
    except RuntimeError as error:
        return get_login_error_redirect_response(message=str(error))

    response = RedirectResponse(
        url=settings.frontend_url,
        status_code=status.HTTP_303_SEE_OTHER,
    )
    set_auth_cookies(response=response, token_bundle=token_bundle)
    response.delete_cookie(
        key=settings.oauth_state_cookie_name,
        path="/",
        secure=settings.cookie_secure,
        samesite=settings.cookie_samesite,
    )

    return response


@router.get("/me", response_model=CurrentUserResponse)
def get_me(
    current_user: User = Depends(get_current_user),
) -> CurrentUserResponse:
    """
    현재 로그인한 사용자 정보를 반환한다.

    프론트엔드는 앱 시작 시 이 API를 호출해서 role, approvalStatus를 확인하고
    STUDENT/COACH/ADMIN 화면 분기를 실제 사용자 기준으로 바꿀 수 있다.
    """

    return auth_service.build_current_user_response(user=current_user)


@router.post("/refresh")
def refresh_login(
    request: Request,
    db: Session = Depends(get_db),
) -> JSONResponse:
    """
    refresh token으로 access token을 재발급한다.

    access token이 15분으로 짧게 만료되어도 사용자가 매번 Google 로그인을 하지 않도록,
    refresh token이 유효하면 새 access/refresh token 묶음으로 교체한다.
    """

    refresh_token = request.cookies.get(settings.auth_refresh_cookie_name)

    if refresh_token is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="refresh token이 없습니다.",
        )

    token_bundle = auth_service.rotate_refresh_token(
        db=db,
        refresh_token=refresh_token,
        user_agent=request.headers.get("user-agent"),
        ip_address=get_request_ip_address(request),
    )

    if token_bundle is None:
        response = JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content={"detail": "refresh token이 유효하지 않습니다."},
        )
        delete_auth_cookies(response=response)
        return response

    response = JSONResponse(content={"status": "ok"})
    set_auth_cookies(response=response, token_bundle=token_bundle)

    return response


@router.post("/logout")
def logout(
    request: Request,
    db: Session = Depends(get_db),
) -> JSONResponse:
    """
    현재 브라우저의 refresh token을 폐기하고 인증 cookie를 삭제한다.

    access token은 서버에 저장하지 않는 JWT라 DB에서 지울 대상이 없다.
    대신 짧은 만료 시간을 두고, 로그아웃 시 브라우저 cookie를 지워 더 이상 보내지 않게 한다.
    """

    refresh_token = request.cookies.get(settings.auth_refresh_cookie_name)

    if refresh_token is not None:
        auth_service.revoke_refresh_token_value(
            db=db,
            refresh_token=refresh_token,
        )

    response = JSONResponse(content={"status": "ok"})
    delete_auth_cookies(response=response)

    return response
