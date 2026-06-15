# Test Plan

## Purpose

이 문서는 GlowBoard가 제출 전에 최소한 어떤 테스트를 통과해야 하는지 정리한다. 모든 테스트를 완벽하게 만들 시간이 없더라도, 핵심 흐름과 위험한 실패 케이스는 반드시 확인한다.

## Test Levels

| Level | Tool | Target |
|---|---|---|
| Backend unit/integration | pytest | FastAPI route, service, repository |
| Frontend unit | Vitest | component, Zustand store |
| Frontend integration | React Testing Library | form, loading/error state |
| E2E | Playwright | browser user flow |
| Manual demo | browser + Swagger | presentation flow |

## Backend Test Checklist

| Area | Test |
|---|---|
| Health | `GET /health` returns ok |
| Auth | signup success |
| Auth | duplicate email fails |
| Auth | login success |
| Auth | wrong password fails |
| Auth | `/auth/me` requires JWT |
| Auth | login sets refresh and CSRF cookies |
| Auth | refresh without CSRF fails with 403 |
| Auth | refresh rotates token and returns a new access token |
| Auth | old refresh token reuse revokes the parent session |
| Auth | logout revokes session/token and clears cookies |
| Posts | create post |
| Posts | list posts with pagination |
| Posts | read post detail |
| Posts | update own post |
| Posts | delete own post |
| Posts | non-owner update/delete returns 403 |
| Comments | create comment |
| Comments | list comments |
| Comments | delete own comment |
| Tags | create or reuse tag |
| Search | query filter works |
| Redis | rate limit returns 429 |
| GraphQL | posts query works |
| RAG | mock RAG answer returns sources |
| MCP | mock/external tool returns JSON-RPC result |
| Agent | max_steps guard stops loop |

## Frontend Test Checklist

| Area | Test |
|---|---|
| Components | Button renders disabled/loading state |
| Components | Input has label and error message |
| Auth store | stores token/user after login |
| Auth store | logout clears token/user |
| Post list | loading state renders |
| Post list | empty state renders |
| Post detail | error state renders |
| AI store | running/done/error states update |

## E2E Scenario

Minimum Playwright scenario:

1. Open app.
2. Sign up.
3. Log in.
4. Create a topic.
5. See topic detail.
6. Add a comment.
7. Search for the topic.
8. Open the topic from search results.

AI mock E2E candidate:

1. Open AI Q&A page.
2. Ask a question.
3. See loading state.
4. See answer with sources.

## Manual Demo Checklist

- [ ] Docker services start.
- [ ] Backend `/docs` opens.
- [ ] Frontend opens.
- [ ] Signup/login works.
- [ ] Post CRUD works.
- [ ] Comment/tag/search/pagination works.
- [ ] Redis rate limit can be explained or demonstrated.
- [ ] Cookie refresh auth can be demonstrated in browser devtools.
- [ ] RabbitMQ/Celery worker receives an embedding job.
- [ ] pgvector similar search works.
- [ ] RAG answer shows sources.
- [ ] MCP tool calls external service or documented fallback.
- [ ] LangGraph Agent shows trace/progress.
- [ ] README explains commands.

## Risk-Based Priority

If time is short, test in this order:

1. Auth and permission checks
2. Posts CRUD
3. Comments/tags/search
4. Worker enqueue and job status
5. RAG/MCP/Agent mock paths
6. Frontend E2E happy path
7. Edge cases and visual polish

## Test Result Log

Fill this during implementation and again during Day 8/Day 9.

| Date | Command | Result | Notes |
|---|---|---|---|
| 2026-06-16 | `cd backend && ../.venv/bin/python -m pytest tests/test_auth.py` | 15 passed | login cookies/session rows, refresh CSRF 403, rotation, old token reuse revoke, logout revoke/cookie delete |
| 2026-06-16 | `cd backend && ../.venv/bin/python -m pytest` | 51 passed | backend auth/posts/comments/tags/search regression |
| 2026-06-16 | `cd frontend && npm run build` | passed | frontend API client, auth logout, credentials, CSRF header, refresh retry build check |
| 2026-06-16 | Browser manual auth check | passed | `localhost:5173`, login cookies, readable CSRF cookie, HttpOnly refresh token hiding, logout CSRF header, cookie deletion |
| 2026-06-16 | `cd backend && ../.venv/bin/python -m pytest tests/test_admin.py` | 3 passed | `/api/admin/health`: no token 401, regular user 403, admin user 200 |
| 2026-06-16 | `cd backend && ../.venv/bin/python -m pytest` | 58 passed | admin role guard added; backend full regression |
| 2026-06-16 | `cd backend && ../.venv/bin/python -m pytest tests/test_admin.py` | 6 passed | admin post/comment hide/restore, public lookup exclusion, audit log writes |
| 2026-06-16 | `cd backend && ../.venv/bin/python -m pytest` | 61 passed | admin moderation added; backend full regression |
| 2026-06-16 | `cd backend && ../.venv/bin/python -m pytest tests/test_posts.py tests/test_admin.py` | 21 passed | post author delete sets `deleted_at`; admin cannot hide author-deleted post |
| 2026-06-16 | `cd backend && ../.venv/bin/python -m pytest` | 62 passed | post soft delete added; backend full regression |
| TBD | `npm test` | TBD | frontend unit tests are not set up yet |
| TBD | `npx playwright test` | TBD | automated E2E is not set up yet |

## Unfinished Test Disclosure

README should include any important tests that were not completed.

Example:

```text
Known test gap: full external LLM integration is tested with mock responses because the API key is provided through environment variables and may not be available in the grading environment.
```
