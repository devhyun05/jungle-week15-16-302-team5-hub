
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
