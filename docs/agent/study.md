
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

## 2026-06-15 브라우저 로그인 UX QA 학습 기록

이번 QA는 코드와 API 테스트만으로는 알 수 없는 실제 브라우저 라우팅 흐름을 확인한 작업이다.

### 확인한 흐름

```txt
브라우저에서 / 접속
-> AuthContext가 /auth/me 확인
-> 비로그인으로 판단
-> MainLayout이 /login으로 redirect
-> Login 화면 표시
```

```txt
브라우저에서 /posts/new 직접 접속
-> MainLayout 진입 전 인증 확인
-> user가 없으므로 /login으로 redirect
-> 보호된 글쓰기 화면은 렌더링되지 않음
```

### 이해해야 할 핵심

- 프론트 라우터 보호는 백엔드 API 보호와 별개로 사용자 경험을 좋게 만든다.
- 실제 보안은 백엔드 `get_current_approved_user`, `require_roles`가 담당한다.
- 프론트 redirect는 사용자가 막힌 이유를 자연스럽게 이해하도록 돕는 역할이다.
- 콘솔 error가 없는지도 화면 QA에서 중요한 확인 항목이다.

## 2026-06-15 README 정리 학습 기록

이번 작업은 기능 구현이 아니라 제출물 문서 품질을 실제 구현 상태에 맞게 정리한 작업이다.

### 왜 README를 다시 썼는가

기존 README는 개발 과정에서 쌓인 구현 일지가 계속 붙어 있었다. 초반 React mock UI 단계 설명과 현재 실제 API 연결 상태가 동시에 남아 있으면, 평가자가 현재 프로젝트가 mock인지 실제 API 기반인지 헷갈릴 수 있다.

### README에 넣은 구조

```txt
프로젝트 개요
-> 현재 구현 상태
-> 사용자 흐름
-> 전체 아키텍처
-> 폴더 구조
-> 라우트
-> 주요 API
-> AI 기능 설계
-> 실행 방법
-> 환경 변수
-> QA 결과
-> 데모
-> 회고와 한계
-> 학습/운영 문서 링크
```

### 이해해야 할 핵심

- README는 구현 일지가 아니라 프로젝트의 현재 상태를 설명하는 문서다.
- 오래된 계획이나 이전 mock 설명은 log/study 문서에 남기고, README는 최신 상태 중심으로 유지하는 편이 좋다.
- 아직 구현하지 않은 기능은 `완료`처럼 쓰지 말고 `다음 단계` 또는 `예정`으로 명확히 구분해야 한다.
- AI 과제 제출물에서는 RAG/MCP/Agent를 실제 구현 여부와 설계 예정 상태로 분리해서 설명해야 한다.

## 2026-06-15 OAuth 실패 UX 학습 기록

이번 작업은 성공한 로그인 흐름이 아니라 실패한 OAuth 흐름을 사용자 경험 관점에서 다듬은 작업이다.

### 수정한 파일

| 파일 | 역할 |
| --- | --- |
| `backend/app/routers/auth.py` | OAuth 실패를 프론트 로그인 화면으로 redirect |
| `frontend/src/app/pages/auth/Login.tsx` | `authError` query string을 읽어 실패 안내 표시 |

### 코드 흐름

```txt
Google OAuth callback 실패
-> FastAPI가 HTTPException JSON을 직접 보여주지 않음
-> /login?authError=... 로 303 redirect
-> Login.tsx가 useSearchParams로 authError 읽음
-> 로그인 실패 안내 + Google 로그인 버튼 표시
```

### 이해해야 할 핵심

- API 에러가 항상 JSON으로 보이는 것이 좋은 UX는 아니다.
- OAuth callback은 브라우저가 직접 방문하는 URL이라 실패 시 프론트 화면으로 돌려보내는 편이 자연스럽다.
- `urlencode`를 사용하면 한글 에러 메시지도 URL query string으로 안전하게 전달할 수 있다.
- 실패한 OAuth state cookie는 다시 사용하지 못하게 삭제하는 편이 안전하다.

## 2026-06-15 브라우저 메타/레거시 Layout 정리

### 수정한 파일

| 파일 | 역할 |
| --- | --- |
| `frontend/index.html` | 브라우저 탭 제목, HTML 언어, 검색/공유용 description 메타 정보를 정의한다. |
| `frontend/src/app/components/Layout.tsx` | 실제 라우트에서 사용하지 않는 이전 mock 레이아웃 파일이라 삭제했다. |
| `README.md` | 현재 구현 상태와 QA 결과에 브라우저 메타 정리 내용을 반영했다. |

### 이해해야 할 개념

- `index.html`은 React 앱이 마운트되기 전 브라우저가 먼저 읽는 HTML 진입점이다.
- `<title>`은 브라우저 탭 이름으로 보이고, 서비스 이름이 잘못 남아 있으면 실제 서비스처럼 보이지 않는다.
- `<html lang="ko">`는 현재 화면 언어가 한국어임을 브라우저와 접근성 도구에 알려준다.
- 사용하지 않는 컴포넌트 파일은 빌드에는 영향이 없을 수 있지만, 오래된 라우트와 mock 데이터가 남아 있으면 학습/유지보수 과정에서 혼란을 만든다.

### 이번 작업의 핵심

- 예전 이름인 정글포트폴리오 흔적을 JungleLog로 정리했다.
- 실제로 import되지 않는 레거시 `DashboardLayout`, `AuthLayout` 파일을 삭제했다.
- 실제 로그인/권한 흐름은 `layouts/MainLayout.tsx`, `layouts/AuthLayout.tsx`, `RoleGate.tsx`, `AuthContext.tsx`가 담당한다.

### 다음에 확인할 것

- 실제 Google 계정으로 로그인했을 때 브라우저 탭 제목이 `JungleLog`로 보이는지 확인한다.
- 관리자 계정 로그인 후 승인 화면, 학생/코치 승인 후 각 역할 화면 분기가 자연스러운지 확인한다.

## 2026-06-15 OAuth 설정 검증 학습 기록

### 이번에 확인한 것

- `.env` 값 자체는 읽거나 출력하지 않고, 설정이 비어 있는지 여부만 확인했다.
- `/auth/google/login`은 실제 Google 서버로 요청을 보내는 API가 아니라, 브라우저를 Google OAuth URL로 보내는 redirect 응답을 만든다.
- OAuth 로그인 시작 시 서버는 `state` 값을 cookie에 저장한다.
- callback에서 돌아온 `state`와 cookie의 `state`를 비교해서 CSRF 계열 공격을 줄인다.

### 코드 흐름

```txt
프론트 로그인 버튼 클릭
-> GET /auth/google/login
-> 백엔드가 Google OAuth URL 생성
-> OAuth state cookie 저장
-> 브라우저가 accounts.google.com으로 이동
-> 사용자가 Google 계정 선택/동의
-> Google이 /auth/google/callback으로 code/state 전달
```

### 이해해야 할 포인트

- `client_id`는 앱을 식별하는 값이고, `client_secret`은 백엔드에서만 보관해야 하는 비밀값이다.
- redirect URI는 Google Cloud Console에 등록된 값과 백엔드 설정값이 정확히 같아야 한다.
- `ADMIN_EMAILS`는 최초 관리자 계정을 자동 승인하기 위한 로컬 초기 설정이다.
- 자동 QA로는 redirect URL 생성까지 확인할 수 있고, 실제 Google 계정 선택/동의는 수동 QA가 필요하다.

## 2026-06-15 Vite 환경변수 학습 기록

### 수정한 파일

| 파일 | 역할 |
| --- | --- |
| `frontend/src/app/api/client.ts` | 모든 프론트 API 함수가 공유하는 백엔드 주소와 에러 메시지 처리 함수가 있다. |
| `frontend/.env.example` | 프론트에서 필요한 환경변수 예시를 보여준다. |
| `README.md` | 프론트 환경변수 설정 방법을 문서화했다. |

### 이해해야 할 개념

- Vite에서 프론트 코드가 읽을 수 있는 환경변수는 `VITE_` 접두사가 필요하다.
- `import.meta.env.VITE_API_BASE_URL`은 빌드 시점에 주입되는 값이다.
- 프론트 환경변수는 브라우저에 노출될 수 있으므로 API 주소처럼 공개 가능한 값만 넣어야 한다.
- 백엔드 비밀값은 `GOOGLE_CLIENT_SECRET`, `JWT_SECRET_KEY`처럼 서버에서만 사용해야 한다.

### 코드 흐름

```txt
client.ts
-> VITE_API_BASE_URL이 있으면 그 값 사용
-> 없으면 http://localhost:8000 사용
-> 마지막 / 제거
-> posts.ts, auth.ts, comments.ts 등이 API_BASE_URL을 import해서 fetch 호출
```

### 핵심 포인트

- 하드코딩된 주소는 로컬에서는 편하지만 배포나 포트 변경 때 불편하다.
- 설정값을 환경변수로 빼면 로컬/배포 환경을 코드 수정 없이 바꿀 수 있다.
- `replace(/\/$/, "")`는 URL 끝의 `/` 하나를 제거해서 `/posts` 같은 path를 붙일 때 `//posts`가 되지 않게 한다.

## 2026-06-15 DB 초기화에서 개발용 사용자 seed 제거

### 수정한 파일

| 파일 | 역할 |
| --- | --- |
| `backend/app/db/init_db.py` | 테이블 생성과 기본 게시판 카테고리 seed를 담당한다. |
| `README.md` | 현재 구현 상태에 개발용 demo 사용자 자동 생성 제거를 반영했다. |

### 왜 수정했는가

실제 Google OAuth/JWT 흐름이 들어온 이후에는 사용자가 Google 로그인으로 생성되어야 한다. DB 초기화 단계에서 개발용 사용자를 자동으로 만들면 관리자 승인 목록에 가짜 사용자가 섞이고, “현재 로그인 사용자 기준”이라는 흐름을 흐릴 수 있다.

### 바뀐 흐름

```txt
이전:
init_db()
-> 테이블 생성
-> 기본 카테고리 생성
-> 개발용 사용자 생성
-> 개발용 게시글/태그 생성

현재:
init_db()
-> 테이블 생성
-> 기본 카테고리 생성
```

### 이해해야 할 개념

- seed data는 앱이 동작하기 위해 필요한 기준 데이터와 개발 편의를 위한 샘플 데이터로 나눠서 봐야 한다.
- `post_categories`는 게시글 작성/필터에 필요한 기준 데이터라 유지한다.
- 사용자와 게시글은 실제 서비스 데이터라 OAuth 로그인과 API 요청으로 생성되어야 한다.
- 이미 로컬 DB에 들어간 예전 개발용 데이터는 코드 변경만으로 자동 삭제되지 않는다.

## 2026-06-15 로컬 DB cleanup 학습 기록

### 이번 작업에서 배운 점

- 코드에서 seed 생성을 제거해도 이미 DB에 들어간 row는 자동으로 삭제되지 않는다.
- 실제 서비스처럼 QA하려면 코드 상태와 DB 상태를 둘 다 봐야 한다.
- 삭제 전에는 연결된 데이터 개수를 먼저 조회해야 한다.
- 삭제는 post_tags, comments, posts, users처럼 FK가 걸린 하위 데이터부터 지워야 한다.
- 삭제 후에는 같은 조건으로 다시 조회해서 실제로 사라졌는지 확인해야 한다.

### 삭제 순서 개념

```txt
user 확인
-> user가 작성한 post id 목록 확인
-> post_tags 삭제
-> comments 삭제
-> posts 삭제
-> user 삭제
-> 같은 email 조회 count = 0 확인
```

### 핵심 포인트

- DB cleanup은 코드 수정과 달리 git에 남지 않는 로컬 상태 변경이다.
- 그래서 log/test 문서에 무엇을 지웠고 왜 지웠는지 남겨야 한다.
- 실제 운영 환경에서는 이런 삭제를 직접 DB에서 하기보다 migration, admin 기능, 운영 스크립트로 관리한다.

## 2026-06-15 OAuth 기존 이메일 사용자 매칭 학습 기록

### 수정한 파일

| 파일 | 역할 |
| --- | --- |
| `backend/app/repositories/user_repository.py` | Google OAuth profile을 JungleLog `users` row로 연결하거나 새로 생성한다. |
| `README.md` | 현재 구현 상태에 기존 이메일 사용자와 Google sub 연결 처리를 반영했다. |

### 왜 수정했는가

OAuth 로그인은 보통 Google의 `sub` 값을 기준으로 사용자를 찾는다. 그런데 관리자 초기 계정처럼 같은 이메일의 사용자가 DB에 이미 있을 수 있다. 이때 `google_sub`만 보고 새 사용자를 만들면 `users.email` unique 제약에 걸릴 수 있다.

### 바뀐 매칭 순서

```txt
1. google_sub로 사용자 조회
2. 없으면 verified email로 사용자 조회
3. email 사용자가 있으면 그 row에 google_sub 연결
4. 둘 다 없으면 새 사용자 생성
```

### 이해해야 할 핵심

- Google `sub`는 가장 안정적인 로그인 식별자다.
- 이메일은 unique 제약이 있으므로 같은 이메일 row가 이미 있을 때 새 row를 만들면 안 된다.
- Google userinfo에서 email_verified를 확인한 뒤 받은 이메일이므로 기존 계정 연결 기준으로 사용할 수 있다.
- 기존 관리자 role과 승인 상태는 유지하고, Google sub와 마지막 로그인 정보만 갱신한다.

## 2026-06-15 브라우저 OAuth 진입 흐름 학습 기록

### 이번에 확인한 흐름

```txt
/login 화면
-> Google로 계속하기 버튼 클릭
-> /auth/google/login 호출
-> 백엔드가 Google OAuth URL로 redirect
-> 브라우저가 accounts.google.com 로그인 화면으로 이동
```

### 중요한 개념

- 프론트 로그인 버튼은 직접 Google API를 호출하지 않는다.
- 버튼은 백엔드의 `/auth/google/login`으로 이동시키고, 백엔드가 Google OAuth URL을 만들어 redirect한다.
- OAuth state는 백엔드가 cookie로 저장하고, callback에서 돌아온 state와 비교한다.
- `/posts/new` 같은 보호 라우트는 로그인 전 접근 시 `/login`으로 돌려보내야 한다.

### 아직 사람이 직접 해야 하는 이유

Google 계정 선택과 동의 화면은 실제 개인 계정 인증 과정이다. 계정 선택, 2단계 인증, 권한 동의 같은 부분은 자동화보다 사용자가 직접 확인하는 것이 안전하다.

## 2026-06-15 관리자 메뉴와 라우트 보호 학습

### 수정한 파일

- `frontend/src/app/layouts/MainLayout.tsx`
  - 로그인한 사용자의 role에 따라 사이드바 메뉴를 고르는 파일이다.
  - `adminNavItems` 배열에서 관리자용 대시보드 메뉴를 제거했다.
- `README.md`
  - 관리자 메뉴 정책을 현재 구현 상태에 맞게 정리했다.

### 코드 흐름

1. `useAuth()`가 현재 로그인 사용자의 `user.role`과 `approvalStatus`를 가져온다.
2. `MainLayout`은 승인 완료 여부를 먼저 본다.
3. 승인 완료 사용자라면 role에 따라 `studentNavItems`, `coachNavItems`, `adminNavItems` 중 하나를 고른다.
4. 고른 배열을 `NavLink`로 반복 렌더링해서 사이드바 메뉴가 된다.
5. 따라서 화면에 메뉴가 보이는지 여부는 route보다 먼저 `navItems` 배열을 확인해야 한다.

### 이번에 이해해야 할 React 개념

- 배열 렌더링: `navItems.map(...)`
- 조건부 렌더링: role에 따라 다른 메뉴 배열 선택
- `NavLink`: 현재 URL과 메뉴 path를 비교해서 active 스타일을 주는 라우터 컴포넌트
- redirect: ADMIN이 `/`에 접근하면 `Dashboard.tsx`에서 `/admin/users`로 이동한다.

### 백엔드/AI 전까지 남은 구분

- 관리자 메뉴, OAuth/JWT, 게시글/댓글/포트폴리오/코치 리뷰 API 연결은 AI 전 단계 범위다.
- 실제 AI 도우미, RAG, MCP, Agent 호출은 다음 큰 단계에서 구현한다.
- 알림 API와 GitHub 실제 분석도 AI/외부 연동 단계로 남아 있다.

## 2026-06-15 학생 화면 QA 개선 학습 기록

이번 구현을 이해하려면 알아야 하는 개념:

### 수정한 주요 파일과 역할

| 파일 | 역할 |
| --- | --- |
| `backend/app/routers/me.py` | 현재 로그인한 사용자의 프로필 조회/수정 API를 담당한다. |
| `backend/app/main.py` | FastAPI 앱 생성, CORS, 라우터 등록, 정적 파일 제공 경로를 담당한다. |
| `backend/app/repositories/user_repository.py` | users 테이블을 직접 읽고 수정하는 DB 접근 함수를 모은다. |
| `backend/app/repositories/post_repository.py` | posts 테이블 조회와 조회수 증가 같은 DB 작업을 담당한다. |
| `frontend/src/app/api/client.ts` | API base URL, 에러 메시지 파싱, 업로드 이미지 URL 변환을 담당한다. |
| `frontend/src/app/pages/settings/Settings.tsx` | 프로필 이름과 이미지를 수정하는 화면이다. |
| `frontend/src/app/pages/portfolio/Portfolio.tsx` | GitHub repo 기반 프로젝트 등록, 선택, 연결 기록 확인을 담당한다. |
| `frontend/src/app/pages/posts/PostEdit.tsx` | 게시글 작성/수정 폼을 담당한다. |
| `frontend/src/app/pages/posts/PostDetail.tsx` | 게시글 상세, 댓글, GitHub repo 연결 버튼을 담당한다. |
| `frontend/src/app/pages/ai/AIAssistant.tsx` | AI 연결 전 프로젝트 기반 참고자료와 초안 보관함 UI를 보여준다. |

### FastAPI 개념

- `UploadFile`: 브라우저에서 업로드한 파일을 FastAPI가 받는 타입이다.
- `Form`: JSON body가 아니라 form-data 필드를 받을 때 사용한다.
- `StaticFiles`: 서버 폴더에 저장된 이미지를 `/uploads/...` URL로 제공할 때 사용한다.
- `HTTPException`: 파일 형식이나 크기가 잘못됐을 때 400 에러를 명확히 반환한다.

### React 개념

- `FormData`: 파일과 텍스트를 함께 API로 보낼 때 사용한다.
- `useState`: 업로드할 파일, 미리보기 URL, 저장 메시지 같은 화면 상태를 관리한다.
- `useEffect`: 로그인 사용자 정보가 바뀌면 설정 폼 값을 다시 맞춘다.
- 조건부 렌더링: 프로필 이미지가 있으면 `img`, 없으면 이름 첫 글자 avatar를 보여준다.

### TypeScript/API 개념

- 프론트 타입에 `profileImageUrl`, `authorProfileImageUrl` 같은 응답 필드를 추가했다.
- 백엔드 응답 필드와 프론트 타입 이름이 맞아야 화면에서 avatar를 안정적으로 렌더링할 수 있다.
- `resolveApiAssetUrl()`은 `/uploads/...` 상대 경로를 `http://localhost:8000/uploads/...` 절대 URL로 바꾼다.

### 나중에 백엔드/AI와 더 연결될 부분

- 현재 GitHub repo URL은 수동 등록이다. 나중에는 GitHub API 또는 MCP로 README, 커밋, 언어 정보를 자동 분석한다.
- AI 도우미의 포트폴리오 글/면접 질문 생성은 아직 OpenAI/RAG/MCP/Agent 호출 전이다.
- 알림은 아직 API 연결 전 샘플 UI다.

### 추가 학습 키워드

- multipart/form-data
- FastAPI UploadFile
- StaticFiles
- FormData
- optimistic UI와 refetch
- API error parsing
- side effect가 있는 GET 요청의 장단점

## 2026-06-15 코치 리뷰 인박스 미리보기 학습 기록

이번 구현을 이해하려면 알아야 하는 개념:

### 수정한 파일과 역할

| 파일 | 역할 |
| --- | --- |
| `backend/app/schemas/review.py` | 프론트로 내려줄 리뷰 요청 응답 필드를 정의한다. |
| `backend/app/services/review_service.py` | DB 모델을 화면에 필요한 응답 형태로 조립한다. |
| `frontend/src/app/api/reviews.ts` | 리뷰 요청 API 응답 타입을 TypeScript로 정의한다. |
| `frontend/src/app/pages/coach/CoachReview.tsx` | 코치 인박스, 요청 상세, 피드백 작성 UI를 담당한다. |

### 핵심 흐름

```txt
코치가 /coach-review 접속
-> getReviewInbox() 호출
-> FastAPI /review-requests/inbox
-> review_service.build_review_request_response()
-> targetSummary / targetPreview / targetLinkUrl 포함 응답
-> CoachReview.tsx에서 요청 상세 패널에 미리보기 표시
```

### 백엔드 개념

- API 응답은 DB 테이블 그대로 내려주는 것이 아니라, 화면이 읽기 좋은 형태로 조립해서 내려준다.
- `ReviewRequest`는 post 또는 portfolio 중 하나를 target으로 가진다.
- 같은 응답 필드라도 target type에 따라 채우는 기준이 달라질 수 있다.
  - post: `summary`, `content`, 관련 GitHub URL
  - portfolio: `summary`, 저장된 포트폴리오 초안, GitHub URL

### React 개념

- 선택된 요청 id와 textarea 상태는 따로 관리되므로, 선택 요청이 바뀌면 feedback state를 다시 맞춰야 한다.
- 포트폴리오 리뷰는 코치가 학생의 관리 화면에 들어가는 것이 아니라, 코치 인박스 안에서 필요한 미리보기를 보는 흐름이 더 자연스럽다.
- 외부 링크는 `target="_blank"`와 `rel="noreferrer"`를 함께 사용한다.

### 내가 이해해야 할 포인트

- 프론트에서 필요한 데이터가 부족하면 무조건 새 API를 만들기보다, 기존 응답에 화면이 필요한 필드를 추가할 수 있다.
- 권한이 다른 사용자는 같은 대상이라도 다른 화면으로 접근해야 한다.
- 코치 피드백은 리뷰 요청에 저장되는 별도 피드백이고, 게시글 댓글과는 다른 기능이다.

### 추가 학습 키워드

- DTO / response schema
- selectinload
- 조건부 렌더링
- 상태 동기화
- 권한별 읽기 전용 화면

## 2026-06-15 알림 API 연결 학습 기록

이번 구현을 이해하려면 알아야 하는 개념:

### 수정/추가한 파일과 역할

| 파일 | 역할 |
| --- | --- |
| `backend/app/db/models/notification.py` | 알림 테이블 모델. 기존에 준비되어 있던 모델을 사용했다. |
| `backend/app/schemas/notification.py` | 알림 API 응답 형태를 정의한다. |
| `backend/app/repositories/notification_repository.py` | notifications 테이블을 직접 조회/수정한다. |
| `backend/app/services/notification_service.py` | 현재 사용자 기준 응답을 조립한다. |
| `backend/app/routers/notifications.py` | 알림 조회/읽음 처리 HTTP endpoint를 제공한다. |
| `backend/app/services/review_service.py` | 리뷰 요청/피드백 이벤트에서 알림을 생성한다. |
| `backend/app/services/admin_user_service.py` | 관리자 승인/역할 변경 이벤트에서 알림을 생성한다. |
| `frontend/src/app/api/notifications.ts` | 프론트에서 알림 API를 호출한다. |
| `frontend/src/app/layouts/MainLayout.tsx` | 헤더 알림 드롭다운을 실제 API 데이터로 렌더링한다. |

### 백엔드 흐름

```txt
이벤트 발생
예: 리뷰 요청 생성 / 코치 피드백 저장 / 관리자 승인 변경
-> notification_repository.create_notification()
-> notifications 테이블에 row 저장
-> 헤더에서 GET /notifications 호출
-> 최근 알림과 unreadCount 반환
```

### 프론트 흐름

```txt
MainLayout 렌더링
-> 승인 완료 사용자면 GET /notifications 호출
-> unreadCount가 있으면 종 아이콘에 빨간 점 표시
-> 알림 드롭다운 열기
-> 알림 클릭 시 PATCH /notifications/{id}/read
-> linkUrl이 있으면 해당 화면으로 이동
```

### 알아야 할 개념

- 알림은 독립적인 기능이지만 실제로는 다른 도메인 이벤트에서 생성된다.
- repository는 DB row를 직접 다루고, service는 화면/API에 맞는 응답으로 조립한다.
- `isRead` 같은 화면 상태도 DB에 저장해야 다른 화면에 갔다 와도 유지된다.
- 프론트에서 빈 상태는 mock 문구가 아니라 실제 API 응답 `items.length === 0` 기준으로 보여준다.

### 나중에 개선할 부분

- 지금은 사용자가 새로고침하거나 드롭다운을 열 때 알림을 가져온다.
- 실시간으로 도착하는 알림은 WebSocket 또는 SSE 단계에서 구현한다.
- 알림 종류별 아이콘/색상 분기는 이후 UX 개선으로 추가할 수 있다.

### 추가 학습 키워드

- notification table
- unread count
- event driven notification
- REST PATCH
- WebSocket
- SSE

## 2026-06-15 리뷰 요청-피드백-알림 왕복 QA 학습 기록

이번 QA를 이해하려면 알아야 하는 개념:

### 검증한 흐름

```txt
학생 게시글 생성
-> 학생이 코치 리뷰 요청 생성
-> 코치에게 알림 생성
-> 코치 인박스에서 요청 조회
-> 코치가 피드백 저장
-> 학생에게 알림 생성
```

### 왜 서비스 레이어로 검증했나

- 이 흐름은 단순 UI 표시가 아니라 여러 도메인이 연결된다.
- 게시글, 리뷰 요청, 리뷰 요청-코치 연결, 알림이 모두 함께 움직여야 한다.
- API만 보는 것보다 서비스 레이어를 직접 통과시키면 DB 연결과 비즈니스 규칙을 함께 확인할 수 있다.

### 확인한 파일 역할

| 파일 | 확인한 역할 |
| --- | --- |
| `backend/app/services/review_service.py` | 리뷰 요청 생성, 코치 피드백 저장, 알림 생성 트리거 |
| `backend/app/repositories/review_repository.py` | 리뷰 대상 게시글/코치 조회, 인박스 조회 |
| `backend/app/repositories/notification_repository.py` | 알림 row 생성과 조회 |
| `backend/app/db/models/review_request.py` | 리뷰 요청 본문 테이블 |
| `backend/app/db/models/review_request_coach.py` | 한 요청에 여러 코치를 연결하는 중간 테이블 |
| `backend/app/db/models/notification.py` | 사용자별 알림 저장 테이블 |

### 배운 점

- 하나의 사용자 행동은 여러 테이블 변경을 만들 수 있다.
- 리뷰 요청은 학생 관점에서는 “보낸 요청”이고, 코치 관점에서는 “받은 인박스”다.
- 같은 review_requests row를 역할별로 다르게 조회한다.
- 알림은 실제 이벤트가 성공한 뒤 생성해야 사용자에게 거짓 알림이 가지 않는다.
- PowerShell에서 Python stdin으로 한글을 넘길 때 인코딩이 깨질 수 있어, QA 스크립트에서는 코드 상수 사용이 더 안전하다.

### 추가 학습 키워드

- integration test
- service layer test
- many-to-many table
- event side effect
- test data cleanup
- character encoding

## 2026-06-15 �л� ��ġ ���� ��û ȭ�� QA �н� ���

�̹��� ������ ����:

| ���� | ���� |
| --- | --- |
| `frontend/src/app/pages/coach/CoachReview.tsx` | �л��� ���� ��û ���� ȭ��, ��ġ�� ���� �ιڽ� ȭ���� ���� ��������. �̹����� �л� ȭ�鿡�� �� �Խñ��� ���� ������� �ҷ����� API ȣ�� ũ�⸦ �����ߴ�. |

�̹� ������ �����Ϸ��� �˾ƾ� �ϴ� ����:

### FastAPI Query ������ HTTP 422

�鿣�� `/me/posts` ����ʹ� `size: int = Query(default=50, ge=1, le=50)`ó�� ��û���� ������ �����Ѵ�.

- `ge=1`: 1 �̻��̾�� �Ѵ�.
- `le=50`: 50 ���Ͽ��� �Ѵ�.
- ����Ʈ�� `size=100`�� ������ FastAPI�� ��û�� �����ϰ� 422 Validation Error�� ��ȯ�Ѵ�.

### API ���

����Ʈ����� �鿣�� API�� ����ϴ� query parameter ������ ���Ѿ� �Ѵ�.
�̹� ������ ȭ�� ���� ��ü�� �ƴ϶� ����Ʈ API ȣ�Ⱚ�� �鿣�� ���� ���� �ʾƼ� �����.

### React useEffect�� ������ �ε�

`StudentReviewView`�� ó�� �������� �� `useEffect` �ȿ��� `loadStudentReviewData()`�� ȣ���Ѵ�.
�� �Լ��� `getMyPosts`, `getPortfolioProjects`, `getCoachOptions`, `getMyReviewRequests`�� ���ÿ� ȣ���ؼ� ���� ��û ȭ�鿡 �ʿ��� �����͸� �غ��Ѵ�.

### Promise.all

���� API�� ���ÿ� ��û�ϰ� ��� �������� �� ȭ�� state�� �� ���� ä���.
�ϳ��� �����ϸ� catch �������� �̵��ϹǷ�, `getMyPosts`�� 422�� �����ϸ� �Խñۻ� �ƴ϶� ��ġ/��û ��ϱ��� ���� ǥ�õ��� ���� �� �ִ�.

�ڵ� �帧:

```txt
/coach-review ����
-> MainLayout�� /auth/me�� ���� ����� role Ȯ��
-> role�� STUDENT�� StudentReviewView ������
-> useEffect ����
-> loadStudentReviewData ȣ��
-> getMyPosts({ visibility: "all", size: 50 }) ȣ��
-> posts state�� �� �Խñ� ����
-> targetId�� ù ��° �Խñ� id�� ����
-> ���� ��û ��� ��ϰ� �̸����⿡ ǥ��
```

���� �����ؾ� �� �ٽ� ����Ʈ:

- ȭ�鿡 ���̴� ���� ������ �����δ� �鿣�� validation error�� �� �ִ�.
- ����Ʈ ȭ���� ��� ���� ���� mock ������ ������ �ƴ϶� API ���� ���и� ���� �ǽ��ؾ� �Ѵ�.
- �鿣�� Query ���Ѱ��� ����Ʈ API helper�� �⺻���� ���� �¾ƾ� �Ѵ�.
- ��� �̸��� `REVIEW_TARGET_POST_PAGE_SIZE`ó�� �ǹ� �ְ� ����� �� 50���� �����ϱ� ����.

���߿� �鿣��� ����� �κ�:

- ����� pagination UI ���� �ִ� 50���� �ҷ��´�.
- �Խñ��� 50���� ������ ���� ��û ��� ���� UI�� ���������̼��̳� �˻� API ������ �ʿ��ϴ�.
- ��������δ� `keyword` �˻��� �Բ� ��� �Խñ��� ã�� ����� �ʿ��ϴ�.

�߰��� ������ Ű����:

- HTTP 422 Validation Error
- FastAPI Query
- API contract
- React useEffect
- Promise.all
- pagination
## 2026-06-15 ��ġ �ιڽ� QA �н� ���

�̹��� ������ ����:

| ���� | ���� |
| --- | --- |
| `frontend/src/app/layouts/MainLayout.tsx` | �α��� ������� role�� ���� ���̵�� �޴��� ������. �̹����� COACH �޴����� ��ú��带 �����ߴ�. |
| `frontend/src/app/pages/dashboard/Dashboard.tsx` | `/` �⺻ ȭ���̴�. �̹����� COACH�� �����ϸ� ��ġ ���� �ιڽ��� �̵��ϵ��� �����ߴ�. |

�̹� �������� �˾ƾ� �ϴ� React ����:

### ���Ǻ� �����

`Dashboard`�� role�� ���� �ٸ� ȭ������ ������ ���ҵ� �Ѵ�.

```tsx
if (role === "ADMIN") {
  return <Navigate to="/admin/users" replace />;
}

if (role === "COACH") {
  return <Navigate to="/coach-review" replace />;
}
```

`Navigate`�� ����ڰ� Ư�� URL�� ������ �� �ٸ� URL�� �̵���Ű�� React Router ������Ʈ��.

### ���Һ� �޴� ����

`MainLayout`�� `user.role`�� �������� `studentNavItems`, `coachNavItems`, `adminNavItems` �� �ϳ��� ������.

```txt
STUDENT -> ��ú���, ��ü �Խñ�, �� ���, ��Ʈ������ ����, AI �����, ��ġ ���� ��û, ����
COACH -> ��ġ ���� �ιڽ�, ��ü �Խñ�, ����
ADMIN -> ����� ����, ��ü �Խñ�, ����
```

### �� ��ġ ��ú��带 �����߳�

��ġ�� �л�ó�� ���� ����� ���ų� ��Ʈ�������� �����ϴ� ����ڰ� �ƴϴ�.
��ġ�� �ٽ� ������ �л��� ���� ���� ��û�� Ȯ���ϰ� �ǵ���ϴ� ���̴�.
�׷��� COACH�� �⺻ ���� ȭ���� ��ú��庸�� `/coach-review`�� �� �ڿ�������.

�̹� �������� ����� �鿣��/API ����:

- ��ġ �ιڽ��� `GET /review-requests/inbox` ������ ����Ѵ�.
- ���� ������ `PATCH /review-requests/{id}` �帧�� ����Ѵ�.
- ����� �ǵ���� �ٽ� inbox API�� �����ͼ� textarea ������ ǥ�õȴ�.

�ڵ� �帧:

```txt
COACH �α���
-> MainLayout�� /auth/me ������ role�� Ȯ��
-> coachNavItems ����
-> ���̵�ٿ��� ��ġ ���� �ιڽ� / ��ü �Խñ� / ������ ǥ��
-> / ���� �� Dashboard���� /coach-review�� redirect
-> CoachReview�� getReviewInbox() ȣ��
-> ��û ��ϰ� ���õ� ��û �� ǥ��
-> ���� ��ư Ŭ�� �� updateReviewRequest() ȣ��
-> �������� ���� request�� requests state�� �ݿ�
```

���� �����ؾ� �� �ٽ� ����Ʈ:

- ����Ʈ���� �޴��� ����� �Ͱ� �鿣�� ���� �˻�� �ٸ� ������.
- �޴��� UX�� �����ϱ� ���� ���̰�, ���� ������ �鿣�� `require_roles()`�� ����Ѵ�.
- role ��� ȭ���� ������ ���� ���Ρ��� �ƴ϶� �������� �⺻ ������ ������������ ���� �����ؾ� �Ѵ�.
- QA�� ���� DB role�� �ӽ÷� �ٲ�ٸ� �ݵ�� ���� role�� �����ؾ� �Ѵ�.

�߰��� ������ Ű����:

- React Router Navigate
- role based navigation
- route guard
- service workflow QA
- UI role design
## 2026-06-15 �л� �ǵ��/�˸� QA �н� ���

�̹��� ���� ������ �ڵ� ������ ����, ���� ���� �帧�� �����ߴ�.
�׷��� �� QA�� �����Ϸ��� �Ʒ� ���ϵ��� ������ �˾ƾ� �Ѵ�.

| ���� | ���� |
| --- | --- |
| `backend/app/services/review_service.py` | ���� ��û ����, ��ġ �ǵ�� ����, �л�/��ġ �˸� ���� �帧�� ����Ѵ�. |
| `backend/app/repositories/notification_repository.py` | �˸� row�� ����� ��ȸ/���� ó���Ѵ�. |
| `frontend/src/app/pages/coach/CoachReview.tsx` | STUDENT���Դ� ���� ��û ����/��û ��� ȭ��, COACH���Դ� �ιڽ� ȭ���� �����ش�. |
| `frontend/src/app/layouts/MainLayout.tsx` | ��� �˸� ��Ӵٿ�� `/notifications` API�� ȣ���ϰ�, �˸� Ŭ�� �� ���� ó���Ѵ�. |

�̹� QA���� Ȯ���� �ڵ� �帧:

```txt
��ġ�� �ǵ�� ����
-> review_service.update_review_request()
-> review_requests.status / feedback ������Ʈ
-> notification_repository.create_notification()
-> �л����� review-feedback �˸� ����
-> �л��� /coach-review ����
-> getMyReviewRequests() ȣ��
-> ���� ���� ��û ��Ͽ� �ǵ�� �Ϸ�� �ǵ�� ���� ǥ��
-> ��� �˸� ��ư Ŭ��
-> getNotifications() ȣ��
-> �ǵ�� �˸� ǥ��
-> �˸� Ŭ��
-> markNotificationRead() ȣ��
-> unreadCount ����
```

�̹��� �����ؾ� �� �ٽ� ����:

### �̺�Ʈ�� ���ۿ�

���� �ǵ�� ������ �ܼ��� `review_requests` row�� �ٲٴ� �۾��� �ƴϴ�.
�л����� �˷��� �ϹǷ� `notifications` row�� ���� �����.
�̷� ���� �̺�Ʈ�� ���ۿ��̶�� �� �� �ִ�.

### ���� �������� ���Һ� ȭ�� ����

���� `review_requests` row�� STUDENT�� COACH�� ���� �ǹ̰� �ٸ���.

- STUDENT: ���� ���� ��û�� ���� �ǵ��
- COACH: ������ ���� ��û�� ó���ؾ� �� �ǵ�� �۾�

### �˸� ���� ó��

�˸��� �ܼ� ǥ�ð� �ƴ϶� `is_read` ���¸� ������.
�˸��� Ŭ���ϸ� `PATCH /notifications/{id}/read`�� ȣ��ǰ�, ����Ʈ�� unread count�� �پ���.

��� ��:

- ��� �ϳ��� ���� ȭ�鿡 ���� ������ �� ȭ�鸸 ���� QA�δ� ������� �ʴ�.
- `���� ��û -> ��ġ �ǵ�� -> �л� ��û ��� -> �л� �˸�`ó�� �պ� �帧�� Ȯ���ؾ� ���� ����ó�� �����Ѵٰ� ���� �� �ִ�.
- QA�� �����ʹ� �ݵ�� unique prefix�� ���̰�, ������ ��Ȯ�� �ش� �����͸� �����ؾ� �Ѵ�.

�߰��� ������ Ű����:

- event side effect
- notification read state
- role based view
- integration QA
- service layer
## 2026-06-15 학습: 프론트가 백엔드 API 계약을 지켜야 하는 이유

이번에 본 파일:

- `frontend/src/app/pages/portfolio/Portfolio.tsx`
- `frontend/src/app/pages/ai/AIAssistant.tsx`

핵심 개념:

- FastAPI query validation: 백엔드가 `size`의 최대값을 `50`으로 정하면 그보다 큰 값은 422 validation error가 된다.
- API 계약: 프론트는 화면에서 필요한 데이터를 요청하더라도 백엔드가 허용한 파라미터 범위를 지켜야 한다.
- 상수화: 여러 곳에서 직접 숫자 `50`을 반복하기보다 의미 있는 이름의 상수로 두면 왜 그 값인지 이해하기 쉽다.
- `Promise.all`: 프로젝트 목록과 내 게시글 목록처럼 서로 독립적인 요청을 동시에 보내는 방식이다.
- `useEffect`: 화면이 처음 열리거나 query string의 project 값이 바뀔 때 데이터를 다시 불러온다.
- `useMemo`: 선택된 프로젝트의 `linkedPostIds`와 전체 게시글 목록을 비교해 연결된 기록만 계산한다.

코드 흐름:

1. 포트폴리오 화면이 열리면 `loadPortfolioData()`가 실행된다.
2. `getPortfolioProjects()`로 내 프로젝트 목록을 가져온다.
3. `getMyPosts({ visibility: "all", size: 50 })`로 기록 연결에 사용할 내 게시글을 가져온다.
4. 프로젝트를 선택하면 `linkedPostIds`와 게시글 id를 비교해 연결된 기록을 보여준다.
5. AI 도우미 화면은 URL의 `project` query string을 읽어 선택 프로젝트를 맞춘다.
6. 선택된 프로젝트와 연결 기록을 기반으로 현재는 OpenAI 호출 전 샘플 포트폴리오 초안을 만든다.
7. `포트폴리오 초안으로 저장`을 누르면 `PATCH /portfolio/projects/{id}`로 저장된 초안과 상태가 갱신된다.

이번에 막힌 부분:

- 화면에는 단순히 "데이터를 불러오지 못했습니다"처럼 보였지만 원인은 백엔드 validation error였다.
- Swagger/OpenAPI에서 `size`가 `maximum: 50`으로 표시되므로 프론트 호출값도 이를 맞춰야 한다.

백엔드 연결 후에도 기억할 점:

- 프론트가 임의로 큰 페이지 크기를 요청하면 서버가 거절할 수 있다.
- API 응답이 실패했을 때 화면에 표시되는 메시지만 보지 말고 Network 응답의 status code와 detail을 확인해야 한다.
- 같은 API를 여러 화면에서 쓰면 요청 파라미터 규칙을 공통 상수나 API 함수 레벨에서 관리하는 것도 고려할 수 있다.
## 2026-06-15 학습: 화면 문구와 개발 주석을 분리하기

이번에 본 파일:

- `frontend/src/app/pages/ai/AIAssistant.tsx`
- `frontend/src/app/pages/portfolio/Portfolio.tsx`
- `frontend/src/app/pages/posts/PostEdit.tsx`
- `frontend/src/app/pages/posts/PostDetail.tsx`
- `frontend/src/app/pages/posts/Posts.tsx`
- `frontend/src/app/pages/settings/Settings.tsx`

핵심 개념:

- 사용자 문구: 실제 사용자가 서비스를 이해하고 행동할 수 있게 돕는 문장이다.
- 개발 주석: 구현 이유, API 계약, 나중에 연결될 구조처럼 코드를 읽는 개발자를 위한 설명이다.
- 같은 내용이라도 화면에는 `게시글을 불러오는 중입니다`, 주석에는 `GET /posts/{id} 응답을 기다린다`처럼 다르게 써야 한다.
- AI 연결 전 화면은 `mock`, `샘플`, `구현 예정`이라는 단어를 과하게 보여주기보다 `미리보기`, `결과 구성`, `참고 자료`처럼 현재 사용자가 이해할 수 있는 흐름으로 표현하는 편이 자연스럽다.

코드 흐름에서 기억할 점:

1. `AIAssistant.tsx`는 아직 실제 OpenAI를 호출하지 않지만 프로젝트와 연결 기록으로 결과 미리보기를 만든다.
2. 그래서 주석에는 OpenAI/RAG/MCP 연결 예정 구조를 남기고, 화면에는 사용자가 누를 수 있는 버튼과 결과 중심 문구를 둔다.
3. `PostEdit.tsx`는 실제 게시글 저장 API와 연결되어 있으므로 사용자는 저장 사실만 알면 된다.
4. `Portfolio.tsx`는 GitHub repo 등록 이후 기록 연결과 AI 도우미 이동이 핵심이므로 내부 구현 방식보다 다음 행동을 안내해야 한다.

내가 이해해야 할 포인트:

- 화면 문구는 기능 설명서가 아니라 사용자의 다음 행동을 돕는 장치다.
- 개발 단계가 덜 끝났다는 사실을 숨기는 것이 아니라, 사용자가 지금 할 수 있는 행동을 중심으로 표현해야 한다.
- 기술 키워드는 README/study/api 문서에 자세히 쓰고, 서비스 화면에는 꼭 필요한 만큼만 남긴다.
## 2026-06-15 학습: 공통 API 에러 처리

이번에 본 파일:

- `frontend/src/app/api/client.ts`

핵심 개념:

- `unknown`: 어떤 타입인지 아직 모르는 값을 안전하게 다루기 위한 TypeScript 타입이다.
- type narrowing: `typeof`, `Array.isArray`, `in` 연산자로 값의 형태를 좁혀가며 안전하게 접근하는 방식이다.
- FastAPI validation error: 422 응답의 `detail`은 문자열 하나가 아니라 배열이나 객체 구조로 내려올 수 있다.
- 공통 함수: 여러 API 파일에서 같은 에러 처리 규칙을 쓰게 하면 화면마다 다른 방식으로 깨지는 일을 줄일 수 있다.

코드 흐름:

1. 각 API 함수는 `fetch()` 후 `response.ok`가 아니면 `getErrorMessage(response)`를 호출한다.
2. `getErrorMessage()`는 response JSON의 `detail`을 읽는다.
3. `detail`이 배열이면 각 item에서 읽을 수 있는 메시지만 추출한다.
4. `detail`이 객체이면 `msg` 또는 `message` 필드를 찾아 다시 읽는다.
5. 끝까지 문자열을 찾지 못하면 `데이터를 처리하지 못했습니다. 잠시 후 다시 시도해주세요.`를 반환한다.

왜 필요한가:

- JavaScript에서 객체를 억지로 문자열로 바꾸면 `[object Object]`가 된다.
- 사용자는 내부 응답 구조가 아니라 사람이 읽을 수 있는 안내를 봐야 한다.
- 백엔드 validation 구조가 조금 달라져도 프론트가 안전하게 fallback할 수 있어야 한다.
## 2026-06-15 학습: 브라우저 스모크 QA와 UX 문구 다듬기

이번에 본 파일:

- `frontend/src/app/layouts/MainLayout.tsx`
- `frontend/src/app/pages/posts/MyRecords.tsx`
- `frontend/src/app/pages/settings/Settings.tsx`
- `frontend/src/app/pages/coach/CoachReview.tsx`

핵심 개념:

- Smoke QA: 모든 기능을 깊게 테스트하기 전, 주요 화면이 열리고 큰 오류가 없는지 빠르게 훑는 검증이다.
- Empty state: 데이터가 없을 때 사용자가 다음 행동을 이해할 수 있게 도와주는 화면 상태다.
- UX writing: 기술 구현 설명보다 사용자가 지금 무엇을 할 수 있는지 알려주는 문장을 쓰는 것이다.
- Conditional rendering: `targetType`에 따라 `게시글이 없습니다`, `포트폴리오 프로젝트가 없습니다`처럼 다른 문장을 보여줄 수 있다.

이번 코드 흐름:

1. 현재 로그인 사용자를 STUDENT / 승인 완료로 임시 전환했다.
2. 브라우저에서 학생 주요 라우트 8개를 순회했다.
3. 각 화면의 본문 텍스트에서 raw object, debug 문구, 기술 문구가 보이는지 확인했다.
4. 문제 문구가 남은 파일을 찾아 사용자 관점 문장으로 고쳤다.
5. 다시 브라우저에서 `/my-records`, `/settings`, `/coach-review`를 확인했다.

내가 이해해야 할 포인트:

- `JWT 쿠키`, `backend/uploads`, `S3` 같은 말은 README나 study 문서에는 좋지만 일반 화면에는 부담스러울 수 있다.
- 빈 상태 문구는 단순히 "없습니다"가 아니라 사용자가 다음에 무엇을 해야 하는지 알려주는 편이 좋다.
- 조사 문제가 생길 수 있는 조건부 문장은 단어만 바꾸지 말고 문장 전체를 분기하는 게 안전하다.
## 2026-06-15 학습: 게시글 상세에서 summary와 content를 다르게 다루기

이번에 본 파일:

- `frontend/src/app/pages/posts/PostEdit.tsx`
- `frontend/src/app/pages/posts/PostDetail.tsx`

수정한 파일:

- `frontend/src/app/pages/posts/PostDetail.tsx`

핵심 개념:

- `summary`: 게시글 목록 카드에서 빠르게 훑어보라고 보여주는 짧은 설명이다.
- `content`: 게시글 상세 화면에서 실제로 읽는 본문이다.
- `PostEdit.tsx`의 `buildSummary()`는 아직 AI 요약이 없기 때문에 본문 앞부분을 잘라 summary를 만든다.
- 그래서 새 글을 작성하면 summary와 content의 시작 부분이 거의 같을 수 있다.
- 상세 화면에서 이 둘을 그대로 모두 보여주면 사용자는 같은 문장을 두 번 읽게 된다.

이번 코드 흐름:

1. 사용자가 `/posts/new`에서 본문을 작성한다.
2. 발행 시 `buildSummary(trimmedBody)`가 본문 앞부분으로 `summary`를 만든다.
3. 상세 화면 `/posts/:id`는 `getPostDetail()`로 `summary`와 `content`를 함께 받는다.
4. `shouldShowSummary(summary, content)`가 두 값을 공백 정리 후 비교한다.
5. summary가 없거나 content와 같거나 content의 시작 부분과 같으면 요약 카드를 숨긴다.
6. summary가 별도 요약 문장일 때만 상세 화면 상단에 보여준다.

이번에 이해해야 할 React/TypeScript 포인트:

- 조건부 렌더링: `{조건 && <Component />}` 형태로 조건이 true일 때만 UI를 그린다.
- optional chaining: `summary?.replace(...)`는 summary가 없을 때 안전하게 undefined를 반환한다.
- nullish coalescing: `?? ""`는 앞 값이 null 또는 undefined일 때 빈 문자열로 대체한다.
- helper function: JSX 안에 비교 로직을 길게 쓰지 않고 `shouldShowSummary()`로 분리하면 읽기 쉽다.

백엔드/AI 연결 후 바뀔 수 있는 부분:

- 나중에 OpenAI/RAG로 진짜 요약을 만들면 summary가 content 앞부분 복사본이 아니라 별도 요약이 될 수 있다.
- 그때도 지금 조건은 안전하다. 진짜 요약이면 content의 시작 부분과 완전히 같지 않으므로 상세에 표시된다.

## 2026-06-15 학습: 포트폴리오 등록 후 목록 유지와 중복 검사

이번에 본 파일:

- `frontend/src/app/pages/portfolio/Portfolio.tsx`
- `frontend/src/app/api/portfolio.ts`
- `backend/app/routers/portfolio.py`
- `backend/app/services/portfolio_service.py`
- `backend/app/repositories/portfolio_repository.py`

수정한 파일:

- `frontend/src/app/pages/portfolio/Portfolio.tsx`
- `backend/app/services/portfolio_service.py`
- `backend/app/repositories/portfolio_repository.py`

핵심 개념:

- 서버 저장 상태와 화면 목록 상태는 항상 같은 기준으로 맞아야 한다.
- 등록 API가 성공하면 화면 state만 믿지 말고 목록 API를 다시 호출해 DB 기준 최신 상태를 가져오는 편이 안전하다.
- 검색어가 남아 있으면 실제 데이터가 있어도 화면 목록에서 숨겨질 수 있다.
- 중복 검사는 프론트에서 한 번 막더라도 백엔드에서 반드시 다시 막아야 한다.
- GitHub repo 이름은 대소문자 차이만으로 다른 프로젝트가 아니므로 `owner/repo`를 소문자로 정규화했다.

이번 코드 흐름:

1. 학생이 `/portfolio`에서 GitHub repo URL을 입력한다.
2. `registerGithubProject()`가 URL에서 `owner/repo`를 파싱한다.
3. 프론트 목록에 이미 같은 repo가 있으면 기존 프로젝트를 선택하고 등록 요청을 보내지 않는다.
4. 프론트 목록이 오래됐을 수도 있으므로 백엔드도 `owner_id + lower(repo_full_name)` 기준으로 중복을 다시 확인한다.
5. 새 프로젝트 등록 성공 후 `loadPortfolioData(newProject.id)`로 목록을 다시 읽고, 방금 만든 프로젝트를 선택한다.
6. 중복 응답을 받은 경우에도 목록을 다시 읽고 기존 프로젝트를 선택한다.
7. 등록/중복 처리 후 `searchKeyword`를 비워서 방금 선택된 프로젝트가 목록에서 숨지 않게 한다.

이번에 이해해야 할 React/TypeScript 포인트:

- `useState`: `projects`, `selectedProjectId`, `searchKeyword`, `notice`, `errorMessage`가 화면 상태를 만든다.
- async function return: `loadPortfolioData()`가 이제 불러온 프로젝트 배열을 반환해, 중복 응답 후 기존 프로젝트를 바로 찾을 수 있다.
- 조건부 렌더링: `selectedProjectGithubHref`가 있을 때만 `GitHub 보기` 버튼을 활성화한다.
- URL normalization: 사용자가 `github.com/owner/repo`처럼 scheme 없이 입력해도 화면 링크는 `https://github.com/owner/repo`로 만든다.

백엔드 포인트:

- service layer는 GitHub URL을 `owner/repo`로 정규화한다.
- repository layer는 DB에서 중복 프로젝트를 조회한다.
- `func.lower()`를 사용해 PostgreSQL에서 저장된 repo 이름도 소문자로 비교한다.
- DB unique constraint만 믿으면 대소문자 차이 중복을 놓칠 수 있으므로 application layer에서도 정규화가 필요하다.

추가로 공부할 키워드:

- optimistic state vs server source of truth
- normalization
- case-insensitive duplicate check
- SQLAlchemy `func.lower`
- React controlled input
- empty/error state UX

## 2026-06-15 학습: 게시글 조회수와 댓글 수가 맞게 보이는 이유

이번에 본 파일:

- `backend/app/routers/posts.py`
- `backend/app/services/post_service.py`
- `backend/app/repositories/post_repository.py`
- `backend/app/schemas/post.py`
- `frontend/src/app/api/posts.ts`
- `frontend/src/app/pages/posts/Posts.tsx`
- `frontend/src/app/pages/posts/PostDetail.tsx`

핵심 개념:

- `view_count`: posts 테이블에 저장되는 조회수 컬럼이다.
- `comments`: comments 테이블을 `post_id`별로 count해서 응답에 붙이는 계산값이다.
- 목록 API는 게시글 목록과 댓글 수 dict를 함께 가져와 `views`, `comments`로 응답한다.
- 상세 API는 접근 가능한 게시글을 찾은 뒤 `view_count`를 1 증가시키고 상세 응답을 만든다.
- 댓글 작성 API는 comments row를 만들고, 목록 API는 다음 조회 때 그 row를 count한다.

백엔드 흐름:

1. `GET /posts`가 `post_service.get_posts()`를 호출한다.
2. `post_repository.list_posts()`가 공개 게시글 목록을 가져온다.
3. 같은 함수에서 `get_comment_counts()`로 게시글별 댓글 수를 한 번에 계산한다.
4. `build_post_list_item()`이 `post.view_count`를 `views`, 댓글 count를 `comments`로 넣는다.
5. `GET /posts/{post_id}`가 `post_service.get_post_detail()`을 호출한다.
6. `post_repository.get_accessible_post_by_id()`가 접근 가능한 글을 찾고 `increase_post_view_count()`를 호출한다.
7. 증가된 `view_count`와 현재 댓글 수가 상세 응답으로 내려간다.

프론트 흐름:

1. `Posts.tsx`는 `getPosts()`로 목록을 불러온다.
2. 목록 카드에서 `post.views`, `post.comments`를 그대로 표시한다.
3. `PostDetail.tsx`는 `getPostDetail()`로 상세를 불러온다.
4. 상세 화면 상단은 댓글 목록 로딩 후 `comments.length`를 표시한다.
5. 댓글 작성에 성공하면 새 댓글을 state에 추가하므로 상세 화면의 댓글 수가 바로 늘어난다.

이번 QA에서 배운 점:

- 숫자 표시가 맞는지는 화면만 보면 헷갈릴 수 있으므로 API 순서를 정해서 검증해야 한다.
- 댓글 수는 post row에 저장하지 않고 comments table을 count하는 방식이 더 일관적이다.
- 조회수는 상세 조회라는 이벤트가 발생할 때 posts row의 `view_count`를 직접 증가시킨다.
- 목록에서 보이는 숫자는 결국 다음 목록 API 호출 때 최신 DB 값을 다시 받는다.

추가로 공부할 키워드:

- aggregate count
- N+1 query
- SQL `group by`
- derived field
- view count side effect
- API response DTO

## 2026-06-15 학습: 게시글 작성 후 코치 리뷰 대상에 보이는 흐름

이번에 본 파일:

- `frontend/src/app/pages/coach/CoachReview.tsx`
- `frontend/src/app/api/reviews.ts`
- `frontend/src/app/api/posts.ts`
- `backend/app/routers/reviews.py`
- `backend/app/services/review_service.py`
- `backend/app/repositories/review_repository.py`

핵심 개념:

- 리뷰 요청 대상 목록은 별도 mock data가 아니라 현재 로그인 사용자의 `GET /me/posts` 응답으로 만든다.
- `visibility=all`을 사용하기 때문에 내 공개글과 비공개글 모두 리뷰 대상 후보가 될 수 있다.
- 학생이 리뷰 요청을 보내면 `review_requests` row와 `review_request_coaches` 연결 row가 함께 생긴다.
- 코치에게는 알림이 생성되고, 학생의 `내가 보낸 요청 목록`에는 방금 생성한 요청이 추가된다.
- 프론트는 요청 생성 응답을 받아 `setRequests((prev) => [createdRequest, ...prev])`로 화면 목록을 즉시 갱신한다.

프론트 흐름:

1. 학생이 `/coach-review`에 들어간다.
2. `StudentReviewView`가 mount되면서 `loadStudentReviewData()`를 실행한다.
3. `getMyPosts({ visibility: "all", size: 50 })`로 내 게시글을 불러온다.
4. `getPortfolioProjects()`로 내 포트폴리오 프로젝트를 불러온다.
5. `getCoachOptions()`로 승인 완료 코치 목록을 불러온다.
6. `getMyReviewRequests()`로 내가 보낸 요청 목록을 불러온다.
7. target type이 `post`이면 게시글 배열이 select option이 된다.
8. 사용자가 리뷰 요청을 보내면 `createReviewRequest()`가 호출된다.
9. 성공 응답으로 받은 요청을 requests state 앞에 추가한다.

백엔드 흐름:

1. `POST /review-requests`는 STUDENT 또는 ADMIN만 호출할 수 있다.
2. 대상이 post이면 `review_repository.get_post_target()`으로 현재 사용자의 게시글인지 확인한다.
3. 대상이 portfolio이면 `get_project_target()`으로 현재 사용자의 프로젝트인지 확인한다.
4. coachIds는 `get_approved_coaches_by_ids()`로 실제 승인 완료 코치인지 확인한다.
5. `create_review_request()`가 리뷰 요청 row와 코치 연결 row를 만든다.
6. 코치에게 `review-request` 알림을 만든다.
7. 응답은 `ReviewRequestResponse` 형태로 target title, category, coach names, status 등을 포함한다.

이번 QA에서 배운 점:

- 화면에 select option이 안 보일 때는 프론트 state만 보지 말고 `GET /me/posts` 응답부터 확인해야 한다.
- 작성 직후 리뷰 대상에 나타나려면 게시글 저장 API, 내 글 조회 API, 리뷰 화면 mount 시점이 모두 맞아야 한다.
- `size` query 제한처럼 API 계약이 어긋나면 화면에는 단순히 빈 목록처럼 보일 수 있다.
- 실제 브라우저 QA는 API QA로 놓치기 쉬운 “select option, 미리보기, 요청 목록 반영”을 확인하는 데 필요하다.

추가로 공부할 키워드:

- React mount 시점
- Promise.all
- select controlled value
- role based API guard
- join table
- notification side effect

## 2026-06-15 학습: AI 도우미 보관함과 클립보드 복사 흐름

이번에 본 파일:

- `frontend/src/app/pages/ai/AIAssistant.tsx`
- `frontend/src/app/pages/portfolio/Portfolio.tsx`
- `frontend/src/app/api/portfolio.ts`
- `backend/app/schemas/portfolio.py`
- `backend/app/db/models/portfolio_project.py`

파일별 역할:

- `AIAssistant.tsx`: 포트폴리오 프로젝트를 선택하고, 선택 프로젝트 기준으로 포트폴리오 글/면접 예상 질문 결과를 구성하는 화면이다.
- `Portfolio.tsx`: GitHub 프로젝트 등록, 연결 기록, 저장된 포트폴리오 초안, 면접 질문 진입 버튼을 보여준다.
- `portfolio.ts`: 프론트에서 포트폴리오 API를 호출하고 응답 타입을 정의한다.
- `portfolio.py`: 백엔드 포트폴리오 요청/응답 schema다.
- `portfolio_project.py`: DB의 `portfolio_projects` 테이블 구조다.

이번 구현에서 사용한 React 개념:

- `useState`: 선택 프로젝트, 결과 유형, 저장 안내, 복사 안내 상태를 관리한다.
- `useMemo`: 선택 프로젝트와 연결된 게시글 목록을 계산한다.
- 조건부 렌더링: 프로젝트가 없으면 빈 상태를 보여주고, 있으면 생성 기준/보관함/결과 패널을 보여준다.
- controlled input: 프로젝트 select와 결과 유형 radio가 state를 기준으로 움직인다.
- 이벤트 핸들러: 복사 버튼과 다시 구성 버튼을 눌렀을 때 각각 함수가 실행된다.

이번 구현에서 사용한 브라우저 API:

- `navigator.clipboard.writeText(text)`: 브라우저 클립보드에 텍스트를 복사한다.
- `document.createElement("textarea")`: clipboard API가 막혔을 때 fallback 복사용 임시 textarea를 만든다.
- `document.execCommand("copy")`: 선택된 textarea 내용을 복사하는 오래된 방식이다. 최신 방식이 실패할 때 보조로 사용했다.

코드 흐름:

1. AI 도우미 화면이 열리면 `getPortfolioProjects()`와 `getMyPosts()`를 함께 호출한다.
2. query string의 `project` 값이 있으면 해당 프로젝트를 우선 선택한다.
3. 선택 프로젝트와 연결된 게시글을 `linkedRecords`로 계산한다.
4. 결과 유형이 `portfolio`이면 포트폴리오 초안 문자열을 구성한다.
5. 결과 유형이 `interview`이면 면접 예상 질문 문자열을 구성한다.
6. `생성 결과 보관함`은 저장된 포트폴리오 초안과 현재 생성된 면접 질문 상태를 보여준다.
7. 복사 버튼을 누르면 먼저 `navigator.clipboard.writeText()`를 시도한다.
8. 실패하면 임시 textarea를 만들어 선택하고 `execCommand("copy")`로 다시 복사를 시도한다.

내가 이해해야 할 핵심 포인트:

- 화면에 `AI 단계 예정`, `mock`, `debug` 같은 말이 보이면 개발자는 편하지만 사용자는 서비스가 덜 완성된 것처럼 느낀다.
- 실제 AI 호출이 없어도 사용자가 이해할 수 있는 흐름은 만들 수 있다.
- 버튼은 보이면 눌렀을 때 최소한 기대되는 동작이 있어야 한다.
- `navigator.clipboard`는 보안/권한/브라우저 정책에 따라 실패할 수 있으므로 fallback을 둘 수 있다.
- 지금 DB에는 `savedPortfolioDraft`만 있으므로 면접 질문 영구 저장은 이후 별도 테이블 또는 컬럼 설계가 필요하다.

나중에 백엔드/AI와 연결될 부분:

- OpenAI API 호출로 실제 포트폴리오 글 생성
- RAG로 연결된 게시글과 README를 검색해 참고 문맥 구성
- MCP로 GitHub repo/README/커밋 정보 가져오기
- Agent가 포트폴리오 글, 요약, 면접 질문 중 필요한 도구를 선택하는 흐름
- 면접 예상 질문 저장용 테이블 또는 AI 생성 결과 테이블 설계

추가로 공부할 키워드:

- Clipboard API
- graceful fallback
- derived state
- query string 기반 초기 선택
- optimistic UI와 persisted UI 차이
- AI result history table

## 2026-06-15 학습: 프로필 이미지 업로드와 응답 전파

이번에 본 파일:

- `frontend/src/app/pages/settings/Settings.tsx`
- `frontend/src/app/api/auth.ts`
- `backend/app/routers/me.py`
- `backend/app/repositories/user_repository.py`
- `backend/app/schemas/auth.py`
- `backend/app/schemas/post.py`
- `backend/app/schemas/comment.py`
- `backend/app/schemas/review.py`

파일별 역할:

- `Settings.tsx`: 사용자가 이름과 프로필 이미지를 선택하고 저장하는 화면이다.
- `auth.ts`: `FormData`를 만들어 `/me/profile`로 보내는 API client다.
- `me.py`: FastAPI에서 multipart form 요청을 받아 이름과 이미지 파일을 처리한다.
- `user_repository.py`: DB의 users row에 수정된 이름과 이미지 URL을 저장한다.
- `auth.py`: 현재 사용자 응답에 `profileImageUrl`을 포함한다.
- `post.py`, `comment.py`, `review.py`: 게시글/댓글/리뷰 요청 응답에 작성자 이미지 필드를 포함한다.

이번 구현에서 사용한 프론트 개념:

- `FormData`: JSON이 아니라 파일을 포함한 요청을 보낼 때 사용한다.
- file input: `<input type="file">`로 브라우저에서 파일을 선택한다.
- preview URL: `URL.createObjectURL(file)`로 선택한 이미지를 저장 전 미리 보여준다.
- `credentials: "include"`: HttpOnly cookie 인증을 API 요청에 포함한다.
- `refreshCurrentUser()`: 저장 후 현재 사용자 정보를 다시 불러와 헤더/사이드바 아바타도 최신 상태로 맞춘다.

이번 구현에서 사용한 백엔드 개념:

- `UploadFile`: FastAPI에서 업로드 파일을 받을 때 사용하는 타입이다.
- `Form`: multipart form의 일반 문자열 필드를 받을 때 사용한다.
- `File`: multipart form의 파일 필드를 받을 때 사용한다.
- content type 검증: png/jpeg/webp/gif만 허용해 잘못된 파일 업로드를 막는다.
- 파일 크기 제한: 2MB를 넘으면 400을 반환한다.
- 정적 파일 서빙: `/uploads/...` 경로로 저장된 이미지를 브라우저에서 볼 수 있게 한다.

코드 흐름:

1. 사용자가 설정 화면에서 이름을 수정하고 이미지를 선택한다.
2. 프론트는 `FormData`에 `name`, `profileImage`를 넣는다.
3. `PATCH /me/profile` 요청을 보낸다.
4. 백엔드는 현재 로그인 사용자를 cookie JWT로 찾는다.
5. 이름을 trim하고 빈 값이면 400을 반환한다.
6. 이미지가 있으면 타입과 크기를 검사한다.
7. 파일명을 `user-{id}-{uuid}` 형태로 만들어 `backend/uploads/profiles`에 저장한다.
8. DB의 `users.name`, `users.profile_image_url`을 갱신한다.
9. 응답은 `profileImageUrl` camelCase 필드로 내려간다.
10. 게시글/댓글/리뷰 응답은 관계된 `user.profile_image_url`을 각각 author/requester/coach image 필드로 내려준다.

내가 이해해야 할 핵심 포인트:

- 이미지는 DB에 직접 binary로 저장하지 않고, 파일은 저장소에 두고 DB에는 URL/path만 저장한다.
- Google profile 이미지는 최초 기본값이고, 사용자가 업로드한 이미지는 재로그인으로 덮어쓰면 안 된다.
- `profile_image_url`은 DB 컬럼명이고, 프론트 응답에서는 `profileImageUrl`로 받는다.
- 게시글/댓글/리뷰 화면에서 아바타를 보여주려면 각 API 응답에 이미지 URL이 포함되어야 한다.
- 로컬 개발에서는 `backend/uploads`를 써도 되지만, 배포 시에는 S3 같은 외부 스토리지로 바꾸는 편이 좋다.

추가로 공부할 키워드:

- multipart/form-data
- FastAPI UploadFile
- StaticFiles
- file validation
- object storage
- signed URL
- DTO field alias

## 2026-06-15 학습: 학생 게시글 CRUD 화면 흐름

이번에 본 파일:

- `frontend/src/app/pages/posts/PostEdit.tsx`
- `frontend/src/app/pages/posts/PostDetail.tsx`
- `frontend/src/app/pages/posts/MyRecords.tsx`
- `frontend/src/app/api/posts.ts`
- `frontend/src/app/api/comments.ts`
- `backend/app/routers/posts.py`
- `backend/app/routers/comments.py`

파일별 역할:

- `PostEdit.tsx`: `/posts/new`와 `/posts/:id/edit`을 함께 담당하는 작성/수정 폼이다.
- `PostDetail.tsx`: 게시글 상세, GitHub repo 보기, 댓글 작성/삭제, 게시글 삭제 확인 UI를 담당한다.
- `MyRecords.tsx`: 현재 로그인 사용자가 작성한 글을 `/me/posts`로 불러와 보여준다.
- `posts.ts`: 게시글 목록/상세/작성/수정/삭제 API client다.
- `comments.ts`: 댓글 목록/작성/삭제 API client다.
- `posts.py`: FastAPI 게시글 router다.
- `comments.py`: FastAPI 댓글 router다.

이번 구현에서 사용한 React 개념:

- `useParams`: `/posts/:id`, `/posts/:id/edit`의 `id` 값을 읽는다.
- `useNavigate`: 작성/수정/삭제 후 다른 화면으로 이동한다.
- `useEffect`: 화면이 열릴 때 기존 게시글, 댓글, 관련 게시글을 API로 불러온다.
- `useState`: 입력값, 로딩 상태, 에러, 댓글 목록, 삭제 확인 상태를 관리한다.
- controlled input: 제목, 본문, GitHub URL, 댓글 입력값을 React state와 연결한다.
- 조건부 렌더링: 로딩/빈 상태/에러/삭제 확인 UI를 상태에 따라 보여준다.

이번 구현에서 사용한 TypeScript 개념:

- API 응답 타입: `PostDetailApiResponse`, `PostListApiItem`, `CommentApiItem`으로 응답 모양을 명확히 한다.
- union type: `UserRole`처럼 가능한 role 값을 제한한다.
- null 처리: GitHub URL이나 프로필 이미지가 없을 수 있으므로 `string | null`을 고려한다.

코드 흐름:

1. 학생이 `/posts/new`에 들어간다.
2. `PostEdit.tsx`가 제목/본문/GitHub URL 입력값을 state로 관리한다.
3. `발행하기`를 누르면 `createPost(payload)`가 `POST /posts`를 호출한다.
4. 성공하면 `navigate(/posts/{createdPost.id})`로 상세 화면에 이동한다.
5. `PostDetail.tsx`는 URL id를 `useParams()`로 읽고 `getPostDetail(id)`를 호출한다.
6. 같은 id로 `getPostComments(id)`를 호출해 댓글을 불러온다.
7. 댓글 작성 시 `createPostComment(id, content)`를 호출하고, 성공 응답을 `comments` state에 추가한다.
8. 내 기록 화면은 `getMyPosts({ visibility: "all" })`로 현재 사용자의 글만 불러온다.
9. 수정 화면은 `getPostDetail(id)`로 기존 데이터를 가져와 작성 폼에 채운다.
10. 삭제 버튼은 확인 UI를 열고, `deletePost(id)` 성공 후 `/posts`로 이동한다.

이번에 수정한 점:

- 댓글 시간은 API 응답의 ISO timestamp를 그대로 보여주면 사용자에게 딱딱하게 느껴진다.
- 그래서 `formatDateTime()`을 추가해 `new Date(dateText).toLocaleString("ko-KR")`로 변환했다.
- API 데이터는 저장/전송에는 정확한 ISO가 좋지만, 화면 표시는 사용자가 읽기 쉬운 형태로 바꾸는 편이 좋다.

내가 이해해야 할 핵심 포인트:

- 작성 화면과 수정 화면은 같은 컴포넌트를 써도 URL과 `isEditMode`로 동작을 나눌 수 있다.
- `useParams()`는 URL 안의 값을 읽고, `useNavigate()`는 코드에서 화면 이동을 시킨다.
- 댓글 작성 후 전체 페이지를 새로고침하지 않아도 state에 새 댓글을 추가하면 화면이 바로 바뀐다.
- 삭제는 DB row를 바로 지우기보다 `deleted_at`을 채우는 soft delete 방식일 수 있다.
- 화면에 보이는 날짜는 API 원본 형식과 달라도 된다. 중요한 건 의미가 정확하고 사용자가 읽기 쉬운 것이다.

추가로 공부할 키워드:

- CRUD
- controlled form
- useParams
- useNavigate
- side effect
- soft delete
- optimistic UI
- ISO timestamp
- locale date formatting

---

## 2026-06-15 �н�: apiFetch, refresh retry, ������ ĳ��

�̹��� �� ����:

| ���� | ���� |
| --- | --- |
| `frontend/src/app/api/client.ts` | API ���� ����, ���� �޽��� ó��, `apiFetch()` refresh retry ��� |
| `frontend/src/app/api/auth.ts` | `/auth/me`, `/auth/refresh`, `/auth/logout`, ������ ���� API ��� |
| `frontend/src/app/api/reviews.ts` | ��ġ ���� ��û/�ιڽ�/�ǵ�� API ��� |
| `frontend/src/app/api/posts.ts` | �Խñ� ���/��/�ۼ�/����/���� API ��� |
| `frontend/src/app/api/comments.ts` | ��� ��ȸ/�ۼ�/���� API ��� |
| `frontend/src/app/api/portfolio.ts` | ��Ʈ������ ������Ʈ API ��� |
| `frontend/src/app/api/notifications.ts` | �˸� ��ȸ/���� ó�� API ��� |
| `frontend/src/app/api/admin.ts` | ������ ����� ���� API ��� |

�ٽ� ����:

- access token�� ª�� ���, refresh token�� �� access token�� �߱޹ޱ� ���� ��� ��ū�̴�.
- `credentials: "include"`�� HttpOnly cookie�� API ��û�� �Ǿ� ������ ���� �ʿ��ϴ�.
- �Ϲ� API�� 401�� ������ access token�� ������� �� �����Ƿ� `/auth/refresh`�� �� �� ȣ���� �� ���� ��û�� ��õ��� �� �ִ�.
- `cache: "no-store"`�� �������� `/auth/me`�� �ιڽ� ��ȸ ������ ���� ��� �־� role/menu/status�� ���� ���̴� ������ ���δ�.
- JWT���� role�� ���� �ʰ� user id�� �־����Ƿ� role ������ `/auth/me`�� DB�� �ٽ� �о�� ȭ�鿡 �ݿ��ȴ�.
- ���� �� �ִ� Vite dev server�� HMR state�� ���� �� �����Ƿ�, �̻��� Provider ������ ���� ���� Ȯ�� �� dev server ����۵� QA ������ �����Ѵ�.

�ڵ� �帧:

```txt
ȭ�� API �Լ� ȣ��
-> apiFetch(url, options)
-> fetch(url, credentials: "include")
-> 401�� �ƴϸ� �״�� ��ȯ
-> 401�̸� /auth/refresh POST
-> refresh ���� �� ���� ��û�� �� �� ��õ�
-> �����ϸ� ���� 401 ���� ��ȯ
-> ȭ���� getErrorMessage()�� �ȳ� ���� ǥ��
```

�̹��� �����ؾ� �� ����Ʈ:

1. `AuthContext`�� �� ���� �� �α��� ����ڸ� �д´�.
2. ������ �Խñ�/����/��Ʈ������ ���� ���� API�� access token ���Ḧ ���� �� �ִ�.
3. �׷��� ���� �ʱ�ȭ�� refresh�� ó���ϸ� �����ϰ�, ���� API client������ refresh retry�� �ʿ��ϴ�.
4. role�� DB���� �����Ƿ� ������/��ġ/�л� ��ȯ QA �Ŀ��� `/auth/me` ĳ�ø� ���ƾ� �ֽ� �޴��� ���δ�.
5. ������ ȭ���� �̻��ϸ� DB, ���� HTTP API, React ȭ���� �и��ؼ� Ȯ���ؾ� �Ѵ�.

�߰� ���� Ű����:

- fetch wrapper
- retry policy
- 401 Unauthorized
- refresh token rotation
- HttpOnly cookie
- browser cache
- Vite HMR
- source of truth

---

## 2026-06-16 학습: AI 도우미 면접 질문 저장 흐름

이번에 본 파일:

| 파일 | 역할 |
| --- | --- |
| `frontend/src/app/pages/ai/AIAssistant.tsx` | 프로젝트를 선택하고 포트폴리오 글 또는 면접 예상 질문 결과를 저장하는 화면 |
| `frontend/src/app/pages/portfolio/Portfolio.tsx` | 선택한 포트폴리오 프로젝트의 저장된 초안과 면접 질문을 보여주는 화면 |
| `frontend/src/app/api/portfolio.ts` | 프론트엔드가 포트폴리오 API 응답/요청 타입을 정의하는 파일 |
| `backend/app/schemas/portfolio.py` | FastAPI가 포트폴리오 요청/응답 모양을 문서화하고 검증하는 Pydantic schema |
| `backend/app/db/models/portfolio_project.py` | `portfolio_projects` 테이블의 SQLAlchemy 모델 |
| `backend/app/repositories/portfolio_repository.py` | DB row 생성/수정 같은 실제 저장 작업을 담당하는 계층 |
| `backend/app/services/portfolio_service.py` | 화면/API에 맞는 응답을 조립하는 비즈니스 계층 |
| `backend/app/db/init_db.py` | 로컬 개발 DB 테이블과 v1 보강 column을 준비하는 파일 |

핵심 개념:

- API 응답 타입과 DB column은 서로 연결되어야 한다. 화면에서 `savedInterviewQuestions`를 쓰려면 백엔드 응답 schema와 DB 모델에도 같은 의미의 필드가 필요하다.
- 프론트엔드는 camelCase(`savedInterviewQuestions`)를 쓰고, 백엔드는 Python 스타일 snake_case(`saved_interview_questions`)를 쓴다.
- Pydantic `alias`는 이 두 이름 차이를 연결한다.
- `Base.metadata.create_all()`은 없는 테이블은 만들지만, 이미 존재하는 테이블에 새 column을 자동으로 추가하지 않는다.
- 그래서 Alembic을 도입하기 전 로컬 학습 단계에서는 `ALTER TABLE ... ADD COLUMN IF NOT EXISTS`로 nullable column을 보강했다.

코드 흐름:

```txt
AI 도우미에서 프로젝트 선택
-> 결과 유형을 포트폴리오 글 또는 면접 예상 질문으로 선택
-> 저장 버튼 클릭
-> PATCH /portfolio/projects/{project_id}
-> 포트폴리오 글이면 savedPortfolioDraft 저장
-> 면접 질문이면 savedInterviewQuestions 저장
-> 백엔드가 aiDraftSaved / aiInterviewSaved 상태를 계산해 응답
-> 프론트 state의 해당 프로젝트를 updatedProject로 교체
-> 포트폴리오 관리 화면에서 저장된 결과를 다시 표시
```

이번에 이해해야 할 포인트:

1. 화면에서 보이는 값이 생기려면 프론트 타입, 백엔드 schema, DB 모델, service 응답 조립이 같이 맞아야 한다.
2. 포트폴리오 글 초안과 면접 질문은 둘 다 AI 결과물이지만 저장 위치와 버튼 문구를 다르게 보여주는 편이 이해하기 쉽다.
3. 지금은 실제 OpenAI 호출 전이므로 결과 생성은 샘플이지만, 저장 흐름은 실제 API와 DB를 탄다.
4. 나중에 OpenAI/RAG/MCP/Agent를 붙여도 저장 endpoint는 그대로 재사용할 수 있다.

추가 공부 키워드:

- Pydantic alias
- DTO / Schema
- nullable column
- database migration
- SQL ALTER TABLE
- SQLAlchemy model
- repository pattern
- service layer

---

## 2026-06-16 �н�: AI ����� ���� ���� ���� �帧

�̹��� �� ����:

| ���� | ���� |
| --- | --- |
| `frontend/src/app/pages/ai/AIAssistant.tsx` | ������Ʈ�� �����ϰ� ��Ʈ������ �� �Ǵ� ���� ���� ���� ����� �����ϴ� ȭ�� |
| `frontend/src/app/pages/portfolio/Portfolio.tsx` | ������ ��Ʈ������ ������Ʈ�� ����� �ʾȰ� ���� ������ �����ִ� ȭ�� |
| `frontend/src/app/api/portfolio.ts` | ����Ʈ���尡 ��Ʈ������ API ����/��û Ÿ���� �����ϴ� ���� |
| `backend/app/schemas/portfolio.py` | FastAPI�� ��Ʈ������ ��û/���� ����� ����ȭ�ϰ� �����ϴ� Pydantic schema |
| `backend/app/db/models/portfolio_project.py` | `portfolio_projects` ���̺��� SQLAlchemy �� |
| `backend/app/repositories/portfolio_repository.py` | DB row ����/���� ���� ���� ���� �۾��� ����ϴ� ���� |
| `backend/app/services/portfolio_service.py` | ȭ��/API�� �´� ������ �����ϴ� ����Ͻ� ���� |
| `backend/app/db/init_db.py` | ���� ���� DB ���̺��� v1 ���� column�� �غ��ϴ� ���� |

�ٽ� ����:

- API ���� Ÿ�԰� DB column�� ���� ����Ǿ�� �Ѵ�. ȭ�鿡�� `savedInterviewQuestions`�� ������ �鿣�� ���� schema�� DB �𵨿��� ���� �ǹ��� �ʵ尡 �ʿ��ϴ�.
- ����Ʈ����� camelCase(`savedInterviewQuestions`)�� ����, �鿣��� Python ��Ÿ�� snake_case(`saved_interview_questions`)�� ����.
- Pydantic `alias`�� �� �� �̸� ���̸� �����Ѵ�.
- `Base.metadata.create_all()`�� ���� ���̺��� ��������, �̹� �����ϴ� ���̺��� �� column�� �ڵ����� �߰����� �ʴ´�.
- �׷��� Alembic�� �����ϱ� �� ���� �н� �ܰ迡���� `ALTER TABLE ... ADD COLUMN IF NOT EXISTS`�� nullable column�� �����ߴ�.

�ڵ� �帧:

```txt
AI ����̿��� ������Ʈ ����
-> ��� ������ ��Ʈ������ �� �Ǵ� ���� ���� �������� ����
-> ���� ��ư Ŭ��
-> PATCH /portfolio/projects/{project_id}
-> ��Ʈ������ ���̸� savedPortfolioDraft ����
-> ���� �����̸� savedInterviewQuestions ����
-> �鿣�尡 aiDraftSaved / aiInterviewSaved ���¸� ����� ����
-> ����Ʈ state�� �ش� ������Ʈ�� updatedProject�� ��ü
-> ��Ʈ������ ���� ȭ�鿡�� ����� ����� �ٽ� ǥ��
```

�̹��� �����ؾ� �� ����Ʈ:

1. ȭ�鿡�� ���̴� ���� ������� ����Ʈ Ÿ��, �鿣�� schema, DB ��, service ���� ������ ���� �¾ƾ� �Ѵ�.
2. ��Ʈ������ �� �ʾȰ� ���� ������ �� �� AI ����������� ���� ��ġ�� ��ư ������ �ٸ��� �����ִ� ���� �����ϱ� ����.
3. ������ ���� OpenAI ȣ�� ���̹Ƿ� ��� ������ ����������, ���� �帧�� ���� API�� DB�� ź��.
4. ���߿� OpenAI/RAG/MCP/Agent�� �ٿ��� ���� endpoint�� �״�� ������ �� �ִ�.

�߰� ���� Ű����:

- Pydantic alias
- DTO / Schema
- nullable column
- database migration
- SQL ALTER TABLE
- SQLAlchemy model
- repository pattern
- service layer

---

## 2026-06-16 �н�: ��Ʈ������ �� ���� �����Ϳ� ȭ�� ���� �и�

�̹��� �� ����:

| ���� | ���� |
| --- | --- |
| `backend/app/repositories/portfolio_repository.py` | �� ��Ʈ������ ������Ʈ row�� �����ϴ� ���� ���� |
| `backend/app/services/portfolio_service.py` | DB ���� ����Ʈ �������� �ٲٸ鼭 ���Ž� �ȳ� ������ �����ϴ� ���� |
| `frontend/src/app/pages/portfolio/Portfolio.tsx` | ��Ʈ������ ���� ȭ���� README/Ŀ�� ��� empty state ǥ�� |
| `frontend/src/app/pages/ai/AIAssistant.tsx` | AI ����� ���� �ڷ� �г��� README empty state ǥ�� |

�ٽ� ����:

- DB���� ���� �����͸� �����ϴ� ���� ����.
- ������ �����Ͱ� �����ϴ١� ���� ������ DB ���� �ƴ϶� ȭ�� ǥ���� ������.
- DB�� �ȳ� ������ �����ϸ� ���߿� ���� GitHub README/Ŀ�� �м� ����� �����ϱ� ���������.
- ���ſ� �̹� ����� placeholder ������ service layer���� `None` �Ǵ� �� �迭�� ������ ����Ʈ�� ������.

�ڵ� �帧:

```txt
GitHub ������Ʈ ���
-> repository�� readme_summary / recent_commit_summary / saved_portfolio_draft�� None���� ����
-> service�� DB row�� PortfolioProjectResponse�� ��ȯ
-> ���� placeholder ������ ������ normalize_optional_text �Ǵ� parse_recent_commit_summary�� ����
-> ����Ʈ�� null/�� �迭�� ���� ȭ��� empty state ������ ǥ��
```

�̹��� �����ؾ� �� ����Ʈ:

1. repository�� ���� å��, service�� ���� ���� å��, page component�� ȭ�� ǥ�� å���� ������.
2. �� �����Ϳ� �ȳ� ������ �и��ϸ� API�� �� ����������.
3. �������� �������� ������ �ƴ϶� ���� �����̹Ƿ� ����ڿ��� �����ϰ� ��Ȯ�� ������ ������� �Ѵ�.
4. PowerShell ���������� �ѱ� ���ͷ��� Python���� �ѱ�� ���ڵ��� ���� �� �����Ƿ�, QA������ �ڵ� ���� ����� ���� �Ἥ �ٽ� �����ߴ�.

�߰� ���� Ű����:

- empty state
- placeholder data
- service layer normalization
- nullable field
- legacy data cleanup
- encoding issue

---

## 2026-06-16 �н�: ��ġ ���� �ιڽ� ���Ϳ� �ǵ�� �帧

�̹��� �� ����:

| ���� | ���� |
| --- | --- |
| `frontend/src/app/pages/coach/CoachReview.tsx` | �л� ���� ��û ȭ��� ��ġ ���� �ιڽ� ȭ���� role�� ���� ������ �����ش�. |
| `frontend/src/app/api/reviews.ts` | ��ġ �ɼ�, ���� ��û ����, �� ��û ���, ��ġ �ιڽ�, �ǵ�� ���� API ȣ���� ����Ѵ�. |
| `backend/app/routers/reviews.py` | ���� ��û API endpoint�� STUDENT/COACH ������ �����Ѵ�. |
| `backend/app/services/review_service.py` | ���� ��û ����, ��ġ �ǵ�� ����, �л� �˸� ���� ���� ����Ͻ� ��Ģ�� ����Ѵ�. |
| `backend/app/repositories/review_repository.py` | ���� ��û/��� �Խñ�/��� ��ġ ��ȸ�� DB ������ ����Ѵ�. |

�ٽ� ����:

- �л��� ��ġ�� ���� `review_requests` �����͸� ������ ������ �ٸ���.
- �л��� `GET /review-requests/me`�� ������ ���� ��û�� ����.
- ��ġ�� `GET /review-requests/inbox`�� �ڱ⿡�� ������ ��û�� ����.
- ��ġ�� �ǵ���� �����ϸ� ���� review request row�� `status`, `feedback`�� �ٲ�� �л� ��Ͽ��� ���� ���� ���δ�.
- ���� UI������ ��ϰ� �� �г��� ���� ������ ������ ����ؾ� �Ѵ�.

�̹��� ��ģ UI �帧:

```txt
��ġ �ιڽ� ��ü ��û ���
-> ī�װ���/����/�˻��� ���� ����
-> filteredRequests ���
-> selectedRequest�� filteredRequests �������� ����
-> ���� ������ ���� ������ ������� ���͵� ù ��û���� �� �г� �̵�
```

�̹��� �����ؾ� �� ����Ʈ:

1. `requests`�� �������� ���� ���� ����̰�, `filteredRequests`�� ȭ�� ���Ͱ� ����� ����̴�.
2. ȭ�鿡 ���̴� ����� `filteredRequests`��� �� �гε� `filteredRequests` �������� �����ؾ� UX�� �ڿ�������.
3. ���� �˻�� ����Ʈ ��ư ���踸���� ������ �� �ǰ�, �鿣�忡�� ������ ��ġ���� �ٽ� Ȯ���ؾ� �Ѵ�.
4. �ǵ�� ������ ��� �ۼ��� �ٸ���. ����� ���� �Խñۿ� �ٴ� ���� ��ȭ�̰�, ��ġ �ǵ���� ���� ��û row�� ����Ǵ� ��û ó�� �����.

�߰� ���� Ű����:

- derived state
- filtered list
- selected item state
- permission check
- role based API
- notification side effect

---

## 2026-06-16 �н�: ���� ���� UI�� placeholder ������ �и�

�̹��� �� ����:

| ���� | ���� |
| --- | --- |
| `frontend/src/app/pages/posts/PostEdit.tsx` | �Խñ� �ۼ�/���� ���� ���� API ȣ���� ����Ѵ�. |
| `frontend/src/app/pages/portfolio/Portfolio.tsx` | GitHub ������Ʈ ��� ��û payload�� �����. |
| `backend/app/services/portfolio_service.py` | ��Ʈ������ ������Ʈ ���� �⺻���� ���� ��ȯ�� ����Ѵ�. |

�ٽ� ����:

- ȭ�鿡 ��ư�� ������ ����ڴ� ���� ������� ����Ѵ�.
- ���� API�� ���� ����� ��ư�� ���� ���غ� �ߡ��̶�� ���ϱ⺸��, ���� ���� ������ �ٽ� �帧�� ����� ���� ����.
- ��� ������ ���� ������Ʈ ��� �������� �ϹǷ� `�м� ����` ���� ���� ������ �����ͷ� �����ϸ� �� �ȴ�.
- �̹� ����� placeholder ���� service layer���� ���� ���� ������ �� �ִ�.

�ڵ� �帧:

```txt
�Խñ� �ۼ� ȭ��
-> ����/����/GitHub repo �Է�
-> �����ϱ� Ŭ��
-> POST /posts �Ǵ� PATCH /posts/{id}
-> �� ȭ�� �̵�
```

```txt
GitHub ������Ʈ ���
-> ����Ʈ�� techStack �⺻������ GitHub�� ����
-> �鿣�嵵 payload�� ������ GitHub�� �⺻ ����
-> ���� tech_stack�� �м� ������ �־ API ���信���� ����
```

�̹��� �����ؾ� �� ����Ʈ:

1. UI ��ư�� ������ ������ �ൿ�� ����� ���� ���� �ϼ����� ���δ�.
2. placeholder�� ȭ�� ǥ������ DB�� ������ �ٽ� �����Ͱ� �ƴϴ�.
3. ����Ʈ�� �鿣�� �⺻���� ���� �ٸ��� �ð��� ������ �����Ͱ� ���� �� �����Ƿ� ���� ����� �Ѵ�.
4. ���� ������ ȣȯ�� service layer���� ������ �� �ִ�.

�߰� ���� Ű����:

- progressive disclosure
- disabled feature
- placeholder cleanup
- source of truth
- API payload default

---

## 2026-06-16 학습 기록: 파트 단위 커밋을 남기는 이유

이번에는 기능 코드를 수정하지 않고, 앞으로 작업을 어떻게 끊어서 기록할지 정리했다.

수정한 파일:

| 파일 | 역할 |
| --- | --- |
| `docs/agent/agent.md` | 작업 운영 규칙과 문서 역할을 정리하는 기준 문서 |
| `docs/agent/log.md` | 실제 진행한 작업과 커밋 추천 제목을 남기는 진행 로그 |
| `docs/agent/test.md` | 이번 운영 기준이 지켜졌는지 확인하는 QA 체크리스트 |
| `README.md` | 프로젝트 최신 상태와 운영 메모를 평가자가 볼 수 있게 정리하는 문서 |

핵심 개념:

- 커밋은 코드 저장 버튼이 아니라, 하나의 의도가 끝났다는 기록이다.
- 기능 구현만 커밋하는 것이 아니라 문서/QA 기준을 정리한 것도 하나의 커밋 단위가 될 수 있다.
- 좋은 커밋 단위는 나중에 `git log`만 봐도 프로젝트가 어떤 순서로 발전했는지 읽힌다.

우리 프로젝트에서 적용하는 방식:

1. 기능 또는 문서 작업을 작은 덩어리로 끝낸다.
2. 관련 문서와 QA를 같이 갱신한다.
3. 빌드/컴파일/검색 QA를 통과하면 커밋한다.
4. 다음 작업으로 넘어가기 전에 현재 커밋 제목과 남은 작업을 정리한다.

주의할 점:

- `backend/.env`에는 Google OAuth secret, JWT secret 같은 민감정보가 있으므로 절대 커밋하지 않는다.
- QA가 약한 상태에서 커밋하면 나중에 어느 커밋부터 깨졌는지 추적하기 어려워진다.

---

## 2026-06-16 학습 기록: 학생 핵심 흐름 QA를 읽는 법

이번 QA는 브라우저 화면 하나만 보는 것이 아니라, 화면 뒤에서 실제로 호출되는 서비스 흐름이 맞는지 DB/API 기준으로 확인한 작업이다.

관련 파일:

| 파일 | 역할 |
| --- | --- |
| `backend/app/services/post_service.py` | 게시글 생성, 내 글 조회, 상세 조회, 조회수/댓글 수 응답 구성 |
| `backend/app/services/comment_service.py` | 댓글 작성과 댓글 목록 응답 구성 |
| `backend/app/services/portfolio_service.py` | GitHub 프로젝트 등록, 중복 검사, 기록 연결, 초안/면접 질문 저장 |
| `backend/app/services/review_service.py` | 학생 리뷰 요청 생성, 코치 인박스 조회, 코치 피드백 저장 |
| `backend/app/repositories/post_repository.py` | 상세 조회 시 `view_count` 증가, 댓글 수 count query 처리 |
| `backend/app/repositories/portfolio_repository.py` | 프로젝트 owner/repo 기준 중복 검사와 프로젝트-게시글 연결 저장 |

핵심 흐름:

1. 학생이 게시글을 작성한다.
2. 댓글을 작성하면 `comments` 테이블에 저장되고, 게시글 목록/상세에서는 댓글 count가 계산된다.
3. 게시글 상세를 열면 `posts.view_count`가 증가한다.
4. 학생이 GitHub repo를 포트폴리오 프로젝트로 등록한다.
5. owner id와 repo full name 기준으로 같은 repo 중복 등록을 막는다.
6. 프로젝트에 게시글을 연결하면 `portfolio_project_posts` 연결 테이블에 저장된다.
7. AI 도우미에서 만든 포트폴리오 초안/면접 질문은 프로젝트 row에 저장된다.
8. 학생이 게시글을 코치 리뷰 대상으로 요청하면 `review_requests`와 `review_request_coaches`에 저장된다.
9. 코치는 자신에게 배정된 요청을 인박스에서 보고 피드백을 저장한다.
10. 학생의 요청 목록에서 코치가 저장한 상태와 피드백을 다시 볼 수 있다.

이번에 다시 배운 점:

- 브라우저 화면 QA와 DB/API QA는 서로 보완 관계다.
- 화면에서 보이는 목록 유지 문제는 실제 저장 여부와 목록 재조회 여부를 함께 봐야 한다.
- N:M 관계인 게시글 태그나 프로젝트-게시글 연결은 cleanup할 때 연결 테이블을 먼저 지워야 한다.
- PowerShell을 통해 Python으로 한글 상태값을 넘길 때 인코딩이 깨질 수 있으므로, QA 스크립트에서는 유니코드 escape나 코드 상수를 쓰는 편이 안전하다.

---

## 2026-06-16 학습 기록: 코치 화면 브라우저 QA

이번 QA는 서비스 함수만 확인한 것이 아니라, 브라우저에서 role 기반 화면 분기가 실제로 어떻게 보이는지 확인한 작업이다.

관련 파일:

| 파일 | 역할 |
| --- | --- |
| `frontend/src/app/layouts/MainLayout.tsx` | role에 따라 사이드바 메뉴와 기본 진입 화면을 다르게 보여준다. |
| `frontend/src/app/components/RoleGate.tsx` | 현재 로그인 사용자의 role/approvalStatus를 기준으로 접근 가능 여부를 판단한다. |
| `frontend/src/app/pages/coach/CoachReview.tsx` | 코치 인박스와 학생 리뷰 요청 화면을 role별로 다르게 렌더링한다. |
| `backend/app/services/auth_service.py` | QA용 access/refresh token을 만들 때 사용한 인증 서비스이다. |
| `backend/app/services/review_service.py` | 코치 인박스에 표시할 리뷰 요청을 만든다. |

핵심 개념:

- 화면 접근 제한은 프론트 라우트에서 먼저 사용자 경험을 막고, 백엔드 API에서도 role을 다시 검증해야 한다.
- 코치 role은 학생용 메뉴인 내 기록, 포트폴리오 관리, AI 도우미를 기본 메뉴로 보지 않는다.
- 직접 URL을 입력했을 때도 학생 전용 화면이 그대로 보이면 안 되고 접근 제한 안내가 나와야 한다.
- E2E QA에서 OAuth 로그인을 매번 실제 Google로 하지 않고, 테스트용 쿠키를 만들어 브라우저 컨텍스트에 넣어 검증할 수 있다.

이번에 다시 배운 점:

- Playwright package와 실제 브라우저 executable은 별개다.
- 기본 Chromium이 없을 때는 설치된 Chrome channel을 사용해 smoke QA를 진행할 수 있다.
- 브라우저 QA는 `Unexpected Application Error`, `[object Object]`, role 메뉴 노출 같은 사용자 눈에 보이는 문제를 잡는 데 좋다.

---

## 2026-06-16 학습 기록: 프로필 이미지 업로드 QA

이번 QA는 파일 업로드가 단순히 화면 preview로 끝나는 것이 아니라, 백엔드 저장과 정적 파일 서빙까지 이어지는지 확인한 작업이다.

관련 파일:

| 파일 | 역할 |
| --- | --- |
| `backend/app/routers/me.py` | `PATCH /me/profile`에서 multipart form의 이름과 이미지 파일을 받는다. |
| `backend/app/main.py` | `/uploads` 경로를 StaticFiles로 서빙한다. |
| `backend/app/repositories/user_repository.py` | 사용자가 수정한 이름/프로필 이미지 저장, Google 재로그인 시 덮어쓰기 방지 처리 |
| `backend/app/services/auth_service.py` | Google profile을 users row로 변환하고 현재 사용자 응답을 만든다. |
| `frontend/src/app/pages/settings/Settings.tsx` | 사용자가 이름과 프로필 이미지를 수정하는 화면 |
| `frontend/src/app/api/auth.ts` | `FormData`로 이름과 이미지 파일을 전송한다. |

핵심 개념:

- 파일 업로드는 JSON이 아니라 `multipart/form-data`로 보낸다.
- FastAPI에서는 `Form(...)`과 `File(...)`을 같이 사용해 텍스트 필드와 파일을 받을 수 있다.
- 로컬 개발에서는 `backend/uploads`에 저장하고, `StaticFiles`로 브라우저가 접근할 수 있게 만든다.
- Google OAuth의 name/profile image는 최초 기본값으로만 쓰고, 사용자가 수정한 값은 이후 로그인에서 보존해야 한다.

이번에 다시 배운 점:

- TestClient에서 쿠키 인증을 검증할 때는 쿠키 jar보다 요청 `Cookie` header가 더 명확할 수 있다.
- 업로드 QA는 DB 값만 보지 말고 실제 정적 URL이 200으로 열리는지도 확인해야 한다.
- 사용자가 직접 수정한 프로필은 외부 OAuth profile보다 우선순위가 높다.

---

## 2026-06-16 학습 기록: 학생 화면 브라우저 smoke QA

이번 QA는 API 함수만 보는 검증이 아니라, 실제 사용자가 브라우저에서 눌러보는 흐름을 자동화해 확인한 작업이다.

관련 파일:

| 파일 | 역할 |
| --- | --- |
| `frontend/src/app/layouts/MainLayout.tsx` | 학생 사이드바 메뉴와 공통 레이아웃을 제공한다. |
| `frontend/src/app/pages/dashboard/Dashboard.tsx` | 로그인 후 학생 첫 화면 역할을 한다. |
| `frontend/src/app/pages/posts/PostEdit.tsx` | 게시글 작성/수정 폼, 관련 GitHub repo 입력 흐름을 담당한다. |
| `frontend/src/app/pages/posts/PostDetail.tsx` | 게시글 상세, GitHub 보기, 댓글 작성/삭제를 담당한다. |
| `frontend/src/app/pages/posts/MyRecords.tsx` | 현재 로그인 학생의 게시글 목록을 보여준다. |
| `frontend/src/app/pages/portfolio/Portfolio.tsx` | GitHub 프로젝트 등록, 중복 처리, 기록 연결, AI 도우미 이동을 담당한다. |
| `frontend/src/app/pages/ai/AIAssistant.tsx` | 프로젝트 기반 포트폴리오 초안/면접 질문 보관함을 보여준다. |
| `frontend/src/app/pages/coach/CoachReview.tsx` | 학생의 리뷰 요청 생성 화면과 코치의 인박스 화면을 role별로 나눈다. |
| `frontend/src/app/pages/settings/Settings.tsx` | 프로필 이름/이미지 수정 화면이다. |

핵심 개념:

- Smoke QA는 모든 세부 기능을 완벽히 증명하는 테스트는 아니지만, 주요 화면이 실제 사용자 흐름에서 깨지지 않는지 빠르게 확인한다.
- `href`와 `target` 검사만으로도 외부 링크가 새 탭으로 열리도록 구성됐는지 확인할 수 있다.
- 포트폴리오 프로젝트 유지 문제는 DB 저장, 목록 API 재조회, 화면 렌더링을 함께 봐야 한다.
- 리뷰 대상 문제는 단순 select option만 볼 것이 아니라 대상 유형 전환 UI까지 눌러봐야 한다.

이번에 다시 배운 점:

- React 화면 QA에서는 로딩 타이밍 때문에 한 번의 텍스트 체크가 흔들릴 수 있다. 의심되는 부분은 직접 해당 화면으로 다시 들어가 충분히 기다리고 재확인해야 한다.
- 사용자의 “눌러봤을 때 이상한 부분”은 API 단위 테스트보다 브라우저 smoke QA에서 더 잘 드러난다.
- 자동화 QA 결과는 `test.md`에 체크리스트와 출력 요약을 같이 남겨야 나중에 왜 완료라고 판단했는지 설명할 수 있다.

---

## 2026-06-16 학습 기록: 긴 텍스트 UI QA

이번 QA는 긴 repo 이름이 카드 안에서 레이아웃을 깨뜨리지 않는지 브라우저의 실제 bounding box로 확인한 작업이다.

관련 파일:

| 파일 | 역할 |
| --- | --- |
| `frontend/src/app/pages/portfolio/Portfolio.tsx` | 프로젝트 카드에서 제목은 `truncate`, repo 이름은 `break-all`, 상태 badge는 `shrink-0`으로 배치한다. |

핵심 개념:

- 긴 텍스트 UI 문제는 단순히 문자열이 화면에 보이는지만 확인하면 부족하다.
- `getBoundingClientRect()`로 카드와 badge 위치를 비교하면 요소가 부모 안에 들어오는지 수치로 확인할 수 있다.
- `document.documentElement.scrollWidth > clientWidth`를 보면 긴 텍스트 때문에 가로 스크롤이 생겼는지 확인할 수 있다.

이번에 다시 배운 점:

- UI QA는 텍스트 존재 여부와 레이아웃 수치 검사를 같이 보면 더 단단하다.
- badge처럼 작은 상태 표시 요소는 `shrink-0`과 `whitespace-nowrap`가 없으면 긴 제목 옆에서 찌그러질 수 있다.

---

## 2026-06-16 학습 기록: GitHub REST API 실제 연동

이번 구현은 포트폴리오 관리의 `GitHub 프로젝트 등록`을 mock이 아니라 실제 GitHub REST API 호출과 연결한 작업이다.

관련 파일:

| 파일 | 역할 |
| --- | --- |
| `backend/app/services/github_service.py` | GitHub REST API 호출, README base64 decoding, languages/commits 응답 정리 |
| `backend/app/services/portfolio_service.py` | repo URL 파싱 후 GitHub 분석 결과를 포트폴리오 프로젝트 생성/새로고침 흐름에 연결 |
| `backend/app/repositories/portfolio_repository.py` | GitHub 분석 결과를 `portfolio_projects` 테이블에 저장 |
| `backend/app/routers/portfolio.py` | `POST /portfolio/projects/{project_id}/github/refresh` API 추가 |
| `backend/app/core/config.py` | GitHub API base URL, API version, token 설정값 추가 |
| `frontend/src/app/api/portfolio.ts` | GitHub 정보 새로고침 API 호출 함수 추가 |
| `frontend/src/app/pages/portfolio/Portfolio.tsx` | 등록/새로고침 버튼이 실제 API를 호출하도록 변경 |
| `frontend/src/app/layouts/MainLayout.tsx` | JungleLog 로고를 역할별 홈 링크로 변경 |

핵심 흐름:

1. 사용자가 포트폴리오 관리 화면에 GitHub repo URL을 입력한다.
2. 프론트엔드가 `POST /portfolio/projects`로 repo URL을 보낸다.
3. 백엔드 `portfolio_service`가 URL에서 `owner/repo`를 추출한다.
4. `github_service`가 GitHub REST API를 호출한다.
5. repo 설명, README, 사용 언어, 최근 커밋을 JungleLog에 필요한 형태로 정리한다.
6. repository 계층이 `portfolio_projects` 테이블에 저장한다.
7. 프론트엔드는 응답을 받아 프로젝트 카드와 상세 패널을 다시 보여준다.

이번 구현에서 사용한 백엔드 개념:

- REST API client: `httpx.Client`
- 외부 API header: `Accept`, `X-GitHub-Api-Version`, `User-Agent`, 선택적 `Authorization`
- 예외 처리: GitHub 404는 `GitHubRepositoryNotFoundError`, rate limit/장애는 `GitHubApiError`
- service 계층: 외부 JSON을 바로 DB에 넣지 않고 앱에서 쓰기 좋은 형태로 변환
- repository 계층: DB 저장 책임을 service와 분리
- base64 decoding: GitHub README API의 `content`는 base64라 decode가 필요함

이번 구현에서 사용한 프론트엔드 개념:

- API wrapper 함수 추가
- `async/await`로 버튼 클릭 시 실제 API 호출
- `useState`로 loading/error/notice 상태 관리
- `upsertProject`로 갱신된 프로젝트를 화면 state에 반영
- `Link`를 이용한 role별 홈 이동

내가 이해해야 할 핵심 포인트:

- GitHub API 호출은 프론트가 직접 하지 않고 백엔드를 거친다.
- 이유는 token을 브라우저에 노출하지 않고, API 응답을 DB에 저장해야 하기 때문이다.
- public repo는 token 없이도 조회할 수 있지만, private repo나 rate limit 완화에는 `GITHUB_TOKEN`이 필요하다.
- AI/RAG/MCP가 붙기 전에도 GitHub README와 commits는 포트폴리오 글 생성의 근거 자료가 된다.

나중에 이어질 부분:

- GitHub REST API 호출을 MCP tool로 감싸기
- OpenAI가 README/커밋/연결 기록을 참고해 포트폴리오 글 생성
- RAG 검색으로 연결된 게시글 중 관련 기록만 찾아 프롬프트에 넣기
- GitHub API rate limit 대응과 재시도/캐시 정책 추가

추가로 공부할 키워드:

- REST API
- HTTP status code 404/403/502
- API rate limit
- external API integration
- service layer
- repository layer
- base64
- environment variable
- GitHub REST API

---

## 2026-06-16 학습 기록: GitHub branch 기준 포트폴리오 관리

이번 구현은 GitHub repo URL만 저장하던 구조를 repo/branch 기준으로 확장한 작업이다.

관련 파일:

| 파일 | 역할 |
| --- | --- |
| `backend/app/db/models/portfolio_project.py` | `github_branch` 컬럼과 repo/branch unique 기준 추가 |
| `backend/app/db/init_db.py` | Alembic 전 단계에서 기존 DB에 `github_branch` 컬럼과 unique index 보강 |
| `backend/app/services/github_service.py` | branch 기준 GitHub README/commits/tree 조회 |
| `backend/app/services/portfolio_service.py` | GitHub URL에서 repo/branch 파싱, default branch 보정, 응답 변환 |
| `backend/app/repositories/portfolio_repository.py` | branch를 포함한 중복 조회/생성/분석 결과 저장 |
| `backend/app/schemas/portfolio.py` | API 응답에 `githubBranch` 추가 |
| `frontend/src/app/api/portfolio.ts` | 프론트 타입에 `githubBranch` 추가 |
| `frontend/src/app/pages/portfolio/Portfolio.tsx` | branch 표시, branch 검색, 포트폴리오 글 preview UI 정리 |

핵심 흐름:

1. 사용자가 `https://github.com/owner/repo/tree/dev`를 입력한다.
2. 백엔드는 URL에서 `owner/repo`와 `dev` branch를 분리한다.
3. GitHub API로 repository metadata를 조회한다.
4. branch가 없으면 metadata의 `default_branch`를 사용한다.
5. README는 `ref=branch`, commits는 `sha=branch`로 조회한다.
6. branch tree를 조회해 파일 확장자 기반 기술 스택을 추정한다.
7. DB에는 `repo_full_name`과 `github_branch`를 함께 저장한다.
8. 프론트는 repo와 branch를 같이 보여준다.

중요 개념:

- repo와 branch는 다른 개념이다. 같은 repo라도 branch가 다르면 README와 최근 커밋이 달라질 수 있다.
- GitHub README API는 `ref` query로 branch를 지정한다.
- GitHub commits API는 `sha` query에 branch 이름을 넣어 시작 지점을 지정할 수 있다.
- GitHub languages API는 branch별 API가 아니므로 branch tree를 이용한 추정이 필요하다.
- 기존 DB에 컬럼을 추가할 때 `create_all()`만으로는 부족해서 `ALTER TABLE ADD COLUMN IF NOT EXISTS`가 필요하다.

내가 조심해야 할 점:

- DB 필드를 추가하면 backend schema, frontend type, UI 사용 위치까지 같이 맞춰야 한다.
- unique 기준을 바꾸지 않으면 같은 repo의 다른 branch를 등록할 수 없다.
- branch 이름에는 `/`가 들어갈 수 있으므로 URL path segment 인코딩이 필요하다.
- 기존 데이터 보정은 화면 목록 조회가 깨지지 않는 방향으로 처리해야 한다.

추가 학습 키워드:

- Git branch
- GitHub default branch
- URL parsing
- query parameter
- unique index
- DB migration
- Git tree
- file extension based language inference

---

## 2026-06-16 학습 기록: 포트폴리오 게시글 발행과 AI 도우미 UI 정리

이번 구현은 포트폴리오 프로젝트를 전체 게시글의 `포트폴리오 관리` 글로 발행하는 흐름과 AI 도우미 화면을 정리한 작업이다.

관련 파일:

| 파일 | 역할 |
| --- | --- |
| `backend/app/db/models/portfolio_project.py` | `published_post_id`로 대표 포트폴리오 게시글 연결 |
| `backend/app/db/init_db.py` | 기존 DB에 `published_post_id` 컬럼 보강 |
| `backend/app/services/portfolio_service.py` | 프로젝트 기반 포트폴리오 게시글 본문 생성/발행 로직 |
| `backend/app/repositories/portfolio_repository.py` | 발행된 게시글 id를 프로젝트에 저장 |
| `backend/app/routers/portfolio.py` | `POST /portfolio/projects/{project_id}/publish-post` endpoint 추가 |
| `backend/app/schemas/portfolio.py` | `publishedPostId` 응답 추가 |
| `frontend/src/app/api/portfolio.ts` | 포트폴리오 게시글 발행 API wrapper 추가 |
| `frontend/src/app/pages/portfolio/Portfolio.tsx` | 발행 버튼과 게시글로 보기 링크 추가 |
| `frontend/src/app/pages/ai/AIAssistant.tsx` | AI 도우미 UI를 작업 흐름 중심으로 재구성 |

핵심 흐름:

1. 학생이 포트폴리오 관리 화면에서 프로젝트를 선택한다.
2. `포트폴리오 게시글로 발행` 버튼을 누른다.
3. 백엔드는 프로젝트 정보를 읽고 `포트폴리오 관리` 카테고리 게시글 본문을 만든다.
4. 처음 발행이면 새 게시글을 만들고, 이미 발행된 글이 있으면 기존 글을 갱신한다.
5. 프로젝트에는 `published_post_id`가 저장된다.
6. 사용자는 전체 게시글/내 기록에서 해당 포트폴리오 글 전체를 읽을 수 있다.

중요 개념:

- 연결된 학습 기록과 발행된 포트폴리오 게시글은 의미가 다르다.
- 그래서 `portfolio_project_posts`에 발행 글을 섞지 않고 `published_post_id`를 별도로 둔다.
- 프로젝트 관리 화면은 preview와 관리 행동 중심이고, 게시글 상세는 전체 글을 읽는 화면이다.
- API 필드명은 프론트에서 `publishedPostId`, 백엔드/DB에서는 `published_post_id`로 관리한다.
- AI 도우미는 아직 실제 OpenAI 호출 전이므로 기존 프로젝트 데이터를 이용해 결과 형태를 구성한다.

추가 학습 키워드:

- one-to-one reference
- representative post
- derived content
- API wrapper
- UI information architecture
- empty state
- data flow preservation

---

## 2026-06-16 학습 기록: 포트폴리오 관리 액션 버튼 UI 정리

이번 구현은 기능을 새로 만든 것이 아니라, 이미 있던 포트폴리오 관리 행동을 화면 정보 구조에 맞게 다시 배치한 작업이다.

관련 파일:

| 파일 | 역할 |
| --- | --- |
| `frontend/src/app/pages/portfolio/Portfolio.tsx` | 포트폴리오 프로젝트 상세 패널의 섹션별 버튼 배치와 버튼 스타일 정리 |
| `README.md` | 현재 구현 상태에 포트폴리오 관리 버튼 정리 내용 반영 |
| `docs/agent/log.md` | 작업 진행 기록 |
| `docs/agent/test.md` | 이 단위에서 확인할 QA 항목 기록 |

핵심 흐름:

1. 포트폴리오 글을 만들고 싶으면 `포트폴리오 글` 섹션에서 AI 도우미로 이동한다.
2. 학습 기록을 연결하고 싶으면 `연결된 학습 기록` 섹션에서 기록 연결 모달을 연다.
3. 코치에게 확인받고 싶으면 `코치 리뷰/피드백` 섹션에서 리뷰 요청 화면으로 이동한다.
4. 프로젝트 단위 작업인 게시글 발행, 게시글 보기, GitHub 보기, GitHub 정보 새로고침은 상단 액션 줄에 남긴다.

중요 개념:

- 같은 버튼이라도 위치에 따라 사용자가 이해하는 의미가 달라진다.
- React에서는 기존 상태와 API 호출 함수를 유지하면서 JSX 배치만 바꿔도 사용자 흐름을 크게 개선할 수 있다.
- `Button asChild`는 `Link`나 `a` 태그를 버튼처럼 보이게 만들 때 사용한다.
- 중복 버튼은 기능이 많아 보이게 하지만 실제로는 사용자가 어디를 눌러야 할지 헷갈리게 만든다.

추가 학습 키워드:

- UI information architecture
- action hierarchy
- section header action
- React JSX refactor
- reusable className

---

## 2026-06-16 학습 기록: GitHub README 참고 정보 표시 개선

이번 구현은 GitHub 분석 결과가 사용자에게 어떤 의미인지 설명하는 UI 개선 작업이다.

관련 파일:

| 파일 | 역할 |
| --- | --- |
| `frontend/src/app/pages/portfolio/Portfolio.tsx` | 포트폴리오 관리 화면의 GitHub 참고 정보 설명 개선 |
| `frontend/src/app/pages/ai/AIAssistant.tsx` | AI 도우미 참고 자료 패널의 README 설명 개선 |

핵심 흐름:

1. GitHub API 분석 결과로 기술 스택과 문서 유형이 들어온다.
2. `Markdown`처럼 기술처럼 보이지 않는 값도 README 같은 문서 파일 감지 결과일 수 있다.
3. 화면에서는 이 값을 그냥 배지로 던지지 않고 `감지된 기술/문서 유형`이라는 라벨 아래 보여준다.
4. README는 최종 포트폴리오 글이 아니라 AI가 참고하는 근거 자료로 접어서 보여준다.

중요 개념:

- API 데이터 이름이 사용자에게 바로 이해되는 것은 아니다.
- 같은 데이터라도 화면 라벨과 설명이 없으면 버그처럼 보일 수 있다.
- 접힘 UI는 중요도가 낮지만 필요할 때 확인해야 하는 정보를 담기에 적합하다.

추가 학습 키워드:

- progressive disclosure
- data labeling
- GitHub README
- reference material UI

---

## 2026-06-16 학습 기록: 포트폴리오 게시글 상세 전용 UI 개선

이번 구현은 같은 게시글 상세 화면에서도 카테고리에 따라 다른 렌더링을 적용하는 작업이다.

관련 파일:

| 파일 | 역할 |
| --- | --- |
| `frontend/src/app/pages/posts/PostDetail.tsx` | 일반 게시글과 포트폴리오 게시글 상세 렌더링 분기 |
| `README.md` | 현재 구현 상태 반영 |
| `docs/agent/log.md` | 작업 진행 기록 |
| `docs/agent/test.md` | QA 체크리스트 기록 |

핵심 흐름:

1. 백엔드는 포트폴리오 게시글 본문을 Markdown 비슷한 문자열로 저장한다.
2. 프론트는 `post.categorySlug === "portfolio"`인지 확인한다.
3. 포트폴리오 글이면 저장 문자열을 섹션별로 파싱한다.
4. 파싱한 값을 카드 UI로 보여준다.
5. 일반 글이면 기존 상세 화면 렌더링을 그대로 사용한다.

중요 개념:

- 저장 형식과 화면 표시 형식은 꼭 같을 필요가 없다.
- DB에 저장된 문자열을 유지하면서 프론트 렌더링만 바꾸면 기존 API와 데이터 흐름을 안전하게 보존할 수 있다.
- 카테고리 기반 조건부 렌더링은 기능별 화면 완성도를 높일 때 유용하다.
- `parsePortfolioPostContent` 같은 파서는 저장 형식이 바뀌면 같이 수정해야 하는 부분이다.

추가 학습 키워드:

- conditional rendering
- parser function
- derived UI
- category-specific rendering
- markdown-like text parsing

---

## 2026-06-16 학습 기록: 포트폴리오 UI 개선 최종 정리

이번 묶음에서 배운 핵심은 `데이터 구조를 크게 바꾸지 않고도 화면 렌더링과 정보 배치를 바꾸면 서비스 완성도가 크게 달라진다`는 점이다.

파일별 역할:

| 파일 | 이번 작업에서 본 역할 |
| --- | --- |
| `Portfolio.tsx` | 프로젝트 관리 화면의 액션 배치와 GitHub 참고 정보 설명 담당 |
| `AIAssistant.tsx` | AI 도우미 참고자료 패널에서 README와 기술/문서 유형 설명 담당 |
| `PostDetail.tsx` | 일반 게시글과 포트폴리오 게시글의 상세 렌더링 분기 담당 |

핵심 포인트:

- 버튼은 기능 위치보다 사용자 목적 위치에 가까워야 한다.
- `Markdown` 같은 원천 데이터 값은 그대로 보여주면 사용자가 의미를 이해하기 어렵다.
- 포트폴리오 게시글은 일반 게시글과 같은 DB 테이블에 있어도 전용 상세 UI로 보여줄 수 있다.
- 저장된 문자열을 파싱해 카드 UI로 바꾸면 백엔드 변경 없이 화면 품질을 높일 수 있다.

다음에 이해할 개념:

- 컴포넌트 분리 기준
- Markdown parser와 직접 parser의 차이
- category-specific component rendering
- 백엔드 응답 DTO를 화면용 view model로 바꾸는 방식

---

## 2026-06-16 학습 기록: 기술 스택 표시에서 Markdown 제거

이번 구현은 API 원본 데이터와 화면 표시 데이터를 분리해서 생각하는 작업이다.

관련 파일:

| 파일 | 역할 |
| --- | --- |
| `frontend/src/app/utils/techStack.ts` | 화면에 보여줄 기술 스택만 걸러내는 공통 함수 |
| `frontend/src/app/pages/portfolio/Portfolio.tsx` | 포트폴리오 관리 화면의 기술 스택 표시 |
| `frontend/src/app/pages/ai/AIAssistant.tsx` | AI 도우미 참고자료와 샘플 결과의 기술 스택 표시 |
| `frontend/src/app/pages/posts/PostDetail.tsx` | 포트폴리오 게시글 상세의 기술 스택 표시 |

핵심 포인트:

- GitHub 분석 결과에 `Markdown`이 들어올 수 있지만, 포트폴리오 화면에서는 실제 구현 기술로 보기 어렵다.
- DB/API 값을 바로 지우지 않고 화면에 보여줄 때만 필터링하면 기존 데이터 흐름을 유지할 수 있다.
- 기존 저장 글에 남아 있는 단독 `GitHub` 기술 스택도 렌더링 단계에서 안내 문구로 바꿀 수 있다.

추가 학습 키워드:

- view model
- display filtering
- raw data vs UI data
- shared utility function
