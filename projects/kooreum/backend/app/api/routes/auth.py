from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.auth import LoginRequest, SignupRequest, TokenResponse, UserResponse
from app.services.auth_service import login, signup
from app.api.deps import get_current_user
from app.models.user import User


router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/signup", response_model=UserResponse, status_code=201)
def signup_endpoint(
    signup_request: SignupRequest,
    db: Session = Depends(get_db),
):
    return signup(db, signup_request)


@router.post("/login", response_model=TokenResponse)
def login_endpoint(
    login_request: LoginRequest,
    db: Session = Depends(get_db),
):
    return login(db, login_request)


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
    return login(db, login_request)
