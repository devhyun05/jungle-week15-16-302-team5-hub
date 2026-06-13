import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.config import get_settings
from app.db.base import Base
from app.db.session import get_db
from app.main import create_app
from app.models import RefreshToken, User
from app.services.auth_service import get_valid_refresh_token


@pytest.fixture()
def db() -> Session:
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(bind=engine)
    TestingSessionLocal = sessionmaker(
        autocommit=False,
        autoflush=False,
        bind=engine,
    )

    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture()
def client(db: Session) -> TestClient:
    app = create_app()

    def override_get_db():
        yield db

    app.dependency_overrides[get_db] = override_get_db
    return TestClient(app)


def signup_payload(email: str = "slime@example.com") -> dict[str, str]:
    return {
        "email": email,
        "password": "password123",
        "nickname": "말랑이",
    }


def test_signup_creates_user_without_exposing_password(
    client: TestClient,
    db: Session,
) -> None:
    response = client.post("/auth/signup", json=signup_payload())

    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "slime@example.com"
    assert data["nickname"] == "말랑이"
    assert "password" not in data
    assert "password_hash" not in data

    user = db.query(User).filter(User.email == "slime@example.com").one()
    assert user.password_hash != "password123"


def test_signup_rejects_duplicate_email(client: TestClient) -> None:
    first_response = client.post("/auth/signup", json=signup_payload())
    second_response = client.post("/auth/signup", json=signup_payload())

    assert first_response.status_code == 201
    assert second_response.status_code == 400


def test_login_returns_access_token_and_sets_refresh_cookie(
    client: TestClient,
    db: Session,
) -> None:
    client.post("/auth/signup", json=signup_payload())

    response = client.post(
        "/auth/login",
        json={"email": "slime@example.com", "password": "password123"},
    )

    settings = get_settings()
    data = response.json()

    assert response.status_code == 200
    assert data["token_type"] == "bearer"
    assert isinstance(data["access_token"], str)
    assert data["user"]["email"] == "slime@example.com"
    assert settings.refresh_token_cookie_name in response.cookies
    assert db.query(RefreshToken).count() == 1


def test_login_rejects_wrong_password(client: TestClient) -> None:
    client.post("/auth/signup", json=signup_payload())

    response = client.post(
        "/auth/login",
        json={"email": "slime@example.com", "password": "wrong-password"},
    )

    assert response.status_code == 401


def test_me_uses_bearer_access_token(client: TestClient) -> None:
    client.post("/auth/signup", json=signup_payload())
    login_response = client.post(
        "/auth/login",
        json={"email": "slime@example.com", "password": "password123"},
    )
    access_token = login_response.json()["access_token"]

    missing_token_response = client.get("/auth/me")
    me_response = client.get(
        "/auth/me",
        headers={"Authorization": f"Bearer {access_token}"},
    )

    assert missing_token_response.status_code == 401
    assert me_response.status_code == 200
    assert me_response.json()["email"] == "slime@example.com"


def test_refresh_rotates_refresh_token_and_issues_new_access_token(
    client: TestClient,
    db: Session,
) -> None:
    client.post("/auth/signup", json=signup_payload())
    login_response = client.post(
        "/auth/login",
        json={"email": "slime@example.com", "password": "password123"},
    )
    old_refresh_token = login_response.cookies[get_settings().refresh_token_cookie_name]
    old_token_row = get_valid_refresh_token(db, old_refresh_token)

    refresh_response = client.post("/auth/refresh")

    new_refresh_token = refresh_response.cookies[get_settings().refresh_token_cookie_name]
    db.refresh(old_token_row)

    assert refresh_response.status_code == 200
    assert isinstance(refresh_response.json()["access_token"], str)
    assert refresh_response.json()["user"]["email"] == "slime@example.com"
    assert new_refresh_token != old_refresh_token
    assert old_token_row.revoked_at is not None
    assert db.query(RefreshToken).count() == 2


def test_refresh_requires_cookie(client: TestClient) -> None:
    response = client.post("/auth/refresh")

    assert response.status_code == 401


def test_logout_revokes_refresh_token_and_deletes_cookie(
    client: TestClient,
    db: Session,
) -> None:
    client.post("/auth/signup", json=signup_payload())
    login_response = client.post(
        "/auth/login",
        json={"email": "slime@example.com", "password": "password123"},
    )
    refresh_token = login_response.cookies[get_settings().refresh_token_cookie_name]
    token_row = get_valid_refresh_token(db, refresh_token)

    response = client.post("/auth/logout")
    db.refresh(token_row)

    assert response.status_code == 204
    assert token_row.revoked_at is not None
    assert "max-age=0" in response.headers["set-cookie"].lower()
