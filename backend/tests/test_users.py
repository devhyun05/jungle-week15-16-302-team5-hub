from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.comment import Comment
from app.models.post import Post


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


def create_post(
    client: TestClient,
    token: str,
    *,
    title: str,
    body: str = "My activity post",
) -> dict:
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
    body: str,
) -> dict:
    response = client.post(
        f"/api/posts/{post_id}/comments",
        headers=auth_headers(token),
        json={"body": body},
    )

    assert response.status_code == 201
    return response.json()


def test_my_activity_requires_login(client: TestClient):
    response = client.get("/api/users/me/activity")

    assert response.status_code == 401


def test_my_activity_returns_current_user_posts_and_comments(client: TestClient):
    token = signup_and_login(
        client,
        email="me@example.com",
        display_name="Me",
    )
    other_token = signup_and_login(
        client,
        email="other@example.com",
        display_name="Other",
    )

    my_post = create_post(client, token, title="My topic")
    other_post = create_post(client, other_token, title="Other topic")
    my_comment = create_comment(
        client,
        token,
        other_post["id"],
        body="My comment on another topic",
    )
    create_comment(
        client,
        other_token,
        my_post["id"],
        body="Other user's comment",
    )

    response = client.get(
        "/api/users/me/activity",
        headers=auth_headers(token),
    )

    assert response.status_code == 200
    data = response.json()
    assert data["user"]["email"] == "me@example.com"
    assert data["user"]["role"] == "user"
    assert [post["id"] for post in data["posts"]] == [my_post["id"]]
    assert [comment["id"] for comment in data["comments"]] == [my_comment["id"]]


def test_my_activity_excludes_deleted_and_hidden_content(
    client: TestClient,
    db_session: Session,
):
    token = signup_and_login(
        client,
        email="me@example.com",
        display_name="Me",
    )
    visible_post = create_post(client, token, title="Visible topic")
    deleted_post = create_post(client, token, title="Deleted topic")
    hidden_post = create_post(client, token, title="Hidden topic")
    visible_comment = create_comment(
        client,
        token,
        visible_post["id"],
        body="Visible comment",
    )
    hidden_comment = create_comment(
        client,
        token,
        visible_post["id"],
        body="Hidden comment",
    )

    delete_response = client.delete(
        f"/api/posts/{deleted_post['id']}",
        headers=auth_headers(token),
    )
    assert delete_response.status_code == 204

    post_to_hide = db_session.query(Post).filter(Post.id == hidden_post["id"]).one()
    post_to_hide.hidden_at = post_to_hide.created_at
    comment_to_hide = (
        db_session.query(Comment)
        .filter(Comment.id == hidden_comment["id"])
        .one()
    )
    comment_to_hide.hidden_at = comment_to_hide.created_at
    db_session.commit()

    response = client.get(
        "/api/users/me/activity",
        headers=auth_headers(token),
    )

    assert response.status_code == 200
    data = response.json()
    assert [post["id"] for post in data["posts"]] == [visible_post["id"]]
    assert [comment["id"] for comment in data["comments"]] == [visible_comment["id"]]
