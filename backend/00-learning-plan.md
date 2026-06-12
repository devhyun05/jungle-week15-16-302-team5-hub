# Backend Top-Down Plan

목표는 FastAPI 문법을 따로 외우는 것이 아니라, 현재 말랑 연구소 프론트 화면이 실제 DB와 연결되어 움직이도록 백엔드를 직접 구현하는 것입니다.

기준 API는 [`api-spec.md`](./api-spec.md)입니다. RAG, MCP, Agent는 아직 구현하지 않습니다. 기본 인증, 게시글, 댓글, 태그 API가 실제로 동작하고 테스트로 확인된 뒤 다음 단계에서 붙입니다.

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

오리엔테이션 후에는 반드시 Level 3 빈칸부터 시작합니다.

## 시작 전 진도 확인 절차

세션 시작 요청이 오면 Codex는 다음 순서로 움직입니다.

1. `progress-check.md`를 읽습니다.
2. `완료`가 아닌 가장 앞 세션을 찾습니다.
3. 현재 추천 세션, 이전 세션 상태, 오늘 할 일을 짧게 요약합니다.
4. 사용자에게 "이 세션 오리엔테이션부터 시작할까요?"라고 묻습니다.
5. 사용자가 시작하겠다고 하면 오리엔테이션을 진행합니다.
6. 오리엔테이션이 끝난 뒤에만 Level 3 빈칸을 채팅으로 냅니다.

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

Level 3 빈칸 코드는 파일에 미리 저장하지 않습니다. Codex가 세션 중 채팅으로만 제공합니다.

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
- `app/models/__init__.py`
- `app/schemas/auth.py`

프론트 페이지 기능:

- 회원가입 페이지와 로그인 페이지가 사용할 사용자 데이터 모양을 만든다.

직접 구현할 것:

- `users` 테이블 모델
- email, password_hash, nickname, created_at
- `SignupRequest`
- `LoginRequest`
- `UserResponse`
- `TokenResponse`

구현 후 테스트:

```bash
python -m pytest tests/test_auth_schemas.py
```

### Session 03: 인증 서비스

파일:

- `app/services/auth_service.py`

프론트 페이지 기능:

- 로그인 페이지에서 입력한 비밀번호를 검증하고, 이후 요청에 붙일 토큰을 만든다.

직접 구현할 것:

- 비밀번호 해시
- 비밀번호 검증
- JWT access token 생성
- 이메일로 사용자 찾기
- `get_current_user`
- `get_optional_current_user`

구현 후 테스트:

```bash
python -m pytest tests/test_auth_service.py
```

### Session 04: Auth API

파일:

- `app/routers/auth.py`

프론트 페이지 기능:

- `/signup`, `/login`, 로그인 상태 확인 흐름을 실제 API로 연결한다.

직접 구현할 것:

- `POST /auth/signup`
- `POST /auth/login`
- `GET /auth/me`
- 중복 이메일 예외
- 로그인 실패 예외
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

- 글쓰기 페이지의 태그 선택 버튼과 목록 페이지의 인기 태그 영역을 채운다.

직접 구현할 것:

- 초기 태그 목록
- 중복 없이 seed
- `GET /tags`
- `GET /tags/popular`
- 사용 횟수 count

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

- 홈/게시글 목록/게시글 상세 페이지가 DB 게시글을 읽어 화면에 보여준다.

직접 구현할 것:

- `GET /posts`
- page, size
- keyword, post_type, tag, slime_type 필터
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

- 글쓰기 페이지에서 새 글을 저장하고, 상세 페이지에서 작성자가 수정/삭제할 수 있게 한다.

직접 구현할 것:

- `POST /posts`
- `PATCH /posts/{post_id}`
- `DELETE /posts/{post_id}`
- DB insert
- DB update
- DB delete
- 작성자 권한 확인
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

직접 확인할 것:

- CORS
- access token header
- 204 응답
- 에러 메시지
- 프론트 타입과 백엔드 response field 일치

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
