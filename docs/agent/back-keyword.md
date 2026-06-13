# Backend Keyword Map

## 2026-06-14 게시글 수정 API에서 나온 키워드

### CRUD - Update

이번 구현은 게시글 CRUD 중 Update에 해당한다.

```txt
Create: POST /posts
Read: GET /posts, GET /posts/{post_id}
Update: PATCH /posts/{post_id}
Delete: DELETE /posts/{post_id} 예정
```

Update는 이미 존재하는 row를 바꾸는 작업이다. JungleLog에서는 `posts.title`, `posts.summary`, `posts.content`, `posts.category_id`, `posts.is_public`, `posts.related_commit`을 수정한다.

### PATCH

`PATCH /posts/{post_id}`는 특정 게시글 하나를 수정한다는 REST 표현이다. 현재 화면은 수정 폼 전체 값을 다시 보내므로 실질적으로 full-form update처럼 동작한다.

### N:M Relationship Update

게시글과 태그는 N:M 관계다.

```txt
posts
-> post_tags
-> tags
```

수정할 때 태그 목록이 바뀔 수 있으므로 기존 `post_tags` 연결을 삭제하고, 새 태그 목록으로 다시 연결했다. 이 방식은 초반 구현에서 이해하기 쉽고, 중복 연결을 피하기 좋다.

### Transaction

게시글 수정은 한 번에 여러 DB 작업을 수행한다.

```txt
posts UPDATE
post_tags DELETE
tags SELECT 또는 INSERT
post_tags INSERT
commit
```

이 작업들은 하나의 transaction으로 묶여야 한다. 중간에 실패했는데 일부만 저장되면 게시글과 태그 연결이 어긋날 수 있기 때문이다.

### Authorization

현재는 JWT/OAuth2 전 단계라 수정 권한 검사를 하지 않는다. 나중에는 `post.author_id`와 `current_user.id`를 비교해서 작성자 본인만 수정하게 하고, `ADMIN`은 예외적으로 수정 가능하게 만든다.

## 2026-06-14 게시글 작성 API에서 나온 키워드

### REST API / Resource

`POST /posts`는 posts collection에 새 게시글 resource를 만드는 API다. 댓글 작성의 `POST /posts/{post_id}/comments`와 비교하면, 게시글은 최상위 resource이고 댓글은 게시글 아래의 하위 resource다.

### CRUD - Create

이번 구현은 게시글 CRUD 중 Create다.

```txt
Create: POST /posts
Read: GET /posts, GET /posts/{post_id}
Update: PATCH /posts/{post_id} 예정
Delete: DELETE /posts/{post_id} 예정
```

### Primary Key / Foreign Key

새 게시글을 저장할 때 `posts.author_id`는 `users.id`, `posts.category_id`는 `post_categories.id`를 참조한다. 즉 화면에서 author 이름이나 category label을 직접 저장하지 않고 FK로 연결한다.

### N:M / Join Table

게시글과 태그는 N:M 관계다.

```txt
posts
-> post_tags
-> tags
```

태그 이름이 이미 있으면 `tags` row를 재사용하고, 새 태그면 만든 뒤 `post_tags`에 연결한다.

### Transaction

게시글 작성은 `posts`, `tags`, `post_tags`가 함께 바뀔 수 있다. 그래서 repository에서 하나의 session 안에서 처리하고 마지막에 `db.commit()`으로 확정한다.

### Layered Architecture

이번 구현에서도 계층을 나눴다.

```txt
schema: PostCreateRequest, PostDetailResponse
router: POST /posts, status code
service: 검증, summary 생성, tag 정리
repository: DB 조회/INSERT
frontend api: fetch 호출
page: form state와 사용자 이벤트
```

## 2026-06-13 댓글 작성 API에서 나온 키워드

### REST API / POST

댓글 작성은 새 리소스를 만드는 작업이므로 `POST /posts/{post_id}/comments`로 설계했다. URL은 “1번 게시글의 댓글들”이라는 collection을 가리키고, body에는 새 댓글에 필요한 `content`만 보낸다.

### CRUD - Create

이번 작업은 CRUD 중 Create에 해당한다.

```txt
Create: comments 테이블에 새 row INSERT
Read: GET /posts/{post_id}/comments
Update: 아직 미구현
Delete: 아직 미구현
```

### HTTP 3xx / 4xx / 5xx

이번 구현에서는 4xx/5xx를 직접 구분했다.

- `201`: 댓글 생성 성공
- `400`: 공백 댓글처럼 사용자가 잘못 보낸 요청
- `404`: 댓글을 달 게시글이 없음
- `500`: 서버 seed/demo user 문제

### Transaction

`comment_repository.create_comment()`에서 `db.add(comment)`, `db.commit()`, `db.refresh(comment)` 흐름을 사용했다.

- `add`: SQLAlchemy session에 새 댓글 객체를 등록
- `commit`: 실제 PostgreSQL에 INSERT 반영
- `refresh`: DB가 만든 `id`, `created_at` 값을 다시 Python 객체에 채움

### Layered Architecture / MVC

이번 댓글 작성 흐름은 계층을 나눠서 구현했다.

```txt
router: HTTP 요청/응답, status code
service: 게시글 존재 확인, 공백 검증, demo user 선택
repository: SQLAlchemy DB 조회/저장
schema: request/response JSON 모양
```

이 구조 덕분에 JWT/OAuth2를 붙일 때 router/service 일부만 바꾸고 DB 저장 함수는 대부분 유지할 수 있다.

이 문서는 Trello에 정리한 백엔드/공용 학습 키워드를 JungleLog 구현과 연결해서 채운다.
JWT 구현, DB 설계 문서, API 설계 문서는 팀원에게 공유해야 하는 공용 산출물로 따로 표시한다.

## 작성 규칙

각 키워드는 아래 기준으로 채운다.

```txt
### 키워드

- 상태:
- 언제 나왔는가:
- 우리 프로젝트에서 어디에 쓰였는가:
- 핵심 개념:
- 관련 파일:
- 팀 공유 필요:
- 다음에 다시 볼 시점:
```

## 공용 산출물

### JWT 구현

- 상태: 예정
- 언제 나왔는가: Google OAuth 로그인 성공 후 JungleLog API 보호 토큰을 발급할 때
- 우리 프로젝트에서 어디에 쓰였는가: STUDENT / COACH / ADMIN 권한 구분, 승인된 사용자 보호 API 접근, 로그인 사용자 식별
- 핵심 개념: Google이 사용자 신원을 확인하면, 우리 서버가 자체 JWT를 발급하고 클라이언트는 요청마다 토큰을 보내 인증한다.
- 관련 파일: 예정 `backend/app/core/security.py`, `backend/app/routers/auth.py`
- 팀 공유 필요: 예
- 다음에 다시 볼 시점: 5단계 Google OAuth / 자동 가입 / JWT 인증 구현

### DB 설계 문서 작성

- 상태: 진행 중
- 언제 나왔는가: users, posts, comments, tags, portfolio_projects, review_requests 테이블을 설계할 때
- 우리 프로젝트에서 어디에 쓰였는가: ERD, PK/FK, 관계, 정규화 기준 정리
- 핵심 개념: 기능을 테이블과 관계로 바꾸는 작업이다.
- 관련 파일: `docs/agent/db-design.md`
- 팀 공유 필요: 예
- 다음에 다시 볼 시점: DBML 초안을 dbdiagram.io에 붙여넣고 관계를 검토할 때

### API 설계 문서 작성

- 상태: 진행 중
- 언제 나왔는가: 프론트 mock UI를 실제 API로 바꾸기 전에
- 우리 프로젝트에서 어디에 쓰였는가: `GET /posts`, `GET /posts/{post_id}` endpoint, request query, response, error status 정리
- 핵심 개념: 프론트와 백엔드가 같은 계약을 보고 개발하도록 API 모양을 문서화한다.
- 관련 파일: `docs/agent/api-design.md`, `backend/app/schemas/post.py`, `backend/app/routers/posts.py`
- 팀 공유 필요: 예
- 다음에 다시 볼 시점: 게시글 작성/수정/삭제 API를 만들기 전

## API / 인증 / 실시간

### HTTP 3xx / 4xx / 5xx

- 상태: 진행 중
- 언제 나왔는가: API 응답과 에러 처리를 설계할 때
- 우리 프로젝트에서 어디에 쓰였는가: 없는 게시글 id 조회 시 404 응답, 이후 로그인 실패/권한 없음/서버 오류 응답
- 핵심 개념: 3xx는 리다이렉트, 4xx는 클라이언트 요청 문제, 5xx는 서버 문제다.
- 관련 파일: `docs/agent/api-design.md`, `backend/app/routers/posts.py`, 예정 `backend/app/core/exceptions.py`
- 팀 공유 필요: 예
- 다음에 다시 볼 시점: 공통 예외 처리 구현 시

### REST API

- 상태: 진행 중
- 언제 나왔는가: FastAPI 서버와 `/health` API를 만들 때
- 우리 프로젝트에서 어디에 쓰였는가: `/health`, `/health/db`, `/posts`, `/posts/{post_id}`, `/posts/{post_id}/comments`
- 핵심 개념: URL, HTTP method, status code로 서버 자원을 다루는 방식이다.
- 관련 파일: `backend/app/routers/health.py`, `backend/app/routers/posts.py`
- 팀 공유 필요: 예
- 다음에 다시 볼 시점: 게시글 작성/수정/삭제 API 작성 시

### API Design

- 상태: 진행 중
- 언제 나왔는가: 어떤 endpoint를 먼저 만들지 정할 때
- 우리 프로젝트에서 어디에 쓰였는가: 게시글 목록/상세 API를 만들기 전에 query, response, 404 응답을 먼저 정했다.
- 핵심 개념: API 이름, method, 요청/응답, 에러 모양을 일관되게 정하는 일이다.
- 관련 파일: `docs/agent/api-design.md`
- 팀 공유 필요: 예
- 다음에 다시 볼 시점: 댓글 API와 게시글 CRUD API 설계 전

### Pydantic Schema / DTO

- 상태: 진행 중
- 언제 나왔는가: DB 모델을 그대로 응답하지 않고 프론트가 필요한 JSON 모양으로 바꿀 때
- 우리 프로젝트에서 어디에 쓰였는가: 게시글 목록/상세 응답과 댓글 응답에서 `categorySlug`, `isPublic`, `postId`, `authorRole`, `createdAt` 같은 화면 친화적 필드를 만든다.
- 핵심 개념: DB model은 테이블 구조이고, Pydantic schema는 API 요청/응답 구조다.
- 관련 파일: `backend/app/schemas/post.py`, `backend/app/schemas/comment.py`
- 팀 공유 필요: 예
- 다음에 다시 볼 시점: 게시글 작성 request body와 댓글 response schema를 만들 때

### Repository / Service / Router

- 상태: 진행 중
- 언제 나왔는가: 게시글 조회 API에서 DB 조회, 응답 변환, HTTP endpoint 역할을 나눌 때
- 우리 프로젝트에서 어디에 쓰였는가: `post_repository.py`는 DB query, `post_service.py`는 응답 조립, `posts.py` router는 HTTP 요청 처리를 담당한다.
- 핵심 개념: 한 파일이 모든 일을 하지 않게 역할을 나누는 layered architecture 방식이다.
- 관련 파일: `backend/app/repositories/post_repository.py`, `backend/app/services/post_service.py`, `backend/app/routers/posts.py`
- 팀 공유 필요: 예
- 다음에 다시 볼 시점: 게시글 작성/수정/삭제 API에서 transaction을 다룰 때

### Session / JWT

- 상태: 예정
- 언제 나왔는가: 로그인 상태를 서버가 어떻게 기억할지 정할 때
- 우리 프로젝트에서 어디에 쓰였는가: Google 로그인 후 발급한 access token으로 role 기반 화면/API 보호
- 핵심 개념: Session은 서버가 상태를 저장하고, JWT는 클라이언트가 서명된 토큰을 들고 다닌다.
- 관련 파일: 예정 `backend/app/core/security.py`
- 팀 공유 필요: 예
- 다음에 다시 볼 시점: 인증 구현 시

### OAuth2

- 상태: 진행 중
- 언제 나왔는가: 자체 이메일/비밀번호 로그인을 제거하고 Google 로그인으로 통일하기로 결정할 때
- 우리 프로젝트에서 어디에 쓰였는가: Google 계정으로 사용자 인증, 첫 로그인 자동 가입, 운영자 승인 대기, 이후 자체 JWT 발급
- 핵심 개념: 외부 인증 제공자가 사용자 신원을 확인하고, 서비스는 그 결과를 바탕으로 자체 사용자와 권한을 관리한다.
- 관련 파일: 예정 `backend/app/routers/auth.py`
- 팀 공유 필요: 예
- 다음에 다시 볼 시점: Google OAuth callback과 token 검증을 구현할 때

### RBAC / Approval Workflow

- 상태: 진행 중
- 언제 나왔는가: 정글 내부 서비스라서 학생과 코치 모두 운영자 승인을 받아야 한다고 결정할 때
- 우리 프로젝트에서 어디에 쓰였는가: `STUDENT`, `COACH`, `ADMIN` role과 `승인 대기`, `승인 완료`, `거절`, `정지` 승인 상태
- 핵심 개념: 인증된 사용자가 어떤 권한으로 어떤 화면/API에 접근할 수 있는지 통제하는 구조다.
- 관련 파일: `frontend/src/app/components/RoleGate.tsx`, `frontend/src/app/pages/admin/AdminUsers.tsx`, `docs/agent/db-design.md`
- 팀 공유 필요: 예
- 다음에 다시 볼 시점: JWT payload와 보호 API dependency를 설계할 때

### WebSocket / SSE

- 상태: 후순위
- 언제 나왔는가: 실시간 알림이나 코치 피드백 도착 알림을 고민할 때
- 우리 프로젝트에서 어디에 쓰였는가: 현재는 mock 알림만 있음
- 핵심 개념: 서버가 클라이언트에 실시간으로 이벤트를 밀어주는 방식이다.
- 관련 파일: 예정
- 팀 공유 필요: 아니오
- 다음에 다시 볼 시점: 알림 기능을 실시간으로 확장할 때

## Security

### HTTPS

- 상태: 후순위
- 언제 나왔는가: 배포와 보안 요구사항을 볼 때
- 우리 프로젝트에서 어디에 쓰였는가: 로컬 개발 이후 배포 환경
- 핵심 개념: HTTP 통신을 암호화해서 토큰과 개인정보를 보호한다.
- 관련 파일: 배포 설정
- 팀 공유 필요: 아니오
- 다음에 다시 볼 시점: 배포 단계

### Rate Limit

- 상태: 후순위
- 언제 나왔는가: 로그인/API 남용 방지를 고민할 때
- 우리 프로젝트에서 어디에 쓰였는가: 로그인 시도 제한, AI 생성 요청 제한
- 핵심 개념: 같은 사용자가 짧은 시간에 너무 많은 요청을 보내지 못하게 제한한다.
- 관련 파일: 예정
- 팀 공유 필요: 아니오
- 다음에 다시 볼 시점: AI API 비용 보호를 설계할 때

### CORS / CSRF

- 상태: 진행 중
- 언제 나왔는가: React dev server와 FastAPI server 포트가 다를 때
- 우리 프로젝트에서 어디에 쓰였는가: `localhost:5173`에서 `localhost:8000` API 호출 허용
- 핵심 개념: CORS는 브라우저의 다른 출처 요청 제한이고, CSRF는 사용자가 의도하지 않은 요청을 보내게 만드는 공격이다.
- 관련 파일: `backend/app/main.py`, `backend/app/core/config.py`, `backend/.env.example`
- 팀 공유 필요: 예
- 다음에 다시 볼 시점: 실제 배포 프론트 도메인을 CORS origin에 추가할 때

## PostgreSQL / Data Layer

### PostgreSQL

- 상태: 진행 중
- 언제 나왔는가: `docker compose up -d`로 `postgres:16` 컨테이너를 실행할 때
- 우리 프로젝트에서 어디에 쓰였는가: users, posts, comments, portfolio_projects, review_requests 데이터를 저장할 DB
- 핵심 개념: 관계형 데이터베이스로, 테이블과 관계를 통해 데이터를 저장하고 SQL로 조회한다.
- 관련 파일: `docker-compose.yml`, `backend/app/db/session.py`, `backend/app/routers/health.py`
- 팀 공유 필요: 예
- 다음에 다시 볼 시점: ERD와 SQLAlchemy model을 설계할 때

### Docker Compose

- 상태: 진행 중
- 언제 나왔는가: 로컬에서 PostgreSQL을 직접 설치하지 않고 컨테이너로 실행할 때
- 우리 프로젝트에서 어디에 쓰였는가: `junglelog-postgres` 컨테이너와 `postgres_data` volume 실행
- 핵심 개념: 여러 개발 인프라 서비스를 YAML 파일 하나로 같은 방식으로 실행하게 해준다.
- 관련 파일: `docker-compose.yml`, `docs/agent/setup.md`
- 팀 공유 필요: 예
- 다음에 다시 볼 시점: Redis, pgvector, MCP 관련 외부 서비스를 추가할 때

### SQLAlchemy

- 상태: 진행 중
- 언제 나왔는가: FastAPI가 PostgreSQL에 연결할 수 있도록 DB 연결 계층을 만들 때
- 우리 프로젝트에서 어디에 쓰였는가: `db/session.py`에서 engine과 session을 만들고, 이후 repository에서 DB 쿼리를 실행할 때
- 핵심 개념: Python 코드와 관계형 DB 사이를 이어주는 ORM/DB toolkit이다.
- 관련 파일: `backend/app/db/session.py`, 예정 `backend/app/db/models`
- 팀 공유 필요: 예
- 다음에 다시 볼 시점: SQLAlchemy model과 repository를 구현할 때

### psycopg

- 상태: 진행 중
- 언제 나왔는가: SQLAlchemy가 PostgreSQL 서버와 실제 통신할 드라이버가 필요할 때
- 우리 프로젝트에서 어디에 쓰였는가: `postgresql+psycopg://...` 형태의 DB 연결 문자열
- 핵심 개념: Python과 PostgreSQL 사이의 실제 통신을 담당하는 드라이버다.
- 관련 파일: `backend/requirements.txt`, `backend/.env.example`, `backend/app/core/config.py`, `backend/app/db/session.py`
- 팀 공유 필요: 예
- 다음에 다시 볼 시점: DB 연결 오류를 디버깅하거나 배포용 DB URL을 설정할 때

### FastAPI Depends

- 상태: 진행 중
- 언제 나왔는가: `/health/db` endpoint에서 DB session을 주입받을 때
- 우리 프로젝트에서 어디에 쓰였는가: `db: Session = Depends(get_db)`로 API 함수에 DB session 전달
- 핵심 개념: FastAPI가 함수 실행에 필요한 값을 대신 만들어 넣어주는 dependency injection 방식이다.
- 관련 파일: `backend/app/routers/health.py`, `backend/app/db/session.py`
- 팀 공유 필요: 예
- 다음에 다시 볼 시점: 게시글 CRUD router에서 DB session을 사용할 때

### SQL

- 상태: 진행 중
- 언제 나왔는가: `/health/db`에서 `SELECT 1`로 DB 연결을 확인할 때
- 우리 프로젝트에서 어디에 쓰였는가: PostgreSQL 조회/저장, 현재는 연결 확인용 query
- 핵심 개념: 관계형 데이터베이스와 대화하는 언어다.
- 관련 파일: `backend/app/routers/health.py`, 예정 `backend/app/db/models`
- 팀 공유 필요: 예
- 다음에 다시 볼 시점: 테이블 생성과 CRUD query를 구현할 때

### CRUD

- 상태: 예정
- 언제 나왔는가: 게시글 작성, 조회, 수정, 삭제 API를 만들 때
- 우리 프로젝트에서 어디에 쓰였는가: posts, comments, portfolio_projects, review_requests
- 핵심 개념: Create, Read, Update, Delete의 기본 데이터 조작 흐름이다.
- 관련 파일: 예정 `backend/app/routers/posts.py`
- 팀 공유 필요: 예
- 다음에 다시 볼 시점: 게시글 API 구현 시

### Primary Key / Foreign Key

- 상태: 진행 중
- 언제 나왔는가: 테이블 관계를 설계할 때
- 우리 프로젝트에서 어디에 쓰였는가: user와 post, post와 comment, portfolio_project와 post, review_request와 coach 관계
- 핵심 개념: PK는 행의 고유 식별자, FK는 다른 테이블 행을 가리키는 연결 키다.
- 관련 파일: `backend/app/db/models`
- 팀 공유 필요: 예
- 다음에 다시 볼 시점: 게시글/포트폴리오/코치 리뷰 API에서 JOIN을 작성할 때

### Join - Inner / Outer

- 상태: 예정
- 언제 나왔는가: 사용자 정보와 게시글, 태그, 댓글을 함께 조회할 때
- 우리 프로젝트에서 어디에 쓰였는가: 게시글 목록에서 작성자/태그/댓글 수 함께 표시
- 핵심 개념: 여러 테이블의 데이터를 관계를 기준으로 합쳐 조회한다.
- 관련 파일: 예정 repositories
- 팀 공유 필요: 예
- 다음에 다시 볼 시점: 목록 API 최적화 시

### Index

- 상태: 예정
- 언제 나왔는가: 검색과 정렬 성능을 고민할 때
- 우리 프로젝트에서 어디에 쓰였는가: 게시글 검색, tag, created_at, author_id 조회
- 핵심 개념: 자주 찾는 컬럼을 빠르게 조회하기 위한 DB 자료구조다.
- 관련 파일: 예정 migration
- 팀 공유 필요: 예
- 다음에 다시 볼 시점: 검색/페이징 API 구현 시

### Transaction

- 상태: 예정
- 언제 나왔는가: 여러 DB 작업이 한 번에 성공하거나 실패해야 할 때
- 우리 프로젝트에서 어디에 쓰였는가: 게시글 생성과 태그 연결, 리뷰 요청 생성과 알림 생성
- 핵심 개념: 여러 작업을 하나의 단위로 묶어 데이터 불일치를 막는다.
- 관련 파일: 예정 service/repository
- 팀 공유 필요: 예
- 다음에 다시 볼 시점: 게시글+태그 저장 구현 시

### ERD / Data Modeling / Normalization

- 상태: 예정
- 언제 나왔는가: 테이블을 설계하기 전
- 우리 프로젝트에서 어디에 쓰였는가: users, posts, comments, tags, portfolio_projects, review_requests 관계 정리
- 핵심 개념: 중복을 줄이고 관계를 명확히 하기 위해 데이터를 구조화한다.
- 관련 파일: 예정 `docs/db-design.md`
- 팀 공유 필요: 예
- 다음에 다시 볼 시점: 4단계 DB 설계 시작 시

## Language Basics

### Python

- 상태: 진행 중
- 언제 나왔는가: 백엔드 가상환경과 FastAPI 서버 세팅
- 우리 프로젝트에서 어디에 쓰였는가: FastAPI 서버 구현 언어
- 핵심 개념: 백엔드 로직, API, DB 연결을 작성하는 언어다.
- 관련 파일: `backend`
- 팀 공유 필요: 아니오
- 다음에 다시 볼 시점: `app/main.py` 작성 시

### Virtual Environment / pip / requirements.txt

- 상태: 진행 중
- 언제 나왔는가: `backend/.venv` 생성, FastAPI 설치, `requirements.txt` 생성
- 우리 프로젝트에서 어디에 쓰였는가: 백엔드 의존성 격리와 재현 가능한 설치
- 핵심 개념: 가상환경은 프로젝트 전용 패키지 공간이고, `requirements.txt`는 설치 목록이다.
- 관련 파일: `backend/.venv`, `backend/requirements.txt`
- 팀 공유 필요: 아니오
- 다음에 다시 볼 시점: 팀원이 백엔드 환경을 설치할 때

### OOP / Functional Programming

- 상태: 예정
- 언제 나왔는가: service/repository 구조와 SQLAlchemy model을 다룰 때
- 우리 프로젝트에서 어디에 쓰였는가: 모델 클래스, 함수형 데이터 변환
- 핵심 개념: OOP는 객체 중심, 함수형은 입력과 출력 중심으로 코드를 구성한다.
- 관련 파일: 예정
- 팀 공유 필요: 아니오
- 다음에 다시 볼 시점: DB model과 service 작성 시

### Error Handling / Test Framework

- 상태: 예정
- 언제 나왔는가: API 실패 응답과 테스트를 작성할 때
- 우리 프로젝트에서 어디에 쓰였는가: validation error, 404, 401, pytest
- 핵심 개념: 실패를 예측 가능한 응답으로 바꾸고, 테스트로 반복 확인한다.
- 관련 파일: 예정 `backend/app/core/exceptions.py`, `backend/tests`
- 팀 공유 필요: 예
- 다음에 다시 볼 시점: 공통 예외 처리와 테스트 도입 시

## Async / Cache / 운영

### Redis / Cache

- 상태: 후순위
- 언제 나왔는가: AI 결과 캐싱, 세션/알림 큐를 고민할 때
- 우리 프로젝트에서 어디에 쓰였는가: 아직 미구현
- 핵심 개념: 자주 쓰는 데이터나 임시 데이터를 빠르게 저장해 재사용한다.
- 관련 파일: 예정
- 팀 공유 필요: 예
- 다음에 다시 볼 시점: AI 비용 최적화나 세션 저장을 고민할 때

### Async / Job Queue

- 상태: 후순위
- 언제 나왔는가: GitHub 분석, RAG 색인, AI 생성처럼 오래 걸리는 작업을 다룰 때
- 우리 프로젝트에서 어디에 쓰였는가: 아직 미구현
- 핵심 개념: 오래 걸리는 작업을 요청 응답과 분리해 백그라운드에서 처리한다.
- 관련 파일: 예정
- 팀 공유 필요: 예
- 다음에 다시 볼 시점: AI 생성 요청을 비동기 처리할 때

### Logging / Configuration

- 상태: 진행 중
- 언제 나왔는가: 환경변수와 서버 실행 설정을 분리할 때
- 우리 프로젝트에서 어디에 쓰였는가: 앱 이름, CORS origin, `DATABASE_URL`, 초기 관리자 `ADMIN_EMAILS`를 설정으로 분리
- 핵심 개념: 설정은 코드에 박지 않고 환경에 따라 바꿀 수 있게 분리한다.
- 관련 파일: `backend/app/core/config.py`, `backend/.env`, `backend/.env.example`, `backend/app/main.py`
- 팀 공유 필요: 아니오
- 다음에 다시 볼 시점: `JWT_SECRET_KEY`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `OPENAI_API_KEY`, `GITHUB_TOKEN`을 추가할 때

### pydantic-settings

- 상태: 진행 중
- 언제 나왔는가: `.env` 설정값을 Python 코드에서 타입이 있는 객체로 읽을 때
- 우리 프로젝트에서 어디에 쓰였는가: `Settings` 클래스가 `APP_NAME`, `BACKEND_CORS_ORIGINS`, `DATABASE_URL`, `ADMIN_EMAILS`를 읽는다.
- 핵심 개념: 환경변수를 Pydantic 기반 설정 객체로 변환해 코드에서 안전하게 사용한다.
- 관련 파일: `backend/app/core/config.py`, `backend/requirements.txt`
- 팀 공유 필요: 아니오
- 다음에 다시 볼 시점: DB URL, JWT secret, OpenAI key를 설정으로 추가할 때

## Architecture / Reliability

### Layered Architecture / MVC

- 상태: 진행 중
- 언제 나왔는가: `routers`, `schemas`, `services`, `repositories`, `models` 폴더를 나눌 때
- 우리 프로젝트에서 어디에 쓰였는가: 백엔드 폴더 구조
- 핵심 개념: 요청 처리, 검증, 비즈니스 로직, DB 접근을 역할별로 나눠 유지보수성을 높인다.
- 관련 파일: `backend/app`
- 팀 공유 필요: 예
- 다음에 다시 볼 시점: 게시글 CRUD API를 service/repository로 분리할 때

### 멱등성 / Retry / Timeout

- 상태: 후순위
- 언제 나왔는가: 외부 API나 AI API 호출을 안정적으로 처리할 때
- 우리 프로젝트에서 어디에 쓰였는가: GitHub API, OpenAI API, MCP tool 호출
- 핵심 개념: 같은 요청을 반복해도 안전한지, 실패하면 재시도할지, 얼마나 기다릴지 정하는 설계다.
- 관련 파일: 예정
- 팀 공유 필요: 아니오
- 다음에 다시 볼 시점: GitHub/OpenAI 연동 시

### SQLAlchemy Model / Column / ForeignKey / relationship

- 상태: 진행 중
- 언제 소화되는가: ERD v1을 실제 Python 코드의 DB 모델로 옮길 때
- 우리 프로젝트에서 어디에 쓰이는가: `backend/app/db/models/user.py`, `post_category.py`, `post.py`
- 핵심 개념:
  - SQLAlchemy model은 DB 테이블을 Python 클래스로 표현한 것이다.
  - `mapped_column`은 DB 컬럼을 선언한다.
  - `ForeignKey`는 다른 테이블의 PK를 참조해 관계를 만든다.
  - `relationship`은 외래키로 연결된 객체를 Python 코드에서 쉽게 접근하게 해준다.
- 이번 구현 예시:
  - `Post.author_id -> users.id`
  - `Post.category_id -> post_categories.id`
  - `User.posts`
  - `Post.author`
  - `Post.category`
- 다음에 다시 볼 시점: 실제 테이블 생성, 게시글 조회 API, JOIN 응답 작성 시

### create_all / Seed Data

- 상태: 진행 중
- 언제 소화되는가: SQLAlchemy 모델을 실제 PostgreSQL 테이블로 만들 때
- 우리 프로젝트에서 어디에 쓰이는가: `backend/app/db/init_db.py`
- 핵심 개념:
  - `Base.metadata.create_all(bind=engine)`은 SQLAlchemy가 알고 있는 모델 기준으로 실제 DB 테이블을 생성한다.
  - seed data는 서비스 시작 전에 기본으로 들어가야 하는 데이터다.
  - 이번 seed data는 게시글 카테고리 5개다.
  - seed는 여러 번 실행해도 중복되지 않게 만들어야 한다.
- 이번 구현 예시:
  - `users`, `post_categories`, `posts` 테이블 생성
  - `learning-log`, `troubleshooting`, `retrospective`, `interview`, `portfolio` 카테고리 삽입
- 다음에 다시 볼 시점: Alembic migration 도입, 테스트 DB 초기화, 배포 환경 DB 초기화

### N:M Relationship / Junction Table

- 상태: 진행 중
- 언제 소화되는가: 게시글과 태그처럼 양쪽 모두 여러 개로 연결될 수 있는 데이터를 모델링할 때
- 우리 프로젝트에서 어디에 쓰이는가: `post_tag.py`, `portfolio_project_post.py`, `review_request_coach.py`
- 핵심 개념:
  - N:M 관계는 테이블 두 개만으로 표현하기 어렵다.
  - 중간 연결 테이블을 만들어 양쪽 id를 저장한다.
  - `post_tags.post_id`는 게시글을 가리킨다.
  - `post_tags.tag_id`는 태그를 가리킨다.
  - `post_id + tag_id`를 primary key로 두면 중복 연결을 막을 수 있다.
- 이번 구현 예시:
  - `posts` N:M `tags`
  - 연결 테이블: `post_tags`
  - `portfolio_projects` N:M `posts`
  - 연결 테이블: `portfolio_project_posts`
  - `review_requests` N:M `users(coach)`
  - 연결 테이블: `review_request_coaches`
- 다음에 다시 볼 시점: 게시글 목록 API에서 태그 배열을 응답으로 만들 때

### UniqueConstraint

- 상태: 진행 중
- 언제 소화되는가: 같은 학생이 같은 GitHub repo를 중복 등록하지 못하게 막을 때
- 우리 프로젝트에서 어디에 쓰이는가: `backend/app/db/models/portfolio_project.py`
- 핵심 개념: 여러 컬럼 조합이 중복되지 않도록 DB 차원에서 제한한다.
- 이번 구현 예시: `portfolio_projects.owner_id + repo_full_name`
- 다음에 다시 볼 시점: 포트폴리오 프로젝트 등록 API 구현 시
