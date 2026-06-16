# GlowBoard

GlowBoard is a global beauty and fashion topic community built with React,
FastAPI, PostgreSQL, and Redis. Each post is one focused topic, such as a
beauty question, product review, routine, trend, styling idea, or external
content discussion.

## Current Status

Day 2 MVP scope is implemented:

- Auth: signup, login, current user lookup, Swagger form token endpoint
- Posts: create, list, detail, update, delete with backend owner checks
- Comments: create, list, update, soft delete with backend owner checks
- Tags: create/reuse tags through post create/update, filter posts by tags
- Search and pagination: keyword search, tag filters, page/size response
- Frontend state: Zustand auth store for current user and access token
- Cookie refresh auth: HttpOnly refresh cookie, readable CSRF cookie,
  refresh/logout CSRF check, refresh token rotation, logout session revoke
- Redis rate limit: comment creation is limited with a fixed-window counter

AI, pgvector RAG, MCP, Agent, worker queue, GraphQL, SSR, and realtime features
remain in the later project phases.

## Architecture

```text
React frontend
-> FastAPI REST API
-> PostgreSQL relational data
-> Redis rate limit counter
```

Auth uses two tokens:

- Access token: 30-minute JWT returned in the response body and sent on normal
  APIs as `Authorization: Bearer <access_token>`.
- Refresh token: longer-lived opaque token stored in an HttpOnly cookie and
  saved in the DB only as a hash.

Refresh sessions use:

- 7-day idle timeout
- 30-day absolute max lifetime
- `sessions` table for browser/device login sessions
- `refresh_tokens` table for rotation history and reuse detection

Refresh and logout require a readable `csrf_token` cookie plus a matching
`X-CSRF-Token` header.

Detailed docs:

- API contract: `docs/architecture/api-spec.md`
- ERD: `docs/architecture/database-erd.md`
- System architecture: `docs/architecture/system-architecture.md`
- Auth/session design: `docs/architecture/auth-session-design.md`
- Feature implementation map: `docs/architecture/feature-implementation-map.md`
- Test plan: `docs/testing/test-plan.md`

## Local Development

Backend:

```bash
cd backend
../.venv/bin/uvicorn app.main:app --reload
```

Frontend:

```bash
cd frontend
npm run dev
```

Open:

```text
Frontend: http://localhost:5173
Backend docs: http://localhost:8000/docs
```

Use `localhost` consistently for frontend and backend during cookie auth checks.
For example, set the frontend API base URL to:

```text
VITE_API_BASE_URL=http://localhost:8000
```

## Environment

Do not commit real `.env` files.

Backend example values live in:

```text
backend/.env.example
```

Important backend settings:

- `DATABASE_URL`
- `REDIS_URL`
- `JWT_SECRET`
- `ACCESS_TOKEN_EXPIRE_MINUTES`

## Tests

Backend auth tests:

```bash
cd backend
../.venv/bin/python -m pytest tests/test_auth.py
```

Backend full test suite:

```bash
cd backend
../.venv/bin/python -m pytest
```

Frontend production build:

```bash
cd frontend
npm run build
```

Latest Day 2 verification:

- `tests/test_auth.py`: 15 passed
- backend full test suite: 51 passed
- frontend build: passed
- browser manual auth check: login cookies, readable CSRF cookie, HttpOnly
  refresh token hiding, logout CSRF header, and cookie deletion passed

## Known Follow-Ups

- Comment pagination for `GET /api/posts/{post_id}/comments?page=&size=`
- Access token forced-expiry E2E check
- Production HTTPS `Secure` cookie verification
- Access token denylist or per-request session check, if stronger immediate
  logout semantics are needed
- README expansion for AI/RAG/MCP/Agent once those phases are implemented
