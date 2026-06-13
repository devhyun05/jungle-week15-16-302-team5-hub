"""인증 서비스 연습 대상.

세션 03에서 비밀번호 해시, JWT 생성, 현재 사용자 의존성을 구현한다.
"""
from datetime import datetime, timezone, timedelta
import hashlib
import secrets
import uuid

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.db.session import get_db
from app.models import RefreshToken, User

settings = get_settings()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")
optional_oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/auth/login",
    auto_error=False,
)
PASSWORD_ALGORITHM = "pbkdf2_sha256"
PASSWORD_ITERATIONS = 210_000

# 현재 UTC 시간을 timezone 포함 datetime으로 돌려주는 함수
def utc_now() -> datetime:
    return datetime.now(timezone.utc)


# DB에서 꺼낸 datetime에 timezone 정보가 없으면 UTC 기준 시간으로 보정하는 함수
def ensure_aware_utc(value: datetime) -> datetime:
    if value.tzinfo is None:
        return value.replace(tzinfo=timezone.utc)
    return value.astimezone(timezone.utc)


# 회원가입/비밀번호 저장 전에 평문 비밀번호를 안전한 hash 문자열로 바꾸는 함수
def hash_password(password: str) -> str:
    salt = secrets.token_hex(16)
    digest = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        bytes.fromhex(salt),
        PASSWORD_ITERATIONS
    ).hex()
    return f"{PASSWORD_ALGORITHM}${PASSWORD_ITERATIONS}${salt}${digest}"


# 로그인할 때 입력한 비밀번호가 DB에 저장된 password_hash와 맞는지 확인하는 함수
def verify_password(password: str, password_hash: str) -> bool:
    try:
        algorithm, iterations_text, salt, expected_digest = password_hash.split("$")
        iterations = int(iterations_text)
    except ValueError:
        return False
    if algorithm != PASSWORD_ALGORITHM:
        return False
    
    actual_digest = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        bytes.fromhex(salt),
        iterations,
    ).hex()

    return secrets.compare_digest(actual_digest, expected_digest)


# 로그인 요청에서 받은 이메일로 users 테이블의 사용자를 찾는 함수
def get_user_by_email(db: Session, email: str) -> User | None:
    return db.query(User).filter(User.email == email).first()


# 로그인 성공 또는 refresh 성공 후 API 요청용 access token JWT를 만드는 함수
def create_access_token(user: User) -> str:
    now = utc_now()
    expires_at = now + timedelta(minutes=settings.access_token_expire_minutes)
    payload = {
        "sub": str(user.id),
        "type": "access",
        "iat": now,
        "exp": expires_at,
    }
    return jwt.encode(
        payload,
        settings.jwt_secret_key,
        algorithm=settings.jwt_algorithm
    )

# 브라우저 cookie로 내려보낼 refresh token 원문 랜덤 문자열을 만드는 함수
def generate_refresh_token() -> str:
    return secrets.token_urlsafe(64)


# refresh token 원문을 DB 저장/조회용 sha256 hash 문자열로 바꾸는 함수
def hash_refresh_token(refresh_token: str) -> str:
    return hashlib.sha256(refresh_token.encode("utf-8")).hexdigest()


# refresh token hash, 만료 시간, family_id 등을 refresh_tokens 테이블에 저장하는 함수
def create_refresh_token_record(
    db: Session,
    user: User,
    refresh_token: str,
    family_id: str | None = None,
    user_agent: str | None = None,
    ip_address: str | None = None,
) -> RefreshToken:
    token_row = RefreshToken(
        user_id=user.id,
        token_hash=hash_refresh_token(refresh_token),
        family_id=family_id or uuid.uuid4().hex,
        expires_at=utc_now() + timedelta(days=settings.refresh_token_expire_days),
        user_agent=user_agent,
        ip_address=ip_address,
    )
    db.add(token_row)
    db.commit()
    db.refresh(token_row)
    return token_row


# 로그인 성공 시 access token, refresh token 원문, refresh token DB row를 한 번에 발급하는 함수
def issue_tokens(
    db: Session,
    user: User,
    user_agent: str | None = None,
    ip_address: str | None = None,
) -> tuple[str, str, RefreshToken]:
    access_token =  create_access_token(user)
    refresh_token = generate_refresh_token()
    refresh_token_row = create_refresh_token_record(
        db=db,
        user=user,
        refresh_token=refresh_token,
        user_agent=user_agent,
        ip_address=ip_address,
    )
    return access_token, refresh_token, refresh_token_row

# cookie로 받은 refresh token 원문이 DB 기준으로 유효한지 확인하는 함수
def get_valid_refresh_token(db: Session, refresh_token: str) -> RefreshToken:
    token_hash = hash_refresh_token(refresh_token)
    token_row = db.query(RefreshToken).filter(RefreshToken.token_hash == token_hash).first()

    if token_row is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
        )

    if token_row.revoked_at is not None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token was revoked",
        )

    if ensure_aware_utc(token_row.expires_at) <= utc_now():
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token expired",
        )

    return token_row

# /auth/refresh에서 기존 refresh token을 폐기하고 새 access/refresh token을 발급하는 함수
def rotate_refresh_token(
    db: Session,
    refresh_token: str,
    user_agent: str | None = None,
    ip_address: str | None = None,
) -> tuple[str, str, User]:
    old_token_row = get_valid_refresh_token(db, refresh_token)
    user = db.query(User).filter(User.id == old_token_row.user_id).first()

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )
    now = utc_now()
    old_token_row.revoked_at = now
    old_token_row.last_used_at = now

    new_refresh_token = generate_refresh_token()
    new_token_row = create_refresh_token_record(
        db=db,
        user=user,
        refresh_token=new_refresh_token,
        family_id=old_token_row.family_id,
        user_agent=user_agent,
        ip_address=ip_address,
    )

    old_token_row.replaced_by_token_id = new_token_row.id
    db.commit()

    new_access_token = create_access_token(user)
    return new_access_token, new_refresh_token, user


# 로그아웃할 때 현재 refresh token을 폐기 처리하는 함수
def revoke_refresh_token(db: Session, refresh_token: str) -> None:
    token_hash = hash_refresh_token(refresh_token)
    token_row = db.query(RefreshToken).filter(RefreshToken.token_hash == token_hash).first()

    if token_row is not None and token_row.revoked_at is None:
        token_row.revoked_at = utc_now()
        db.commit()

# Authorization: Bearer access_token을 검증해서 현재 로그인한 User를 가져오는 FastAPI dependency 함수
def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    credentials_error = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
    )

    try:
        payload = jwt.decode(
            token,
            settings.jwt_secret_key,
            algorithms=[settings.jwt_algorithm],
        )
        user_id = payload.get("sub")
        token_type = payload.get("type")
    except JWTError:
        raise credentials_error

    if user_id is None or token_type != "access":
        raise credentials_error

    user = db.query(User).filter(User.id == int(user_id)).first()

    if user is None:
        raise credentials_error

    return user


# 로그인이 필수가 아닌 API에서 token이 있으면 User를 가져오고, 없거나 invalid면 None을 돌려주는 함수
def get_optional_current_user(
    token: str | None = Depends(optional_oauth2_scheme),
    db: Session = Depends(get_db),
) -> User | None:
    if token is None:
        return None

    try:
        return get_current_user(token=token, db=db)
    except HTTPException:
        return None
