# Limitations and Improvements

## Purpose

This document records known limits that should not be hidden during final submission. A limitation is acceptable when it is named, tested around, and connected to a reasonable next step.

## Current Known Limits

| Area | Current Limit | Risk | Next Step |
|---|---|---|---|
| DB migrations | The project still relies on `Base.metadata.create_all()` plus manual Docker PostgreSQL `ALTER TABLE` updates during development. | Existing databases do not automatically receive new columns such as `users.role`, `posts.deleted_at`, hidden fields, or `admin_action_logs`. | Add Alembic migrations or a documented schema setup script before final deployment. |
| Admin seed | Admin users are currently created by directly changing `users.role` in the DB during tests/manual setup. | Demo or grading setup may not have an admin account ready. | Add a small seed command or document the exact SQL in README. |
| Frontend tests | Frontend is currently verified with `npm run build` and manual browser checks, not Vitest/RTL. | UI regressions can slip through if components change quickly. | Add minimal tests for authStore role sync, MyPage empty state, and AdminPage non-admin state. |
| E2E | Playwright E2E is not set up yet. | Full signup/login/post/comment/admin smoke flow is not automatically repeatable. | Add one happy-path E2E scenario before final submission. |
| Multi-tab refresh | Same-tab concurrent refresh is protected with a shared `refreshPromise`; multiple browser tabs are not coordinated. | Two tabs can still race refresh token rotation. | Consider `BroadcastChannel`, localStorage lock, or a short backend grace window. |
| Immediate logout semantics | Logout revokes refresh session and clears frontend access token, but already-issued access JWTs remain valid until expiry. | A copied access token could work for up to 30 minutes. | Consider access token denylist or per-request session check if stronger security is needed. |
| Admin audit UI | Admin actions are logged, but there is no full audit log browser screen. | Moderation trace exists in DB but is not easy to inspect in the frontend. | Add read-only audit log API/page as a Day 9 improvement candidate. |
| RAG visibility filtering | Deleted/admin-hidden content filtering is documented but RAG is not implemented yet. | Future vector retrieval could accidentally include hidden content if filters are forgotten. | Day 5 RAG queries must filter `deleted_at IS NULL` and `hidden_at IS NULL` for posts/comments. |
| AI/provider setup | LLM, embedding model, MCP external tool, and agent runtime are still later phases. | AI feature claims must not be overstated before implementation. | Keep AI docs updated before each feature and use environment variables for secrets. |

## Improvement Backlog

| Priority | Item | Reason |
|---|---|---|
| High | Add repeatable admin seed procedure. | Needed for demo and grading. |
| High | Add RAG source visibility guard tests when RAG starts. | Hidden/deleted content must not leak into AI answers. |
| High | Add one browser smoke flow covering login, post, comment, MyPage, and Admin moderation. | Gives final submission a repeatable end-to-end proof. |
| Medium | Add frontend unit tests for auth role state and admin access states. | Protects the newest frontend auth changes. |
| Medium | Add audit log viewer. | Makes moderation trace visible without DB inspection. |
| Low | Add stronger immediate logout semantics. | Useful for production hardening, not mandatory for MVP. |
| Low | Add multi-tab refresh coordination. | Important for production polish, acceptable as documented limitation for MVP. |

## Current Verification Baseline

Latest confirmed checks on 2026-06-16:

- `cd backend && ../.venv/bin/python -m pytest tests/test_admin.py` -> 11 passed.
- `cd backend && ../.venv/bin/python -m pytest` -> 69 passed.
- `cd frontend && npm run build` -> passed.
- Browser auth manual check passed for login cookies, readable CSRF cookie, HttpOnly refresh token hiding, logout CSRF header, and cookie deletion.
