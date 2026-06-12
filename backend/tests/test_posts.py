from fastapi.testclient import TestClient


def signup_and_login(
    client: TestClient,
    *,
    email: str,
    display_name: str,
    password: str = "hello123",
) -> str:
    """테스트용 user를 만들고 access token을 반환한다."""

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


def auth_headers(token: str) -> dict[str, str]:
    """Bearer token header를 매번 직접 쓰지 않기 위한 helper다."""

    return {"Authorization": f"Bearer {token}"}


def create_post(
    client: TestClient,
    token: str,
    *,
    title: str = "First Glow Topic",
    body: str = "Testing my first post",
) -> dict:
    """인증된 사용자로 게시글을 만들고 response JSON을 반환한다."""

    response = client.post(
        "/api/posts/",
        headers=auth_headers(token),
        json={
            "title": title,
            "body": body,
        },
    )

    assert response.status_code == 201
    return response.json()


def test_authenticated_user_can_create_post(client: TestClient):
    token = signup_and_login(
        client,
        email="author@example.com",
        display_name="Author",
    )

    data = create_post(client, token)

    assert data["id"]
    assert data["author_id"]
    assert data["title"] == "First Glow Topic"
    assert data["body"] == "Testing my first post"


def test_create_post_without_token_returns_401(client: TestClient):
    # 게시글 작성은 로그인한 사용자만 가능하다.
    # token이 없으면 get_current_user dependency가 먼저 막아서 401을 반환한다.
    response = client.post(
        "/api/posts/",
        json={
            "title": "No Token",
            "body": "This should not be created",
        },
    )

    assert response.status_code == 401


def test_public_users_can_list_and_read_posts(client: TestClient):
    token = signup_and_login(
        client,
        email="author@example.com",
        display_name="Author",
    )
    post = create_post(client, token)

    # 목록 조회는 공개 API라서 Authorization header 없이도 볼 수 있게 했다.
    list_response = client.get("/api/posts/")

    assert list_response.status_code == 200
    posts = list_response.json()
    assert len(posts) == 1
    assert posts[0]["id"] == post["id"]
    assert posts[0]["title"] == "First Glow Topic"

    # 상세 조회도 현재 Day 1 계약에서는 공개 API다.
    detail_response = client.get(f"/api/posts/{post['id']}")

    assert detail_response.status_code == 200
    assert detail_response.json()["body"] == "Testing my first post"


def test_missing_post_returns_404(client: TestClient):
    # 없는 post_id는 인증 문제가 아니라 "자원이 없음"이므로 404가 맞다.
    response = client.get("/api/posts/999")

    assert response.status_code == 404
    assert response.json()["detail"] == "Post not found"


def test_author_can_update_post(client: TestClient):
    token = signup_and_login(
        client,
        email="author@example.com",
        display_name="Author",
    )
    post = create_post(client, token)

    response = client.put(
        f"/api/posts/{post['id']}",
        headers=auth_headers(token),
        json={
            "title": "Updated Glow Topic",
        },
    )

    assert response.status_code == 200

    data = response.json()
    assert data["title"] == "Updated Glow Topic"

    # PostUpdateRequest는 title/body가 optional이다.
    # title만 보내면 기존 body는 그대로 유지되어야 한다.
    assert data["body"] == "Testing my first post"


def test_update_post_without_token_returns_401(client: TestClient):
    token = signup_and_login(
        client,
        email="author@example.com",
        display_name="Author",
    )
    post = create_post(client, token)

    response = client.put(
        f"/api/posts/{post['id']}",
        json={
            "title": "No Token",
        },
    )

    assert response.status_code == 401


def test_other_user_cannot_update_post(client: TestClient):
    owner_token = signup_and_login(
        client,
        email="owner@example.com",
        display_name="Owner",
    )
    other_token = signup_and_login(
        client,
        email="other@example.com",
        display_name="Other",
    )
    post = create_post(client, owner_token)

    response = client.put(
        f"/api/posts/{post['id']}",
        headers=auth_headers(other_token),
        json={
            "title": "Hijacked Title",
        },
    )

    # 403은 "로그인은 했지만 이 글의 작성자가 아님"이라는 뜻이다.
    assert response.status_code == 403
    assert response.json()["detail"] == "Not allowed to update this post"


def test_update_post_rejects_blank_title(client: TestClient):
    token = signup_and_login(
        client,
        email="author@example.com",
        display_name="Author",
    )
    post = create_post(client, token)

    response = client.put(
        f"/api/posts/{post['id']}",
        headers=auth_headers(token),
        json={
            "title": "   ",
        },
    )

    assert response.status_code == 400
    assert response.json()["detail"] == "Title cannot be empty or whitespace"


def test_update_post_rejects_blank_body(client: TestClient):
    token = signup_and_login(
        client,
        email="author@example.com",
        display_name="Author",
    )
    post = create_post(client, token)

    response = client.put(
        f"/api/posts/{post['id']}",
        headers=auth_headers(token),
        json={
            "body": "   ",
        },
    )

    assert response.status_code == 400
    assert response.json()["detail"] == "Body cannot be empty or whitespace"


def test_author_can_delete_post(client: TestClient):
    token = signup_and_login(
        client,
        email="author@example.com",
        display_name="Author",
    )
    post = create_post(client, token)

    response = client.delete(
        f"/api/posts/{post['id']}",
        headers=auth_headers(token),
    )

    # DELETE 성공은 204 No Content로 정했다.
    # 204는 "성공했지만 response body는 없음"이므로 json을 검사하지 않는다.
    assert response.status_code == 204
    assert response.text == ""

    detail_response = client.get(f"/api/posts/{post['id']}")
    assert detail_response.status_code == 404


def test_delete_post_without_token_returns_401(client: TestClient):
    token = signup_and_login(
        client,
        email="author@example.com",
        display_name="Author",
    )
    post = create_post(client, token)

    response = client.delete(f"/api/posts/{post['id']}")

    assert response.status_code == 401


def test_other_user_cannot_delete_post(client: TestClient):
    owner_token = signup_and_login(
        client,
        email="owner@example.com",
        display_name="Owner",
    )
    other_token = signup_and_login(
        client,
        email="other@example.com",
        display_name="Other",
    )
    post = create_post(client, owner_token)

    response = client.delete(
        f"/api/posts/{post['id']}",
        headers=auth_headers(other_token),
    )

    assert response.status_code == 403
    assert response.json()["detail"] == "Not allowed to delete this post"
