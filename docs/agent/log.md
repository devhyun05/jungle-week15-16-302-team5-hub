
## 2026-06-15 ?? ?? ??? API ??

??: ??

?? ??:

- `/review-requests/coaches` API ??
- `/review-requests` POST API ??
- `/review-requests/me` API ??
- `/review-requests/inbox` API ??
- `/review-requests/{id}` PATCH/DELETE API ??
- ?? ?? ??? ??, ?? ?? ?? ??, ?? ?? ?? ?? ??
- ?? ? ?? ??? bulk delete? ??

QA:

- `python -m compileall app` ??
- TestClient ?? ?? QA ??
  - coaches=200
  - create=201
  - my=200
  - inbox=200
  - other_patch=403
  - patch=200
  - cancel_after_review=400
  - cancel_pending=204

?? ??:

- `frontend/src/app/pages/coach/CoachReview.tsx` ?? API ??

?? ??:

```txt
feat: ?? ?? ??? API ??
```

---

## 2026-06-15 ????? ???? API ??

??: ??

??: ????? ?? ??? ???? ??/?? ??/?? ??? ?? API ???? ????.

?? ??:

- `/portfolio/projects` GET/POST API ??
- `/portfolio/projects/{project_id}` PATCH API ??
- `/portfolio/projects/{project_id}/posts` PUT API ??
- GitHub URL?? `owner/repo` ?? ??? `repo_full_name`?? ??
- ????-??? ??? `portfolio_project_posts` ???? ??
- ??? ????? ???? `/portfolio/projects`, `/me/posts`? ????? ??
- GitHub README/?? ??? MCP/GitHub API ?? ? ?? ?? ??? ??

QA:

- `python -m compileall app` ??
- `npm run build` ??
- TestClient ????? QA ??
  - coach_create=403
  - create=201
  - list=200
  - patch=200
  - link=200

?? ??:

1. ?? ?? ??/??? API ??
2. AI ???? ???? ?? ???? ?? ????? API? ??

?? ??:

```txt
feat: ????? ???? API ??
```

---

## 2026-06-15 ADMIN ??? ??/?? API ??

??: ??

??: Google OAuth? ??? ?? ?? ???? ADMIN? ?? API? ??/??/???? ??? ??? ? ?? ??.

?? ??:

- `/admin/users` GET/PATCH API? ????.
- `require_roles("ADMIN")`? ??? API? ????.
- ??? ?? ??, ??/?? ?? ?? repository/service/router? ????.
- `user_approval_logs`? ?? ??? ????.
- ??? ??? ?? ??? ????? ADMIN ??? ???? ??? 400?? ???.
- ??? `AdminUsers` ???? mock data?? ?? API ???? ????.
- ?? ??/??/?? ??? PATCH API? ???? ?? ???? ?? state? ????.

QA:

- `python -m compileall app` ??
- `npm run build` ??
- TestClient ??? QA ??
  - student_list=403
  - admin_list=200
  - admin_list_contains_pending=True
  - approve=200, role=COACH
  - self_suspend=400
  - approval_log_count=1

?? ??:

1. ????? ???? API ??
2. ????-??? ?? API ??
3. ?? ?? ??/??? API ??

?? ??:

```txt
feat: ??? ??? ?? API ??
```

---

## 2026-06-15 current_user ???/?? ?? ??

??: ??

??: demo user ???? ???? ???/??/? ?? API? ?? ??? ??? ???? ???.

?? ??:

- `get_current_approved_user`? ??? ??, ?? ??/??, ? ?? ??? ????.
- `POST /posts`? STUDENT/ADMIN? ???? COACH? 403? ????.
- ??? ??/??? ??? ?? ?? ADMIN? ???? ??.
- ?? ??? ?? ??? ?? ?? ADMIN? ???? ??.
- ???? ????? ??/?? ?? ????, ????? ???/ADMIN? ??/?? ?? ???? ??.
- ???/?? ??? `authorId`? ????.
- ??? ??? ?? ???? `authorId === user.id` ?? ADMIN? ???? ??/?? ??? ????.
- runtime?? ?? demo author helper? ????. `DEMO_POSTS`? ?? ?? ???? ????.

QA:

- `python -m compileall app` ??
- `npm run build` ??
- `git diff --check` ??, CRLF ??? ??
- TestClient ?? QA ??
  - anonymous_create=401
  - coach_create=403
  - student_create=201
  - private_detail_codes=404 404 200 200
  - my_posts_contains_private=True
  - private_comment_create=201
  - private_comment_codes=404 200 404
  - private_comment_delete_codes=403 204

?? ??:

1. ADMIN ??? ??/?? ?? API ?? ? ??? ?? ??
2. ????? ???? API ??
3. ?? ?? ??/??? API ??

?? ??:

```txt
feat: ???? ?? current user ?? ??
```

---
# JungleLog Progress Log

## 2026-06-15 ??? Google OAuth ??? ?? ??

??: ??

??: ???? URL? ?? ???? ??? React ??? ???? Google OAuth ???? ????, ? ?? ? `/auth/me` ???? ???/??/?? ??? ???? ???.

??? ??:

- `frontend/src/app/api/client.ts`
- `frontend/src/app/api/auth.ts`
- `frontend/src/app/contexts/AuthContext.tsx`
- `frontend/src/app/App.tsx`
- `frontend/src/app/layouts/MainLayout.tsx`
- `frontend/src/app/components/RoleGate.tsx`
- `frontend/src/app/pages/auth/Login.tsx`
- `frontend/src/app/pages/auth/PendingApproval.tsx`
- `frontend/src/app/api/posts.ts`
- `frontend/src/app/api/comments.ts`
- `README.md`
- `docs/agent/study.md`
- `docs/agent/test.md`
- `docs/agent/troubleshooting.md`

?? ??:

- Google ??? ?? ??? `/auth/google/login`?? ????? ????.
- React ? ??? `AuthProvider`? ???.
- ? ?? ? `/auth/me`? ????, ???? `/auth/refresh`? ????? ??.
- ??? ? ???? `/login`?? redirect??.
- ???? ??? ?? ??/??/?? ??? ???? `/pending-approval` ???? ????.
- ?? ?? ???? role? ?? STUDENT/COACH/ADMIN ??? ??? ??.
- `RoleGate`? mock role? ??? ?? `role`, `approvalStatus`? ?? ?? ??? ????.
- ???/?? API ??? `credentials: "include"`? ?? HttpOnly cookie? ???? ???? ??.
- ?? ?? ??? ??? ?? ?? ?? ?? ???? ?? UTF-8 ??? ????.

??:

- `backend`: `python -m compileall app` ??
- `frontend`: `npm run build` ??
- ???? QA: `/login`?? `Google? ????` ?? ?? ??
- ???? QA: ???? ???? `/posts` ?? ?? ? `/login`?? redirect ??
- ?? ?? ??? ?? ?? ??? ?? ??

?? ??:

1. ???/??/? ?? API?? demo user ??
2. `get_current_user`, `get_current_approved_user` ???? ??/??/?? ?? ??
3. ??? ?? ?? ADMIN? ??/?? ???? ??
4. ??? ??/?? ?? API ??

?? ?? ??:

```txt
feat: ??? Google ??? ?? ??
```

---

# JungleLog Progress Log

## 2026-06-14 JWT / refresh token 보안 유틸 추가

상태: 완료

목표: Google OAuth callback과 보호 API 구현 전에 access token, refresh token 생성/검증 유틸을 준비한다.

구현 파일:

- `backend/app/core/security.py`
- `backend/app/core/config.py`
- `backend/.env.example`
- `backend/requirements.txt`
- `README.md`
- `docs/agent/study.md`
- `docs/agent/back-keyword.md`
- `docs/agent/setup.md`
- `docs/agent/test.md`

구현 내용:

- `python-jose[cryptography]`를 설치했다.
- `requirements.txt`에 JWT 관련 의존성을 반영했다.
- `Settings`에 Google OAuth, JWT, Cookie 설정값을 추가했다.
- `.env.example`에 로컬 개발자가 채워야 할 OAuth/JWT 설정 예시를 추가했다.
- `create_access_token(user_id)`로 JWT access token을 생성하게 했다.
- `decode_access_token(token)`으로 유효한 access token에서 user id를 꺼내게 했다.
- `create_refresh_token()`으로 안전한 랜덤 refresh token을 만들게 했다.
- `hash_refresh_token(refresh_token)`으로 DB 저장용 sha256 해시를 만들게 했다.

검증:

- `python -m compileall app` 성공
- `create_access_token(123)` 결과가 문자열인지 확인
- `decode_access_token(token)` 결과가 `123`인지 확인
- `create_refresh_token()` 결과가 충분히 긴 랜덤 문자열인지 확인
- `hash_refresh_token(refresh)` 결과가 64자인지 확인
- 같은 refresh token은 같은 hash를 만드는지 확인

다음 작업:

1. auth repository에서 refresh token hash 저장/조회/폐기 구현
2. auth service에서 Google OAuth callback 처리 구현
3. auth router에서 `/auth/google/login`, `/auth/google/callback`, `/auth/me`, `/auth/refresh`, `/auth/logout` 구현

## 2026-06-14 JWT refresh token 저장 구조 추가

상태: 완료

목표: Google OAuth / JWT 인증을 구현하기 전에 access token과 refresh token을 분리하는 보안 구조를 DB 설계와 SQLAlchemy 모델에 반영한다.

구현 파일:

- `backend/app/db/models/auth_refresh_token.py`
- `backend/app/db/models/user.py`
- `backend/app/db/models/__init__.py`
- `docs/agent/db-design.md`
- `README.md`
- `docs/agent/study.md`

구현 내용:

- `auth_refresh_tokens` 모델을 추가했다.
- refresh token 원문 대신 `token_hash`만 저장하도록 설계했다.
- refresh token 만료는 `expires_at`, 폐기는 `revoked_at`으로 구분했다.
- refresh token rotation을 위해 `replaced_by_token_id` self reference를 추가했다.
- `User.refresh_tokens` 관계를 추가했다.
- `models/__init__.py`에 `AuthRefreshToken`을 등록해 `Base.metadata.create_all()`이 테이블을 인식할 수 있게 했다.
- `db-design.md`의 테이블 목록, DBML, 필드 설명에 인증 토큰 테이블을 반영했다.

검증:

- `python -m compileall app` 성공
- SQLAlchemy `configure_mappers()` 성공
- `Base.metadata.tables`에 `auth_refresh_tokens` 등록 확인
- `init_db()` 실행 성공
- PostgreSQL 실제 테이블 목록 13개 확인
- `auth_refresh_tokens` 컬럼 목록 확인: `id`, `user_id`, `token_hash`, `expires_at`, `revoked_at`, `replaced_by_token_id`, `user_agent`, `ip_address`, `created_at`
- `npm run build` 성공
- `git diff --check` 통과. CRLF 변환 warning만 있음

다음 작업:

1. 검증을 통과시키고 `auth_refresh_tokens` 실제 테이블 생성 확인
2. `security.py`에 access token / refresh token 생성과 검증 유틸 구현
3. Google OAuth login/callback API 구현

## 2026-06-14 내 기록 화면 API 전환

상태: 완료

목표: `/my-records` 화면을 mock data 필터링에서 백엔드 `GET /me/posts` API 기반으로 전환한다.

구현 파일:

- `backend/app/routers/me.py`
- `backend/app/repositories/post_repository.py`
- `backend/app/services/post_service.py`
- `backend/app/main.py`
- `frontend/src/app/api/posts.ts`
- `frontend/src/app/pages/posts/MyRecords.tsx`
- `README.md`
- `docs/agent/api-design.md`
- `docs/agent/study.md`
- `docs/agent/test.md`
- `docs/agent/setup.md`
- `docs/agent/back-keyword.md`
- `docs/agent/front-keyword.md`
- `docs/agent/troubleshooting.md`

구현 내용:

- `GET /me/posts` endpoint를 추가했다.
- 현재는 JWT/OAuth2 전이라 demo student를 현재 사용자처럼 사용한다.
- 작성자 id, 카테고리, 검색어, 공개 범위, 페이지 조건으로 게시글을 조회한다.
- `/my-records`의 목록과 통계를 API 응답 기준으로 렌더링한다.
- 카테고리, 공개 범위, 검색어 변경 시 `useEffect`가 다시 API를 호출한다.

검증:

- `backend`: `python -m compileall app` 성공
- `frontend`: `npm run build` 성공
- OpenAPI: `/me/posts` `get` 등록 확인
- HTTP QA: `/me/posts?visibility=all`, `/me/posts?visibility=public`, `/me/posts?category=learning-log` 응답 확인
- HTTP QA: 임시 비공개 글 생성 후 `visibility=private`에 잡히는 것 확인
- Browser QA: `/my-records` 화면에 API 기반 기록 목록 표시, `Unexpected Application Error` 없음

주의:

- 한글 keyword를 PowerShell에서 URI 조합해 검증할 때 기대와 다른 결과가 나올 수 있어, 필터 검증은 영어 keyword와 visibility 조건을 분리해서 확인했다.
- 비공개 글 상세 조회 권한 처리는 JWT/OAuth2 후 별도 API 또는 권한 기반 상세 조회로 보완해야 한다.

커밋 추천 제목:

```txt
feat: 내 기록 화면을 API 기반으로 전환
```

다음 후보 작업:

1. JWT/OAuth2 구현 준비
2. 내 비공개 글 상세 조회 권한 흐름 설계
3. 태그/카테고리 API 분리

## 2026-06-14 댓글 삭제 API와 상세 화면 연결

상태: 완료

목표: 게시글 상세 화면의 댓글 삭제 버튼을 mock 동작이 아니라 실제 백엔드 `DELETE /comments/{comment_id}` API에 연결한다.

구현 파일:

- `backend/app/repositories/comment_repository.py`
- `backend/app/services/comment_service.py`
- `backend/app/routers/comments.py`
- `frontend/src/app/api/comments.ts`
- `frontend/src/app/pages/posts/PostDetail.tsx`
- `README.md`
- `docs/agent/api-design.md`
- `docs/agent/study.md`
- `docs/agent/test.md`
- `docs/agent/setup.md`
- `docs/agent/back-keyword.md`
- `docs/agent/front-keyword.md`

구현 내용:

- `DELETE /comments/{comment_id}` endpoint를 추가했다.
- 삭제는 hard delete가 아니라 `comments.deleted_at`을 채우는 soft delete로 처리했다.
- 삭제된 댓글은 `GET /posts/{post_id}/comments`에서 보이지 않는다.
- 프론트 상세 화면의 각 댓글에 삭제 버튼을 추가했다.
- 삭제 성공 후 전체 목록을 다시 가져오지 않고 현재 `comments` state에서 해당 댓글만 제거했다.
- 실제 작성자/관리자 권한 검사는 JWT/OAuth2 구현 후 붙일 TODO로 남겼다.

검증:

- `backend`: `python -m compileall app` 성공
- `frontend`: `npm run build` 성공
- HTTP QA: 테스트 게시글 생성 후 댓글 작성 성공
- HTTP QA: `DELETE /comments/{id}`가 `204` 반환
- HTTP QA: 삭제 후 `GET /posts/{post_id}/comments`가 `total=0` 반환
- HTTP QA: 없는 댓글 삭제 시 `404` 반환
- HTTP QA: QA용 테스트 게시글 정리 삭제 `204` 반환

커밋 추천 제목:

```txt
feat: 댓글 삭제 API와 상세 화면 연결
```

다음 후보 작업:

1. 내 기록 화면을 실제 API 기반으로 전환
2. 게시글/댓글 작성자 권한 처리를 위한 JWT/OAuth2 구현 준비
3. 태그/카테고리 API를 분리해 프론트 필터 데이터를 백엔드에서 받도록 전환

## 2026-06-14 게시글 삭제 API와 상세 화면 연결

상태: 완료

목표: 게시글 상세 화면의 삭제 버튼을 mock 안내가 아니라 실제 백엔드 `DELETE /posts/{post_id}` API에 연결한다.

구현 파일:

- `backend/app/repositories/post_repository.py`
- `backend/app/services/post_service.py`
- `backend/app/routers/posts.py`
- `frontend/src/app/api/posts.ts`
- `frontend/src/app/pages/posts/PostDetail.tsx`
- `README.md`
- `docs/agent/api-design.md`
- `docs/agent/study.md`
- `docs/agent/test.md`
- `docs/agent/setup.md`
- `docs/agent/back-keyword.md`
- `docs/agent/front-keyword.md`
- `docs/agent/troubleshooting.md`

구현 내용:

- `DELETE /posts/{post_id}` endpoint를 추가했다.
- 삭제는 hard delete가 아니라 `posts.deleted_at`을 채우는 soft delete로 처리했다.
- 삭제된 게시글은 목록, 상세, 댓글 조회에서 보이지 않는다.
- 프론트 상세 화면의 삭제 확인 버튼이 `deletePost(id)`를 호출하도록 연결했다.
- 삭제 성공 후 `/posts` 목록으로 이동한다.
- 실제 작성자/관리자 권한 검사는 JWT/OAuth2 구현 후 붙일 TODO로 남겼다.

검증:

- `backend`: `python -m compileall app` 성공
- `frontend`: `npm run build` 성공
- HTTP QA: 테스트 게시글 생성 후 `DELETE /posts/{id}`가 `204` 반환
- HTTP QA: 삭제 후 `GET /posts/{id}`가 `404` 반환
- HTTP QA: 삭제 후 `GET /posts?keyword=테스트제목` 결과가 0건
- HTTP QA: 없는 게시글 삭제 시 `404` 반환
- HTTP QA: 삭제된 게시글의 댓글 조회가 `404` 반환
- Browser QA: `/posts/8` 상세 화면에서 삭제 확인 UI가 열리고, 삭제 확인 후 `/posts`로 이동
- Browser QA: 삭제 후 화면에 `Unexpected Application Error` 없음

주의:

- PowerShell `Invoke-WebRequest`가 `204 No Content` 응답에서 내부 예외를 낸 사례가 있어, 최종 상태 코드는 `curl.exe`로 확인했다.
- 실제 서비스에서는 삭제 권한 검사를 반드시 JWT/OAuth2 이후 추가해야 한다.

커밋 추천 제목:

```txt
feat: 게시글 삭제 API와 상세 화면 연결
```

다음 후보 작업:

1. 댓글 삭제 API 구현 및 상세 화면 댓글 삭제 버튼 연결
2. 내 기록 화면을 실제 API 기반으로 전환
3. 게시글/댓글 권한 검사를 위한 JWT/OAuth2 구현 준비

## 2026-06-14 게시글 수정 API와 수정 화면 연결

상태: 완료

목표: `/posts/:id/edit` 수정 화면이 mock data가 아니라 백엔드 API를 통해 기존 게시글을 불러오고, 수정 완료 시 `PATCH /posts/{post_id}`로 실제 DB를 갱신하게 만든다.

구현 파일:

- `backend/app/schemas/post.py`
- `backend/app/repositories/post_repository.py`
- `backend/app/services/post_service.py`
- `backend/app/routers/posts.py`
- `frontend/src/app/api/posts.ts`
- `frontend/src/app/pages/posts/PostEdit.tsx`
- `README.md`
- `docs/agent/api-design.md`
- `docs/agent/study.md`
- `docs/agent/test.md`
- `docs/agent/setup.md`
- `docs/agent/back-keyword.md`
- `docs/agent/front-keyword.md`
- `docs/agent/troubleshooting.md`

구현 내용:

- `PATCH /posts/{post_id}` endpoint를 추가했다.
- 수정 request body는 `PostUpdateRequest`로 검증한다.
- 수정할 게시글은 `deleted_at is null` 조건으로 조회하고, 인증 전 단계라 `is_public` 조건은 걸지 않았다.
- posts 테이블의 제목/요약/본문/카테고리/공개 여부/관련 커밋 값을 갱신한다.
- 태그는 N:M 관계라 기존 `post_tags` 연결을 삭제한 뒤 새 태그 목록으로 다시 연결한다.
- `/posts/:id/edit` 화면은 `useParams`의 id로 `GET /posts/{id}`를 호출해 form state를 채운다.
- 수정 완료 버튼은 `updatePost(id, payload)`를 호출하고 성공 시 상세 화면으로 이동한다.

검증:

- `backend`: `python -m compileall app` 성공
- `frontend`: `npm run build` 성공
- HTTP QA: `POST /posts`로 테스트 글 생성 후 `PATCH /posts/{id}` 수정 성공
- HTTP QA: 수정된 글을 `GET /posts/{id}`로 다시 조회했을 때 제목/본문/카테고리 변경 확인
- HTTP QA: 없는 게시글 수정 시 `404` 확인
- HTTP QA: 공백 제목 수정 시 `400` 확인
- Browser QA: `/posts/5/edit`에서 API 값이 제목/본문/카테고리 form에 채워지는 것 확인

주의:

- FastAPI `TestClient`를 쓰려 했지만 현재 가상환경에 `httpx/httpx2` 테스트 의존성이 없어 HTTP QA 방식으로 검증했다.
- 실제 작성자/관리자 권한 검사는 JWT/OAuth2 구현 후 추가한다.

커밋 추천 제목:

```txt
feat: 게시글 수정 API와 수정 화면 연결
```

다음 후보 작업:

1. `DELETE /posts/{post_id}` 게시글 삭제 API 구현 및 상세 화면 삭제 버튼 연결
2. 내 기록 화면을 API 기반으로 전환
3. 게시글 수정/삭제 권한을 JWT 구현 후 현재 사용자 기준으로 보호

## 2026-06-14 게시글 목록/상세 API 전환

상태: 완료

목표: `POST /posts`로 생성된 게시글이 프론트 목록과 상세 화면에서 실제로 보이도록 `GET /posts`, `GET /posts/{post_id}`를 React 화면에 연결한다.

구현 파일:

- `frontend/src/app/api/posts.ts`
- `frontend/src/app/pages/posts/Posts.tsx`
- `frontend/src/app/pages/posts/PostDetail.tsx`
- `frontend/src/app/pages/posts/PostEdit.tsx`
- `README.md`
- `docs/agent/study.md`
- `docs/agent/test.md`
- `docs/agent/front-keyword.md`

구현 내용:

- `getPosts`, `getPostDetail` 프론트 API 함수를 추가했다.
- 전체 게시글 화면이 mock data 필터링 대신 `GET /posts` 응답을 렌더링하도록 변경했다.
- 카테고리와 검색어를 백엔드 query string으로 전달한다.
- 게시글 상세 화면이 `GET /posts/{post_id}` 응답을 렌더링하도록 변경했다.
- 새 글 발행 성공 후 `/posts/{createdPost.id}` 상세 화면으로 이동하도록 바꿨다.

검증:

- `npm run build` 성공
- `python -m compileall app` 성공
- `GET /posts?size=5`에서 생성된 게시글 id `4` 포함 확인
- `GET /posts/4` 상세 응답 확인
- 브라우저에서 `/posts` 목록에 `post create api test`가 보이는 것 확인
- 브라우저에서 `/posts/4` 상세에 `post create api content`가 보이는 것 확인

커밋 추천 제목:

```txt
feat: 게시글 목록과 상세 화면 API 연결
```

다음 후보 작업:

1. 게시글 수정 API `PATCH /posts/{post_id}` 구현 및 수정 화면 연결
2. 게시글 삭제 API `DELETE /posts/{post_id}` 구현 및 상세 화면 연결
3. 내 기록 화면을 API 기반으로 전환

## 2026-06-14 게시글 작성 API와 글쓰기 화면 연결

상태: 완료

목표: JWT/OAuth2 전 단계에서 `/posts/new`의 발행 버튼을 실제 백엔드 `POST /posts` API에 연결한다.

구현 파일:

- `backend/app/schemas/post.py`
- `backend/app/repositories/post_repository.py`
- `backend/app/services/post_service.py`
- `backend/app/routers/posts.py`
- `frontend/src/app/api/posts.ts`
- `frontend/src/app/pages/posts/PostEdit.tsx`
- `README.md`
- `docs/agent/api-design.md`
- `docs/agent/study.md`
- `docs/agent/test.md`
- `docs/agent/setup.md`
- `docs/agent/back-keyword.md`

구현 내용:

- `POST /posts` API를 추가했다.
- request body는 `title`, `summary`, `content`, `categorySlug`, `tags`, `isPublic`, `relatedCommit`을 받는다.
- JWT/OAuth2 전 단계라 작성자는 `demo.student@junglelog.local` seed user로 임시 처리했다.
- 태그가 없으면 새로 만들고, 이미 있으면 재사용한 뒤 `post_tags`로 연결한다.
- 프론트 `PostEdit`에서 새 글 발행 시 `createPost` API를 호출하도록 연결했다.
- 수정 모드는 아직 `PATCH /posts/{id}`가 없어 mock 흐름을 유지했다.

검증:

- `backend`: `python -m compileall app` 성공
- `frontend`: `npm run build` 성공
- OpenAPI에서 `/posts`에 `get`, `post` 메서드 등록 확인
- `POST /posts` 성공, 생성된 게시글 id `4` 확인
- `GET /posts?keyword=post%20create%20api%20test`에서 생성된 글 조회 확인
- 없는 카테고리 요청이 `404` 반환 확인
- 공백 제목/본문 요청이 `400` 반환 확인

커밋 추천 제목:

```txt
feat: 게시글 작성 API와 글쓰기 화면 연결
```

다음 후보 작업:

1. 게시글 목록/상세 화면을 mock data에서 API 응답으로 전환
2. 게시글 수정 API `PATCH /posts/{post_id}` 구현
3. 게시글 삭제 API `DELETE /posts/{post_id}` 구현

## 2026-06-13 댓글 작성 API와 프론트 연결

상태: 완료

목표: JWT/OAuth2 전 단계에서 게시글 상세 화면의 댓글 작성 버튼을 실제 백엔드 API와 연결한다.

구현 파일:

- `backend/app/schemas/comment.py`
- `backend/app/repositories/comment_repository.py`
- `backend/app/services/comment_service.py`
- `backend/app/routers/comments.py`
- `frontend/src/app/api/comments.ts`
- `frontend/src/app/pages/posts/PostDetail.tsx`
- `README.md`
- `docs/agent/api-design.md`
- `docs/agent/study.md`
- `docs/agent/test.md`
- `docs/agent/setup.md`
- `docs/agent/back-keyword.md`
- `docs/agent/troubleshooting.md`

구현 내용:

- `POST /posts/{post_id}/comments` API를 추가했다.
- 댓글 작성 request body는 `content`만 받도록 했다.
- JWT/OAuth2 전 단계라 작성자는 `demo.student@junglelog.local` seed user로 임시 처리했다.
- 공백 댓글은 `400`, 없는 게시글은 `404`, demo user 누락은 `500`으로 구분했다.
- 프론트 `PostDetail`에서 댓글 작성 버튼이 `createPostComment`를 호출하도록 연결했다.
- 댓글 작성 성공 시 전체 목록을 다시 불러오지 않고, 생성된 댓글 응답만 현재 comments state에 추가한다.

검증:

- `backend`: `python -m compileall app` 성공
- `frontend`: `npm run build` 성공
- OpenAPI에서 `/posts/{post_id}/comments`에 `get`, `post` 메서드 등록 확인
- `POST /posts/1/comments` 성공
- `GET /posts/1/comments`에서 작성된 댓글 포함 확인
- `POST /posts/999999/comments`가 `404` 반환 확인
- `git diff --check` 통과. Windows CRLF 변환 경고만 있음

커밋 추천 제목:

```txt
feat: 댓글 작성 API와 게시글 상세 연결
```

다음 후보 작업:

1. 게시글 작성 API `POST /posts` 구현
2. 게시글 수정/삭제 API 구현
3. 프론트 게시글 목록/상세를 mock data가 아니라 API 응답 중심으로 교체

이 문서는 JungleLog 프로젝트를 끝까지 진행하기 위한 작업 기록장이다.
Trello의 전체 TODO 흐름을 기준으로, 각 단계가 완료되었는지 확인하고 다음 단계를 결정할 때 사용한다.

## 진행 방식

1. 사용자가 "다음 거 가보자"라고 하면 현재 진행 중인 단계의 완료 기준을 먼저 확인한다.
2. 완료 기준을 통과하면 다음 단계의 목표와 체크리스트를 안내한다.
3. 통과하지 못한 항목이 있으면 다음 단계로 넘어가기 전에 보완 작업을 먼저 진행한다.
4. 진행 중 계획이 바뀌면 Trello와 이 문서에 바로 반영한다.
5. 구현 작업이 있으면 [code.md](code.md) 컨벤션을 먼저 확인한다.
6. 구현이 끝나면 `README.md`와 [study.md](study.md)를 함께 업데이트한다.
7. 프론트엔드 작업 후에는 `npm run build` 성공 여부를 확인한다.

## 전체 단계

| 순서 | 단계 | 상태 |
| --- | --- | --- |
| 0 | 프로젝트 환경 세팅 및 문서 기준 정리 | 완료 |
| 1 | React mock UI 안정화 | 완료 |
| 2 | React 코드 이해 및 학습 정리 | 완료 |
| 3 | FastAPI 백엔드 기본 구조 구현 | 완료 |
| 4 | PostgreSQL DB 설계 및 연결 | 진행 중 |
| 5 | Google OAuth / 자동 가입 / JWT 인증 구현 | 예정 |
| 6 | 게시판 CRUD API 구현 | 예정 |
| 7 | 댓글 / 태그 / 페이징 / 검색 API 구현 | 예정 |
| 8 | 프론트엔드와 백엔드 API 연결 | 예정 |
| 9 | GitHub 프로젝트 등록 기능 구현 | 예정 |
| 10 | 포트폴리오 관리 기능 완성 | 예정 |
| 11 | RAG 기능 구현 | 예정 |
| 12 | MCP 서버 구현 | 예정 |
| 13 | AI Agent 기능 구현 | 예정 |
| 14 | 권한별 화면 및 API 보호 정리 | 예정 |
| 15 | 테스트 / 오류 처리 / 예외 처리 | 예정 |
| 16 | README / study.md / 제출 문서 정리 | 예정 |
| 17 | 데모 스크린샷 및 발표 준비 | 예정 |
| 18 | 최종 빌드 / 실행 검증 / 제출 | 예정 |

## 현재 완료 확인

### 0. 프로젝트 환경 세팅 및 문서 기준 정리

- 프로젝트 폴더 구조 확인 완료
- `frontend/`, `backend/`, `docs/` 구조 생성 완료
- 팀 레포 `project/junhee` 브랜치 연결 완료
- `README.md` 작성 완료
- [study.md](study.md) 작성 완료
- [code.md](code.md) 컨벤션 확인 완료
- PostgreSQL용 `docker-compose.yml` 준비 완료

### 1. React mock UI 안정화

- 모든 주요 화면 라우트 200 응답 확인
- 화면에 깨진 한글 검색 결과 없음
- `mockData.ts` 기반으로 화면별 데이터 연결 완료
- 게시글/내 기록/포트폴리오/코치 리뷰 검색 및 필터 mock 동작 구현
- STUDENT / COACH 역할별 화면 차이 구현
- 게시글 작성/수정/삭제/댓글 mock 동작 구현
- 포트폴리오 관리와 AI 도우미 흐름 연결 완료
- `npm run build` 성공 확인
- `README.md`와 [study.md](study.md) 업데이트 완료

## 현재 진행 단계

### 2. React 코드 이해 및 학습 정리

상태: 완료

목표는 기능을 더 추가하기 전에 지금 만든 React 코드를 직접 이해하는 것이다.

체크리스트:

- `routes.tsx` 라우트 구조 이해
- `MainLayout` 역할 이해
- `RoleGate` 역할 이해
- `mockData.ts` 데이터 구조 이해
- `Posts` 검색/필터 흐름 이해
- `PostDetail`의 `useParams` 흐름 이해
- `PostEdit`의 controlled input 흐름 이해
- `Portfolio`의 프로젝트 선택과 기록 연결 흐름 이해
- `AIAssistant`의 프로젝트 기반 생성 흐름 이해
- `CoachReview`의 STUDENT / COACH 분기 흐름 이해
- React component 개념 정리
- React state 개념 정리
- React Router 개념 정리
- TypeScript union type 개념 정리

완료 기준:

- 주요 파일을 읽고 각 파일의 역할을 말할 수 있다.
- mock data가 화면에서 어떻게 필터링되는지 설명할 수 있다.
- `useState`, `useParams`, `useSearchParams`, `useNavigate`가 어디서 쓰였는지 찾을 수 있다.
- [study.md](study.md)에 React 코드 이해 내용을 추가한다.

진행 기록:

- 2026-06-06: 2단계 시작. 라우트, 레이아웃, RoleGate, mockData, 주요 페이지 파일의 읽는 순서를 정리했다.
- 2026-06-10: `MainLayout`의 동작하지 않는 헤더 전역 검색 UI를 제거했다. 페이지별 검색은 유지하고, `test.md`를 반복 검증 체크리스트처럼 운영하도록 정리했다.
- 2026-06-11: `CoachReview`에서 리뷰 요청 state를 부모로 끌어올려 STUDENT / COACH 화면이 같은 mock 원본 요청 state를 공유하도록 정리했다. 학생은 본인 요청만, 코치는 mock `currentCoachId`에 배정된 요청만 필터링하도록 개선했다. 코치 피드백 전송 안내와 빈 피드백 방어 흐름을 추가했고 `npm run build` 성공을 확인했다.
- 2026-06-11: React Router 훅, state lifting, props, `useMemo`, role 기반 화면 분기까지 복습했으므로 2단계를 완료 처리하고 백엔드 기본 구조 구현으로 이동한다.
- 2026-06-11: 키워드 학습 문서를 `front-keyword.md`, `back-keyword.md`로 분리하고 중복 안내 문서를 정리했다.
- 2026-06-11: `test.md`를 자체 QA 체크리스트로 재정의하고, 실제 문제 해결 기록은 `troubleshooting.md`로 분리했다.

### 3. FastAPI 백엔드 기본 구조 구현

상태: 완료

목표는 게시판 API를 바로 완성하는 것이 아니라, FastAPI 서버가 정상 실행되고 기본 API가 응답하는 백엔드 뼈대를 만드는 것이다.

체크리스트:

- Python / pip / Docker 개발 환경 확인
- backend 가상환경 생성 또는 확인
- FastAPI / Uvicorn 설치
- `backend/app/main.py` 생성
- `backend/app/routers/health.py` 생성
- `/health` API 응답 확인
- Swagger 문서 `/docs` 확인
- CORS 설정 추가
- README와 study 문서에 백엔드 실행 방법 정리

완료 기준:

- `uvicorn app.main:app --reload`로 서버가 실행된다.
- `GET /health`가 `{ "status": "ok" }` 형태로 응답한다.
- `http://localhost:8000/docs`에서 Swagger 문서를 확인할 수 있다.
- 프론트엔드와 연결할 수 있도록 CORS 기본 설정이 들어가 있다.
- 백엔드 기본 구조와 실행 방법이 문서에 정리되어 있다.

진행 기록:

- 2026-06-11: 백엔드 세팅 명령어와 실행 방법을 계속 누적하기 위해 `setup.md`를 추가했다.
- 2026-06-11: FastAPI / Uvicorn 설치 후 `requirements.txt`를 생성했다.
- 2026-06-11: `main.py`와 `routers/health.py`를 구성하고 `/health`, `/docs` 응답을 확인했다.
- 2026-06-11: `pydantic-settings`를 추가하고 `.env` / `config.py` / `.env.example` 기반으로 앱 이름과 CORS origin 설정을 분리했다.
- 2026-06-11: `test.md` 기준으로 FastAPI 서버, `/health`, `/docs`, CORS, configuration QA를 통과했다.

### 4. PostgreSQL DB 설계 및 연결

상태: 진행 중

목표는 Docker Compose로 PostgreSQL을 실행하고, FastAPI가 DB에 연결할 수 있는 기반을 만드는 것이다.

체크리스트:

- Docker / Docker Compose 설치 확인
- `docker-compose.yml`의 PostgreSQL 설정 이해
- `docker compose up -d`로 PostgreSQL 컨테이너 실행
- `docker ps`로 `junglelog-postgres` 실행 상태 확인
- `docker logs junglelog-postgres`에서 readiness 로그 확인
- Docker volume 생성 확인
- `DATABASE_URL` 환경변수 추가
- SQLAlchemy / psycopg 설치
- `db/session.py`에서 DB engine/session 구성
- DB 연결 확인용 API 또는 스크립트 작성

완료 기준:

- `junglelog-postgres` 컨테이너가 `Up` 상태다.
- PostgreSQL이 `localhost:5432`에서 연결 가능하다.
- FastAPI 설정에서 `DATABASE_URL`을 읽을 수 있다.
- SQLAlchemy session 구성이 완료된다.
- DB 연결 확인이 성공한다.

진행 기록:

- 2026-06-11: Docker 29.2.1, Docker Compose v5.1.0 확인.
- 2026-06-11: `docker compose up -d`로 `junglelog-postgres` 컨테이너 실행 성공.
- 2026-06-11: `docker ps`에서 `0.0.0.0:5432->5432/tcp` 포트 매핑과 `Up` 상태 확인.
- 2026-06-11: `docker logs junglelog-postgres`에서 `database system is ready to accept connections` 확인.
- 2026-06-11: `week15_ai_board_postgres_data` volume 생성 확인.
- 2026-06-11: `SQLAlchemy`, `psycopg[binary]` 설치 후 `requirements.txt`를 갱신했다.
- 2026-06-11: `.env`, `.env.example`, `config.py`에 `DATABASE_URL` 설정을 추가했다.
- 2026-06-11: `db/session.py`에서 SQLAlchemy `engine`, `SessionLocal`, `get_db()` 구성을 완료했다.
- 2026-06-11: `/health/db` endpoint에서 `SELECT 1`을 실행해 FastAPI와 PostgreSQL 연결을 확인했다.
- 2026-06-11: `test.md` 기준으로 `/health`, `/health/db`, OpenAPI path, Docker 컨테이너 상태, backend compile QA를 통과했다.
- 2026-06-11: 프론트엔드 `npm run build`도 성공해 기존 React 화면이 깨지지 않았음을 확인했다.
- 2026-06-11: `docs/agent/db-design.md`에 dbdiagram.io용 ERD v1 DBML 초안을 작성했다.
- 2026-06-11: 인증 방식을 Google OAuth 단일 로그인으로 확정하고, `users` 테이블과 `/login` mock 화면에 반영했다.
- 2026-06-11: `/signup` 라우트와 화면을 제거했다. 첫 로그인 자동 가입은 Google OAuth callback에서 처리하고, v1의 학생/코치 권한은 관리자 승인 화면에서 지정한다.
- 2026-06-11: 정글 내부 서비스 정책에 맞춰 운영자 승인 구조를 v1에 포함했다. `ADMIN` role, `approval_status`, `/pending-approval`, `/admin/users`, `user_approval_logs`, `ADMIN_EMAILS` 초기 관리자 방식을 반영했다.
- 2026-06-11: 운영자 승인 구조 반영 후 프론트엔드 `npm run build`와 백엔드 `python -m compileall app` 검증을 통과했다.
- 2026-06-11: 승인 상태 표현을 `승인 대기 / 승인 완료 / 거절 / 정지`로 통일하고, role/승인상태 선택기는 개발용 mock UI임을 명시했다. 관리자 사이드바는 `사용자 승인`만 남기고, 관리자는 직접 URL 접근으로 전체 기록과 리뷰 요청을 확인할 수 있도록 정리했다.
- 2026-06-12: Google mock 로그인과 관리자 승인 화면을 QA했다. 로그인 클릭 시 신규 학생이 `승인 대기`로 이동하도록 수정했고, `RoleGate`에서 승인 상태 문제와 role 접근 제한 문구를 분리했다. 관리자 화면은 role 선택값을 draft로 들고 있다가 `승인 적용`에서 role과 `승인 완료`를 함께 반영하도록 정리했다.
- 2026-06-12: DB 설계 v1을 Google OAuth/관리자 승인 정책 기준으로 보정했다. `user_approval_logs.actor_id`를 초기 관리자 자동 생성에 맞게 nullable로 바꾸고, `action`, `approval_note`, 리뷰 상태 목록, 포트폴리오/코치 피드백 상태 목록, v1 확정 결정을 문서화했다.
- 2026-06-12: `db-design.md`에 테이블별 필드 의미, 타입을 선택한 이유, 현재 화면 기능과의 연결, dbdiagram.io ERD 그림 읽는 법을 추가했다. `post_categories`는 `posts.category_id`, `review_requests.category_id`와 연결되는 기준 테이블임을 명확히 적었다.
- 2026-06-12: `db-design.md` Preview에서 설명이 바로 보이도록 타입/필드/ERD 그림 읽는 법 섹션을 DBML 코드블록 위로 이동했다. dbdiagram.io 그림은 문서 수정만으로 자동 갱신되지 않고 DBML을 다시 붙여넣어야 한다는 안내를 추가했다.

## 백엔드 연결 후 구현 예정

- Google OAuth 로그인과 첫 로그인 자동 가입
- 실제 로그인 사용자 role 판별
- 운영자 승인 상태 판별
- JWT 기반 라우트 보호
- 사용자 승인 / 거절 / 정지 / role 변경 API
- 실제 게시글 CRUD API 연결
- 실제 댓글 저장/삭제 API 연결
- 실제 프로젝트-게시글 연결 저장
- 실제 GitHub API 분석 결과 저장
- 실제 OpenAI/RAG/MCP/Agent 호출

## 2026-06-12 DB 설계와 현재 화면 매핑 QA

상태: 완료

목표: 현재 React mock UI에서 쓰는 데이터가 ERD v1에 저장될 수 있는지 확인했다.

확인한 화면:

- 로그인/승인 대기/관리자 사용자 승인
- 전체 게시글/게시글 상세/게시글 작성/수정/댓글
- 내 기록
- 포트폴리오 관리/기록 연결하기
- AI 도우미
- 코치 리뷰 요청/코치 인박스
- 알림 드롭다운

QA 결과:

- 전체 구조는 현재 화면 흐름과 맞다.
- `users`, `posts`, `comments`, `post_categories`, `tags`, `post_tags`, `portfolio_projects`, `portfolio_project_posts`, `review_requests`, `review_request_coaches`, `notifications`로 v1 화면 대부분을 설명할 수 있다.
- 화면에서 계산되는 `comments` 수, `linkedRecordCount`, `requesterName`, `coachNames`, `targetTitle`은 DB에 중복 저장하지 않고 JOIN/count 결과로 만든다.
- 게시글의 `contentSections`는 v1에서 `posts.content text`에 Markdown/본문 문자열로 저장한다.
- `MockPost.relatedCommit`은 저장 위치가 애매해서 `posts.related_commit text`를 DBML에 추가했다.
- `PortfolioProject.summary`는 저장 위치가 애매해서 `portfolio_projects.summary text`를 DBML에 추가했다.

다음 작업:

- SQLAlchemy model 작성 시 `db-design.md`의 보정된 DBML을 기준으로 삼는다.
- 먼저 `users`, `post_categories`, `posts`부터 모델을 만들고, 그 다음 댓글/태그/포트폴리오/코치 리뷰로 확장한다.

## 2026-06-12 DB 필드별 선언 이유 학습 문서 보강

상태: 완료

목표: ERD와 테이블 필드를 보면서 학습할 수 있도록, 각 필드가 왜 필요한지 `db-design.md`에 명시했다.

진행 내용:

- `users`부터 `notifications`까지 v1 테이블의 모든 필드에 대해 선언 이유를 정리했다.
- 각 필드가 어떤 화면/기능과 연결되는지 설명했다.
- `post_tags`, `portfolio_project_posts`, `review_request_coaches`처럼 N:M 연결 테이블이 왜 필요한지 따로 설명했다.
- 화면에는 보이지만 DB에는 저장하지 않고 JOIN/count로 만드는 값도 분리했다.

다음 작업:

- SQLAlchemy model을 만들 때 `db-design.md`의 필드별 선언 이유를 보면서 컬럼을 옮긴다.
- 모델 작성 후에는 각 모델이 어떤 화면 데이터를 책임지는지 다시 QA한다.

## 2026-06-12 DB 설계와 프론트 mock data 재점검

상태: 완료

목표: `db-design.md`의 ERD v1이 현재 프론트엔드 mock 화면과 실제 API 연결 시 자연스럽게 이어지는지 확인했다.

결과:

- 현재 DB 설계는 프론트엔드 주요 화면과 연결 가능하다.
- 새 테이블을 추가할 필요는 없다.
- 기존 보정 컬럼인 `posts.related_commit`, `portfolio_projects.summary` 덕분에 핵심 mock 필드의 저장 위치는 맞춰졌다.
- `Category.count`, `MockPost.comments`, `PortfolioProject.linkedRecordCount`, `ReviewRequest.coachNames`, `ReviewRequest.targetTitle`, `notifications.time`은 DB에 중복 저장하지 않고 JOIN/count/날짜 계산으로 만든다.
- `contentSections`는 v1에서 `posts.content` 문자열로 저장하고, 구조화 저장은 v2에서 검토한다.
- `tech_stack`은 v1에서 `portfolio_projects.tech_stack` text로 충분하고, 고급 검색/통계가 필요해지면 v2에서 분리한다.

다음 작업:

- SQLAlchemy model 작성 시 DB 컬럼명과 프론트 응답 필드명이 다를 수 있음을 의식한다.
- API schema를 만들 때 `view_count -> views`, `is_public -> isPublic`, `repo_full_name -> repo`처럼 프론트가 쓰기 좋은 응답으로 변환한다.

## 2026-06-12 Google OAuth 이름 저장 정책 정리

상태: 완료

정리 내용:

- `users.name`은 Google 원본 이름이 아니라 JungleLog 안에서 보여줄 서비스 표시 이름으로 정의했다.
- 첫 로그인 때 Google `name`을 `users.name`의 초기값으로 사용한다.
- 사용자가 설정 화면에서 이름을 바꾸면 `users.name`을 수정한다.
- 이후 Google 로그인 때마다 Google `name`으로 `users.name`을 덮어쓰지 않는다.
- Google 원본 이름 보존이 필요해지면 v2에서 `google_name` 또는 `oauth_name` 컬럼을 추가한다.

다음 OAuth 구현 시 주의할 점:

- OAuth callback에서 `google_sub`로 기존 사용자를 찾는다.
- 기존 사용자가 있으면 `email`, `profile_image_url`, `last_login_at` 정도만 갱신하고, 사용자가 바꾼 `name`은 유지한다.
- 신규 사용자일 때만 Google `name`으로 `users.name`을 초기화한다.

## 2026-06-13 SQLAlchemy 모델 1차 구현

상태: 완료

목표: ERD v1에서 가장 먼저 필요한 `users`, `post_categories`, `posts` 테이블을 SQLAlchemy 모델 코드로 옮겼다.

구현한 파일:

- `backend/app/db/models/user.py`
- `backend/app/db/models/post_category.py`
- `backend/app/db/models/post.py`
- `backend/app/db/models/__init__.py`

구현 내용:

- `User` 모델에 Google OAuth 사용자, role, 승인 상태, 승인자, 생성/수정 시간을 선언했다.
- `PostCategory` 모델에 카테고리 slug, label, 생성/수정 시간을 선언했다.
- `Post` 모델에 작성자, 카테고리, 제목, 요약, 본문, 연결 커밋, 공개 여부, 조회수, soft delete 시간을 선언했다.
- `Post.author_id -> users.id`, `Post.category_id -> post_categories.id` 외래키를 연결했다.
- `User.posts`, `Post.author`, `Post.category`, `PostCategory.posts` 관계를 선언했다.

검증:

- 가상환경 Python으로 `python -m compileall app` 성공.
- `Base.metadata.tables`에 `post_categories`, `posts`, `users`가 등록되는 것을 확인했다.

주의:

- 시스템 Python으로 확인하면 `sqlalchemy`가 없어서 실패할 수 있다.
- 백엔드 검증은 `backend/.venv/Scripts/python.exe` 또는 가상환경 활성화 후 실행해야 한다.

다음 작업:

- 테이블 생성 방식을 결정한다. 초보 학습 단계에서는 `Base.metadata.create_all()`로 먼저 테이블 생성 흐름을 확인하고, 이후 Alembic migration으로 넘어가는 방향이 좋다.
- 그다음 기본 카테고리 seed 데이터를 넣는다.

## 2026-06-13 DB 테이블 생성과 카테고리 seed 구현

상태: 완료

목표: SQLAlchemy 모델로 선언한 `users`, `post_categories`, `posts` 테이블을 실제 PostgreSQL에 생성하고, 기본 게시글 카테고리를 넣었다.

구현한 파일:

- `backend/app/db/init_db.py`

구현 내용:

- `create_tables()`에서 `Base.metadata.create_all(bind=engine)`을 실행한다.
- `seed_post_categories()`에서 기본 카테고리 5개를 넣는다.
- 이미 존재하는 `slug`는 다시 넣지 않도록 처리해 seed가 중복되지 않게 했다.
- `init_db()`에서 테이블 생성과 카테고리 seed를 함께 실행한다.

실행한 명령:

```powershell
.\.venv\Scripts\python.exe -c "from app.db.init_db import init_db; init_db(); print('init_db done')"
```

검증:

- 실제 PostgreSQL 테이블 목록: `post_categories`, `posts`, `users`
- 기본 카테고리 5개 확인:
  - `learning-log`
  - `troubleshooting`
  - `retrospective`
  - `interview`
  - `portfolio`
- `init_db()`를 다시 실행해도 카테고리 개수가 5개로 유지됨을 확인했다.

다음 작업:

- `comments`, `tags`, `post_tags` 모델을 추가한다.
- 그다음 게시글 조회 API에서 `posts`, `users`, `post_categories`를 JOIN해 프론트 응답 모양으로 내려주는 흐름을 만든다.

## 2026-06-13 댓글/태그 모델 추가

상태: 완료

목표: 게시글 상세 댓글과 게시글 태그 표시/검색을 위해 `comments`, `tags`, `post_tags` 모델을 추가했다.

구현한 파일:

- `backend/app/db/models/comment.py`
- `backend/app/db/models/tag.py`
- `backend/app/db/models/post_tag.py`
- `backend/app/db/models/user.py`
- `backend/app/db/models/post.py`
- `backend/app/db/models/__init__.py`

구현 내용:

- `Comment` 모델을 추가했다.
  - `post_id -> posts.id`
  - `author_id -> users.id`
  - `content`, `created_at`, `updated_at`, `deleted_at`
- `Tag` 모델을 추가했다.
  - `name`, `slug`, `created_at`, `updated_at`
- `PostTag` 모델을 추가했다.
  - `post_id + tag_id`를 복합 primary key로 사용한다.
  - 게시글과 태그의 N:M 관계를 연결한다.
- `User.comments`, `Post.comments` 관계를 추가했다.
- `Post.post_tags`, `Tag.post_tags`, `PostTag.post`, `PostTag.tag` 관계를 추가했다.

검증:

- 가상환경 Python 기준 `python -m compileall app` 성공.
- `Base.metadata.tables`에 `comments`, `tags`, `post_tags`가 등록되는 것을 확인했다.
- `init_db()` 실행 후 실제 PostgreSQL 테이블 목록에 `comments`, `tags`, `post_tags`가 추가됐다.
- 새 테이블들은 아직 seed 데이터가 없어 count가 0인 상태다.

다음 작업:

- 게시글 조회 API 응답 형태를 위한 Pydantic schema를 작성한다.
- 이후 repository/service/router 흐름으로 `GET /posts`, `GET /posts/{post_id}`를 만든다.

## 2026-06-13 4단계 API 설계와 게시글 조회 API 시작

상태: 1차 완료

목표: 프론트 mock data를 실제 API 응답으로 바꾸기 전에 API 계약을 먼저 문서화하고, 가장 작은 범위로 게시글 목록/상세 조회 API를 구현한다.

구현한 파일:

- `docs/agent/api-design.md`
- `backend/app/schemas/post.py`
- `backend/app/repositories/post_repository.py`
- `backend/app/services/post_service.py`
- `backend/app/routers/posts.py`
- `backend/app/main.py`
- `backend/app/db/init_db.py`

구현 내용:

- `docs/agent/api-design.md`에 JungleLog API 설계 v1을 추가했다.
- 4단계 1차 구현 범위를 `GET /posts`, `GET /posts/{post_id}`로 정했다.
- 게시글 목록 응답은 `items`, `total`, `page`, `size` 구조로 설계했다.
- DB 컬럼 이름과 프론트 응답 이름이 다를 수 있음을 명시했다.
- `PostListResponse`, `PostDetailResponse` Pydantic schema를 만들었다.
- DB 조회는 repository, 응답 조립은 service, HTTP endpoint는 router로 분리했다.
- 개발용 demo 사용자/게시글/태그 seed를 추가했다.

검증 결과:

- `init_db()`를 다시 실행해 demo 게시글 seed가 정상 동작함을 확인했다.
- `GET /posts`가 HTTP 200과 demo 게시글 3개를 반환했다.
- `GET /posts?category=learning-log`가 HTTP 200과 1개 결과를 반환했다.
- `GET /posts?keyword=JWT`가 HTTP 200과 1개 결과를 반환했다.
- `GET /posts/999999`가 HTTP 404를 반환했다.
- OpenAPI schema에 `/posts`, `/posts/{post_id}`가 등록되어 있음을 확인했다.
- `python -m compileall app`이 성공했다.
- `npm run build`가 성공했다.

다음 작업:

- 게시글 조회 API 코드를 파일별로 학습한다.
- 댓글 조회 API 설계를 시작한다.
- 이후 게시글 작성/수정/삭제 API로 확장한다.

## 2026-06-13 게시글 조회 API 학습용 주석 추가

상태: 완료

목표: 초보자가 4단계 게시글 조회 API 구현 흐름을 파일별로 따라갈 수 있도록 학습용 주석을 촘촘히 추가한다.

수정한 파일:

- `backend/app/main.py`
- `backend/app/routers/posts.py`
- `backend/app/services/post_service.py`
- `backend/app/repositories/post_repository.py`
- `backend/app/schemas/post.py`
- `backend/app/db/init_db.py`
- `docs/agent/study.md`

검증:

- `python -m compileall app` 성공
- `npm run build` 성공

다음 작업:

- 주석을 기준으로 게시글 조회 API 흐름을 학습한다.
- 그다음 댓글 조회 API 또는 남은 SQLAlchemy 모델 6개 추가 중 하나를 선택한다.

## 2026-06-13 ERD v1 남은 6개 SQLAlchemy 모델 추가

상태: 완료

목표: DB 설계 문서의 v1 테이블 12개를 모두 SQLAlchemy 모델과 실제 PostgreSQL 테이블로 반영한다.

추가한 모델 파일:

- `backend/app/db/models/user_approval_log.py`
- `backend/app/db/models/portfolio_project.py`
- `backend/app/db/models/portfolio_project_post.py`
- `backend/app/db/models/review_request.py`
- `backend/app/db/models/review_request_coach.py`
- `backend/app/db/models/notification.py`

수정한 파일:

- `backend/app/db/models/user.py`
- `backend/app/db/models/post.py`
- `backend/app/db/models/post_category.py`
- `backend/app/db/models/__init__.py`

구현 내용:

- 관리자 승인 이력 저장용 `user_approval_logs` 모델을 추가했다.
- GitHub repo 기반 포트폴리오 프로젝트 저장용 `portfolio_projects` 모델을 추가했다.
- 포트폴리오 프로젝트와 게시글 N:M 연결용 `portfolio_project_posts` 모델을 추가했다.
- 학생이 코치에게 보내는 리뷰 요청용 `review_requests` 모델을 추가했다.
- 리뷰 요청과 코치 N:M 연결용 `review_request_coaches` 모델을 추가했다.
- 사용자별 알림용 `notifications` 모델을 추가했다.
- `users`, `posts`, `post_categories`와 새 모델들의 `relationship`을 연결했다.
- `models/__init__.py`에 새 모델을 등록해 `Base.metadata.create_all()`이 인식하도록 했다.

검증:

- `python -m compileall app` 성공
- SQLAlchemy `configure_mappers()` 성공
- `init_db()` 실행 성공
- 실제 PostgreSQL 테이블 12개 확인
- `npm run build` 예정

현재 실제 테이블:

```txt
comments
notifications
portfolio_project_posts
portfolio_projects
post_categories
post_tags
posts
review_request_coaches
review_requests
tags
user_approval_logs
users
```

다음 작업:

- 이번에 추가한 DB 모델 관계를 학습한다.
- 이후 댓글 API 또는 게시글 작성/수정/삭제 API로 이동한다.

## 2026-06-13 구현 완료 후 커밋 안내 규칙 추가

상태: 완료

목표: 앞으로 기능 구현 단위가 끝날 때마다 커밋 시점과 추천 커밋 제목을 안내하도록 작업 규칙에 반영한다.

수정한 파일:

- `docs/agent/agent.md`
- `docs/agent/code.md`
- `docs/agent/log.md`

반영한 규칙:

- 구현 완료 후 커밋 가능한 시점을 알려준다.
- 추천 커밋 제목을 함께 제안한다.
- 코드 작성 시 학습용 주석을 남긴다.
- 구현할 때마다 `docs/agent` 문서를 참고하고 필요한 문서를 업데이트한다.

추천 커밋 제목:

```txt
docs: 작업 운영 규칙에 커밋 안내 추가
```

## 2026-06-13 댓글 조회 API와 프론트 연결 QA

상태: 완료

목표: 게시글 상세 화면에서 백엔드 댓글 조회 API를 호출하고, API 응답을 프론트 댓글 state에 반영한다.

구현/수정한 파일:

- `backend/app/schemas/comment.py`
- `backend/app/repositories/comment_repository.py`
- `backend/app/services/comment_service.py`
- `backend/app/routers/comments.py`
- `backend/app/main.py`
- `frontend/src/app/api/comments.ts`
- `frontend/src/app/pages/posts/PostDetail.tsx`

확인 중 발견한 문제:

- comments router가 `/posts/{post_id}`로 등록되어 기존 게시글 상세 API와 충돌할 수 있었다.
- 프론트 `PostDetail`이 댓글 API가 아니라 `/posts/{id}` 게시글 상세 API를 fetch하고 있었다.
- `useEffect` dependency가 `[comments]`라 댓글 state 변경 때마다 다시 호출될 수 있었다.

수정:

- 댓글 endpoint를 `GET /posts/{post_id}/comments`로 수정했다.
- 게시글이 없으면 404를 반환하도록 router에서 `HTTPException` 처리했다.
- 프론트 API 호출을 `frontend/src/app/api/comments.ts`로 분리했다.
- `PostDetail`에서 댓글 API 응답을 화면 state로 변환하도록 수정했다.
- 댓글 로딩, 실패, 빈 목록 UI를 추가했다.

검증:

- `python -m compileall app` 성공
- OpenAPI path에 `/posts/{post_id}/comments` 등록 확인
- `npm run build` 성공
- `GET /posts/1/comments` -> 200, `total=0`
- `GET /posts/999999/comments` -> 404
- CORS header `access-control-allow-origin=http://localhost:5173` 확인

추천 커밋 제목:

```txt
feat: 댓글 조회 API와 게시글 상세 연결
```

## 2026-06-14 Google OAuth ���� ���� Ȯ��

����: ���� ��

��ǥ: Google Cloud OAuth Client ���� �� �鿣�� `.env`���� OAuth/JWT ������ ���� �� �ִ��� Ȯ���Ѵ�.

Ȯ�� ���:

- `GOOGLE_CLIENT_ID` ������
- `GOOGLE_CLIENT_SECRET` ������
- `GOOGLE_REDIRECT_URI=http://localhost:8000/auth/google/callback`
- `JWT_SECRET_KEY` �⺻������ �����
- access token ����: 15��
- refresh token ����: 14��
- `httpx` ��ġ �� `requirements.txt` �ݿ� �Ϸ�

���� �۾�:

- Google login URL ���� endpoint ����
- Google callback endpoint ����
- access/refresh token cookie �߱�
- `/auth/me`, `/auth/refresh`, `/auth/logout` ����

## 2026-06-14 OAuth ���� ��� schema/repository �߰�

����: �Ϸ�

��ǥ: Google OAuth callback ���� ���� ����� ����/��ȸ�� refresh token ����/��ȸ å���� repository �������� �и��Ѵ�.

�߰��� ����:

- `backend/app/schemas/auth.py`
- `backend/app/repositories/user_repository.py`
- `backend/app/repositories/auth_token_repository.py`

������ ��:

- `/auth/me` ���信 ����� `CurrentUserResponse` schema �߰�
- Google `sub` ���� ����� ��ȸ �Լ� �߰�
- Google ù �α��� ����� ���� �Լ� �߰�
- ��α��� �� �̸���, ������ �̹���, ������ �α��� �ð� ���� �Լ� �߰�
- �ʱ� ������ �̸����̸� `ADMIN / ���� �Ϸ�`�� ����
- �Ϲ� ����ڴ� `STUDENT / ���� ���`�� ����
- refresh token hash ����/��ȸ/Ȱ�� ���� Ȯ��/��� �Լ� �߰�

���� �������� ���� ��:

- Google �α��� ���� endpoint
- Google callback endpoint
- Google token endpoint ȣ��
- Google userinfo endpoint ȣ��
- HttpOnly cookie �߱�
- `/auth/me`, `/auth/refresh`, `/auth/logout`

����:

- `python -m compileall app` ����
- `CurrentUserResponse` alias ��� Ȯ��
- `user_repository`, `auth_token_repository` import Ȯ��

��õ Ŀ�� ����:

```txt
feat: Google OAuth ���� repository ��� �߰�
```

## 2026-06-14 Google OAuth auth router/service/dependency ����

����: �Ϸ�

��ǥ: Google OAuth �α��� ���ۺ��� ���� ����� ��ȸ���� �鿣�� ���� endpoint ����� �����Ѵ�.

�߰�/������ ����:

- `backend/app/dependencies/__init__.py`
- `backend/app/dependencies/auth.py`
- `backend/app/services/auth_service.py`
- `backend/app/routers/auth.py`
- `backend/app/main.py`

������ endpoint:

- `GET /auth/google/login`
- `GET /auth/google/callback`
- `GET /auth/me`
- `POST /auth/refresh`
- `POST /auth/logout`

������ ��:

- OAuth `state` cookie ���� �� callback ����
- Google �α��� URL ����
- Google authorization code -> Google access token ��ȯ �Լ�
- Google access token -> Google userinfo ��ȸ �Լ�
- Google profile -> JungleLog User ��ȸ/���� ����
- JungleLog access token / refresh token �߱�
- refresh token hash DB ����
- HttpOnly cookie ����
- refresh token rotation
- logout �� refresh token ��� �� cookie ����
- `get_current_user`, `get_current_approved_user`, `require_roles` dependency �߰�

���� ���� ��:

- React �α��� ��ư�� `/auth/google/login`�� ����
- �α��� �� `/auth/me`�� ���� ����� role/approvalStatus ��������
- ���� demo user ��� �Խñ� �ۼ�/�� ��� API�� current user ������� ����
- ������ ���� API ����
- CSRF token ��� mutating request ����

����:

- `python -m compileall app` ����
- FastAPI app�� auth route 5�� ��� Ȯ��
- `GET /auth/google/login` -> 307
- Google redirect location ���� Ȯ��
- OAuth state cookie ���� Ȯ��
- cookie ���� `GET /auth/me` -> 401
- cookie ���� `POST /auth/refresh` -> 401
- `POST /auth/logout` -> 200

��õ Ŀ�� ����:

```txt
feat: Google OAuth ���� ����� ����
```

## 2026-06-15 코치 리뷰 화면 API 연결

상태: 완료

목표: 코치 리뷰 화면에서 mock reviewRequests를 제거하고, 학생/코치 역할별로 실제 백엔드 리뷰 요청 API를 호출하도록 연결한다.

구현한 것:

- `frontend/src/app/api/reviews.ts` 추가
- 학생 리뷰 요청 화면에서 내 게시글, 포트폴리오 프로젝트, 코치 목록, 내 요청 목록을 API로 조회
- 학생 리뷰 요청 생성 버튼을 `POST /review-requests`에 연결
- 대기 중 리뷰 요청 취소 버튼을 `DELETE /review-requests/{id}`에 연결
- 코치 인박스 화면을 `GET /review-requests/inbox`에 연결
- 코치 피드백/상태 저장 버튼을 `PATCH /review-requests/{id}`에 연결
- 코치 인박스 검색/카테고리/상태 필터는 API 응답 목록 기준으로 동작

남긴 것:

- 코치 피드백을 원문 댓글에도 자동 등록할지는 정책 결정 후 별도 구현
- AI 도우미 화면은 아직 AI 연결 전 샘플 상태

검증:

- `npm run build` 성공
- `python -m compileall app` 성공
- `git diff --check` 통과

추천 커밋 제목:

```txt
feat: 코치 리뷰 화면 API 연결
```
## 2026-06-15 AI 도우미 포트폴리오 API 기반 정리

상태: 완료

목표: AI 도우미가 포트폴리오 관리 화면과 따로 놀지 않도록, 실제 포트폴리오 API와 내 기록 API를 기준으로 참고 자료를 구성한다.

구현한 것:

- `AIAssistant.tsx`에서 `mockData.portfolioProjects` 직접 사용 제거
- `GET /portfolio/projects`로 내 프로젝트 목록 조회
- `GET /me/posts`로 현재 로그인 사용자의 기록 조회
- 선택 프로젝트의 `linkedPostIds`로 연결된 기록 필터링
- 등록된 프로젝트가 없을 때 포트폴리오 관리 이동 안내
- 포트폴리오 글 샘플 결과를 `PATCH /portfolio/projects/{id}`로 저장
- 면접 예상 질문 저장은 AI 기능 연결 단계로 명확히 분리
- `MyRecords.tsx`의 demo student 문구 제거

아직 남은 것:

- 실제 OpenAI 호출
- RAG vector search
- GitHub MCP를 통한 README/커밋 자동 분석
- Agent 추론 루프

검증:

- `npm run build` 성공
- `python -m compileall app` 성공
- `git diff --check` 통과

추천 커밋 제목:

```txt
feat: AI 도우미 포트폴리오 API 기반 정리
```
## 2026-06-15 대시보드 API 기반 정리

상태: 완료

목표: 대시보드에서 남아 있던 게시글/코치 리뷰 mock 데이터를 제거하고, 실제 API 응답 기준으로 통계와 최근 목록을 표시한다.

구현한 것:

- 학생 대시보드에서 `GET /me/posts`로 최근 기록과 카테고리별 수 계산
- 학생 대시보드에서 `GET /review-requests/me`로 진행 중인 리뷰 요청 수 표시
- 코치 대시보드에서 `GET /review-requests/inbox`로 검토 필요 요청과 최근 요청 표시
- 코치 대시보드에서 `GET /posts`로 전체 게시글 수 표시
- 로딩/오류/빈 목록 UI 추가
- AI 도우미의 `useEffect` dependency를 `searchParams` 객체 대신 query string 값으로 안정화

검증:

- `npm run build` 성공

추천 커밋 제목:

```txt
feat: 대시보드 API 기반 정리
```
## 2026-06-15 설정 화면 준비 중 상태 정리

상태: 완료

구현한 것:

- 프로필 mock 저장 버튼 제거
- 현재 로그인 사용자 이름/이메일을 read-only로 표시
- GitHub mock 연결 계정 문구 제거
- GitHub 계정 연동은 준비 중으로 표시

검증:

- `npm run build` 성공

추천 커밋 제목:

```txt
fix: 설정 화면 mock 문구 정리
```
## 2026-06-15 OAuth 로그인 시작 흐름 QA

상태: 부분 완료

검증한 것:

- `http://localhost:5173/login` -> 200
- 비로그인 상태에서 `http://localhost:5173/` 진입 시 `/login` 화면 표시
- `Login.tsx` 버튼이 `loginWithGoogle` 호출
- `loginWithGoogle`가 `window.location.href = {API_BASE_URL}/auth/google/login` 실행
- `GET /auth/google/login` -> 307 Temporary Redirect
- redirect location이 Google OAuth 도메인
- `junglelog_oauth_state` cookie 설정
- 쿠키 없는 `GET /auth/me` -> 401

주의:

- `curl -I /auth/google/login`은 HEAD 요청이므로 405가 정상이다. 이 endpoint는 GET만 허용한다.
- 실제 Google 계정 선택과 동의는 사용자 계정 조작이 필요하므로 수동 QA로 남겼다.
- Browser 플러그인으로 버튼 클릭 확인 중 timeout이 발생해 HTTP/code 기준 QA로 대체했다.
## 2026-06-15 레거시 mockData 제거

상태: 완료

목표: 실제 API 기준으로 전환된 화면에서 남아 있던 `data/mockData.ts` 의존을 제거한다.

구현한 것:

- `constants/categories.ts` 추가
- 카테고리 import를 `data/mockData.ts`에서 `constants/categories.ts`로 변경
- `api/posts.ts`, `api/comments.ts`, `PostDetail.tsx`가 `UserRole`을 `api/auth.ts`에서 가져오도록 변경
- `PostDetail` 관련 기록을 `GET /posts` API 기반으로 전환
- `PostEdit` 최근 공개 기록을 `GET /posts` API 기반으로 전환
- `MainLayout` 알림 샘플을 레이아웃 내부 상수로 이동
- `frontend/src/app/data/mockData.ts` 삭제
- 오래된 하위 README 3개 갱신

검증:

- `npm run build` 성공
- `python -m compileall app` 성공
- `git diff --check` 통과
- `mockData`, `mock 저장`, `mock 연결`, `demo student` 검색 결과 없음

추천 커밋 제목:

```txt
fix: 레거시 mockData 의존 제거
```
## 2026-06-15 최종 OpenAPI와 Notion 기록 확인

상태: 완료

확인한 것:

- `http://localhost:8000/openapi.json` 조회 성공
- Swagger/OpenAPI에 health, posts, comments, me, auth, admin, portfolio, review-requests API가 등록되어 있음
- 오늘 날짜 Notion `2026-06-15 학습 기록`에 구현 내용, 막힌 점, 해결 방법, 다음 작업을 정리함
- 레거시 mockData 제거 추가 진행 내용도 Notion에 덧붙임

남은 수동 QA:

- 실제 Google 계정 선택 후 `/auth/google/callback` 성공 확인
- 최초 로그인 계정의 승인 대기 화면 확인
- 관리자 승인 후 STUDENT/COACH/ADMIN 화면 분기 확인

추천 커밋 제목:

```txt
docs: 최종 QA 기록 업데이트
```
## 2026-06-15 OAuth/JWT mock callback QA

상태: 완료

목표: 실제 Google 계정 선택 전에도 백엔드 OAuth/JWT 내부 흐름이 맞는지 검증한다. 실제 `backend/.env` 값은 읽거나 출력하지 않고, Google 서버 응답만 테스트 코드에서 가짜로 대체했다.

확인한 것:

- `GET /auth/google/login` -> 307 redirect
- redirect 대상이 Google OAuth URL로 시작함
- OAuth state cookie가 생성됨
- `GET /auth/google/callback?code=...&state=...` -> 303 redirect
- callback 성공 후 프론트 주소 `http://localhost:5173`로 돌아감
- access token cookie와 refresh token cookie가 설정됨
- `GET /auth/me` -> 200
- 최초 로그인 사용자의 `approvalStatus`가 `승인 대기`로 반환됨
- `POST /auth/refresh` -> 200
- refresh 이후에도 `GET /auth/me` -> 200
- `POST /auth/logout` -> 200
- logout 이후 `GET /auth/me` -> 401

남은 수동 확인:

- Google Cloud OAuth 동의 화면에서 테스트 사용자에 실제 Gmail이 들어가 있는지 확인
- 승인된 JavaScript 원본: `http://localhost:5173`
- 승인된 리디렉션 URI: `http://localhost:8000/auth/google/callback`
- `.env`의 `ADMIN_EMAILS`가 실제 관리자 Gmail과 일치하는지 확인
- 브라우저에서 실제 Google 계정 선택 후 승인 대기/관리자/학생/코치 화면 분기 확인

추천 커밋 제목:

```txt
docs: OAuth callback QA 기록 업데이트
```

## 2026-06-15 승인 대기 화면 UX 개선

상태: 완료

목표: Google OAuth 로그인은 성공했지만 아직 운영자 승인이 나지 않은 사용자가 다시 `/login`으로 이동했다가 `/pending-approval`로 돌아오는 어색한 흐름을 제거한다.

구현한 것:

- `PendingApproval.tsx`에서 `useAuth()`를 사용해 현재 사용자 정보를 다시 조회할 수 있게 했다.
- 미승인 상태 버튼을 `로그인 화면으로 이동`에서 `승인 상태 다시 확인`과 `로그아웃`으로 바꿨다.
- 승인 완료 상태에서는 기존처럼 대시보드 이동 버튼을 보여준다.
- 로그아웃 버튼은 `/auth/logout` 호출 후 `/login`으로 이동한다.

검증:

- `npm run build` 성공
- `python -m compileall app` 성공

추천 커밋 제목:

```txt
fix: 승인 대기 화면 UX 개선
```

## 2026-06-15 관리자-학생-코치 실제 API 시나리오 QA

상태: 완료

목표: AI 호출 전 핵심 웹서비스 흐름이 실제 API 기준으로 이어지는지 검증한다. Google 서버 응답만 fake 처리하고, DB 변경은 테스트 트랜잭션 안에서 실행 후 rollback했다.

검증한 흐름:

- QA 관리자 Google OAuth 로그인 -> ADMIN / 승인 완료
- QA 학생 Google OAuth 로그인 -> STUDENT / 승인 대기
- 승인 대기 학생의 게시글 작성 -> 403 차단
- 관리자가 학생 승인 -> 승인 완료
- 관리자가 코치 role과 승인 상태 적용 -> COACH / 승인 완료
- 승인된 학생 게시글 작성 -> 201
- 학생 내 기록 조회 -> 작성 글 포함
- 학생 댓글 작성 -> 201
- 코치 댓글 작성 -> 201
- 학생 포트폴리오 프로젝트 등록 -> 201
- 프로젝트와 게시글 연결 -> 200
- 포트폴리오 상태/초안 저장 -> 200
- 학생이 코치 목록 조회 -> 승인된 코치 포함
- 학생이 코치 리뷰 요청 생성 -> 201
- 코치가 받은 리뷰 인박스 조회 -> 요청 포함
- 코치가 피드백 완료 상태와 피드백 작성 -> 200
- 피드백 완료 요청을 학생이 취소 시도 -> 400 차단

검증 결과 요약:

```txt
admin_role ADMIN
pending_student_blocked 403
student_approved 승인 완료
coach_approved_role COACH
post_created_id 20
comments_created 201 201
portfolio_project_id 3
linked_post_ids [20]
review_request_id 5
coach_feedback_status 피드백 완료
cancel_after_feedback_status 400
```

알게 된 점:

- PowerShell 파이프를 통해 Python 스크립트를 실행할 때 한글 literal이 `?? ??`로 깨질 수 있어 QA 스크립트에서는 유니코드 escape를 사용했다.
- 이 문제는 앱 코드 문제가 아니라 테스트 명령어 인코딩 문제였다.

추천 커밋 제목:

```txt
docs: 실제 API 시나리오 QA 기록
```

## 2026-06-15 브라우저 로그인 UX QA

상태: 완료

목표: 사용자가 URL을 직접 입력하지 않아도 로그인 화면에서 Google 로그인 흐름을 시작할 수 있고, 비로그인 보호 라우트 접근이 로그인 화면으로 이어지는지 확인한다.

브라우저 확인 결과:

- `http://localhost:5173/` 진입 후 `/login` 화면으로 이동
- 로그인 화면에 `Google로 계속하기` 버튼 표시
- 최초 로그인 계정이 승인 대기 상태가 된다는 안내 문구 표시
- 콘솔 error 없음
- 비로그인 상태에서 `/posts/new` 직접 진입 시 `/login`으로 이동
- 보호 라우트 이동 후에도 로그인 버튼 표시

주의:

- 실제 Google 계정 선택과 동의 화면 통과는 외부 계정 조작이 필요하므로 수동 QA로 남겨둔다.

## 2026-06-15 README 현재 상태 기준 재작성

상태: 완료

목표: 기존 README에 오래된 mock 단계 설명, 깨진 인코딩, 구현 일지가 섞여 있어 제출물 관점에서 혼란스러운 상태를 정리한다.

구현한 것:

- README를 현재 실제 API 연결 상태 기준으로 재작성했다.
- 프로젝트 개요, 주요 사용자 흐름, 전체 아키텍처, 폴더 구조, 라우트, 주요 API를 한 번에 볼 수 있게 정리했다.
- RAG/MCP/Agent는 아직 연결 전임을 명확히 하고, 다음 단계 설계로 분리했다.
- 실행 방법, 환경 변수, Google Cloud 설정, QA 결과, 남은 수동 QA를 정리했다.
- 오래된 mock UI 구현 일지와 현재 상태가 충돌하지 않도록 README에서 제거했다.

검증 예정:

- README에서 `demo.student`, `mock role`, `mockData.ts` 같은 오래된 설명 검색
- `npm run build`
- `python -m compileall app`
- `git diff --check`

추천 커밋 제목:

```txt
docs: README 현재 구현 상태로 정리
```

## 2026-06-15 OAuth 실패 UX 개선

상태: 완료

목표: Google OAuth callback 실패 시 사용자가 백엔드 JSON 에러 화면을 보지 않고 프론트 로그인 화면에서 다시 시도 안내를 볼 수 있게 한다.

구현한 것:

- `backend/app/routers/auth.py`에 `get_login_error_redirect_response()`를 추가했다.
- Google OAuth 설정 오류, callback 값 부족, state 불일치, Google token/profile 처리 실패를 `/login?authError=...`로 redirect하도록 변경했다.
- 실패 시 OAuth state cookie를 삭제한다.
- `Login.tsx`에서 `authError` query string을 읽어 로그인 실패 안내를 보여준다.

검증:

- `GET /auth/google/callback` 값 없이 호출 -> 303 redirect
- redirect 위치: `http://localhost:5173/login?authError=...`
- 로그인 실패 안내 UI 브라우저 표시 확인
- 로그인 화면의 `Google로 계속하기` 버튼 유지 확인
- 브라우저 console error 없음
- `npm run build` 성공
- `python -m compileall app` 성공

추천 커밋 제목:

```txt
fix: OAuth 실패 로그인 안내 추가
```

## 2026-06-15 브라우저 메타/레거시 UI 흔적 정리

상태: 완료

작업 내용:

- `frontend/index.html`의 문서 언어를 `ko`로 바꿨다.
- 브라우저 탭 제목을 `JungleLog`로 정리했다.
- description 메타 정보를 JungleLog 서비스 설명으로 바꿨다.
- 실제 라우트에서 사용하지 않는 `frontend/src/app/components/Layout.tsx`를 삭제했다.
- README 현재 구현 상태와 QA 항목에 브라우저 메타 정리 내용을 추가했다.

이유:

- 실제 서비스처럼 보이려면 로그인 화면에 들어가기 전 브라우저 탭과 메타 정보도 서비스 이름과 맞아야 한다.
- 사용하지 않는 예전 Layout 파일에는 오래된 라우트(`/my-logs`, `/ai-helper`, `/coach`)와 mock 이메일이 남아 있어 이후 학습과 유지보수에 혼란을 줄 수 있다.

추천 커밋 제목:

```txt
fix: JungleLog 브라우저 메타 정보 정리
```

## 2026-06-15 OAuth 설정 존재 여부 QA

상태: 완료

작업 내용:

- `backend/.env` 값은 출력하지 않고 필수 설정의 존재 여부만 확인했다.
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`, `JWT_SECRET_KEY`, `ADMIN_EMAILS`가 모두 설정되어 있음을 확인했다.
- `/auth/google/login`이 `accounts.google.com/o/oauth2/v2/auth`로 redirect를 생성하는지 확인했다.
- OAuth state cookie가 응답에 포함되는지 확인했다.

결과:

```txt
GOOGLE_CLIENT_ID: set
GOOGLE_CLIENT_SECRET: set
GOOGLE_REDIRECT_URI: set
JWT_SECRET_KEY: set
ADMIN_EMAILS: set
redirect_uri_expected: True
login_status: 307
login_redirect_host: accounts.google.com
login_redirect_path: /o/oauth2/v2/auth
oauth_state_cookie_set: True
```

남은 일:

- 실제 브라우저에서 Google 계정 선택/동의 화면을 통과한다.
- 관리자 이메일로 로그인했을 때 관리자 메뉴가 보이는지 확인한다.
- 일반 신규 사용자 로그인 시 승인 대기 화면이 보이는지 확인한다.

## 2026-06-15 프론트 API 주소 환경변수화

상태: 완료

작업 내용:

- `frontend/src/app/api/client.ts`에서 백엔드 주소 하드코딩을 제거했다.
- `VITE_API_BASE_URL`이 있으면 해당 값을 사용하고, 없으면 `http://localhost:8000`을 기본값으로 사용하게 했다.
- URL 끝의 `/`를 제거해서 fetch path 조합이 안정적으로 되게 했다.
- `frontend/.env.example`을 추가했다.
- README와 setup/study/test 문서에 프론트 환경변수 설정을 기록했다.

이유:

- 실제 서비스처럼 운영하려면 백엔드 주소를 코드에 고정하기보다 환경별 설정으로 관리하는 편이 좋다.
- 로컬 개발자는 아무 설정 없이도 기존처럼 `localhost:8000`을 사용할 수 있다.

추천 커밋 제목:

```txt
fix: 프론트 API 주소 환경변수화
```

## 2026-06-15 DB 초기화 demo seed 제거

상태: 완료

작업 내용:

- `backend/app/db/init_db.py`에서 개발용 사용자/게시글/태그 seed를 제거했다.
- `init_db()`가 테이블 생성과 기본 게시판 카테고리 생성만 수행하게 정리했다.
- 실제 코드와 README 범위에서 `demo.student`, `seed_demo`, `DEMO_POSTS` 검색 결과가 없음을 확인했다.
- README 현재 구현 상태에 DB 초기화 정리 내용을 추가했다.

이유:

- Google OAuth/JWT 연결 후에는 사용자가 실제 로그인으로 생성되어야 한다.
- 개발용 사용자가 자동 생성되면 승인/역할 흐름이 실제 서비스와 달라질 수 있다.
- 기본 카테고리는 기준 데이터이므로 유지하고, 사용자/게시글은 실제 API 흐름으로 생성하게 분리했다.

주의:

- 이미 로컬 PostgreSQL에 들어간 예전 개발용 데이터는 코드 변경으로 자동 삭제되지 않는다.
- 필요하면 별도 DB 정리 명령으로 삭제하되, 실제 작성 데이터와 구분해서 처리해야 한다.

추천 커밋 제목:

```txt
fix: DB 초기화 demo seed 제거
```

## 2026-06-15 로컬 DB demo 잔존 데이터 정리

상태: 완료

정리 전 영향 범위:

```txt
demo_user_exists=True
user_id=1
posts_by_user=12
comments_by_user=3
comments_on_user_posts=3
post_tags_on_user_posts=25
portfolio_projects_by_user=0
review_requests_related=0
notifications=0
refresh_tokens=0
approval_logs_as_user=0
approval_logs_as_actor=0
users_approved_by_demo=0
```

삭제 결과:

```txt
deleted_comments=3
deleted_post_tags=25
deleted_posts=12
deleted_users=1
```

삭제 후 확인:

```txt
legacy_demo_user_count=0
```

의미:

- 이제 로컬 관리자 사용자 목록에 과거 개발용 `demo.student@junglelog.local` 계정이 섞이지 않는다.
- 앞으로 DB 초기화 코드는 개발용 사용자를 새로 만들지 않는다.
- 실제 사용자 데이터는 Google OAuth 로그인과 관리자 승인 흐름으로만 생성된다.

## 2026-06-15 OAuth 기존 이메일 사용자 연결 개선

상태: 완료

문제:

- 로컬 DB에 `ADMIN_EMAILS`에 해당하는 승인 완료 관리자 사용자가 이미 있었다.
- 기존 로직은 `google_sub`로만 사용자를 찾고, 없으면 새 사용자를 생성했다.
- 실제 Google 로그인에서 기존 관리자 이메일과 다른 sub가 들어오면 email unique 충돌 가능성이 있었다.

해결:

- `get_or_create_google_user()` 매칭 순서를 개선했다.
- 먼저 `google_sub`로 찾고, 없으면 verified email로 기존 사용자를 찾는다.
- 이메일 사용자가 있으면 그 row에 `google_sub`를 연결한다.
- 기존 role과 approvalStatus는 보존한다.

검증:

```txt
same_user_id=True
google_sub_updated=True
role_preserved=True
approval_status_preserved=True
deleted_test_users=1
remaining_test_users=0
```

추천 커밋 제목:

```txt
fix: OAuth 기존 이메일 사용자 연결 처리
```

## 2026-06-15 실제 브라우저 Google 로그인 진입 QA

상태: 부분 완료

확인한 것:

```txt
http://localhost:5173/login
-> title: JungleLog
-> Google 로그인 버튼 표시
-> 버튼 클릭 시 accounts.google.com Google 로그인 화면으로 이동
-> redirect_uri는 http://localhost:8000/auth/google/callback 기준
```

보호 라우트 확인:

```txt
http://localhost:5173/posts/new 직접 접근
-> 비로그인 상태이므로 http://localhost:5173/login으로 이동
-> 로그인 버튼 유지
-> 브라우저 console error 없음
```

남은 수동 QA:

- 실제 Google 계정 선택
- OAuth 동의 화면 통과
- callback 후 JungleLog로 복귀
- `/auth/me` 기준 ADMIN / STUDENT / COACH 화면 분기 확인

## 2026-06-15 관리자 사이드바 메뉴 정리

### 작업 배경

관리자 화면에서 대시보드 메뉴가 다시 보이는 문제가 있었다.
코드 확인 결과 관리자 전용 대시보드가 새로 생긴 것은 아니고, `MainLayout.tsx`의 `adminNavItems` 배열에 `대시보드` 메뉴가 남아 있었다.

### 작업 내용

- `frontend/src/app/layouts/MainLayout.tsx`
  - `adminNavItems`에서 `대시보드` 항목 제거
  - 관리자 메뉴를 `사용자 승인`, `전체 게시글`, `설정`으로 정리
- `README.md`
  - 관리자 기본 화면과 메뉴 정책 추가

### 학습 포인트

- 화면에 메뉴가 보인다고 해서 실제 페이지 기능이 새로 구현된 것은 아닐 수 있다.
- React 사이드바 메뉴는 route 설정이 아니라 `navItems` 배열 렌더링 결과다.
- ADMIN의 `/` 접근은 `Dashboard.tsx`에서 `/admin/users`로 redirect되므로, 이번 문제는 route보다 메뉴 배열 문제였다.

## 2026-06-15 학생 화면 QA 개선 체크포인트

상태: 커밋 전 QA 진행

작업 배경:

- AI 단계로 넘어가기 전에 학생 화면에서 실제 서비스 흐름처럼 보이지 않는 부분을 정리해야 했다.
- 포트폴리오 프로젝트 등록 후 목록이 바로 갱신되지 않거나, GitHub URL 버튼이 실제 링크로 동작하지 않는 문제가 있었다.
- 게시글 작성 화면의 `관련 커밋` 입력은 현재 서비스 흐름과 맞지 않아서 GitHub repo URL 연결로 바꿨다.
- 프로필 설정 화면은 이름/이미지 저장 API가 없어서 실제 사용자 경험과 맞지 않았다.

작업 내용:

- `backend/app/routers/me.py`: `PATCH /me/profile` API를 추가했다.
- `backend/app/main.py`: `/uploads` 정적 파일 경로를 FastAPI에 mount했다.
- `backend/app/repositories/user_repository.py`: Google OAuth 로그인 때 기존 프로필 이미지를 덮어쓰지 않도록 했다.
- `backend/app/repositories/post_repository.py`: 게시글 상세 조회 시 `view_count` 증가 흐름을 추가했다.
- `frontend/src/app/pages/settings/Settings.tsx`: 이름 수정과 이미지 업로드 UI를 실제 API와 연결했다.
- `frontend/src/app/pages/portfolio/Portfolio.tsx`: GitHub repo 중복 등록 방지, 등록 후 목록 재조회, GitHub 보기 버튼을 정리했다.
- `frontend/src/app/pages/posts/PostEdit.tsx`: 관련 커밋 대신 GitHub repo URL을 연결하도록 바꿨다.
- `frontend/src/app/pages/posts/PostDetail.tsx`: GitHub repo 버튼, 작성자/댓글 작성자 프로필 이미지 흐름을 정리했다.
- `frontend/src/app/pages/ai/AIAssistant.tsx`: AI 연결 전 단계에서 저장된 포트폴리오 초안 보관함을 확인할 수 있게 했다.

학습 포인트:

- 파일 업로드는 JSON이 아니라 `FormData`와 `multipart/form-data`로 처리한다.
- 백엔드가 `/uploads/...` 같은 상대 경로를 저장하면, 프론트는 API base URL을 붙여 실제 이미지 URL로 바꿔야 한다.
- Google OAuth 프로필 이미지는 초기값으로만 쓰고, 사용자가 직접 바꾼 이미지는 로그인 때 덮어쓰지 않는 편이 자연스럽다.
- 게시글 조회수 증가는 단순 조회 API처럼 보이지만 DB 상태를 바꾸는 side effect가 있다.

추천 커밋 제목:

```txt
feat: 학생 화면 QA 개선
```

학생 화면 QA 개선 체크포인트 결과:

- [x] `npm run build` 성공
- [x] `python -m compileall app` 성공
- [x] `git diff --check` 통과
- [x] FastAPI 앱에 `/me/profile` 라우트 등록 확인
- [x] FastAPI 앱에 `/uploads` 정적 파일 경로 등록 확인
- [x] 관리자 화면 DOM 기준 사이드바 메뉴는 `사용자 승인`, `전체 게시글`, `설정`만 표시됨

확인 명령:

```txt
npm run build
python -m compileall app
git diff --check
python -c "from app.main import app; paths=[route.path for route in app.routes]; print('/me/profile' in paths); print('/uploads' in paths)"
```

## 2026-06-15 코치 리뷰 인박스 미리보기 개선

상태: QA 통과

작업 배경:

- 코치가 리뷰 요청을 열었을 때 학생 메시지와 일반 체크리스트만 보이면 무엇을 기준으로 피드백해야 하는지 약하다.
- 포트폴리오 리뷰 요청에서 `원문 보기`가 `/portfolio`로 이동하면 코치 권한으로 접근할 수 없는 학생 전용 관리 화면으로 가는 문제가 있었다.
- 인박스 새로고침 후 선택된 요청과 피드백 textarea 값이 첫 번째 요청 기준으로 엇갈릴 수 있었다.

작업 내용:

- `backend/app/schemas/review.py`
  - 리뷰 요청 응답에 `targetSummary`, `targetPreview`, `targetLinkUrl`을 추가했다.
- `backend/app/services/review_service.py`
  - 게시글 리뷰는 게시글 `summary/content/related_github_url` 기준으로 미리보기 데이터를 만든다.
  - 포트폴리오 리뷰는 프로젝트 `summary/saved_portfolio_draft/readme_summary/github_url` 기준으로 미리보기 데이터를 만든다.
- `frontend/src/app/api/reviews.ts`
  - 새 응답 필드를 `ReviewRequestApiItem` 타입에 반영했다.
- `frontend/src/app/pages/coach/CoachReview.tsx`
  - 코치 상세 패널에 리뷰 대상 미리보기 영역을 추가했다.
  - 포트폴리오 요청은 학생 전용 `/portfolio` 화면으로 보내지 않고 GitHub 링크를 열도록 바꿨다.
  - 선택한 요청과 피드백 textarea가 어긋나지 않도록 selected request 기준으로 상태를 동기화했다.
  - 사용자에게 보이는 개발용 문구를 서비스 문구로 정리했다.

QA 결과:

- [x] `npm run build` 성공
- [x] `python -m compileall app` 성공
- [x] `/review-requests` 라우트 등록 확인
- [x] OpenAPI `ReviewRequestResponse`에 `targetSummary`, `targetPreview`, `targetLinkUrl` 반영 확인

추천 커밋 제목:

```txt
feat: 코치 리뷰 인박스 미리보기 개선
```

브라우저 QA 추가 결과:

- [x] `http://localhost:5173/coach-review` 진입 시 `코치 리뷰 인박스` 화면 렌더링 확인
- [x] 현재 DB에 받은 리뷰 요청이 없을 때 빈 인박스 상태가 표시됨
- [x] 화면 본문에 `[object Object]`가 보이지 않음
- [x] 화면 본문에 `백엔드 DB`, `자동 등록` 같은 개발용 문구가 보이지 않음
- [x] 관리자 메뉴는 `사용자 승인`, `전체 게시글`, `설정`으로 유지됨

메모:

- 현재 로컬 DB에 코치가 받은 리뷰 요청이 없어 `리뷰 대상 미리보기` 실제 표시까지는 수동 데이터 생성 후 추가 QA가 필요하다.
- 과거 HMR 시점의 console error 로그가 남아 있었지만, 새로고침 후 화면은 정상 렌더링됐다.

## 2026-06-15 알림 API 연결

상태: QA 통과

작업 배경:

- 헤더 알림 드롭다운이 프론트 상수 샘플 데이터로 동작하고 있었다.
- 실제 서비스처럼 보이려면 알림 목록, 읽음 처리, 이벤트 발생 시 알림 생성이 API 기준으로 연결되어야 한다.

작업 내용:

- `backend/app/schemas/notification.py`
  - 알림 목록/아이템 응답 스키마를 추가했다.
- `backend/app/repositories/notification_repository.py`
  - 알림 생성, 목록 조회, 읽지 않은 알림 수 조회, 읽음 처리를 담당한다.
- `backend/app/services/notification_service.py`
  - 현재 사용자 기준 알림 응답을 조립한다.
- `backend/app/routers/notifications.py`
  - `GET /notifications`
  - `PATCH /notifications/{notification_id}/read`
  - `PATCH /notifications/read-all`
- `backend/app/services/review_service.py`
  - 학생이 리뷰 요청을 보내면 담당 코치에게 알림을 만든다.
  - 코치가 상태/피드백을 저장하면 학생에게 알림을 만든다.
- `backend/app/services/admin_user_service.py`
  - 관리자가 승인 상태/역할을 변경하면 대상 사용자에게 알림을 만든다.
- `frontend/src/app/api/notifications.ts`
  - 알림 조회/읽음 API 클라이언트를 추가했다.
- `frontend/src/app/layouts/MainLayout.tsx`
  - 샘플 알림 상수를 제거하고 실제 알림 API를 연결했다.
  - 읽지 않은 알림 개수, 빈 상태, 모두 읽음, 알림 클릭 이동을 처리한다.

QA 결과:

- [x] `npm run build` 성공
- [x] `python -m compileall app` 성공
- [x] `git diff --check` 통과
- [x] FastAPI 앱에 `/notifications`, `/notifications/{notification_id}/read`, `/notifications/read-all` 등록 확인
- [x] OpenAPI에 `NotificationListResponse`, `NotificationItemResponse` 반영 확인
- [x] PostgreSQL에 `notifications` 테이블 존재 확인
- [x] 브라우저에서 알림 드롭다운이 API 기반 빈 상태로 표시됨
- [x] 화면에 `샘플 데이터`, `API 연결 전`, `[object Object]` 문구가 보이지 않음

추천 커밋 제목:

```txt
feat: 알림 API 연결
```

## 2026-06-15 리뷰 요청-피드백-알림 왕복 QA

상태: QA 통과

목표:

- 학생이 작성한 게시글이 리뷰 요청 대상이 되는지 확인한다.
- 학생이 코치에게 리뷰 요청을 보내면 코치 알림이 생성되는지 확인한다.
- 코치가 인박스에서 요청을 조회할 수 있는지 확인한다.
- 코치가 피드백을 저장하면 학생 알림이 생성되는지 확인한다.

검증 방식:

- 로컬 PostgreSQL에 임시 학생, 임시 코치, 임시 게시글을 생성했다.
- `review_service.create_review_request()`로 실제 서비스 레이어를 통과해 리뷰 요청을 만들었다.
- `review_service.get_review_inbox()`로 코치 인박스 응답을 확인했다.
- `review_service.update_review_request()`로 코치 피드백을 저장했다.
- `notifications` 테이블에서 코치/학생 알림 생성을 확인했다.
- 검증 종료 후 `qa-roundtrip-20260615` prefix로 만든 임시 데이터는 정리했다.

검증 결과:

```txt
created_request_status= 대기 중
created_request_target_title= QA review target post
coach_notification_count= 1
coach_notification_message= QA Student님이 리뷰 요청을 보냈습니다.
inbox_total= 1
inbox_target_preview_exists= True
updated_request_status= 피드백 완료
student_notification_count= 1
student_notification_message= QA Coach님의 리뷰 피드백이 도착했습니다.
```

확인한 연결:

- 게시글 -> 리뷰 요청 대상 연결 정상
- 리뷰 요청 -> 담당 코치 알림 생성 정상
- 코치 인박스 -> 리뷰 대상 미리보기 응답 정상
- 코치 피드백 -> 학생 알림 생성 정상

주의한 점:

- PowerShell에서 Python stdin으로 한글 리터럴을 넘기면 인코딩이 깨질 수 있었다.
- QA 스크립트에서는 `review_repository.APPROVAL_APPROVED` 같은 코드 상수와 unicode escape를 사용해 실제 DB 값과 일치시켰다.

## 2026-06-15 �л� ��ġ ���� ��û ȭ�� ������ QA

����: ���� �� QA ���

��ǥ:

- ���� STUDENT role ȭ�鿡�� �۾��� -> �Խñ� �� -> ��ġ ���� ��û ��� ���� �帧�� Ȯ���Ѵ�.
- �л��� ������ ���� ȭ�鿡 ���� �������� �� ���� ���� ȭ���� �ߴ��� Ȯ���Ѵ�.
- ���� ��û ��� ����� ���� `/me/posts` API ����� ����Ǵ��� Ȯ���Ѵ�.

Ȯ���� �帧:

- DB���� ���� �α��� ���� `leejunhee8235@gmail.com`�� QA������ STUDENT / ���� �Ϸ� ���·� �ٲ��.
- `/` ���� �� �л��� ��ú���� �л� �޴��� ���̴� ���� Ȯ���ߴ�.
- `/admin/users` ���� ���� �� ����� ���� ���� ȭ���� �ƴ϶� ���� ���� ȭ���� ���̴� ���� Ȯ���ߴ�.
- `/posts/new`���� QA �Խñ��� �ۼ��߰� `/posts/25` �� ȭ������ �̵��ϴ� ���� Ȯ���ߴ�.
- `/coach-review`���� ��� �ۼ��� �Խñ��� ���� ��û ��� ��ϰ� �̸����⿡ ���̴� ���� Ȯ���ߴ�.
- ��ġ ���� �� ���� ��û�� ������, ���� ���� ��û ��Ͽ� `��� ��` ���·� ǥ�õǴ� ���� Ȯ���ߴ�.

�߰��� ����:

- ó������ ��ġ ���� ��û ȭ�鿡�� `Input should be less than or equal to 50` ������ ���̰�, �ۼ��� �Խñ��� ��� ��Ͽ� ������ �ʾҴ�.
- ������ `frontend/src/app/pages/coach/CoachReview.tsx`���� `getMyPosts({ visibility: "all", size: 100 })`���� ȣ���߱� �����̴�.
- �鿣�� `/me/posts`�� `size: int = Query(default=50, ge=1, le=50)`�̶� �ִ� 50�������� ����Ѵ�.

����:

- `CoachReview.tsx`�� `REVIEW_TARGET_POST_PAGE_SIZE = 50` ����� �߰��ߴ�.
- �л� ���� ��û ȭ���� �� �Խñ� ��ȸ size�� 100���� 50���� �����ߴ�.

���� ���:

- [x] STUDENT ��ú��� �޴��� ������/��ġ ���� �޴��� ������ �ʴ´�.
- [x] STUDENT�� `/admin/users`�� ���� ���� ���� ���� ȭ���� ���´�.
- [x] �Խñ� �ۼ� �� �� ȭ������ �̵��Ѵ�.
- [x] ��ġ ���� ��û ȭ�鿡�� �� �Խñ��� ���� ��� ��Ͽ� ���´�.
- [x] 422 ���� �޽����� �� �̻� ȭ�鿡 ������ �ʴ´�.
- [x] ���� ��û ���� �� ���� ���� ��û ��Ͽ� `��� ��`���� ǥ�õȴ�.
- [x] ȭ�鿡 `[object Object]`�� ������ �ʴ´�.

��õ Ŀ�� ����:

```txt
fix: ��ġ ���� ��û ��� ��ȸ ũ�� ����
```
## 2026-06-15 ��ġ �ιڽ� ������ QA �� ��ú��� ����

����: ���� �� QA ���

��ǥ:

- COACH role���� ��ġ ���� �ιڽ��� �⺻ ���� ȭ��ó�� ���̴��� Ȯ���Ѵ�.
- �л��� ���� ���� ��û�� ��ġ �ιڽ��� ǥ�õǴ��� Ȯ���Ѵ�.
- ��ġ�� ��û ���¸� �����ϰ�, ����� �ǵ���� ȭ�鿡 �ٽ� ǥ�õǴ��� Ȯ���Ѵ�.
- COACH �޴����� ��ú��尡 �ٽ� ������ �ʵ��� �����Ѵ�.

Ȯ���� �帧:

- ���� �α��� ���� `leejunhee8235@gmail.com`�� QA������ COACH / ���� �Ϸ� ���·� �ٲ��.
- QA�� �ӽ� �л�, �Խñ�, ���� ��û�� ����� ���� ��ġ���� �����ߴ�.
- `/coach-review`���� �ӽ� ���� ��û�� �ιڽ��� ǥ�õǴ� ���� Ȯ���ߴ�.
- ��û �󼼿��� �л� �޽���, ���� ����, ���� ��� �̸�����, ���� ��ũ�� ���̴� ���� Ȯ���ߴ�.
- `/`�� ���� ���� `/coach-review`�� �̵��ϴ� ���� Ȯ���ߴ�.
- COACH ���̵�ٰ� `��ġ ���� �ιڽ� / ��ü �Խñ� / ����`�� �����ִ� ���� Ȯ���ߴ�.
- ���������� `���� ������ ����` ��ư�� ���� ���� ���� ���� �ȳ��� ���� �ݿ��� Ȯ���ߴ�.
- ���� �������� �ǵ�� ������ `�ǵ�� �Ϸ�` ���¸� ������ ��, ��ġ ȭ�� ���ΰ�ħ �� textarea�� ����� �ǵ���� �ٽ� ǥ�õǴ� ���� Ȯ���ߴ�.

�߰��� ����:

- COACH ���̵�ٿ� `��ú���` �޴��� �ٽ� ������.
- `/` ���� �� ��ġ ��ú��� ȭ���� �������� �� �־���.
- ���� ������ ��ġ�� ���� �ۼ��ϴ� ����� �ƴ϶� �л� ���� ��û�� ó���ϴ� ����̹Ƿ�, �⺻ ���� ȭ���� ��ġ ���� �ιڽ����� �Ѵ�.

����:

- `frontend/src/app/layouts/MainLayout.tsx`
  - `coachNavItems`���� ��ú��� �޴��� �����ߴ�.
- `frontend/src/app/pages/dashboard/Dashboard.tsx`
  - COACH role�� `/`�� �����ϸ� `<Navigate to="/coach-review" replace />`�� �̵��ϵ��� �����ߴ�.
  - ������� �ʰ� �� ��ġ ��ú��� ����/API �ε�/import�� �����ߴ�.

���� ���:

- [x] COACH ���̵�ٿ� ��ú��尡 ������ �ʴ´�.
- [x] COACH�� `/`�� ���� �����ϸ� `/coach-review`�� �̵��Ѵ�.
- [x] COACH �ιڽ��� ������ ���� ��û�� ���δ�.
- [x] ���� ��û �󼼿� �л� �޽����� ��� �̸����Ⱑ ���δ�.
- [x] ���� ���� ��ư�� ���� API�� ���� �����Ѵ�.
- [x] ����� �ǵ���� ���ΰ�ħ �� textarea�� �ٽ� ǥ�õȴ�.
- [x] ȭ�鿡 `[object Object]`�� ������ �ʴ´�.
- [x] QA�� �ӽ� �����ʹ� ���� �� �����ߴ�.
- [x] ���� �α��� ���� role�� ADMIN���� �����ߴ�.

����:

- ������ �ڵ�ȭ ������ ���� Ŭ������ ������ textarea�� ���� Ÿ�����ϴ� ������ �ڵ�ȭ���� ���ߴ�.
- ��� ���� ���� ��ư�� ���� ���������� ���� �����߰�, �ǵ�� ������ ������ �鿣�� ���� �������� ������ �� ȭ�� ��ǥ�ø� Ȯ���ߴ�.

��õ Ŀ�� ����:

```txt
fix: ��ġ �⺻ ȭ���� ���� �ιڽ��� ����
```
## 2026-06-15 �л� �ǵ��/�˸� �ݿ� ������ QA

����: QA ���

��ǥ:

- ��ġ�� �ǵ���� ���� ���� ��û�� STUDENT ȭ���� `���� ���� ��û ���`�� ǥ�õǴ��� Ȯ���Ѵ�.
- ��ġ �ǵ�� �Ϸ� �̺�Ʈ�� �л� �˸����� �����ǰ�, ��� �˸� ��Ӵٿ ���̴��� Ȯ���Ѵ�.
- �˸� Ŭ�� �� ���� ó���� �̵� �帧�� �����ϴ��� Ȯ���Ѵ�.

���� �غ�:

- ���� �α��� ���� `leejunhee8235@gmail.com`�� QA������ STUDENT / ���� �Ϸ� ���·� �ٲ��.
- QA�� �ӽ� ��ġ `QA Feedback Coach 20260615211010`�� �������.
- ���� �л� ������ �ۼ��� QA �Խñ��� �������.
- ���� `review_service.create_review_request()`�� ���� ��û�� �����ߴ�.
- ���� `review_service.update_review_request()`�� ��ġ �ǵ��� `�ǵ�� �Ϸ�` ���¸� �����ߴ�.
- �� �������� �л����� ���� `review-feedback` �˸��� �����ƴ�.

������ ���� ���:

- `/coach-review`���� STUDENT ȭ���� ���ȴ�.
- �л� ���̵�ٰ� `��ú��� / ��ü �Խñ� / �� ��� / ��Ʈ������ ���� / AI ����� / ��ġ ���� ��û / ����`���� ������.
- ���� ���� ��û ��Ͽ� QA ���� ��û�� ������.
- ��û ���°� `�ǵ�� �Ϸ�`�� ǥ�õƴ�.
- ��� ��ġ �̸� `QA Feedback Coach 20260615211010`�� ǥ�õƴ�.
- �ǵ�� ���� `QA feedback visible to student...`�� ǥ�õƴ�.
- ȭ�鿡 `[object Object]`�� ���߿� mock/debug ������ ������ �ʾҴ�.
- ��� �˸� ��Ӵٿ `QA Feedback Coach 20260615211010���� ���� �ǵ���� �����߽��ϴ�.`�� ������.
- ���� ���� �˸� 1���� ǥ�õƴ�.
- �˸��� Ŭ���ϸ� ��Ӵٿ��� ������ ���� ���� �˸� ǥ�ð� �������.

����:

- QA�� �л� �˸� 1��, QA�� ��ġ �˸� 1���� �����ߴ�.
- QA�� ���� ��û, ���� ��û-��ġ ����, �Խñ�, �ӽ� ��ġ ������ �����ߴ�.
- ���� �α��� ���� role�� ADMIN / ���� �Ϸ�� �����ߴ�.

���:

- �л��� ��ġ �ǵ��� ���¸� ��û ��Ͽ��� Ȯ���ϴ� �帧�� �����̴�.
- ��ġ �ǵ�� �Ϸ� �˸��� �л����� �����ǰ� ���� ó���Ǵ� �帧�� �����̴�.

��õ Ŀ�� ����:

```txt
docs: �л� �ǵ�� �˸� QA ���
```
## 2026-06-15 포트폴리오/AI 도우미 조회 크기 수정

목표: 포트폴리오 관리 화면과 AI 도우미 화면이 실제 API 계약에 맞게 참고 기록을 불러오도록 정리했다.

진행한 것:

- `Portfolio.tsx`에서 기록 연결용 내 게시글 조회 크기를 `50`으로 제한했다.
- `AIAssistant.tsx`에서 AI 참고 기록 조회 크기를 `50`으로 제한했다.
- 실제 API 계약은 `/me/posts`의 `size <= 50`이므로 프론트도 같은 제한을 지키도록 상수화했다.
- QA용 포트폴리오 프로젝트와 게시글을 만들어 프로젝트 등록 -> 기록 연결 -> AI 도우미 이동 -> 포트폴리오 초안 저장 흐름을 확인했다.
- QA용 데이터는 검증 후 삭제했고 현재 로그인 사용자는 ADMIN / 승인 완료 상태로 복구했다.

발견한 문제:

- 프론트가 `/me/posts`에 `size=100`을 보내면 FastAPI validation에 걸려 `Input should be less than or equal to 50` 오류가 화면에 보였다.

해결 방법:

- 포트폴리오 화면에는 `PORTFOLIO_LINKABLE_POST_PAGE_SIZE = 50`을 두었다.
- AI 도우미 화면에는 `AI_ASSISTANT_REFERENCE_POST_PAGE_SIZE = 50`을 두었다.
- 주석으로 백엔드 API 계약을 지키는 값이라는 이유를 남겼다.

커밋 후보:

```txt
fix: 포트폴리오 AI 참고 기록 조회 크기 수정
```
## 2026-06-15 학생 화면 개발용 문구 정리

목표: AI 연결 전 단계라도 학생이 보는 화면은 실제 서비스처럼 보이도록 개발용 안내 문구를 줄였다.

진행한 것:

- AI 도우미 화면에서 `샘플`, `OpenAI/RAG/MCP 호출은 다음 단계`, `API 데이터 기반`처럼 화면에 노출되던 표현을 자연스러운 서비스 문구로 바꿨다.
- 포트폴리오 관리 화면에서 `MCP/GitHub API 연결 후` 같은 개발 단계 설명을 사용자 행동 중심 문구로 바꿨다.
- 게시글 작성 화면에서 `백엔드 API`, `임시저장 API 연결 전` 같은 표현을 제거했다.
- 게시글 상세/목록 화면에서 API 응답 기준이라는 설명을 사용자 관점의 로딩/검색 안내로 바꿨다.
- 설정 화면에서 비밀 키와 보안 설정 설명을 더 서비스 운영 문구에 가깝게 정리했다.

확인한 것:

- `frontend/src/app/pages`와 `frontend/src/app/layouts`에서 `백엔드`, `API`, `샘플`, `mock`, `debug`, `MCP`, `RAG`, `OpenAI`, `구현 예정`, `연결 전` 검색 결과가 화면 노출 문자열에는 남지 않고 주석 중심으로만 남았다.

커밋 후보:

```txt
fix: 학생 화면 개발용 문구 정리
```
## 2026-06-15 공통 API 에러 메시지 안전화

목표: FastAPI validation error가 배열/객체 형태로 내려와도 화면에 `[object Object]`가 보이지 않도록 공통 에러 처리 함수를 보강했다.

진행한 것:

- `frontend/src/app/api/client.ts`에 `extractReadableErrorMessage()`를 추가했다.
- `detail`이 문자열/숫자면 그대로 메시지로 사용한다.
- `detail`이 `{ msg: ... }` 또는 `{ message: ... }` 형태면 내부 값을 재귀적으로 읽는다.
- 읽을 수 없는 객체는 문자열로 강제 변환하지 않고 기본 안내 문구를 사용한다.
- 배열 형태의 FastAPI validation detail은 읽을 수 있는 메시지만 모아 출력한다.

효과:

- 게시글, 댓글, 포트폴리오, 리뷰, 알림, 관리자, 설정 화면이 모두 같은 안전한 에러 메시지 처리를 공유한다.
- API 응답 객체가 사용자 화면에 그대로 노출될 가능성이 줄어든다.

커밋 후보:

```txt
fix: 공통 API 에러 메시지 처리 보강
```
## 2026-06-15 학생 주요 화면 브라우저 스모크 QA와 문구 정리

목표: 학생 역할로 주요 화면을 실제 브라우저에서 열어보고, 화면에 남은 기술/debug 문구와 어색한 빈 상태 문구를 정리했다.

확인한 화면:

- `/`
- `/posts`
- `/posts/new`
- `/my-records`
- `/portfolio`
- `/ai-assistant`
- `/coach-review`
- `/settings`

발견한 문제:

- 사이드바 계정 카드에 `Google OAuth 로그인`이라는 기술 문구가 보였다.
- 내 기록 화면에 `JWT 쿠키`라는 구현 세부사항이 보였다.
- 설정 화면 프로필 이미지 안내에 `로컬 개발`, `backend/uploads`, `S3` 같은 개발/배포 용어가 보였다.
- 코치 리뷰 요청 빈 상태 문구가 `내 게시글가 없습니다`처럼 어색했다.

수정한 것:

- 사이드바 계정 라벨을 `내 계정`으로 바꿨다.
- 내 기록 설명을 사용자 관점 문구로 바꿨다.
- 설정 화면의 프로필 이미지 안내를 아바타 표시 흐름 중심으로 바꿨다.
- GitHub 연동 badge를 `준비 중`에서 `연동 전`으로 바꿨다.
- 코치 리뷰 요청 빈 상태 문구를 대상별 자연스러운 문장으로 나눴다.

검증 결과:

- 주요 학생 화면에서 `[object Object]`가 보이지 않았다.
- `Google OAuth 로그인`, `JWT 쿠키`, `backend/uploads`, `로컬 개발`, `S3`, `로그인됨`, `백엔드 데이터`, `mock`, `debug`가 화면에 보이지 않았다.
- `/coach-review`에서 빈 대상 문구의 조사가 자연스럽게 표시됐다.

커밋 후보:

```txt
fix: 학생 화면 빈 상태 문구 정리
```
## 2026-06-15 게시글 상세 요약 중복 표시 정리

목표: 학생 글쓰기 브라우저 QA 중 새로 작성한 게시글 상세에서 본문 앞부분이 요약 카드와 본문 영역에 거의 동일하게 두 번 보이는 문제를 정리한다.

진행한 것:

- `PostEdit.tsx`의 `buildSummary()`가 본문 앞부분으로 요약을 자동 생성한다는 흐름을 확인했다.
- `PostDetail.tsx`에서 요약이 본문과 같거나 본문 시작 부분과 동일하면 요약 카드를 숨기도록 `shouldShowSummary()`를 추가했다.
- 목록 화면에서는 기존처럼 요약을 사용하고, 상세 화면에서만 중복 표시를 줄였다.
- README, study, test 문서에 이번 QA 발견 사항과 수정 이유를 남겼다.

학습 포인트:

- 목록 카드용 summary와 상세 본문용 content는 역할이 다르다.
- 같은 데이터를 모든 화면에서 똑같이 보여주면 자연스럽지 않을 수 있다.
- 프론트 QA는 “에러가 안 난다”뿐 아니라 실제 사용자가 읽을 때 어색한 부분도 찾아야 한다.

추천 커밋 제목:

```txt
fix: 게시글 상세 요약 중복 표시 정리
```

## 2026-06-15 포트폴리오 등록 목록 유지와 중복 UX 정리

목표: 학생 화면 QA에서 발견한 “GitHub 프로젝트는 등록되어 있는데 목록에서 사라지고, 다시 등록하면 중복 오류가 나는” 흐름을 안정화한다.

진행한 것:

- 프론트 `Portfolio.tsx`의 프로젝트 등록 성공 후 `loadPortfolioData(newProject.id)`로 목록을 다시 불러오는 흐름을 유지하면서 검색어를 초기화했다.
- 백엔드 중복 응답을 받았을 때도 목록을 다시 불러오고, 같은 repo가 있으면 기존 프로젝트를 선택하도록 정리했다.
- repo 중복 검사 기준을 대소문자 무시 기준으로 맞췄다.
- 서버의 `parse_repo_full_name()`이 `owner/repo`를 소문자로 정규화해 저장하도록 수정했다.
- GitHub URL에 scheme이 빠진 경우에도 프론트에서 `https://`를 붙여 `GitHub 보기` 링크를 만들 수 있게 했다.
- 긴 repo 이름이 프로젝트 카드에서 상태 badge를 밀어내거나 가로 스크롤을 만들지 않도록 badge와 텍스트 영역 스타일을 보강했다.

QA 결과:

- 임시 STUDENT 계정 API QA에서 대문자 repo 등록 후 소문자 repo 재등록이 400 중복 응답으로 막혔다.
- 중복 시 목록 총 개수는 1개로 유지됐다.
- 실제 브라우저에서 긴 repo를 등록한 뒤 다른 화면에 갔다가 `/portfolio`로 돌아와도 프로젝트가 유지됐다.
- 같은 repo를 다시 등록하면 raw error 대신 “이미 등록된 GitHub 프로젝트입니다. 기존 프로젝트를 선택했습니다.” 안내가 보였다.
- `GitHub 보기` 링크가 실제 repo URL을 가리켰다.
- 긴 repo 이름으로도 페이지 가로 overflow가 생기지 않았다.
- QA용 프로젝트는 삭제했고 현재 로그인 계정은 ADMIN / 승인 완료로 복구했다.

추천 커밋 제목:

```txt
fix: 포트폴리오 등록 목록 유지와 중복 UX 정리
```

## 2026-06-15 게시글 조회수/댓글 수 데이터 흐름 QA

목표: 게시글 목록에 보이는 조회수와 댓글 수가 실제 DB/API 흐름과 맞게 움직이는지 확인한다.

진행한 것:

- `post_service.py`에서 목록 응답이 `post.view_count`와 `get_comment_counts()` 결과를 사용한다는 것을 확인했다.
- `post_repository.py`에서 상세 조회 시 `increase_post_view_count()`가 호출되는 흐름을 확인했다.
- 임시 STUDENT 사용자와 공개 게시글을 만들고 TestClient로 목록/상세/댓글 작성/목록 재조회 순서를 검증했다.
- QA용 댓글, 게시글, 태그 연결, 임시 사용자는 검증 후 삭제했다.

검증 결과:

- 게시글 생성 직후 목록: `views=0`, `comments=0`
- 상세 첫 조회 후 상세 응답: `views=1`
- 상세 첫 조회 후 목록 재조회: `views=1`, `comments=0`
- 댓글 작성 후 목록 재조회: `views=1`, `comments=1`
- 상세 두 번째 조회 후 상세 응답: `views=2`, `comments=1`
- 상세 두 번째 조회 후 목록 재조회: `views=2`, `comments=1`

결론:

- 게시글 목록/상세의 조회수와 댓글 수는 현재 실제 API 기준으로 맞게 반영되고 있다.
- 이번 파트는 코드 수정 없이 QA와 문서화로 닫는다.

추천 커밋 제목:

```txt
docs: 게시글 조회수 댓글 수 QA 기록
```

## 2026-06-15 코치 리뷰 요청 대상 선택 QA

목표: 학생이 게시글을 작성한 직후 코치 리뷰 요청 화면의 `리뷰 대상 선택` 목록에 해당 게시글이 바로 표시되는지 확인한다.

진행한 것:

- `CoachReview.tsx`의 학생 화면이 `getMyPosts({ visibility: "all", size: 50 })`, `getPortfolioProjects()`, `getCoachOptions()`, `getMyReviewRequests()`를 함께 호출하는 구조를 확인했다.
- `review_service.py`에서 게시글 리뷰 요청 시 대상 게시글을 `author_id == current_user.id` 기준으로 검증하는 것을 확인했다.
- 임시 STUDENT/COACH와 게시글을 만들어 API 레벨에서 `POST /posts -> GET /me/posts -> POST /review-requests -> GET /review-requests/me` 흐름을 검증했다.
- 실제 브라우저에서 현재 계정을 STUDENT로 바꾸고 `/posts/new`에서 게시글을 발행한 뒤 `/coach-review`에서 방금 글이 select와 미리보기에 보이는지 확인했다.
- 브라우저에서 리뷰 요청을 전송했고, `내가 보낸 요청 목록`에 `대기 중` 상태로 표시되는 것을 확인했다.
- QA용 리뷰 요청, 알림, 게시글, 임시 코치를 삭제했고 현재 로그인 계정은 ADMIN / 승인 완료로 복구했다.

결론:

- 게시글 작성 후 코치 리뷰 요청 대상에 즉시 표시되는 흐름은 현재 실제 API 기준으로 정상이다.
- 이번 파트는 코드 수정 없이 QA와 문서화로 닫는다.

추천 커밋 제목:

```txt
docs: 코치 리뷰 요청 대상 QA 기록
```

## 2026-06-15 AI 도우미 보관함 UX 정리

목표: AI 연결 전 화면이더라도 서비스 화면처럼 보이도록 AI 도우미의 생성 결과 관리 영역과 버튼 동작을 정리한다.

진행한 것:

- `AIAssistant.tsx`의 `포트폴리오 초안 보관함`을 `생성 결과 보관함`으로 바꿔 포트폴리오 초안과 면접 질문 결과를 함께 관리하는 구조로 보이게 했다.
- 화면에 직접 보이던 `AI 단계 예정`, `AI 연결 단계` 같은 구현 단계 표현을 제거했다.
- 복사 버튼이 단순 안내만 띄우지 않고 실제 클립보드 복사를 시도하도록 수정했다.
- `navigator.clipboard.writeText()`가 브라우저 권한 때문에 실패할 경우 `textarea + document.execCommand("copy")` fallback으로 한 번 더 복사하게 했다.
- 다시 생성 아이콘 버튼은 동작 없는 버튼으로 남지 않게 `다시 구성` 흐름에 연결했다.
- 포트폴리오 상세의 면접 질문 badge도 개발 단계 문구 대신 `준비 중`으로 정리했다.

QA 결과:

- `npm run build`가 성공했다.
- 프론트 소스에서 `mock`, `debug`, `AI 단계 예정`, `AI 연결 단계`, `backend/uploads`, `S3`, `로컬 개발` 사용자 노출 문구가 잡히지 않았다.
- 브라우저에서 `/ai-assistant` 빈 상태와 `/portfolio` 빈 상태에 `Unexpected Application Error`, `[object Object]`, 개발 문구가 보이지 않았다.
- QA용 포트폴리오 프로젝트를 임시 생성한 뒤 `/ai-assistant?project=...&type=interview`에서 `생성 결과 보관함`과 `현재 생성된 면접 질문` 영역을 확인했다.
- 복사 버튼 클릭 후 클립보드에 생성 결과 텍스트가 들어갔고 `결과를 복사했습니다.` 안내가 보였다.
- QA용 임시 프로젝트는 삭제했다.

추천 커밋 제목:

```txt
fix: AI 도우미 보관함 UX 정리
```

## 2026-06-15 프로필 이미지 업로드와 아바타 전파 QA

목표: 사용자가 설정 화면에서 이름과 프로필 이미지를 수정할 수 있고, 업로드한 이미지가 게시글/댓글/리뷰 요청 응답까지 이어지는지 확인한다.

진행한 것:

- `Settings.tsx`가 `/me/profile` API로 이름과 이미지 파일을 `FormData`로 보내는 구조를 확인했다.
- `me.py`의 `PATCH /me/profile`이 이미지 타입과 2MB 제한을 검사하고 `/uploads/profiles/...` 경로로 저장하는 구조를 확인했다.
- 임시 STUDENT/COACH 사용자를 만들고 TestClient로 프로필 이미지 업로드를 실행했다.
- 업로드 후 `/auth/me`, 게시글 생성, 댓글 생성/조회, 리뷰 요청 생성 응답에 프로필 이미지 URL이 포함되는지 확인했다.
- Google OAuth 재로그인 동기화 함수가 사용자가 직접 수정한 이름과 업로드 이미지를 덮어쓰지 않는지 확인했다.
- 브라우저에서 `/settings` 화면에 프로필 이미지 선택, 이름 입력, 저장 버튼이 보이고 개발 문구가 없는지 확인했다.
- QA용 사용자, 게시글, 댓글, 리뷰 요청, 업로드 파일을 삭제했다.

QA 결과:

- `PATCH /me/profile`은 200을 반환했다.
- 응답의 `profileImageUrl`은 `/uploads/profiles/...` 경로였다.
- 실제 업로드 파일이 생성됐다가 QA 종료 후 삭제됐다.
- `/auth/me`는 수정된 이름과 업로드 이미지 URL을 반환했다.
- Google profile 재동기화 시 커스텀 이름과 업로드 이미지가 유지됐다.
- 게시글 응답의 `authorProfileImageUrl`이 업로드 이미지 URL과 일치했다.
- 댓글 응답과 댓글 목록 응답의 `authorProfileImageUrl`이 업로드 이미지 URL과 일치했다.
- 리뷰 요청 응답의 `requesterProfileImageUrl`이 업로드 이미지 URL과 일치했다.
- 리뷰 요청 응답의 `coachProfileImageUrls`도 코치 이미지 URL을 포함했다.
- 설정 화면에 `Unexpected Application Error`, `[object Object]`, 개발/debug 문구가 보이지 않았다.

추천 커밋 제목:

```txt
docs: 프로필 이미지 업로드 QA 기록
```

## 2026-06-15 학생 게시글 CRUD 브라우저 QA와 댓글 시간 포맷 수정

목표: 학생 계정으로 게시글 작성 -> 상세 -> 댓글 작성 -> 내 기록 반영 -> 수정 -> 삭제 흐름이 실제 화면/API 기준으로 자연스럽게 이어지는지 확인한다.

진행한 것:

- 현재 로그인 사용자를 임시로 STUDENT / 승인 완료로 전환했다.
- `/posts/new`에서 새 게시글 작성 화면이 열리고 `관련 커밋` 대신 `관련 GitHub repo`만 보이는지 확인했다.
- 제목, 본문, GitHub repo URL을 입력하고 `발행하기`를 눌러 실제 `POST /posts` 흐름으로 게시글을 만들었다.
- 발행 후 `/posts/:id` 상세 화면으로 이동하고 제목, 본문, GitHub repo, 조회수, 댓글 수가 보이는지 확인했다.
- 상세 화면에서 댓글을 작성하고 댓글 수가 0에서 1로 바뀌는지 확인했다.
- 댓글 작성 시간이 raw ISO 문자열로 보이는 문제를 발견했다.
- `PostDetail.tsx`에 `formatDateTime()`을 추가해 댓글 시간을 한국식 날짜/시간으로 표시하게 수정했다.
- `/my-records`에서 방금 작성한 글이 댓글 수/조회수와 함께 보이는지 확인했다.
- `/posts/:id/edit`에서 기존 게시글 데이터가 폼에 채워지는지 확인했다.
- 수정 완료 후 상세 화면으로 돌아와 제목과 본문 수정 내용이 반영되는지 확인했다.
- 삭제 확인 UI를 통해 게시글을 삭제하고 `/posts` 목록으로 이동하는지 확인했다.
- QA용 게시글, 댓글, 관련 데이터를 DB에서 삭제하고 현재 로그인 사용자를 ADMIN / 승인 완료로 복구했다.

발견한 문제:

- 댓글 작성 시간 표시가 `2026-06-15T14:41:10...Z`처럼 API raw timestamp 그대로 보였다.

해결 방법:

- 상세 게시글의 댓글 영역에서 `comment.createdAt`을 직접 출력하지 않고 `formatDateTime(comment.createdAt)`으로 감싸도록 수정했다.
- `toLocaleString("ko-KR")`에 날짜와 시간 옵션을 지정해 `2026. 06. 15. 오후 11:41`처럼 읽히게 했다.

QA 결과:

- 게시글 작성 후 상세 화면으로 이동했다.
- GitHub repo URL과 `GitHub 보기` 버튼이 보였다.
- 댓글 작성 후 댓글 수가 1로 바뀌었다.
- 댓글 빈 상태 문구는 댓글 작성 후 사라졌다.
- 댓글 시간은 한국식 날짜/시간으로 표시됐다.
- 내 기록에 작성한 게시글이 보였고 댓글 수/조회수가 함께 표시됐다.
- 수정 화면은 기존 게시글 값을 폼에 채웠다.
- 수정 완료 후 상세 화면에 변경된 제목/본문이 보였다.
- 삭제 후 `/posts` 목록으로 이동했고 삭제한 글은 목록에 보이지 않았다.
- 화면에 `Unexpected Application Error`와 `[object Object]`는 보이지 않았다.

추천 커밋 제목:

```txt
fix: 학생 게시글 CRUD 흐름 QA와 댓글 시간 표시 정리
```

---

## 2026-06-15 ��ġ ���� �ιڽ� QA�� API refresh ����ȭ

����: �Ϸ�

��ǥ: ��ġ�� ���� ��û�� Ȯ���ϰ� �ǵ��/���¸� �л����� ������ �帧�� �����ϸ鼭, access token ���� �Ǵ� ������ ĳ�� ������ role/menu/API ������ ���� ���̴� ������ �����ߴ�.

������ ��:

- `frontend/src/app/api/client.ts`�� ���� `apiFetch()`�� �߰��ߴ�.
- ���� API�� 401�� ������ `/auth/refresh`�� �� �� ȣ���� �� ���� ��û�� ��õ��ϵ��� �ߴ�.
- ����/�Խñ�/���/��Ʈ������/�˸�/������ API Ŭ���̾�Ʈ�� ���� `apiFetch()`�� ����ϵ��� �ٲ��.
- `/auth/me`, `/auth/refresh`, `/auth/logout`�� �ֿ� ��ȸ API�� `cache: "no-store"`�� �����ߴ�.
- ��ġ �ιڽ����� ���� ��û ���°� `�ǵ�� �Ϸ�`�� �ݿ��ǰ� �л� �˸��� �����Ǵ��� ����/API �������� �����ߴ�.
- ���� �� �ִ� Vite dev ���� ������ `AuthProvider` ������ ���� role ǥ�ð� ���� dev ������ ������ߴ�.
- QA ������ ���� �� ���� ������ `ADMIN / ���� �Ϸ�`�� �����ߴ�.

�߰��� ������ �ذ�:

- ����: DB�� API�� `�ǵ�� �Ϸ�`�� ��ȯ�ϴµ� ������ ȭ���� ��� `��� ��`�� �������.
- ����: ������ ĳ��/������ dev ���� state�� ���� �ֽ� `/auth/me`, `/review-requests/inbox` ������ ���������� ���� ���ߴ�.
- �ذ�: ���� `apiFetch()`�� `cache: "no-store"`�� �߰��ϰ�, ���� �� �ִ� Vite dev ������ ������ߴ�.

���� ���:

- `npm run build` ����
- ���� ���� `localhost:8000 /review-requests/inbox` ������ `�ǵ�� �Ϸ�`�� ��ȯ���� Ȯ��
- ���������� ��ġ �ιڽ� ��û ���°� `�ǵ�� �Ϸ�`�� ǥ�õ��� Ȯ��
- ���������� ���� ������ `������`, ���̵�ٰ� `����� ���� / ��ü �Խñ� / ����`���� ǥ�õ��� Ȯ��
- ������ ���̵�ٿ� ��ú��� �޴��� �ٽ� ������ ������ Ȯ��

Ŀ�� ��õ ����:

```txt
fix: API refresh ��õ��� ��ġ ���� �ιڽ� QA ����
```

---

## 2026-06-16 AI 도우미 면접 질문 저장 구조 추가

상태: 완료

목표: AI 도우미에서 만든 면접 예상 질문이 임시 화면 결과로만 끝나지 않고, 선택한 포트폴리오 프로젝트의 저장 결과로 남도록 정리했다.

진행한 것:

- `portfolio_projects`에 `saved_interview_questions` column을 추가했다.
- 포트폴리오 API 응답에 `savedInterviewQuestions`, `aiInterviewSaved`를 추가했다.
- AI 도우미의 저장 버튼이 결과 유형에 따라 포트폴리오 초안 또는 면접 질문 보관함에 저장하도록 바꿨다.
- 포트폴리오 관리 화면에서 저장된 면접 예상 질문과 저장 여부 badge를 보여주도록 바꿨다.
- 로컬 개발 DB에는 Alembic 도입 전 임시 방식으로 `ADD COLUMN IF NOT EXISTS` 보강을 적용했다.

발견한 문제와 해결:

- 문제: 면접 예상 질문은 화면에서 생성 결과만 볼 수 있고 프로젝트에 저장되지 않았다.
- 원인: 기존 API/DB에는 `savedPortfolioDraft`만 있고 면접 질문 결과를 담는 필드가 없었다.
- 해결: `savedInterviewQuestions` 필드를 API/DB/프론트 타입에 추가하고 저장 버튼 흐름을 분기했다.

검증 결과:

- `python -m compileall app` 성공
- `npm run build` 성공
- `init_db()` 실행으로 `saved_interview_questions` column 보강 확인
- TestClient로 프로젝트 생성 -> 면접 질문 PATCH 저장 -> 목록 재조회 -> 저장 여부 확인 -> QA 데이터 정리 흐름 검증

커밋 추천 제목:

```txt
feat: AI 도우미 면접 질문 저장 구조 추가
```

---

## 2026-06-16 AI ����� ���� ���� ���� ���� �߰�

����: �Ϸ�

��ǥ: AI ����̿��� ���� ���� ���� ������ �ӽ� ȭ�� ����θ� ������ �ʰ�, ������ ��Ʈ������ ������Ʈ�� ���� ����� ������ �����ߴ�.

������ ��:

- `portfolio_projects`�� `saved_interview_questions` column�� �߰��ߴ�.
- ��Ʈ������ API ���信 `savedInterviewQuestions`, `aiInterviewSaved`�� �߰��ߴ�.
- AI ������� ���� ��ư�� ��� ������ ���� ��Ʈ������ �ʾ� �Ǵ� ���� ���� �����Կ� �����ϵ��� �ٲ��.
- ��Ʈ������ ���� ȭ�鿡�� ����� ���� ���� ������ ���� ���� badge�� �����ֵ��� �ٲ��.
- ���� ���� DB���� Alembic ���� �� �ӽ� ������� `ADD COLUMN IF NOT EXISTS` ������ �����ߴ�.

�߰��� ������ �ذ�:

- ����: ���� ���� ������ ȭ�鿡�� ���� ����� �� �� �ְ� ������Ʈ�� ������� �ʾҴ�.
- ����: ���� API/DB���� `savedPortfolioDraft`�� �ְ� ���� ���� ����� ��� �ʵ尡 ������.
- �ذ�: `savedInterviewQuestions` �ʵ带 API/DB/����Ʈ Ÿ�Կ� �߰��ϰ� ���� ��ư �帧�� �б��ߴ�.

���� ���:

- `python -m compileall app` ����
- `npm run build` ����
- `init_db()` �������� `saved_interview_questions` column ���� Ȯ��
- TestClient�� ������Ʈ ���� -> ���� ���� PATCH ���� -> ��� ����ȸ -> ���� ���� Ȯ�� -> QA ������ ���� �帧 ����

Ŀ�� ��õ ����:

```txt
feat: AI ����� ���� ���� ���� ���� �߰�
```

---

## 2026-06-16 ��Ʈ������ �� ���� ���� ����

����: �Ϸ�

��ǥ: �� GitHub ������Ʈ ��� ���� README/Ŀ��/�ʾ� ������ ���� �ܰ� �ȳ� ������ ������ó�� ����ǰų� ȭ�鿡 ������� �ʵ��� �����ߴ�.

������ ��:

- �� ��Ʈ������ ������Ʈ ���� �� `readme_summary`, `recent_commit_summary`, `saved_portfolio_draft`�� `None`���� �����ϵ��� �ٲ��.
- ��Ʈ������ API ���� ���� �� ���� placeholder ������ �� ��ó�� �����ϴ� helper�� �߰��ߴ�.
- ��Ʈ������ ���� ȭ�鿡�� �ֱ� Ŀ�� ����� ���� �� ������ �ֱ� Ŀ�� ����� �����ϴ�.���� �����ֵ��� �ߴ�.
- ��Ʈ������ ������ AI ������� README fallback ������ ������ README ����� �����ϴ�.���� �����ߴ�.

�߰��� ������ �ذ�:

- ����: `recent_commit_summary`�� `MCP/GitHub API ���� �� ����` ���� ���� �ܰ� ������ ����ǰ� ȭ�鿡 ���� �� �־���.
- ����: �ȳ� ������ ȭ�� empty state�� �ƴ϶� DB �⺻ �����ͷ� �����ϰ� �־���.
- �ذ�: �� row���� ���� �����Ͱ� ������ `None`�� �����ϰ�, ȭ�鿡���� ����ڿ� �� ���� ������ ǥ���ϰ� �ٲ��.

���� ���:

- �� ������Ʈ ���� ���信�� `readmeSummary is None`, `recentCommitSummary == []`, `savedPortfolioDraft is None` Ȯ��
- ���Ž� placeholder ��� ���� ���� row�� ���信���� `None` �Ǵ� �� �迭�� �����Ǵ��� Ȯ��

Ŀ�� ��õ ����:

```txt
fix: ��Ʈ������ �� ���� �ȳ� ���� ����
```

---

## 2026-06-16 ��ġ ���� �ιڽ� QA�� ���� �� ����ȭ

����: �Ϸ�

��ǥ: ��ġ�� �л��� ���� ��û�� �޾� �ǵ���� �����ϰ�, �л� ��û ��ϰ� �˸��� �ݿ��Ǵ� �պ� �帧�� �����ߴ�. �Բ� ��ġ �ιڽ� ���Ϳ� �� �г��� ��߳� �� �ִ� UI ������ �����ߴ�.

������ ��:

- �л�/��ġ/�ٸ� ��ġ QA ����ڸ� ������ ���� ��û �帧�� DB/API �������� �����ߴ�.
- �л� �Խñ��� ���� ������� �����ϰ�, ������ ��ġ���� ���� ��û�� �������.
- �������� ���� ��ġ�� ���� ��û�� ������ �� ������ Ȯ���ߴ�.
- ������ ��ġ�� `�ǵ�� �Ϸ�`�� �ǵ�� ������ �����ϸ� �л� ��û ��Ͽ� ���� ���¿� �ǵ���� ���̴��� Ȯ���ߴ�.
- �л����� `review-feedback` �˸��� �����Ǵ��� Ȯ���ߴ�.
- ��ġ �ιڽ����� ���� ����� �� �г� ���� ������ ��߳��� �ʵ��� `selectedRequest`�� `filteredRequests` �������� ����ϰ� �����ߴ�.

�߰��� ������ �ذ�:

- ����: ��ġ �ιڽ����� ���͸� �ٲ㵵 �� �г��� ���� ���� ���� ���� ��û�� ��� ������ �� �־���.
- ����: ����� `filteredRequests`�� ��������� �� �г��� ���� `requests` �������� `selectedRequest`�� ã�� �־���.
- �ذ�: `selectedRequest`�� `filteredRequests` �������� ����ϰ�, ���� ������ ���� ������� ������� ���͵� ù ��û���� `selectedId`�� �����.

���� ���:

- ���� ��û ���� ���°� `��� ��`���� ������
- �л��� ���� ���� ��û ��Ͽ� ��û�� ǥ�õ�
- ������ ��ġ �ιڽ����� 1�� ǥ�õ�
- �ٸ� ��ġ �ιڽ����� 0�� ǥ�õ�
- �ٸ� ��ġ�� ���� �õ��� PermissionError�� ���ܵ�
- ������ ��ġ�� �ǵ�� �Ϸ� ���� �� �л� ��Ͽ� ����/�ǵ���� �ݿ���
- �л� �˸��� `review-feedback` �˸��� ������

Ŀ�� ��õ ����:

```txt
fix: ��ġ ���� �ιڽ� ���� �� ����ȭ
```

---

## 2026-06-16 ���� ���� ���� UI ����

����: �Ϸ�

��ǥ: ���� API�� ��� �������� �ʴ� ����� ȭ�� ��ҿ� placeholder �����Ͱ� ���� ������ó�� ���̴� �κ��� �����ߴ�.

������ ��:

- �Խñ� �ۼ�/���� ȭ�鿡�� `�ӽ�����` ��ư�� ���� �ȳ� ������ �����ߴ�.
- �Խñ� �ۼ� ȭ���� ���� API�� ����� `�����ϱ�`�� `���� �Ϸ�` �帧�� �����.
- ��Ʈ������ ������Ʈ ��� �� ����Ʈ �⺻ `techStack`�� `GitHub`�� �������� �ٲ��.
- �鿣�嵵 `techStack`�� ���� �� `GitHub`�� �⺻ �����ϵ��� �ٲ��.
- ���� ����� `�м� ����` ��� ���� ���� ���信�� �����ϵ��� `parse_tech_stack()`�� �߰��ߴ�.

�߰��� ������ �ذ�:

- ����: `�ӽ�����` ��ư�� ���� API�� ��� ������ ���غ� �ߡ� �ȳ��� ������.
- �ذ�: ���� ����ó�� ���̵��� �ش� ��ư�� �����ϰ�, ���� ����Ǵ� ����/���� ��ư�� �����.
- ����: `�м� ����`�� ��� ���� ������ó�� ����ǰ� ȭ�� badge�� ���� �� �־���.
- �ذ�: �⺻������ �����ϰ�, ���Ž� ���� API ���信�� ���͸��ߴ�.

���� ���:

- `rg` �˻����� ����� ȭ���� `�ӽ�����`, `�غ� ���Դϴ�`, `TODO backend` ������ ���ŵ��� Ȯ���ߴ�.
- �� ��Ʈ������ ������Ʈ ���� ������ `techStack`�� `['GitHub']`���� Ȯ���ߴ�.
- ���Ž� `GitHub\n�м� ����` ���� API ���信���� `['GitHub']`�� �����Ǵ��� Ȯ���ߴ�.

Ŀ�� ��õ ����:

```txt
fix: ���� ���� ���� UI ����
```

---

## 2026-06-16 파트 단위 커밋 운영 기준 반영

상태: 완료

목표: 이후 작업에서 기능 구현, 문서화, QA가 끝난 작은 단위마다 커밋을 남기도록 운영 기준을 명확히 했다.

진행한 것:

- `docs/agent/agent.md`에 파트 단위 커밋 운영 기준을 추가했다.
- 앞으로 구현 후 문서 업데이트, QA, `git status` 확인, 커밋 제목 제안까지 한 묶음으로 진행하기로 정리했다.
- `backend/.env`는 절대 커밋하지 않는다는 주의사항을 다시 남겼다.

검증 예정:

- 문서 변경 후 `npm run build`와 백엔드 compile을 실행한다.
- `git diff --check`로 문서 diff 공백 오류를 확인한다.

커밋 추천 제목:

```txt
docs: 파트 단위 커밋 운영 기준 추가
```

검증 결과:

- `npm run build` 성공
- `python -m compileall app` 성공
- `git diff --check`는 공백 오류 없이 통과했으며, Windows 줄바꿈 경고만 표시됨

---

## 2026-06-16 학생 핵심 흐름 DB/API 자체 QA

상태: 완료

목표: 학생 화면 완료 기준 중 실제 API와 DB 흐름으로 증명해야 하는 항목을 임시 QA 사용자/데이터로 검증했다.

진행한 것:

- QA 학생/코치 사용자를 임시 생성했다.
- 학생 게시글을 생성하고 댓글을 작성했다.
- 게시글 상세를 2번 조회해 조회수 증가 흐름을 확인했다.
- 내 기록 조회에서 방금 만든 게시글이 조회되는지 확인했다.
- GitHub repo URL로 포트폴리오 프로젝트를 등록했다.
- 같은 repo를 다시 등록하면 중복으로 차단되는지 확인했다.
- 포트폴리오 프로젝트에 게시글을 연결했다.
- 포트폴리오 초안과 면접 예상 질문을 프로젝트에 저장했다.
- 학생이 게시글을 대상으로 코치 리뷰 요청을 만들었다.
- 코치 인박스에 해당 요청이 들어오는지 확인했다.
- 코치가 `최종 확인`과 피드백을 저장하면 학생 요청 목록에 반영되는지 확인했다.
- QA 데이터는 검증 후 삭제했다.

검증 결과:

```txt
portfolio_list_contains_created=True
portfolio_duplicate_blocked=True
linked_post_ids=[43]
saved_draft=QA portfolio draft
saved_interview=QA interview questions
portfolio_status_after=보완 필요
my_posts_has_created_post=True
comment_total=1
detail_views_before_after=1 2
detail_comment_count=1
coach_inbox_has_review=True
review_status_after=최종 확인
student_request_feedback_seen=True
```

발견한 점:

- PowerShell에서 Python stdin으로 한글 literal을 직접 넘기면 `보완 필요`가 깨질 수 있었다.
- QA 스크립트에서는 한글 상태값을 유니코드 escape로 넣어 검증했다.
- cleanup에는 `post_tags` 연결 테이블 삭제가 먼저 필요했다.

커밋 추천 제목:

```txt
docs: 학생 핵심 흐름 QA 기록
```

---

## 2026-06-16 코치 화면 브라우저 smoke QA

상태: 완료

목표: 코치 계정으로 주요 코치 화면과 접근 제한 화면을 실제 브라우저에서 열어 깨지는 부분이 없는지 확인했다.

진행한 것:

- QA 학생/코치 사용자와 코치에게 배정된 리뷰 요청을 임시 생성했다.
- 코치용 access/refresh cookie를 만들어 Playwright 브라우저 컨텍스트에 주입했다.
- 로컬 Chrome 채널로 다음 화면을 열었다.
  - `/coach-review`
  - `/posts`
  - `/settings`
  - `/portfolio`
  - `/ai-assistant`
  - `/my-records`
- 코치 전용 기본 화면에서는 `대시보드` 메뉴가 보이지 않는지 확인했다.
- 코치가 학생 전용 화면에 직접 접근하면 접근 제한 안내가 보이는지 확인했다.
- QA 데이터는 검증 후 삭제했다.

검증 결과:

```txt
/coach-review: Unexpected Application Error 없음, [object Object] 없음, 대시보드 메뉴 없음
/posts: Unexpected Application Error 없음, [object Object] 없음, 대시보드 메뉴 없음
/settings: Unexpected Application Error 없음, [object Object] 없음, 대시보드 메뉴 없음
/portfolio: 접근 제한 확인, 포트폴리오 관리 본문 미노출
/ai-assistant: 접근 제한 확인, 포트폴리오 관리 본문 미노출
/my-records: 접근 제한 확인, 포트폴리오 관리 본문 미노출
cleanup_done=True
```

발견한 점:

- Playwright package는 설치되어 있었지만 기본 Chromium executable은 없었다.
- 새 브라우저를 다운로드하지 않고 로컬 Chrome channel로 QA를 진행했다.

커밋 추천 제목:

```txt
docs: 코치 화면 브라우저 QA 기록
```

---

## 2026-06-16 프로필 수정/이미지 업로드 API QA

상태: 완료

목표: 학생/코치 화면에서 쓰이는 프로필 이름과 아바타 이미지가 실제 API와 정적 파일 서빙으로 연결되는지 확인했다.

진행한 것:

- QA 사용자를 임시 생성하고 access/refresh token을 발급했다.
- `PATCH /me/profile`에 이름과 이미지 파일을 multipart form으로 전송했다.
- 응답의 `profileImageUrl`이 `/uploads/profiles/...` 경로인지 확인했다.
- `GET /auth/me`에서 수정한 이름이 유지되는지 확인했다.
- 업로드된 정적 파일 URL이 200으로 서빙되는지 확인했다.
- 같은 Google 계정으로 다시 로그인되는 상황을 서비스 함수로 재현했다.
- Google name/profile image가 사용자가 수정한 이름/업로드 이미지로 덮어쓰지 않는지 확인했다.
- QA 데이터와 업로드 파일은 검증 후 삭제했다.

검증 결과:

```txt
profile_patch_status=200
profile_name_updated=True
profile_image_url_is_upload=True
auth_me_status=200
auth_me_name_persisted=True
static_upload_status=200
google_login_does_not_overwrite_name=True
google_login_does_not_overwrite_uploaded_image=True
```

발견한 점:

- FastAPI `TestClient`에서는 `client.cookies.set(..., domain='testserver')` 방식으로 넣은 쿠키가 이번 요청에서 인증에 쓰이지 않아 401이 발생했다.
- 요청별 `Cookie` header를 직접 넣는 방식으로 인증 QA를 진행했다.

커밋 추천 제목:

```txt
docs: 프로필 업로드 QA 기록
```

---

## 2026-06-16 학생 화면 브라우저 최종 smoke QA

상태: 완료

목표: 학생 계정으로 URL 직접 입력 없이 주요 메뉴와 화면 흐름을 실제 브라우저에서 눌러보며, 학생 화면 안정화 완료 기준을 최종 확인했다.

진행한 것:

- QA 학생/코치 사용자와 seed 게시글을 임시 생성했다.
- 학생 access/refresh cookie를 브라우저 컨텍스트에 넣어 실제 학생 세션으로 접속했다.
- 사이드바/화면 링크를 통해 다음 흐름을 확인했다.
  - 대시보드
  - 전체 게시글
  - 게시글 작성
  - 게시글 상세
  - 댓글 작성
  - 내 기록
  - 포트폴리오 관리
  - AI 도우미 진입
  - 코치 리뷰 요청
  - 설정
- 브라우저에서 새 게시글을 작성하고 상세 화면으로 이동되는지 확인했다.
- 상세 화면에서 댓글을 작성하고 화면에 반영되는지 확인했다.
- 내 기록에서 방금 작성한 게시글이 보이는지 확인했다.
- 포트폴리오 관리에서 긴 GitHub repo URL을 등록했다.
- 다른 화면으로 갔다가 돌아와도 등록된 프로젝트가 유지되는지 확인했다.
- 같은 repo를 다시 등록하면 기존 프로젝트 선택/중복 안내가 보이는지 확인했다.
- `GitHub 보기` 링크의 `href`가 실제 repo URL이고 `target="_blank"`인지 확인했다.
- 포트폴리오 관리에서 AI 도우미로 이동해 생성 결과 보관함 구조가 보이는지 확인했다.
- 코치 리뷰 요청 화면에서 게시글 대상과 포트폴리오 프로젝트 대상이 모두 표시되는지 확인했다.
- 확인한 화면에서 `Unexpected Application Error`, `[object Object]`, 개발/debug 문구가 보이지 않는지 확인했다.
- QA 데이터는 검증 후 삭제했다.

검증 결과 요약:

```txt
dashboard: 에러 없음, 학생 메뉴 확인
posts: 에러 없음
created post detail: 에러 없음, 댓글 작성 반영
my-records: 작성한 게시글 표시
portfolio: 긴 repo 등록 표시, 저장된 초안/면접 질문 영역 표시
portfolio return: 등록 프로젝트 유지 확인
portfolio duplicate: 중복 안내와 기존 프로젝트 표시
GitHub 보기: href=repo URL, target=_blank
AI assistant: 생성 결과 보관함 표시, 선택 프로젝트 반영
coach review: 게시글 대상 표시, 포트폴리오 프로젝트 대상 표시
settings: 프로필/설정 화면 표시
overall: Unexpected Application Error 없음, [object Object] 없음
cleanup_done=True
```

커밋 추천 제목:

```txt
docs: 학생 화면 브라우저 QA 기록
```

---

## 2026-06-16 긴 repo 카드 레이아웃 QA

상태: 완료

목표: 포트폴리오 프로젝트 카드에서 긴 repo 이름 때문에 상태 badge가 카드 밖으로 밀리거나 가로 스크롤이 생기지 않는지 브라우저 DOM 수치로 확인했다.

진행한 것:

- 매우 긴 GitHub repo 이름을 가진 QA 프로젝트를 임시 생성했다.
- 학생 세션으로 `/portfolio`를 열었다.
- repo 이름을 포함한 프로젝트 카드의 bounding box를 찾았다.
- `작성중` 상태 badge와 `코치` badge의 bounding box가 카드 안에 있는지 계산했다.
- 문서 전체에 가로 overflow가 생기는지 확인했다.
- QA 데이터는 검증 후 삭제했다.

검증 결과:

```txt
found=True
statusInsideCard=True
coachInsideCard=True
horizontalOverflow=False
bodyHasError=False
cleanup_done=True
```

커밋 추천 제목:

```txt
docs: 긴 repo 카드 레이아웃 QA 기록
```

---

## 2026-06-16 GitHub REST API 실제 연동

상태: 완료

목표:

- AI/MCP 전 단계로 포트폴리오 관리 화면의 GitHub 프로젝트 등록을 실제 GitHub REST API와 연결한다.
- 등록된 프로젝트의 README, 사용 언어, 최근 커밋 정보를 DB에 저장하고 화면에서 보여준다.
- 데스크톱 기준으로 주요 화면의 중앙 콘텐츠 폭을 조금 넓힌다.
- JungleLog 로고를 역할별 홈 이동 버튼처럼 동작하게 한다.

진행한 것:

- `backend/app/services/github_service.py`를 추가했다.
- GitHub REST API로 repository metadata, README, languages, commits를 조회한다.
- 공개 repo는 token 없이 조회하고, `GITHUB_TOKEN`이 있으면 Authorization header를 붙이도록 만들었다.
- 포트폴리오 프로젝트 등록 시 GitHub 분석 결과를 함께 저장하도록 `portfolio_service`와 `portfolio_repository`를 수정했다.
- `POST /portfolio/projects/{project_id}/github/refresh` API를 추가했다.
- 포트폴리오 화면의 `GitHub 정보 새로고침` 버튼을 mock `setTimeout`에서 실제 API 호출로 바꿨다.
- 등록 시 임시 `techStack: ["GitHub"]`를 보내던 흐름을 제거해 백엔드가 GitHub languages 결과를 저장하게 했다.
- 사이드바 JungleLog 로고를 role별 홈 경로로 연결했다.
- 주요 화면의 최대 폭을 `max-w-6xl`에서 `max-w-7xl`로 넓혔다.

역할별 로고 홈 이동:

- 승인 전: `/pending-approval`
- STUDENT: `/`
- COACH: `/coach-review`
- ADMIN: `/admin/users`

검증:

```txt
python -m compileall app
npm run build
GitHub public repo smoke test: octocat/Hello-World
```

결과:

- 백엔드 compile 성공
- 프론트엔드 build 성공
- `octocat/Hello-World`에서 repo URL, README 존재 여부, 최근 커밋 3개 조회 확인

커밋 추천 제목:

```txt
feat: GitHub REST API로 포트폴리오 프로젝트 분석 연결
```

---

## 2026-06-16 GitHub 연동 UI 브라우저 smoke QA

상태: 완료

확인한 것:

- 현재 브라우저 세션은 ADMIN 사용자로 렌더링됐다.
- JungleLog 로고 링크가 ADMIN 기본 화면인 `/admin/users`를 가리키는지 확인했다.
- `/coach-review` 화면에서 `Unexpected Application Error`와 `[object Object]`가 보이지 않았다.
- 주요 화면 폭 확장 class인 `max-w-7xl`이 렌더링되는지 확인했다.
- `/portfolio` 화면이 열리고 GitHub repo 입력창과 `GitHub 프로젝트 등록` 버튼이 보이는지 확인했다.

검증 결과:

```txt
coachReview.bodyHasError=False
coachReview.logoHref=/admin/users
coachReview.hasWideContainer=True
portfolio.bodyHasError=False
portfolio.hasPortfolioHeading=True
portfolio.hasRepoInput=True
portfolio.hasRegisterButton=True
portfolio.hasWideContainer=True
```

---

## 2026-06-16 1차 작업: GitHub branch 지원과 포트폴리오 관리 화면 정리

상태: 완료

목표:

- GitHub 프로젝트 등록을 repo 단위에서 repo/branch 단위로 확장한다.
- branch URL을 입력하면 branch를 파싱하고, branch가 없으면 GitHub default branch를 저장한다.
- README, 최근 커밋, 기술 스택 참고 정보를 branch 기준으로 조회한다.
- 포트폴리오 관리 화면을 전체 상세 노출보다 프로젝트 관리 대시보드/preview 느낌으로 정리한다.

진행한 것:

- `portfolio_projects.github_branch` 컬럼을 추가했다.
- 중복 기준을 `owner_id + repo_full_name`에서 `owner_id + repo_full_name + github_branch`로 바꿨다.
- 기존 개발 DB는 `init_db()`에서 `github_branch` 컬럼과 unique index를 보강한다.
- GitHub URL 파싱에서 `/tree/{branch}`와 `/blob/{branch}`를 읽도록 변경했다.
- branch가 없는 URL은 GitHub repository metadata의 `default_branch`를 사용한다.
- README는 `ref`, commits는 `sha` query로 branch를 지정한다.
- GitHub languages API는 repo 단위라 branch별 tree를 조회해 파일 확장자 기반 기술 스택을 우선 추정한다.
- 포트폴리오 관리 화면에 branch badge를 추가했다.
- 포트폴리오 관리 화면의 `저장된 포트폴리오 글 초안` 표현을 `포트폴리오 글`로 바꿨다.
- 포트폴리오 글은 관리 화면에서 preview로 보이도록 정리했다.
- 최근 커밋은 상세 화면에서 상위 3개만 preview로 보여준다.
- README는 계속 접힌 참고 자료로 유지했다.

검증:

```txt
.\.venv\Scripts\python.exe -m compileall app
npm run build
init_db smoke test
GitHub analyze_repository("octocat/Hello-World") smoke test
parse_github_project_reference("https://github.com/octocat/Hello-World/tree/master") smoke test
브라우저 /portfolio 화면 smoke test
```

결과:

- 백엔드 compile 성공
- 프론트엔드 build 성공
- `octocat/Hello-World` default branch가 `master`로 저장되는 것 확인
- `/tree/master` URL 파싱 결과가 repo=`octocat/hello-world`, branch=`master`인지 확인
- `init_db()` 실행 성공
- `/portfolio` 화면에서 branch URL 안내, GitHub 프로젝트 등록 버튼, branch 검색 placeholder 확인

다음 작업:

- 2차: 포트폴리오 관리 게시글을 프로젝트 기반 게시글로 정리한다.
- 2차: AI 도우미 UI를 프로젝트 선택 -> 참고 자료 -> 결과 생성/저장 흐름으로 더 깔끔하게 재구성한다.

커밋 추천 제목:

```txt
feat: GitHub branch 기준 포트폴리오 관리 연결
```

---

## 2026-06-16 2차 작업: 포트폴리오 게시글 발행과 AI 도우미 UI 정리

상태: 완료

목표:

- `포트폴리오 관리` 카테고리 게시글을 일반 자유 글이 아니라 포트폴리오 프로젝트 기반 글로 발행할 수 있게 한다.
- 포트폴리오 관리 화면은 preview 중심으로 유지하고, 전체 내용은 게시글 상세에서 보게 한다.
- AI 도우미 화면을 더 깔끔한 작업 도구 흐름으로 정리한다.

진행한 것:

- `portfolio_projects.published_post_id` 컬럼을 추가했다.
- `POST /portfolio/projects/{project_id}/publish-post` API를 추가했다.
- 프로젝트 기반 포트폴리오 게시글을 생성하거나, 이미 있으면 갱신하도록 구현했다.
- 발행된 게시글은 `포트폴리오 관리` 카테고리와 프로젝트 소유자를 작성자로 사용한다.
- 포트폴리오 게시글 본문에는 프로젝트 이름, GitHub repo/branch, 기술 스택, 프로젝트 설명, 연결된 학습 기록, 최근 커밋, 코치 피드백 상태, 포트폴리오 글 전체가 포함된다.
- 포트폴리오 관리 화면에 `포트폴리오 게시글로 발행`과 `게시글로 보기` 흐름을 추가했다.
- AI 도우미 화면을 프로젝트 선택, 생성 유형 선택, 참고 자료, 생성 결과 중심으로 재작성했다.
- AI 도우미 내부 저장 필드는 기존 `savedPortfolioDraft`, `savedInterviewQuestions`를 유지했다.
- 사용자 화면 문구는 `포트폴리오 초안`보다 `포트폴리오 글` 중심으로 정리했다.

검증:

```txt
.\.venv\Scripts\python.exe -m compileall app
npm run build
init_db smoke test
publish_portfolio_post service QA with temporary data
브라우저 /ai-assistant empty state smoke test
```

결과:

- 백엔드 compile 성공
- 프론트엔드 build 성공
- `init_db()` 실행 성공
- 임시 QA 프로젝트 발행 결과 `published_post_id` 생성 확인
- 발행된 게시글 category slug가 `portfolio`인지 확인
- 발행된 게시글 본문에 포트폴리오 글 전체와 branch 정보가 포함되는지 확인
- QA 데이터 cleanup 완료
- `/ai-assistant` 화면이 에러 없이 열리고 빈 프로젝트 안내가 보이는지 확인

커밋 추천 제목:

```txt
feat: 프로젝트 기반 포트폴리오 게시글 발행 연결
```

---

## 2026-06-16 3차 작업: 포트폴리오 관리 액션 버튼 UI 정리

상태: 진행 중

목표:

- 포트폴리오 관리 화면의 버튼이 한 줄에 몰려 있어 어떤 섹션의 행동인지 알기 어려운 문제를 줄인다.
- 프로젝트 관리 행동과 섹션별 행동을 분리해 화면을 더 읽기 쉽게 만든다.

진행한 것:

- `AI 도우미에서 포트폴리오 글 만들기` 버튼을 `포트폴리오 글` 섹션 제목 옆으로 옮겼다.
- `면접 질문 만들기` 버튼을 `면접 예상 질문` 섹션 제목 옆으로 옮겼다.
- `코치 리뷰 요청하기` 버튼을 `코치 리뷰/피드백` 섹션 제목 옆으로 옮기고 중복 노출을 제거했다.
- `기록 연결하기` 버튼을 `연결된 학습 기록` 섹션 제목 옆으로 옮겼다.
- 상단 액션 줄에는 `포트폴리오 게시글로 발행`, `게시글 보러가기`, `GitHub 보기`, `GitHub 정보 새로고침`만 남겼다.
- 주요 액션 버튼은 연한 초록색 계열로 통일했다.

검증 예정:

```txt
npm run build
브라우저 /portfolio 화면 smoke test
```

커밋 추천 제목:

```txt
feat: 포트폴리오 관리 액션 버튼 UI 정리
```

완료 기록:

- `npm run build` 성공.
- `/portfolio` 브라우저 smoke에서 에러 없음 확인.
- 현재 관리자 세션에는 프로젝트가 없어 상세 버튼 DOM은 뜨지 않았고, 버튼 라벨은 소스 기준으로 확인했다.

---

## 2026-06-16 4차 작업: GitHub README 참고 정보 표시 개선

상태: 완료

목표:

- GitHub 참고 정보 영역에서 `Markdown` 배지만 보여 의미를 알기 어려운 문제를 해결한다.
- README를 핵심 결과물이 아니라 AI 참고 자료로 보이게 정리한다.

진행한 것:

- `Portfolio.tsx`의 GitHub 참고 정보에 `감지된 기술/문서 유형` 설명을 추가했다.
- `Markdown`은 README 같은 문서 파일이 감지됐다는 뜻임을 화면에서 설명한다.
- `Portfolio.tsx`의 README 접힘 영역 제목을 `GitHub README 참고 자료 보기`로 바꿨다.
- `AIAssistant.tsx`에도 README 참고 자료 접힘 영역을 추가했다.
- AI 도우미의 기술 스택 배지도 `감지된 기술/문서 유형` 라벨 아래에서 보이게 했다.

검증 예정:

```txt
npm run build
/portfolio browser smoke
/ai-assistant browser smoke
```

커밋 추천 제목:

```txt
feat: GitHub README 참고 정보 표시 개선
```

완료 기록:

- `npm run build` 성공.
- `/portfolio`, `/ai-assistant` 브라우저 smoke에서 에러 없음 확인.
- 현재 세션에는 프로젝트가 없어 README 세부 영역은 소스 라벨 기준으로 확인했다.

---

## 2026-06-16 5차 작업: 포트폴리오 게시글 상세 전용 UI 개선

상태: 완료

목표:

- 포트폴리오 게시글 상세에서 `[포트폴리오]`, `##`, `###`, `-` 같은 저장용 Markdown 기호가 그대로 보이는 문제를 해결한다.
- 일반 게시글 상세는 유지하고, 포트폴리오 게시글만 전용 UI로 정돈한다.

진행한 것:

- `PostDetail.tsx`에 `categorySlug === "portfolio"` 분기를 추가했다.
- 포트폴리오 게시글 제목은 화면에서 `[포트폴리오]` prefix를 제거하고 `프로젝트명 포트폴리오`로 표시한다.
- 저장된 Markdown 문자열을 프로젝트 개요, GitHub 정보, 기술 스택, 연결된 학습 기록, 최근 커밋 요약, 코치 피드백 상태, 포트폴리오 글로 나누어 렌더링한다.
- 일반 게시글은 기존 `whitespace-pre-line` 렌더링을 유지한다.
- 포트폴리오 상세 안에서 GitHub 링크는 전용 카드의 `GitHub 보기` 버튼으로 노출한다.

검증 예정:

```txt
npm run build
브라우저 /posts/{portfolio_post_id} smoke test
```

커밋 추천 제목:

```txt
feat: 포트폴리오 게시글 상세 UI 개선
```

완료 기록:

- `npm run build` 성공.
- `/posts/47` 포트폴리오 상세에서 `[포트폴리오]`, `## GitHub`, `###`가 보이지 않는지 확인했다.
- 프로젝트 개요, GitHub 정보, 기술 스택, 연결된 학습 기록, 최근 커밋 요약, 코치 피드백 상태, 포트폴리오 글 섹션이 모두 보이는지 확인했다.
- `/posts/1` 일반 게시글 상세가 에러 없이 열리는지 확인했다.

---

## 2026-06-16 최종 QA: 포트폴리오 UI 개선 묶음

상태: 완료

대상 커밋:

- `feat: 포트폴리오 관리 액션 버튼 UI 정리`
- `feat: GitHub README 참고 정보 표시 개선`
- `feat: 포트폴리오 게시글 상세 UI 개선`

최종 검증:

```txt
npm run build: success
backend compileall: success
/posts/47 portfolio detail smoke: success
/posts/1 normal detail smoke: success
```

확인한 것:

- 포트폴리오 관리 버튼 배치가 섹션 중심으로 정리됐다.
- GitHub README와 `Markdown` 배지 의미가 설명된다.
- 포트폴리오 상세 제목에서 `[포트폴리오]` prefix가 보이지 않는다.
- 포트폴리오 상세 본문에서 `##`, `###` 같은 Markdown 기호가 보이지 않는다.
- 일반 게시글 상세 화면은 에러 없이 열린다.

다음 작업 후보:

- 학생 계정으로 프로젝트가 있는 상태에서 `/portfolio` 섹션별 버튼 위치를 실제 화면으로 한 번 더 눈 QA한다.
- 실제 포트폴리오 글 본문을 더 풍부하게 만들기 위해 AI 연결 단계에서 출력 템플릿을 조정한다.

---

## 2026-06-16 6차 작업: 기술 스택 표시에서 Markdown 제거

상태: 완료

목표:

- README가 Markdown이라는 당연한 정보를 기술 스택처럼 보여주는 문제를 제거한다.
- 포트폴리오 관리, AI 도우미, 포트폴리오 게시글 상세에서 실제 기술 스택 중심으로 보이게 한다.

진행한 것:

- `frontend/src/app/utils/techStack.ts`에 화면 표시용 기술 스택 필터를 추가했다.
- `Markdown`, `README`, 단독 `GitHub` 값은 기술 스택 표시에서 제외한다.
- `Portfolio.tsx`, `AIAssistant.tsx`, `PostDetail.tsx`가 공통 필터를 사용하게 했다.
- 기존 저장 포트폴리오 글 본문에 남아 있던 `기술 스택 / GitHub` 단독 표시도 렌더링 단계에서 안내 문구로 바꿔 보이게 했다.

검증:

```txt
npm run build: success
/posts/47 portfolio detail smoke: success
hasBareGithubStackParagraph=false
hasMarkdownAsStack=false
```

커밋 추천 제목:

```txt
fix: 기술 스택 표시에서 Markdown 제거
```

---

## 2026-06-16 7차 작업: 포트폴리오 게시글 발행 상태 구분

상태: 완료

목표:

- 포트폴리오 게시글 목록 제목에서 `[포트폴리오]` prefix를 제거한다.
- 이미 최신 내용이면 재발행 버튼을 눌러도 DB update를 하지 않고 최신 상태 안내를 보여준다.

진행한 것:

- `publish_portfolio_post` 제목 생성 기준을 `프로젝트명 포트폴리오`로 변경했다.
- 발행 API 응답에 `publishStatus`를 추가했다.
- 발행 결과는 `created`, `updated`, `unchanged`로 구분한다.
- 기존 발행 게시글과 새 제목/요약/본문/태그/GitHub URL이 모두 같으면 update를 생략한다.
- 프론트는 `publishStatus` 값에 따라 발행/갱신/최신 상태 안내 문구를 다르게 보여준다.
- 포트폴리오 상세 제목은 기존 `[포트폴리오]` 제목과 새 `프로젝트명 포트폴리오` 제목을 모두 자연스럽게 처리한다.

검증:

```txt
backend compileall: success
npm run build: success
service QA created -> unchanged -> updated: success
QA data cleanup: success
```

커밋 추천 제목:

```txt
fix: 포트폴리오 게시글 발행 상태 구분
```

---

## 2026-06-16 작업: UX 안내 방식과 최고관리자 보호 개선

상태: 완료

목표:

- 로그인 화면을 Google 로그인 중심으로 정리했습니다.
- 화면을 밀어내던 발행/삭제 안내를 toast와 dialog 중심으로 바꿨습니다.
- 포트폴리오 게시글 발행 시 공개/비공개를 사용자가 선택하게 했습니다.
- `ADMIN_EMAILS` 최고관리자 계정의 role/status 변경을 프론트와 백엔드 양쪽에서 막았습니다.

수정 파일:

- `frontend/src/app/App.tsx`
- `frontend/src/app/pages/auth/Login.tsx`
- `frontend/src/app/pages/portfolio/Portfolio.tsx`
- `frontend/src/app/pages/posts/PostDetail.tsx`
- `frontend/src/app/pages/admin/AdminUsers.tsx`
- `frontend/src/app/api/portfolio.ts`
- `frontend/src/app/api/admin.ts`
- `backend/app/routers/portfolio.py`
- `backend/app/schemas/portfolio.py`
- `backend/app/schemas/admin.py`
- `backend/app/services/portfolio_service.py`
- `backend/app/services/admin_user_service.py`

QA 결과:

```txt
npm run build: success
backend compileall: success
git diff --check: success
portfolio_created=created public=True
portfolio_unchanged_public=unchanged
portfolio_visibility_updated=updated public=False
portfolio_unchanged_private=unchanged
portfolio_no_prefix=True
super_admin_flag=True
super_admin_blocked=True
normal_user_update=COACH 승인 완료
```

커밋 추천 제목:

```txt
feat: 포트폴리오 발행 설정과 관리자 보호 UX 개선
```
---

## 2026-06-16 작업: 포트폴리오 발행 모달 UI 정리

상태: 완료

변경 내용:

- `Portfolio.tsx`의 포트폴리오 게시글 발행 설정 모달에서 부제목 설명 문구를 제거했습니다.
- 공개/비공개 선택 카드가 기본 흰색으로 보이고, hover 또는 선택 시 연초록색으로 보이도록 조정했습니다.

검증:

```txt
npm run build: success
git diff --check: success
```

커밋 추천 제목:

```txt
style: 포트폴리오 발행 모달 선택 UI 정리
```