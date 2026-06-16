from fastapi import APIRouter, Depends, Response, Cookie, Header, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.session import get_db
from app.schemas.auth import LoginRequest, SignupRequest, TokenResponse, UserResponse
from app.services.auth_service import login, signup, refresh_access_token, logout_refresh_session
from app.api.deps import get_current_user
from app.models.user import User


router = APIRouter(prefix="/api/auth", tags=["auth"])


def set_auth_cookies(
    response: Response,
    *,
    refresh_token: str,
    csrf_token: str,
) -> None:
    max_age = settings.refresh_session_absolute_days * 24 * 60 * 60

    response.set_cookie(
        key=settings.refresh_cookie_name,
        value=refresh_token,
        httponly=True,
        secure=settings.cookie_secure,
        samesite=settings.cookie_samesite,
        path=settings.auth_cookie_path,
        max_age=max_age,
    )

    response.set_cookie(
        key=settings.csrf_cookie_name,
        value=csrf_token,
        httponly=False,
        secure=settings.cookie_secure,
        samesite=settings.cookie_samesite,
        path=settings.csrf_cookie_path,
        max_age=max_age,
    )


@router.post("/signup", response_model=UserResponse, status_code=201)
def signup_endpoint(
    signup_request: SignupRequest,
    db: Session = Depends(get_db),
):
    return signup(db, signup_request)


@router.post("/login", response_model=TokenResponse)
def login_endpoint(
    login_request: LoginRequest,
    response: Response,
    db: Session = Depends(get_db),
):
    login_result = login(db, login_request)

    set_auth_cookies(
        response,
        refresh_token=login_result.refresh_token,
        csrf_token=login_result.csrf_token,
    )

    return login_result.token_response


@router.get("/me", response_model=UserResponse)
def me_endpoint(
    current_user: User = Depends(get_current_user),
):
    return current_user


@router.post("/token", response_model=TokenResponse)
def token_endpoint(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    login_request = LoginRequest(
        email=form_data.username,
        password=form_data.password,
    )

    login_result = login(db, login_request)

    return login_result.token_response


@router.post("/refresh", response_model=TokenResponse)
def refresh_endpoint(
    response: Response,
    refresh_token: str | None = Cookie(default=None, alias=settings.refresh_cookie_name),
    csrf_cookie: str | None = Cookie(default=None, alias=settings.csrf_cookie_name),
    csrf_header: str | None = Header(default=None, alias="X-CSRF-Token"),
    db: Session = Depends(get_db),
):
    if not refresh_token:
        raise HTTPException(status_code=401, detail="Missing refresh token")

    refresh_result = refresh_access_token(
        db=db,
        raw_refresh_token=refresh_token,
        csrf_cookie=csrf_cookie or "",
        csrf_header=csrf_header or "",
    )

    set_auth_cookies(
        response,
        refresh_token=refresh_result.refresh_token,
        csrf_token=refresh_result.csrf_token,
    )

    return refresh_result.token_response


@router.post("/logout", status_code=204)
def logout_endpoint(
    response: Response,
    refresh_token: str | None = Cookie(default=None, alias=settings.refresh_cookie_name),
    csrf_cookie: str | None = Cookie(default=None, alias=settings.csrf_cookie_name),
    csrf_header: str | None = Header(default=None, alias="X-CSRF-Token"),
    db: Session = Depends(get_db),
):
    if not refresh_token:
        raise HTTPException(status_code=401, detail="Missing refresh token")

    logout_refresh_session(
        db=db,
        raw_refresh_token=refresh_token,
        csrf_cookie=csrf_cookie or "",
        csrf_header=csrf_header or "",
    )

    response.delete_cookie(
        key=settings.refresh_cookie_name,
        path=settings.auth_cookie_path,
        secure=settings.cookie_secure,
        samesite=settings.cookie_samesite,
    )

    response.delete_cookie(
        key=settings.csrf_cookie_name,
        path=settings.csrf_cookie_path,
        secure=settings.cookie_secure,
        samesite=settings.cookie_samesite,
    )

    return None
