
## 2026-06-15 ??: ?? ?? ??/??? ??? API

?? ??? ??? ?? ??? ???, ??? ?? ??? ???? ???? API ????.

### ??? ??

| ?? | ?? |
| --- | --- |
| `backend/app/schemas/review.py` | ?? ??, ?? ?? ??/??/?? schema |
| `backend/app/repositories/review_repository.py` | review_requests, review_request_coaches DB ??/?? |
| `backend/app/services/review_service.py` | ?? ??, ?? ??, ?? ??, ?? ?? ?? |
| `backend/app/routers/reviews.py` | `/review-requests` API endpoint |
| `backend/app/main.py` | review router ?? |

### ?? ??

```txt
?? ?? ??
-> POST /review-requests
-> ?? ??? ??? post/project?? ??
-> ??? coachIds? ?? ?? ???? ??
-> review_requests ??
-> review_request_coaches ?? ??

?? ???
-> GET /review-requests/inbox
-> ??? ??? ??
-> PATCH /review-requests/{id}
-> ??? ???? ??
-> status/feedback ??
```

### ?? ??

- ReviewRequest? Coach? N:M ???? `review_request_coaches` ?? ???? ????.
- ??? ?? ?/????? ?? ?? ???? ?? ? ??.
- ??? ???? ??? ??? ??? ? ??.
- ?? ? ??? ??? ? ??, ??? ???? ??? ???.

### ??? ??

?? ?? ?? ? `db.delete(review_request)`? ?? ??? ?? ??? ?? PK? NULL? ??? ? ??? ??. ?? ???? ?? ??? ?? bulk delete? ??? ????.

---

## 2026-06-15 ??: ????? ???? API ??

?? ??? ????? ?? ???? GitHub repo URL? ???? DB? ????? ????, ? ???? ??? ? ?? ?? ???.

### ??/?? ??

| ?? | ?? |
| --- | --- |
| `backend/app/schemas/portfolio.py` | ???? ??/??/??? ?? request/response schema |
| `backend/app/repositories/portfolio_repository.py` | portfolio_projects, portfolio_project_posts DB ??/?? |
| `backend/app/services/portfolio_service.py` | GitHub URL ??, ?? ??, ?? ?? |
| `backend/app/routers/portfolio.py` | `/portfolio/projects` API endpoint |
| `backend/app/main.py` | portfolio router ?? |
| `frontend/src/app/api/portfolio.ts` | ????? API fetch ??? ?? |
| `frontend/src/app/pages/portfolio/Portfolio.tsx` | mock ???? state? ?? API state? ?? |

### ?? ??

```txt
GitHub ???? ?? ??
-> POST /portfolio/projects
-> require_roles("STUDENT", "ADMIN")
-> githubUrl?? owner/repo ??
-> portfolio_projects row ??
-> React projects state? ??

?? ????
-> GET /me/posts ? ? ?? ?? ??
-> ????? postIds ??
-> PUT /portfolio/projects/{id}/posts
-> portfolio_project_posts ?? ??? ??
-> React selectedProject ??
```

### ?? ??

- N:M ??: ???? ??? ?? ???? ??? ? ??, ??? ??? ?? ????? ??? ? ??.
- ?? ???: `portfolio_project_posts`? `project_id`, `post_id`? ?? ??? ????.
- ?? API ? ??: GitHub README/?? ??? ?? ?? ??, ??? ?? DB ??? ?? ???.
- ??: ??? ?? ????? ?? ???? ??? ? ??.

### ??? AI? ??? ??

- `readmeSummary`: GitHub README ??? ??? ??
- `recentCommitSummary`: GitHub ?? ?? ??? ??? ??
- `savedPortfolioDraft`: OpenAI? ?? ????? ? ?? ?? ??
- `linkedPostIds`: RAG? ??? JungleLog ?? id ??

---

## 2026-06-15 ??: ADMIN ??? ??/?? ?? API

?? ??? ???? Google ??? ???? ??? ?? ??? ???? ????. ???? ????? ?? ???? ?? ?? ??, `approvalStatus`? `?? ??`? ??? ?? ??? ??? ? ??.

### ??/??? ??? ??

| ?? | ?? |
| --- | --- |
| `backend/app/schemas/admin.py` | ??? ??? ??/?? API request/response ?? ?? |
| `backend/app/repositories/admin_user_repository.py` | users ??, users ?? ??, user_approval_logs ?? ?? |
| `backend/app/services/admin_user_service.py` | ADMIN ?? ?? ?? ??, role/status ??, ?? ?? |
| `backend/app/routers/admin.py` | `/admin/users` API endpoint ?? |
| `backend/app/main.py` | admin router ?? |
| `frontend/src/app/api/admin.ts` | ??? API fetch ??? ?? ?? |
| `frontend/src/app/pages/admin/AdminUsers.tsx` | mock ??? ?? API ?? ???? ?? |

### ?? ??

```txt
ADMIN ????
-> GET /admin/users
-> require_roles("ADMIN")
-> admin_user_service.get_admin_users
-> admin_user_repository.list_users
-> users ?? ??

?? ?? ??
-> PATCH /admin/users/{user_id}
-> require_roles("ADMIN")
-> ?? ?? ?? ?? ??
-> users.role / users.approval_status ??
-> user_approval_logs ?? ??
-> ??? ??? ??
-> React state ??
```

### ??? ?? ??? ??

- ADMIN API? ?? ?????? ???? `require_roles("ADMIN")`? ????.
- ?? ??? `users` ???? ????, ?? ??? `user_approval_logs`? ?? ????.
- ??? ??? ??? ?? ??? ????? ???? ??? ? ???? ????? ??? ??.
- 422? request body? schema? ?? ?? ? FastAPI/Pydantic? ????.

### ?? ??? ?? ?? ??

- ?? ??: ???? ??? ?? ??? ???? ???? DB ???.
- ?? ??: ?? ???? ?? ??? ??? ?? ?? ??/API? ??? ? ??? ???? ????.

??:

- `?? ??` ???? ???? ???? ??? ?? ??? ????.
- `?? ?? + STUDENT`? ?? ?? ?? ??, ??? ?? ?? ??.
- `?? ?? + ADMIN`? ??? ?? ?? ?? ??.

---

## 2026-06-15 ??: current_user ?? ???/?? ?? ??

?? ??? ???? ??? ??????? JWT cookie?? ??, ? ??? ???? ???/?? ??? ???? ?? ???.

### ??? ??? ??

| ?? | ?? |
| --- | --- |
| `backend/app/dependencies/auth.py` | access token cookie? ?? `current_user`? ???, ?? API? `get_optional_current_user`? ?? |
| `backend/app/routers/posts.py` | HTTP ??? ?? ?? dependency? ?? ? service? ?? |
| `backend/app/routers/comments.py` | ?? ??/??/?? ??? ?? ??? ??? ?? |
| `backend/app/routers/me.py` | `/me/posts`? demo user? ??? ?? ??? ??? ?? ???? ?? |
| `backend/app/services/post_service.py` | ??? ???/ADMIN ?? ??? ?? ?? ?? |
| `backend/app/services/comment_service.py` | ?? ???/ADMIN ?? ??? ?? ?? ?? |
| `backend/app/repositories/post_repository.py` | ???/???? ?? ??? SQLAlchemy query? ?? |
| `backend/app/repositories/comment_repository.py` | ?? ?? ??? ????? DB?? ?? |
| `backend/app/schemas/post.py` | ??? ?? ??? ?? `authorId` ?? ?? |
| `backend/app/schemas/comment.py` | ?? ?? ?? ??? ?? `authorId` ?? ?? |
| `frontend/src/app/api/posts.ts` | ??? API ??? `authorId` ?? |
| `frontend/src/app/api/comments.ts` | ?? API ??? `authorId` ?? |
| `frontend/src/app/pages/posts/PostDetail.tsx` | ???/ADMIN? ?? ??/?? ?? ?? |

### ?? ??

```txt
???? ??
-> HttpOnly cookie ?? ??
-> FastAPI Depends(get_current_approved_user)
-> access token decode
-> users ????? User ??
-> router? service? current_user ??
-> service? ??? ??/ADMIN ?? ??
-> repository? DB ??/??
-> schema? authorId ?? ?? ??
-> React? authorId? user.id? ??? ?? ??
```

### ??? ?? ??? ??

- `Depends`: API ??? DB session?? ?? ??? ?? ?? ?? ????.
- `current_user`: ??? token?? ?? ?? ??? row?.
- `401 Unauthorized`: ??? ??? ??? token? ??? ???.
- `403 Forbidden`: ???? ??? ??/??? ??? ???.
- `soft delete`: row? ???? ?? `deleted_at`? ?? ???? ???.
- `authorId`: ???? ??? ? ?????? ????? ??? id? ????.
- optional auth: ?? API? ????? ?????, ????? ??? ? ???? ????.

### ?? ???? ? ??

- request body? `authorId`? ??? ??? ? ???? ????.
- ???? ???? ??? ?? ??? ???? token?? ?? `current_user.id`? ??? ??.
- ???? ?? ??? UX? ???, ?? ??? ??? service ?? ???? ??? ??.
- ???? ????? ?? ??? ???. ????? ???/ADMIN? ???? ??.

### ??? ??? ??

- ??? ?? API? `require_roles("ADMIN")`?? ????.
- ????? ???? ??? `current_user.id`? owner? ????.
- ?? ?? ??? ??? `current_user.id`? requester? ????.

---
# Study Notes

## 2026-06-15 ??? Google OAuth ?? ??

?? ??? ???? ??? Google OAuth/JWT ?? API? React ?? ?? ??? UX? ??? ????.

### ??? ??? ??

| ?? | ?? |
| --- | --- |
| `frontend/src/app/api/client.ts` | API ?? ??? ?? ?? ?? ?? ?? |
| `frontend/src/app/api/auth.ts` | `/auth/me`, `/auth/refresh`, `/auth/logout`, Google ??? ?? ?? ?? |
| `frontend/src/app/contexts/AuthContext.tsx` | ?? ??? ???, ?? ??, ????, ??? ?? ????? ?? ??? ?? |
| `frontend/src/app/App.tsx` | ?? ???? `AuthProvider` ?? ?? ?? ??? ?? ??? ?? ? |
| `frontend/src/app/layouts/MainLayout.tsx` | ?? ??? role/approvalStatus ???? ????? ?? ?? ?? |
| `frontend/src/app/components/RoleGate.tsx` | ?? ??? ??? ?? ?? ?? ?? ?? |
| `frontend/src/app/pages/auth/Login.tsx` | Google OAuth ??? ?? ?? ?? |
| `frontend/src/app/pages/auth/PendingApproval.tsx` | ?? ??/??/??/?? ?? ?? ?? |
| `frontend/src/app/api/posts.ts` | ??? API ??? ?? cookie ?? |
| `frontend/src/app/api/comments.ts` | ?? API ??? ?? cookie ?? |

### ?? ??

```txt
App.tsx
-> AuthProvider
-> ? ?? ? /auth/me ??
-> access token ??? /auth/refresh ??
-> user? ??? /login
-> user? ??? ?? ??? /pending-approval
-> ?? ??? role? ?? MainLayout ?? ??
```

### ??? ??? React ??

- `Context`: ??? ??? ??? ?? ???? ???? ?? ????.
- `useContext`: `useAuth()` hook?? ?? ?? ??? ??? ?? ????.
- `useEffect`: ?? ?? ?? ? `/auth/me`? ? ? ???? ?? ????.
- `useState`: `user`, `status`, ?? ???? ?? ??? ????.
- `Navigate`: ??? ?? `/login`, `/pending-approval`, `/`? redirect??.
- `Outlet context`: `MainLayout`? ?? ???? `RoleGate`? ?? user/role/approvalStatus? ????.

### ??? ??? ?? ??

- HttpOnly cookie? JavaScript? ?? ? ??.
- ??? ???? token ?? ?? ??? ??, `fetch(..., { credentials: "include" })`? cookie? ?? ???.
- `/auth/me`? cookie ? access token? ???? ?? ???? ????.
- access token? ???? `/auth/refresh`? refresh token cookie? ? token? ????.
- role? JWT? ?? ?? DB?? ?? ???. ??? ???? role? ??? ?? ???? ?? ????.

### ?? ???? ? ???

1. ??? ??? ? ?? mock role state? ??? `/auth/me` ??? ????.
2. `approvalStatus === "?? ??"`? ?? ?? ??? ??? ????.
3. `STUDENT`, `COACH`, `ADMIN`? ?? ??? `RoleGate` ?? ??? ??? ????.
4. `credentials: "include"`? ??? ????? HttpOnly cookie? ???? ??? ???.
5. ?? ???? ??? ??? ????, ??? ??? ??? ?? ???? ??? `current_user`? ??? ??.

### ??? ???? ??? ??

- ??? ??/??/?? ??? id? demo user? ??? ?? ??? ??? id? ??
- ?? ??/?? ??? id? ?? ??? ??? id? ??
- ? ?? ??? ?? ??? ??? ???? ??
- ADMIN ??? ??/?? ?? API ??

---

# Study Notes

## 2026-06-14 JWT / refresh token 보안 유틸 학습

이번 작업은 인증 API를 만들기 전에 토큰을 생성하고 검증하는 공통 함수를 준비한 단계다.

### 이번에 수정한 파일

| 파일 | 역할 |
| --- | --- |
| `backend/app/core/security.py` | access token 생성/검증, refresh token 생성/해시 유틸 |
| `backend/app/core/config.py` | JWT, Google OAuth, Cookie 설정값 추가 |
| `backend/.env.example` | 팀원이 따라 설정할 수 있는 환경변수 예시 추가 |
| `backend/requirements.txt` | `python-jose`, `cryptography` 의존성 반영 |
| `README.md` | 현재 인증 구현 상태 업데이트 |

### 왜 python-jose를 쓰는가

JWT는 단순히 문자열을 base64로 나눈 것이 아니라 서명, 만료 시간, 알고리즘 검증이 들어간 인증 토큰이다. 직접 구현하면 알고리즘 혼동, 만료 검증 누락 같은 실수가 생길 수 있으므로 검증된 라이브러리인 `python-jose`를 사용한다.

```txt
payload
-> jwt.encode(payload, secret, algorithm)
-> access token 문자열
-> jwt.decode(token, secret, algorithms=[algorithm])
-> payload 복원 및 서명/만료 검증
```

### security.py 흐름

```txt
create_access_token(user_id)
-> payload에 sub, type, iat, exp 저장
-> settings.jwt_secret_key로 서명
-> JWT 문자열 반환

decode_access_token(token)
-> JWT 서명과 만료 검증
-> type이 access인지 확인
-> sub를 int user_id로 변환
-> 실패하면 None
```

### 왜 JWT에 role을 넣지 않았나

role을 JWT에 넣으면 관리자가 사용자의 role을 바꿔도 이미 발급된 access token에는 옛 role이 남는다.
그래서 access token에는 `sub`로 user id만 넣고, role과 승인 상태는 DB에서 다시 조회하는 방식으로 간다.

```txt
access token -> user_id만 확인
DB users table -> role, approval_status 확인
```

### refresh token 흐름

```txt
create_refresh_token()
-> 예측 불가능한 랜덤 문자열 생성
-> 브라우저 HttpOnly cookie로 전달 예정

hash_refresh_token(refresh_token)
-> sha256 hash 생성
-> DB auth_refresh_tokens.token_hash에 저장 예정
```

DB에는 refresh token 원문을 저장하지 않는다. 원문은 쿠키에만 있고 DB에는 해시만 저장한다.

### 이번에 나온 키워드

- JWT
- access token
- refresh token
- token hash
- HS256
- exp, iat, sub claim
- HttpOnly Cookie
- refresh token rotation
- python-jose
- cryptography

### 다음에 연결될 부분

- `auth_repository.py`: refresh token hash 저장/조회/폐기
- `auth_service.py`: Google OAuth callback 처리와 토큰 발급
- `auth.py`: `/auth/google/login`, `/auth/google/callback`, `/auth/me`, `/auth/refresh`, `/auth/logout`
- `dependencies/auth.py`: cookie에서 access token을 읽고 current user를 만드는 dependency

## 2026-06-14 JWT refresh token 저장 구조 학습

이번 작업은 Google OAuth / JWT 인증을 바로 붙이기 전에 refresh token을 안전하게 저장할 DB 구조를 추가한 단계다.

### 이번에 수정한 파일

| 파일 | 역할 |
| --- | --- |
| `backend/app/db/models/auth_refresh_token.py` | refresh token 해시, 만료, 폐기 상태를 저장하는 SQLAlchemy 모델 |
| `backend/app/db/models/user.py` | `User.refresh_tokens` 관계 추가 |
| `backend/app/db/models/__init__.py` | 새 모델을 `Base.metadata`에 등록되도록 import |
| `docs/agent/db-design.md` | ERD 테이블 목록, DBML, 필드별 설명 업데이트 |
| `README.md` | 현재 인증 구현 방향 업데이트 |

### 왜 refresh token 테이블이 필요한가

access token은 API 요청마다 현재 사용자를 증명하는 짧은 JWT다. 짧게 만료시키면 탈취되었을 때 피해 시간이 줄어든다.

하지만 access token이 너무 빨리 만료되면 사용자가 계속 다시 로그인해야 한다. 그래서 refresh token을 사용한다. refresh token은 access token을 다시 발급받기 위한 긴 수명의 토큰이다.

```txt
Google OAuth 로그인
-> backend가 사용자 확인
-> access token 발급
-> refresh token 발급
-> refresh token 해시를 DB에 저장
-> access token 만료 시 refresh token으로 재발급
```

### 왜 token 원문을 저장하지 않는가

refresh token 원문이 DB에 저장되어 있으면 DB가 유출되었을 때 공격자가 그대로 로그인 세션을 탈취할 수 있다. 그래서 DB에는 원문 대신 해시값만 저장한다.

```txt
브라우저 Cookie: refresh_token 원문
DB: sha256(refresh_token)
```

사용자가 `/auth/refresh`를 호출하면 서버는 쿠키의 refresh token 원문을 다시 해시해서 DB의 `token_hash`와 비교한다.

### 이번 모델의 핵심 필드

- `user_id`: 어떤 사용자의 로그인 세션인지 연결한다.
- `token_hash`: refresh token 원문 대신 저장하는 해시값이다.
- `expires_at`: refresh token 만료 시각이다.
- `revoked_at`: 로그아웃이나 강제 만료로 폐기된 시각이다.
- `replaced_by_token_id`: refresh token rotation에서 새 토큰 row를 연결한다.
- `user_agent`, `ip_address`: 어떤 브라우저/환경에서 발급된 토큰인지 추적하는 보조 정보다.

### SQLAlchemy 개념

- `ForeignKey("users.id")`: refresh token이 어느 사용자에게 속하는지 DB 관계를 만든다.
- `relationship(back_populates="refresh_tokens")`: Python 코드에서 `token.user`, `user.refresh_tokens`처럼 객체 관계로 접근하게 한다.
- `unique=True`: 같은 `token_hash`가 중복 저장되지 않도록 막는다.
- `index=True`: 로그인/refresh 요청마다 token hash를 찾게 되므로 조회 속도를 위해 둔다.
- self reference: `replaced_by_token_id`가 같은 테이블의 `id`를 다시 참조한다.

### 다음에 연결될 코드

- `security.py`: access token 생성/검증, refresh token 생성/해시
- `auth_service.py`: Google callback 처리, 사용자 생성/갱신, 토큰 발급
- `auth_repository.py`: refresh token 저장/조회/폐기
- `auth.py router`: `/auth/google/login`, `/auth/google/callback`, `/auth/me`, `/auth/refresh`, `/auth/logout`

## 2026-06-14 내 기록 화면 API 전환 학습

이번 구현은 `/my-records` 화면이 `mockData.ts`의 posts를 직접 필터링하던 구조에서 백엔드 `GET /me/posts` API를 호출하는 구조로 바뀐 작업이다.

### 이번에 수정한 파일

| 파일 | 역할 |
| --- | --- |
| `backend/app/routers/me.py` | `/me/posts` endpoint를 정의한다. |
| `backend/app/repositories/post_repository.py` | 작성자 id, 카테고리, 검색어, 공개 범위 조건으로 DB 게시글을 조회한다. |
| `backend/app/services/post_service.py` | demo user 기준 내 기록 목록 응답을 만든다. |
| `backend/app/main.py` | `me_router`를 FastAPI app에 등록한다. |
| `frontend/src/app/api/posts.ts` | `getMyPosts()` API 호출 함수를 제공한다. |
| `frontend/src/app/pages/posts/MyRecords.tsx` | 내 기록 목록과 통계를 API 응답 기준으로 렌더링한다. |

### 코드 흐름

```txt
MyRecords.tsx
-> categoryFilter, visibilityFilter, keyword state 변경
-> useEffect 실행
-> getMyPosts({ category, keyword, visibility })
-> GET /me/posts
-> routers/me.py
-> post_service.get_my_posts()
-> post_repository.list_posts_by_author()
-> PostgreSQL posts 조회
-> PostListResponse
-> records state 업데이트
-> 화면 렌더링
```

### 왜 `/posts`가 아니라 `/me/posts`인가?

`GET /posts`는 커뮤니티 전체가 볼 수 있는 공개 게시글 목록이다. 그래서 `is_public=True`인 글만 조회한다.

반면 `/my-records`는 내가 쓴 글을 관리하는 화면이다. 여기서는 비공개 글도 보여야 하므로 API를 분리했다.

```txt
GET /posts      -> 공개 게시글 목록
GET /me/posts   -> 내 게시글 목록, 공개/비공개 모두 가능
```

### 이번에 나온 React Hook

- `useEffect`: 필터나 검색어가 바뀔 때마다 API를 다시 호출한다.
- `useState`: 전체 기록 통계용 `allRecords`, 목록용 `records`, 로딩 상태, 에러 상태를 관리한다.
- cleanup flag: `isActive`를 두어 컴포넌트가 사라진 뒤 늦게 온 API 응답이 state를 바꾸지 않게 막는다.

### 이번에 나온 백엔드 개념

- `Literal`: `visibility` query가 `all`, `public`, `private` 중 하나만 받도록 제한한다.
- current user API: `/me/...`는 현재 로그인 사용자의 데이터를 다루는 API 이름으로 자주 쓴다.
- visibility filter: `public`이면 `Post.is_public is True`, `private`이면 `Post.is_public is False` 조건을 붙인다.
- service/repository 분리: current user 결정은 service, DB query는 repository가 담당한다.

### JWT/OAuth2 후 바뀔 부분

지금은 demo user를 현재 사용자처럼 사용한다. 나중에는 아래처럼 바뀐다.

```txt
현재: demo.student@junglelog.local 조회
나중: JWT access token -> current_user -> current_user.id
```

또 비공개 글 상세 조회는 `/posts/{id}` 공개 상세 API만으로는 부족하므로, 작성자 본인/ADMIN 권한을 확인하는 상세 조회 흐름이 필요하다.

## 2026-06-14 댓글 삭제 API와 상세 화면 연결 학습

이번 구현은 게시글 상세 화면에서 댓글마다 `삭제` 버튼을 보여주고, 버튼을 누르면 `DELETE /comments/{comment_id}` API로 댓글을 soft delete 처리하는 작업이다.

### 이번에 수정한 파일

| 파일 | 역할 |
| --- | --- |
| `backend/app/repositories/comment_repository.py` | 댓글 id로 삭제 대상 댓글을 찾고 `comments.deleted_at`을 업데이트한다. |
| `backend/app/services/comment_service.py` | 댓글이 존재하는지 판단하고 삭제 흐름을 결정한다. |
| `backend/app/routers/comments.py` | `DELETE /comments/{comment_id}` HTTP endpoint를 만든다. |
| `frontend/src/app/api/comments.ts` | 프론트에서 댓글 삭제 API를 호출하는 `deleteComment` 함수를 제공한다. |
| `frontend/src/app/pages/posts/PostDetail.tsx` | 댓글 삭제 버튼, 삭제 중 상태, 삭제 실패 메시지, 삭제 후 state 제거를 담당한다. |

### 코드 흐름

```txt
PostDetail.tsx 댓글 삭제 클릭
-> removeComment(comment.id)
-> deleteComment(comment.id)
-> DELETE /comments/{comment_id}
-> routers/comments.py
-> comment_service.delete_comment()
-> comment_repository.get_comment_for_update()
-> comment_repository.soft_delete_comment()
-> comments.deleted_at 업데이트
-> 204 No Content
-> 프론트 comments state에서 해당 댓글 제거
```

### 왜 `/posts/{post_id}/comments/{comment_id}`가 아니라 `/comments/{comment_id}`인가?

댓글 id는 이미 댓글 하나를 고유하게 구분한다. 그래서 삭제할 때는 게시글 id까지 없어도 어떤 댓글을 삭제할지 알 수 있다.

JungleLog v1에서는 다음처럼 나눴다.

```txt
댓글 목록/작성: /posts/{post_id}/comments
댓글 삭제: /comments/{comment_id}
```

목록과 작성은 “어느 게시글의 댓글인가”가 중요하고, 삭제는 “어느 댓글인가”가 중요하기 때문이다.

### 이번에 나온 백엔드 개념

- nested resource: 댓글은 게시글 아래에 달리는 하위 자원이다.
- `DELETE /comments/{comment_id}`: 댓글 하나를 삭제 처리하는 REST endpoint다.
- soft delete: `comments.deleted_at`에 삭제 시각을 기록한다.
- `204 No Content`: 삭제 성공 후 응답 body 없이 성공만 알린다.
- `404 Not Found`: 없는 댓글이거나 이미 삭제된 댓글이면 반환한다.

### 이번에 나온 React 개념

- `useState`: 삭제 중인 댓글 id와 삭제 에러 메시지를 관리한다.
- optimistic에 가까운 UI 갱신: API 성공 후 전체 댓글 목록을 다시 받지 않고 local state에서 해당 댓글만 제거한다.
- list rendering: `comments.map(...)` 안에서 각 댓글마다 삭제 버튼을 렌더링한다.
- disabled state: 현재 삭제 중인 댓글 버튼만 `삭제 중`으로 바꾼다.

### JWT/OAuth2 후 바뀔 부분

지금은 백엔드 인증 전 단계라 삭제 API가 실제 작성자를 확인하지 않는다. 나중에는 다음 조건이 필요하다.

```txt
댓글 작성자 본인 또는 ADMIN만 삭제 가능
```

프론트에서도 이 조건에 맞는 댓글에만 삭제 버튼을 보여주는 방식으로 바뀐다.

## 2026-06-14 게시글 삭제 API와 상세 화면 연결 학습

이번 구현은 게시글 상세 화면에서 `삭제` 버튼을 눌렀을 때 `DELETE /posts/{post_id}` API를 호출하고, 백엔드에서 해당 게시글을 soft delete 처리하는 작업이다.

### 이번에 수정한 파일

| 파일 | 역할 |
| --- | --- |
| `backend/app/repositories/post_repository.py` | DB의 `posts.deleted_at` 값을 실제로 업데이트한다. |
| `backend/app/services/post_service.py` | 삭제할 게시글을 찾고, 없으면 실패로 판단하는 비즈니스 흐름을 담당한다. |
| `backend/app/routers/posts.py` | `DELETE /posts/{post_id}` HTTP endpoint를 만든다. |
| `frontend/src/app/api/posts.ts` | 프론트에서 삭제 API를 호출하는 `deletePost` 함수를 제공한다. |
| `frontend/src/app/pages/posts/PostDetail.tsx` | 삭제 확인 UI, 삭제 중 상태, 삭제 성공 후 `/posts` 이동을 담당한다. |

### 코드 흐름

```txt
PostDetail.tsx 삭제 확인 클릭
-> deletePost(id)
-> DELETE /posts/{id}
-> routers/posts.py
-> post_service.delete_post()
-> post_repository.get_post_for_update()
-> post_repository.soft_delete_post()
-> posts.deleted_at 업데이트
-> 204 No Content
-> 프론트에서 /posts로 이동
```

### soft delete란?

soft delete는 DB row를 실제로 지우지 않고 `deleted_at` 같은 컬럼에 삭제 시각을 기록하는 방식이다.

JungleLog에서 soft delete를 쓰는 이유:

- 댓글, 코치 리뷰 요청, 포트폴리오 연결 이력이 갑자기 끊기지 않는다.
- 나중에 관리자 감사 로그나 복구 기능을 만들 수 있다.
- 목록과 상세 조회에서 `deleted_at is null` 조건만 추가하면 사용자에게는 삭제된 것처럼 보인다.

### 이번에 나온 백엔드 개념

- `DELETE`: REST에서 리소스를 삭제할 때 쓰는 HTTP method다.
- `204 No Content`: 성공했지만 응답 body가 필요 없는 경우에 쓰는 상태 코드다.
- `404 Not Found`: 삭제하려는 게시글이 없거나 이미 삭제된 경우 반환한다.
- repository: 실제 DB 업데이트를 담당한다.
- service: 삭제 가능한 대상인지 확인하고 전체 흐름을 결정한다.
- router: HTTP 요청과 응답 코드를 정의한다.

### 이번에 나온 React 개념

- `useState`: 삭제 확인 UI, 삭제 중 상태, 삭제 에러 메시지를 관리한다.
- `useNavigate`: 삭제 성공 후 `/posts`로 이동한다.
- 조건부 렌더링: `isDeleteConfirmOpen`이 true일 때만 삭제 확인 박스를 보여준다.
- API 함수 분리: 화면 컴포넌트가 `fetch` 세부 구현을 직접 알지 않게 `api/posts.ts`에 모아둔다.

### JWT/OAuth2 후 바뀔 부분

지금은 인증 전 단계라 아무 사용자나 API를 호출할 수 있는 구조다. 나중에는 다음 검사가 들어간다.

```txt
현재 로그인 사용자 == 게시글 작성자
또는
현재 로그인 사용자 role == ADMIN
```

이 조건이 아니면 삭제 API는 `403 Forbidden`을 반환해야 한다.

## 2026-06-14 게시글 수정 API와 수정 화면 연결 학습

이번 구현은 `/posts/:id/edit` 화면에서 기존 게시글을 불러오고, 수정 완료 버튼을 누르면 `PATCH /posts/{post_id}`로 DB를 갱신하는 작업이다.

### 수정한 파일과 역할

| 파일 | 역할 |
| --- | --- |
| `backend/app/schemas/post.py` | `PostUpdateRequest`를 추가해서 수정 API request body 모양을 정의한다. |
| `backend/app/repositories/post_repository.py` | 수정 대상 게시글을 찾고, posts 테이블과 post_tags 연결 테이블을 실제로 갱신한다. |
| `backend/app/services/post_service.py` | 제목/본문 공백 검증, 카테고리 확인, 태그 정리, 응답 변환을 담당한다. |
| `backend/app/routers/posts.py` | `PATCH /posts/{post_id}` HTTP endpoint를 만든다. |
| `frontend/src/app/api/posts.ts` | 프론트에서 호출할 `updatePost()` fetch 함수를 제공한다. |
| `frontend/src/app/pages/posts/PostEdit.tsx` | 수정 모드에서 기존 글을 불러와 form state에 채우고, 저장 시 update API를 호출한다. |

### 코드 흐름

```txt
/posts/5/edit 접속
-> PostEdit.tsx
-> useParams로 id = "5" 읽기
-> useEffect에서 getPostDetail(5) 호출
-> GET /posts/5 응답을 title/body/category/tags state에 채움
-> 수정 완료 클릭
-> updatePost(5, payload)
-> PATCH /posts/5
-> routers/posts.py
-> services/post_service.py
-> repositories/post_repository.py
-> posts row 수정 + 기존 post_tags 삭제 + 새 post_tags 생성
-> PostDetailResponse 반환
-> /posts/5 상세 화면으로 이동
```

### 이번 구현에서 나온 React 개념

- `useParams`: URL의 `:id` 값을 읽는다.
- `useEffect`: 수정 화면이 열린 뒤 API를 호출해서 기존 글을 form state에 채운다.
- controlled input: `title`, `body`, `category`, `tags`, `isPublic` 값을 React state로 관리한다.
- loading/error state: 기존 글을 불러오는 동안 `isPostLoading`, 실패 시 `error`를 보여준다.
- `useNavigate`: 수정 성공 후 상세 화면으로 이동한다.

### 이번 구현에서 나온 백엔드 개념

- `PATCH`: 기존 resource 일부 또는 전체를 수정할 때 쓰는 HTTP method다.
- `PostUpdateRequest`: 프론트가 보내는 수정 요청 body의 DTO다.
- repository: SQLAlchemy로 실제 DB row를 수정한다.
- service: request 검증과 응답 변환 흐름을 관리한다.
- transaction: posts 수정, post_tags 삭제, post_tags 재생성을 하나의 commit으로 묶는다.
- N:M 관계 갱신: 게시글-태그는 `post_tags` 연결 테이블을 지우고 다시 만드는 방식으로 처리했다.

### 아직 백엔드 연결 후 보완할 부분

- 실제 로그인 사용자 기준 작성자 권한 검사
- 관리자 수정 권한 처리
- 비공개 글 상세/수정 권한 분리
- 수정 이력 또는 감사 로그 저장 여부 결정
- 자동화 테스트 도입 시 `httpx` 또는 적절한 FastAPI test dependency 정리

## 2026-06-14 게시글 목록/상세 API 전환 학습

이번 구현은 React 화면이 `mockData.ts`만 보던 상태에서 백엔드 `GET /posts`, `GET /posts/{post_id}` 응답을 직접 보도록 바꾼 작업이다.

### 수정한 파일과 역할

| 파일 | 역할 |
| --- | --- |
| `frontend/src/app/api/posts.ts` | 게시글 작성뿐 아니라 목록/상세 조회 API 호출 함수를 모아둔다. |
| `frontend/src/app/pages/posts/Posts.tsx` | 검색어와 카테고리를 백엔드 query string으로 보내고 API 응답 목록을 렌더링한다. |
| `frontend/src/app/pages/posts/PostDetail.tsx` | URL id를 읽어 백엔드 상세 API를 호출하고, 댓글 API와 함께 화면을 구성한다. |
| `frontend/src/app/pages/posts/PostEdit.tsx` | 게시글 생성 후 API가 돌려준 id를 이용해 상세 페이지로 이동한다. |

### 목록 화면 흐름

```txt
Posts.tsx
-> selectedCategory, keyword state 변경
-> useEffect 실행
-> getPosts({ category, keyword, page, size })
-> GET /posts?category=...&keyword=...
-> postItems state에 API 응답 저장
-> 카드 목록 렌더링
```

### 상세 화면 흐름

```txt
PostDetail.tsx
-> useParams로 id 읽기
-> useEffect 실행
-> getPostDetail(id)
-> GET /posts/{id}
-> post state에 API 응답 저장
-> content, tags, relatedCommit 렌더링
-> 별도 useEffect로 댓글 목록도 GET /posts/{id}/comments 호출
```

### 이번 구현에서 나온 React Hook

- `useEffect`: 화면이 처음 열리거나 `keyword`, `selectedCategory`, `id`가 바뀔 때 API를 다시 호출한다.
- `useState`: API 응답 목록, 로딩 상태, 에러 상태를 저장한다.
- `useSearchParams`: 카테고리 탭 상태를 URL query string에 저장한다.
- `useParams`: 상세 화면에서 URL id를 읽는다.

### mock data에서 API data로 넘어갈 때 달라진 점

- 예전에는 `posts.filter(...)`로 브라우저 안에서 필터링했다.
- 지금은 `GET /posts?category=...&keyword=...`로 백엔드에 조건을 보내고, DB 조회 결과를 받는다.
- 새 글 작성 후 DB에 저장된 id를 이용해 `/posts/{id}` 상세로 바로 이동할 수 있다.

### 아직 남은 부분

- 게시글 수정/삭제는 아직 mock이다.
- AI 추천 관련 기록은 아직 mock data를 참고한다.
- 실제 로그인 사용자 기준 작성자/권한 처리는 JWT/OAuth2 후 연결한다.

## 2026-06-14 게시글 작성 API와 글쓰기 화면 연결 학습

이번 구현은 `/posts/new` 화면의 발행 버튼을 실제 `POST /posts` API에 연결한 작업이다. JWT/OAuth2 전 단계라 작성자는 demo user로 임시 처리한다.

### 수정한 파일과 역할

| 파일 | 역할 |
| --- | --- |
| `backend/app/schemas/post.py` | 게시글 작성 request body인 `PostCreateRequest`와 게시글 응답 schema를 정의한다. |
| `backend/app/repositories/post_repository.py` | demo 작성자 조회, 카테고리 조회, 태그 생성/재사용, 게시글 저장을 담당한다. |
| `backend/app/services/post_service.py` | 제목/본문 검증, summary 생성, 태그 정리, repository 호출, 응답 변환을 담당한다. |
| `backend/app/routers/posts.py` | `POST /posts` endpoint와 HTTP status code를 담당한다. |
| `frontend/src/app/api/posts.ts` | 프론트에서 게시글 작성 API를 호출하는 fetch 함수를 둔다. |
| `frontend/src/app/pages/posts/PostEdit.tsx` | 글쓰기 form state를 API payload로 바꿔 `createPost`를 호출한다. |

### 코드 읽는 순서

```txt
PostEdit.tsx 발행하기 버튼
-> createPost(payload)
-> POST /posts
-> routers/posts.py
-> services/post_service.py
-> repositories/post_repository.py
-> posts, tags, post_tags 테이블 저장
-> PostDetailResponse
-> PostEdit notice 표시 후 /posts 이동
```

### 이번 구현에서 나온 개념

- `POST /posts`: 게시글 collection에 새 게시글을 만든다는 REST 표현이다.
- `categorySlug`: 프론트는 카테고리 label이 아니라 slug를 백엔드에 보낸다.
- `tags`와 `post_tags`: 태그 기준 데이터와 게시글-태그 연결 데이터는 분리된다.
- `summary`: 프론트가 보내지 않으면 service에서 본문 앞부분으로 만든다.
- `db.commit()`: posts, tags, post_tags 변경을 하나의 transaction으로 확정한다.
- `response_model`: Swagger와 실제 응답 모양을 `PostDetailResponse`로 맞춘다.

### 지금 한계

- 새 글은 DB에 저장되지만, `/posts`와 `/posts/:id` 화면은 아직 mock data 중심이라 생성된 글이 화면 목록/상세에 바로 자연스럽게 보이지 않는다.
- 다음 단계에서 게시글 목록/상세 화면을 API 응답 중심으로 바꾸면 생성된 글도 화면에서 확인할 수 있다.
- 수정/삭제는 아직 mock이며, `PATCH /posts/{id}`, `DELETE /posts/{id}` 단계에서 구현한다.

## 2026-06-13 댓글 작성 API와 프론트 연결 학습

이번 구현은 게시글 상세 화면의 댓글 작성 버튼을 실제 FastAPI POST API에 연결한 작업이다. JWT/OAuth2 전 단계라 작성자는 demo user로 임시 처리한다.

### 수정한 파일과 역할

| 파일 | 역할 |
| --- | --- |
| `backend/app/schemas/comment.py` | 프론트가 보내는 댓글 작성 request body와 백엔드가 돌려주는 response 모양을 정의한다. |
| `backend/app/repositories/comment_repository.py` | SQLAlchemy로 demo user를 조회하고 comments 테이블에 새 댓글을 INSERT한다. |
| `backend/app/services/comment_service.py` | 게시글 존재 확인, 공백 댓글 검증, demo user 선택, 응답 변환 흐름을 담당한다. |
| `backend/app/routers/comments.py` | `POST /posts/{post_id}/comments` HTTP endpoint를 만들고 status code를 결정한다. |
| `frontend/src/app/api/comments.ts` | 프론트에서 댓글 조회/작성 API를 호출하는 fetch 함수를 모아둔다. |
| `frontend/src/app/pages/posts/PostDetail.tsx` | 댓글 입력값을 상태로 관리하고 작성 버튼 클릭 시 백엔드 API를 호출한다. |

### 코드 읽는 순서

```txt
PostDetail.tsx 댓글 작성 버튼
-> createPostComment(postId, content)
-> POST /posts/{post_id}/comments
-> routers/comments.py
-> services/comment_service.py
-> repositories/comment_repository.py
-> comments 테이블 INSERT
-> CommentItemResponse
-> PostDetail comments state에 추가
```

### 이번 구현에서 나온 개념

- `POST`: 서버에 새 데이터를 만들 때 쓰는 HTTP method다.
- `201 Created`: 새 댓글 row가 DB에 만들어졌다는 응답이다.
- `request body`: 프론트가 JSON으로 보내는 데이터다. 이번에는 `{ "content": "..." }`만 보낸다.
- `Pydantic schema`: request/response의 모양을 검증하고 Swagger 문서에도 보여준다.
- `repository`: DB query와 INSERT를 담당한다.
- `service`: 게시글 존재 여부, 공백 댓글 여부, demo user 선택 같은 비즈니스 판단을 담당한다.
- `router`: HTTP path, status code, 에러 응답을 담당한다.
- `useState`: 댓글 입력값, 에러 문구, 작성 중 상태, 댓글 목록 상태를 저장한다.
- `async/await`: 댓글 작성 API 응답을 기다린 뒤 화면 state를 갱신한다.

### JWT/OAuth2 후 바뀔 부분

지금은 댓글 작성자가 항상 `demo.student@junglelog.local`이다. 로그인 구현 후에는 router에서 `Depends(get_current_user)` 같은 의존성을 받아 현재 로그인 사용자를 가져오고, 그 사용자의 `id`를 `comments.author_id`에 저장해야 한다.

즉 지금 구조는 아래처럼 바뀔 예정이다.

```txt
현재: demo user 조회 -> comments.author_id 저장
나중: JWT token 해석 -> current_user.id 저장
```

## 2026-06-06 React Mock UI 안정화와 프로젝트 구조 정리

이번 작업은 백엔드 연결 전 React mock UI 단계에서 화면 흐름을 안정화하고, 프로젝트 폴더를 도메인별로 정리한 작업이다.

## 수정한 주요 파일

| 파일 | 역할 |
| --- | --- |
| `frontend/src/app/routes.tsx` | URL path와 page component를 연결하는 라우트 정의 |
| `frontend/src/app/pages/dashboard/Dashboard.tsx` | 학생/코치 대시보드 화면 |
| `frontend/src/app/pages/posts/Posts.tsx` | 전체 게시글 목록, 카테고리 필터, 검색 |
| `frontend/src/app/pages/posts/PostDetail.tsx` | 게시글 상세, 삭제 mock, 댓글 mock |
| `frontend/src/app/pages/posts/PostEdit.tsx` | 게시글 작성/수정 mock form |
| `frontend/src/app/pages/posts/MyRecords.tsx` | 내 기록 필터와 검색 |
| `frontend/src/app/pages/portfolio/Portfolio.tsx` | GitHub 프로젝트 등록, 기록 연결, 포트폴리오 상태 관리 |
| `frontend/src/app/pages/ai/AIAssistant.tsx` | 프로젝트 기반 AI 도우미 mock 화면 |
| `frontend/src/app/pages/coach/CoachReview.tsx` | 학생 리뷰 요청 화면과 코치 인박스 화면 |
| `frontend/src/app/pages/auth/Login.tsx` | Google 로그인 mock 화면 |
| `frontend/src/app/pages/settings/Settings.tsx` | 설정 mock 화면 |
| `frontend/src/app/data/mockData.ts` | 화면에서 쓰는 mock posts, projects, reviewRequests, notifications |
| `docs/project-structure.md` | 프로젝트 폴더 역할 정리 |
| `docs/react-mock-ui-boundary.md` | mock UI 단계와 백엔드 이후 구현 범위 구분 |
| `README.md` | 현재 구현 상태, 라우트, 실행 방법 정리 |

## 이번 구현에서 사용한 React 개념

### Component

React 화면은 여러 component로 나뉜다.
예를 들어 `Posts`, `PostDetail`, `Portfolio`, `AIAssistant`는 각각 하나의 page component다.

### State

`useState`는 화면에서 바뀌는 값을 저장한다.

이번 작업에서 state로 관리한 예:

- 검색어: `keyword`
- 선택한 카테고리: `selectedCategory`
- 선택한 포트폴리오 프로젝트: `selectedProjectId`
- 연결할 게시글 id 목록: `selectedPostIds`
- 댓글 입력값: `commentInput`
- 코치 리뷰 요청 목록: `requests`

### Derived Data

`useMemo`는 state와 mock data를 바탕으로 계산된 목록을 만든다.

예:

- 검색어와 카테고리로 필터링된 게시글 목록
- 선택한 프로젝트에 연결된 게시글 목록
- 코치 리뷰 인박스 검색 결과

### Controlled Input

input, textarea, select의 값은 React state와 연결했다.

예:

```tsx
<Input value={keyword} onChange={(event) => setKeyword(event.target.value)} />
```

이 구조를 이해하면 검색창, 글쓰기 폼, select 필터가 어떻게 동작하는지 읽을 수 있다.

### React Router

`routes.tsx`에서 URL과 화면 component를 연결한다.

예:

- `/posts` -> `Posts`
- `/posts/:id` -> `PostDetail`
- `/portfolio` -> `Portfolio`
- `/ai-assistant` -> `AIAssistant`

`useParams`는 `/posts/:id`의 id 값을 읽을 때 사용한다.
`useSearchParams`는 `/posts?category=learning-log` 같은 query string을 읽고 바꿀 때 사용한다.
`useNavigate`는 버튼 클릭 후 다른 페이지로 이동할 때 사용한다.

### Conditional Rendering

조건에 따라 다른 UI를 보여준다.

예:

- role이 `STUDENT`면 학생용 코치 리뷰 요청 화면
- role이 `COACH`면 코치 리뷰 인박스
- 게시글 id가 없으면 “게시글을 찾을 수 없습니다”
- 대기 중인 리뷰 요청만 취소 버튼 표시

## 이번 구현에서 사용한 TypeScript 개념

### Union Type

몇 가지 값만 허용해야 할 때 union type을 쓴다.

예:

```ts
export type UserRole = "STUDENT" | "COACH";
export type ReviewStatus = "대기 중" | "검토 중" | "피드백 완료" | "수정 요청" | "최종 확인";
```

이렇게 작성하면 잘못된 문자열을 상태로 넣는 실수를 줄일 수 있다.

### Type Import

값이 아니라 타입만 가져올 때는 `type` import를 쓴다.

예:

```ts
import { posts, type CategorySlug } from "../../data/mockData";
```

### Array Type

여러 개의 id나 tag를 state로 관리할 때 배열 타입을 사용한다.

예:

```ts
const [selectedPostIds, setSelectedPostIds] = useState<number[]>([]);
```

## 코드 흐름 이해 포인트

### 게시글 목록 검색 흐름

```txt
검색창 입력
-> keyword state 변경
-> posts.filter 실행
-> 제목, 요약, 태그, 카테고리, 작성자 기준으로 필터링
-> 필터링된 목록 렌더링
```

### 게시글 상세 흐름

```txt
/posts/:id 접속
-> useParams로 id 읽기
-> mock posts에서 id가 같은 글 찾기
-> 글 내용 렌더링
-> 댓글 작성 시 comments state에 추가
-> 삭제 확인 시 mock 안내 후 /posts로 이동
```

### 포트폴리오 관리 흐름

```txt
GitHub repo URL 입력
-> GitHub 프로젝트 등록 버튼 클릭
-> projects state에 mock project 추가
-> 프로젝트 카드 선택
-> 기록 연결하기 클릭
-> mock posts 체크
-> 연결 완료 시 selected project의 linkedPostIds 변경
-> AI 도우미로 이동
```

### AI 도우미 흐름

```txt
내 프로젝트 선택
-> 선택된 portfolioProject 찾기
-> linkedPostIds로 연결 기록 찾기
-> GitHub 정보와 JungleLog 기록을 참고 자료 패널에 표시
-> 포트폴리오 글 또는 면접 예상 질문 mock 결과 표시
-> 포트폴리오 초안으로 mock 저장
```

### 코치 리뷰 흐름

```txt
STUDENT
-> 리뷰 대상 선택
-> 코치 여러 명 선택
-> 요청 메시지 입력
-> 리뷰 요청 생성
-> 대기 중 요청은 취소 가능

COACH
-> 리뷰 요청 인박스 확인
-> 학생/제목/카테고리/메시지 검색
-> 요청 선택
-> 피드백 작성
-> 검토 중 / 수정 요청 / 피드백 완료 / 최종 확인 상태 변경
```

## 백엔드와 연결될 부분

현재는 모두 mock UI라 새로고침하면 변경된 화면 상태가 사라진다.

나중에 백엔드와 연결할 부분:

- 로그인 사용자 정보와 role
- 게시글 작성 / 수정 / 삭제
- 댓글 작성 / 삭제
- 게시글 검색과 페이징
- 포트폴리오 프로젝트 등록 / 조회 / 수정
- 프로젝트와 게시글 연결 저장
- 코치 리뷰 요청 생성 / 취소 / 상태 변경
- 알림 목록 조회
- GitHub repo 분석
- OpenAI 생성 결과 저장
- RAG 검색
- MCP tool 호출
- Agent 실행 루프

## 내가 이해해야 할 핵심 포인트

- 지금 화면에서 바뀌는 데이터는 대부분 `useState`에 저장된다.
- `mockData.ts`는 임시 DB처럼 쓰이고 있지만 실제 저장소는 아니다.
- URL과 화면 연결은 `routes.tsx`에서 한다.
- `RoleGate`는 현재 mock role로 접근 제한을 보여준다.
- 실제 서비스에서는 role을 local state가 아니라 JWT와 백엔드 인증 결과로 판단해야 한다.
- AI 도우미는 직접 입력이 아니라 포트폴리오 관리에 등록된 프로젝트를 기반으로 동작한다.
- README는 생성 대상이 아니라 GitHub에서 가져온 참고 자료로만 사용한다.

## 추가로 공부할 키워드

- React component
- React state
- controlled input
- conditional rendering
- React Router
- `useParams`
- `useSearchParams`
- `useNavigate`
- TypeScript union type
- TypeScript type import
- mock data와 API 응답의 차이
- JWT 인증
- FastAPI router
- PostgreSQL CRUD
- RAG
- MCP
- OpenAI function calling
- AI Agent loop

## 2026-06-06 진행 관리 방식 정리

이번에 `docs/agent/log.md`를 추가해서 Trello의 전체 TODO 흐름과 프로젝트 내부 기록을 맞춰 관리하기로 했다.

### 왜 docs/agent/log.md를 만들었는가

- Trello는 진행 상황을 보기 좋게 관리하는 도구다.
- `docs/agent/log.md`는 프로젝트 저장소 안에서 현재 단계, 완료 기준, 다음 단계를 기록하는 문서다.
- Trello가 바뀌거나 기억이 흐려져도 저장소 안의 문서만 보면 현재 어디까지 왔는지 확인할 수 있다.

### 앞으로 진행하는 방식

1. 사용자가 "다음 거 가보자"라고 말하면 현재 단계의 완료 기준을 먼저 확인한다.
2. 완료 기준을 통과하면 다음 단계의 목표와 체크리스트를 안내한다.
3. 통과하지 못한 항목이 있으면 다음 단계로 넘어가기 전에 보완한다.
4. 진행 중 계획이 바뀌면 Trello와 `docs/agent/log.md`에 같이 반영한다.
5. 구현이 끝나면 `README.md`와 `docs/agent/study.md`를 같이 업데이트한다.

### 현재 단계 판단

- 0단계 프로젝트 환경 세팅 및 문서 기준 정리: 완료
- 1단계 React mock UI 안정화: 완료
- 2단계 React 코드 이해 및 학습 정리: 진행 중

### 내가 이해해야 할 포인트

- 기능 구현만큼 중요한 것이 현재 단계의 완료 기준을 명확히 아는 것이다.
- React 화면을 더 만들기 전에 지금 만든 코드가 어떤 개념으로 돌아가는지 이해해야 한다.
- 다음 백엔드 단계로 넘어가기 전에 mock data와 실제 API 응답의 차이를 설명할 수 있어야 한다.

## 2026-06-06 2단계 React 코드 읽기 시작

2단계는 기능을 더 만드는 단계가 아니라, 지금 만든 React mock UI를 내가 직접 설명할 수 있게 만드는 단계다.

### 읽을 순서

1. `routes.tsx`에서 URL과 Page Component 연결을 본다.
2. `MainLayout.tsx`에서 전체 레이아웃, role state, 알림 드롭다운을 본다.
3. `RoleGate.tsx`에서 접근 제한 UI를 본다.
4. `mockData.ts`에서 화면이 쓰는 데이터 구조를 본다.
5. `Posts.tsx`, `PostDetail.tsx`, `PostEdit.tsx`, `MyRecords.tsx`에서 게시글 흐름을 본다.
6. `Portfolio.tsx`, `AIAssistant.tsx`에서 포트폴리오와 AI 도우미 연결 흐름을 본다.
7. `CoachReview.tsx`, `Dashboard.tsx`에서 STUDENT / COACH 역할 분기를 본다.

### 오늘 확인한 핵심 구조

- `routes.tsx`는 URL과 화면 컴포넌트를 연결한다.
- `MainLayout`은 현재 role과 공통 레이아웃을 관리한다.
- `RoleGate`는 허용된 role이 아니면 접근 제한 화면을 보여준다.
- `mockData.ts`는 지금 단계에서 임시 DB처럼 쓰인다.
- 게시글 목록은 `useSearchParams`와 `filter`로 카테고리/검색어를 처리한다.
- 게시글 상세는 `useParams`로 URL의 id를 읽고 `posts.find`로 데이터를 찾는다.
- 포트폴리오 관리는 `projects` state로 프로젝트 선택, 등록, 기록 연결을 mock 처리한다.
- AI 도우미는 선택된 프로젝트와 연결된 기록을 참고 자료처럼 보여준다.
- 코치 리뷰는 role에 따라 학생용 요청 화면과 코치용 인박스 화면으로 나뉜다.

## 2026-06-11 문서 구조와 키워드 문서 정리

### 정리한 이유

문서가 많아지면서 실제로 계속 참고해야 하는 문서와 과거 단계 안내 문서가 섞였다.
앞으로는 `docs/agent` 안의 핵심 문서만 보고 진행한다.

### 남긴 문서

| 파일 | 역할 |
| --- | --- |
| `agent.md` | agent 문서 폴더 안내 |
| `code.md` | 구현 전 확인하는 코드 컨벤션 |
| `log.md` | 단계 진행 상황과 완료 기준 |
| `study.md` | 구현을 이해하기 위한 학습 기록 |
| `test.md` | 구현 후 반복 실행하는 자체 QA 체크리스트 |
| `troubleshooting.md` | QA 중 발견한 실제 문제와 해결 과정 기록 |
| `front-keyword.md` | 프론트엔드 키워드 정리 |
| `back-keyword.md` | 백엔드/Trello 공용 키워드 정리 |

### 제거한 문서

- `LOG.md`: `docs/agent/log.md` 안내만 하던 중복 파일
- `docs/code.md`: `docs/agent/code.md` 안내만 하던 중복 파일
- `docs/study.md`: `docs/agent/study.md` 안내만 하던 중복 파일
- `docs/agent/stage-2-react-code-reading.md`: 2단계 완료 후 `study.md` 기록으로 흡수

### 앞으로 키워드 기록 방식

- 프론트 구현에서 나온 키워드는 `front-keyword.md`에 기록한다.
- 백엔드 구현과 Trello 공용 키워드는 `back-keyword.md`에 기록한다.
- 키워드는 단순 정의가 아니라 "우리 프로젝트 어디에 쓰였는가"까지 적는다.

### test.md와 troubleshooting.md의 차이

- `test.md`는 Codex가 구현 후 직접 여러 번 돌려보는 QA 체크리스트다.
- `troubleshooting.md`는 QA 중 실제로 발견한 문제의 증상, 원인, 해결을 남기는 기록장이다.
- 앞으로 문제를 먼저 `test.md`에 쓰는 것이 아니라, `test.md` 기준으로 검증하고 발견된 문제만 `troubleshooting.md`에 정리한다.

## 2026-06-10 헤더 검색 제거와 검증 문서 정리

### 수정한 파일

| 파일 | 역할 |
| --- | --- |
| `frontend/src/app/layouts/MainLayout.tsx` | 공통 레이아웃, 사이드바, 헤더, 알림 드롭다운, role state 관리 |
| `docs/agent/test.md` | 화면에서 반복 검증할 QA 체크리스트 |
| `README.md` | 현재 구현 상태와 mock UI 동작 범위 정리 |

### 왜 제거했는가

`MainLayout.tsx` 헤더의 검색창은 화면에는 보였지만 검색어 state, submit handler, `navigate`, 검색 결과 화면 연결이 없었다.
이런 UI는 사용자가 눌렀을 때 아무 반응이 없어서 기능이 있는 것처럼 오해하게 만든다.

현재 검색은 각 페이지 안에서만 동작한다.

- 전체 게시글: `Posts.tsx`
- 내 기록: `MyRecords.tsx`
- 포트폴리오 프로젝트: `Portfolio.tsx`
- 코치 리뷰 요청: `CoachReview.tsx`

그래서 지금 단계에서는 헤더 전역 검색을 구현하지 않고 제거했다.

### 관련 코드 흐름

`MainLayout.tsx`에서 제거한 것:

- `lucide-react`의 `Search` import
- 공통 `Input` import
- `<header>` 안의 전역 검색 UI

남긴 것:

- 알림 드롭다운
- role 전환
- STUDENT 글쓰기 버튼
- COACH 리뷰 인박스 버튼

### 배운 개념

- 보이는 UI는 실제 동작과 연결되어야 한다.
- 기능이 아직 없다면 mock으로라도 반응을 만들거나, 지금 단계에서 제거해야 한다.
- 사용하지 않는 import는 빌드에는 통과할 수 있어도 코드 이해를 방해한다.
- `test.md`의 수동 QA 체크리스트는 나중에 Vitest와 React Testing Library 테스트 케이스로 바꿀 수 있다.

### 나중에 자동 테스트로 바꿀 수 있는 기준

- 알림 아이콘을 클릭하면 알림 목록이 보여야 한다.
- 헤더에는 동작하지 않는 검색창이 없어야 한다.
- `/posts` 검색창에 검색어를 입력하면 게시글 목록이 줄어야 한다.
- STUDENT와 COACH는 같은 `/`에 들어가도 서로 다른 대시보드 내용을 봐야 한다.

### 백엔드 연결 후 구현 예정

- 전역 검색이 필요하면 `MainLayout`에서 검색어를 받아 `/posts?keyword=...`로 이동하게 만든다.
- 이후 백엔드에서는 DB full-text search 또는 검색 API로 실제 데이터를 조회한다.

## 2026-06-11 코치 리뷰 피드백 흐름 정리

### 수정한 파일

| 파일 | 역할 |
| --- | --- |
| `frontend/src/app/pages/coach/CoachReview.tsx` | 학생 리뷰 요청 화면과 코치 리뷰 인박스 화면을 role에 따라 분기 |
| `README.md` | 코치 피드백 전송 mock 흐름 반영 |

### 왜 수정했는가

기존 구조에서는 `StudentReviewView`와 `CoachInboxView`가 각각 `requests` state를 따로 가지고 있었다.
그래서 코치가 인박스에서 피드백과 상태를 수정해도 학생의 "내가 보낸 요청 목록"에는 이어지지 않았다.

정확한 목표는 학생과 코치가 같은 목록을 그대로 보는 것이 아니다.
같은 원본 `requests` state를 공유하되, 화면별로 필요한 요청만 필터링해서 보는 것이다.

### 핵심 변경

`requests` state를 부모 컴포넌트인 `CoachReview`로 끌어올렸다.

```tsx
const [requests, setRequests] = useState<ReviewRequest[]>(reviewRequests);
```

그리고 학생 화면과 코치 화면에 props로 전달한다.

```tsx
<StudentReviewView requests={requests} setRequests={setRequests} />
<CoachInboxView requests={requests} setRequests={setRequests} />
```

### 이번에 사용한 React 개념

- state lifting: 여러 자식 컴포넌트가 같은 상태를 봐야 할 때 상태를 공통 부모로 올린다.
- props: 부모가 가진 상태와 setter를 자식에게 전달한다.
- controlled textarea: `feedback` state와 `Textarea` 입력값을 연결한다.
- 조건부 렌더링: `feedbackNotice`가 있을 때만 안내 문구를 보여준다.

### 피드백과 댓글의 차이

- 코치 리뷰 피드백은 리뷰 요청에 대한 공식 응답이다.
- 게시글 댓글은 원문 게시글 아래에 남기는 일반 대화다.
- 현재 mock UI에서는 피드백을 리뷰 요청에만 저장한다.
- 원문 댓글 자동 등록은 백엔드 연결 후 옵션 기능으로 구현할 수 있다.

### 학생 목록과 코치 인박스 필터링

학생 화면은 내가 보낸 요청만 본다.

```tsx
requests.filter((request) => request.requesterId === "student-1")
```

코치 화면은 현재 코치에게 배정된 요청만 먼저 본다.

```tsx
const currentCoachId = "coach-1";

requests.filter((request) => request.coachIds.includes(currentCoachId))
```

그 다음 코치 인박스에서 검색어, 카테고리, 상태 필터를 추가로 적용한다.

### 백엔드 연결 후 구현 예정

- 코치 리뷰 피드백 저장 API
- 학생별 리뷰 요청 조회 API
- 알림 API와 연동해서 "코치 피드백 도착" 알림 생성
- 선택적으로 "원문 댓글에도 남기기" 기능 구현

## 2026-06-11 FastAPI 설정 분리

### 수정한 파일

| 파일 | 역할 |
| --- | --- |
| `backend/app/core/config.py` | `.env` 설정값을 읽어 `settings` 객체로 제공 |
| `backend/app/main.py` | FastAPI 앱 생성, CORS 설정, router 등록 |
| `backend/.env.example` | 팀원이 따라 만들 수 있는 환경변수 샘플 |
| `backend/requirements.txt` | 백엔드 Python 패키지 목록 |
| `docs/agent/setup.md` | 백엔드 세팅 명령어 기록 |
| `docs/agent/back-keyword.md` | Configuration, CORS, pydantic-settings 키워드 정리 |

### 왜 설정을 분리했는가

처음에는 `main.py`에 앱 이름과 CORS origin을 직접 적었다.
하지만 로컬, 배포, 팀원 환경마다 설정값이 달라질 수 있으므로 코드에 직접 박아두면 유지보수가 어려워진다.

그래서 `.env`에 설정값을 두고, `config.py`에서 `settings`로 읽게 했다.

### 코드 흐름

```txt
backend/.env
-> config.py의 Settings
-> settings.app_name
-> main.py의 FastAPI(title=...)
```

```txt
backend/.env
-> settings.backend_cors_origins
-> main.py의 CORSMiddleware allow_origins
```

### 이번에 사용한 백엔드 개념

- environment variable: 환경마다 달라지는 값을 코드 밖에 둔다.
- configuration: 앱 설정값을 한 곳에서 관리한다.
- pydantic-settings: `.env` 값을 Pydantic 기반 설정 객체로 읽는다.
- CORS: React dev server가 FastAPI server에 요청할 수 있게 허용한다.
- `.env.example`: 실제 secret 없이 필요한 환경변수 목록만 공유한다.

### 내가 이해해야 할 포인트

- `.env`는 실제 로컬 설정이라 Git에 올리지 않는다.
- `.env.example`은 팀원 공유용이라 Git에 올린다.
- `main.py`는 하드코딩된 설정 대신 `settings`를 가져다 쓴다.
- 나중에 DB URL, JWT secret, OpenAI key도 같은 방식으로 설정에 추가한다.

## 2026-06-11 PostgreSQL Docker 실행

### 확인한 파일

| 파일 | 역할 |
| --- | --- |
| `docker-compose.yml` | PostgreSQL 컨테이너 실행 설정 |
| `docs/agent/setup.md` | Docker/PostgreSQL 실행 명령어 기록 |
| `docs/agent/back-keyword.md` | PostgreSQL, Docker Compose 키워드 정리 |

### 왜 Docker로 PostgreSQL을 실행하는가

PostgreSQL을 로컬 컴퓨터에 직접 설치하지 않아도, Docker 컨테이너로 진짜 PostgreSQL을 실행할 수 있다.
팀원도 같은 `docker-compose.yml`을 사용하면 같은 DB 버전과 같은 초기 설정으로 개발할 수 있다.

### docker-compose.yml 읽는 법

```txt
image: postgres:16
-> PostgreSQL 16 사용

container_name: junglelog-postgres
-> 컨테이너 이름

POSTGRES_DB / USER / PASSWORD
-> 처음 생성되는 DB와 접속 계정

5432:5432
-> 내 컴퓨터 localhost:5432를 컨테이너 PostgreSQL 5432에 연결

postgres_data
-> 컨테이너를 껐다 켜도 DB 데이터를 유지하는 volume
```

### 실행 결과

```powershell
docker compose up -d
docker ps
docker logs junglelog-postgres
```

확인한 결과:

- `junglelog-postgres` 컨테이너가 `Up` 상태
- `0.0.0.0:5432->5432/tcp` 포트 매핑 확인
- 로그에서 `database system is ready to accept connections` 확인
- `week15_ai_board_postgres_data` volume 생성 확인

### 다음에 연결할 값

FastAPI에서 사용할 DB 연결 문자열은 아래 형태가 된다.

```txt
postgresql+psycopg://junglelog:junglelog@localhost:5432/junglelog
```

이 값은 다음 단계에서 `.env`의 `DATABASE_URL`로 추가한다.

## 2026-06-11 FastAPI와 PostgreSQL 연결

### 수정한 파일

| 파일 | 역할 |
| --- | --- |
| `backend/.env` | 로컬에서 실제로 사용할 `DATABASE_URL` 저장 |
| `backend/.env.example` | 팀원이 따라 만들 수 있는 DB 연결 문자열 예시 |
| `backend/app/core/config.py` | `.env`의 `DATABASE_URL`을 `settings.database_url`로 읽음 |
| `backend/app/db/session.py` | SQLAlchemy engine, session factory, FastAPI DB dependency 구성 |
| `backend/app/routers/health.py` | `/health/db` endpoint로 DB 연결 확인 |
| `backend/requirements.txt` | SQLAlchemy, psycopg 설치 기록 |

### 전체 흐름

```txt
docker-compose.yml
-> PostgreSQL 컨테이너 실행
-> .env의 DATABASE_URL
-> config.py의 settings.database_url
-> db/session.py의 create_engine
-> get_db()
-> health.py의 Depends(get_db)
-> db.execute(text("SELECT 1"))
```

### session.py 코드 흐름

```txt
engine
-> PostgreSQL 연결 관리자

SessionLocal
-> 요청마다 DB session을 만들어주는 공장

get_db()
-> API 함수에 DB session을 빌려주고, 요청이 끝나면 닫아주는 함수
```

`yield db`를 쓰는 이유는 API 함수가 DB session을 사용한 뒤 다시 `get_db()`로 돌아와 `finally`의 `db.close()`를 실행하기 위해서다.

### 이번에 사용한 백엔드 개념

- SQLAlchemy: Python에서 DB 연결과 쿼리를 다루는 도구
- psycopg: Python과 PostgreSQL 사이의 실제 통신 드라이버
- DATABASE_URL: DB 접속 정보를 하나의 문자열로 표현한 값
- engine: DB 연결을 관리하는 SQLAlchemy 객체
- session: 요청 하나에서 사용하는 DB 작업 단위
- dependency injection: FastAPI가 `Depends(get_db)`를 보고 필요한 값을 함수에 넣어주는 방식
- `SELECT 1`: DB 연결이 살아 있는지 확인하는 가장 단순한 SQL

### 내가 이해해야 할 포인트

- `Session`은 로그인 세션이 아니라 DB 작업 세션이다.
- API 요청마다 DB session을 열고, 요청이 끝나면 닫는 구조가 기본이다.
- 실제 게시글 CRUD에서도 라우터 함수는 `db: Session = Depends(get_db)` 형태로 DB에 접근하게 된다.
- `/health/db`는 기능 API가 아니라 DB 연결 상태를 확인하는 진단용 API다.

### 검증 결과

- `GET /health` 응답 확인
- `GET /health/db` 응답 확인
- `/openapi.json`에서 `/health`, `/health/db` path 확인
- Docker `junglelog-postgres` 컨테이너 `Up` 상태 확인
- `python -m compileall app`로 백엔드 문법/import 검증 통과

### 다음에 이어질 내용

- DB 테이블 구조 설계
- Primary Key / Foreign Key
- SQLAlchemy model
- ERD
- 게시글 CRUD API

## 2026-06-11 ERD v1 초안 설계

### 수정한 파일

| 파일 | 역할 |
| --- | --- |
| `docs/agent/db-design.md` | dbdiagram.io에 붙여넣을 DBML과 테이블 관계 설명 |
| `docs/agent/agent.md` | agent 문서 목록에 `db-design.md` 추가 |
| `docs/agent/log.md` | 4단계 진행 기록에 ERD v1 초안 작성 추가 |

### v1에서 설계한 범위

ERD v1은 AI 기능을 제외하고 기본 서비스 데이터만 다룬다.

- 사용자
- 게시글
- 댓글
- 태그
- 포트폴리오 프로젝트
- 프로젝트와 게시글 연결
- 코치 리뷰 요청
- 코치 배정
- 알림

### 이번에 사용한 DB 개념

- Entity: 서비스에서 오래 저장해야 하는 핵심 대상이다. 예: user, post, comment.
- Primary Key: 각 행을 구분하는 고유 id다.
- Foreign Key: 다른 테이블의 행을 가리키는 연결 id다.
- 1:N 관계: 사용자 한 명이 여러 게시글을 작성하는 관계다.
- N:M 관계: 게시글과 태그처럼 양쪽 모두 여러 개로 연결될 수 있는 관계다.
- Junction Table: N:M 관계를 풀기 위해 두 테이블 사이에 두는 연결 테이블이다.
- Normalization: 중복을 줄이고 관계를 명확하게 나누는 설계 방식이다.

### 중요한 설계 판단

- 학생과 코치는 `users.role`로 구분한다.
- 카테고리는 `post_categories` 테이블로 분리했다.
- 게시글과 태그는 `post_tags` 연결 테이블로 묶는다.
- 포트폴리오 프로젝트와 게시글은 `portfolio_project_posts` 연결 테이블로 묶는다.
- 리뷰 요청은 여러 코치에게 갈 수 있으므로 `review_request_coaches` 연결 테이블을 둔다.

### 다음에 같이 결정할 것

- 카테고리를 별도 테이블로 둘지, 문자열 컬럼으로 단순화할지
- 기술 스택을 text로 둘지, 별도 테이블로 분리할지
- 리뷰 요청 대상 구조를 nullable FK 방식으로 둘지, `target_type + target_id` 방식으로 둘지

## 2026-06-11 Google OAuth 로그인 정책 확정

### 수정한 파일

| 파일 | 역할 |
| --- | --- |
| `frontend/src/app/pages/auth/Login.tsx` | 이메일/비밀번호 입력을 제거하고 Google 로그인 mock 버튼으로 변경 |
| `frontend/src/app/routes.tsx` | `/signup` 라우트를 제거하고 `/login`만 남김 |
| `docs/agent/db-design.md` | `users.password_hash` 제거, `google_sub`, `profile_image_url`, `last_login_at` 추가 |
| `README.md` | 인증 흐름과 다음 작업 예정에 Google OAuth 반영 |
| `docs/agent/log.md` | 5단계 이름과 진행 기록에 Google OAuth 반영 |

### 인증 흐름

```txt
사용자가 Google로 로그인
-> Google이 사용자 신원을 확인
-> 백엔드가 google_sub로 users 조회
-> 없으면 STUDENT role로 자동 가입
-> 백엔드가 JungleLog용 JWT 발급
-> 프론트는 JWT로 보호 API 요청
```

### Google OAuth와 JWT의 차이

- Google OAuth는 "이 사람이 실제 Google 계정 주인인가"를 확인한다.
- JWT는 "우리 서비스 API에 접근할 수 있는 로그인 사용자다"를 증명한다.
- Google은 인증 제공자이고, JungleLog 서버는 role과 서비스 권한을 관리한다.

### users 테이블이 바뀐 이유

Google 로그인만 사용하면 자체 비밀번호를 저장하지 않는다.
그래서 `password_hash` 대신 Google 계정의 고유 식별자인 `google_sub`를 저장한다.

### 내가 이해해야 할 포인트

- 이메일은 바뀔 가능성이 있으므로 Google 사용자의 진짜 고유 키는 `google_sub`다.
- 첫 로그인 자동 가입은 `/signup` 화면이나 회원가입 API를 따로 호출하는 방식이 아니라 OAuth callback 처리 중 일어난다.
- 학생/코치 구분은 Google이 해주는 것이 아니라 우리 DB의 `users.role`이 담당한다.
- v1에서 관리자 승인 화면을 만들고, 코치 권한도 운영자가 승인 화면에서 지정한다.
- 첫 관리자만 `ADMIN_EMAILS` 또는 seed script로 부트스트랩한다.

### 백엔드 연결 후 구현 예정

- Google OAuth client id/secret 설정
- OAuth redirect URL과 callback endpoint
- Google id token 검증
- `google_sub` 기준 사용자 조회 또는 생성
- JungleLog access token 발급
- role 기반 API 보호

## 2026-06-11 운영자 승인 구조 v1 반영

### 수정한 파일

| 파일 | 역할 |
| --- | --- |
| `frontend/src/app/data/mockData.ts` | `ADMIN`, `approvalStatus`, 관리자 승인용 mock 사용자 목록 추가 |
| `frontend/src/app/layouts/MainLayout.tsx` | role과 승인 상태 mock 전환, 역할별 사이드바 분기 |
| `frontend/src/app/components/RoleGate.tsx` | role뿐 아니라 `approvalStatus === "승인 완료"`인지 함께 확인 |
| `frontend/src/app/pages/auth/PendingApproval.tsx` | 승인 대기/거절/정지 상태 안내 화면 |
| `frontend/src/app/pages/admin/AdminUsers.tsx` | 관리자 사용자 승인/거절/정지/role 변경 mock 화면 |
| `frontend/src/app/pages/dashboard/Dashboard.tsx` | ADMIN은 대시보드 대신 `/admin/users`로 이동하도록 정리 |
| `docs/agent/db-design.md` | `approval_status`, `approved_by`, `user_approval_logs`, `ADMIN_EMAILS` 설계 반영 |
| `backend/.env.example` | 초기 관리자 이메일 예시 `ADMIN_EMAILS` 추가 |
| `backend/app/core/config.py` | `settings.admin_emails` 설정 추가 |

### 왜 운영자 승인이 필요한가

JungleLog가 정글 내부 서비스라면 Google 계정으로 로그인했다는 사실만으로 서비스 접근을 허용하면 안 된다.
Google OAuth는 신원 확인이고, JungleLog 사용 권한은 운영자가 승인해야 한다.

### 최종 v1 인증/승인 흐름

```txt
Google 로그인
-> google_sub로 사용자 조회
-> 없으면 users 생성
-> ADMIN_EMAILS에 포함된 이메일이면 ADMIN/승인 완료
-> 일반 사용자는 STUDENT/승인 대기
-> 운영자가 /admin/users에서 학생/코치/관리자 역할과 승인 완료 상태로 승인
-> 승인 완료 사용자만 서비스 화면 접근
```

### 이번에 사용한 개념

- authentication: 사용자가 누구인지 확인한다. 우리 프로젝트에서는 Google OAuth가 담당한다.
- authorization: 사용자가 무엇을 할 수 있는지 결정한다. 우리 프로젝트에서는 role과 approval status가 담당한다.
- role-based access control: STUDENT, COACH, ADMIN에 따라 접근 가능한 화면과 API를 나눈다.
- approval workflow: 신규 사용자가 바로 서비스를 쓰지 않고 운영자의 승인을 기다리는 흐름이다.
- seed/bootstrap admin: 첫 관리자를 만들기 위한 초기 설정 방식이다.

### 내가 이해해야 할 포인트

- `role`은 사용자의 종류이고, `approvalStatus`는 서비스 접근 가능 상태다.
- `role=STUDENT`여도 `approvalStatus=승인 대기`이면 게시판에 접근할 수 없다.
- 첫 관리자는 관리자 화면에서 만들 수 없기 때문에 `ADMIN_EMAILS` 같은 초기 부트스트랩 방식이 필요하다.
- 승인/거절/정지 이력은 나중에 `user_approval_logs`에 저장해서 추적할 수 있다.

## 2026-06-11 관리자 승인 UI 방향 정리

### 이번에 정리한 정책

- 화면의 role/승인상태 선택기는 개발용 mock 전환기다. 실제 서비스에서는 Google OAuth 로그인 결과와 DB의 `users.role`, `users.approval_status`로 결정되므로 사용자에게 보이지 않는다.
- 관리자는 기본 메뉴에서 `사용자 승인`만 본다. 관리자의 핵심 역할은 학생/코치 계정을 승인하고 권한을 부여하는 것이다.
- `승인 적용`은 현재 선택된 역할을 해당 사용자에게 적용하고 승인 상태를 `승인 완료`로 바꾼다는 뜻이다.
- `거절`은 아직 서비스 접근을 허용하지 않는 상태이고, `정지`는 기존 접근 권한을 일시적으로 막는 상태다.
- 학생은 코치/관리자 전용 화면에 접근할 수 없고, 코치는 학생/관리자 전용 화면에 접근할 수 없다.
- 관리자는 운영자 역할이므로 직접 URL 접근 시 게시글, 포트폴리오, 코치 리뷰 요청을 확인할 수 있다. 다만 사이드바는 사용자 승인 중심으로 단순하게 유지한다.

### 나중에 백엔드에서 구현할 부분

- mock role 전환기를 제거하고 JWT payload 또는 /me API 응답으로 현재 사용자 role과 승인 상태를 가져온다.
- /admin/users에서 선택한 role과 승인 상태를 실제 DB에 저장한다.
- 승인/거절/정지 이력은 `user_approval_logs`에 남겨 누가 언제 권한을 바꿨는지 추적한다.

## 2026-06-12 Google 로그인 / 관리자 승인 QA 정리

### 확인한 목적

- Google 로그인은 사용자의 신원 확인이고, JungleLog 접근 권한은 운영자 승인을 통과해야 한다.
- 승인 상태 문제와 role 접근 권한 문제는 서로 다른 문제로 안내되어야 한다.
- 관리자는 기본 메뉴에서 `사용자 승인`만 보지만, 운영자이므로 직접 URL 접근으로 전체 게시글과 리뷰 요청을 확인할 수 있다.

### 수정한 파일

| 파일 | 역할 |
| --- | --- |
| `frontend/src/app/pages/auth/Login.tsx` | Google mock 로그인 클릭 시 `STUDENT / 승인 대기`로 저장하고 `/pending-approval`로 이동 |
| `frontend/src/app/components/RoleGate.tsx` | `isApproved`, `hasAllowedRole`을 분리해 승인 문제와 role 문제를 다른 문구로 안내 |
| `frontend/src/app/pages/admin/AdminUsers.tsx` | 역할 선택값을 draft state로 관리하고 `승인 적용` 버튼에서 role과 `승인 완료`를 함께 적용 |
| `frontend/src/app/routes.tsx` | 관리자 직접 URL 접근 허용 정책에 맞게 주석 정리 |

### 이번 구현에서 이해할 개념

- `localStorage`: mock 로그인 상태를 브라우저에 잠시 저장하기 위해 사용한다.
- `useNavigate`: 버튼 클릭 후 `/pending-approval`로 이동할 때 사용한다.
- derived permission: `approvalStatus === "승인 완료"`와 `allowedRoles.includes(role)`을 합쳐 실제 접근 가능 여부를 계산한다.
- draft state: select에서 고른 값을 바로 DB 상태처럼 바꾸지 않고, `승인 적용` 버튼을 눌렀을 때 반영하도록 잠시 들고 있는 상태다.

### 검증 결과

- `npm run build` 성공.
- `python -m compileall app` 성공.
- Playwright 기반 브라우저 자동 QA는 프로젝트에 `playwright` 패키지가 없어 실행하지 못했다.
- 라우트 권한은 `routes.tsx`와 `RoleGate.tsx` 기준으로 정적 확인했다.

## 2026-06-12 DB 설계 v1 보정

### 수정한 파일

| 파일 | 역할 |
| --- | --- |
| `docs/agent/db-design.md` | Google OAuth, 관리자 승인, 게시판, 포트폴리오, 코치 리뷰 요청을 포함한 ERD v1 확정 기준 정리 |
| `README.md` | 현재 백엔드 상태와 다음 작업 예정에 DB 설계 반영 |
| `docs/agent/log.md` | 4단계 진행 기록에 DB 설계 보정 내용 추가 |
| `docs/agent/test.md` | ERD v1 검증 체크리스트 추가 |

### 이번에 결정한 것

- `role`과 `approval_status`는 분리한다.
- `role`은 `STUDENT`, `COACH`, `ADMIN`을 가진다.
- `approval_status`는 `승인 대기`, `승인 완료`, `거절`, `정지`를 가진다.
- 첫 관리자 자동 생성은 아직 실행한 관리자가 없으므로 `user_approval_logs.actor_id`를 비워둘 수 있게 한다.
- `user_approval_logs.action`으로 승인, 거절, 정지, role 변경, 초기 관리자 생성을 구분한다.
- `rejected_reason`처럼 거절에만 맞는 이름 대신 `approval_note`로 거절/정지/승인 메모를 포괄한다.
- v1에서는 `portfolio_projects.tech_stack`을 text로 두고, 기술 스택 테이블 분리는 v2로 미룬다.
- 리뷰 요청 상태는 `대기 중`, `검토 중`, `수정 요청`, `피드백 완료`, `최종 확인`을 사용한다.

### 이번 구현에서 이해할 개념

- nullable: 값이 없을 수 있는 컬럼이다. 초기 관리자 자동 생성처럼 actor가 없는 경우에 필요하다.
- audit log: 누가 언제 어떤 권한 변경을 했는지 추적하기 위한 이력 테이블이다.
- status column: 현재 상태를 저장하는 컬럼이다. 상태값 목록을 미리 정하면 API와 UI가 흔들리지 않는다.
- unique index: 같은 사용자가 같은 GitHub repo를 중복 등록하지 못하게 막는 규칙이다.
- N:M 관계: 게시글-태그, 포트폴리오-게시글, 리뷰요청-코치처럼 양쪽 모두 여러 개로 연결되는 관계다.

### 다음 코드 구현으로 이어지는 부분

- `users`, `user_approval_logs`, `post_categories`부터 SQLAlchemy model로 옮긴다.
- 모델을 만들 때 DB 문서의 컬럼명과 타입을 기준으로 한다.
- 실제 enum을 Python enum으로 둘지, 우선 `String` 컬럼으로 둘지는 모델 작성 단계에서 결정한다.

## 2026-06-12 DB 테이블과 화면 기능 연결 읽기

### 수정한 파일

| 파일 | 역할 |
| --- | --- |
| `docs/agent/db-design.md` | 테이블별 필드 의미, 타입을 선택한 이유, 화면 기능과의 연결, ERD 그림 읽는 법 추가 |
| `docs/agent/log.md` | DB 설계 학습 보강 진행 기록 추가 |
| `docs/agent/test.md` | DB 문서 검증 체크리스트 보강 |

### 이번에 이해해야 할 핵심

- `users`는 학생/코치/관리자를 모두 담고, `role`과 `approval_status`로 화면 접근을 나눈다.
- `post_categories`는 관계가 없는 테이블이 아니라 `posts.category_id`, `review_requests.category_id`가 참조하는 기준 테이블이다.
- `posts`, `comments`, `tags`, `post_tags`는 기본 게시판 기능과 직접 연결된다.
- `portfolio_projects`, `portfolio_project_posts`는 포트폴리오 관리 화면과 기록 연결하기 기능에 연결된다.
- `review_requests`, `review_request_coaches`는 학생의 리뷰 요청과 코치 인박스 화면에 연결된다.
- `notifications`는 상단 알림 드롭다운에 연결된다.

### 타입을 읽는 방법

- `bigint`: 주요 테이블의 id처럼 계속 늘어나는 값.
- `int`: 카테고리처럼 개수가 적은 기준 테이블 id.
- `varchar(n)`: 길이를 제한할 수 있는 짧은 문자열.
- `text`: 게시글 본문, 피드백, 초안처럼 길어질 수 있는 문자열.
- `boolean`: 공개 여부, 읽음 여부처럼 참/거짓만 필요한 값.
- `timestamp`: 생성일, 수정일, 승인일처럼 시간이 필요한 값.

### ERD 그림이 복잡해 보이는 이유

`users`는 거의 모든 기능과 연결되므로 관계선이 많이 몰린다.
dbdiagram.io의 자동 배치 때문에 `post_categories`가 관계가 없어 보이거나 `users` 주변을 가리는 것처럼 보일 수 있다.
이 경우 테이블을 직접 드래그해서 `post_categories`는 `posts`와 `review_requests` 근처에, `user_approval_logs`는 `users` 근처에 두면 읽기 좋다.

## 2026-06-12 DB 설계와 화면 기능 매핑 QA 학습

### 이번에 확인한 파일

| 파일 | 역할 |
| --- | --- |
| `docs/agent/db-design.md` | ERD v1, DBML, 테이블/필드 설명을 관리한다. |
| `frontend/src/app/data/mockData.ts` | 현재 React mock 화면에서 실제로 쓰는 데이터 구조를 정의한다. |
| `frontend/src/app/routes.tsx` | 어떤 화면이 어떤 role에서 열리는지 확인한다. |
| `docs/agent/test.md` | DB 설계와 화면 기능 매핑 QA 결과를 체크리스트로 남긴다. |

### 이번 QA에서 배운 핵심

DB 설계는 화면에 보이는 글자를 그대로 전부 컬럼으로 만드는 일이 아니다.
어떤 값은 실제로 저장해야 하고, 어떤 값은 다른 테이블을 JOIN하거나 개수를 세어서 화면에서 만든다.

예를 들어 `requesterName`은 `review_requests`에 이름 문자열을 저장하지 않는다.
`review_requests.requester_id`로 `users.id`를 찾아서 `users.name`을 가져오면 된다.
이렇게 하면 사용자가 이름을 바꿨을 때 리뷰 요청 화면에도 최신 이름을 보여줄 수 있다.

`linkedRecordCount`도 따로 저장하지 않는다.
`portfolio_project_posts`에서 특정 프로젝트에 연결된 게시글 개수를 count하면 된다.

### 화면 필드와 DB 필드 연결 예시

| 화면/mock 필드 | DB에서 가져오는 방식 |
| --- | --- |
| 게시글 제목 | `posts.title` |
| 게시글 작성자 | `posts.author_id -> users.name` |
| 게시글 카테고리 | `posts.category_id -> post_categories.label` |
| 게시글 태그 | `posts.id -> post_tags -> tags.name` |
| 댓글 목록 | `comments.post_id = posts.id` |
| 연결 커밋 | `posts.related_commit` |
| 프로젝트 GitHub URL | `portfolio_projects.github_url` |
| 프로젝트 요약 | `portfolio_projects.summary` |
| 연결된 학습 기록 | `portfolio_projects.id -> portfolio_project_posts -> posts` |
| 코치 리뷰 담당 코치 | `review_requests.id -> review_request_coaches -> users` |
| 코치 피드백 | `review_requests.feedback` |

### 이번에 조정한 설계

- `posts.related_commit text`를 추가했다.
- `portfolio_projects.summary text`를 추가했다.
- `contentSections`는 v1에서 별도 테이블로 나누지 않고 `posts.content`에 Markdown/본문 문자열로 저장하기로 했다.
- AI/RAG/MCP/Agent 실행 로그는 v1 DB에 넣지 않고, 기본 CRUD가 붙은 뒤 v2에서 추가하기로 했다.

### 알아야 하는 DB 개념

- Primary Key: row 하나를 구분하는 고유 id다.
- Foreign Key: 다른 테이블의 row를 가리키는 id다.
- 1:N 관계: 사용자 1명이 게시글 여러 개를 쓰는 관계다.
- N:M 관계: 게시글 여러 개가 태그 여러 개와 연결되는 관계다. 중간 테이블이 필요하다.
- JOIN: id로 연결된 다른 테이블의 정보를 함께 가져오는 것이다.
- Count: 댓글 수나 연결 기록 수처럼 저장하지 않고 계산할 수 있는 값을 만드는 방법이다.
- 정규화: 같은 값을 여러 테이블에 중복 저장하지 않도록 나누는 설계 방식이다.
- 비정규화: 조회 편의를 위해 일부 값을 중복 저장하는 방식이다. v1에서는 꼭 필요한 경우만 쓴다.

### 다음에 모델 만들 때 볼 포인트

SQLAlchemy model을 만들 때는 mock data 이름을 그대로 옮기는 것이 아니라 DB 컬럼 이름을 기준으로 만든다.
예를 들어 React의 `categorySlug`는 DB에서 `post_categories.slug`이고, React의 `author`는 DB에서 `users.name`이다.
프론트와 백엔드 사이 API 응답을 만들 때 이 둘을 다시 조합해서 프론트가 쓰기 좋은 형태로 내려주면 된다.

## 2026-06-12 DB 필드별 선언 이유 읽기

### 이번에 보강한 파일

| 파일 | 역할 |
| --- | --- |
| `docs/agent/db-design.md` | 모든 v1 테이블 필드가 왜 필요한지 학습표 추가 |
| `docs/agent/test.md` | 필드별 설명이 있는지 QA 체크리스트 추가 |
| `docs/agent/log.md` | 문서 보강 진행 기록 추가 |

### 이번 학습에서 중요한 질문

DB 필드를 볼 때는 아래 순서로 질문하면 된다.

1. 이 값은 실제로 저장해야 하는가?
2. 다른 테이블에서 JOIN으로 가져올 수 있는가?
3. count 같은 계산으로 만들 수 있는가?
4. 이 필드는 어떤 화면에서 쓰이는가?
5. 이 필드가 없으면 어떤 기능이 불가능한가?

### 예시

`posts.author_id`는 저장해야 한다.
게시글마다 작성자가 있어야 하고, 작성자를 기준으로 내 기록 화면을 만들 수 있기 때문이다.
하지만 작성자 이름 자체는 `posts`에 저장하지 않는다.
`posts.author_id -> users.name`으로 JOIN해서 가져오면 된다.

`linkedRecordCount`는 저장하지 않는다.
`portfolio_project_posts`에서 특정 프로젝트에 연결된 게시글 개수를 세면 되기 때문이다.

`review_requests.feedback`은 저장해야 한다.
코치가 작성한 피드백은 학생이 다시 확인해야 하는 실제 데이터이기 때문이다.

### 다음 단계에서 연결될 개념

- SQLAlchemy model: DB 테이블을 Python 클래스로 표현한다.
- Column: 테이블의 필드를 코드로 선언한다.
- ForeignKey: 다른 테이블과의 연결을 코드로 표현한다.
- relationship: SQLAlchemy에서 연결된 객체를 쉽게 가져오기 위한 설정이다.
- JOIN: 여러 테이블을 연결해서 화면에 필요한 응답을 만든다.
- DTO/Schema: DB 모델을 그대로 노출하지 않고 프론트가 쓰기 좋은 응답 모양으로 바꾼다.

## 2026-06-12 Google OAuth 이름과 서비스 표시 이름

Google OAuth에서 `name`을 받아온다고 해서 그 값을 매번 우리 서비스 이름으로 덮어쓰면 안 된다.
JungleLog 안에서 사용자가 이름을 바꿀 수 있어야 하기 때문이다.

### 구분해야 하는 값

| 값 | 의미 |
| --- | --- |
| `google_sub` | Google 계정의 고유 id. 로그인 사용자를 찾는 기준이다. |
| `email` | Google 계정 이메일. 관리자 승인 목록과 계정 식별에 쓴다. |
| Google `name` | Google 프로필 이름. 첫 로그인 때 서비스 표시 이름의 초기값으로 쓴다. |
| `users.name` | JungleLog 안에서 보여줄 표시 이름. 사용자가 수정할 수 있다. |

### 핵심 규칙

- 첫 로그인 때는 Google `name`으로 `users.name`을 초기화한다.
- 사용자가 설정에서 이름을 바꾸면 `users.name`을 수정한다.
- 다음 Google 로그인 때 Google `name`으로 `users.name`을 다시 덮어쓰지 않는다.

이 규칙을 지키면 Google 로그인과 서비스 내부 닉네임 변경을 함께 사용할 수 있다.

## 2026-06-13 SQLAlchemy 모델 1차 구현 학습

### 이번에 수정한 파일

| 파일 | 역할 |
| --- | --- |
| `backend/app/db/models/user.py` | `users` 테이블을 Python 클래스로 선언한다. |
| `backend/app/db/models/post_category.py` | `post_categories` 테이블을 Python 클래스로 선언한다. |
| `backend/app/db/models/post.py` | `posts` 테이블을 Python 클래스로 선언한다. |
| `backend/app/db/models/__init__.py` | 모델들을 한 곳에서 import할 수 있게 모은다. |

### SQLAlchemy 모델이란?

SQLAlchemy 모델은 DB 테이블을 Python 클래스로 표현한 것이다.
예를 들어 `users` 테이블은 `User` 클래스가 되고, `posts` 테이블은 `Post` 클래스가 된다.

```txt
DB 테이블 users
-> Python class User

DB 컬럼 email
-> User.email
```

### 이번 코드에서 나온 개념

- `Base`: 모든 SQLAlchemy 모델이 상속하는 기준 클래스다.
- `__tablename__`: 실제 DB 테이블 이름이다.
- `Mapped[...]`: 이 속성이 SQLAlchemy가 관리하는 필드라는 타입 표시다.
- `mapped_column(...)`: 실제 DB 컬럼을 선언한다.
- `primary_key=True`: 이 컬럼이 row 하나를 구분하는 PK라는 뜻이다.
- `ForeignKey("users.id")`: 다른 테이블의 `id`를 참조한다는 뜻이다.
- `relationship(...)`: 외래키로 연결된 객체를 Python 코드에서 쉽게 접근하게 해준다.
- `server_default=func.now()`: DB 서버 기준으로 현재 시간을 기본값으로 넣는다.
- `nullable=True`: 값이 없어도 되는 컬럼이다.
- `unique=True`: 같은 값이 중복으로 들어갈 수 없는 컬럼이다.

### User, PostCategory, Post 관계

```txt
User 1명
-> 여러 Post 작성 가능

PostCategory 1개
-> 여러 Post가 속할 수 있음

Post 1개
-> 작성자 User 1명
-> 카테고리 PostCategory 1개
```

코드에서는 이렇게 이어진다.

```txt
posts.author_id -> users.id
posts.category_id -> post_categories.id
```

### 왜 이 3개부터 만들었나?

게시판 API를 만들려면 최소한 아래 데이터가 필요하다.

- 누가 썼는가: `users`
- 어떤 카테고리인가: `post_categories`
- 어떤 글인가: `posts`

그래서 댓글, 태그, 포트폴리오보다 먼저 이 3개 모델을 만들었다.

### 주의할 점

검증할 때는 반드시 백엔드 가상환경 Python을 사용해야 한다.
시스템 Python에는 `sqlalchemy`가 설치되어 있지 않을 수 있다.

```powershell
cd backend
.\.venv\Scripts\Activate.ps1
python -m compileall app
```

또는:

```powershell
.\.venv\Scripts\python.exe -m compileall app
```

### 다음에 이어질 내용

- `Base.metadata.create_all()`이 테이블을 실제 DB에 만드는 방식
- Alembic migration이 필요한 이유
- seed 데이터가 무엇인지
- SQLAlchemy model과 Pydantic schema의 차이

## 2026-06-13 DB 테이블 생성과 seed 학습

### 이번에 수정한 파일

| 파일 | 역할 |
| --- | --- |
| `backend/app/db/init_db.py` | 모델 기준으로 실제 테이블을 만들고 기본 카테고리 데이터를 넣는다. |

### 모델 선언과 테이블 생성의 차이

지난 단계에서 만든 `User`, `PostCategory`, `Post` 클래스는 Python 코드에 테이블 설계를 선언한 것이다.
하지만 선언만으로 PostgreSQL 안에 실제 테이블이 생기지는 않는다.

실제 DB에 테이블을 만들려면 아래 코드가 실행되어야 한다.

```python
Base.metadata.create_all(bind=engine)
```

의미는 이렇다.

```txt
Base.metadata
-> SQLAlchemy가 알고 있는 모든 모델 테이블 정보

create_all
-> 아직 DB에 없는 테이블을 생성

engine
-> 어떤 DB에 연결할지 알려주는 객체
```

### seed란?

seed는 서비스를 실행하기 전에 기본으로 들어가야 하는 데이터를 넣는 작업이다.
이번에는 게시글 카테고리 5개를 seed로 넣었다.

```txt
learning-log      -> 학습 로그
troubleshooting   -> 트러블슈팅
retrospective     -> 프로젝트 회고
interview         -> 면접 질문
portfolio         -> 포트폴리오 관리
```

### 왜 중복 방지가 필요한가?

초기화 명령은 개발 중에 여러 번 실행할 수 있다.
그때마다 카테고리가 또 들어가면 같은 카테고리가 중복된다.

그래서 먼저 DB에 있는 slug 목록을 조회한다.
그리고 없는 slug만 새로 추가한다.

```txt
기존 slug 조회
-> learning-log가 이미 있으면 건너뜀
-> 없으면 추가
```

### 이번에 이해해야 할 코드 흐름

```txt
init_db()
-> create_tables()
   -> Base.metadata.create_all(bind=engine)
-> seed_post_categories()
   -> 기존 카테고리 slug 조회
   -> 없는 카테고리만 add
   -> commit
```

### create_all과 Alembic의 차이

`create_all()`은 초보 학습과 초기 개발에 좋다.
모델을 보고 없는 테이블을 바로 만들어주기 때문이다.

하지만 운영 환경에서는 보통 Alembic migration을 쓴다.
테이블을 처음 만드는 것뿐 아니라, 컬럼 추가/삭제/변경 이력을 관리해야 하기 때문이다.

현재 단계에서는 DB 흐름을 이해하기 위해 `create_all()`을 먼저 사용한다.
나중에 구조가 안정되면 Alembic으로 넘어간다.

## 2026-06-13 댓글/태그 모델 학습

### 이번에 수정한 파일

| 파일 | 역할 |
| --- | --- |
| `backend/app/db/models/comment.py` | 게시글 댓글 테이블을 Python 모델로 선언한다. |
| `backend/app/db/models/tag.py` | 태그 기준 테이블을 Python 모델로 선언한다. |
| `backend/app/db/models/post_tag.py` | 게시글과 태그의 N:M 연결 테이블을 선언한다. |
| `backend/app/db/models/user.py` | 사용자가 작성한 댓글 관계를 추가한다. |
| `backend/app/db/models/post.py` | 게시글의 댓글과 태그 연결 관계를 추가한다. |
| `backend/app/db/models/__init__.py` | 새 모델들을 import해서 metadata에 등록한다. |

### Comment 모델

댓글은 게시글에 속하고, 작성자도 가진다.

```txt
comments.post_id -> posts.id
comments.author_id -> users.id
```

그래서 댓글 하나는 아래 두 질문에 답할 수 있어야 한다.

- 어떤 게시글에 달린 댓글인가?
- 누가 쓴 댓글인가?

### Tag 모델

태그는 게시글 검색/분류를 돕는 기준 데이터다.
`name`은 화면에 보이는 값이고, `slug`는 코드나 URL에서 쓰기 좋은 값이다.

```txt
name: FastAPI
slug: fastapi
```

### PostTag 모델

게시글과 태그는 N:M 관계다.

```txt
게시글 하나 -> 태그 여러 개
태그 하나 -> 게시글 여러 개
```

이런 관계는 한쪽 테이블에 컬럼 하나만 추가해서 표현하기 어렵다.
그래서 중간 연결 테이블 `post_tags`를 둔다.

```txt
post_tags.post_id
post_tags.tag_id
```

`post_id + tag_id`를 primary key로 두면 같은 게시글에 같은 태그가 중복으로 붙는 것을 막을 수 있다.

### relationship 복습

이번에 추가한 관계는 아래와 같다.

```txt
User.comments
Post.comments
Post.post_tags
Tag.post_tags
PostTag.post
PostTag.tag
```

DB에서 실제 관계를 만드는 것은 `ForeignKey`다.
`relationship`은 Python 코드에서 연결된 객체를 더 편하게 쓰기 위한 통로다.

### 이번 단계 후 실제 DB 상태

실제 PostgreSQL 테이블은 이제 6개다.

```txt
users
post_categories
posts
comments
tags
post_tags
```

댓글과 태그 데이터는 아직 넣지 않았다.
게시글 seed 또는 게시글 작성 API가 생긴 뒤에 실제 데이터가 들어간다.
## 2026-06-13 4단계 API 설계와 게시글 조회 API

이번 구현은 React mock data를 실제 FastAPI 응답으로 바꾸기 위한 첫 단계다.
중요한 포인트는 코드를 바로 만들기 전에 API 계약을 먼저 문서화했다는 점이다.

### 수정한 파일

| 파일 | 역할 |
| --- | --- |
| `docs/agent/api-design.md` | 프론트와 백엔드가 공유할 API 계약 문서 |
| `backend/app/schemas/post.py` | 게시글 목록/상세 응답 JSON 모양을 정의하는 Pydantic schema |
| `backend/app/repositories/post_repository.py` | SQLAlchemy로 DB에서 게시글을 조회하는 계층 |
| `backend/app/services/post_service.py` | DB 모델을 프론트 친화적인 응답 schema로 변환하는 계층 |
| `backend/app/routers/posts.py` | HTTP 요청을 받는 FastAPI router |
| `backend/app/main.py` | posts router를 FastAPI 앱에 등록 |
| `backend/app/db/init_db.py` | 개발용 demo 사용자/게시글/태그 seed 추가 |

### API 설계가 먼저인 이유

프론트엔드는 화면을 만들 때 이런 데이터를 기대한다.

```txt
title
categorySlug
tags
author
isPublic
views
comments
createdAt
```

하지만 DB에는 이렇게 저장되어 있다.

```txt
posts.title
posts.category_id
post_categories.slug
post_tags + tags
posts.author_id
posts.is_public
posts.view_count
comments count
posts.created_at
```

그래서 API 설계는 DB 그대로를 노출하는 일이 아니라, 화면에 필요한 JSON 모양으로 변환하는 약속을 정하는 일이다.

### DB Model과 Pydantic Schema 차이

DB model은 테이블 설계에 가깝다.

```txt
Post.is_public
Post.view_count
Post.created_at
```

Pydantic schema는 API 응답 설계에 가깝다.

```txt
isPublic
views
createdAt
```

즉, 같은 게시글이라도 DB에 저장되는 모양과 프론트에 내려주는 모양은 다를 수 있다.

### Repository / Service / Router 흐름

이번 게시글 조회 API는 세 계층으로 나눴다.

```txt
router
  HTTP 요청을 받는다.
  Query parameter를 검증한다.
  404 같은 HTTP 오류를 반환한다.

service
  DB model을 API response schema로 바꾼다.
  화면에 필요한 tags, comments count 같은 값을 조립한다.

repository
  SQLAlchemy로 실제 DB query를 실행한다.
  category, keyword, page, size 조건을 적용한다.
```

이렇게 나누면 나중에 게시글 작성/수정/삭제를 만들 때도 구조를 유지하기 쉽다.

### 이번에 사용한 FastAPI 개념

- `APIRouter`: endpoint를 파일 단위로 나누기 위한 객체
- `Depends(get_db)`: API 함수에 DB session을 주입
- `Query`: query string의 기본값과 validation 조건 설정
- `HTTPException`: 404 같은 HTTP 오류 응답 반환
- `response_model`: API 응답이 어떤 schema인지 Swagger에 표시하고 검증

### 이번에 사용한 SQLAlchemy 개념

- `select(Post)`: posts 테이블 조회
- `join(Post.category)`: 게시글과 카테고리를 연결해서 조회
- `selectinload`: 관계 데이터를 추가 query로 미리 가져와 N+1 문제를 줄임
- `func.count`: 댓글 수와 전체 게시글 수 계산
- `or_`: 여러 검색 조건 중 하나라도 맞으면 조회
- `ilike`: 대소문자를 크게 구분하지 않는 검색

### 이번에 이해해야 할 핵심 포인트

1. API 설계는 DB 설계와 다르다.
2. Pydantic schema는 프론트에 내려줄 JSON 모양이다.
3. repository는 DB 조회를 담당한다.
4. service는 응답 조립을 담당한다.
5. router는 HTTP 요청/응답을 담당한다.
6. `GET /posts`는 목록이라 pagination이 필요하다.
7. `GET /posts/{post_id}`는 없는 id일 때 404가 필요하다.

### 나중에 백엔드와 더 연결될 부분

- JWT가 붙으면 비공개 글은 작성자 본인과 관리자만 볼 수 있게 해야 한다.
- `GET /me/posts` 또는 `GET /posts?mine=true`로 내 기록 API를 분리해야 한다.
- 게시글 작성 API에서는 posts, tags, post_tags를 transaction으로 함께 저장해야 한다.
- 검색이 커지면 PostgreSQL full-text search 또는 인덱스를 검토해야 한다.

### 추가로 공부할 키워드

- REST API
- API contract
- Pydantic response model
- DTO
- Query parameter
- HTTP 404
- Repository pattern
- Service layer
- SQLAlchemy select
- SQLAlchemy relationship loading
- Pagination
- N+1 query
## 2026-06-13 게시글 조회 API 학습용 주석 추가

이번 작업은 기능 추가가 아니라 4단계 게시글 조회 API 코드를 읽고 이해하기 위한 학습용 주석 보강이다.

### 주석을 추가한 파일

| 파일 | 주석으로 설명한 핵심 |
| --- | --- |
| `backend/app/main.py` | FastAPI app 생성, CORS, router 등록 |
| `backend/app/routers/posts.py` | Swagger에 보이는 `/posts` endpoint와 query/path parameter |
| `backend/app/services/post_service.py` | repository 결과를 Pydantic 응답 schema로 바꾸는 흐름 |
| `backend/app/repositories/post_repository.py` | SQLAlchemy select, filter, join, pagination, 댓글 count |
| `backend/app/schemas/post.py` | Pydantic schema, alias, 프론트 응답 필드 |
| `backend/app/db/init_db.py` | create_all, seed category, demo post/tag 연결 |

### 이번 주석을 읽는 순서

1. `backend/app/main.py`
2. `backend/app/routers/posts.py`
3. `backend/app/services/post_service.py`
4. `backend/app/repositories/post_repository.py`
5. `backend/app/schemas/post.py`
6. `backend/app/db/init_db.py`

### 이해해야 할 흐름

```txt
브라우저/Swagger
-> GET /posts 요청
-> routers/posts.py
-> services/post_service.py
-> repositories/post_repository.py
-> PostgreSQL
-> SQLAlchemy Post model
-> Pydantic PostListResponse
-> JSON 응답
```

### 주의할 점

이번 주석은 학습용으로 평소보다 자세히 달았다.
실무 코드에서는 너무 당연한 주석은 줄이고, 복잡한 의도나 설계 이유만 남기는 편이 좋다.

## 2026-06-13 ERD v1 남은 6개 SQLAlchemy 모델 추가

이번 작업은 새로운 API를 만든 것이 아니라, DB 설계 문서에 있던 남은 6개 테이블을 SQLAlchemy 모델 코드와 실제 PostgreSQL 테이블로 반영한 작업이다.

### 추가한 테이블

| 테이블 | 모델 파일 | 역할 |
| --- | --- | --- |
| `user_approval_logs` | `user_approval_log.py` | 관리자 승인/거절/정지/role 변경 이력 |
| `portfolio_projects` | `portfolio_project.py` | GitHub repo 기반 포트폴리오 프로젝트 |
| `portfolio_project_posts` | `portfolio_project_post.py` | 포트폴리오 프로젝트와 게시글 N:M 연결 |
| `review_requests` | `review_request.py` | 학생이 코치에게 보내는 리뷰 요청 |
| `review_request_coaches` | `review_request_coach.py` | 리뷰 요청과 코치 N:M 연결 |
| `notifications` | `notification.py` | 사용자별 알림 |

### 이번에 이해해야 할 관계

```txt
users 1:N portfolio_projects
portfolio_projects N:M posts

users 1:N review_requests
review_requests N:M users(coach)

users 1:N notifications
users 1:N user_approval_logs(user)
users 1:N user_approval_logs(actor)
```

### N:M 연결 테이블

N:M 관계는 양쪽이 서로 여러 개를 가질 수 있는 관계다.

포트폴리오 프로젝트와 게시글:

```txt
portfolio_projects
  -> portfolio_project_posts
  -> posts
```

리뷰 요청과 코치:

```txt
review_requests
  -> review_request_coaches
  -> users(coach)
```

연결 테이블은 보통 양쪽 id를 묶어서 primary key로 둔다.
그래야 같은 연결이 중복으로 저장되는 것을 막을 수 있다.

### actor_id가 nullable인 이유

`user_approval_logs.actor_id`는 변경을 실행한 관리자 id다.
하지만 첫 관리자 자동 생성처럼 아직 실행한 관리자가 없는 시스템 bootstrap 상황이 있을 수 있다.
그래서 `actor_id`는 null을 허용한다.

### 모델 등록이 중요한 이유

새 모델 파일을 만들기만 해서는 `create_all()`이 모를 수 있다.
그래서 `backend/app/db/models/__init__.py`에서 새 모델을 import해야 한다.

```txt
모델 파일 생성
-> models/__init__.py에 import
-> import app.db.models
-> Base.metadata에 테이블 등록
-> create_all()로 실제 DB 테이블 생성
```

### 이번 검증에서 배운 것

- `compileall`은 Python 문법/import 오류를 확인한다.
- `configure_mappers()`는 SQLAlchemy relationship 설정 오류를 확인한다.
- `inspect(engine).get_table_names()`는 실제 PostgreSQL에 만들어진 테이블 목록을 확인한다.

### 추가로 공부할 키워드

- SQLAlchemy relationship
- ForeignKey
- nullable FK
- composite primary key
- UniqueConstraint
- configure_mappers
- N:M relationship

## 2026-06-13 댓글 조회 API와 프론트 연결

이번 작업은 `GET /posts/{post_id}/comments` API를 만들고, 게시글 상세 화면에서 그 API를 호출하도록 연결한 작업이다.

### 수정한 파일

| 파일 | 역할 |
| --- | --- |
| `backend/app/schemas/comment.py` | 댓글 목록 응답 JSON 모양 정의 |
| `backend/app/repositories/comment_repository.py` | 게시글 존재 확인, 댓글 DB 조회 |
| `backend/app/services/comment_service.py` | Comment model을 API 응답 schema로 변환 |
| `backend/app/routers/comments.py` | `GET /posts/{post_id}/comments` endpoint |
| `backend/app/main.py` | comments router 등록 |
| `frontend/src/app/api/comments.ts` | 프론트에서 댓글 API를 호출하는 함수 |
| `frontend/src/app/pages/posts/PostDetail.tsx` | 게시글 상세 화면에서 댓글 API 호출 |

### 요청 흐름

```txt
PostDetail.tsx
-> getPostComments(postId)
-> GET http://localhost:8000/posts/{post_id}/comments
-> routers/comments.py
-> comment_service.py
-> comment_repository.py
-> comments + users 조회
-> CommentListResponse
-> PostDetail comments state 반영
```

### 이번에 발견한 문제

처음 구현에서는 comments router가 `prefix="/posts/{post_id}"`, `@router.get("")` 구조였다.
이렇게 쓰면 실제 경로가 `/posts/{post_id}`가 되어 기존 게시글 상세 API와 충돌한다.

수정 후 경로:

```txt
GET /posts/{post_id}/comments
```

프론트에서도 처음에는 `fetch("/posts/{id}")`로 게시글 상세 API를 다시 호출하고 있었다.
댓글 API를 호출하려면 아래 경로를 사용해야 한다.

```txt
GET /posts/{id}/comments
```

### useEffect dependency

처음에는 `useEffect(..., [comments])` 형태였다.
댓글 state가 바뀔 때마다 다시 댓글을 불러오게 되므로 흐름이 꼬일 수 있다.
댓글 조회는 게시글 id가 바뀔 때만 다시 실행하면 되므로 dependency는 `[id]`가 맞다.

### 지금 구현된 것과 아직 아닌 것

구현됨:

- 댓글 목록 조회
- 게시글이 없을 때 404
- 프론트 상세 화면에서 댓글 API 호출
- 댓글 로딩/에러/빈 목록 UI

아직 mock:

- 댓글 작성
- 댓글 삭제
- 로그인 사용자 기준 댓글 작성자 저장

### 추가로 공부할 키워드

- nested resource route
- useEffect dependency
- fetch error handling
- CORS response header
- backend response DTO와 frontend state 변환

## 2026-06-14 Google OAuth / JWT ���� �� �غ�

�̹� �ܰ�� Google OAuth�� ���� �鿣�� �α��� �帧���� �����ϱ� ���� �غ� �ܰ��.

### �̹��� Ȯ���� ��

| �׸� | �ǹ� |
| --- | --- |
| Google OAuth Client ID | JungleLog ���� Google�� �ĺ��ϴ� ���� id |
| Google OAuth Client Secret | �鿣�常 �˾ƾ� �ϴ� ��а� |
| Redirect URI | Google �α��� �� �ٽ� FastAPI�� ���ƿ��� �ּ� |
| JWT Secret Key | JungleLog access token ������ ���� ���Ű |
| httpx | �鿣�尡 Google API�� HTTP ��û�� ������ ���̺귯�� |

### �� httpx�� �ʿ��Ѱ�

������ ����ڴ� Google �α��� ȭ�鿡�� �α���������, ���������� Google���� authorization code�� access token���� �ٲ� �޶�� ��û�ϴ� ��ü�� FastAPI �鿣���.
�׷��� �鿣�� �ȿ��� �ܺ� HTTP ��û�� ���� ������ �ʿ��ϰ�, �� ������ `httpx`�� �ô´�.

### ������ ������ �ڵ� �帧

```txt
������
-> GET /auth/google/login
-> Google �α��� ȭ��
-> GET /auth/google/callback?code=...&state=...
-> FastAPI�� Google token endpoint ȣ��
-> FastAPI�� Google userinfo endpoint ȣ��
-> users ���̺����� ����� ���� �Ǵ� ��ȸ
-> access token / refresh token �߱�
-> HttpOnly cookie ����
-> GET /auth/me �� ���� ����� Ȯ��
```

### �߰� �н� Ű����

- OAuth2 Authorization Code Flow
- OpenID Connect
- redirect URI
- state parameter
- HttpOnly cookie
- access token
- refresh token rotation
- token hash ����

## 2026-06-14 OAuth schema/repository �н� ���

�̹� �ܰ�� ���� Google �α��� endpoint�� ����� ����, �α��� ����� DB�� API �������� �ٷ�� �⺻ ��ǰ�� ���� �۾��̴�.

### ������ ���ϰ� ����

| ���� | ���� |
| --- | --- |
| `backend/app/schemas/auth.py` | ���� �α��� ����� ������ ����Ʈ���忡 � JSON���� �������� ���� |
| `backend/app/repositories/user_repository.py` | `users` ���̺����� Google ����� ��ȸ, ����, ��α��� ���� ó�� |
| `backend/app/repositories/auth_token_repository.py` | `auth_refresh_tokens` ���̺��� refresh token hash ����, ��ȸ, ��� ó�� |

### �ٽ� �ڵ� �帧

```txt
Google userinfo ����
-> google_sub / email / name / picture ����
-> get_or_create_google_user()
-> ���� user�� ������ update_google_login_user()
-> ������ create_google_user()
-> access token �߱� ����
-> refresh token ���� ���� ����
-> hash_refresh_token()
-> create_refresh_token_record()
```

### �� google_sub�� �������� ã�°�

�̸����� ����ڰ� ������ ���� �ְ�, ���� ��å�� ���� �޶��� ���� �ִ�.
�ݸ� Google�� `sub`�� Google ������ ���� �ĺ��ڶ� ���� ����ڸ� �ٽ� ã�� �������� �� �������̴�.

### �� users.name�� ��α��� �� ����� �ʴ°�

`users.name`�� JungleLog �ȿ��� ǥ�õǴ� �̸��̴�.
���߿� ����ڰ� �г���ó�� ���� �ٲ� �� �־�� �ϹǷ�, Google ��α��� ������ Google �̸����� ����� ������� ������ �������.
�׷��� ��α��� ���� email, profile_image_url, last_login_at�� �����Ѵ�.

### �� refresh token ������ DB�� �������� �ʴ°�

refresh token�� ���� ��� �ִ� ���� �����̴�.
DB�� ������ �����ϸ� DB�� ������� �� �����ڰ� �ٷ� ������ �� �ִ�.
�׷��� ������ cookie���� ������ �ְ�, DB���� `sha256` hash�� �����Ѵ�.

### �̹� �ܰ迡�� ���� Ű����

- Pydantic response schema
- Field alias
- Repository layer
- Google OAuth `sub`
- initial admin
- approval status
- refresh token hash
- token revocation

## 2026-06-14 Google OAuth auth router/service/dependency �н� ���

�̹� �ܰ�� Google OAuth �鿣�� �帧�� ���� endpoint�� ���� �۾��̴�.

### ������ ���ϰ� ����

| ���� | ���� |
| --- | --- |
| `backend/app/dependencies/auth.py` | cookie�� access token���� ���� �α��� ����ڸ� ã�� ���� dependency |
| `backend/app/services/auth_service.py` | Google OAuth ���, JungleLog token �߱�, refresh token rotation ó�� |
| `backend/app/routers/auth.py` | `/auth/...` HTTP endpoint ���� |
| `backend/app/main.py` | auth router�� FastAPI app�� ��� |

### �α��� ���� �帧

```txt
������
-> GET /auth/google/login
-> FastAPI�� oauth_state ����
-> oauth_state�� HttpOnly cookie�� ����
-> Google OAuth URL�� 307 Redirect
-> �������� Google �α��� ȭ������ �̵�
```

### �α��� �ݹ� �帧

```txt
Google
-> GET /auth/google/callback?code=...&state=...
-> FastAPI�� cookie state�� query state ��
-> Google token endpoint ȣ��
-> Google userinfo endpoint ȣ��
-> users ���̺����� ����� ��ȸ �Ǵ� ����
-> access token ����
-> refresh token ����
-> refresh token hash DB ����
-> access/refresh token�� HttpOnly cookie�� ����
-> React frontend�� redirect
```

### /auth/me �帧

```txt
�������� cookie �ڵ� ����
-> get_current_user()
-> access token cookie �б�
-> decode_access_token()
-> token sub���� user_id ����
-> users ���̺� ��ȸ
-> CurrentUserResponse ��ȯ
```

### /auth/refresh �帧

```txt
refresh token cookie �б�
-> refresh token ���� hash
-> auth_refresh_tokens.token_hash ��ȸ
-> revoked_at / expires_at Ȯ��
-> �� access token ����
-> �� refresh token ���� �� hash ����
-> ���� refresh token revoked_at ä��
-> �� cookie �����ֱ�
```

### �̹��� �����ؾ� �� �ٽ� ����Ʈ

- router�� HTTP request/response�� �ٷ��.
- service�� Google OAuth �帧�� token �߱� ���� ����Ͻ� �帧�� �ٷ��.
- repository�� DB query�� �ٷ��.
- dependency�� ���� endpoint���� �������� �ʿ��� ���� ����� ��ȸ�� �����ϰ� ���ش�.
- access token���� role�� ���� �ʰ� user_id�� �ִ´�. role�� DB���� �ٽ� �о�� ���� ������ �ٷ� �ݿ��ȴ�.

### �߰� �н� Ű����

- FastAPI dependency
- RedirectResponse
- JSONResponse
- HttpOnly cookie
- SameSite=Lax
- OAuth state parameter
- refresh token rotation
- 401 Unauthorized
- 403 Forbidden

## 2026-06-15 코치 리뷰 화면 API 연결 학습 기록

이번 단계는 이미 만든 코치 리뷰 백엔드 API를 React 화면에 연결한 작업이다. 학생과 코치가 같은 `/coach-review` 경로를 쓰지만, 로그인한 role에 따라 완전히 다른 데이터 흐름을 사용한다.

### 수정한 파일과 역할

| 파일 | 역할 |
| --- | --- |
| `frontend/src/app/api/reviews.ts` | 코치 목록, 리뷰 요청 생성/조회/수정/취소 API 호출 함수를 모아둔 파일 |
| `frontend/src/app/pages/coach/CoachReview.tsx` | 학생용 리뷰 요청 화면과 코치용 인박스 화면을 role 기준으로 렌더링하는 페이지 |

### 이번 구현에서 사용한 React 개념

- `useEffect`: 화면이 처음 열릴 때 API 데이터를 불러온다.
- `useState`: 선택한 리뷰 대상, 선택한 코치, 요청 메시지, 피드백, 로딩/오류 상태를 저장한다.
- `useMemo`: 코치 인박스 검색어, 카테고리, 상태 필터에 맞는 요청 목록을 다시 계산한다.
- `useOutletContext`: `MainLayout`에서 내려준 현재 사용자 role을 읽어 학생 화면과 코치 화면을 나눈다.
- 조건부 렌더링: 로딩, 빈 목록, 오류 메시지, 학생/코치 화면을 상태에 따라 다르게 보여준다.

### 코드 흐름

학생 화면:

```txt
/coach-review 진입
-> useOutletContext로 role 확인
-> STUDENT면 StudentReviewView 렌더링
-> getMyPosts / getPortfolioProjects / getCoachOptions / getMyReviewRequests 호출
-> 사용자가 대상과 코치를 선택
-> createReviewRequest 호출
-> 성공한 요청을 requests state 맨 앞에 추가
-> 대기 중 요청 취소 시 cancelReviewRequest 호출 후 state에서 제거
```

코치 화면:

```txt
/coach-review 진입
-> role이 COACH 또는 ADMIN이면 CoachInboxView 렌더링
-> getReviewInbox 호출
-> 검색어/카테고리/상태 필터를 useMemo로 적용
-> 요청 선택 시 상세 패널과 feedback state 변경
-> updateReviewRequest로 상태와 피드백 저장
-> 성공한 응답으로 requests state 갱신
```

### 내가 이해해야 할 핵심 포인트

- 프론트엔드는 DB를 직접 만지지 않고 API 함수만 호출한다.
- 학생이 보는 요청 목록과 코치가 보는 인박스는 같은 테이블을 기반으로 하지만 API endpoint가 다르다.
- 상태 변경은 화면 state만 바꾸는 것이 아니라 PATCH API를 호출하고, 성공 응답을 기준으로 화면을 갱신해야 한다.
- 원문 댓글과 리뷰 피드백은 목적이 다르다. 리뷰 피드백은 `review_requests.feedback`에 저장되고, 댓글 자동 등록은 아직 다음 정책 결정 사항이다.

### 추가 학습 키워드

- React API client 분리
- Promise.all
- optimistic update와 server response update 차이
- role based rendering
- controlled textarea
- PATCH / DELETE API
## 2026-06-15 AI 도우미 API 기반 정리 학습 기록

이번 단계는 AI 호출을 붙이기 전, AI 도우미 화면이 실제 사용자 프로젝트와 기록을 기준으로 움직이게 만든 작업이다.

### 수정한 파일과 역할

| 파일 | 역할 |
| --- | --- |
| `frontend/src/app/pages/ai/AIAssistant.tsx` | 포트폴리오 프로젝트와 내 기록 API를 불러와 AI 참고 자료 패널과 샘플 결과를 구성 |
| `frontend/src/app/pages/posts/MyRecords.tsx` | 현재 로그인 사용자 기준 조회 문구로 수정 |

### 사용한 React 개념

- `useEffect`: AI 도우미 화면 진입 시 프로젝트 목록과 내 기록을 API로 불러온다.
- `Promise.all`: 서로 독립적인 `getPortfolioProjects`, `getMyPosts`를 동시에 요청한다.
- `useMemo`: 선택 프로젝트의 `linkedPostIds`에 맞는 기록만 필터링한다.
- `useSearchParams`: `/ai-assistant?project=...&type=...` query string으로 초기 프로젝트와 결과 유형을 맞춘다.
- 조건부 렌더링: 로딩, 프로젝트 없음, 선택 프로젝트 있음 상태를 나누어 보여준다.

### 코드 흐름

```txt
/ai-assistant 진입
-> query string에서 project/type 읽기
-> getPortfolioProjects(), getMyPosts() 동시 호출
-> query project id가 있으면 해당 프로젝트 선택
-> 없으면 첫 번째 프로젝트 선택
-> selectedProject.linkedPostIds와 내 기록 id를 비교
-> 연결된 기록만 참고 자료 패널에 표시
-> 포트폴리오 결과 저장 버튼 클릭
-> updatePortfolioProject()로 savedPortfolioDraft 저장
```

### 내가 이해해야 할 핵심 포인트

- 아직 OpenAI를 호출하지 않아도 화면 데이터 흐름은 실제 API 기준으로 만들 수 있다.
- AI 도우미가 직접 프로젝트 이름을 입력받는 방식보다, 포트폴리오 관리에 등록된 프로젝트를 선택하는 방식이 서비스 흐름에 맞다.
- RAG는 나중에 vector search로 바뀌겠지만, 지금 화면에서는 `linkedPostIds`가 “이 프로젝트와 연결된 기록”을 보여주는 최소 단서 역할을 한다.
- `PATCH /portfolio/projects/{id}`로 초안을 저장하면 포트폴리오 관리 화면에서도 같은 저장 결과를 볼 수 있다.

### 추가 학습 키워드

- API 기반 UI와 mock UI 차이
- query string 기반 초기 상태
- 관계 데이터 연결하기
- AI 호출 전 데이터 준비 단계
- RAG 입력 자료 구성
## 2026-06-15 대시보드 API 기반 정리 학습 기록

이번 단계는 대시보드가 더 이상 `mockData.posts`, `mockData.reviewRequests`를 직접 읽지 않고, 로그인한 사용자의 role에 맞는 API를 호출하도록 바꾼 작업이다.

### 수정한 파일과 역할

| 파일 | 역할 |
| --- | --- |
| `frontend/src/app/pages/dashboard/Dashboard.tsx` | 학생/코치 대시보드 통계와 최근 목록을 API 응답 기준으로 계산 |
| `frontend/src/app/pages/ai/AIAssistant.tsx` | query string 의존성을 `project` 값 기준으로 안정화 |

### 사용한 React 개념

- `useEffect`: role이 바뀔 때 학생용 API 또는 코치용 API를 호출한다.
- `useState`: 대시보드에 표시할 내 기록, 학생 리뷰 요청, 코치 인박스, 공개 게시글 목록을 저장한다.
- `useMemo`: 학생 카테고리 카드의 count를 현재 내 기록 목록 기준으로 계산한다.
- 조건부 렌더링: ADMIN은 관리자 페이지로 redirect, COACH는 코치 대시보드, STUDENT는 학생 대시보드를 보여준다.

### 코드 흐름

```txt
Dashboard 렌더링
-> MainLayout context에서 role 확인
-> ADMIN이면 /admin/users로 이동
-> COACH면 getReviewInbox(), getPosts() 호출
-> STUDENT면 getMyPosts(), getMyReviewRequests() 호출
-> API 응답으로 통계 카드와 최근 목록 렌더링
```

### 내가 이해해야 할 핵심 포인트

- 같은 대시보드라도 role에 따라 필요한 API가 다르다.
- 학생은 “내 데이터”가 중요하므로 `/me/posts`, `/review-requests/me`를 쓴다.
- 코치는 “받은 요청과 전체 게시글”이 중요하므로 `/review-requests/inbox`, `/posts`를 쓴다.
- 카테고리 아이콘과 라벨은 정적 UI 상수로 남길 수 있지만, count는 API 응답에서 계산해야 실제 서비스처럼 보인다.

### 추가 학습 키워드

- role 기반 데이터 fetching
- derived state
- API 응답으로 통계 계산하기
- loading/error UI
- React Router Navigate
## 2026-06-15 설정 화면 준비 중 UI 정리 학습 기록

이번 단계는 아직 API가 없는 설정 기능을 실제 저장 기능처럼 보이지 않게 정리한 작업이다.

### 수정한 파일과 역할

| 파일 | 역할 |
| --- | --- |
| `frontend/src/app/pages/settings/Settings.tsx` | 로그인 사용자 정보를 read-only로 보여주고, 미구현 설정 기능을 준비 중 상태로 표시 |

### 사용한 React 개념

- `useAuth`: 현재 로그인 사용자 정보를 화면에 표시한다.
- read-only controlled input: 값은 보여주지만 아직 수정 저장은 막아둔다.
- disabled button: API가 없는 기능을 사용 가능한 것처럼 보이지 않게 한다.

### 핵심 포인트

- “mock 저장”처럼 보이는 버튼은 사용자가 실제 저장된다고 오해할 수 있다.
- 지금 구현된 GitHub 흐름은 전역 계정 연동이 아니라 포트폴리오 프로젝트별 repo URL 등록이다.
- API가 없으면 숨기거나 준비 중으로 명확히 표시해야 실제 서비스 흐름이 더 신뢰감 있게 보인다.
## 2026-06-15 레거시 mockData 제거 학습 기록

이번 단계는 React mock UI 단계에서 쓰던 `data/mockData.ts`를 실제 API 단계에 맞게 제거한 작업이다.

### 수정한 파일과 역할

| 파일 | 역할 |
| --- | --- |
| `frontend/src/app/constants/categories.ts` | 게시글 카테고리 slug, label, icon, color를 관리하는 정적 UI 상수 |
| `frontend/src/app/pages/posts/PostDetail.tsx` | 관련 기록을 mock 배열이 아니라 `GET /posts` API로 조회 |
| `frontend/src/app/pages/posts/PostEdit.tsx` | 최근 공개 기록을 mock 배열이 아니라 `GET /posts` API로 조회 |
| `frontend/src/app/layouts/MainLayout.tsx` | 알림 API 연결 전 샘플 알림을 레이아웃 내부 상수로 관리 |
| `frontend/src/app/api/posts.ts` | `UserRole` 타입을 `api/auth.ts`에서 가져오도록 정리 |
| `frontend/src/app/api/comments.ts` | `UserRole` 타입을 `api/auth.ts`에서 가져오도록 정리 |

### 코드 흐름 변화

게시글 상세:

```txt
post detail API 호출
-> post.categorySlug 확인
-> GET /posts?category={categorySlug}
-> 현재 게시글 id 제외
-> 최대 2개 관련 공개 기록 표시
```

글쓰기 화면:

```txt
/posts/new 또는 /posts/:id/edit 진입
-> GET /posts?page=1&size=3
-> 최근 공개 기록을 참고 목록으로 표시
-> 실제 유사도 추천은 RAG 단계로 남김
```

### 내가 이해해야 할 핵심 포인트

- 정적 UI 상수와 mock 데이터는 다르다.
- 카테고리 label/icon/color는 서버 데이터가 아니어도 프론트 상수로 둘 수 있다.
- 게시글/댓글/포트폴리오/코치 리뷰처럼 사용자가 바꾸는 데이터는 API 응답을 기준으로 화면을 만들어야 한다.
- 파일 이름이 `mockData.ts`로 남아 있으면 실제 API 단계에서도 혼란을 만든다.
- 아직 API가 없는 알림은 “샘플”임을 분명히 표시해야 한다.

### 추가 학습 키워드

- constants 폴더 역할
- API response 기반 derived UI
- 레거시 코드 제거
- TypeScript type source of truth
- RAG 연결 전 대체 UI
## 2026-06-15 OAuth/JWT callback QA 학습 기록

이번 단계는 Google OAuth를 실제로 누르기 전, 백엔드 내부 인증 흐름을 테스트 코드로 검증한 작업이다.

### 관련 파일

| 파일 | 역할 |
| --- | --- |
| `backend/app/routers/auth.py` | `/auth/google/login`, `/auth/google/callback`, `/auth/me`, `/auth/refresh`, `/auth/logout` 라우터 |
| `backend/app/services/auth_service.py` | Google OAuth URL 생성, Google token/profile 요청, JungleLog token 발급/교체 |
| `backend/app/core/security.py` | JWT 생성/검증, refresh token 랜덤 생성, refresh token hash 처리 |
| `backend/app/repositories/auth_token_repository.py` | refresh token hash 저장, 활성 여부 확인, 폐기 처리 |
| `backend/app/repositories/user_repository.py` | Google profile 기반 사용자 생성/갱신, 관리자 이메일 판별 |
| `backend/app/core/config.py` | OAuth/JWT/cookie 환경 변수 설정 |
| `backend/.env.example` | 사용자가 직접 채워야 하는 OAuth/JWT 설정 예시 |

### 흐름 이해

```txt
/login 화면 Google 버튼 클릭
-> 프론트가 /auth/google/login으로 이동
-> 백엔드가 OAuth state cookie 저장
-> Google OAuth URL로 redirect
-> Google 로그인 성공 후 /auth/google/callback 호출
-> 백엔드가 state 검증
-> Google code를 Google access token으로 교환
-> Google profile에서 sub/email/name을 읽음
-> JungleLog user 생성 또는 갱신
-> access token JWT 발급
-> refresh token 원문 발급 후 DB에는 hash만 저장
-> access/refresh token을 HttpOnly cookie로 내려줌
-> 프론트로 redirect
-> 프론트가 /auth/me로 현재 사용자 상태 확인
```

### 이번에 이해해야 할 핵심

- Google OAuth의 `code`는 JungleLog 로그인 토큰이 아니라, Google token을 받기 위한 임시 교환권이다.
- `state`는 CSRF 방어용 값이다. 로그인 시작 때 cookie에 저장하고 callback 때 query 값과 비교한다.
- access token은 짧게 쓰는 JWT다. 지금 설정은 15분이다.
- refresh token은 길게 쓰는 랜덤 문자열이다. DB에는 원문을 저장하지 않고 hash만 저장한다.
- refresh token rotation은 refresh 할 때마다 새 refresh token을 발급하고 기존 token을 폐기하는 방식이다.
- HttpOnly cookie를 쓰면 프론트 JavaScript가 token 값을 직접 읽지 않는다. 대신 `credentials: "include"` 요청으로 브라우저가 자동 전송한다.
- 최초 로그인 사용자는 바로 서비스 권한을 받지 않고 `승인 대기` 상태가 된다.

### 추가로 공부할 키워드

- OAuth 2.0 Authorization Code Flow
- CSRF state parameter
- JWT access token
- refresh token rotation
- HttpOnly cookie
- SameSite cookie
- token hashing
- FastAPI TestClient
- dependency override

## 2026-06-15 승인 대기 화면 UX 개선 학습 기록

이번 작업은 인증이 성공했지만 서비스 사용 승인이 끝나지 않은 사용자의 화면 흐름을 다듬은 작업이다.

### 수정한 파일

| 파일 | 역할 |
| --- | --- |
| `frontend/src/app/pages/auth/PendingApproval.tsx` | 승인 대기/거절/정지/승인 완료 상태 안내 화면 |
| `frontend/src/app/contexts/AuthContext.tsx` | `/auth/me`, `/auth/refresh`, `/auth/logout` 기반 전역 로그인 상태 관리 |

### 사용한 React 개념

- `useAuth`: 전역 인증 상태와 인증 관련 함수를 가져오는 custom hook이다.
- `useNavigate`: 버튼 클릭 후 코드로 라우트를 이동할 때 사용한다.
- 조건부 렌더링: `approvalStatus`가 `승인 완료`인지에 따라 버튼 구성을 다르게 보여준다.
- async event handler: 로그아웃 API 호출이 끝난 뒤 로그인 화면으로 이동한다.

### 코드 흐름

```txt
PendingApproval 렌더링
-> MainLayout outlet context에서 user, role, approvalStatus를 받음
-> useAuth에서 refreshCurrentUser, logout을 받음
-> 승인 완료면 대시보드 이동 버튼 표시
-> 미승인이면 승인 상태 다시 확인 / 로그아웃 버튼 표시
-> 승인 상태 다시 확인: /auth/me와 refresh 흐름을 다시 실행
-> 로그아웃: /auth/logout 호출 후 /login 이동
```

### 이해해야 할 핵심

- 로그인 상태와 승인 상태는 다르다.
- 로그인은 Google OAuth와 JWT cookie로 확인한다.
- 서비스 접근 가능 여부는 `approvalStatus === "승인 완료"`까지 확인해야 한다.
- 이미 로그인된 사용자를 `/login`으로 보내면 `Login.tsx`가 다시 `/pending-approval`로 돌려보내므로 UX 순환이 생긴다.
- 그래서 승인 대기 화면에서는 로그인 버튼보다 `상태 다시 확인`과 `로그아웃`이 자연스럽다.

## 2026-06-15 실제 API 시나리오 QA 학습 기록

이번 QA는 단일 API 하나가 아니라 JungleLog의 핵심 사용자 흐름을 실제 API 호출 순서대로 확인한 작업이다.

### 검증한 사용자 역할

| 역할 | 확인한 일 |
| --- | --- |
| ADMIN | 최초 관리자 로그인, 학생 승인, 코치 role 부여 |
| STUDENT | 승인 전 차단, 승인 후 게시글/댓글/포트폴리오/리뷰 요청 생성 |
| COACH | 승인 후 댓글 작성, 리뷰 인박스 조회, 피드백 작성 |

### API 흐름

```txt
관리자 OAuth 로그인
-> 학생 OAuth 로그인
-> 코치 OAuth 로그인
-> 승인 전 학생 POST /posts 차단 확인
-> ADMIN PATCH /admin/users/{student_id}
-> ADMIN PATCH /admin/users/{coach_id}
-> STUDENT POST /posts
-> STUDENT GET /me/posts
-> STUDENT POST /posts/{post_id}/comments
-> COACH POST /posts/{post_id}/comments
-> STUDENT POST /portfolio/projects
-> STUDENT PUT /portfolio/projects/{project_id}/posts
-> STUDENT PATCH /portfolio/projects/{project_id}
-> STUDENT GET /review-requests/coaches
-> STUDENT POST /review-requests
-> COACH GET /review-requests/inbox
-> COACH PATCH /review-requests/{id}
-> STUDENT DELETE /review-requests/{id} 실패 확인
```

### 이해해야 할 핵심

- 인증은 로그인 여부만 확인한다.
- 승인 상태는 서비스 접근 가능 여부를 결정한다.
- role은 어떤 기능을 쓸 수 있는지 결정한다.
- ADMIN은 승인과 role을 관리한다.
- STUDENT는 자신의 기록과 포트폴리오를 만들고 리뷰를 요청한다.
- COACH는 학생이 요청한 리뷰를 받아 피드백을 작성한다.
- 테스트에서 rollback을 쓰면 실제 DB에 QA 데이터가 남지 않는다.
- 한글 상태값을 CLI 테스트로 보낼 때는 터미널 인코딩도 신경 써야 한다.

### 추가 학습 키워드

- Integration Test
- TestClient
- DB transaction rollback
- Role-based access control
- Approval workflow
- API scenario testing
