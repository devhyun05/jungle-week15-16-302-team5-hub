from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.core.security import hash_refresh_token
from app.models.refresh_token import RefreshToken
from app.models.session import UserSession


def signup_user(
    client: TestClient,
    *,
    email: str = "day1@example.com",
    password: str = "hello123",
    display_name: str = "Day One",
):
    """회원가입 요청을 반복해서 쓰기 위한 작은 helper다.

    테스트에서 중요한 것은 "어떤 endpoint를 호출했고 무엇을 기대하는가"이므로,
    자주 쓰는 요청 payload는 helper로 빼서 테스트 본문을 읽기 쉽게 만든다.
    """

    return client.post(
        "/api/auth/signup",
        json={
            "email": email,
            "display_name": display_name,
            "password": password,
        },
    )


def login_user(
    client: TestClient,
    *,
    email: str = "day1@example.com",
    password: str = "hello123",
):
    """JSON login endpoint를 호출하는 helper다."""

    return client.post(
        "/api/auth/login",
        json={
            "email": email,
            "password": password,
        },
    )


def test_signup_creates_user_without_password_in_response(client: TestClient):
    # 회원가입은 새 user를 만들기 때문에 성공 status code는 201 Created다.
    response = signup_user(client)

    assert response.status_code == 201

    data = response.json()
    assert data["email"] == "day1@example.com"
    assert data["display_name"] == "Day One"

    # API response에 password 원문이나 password_hash가 섞여 나가면 보안 사고다.
    # route의 response_model=UserResponse가 이 필드를 걸러주는지 확인한다.
    assert "password" not in data
    assert "password_hash" not in data


def test_duplicate_signup_returns_409(client: TestClient):
    # 첫 번째 가입은 성공해야 한다.
    first_response = signup_user(client)
    assert first_response.status_code == 201

    # 같은 email은 users.email unique 규칙과 service의 중복 검사 때문에 실패해야 한다.
    second_response = signup_user(client)

    assert second_response.status_code == 409
    assert second_response.json()["detail"] == "Email already registered"


def test_login_returns_access_token_and_user(client: TestClient):
    signup_user(client)

    response = login_user(client)

    assert response.status_code == 200

    data = response.json()

    # access_token은 이후 Authorization: Bearer <token> header에 넣어 쓰는 로그인 증명이다.
    assert data["access_token"]
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "day1@example.com"


def test_login_sets_refresh_and_csrf_cookies_and_persists_session(
    client: TestClient,
    db_session: Session,
):
    signup_user(client)

    response = login_user(client)

    assert response.status_code == 200

    refresh_cookie = response.cookies.get("refresh_token")
    csrf_cookie = response.cookies.get("csrf_token")

    assert refresh_cookie
    assert csrf_cookie

    set_cookie_headers = response.headers.get_list("set-cookie")
    refresh_cookie_header = next(
        header for header in set_cookie_headers if header.startswith("refresh_token=")
    )
    csrf_cookie_header = next(
        header for header in set_cookie_headers if header.startswith("csrf_token=")
    )

    assert "HttpOnly" in refresh_cookie_header
    assert "HttpOnly" not in csrf_cookie_header
    assert "Path=/api/auth" in refresh_cookie_header
    assert "Path=/" in csrf_cookie_header

    session = db_session.query(UserSession).one()
    refresh_token = db_session.query(RefreshToken).one()

    assert session.user_id == response.json()["user"]["id"]
    assert session.expires_at
    assert session.absolute_expires_at
    assert session.revoked_at is None

    assert refresh_token.session_id == session.id
    assert refresh_token.token_hash == hash_refresh_token(refresh_cookie)
    assert refresh_token.token_hash != refresh_cookie
    assert refresh_token.expires_at == session.expires_at
    assert refresh_token.used_at is None
    assert refresh_token.revoked_at is None
    assert refresh_token.replaced_by_token_id is None


def test_refresh_without_csrf_header_returns_403(client: TestClient):
    signup_user(client)
    login_user(client)

    response = client.post("/api/auth/refresh")

    assert response.status_code == 403
    assert response.json()["detail"] == "Invalid CSRF token"


def test_refresh_rotates_token_and_returns_new_access_token(
    client: TestClient,
    db_session: Session,
):
    signup_user(client)
    login_response = login_user(client)
    old_refresh_cookie = login_response.cookies.get("refresh_token")
    old_csrf_cookie = login_response.cookies.get("csrf_token")

    response = client.post(
        "/api/auth/refresh",
        headers={"X-CSRF-Token": old_csrf_cookie},
    )

    assert response.status_code == 200

    data = response.json()
    assert data["access_token"]
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "day1@example.com"

    new_refresh_cookie = response.cookies.get("refresh_token")
    new_csrf_cookie = response.cookies.get("csrf_token")

    assert new_refresh_cookie
    assert new_csrf_cookie
    assert new_refresh_cookie != old_refresh_cookie
    assert new_csrf_cookie != old_csrf_cookie

    db_session.expire_all()
    session = db_session.query(UserSession).one()
    refresh_tokens = db_session.query(RefreshToken).order_by(RefreshToken.id).all()

    assert len(refresh_tokens) == 2

    old_token, new_token = refresh_tokens

    assert old_token.used_at is not None
    assert old_token.replaced_by_token_id == new_token.id

    assert new_token.session_id == session.id
    assert new_token.token_hash == hash_refresh_token(new_refresh_cookie)
    assert new_token.token_hash != new_refresh_cookie
    assert new_token.expires_at == session.expires_at
    assert new_token.used_at is None
    assert new_token.revoked_at is None
    assert new_token.replaced_by_token_id is None


def test_reusing_old_refresh_token_revokes_session(
    client: TestClient,
    db_session: Session,
):
    signup_user(client)
    login_response = login_user(client)
    old_refresh_cookie = login_response.cookies.get("refresh_token")
    old_csrf_cookie = login_response.cookies.get("csrf_token")

    first_refresh_response = client.post(
        "/api/auth/refresh",
        headers={"X-CSRF-Token": old_csrf_cookie},
    )
    assert first_refresh_response.status_code == 200

    client.cookies.set("refresh_token", old_refresh_cookie)
    client.cookies.set("csrf_token", old_csrf_cookie)

    reuse_response = client.post(
        "/api/auth/refresh",
        headers={"X-CSRF-Token": old_csrf_cookie},
    )

    assert reuse_response.status_code == 401

    db_session.expire_all()
    session = db_session.query(UserSession).one()
    assert session.revoked_at is not None


def test_logout_without_csrf_header_returns_403(client: TestClient):
    signup_user(client)
    login_user(client)

    response = client.post("/api/auth/logout")

    assert response.status_code == 403
    assert response.json()["detail"] == "Invalid CSRF token"


def test_logout_revokes_session_and_clears_cookies(
    client: TestClient,
    db_session: Session,
):
    signup_user(client)
    login_response = login_user(client)
    csrf_cookie = login_response.cookies.get("csrf_token")

    response = client.post(
        "/api/auth/logout",
        headers={"X-CSRF-Token": csrf_cookie},
    )

    assert response.status_code == 204

    db_session.expire_all()
    session = db_session.query(UserSession).one()
    refresh_token = db_session.query(RefreshToken).one()

    assert session.revoked_at is not None
    assert refresh_token.revoked_at is not None

    set_cookie_headers = response.headers.get_list("set-cookie")

    assert any(
        header.startswith("refresh_token=")
        and "Max-Age=0" in header
        and "Path=/api/auth" in header
        for header in set_cookie_headers
    )
    assert any(
        header.startswith("csrf_token=")
        and "Max-Age=0" in header
        and "Path=/" in header
        for header in set_cookie_headers
    )


def test_refresh_after_logout_returns_401(client: TestClient):
    signup_user(client)
    login_response = login_user(client)
    refresh_cookie = login_response.cookies.get("refresh_token")
    csrf_cookie = login_response.cookies.get("csrf_token")

    logout_response = client.post(
        "/api/auth/logout",
        headers={"X-CSRF-Token": csrf_cookie},
    )
    assert logout_response.status_code == 204

    # 삭제된 cookie 값을 공격자가 다시 들고 와도 backend session이 revoke되어 refresh가 실패해야 한다.
    client.cookies.set("refresh_token", refresh_cookie)
    client.cookies.set("csrf_token", csrf_cookie)

    refresh_response = client.post(
        "/api/auth/refresh",
        headers={"X-CSRF-Token": csrf_cookie},
    )

    assert refresh_response.status_code == 401
    assert refresh_response.json()["detail"] == "Session revoked"


def test_login_with_wrong_password_returns_401(client: TestClient):
    signup_user(client)

    response = login_user(client, password="wrong-password")

    # 401은 "로그인 증명이 없거나 틀림"이라는 뜻이다.
    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid email or password"


def test_token_endpoint_supports_swagger_authorize_form_login(client: TestClient):
    signup_user(client)

    # Swagger Authorize의 OAuth2 password flow는 JSON이 아니라 form-urlencoded 형식으로 보낸다.
    # 그래서 /api/auth/token은 email이 아니라 username이라는 필드 이름을 받는다.
    response = client.post(
        "/api/auth/token",
        data={
            "username": "day1@example.com",
            "password": "hello123",
        },
    )

    assert response.status_code == 200

    data = response.json()
    assert data["access_token"]
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "day1@example.com"


def test_me_returns_current_user_from_bearer_token(client: TestClient):
    signup_user(client)
    login_response = login_user(client)
    token = login_response.json()["access_token"]

    # /api/auth/me는 body로 email/password를 받지 않는다.
    # Authorization header의 Bearer token을 decode해서 현재 user를 찾는다.
    response = client.get(
        "/api/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 200
    assert response.json()["email"] == "day1@example.com"


def test_me_without_token_returns_401(client: TestClient):
    # get_current_user dependency가 token을 요구하므로 token 없이 호출하면 401이어야 한다.
    response = client.get("/api/auth/me")

    assert response.status_code == 401


def test_me_with_invalid_token_subject_returns_401(
    client: TestClient,
    monkeypatch,
):
    # token decode 자체는 성공했지만 sub가 int로 바꿀 수 없는 모양이면 500이 아니라 401이어야 한다.
    from app.api import deps

    monkeypatch.setattr(
        deps,
        "decode_access_token",
        lambda token: {"sub": {"unexpected": "shape"}},
    )

    response = client.get(
        "/api/auth/me",
        headers={"Authorization": "Bearer fake-token"},
    )

    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid token"
