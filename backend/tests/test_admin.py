from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.admin_action_log import AdminActionLog
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


def create_post(
    client: TestClient,
    token: str,
    *,
    title: str = "Moderated topic",
    body: str = "This post will be moderated",
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
    body: str = "Moderated comment",
) -> dict:
    response = client.post(
        f"/api/posts/{post_id}/comments",
        headers=auth_headers(token),
        json={
            "body": body,
        },
    )

    assert response.status_code == 201
    return response.json()


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


def test_admin_can_hide_and_restore_post(
    client: TestClient,
    db_session: Session,
):
    admin_email = "admin@example.com"
    admin_token = signup_and_login(
        client,
        email=admin_email,
        display_name="Admin User",
    )
    admin_user_id = make_admin(db_session, admin_email)
    author_token = signup_and_login(
        client,
        email="author@example.com",
        display_name="Author",
    )
    post = create_post(client, author_token)

    hide_response = client.post(
        f"/api/admin/posts/{post['id']}/hide",
        headers=auth_headers(admin_token),
        json={"reason": "Off-topic"},
    )

    assert hide_response.status_code == 200
    hidden = hide_response.json()
    assert hidden["target_type"] == "post"
    assert hidden["target_id"] == post["id"]
    assert hidden["hidden_at"] is not None
    assert hidden["hidden_by_id"] == admin_user_id
    assert hidden["hidden_reason"] == "Off-topic"

    list_response = client.get("/api/posts/")
    assert list_response.status_code == 200
    assert list_response.json()["items"] == []
    assert list_response.json()["total"] == 0

    detail_response = client.get(f"/api/posts/{post['id']}")
    assert detail_response.status_code == 404

    restore_response = client.post(
        f"/api/admin/posts/{post['id']}/restore",
        headers=auth_headers(admin_token),
    )

    assert restore_response.status_code == 200
    restored = restore_response.json()
    assert restored["target_type"] == "post"
    assert restored["target_id"] == post["id"]
    assert restored["hidden_at"] is None
    assert restored["hidden_by_id"] is None
    assert restored["hidden_reason"] is None

    restored_detail_response = client.get(f"/api/posts/{post['id']}")
    assert restored_detail_response.status_code == 200
    assert restored_detail_response.json()["id"] == post["id"]

    logs = (
        db_session.query(AdminActionLog)
        .filter(AdminActionLog.target_type == "post")
        .order_by(AdminActionLog.id.asc())
        .all()
    )
    assert [log.action for log in logs] == ["hide", "restore"]
    assert logs[0].actor_id == admin_user_id
    assert logs[0].reason == "Off-topic"


def test_regular_user_cannot_hide_post(client: TestClient):
    regular_token = signup_and_login(
        client,
        email="regular@example.com",
        display_name="Regular User",
    )
    author_token = signup_and_login(
        client,
        email="author@example.com",
        display_name="Author",
    )
    post = create_post(client, author_token)

    response = client.post(
        f"/api/admin/posts/{post['id']}/hide",
        headers=auth_headers(regular_token),
        json={"reason": "Trying to moderate"},
    )

    assert response.status_code == 403
    assert response.json()["detail"] == "Admin access required"


def test_admin_cannot_hide_author_deleted_post(client: TestClient, db_session: Session):
    admin_email = "admin@example.com"
    admin_token = signup_and_login(
        client,
        email=admin_email,
        display_name="Admin User",
    )
    make_admin(db_session, admin_email)
    author_token = signup_and_login(
        client,
        email="author@example.com",
        display_name="Author",
    )
    post = create_post(client, author_token)

    delete_response = client.delete(
        f"/api/posts/{post['id']}",
        headers=auth_headers(author_token),
    )
    assert delete_response.status_code == 204

    hide_response = client.post(
        f"/api/admin/posts/{post['id']}/hide",
        headers=auth_headers(admin_token),
        json={"reason": "Should not hide deleted content"},
    )

    assert hide_response.status_code == 404
    assert hide_response.json()["detail"] == "Post not found"


def test_admin_can_hide_and_restore_comment(
    client: TestClient,
    db_session: Session,
):
    admin_email = "admin@example.com"
    admin_token = signup_and_login(
        client,
        email=admin_email,
        display_name="Admin User",
    )
    admin_user_id = make_admin(db_session, admin_email)
    author_token = signup_and_login(
        client,
        email="author@example.com",
        display_name="Author",
    )
    post = create_post(client, author_token)
    comment = create_comment(client, author_token, post["id"])

    hide_response = client.post(
        f"/api/admin/comments/{comment['id']}/hide",
        headers=auth_headers(admin_token),
        json={"reason": "Spam"},
    )

    assert hide_response.status_code == 200
    hidden = hide_response.json()
    assert hidden["target_type"] == "comment"
    assert hidden["target_id"] == comment["id"]
    assert hidden["hidden_at"] is not None
    assert hidden["hidden_by_id"] == admin_user_id
    assert hidden["hidden_reason"] == "Spam"

    comments_response = client.get(f"/api/posts/{post['id']}/comments")
    assert comments_response.status_code == 200
    assert comments_response.json() == []

    restore_response = client.post(
        f"/api/admin/comments/{comment['id']}/restore",
        headers=auth_headers(admin_token),
    )

    assert restore_response.status_code == 200
    restored = restore_response.json()
    assert restored["target_type"] == "comment"
    assert restored["target_id"] == comment["id"]
    assert restored["hidden_at"] is None
    assert restored["hidden_by_id"] is None
    assert restored["hidden_reason"] is None

    restored_comments_response = client.get(f"/api/posts/{post['id']}/comments")
    assert restored_comments_response.status_code == 200
    comments = restored_comments_response.json()
    assert len(comments) == 1
    assert comments[0]["id"] == comment["id"]

    logs = (
        db_session.query(AdminActionLog)
        .filter(AdminActionLog.target_type == "comment")
        .order_by(AdminActionLog.id.asc())
        .all()
    )
    assert [log.action for log in logs] == ["hide", "restore"]
    assert logs[0].actor_id == admin_user_id
    assert logs[0].reason == "Spam"
