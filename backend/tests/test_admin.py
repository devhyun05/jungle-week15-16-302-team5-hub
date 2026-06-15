from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.user import User


def auth_headers(token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {token}"}


def signup_and_login(
    client: TestClient,
    *,
    email: str,
    display_name: str,
    password: str = "hello123",
) -> str:
    signup_response = client.post(
        "/api/auth/signup",
        json={
            "email": email,
            "display_name": display_name,
            "password": password,
        },
    )
    assert signup_response.status_code == 201

    login_response = client.post(
        "/api/auth/login",
        json={
            "email": email,
            "password": password,
        },
    )
    assert login_response.status_code == 200

    return login_response.json()["access_token"]


def make_admin(db_session: Session, email: str) -> int:
    user = db_session.query(User).filter(User.email == email).one()
    user.role = "admin"
    db_session.commit()
    db_session.refresh(user)
    return user.id


def test_admin_health_without_token_returns_401(client: TestClient):
    response = client.get("/api/admin/health")

    assert response.status_code == 401


def test_admin_health_with_regular_user_returns_403(client: TestClient):
    token = signup_and_login(
        client,
        email="regular@example.com",
        display_name="Regular User",
    )

    response = client.get(
        "/api/admin/health",
        headers=auth_headers(token),
    )

    assert response.status_code == 403
    assert response.json()["detail"] == "Admin access required"


def test_admin_health_with_admin_user_returns_200(
    client: TestClient,
    db_session: Session,
):
    email = "admin@example.com"
    token = signup_and_login(
        client,
        email=email,
        display_name="Admin User",
    )
    admin_user_id = make_admin(db_session, email)

    response = client.get(
        "/api/admin/health",
        headers=auth_headers(token),
    )

    assert response.status_code == 200
    assert response.json() == {
        "status": "ok",
        "admin_user_id": admin_user_id,
    }
