from collections.abc import Callable

from fastapi import Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import decode_access_token
from app.db.models import User
from app.db.session import get_db
from app.repositories import user_repository


def get_current_user(
    request: Request,
    db: Session = Depends(get_db),
) -> User:
    """
    HttpOnly access token cookie로 현재 로그인 사용자를 찾는다.

    프론트엔드는 HttpOnly cookie 값을 직접 읽을 수 없다. 대신 `credentials: "include"`로
    요청을 보내면 브라우저가 cookie를 자동 전송하고, 백엔드는 여기서 token을 검증한다.
    """

    access_token = request.cookies.get(settings.auth_access_cookie_name)

    if access_token is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="로그인이 필요합니다.",
        )

    user_id = decode_access_token(access_token)

    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="유효하지 않은 로그인 정보입니다.",
        )

    user = user_repository.get_user_by_id(db=db, user_id=user_id)

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="사용자를 찾을 수 없습니다.",
        )

    return user


def get_optional_current_user(
    request: Request,
    db: Session = Depends(get_db),
) -> User | None:
    """
    로그인하지 않아도 볼 수 있는 공개 API에서 현재 사용자를 선택적으로 찾는다.

    게시글 상세처럼 공개글은 비로그인 사용자도 볼 수 있어야 하지만,
    비공개글은 작성자 본인이나 ADMIN만 볼 수 있어야 한다.
    그래서 token이 없거나 잘못된 경우에는 401을 던지지 않고 None을 반환한다.
    """

    access_token = request.cookies.get(settings.auth_access_cookie_name)

    if access_token is None:
        return None

    user_id = decode_access_token(access_token)

    if user_id is None:
        return None

    return user_repository.get_user_by_id(db=db, user_id=user_id)


def get_current_approved_user(
    current_user: User = Depends(get_current_user),
) -> User:
    """
    로그인했고 관리자 승인이 끝난 사용자만 통과시킨다.
    """

    if current_user.approval_status != user_repository.APPROVAL_APPROVED:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="관리자 승인 후 이용할 수 있습니다.",
        )

    return current_user


def require_roles(*allowed_roles: str) -> Callable[[User], User]:
    """
    특정 role만 접근 가능한 FastAPI dependency를 만든다.

    예: `Depends(require_roles("ADMIN"))`
    """

    def role_dependency(
        current_user: User = Depends(get_current_approved_user),
    ) -> User:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="접근 권한이 없습니다.",
            )

        return current_user

    return role_dependency
