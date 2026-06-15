# Auth Session Design

## Purpose

이 문서는 GlowBoard의 Day 2-B 인증 전환 설계를 정리한다.

`api-spec.md`는 endpoint 계약, `database-erd.md`는 table 구조를 설명한다.
이 문서는 access token, refresh token, cookie, CSRF, login session, refresh token history가 함께 움직이는 흐름을 한 곳에 모아 둔다.

## Status

- Date: 2026-06-16
- Status: Day 2-B implemented and manually verified
- Scope: cookie refresh auth, CSRF for cookie-auth requests, refresh token rotation, session expiry
- Final rotation model: `sessions` + `refresh_tokens` split

## Core Terms

| Term | Meaning |
|---|---|
| access token | 일반 API 요청에 쓰는 짧은 수명의 인증 token |
| refresh token | 새 access token을 받기 위한 긴 수명의 token |
| session row | 특정 기기/브라우저의 로그인 상태를 server DB에서 추적하는 row |
| refresh token row | 한 session 안에서 발급된 refresh token 하나의 이력 row |
| HttpOnly cookie | JavaScript가 읽을 수 없는 cookie |
| CSRF token | cookie가 자동 첨부된 요청이 진짜 frontend에서 만들어졌는지 확인하는 값 |
| idle timeout | 일정 기간 활동이 없으면 session이 만료되는 기준 |
| absolute max | 계속 활동해도 이 시점을 넘으면 다시 로그인해야 하는 최대 기준 |

## Chosen Design

| Area | Decision | Reason |
|---|---|---|
| general API auth | `Authorization: Bearer <access_token>` | 브라우저가 자동으로 붙이지 않으므로 일반 API의 CSRF 범위를 줄인다. |
| access token storage | frontend authStore 중심 | 여러 화면과 API client가 같은 로그인 상태를 보게 한다. |
| access token lifetime | 30 minutes | 상용 기본값처럼 짧게 두되, MVP 학습 UX를 위해 15분보다 여유 있게 둔다. |
| refresh token storage | HttpOnly cookie | 긴 수명의 token을 JavaScript가 직접 읽지 못하게 한다. |
| refresh/logout CSRF | double-submit cookie + `X-CSRF-Token` header | refresh/logout은 cookie 인증 요청이라 CSRF 검사가 필요하다. |
| session expiry | 7 days idle + 30 days absolute max | 7일 동안 안 오면 로그아웃, 계속 와도 30일 뒤 재로그인한다. |
| rotation storage | separate `refresh_tokens` history table | session은 로그인 묶음이고 refresh_tokens는 token rotation 이력이라 의미가 깔끔하다. |
| multi-device model | one session per browser/device login | 같은 계정의 Mac/iPhone/회사 PC 로그인을 따로 관리할 수 있다. |
| 401 handling | refresh once, retry original request once | access token은 짧게 두되 사용자 경험을 유지하고 무한 loop를 막는다. |

## Conceptual Model

```text
user
-> 계정

session
-> 특정 기기/브라우저의 로그인 묶음

refresh_token
-> 그 session 안에서 access token을 다시 발급받기 위한 일회성 교환권
```

Example:

```text
user_id = 1

Mac Chrome login
-> sessions row 10
-> refresh_tokens: R1 -> R2 -> R3

iPhone Safari login
-> sessions row 11
-> refresh_tokens: R4 -> R5

Company PC Edge login
-> sessions row 12
-> refresh_tokens: R6
```

Benefits:

- A single device can be logged out without logging out all devices.
- All sessions for one user can be revoked for "log out everywhere".
- Reuse detection can revoke only the affected session first.
- A future MyPage security screen can show active sessions.
- `sessions.absolute_expires_at` stays tied to the original login, while refresh token rows record rotation history.

## Token And Cookie Policy

### Access Token

- Sent in response body on login and refresh.
- Stored in frontend authStore.
- Sent on normal APIs through the `Authorization` header.
- Short-lived: 30 minutes for GlowBoard.
- If stolen through XSS, damage is limited by short lifetime.

Example:

```http
Authorization: Bearer <access_token>
```

### Refresh Token

- Sent as an HttpOnly cookie.
- Used only by `/api/auth/refresh` and `/api/auth/logout`.
- Rotated on every successful refresh.
- Stored in DB only as a hash in `refresh_tokens`.
- A used refresh token gets `used_at`.
- A replacement token is linked through `replaced_by_token_id`.

Cookie defaults:

```text
name: refresh_token
HttpOnly: true
Secure: false in local HTTP, true in production HTTPS
SameSite: Lax
Path: /api/auth
Max-Age: remaining time until sessions.absolute_expires_at
```

### CSRF Token

- Sent as a readable cookie.
- Frontend reads it and sends the same value in `X-CSRF-Token`.
- Backend compares cookie value and header value.
- Required for refresh/logout.
- Not an XSS defense. If XSS exists, malicious JavaScript can read this value.

Cookie defaults:

```text
name: csrf_token
HttpOnly: false
Secure: false in local HTTP, true in production HTTPS
SameSite: Lax
Path: /api/auth
Max-Age: remaining time until sessions.absolute_expires_at
```

Header:

```http
X-CSRF-Token: <csrf_token>
```

## DB Policy

### `sessions`

`sessions` represents login sessions, not SQLAlchemy `Session`.

Required fields:

```text
id
user_id
expires_at
absolute_expires_at
revoked_at
created_at
```

Field meaning:

| Field | Meaning |
|---|---|
| `expires_at` | idle timeout for the login session. Updated on refresh, but never beyond absolute max. |
| `absolute_expires_at` | maximum login lifetime from initial login. Not extended by refresh. |
| `revoked_at` | explicit invalidation time from logout, forced revoke, or token misuse. |

Active session condition:

```text
sessions.revoked_at IS NULL
sessions.expires_at > now
sessions.absolute_expires_at > now
```

On refresh:

```text
new_session_expires_at = min(now + 7 days, sessions.absolute_expires_at)
```

### `refresh_tokens`

`refresh_tokens` records rotation history inside a session.

Required fields:

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

Field meaning:

| Field | Meaning |
|---|---|
| `session_id` | parent login session |
| `token_hash` | hash of raw refresh token |
| `issued_at` | when this refresh token was created |
| `expires_at` | expiry of this specific refresh token |
| `used_at` | when this token was successfully exchanged |
| `revoked_at` | explicit invalidation time for this token |
| `replaced_by_token_id` | next token created by rotation |

Valid refresh token condition:

```text
refresh_tokens.used_at IS NULL
refresh_tokens.revoked_at IS NULL
refresh_tokens.expires_at > now
parent session is active
token_hash matches
```

## Token Format

For the Day 2-B implementation, use one opaque random refresh token.

Rules:

- the full raw refresh token is generated with `secrets.token_urlsafe`.
- the full raw refresh token is hashed with SHA-256 before DB storage.
- the backend finds the `refresh_tokens` row by comparing `token_hash`.
- raw refresh token is never stored in DB.
- if the matching token row exists but `used_at` is already set, treat it as reuse and revoke the parent session.
- if no matching token hash exists, reject the request as an invalid refresh token.

## Request Flows

### Login

```text
1. User sends email/password.
2. Backend verifies password.
3. Backend creates access token.
4. Backend creates sessions row.
5. Backend creates first refresh_tokens row R1.
6. Backend stores R1 hash.
7. Backend sets refresh_token HttpOnly cookie.
8. Backend sets csrf_token readable cookie.
9. Backend returns access token and user in response body.
```

### Normal API Request

```text
1. Frontend reads access token from authStore.
2. Frontend sends Authorization: Bearer <access_token>.
3. Backend validates access token.
4. Backend handles the API request.
```

CSRF is not required for normal APIs in this design because auth is not cookie-based there.

### Refresh

```text
1. Normal API returns 401 because access token expired.
2. Frontend calls /api/auth/refresh with credentials included.
3. Browser automatically sends refresh_token and csrf_token cookies.
4. Frontend also sends X-CSRF-Token header.
5. Backend verifies CSRF cookie/header match.
6. Backend hashes the refresh cookie value.
7. Backend finds the matching refresh_tokens row and parent session.
8. Backend checks parent session revoked_at, expires_at, absolute_expires_at.
9. Backend checks token used_at, revoked_at, expires_at.
10. Backend verifies refresh token hash.
11. Backend sets old refresh token used_at.
12. Backend creates new refresh_tokens row R2.
13. Backend sets old replaced_by_token_id = R2.id.
14. Backend updates sessions.expires_at to min(now + 7 days, absolute_expires_at).
15. Backend returns a new access token and rotated refresh cookie.
16. Frontend stores new access token in authStore.
17. Frontend retries the original request once.
```

### Logout

```text
1. Frontend sends /api/auth/logout with credentials and X-CSRF-Token.
2. Backend verifies CSRF.
3. Backend finds refresh token row and parent session.
4. Backend sets sessions.revoked_at.
5. Backend may set current refresh_tokens.revoked_at.
6. Backend deletes refresh_token and csrf_token cookies.
7. Frontend clears authStore.
```

### Logout And Existing Access Tokens

GlowBoard uses stateless JWT access tokens for normal APIs. That means logout does not delete an already issued access token string from the server by itself.

Current Day 2-B policy:

- access token lifetime is 30 minutes.
- frontend logout clears authStore/local access token state immediately.
- backend logout revokes the refresh session and clears refresh/csrf cookies.
- after logout, the browser cannot refresh into a new access token.
- a stolen access token could still work until `exp` unless a future denylist or per-request session check is added.

This is the common MVP/commercial baseline: short access token plus server-side refresh session revoke. Stronger immediate access-token revocation remains an implementation candidate.

## Reuse Detection Policy

MVP default:

```text
If an already-used refresh token is submitted again,
revoke the parent session.
```

Reason:

```text
The old token should have been replaced already.
Seeing it again may mean token theft, a duplicated request, or a stale client.
```

Candidate for later:

```text
small grace window for concurrent tabs
revoke all sessions for the user on high-risk reuse
security notification
admin audit event
```

## Multi-Device Policy

Each successful login creates one session.

```text
Mac Chrome login     -> session A
iPhone Safari login  -> session B
Company PC login     -> session C
```

MVP default:

```text
logout
-> revoke current session only

reuse detection
-> revoke affected session only
```

Candidates:

```text
log out all sessions
device/session list
user_agent
ip_address
device_name
last_seen_at
```

## CORS Requirements

Because local frontend and backend run on different origins:

```text
frontend: http://localhost:5173
backend:  http://localhost:8000
```

Backend must allow the frontend origin explicitly.

Cookie requests require:

```text
backend CORS allow_credentials = true
frontend fetch credentials = "include"
```

Do not use wildcard origin with credentials.

## Security Boundaries

| Risk | Mitigation |
|---|---|
| XSS steals access token | short access token lifetime, React escaping, avoid unsafe HTML, future CSP |
| logout leaves existing access token usable until expiry | 30-minute access token lifetime, frontend authStore clear, future access token denylist/session check |
| XSS steals refresh token | HttpOnly refresh cookie |
| CSRF uses refresh/logout cookies | CSRF token check for refresh/logout |
| stolen old refresh token reused | `refresh_tokens.used_at` reuse detection and session revoke |
| one account uses several devices | one `sessions` row per device/browser login |
| session lasts forever | 7-day idle timeout and 30-day absolute max |

## Implementation Candidates

These are intentionally not part of the Day 2-B MVP unless time remains.

- reuse detection grace window for concurrent tabs
- device/session management UI
- force logout all sessions
- remember-me option
- `sessions.user_agent`
- `sessions.ip_address`
- `sessions.device_name`
- `sessions.last_seen_at`
- admin audit view for session events
- access token denylist/blacklist in Redis
- per-request session check using a session id claim
- full cookie-based access token auth with CSRF on all mutation APIs
- BFF/server-session architecture

## Test Plan

Backend tests should cover:

- login sets refresh and CSRF cookies.
- login creates one session row.
- login creates one refresh token row.
- refresh without CSRF header returns 403.
- refresh with valid cookies and CSRF returns new access token.
- refresh sets old refresh token `used_at`.
- refresh creates a new refresh token row.
- refresh links old token to new token through `replaced_by_token_id`.
- old refresh token reuse is rejected and revokes the parent session.
- idle-expired session is rejected.
- absolute-expired session is rejected.
- revoked session is rejected.
- logout revokes session and clears cookies.

Frontend/manual checks should cover:

- normal API uses `Authorization: Bearer`.
- expired access token triggers exactly one refresh retry.
- refresh failure clears authStore and sends the user back to login.
