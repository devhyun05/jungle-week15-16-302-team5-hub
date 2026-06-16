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
    """댓글 테스트의 부모 자원인 게시글을 만든다."""

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


def create_comment(
    client: TestClient,
    token: str,
    post_id: int,
    *,
    body: str = "First comment",
) -> dict:
    """인증된 사용자로 댓글을 만들고 response JSON을 반환한다."""

    response = client.post(
        f"/api/posts/{post_id}/comments",
        headers=auth_headers(token),
        json={
            "body": body,
        },
    )

    assert response.status_code == 201
    return response.json()


def test_create_comment_without_token_returns_401(client: TestClient):
    token = signup_and_login(
        client,
        email="author@example.com",
        display_name="Author",
    )
    post = create_post(client, token)

    response = client.post(
        f"/api/posts/{post['id']}/comments",
        json={
            "body": "No token",
        },
    )

    assert response.status_code == 401


def test_authenticated_user_can_create_comment(client: TestClient):
    token = signup_and_login(
        client,
        email="author@example.com",
        display_name="Author",
    )
    post = create_post(client, token)

    data = create_comment(client, token, post["id"])

    assert data["id"]
    assert data["post_id"] == post["id"]
    assert data["author_id"]
    assert data["body"] == "First comment"
    assert data["deleted_at"] is None


def test_public_users_can_list_comments_for_post(client: TestClient):
    token = signup_and_login(
        client,
        email="author@example.com",
        display_name="Author",
    )
    post = create_post(client, token)
    comment = create_comment(client, token, post["id"], body="Visible comment")

    response = client.get(f"/api/posts/{post['id']}/comments")

    assert response.status_code == 200
    page = response.json()
    assert page["page"] == 1
    assert page["size"] == 20
    assert page["total"] == 1
    assert page["has_next"] is False
    assert page["has_prev"] is False
    assert len(page["items"]) == 1
    assert page["items"][0]["id"] == comment["id"]
    assert page["items"][0]["body"] == "Visible comment"


def test_list_comments_supports_offset_pagination(client: TestClient):
    token = signup_and_login(
        client,
        email="author@example.com",
        display_name="Author",
    )
    post = create_post(client, token)
    first = create_comment(client, token, post["id"], body="First comment")
    second = create_comment(client, token, post["id"], body="Second comment")
    third = create_comment(client, token, post["id"], body="Third comment")

    first_page_response = client.get(
        f"/api/posts/{post['id']}/comments?page=1&size=2"
    )
    second_page_response = client.get(
        f"/api/posts/{post['id']}/comments?page=2&size=2"
    )

    assert first_page_response.status_code == 200
    assert second_page_response.status_code == 200

    first_page = first_page_response.json()
    assert first_page["page"] == 1
    assert first_page["size"] == 2
    assert first_page["total"] == 3
    assert first_page["has_next"] is True
    assert first_page["has_prev"] is False
    assert [comment["id"] for comment in first_page["items"]] == [
        first["id"],
        second["id"],
    ]

    second_page = second_page_response.json()
    assert second_page["page"] == 2
    assert second_page["size"] == 2
    assert second_page["total"] == 3
    assert second_page["has_next"] is False
    assert second_page["has_prev"] is True
    assert [comment["id"] for comment in second_page["items"]] == [third["id"]]


def test_missing_post_comments_return_404(client: TestClient):
    response = client.get("/api/posts/999/comments")

    assert response.status_code == 404
    assert response.json()["detail"] == "Post not found"


def test_comment_author_can_update_comment(client: TestClient):
    token = signup_and_login(
        client,
        email="author@example.com",
        display_name="Author",
    )
    post = create_post(client, token)
    comment = create_comment(client, token, post["id"])

    response = client.put(
        f"/api/comments/{comment['id']}",
        headers=auth_headers(token),
        json={
            "body": "Updated comment",
        },
    )

    assert response.status_code == 200

    data = response.json()
    assert data["id"] == comment["id"]
    assert data["body"] == "Updated comment"


def test_update_comment_without_token_returns_401(client: TestClient):
    token = signup_and_login(
        client,
        email="author@example.com",
        display_name="Author",
    )
    post = create_post(client, token)
    comment = create_comment(client, token, post["id"])

    response = client.put(
        f"/api/comments/{comment['id']}",
        json={
            "body": "No token",
        },
    )

    assert response.status_code == 401


def test_other_user_cannot_update_comment(client: TestClient):
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
    comment = create_comment(client, owner_token, post["id"])

    response = client.put(
        f"/api/comments/{comment['id']}",
        headers=auth_headers(other_token),
        json={
            "body": "Hijacked comment",
        },
    )

    assert response.status_code == 403
    assert response.json()["detail"] == "Not allowed to update this comment"


def test_author_can_soft_delete_comment(client: TestClient):
    token = signup_and_login(
        client,
        email="author@example.com",
        display_name="Author",
    )
    post = create_post(client, token)
    comment = create_comment(client, token, post["id"])

    response = client.delete(
        f"/api/comments/{comment['id']}",
        headers=auth_headers(token),
    )

    assert response.status_code == 204
    assert response.text == ""

    list_response = client.get(f"/api/posts/{post['id']}/comments")
    assert list_response.status_code == 200
    comment_page = list_response.json()
    assert comment_page["items"] == []
    assert comment_page["total"] == 0


def test_delete_comment_without_token_returns_401(client: TestClient):
    token = signup_and_login(
        client,
        email="author@example.com",
        display_name="Author",
    )
    post = create_post(client, token)
    comment = create_comment(client, token, post["id"])

    response = client.delete(f"/api/comments/{comment['id']}")

    assert response.status_code == 401


def test_other_user_cannot_delete_comment(client: TestClient):
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
    comment = create_comment(client, owner_token, post["id"])

    response = client.delete(
        f"/api/comments/{comment['id']}",
        headers=auth_headers(other_token),
    )

    assert response.status_code == 403
    assert response.json()["detail"] == "Not allowed to delete this comment"
