from fastapi.testclient import TestClient


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
