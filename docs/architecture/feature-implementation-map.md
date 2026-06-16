# Feature Implementation Map

## Purpose

이 문서는 GlowBoard의 기능별 구현 지도를 정리한다.

각 기능마다 다음을 한 번에 볼 수 있게 한다.

- 관련 파일 구조
- 파일별 책임
- API 계약
- DB/ERD 관계
- frontend 연결 위치
- 테스트 위치
- 현재 상태와 다음 작업

세부 문서는 아래를 함께 본다.

- 설계 결정: `docs/architecture/design-decisions.md`
- API 상세 계약: `docs/architecture/api-spec.md`
- DB 상세 ERD: `docs/architecture/database-erd.md`
- Auth 상세 설계: `docs/architecture/auth-session-design.md`
- 테스트 계획: `docs/testing/test-plan.md`

## How To Use This Document

새 기능을 구현하기 전에는 해당 기능 섹션에서 아래 여섯 가지를 먼저 확인한다.

```text
1. 파일 구조
2. API 계약
3. DB 구조
4. 요청 흐름
5. 보안/권한 규칙
6. 테스트 케이스
```

암기:

```text
파일을 정하고,
계약을 정하고,
데이터를 정하고,
흐름을 정하고,
보안을 정하고,
테스트로 닫는다.
```

## Current Layering Convention

Backend:

| Layer | Responsibility | Examples |
|---|---|---|
| `api/routes` | HTTP endpoint, dependency injection, status code | `auth.py`, `posts.py`, `comments.py`, `tags.py` |
| `schemas` | Pydantic request/response shape | `auth.py`, `post.py`, `comment.py`, `tag.py` |
| `services` | business rule, DB query, authorization decision | `auth_service.py`, `post_service.py` |
| `models` | SQLAlchemy table mapping | `user.py`, `post.py`, `session.py`, `refresh_token.py` |
| `core` | cross-cutting config/security/cache helpers | `config.py`, `security.py`, `redis.py` |
| `db` | engine, session dependency, declarative base | `session.py`, `base.py` |
| `tests` | route/service behavior and regressions | `backend/tests/*.py` |

Frontend:

| Layer | Responsibility | Examples |
|---|---|---|
| `api` | backend API wrappers and fetch rules | `client.ts`, `auth.ts`, `posts.ts` |
| `types` | TypeScript request/response shapes | `auth.ts`, `post.ts`, `comment.ts` |
| `stores` | shared app state | `authStore.ts` |
| `pages` | route-level screens and local UI state | `PostListPage.tsx`, `LoginPage.tsx` |
| `components` | reusable UI pieces | `TagInput.tsx` |

## App Shell, DB, Config

### Files

| File | Purpose |
|---|---|
| `backend/app/main.py` | FastAPI app creation, CORS middleware, router registration, startup table creation |
| `backend/app/db/base.py` | SQLAlchemy `Base` |
| `backend/app/db/session.py` | engine, session factory, `get_db` dependency |
| `backend/app/core/config.py` | environment settings |
| `backend/app/core/security.py` | password hashing and JWT helpers, later refresh/CSRF helpers |
| `frontend/src/main.tsx` | React entrypoint |
| `frontend/src/App.tsx` | frontend route shell |
| `frontend/src/api/client.ts` | common fetch wrapper |

### DB And Runtime Notes

Current DB creation:

```text
FastAPI lifespan
-> Base.metadata.create_all(bind=engine)
```

Current development origins:

```text
frontend: http://localhost:5173
backend:  http://localhost:8000
```

CORS currently allows:

```text
http://localhost:5173
http://127.0.0.1:5173
```

Future candidate:

```text
Alembic migrations
-> replace create_all as the project schema becomes more stable
```

## Auth And Session

### Status

| Part | Status |
|---|---|
| signup/login/access JWT | implemented |
| Swagger form token endpoint | implemented |
| `/api/auth/me` | implemented |
| refresh token cookie | implemented for login/refresh/logout |
| CSRF for refresh/logout | implemented for refresh/logout |
| refresh token rotation history table | implemented |
| 7-day idle + 30-day absolute session | implemented for login/refresh |
| access token lifetime | 30 minutes |
| logout access token policy | frontend clears authStore/access token; backend revokes refresh session; no access token denylist in Day 2-B baseline |
| same-tab concurrent refresh | implemented with shared refresh Promise in frontend API client |

### Backend Files

| File | Purpose |
|---|---|
| `backend/app/api/routes/auth.py` | `/api/auth/signup`, `/login`, `/me`, `/token`, `/refresh`, `/logout`, cookie set/delete |
| `backend/app/schemas/auth.py` | signup/login/token/user response shapes |
| `backend/app/services/auth_service.py` | signup/login password and token rules, session create, refresh rotation, logout revoke |
| `backend/app/models/user.py` | `users` table |
| `backend/app/models/session.py` | `sessions` login grouping table with idle/absolute/revoke fields |
| `backend/app/models/refresh_token.py` | `refresh_tokens` rotation history table |
| `backend/app/api/deps.py` | Bearer access token dependency and current user loading |
| `backend/app/core/security.py` | password hash/verify, access JWT, refresh token generation/hash, CSRF token generation |
| `backend/app/core/config.py` | JWT and cookie/env settings; access token lifetime is 30 minutes |

### Frontend Files

| File | Purpose |
|---|---|
| `frontend/src/api/auth.ts` | login/signup/logout API wrappers with credentials and CSRF header |
| `frontend/src/api/client.ts` | attach Bearer token, include credentials when requested, share one in-flight refresh Promise on concurrent 401s, retry once |
| `frontend/src/stores/authStore.ts` | access token/current user shared state |
| `frontend/src/types/auth.ts` | auth request/response types |
| `frontend/src/pages/LoginPage.tsx` | login form and authStore update |
| `frontend/src/pages/SignupPage.tsx` | signup form |
| `frontend/src/App.tsx` | auth-aware navigation/header |

### API Contract

Current:

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/api/auth/signup` | none | create user |
| POST | `/api/auth/login` | none | return access token and user, set refresh/csrf cookies |
| POST | `/api/auth/token` | form body | Swagger Authorize token endpoint |
| GET | `/api/auth/me` | Bearer access token | return current user |
| POST | `/api/auth/refresh` | refresh cookie + CSRF | rotate refresh token and return new access token |
| POST | `/api/auth/logout` | refresh cookie + CSRF | revoke session and clear cookies |

### DB / ERD

Tables:

```text
users 1 ---- N sessions
sessions 1 ---- N refresh_tokens
```

Current `sessions`:

```text
id
user_id
expires_at             # 7-day idle timeout
absolute_expires_at    # 30-day absolute max
created_at
revoked_at             # logout/revoke/reuse detection time
```

Current `refresh_tokens`:

```text
id
session_id
token_hash
issued_at
expires_at
used_at
revoked_at
replaced_by_token_id
```

Active session:

```text
revoked_at IS NULL
expires_at > now
absolute_expires_at > now
```

### Security Rules

- Passwords are stored as hashes.
- Normal APIs use `Authorization: Bearer <access_token>`.
- Access token lifetime is 30 minutes.
- Refresh token is stored in an HttpOnly cookie.
- CSRF token is stored in a readable cookie and copied to `X-CSRF-Token`.
- Refresh/logout require CSRF.
- Refresh token raw value is never stored in DB.
- Access token expiry triggers one refresh attempt and one original request retry.

### Tests

Current:

| File | Coverage |
|---|---|
| `backend/tests/test_auth.py` | signup, duplicate signup, login, wrong password, token endpoint, me endpoint, login cookies/session rows, refresh CSRF 403, refresh rotation, old token reuse session revoke, logout CSRF 403, logout revoke/cookie delete, refresh after logout 401 |

Remaining target:

```text
idle-expired session is rejected
absolute-expired session is rejected
```

## Posts

### Status

Implemented for Day 1/2 MVP.

### Backend Files

| File | Purpose |
|---|---|
| `backend/app/api/routes/posts.py` | post create/list/detail/update/delete endpoints |
| `backend/app/schemas/post.py` | post request/response/page shapes |
| `backend/app/services/post_service.py` | post CRUD, owner checks, search, pagination, tag connection |
| `backend/app/models/post.py` | `posts` table and tag relationship |
| `backend/app/models/tag.py` | `post_tags` relationship used by posts |

### Frontend Files

| File | Purpose |
|---|---|
| `frontend/src/api/posts.ts` | post API wrappers |
| `frontend/src/types/post.ts` | post request/response/page/tag types |
| `frontend/src/pages/PostListPage.tsx` | list, search, tag filter, pagination |
| `frontend/src/pages/PostDetailPage.tsx` | detail, delete, comments area |
| `frontend/src/pages/PostCreatePage.tsx` | create form |
| `frontend/src/pages/PostEditPage.tsx` | edit form |
| `frontend/src/components/TagInput.tsx` | comma/Enter tag entry |

### API Contract

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/api/posts/` | none | list posts with search/pagination |
| POST | `/api/posts/` | Bearer | create post |
| GET | `/api/posts/{post_id}` | none | read post detail |
| PUT | `/api/posts/{post_id}` | owner Bearer | update own post |
| DELETE | `/api/posts/{post_id}` | owner Bearer | delete own post |

List query:

```text
q?
tag?
tags?
page=1
size=10
```

### DB / ERD

```text
users 1 ---- N posts
posts N ---- M tags through post_tags
posts 1 ---- N comments
```

Core columns:

```text
posts.id
posts.author_id
posts.title
posts.body
posts.created_at
posts.updated_at
```

Planned/longer-term columns in ERD:

```text
board
original_language
region
product_name
source_url
deleted_at
```

### Security Rules

- Create requires login.
- Update/delete require the post owner.
- Owner checks happen in backend service, not only frontend UI.

### Tests

| File | Coverage |
|---|---|
| `backend/tests/test_posts.py` | create/list/detail/update/delete, 401/403/404 |
| `backend/tests/test_posts_search.py` | keyword search, tag filters, pagination |

## Comments

### Status

Implemented for Day 2 MVP. Redis rate limit is applied to comment creation.

### Backend Files

| File | Purpose |
|---|---|
| `backend/app/api/routes/comments.py` | comment list/create/update/delete endpoints |
| `backend/app/schemas/comment.py` | comment request/response shapes |
| `backend/app/services/comment_service.py` | comment CRUD, owner checks, soft delete |
| `backend/app/models/comment.py` | `comments` table |
| `backend/app/services/rate_limit_service.py` | fixed-window rate limit helper |
| `backend/app/core/redis.py` | Redis client |

### Frontend Files

| File | Purpose |
|---|---|
| `frontend/src/api/comments.ts` | comment API wrappers |
| `frontend/src/types/comment.ts` | comment request/response types |
| `frontend/src/pages/PostDetailPage.tsx` | comment list/create/edit/delete UI with pagination controls |

### API Contract

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/api/posts/{post_id}/comments` | none | list visible comments; query: `page`, `size` |
| POST | `/api/posts/{post_id}/comments` | Bearer | create comment |
| PUT | `/api/comments/{comment_id}` | owner Bearer | update own comment |
| DELETE | `/api/comments/{comment_id}` | owner Bearer | soft delete own comment |

### DB / ERD

```text
users 1 ---- N comments
posts 1 ---- N comments
```

Columns:

```text
comments.id
comments.post_id
comments.author_id
comments.body
comments.created_at
comments.updated_at
comments.deleted_at
```

Soft delete:

```text
DELETE /api/comments/{comment_id}
-> set comments.deleted_at

GET /api/posts/{post_id}/comments
-> filter deleted_at IS NULL
-> apply page/size and return CommentPage
```

### Security Rules

- List is public.
- Create requires login.
- Update/delete require comment owner.
- Delete is soft delete.
- Create is rate-limited by Redis using `rate:comments:create:{user_id}`.

### Tests

| File | Coverage |
|---|---|
| `backend/tests/test_comments.py` | create/list pagination/update/soft delete, 401/403/404 |

### Pagination

Implemented with offset pagination.

| Area | Implementation |
|---|---|
| API | `GET /api/posts/{post_id}/comments?page=&size=` |
| Response | `CommentPageResponse` with `items`, `total`, `page`, `size`, `has_next`, `has_prev` |
| Backend | applies `offset`/`limit` to visible comments only, excluding `deleted_at` and `hidden_at` rows |
| Frontend | `PostDetailPage` stores comment page metadata and shows previous/next controls |
| Tests | comment pagination ordering, total, and page metadata |

## Tags

### Status

Implemented for post create/update and tag listing.

### Backend Files

| File | Purpose |
|---|---|
| `backend/app/api/routes/tags.py` | tag list endpoint |
| `backend/app/schemas/tag.py` | tag response shape |
| `backend/app/services/tag_service.py` | normalize, find/create, list tags |
| `backend/app/models/tag.py` | `tags` table and `post_tags` join table |
| `backend/app/services/post_service.py` | attaches/replaces tags during post create/update |

### Frontend Files

| File | Purpose |
|---|---|
| `frontend/src/components/TagInput.tsx` | user tag entry UI |
| `frontend/src/types/post.ts` | tag type included in post response |
| `frontend/src/api/posts.ts` | sends `tag_names` on create/update |
| `frontend/src/pages/PostListPage.tsx` | tag filter display/input |
| `frontend/src/pages/PostCreatePage.tsx` | create post tags |
| `frontend/src/pages/PostEditPage.tsx` | edit post tags |

### API Contract

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/api/tags/` | none | list tag suggestions/all tags |
| POST | `/api/posts/` | Bearer | create/reuse tags through `tag_names` |
| PUT | `/api/posts/{post_id}` | owner Bearer | replace post tag connections through `tag_names` |

### DB / ERD

```text
posts N ---- M tags through post_tags
```

Tables:

```text
tags
- id
- normalized_name
- display_name
- created_at

post_tags
- post_id
- tag_id
```

Policy:

```text
trim input
lowercase normalized_name
reuse existing tag row
do not duplicate same tag on same post
leave orphan tags for now
```

### Tests

| File | Coverage |
|---|---|
| `backend/tests/test_tags.py` | tag listing and tag behavior |
| `backend/tests/test_posts_search.py` | tag filter behavior |

## Search And Pagination

### Status

Implemented for posts list.

### Files

| File | Purpose |
|---|---|
| `backend/app/api/routes/posts.py` | query parameters `q`, `tag`, `tags`, `page`, `size` |
| `backend/app/services/post_service.py` | `ILIKE`, tag filters, count, page response |
| `backend/app/schemas/post.py` | `PostPageResponse` |
| `frontend/src/pages/PostListPage.tsx` | URL query state and page buttons |
| `frontend/src/api/posts.ts` | list posts with params |

### API Contract

```text
GET /api/posts/?q=&tag=&tags=&page=&size=
```

Response:

```text
items
page
size
total
has_next
has_prev
```

### DB / Query Shape

Current:

```text
posts.title ILIKE
posts.body ILIKE
tags.normalized_name filter
offset pagination
```

Candidates:

```text
full-text search
cursor pagination
advanced OR tag filters
```

### Tests

| File | Coverage |
|---|---|
| `backend/tests/test_posts_search.py` | keyword search, tag filtering, pagination |

## Redis Rate Limit

### Status

Implemented for comment creation.

### Files

| File | Purpose |
|---|---|
| `backend/app/core/redis.py` | Redis client creation |
| `backend/app/services/rate_limit_service.py` | fixed window counter and 429 exception; reads Redis TTL only when limit is exceeded |
| `backend/app/api/routes/comments.py` | calls `check_rate_limit` before comment creation |
| `docker-compose.yml` | Redis service |
| root `.env.example` | `REDIS_URL` example |

### API Behavior

Applied to:

```text
POST /api/posts/{post_id}/comments
```

Policy:

```text
key: rate:comments:create:{user_id}
limit: 5
window_seconds: 60
failure: 429 Too Many Requests
Retry-After: remaining window seconds
```

### Why Redis

Rate counters are:

```text
frequently updated
short-lived
shared across uvicorn workers/processes
safe to expire automatically
```

Redis fits this better than PostgreSQL for this use.

### Candidates

```text
login IP/email rate limit
post creation rate limit
AI quota/concurrency limit
sliding window or token bucket
```

## Frontend Auth State

### Status

Zustand authStore is implemented. Cookie refresh integration code is connected in frontend API wrappers, and browser manual verification for login cookies, readable CSRF cookie, HttpOnly refresh token hiding, logout CSRF header, and cookie deletion is complete.

### Files

| File | Purpose |
|---|---|
| `frontend/src/stores/authStore.ts` | access token/current user shared state |
| `frontend/src/api/client.ts` | reads token, sends Bearer header, shares one in-flight refresh Promise on same-tab concurrent 401s, retries once |
| `frontend/src/api/auth.ts` | login/signup/logout; login/logout include credentials, logout sends CSRF header |
| `frontend/src/App.tsx` | navigation and logout UI |
| `frontend/src/pages/LoginPage.tsx` | login updates store |
| `frontend/src/pages/PostCreatePage.tsx` | protected action reads store |
| `frontend/src/pages/PostEditPage.tsx` | protected action reads store |
| `frontend/src/pages/PostDetailPage.tsx` | owner UI and comment auth state |

### State Policy

```text
authStore:
-> access token
-> current user
-> login/logout/update token actions

URL query:
-> search q
-> tag filters
-> page

local component state:
-> form inputs
-> comment draft
-> local loading/error states
```

### Implemented Refresh Flow

```text
API request gets 401
-> if authStore already has a newer access token, retry with it
-> otherwise client calls /api/auth/refresh once with credentials include
-> same-tab concurrent requests wait for the same refresh Promise
-> stores new access token
-> retries original request once
-> if refresh fails, clear authStore and send user to login
```

## Admin And Moderation

### Status

Day 3 required MVP/admin slices implemented.

Completed:

- `users.role` backend model field.
- `require_admin` dependency.
- `GET /api/admin/health` smoke endpoint.
- 401/403/200 admin authorization tests.
- admin soft hide/restore for posts and comments.
- public post/comment lookup excludes admin-hidden content.
- compact `admin_action_logs` rows for hide/restore.
- author post delete changed from hard delete to `posts.deleted_at` soft delete.
- MyPage activity endpoint and frontend page.
- admin post/comment list endpoints for moderation UI.
- Admin moderation page for post/comment hide and restore.
- frontend auth store role sync and admin-only navigation display.

Next required AI-adjacent follow-up before RAG retrieval:

- ensure vector search/RAG services filter out hidden posts and hidden comments.

### Files

| File | Purpose |
|---|---|
| `backend/app/models/user.py` | implemented `role` field with default `"user"` |
| `backend/app/models/post.py` | implemented post admin hidden fields |
| `backend/app/services/post_service.py` | public list/detail exclude deleted/hidden posts; author delete sets `deleted_at` |
| `backend/app/models/comment.py` | implemented comment admin hidden fields separate from `deleted_at` |
| `backend/app/models/admin_action_log.py` | implemented compact admin action log |
| `backend/app/schemas/admin.py` | implemented moderation response and admin post/comment list response shapes |
| `backend/app/api/deps.py` | implemented `require_admin` |
| `backend/app/api/routes/admin.py` | implemented `/api/admin/health`, admin post/comment lists, post hide/restore, comment hide/restore |
| `backend/app/main.py` | registered `admin_router` |
| `backend/app/services/admin_service.py` | implemented admin list queries, moderation rules, and audit log writes |
| `backend/tests/test_posts.py` | verifies author post delete preserves row and sets `deleted_at` |
| `backend/app/services/comment_service.py` | public comment lookup excludes hidden comments |
| `backend/tests/test_admin.py` | implemented admin auth, list, and moderation tests |
| `backend/app/api/routes/users.py` | implemented current user activity endpoint |
| `backend/app/schemas/user.py` | implemented MyPage activity response shape |
| `backend/app/services/user_service.py` | implemented current user's visible posts/comments query |
| `backend/tests/test_users.py` | implemented MyPage activity tests |
| `frontend/src/api/users.ts` | implemented MyPage API client |
| `frontend/src/pages/MyPage.tsx` | implemented profile, my posts, my comments view |
| `frontend/src/types/user.ts` | implemented MyPage frontend type |
| `frontend/src/api/admin.ts` | implemented Admin moderation API client |
| `frontend/src/types/admin.ts` | implemented Admin moderation frontend types |
| `frontend/src/pages/AdminPage.tsx` | implemented post/comment moderation lists and hide/restore controls |
| `frontend/src/stores/authStore.ts` | stores access token, current user id, and current user role |
| `frontend/src/App.tsx` | syncs role from `/api/auth/me` on app start/token change and hides Admin nav from non-admin users |

### Implemented API

```text
GET /api/admin/health
GET /api/admin/posts
GET /api/admin/comments
POST /api/admin/posts/{post_id}/hide
POST /api/admin/posts/{post_id}/restore
POST /api/admin/comments/{comment_id}/hide
POST /api/admin/comments/{comment_id}/restore
GET /api/users/me/activity
```

Behavior:

```text
no token -> 401
regular user token -> 403
admin user token -> 200 { status, admin_user_id }
admin hide -> hidden fields set, public lookup excludes target
admin restore -> hidden fields cleared, public lookup includes target again
admin lists -> visible and hidden rows are returned; author-deleted rows are excluded
author post delete -> deleted_at set, public lookup returns 404
my activity -> returns current user, visible own posts, visible own comments
frontend admin nav -> shown only when current user role is admin
```

### DB / ERD

Implemented:

```text
users.role
posts.deleted_at
posts.hidden_at
posts.hidden_by_id
posts.hidden_reason
comments.hidden_at
comments.hidden_by_id
comments.hidden_reason
admin_action_logs
```

Migration note:

Existing PostgreSQL tables need explicit migration or manual `ALTER TABLE` for new columns and `admin_action_logs`; local Docker PostgreSQL was updated manually on 2026-06-16. Tests use a fresh SQLite schema and pass.

## AI, RAG, MCP, Agent

These features are planned after the board MVP. Their detailed designs live under `docs/ai/`.

### RAG

| Area | Expected Shape |
|---|---|
| Design doc | `docs/ai/rag-design.md` |
| Backend files | `ai` routes/service, embedding service, retrieval service |
| DB | `embedding_jobs`, `post_embeddings`, maybe comment embeddings |
| API | `POST /api/ai/rag-answer`, related topics endpoint |
| Tests | mock embedding, mock LLM, source citation |

### MCP

| Area | Expected Shape |
|---|---|
| Design doc | `docs/ai/mcp-design.md` |
| Backend files | MCP server/client, tool registry |
| DB | optional `source_metadata` for fetched external URL metadata |
| API | `POST /api/ai/source-metadata` or internal tool call |
| Tests | JSON-RPC request/response, external fallback |

### Agent

| Area | Expected Shape |
|---|---|
| Design doc | `docs/ai/agent-design.md` |
| Backend files | agent route, graph/service, tool adapters |
| DB | optional agent run/step trace tables |
| API | `POST /api/ai/agent`, `GET /api/ai/agent/{run_id}/events` |
| Tests | max step guard, tool trace, fallback |

## Per-Feature Update Checklist

When adding or changing a feature, update the matching rows in this document.

```text
[ ] files changed
[ ] file responsibilities
[ ] API contract
[ ] DB/ERD
[ ] frontend connection
[ ] security/authorization
[ ] tests
[ ] implementation candidates
```

Also update:

```text
docs/architecture/api-spec.md
docs/architecture/database-erd.md
docs/architecture/design-decisions.md
docs/learning/진도_체크포인트.md
docs/planning/index.html when the user studies from it
```
