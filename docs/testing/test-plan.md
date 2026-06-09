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

Fill this during Day 8 and Day 9.

| Date | Command | Result | Notes |
|---|---|---|---|
| TBD | `pytest` | TBD |  |
| TBD | `npm test` | TBD |  |
| TBD | `npx playwright test` | TBD |  |

## Unfinished Test Disclosure

README should include any important tests that were not completed.

Example:

```text
Known test gap: full external LLM integration is tested with mock responses because the API key is provided through environment variables and may not be available in the grading environment.
```
