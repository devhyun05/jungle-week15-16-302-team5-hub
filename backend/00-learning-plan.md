# Backend Top-Down Plan

목표는 FastAPI 문법을 따로 외우는 것이 아니라, 현재 말랑 연구소 프론트 화면이 실제 DB와 연결되어 움직이도록 백엔드를 직접 구현하는 것입니다.

기준 API는 [`api-spec.md`](./api-spec.md)입니다. RAG, MCP, Agent는 아직 구현하지 않습니다. 기본 인증, 게시글, 댓글, 태그 API가 실제로 동작하고 테스트로 확인된 뒤 다음 단계에서 붙입니다.

현재 프론트 변경 후 백엔드가 우선 맞춰야 할 흐름:

- `/`와 `/posts`는 같은 게시판 메인 화면이므로 목록 API는 `GET /posts` 하나로 지원한다.
- 게시글 목록은 검색어, 카테고리(`post_type`), 여러 태그를 함께 사용해 좁혀 본다.
- 반복 `tags` query는 선택한 태그를 모두 포함하는 AND 조건이다.
- 글쓰기 화면은 기존 태그 선택뿐 아니라 직접 입력한 태그를 `tag_names`로 보낸다.
- 인기 태그 API는 사용 횟수 기준으로 정렬하고, 프론트는 최대 8개만 보여준다.
- 인증은 access token + refresh token 방식으로 구현한다. access token은 짧게 만료되는 JWT, refresh token은 DB에 hash만 저장하는 긴 수명 opaque token이다.
- refresh token은 재발급 요청마다 회전시키고, 로그아웃 또는 재사용 의심 시 폐기할 수 있게 설계한다.

## 세션 공통 규칙

모든 세션은 오리엔테이션으로 시작합니다.

오리엔테이션에서 반드시 먼저 말할 것:

- 이번 세션이 프론트의 어떤 페이지 기능을 살리는지
- 사용자가 그 페이지에서 무엇을 하면 어떤 API가 호출되는지
- 이번 파일이 백엔드에서 맡는 역할
- 요청 body, query, path parameter, response 모양
- DB에서 어떤 테이블을 읽고 쓰는지
- `FastAPI가 정한 것`, `SQLAlchemy가 정한 것`, `Pydantic이 정한 것`, `사용자가 이름 짓는 것`의 구분
- 함수 인자에 `Depends`, `Session`, `current_user`가 들어갈 때 값이 어디서 오는지
- 코드 구현 뒤 어떤 유닛 테스트로 실제 동작을 확인할지

오리엔테이션에서는 개념만 먼저 잡습니다. Level 3 빈칸은 사용자가 달라고 요청한 뒤에만 채팅으로 제공합니다.

구현해야 할 파일이 여러 개인 세션에서는 처음에 전체 흐름을 짧게 설명한 뒤, 한 번에 한 파일씩 쪼개서 진행합니다.

파일별 진행에서 반드시 지킬 것:

- 지금 다루는 파일 하나의 역할만 먼저 말한다.
- 그 파일에서 구현할 핵심 필드, 함수, 클래스만 좁혀 설명한다.
- 헷갈리기 쉬운 개념은 해당 파일 안에서 필요한 만큼만 설명한다.
- 사용자가 이해하거나 작성한 뒤 다음 파일로 넘어간다.

## 시작 전 진도 확인 절차

세션 시작 요청이 오면 Codex는 다음 순서로 움직입니다.

1. `progress-check.md`를 읽습니다.
2. `완료`가 아닌 가장 앞 세션을 찾습니다.
3. 현재 추천 세션, 이전 세션 상태, 오늘 할 일을 짧게 요약합니다.
4. 사용자에게 "이 세션 오리엔테이션부터 시작할까요?"라고 묻습니다.
5. 사용자가 시작하겠다고 하면 오리엔테이션을 진행합니다.
6. 오리엔테이션이 끝난 뒤에도 바로 Level 3 빈칸을 내지 않고, 사용자가 요청하면 그때 채팅으로 냅니다.

## Level 3 기준

Level 3은 가장 많이 비운 상태입니다.

비울 수 있는 것:

- import 대상
- 라우터 경로와 HTTP method
- Pydantic 필드 타입과 검증 옵션
- SQLAlchemy 컬럼 타입, 관계, ForeignKey
- DB query 조건
- `db.add`, `db.commit`, `db.refresh`, `db.delete`
- 인증 dependency
- 예외 상태 코드와 메시지
- 테스트에서 요청 body, header, assert

Level 3 빈칸 코드는 파일에 미리 저장하지 않습니다. 사용자가 요청하면 Codex가 세션 중 채팅으로만 제공합니다.

Level 3 빈칸을 채팅으로 줄 때는 모든 `____` 빈칸마다 예외 없이 바로 옆이나 바로 위에 주석으로 무엇을 넣어야 하는지 힌트를 함께 적습니다. 한 줄에 빈칸이 여러 개 있으면 각 빈칸의 순서와 역할을 주석에서 구분해 줍니다.

Level 3 빈칸 코드에는 각 함수, 클래스, 주요 helper 블록 바로 위에 큰 흐름 주석을 먼저 둡니다. 주석은 길게 설명하지 않고, 그 코드가 프론트 요청/DB/응답 흐름에서 맡는 핵심 역할만 1~2줄로 적습니다.

## 전체 구현 흐름

1. 서버 뼈대와 테스트 감각
2. DB 연결과 모델
3. 요청/응답 스키마
4. 인증
5. 태그 seed와 조회
6. 게시글 조회
7. 게시글 생성, 수정, 삭제
8. 댓글 생성, 수정, 삭제
9. 프론트 연동 점검

## 세션 목록

### Session 00: FastAPI 앱과 health check

파일:

- `app/main.py`
- `tests/test_health.py`

프론트 페이지 기능:

- 프론트가 백엔드 서버가 켜져 있는지 확인할 수 있는 최소 연결 상태를 만든다.

직접 구현할 것:

- `FastAPI()` 앱 생성
- CORS middleware
- 라우터 등록 위치
- `GET /health`
- `TestClient`로 health test 작성

구현 후 테스트:

```bash
python -m pytest tests/test_health.py
```

### Session 01: 설정과 DB 세션

파일:

- `app/core/config.py`
- `app/db/base.py`
- `app/db/session.py`

프론트 페이지 기능:

- 이후 모든 페이지가 같은 DB에 접근할 수 있도록 백엔드 연결 기반을 만든다.

직접 구현할 것:

- `Settings`
- `database_url`
- `jwt_secret_key`
- `cors_origins`
- `DeclarativeBase`
- `engine`
- `SessionLocal`
- `get_db`

구현 후 테스트:

```bash
python -m pytest tests/test_health.py
```

### Session 02: User 모델과 Auth 스키마

파일:

- `app/models/user.py`
- `app/models/refresh_token.py`
- `app/models/__init__.py`
- `app/schemas/auth.py`

프론트 페이지 기능:

- 회원가입 페이지와 로그인 페이지가 사용할 사용자 데이터 모양을 만든다.

직접 구현할 것:

- `users` 테이블 모델
- email, password_hash, nickname, created_at
- 기존 DB 스키마와 맞추기 위한 updated_at
- `refresh_tokens` 테이블 모델
- token_hash, family_id, expires_at, revoked_at, replaced_by_token_id
- `SignupRequest`
- `LoginRequest`
- `UserResponse`
- `TokenResponse`
- `TokenResponse`에는 access token, token type, 만료 초, user 정보를 담는다
- refresh token은 response body가 아니라 HttpOnly cookie로 내려주는 흐름을 기준으로 한다

구현 후 테스트:

```bash
python -m pytest tests/test_auth_schemas.py
```

### Session 03: 인증 서비스

파일:

- `app/services/auth_service.py`

프론트 페이지 기능:

- 로그인 페이지에서 입력한 비밀번호를 검증하고, API 요청용 access token과 로그인 유지용 refresh token을 만든다.

직접 구현할 것:

- 비밀번호 해시
- 비밀번호 검증
- 짧은 수명의 JWT access token 생성
- 긴 수명의 opaque refresh token 생성
- refresh token hash 저장
- refresh token 검증
- refresh token 회전
- refresh token 폐기
- 이메일로 사용자 찾기
- `get_current_user`
- `get_optional_current_user`
- refresh token 원문과 hash를 구분해서 설명하기
- 탈취된 refresh token 재사용 감지 시 같은 `family_id` 폐기 전략

구현 후 테스트:

```bash
python -m pytest tests/test_auth_service.py
```

### Session 04: Auth API

파일:

- `app/routers/auth.py`

프론트 페이지 기능:

- `/signup`, `/login`, `/refresh`, `/logout`, 로그인 상태 확인 흐름을 실제 API로 연결한다.

직접 구현할 것:

- `POST /auth/signup`
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`
- `GET /auth/me`
- 중복 이메일 예외
- 로그인 실패 예외
- refresh token cookie 설정
- access token 만료 후 refresh로 재발급
- refresh token 회전과 이전 token 폐기
- 로그아웃 시 refresh token 폐기와 cookie 삭제
- DB insert, commit, refresh

구현 후 테스트:

```bash
python -m pytest tests/test_auth_api.py
```

### Session 05: Post, Comment, Tag 모델

파일:

- `app/models/post.py`
- `app/models/comment.py`
- `app/models/tag.py`
- `app/models/__init__.py`

프론트 페이지 기능:

- 게시글 목록, 게시글 상세, 글쓰기, 댓글, 태그 필터가 저장할 테이블 구조를 만든다.

직접 구현할 것:

- `posts`
- `comments`
- `tags`
- `post_tags`
- relationship
- cascade
- 선택 필드

구현 후 테스트:

```bash
python -m pytest tests/test_models.py
```

### Session 06: Tag API와 seed

파일:

- `app/schemas/tag.py`
- `app/services/tag_service.py`
- `app/routers/tags.py`
- `app/seed.py`

프론트 페이지 기능:

- 글쓰기 페이지의 태그 선택/직접 추가 UI와 게시판 메인의 인기 태그 영역을 채운다.

직접 구현할 것:

- 초기 태그 목록
- 중복 없이 seed
- `GET /tags`
- `GET /tags/popular`
- 사용 횟수 count
- 직접 입력 태그를 저장할 수 있도록 태그명 정규화 규칙 정리

구현 후 테스트:

```bash
python -m pytest tests/test_tags_api.py
```

### Session 07: Post 스키마와 응답 변환

파일:

- `app/schemas/post.py`
- `app/services/post_service.py`

프론트 페이지 기능:

- 게시글 카드, 상세 페이지, 글쓰기 폼이 기대하는 요청/응답 모양을 맞춘다.

직접 구현할 것:

- `PostCreate`
- `PostUpdate`
- `PostResponse`
- `PostListResponse`
- `post_to_response`
- summary, tags, comment_count, is_owner 계산

구현 후 테스트:

```bash
python -m pytest tests/test_post_schemas.py
```

### Session 08: 게시글 목록과 상세 조회

파일:

- `app/routers/posts.py`
- `app/services/post_service.py`

프론트 페이지 기능:

- 게시판 메인(`/`, `/posts`)과 게시글 상세 페이지가 DB 게시글을 읽어 화면에 보여준다.

직접 구현할 것:

- `GET /posts`
- page, size
- keyword, post_type, tag, 반복 tags, slime_type 필터
- 반복 tags는 모두 포함 조건으로 처리
- 최신순 정렬
- `GET /posts/{post_id}`
- 404 처리

구현 후 테스트:

```bash
python -m pytest tests/test_posts_read_api.py
```

### Session 09: 게시글 생성, 수정, 삭제

파일:

- `app/routers/posts.py`
- `app/services/post_service.py`
- `app/services/tag_service.py`

프론트 페이지 기능:

- 글쓰기 페이지에서 새 글과 직접 입력 태그를 저장하고, 상세 페이지에서 작성자가 수정/삭제할 수 있게 한다.

직접 구현할 것:

- `POST /posts`
- `PATCH /posts/{post_id}`
- `DELETE /posts/{post_id}`
- DB insert
- DB update
- DB delete
- 작성자 권한 확인
- `tag_names` 정규화
- 새 태그 생성
- 태그 연결 교체

구현 후 테스트:

```bash
python -m pytest tests/test_posts_write_api.py
```

### Session 10: 댓글 API

파일:

- `app/schemas/comment.py`
- `app/routers/comments.py`

프론트 페이지 기능:

- 게시글 상세 페이지에서 댓글 목록, 작성, 수정, 삭제가 동작한다.

직접 구현할 것:

- `GET /posts/{post_id}/comments`
- `POST /posts/{post_id}/comments`
- `PATCH /comments/{comment_id}`
- `DELETE /comments/{comment_id}`
- 댓글 DB insert, update, delete
- 작성자 권한 확인

구현 후 테스트:

```bash
python -m pytest tests/test_comments_api.py
```

### Session 11: 프론트 연동 점검

파일:

- `app/main.py`
- `frontend/src/api/*` 호출 흐름 확인

프론트 페이지 기능:

- 회원가입, 로그인, 게시글 목록, 작성, 상세, 댓글, 태그 필터가 실제 백엔드와 이어지는지 확인한다.
- `/`와 `/posts`가 같은 목록 API로 동작하는지 확인한다.

직접 확인할 것:

- CORS
- access token header
- refresh token cookie
- `/auth/refresh` 재발급
- refresh 실패 시 로그인 화면으로 보내는 프론트 처리
- 204 응답
- 에러 메시지
- 프론트 타입과 백엔드 response field 일치
- `/?tags=거품&tags=클리어슬라임`와 `/posts?tag=거품` 호환
- 글쓰기에서 직접 추가한 태그가 상세/목록의 `tags` 응답에 포함되는지 확인

구현 후 테스트:

```bash
python -m pytest
```

## 나중 단계

아래 파일은 기본 기능이 끝난 뒤 다시 엽니다.

- `app/schemas/ai.py`
- `app/routers/ai.py`
- `app/services/rag_service.py`
- `app/services/embedding_service.py`
- `app/services/mcp_client.py`
- `app/services/agent_service.py`
- `app/models/embedding.py`

지금은 RAG, MCP, Agent를 구현하지 않습니다.
