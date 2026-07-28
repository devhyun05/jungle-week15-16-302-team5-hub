from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import create_access_token, hash_password, verify_password
from app.models.user import User
from app.schemas.auth import LoginRequest, SignupRequest, TokenResponse


def signup(db: Session, signup_request: SignupRequest) -> User:
    email_normalized = signup_request.email.lower()
    existing_user = db.query(User).filter(User.email == email_normalized).first()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered",
        )
    
    password_hash = hash_password(signup_request.password)

    user = User(
        email=email_normalized,
        display_name=signup_request.display_name,
        password_hash=password_hash,
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user


def login(db: Session, login_request: LoginRequest) -> TokenResponse:
    email_normalized = login_request.email.lower()
    user = db.query(User).filter(User.email == email_normalized).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    
    if not verify_password(login_request.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    
    access_token = create_access_token(subject=str(user.id))

    return TokenResponse(access_token=access_token, user=user)
