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
    title: str = "Tagged Glow Topic",
    body: str = "Testing tags",
    tag_names: list[str] | None = None,
) -> dict:
    """인증된 사용자로 태그가 붙은 게시글을 만들고 response JSON을 반환한다."""

    payload = {
        "title": title,
        "body": body,
    }

    if tag_names is not None:
        payload["tag_names"] = tag_names

    response = client.post(
        "/api/posts/",
        headers=auth_headers(token),
        json=payload,
    )

    assert response.status_code == 201
    return response.json()


def normalized_names(post: dict) -> list[str]:
    """PostResponse 안의 tags에서 normalized_name만 꺼낸다."""

    return [tag["normalized_name"] for tag in post["tags"]]


def test_create_post_normalizes_and_deduplicates_tags(client: TestClient):
    token = signup_and_login(
        client,
        email="author@example.com",
        display_name="Author",
    )

    post = create_post(
        client,
        token,
        tag_names=["Sunscreen", " sunscreen ", "  ", "Oily Skin"],
    )

    assert normalized_names(post) == ["sunscreen", "oily skin"]
    assert post["tags"][0]["display_name"] == "Sunscreen"
    assert post["tags"][1]["display_name"] == "Oily Skin"


def test_same_tag_name_reuses_existing_tag_row(client: TestClient):
    token = signup_and_login(
        client,
        email="author@example.com",
        display_name="Author",
    )

    create_post(client, token, tag_names=["Sunscreen"])
    create_post(client, token, tag_names=[" sunscreen "])

    response = client.get("/api/tags/")

    assert response.status_code == 200

    tags = response.json()
    assert len(tags) == 1
    assert tags[0]["normalized_name"] == "sunscreen"


def test_author_can_replace_post_tags(client: TestClient):
    token = signup_and_login(
        client,
        email="author@example.com",
        display_name="Author",
    )
    post = create_post(client, token, tag_names=["sunscreen", "summer"])

    response = client.put(
        f"/api/posts/{post['id']}",
        headers=auth_headers(token),
        json={
            "tag_names": ["skincare"],
        },
    )

    assert response.status_code == 200

    data = response.json()
    assert normalized_names(data) == ["skincare"]


def test_update_without_tag_names_keeps_existing_tags(client: TestClient):
    token = signup_and_login(
        client,
        email="author@example.com",
        display_name="Author",
    )
    post = create_post(client, token, tag_names=["sunscreen"])

    response = client.put(
        f"/api/posts/{post['id']}",
        headers=auth_headers(token),
        json={
            "title": "Updated title only",
        },
    )

    assert response.status_code == 200

    data = response.json()
    assert data["title"] == "Updated title only"
    assert normalized_names(data) == ["sunscreen"]


def test_empty_tag_names_removes_post_connections_but_keeps_tag_rows(
    client: TestClient,
):
    token = signup_and_login(
        client,
        email="author@example.com",
        display_name="Author",
    )
    post = create_post(client, token, tag_names=["sunscreen", "summer"])

    update_response = client.put(
        f"/api/posts/{post['id']}",
        headers=auth_headers(token),
        json={
            "tag_names": [],
        },
    )

    assert update_response.status_code == 200
    assert update_response.json()["tags"] == []

    tags_response = client.get("/api/tags/")

    assert tags_response.status_code == 200

    tag_names = [tag["normalized_name"] for tag in tags_response.json()]
    assert tag_names == ["summer", "sunscreen"]
