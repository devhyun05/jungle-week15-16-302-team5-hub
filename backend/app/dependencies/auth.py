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
    HttpOnly cookie에 들어 있는 access token으로 현재 로그인 사용자를 찾는다.

    프론트엔드는 access token 값을 직접 읽지 않는다.
    브라우저가 cookie를 자동으로 보내면 FastAPI가 cookie에서 token을 꺼내고,
    token 안의 user_id를 DB users 테이블의 실제 사용자와 다시 연결한다.
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


def get_current_approved_user(
    current_user: User = Depends(get_current_user),
) -> User:
    """
    로그인뿐 아니라 관리자 승인이 끝난 사용자만 통과시킨다.

    JungleLog는 정글 수강생/코치/관리자만 쓰는 서비스이므로,
    Google 로그인이 성공했더라도 승인 대기 상태면 주요 기능 사용을 막아야 한다.
    """

    if current_user.approval_status != user_repository.APPROVAL_APPROVED:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="관리자 승인 후 이용할 수 있습니다.",
        )

    return current_user


def require_roles(*allowed_roles: str) -> Callable[[User], User]:
    """
    특정 role만 접근 가능한 dependency를 만든다.

    예를 들어 관리자 API에서는 `Depends(require_roles("ADMIN"))`처럼 쓰면 된다.
    지금은 인증 기반을 만드는 단계라 바로 많이 쓰지는 않지만,
    다음 관리자 승인 API와 코치 권한 API에서 재사용할 수 있다.
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
