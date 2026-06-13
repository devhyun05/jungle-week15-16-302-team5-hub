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
    title: str,
    body: str,
    tag_names: list[str] | None = None,
) -> dict:
    """검색 테스트용 게시글을 만든다."""

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


def item_titles(page: dict) -> set[str]:
    return {item["title"] for item in page["items"]}


def test_list_posts_filters_by_query_in_title_or_body(client: TestClient):
    token = signup_and_login(
        client,
        email="author@example.com",
        display_name="Author",
    )
    create_post(
        client,
        token,
        title="Summer sunscreen picks",
        body="Lightweight textures for hot weather",
    )
    create_post(
        client,
        token,
        title="Lip tint comparison",
        body="This routine still needs sunscreen before makeup",
    )
    create_post(
        client,
        token,
        title="Mascara favorites",
        body="No matching keyword here",
    )

    response = client.get("/api/posts/?q=SUNSCREEN&page=1&size=10")

    assert response.status_code == 200

    page = response.json()
    assert page["total"] == 2
    assert len(page["items"]) == 2
    assert page["has_next"] is False
    assert page["has_prev"] is False
    assert item_titles(page) == {
        "Summer sunscreen picks",
        "Lip tint comparison",
    }


def test_list_posts_uses_filtered_total_for_query_pagination(client: TestClient):
    token = signup_and_login(
        client,
        email="author@example.com",
        display_name="Author",
    )
    create_post(client, token, title="Sunscreen one", body="Match")
    create_post(client, token, title="Sunscreen two", body="Match")
    create_post(client, token, title="Sunscreen three", body="Match")
    create_post(client, token, title="Blush routine", body="No match")

    response = client.get("/api/posts/?q=sunscreen&page=1&size=2")

    assert response.status_code == 200

    page = response.json()
    assert page["page"] == 1
    assert page["size"] == 2
    assert page["total"] == 3
    assert len(page["items"]) == 2
    assert page["has_next"] is True
    assert page["has_prev"] is False


def test_list_posts_ignores_blank_query(client: TestClient):
    token = signup_and_login(
        client,
        email="author@example.com",
        display_name="Author",
    )
    create_post(client, token, title="First topic", body="Body")
    create_post(client, token, title="Second topic", body="Body")

    response = client.get("/api/posts/?q=%20%20&page=1&size=10")

    assert response.status_code == 200

    page = response.json()
    assert page["total"] == 2
    assert len(page["items"]) == 2


def test_list_posts_filters_by_tag(client: TestClient):
    token = signup_and_login(
        client,
        email="author@example.com",
        display_name="Author",
    )
    create_post(
        client,
        token,
        title="Summer sunscreen",
        body="Beach day routine",
        tag_names=["summer", "sunscreen"],
    )
    create_post(
        client,
        token,
        title="Winter moisturizer",
        body="Cold weather routine",
        tag_names=["winter", "skincare"],
    )

    response = client.get("/api/posts/?tag=SUMMER&page=1&size=10")

    assert response.status_code == 200

    page = response.json()
    assert page["total"] == 1
    assert len(page["items"]) == 1
    assert page["items"][0]["title"] == "Summer sunscreen"


def test_list_posts_combines_query_and_tag_filters(client: TestClient):
    token = signup_and_login(
        client,
        email="author@example.com",
        display_name="Author",
    )
    create_post(
        client,
        token,
        title="Summer sunscreen",
        body="Beach day routine",
        tag_names=["summer", "sunscreen"],
    )
    create_post(
        client,
        token,
        title="Summer lip tint",
        body="Glossy color routine",
        tag_names=["summer", "makeup"],
    )
    create_post(
        client,
        token,
        title="Daily sunscreen",
        body="Indoor skincare",
        tag_names=["skincare"],
    )

    response = client.get("/api/posts/?q=sunscreen&tag=summer&page=1&size=10")

    assert response.status_code == 200

    page = response.json()
    assert page["total"] == 1
    assert len(page["items"]) == 1
    assert page["items"][0]["title"] == "Summer sunscreen"


def test_blank_tag_filter_is_ignored(client: TestClient):
    token = signup_and_login(
        client,
        email="author@example.com",
        display_name="Author",
    )
    create_post(
        client,
        token,
        title="First topic",
        body="Body",
        tag_names=["summer"],
    )
    create_post(
        client,
        token,
        title="Second topic",
        body="Body",
        tag_names=["winter"],
    )

    response = client.get("/api/posts/?tag=%20%20&page=1&size=10")

    assert response.status_code == 200

    page = response.json()
    assert page["total"] == 2
    assert len(page["items"]) == 2


def test_list_posts_filters_by_multiple_tags_with_and(client: TestClient):
    token = signup_and_login(
        client,
        email="author@example.com",
        display_name="Author",
    )
    create_post(
        client,
        token,
        title="Summer sunscreen",
        body="Body",
        tag_names=["summer", "sunscreen"],
    )
    create_post(
        client,
        token,
        title="Summer lip tint",
        body="Body",
        tag_names=["summer", "makeup"],
    )
    create_post(
        client,
        token,
        title="Daily sunscreen",
        body="Body",
        tag_names=["sunscreen", "skincare"],
    )

    response = client.get("/api/posts/?tags=summer&tags=sunscreen&page=1&size=10")

    assert response.status_code == 200

    page = response.json()
    assert page["total"] == 1
    assert len(page["items"]) == 1
    assert page["items"][0]["title"] == "Summer sunscreen"
