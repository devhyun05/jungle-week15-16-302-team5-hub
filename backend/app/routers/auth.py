"""인증 라우터 연습 대상.

세션 04에서 구현할 것:
- `POST /auth/signup`
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`
- `GET /auth/me`
"""
from fastapi import APIRouter, Cookie, Depends, HTTPException, Request, Response, status
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.db.session import get_db
from app.models import User
from app.schemas.auth import LoginRequest, SignupRequest, TokenResponse, UserResponse
from app.services.auth_service import (
    get_current_user,
    get_user_by_email,
    hash_password,
    issue_tokens,
    rotate_refresh_token,
    revoke_refresh_token,
    verify_password,
)

router = APIRouter()
settings = get_settings()

# 로그인/refresh 성공 시 refresh token 원문을 브라우저 HttpOnly cookie로 내려주는 helper입니다.
# access token은 body로 주고, refresh token은 JS가 직접 읽지 못하는 cookie로 보냅니다.
def set_refresh_cookie(response: Response, refresh_token: str) -> None:
    response.set_cookie(
        key=settings.refresh_token_cookie_name,
        value=refresh_token,
        httponly=True,
        secure=settings.refresh_token_cookie_secure,
        samesite="lax",
        path="/auth",
        max_age=settings.refresh_token_expire_days * 24 * 60 * 60,
    )


# 로그아웃 시 브라우저에 저장된 refresh token cookie를 삭제하는 helper입니다.
# DB token 폐기와 별개로, 클라이언트 cookie도 지워야 로그아웃이 완성됩니다.
def delete_refresh_cookie(response: Response) -> None:
    response.delete_cookie(
        key=settings.refresh_token_cookie_name,
        path="/auth",
        samesite="lax",
        secure=settings.refresh_token_cookie_secure,
        httponly=True,
    )


# 회원가입 API입니다.
# 요청 body를 SignupRequest로 검증하고, 중복 email이 없으면 users 테이블에 새 User를 저장합니다.
@router.post(
    "/signup",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
)
def signup(
    payload: SignupRequest,
    db: Session = Depends(get_db),
) -> User:
    existing_user = get_user_by_email(db, payload.email)
    if existing_user is not None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    user = User(
        email=payload.email,
        password_hash=hash_password(payload.password),
        nickname=payload.nickname,
    )

    db.add(user)
    db.commit()
    db.refresh(user)
    return user


# 로그인 API입니다.
# email/password를 확인한 뒤 access token은 response body로, refresh token은 cookie로 내려줍니다.
@router.post(
    "/login",
    response_model=TokenResponse,
)
def login(
    payload: LoginRequest,
    response: Response,
    request: Request,
    db: Session = Depends(get_db),
) -> TokenResponse:
    user = get_user_by_email(db, payload.email)

    if user is None or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    access_token, refresh_token, _refresh_row = issue_tokens(
        db=db,
        user=user,
        user_agent=request.headers.get("user-agent"),
        ip_address=request.client.host if request.client else None,
    )

    set_refresh_cookie(response, refresh_token)

    return TokenResponse(
        access_token=access_token,
        expires_in=settings.access_token_expire_minutes * 60,
        user=user,
    )


# access token 재발급 API입니다.
# cookie의 refresh token을 검증/회전하고, 새 access token과 새 refresh cookie를 내려줍니다.
@router.post(
    "/refresh",
    response_model=TokenResponse,
)
def refresh(
    response: Response,
    request: Request,
    refresh_token: str | None = Cookie(
        default=None,
        alias=settings.refresh_token_cookie_name,
    ),
    db: Session = Depends(get_db),
) -> TokenResponse:
    if refresh_token is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token missing",
        )

    new_access_token, new_refresh_token, user = rotate_refresh_token(
        db=db,
        refresh_token=refresh_token,
        user_agent=request.headers.get("user-agent"),
        ip_address=request.client.host if request.client else None,
    )

    set_refresh_cookie(response, new_refresh_token)

    return TokenResponse(
        access_token=new_access_token,
        expires_in=settings.access_token_expire_minutes * 60,
        user=user,
    )


# 로그아웃 API입니다.
# refresh token cookie가 있으면 DB에서 폐기하고, 브라우저 cookie 삭제 header를 내려줍니다.
@router.post(
    "/logout",
    status_code=status.HTTP_204_NO_CONTENT,
)
def logout(
    response: Response,
    refresh_token: str | None = Cookie(
        default=None,
        alias=settings.refresh_token_cookie_name,
    ),
    db: Session = Depends(get_db),
) -> None:
    if refresh_token is not None:
        revoke_refresh_token(db, refresh_token)

    delete_refresh_cookie(response)


# 현재 로그인 사용자 조회 API입니다.
# Authorization: Bearer access_token을 검증하고, 성공하면 현재 User 정보를 반환합니다.
@router.get(
    "/me",
    response_model=UserResponse,
)
def me(
    current_user: User = Depends(get_current_user),
) -> User:
    return current_user
