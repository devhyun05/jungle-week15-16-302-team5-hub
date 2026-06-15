# API Spec

## Purpose

이 문서는 frontend와 backend 사이의 약속을 정리한다. 실제 구현이 바뀌면 이 문서도 같이 갱신한다.

주요 설계 결정은 `docs/architecture/design-decisions.md`를 보고, 기능별 파일/API/DB 지도는 `docs/architecture/feature-implementation-map.md`를 본다.
Auth/session 상세 정책은 `docs/architecture/auth-session-design.md`를 따른다.

## 작성 방법

각 API는 아래 항목을 반드시 가진다.

- Method
- Path
- Auth required 여부
- Request body 또는 query params
- Response shape
- Error status
- 구현 파일 위치

## Common Response Rules

### Error Shape

```json
{
  "detail": "Human readable error message",
  "code": "optional_machine_code"
}
```

### Pagination Shape

```json
{
  "items": [],
  "total": 0,
  "page": 1,
  "size": 20,
  "total_pages": 0
}
```

## Auth APIs

| Method | Path | Auth | Request | Response | Error |
|---|---|---|---|---|---|
| POST | `/api/auth/signup` | no | email, display_name, password | user | 400, 409, 422 |
| POST | `/api/auth/login` | no | email, password | access_token, user, refresh/csrf cookies | 400, 401, 422 |
| POST | `/api/auth/refresh` | refresh cookie + CSRF | none | access_token | 401, 403 |
| POST | `/api/auth/logout` | refresh cookie + CSRF | none | success, cleared cookies | 401, 403 |
| GET | `/api/auth/me` | yes | none | user | 401 |

## Post APIs

| Method | Path | Auth | Request | Response | Error |
|---|---|---|---|---|---|
| POST | `/posts` | yes | title, body, board, tags, source_url? | post | 401, 422 |
| GET | `/posts` | optional | q?, tag?, board?, page?, size? | paginated posts | 400 |
| GET | `/posts/{post_id}` | optional | none | post detail | 404 |
| PUT | `/posts/{post_id}` | owner | title?, body?, tags? | post | 401, 403, 404, 422 |
| DELETE | `/posts/{post_id}` | owner | none | success | 401, 403, 404 |
| GET | `/posts/{post_id}/similar` | optional | limit? | similar posts | 404 |

## Comment APIs

| Method | Path | Auth | Request | Response | Error |
|---|---|---|---|---|---|
| POST | `/posts/{post_id}/comments` | yes | body, original_language? | comment | 401, 404, 422 |
| GET | `/posts/{post_id}/comments` | optional | page?, size? | paginated comments | 404 |
| DELETE | `/comments/{comment_id}` | owner | none | success | 401, 403, 404 |

## Tag APIs

| Method | Path | Auth | Request | Response | Error |
|---|---|---|---|---|---|
| GET | `/tags` | optional | q? | tags | 400 |
| POST | `/tags` | yes | name | tag | 401, 409, 422 |

## Admin APIs

| Method | Path | Auth | Request | Response | Error |
|---|---|---|---|---|---|
| GET | `/api/admin/health` | admin | none | status, admin_user_id | 401, 403 |
| POST | `/api/admin/posts/{post_id}/hide` | admin | reason? | target_type, target_id, hidden fields | 401, 403, 404, 422 |
| POST | `/api/admin/posts/{post_id}/restore` | admin | reason? | target_type, target_id, hidden fields | 401, 403, 404, 422 |
| POST | `/api/admin/comments/{comment_id}/hide` | admin | reason? | target_type, target_id, hidden fields | 401, 403, 404, 422 |
| POST | `/api/admin/comments/{comment_id}/restore` | admin | reason? | target_type, target_id, hidden fields | 401, 403, 404, 422 |

Admin auth is enforced by the backend `require_admin` dependency. Missing or invalid token returns 401 through `get_current_user`; a logged-in non-admin user returns 403.

## AI APIs

| Method | Path | Auth | Request | Response | Error |
|---|---|---|---|---|---|
| POST | `/ai/rag-answer` | yes | question, post_id? | answer, sources | 401, 422, 503 |
| POST | `/ai/source-metadata` | yes | url | metadata | 401, 422, 503 |
| POST | `/ai/agent` | yes | question, post_id?, max_steps? | final_answer, tool_calls | 401, 422, 503 |
| GET | `/ai/agent/{run_id}/events` | yes | none | SSE stream | 401, 404 |

## GraphQL

| Method | Path | Auth | Query | Response | Error |
|---|---|---|---|---|---|
| POST | `/graphql` | optional | posts, post | GraphQL response | GraphQL errors |

Example query:

```graphql
query Posts($page: Int, $size: Int) {
  posts(page: $page, size: $size) {
    items {
      id
      title
      board
    }
    total
  }
}
```

## SSR

| Method | Path | Auth | Request | Response | Error |
|---|---|---|---|---|---|
| GET | `/preview/posts/{post_id}` | optional | none | HTML | 404 |

SSR implementation can be a FastAPI `HTMLResponse` that returns a public topic preview.

## Realtime APIs

| Type | Path | Auth | Purpose | Events |
|---|---|---|---|---|
| WebSocket | `/ws/topics/{post_id}` | optional | comment/activity demo | `connected`, `message` |
| SSE | `/events/ai/{run_id}` | yes | AI progress | `progress`, `tool_call`, `done`, `error` |

## MCP JSON-RPC Shape

FastAPI may call the MCP server through HTTP or local process call. The payload must follow JSON-RPC 2.0.

Request:

```json
{
  "jsonrpc": "2.0",
  "id": "req-1",
  "method": "tools.call",
  "params": {
    "name": "get_weather",
    "arguments": {
      "city": "Seoul"
    }
  }
}
```

Success response:

```json
{
  "jsonrpc": "2.0",
  "id": "req-1",
  "result": {
    "temperature": 23.1,
    "summary": "Clear"
  }
}
```

Error response:

```json
{
  "jsonrpc": "2.0",
  "id": "req-1",
  "error": {
    "code": -32602,
    "message": "Invalid params"
  }
}
```

## Daily Update Checklist

- [ ] 새 endpoint를 구현하면 이 문서에 추가한다.
- [ ] request/response shape가 바뀌면 frontend type과 함께 수정한다.
- [ ] 401/403/404/422/500 계열 error를 빠뜨리지 않는다.
- [ ] README 요구사항 구현 위치 표에 endpoint를 연결한다.


## Day 1 MVP API Contract

Day 1에서는 auth와 posts CRUD만 먼저 구현한다.
댓글, 태그, 검색, 페이징, AI API는 Day 2 이후에 확장한다.

| Method | Path | Auth | Purpose | Request | Response | Error |
|---|---|---|---|---|---|---|
| POST | `/api/auth/signup` | no | 회원가입 | email, display_name, password | user | 409, 422 |
| POST | `/api/auth/login` | no | 로그인 | email, password | access_token, user | 401, 422 |
| GET | `/api/auth/me` | yes | 현재 사용자 확인 | none | user | 401 |
| GET | `/api/posts` | no | 게시글 목록 조회 | none | post[] | none |
| POST | `/api/posts` | yes | 게시글 작성 | title, body | post | 401, 422 |
| GET | `/api/posts/{post_id}` | no | 게시글 상세 조회 | path: post_id | post | 404 |
| PUT | `/api/posts/{post_id}` | owner | 게시글 수정 | path: post_id, body: title?, body? | post | 401, 403, 404, 422 |
| DELETE | `/api/posts/{post_id}` | owner | 게시글 삭제 | path: post_id | success | 401, 403, 404 |

## Day 2 API Contract

Day 2에서는 댓글, 태그, 검색, 페이징, frontend 상태 정책, Redis rate limit 기준을 추가한다.

### Auth Session Note

Day 2-B에서는 access token만 쓰던 구조에서 cookie refresh auth로 확장한다.
상세 설계 기준은 `docs/architecture/auth-session-design.md`를 따른다.

```text
POST /api/auth/login
-> response body: access_token, token_type, user
-> Set-Cookie: refresh_token, csrf_token

POST /api/auth/refresh
-> request cookies: refresh_token, csrf_token
-> request header: X-CSRF-Token
-> response body: access_token, token_type
-> Set-Cookie: rotated refresh_token, csrf_token

POST /api/auth/logout
-> request cookies: refresh_token, csrf_token
-> request header: X-CSRF-Token
-> response: 204 or success body
-> clear refresh_token, csrf_token cookies with matching path, secure, and samesite attributes
```

Policy:

- normal APIs use `Authorization: Bearer <access_token>`; GlowBoard access token lifetime is 30 minutes.
- refresh/logout use refresh cookie and CSRF check.
- access token expiry triggers one shared refresh attempt inside the same tab and one original request retry per failed request.
- login creates one `sessions` row and one `refresh_tokens` row.
- refresh marks the old refresh token `used_at`, creates a new `refresh_tokens` row, and keeps the parent session as the same device/browser login.
- logout clears frontend access token state, revokes the backend refresh session, and deletes refresh/csrf cookies. Existing stateless access tokens are not denylisted in the Day 2-B baseline and naturally expire within 30 minutes.
- logout delete-cookie headers use the configured cookie path, `Secure`, and `SameSite` policy so production HTTPS cookies are actually cleared.

### Post List Search and Pagination

| Method | Path | Auth | Purpose | Query | Response | Error |
|---|---|---|---|---|---|---|
| GET | `/api/posts` | no | 게시글 검색/목록 조회 | q?, tag?, page?, size? | PostPage | 422 |

Query params:

- `q`: optional string. `posts.title` 또는 `posts.body`에 `ILIKE` 검색으로 적용한다.
- `tag`: optional string. `tags.normalized_name` 기준으로 필터링한다.
- `page`: number, default 1. 1부터 시작한다.
- `size`: number, default 10. 최대값은 구현에서 제한한다.

Response:

```json
{
  "items": [
    {
      "id": 1,
      "author_id": 1,
      "title": "string",
      "body": "string",
      "tags": [
        {
          "id": 1,
          "normalized_name": "sunscreen",
          "display_name": "Sunscreen"
        }
      ],
      "created_at": "datetime",
      "updated_at": "datetime"
    }
  ],
  "page": 1,
  "size": 10,
  "total": 1,
  "has_next": false,
  "has_prev": false
}
```

Frontend policy:

- 검색 조건 `q`, `tag`, `page`, `size`는 URL query에 둔다.
- 검색어 또는 태그가 바뀌면 `page`는 1로 돌아간다.
- server response의 `items`는 목록에 사용하고, `page`, `total`, `has_next`, `has_prev`는 pagination UI에 사용한다.

### Post Create and Update Tags

| Method | Path | Auth | Purpose | Request | Response | Error |
|---|---|---|---|---|---|---|
| POST | `/api/posts` | yes | 태그 포함 게시글 작성 | title, body, tag_names? | post | 401, 422, 429? |
| PUT | `/api/posts/{post_id}` | owner | 태그 포함 게시글 수정 | title?, body?, tag_names? | post | 401, 403, 404, 422 |

Create request:

```json
{
  "title": "string",
  "body": "string",
  "tag_names": ["Sunscreen", "summer"]
}
```

Update request:

```json
{
  "title": "string",
  "body": "string",
  "tag_names": ["Sunscreen", "summer"]
}
```

Tag policy:

- `tag_names`는 선택값이다.
- backend는 tag name을 trim/lowercase하여 `normalized_name`으로 저장한다.
- backend는 화면 표시용으로 `display_name`을 저장한다.
- 같은 `normalized_name`의 tag가 이미 있으면 기존 tag row를 재사용한다.
- 같은 post에 같은 tag가 중복 연결되지 않아야 한다.
- 게시글 수정 시 Day 2에서는 기존 tag 연결을 지우고 새 `tag_names` 배열로 다시 연결하는 방식을 선택한다.

### Comment APIs

| Method | Path | Auth | Purpose | Request | Response | Error |
|---|---|---|---|---|---|---|
| GET | `/api/posts/{post_id}/comments` | no | 댓글 목록 조회 | path: post_id, query: page?, size? | comment[] currently; target: CommentPage | 404, 422 |
| POST | `/api/posts/{post_id}/comments` | yes | 댓글 작성 | body | comment | 401, 404, 422, 429 |
| PUT | `/api/comments/{comment_id}` | owner | 댓글 수정 | body | comment | 401, 403, 404, 422 |
| DELETE | `/api/comments/{comment_id}` | owner | 댓글 soft delete | none | 204 no content | 401, 403, 404 |

Comment request:

```json
{
  "body": "string"
}
```

Comment pagination target:

```text
GET /api/posts/{post_id}/comments?page=1&size=20
-> response: items, total, page, size, has_next, has_prev
```

댓글 페이지네이션은 추가 구현 플랜이다. 구현 시 `PostPageResponse`와 비슷한 `CommentPageResponse`를 두고, `PostDetailPage`의 댓글 목록 상태와 `backend/tests/test_comments.py` pagination test를 함께 갱신한다.

Comment response:

```json
{
  "id": 1,
  "post_id": 1,
  "author_id": 1,
  "body": "string",
  "created_at": "datetime",
  "updated_at": "datetime",
  "deleted_at": null
}
```

Comment policy:

- 댓글 목록은 `created_at ASC` 기준으로 반환한다.
- 댓글 목록은 `deleted_at IS NULL`인 댓글만 반환한다.
- 댓글 작성은 로그인한 사용자만 가능하다.
- 댓글 수정과 삭제는 댓글 작성자만 가능하다.
- 댓글 삭제는 soft delete다. row를 지우지 않고 `deleted_at`을 현재 시각으로 채운다.

### Tag APIs

| Method | Path | Auth | Purpose | Query | Response | Error |
|---|---|---|---|---|---|---|
| GET | `/api/tags` | no | 태그 검색/자동완성 후보 조회 | q? | tag[] | 422 |

Day 2 MVP에서는 별도 `POST /api/tags` 없이 게시글 작성/수정 과정에서 tag를 생성하거나 재사용한다.

Tag response:

```json
{
  "id": 1,
  "normalized_name": "sunscreen",
  "display_name": "Sunscreen"
}
```

### Redis Rate Limit

Day 2 rate limit은 댓글 작성 API에 적용한다.

```text
endpoint:
POST /api/posts/{post_id}/comments

key:
rate:comments:create:{user_id}

algorithm:
fixed window

example policy:
60초에 5회

exceeded response:
429 Too Many Requests
```

429 response:

```json
{
  "detail": "Too many requests. Please try again later."
}
```

가능하면 `Retry-After` header를 포함한다.
`Retry-After`를 만들기 위한 Redis `TTL` 조회는 제한 초과 시에만 수행한다.

### Day 2 Implementation Files

| Area | File |
|---|---|
| Comment model | `backend/app/models/comment.py` |
| Tag model and `post_tags` | `backend/app/models/tag.py`, `backend/app/models/post.py` |
| Comment schemas | `backend/app/schemas/comment.py` |
| Tag schemas | `backend/app/schemas/tag.py` |
| Post schemas | `backend/app/schemas/post.py` |
| Comment routes | `backend/app/api/routes/comments.py` |
| Tag routes | `backend/app/api/routes/tags.py` |
| Post route updates | `backend/app/api/routes/posts.py` |
| Comment service | `backend/app/services/comment_service.py` |
| Tag service | `backend/app/services/tag_service.py` |
| Post service updates | `backend/app/services/post_service.py` |
| Rate limit service | `backend/app/services/rate_limit_service.py` |

## Day 3 API Contract

Day 3 is being split because of deadline pressure. The completed backend slices are admin role guard and admin soft hide/restore for posts and comments. MyPage and Admin UI are postponed until after Day 4~6 unless needed earlier.

### Admin Role Guard

| Method | Path | Auth | Purpose | Request | Response | Error |
|---|---|---|---|---|---|---|
| GET | `/api/admin/health` | admin | admin guard smoke endpoint | none | status, admin_user_id | 401, 403 |

Response:

```json
{
  "status": "ok",
  "admin_user_id": 1
}
```

Policy:

- `users.role` stores `"user"` or `"admin"`.
- New users default to `"user"`.
- `require_admin` depends on `get_current_user` first, so missing/invalid token is 401.
- A logged-in user whose role is not `"admin"` receives 403 with `detail = "Admin access required"`.
- Test coverage lives in `backend/tests/test_admin.py`.

### Admin Soft Hide/Restore

The moderation endpoints are admin-only and preserve rows instead of deleting content.

```text
POST /api/admin/posts/{post_id}/hide
POST /api/admin/posts/{post_id}/restore
POST /api/admin/comments/{comment_id}/hide
POST /api/admin/comments/{comment_id}/restore
```

Request:

```json
{
  "reason": "Off-topic"
}
```

The request body is optional.

Response:

```json
{
  "target_type": "post",
  "target_id": 1,
  "hidden_at": "datetime or null",
  "hidden_by_id": 2,
  "hidden_reason": "Off-topic"
}
```

Policy:

- public post list/detail excludes posts where `hidden_at IS NOT NULL`.
- public comment list and comment update/delete lookup exclude comments where `hidden_at IS NOT NULL`.
- author comment deletion still uses `deleted_at`; admin hide uses separate `hidden_at`.
- future vector search/RAG retrieval must exclude hidden posts and hidden comments.
- admin action logging records actor, action, target type, target id, reason, and timestamp in `admin_action_logs`.
