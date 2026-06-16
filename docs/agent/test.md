
## 2026-06-15 QA: ?? ?? ??? API

??: ?? ?? ?? ??? ?? ??? ?? ??? ??? API ???? ????? ????.

### Backend Compile

- [x] `.venv\Scripts\python.exe -m compileall app`

### TestClient QA

- [x] ?? ?? ?? ?? ?? 200
- [x] ?? ?? ?? ?? 201
- [x] ?? ? ?? ?? ?? 200
- [x] ?? ?? ??? ?? 200
- [x] ???? ?? ?? ??? ?? 403
- [x] ?? ?? ??? ?? 200
- [x] ?? ?? ? ?? ?? 400
- [x] ?? ? ?? ?? 204

?? ??:

```txt
coaches= 200 True
create= 201 ?? ?
my= 200 True
inbox= 200 True
other_inbox_total= 200 0
other_patch= 403
patch= 200 ??? ?? good work
cancel_after_review= 400
cancel_pending= 204
```

### ?? QA

- [x] `npm run build`
- [x] `git diff --check`
- [ ] ??? CoachReview ?? API ?? ? ???? QA

---

## 2026-06-15 QA: ????? ???? API

??: ????? ?? ??? ?? ??? ?? API ???? ????? ????.

### Backend Compile

- [x] `.venv\Scripts\python.exe -m compileall app`

### Frontend Build

- [x] `npm run build`

### TestClient ????? API QA

- [x] COACH `POST /portfolio/projects`? 403
- [x] STUDENT `POST /portfolio/projects`? 201
- [x] STUDENT `GET /portfolio/projects`? 200
- [x] `PATCH /portfolio/projects/{id}`? `?? ??` ?? ?? ??
- [x] `PATCH /portfolio/projects/{id}`? savedPortfolioDraft ?? ? `aiDraftSaved=True`
- [x] `PUT /portfolio/projects/{id}/posts`? ? ??? ?? ??

?? ??:

```txt
coach_create= 403
create= 201 junglelog/qa-portfolio-20260615-b
list= 200 1
patch= 200 ?? ?? True
link= 200 [17]
```

### ?? QA

- [x] `git diff --check`
- [ ] ?????? ?? ??? ? ????? ??/?? ?? ??

---

## 2026-06-15 QA: ADMIN ??? ??/?? API

??: ??? ??? mock data? ??? ?? `/admin/users` API ???? ????? ????.

### Backend Compile

- [x] `cd backend`
- [x] `.venv\Scripts\python.exe -m compileall app`
- [x] ??: ??

### Frontend Build

- [x] `cd frontend`
- [x] `npm run build`
- [x] ??: ??

### TestClient ??? API QA

- [x] STUDENT? `GET /admin/users` ?? ? 403
- [x] ADMIN? `GET /admin/users` ?? ? 200
- [x] ?? ?? ???? ??? ???
- [x] ADMIN? ?? ?? ???? `COACH / ?? ??`? ?? ??
- [x] ADMIN ?? ?? ??? 400?? ??
- [x] `user_approval_logs`? ?? ?? ??

?? ??:

```txt
student_list= 403
admin_list= 200
admin_list_contains_pending= True
approve= 200 COACH ?? ??
self_suspend= 400
approval_log_count= 1
```

### ?? QA

- [x] `git diff --check`
- [ ] ?????? ADMIN ??? ? ??? ?? ?? ?? ??

---

## 2026-06-15 QA: current_user ???/?? ??

??: ???/??/? ?? API? demo user? ??? JWT cookie? ?? ?? ??? ??? ???? ????? ????.

### Backend Compile

- [x] `cd backend`
- [x] `.venv\Scripts\python.exe -m compileall app`
- [x] ??: ??

### TestClient ?? QA

- [x] ???? `POST /posts`? 401
- [x] COACH `POST /posts`? 403
- [x] STUDENT `POST /posts`? 201
- [x] ??? ? ??? ???? 404
- [x] ??? ? ??? ?? ?? 404
- [x] ??? ? ??? ??? 200
- [x] ??? ? ??? ADMIN 200
- [x] `/me/posts?visibility=all`? ??? ??? ? ??
- [x] ??? ? ?? ???? ??? ???? ??
- [x] ??? ? ?? ??? ???? 404, ??? 200, ?? ?? 404
- [x] ?? ??? ?? ?? 403, ADMIN 204

?? ??:

```txt
anonymous_create= 401
coach_create= 403
student_create= 201
private_detail_codes= 404 404 200 200
my_posts_contains_private= True
private_comment_create= 201
private_comment_codes= 404 200 404
private_comment_delete_codes= 403 204
```

### ?? QA

- [x] `npm run build`
- [x] `git diff --check`
- [ ] ?????? ??? ? ??? ?? ?? ?? ??
- [ ] ??? ??/?? ?? API ?? ? Swagger QA

---
# QA Checklist

## 2026-06-15 QA: ??? Google OAuth ??? ?? ??

??: React ?? ?? `/auth/me` ?? ??? ???? ???/??/?? ??? ????? ????.

### Backend

- [x] `python -m compileall app` ??
- [x] `/auth/me`? cookie ?? ???? 401? ???? ?? QA ??
- [x] `/auth/google/login`? Google OAuth redirect? ???? ?? QA ??

### Frontend Build

- [x] `npm run build` ??
- [x] `AuthProvider` import/build ?? ??
- [x] `RoleGate`, `MainLayout`, `Login`, `PendingApproval` TypeScript ?? ?? ??

### Browser QA

- [x] `http://localhost:5173/login`? ???.
- [x] ??? ??? `???` ??? ???.
- [x] ??? ??? `Google? ????` ??? ???.
- [x] ??? ??? ? ??? ???? `?? ??`? ??? ??? ???.
- [x] ???? ???? `http://localhost:5173/posts`? ?? ???? `/login`?? redirect??.

### Encoding QA

- [x] ?? ?? ??? ??? ?? ?? UI ??? ?? ?? ??.
- [x] `approvalStatus === "?? ??"` ???? ??? ??? ????.
- [x] `ApprovalStatus` ??? `?? ??`, `?? ??`, `??`, `??`? ????.

### ?? QA ??

- [ ] ?? Google ???? ??? end-to-end ??
- [ ] ?? ??? ???? `?? ??`? ????? ??
- [ ] ADMIN_EMAILS ??? `ADMIN / ?? ??`? ????? ??
- [ ] current_user ?? ??? ??/?? ?? QA

---

# QA Checklist

## 2026-06-14 QA: JWT / refresh token 보안 유틸

### 확인 목표

- JWT access token이 문자열로 생성된다.
- 생성한 access token에서 user id를 다시 꺼낼 수 있다.
- refresh token 원문이 생성된다.
- refresh token hash가 DB 설계와 같은 64자 문자열이다.
- JWT 설정값이 `settings`에서 정상 로딩된다.

### 실행한 검증

- [x] `backend`: `python -m compileall app`
- [x] `create_access_token(123)` 결과 타입이 `str`
- [x] `decode_access_token(token)` 결과가 `123`
- [x] `create_refresh_token()` 결과가 충분히 긴 문자열
- [x] `hash_refresh_token(refresh)` 결과 길이가 `64`
- [x] 같은 refresh token은 같은 hash를 반환
- [x] `settings.jwt_access_token_expire_minutes`가 `15`
- [x] `settings.jwt_refresh_token_expire_days`가 `14`
- [x] `settings.auth_access_cookie_name`이 `junglelog_access_token`
- [x] `settings.auth_refresh_cookie_name`이 `junglelog_refresh_token`

### 다음 QA 후보

- 만료된 access token이 `decode_access_token()`에서 `None` 처리되는지 확인한다.
- refresh token DB 저장/조회/폐기 repository QA를 추가한다.
- `/auth/refresh` 구현 후 폐기된 refresh token 재사용이 막히는지 확인한다.

## 2026-06-14 QA: JWT refresh token 저장 구조

### 확인 목표

- `AuthRefreshToken` 모델이 SQLAlchemy metadata에 등록된다.
- `User.refresh_tokens` 관계가 깨지지 않는다.
- `init_db()` 실행 후 PostgreSQL에 `auth_refresh_tokens` 테이블이 생성된다.
- DBML과 실제 SQLAlchemy 모델의 핵심 필드가 일치한다.

### 실행할 검증

- [x] `backend`: `python -m compileall app`
- [x] SQLAlchemy `configure_mappers()` 성공
- [x] `Base.metadata.tables`에 `auth_refresh_tokens` 포함
- [x] `init_db()` 실행 성공
- [x] PostgreSQL 실제 테이블 목록에 `auth_refresh_tokens` 포함
- [x] `auth_refresh_tokens` 컬럼에 `user_id`, `token_hash`, `expires_at`, `revoked_at`, `replaced_by_token_id` 포함
- [x] `frontend`: `npm run build`
- [x] `git diff --check` 통과

### 다음 QA 후보

- `/auth/refresh` 구현 후 폐기된 refresh token으로 재발급을 시도하면 실패하는지 확인한다.
- `/auth/logout` 구현 후 `revoked_at`이 채워지는지 확인한다.
- refresh token rotation 구현 후 `replaced_by_token_id`가 연결되는지 확인한다.

## 2026-06-14 QA: 내 기록 화면 API 전환

### 확인 목표

- `GET /me/posts`가 현재 demo user의 게시글을 반환한다.
- 카테고리, 공개 범위, 검색어 query가 동작한다.
- `/my-records` 화면이 mock data가 아니라 API 응답을 렌더링한다.

### 실행한 검증

- [x] `backend`: `python -m compileall app`
- [x] `frontend`: `npm run build`
- [x] OpenAPI에 `/me/posts` `get` 등록 확인
- [x] `GET /me/posts?visibility=all&size=50` 응답 확인
- [x] `GET /me/posts?visibility=public&size=50` 응답 확인
- [x] `GET /me/posts?category=learning-log&visibility=all&size=50` 응답 확인
- [x] 임시 비공개 게시글 생성 후 `visibility=private`에서 조회 확인
- [x] 임시 비공개 게시글 삭제 정리
- [x] 브라우저에서 `/my-records` 화면 렌더링 확인
- [x] 브라우저에서 API 에러 문구와 `Unexpected Application Error` 없음 확인

### 다음 QA 후보

- JWT/OAuth2 후 실제 사용자별 `/me/posts` 분리 검증
- 비공개 글 상세 조회 권한 검증
- 검색어 한글 인코딩을 프론트 입력 기준으로 검증

## 2026-06-14 QA: 댓글 삭제 API와 상세 화면 연결

### 확인 목표

- `DELETE /comments/{comment_id}`가 soft delete 방식으로 동작한다.
- 삭제된 댓글은 게시글 댓글 목록에서 보이지 않는다.
- 프론트 상세 화면은 댓글 삭제 API 함수를 통해 state에서 댓글을 제거한다.

### 실행한 검증

- [x] `backend`: `python -m compileall app`
- [x] `frontend`: `npm run build`
- [x] `POST /posts`로 QA용 게시글 생성
- [x] `POST /posts/{post_id}/comments`로 QA용 댓글 작성
- [x] `DELETE /comments/{comment_id}`가 `204` 반환
- [x] 삭제 후 `GET /posts/{post_id}/comments`가 `total=0` 반환
- [x] `DELETE /comments/999999999`가 `404` 반환
- [x] QA용 게시글 정리 삭제 `204` 반환

### 다음 QA 후보

- JWT/OAuth2 후 댓글 작성자 본인/ADMIN 삭제 권한 검증
- 댓글 삭제 버튼이 권한 없는 사용자에게 숨겨지는지 검증
- 삭제된 댓글이 코치 피드백/알림과 연결될 때 표시 정책 검토

## 2026-06-14 QA: 게시글 삭제 API와 상세 화면 연결

### 확인 목표

- `DELETE /posts/{post_id}`가 soft delete 방식으로 동작한다.
- 삭제된 게시글은 목록, 상세, 댓글 조회에서 보이지 않는다.
- 상세 화면 삭제 버튼이 API와 연결되어 있고 삭제 후 목록으로 이동한다.

### 실행한 검증

- [x] `backend`: `python -m compileall app`
- [x] `frontend`: `npm run build`
- [x] `POST /posts`로 테스트 게시글 생성
- [x] `DELETE /posts/{created_id}`가 `204` 반환
- [x] 삭제 후 `GET /posts/{created_id}`가 `404` 반환
- [x] 삭제 후 `GET /posts?keyword=테스트제목`이 `total=0` 반환
- [x] `DELETE /posts/999999999`가 `404` 반환
- [x] 삭제된 게시글의 `GET /posts/{id}/comments`가 `404` 반환
- [x] 브라우저에서 상세 화면 삭제 확인 UI 표시
- [x] 브라우저에서 삭제 확인 후 `/posts`로 이동
- [x] 브라우저에서 `Unexpected Application Error` 없음

### 자체 QA에서 발견한 점

- `Invoke-WebRequest`는 `204 No Content` 응답을 받을 때 PowerShell 환경에서 내부 예외를 낼 수 있다.
- API 자체는 `curl.exe -w "%{http_code}"`로 `204`가 확인되었다.

### 다음 QA 후보

- 댓글 삭제 API 구현 후 `DELETE /comments/{comment_id}` 검증
- JWT/OAuth2 후 작성자/관리자 삭제 권한 검증
- 삭제된 게시글이 포트폴리오 연결, 코치 리뷰 요청에서 어떻게 보일지 정책 검토

## 2026-06-14 게시글 수정 API와 수정 화면 연결 QA

이번 QA는 `PATCH /posts/{post_id}`와 `/posts/:id/edit` 화면이 실제 API 흐름으로 연결되는지 검증한다.

### Backend

- [x] `python -m compileall app`가 성공한다.
- [x] `PATCH /posts/{post_id}` endpoint가 추가되어 있다.
- [x] `POST /posts`로 테스트 게시글을 생성할 수 있다.
- [x] 생성한 게시글을 `PATCH /posts/{id}`로 수정할 수 있다.
- [x] 수정 응답의 `title`, `content`, `categorySlug`, `tags`가 수정 payload를 반영한다.
- [x] `GET /posts/{id}`로 다시 조회했을 때 수정된 값이 유지된다.
- [x] 없는 게시글 id를 수정하면 `404`를 반환한다.
- [x] 공백 제목으로 수정하면 `400`을 반환한다.
- [x] 게시글 수정 시 기존 `post_tags` 연결이 새 태그 목록으로 교체된다.

### Frontend

- [x] `npm run build`가 성공한다.
- [x] `/posts/:id/edit`가 `GET /posts/{id}` 응답으로 form state를 채운다.
- [x] 수정 화면 제목이 `게시글 수정`으로 보인다.
- [x] 제목 input에 API 응답 제목이 들어간다.
- [x] 본문 textarea에 API 응답 content가 들어간다.
- [x] 카테고리 select가 API 응답 category label을 반영한다.
- [x] 수정 완료 버튼이 `updatePost()`를 호출하도록 연결되어 있다.
- [x] 화면에 `Unexpected Application Error`가 없다.

### 남은 QA

- [ ] 브라우저에서 직접 수정 완료 버튼을 눌러 상세 화면으로 이동하는 흐름을 수동 확인한다.
- [ ] 삭제 API 구현 후 상세 화면의 삭제 버튼과 함께 CRUD 전체 흐름을 다시 확인한다.
- [ ] JWT/OAuth2 구현 후 작성자 본인/관리자만 수정 가능한지 확인한다.

## 2026-06-14 게시글 목록/상세 API 전환 QA

이번 QA는 프론트 `/posts`, `/posts/{id}` 화면이 백엔드 조회 API 응답을 기준으로 렌더링되는지 검증한다.

### Backend API

- [x] `GET /posts?size=5`가 게시글 목록을 반환한다.
- [x] `GET /posts?size=5` 응답에 생성된 게시글 id `4`가 포함된다.
- [x] `GET /posts/4`가 상세 응답을 반환한다.
- [x] `GET /posts/4` 응답에 `post create api content`가 포함된다.

### Frontend

- [x] `npm run build`가 성공한다.
- [x] `/posts` 화면이 `GET /posts` 응답을 렌더링한다.
- [x] `/posts` 화면에서 `post create api test`가 보인다.
- [x] `/posts/4` 화면이 `GET /posts/4` 응답을 렌더링한다.
- [x] `/posts/4` 화면에서 `post create api content`가 보인다.
- [x] 화면에 `Unexpected Application Error`가 없다.

### 남은 QA

- [ ] 검색창 입력을 브라우저에서 직접 조작해 백엔드 keyword query가 반영되는지 확인한다.
- [ ] 카테고리 탭 클릭을 브라우저에서 직접 조작해 category query가 반영되는지 확인한다.
- [ ] 게시글 수정/삭제 API 구현 후 상세 화면의 수정/삭제 버튼을 다시 검증한다.

## 2026-06-14 게시글 작성 API QA

이번 QA는 `POST /posts`와 `/posts/new` 프론트 연결을 검증한다.

### Backend

- [x] `python -m compileall app`가 성공한다.
- [x] OpenAPI `/openapi.json`에서 `/posts` 경로에 `get`, `post` 메서드가 모두 보인다.
- [x] `POST /posts`가 `201 Created`로 게시글을 생성한다.
- [x] 생성된 게시글이 `GET /posts?keyword=...`에서 조회된다.
- [x] 없는 `categorySlug`로 작성하면 `404`를 반환한다.
- [x] 공백 제목/본문으로 작성하면 `400`을 반환한다.

### Frontend

- [x] `npm run build`가 성공한다.
- [x] `/posts/new` 발행 버튼이 `createPost` API를 호출한다.
- [x] 발행 중에는 버튼 문구가 `발행 중`으로 바뀔 수 있다.
- [x] 작성 성공 시 생성된 게시글 id가 notice에 표시된다.
- [x] 수정 모드는 아직 mock으로 남아 있음을 코드와 문서에 구분했다.

### 남은 QA

- [ ] 브라우저에서 `/posts/new`를 열고 실제 발행 버튼을 눌러 확인한다.
- [ ] 목록/상세 화면을 API로 전환한 뒤 생성된 글이 UI에 보이는지 확인한다.
- [ ] JWT/OAuth2 구현 후 작성자가 현재 로그인 사용자로 저장되는지 확인한다.

## 2026-06-13 댓글 작성 API QA

이번 QA는 `POST /posts/{post_id}/comments`와 게시글 상세 프론트 연결을 검증한다.

### Backend

- [x] `python -m compileall app`가 성공한다.
- [x] OpenAPI `/openapi.json`에서 `/posts/{post_id}/comments` 경로가 보인다.
- [x] `/posts/{post_id}/comments` 경로에 `get`, `post` 메서드가 모두 등록되어 있다.
- [x] `POST /posts/1/comments`가 `201 Created`로 댓글을 생성한다.
- [x] `GET /posts/1/comments`가 방금 생성한 댓글을 포함한다.
- [x] `POST /posts/999999/comments`가 `404`를 반환한다.
- [x] 공백 댓글 `{"content":"   "}`가 `400`을 반환한다.

### Frontend

- [x] `npm run build`가 성공한다.
- [x] `PostDetail.tsx`에서 댓글 작성 버튼이 local mock 추가가 아니라 `createPostComment`를 호출한다.
- [x] 댓글 작성 중 버튼 문구가 `작성 중`으로 바뀔 수 있다.
- [x] 댓글 작성 실패 시 사용자에게 에러 문구가 보인다.

### 남은 QA

- [ ] 브라우저에서 `/posts/1` 접속 후 댓글 작성 버튼을 직접 눌러 확인한다.
- [ ] JWT/OAuth2 구현 후 댓글 작성자가 현재 로그인 사용자로 저장되는지 확인한다.
- [ ] 댓글 삭제 API 구현 후 본인 댓글/관리자 권한을 확인한다.

이 문서는 문제를 기록하는 문서가 아니라, Codex가 구현 후 스스로 반복 검증하기 위한 QA 체크리스트다.
검증 중 실제 문제가 발견되면 원인과 해결 과정은 [troubleshooting.md](troubleshooting.md)에 기록한다.

## 사용 방식

1. 구현한 기능과 관련된 체크리스트를 먼저 고른다.
2. 예상 결과와 실제 결과를 비교한다.
3. 불일치가 있으면 원인을 추적한다.
4. 수정 후 같은 체크리스트를 다시 실행한다.
5. 실제 문제와 해결 과정은 `troubleshooting.md`에 남긴다.

## 공통 QA 루프

- [ ] 현재 단계의 완료 기준을 `log.md`에서 확인했다.
- [ ] 관련 문서와 코드 컨벤션을 확인했다.
- [ ] 구현한 기능의 정상 케이스를 직접 실행했다.
- [ ] 입력값 누락, 빈 목록, 잘못된 id 같은 실패 케이스를 확인했다.
- [ ] 실제 응답과 문서/화면에 표시된 schema가 일치하는지 확인했다.
- [ ] 같은 endpoint, route, button action이 중복 등록되어 있지 않은지 확인했다.
- [ ] 변경 후 빌드 또는 서버 실행 검증을 했다.

## Frontend QA

### 라우트 / 화면

- [ ] `/`가 STUDENT / COACH role에 맞는 대시보드를 보여준다.
- [ ] `/`가 ADMIN role에서 `/admin/users` 사용자 승인 화면으로 이동한다.
- [ ] `/login`이 Google 로그인 mock 화면으로 열린다.
- [ ] `/login`에서 Google로 계속하기를 누르면 `STUDENT / 승인 대기` mock 상태로 `/pending-approval`에 이동한다.
- [ ] `/signup` 라우트와 화면이 남아 있지 않다.
- [ ] 인증 화면에 이메일/비밀번호 입력 폼이 남아 있지 않다.
- [ ] `/pending-approval`이 승인 대기/거절/정지 상태 안내를 보여준다.
- [ ] `/admin/users`가 ADMIN role에서 열린다.
- [ ] `/admin/users`가 STUDENT / COACH role에서는 접근 제한된다.
- [ ] 승인 상태가 `승인 대기`, `거절`, `정지`이면 주요 서비스 화면 접근이 제한된다.
- [ ] 승인 상태 문제는 "서비스 사용 승인이 필요합니다" 문구로 안내된다.
- [ ] 승인 완료 후 role이 맞지 않는 화면은 "현재 역할로 접근할 수 없는 화면입니다" 문구로 안내된다.
- [ ] `/posts`가 빈 화면이나 Unexpected Application Error 없이 열린다.
- [ ] `/posts?category=learning-log`가 카테고리 필터를 반영한다.
- [ ] `/posts/:id`가 URL id에 맞는 게시글 상세를 보여준다.
- [ ] `/posts/new`가 학생 role에서 열린다.
- [ ] `/posts/:id/edit`가 기존 게시글 데이터를 작성 폼에 반영한다.
- [ ] `/my-records`가 학생 role에서 열린다.
- [ ] `/portfolio`가 학생 role에서 열린다.
- [ ] `/ai-assistant`가 학생 role에서 열린다.
- [ ] `/coach-review`가 STUDENT / COACH role에 따라 다른 화면을 보여준다.
- [ ] `/settings`가 열린다.

### 화면 동작

- [ ] 알림 아이콘 클릭 시 알림 드롭다운이 열린다.
- [ ] 헤더에 동작하지 않는 전역 검색 UI가 남아 있지 않다.
- [ ] 대시보드 CTA가 의도한 라우트로 이동한다.
- [ ] 게시글 카테고리 탭이 목록을 실제로 필터링한다.
- [ ] 게시글 검색이 제목, 요약, 태그, 카테고리, 작성자 기준으로 동작한다.
- [ ] 게시글 작성 mock 동작이 안내 문구와 라우트 이동을 수행한다.
- [ ] 게시글 수정 mock 동작이 안내 문구와 라우트 이동을 수행한다.
- [ ] 게시글 삭제 mock 동작이 확인 후 목록으로 이동한다.
- [ ] 댓글 작성 mock 동작이 현재 상세 화면에 댓글을 추가한다.
- [ ] 내 기록 필터와 검색이 목록을 실제로 바꾼다.
- [ ] 포트폴리오 프로젝트 카드를 선택하면 상세 패널이 바뀐다.
- [ ] 기록 연결하기가 현재 프로젝트의 연결 기록을 바꾼다.
- [ ] AI 도우미가 선택한 프로젝트의 정보를 참고 자료로 보여준다.
- [ ] 학생은 본인이 보낸 코치 리뷰 요청만 본다.
- [ ] 코치는 mock `currentCoachId`에 배정된 리뷰 요청만 본다.
- [ ] 코치 피드백 전송 후 학생 요청 목록에서 상태와 피드백이 확인된다.
- [ ] 관리자 사용자 승인 화면에서 승인/거절/정지/role 변경 mock 동작이 화면에 반영된다.
- [ ] 관리자 사용자 승인 화면에서 role select만 변경해도 즉시 승인되지 않고, `승인 적용`을 눌러야 role과 승인 완료 상태가 함께 반영된다.
- [ ] 사이드바의 role/승인상태 전환기는 개발용 mock UI임을 안내한다.
- [ ] ADMIN 사이드바에는 사용자 승인 메뉴만 보인다.
- [ ] ADMIN은 URL 직접 접근으로 게시글/포트폴리오/코치 리뷰 요청을 확인할 수 있다.
- [ ] COACH는 학생 전용 화면과 관리자 화면에 접근할 수 없다.

### 프론트 빌드

- [ ] `npm run build`가 성공한다.
- [ ] unused import나 TypeScript 오류가 없다.

## Backend QA

### API Design

- [ ] `docs/agent/api-design.md`에 현재 구현할 endpoint가 먼저 정리되어 있다.
- [ ] 각 endpoint의 method, path, query, response가 설명되어 있다.
- [ ] 없는 데이터, 권한 없음, 인증 필요 같은 실패 케이스가 status code로 구분되어 있다.
- [ ] API 문서의 응답 필드와 Pydantic schema 필드가 일치한다.
- [ ] DB 컬럼 이름과 프론트 응답 이름이 다를 때 변환 기준이 문서화되어 있다.

### FastAPI 서버 기본

- [ ] `.venv`가 활성화된 상태에서 명령을 실행하고 있다.
- [ ] `python --version`이 안정 버전 Python을 가리킨다.
- [ ] `pip --version` 경로가 `backend/.venv` 안을 가리킨다.
- [ ] `requirements.txt`에 설치한 백엔드 패키지가 기록되어 있다.
- [ ] `uvicorn app.main:app --reload` 또는 `python -m uvicorn app.main:app --reload`로 서버가 실행된다.
- [ ] 서버 실행 중 import error가 없다.

### Health API

- [ ] `GET http://127.0.0.1:8000/health`가 HTTP 200을 반환한다.
- [ ] 실제 `/health` 응답이 `HealthResponse` schema와 일치한다.
- [ ] `/docs`에서 `/health` endpoint가 보인다.
- [ ] `/docs`의 example/schema에 `status`, `service` 필드가 보인다.
- [ ] `main.py`에 직접 등록한 중복 `/health` endpoint가 없다.
- [ ] `app.include_router(health_router)`로 health router가 등록되어 있다.

### CORS

- [ ] `CORSMiddleware`가 `main.py`에 등록되어 있다.
- [ ] `allow_origins`에 `http://localhost:5173`이 포함되어 있다.
- [ ] `allow_methods` 철자가 정확하다.
- [ ] `allow_headers` 철자가 정확하다.

### Configuration

- [ ] `backend/.env`가 로컬 설정값을 가진다.
- [ ] `backend/.env`는 Git에 올라가지 않는다.
- [ ] `backend/.env.example`이 팀원이 따라 만들 수 있는 샘플 값을 가진다.
- [ ] `backend/app/core/config.py`가 `BaseSettings`로 설정을 읽는다.
- [ ] `main.py`가 하드코딩 대신 `settings.app_name`을 사용한다.
- [ ] `main.py`가 하드코딩 대신 `settings.backend_cors_origins`를 사용한다.

### PostgreSQL Docker

- [ ] `docker --version`이 정상 출력된다.
- [ ] `docker compose version`이 정상 출력된다.
- [ ] `docker compose up -d`로 `junglelog-postgres` 컨테이너가 실행된다.
- [ ] `docker ps`에서 `junglelog-postgres`가 `Up` 상태로 보인다.
- [ ] `docker ps`에서 `0.0.0.0:5432->5432/tcp` 포트 매핑이 보인다.
- [ ] `docker logs junglelog-postgres`에 `database system is ready to accept connections`가 보인다.
- [ ] `postgres_data` volume이 생성되어 DB 데이터가 컨테이너 재시작 후에도 유지될 준비가 되어 있다.

### Database Connection

- [ ] `backend/.env`와 `backend/.env.example`에 `DATABASE_URL`이 있다.
- [ ] `backend/app/core/config.py`가 `database_url` 설정을 읽는다.
- [ ] `backend/app/db/session.py`가 SQLAlchemy `engine`을 만든다.
- [ ] `backend/app/db/session.py`가 `SessionLocal`을 만든다.
- [ ] `backend/app/db/session.py`가 `get_db()` dependency를 제공한다.
- [ ] `GET http://127.0.0.1:8000/health/db`가 HTTP 200을 반환한다.
- [ ] 실제 `/health/db` 응답이 `DatabaseHealthResponse` schema와 일치한다.
- [ ] `/docs` 또는 `/openapi.json`에 `/health/db` endpoint가 보인다.
- [ ] `python -m compileall app` 또는 동일한 백엔드 import 검증이 성공한다.

### Posts Read API

- [ ] `docs/agent/api-design.md`에 `GET /posts`가 정리되어 있다.
- [ ] `docs/agent/api-design.md`에 `GET /posts/{post_id}`가 정리되어 있다.
- [ ] `backend/app/schemas/post.py`에 게시글 목록/상세 response schema가 있다.
- [ ] `backend/app/repositories/post_repository.py`가 게시글 DB 조회를 담당한다.
- [ ] `backend/app/services/post_service.py`가 DB 모델을 API 응답 schema로 변환한다.
- [ ] `backend/app/routers/posts.py`가 `/posts` router를 등록한다.
- [ ] `backend/app/main.py`가 posts router를 include한다.
- [ ] `GET /posts`가 HTTP 200을 반환한다.
- [ ] `GET /posts` 응답에 `items`, `total`, `page`, `size`가 있다.
- [ ] `GET /posts?category=learning-log`가 카테고리 필터를 적용한다.
- [ ] `GET /posts?keyword=JWT`가 검색어 필터를 적용한다.
- [ ] `GET /posts/{post_id}`가 id에 맞는 게시글 상세를 반환한다.
- [ ] 없는 게시글 id는 HTTP 404를 반환한다.
- [ ] `/docs`에서 posts endpoint와 schema가 보인다.

### DB Design

- [ ] `docs/agent/db-design.md`에 ERD v1 테이블 목록이 있다.
- [ ] `users` 테이블에 `google_sub`, `role`, `approval_status`가 있다.
- [ ] `role`과 `approval_status`의 의미가 문서에서 분리되어 있다.
- [ ] `user_approval_logs`에 `action`, `before_role`, `after_role`, `before_status`, `after_status`가 있다.
- [ ] 초기 관리자 자동 생성을 위해 `user_approval_logs.actor_id`가 비어 있을 수 있음을 문서화했다.
- [ ] 모든 v1 테이블의 필드 의미와 타입 선택 이유가 `db-design.md`에 설명되어 있다.
- [ ] `post_categories`가 `posts.category_id`, `review_requests.category_id`와 연결된다는 설명이 있다.
- [ ] dbdiagram.io 그림이 복잡해 보일 때 테이블을 어떻게 배치하면 좋은지 설명되어 있다.
- [ ] `review_requests.status`에 `대기 중`, `검토 중`, `수정 요청`, `피드백 완료`, `최종 확인` 상태가 문서화되어 있다.
- [ ] v1에서 미루는 AI/RAG/MCP/Agent 테이블이 별도로 구분되어 있다.

## 문서 QA

- [ ] `agent.md`의 문서 목록이 실제 파일과 일치한다.
- [ ] `log.md`의 현재 단계가 실제 진행 단계와 일치한다.
- [ ] `study.md`에 이번 구현을 이해하기 위한 개념이 정리되어 있다.
- [ ] `front-keyword.md` 또는 `back-keyword.md`에 새 키워드가 연결되어 있다.
- [ ] 실제 발견한 문제는 `troubleshooting.md`에 기록되어 있다.
- [ ] README의 실행 방법과 현재 구현 상태가 오래되지 않았다.

## 2026-06-13 API 설계와 게시글 조회 API QA

목표: 4단계 1차로 API 설계 문서를 만들고 게시글 목록/상세 조회 API가 설계와 일치하는지 확인한다.

- [x] `docs/agent/api-design.md`가 있다.
- [x] `GET /posts` 설계가 query와 response 예시를 포함한다.
- [x] `GET /posts/{post_id}` 설계가 404 케이스를 포함한다.
- [x] `backend/app/schemas/post.py`가 있다.
- [x] `backend/app/routers/posts.py`가 있다.
- [x] `backend/app/main.py`에서 posts router를 등록한다.
- [x] 개발용 seed 실행 후 `GET /posts`가 demo 게시글을 반환한다.
- [x] 카테고리 필터가 동작한다.
- [x] 검색어 필터가 동작한다.
- [x] 없는 id 조회가 404를 반환한다.
- [x] OpenAPI schema에 `/posts`, `/posts/{post_id}`가 등록되어 있다.
- [x] `python -m compileall app`이 성공한다.
- [x] `npm run build`가 성공한다.

검증 결과:

```txt
GET /posts -> 200, total=3
GET /posts/{first_id} -> 200
GET /posts?category=learning-log -> 200, total=1
GET /posts?keyword=JWT -> 200, total=1
GET /posts/999999 -> 404
```

## 2026-06-13 게시글 조회 API 주석 추가 QA

목표: 학습용 주석 추가 후 기능이 깨지지 않았는지 확인한다.

- [x] `backend/app/main.py`에 router 등록 흐름 설명이 있다.
- [x] `backend/app/routers/posts.py`에 query/path parameter 설명이 있다.
- [x] `backend/app/services/post_service.py`에 service 역할과 응답 조립 흐름 설명이 있다.
- [x] `backend/app/repositories/post_repository.py`에 SQLAlchemy query 흐름 설명이 있다.
- [x] `backend/app/schemas/post.py`에 Pydantic schema와 alias 설명이 있다.
- [x] `backend/app/db/init_db.py`에 create_all과 seed 흐름 설명이 있다.
- [x] `python -m compileall app`이 성공한다.
- [x] `npm run build`가 성공한다.

## 2026-06-13 ERD v1 12개 모델 QA

목표: DB 설계 문서의 v1 테이블 12개가 SQLAlchemy 모델과 실제 PostgreSQL 테이블로 모두 반영됐는지 확인한다.

- [x] `backend/app/db/models/user_approval_log.py`가 있다.
- [x] `backend/app/db/models/portfolio_project.py`가 있다.
- [x] `backend/app/db/models/portfolio_project_post.py`가 있다.
- [x] `backend/app/db/models/review_request.py`가 있다.
- [x] `backend/app/db/models/review_request_coach.py`가 있다.
- [x] `backend/app/db/models/notification.py`가 있다.
- [x] `backend/app/db/models/__init__.py`에서 새 모델 6개를 import한다.
- [x] `User` 모델에 승인 이력, 포트폴리오 프로젝트, 리뷰 요청, 알림 관계가 있다.
- [x] `Post` 모델에 포트폴리오 연결, 리뷰 요청 관계가 있다.
- [x] `PostCategory` 모델에 리뷰 요청 관계가 있다.
- [x] `python -m compileall app`이 성공한다.
- [x] SQLAlchemy `configure_mappers()`가 성공한다.
- [x] `init_db()` 실행이 성공한다.
- [x] 실제 PostgreSQL 테이블 개수가 12개다.

확인한 테이블:

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

## 2026-06-13 댓글 조회 API와 프론트 연결 QA

목표: 게시글 상세 화면이 백엔드 댓글 조회 API를 호출하고, 댓글 API가 설계한 응답을 반환하는지 확인한다.

- [x] `backend/app/schemas/comment.py`에 댓글 응답 schema가 있다.
- [x] `backend/app/repositories/comment_repository.py`가 게시글 존재 확인과 댓글 목록 조회를 담당한다.
- [x] `backend/app/services/comment_service.py`가 댓글 응답을 조립한다.
- [x] `backend/app/routers/comments.py`가 `/posts/{post_id}/comments` endpoint를 등록한다.
- [x] `backend/app/main.py`가 comments router를 include한다.
- [x] OpenAPI path에 `/posts/{post_id}/comments`가 보인다.
- [x] `GET /posts/1/comments`가 HTTP 200을 반환한다.
- [x] 댓글이 없을 때 `items: []`, `total: 0` 형태를 반환한다.
- [x] `GET /posts/999999/comments`가 HTTP 404를 반환한다.
- [x] `frontend/src/app/api/comments.ts`가 댓글 API 호출을 담당한다.
- [x] `PostDetail.tsx`가 댓글 API 응답을 comments state로 변환한다.
- [x] `useEffect` dependency가 댓글 state가 아니라 게시글 id 기준이다.
- [x] CORS 응답 header가 `http://localhost:5173`을 허용한다.
- [x] `python -m compileall app`이 성공한다.
- [x] `npm run build`가 성공한다.

## 2026-06-12 DB 설계와 현재 화면 매핑 QA

목표: 현재 React mock 화면에서 쓰는 데이터가 ERD v1에 저장될 수 있는지 확인한다.

### QA 결과 요약

- [x] Google 로그인/관리자 승인 화면은 `users`, `user_approval_logs`로 설명된다.
- [x] STUDENT/COACH/ADMIN 역할 구분은 `users.role`로 설명된다.
- [x] 승인 대기/승인 완료/거절/정지는 `users.approval_status`로 설명된다.
- [x] 전체 게시글/내 기록/게시글 상세/작성/수정 화면은 `posts`, `post_categories`, `tags`, `post_tags`, `comments`, `users`로 설명된다.
- [x] 게시글 카테고리 필터는 `post_categories.slug`와 `posts.category_id`로 설명된다.
- [x] 게시글 태그 검색은 `tags`, `post_tags`로 설명된다.
- [x] 댓글 작성 화면은 `comments.post_id`, `comments.author_id`, `comments.content`로 설명된다.
- [x] 포트폴리오 프로젝트 등록/조회 화면은 `portfolio_projects`로 설명된다.
- [x] 포트폴리오 프로젝트와 내 기록 연결은 `portfolio_project_posts`로 설명된다.
- [x] 코치 리뷰 요청 생성/인박스/피드백 상태 변경은 `review_requests`, `review_request_coaches`로 설명된다.
- [x] 알림 드롭다운은 `notifications`로 설명된다.
- [x] `requesterName`, `coachNames`, `targetTitle`, `linkedRecordCount`, `comments` 수는 DB에 중복 저장하지 않고 JOIN 또는 count 결과로 만든다.
- [x] `MockPost.relatedCommit` 저장 위치가 애매해서 `posts.related_commit text`를 DBML에 추가했다.
- [x] `PortfolioProject.summary` 저장 위치가 애매해서 `portfolio_projects.summary text`를 DBML에 추가했다.
- [x] `contentSections`는 v1에서 `posts.content text`에 Markdown/본문 문자열로 저장하고, 구조화 저장은 v2에서 검토한다.

### 화면별 DB 매핑

| 화면 | 필요한 데이터 | 대응 테이블 |
| --- | --- | --- |
| 로그인/승인 대기 | Google 계정, role, 승인 상태 | `users` |
| 관리자 사용자 승인 | 사용자 승인 상태 변경, 변경 이력 | `users`, `user_approval_logs` |
| 전체 게시글 | 제목, 작성자, 카테고리, 태그, 조회수 | `posts`, `users`, `post_categories`, `tags`, `post_tags` |
| 게시글 상세 | 본문, 댓글, 연결 커밋 | `posts`, `comments`, `posts.related_commit` |
| 내 기록 | 내 게시글 목록, 공개 여부, 검색/필터 | `posts`, `post_categories`, `tags`, `post_tags` |
| 포트폴리오 관리 | GitHub repo, 기술 스택, 포트폴리오 초안, 상태 | `portfolio_projects` |
| 기록 연결하기 | 프로젝트와 게시글 연결 | `portfolio_project_posts` |
| AI 도우미 | 선택 프로젝트, 연결 기록, 저장된 초안 | `portfolio_projects`, `portfolio_project_posts`, `posts` |
| 코치 리뷰 요청 | 요청자, 대상 글/프로젝트, 담당 코치, 피드백 | `review_requests`, `review_request_coaches` |
| 알림 | 알림 메시지, 링크, 읽음 여부 | `notifications` |

### QA 판단

현재 ERD v1은 React mock 화면의 핵심 기능을 구현하기에 충분하다.
다만 실제 AI/RAG/MCP/Agent 실행 기록과 GitHub commit 상세 로그는 v1에서 일부러 제외했고, 기본 CRUD와 포트폴리오/코치 리뷰 저장이 안정화된 뒤 v2 테이블로 추가한다.

## 2026-06-12 DB 필드별 선언 이유 문서 QA

목표: ERD v1을 보면서 학습할 수 있도록 각 테이블 필드가 왜 필요한지 설명되어 있는지 확인한다.

- [x] `users` 필드별 선언 이유가 정리되어 있다.
- [x] `user_approval_logs` 필드별 선언 이유가 정리되어 있다.
- [x] `post_categories` 필드별 선언 이유가 정리되어 있다.
- [x] `posts` 필드별 선언 이유가 정리되어 있다.
- [x] `comments` 필드별 선언 이유가 정리되어 있다.
- [x] `tags` 필드별 선언 이유가 정리되어 있다.
- [x] `post_tags` 연결 테이블의 필요 이유가 정리되어 있다.
- [x] `portfolio_projects` 필드별 선언 이유가 정리되어 있다.
- [x] `portfolio_project_posts` 연결 테이블의 필요 이유가 정리되어 있다.
- [x] `review_requests` 필드별 선언 이유가 정리되어 있다.
- [x] `review_request_coaches` 연결 테이블의 필요 이유가 정리되어 있다.
- [x] `notifications` 필드별 선언 이유가 정리되어 있다.
- [x] 화면에는 보이지만 DB에 저장하지 않고 JOIN/count로 만드는 값이 따로 정리되어 있다.

결론: `db-design.md`의 `2026-06-12 필드별 선언 이유 학습표`를 기준으로 SQLAlchemy model을 만들면 된다.

## 2026-06-12 DB 설계와 프론트 mock data 재점검 QA

목표: `db-design.md`의 ERD v1이 현재 프론트엔드 mock 화면과 실제 API 연결 시 자연스럽게 이어지는지 다시 확인한다.

### 결론

- [x] 현재 DB 설계는 프론트엔드 주요 화면과 연결 가능하다.
- [x] 테이블을 추가로 늘릴 필요는 없다.
- [x] `posts.related_commit`, `portfolio_projects.summary` 보정 이후 프론트 mock 필드 중 저장 위치가 없는 핵심 값은 없다.
- [x] 일부 프론트 필드는 DB 컬럼이 아니라 JOIN/count/프론트 상수/API 응답 변환으로 만들어야 한다.

### 프론트 필드와 DB 연결 판단

| 프론트 필드 | DB 연결 방식 | 판단 |
| --- | --- | --- |
| `UserAccount.role` | `users.role` | 적절함 |
| `UserAccount.approvalStatus` | `users.approval_status` | 적절함 |
| `UserAccount.requestedAt` | `users.created_at` | 별도 컬럼 불필요 |
| `UserAccount.approvedAt` | `users.approved_at` | 적절함 |
| `UserAccount.approvedBy` | `users.approved_by -> users.name` | 문자열 저장보다 JOIN이 맞음 |
| `Category.slug` | `post_categories.slug` | 적절함 |
| `Category.label` | `post_categories.label` | 적절함 |
| `Category.count` | `posts` count 결과 | 별도 컬럼 불필요 |
| `Category.icon`, `Category.color` | 프론트 상수 | DB 컬럼 불필요 |
| `MockPost.author` | `posts.author_id -> users.name` | 문자열 저장보다 JOIN이 맞음 |
| `MockPost.categorySlug` | `posts.category_id -> post_categories.slug` | 적절함 |
| `MockPost.tags` | `post_tags -> tags` | 적절함 |
| `MockPost.comments` | `comments` count 결과 | 별도 컬럼 불필요 |
| `MockPost.views` | `posts.view_count` | 적절함 |
| `MockPost.contentSections` | `posts.content` Markdown/본문 문자열 | v1에서는 적절함, 구조화는 v2 |
| `MockPost.relatedCommit` | `posts.related_commit` | 보정 후 적절함 |
| `PortfolioProject.repo` | `portfolio_projects.repo_full_name` | 적절함 |
| `PortfolioProject.githubUrl` | `portfolio_projects.github_url` | 적절함 |
| `PortfolioProject.stack` | `portfolio_projects.tech_stack` text | v1에서는 적절함, 고급 검색은 v2 |
| `PortfolioProject.linkedPostIds` | `portfolio_project_posts` | 적절함 |
| `PortfolioProject.linkedRecordCount` | `portfolio_project_posts` count 결과 | 별도 컬럼 불필요 |
| `PortfolioProject.summary` | `portfolio_projects.summary` | 보정 후 적절함 |
| `ReviewRequest.coachIds` | `review_request_coaches.coach_id` | 적절함 |
| `ReviewRequest.coachNames` | `review_request_coaches -> users.name` | 문자열 저장보다 JOIN이 맞음 |
| `ReviewRequest.targetTitle` | `posts.title` 또는 `portfolio_projects.title` | JOIN으로 만드는 값 |
| `ReviewRequest.status` | `review_requests.status` | 적절함 |
| `notifications.time` | `notifications.created_at`에서 계산 | 별도 컬럼 불필요 |

### 주의할 점

- API 응답을 만들 때 DB 컬럼 이름과 프론트 mock 이름이 1:1로 같지는 않다. 예: `view_count -> views`, `is_public -> isPublic`, `repo_full_name -> repo`.
- `contentSections`를 배열 형태로 계속 쓰고 싶으면 백엔드에서 Markdown 문자열을 section 배열로 변환하거나, v2에서 `post_sections` 테이블 또는 JSON 컬럼을 검토해야 한다.
- `tech_stack`은 v1에서 text로 충분하지만, 기술 스택별 검색/통계가 중요해지면 `project_tech_stacks` 같은 분리 테이블을 검토한다.
- `frontend/src/app/components/Layout.tsx`에 `/interviews`가 남아 있지만 현재 라우트에서 쓰이지 않는 오래된 컴포넌트로 보이며 DB 설계 문제는 아니다.

## 2026-06-13 SQLAlchemy 모델 1차 QA

목표: ERD v1의 핵심 테이블 3개가 SQLAlchemy 모델 코드로 선언되었는지 확인한다.

- [x] `backend/app/db/models/user.py`에 `User` 모델이 있다.
- [x] `User.__tablename__`은 `users`다.
- [x] `User` 모델에 `email`, `google_sub`, `name`, `role`, `approval_status`가 있다.
- [x] `User` 모델에 `approved_by`, `approved_at`, `approval_note`가 있다.
- [x] `backend/app/db/models/post_category.py`에 `PostCategory` 모델이 있다.
- [x] `PostCategory.__tablename__`은 `post_categories`다.
- [x] `PostCategory` 모델에 `slug`, `label`이 있다.
- [x] `backend/app/db/models/post.py`에 `Post` 모델이 있다.
- [x] `Post.__tablename__`은 `posts`다.
- [x] `Post` 모델에 `author_id`, `category_id`, `title`, `summary`, `content`, `related_commit`, `is_public`, `view_count`가 있다.
- [x] `Post.author_id`는 `users.id`를 참조한다.
- [x] `Post.category_id`는 `post_categories.id`를 참조한다.
- [x] `backend/app/db/models/__init__.py`에서 `User`, `PostCategory`, `Post`를 import한다.
- [x] 가상환경 Python 기준 `python -m compileall app`이 성공한다.
- [x] `Base.metadata.tables`에 `users`, `post_categories`, `posts`가 등록된다.

주의: 시스템 Python이 아니라 `backend/.venv`의 Python으로 검증해야 SQLAlchemy import가 정상 동작한다.

## 2026-06-13 DB 초기화와 seed QA

목표: SQLAlchemy 모델 기준으로 실제 PostgreSQL 테이블이 생성되고 기본 카테고리 seed가 들어가는지 확인한다.

- [x] `backend/app/db/init_db.py`가 있다.
- [x] `create_tables()`가 `Base.metadata.create_all(bind=engine)`을 실행한다.
- [x] `seed_post_categories()`가 기본 카테고리 seed를 넣는다.
- [x] 기본 카테고리 slug는 `learning-log`, `troubleshooting`, `retrospective`, `interview`, `portfolio`다.
- [x] `init_db()`가 테이블 생성과 seed 삽입을 함께 실행한다.
- [x] 실제 PostgreSQL 테이블 목록에 `users`, `post_categories`, `posts`가 있다.
- [x] `post_categories`에 기본 카테고리 5개가 들어갔다.
- [x] `init_db()`를 다시 실행해도 카테고리가 중복되지 않고 5개로 유지된다.

검증 명령:

```powershell
.\.venv\Scripts\python.exe -c "from app.db.init_db import init_db; init_db(); print('init_db done')"
```

주의: 이 단계는 학습용 초기 테이블 생성 방식이다. 실제 운영/협업 환경에서는 Alembic migration을 도입해 변경 이력을 관리한다.

## 2026-06-13 댓글/태그 모델 QA

목표: 게시글 상세 댓글과 게시글 태그 기능을 위한 DB 모델이 선언되고 실제 PostgreSQL 테이블로 생성됐는지 확인한다.

- [x] `backend/app/db/models/comment.py`에 `Comment` 모델이 있다.
- [x] `Comment.__tablename__`은 `comments`다.
- [x] `Comment.post_id`는 `posts.id`를 참조한다.
- [x] `Comment.author_id`는 `users.id`를 참조한다.
- [x] `Comment` 모델에 `content`, `created_at`, `updated_at`, `deleted_at`이 있다.
- [x] `backend/app/db/models/tag.py`에 `Tag` 모델이 있다.
- [x] `Tag.__tablename__`은 `tags`다.
- [x] `Tag` 모델에 `name`, `slug`가 있다.
- [x] `backend/app/db/models/post_tag.py`에 `PostTag` 모델이 있다.
- [x] `PostTag.__tablename__`은 `post_tags`다.
- [x] `PostTag.post_id + PostTag.tag_id`가 복합 primary key다.
- [x] `User.comments`, `Post.comments` 관계가 선언되어 있다.
- [x] `Post.post_tags`, `Tag.post_tags`, `PostTag.post`, `PostTag.tag` 관계가 선언되어 있다.
- [x] `backend/app/db/models/__init__.py`에서 `Comment`, `Tag`, `PostTag`를 import한다.
- [x] `Base.metadata.tables`에 `comments`, `tags`, `post_tags`가 등록된다.
- [x] 실제 PostgreSQL 테이블 목록에 `comments`, `tags`, `post_tags`가 있다.
- [x] 새 테이블들은 쿼리 가능하며 현재 count는 0이다.

검증 명령:

```powershell
.\.venv\Scripts\python.exe -c "from app.db.base import Base; import app.db.models; print(sorted(Base.metadata.tables.keys()))"
.\.venv\Scripts\python.exe -c "from app.db.init_db import init_db; init_db(); print('init_db done')"
```

## 2026-06-14 OAuth schema/repository QA

��ǥ: Google OAuth endpoint ���� ��, ���� ���� schema�� repository�� ���������� import/compile �Ǵ��� Ȯ���Ѵ�.

- [x] `backend/app/schemas/auth.py`�� �����Ѵ�.
- [x] `CurrentUserResponse`�� `profileImageUrl`, `approvalStatus` alias�� �����Ѵ�.
- [x] `backend/app/repositories/user_repository.py`�� �����Ѵ�.
- [x] `get_user_by_id()`�� users.id ���� ��ȸ �Լ��� �и��Ǿ� �ִ�.
- [x] `get_user_by_google_sub()`�� Google `sub` ���� ��ȸ �Լ��� �и��Ǿ� �ִ�.
- [x] `get_or_create_google_user()`�� ���� ����� ��ȸ �Ǵ� �ű� ������ ����Ѵ�.
- [x] �ʱ� ������ �̸����� `.env`�� `ADMIN_EMAILS`���� �Ǵ��Ѵ�.
- [x] �ű� �Ϲ� ����ڴ� `STUDENT / ���� ���`�� �����ǵ��� ����Ǿ� �ִ�.
- [x] ��α��� �� `users.name`�� ����� �ʵ��� ����Ǿ� �ִ�.
- [x] `backend/app/repositories/auth_token_repository.py`�� �����Ѵ�.
- [x] refresh token ������ �ƴ϶� hash�� �����ϴ� �Լ��� �ִ�.
- [x] refresh token ��ȸ/Ȱ�� ���� Ȯ��/��� �Լ��� �ִ�.
- [x] `python -m compileall app` ����.
- [x] auth schema/repository import ���� ����.

���� ����:

```powershell
cd C:\junhee\WEEK15_AI_BOARD\backend
.\.venv\Scripts\python.exe -m compileall app
.\.venv\Scripts\python.exe -c "from app.schemas.auth import CurrentUserResponse; from app.repositories.user_repository import is_initial_admin_email; from app.repositories.auth_token_repository import is_refresh_token_active; print(CurrentUserResponse(id=1, email='a@test.com', name='A', role='STUDENT', approvalStatus='���� ���').model_dump(by_alias=True)); print(is_initial_admin_email('none@example.com')); print(callable(is_refresh_token_active))"
```

## 2026-06-14 Google OAuth auth router QA

��ǥ: Google OAuth endpoint�� FastAPI�� ��ϵǰ�, ��а��� ������� ���� ���·� �⺻ ���� �帧�� �����ϴ��� Ȯ���Ѵ�.

- [x] `backend/app/routers/auth.py`�� �����Ѵ�.
- [x] `backend/app/services/auth_service.py`�� �����Ѵ�.
- [x] `backend/app/dependencies/auth.py`�� �����Ѵ�.
- [x] `backend/app/main.py`�� auth router�� ��ϵǾ� �ִ�.
- [x] `/auth/google/login` route�� ��ϵǾ� �ִ�.
- [x] `/auth/google/callback` route�� ��ϵǾ� �ִ�.
- [x] `/auth/me` route�� ��ϵǾ� �ִ�.
- [x] `/auth/refresh` route�� ��ϵǾ� �ִ�.
- [x] `/auth/logout` route�� ��ϵǾ� �ִ�.
- [x] `GET /auth/google/login`�� 307 redirect�� ��ȯ�Ѵ�.
- [x] redirect target�� Google OAuth ���������� �����Ѵ�.
- [x] `oauth_state` cookie�� �����ȴ�.
- [x] cookie ���� `GET /auth/me`�� 401�� ��ȯ�Ѵ�.
- [x] cookie ���� `POST /auth/refresh`�� 401�� ��ȯ�Ѵ�.
- [x] `POST /auth/logout`�� 200�� ��ȯ�Ѵ�.
- [x] `python -m compileall app` ����.

���� ����:

```powershell
cd C:\junhee\WEEK15_AI_BOARD\backend
.\.venv\Scripts\python.exe -m compileall app
.\.venv\Scripts\python.exe -c "from app.main import app; print([route.path for route in app.routes if route.path.startswith('/auth')])"
.\.venv\Scripts\python.exe -c "from fastapi.testclient import TestClient; from app.main import app; from app.core.config import settings; client = TestClient(app); login_response = client.get('/auth/google/login', follow_redirects=False); print('login_status=', login_response.status_code); print('login_redirect_google=', login_response.headers.get('location', '').startswith('https://accounts.google.com/')); print('state_cookie_set=', settings.oauth_state_cookie_name in login_response.cookies); me_response = client.get('/auth/me'); print('me_without_cookie=', me_response.status_code); refresh_response = client.post('/auth/refresh'); print('refresh_without_cookie=', refresh_response.status_code); logout_response = client.post('/auth/logout'); print('logout_status=', logout_response.status_code)"
```

����: ���� Google �α��� end-to-end�� ���������� Google ������ ���ľ� �ϹǷ� ����Ʈ �α��� ��ư ���� �� ���� QA�Ѵ�.

## 2026-06-15 코치 리뷰 화면 API 연결 QA

목표: 코치 리뷰 React 화면이 mock state가 아니라 실제 백엔드 리뷰 API 클라이언트를 기준으로 빌드되는지 확인한다.

체크리스트:

- [x] `frontend/src/app/api/reviews.ts`가 존재한다.
- [x] `getCoachOptions()`가 `GET /review-requests/coaches`를 호출한다.
- [x] `createReviewRequest()`가 `POST /review-requests`를 호출한다.
- [x] `getMyReviewRequests()`가 `GET /review-requests/me`를 호출한다.
- [x] `getReviewInbox()`가 `GET /review-requests/inbox`를 호출한다.
- [x] `updateReviewRequest()`가 `PATCH /review-requests/{id}`를 호출한다.
- [x] `cancelReviewRequest()`가 `DELETE /review-requests/{id}`를 호출한다.
- [x] `CoachReview.tsx`가 `mockData.reviewRequests`를 직접 사용하지 않는다.
- [x] 학생 화면에서 대기 중 요청 취소는 성공 후 목록에서 제거된다.
- [x] 코치 화면에서 피드백/상태 저장은 성공 응답으로 목록을 갱신한다.
- [x] `npm run build` 성공.
- [x] `python -m compileall app` 성공.
- [x] `git diff --check` 통과.

추가 수동 QA 예정:

- 브라우저에서 학생 계정으로 로그인 후 리뷰 요청 생성 확인
- 브라우저에서 코치 계정으로 로그인 후 인박스 수신 확인
- 코치가 피드백 작성 후 학생 요청 목록에서 피드백 확인
## 2026-06-15 AI 도우미 API 기반 정리 QA

목표: AI 도우미 화면이 mock 프로젝트 배열이 아니라 실제 API 응답을 기준으로 빌드되는지 확인한다.

체크리스트:

- [x] `AIAssistant.tsx`가 `portfolioProjects` mock 배열을 import하지 않는다.
- [x] `AIAssistant.tsx`가 `getPortfolioProjects()`를 호출한다.
- [x] `AIAssistant.tsx`가 `getMyPosts()`를 호출한다.
- [x] query string의 `project` 값으로 초기 선택 프로젝트를 맞춘다.
- [x] 선택 프로젝트의 `linkedPostIds`로 연결 기록을 필터링한다.
- [x] 프로젝트가 없을 때 포트폴리오 관리 이동 안내가 보인다.
- [x] 포트폴리오 샘플 결과 저장은 `updatePortfolioProject()`를 호출한다.
- [x] 면접 예상 질문 저장은 다음 AI 단계로 분리되어 있다.
- [x] `MyRecords.tsx`에 demo student 문구가 남아 있지 않다.
- [x] `npm run build` 성공.
- [x] `python -m compileall app` 성공.
- [x] `git diff --check` 통과.

추가 수동 QA 예정:

- 브라우저에서 포트폴리오 프로젝트 등록 후 `/ai-assistant?project={id}` 진입 확인
- 샘플 초안 저장 후 포트폴리오 관리 화면에서 저장된 초안 확인
## 2026-06-15 대시보드 API 기반 정리 QA

목표: 대시보드가 mock posts/reviewRequests 배열이 아니라 실제 API 응답 기준으로 빌드되는지 확인한다.

체크리스트:

- [x] `Dashboard.tsx`가 `posts` mock 배열을 import하지 않는다.
- [x] `Dashboard.tsx`가 `reviewRequests` mock 배열을 import하지 않는다.
- [x] STUDENT 대시보드는 `getMyPosts()`를 호출한다.
- [x] STUDENT 대시보드는 `getMyReviewRequests()`를 호출한다.
- [x] COACH 대시보드는 `getReviewInbox()`를 호출한다.
- [x] COACH 대시보드는 `getPosts()`를 호출한다.
- [x] 카테고리 count는 현재 내 기록 API 응답 기준으로 계산한다.
- [x] AI 도우미는 query string의 `project` 값 기준으로 데이터를 다시 불러온다.
- [x] `npm run build` 성공.

추가 수동 QA 예정:

- 학생 로그인 후 대시보드 최근 기록과 카테고리 수 확인
- 코치 로그인 후 대시보드 리뷰 인박스 숫자 확인
## 2026-06-15 설정 화면 QA

목표: 설정 화면이 실제 API가 없는 기능을 mock 저장처럼 보여주지 않는지 확인한다.

체크리스트:

- [x] `Settings.tsx`에 `mock 저장` 문구가 없다.
- [x] `Settings.tsx`에 `mock 연결 계정` 문구가 없다.
- [x] 현재 로그인 사용자 이름과 이메일을 read-only로 표시한다.
- [x] 프로필 저장 버튼은 비활성화되어 있다.
- [x] GitHub 전역 계정 연동은 준비 중으로 표시한다.
- [x] `npm run build` 성공.
## 2026-06-15 OAuth 로그인 시작 QA

목표: 사용자가 URL을 직접 입력하지 않아도 로그인 버튼에서 Google OAuth 시작 endpoint로 이동할 수 있는지 확인한다.

체크리스트:

- [x] 프론트 로그인 페이지 `http://localhost:5173/login`이 200을 반환한다.
- [x] 비로그인 상태의 앱 진입은 로그인 화면으로 이어진다.
- [x] 로그인 버튼은 `loginWithGoogle`를 호출한다.
- [x] `loginWithGoogle`는 `/auth/google/login`으로 브라우저를 이동시킨다.
- [x] `GET /auth/google/login`은 307 redirect를 반환한다.
- [x] redirect 대상은 Google OAuth URL이다.
- [x] OAuth state cookie가 설정된다.
- [x] 쿠키 없는 `/auth/me`는 401을 반환한다.
- [ ] 실제 Google 계정 선택 후 callback 성공 확인은 수동 QA 필요.
- [ ] 최초 로그인 계정의 승인 대기 화면 확인은 수동 QA 필요.
- [ ] 관리자 승인 후 role별 화면 분기는 수동 QA 필요.

검증 명령:

```powershell
curl.exe -I http://localhost:5173/login
curl.exe -s -D - -o NUL http://localhost:8000/auth/google/login
curl.exe -s -o NUL -w "%{http_code}" http://localhost:8000/auth/me
```
## 2026-06-15 레거시 mockData 제거 QA

목표: 프론트 주요 화면이 `data/mockData.ts`에 의존하지 않고 실제 API 또는 명확한 샘플 상태로 동작하는지 확인한다.

체크리스트:

- [x] `frontend/src/app/constants/categories.ts`가 존재한다.
- [x] `frontend/src/app/data/mockData.ts`를 삭제했다.
- [x] 게시글 목록/내 기록/글쓰기/대시보드의 카테고리 import가 `constants/categories.ts`를 사용한다.
- [x] `api/posts.ts`와 `api/comments.ts`의 `UserRole` 타입 source가 `api/auth.ts`이다.
- [x] 게시글 상세의 관련 기록은 `GET /posts` API 응답 기준으로 표시한다.
- [x] 글쓰기 화면의 최근 공개 기록은 `GET /posts` API 응답 기준으로 표시한다.
- [x] 알림은 알림 API 연결 전 샘플 데이터임을 명확히 표시한다.
- [x] `rg "mockData|data/mockData|mock 저장|mock 연결|demo student" frontend/src/app` 결과 없음.
- [x] `npm run build` 성공.
- [x] `python -m compileall app` 성공.
- [x] `git diff --check` 통과.

남은 명확한 임시 상태:

- AI 도우미 결과는 OpenAI/RAG/MCP/Agent 연결 전 API 데이터 기반 샘플이다.
- 알림 API와 프로필 설정 저장 API는 다음 단계 구현 대상이다.
- 글 임시저장 API는 다음 단계 구현 대상이다.
## 2026-06-15 최종 OpenAPI QA

목표: Swagger에서 주요 API가 확인 가능한지 검증한다.

체크리스트:

- [x] `GET /health` 등록 확인.
- [x] `GET /health/db` 등록 확인.
- [x] `GET /posts`, `POST /posts`, `GET/PATCH/DELETE /posts/{post_id}` 등록 확인.
- [x] `GET/POST /posts/{post_id}/comments`, `DELETE /comments/{comment_id}` 등록 확인.
- [x] `GET /me/posts` 등록 확인.
- [x] `GET /auth/google/login`, `GET /auth/google/callback`, `GET /auth/me`, `POST /auth/refresh`, `POST /auth/logout` 등록 확인.
- [x] `GET /admin/users`, `PATCH /admin/users/{user_id}` 등록 확인.
- [x] `GET/POST /portfolio/projects`, `PATCH /portfolio/projects/{project_id}`, `PUT /portfolio/projects/{project_id}/posts` 등록 확인.
- [x] `GET /review-requests/coaches`, `POST /review-requests`, `GET /review-requests/me`, `GET /review-requests/inbox`, `PATCH/DELETE /review-requests/{review_request_id}` 등록 확인.
- [x] Notion `2026-06-15 학습 기록` 업데이트 완료.

검증 명령:

```powershell
curl.exe -s http://localhost:8000/openapi.json
```
## 2026-06-15 OAuth/JWT callback mock QA

목표: 실제 Google 서버를 호출하지 않고도 백엔드 인증 흐름을 검증한다.

검증 방식:

- FastAPI `TestClient` 사용
- DB 세션은 테스트용 트랜잭션에 묶고 마지막에 rollback
- `exchange_google_code_for_access_token()`과 `get_google_profile()`만 fake 함수로 교체
- 실제 `.env` 값은 읽히지만 출력하지 않음
- 실제 Google Client Secret이나 JWT secret은 출력하지 않음

체크리스트:

- [x] `/auth/google/login`이 307 redirect를 반환한다.
- [x] redirect 대상이 Google OAuth URL이다.
- [x] OAuth state cookie가 생성된다.
- [x] state cookie와 query state가 같을 때 `/auth/google/callback`이 303 redirect를 반환한다.
- [x] callback 성공 후 access cookie가 설정된다.
- [x] callback 성공 후 refresh cookie가 설정된다.
- [x] `/auth/me`가 현재 사용자를 반환한다.
- [x] 최초 OAuth 사용자는 `승인 대기` 상태다.
- [x] `/auth/refresh`가 새 token 묶음을 발급한다.
- [x] refresh 이후 `/auth/me`가 계속 성공한다.
- [x] `/auth/logout`이 성공한다.
- [x] logout 이후 `/auth/me`가 401을 반환한다.

검증 결과 요약:

```txt
login_status 307
login_redirect_is_google True
state_cookie_exists True
callback_status 303
callback_redirect http://localhost:5173
access_cookie_set True
refresh_cookie_set True
me_status 200
me_email qa-oauth-local@example.com
me_approval_status 승인 대기
refresh_status 200
refreshed_me_status 200
logout_status 200
logged_out_me_status 401
```

남은 QA:

- [ ] 실제 브라우저에서 Google 계정 선택과 동의 화면을 통과한다.
- [ ] 실제 로그인 후 승인 대기 화면이 보인다.
- [ ] 관리자 이메일 계정으로 로그인했을 때 관리자 메뉴가 보인다.
- [ ] 관리자가 학생/코치 승인 후 해당 사용자의 화면 분기가 바뀐다.

## 2026-06-15 승인 대기 화면 QA

목표: 승인 대기 사용자가 로그인 화면으로 되돌아가는 순환 UX 없이 상태 확인과 로그아웃을 할 수 있는지 확인한다.

체크리스트:

- [x] 미승인 상태에서는 `로그인 화면으로 이동` 버튼이 보이지 않는다.
- [x] 미승인 상태에서는 `승인 상태 다시 확인` 버튼이 보인다.
- [x] `승인 상태 다시 확인`은 `refreshCurrentUser()`를 호출한다.
- [x] 미승인 상태에서는 `로그아웃` 버튼이 보인다.
- [x] `로그아웃`은 `/auth/logout` 호출 후 `/login`으로 이동한다.
- [x] 승인 완료 상태에서는 `대시보드로 이동` 버튼을 유지한다.
- [x] `npm run build` 성공.
- [x] `python -m compileall app` 성공.

남은 수동 QA:

- [ ] 실제 Google 로그인 후 승인 대기 계정에서 버튼 표시 확인
- [ ] 관리자가 승인한 뒤 `승인 상태 다시 확인`을 눌렀을 때 승인 완료 상태로 갱신되는지 확인

## 2026-06-15 실제 API 시나리오 통합 QA

목표: Google OAuth/JWT, 관리자 승인, 게시판, 댓글, 포트폴리오, 코치 리뷰 핵심 흐름이 실제 API로 동작하는지 확인한다.

검증 방식:

- FastAPI `TestClient` 사용
- Google token/profile 요청 함수만 fake 처리
- 관리자/학생/코치 사용자를 테스트 트랜잭션 안에서 생성
- 테스트 종료 후 rollback
- 실제 `.env` 비밀값은 출력하지 않음

체크리스트:

- [x] ADMIN_EMAILS에 해당하는 사용자는 ADMIN / 승인 완료로 생성된다.
- [x] 일반 최초 로그인 사용자는 STUDENT / 승인 대기로 생성된다.
- [x] 승인 대기 학생은 `POST /posts`가 403으로 차단된다.
- [x] ADMIN은 학생을 승인 완료로 변경할 수 있다.
- [x] ADMIN은 코치 role과 승인 완료 상태를 적용할 수 있다.
- [x] 승인된 학생은 게시글을 작성할 수 있다.
- [x] `/me/posts`는 현재 학생의 작성 글을 반환한다.
- [x] 승인된 학생은 댓글을 작성할 수 있다.
- [x] 승인된 코치는 댓글을 작성할 수 있다.
- [x] 승인된 학생은 포트폴리오 프로젝트를 등록할 수 있다.
- [x] 프로젝트와 게시글을 연결할 수 있다.
- [x] 포트폴리오 상태와 저장된 초안을 수정할 수 있다.
- [x] 학생은 승인된 코치 목록을 조회할 수 있다.
- [x] 학생은 코치 리뷰 요청을 생성할 수 있다.
- [x] 코치는 받은 리뷰 인박스에서 요청을 볼 수 있다.
- [x] 코치는 피드백과 상태를 저장할 수 있다.
- [x] 피드백 완료된 요청은 학생이 취소할 수 없다.

주의:

- PowerShell 파이프에서 한글 JSON literal이 깨지는 문제가 있어 상태값은 유니코드 escape로 전송했다.
- 실제 브라우저 Google 계정 선택과 동의 화면은 별도 수동 QA가 필요하다.

## 2026-06-15 브라우저 로그인 UX QA

체크리스트:

- [x] `/` 진입 시 비로그인 사용자는 `/login` 화면으로 이동한다.
- [x] 로그인 화면에 `Google로 계속하기` 버튼이 보인다.
- [x] 로그인 화면에 승인 대기 안내 문구가 보인다.
- [x] 로그인 화면에서 콘솔 error가 없다.
- [x] `/posts/new` 직접 진입 시 비로그인 사용자는 `/login`으로 이동한다.
- [x] 보호 라우트 redirect 후 로그인 버튼이 유지된다.
- [ ] 실제 Google 계정 선택과 OAuth 동의 화면 통과는 수동 QA 필요.

## 2026-06-15 README 정리 QA

목표: README가 현재 실제 API 기반 구현 상태를 설명하고, 오래된 mock 단계 설명으로 사용자를 헷갈리게 하지 않는지 확인한다.

체크리스트:

- [x] 프로젝트 개요가 있다.
- [x] 주요 구현 기능이 있다.
- [x] 전체 아키텍처 구조가 있다.
- [x] RAG/MCP/Agent 기능 설계가 있다.
- [x] 실행 방법이 있다.
- [x] 환경 변수와 Google Cloud 설정 안내가 있다.
- [x] QA 결과와 남은 수동 QA가 있다.
- [x] 회고, 한계점, 개선 아이디어가 있다.
- [ ] 오래된 mock/demo 문구 검색 QA
- [ ] `npm run build`
- [ ] `python -m compileall app`
- [ ] `git diff --check`

README 정리 QA 결과:

- [x] 오래된 mock/demo 문구 검색 QA 완료
- [x] `npm run build` 성공
- [x] `python -m compileall app` 성공
- [x] `git diff --check` 통과

## 2026-06-15 OAuth 실패 UX QA

목표: OAuth 실패 상황에서도 사용자에게 자연스러운 로그인 재시도 화면을 보여준다.

체크리스트:

- [x] `/auth/google/callback`에 `code/state` 없이 접근하면 303 redirect를 반환한다.
- [x] redirect 위치는 `/login?authError=...`이다.
- [x] 실패 redirect 응답에서 OAuth state cookie를 삭제한다.
- [x] `/login?authError=...` 화면에 로그인 실패 안내가 보인다.
- [x] 실패 안내 화면에서도 `Google로 계속하기` 버튼이 보인다.
- [x] 브라우저 console error가 없다.
- [x] `npm run build` 성공.
- [x] `python -m compileall app` 성공.

## 2026-06-15 브라우저 메타/레거시 Layout QA

목표: 브라우저 진입점과 사용하지 않는 레거시 UI 파일이 현재 JungleLog 서비스 흐름과 충돌하지 않는지 확인한다.

체크리스트:

- [x] `frontend/index.html`의 `<title>`이 `JungleLog`다.
- [x] `frontend/index.html`의 `<html lang>`이 `ko`다.
- [x] description 메타 정보가 JungleLog 설명이다.
- [x] `DashboardLayout`, `AuthLayout`를 export하던 레거시 `components/Layout.tsx`가 실제 라우트에서 사용되지 않음을 확인했다.
- [x] 사용하지 않는 레거시 `components/Layout.tsx`를 삭제했다.
- [x] `npm run build`
- [x] `python -m compileall app`
- [x] `git diff --check`

수동 QA:

- [ ] 실제 브라우저에서 `http://localhost:5173/login` 접속 시 탭 제목이 `JungleLog`로 보이는지 확인한다.
- [ ] 실제 Google 로그인 후 승인 대기/관리자/학생/코치 화면에서도 탭 제목이 유지되는지 확인한다.

## 2026-06-15 OAuth 설정 존재 여부 QA

목표: 실제 비밀값을 출력하지 않고 OAuth/JWT 설정이 들어갔는지, 로그인 시작 API가 Google OAuth URL을 생성하는지 확인한다.

체크리스트:

- [x] `GOOGLE_CLIENT_ID`가 설정되어 있다.
- [x] `GOOGLE_CLIENT_SECRET`이 설정되어 있다.
- [x] `GOOGLE_REDIRECT_URI`가 설정되어 있다.
- [x] `JWT_SECRET_KEY`가 설정되어 있다.
- [x] `ADMIN_EMAILS`가 설정되어 있다.
- [x] `GOOGLE_REDIRECT_URI`가 `http://localhost:8000/auth/google/callback`와 일치한다.
- [x] `GET /auth/google/login` 응답 status가 redirect 계열이다.
- [x] redirect host가 `accounts.google.com`이다.
- [x] OAuth state cookie가 설정된다.

수동 QA:

- [ ] 실제 브라우저에서 Google 계정 선택/동의 화면을 통과한다.
- [ ] 최초 관리자 이메일 계정으로 로그인했을 때 관리자 화면에 접근할 수 있다.
- [ ] 일반 신규 사용자 계정으로 로그인했을 때 승인 대기 화면이 보인다.

## 2026-06-15 프론트 API 주소 환경변수 QA

목표: 프론트가 백엔드 API 주소를 하드코딩 대신 `VITE_API_BASE_URL` 기반으로 읽되, 로컬 기본값은 유지하는지 확인한다.

체크리스트:

- [x] `frontend/.env.example`에 `VITE_API_BASE_URL=http://localhost:8000`이 있다.
- [x] `client.ts`가 `import.meta.env.VITE_API_BASE_URL`을 읽는다.
- [x] 환경변수가 없으면 `http://localhost:8000`을 기본값으로 사용한다.
- [x] URL 끝의 `/`를 제거한다.
- [ ] `npm run build`
- [ ] `python -m compileall app`
- [ ] `git diff --check`

수동 QA:

- [ ] 프론트 실행 후 로그인 버튼이 `http://localhost:8000/auth/google/login` 흐름으로 이동하는지 확인한다.
- [ ] 포트를 바꿀 경우 `frontend/.env`에 `VITE_API_BASE_URL`을 설정하고 다시 실행한다.

프론트 API 주소 환경변수 QA 결과:

- [x] `npm run build` 성공
- [x] `python -m compileall app` 성공
- [x] `git diff --check` 통과

## 2026-06-15 DB 초기화 demo seed 제거 QA

목표: DB 초기화가 실제 서비스 흐름을 방해하는 개발용 사용자/게시글을 자동 생성하지 않는지 확인한다.

체크리스트:

- [x] `init_db()`가 `create_tables()`와 `seed_post_categories()`만 호출한다.
- [x] `backend/app`, `frontend/src`, `README.md` 범위에서 `demo.student` 검색 결과가 없다.
- [x] `backend/app`, `frontend/src`, `README.md` 범위에서 `seed_demo` 검색 결과가 없다.
- [x] `backend/app`, `frontend/src`, `README.md` 범위에서 `DEMO_POSTS` 검색 결과가 없다.
- [ ] `npm run build`
- [ ] `python -m compileall app`
- [ ] `git diff --check`

수동 QA:

- [ ] 기존 로컬 DB에 과거 개발용 사용자가 남아 있는지 확인한다.
- [ ] 필요하면 실제 사용자 데이터와 구분한 뒤 별도 정리한다.

DB 초기화 demo seed 제거 QA 결과:

- [x] `npm run build` 성공
- [x] `python -m compileall app` 성공
- [x] `git diff --check` 통과
- [x] 실제 코드/README 범위에서 `demo.student`, `seed_demo`, `DEMO_POSTS` 검색 결과 없음
- [!] 로컬 PostgreSQL에는 과거 개발용 사용자 `demo.student@junglelog.local`이 1개 남아 있음. 코드 변경으로 새로 생성되지는 않지만, 기존 DB 정리는 별도 승인 후 진행한다.

## 2026-06-15 로컬 DB demo 잔존 데이터 cleanup QA

목표: 과거 개발용 demo 사용자가 실제 Google OAuth 흐름 QA를 방해하지 않도록 로컬 DB에서 제거되었는지 확인한다.

체크리스트:

- [x] 삭제 전 demo 사용자 존재 여부를 확인했다.
- [x] 삭제 전 연결된 게시글/댓글/태그 연결 개수를 확인했다.
- [x] 포트폴리오/리뷰/토큰/알림 연결이 없음을 확인했다.
- [x] demo 사용자와 연결된 댓글 3개를 삭제했다.
- [x] demo 사용자 게시글의 post_tags 25개를 삭제했다.
- [x] demo 사용자 게시글 12개를 삭제했다.
- [x] demo 사용자 1명을 삭제했다.
- [x] 삭제 후 `legacy_demo_user_count=0`을 확인했다.
- [ ] `npm run build`
- [ ] `python -m compileall app`
- [ ] `git diff --check`

주의:

- 이 cleanup은 로컬 PostgreSQL 상태 변경이며 git 커밋에는 DB row 삭제 자체가 남지 않는다.
- 코드상으로는 `init_db()`에서 개발용 사용자를 더 이상 생성하지 않도록 이미 정리되어 있다.

로컬 DB demo 잔존 데이터 cleanup QA 결과:

- [x] `npm run build` 성공
- [x] `python -m compileall app` 성공
- [x] `git diff --check` 통과
- [x] `legacy_demo_user_count=0` 확인

## 2026-06-15 OAuth 기존 이메일 사용자 연결 QA

목표: Google sub가 아직 연결되지 않은 기존 이메일 사용자가 실제 OAuth 로그인 시 같은 user row로 연결되는지 확인한다.

체크리스트:

- [x] 테스트용 기존 이메일 사용자를 생성했다.
- [x] 같은 이메일과 새 Google sub로 `get_or_create_google_user()`를 호출했다.
- [x] 기존 user id가 유지됐다.
- [x] `google_sub`가 새 값으로 갱신됐다.
- [x] 기존 role이 유지됐다.
- [x] 기존 approvalStatus가 유지됐다.
- [x] 테스트용 사용자를 cleanup했다.
- [x] cleanup 후 테스트용 사용자 count가 0임을 확인했다.
- [ ] `npm run build`
- [ ] `python -m compileall app`
- [ ] `git diff --check`

수동 QA:

- [ ] 실제 관리자 Google 계정으로 로그인했을 때 기존 관리자 사용자 row가 재사용되는지 확인한다.
- [ ] 로그인 후 `/auth/me`가 ADMIN / 승인 완료를 반환하는지 확인한다.

OAuth 기존 이메일 사용자 연결 QA 결과:

- [x] `npm run build` 성공
- [x] `python -m compileall app` 성공
- [x] `git diff --check` 통과
- [x] 기존 이메일 사용자에 새 Google sub 연결 테스트 성공
- [x] 테스트용 사용자 cleanup 완료

## 2026-06-15 실제 브라우저 Google 로그인 진입 QA

목표: 사용자가 URL을 직접 조합하지 않고 로그인 버튼만 눌러 Google OAuth 화면으로 이동할 수 있는지 확인한다.

체크리스트:

- [x] `http://localhost:5173/login` 접속 시 브라우저 title이 `JungleLog`다.
- [x] 로그인 화면에 `Google로 계속하기` 버튼이 보인다.
- [x] 로그인 화면 console error가 없다.
- [x] Google 로그인 버튼은 1개만 존재한다.
- [x] Google 로그인 버튼 클릭 시 `accounts.google.com` 로그인 화면으로 이동한다.
- [x] Google OAuth URL에 `redirect_uri=http://localhost:8000/auth/google/callback` 흐름이 포함된다.
- [x] 비로그인 상태에서 `/posts/new` 직접 접근 시 `/login`으로 redirect된다.
- [x] 보호 라우트 redirect 후 로그인 버튼이 유지된다.
- [x] 보호 라우트 redirect 후 console error가 없다.
- [ ] 실제 Google 계정 선택/동의 화면 통과
- [ ] callback 후 JungleLog 화면 복귀
- [ ] `/auth/me` 기준 관리자/학생/코치 화면 분기 확인
- [ ] `npm run build`
- [ ] `python -m compileall app`
- [ ] `git diff --check`

실제 브라우저 Google 로그인 진입 QA 결과:

- [x] `npm run build` 성공
- [x] `python -m compileall app` 성공
- [x] `git diff --check` 통과
- [x] `/login` 화면 title `JungleLog` 확인
- [x] Google 로그인 버튼 클릭 시 `accounts.google.com` 이동 확인
- [x] `/posts/new` 비로그인 접근 시 `/login` redirect 확인

## 2026-06-15 관리자 사이드바 메뉴 QA

목표: 관리자 승인 화면에서 대시보드 메뉴가 다시 보이지 않는지 확인한다.

체크리스트:

- [ ] ADMIN 로그인 상태에서 `/admin/users` 접속
- [ ] 왼쪽 사이드바에 `대시보드` 메뉴가 없는지 확인
- [ ] 왼쪽 사이드바에 `사용자 승인`, `전체 게시글`, `설정`만 보이는지 확인
- [ ] `/` 직접 접근 시 관리자 사용자는 `/admin/users`로 이동하는지 확인
- [ ] `npm run build`
- [ ] `python -m compileall app`
- [ ] `git diff --check`

판단 기준:

- 관리자 전용 대시보드 화면은 현재 MVP에서 쓰지 않는다.
- 관리자의 기본 업무는 사용자 승인 관리이므로 `/admin/users`가 중심 화면이다.

관리자 사이드바 메뉴 QA 결과:

- [x] ADMIN 로그인 상태에서 `/admin/users` 접속 확인
- [x] 왼쪽 사이드바에 `대시보드` 메뉴가 없음
- [x] 왼쪽 사이드바에 `사용자 승인`, `전체 게시글`, `설정`만 표시됨
- [x] 브라우저 DOM 기준 h1은 `사용자 승인 관리`
- [x] `npm run build` 성공
- [x] `python -m compileall app` 성공
- [x] `git diff --check` 통과

남은 판단:

- 실제 AI 기능은 아직 시작 전이다.
- AI 전 단계 중 실제 Google 로그인 callback 수동 QA와 알림 API/GitHub 실제 분석은 남아 있다.

## 2026-06-15 학생 화면 QA 개선 체크리스트

목표: AI 단계로 넘어가기 전에 학생 화면의 기본 흐름이 실제 API 기준으로 자연스럽게 이어지는지 확인한다.

체크리스트:

- [ ] `npm run build`
- [ ] `python -m compileall app`
- [ ] `git diff --check`
- [ ] `/me/profile` 라우트가 FastAPI 앱에 등록되어 있다.
- [ ] `/uploads` 정적 파일 경로가 FastAPI 앱에 등록되어 있다.
- [ ] 관리자 사이드바에 대시보드 메뉴가 보이지 않는다.
- [ ] 포트폴리오 프로젝트 등록 후 목록을 다시 불러온다.
- [ ] 이미 등록한 GitHub repo를 다시 등록하면 중복으로 새 카드가 생기지 않는다.
- [ ] 게시글 작성/수정 화면에서 관련 커밋 대신 GitHub repo URL을 입력한다.
- [ ] 게시글 상세 화면에서 GitHub 보기 버튼이 유효한 URL일 때만 열린다.
- [ ] 댓글/작성자 영역에서 프로필 이미지가 있으면 avatar 이미지가 보인다.
- [ ] 설정 화면에서 이름과 프로필 이미지 저장 UI가 보인다.
- [ ] AI 도우미에서 포트폴리오 초안 보관함이 보인다.

QA 결과:

- 진행 중

남은 수동 QA:

- 실제 브라우저에서 이미지 업로드 후 `/uploads/profiles/...` 이미지가 보이는지 확인한다.
- 실제 Google 로그인 사용자로 이름 수정 후 헤더/사이드바 이름이 갱신되는지 확인한다.
- 실제 학생 계정에서 게시글 작성 -> 상세 -> 댓글 작성 -> 내 기록 반영 흐름을 확인한다.

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

## 2026-06-15 코치 리뷰 인박스 미리보기 QA

목표: 코치가 리뷰 요청을 선택했을 때 대상 내용을 인박스 안에서 이해하고 피드백을 작성할 수 있는지 확인한다.

체크리스트:

- [x] `npm run build` 성공
- [x] `python -m compileall app` 성공
- [x] `/review-requests/inbox` 라우트 등록 확인
- [x] OpenAPI `ReviewRequestResponse`에 `targetSummary`가 있다.
- [x] OpenAPI `ReviewRequestResponse`에 `targetPreview`가 있다.
- [x] OpenAPI `ReviewRequestResponse`에 `targetLinkUrl`이 있다.
- [x] 코치 화면에서 포트폴리오 요청은 학생 전용 `/portfolio`로 이동하지 않는다.
- [x] 코치 화면에서 포트폴리오 요청은 유효한 GitHub URL이 있으면 새 탭으로 열 수 있다.
- [x] 코치 상세 패널에 리뷰 대상 미리보기 영역이 있다.
- [x] 인박스 새로고침 후 선택 요청과 feedback textarea가 같은 요청 기준으로 맞춰진다.

남은 수동 QA:

- 실제 COACH 계정으로 로그인해서 받은 리뷰 요청을 선택한다.
- 게시글 리뷰 요청에서 원문 보기 버튼이 `/posts/:id`로 이동하는지 확인한다.
- 포트폴리오 리뷰 요청에서 GitHub 보기 버튼이 실제 repo를 새 탭으로 여는지 확인한다.
- 피드백 작성 후 STUDENT 계정의 내가 보낸 요청 목록에 피드백이 보이는지 확인한다.

브라우저 QA 추가 결과:

- [x] `http://localhost:5173/coach-review` 진입 시 `코치 리뷰 인박스` 화면 렌더링 확인
- [x] 현재 DB에 받은 리뷰 요청이 없을 때 빈 인박스 상태가 표시됨
- [x] 화면 본문에 `[object Object]`가 보이지 않음
- [x] 화면 본문에 `백엔드 DB`, `자동 등록` 같은 개발용 문구가 보이지 않음
- [x] 관리자 메뉴는 `사용자 승인`, `전체 게시글`, `설정`으로 유지됨

메모:

- 현재 로컬 DB에 코치가 받은 리뷰 요청이 없어 `리뷰 대상 미리보기` 실제 표시까지는 수동 데이터 생성 후 추가 QA가 필요하다.
- 과거 HMR 시점의 console error 로그가 남아 있었지만, 새로고침 후 화면은 정상 렌더링됐다.

## 2026-06-15 알림 API 연결 QA

목표: 헤더 알림 드롭다운이 샘플 배열이 아니라 실제 notifications API 기준으로 동작하는지 확인한다.

체크리스트:

- [x] `npm run build` 성공
- [x] `python -m compileall app` 성공
- [x] `git diff --check` 통과
- [x] `/notifications` 라우트 등록 확인
- [x] `/notifications/{notification_id}/read` 라우트 등록 확인
- [x] `/notifications/read-all` 라우트 등록 확인
- [x] OpenAPI에 `NotificationListResponse`가 있다.
- [x] OpenAPI에 `NotificationItemResponse`가 있다.
- [x] PostgreSQL에 `notifications` 테이블이 있다.
- [x] `sampleNotifications` 상수가 제거됐다.
- [x] 헤더 알림 드롭다운에 `샘플 데이터`, `API 연결 전` 문구가 보이지 않는다.
- [x] 헤더 알림 드롭다운에 `[object Object]`가 보이지 않는다.
- [x] 알림이 없으면 `아직 도착한 알림이 없습니다.` 빈 상태가 보인다.

남은 수동 QA:

- 학생 계정으로 리뷰 요청을 보내고 코치 계정 알림에 표시되는지 확인한다.
- 코치가 피드백을 저장하고 학생 계정 알림에 표시되는지 확인한다.
- 관리자가 승인/역할 변경을 했을 때 대상 사용자 알림에 표시되는지 확인한다.
- 알림 클릭 시 linkUrl 화면으로 이동하고 읽음 상태가 유지되는지 확인한다.

## 2026-06-15 리뷰 요청-피드백-알림 왕복 QA

목표: 실제 DB와 서비스 레이어 기준으로 학생/코치/알림 연결이 한 흐름으로 동작하는지 확인한다.

체크리스트:

- [x] 임시 학생 사용자를 생성했다.
- [x] 임시 코치 사용자를 생성했다.
- [x] 임시 학생 게시글을 생성했다.
- [x] 학생 게시글로 리뷰 요청을 생성했다.
- [x] 리뷰 요청 생성 후 담당 코치 알림이 1개 생성됐다.
- [x] 코치 인박스에서 해당 리뷰 요청이 조회됐다.
- [x] 코치 인박스 응답에 `targetPreview`가 포함됐다.
- [x] 코치가 `피드백 완료` 상태와 피드백 내용을 저장했다.
- [x] 피드백 저장 후 학생 알림이 1개 생성됐다.
- [x] QA용 임시 데이터는 검증 후 정리했다.

검증 출력:

```txt
created_request_status= 대기 중
created_request_target_title= QA review target post
coach_notification_count= 1
inbox_total= 1
inbox_target_preview_exists= True
updated_request_status= 피드백 완료
student_notification_count= 1
```

남은 수동 QA:

- 실제 브라우저에서 STUDENT 계정으로 게시글 작성 후 코치 리뷰 요청 대상에 즉시 보이는지 확인한다.
- 실제 COACH 계정으로 로그인해 인박스에서 피드백을 저장한다.
- 다시 STUDENT 계정으로 로그인해 알림과 내가 보낸 요청 목록에 피드백이 보이는지 확인한다.

## 2026-06-15 �л� ��ġ ���� ��û ������ QA

��ǥ: ���� STUDENT ȭ�鿡�� �۾���� ��ġ ���� ��û ��� ������ ������ �ʴ��� Ȯ���Ѵ�.

üũ����Ʈ:

- [x] DB�� ���� �α��� ����ڸ� STUDENT / ���� �Ϸ�� �ٲ۴�.
- [x] `/`���� �л��� ��ú���� �л� �޴��� ���̴��� Ȯ���Ѵ�.
- [x] `/admin/users` ���� ���� �� ���� ���� ȭ���� ���̴��� Ȯ���Ѵ�.
- [x] `/posts/new`���� �� �Խñ��� �ۼ��Ѵ�.
- [x] �ۼ� �Ϸ� �� `/posts/:id` �� ȭ������ �̵��ϴ��� Ȯ���Ѵ�.
- [x] �� ȭ�鿡 ����, ����, GitHub URL�� ǥ�õǴ��� Ȯ���Ѵ�.
- [x] `/coach-review`���� �ۼ��� �Խñ��� ���� ��� ��Ͽ� ���̴��� Ȯ���Ѵ�.
- [x] ȭ�鿡 `Input should be less than or equal to 50`�� ������ �ʴ��� Ȯ���Ѵ�.
- [x] ��ġ�� �����ϰ� ���� ��û�� ������.
- [x] ���� ���� ��û ��Ͽ� `��� ��` ���·� ǥ�õǴ��� Ȯ���Ѵ�.
- [x] ȭ�鿡 `[object Object]`�� ������ �ʴ��� Ȯ���Ѵ�.

�߰��� ����:

- `CoachReview.tsx`���� �� �Խñ��� `size=100`���� ��ȸ�� FastAPI `/me/posts`�� `le=50` ������ �ɷȴ�.

���� Ȯ��:

- `REVIEW_TARGET_POST_PAGE_SIZE = 50`���� API ��û ũ�⸦ �����.
- ����� �� �� �Խñ��� ���� ��� ��ϰ� �̸����⿡ ���� ǥ�õƴ�.

���� QA:

- COACH role�� ��ȯ�� �� ���� �ιڽ����� �л� ��û�� ���̴��� Ȯ���Ѵ�.
- ��ġ�� �ǵ���� �ۼ��ϰ� ���¸� �ٲ� �� �л� �˸�/��û ��Ͽ� �ݿ��Ǵ��� ���������� Ȯ���Ѵ�.
- QA�� ������ ���� �α��� ���� role�� ADMIN���� �����Ѵ�.
## 2026-06-15 ��ġ �ιڽ� ������ QA

��ǥ: COACH role���� ���� �ιڽ��� �⺻ ���� ȭ������ �����ϴ��� Ȯ���Ѵ�.

üũ����Ʈ:

- [x] DB�� ���� �α��� ����ڸ� COACH / ���� �Ϸ�� �ٲ۴�.
- [x] QA�� �ӽ� �л�, �Խñ�, ���� ��û�� �����.
- [x] `/coach-review`���� ���� ��û�� ���̴��� Ȯ���Ѵ�.
- [x] ���� ��û �󼼿� �л� ��û �޽����� ���̴��� Ȯ���Ѵ�.
- [x] ���� ��� �̸����Ⱑ ���̴��� Ȯ���Ѵ�.
- [x] `/` ���� �� `/coach-review`�� �̵��ϴ��� Ȯ���Ѵ�.
- [x] COACH ���̵�ٿ� ��ú��尡 ������ �ʴ��� Ȯ���Ѵ�.
- [x] COACH ���̵�ٰ� `��ġ ���� �ιڽ� / ��ü �Խñ� / ����`���� Ȯ���Ѵ�.
- [x] `���� ������ ����` ��ư Ŭ�� �� ���°� `���� ��`���� �ٲ���� Ȯ���Ѵ�.
- [x] ����� �ǵ���� ���ΰ�ħ �� textarea�� �ٽ� ǥ�õǴ��� Ȯ���Ѵ�.
- [x] ȭ�鿡 `[object Object]`�� ������ �ʴ��� Ȯ���Ѵ�.
- [x] QA�� �ӽ� �����͸� �����Ѵ�.
- [x] ���� �α��� ����� role�� ADMIN���� �����Ѵ�.

�߰��� ����:

- COACH �޴��� ��ú��尡 �ٽ� ������.
- `/` ���� �� ��ġ ��ú��尡 ���� �� �־���.

���� Ȯ��:

- `coachNavItems`���� ��ú��带 �����ߴ�.
- `Dashboard`���� COACH role�� `/coach-review`�� redirect�Ѵ�.
- ������ ����� ��� COACH �޴����� ��ú��尡 ���� `/`�� `/coach-review`�� �̵��ߴ�.

���� QA:

- ���� STUDENT �������� ��ġ�� ���� �ǵ���� ���� ��û ��ϰ� �˸��� ���̴��� �������� Ȯ���Ѵ�.
- ������ �ڵ�ȭ ������ Ŭ������ ������ Ǯ���� textarea ���� �Է±��� E2E�� �ٽ� Ȯ���Ѵ�.
## 2026-06-15 �л� �ǵ��/�˸� �ݿ� QA

��ǥ: ��ġ�� �ǵ���� ���� �� �л� ȭ�鿡 ��û ����, �ǵ��, �˸��� ���� API �������� �ݿ��Ǵ��� Ȯ���Ѵ�.

üũ����Ʈ:

- [x] ���� �α��� ����ڸ� STUDENT / ���� �Ϸ�� ��ȯ�Ѵ�.
- [x] QA�� �ӽ� ��ġ�� �����.
- [x] QA�� �л� �Խñ��� �����.
- [x] ���� review service�� ���� ��û�� �����.
- [x] ���� review service�� ��ġ �ǵ��� `�ǵ�� �Ϸ�` ���¸� �����Ѵ�.
- [x] �л� `/coach-review` ȭ�鿡�� ��û ����� Ȯ���Ѵ�.
- [x] ��û ���°� `�ǵ�� �Ϸ�`�� ǥ�õǴ��� Ȯ���Ѵ�.
- [x] ��� ��ġ �̸��� ǥ�õǴ��� Ȯ���Ѵ�.
- [x] �ǵ�� ������ ǥ�õǴ��� Ȯ���Ѵ�.
- [x] ��� �˸� ��Ӵٿ ��ġ �ǵ�� �˸��� ǥ�õǴ��� Ȯ���Ѵ�.
- [x] ���� �˸� ������ ������ �ʴ��� Ȯ���Ѵ�.
- [x] ȭ�鿡 `[object Object]`�� ������ �ʴ��� Ȯ���Ѵ�.
- [x] �˸� Ŭ�� �� ���� ���� �˸� ǥ�ð� ��������� Ȯ���Ѵ�.
- [x] QA�� �ӽ� �����͸� �����Ѵ�.
- [x] ���� �α��� ����ڸ� ADMIN / ���� �Ϸ�� �����Ѵ�.

���� ���:

- STUDENT ��û ��ϰ� �˸� ��Ӵٿ� ��� ���� �����ߴ�.
- �̹� QA������ �ڵ� ���� ���� ���� ������ �䱸 �帧�� �����ϴ� ������ Ȯ���ߴ�.

���� QA:

- ��Ʈ������ ������Ʈ ���/�ߺ�/��/AI ����� ������ ��ð� ��� �帧������ �����Ǵ��� �ٽ� �ȴ´�.
- ���� Google OAuth �ű� ����� ���� �帧�� ���������� ���� Ȯ���Ѵ�.
## 2026-06-15 포트폴리오 프로젝트/AI 도우미 연결 QA

목표: 학생 포트폴리오 관리 화면에서 등록된 프로젝트가 AI 도우미와 자연스럽게 이어지고, API validation 오류 없이 동작하는지 확인한다.

체크리스트:

- [x] 현재 로그인 사용자를 STUDENT / 승인 완료로 전환한다.
- [x] `/portfolio` 화면이 오류 없이 열린다.
- [x] `/portfolio`에서 `/me/posts` 조회 시 `size <= 50` 계약을 지킨다.
- [x] QA용 포트폴리오 프로젝트를 실제 service layer로 생성한다.
- [x] QA용 게시글을 프로젝트에 연결한다.
- [x] 프로젝트 카드에 긴 repo 이름이 깨지지 않고 표시된다.
- [x] 상세 영역에 GitHub 보기 링크가 새 탭 대상으로 준비되어 있다.
- [x] `/ai-assistant?project={id}&type=portfolio`로 이동하면 선택 프로젝트가 유지된다.
- [x] AI 도우미 참고 자료 패널에 프로젝트, 기술 스택, 연결 기록이 표시된다.
- [x] `포트폴리오 초안으로 저장` 후 DB의 `saved_portfolio_draft`와 `portfolio_status`가 갱신된다.
- [x] 동일 repo 중복 등록은 백엔드 service에서 차단된다.
- [x] QA용 임시 프로젝트와 게시글을 삭제한다.
- [x] 현재 로그인 사용자를 ADMIN / 승인 완료로 복구한다.
- [ ] 브라우저 자동화 입력 제한이 풀리면 repo URL 입력부터 중복 등록 UX까지 실제 클릭 E2E로 다시 확인한다.

발견한 결함:

- `Portfolio.tsx`와 `AIAssistant.tsx`에서 `/me/posts`를 `size=100`으로 요청해 FastAPI의 `maximum: 50` 검증에 걸렸다.

수정 확인:

- `PORTFOLIO_LINKABLE_POST_PAGE_SIZE = 50` 적용.
- `AI_ASSISTANT_REFERENCE_POST_PAGE_SIZE = 50` 적용.
- 포트폴리오 화면과 AI 도우미 화면에서 `Input should be less than or equal to 50` 오류가 사라졌다.

검증 한계:

- 현재 브라우저 자동화 도구에서 텍스트 입력 시 virtual clipboard 오류가 발생한다.
- 그래서 이번에는 화면 읽기와 실제 service/API 기반 데이터 생성으로 검증했고, repo URL 입력 UI 자체는 다음 수동 QA 대상으로 남긴다.
## 2026-06-15 학생 화면 개발용 문구 QA

목표: 학생이 보는 주요 화면에 개발/debug 문구가 직접 노출되지 않는지 확인한다.

체크리스트:

- [x] AI 도우미 화면에 `샘플 결과`, `OpenAI/RAG/MCP 호출은 다음 단계`, `API 데이터 기반` 같은 문구가 직접 보이지 않는다.
- [x] 포트폴리오 관리 화면에 `MCP/GitHub API 연결 후` 같은 개발 단계 설명이 직접 보이지 않는다.
- [x] 게시글 작성 화면에 `백엔드 API`, `임시저장 API 연결 전` 같은 문구가 직접 보이지 않는다.
- [x] 게시글 상세 로딩 화면은 `게시글을 불러오는 중입니다.`로 보인다.
- [x] 게시글 목록 안내는 검색/카테고리 동작 중심으로 보인다.
- [x] 설정 화면의 AI/보안 설명은 사용자 관점 문구로 보인다.
- [x] 개발용 키워드는 화면 노출 문자열이 아니라 코드 주석 중심으로만 남았다.

검증 명령:

```txt
rg -n "백엔드|API|샘플|mock|debug|MCP|RAG|OpenAI|다음 단계|구현 예정|연결 전" frontend/src/app/pages frontend/src/app/layouts
```

검증 결과:

- 남은 검색 결과는 코드 주석 중심이다.
- 실제 UI 문자열은 서비스 문구로 정리했다.
## 2026-06-15 공통 API 에러 메시지 QA

목표: API 에러 응답 객체가 사용자 화면에 raw object로 노출되지 않도록 공통 처리 흐름을 확인한다.

체크리스트:

- [x] `getErrorMessage()`가 문자열 detail을 그대로 반환한다.
- [x] `getErrorMessage()`가 배열 detail에서 읽을 수 있는 메시지만 모은다.
- [x] `{ msg: ... }` 형태의 FastAPI validation item을 처리한다.
- [x] `{ message: ... }` 형태도 처리한다.
- [x] 읽을 수 없는 객체는 `String(object)`로 변환하지 않는다.
- [x] 기본 fallback 문구는 사용자 친화적인 문장이다.
- [x] `rg`로 `[object Object]`와 과거 `String((item as { msg: unknown }).msg)` 패턴이 사라진 것을 확인했다.

검증 명령:

```txt
rg -n "\[object Object\]|String\(\(item as \{ msg: unknown \}\)\.msg\)|fallbackMessage" frontend/src/app/api/client.ts
```
## 2026-06-15 학생 주요 화면 브라우저 스모크 QA

목표: 학생 역할로 주요 화면을 열어보고, 화면에 raw object/debug/기술 문구가 노출되지 않는지 확인한다.

사전 조건:

- 현재 로그인 사용자를 STUDENT / 승인 완료로 임시 전환한다.
- 프론트엔드: `http://localhost:5173`
- 백엔드: `http://localhost:8000`

검증 화면:

- [x] `/`
- [x] `/posts`
- [x] `/posts/new`
- [x] `/my-records`
- [x] `/portfolio`
- [x] `/ai-assistant`
- [x] `/coach-review`
- [x] `/settings`

공통 확인:

- [x] `Unexpected Application Error`가 보이지 않는다.
- [x] `[object Object]`가 보이지 않는다.
- [x] `Google OAuth 로그인`이 보이지 않는다.
- [x] `로그인됨`이 보이지 않는다.
- [x] `백엔드 데이터`가 보이지 않는다.
- [x] `mock`, `debug`가 보이지 않는다.

추가 확인:

- [x] `/my-records`에 `JWT 쿠키` 문구가 보이지 않는다.
- [x] `/settings`에 `backend/uploads`, `로컬 개발`, `S3` 문구가 보이지 않는다.
- [x] `/coach-review`의 빈 대상 문구가 `게시글이 없습니다`, `포트폴리오 프로젝트가 없습니다`처럼 자연스럽다.

발견 및 수정:

- `MainLayout.tsx`: `Google OAuth 로그인` -> `내 계정`
- `MyRecords.tsx`: JWT 쿠키 설명 제거
- `Settings.tsx`: 프로필 이미지 저장 위치 설명을 아바타 표시 안내로 변경
- `CoachReview.tsx`: 빈 상태 조건부 문장을 조사 문제 없이 분기
## 2026-06-15 QA: 게시글 상세 요약 중복 표시

목표: 새 게시글 작성 후 상세 화면에서 본문이 요약 카드와 본문 영역에 중복 표시되지 않는지 확인한다.

체크리스트:

- [x] `/posts/new`에서 새 게시글을 작성하면 상세 화면으로 이동한다.
- [x] 상세 화면에 제목, 작성자, 본문, GitHub repo URL이 표시된다.
- [x] `PostEdit.tsx`에서 생성한 summary가 content 앞부분과 같은 경우를 확인했다.
- [x] `PostDetail.tsx`에서 summary가 content와 같거나 content 시작 부분이면 요약 카드를 숨긴다.
- [ ] 브라우저에서 새 글을 다시 작성해 본문이 한 번만 자연스럽게 보이는지 재검증한다.

발견한 문제:

- 작성 화면의 `buildSummary()`가 본문 앞부분을 그대로 잘라 summary를 만들기 때문에, 상세 화면에서 summary와 content가 거의 같은 문장으로 중복 표시될 수 있었다.

수정 확인:

- `shouldShowSummary()`를 추가해 상세 화면에서만 중복 요약 카드를 숨기도록 했다.
- 목록 화면의 summary 표시는 그대로 유지했다.

브라우저 재검증 결과:

- [x] `/posts/30` 상세 화면에서 QA 본문 시작 문장이 한 번만 표시됐다.
- [x] GitHub repo URL이 정상 표시됐다.
- [x] `Unexpected Application Error`와 `[object Object]`가 보이지 않았다.
- [x] 댓글 수와 댓글 본문이 정상 표시됐다.

정리 예정:

- QA용 게시글, 댓글, 리뷰 요청 데이터는 검증 후 삭제한다.
- 현재 로그인 계정은 ADMIN / 승인 완료 상태로 복구한다.

## 2026-06-15 QA: 포트폴리오 프로젝트 등록/중복/재진입

목표: 포트폴리오 프로젝트 등록 후 화면 목록과 DB 저장 상태가 어긋나지 않는지 확인한다.

API QA:

- [x] 임시 STUDENT 계정으로 `POST /portfolio/projects` 호출 시 201 생성된다.
- [x] 생성 응답의 `repoFullName`은 소문자 `owner/repo`로 정규화된다.
- [x] 생성 직후 `GET /portfolio/projects` 목록에 방금 프로젝트가 보인다.
- [x] 대소문자만 다른 같은 repo를 다시 등록하면 400 중복 응답이 온다.
- [x] 중복 시 목록 total은 1개로 유지된다.
- [x] QA용 임시 사용자와 프로젝트를 삭제했다.

브라우저 QA:

- [x] 현재 로그인 계정을 STUDENT / 승인 완료로 임시 전환했다.
- [x] `/portfolio` 화면이 열린다.
- [x] 긴 GitHub repo URL을 입력하고 `GitHub 프로젝트 등록`을 누르면 프로젝트가 등록된다.
- [x] 등록 후 목록에 프로젝트가 1개로 보인다.
- [x] 같은 repo를 다시 등록하면 기존 프로젝트 선택 안내가 보인다.
- [x] 다른 화면에 갔다가 `/portfolio`로 돌아와도 프로젝트가 유지된다.
- [x] `GitHub 보기` 링크가 실제 repo URL을 가리킨다.
- [x] 긴 repo 이름으로도 페이지 가로 overflow가 없다.
- [x] 화면에 `Unexpected Application Error`와 `[object Object]`가 보이지 않는다.
- [x] QA용 프로젝트를 삭제했고 현재 로그인 계정을 ADMIN / 승인 완료로 복구했다.

검증 출력 요약:

```txt
create_status=201
created_project_visible=True
duplicate_status=400
duplicate_project_count=1
hasDuplicateNotice=True
hasRepoAfterReturn=True
hasHorizontalOverflow=False
```

## 2026-06-15 QA: 게시글 조회수와 댓글 수 반영

목표: 게시글 목록의 조회수와 댓글 수가 실제 상세 조회/댓글 작성 흐름과 맞게 반영되는지 확인한다.

TestClient QA:

- [x] 임시 STUDENT 사용자를 만들었다.
- [x] 임시 공개 게시글을 만들었다.
- [x] 게시글 생성 직후 목록에서 `views=0`, `comments=0`을 확인했다.
- [x] 상세 첫 조회 후 상세 응답에서 `views=1`을 확인했다.
- [x] 상세 첫 조회 후 목록 재조회에서 `views=1`, `comments=0`을 확인했다.
- [x] 댓글 작성 API가 201을 반환했다.
- [x] 댓글 작성 후 목록 재조회에서 `views=1`, `comments=1`을 확인했다.
- [x] 상세 두 번째 조회 후 상세 응답에서 `views=2`, `comments=1`을 확인했다.
- [x] 상세 두 번째 조회 후 목록 재조회에서 `views=2`, `comments=1`을 확인했다.
- [x] QA용 댓글, 태그 연결, 게시글, 임시 사용자를 삭제했다.

검증 출력 요약:

```txt
list_before.views=0
list_before.comments=0
detail_first_views=1
list_after_first_detail.views=1
comment_status=201
list_after_comment.comments=1
detail_second_views=2
detail_second_comments=1
list_after_second_detail.views=2
list_after_second_detail.comments=1
```

결론:

- 현재 게시글 목록/상세의 조회수와 댓글 수는 실제 API 기준으로 일치한다.
- 이 항목은 코드 수정 없이 QA 통과로 기록한다.

## 2026-06-15 QA: 코치 리뷰 요청 대상 선택

목표: 학생이 게시글을 작성한 직후 코치 리뷰 요청 화면에서 해당 게시글을 리뷰 대상으로 선택할 수 있는지 확인한다.

API QA:

- [x] 임시 STUDENT와 임시 COACH를 만들었다.
- [x] STUDENT로 `POST /posts`를 호출해 게시글을 작성했다.
- [x] `GET /me/posts?visibility=all&size=50` 목록에 방금 게시글이 포함됐다.
- [x] `GET /review-requests/coaches` 목록에 임시 COACH가 포함됐다.
- [x] 방금 게시글 id로 `POST /review-requests`를 호출하면 201이 반환됐다.
- [x] 생성된 리뷰 요청의 `targetTitle`이 방금 게시글 제목과 일치했다.
- [x] `GET /review-requests/me` 목록에 방금 요청이 포함됐다.
- [x] API QA용 임시 데이터는 삭제했다.

브라우저 QA:

- [x] 현재 로그인 계정을 STUDENT / 승인 완료로 전환했다.
- [x] 임시 코치 `QA Browser Coach`를 만들었다.
- [x] `/posts/new`에서 새 게시글을 작성하고 발행했다.
- [x] 작성 후 `/posts/:id` 상세 화면으로 이동했다.
- [x] `/coach-review`에서 방금 게시글이 `리뷰 대상 선택` select option에 보였다.
- [x] 선택한 대상 미리보기에 제목과 본문 요약이 보였다.
- [x] 리뷰 요청을 보내면 안내 문구가 보였다.
- [x] 내가 보낸 요청 목록에 방금 게시글이 `대기 중` 상태로 보였다.
- [x] 화면에 `Unexpected Application Error`와 `[object Object]`가 보이지 않았다.
- [x] QA용 리뷰 요청, 알림, 게시글, 임시 코치를 삭제했다.
- [x] 현재 로그인 계정을 ADMIN / 승인 완료로 복구했다.

검증 출력 요약:

```txt
post_visible_in_targets=True
coach_visible=True
create_review_status=201
review_visible_in_my_requests=True
titleInBody=True
hasNotice=True
requestListHasTitle=True
hasPending=True
```

결론:

- 게시글 작성 후 코치 리뷰 대상 목록에 나타나는 흐름은 실제 API와 브라우저 기준으로 정상이다.

## 2026-06-15 QA: AI 도우미 보관함 UX와 복사 버튼

목표: AI 연결 전 화면에서도 AI 도우미가 실제 서비스처럼 보이고, 결과 관리/복사 버튼이 자연스럽게 동작하는지 확인한다.

소스 QA:

- [x] 프론트 소스에서 `AI 단계 예정` 문구가 사라졌다.
- [x] 프론트 소스에서 `AI 연결 단계` 문구가 사라졌다.
- [x] 프론트 소스에서 사용자 화면에 보일 수 있는 `mock`, `debug`, `backend/uploads`, `S3`, `로컬 개발` 문구가 잡히지 않았다.
- [x] 포트폴리오 상세의 면접 질문 badge는 `준비 중`으로 보인다.
- [x] AI 도우미의 보관함 제목은 `생성 결과 보관함`이다.

브라우저 QA:

- [x] `/ai-assistant` 빈 상태에서 `Unexpected Application Error`가 보이지 않았다.
- [x] `/ai-assistant` 빈 상태에서 `[object Object]`가 보이지 않았다.
- [x] `/portfolio` 빈 상태에서 개발/debug 문구가 보이지 않았다.
- [x] QA용 포트폴리오 프로젝트를 임시 생성했다.
- [x] `/ai-assistant?project=...&type=interview`에서 `생성 결과 보관함`이 보였다.
- [x] 면접 질문 결과 유형에서 `현재 생성된 면접 질문` 영역이 보였다.
- [x] 복사 버튼은 1개로 명확하게 잡혔다.
- [x] 복사 버튼 클릭 후 클립보드에 생성 결과 텍스트가 들어갔다.
- [x] 복사 성공 안내 `결과를 복사했습니다.`가 보였다.
- [x] QA용 임시 포트폴리오 프로젝트를 삭제했다.

검증 출력 요약:

```txt
hasDebugText=[]
hasObjectObject=false
hasStorageTitle=true
hasInterviewStorage=true
copyCount=1
clipboardLength=486
hasSuccessNotice=true
```

빌드 QA:

- [x] `npm run build` 성공
- [x] `git diff --check` 통과

결론:

- AI 도우미는 아직 실제 OpenAI/RAG/MCP/Agent를 호출하지 않지만, 프로젝트 기반 생성 결과 보관함과 복사 흐름은 UI 기준으로 자연스럽게 동작한다.

## 2026-06-15 QA: 프로필 이미지 업로드와 아바타 응답 전파

목표: 프로필 이름/이미지 수정이 실제 API 기준으로 동작하고, 업로드 이미지가 주요 사용자 표시 응답까지 전달되는지 확인한다.

API QA:

- [x] 임시 STUDENT 사용자를 만들었다.
- [x] 임시 COACH 사용자를 만들었다.
- [x] STUDENT access token cookie로 `PATCH /me/profile`을 호출했다.
- [x] 1x1 PNG 파일을 `profileImage` multipart field로 업로드했다.
- [x] 프로필 수정 응답이 200을 반환했다.
- [x] 응답 이름이 수정된 이름과 일치했다.
- [x] 응답 `profileImageUrl`이 `/uploads/profiles/`로 시작했다.
- [x] 실제 업로드 파일이 생성됐다.
- [x] `/auth/me` 응답이 수정된 이름과 이미지 URL을 반환했다.
- [x] Google profile 재동기화가 수정한 이름을 덮어쓰지 않았다.
- [x] Google profile 재동기화가 업로드 이미지를 덮어쓰지 않았다.
- [x] 게시글 생성 응답의 `authorProfileImageUrl`이 업로드 이미지 URL과 일치했다.
- [x] 댓글 생성 응답의 `authorProfileImageUrl`이 업로드 이미지 URL과 일치했다.
- [x] 댓글 목록 응답의 `authorProfileImageUrl`이 업로드 이미지 URL과 일치했다.
- [x] 리뷰 요청 생성 응답의 `requesterProfileImageUrl`이 업로드 이미지 URL과 일치했다.
- [x] 리뷰 요청 생성 응답의 `coachProfileImageUrls`에 코치 이미지 URL이 포함됐다.
- [x] QA용 사용자, 게시글, 댓글, 리뷰 요청, 업로드 파일을 삭제했다.

브라우저 QA:

- [x] `/settings` 화면이 열린다.
- [x] 프로필 이미지 선택 UI가 보인다.
- [x] 이름 입력 UI가 보인다.
- [x] 프로필 저장 버튼이 보인다.
- [x] file input이 실제 DOM에 있다.
- [x] 화면에 `Unexpected Application Error`가 보이지 않는다.
- [x] 화면에 `[object Object]`가 보이지 않는다.
- [x] 화면에 개발/debug 문구가 보이지 않는다.

검증 출력 요약:

```txt
profile_status=200
profile_image_url_prefix_ok=True
uploaded_file_exists=True
me_image_matches=True
relogin_keeps_custom_name=True
relogin_keeps_uploaded_image=True
post_author_image_matches=True
comment_author_image_matches=True
comments_list_image_matches=True
review_requester_image_matches=True
review_coach_image_matches=True
qa_profile_users=0
qa_profile_uploads=0
```

주의:

- TestClient 실행 중 `StarletteDeprecationWarning`이 출력됐지만 기능 실패는 아니다.
- 실제 브라우저 파일 선택 자동화는 현재 도구에서 직접 파일 주입 API를 쓰지 않았으므로, 브라우저에서는 설정 화면 UI 존재 여부까지 확인했다.

## 2026-06-15 QA: 학생 게시글 작성/상세/댓글/수정/삭제/내 기록 흐름

목표: 학생 계정으로 게시글 CRUD와 댓글 작성, 내 기록 반영 흐름을 실제 브라우저에서 확인한다.

브라우저 QA:

- [x] 현재 로그인 사용자를 STUDENT / 승인 완료로 임시 전환했다.
- [x] `/posts/new`가 열린다.
- [x] 작성 화면에 `새 게시글 작성` 제목이 보인다.
- [x] 작성 화면에 `관련 커밋` 문구가 보이지 않는다.
- [x] 작성 화면에 `관련 GitHub repo` 영역이 보인다.
- [x] 제목, 본문, GitHub repo URL을 입력할 수 있다.
- [x] `발행하기` 버튼을 누르면 상세 화면 `/posts/:id`로 이동한다.
- [x] 상세 화면에 작성한 본문이 보인다.
- [x] 상세 화면에 관련 GitHub repo URL이 보인다.
- [x] 상세 화면에 `GitHub 보기` 버튼이 보인다.
- [x] 댓글 입력창에 댓글을 작성할 수 있다.
- [x] 댓글 작성 후 댓글 수가 1로 바뀐다.
- [x] 댓글 작성 후 빈 댓글 문구가 사라진다.
- [x] 댓글 작성 시간이 raw ISO 문자열로 보이는 문제를 발견했다.
- [x] 댓글 작성 시간을 한국식 날짜/시간으로 포맷팅하도록 수정했다.
- [x] 새로고침 후에도 댓글이 보인다.
- [x] 새로고침 후 댓글 작성 시간이 `2026. 06. 15. 오후 11:41`처럼 보인다.
- [x] `/my-records`에서 작성한 글이 보인다.
- [x] `/my-records`에서 댓글 수와 조회수가 보인다.
- [x] `/posts/:id/edit`에서 기존 제목이 폼에 채워진다.
- [x] 수정 완료 후 상세 화면에 수정한 제목과 본문이 반영된다.
- [x] 삭제 버튼을 누르면 삭제 확인 UI가 열린다.
- [x] 삭제 확인 후 `/posts` 목록으로 이동한다.
- [x] 삭제한 글은 전체 게시글 목록에 보이지 않는다.
- [x] QA용 게시글과 댓글을 DB에서 삭제했다.
- [x] 현재 로그인 사용자를 ADMIN / 승인 완료로 복구했다.

검증 출력 요약:

```txt
newPost.hasCommitText=false
newPost.hasGithubRepoText=true
afterPublish.url=/posts/35
afterPublish.hasBody=true
afterPublish.hasGithub=true
afterPublish.hasGithubButton=true
afterComment.hasComment=true
afterComment.hasCommentCountOne=true
afterReload.hasRawIsoCommentDate=false
afterReload.hasKoreanDateTime=true
myRecords.hasTitle=true
myRecords.hasCommentCount=true
editInitial.titleMatches=true
editAfter.hasEditedTitle=true
deleteAfter.isPostsList=true
deleteAfter.hasDeletedTitle=false
cleanup.post_exists=0
cleanup.comments=0
restore.user_role=ADMIN
```

빌드 전 확인:

- [x] 화면에 `Unexpected Application Error`가 보이지 않았다.
- [x] 화면에 `[object Object]`가 보이지 않았다.

결론:

- 학생 게시글 작성/상세/댓글/내 기록/수정/삭제 흐름은 실제 브라우저와 API 기준으로 정상이다.
- 발견된 댓글 시간 raw ISO 표시는 `formatDateTime()`으로 수정했다.

---

## 2026-06-15 QA: API refresh retry�� ��ġ ���� �ιڽ�

��ǥ: access token ����/ĳ�� ��Ȳ������ ���� API�� refresh �� ��õ��ǰ�, ��ġ ���� �ιڽ� ���°� �ֽ� DB/API ���¿� ��ġ�ϴ��� Ȯ���Ѵ�.

üũ����Ʈ:

- [x] `frontend/src/app/api/client.ts`�� `apiFetch()`�� �ִ�.
- [x] ���� API�� `fetch` ��� `apiFetch`�� ����Ѵ�.
- [x] `/auth/me`, `/auth/refresh`, `/auth/logout`�� `cache: "no-store"`�� ����Ǿ� �ִ�.
- [x] ��ġ ���� ��ȸ API�� `cache: "no-store"`�� ����Ǿ� �ִ�.
- [x] ���� `localhost:8000 /review-requests/inbox`�� `�ǵ�� �Ϸ�` ���¸� ��ȯ�Ѵ�.
- [x] ���������� ��ġ �ιڽ��� `�ǵ�� �Ϸ�` ���¸� ǥ���Ѵ�.
- [x] QA ������ ���� �� ���� ����ڰ� `ADMIN / ���� �Ϸ�` ���·� �����ȴ�.
- [x] ������ ���̵�ٿ� `��ú���`�� ������ �ʴ´�.
- [x] ������ ���̵�ٴ� `����� ���� / ��ü �Խñ� / ����`���� ���δ�.
- [x] `npm run build`�� �����Ѵ�.

�߰��� ����:

- ���� �� �ִ� Vite dev server�� HMR state�� ��� �־� `useAuth�� AuthProvider �ȿ����� ����� �� �ֽ��ϴ�` ������ �߻��ߴ�.
- DB/API�� �ֽ��ε� ������ ȭ���� ������ `��� ��` ���¸� �������.

�ذ�:

- ���� `apiFetch()`�� 401 refresh retry�� �߰��ߴ�.
- ����/��ȸ API�� `cache: "no-store"`�� �����ߴ�.
- 6�� 13�Ϻ��� �� �ִ� Vite dev server�� ������ߴ�.

---

## 2026-06-16 QA: AI 도우미 면접 질문 저장 흐름

목표: AI 도우미에서 생성한 면접 예상 질문이 포트폴리오 프로젝트에 저장되고, 포트폴리오 목록 응답에서 다시 확인되는지 검증한다.

체크리스트:

- [x] `portfolio_projects.saved_interview_questions` column이 준비된다.
- [x] `PATCH /portfolio/projects/{project_id}`가 `savedInterviewQuestions`를 받는다.
- [x] `GET /portfolio/projects` 응답에 `savedInterviewQuestions`가 포함된다.
- [x] `GET /portfolio/projects` 응답에 `aiInterviewSaved`가 포함된다.
- [x] AI 도우미에서 면접 질문 결과 저장 버튼 문구가 `면접 질문 보관함에 저장`으로 보인다.
- [x] 포트폴리오 관리 화면에서 저장된 면접 질문과 저장 상태 badge를 볼 수 있다.
- [x] `python -m compileall app`가 성공한다.
- [x] `npm run build`가 성공한다.

검증 출력 요약:

```txt
init_db_ok
create_status=201
patch_status=200
saved_interview_questions=True
ai_interview_saved=True
list_has_saved_interview=True
cleanup_user=True
cleanup_project=True
```

남은 QA:

- 실제 브라우저에서 AI 도우미 -> 면접 질문 저장 -> 포트폴리오 화면 재확인 흐름을 클릭으로 한 번 더 확인한다.

---

## 2026-06-16 QA: AI ����� ���� ���� ���� �帧

��ǥ: AI ����̿��� ������ ���� ���� ������ ��Ʈ������ ������Ʈ�� ����ǰ�, ��Ʈ������ ��� ���信�� �ٽ� Ȯ�εǴ��� �����Ѵ�.

üũ����Ʈ:

- [x] `portfolio_projects.saved_interview_questions` column�� �غ�ȴ�.
- [x] `PATCH /portfolio/projects/{project_id}`�� `savedInterviewQuestions`�� �޴´�.
- [x] `GET /portfolio/projects` ���信 `savedInterviewQuestions`�� ���Եȴ�.
- [x] `GET /portfolio/projects` ���信 `aiInterviewSaved`�� ���Եȴ�.
- [x] AI ����̿��� ���� ���� ��� ���� ��ư ������ `���� ���� �����Կ� ����`���� ���δ�.
- [x] ��Ʈ������ ���� ȭ�鿡�� ����� ���� ������ ���� ���� badge�� �� �� �ִ�.
- [x] `python -m compileall app`�� �����Ѵ�.
- [x] `npm run build`�� �����Ѵ�.

���� ��� ���:

```txt
init_db_ok
create_status=201
patch_status=200
saved_interview_questions=True
ai_interview_saved=True
list_has_saved_interview=True
cleanup_user=True
cleanup_project=True
```

���� QA:

- ���� ���������� AI ����� -> ���� ���� ���� -> ��Ʈ������ ȭ�� ��Ȯ�� �帧�� Ŭ������ �� �� �� Ȯ���Ѵ�.

---

## 2026-06-16 QA: ��Ʈ������ �� ���� ���� ����

��ǥ: ��Ʈ������ ������Ʈ ��� ���� ���� �ܰ� ������ API ������ó�� ����ǰų� ȭ�鿡 ������� �ʴ��� �����Ѵ�.

üũ����Ʈ:

- [x] �� ������Ʈ ���� �� `readme_summary`�� `None`���� ����ȴ�.
- [x] �� ������Ʈ ���� �� `recent_commit_summary`�� `None`���� ����ǰ� API ���信���� �� �迭�� ���δ�.
- [x] �� ������Ʈ ���� �� `saved_portfolio_draft`�� `None`���� ����ȴ�.
- [x] ���� `GitHub README�� AI ���� �ܰ迡�� ���� �ڷ�� ����� �����Դϴ�.` ������ ���信�� `None`���� �����ȴ�.
- [x] ���� `MCP/GitHub API ���� �� ����` ������ ���信�� �� �迭�� �����ȴ�.
- [x] ��Ʈ������ ȭ���� �� Ŀ�� ��࿡ ���� ����ڿ� empty state�� �����ش�.
- [x] AI ����̿� ��Ʈ������ ȭ���� README fallback ������ `���� README ����� �����ϴ�.`�� ���ϵȴ�.

���� ��� ���:

```txt
new_readme_is_none=True
new_recent_commit_summary=[]
new_saved_draft_is_none=True
legacy_readme_is_none=True
legacy_recent_commit_summary=[]
legacy_saved_draft_is_none=True
cleanup=True
```

�޸�:

- PowerShell here-string���� Python�� �ѱ� ���ͷ��� ���� �Ѱ��� �� ���ڵ��� ���� 1�� ���Ž� exact match ������ �����ߴ�.
- ���� Python���� service ����� ���� ����� ���� ������ �ٽ� �����߰� ���� ����ߴ�.

---

## 2026-06-16 QA: ��ġ ���� �ιڽ��� �ǵ�� �պ� �帧

��ǥ: �л��� ���� ���� ��û�� ������ ��ġ �ιڽ����� ���̰�, ��ġ�� ������ �ǵ���� �л� ��û ��ϰ� �˸��� �ݿ��Ǵ��� �����Ѵ�.

üũ����Ʈ:

- [x] �л� �Խñ��� ���� ��û ������� ���� �� �ִ�.
- [x] �л��� ���� ��ġ���� ���� ��û�� ����� ���°� `��� ��`�̴�.
- [x] �л��� `���� ���� ��û ���`�� �ش� ��û�� ���δ�.
- [x] ������ ��ġ�� �ιڽ����� ��û�� ���δ�.
- [x] �������� ���� �ٸ� ��ġ�� �ιڽ����� ��û�� ������ �ʴ´�.
- [x] �������� ���� ��ġ�� ���� ��û�� ������ �� ����.
- [x] ������ ��ġ�� `�ǵ�� �Ϸ�` ���¿� �ǵ�� ������ ������ �� �ִ�.
- [x] �л��� ��û ��Ͽ��� ��ġ�� ������ ���¿� �ǵ���� �ݿ��ȴ�.
- [x] �л����� `review-feedback` �˸��� �����ȴ�.
- [x] ��ġ �ιڽ� ���� ���� �� �� �гε� ���͵� ��û �������� ǥ�õȴ�.

���� ��� ���:

```txt
created_status=��� ��
student_has_request_before=True
coach_inbox_count_before=1
other_inbox_count_before=0
unauthorized_error_exists=True
updated_status_is_feedback_done=True
updated_feedback=Problem definition and solution flow are clear.
student_status_after_is_feedback_done=True
student_feedback_after=Problem definition and solution flow are clear.
student_notification_count=1
student_latest_notification_type=review-feedback
coach_request_notification_count=1
cleanup=True
```

�޸�:

- PowerShell pipe���� �ѱ� ���� ���ڿ��� ���� �� �־� QA ��ũ��Ʈ������ `�ǵ�� �Ϸ�`�� �����ڵ� escape�� �־� �����ߴ�.

---

## 2026-06-16 QA: ���� ���� ���� UI ����

��ǥ: ���� API�� ���� UI ��ҿ� placeholder �����Ͱ� ����� ȭ�鿡 ���� ���/������ó�� ������ �ʴ��� Ȯ���Ѵ�.

üũ����Ʈ:

- [x] �Խñ� �ۼ� ȭ�鿡 `�ӽ�����` ��ư�� ����.
- [x] �Խñ� �ۼ� ȭ�鿡 `�ӽ������� �غ� ���Դϴ�` ������ ����.
- [x] �Խñ� �ۼ� ȭ���� ���� API�� ����� `�����ϱ�` �Ǵ� `���� �Ϸ�` ��ư�� �����Ѵ�.
- [x] ��Ʈ������ ������Ʈ ���� �� �⺻ `techStack`�� `['GitHub']`�̴�.
- [x] ���� `GitHub\n�м� ����` ��� ���õ� API ���信���� `['GitHub']`�� �����ȴ�.
- [x] ����� ȭ�� �˻����� `�ӽ�����`, `�غ� ���Դϴ�`, `TODO backend`�� ���� �ʾҴ�.

���� ��� ���:

```txt
created_tech_stack=['GitHub']
legacy_filtered_tech_stack=['GitHub']
legacy_placeholder_removed=True
cleanup=True
```

---

## 2026-06-16 QA: 파트 단위 커밋 운영 기준

목표: 이후 작업이 구현만 되고 기록 없이 넘어가지 않도록 커밋 운영 기준을 문서화했는지 확인한다.

체크리스트:

- [x] `docs/agent/agent.md`에 파트 단위 커밋 순서를 추가했다.
- [x] 구현/문서/QA가 끝난 뒤 커밋한다는 기준을 남겼다.
- [x] `backend/.env`는 절대 커밋하지 않는다는 주의사항을 남겼다.
- [x] 문서 변경 후 `npm run build`를 실행했다.
- [x] 문서 변경 후 백엔드 compile을 실행했다.
- [x] `git diff --check`를 실행했다.

검증 결과:

```txt
npm run build: 성공
python -m compileall app: 성공
git diff --check: 공백 오류 없음, Windows 줄바꿈 경고만 표시
```

---

## 2026-06-16 QA: 학생 핵심 흐름 DB/API 감사

목표: 학생 화면 완료 기준 중 API/DB 데이터 흐름으로 검증해야 하는 항목을 실제 서비스 함수 기준으로 확인한다.

체크리스트:

- [x] GitHub repo URL로 포트폴리오 프로젝트를 등록할 수 있다.
- [x] 등록 직후 `get_portfolio_projects` 목록에 해당 프로젝트가 보인다.
- [x] 같은 repo를 다시 등록하면 중복으로 차단된다.
- [x] 프로젝트에 게시글/학습 기록을 연결할 수 있다.
- [x] 포트폴리오 상태를 `보완 필요`로 저장할 수 있다.
- [x] 포트폴리오 초안을 프로젝트에 저장할 수 있다.
- [x] 면접 예상 질문을 프로젝트에 저장할 수 있다.
- [x] 게시글 작성 후 `get_my_posts`에서 해당 게시글이 조회된다.
- [x] 댓글 작성 후 댓글 목록 total이 1로 보인다.
- [x] 게시글 상세 조회 시 조회수가 증가한다.
- [x] 게시글 상세 응답의 댓글 수가 실제 댓글 수와 일치한다.
- [x] 학생이 작성한 게시글을 코치 리뷰 대상으로 요청할 수 있다.
- [x] 요청받은 코치 인박스에 해당 리뷰 요청이 보인다.
- [x] 코치가 `최종 확인`과 피드백을 저장하면 학생 요청 목록에 반영된다.
- [x] QA 데이터는 검증 후 삭제했다.

검증 출력 요약:

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

메모:

- PowerShell에서 Python stdin으로 한글 상태값을 직접 넘기면 깨질 수 있어 유니코드 escape로 검증했다.
- cleanup 시 `post_tags` 연결 테이블을 먼저 삭제해야 `posts` 삭제 FK 오류가 나지 않는다.

---

## 2026-06-16 QA: 코치 화면 브라우저 smoke

목표: 코치 role로 실제 브라우저 화면을 열었을 때 메뉴, 접근 제한, 에러 표시가 의도대로 동작하는지 확인한다.

체크리스트:

- [x] 코치 세션으로 `/coach-review`가 열린다.
- [x] 코치 세션으로 `/posts`가 열린다.
- [x] 코치 세션으로 `/settings`가 열린다.
- [x] 코치 메뉴에 `대시보드`가 보이지 않는다.
- [x] 코치가 `/portfolio`에 직접 접근하면 학생용 화면 본문 대신 접근 제한 안내가 보인다.
- [x] 코치가 `/ai-assistant`에 직접 접근하면 접근 제한 안내가 보인다.
- [x] 코치가 `/my-records`에 직접 접근하면 접근 제한 안내가 보인다.
- [x] 확인한 화면에 `Unexpected Application Error`가 보이지 않는다.
- [x] 확인한 화면에 `[object Object]`가 보이지 않는다.
- [x] QA용 임시 사용자, 토큰, 리뷰 요청 데이터를 삭제했다.

검증 출력 요약:

```txt
/coach-review: hasUnexpectedError=false, hasObjectObject=false, hasDashboardMenu=false
/posts: hasUnexpectedError=false, hasObjectObject=false, hasDashboardMenu=false
/settings: hasUnexpectedError=false, hasObjectObject=false, hasDashboardMenu=false
/portfolio: accessBlocked=true, hasPortfolioManager=false
/ai-assistant: accessBlocked=true, hasPortfolioManager=false
/my-records: accessBlocked=true, hasPortfolioManager=false
cleanup_done=True
```

---

## 2026-06-16 QA: 프로필 수정과 이미지 업로드

목표: 이름 수정과 실제 프로필 이미지 업로드가 API, DB, 정적 파일 서빙, 재로그인 정책까지 이어지는지 확인한다.

체크리스트:

- [x] `PATCH /me/profile`이 200을 반환한다.
- [x] 사용자가 입력한 이름이 응답에 반영된다.
- [x] 업로드한 이미지는 `/uploads/profiles/...` 경로로 저장된다.
- [x] `GET /auth/me`에서 수정한 이름이 유지된다.
- [x] 업로드 이미지 URL을 정적 파일로 조회하면 200을 반환한다.
- [x] 같은 Google 계정으로 다시 로그인해도 사용자가 수정한 이름은 덮어써지지 않는다.
- [x] 같은 Google 계정으로 다시 로그인해도 사용자가 업로드한 프로필 이미지는 덮어써지지 않는다.
- [x] QA 사용자와 업로드 파일은 검증 후 삭제했다.

검증 출력 요약:

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

---

## 2026-06-16 QA: 학생 화면 브라우저 최종 smoke

목표: 학생 role로 실제 브라우저 화면을 눌러보며 학생 화면 안정화 완료 기준을 검증한다.

체크리스트:

- [x] 학생 세션으로 대시보드가 열린다.
- [x] 학생 메뉴에 내 기록, 포트폴리오 관리, AI 도우미, 코치 리뷰 요청이 보인다.
- [x] 전체 게시글 화면이 열린다.
- [x] 게시글 작성 화면에서 관련 커밋 없이 관련 GitHub repo만 입력할 수 있다.
- [x] 게시글 발행 후 상세 화면으로 이동한다.
- [x] 상세 화면에서 댓글 작성이 화면에 반영된다.
- [x] 상세 화면에 `관련 커밋` 문구가 보이지 않는다.
- [x] 내 기록 화면에서 방금 작성한 게시글이 보인다.
- [x] 포트폴리오 관리에서 긴 GitHub repo URL을 등록할 수 있다.
- [x] 포트폴리오 관리에서 저장된 포트폴리오 초안 영역과 면접 예상 질문 영역이 보인다.
- [x] 다른 화면으로 이동했다가 돌아와도 등록한 프로젝트가 목록에 유지된다.
- [x] 같은 repo를 다시 등록하면 중복 안내가 보이고 기존 프로젝트가 선택/표시된다.
- [x] `GitHub 보기` 링크는 실제 repo URL을 가리키고 새 탭 대상이다.
- [x] 포트폴리오 관리에서 AI 도우미로 이동할 수 있다.
- [x] AI 도우미에 생성 결과 보관함이 보인다.
- [x] 코치 리뷰 요청 화면에서 작성한 게시글이 리뷰 대상에 보인다.
- [x] 코치 리뷰 요청 화면에서 포트폴리오 프로젝트 유형으로 전환하면 등록한 프로젝트가 리뷰 대상에 보인다.
- [x] 설정 화면이 열린다.
- [x] 확인한 화면에 `Unexpected Application Error`가 보이지 않는다.
- [x] 확인한 화면에 `[object Object]`가 보이지 않는다.
- [x] 확인한 화면에 `mock`, `debug`, `로그인됨`, `백엔드 데이터` 같은 개발 확인 문구가 보이지 않는다.
- [x] QA 사용자, 토큰, 게시글, 댓글, 프로젝트는 검증 후 삭제했다.

검증 출력 요약:

```txt
dashboard.hasStudentMenu=True
createdPostId=46
commentAdded=True
detailHasGithubLink=True
detailNoRelatedCommit=True
myRecords.hasCreatedPost=True
portfolioAfterRegister.hasLongRepo=True
portfolioAfterRegister.hasGithubButton=True
portfolioAfterRegister.hasSavedDraftArea=True
portfolioAfterRegister.hasInterviewArea=True
portfolioDirectAfterPriorRegistration.hasRepoNeedle=True
portfolioDuplicate.hasDuplicateNotice=True
portfolioDuplicate.stillShowsProject=True
githubView.validHref=True
githubView.opensNewTab=True
aiAssistant.hasStorage=True
aiAssistant.hasProjectSelected=True
coachReview.hasCreatedPostTarget=True
reviewPortfolioTarget.hasRepoNeedle=True
overall.noUnexpectedErrors=True
overall.noObjectObjects=True
cleanup_done=True
```

---

## 2026-06-16 QA: 긴 repo 카드 레이아웃

목표: 포트폴리오 카드에서 긴 repo 이름 때문에 상태 badge나 레이아웃이 깨지지 않는지 확인한다.

체크리스트:

- [x] 긴 repo 이름을 가진 프로젝트 카드가 화면에 표시된다.
- [x] `작성중` 상태 badge가 카드 bounding box 안에 있다.
- [x] `코치` 상태 badge가 카드 bounding box 안에 있다.
- [x] 긴 repo 이름 때문에 전체 문서에 가로 스크롤이 생기지 않는다.
- [x] 화면에 `Unexpected Application Error`와 `[object Object]`가 보이지 않는다.
- [x] QA 프로젝트와 사용자는 검증 후 삭제했다.

검증 출력 요약:

```txt
found=True
statusInsideCard=True
coachInsideCard=True
horizontalOverflow=False
bodyHasError=False
cleanup_done=True
```

---

## 2026-06-16 QA: GitHub REST API 연동

목표: 포트폴리오 프로젝트 등록/새로고침에 사용할 GitHub REST API service가 실제 public repo를 읽을 수 있는지 확인한다.

체크리스트:

- [x] 백엔드 Python compile이 성공한다.
- [x] 프론트엔드 `npm run build`가 성공한다.
- [x] `github_service.analyze_repository("octocat/Hello-World")`가 실제 GitHub API 응답을 반환한다.
- [x] repo full name과 GitHub URL을 읽는다.
- [x] README 존재 여부를 확인한다.
- [x] 최근 커밋 목록을 가져온다.
- [x] public repo는 `GITHUB_TOKEN` 없이 조회 가능하다.

검증 출력 요약:

```txt
python -m compileall app: success
npm run build: success
repo_full_name=octocat/hello-world
github_url=https://github.com/octocat/Hello-World
tech_stack=['GitHub']
recent_commit_count=3
has_readme=True
```

추가 수동 QA:

- [ ] 로그인한 학생 계정으로 `/portfolio`에서 public GitHub repo URL을 직접 등록한다.
- [ ] 등록 후 README/최근 커밋/언어가 화면에 반영되는지 확인한다.
- [ ] `GitHub 정보 새로고침` 버튼이 실제 API를 호출해 notice를 보여주는지 확인한다.
- [ ] private repo 연동이 필요하면 `backend/.env`에 `GITHUB_TOKEN`을 추가한 뒤 다시 확인한다.

---

## 2026-06-16 QA: GitHub 연동 UI 브라우저 smoke

목표: GitHub 연동 후 포트폴리오 화면과 역할별 홈 링크가 브라우저에서 깨지지 않는지 확인한다.

체크리스트:

- [x] 현재 ADMIN 세션에서 JungleLog 로고 링크가 `/admin/users`를 가리킨다.
- [x] `/coach-review` 화면에 `Unexpected Application Error`가 보이지 않는다.
- [x] `/coach-review` 화면에 `[object Object]`가 보이지 않는다.
- [x] 주요 화면에 `max-w-7xl` 컨테이너가 렌더링된다.
- [x] `/portfolio` 화면이 열린다.
- [x] `/portfolio` 화면에 GitHub repo URL 입력창이 보인다.
- [x] `/portfolio` 화면에 `GitHub 프로젝트 등록` 버튼이 보인다.

검증 출력 요약:

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

남은 수동 QA:

- [ ] 학생 계정으로 실제 public repo URL을 입력해 등록 버튼까지 클릭한다.
- [ ] 등록된 프로젝트의 README/최근 커밋/언어가 화면에 반영되는지 확인한다.

---

## 2026-06-16 QA: GitHub branch 기준 포트폴리오 관리

목표: GitHub branch 지원과 포트폴리오 관리 화면 정리가 기존 흐름을 깨지 않는지 확인한다.

체크리스트:

- [x] 백엔드 compile이 성공한다.
- [x] 프론트엔드 `npm run build`가 성공한다.
- [x] `init_db()`가 `github_branch` 컬럼과 unique index 보강 후 정상 종료된다.
- [x] branch 없는 repo 분석 시 GitHub default branch가 저장된다.
- [x] `https://github.com/octocat/Hello-World/tree/master`에서 repo와 branch가 분리된다.
- [x] `/portfolio` 화면이 에러 없이 열린다.
- [x] `/portfolio` 화면에 branch URL 입력 안내가 보인다.
- [x] `/portfolio` 화면에 GitHub 프로젝트 등록 버튼이 보인다.
- [x] `/portfolio` 화면에서 검색 placeholder에 branch가 포함된다.
- [x] 화면에 `Unexpected Application Error`와 `[object Object]`가 보이지 않는다.

검증 출력 요약:

```txt
python compile: success
npm run build: success
init_db ok
analyze_repository repo=octocat/hello-world
analyze_repository branch=master
recent_commit_count=3
has_readme=True
parse repo=octocat/hello-world
parse branch=master
portfolio screen has heading/input/register button/branch text
```

남은 수동 QA:

- [ ] 학생 계정으로 실제 `/tree/{branch}` URL을 등록한다.
- [ ] 같은 repo의 다른 branch를 별도 프로젝트로 등록할 수 있는지 확인한다.
- [ ] 등록 후 README와 최근 커밋이 branch 기준으로 바뀌는지 비교한다.

---

## 2026-06-16 QA: 포트폴리오 게시글 발행과 AI 도우미 UI

목표: 프로젝트 기반 포트폴리오 게시글 발행과 AI 도우미 UI 정리가 기존 데이터를 꼬이게 하지 않는지 확인한다.

체크리스트:

- [x] 백엔드 compile이 성공한다.
- [x] 프론트엔드 `npm run build`가 성공한다.
- [x] `init_db()`가 `published_post_id` 컬럼 보강 후 정상 종료된다.
- [x] 임시 프로젝트를 포트폴리오 게시글로 발행하면 `published_post_id`가 생긴다.
- [x] 발행된 게시글의 카테고리는 `portfolio`다.
- [x] 발행된 게시글 본문에 포트폴리오 글 전체가 포함된다.
- [x] 발행된 게시글 본문에 branch 정보가 포함된다.
- [x] QA 데이터는 검증 후 삭제했다.
- [x] `/ai-assistant` 화면이 에러 없이 열린다.
- [x] 프로젝트가 없을 때 AI 도우미 empty state가 보인다.

검증 출력 요약:

```txt
python compile: success
npm run build: success
init_db ok
publish response has published_post_id=True
published post category=portfolio
portfolio body included=True
branch body included=True
cleanup ok
ai bodyHasError=False
ai empty state visible=True
```

남은 수동 QA:

- [ ] 실제 학생 프로젝트에서 `포트폴리오 게시글로 발행` 버튼을 클릭한다.
- [ ] 발행 후 `게시글로 보기`로 이동해 전체 포트폴리오 글이 보이는지 확인한다.
- [ ] AI 도우미에서 프로젝트가 있을 때 결과 저장 버튼이 기존 저장 흐름을 유지하는지 확인한다.

---

## 2026-06-16 QA: 포트폴리오 관리 액션 버튼 UI 정리

목표: 포트폴리오 관리 화면의 버튼 위치와 스타일을 정리해도 기존 포트폴리오 데이터 흐름이 깨지지 않는지 확인한다.

체크리스트:

- [ ] 프론트엔드 `npm run build`가 성공한다.
- [ ] `/portfolio` 화면이 에러 없이 열린다.
- [ ] `포트폴리오 글` 섹션 제목 옆에 `AI 도우미에서 포트폴리오 글 만들기` 버튼이 보인다.
- [ ] `면접 예상 질문` 섹션 제목 옆에 `면접 질문 만들기` 버튼이 보인다.
- [ ] `코치 리뷰/피드백` 섹션 제목 옆에 `코치 리뷰 요청하기` 버튼이 보인다.
- [ ] `연결된 학습 기록` 섹션 제목 옆에 `기록 연결하기` 버튼이 보인다.
- [ ] 상단 액션 줄에는 `포트폴리오 게시글로 발행`, `게시글 보러가기`, `GitHub 보기`, `GitHub 정보 새로고침`만 남는다.
- [ ] 주요 액션 버튼이 연한 초록색 계열로 통일되어 보인다.
- [ ] 기존 API 호출 함수와 저장 필드가 바뀌지 않아 포트폴리오 프로젝트 값이 꼬이지 않는다.

검증 출력 요약:

```txt
아직 실행 전
```

검증 결과 업데이트:

```txt
npm run build: success
/portfolio browser smoke: success, no Unexpected Application Error
/portfolio current session: admin user with 0 projects, so project-detail action buttons are not visible in DOM
source label check: portfolio action labels are present in Portfolio.tsx
```

남은 수동 QA:

- [ ] 학생 계정에서 프로젝트가 1개 이상 있는 상태로 `/portfolio`에 들어가 섹션별 버튼 위치를 눈으로 확인한다.
- [ ] `게시글 보러가기`가 발행된 프로젝트에서 명확한 버튼처럼 보이는지 확인한다.

---

## 2026-06-16 QA: GitHub README 참고 정보 표시 개선

목표: GitHub 참고 정보와 README 참고 자료 설명이 추가되어도 기존 포트폴리오/AI 저장 흐름이 깨지지 않는지 확인한다.

체크리스트:

- [ ] 프론트엔드 `npm run build`가 성공한다.
- [ ] `/portfolio` 화면이 에러 없이 열린다.
- [ ] `/ai-assistant` 화면이 에러 없이 열린다.
- [ ] GitHub 참고 정보 영역에 `감지된 기술/문서 유형` 설명이 보인다.
- [ ] README는 `GitHub README 참고 자료`라는 설명과 함께 접힘 형태로 보인다.
- [ ] 기존 프로젝트 선택, AI 결과 저장, 포트폴리오 게시글 발행 API 흐름은 변경하지 않는다.

검증 출력 요약:

```txt
아직 실행 전
```

검증 결과 업데이트:

```txt
npm run build: success
/portfolio browser smoke: success after re-check, no Unexpected Application Error
/ai-assistant browser smoke: success, no Unexpected Application Error
current session: project count 0, so README detail area is verified by source label check
source label check: 감지된 기술/문서 유형, GitHub README 참고 자료 labels are present
```

---

## 2026-06-16 QA: 포트폴리오 게시글 상세 전용 UI 개선

목표: 포트폴리오 게시글 상세가 Markdown 문자열이 아니라 정돈된 포트폴리오 화면으로 보이는지 확인한다.

체크리스트:

- [ ] 프론트엔드 `npm run build`가 성공한다.
- [ ] `/posts/{portfolio_post_id}` 화면이 에러 없이 열린다.
- [ ] 제목에 `[포트폴리오]` prefix가 보이지 않는다.
- [ ] 본문에 `## GitHub`, `###` 같은 Markdown 기호가 그대로 보이지 않는다.
- [ ] 프로젝트 개요, GitHub 정보, 기술 스택, 연결된 학습 기록, 최근 커밋 요약, 코치 피드백 상태, 포트폴리오 글 섹션이 보인다.
- [ ] 일반 게시글 상세 렌더링은 기존 흐름을 유지한다.

검증 출력 요약:

```txt
아직 실행 전
```

검증 결과 업데이트:

```txt
npm run build: success
/posts/47 portfolio detail smoke: success
hasPortfolioPrefix=false
hasRawHeadingMarker=false
hasOverview=true
hasGithubInfo=true
hasTechStack=true
hasLinkedRecords=true
hasRecentCommits=true
hasCoachStatus=true
hasPortfolioText=true
titleLooksClean=true
/posts/1 normal detail smoke: success, no Unexpected Application Error, no missing post page
```

---

## 2026-06-16 QA: 포트폴리오 UI 개선 최종 점검

체크리스트:

- [x] 프론트엔드 `npm run build` 성공
- [x] 백엔드 `python -m compileall app` 성공
- [x] `/posts/47` 포트폴리오 상세가 에러 없이 열림
- [x] `/posts/47` 제목에 `[포트폴리오]` prefix가 보이지 않음
- [x] `/posts/47` 본문에 `## GitHub`, `###` 같은 Markdown 기호가 보이지 않음
- [x] `/posts/47`에 프로젝트 개요, GitHub 정보, 기술 스택, 연결된 학습 기록, 최근 커밋 요약, 코치 피드백 상태, 포트폴리오 글 섹션이 보임
- [x] `/posts/1` 일반 게시글 상세가 에러 없이 열림

검증 출력 요약:

```txt
npm run build: success
backend compileall: success
portfolio detail hasPortfolioPrefix=false
portfolio detail hasRawHeadingMarker=false
portfolio detail hasOverview=true
portfolio detail hasGithubInfo=true
portfolio detail hasTechStack=true
portfolio detail hasLinkedRecords=true
portfolio detail hasRecentCommits=true
portfolio detail hasCoachStatus=true
portfolio detail hasPortfolioText=true
normal detail hasError=false
normal detail hasPostMissing=false
```

---

## 2026-06-16 QA: 기술 스택 표시에서 Markdown 제거

체크리스트:

- [x] 프론트엔드 `npm run build` 성공
- [x] `/posts/47` 포트폴리오 상세가 에러 없이 열림
- [x] 구조화된 기술 스택 섹션에 `Markdown`이 보이지 않음
- [x] 기존 포트폴리오 글 본문에 남아 있던 `4. 기술 스택 / GitHub` 단독 표시가 안내 문구로 바뀜
- [x] README는 `GitHub README 참고 자료` 영역에서만 다룸

검증 출력 요약:

```txt
npm run build: success
/posts/47 portfolio detail smoke: success
structured tech stack: 아직 기술 스택이 등록되지 않았습니다.
portfolio text generic stack: 아직 GitHub에서 기술 스택을 충분히 감지하지 못했습니다.
hasBareGithubStackParagraph=false
hasMarkdownAsStack=false
```

---

## 2026-06-16 QA: 포트폴리오 게시글 발행 상태 구분

체크리스트:

- [x] 백엔드 `python -m compileall app` 성공
- [x] 프론트엔드 `npm run build` 성공
- [x] 처음 발행 시 `publishStatus=created`
- [x] 같은 내용 재발행 시 `publishStatus=unchanged`
- [x] 내용 변경 후 재발행 시 `publishStatus=updated`
- [x] 새 제목은 `프로젝트명 포트폴리오` 형식
- [x] QA 데이터 cleanup 완료

검증 출력 요약:

```txt
first created QA Publish Status Project 포트폴리오
second unchanged
compare False ...
third updated
cleanup ok
```

---

## 2026-06-16 QA: UX 안내 방식과 최고관리자 보호

목표: 포트폴리오 게시글 발행 공개 범위, toast/dialog UX, 최고관리자 보호가 기존 로그인/권한 흐름을 깨지 않는지 확인한다.

### 자동 검증

- [x] `frontend`: `npm run build`
- [x] `backend`: `.venv\Scripts\python.exe -m compileall app`
- [x] `git diff --check`

### 서비스 QA

- [x] 포트폴리오 게시글 첫 발행은 `created`를 반환한다.
- [x] 공개로 발행하면 게시글 `is_public=True`가 된다.
- [x] 같은 내용으로 다시 공개 발행하면 `unchanged`를 반환한다.
- [x] 공개 여부를 비공개로 바꾸면 `updated`를 반환한다.
- [x] 비공개 발행 후 게시글 `is_public=False`가 된다.
- [x] 같은 내용/같은 공개 여부로 다시 발행하면 `unchanged`를 반환한다.
- [x] 포트폴리오 게시글 제목에 `[포트폴리오]` prefix가 붙지 않는다.
- [x] `ADMIN_EMAILS` 계정은 `isSuperAdmin=True`로 내려온다.
- [x] `ADMIN_EMAILS` 계정의 role/status 변경 요청은 백엔드에서 거부된다.
- [x] 일반 사용자는 관리자가 COACH/승인 완료로 변경할 수 있다.

검증 출력:

```txt
portfolio_created= created True
portfolio_unchanged_public= unchanged
portfolio_visibility_updated= updated False
portfolio_unchanged_private= unchanged
portfolio_no_prefix= True QA Visibility Project 포트폴리오
super_admin_flag= True
super_admin_blocked= True
normal_user_update= COACH 승인 완료
```

### 남은 수동 QA

- [ ] 브라우저에서 포트폴리오 발행 버튼 클릭 시 공개/비공개 선택 dialog가 뜨는지 확인한다.
- [ ] 발행/갱신/최신 상태 안내가 화면 block이 아니라 toast로 뜨는지 확인한다.
- [ ] 게시글 삭제 버튼 클릭 시 삭제 확인 dialog가 뜨는지 확인한다.
- [ ] 관리자 화면에서 최고관리자 배지와 disabled 상태가 보이는지 확인한다.
---

## 2026-06-16 QA: 포트폴리오 발행 모달 UI 정리

체크리스트:

- [x] `npm run build` 성공
- [x] `git diff --check` 성공
- [x] 발행 설정 모달에서 부제목 설명 문구가 제거됨
- [x] 공개/비공개 선택지는 선택 상태일 때 연초록색으로 표시됨
- [x] 선택되지 않은 선택지는 hover 시 연초록색으로 표시됨

남은 수동 QA:

- [ ] 브라우저에서 `포트폴리오 게시글로 발행`을 눌러 모달 시각 상태를 직접 확인한다.
---

## 2026-06-16 QA: DB 연결 의심 증상과 게시글 상호작용 검증

목표: 댓글 작성, 게시글 삭제, 관리자 역할 변경이 실패하는 것처럼 보일 때 DB 연결 문제인지 프론트 런타임 문제인지 분리한다.

### 서버/DB 상태

- [x] `docker ps`에서 `junglelog-postgres` 컨테이너가 Up 상태인지 확인
- [x] `GET /health`가 200을 반환하는지 확인
- [x] `GET /health/db`가 200과 `database=postgresql`을 반환하는지 확인

결론:

- DB 연결은 정상입니다.
- 이번 실패 느낌은 DB down이 아니라 프론트 런타임/에러 처리 문제로 판단했습니다.

### API 직접 검증

- [x] 테스트용 승인 사용자 생성
- [x] JWT access token cookie 설정
- [x] `POST /posts`로 게시글 생성: 201
- [x] `POST /posts/{post_id}/comments`로 댓글 작성: 201
- [x] `DELETE /posts/{post_id}`로 게시글 삭제: 204
- [x] QA 데이터 cleanup 완료

검증 출력:

```txt
create_post 201
create_comment 201
delete_post 204
```

### 포트폴리오 연결 방어 QA

- [x] `portfolio` 카테고리 게시글을 프로젝트 연결 기록으로 넣으려는 요청을 백엔드에서 차단

검증 출력:

```txt
portfolio_link_guard blocked 포트폴리오 게시글은 연결 기록으로 추가할 수 없습니다.
```

### 프론트 QA

- [x] `setSuccessMessage is not defined` 검색 결과 제거
- [x] `setDeleteNotice` 검색 결과 제거
- [x] 게시글 작성/수정 성공 안내가 block 대신 toast로 변경
- [x] 게시글 삭제 확인 dialog에서 soft delete 설명 문구 제거
- [x] 댓글 작성 안내 문구 제거
- [x] 로그인 화면에서 승인 대기/역할 승인 안내 문구 제거
- [x] Browser QA에서 로그인 화면 콘솔 error 없음

### 자동 검증

- [x] `npm run build` 성공
- [x] `.venv\Scripts\python.exe -m compileall app` 성공

### 아직 사람 손으로 더 보면 좋은 것

- [ ] 실제 브라우저에서 본인 작성 글 삭제 버튼 클릭 후 toast와 `/posts` 이동 확인
- [ ] 실제 브라우저에서 본인 작성 글 댓글 작성 후 댓글이 목록에 추가되는지 확인
- [ ] 학생 계정과 코치 계정이 각각 준비되면 코치 리뷰 요청/피드백 왕복 QA 진행

---

## 2026-06-16 QA: 로그인 화면, 관리자 통계, 코치 리뷰 계정 준비

### 로그인 화면 QA

- [ ] `/login`에서 좌우 2단 레이아웃이 사라지고 중앙 단일 SIGN IN 화면으로 보이는지 확인
- [ ] `JungleLog`, `SIGN IN`, `Google로 계속하기`가 한 덩어리로 정렬되어 보이는지 확인
- [ ] 승인 대기/역할 승인/HttpOnly cookie 같은 내부 설명 문구가 보이지 않는지 확인
- [ ] `Google로 계속하기` 버튼 클릭 시 기존 Google OAuth 로그인으로 이동하는지 확인

### 관리자 통계 QA

- [ ] `/admin/users` 통계 카드가 4개인지 확인
- [ ] 카드 순서가 `승인 대기`, `승인 완료 사용자`, `승인 완료 학생`, `승인 완료 코치`인지 확인
- [ ] `승인 완료 학생` 수가 role `STUDENT` + approvalStatus `승인 완료` 기준으로 맞는지 확인
- [ ] 기존 사용자 승인/정지/거절/역할 변경 기능이 그대로 동작하는지 확인

### 코치 리뷰 왕복 QA 준비

현재 계정 상황:

- 최고관리자 계정 1개
- 코치 계정 `이준희2` 1개
- 별도 학생 계정은 부족할 수 있음

추천 방식:

1. 새 Google 계정 하나를 준비한다.
2. 그 계정으로 JungleLog에 한 번 로그인해 사용자 목록에 등록한다.
3. 최고관리자 계정에서 해당 사용자를 `STUDENT` + `승인 완료`로 승인한다.
4. 학생 계정으로 게시글 또는 포트폴리오 프로젝트를 만든다.
5. 학생 계정에서 코치 `이준희2`에게 리뷰 요청을 보낸다.
6. `이준희2` 코치 계정으로 로그인해 코치 리뷰 인박스에서 요청을 확인한다.
7. 코치가 피드백과 상태를 저장한다.
8. 학생 계정으로 다시 로그인해 요청 상태와 피드백을 확인한다.

현재 가능한 확인:

- [x] 최고관리자 화면 접근과 사용자 승인 UI 확인 가능
- [x] 코치 계정으로 코치 전용 메뉴가 보이는지 확인 가능
- [ ] 학생이 요청을 보내고 코치가 받는 왕복 흐름은 학생 계정 추가 후 확인 필요

TODO:

- [ ] 백엔드 seed 스크립트로 STUDENT/COACH/리뷰 요청 테스트 데이터를 만드는 방법 검토
- [ ] Swagger/API 기반 코치 리뷰 요청 생성 QA 문서 추가

---

## 2026-06-16 QA: 코치 리뷰 피드백 전송 UI

### 자동 확인

- [x] `댓글 및 코치 피드백` 문구가 `frontend/src`에 남아 있지 않다.
- [x] `피드백과 상태를 학생에게 보냈습니다.` block 성공 문구가 남아 있지 않다.
- [x] `최종 확인 보내기` 버튼 문구가 남아 있지 않다.
- [x] `검토 중으로 변경`, `수정 요청 보내기`, `피드백 완료 보내기` 개별 버튼 문구가 남아 있지 않다.
- [x] `피드백은 학생의 리뷰 요청 현황에 표시됩니다...` 안내 문구가 남아 있지 않다.
- [x] `npm run build` 성공
- [x] backend compile 성공

### 수동 확인 체크리스트

- [ ] 코치 계정으로 `/coach-review`에 들어간다.
- [ ] 리뷰 요청을 선택했을 때 상세 패널이 열린다.
- [ ] 피드백 작성 영역 오른쪽에 `검토 중`, `수정 요청`, `피드백 완료` 토글이 보인다.
- [ ] `최종 확인 보내기` 버튼이 보이지 않는다.
- [ ] `검토 중` 선택 후 전송하면 `검토 중 상태로 전송했습니다.` toast가 뜬다.
- [ ] `수정 요청` 선택 후 피드백 없이 전송하면 validation과 toast error가 뜬다.
- [ ] `수정 요청` 선택 후 피드백을 작성하고 전송하면 `수정 요청을 전송했습니다.` toast가 뜬다.
- [ ] `피드백 완료` 선택 후 피드백을 작성하고 전송하면 `피드백을 전송했습니다.` toast가 뜬다.
- [ ] 원문 게시글의 댓글 섹션 제목이 `댓글`로만 보인다.

### 현재 QA 계정 참고

- DB QA용 학생 요청 데이터는 실제 Google 로그인 계정이 아니라 서버 검증용 데이터입니다.
- 실제 왕복 확인은 학생 Google 계정 1개와 코치 Google 계정 1개로 진행하는 것이 가장 안전합니다.

추가 QA:

- [x] 코치 리뷰 인박스 왼쪽 상태 필터에 `최종 확인`이 표시되지 않는다.
- [x] 피드백 상태 토글 버튼 사이에 시각적 간격이 있다.
- [x] `피드백 전송` 버튼이 검정색이 아니라 초록 계열로 보인다.

---

## 2026-06-16 QA: AI 전 일반 기능 최종 점검

### 자동 검증

- [x] PostgreSQL Docker container 실행 중
- [x] `npm run build` 성공
- [x] backend compile 성공
- [x] 이전에 제거한 UI 문구/오류 문자열 검색 결과 없음
- [x] `git diff --check` 통과

### 서비스 smoke 결과

- [x] 공개 게시글 목록 조회 성공
- [x] 이준희2 학생의 코치 리뷰 요청 현황 조회 성공
- [x] QA Student 코치 인박스 조회 성공
- [x] 코치 피드백 완료 상태와 feedback 표시 확인
- [x] 포트폴리오 프로젝트 목록 조회 성공
- [x] `ai-board-lab` 프로젝트 branch/url 데이터 보정 확인

### 발견/해결한 문제

- [x] `ai-board-lab` 로컬 QA 데이터에서 GitHub URL과 branch가 불일치했습니다.
- [x] 포트폴리오 게시글 발행 링크가 꼬이지 않도록 백엔드 URL 정규화 로직을 추가했습니다.
- [x] 로컬 QA DB의 `ai-board-lab` 프로젝트를 `branch=dev`, 기본 repo URL로 보정했습니다.

### AI 단계 전 남은 수동 확인

- [ ] 브라우저에서 이준희2 학생 계정으로 포트폴리오 관리의 `ai-board-lab` branch가 `dev`로 보이는지 확인
- [ ] 브라우저에서 코치 리뷰 요청 현황에 QA 피드백이 보이는지 확인
