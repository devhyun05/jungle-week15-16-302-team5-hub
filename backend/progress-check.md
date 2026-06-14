# Backend 진도 체크

이 문서는 백엔드 구현 학습의 현재 위치를 기록하기 위한 표입니다. 세션을 시작하기 전에 Codex가 이 파일을 먼저 확인하고, 다음 추천 세션을 제안한 뒤 시작 여부를 물어봅니다.

## 상태 기준

- `미시작`: 아직 오리엔테이션을 시작하지 않음
- `진행중`: 오리엔테이션 또는 Level 3 작성 중
- `복습필요`: 작성은 했지만 개념 설명, 테스트, 재작성에서 막힘
- `완료`: Level 3을 채우고, 피드백을 반영하고, 테스트 확인법까지 말로 설명함

## 현재 위치

- 현재 추천 세션: Session 06 `Tag API와 seed`
- 다음 행동: `schemas/tag.py`, `services/tag_service.py`, `routers/tags.py`, `seed.py` 오리엔테이션부터 시작하기
- 마지막 업데이트: 2026-06-14 / Session 05 마무리, `../.venv/bin/python -m pytest` 전체 29개 테스트 통과 확

## 세션별 체크표

| 순서 | 세션 | 주요 파일 | 핵심 개념 | 상태 | 오리엔테이션 | Level 3 1회차 | 피드백 반영 | 테스트 확인 | 말로 설명 | 메모 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 0 | FastAPI 앱과 health check | `app/main.py`, `tests/test_health.py` | 앱 생성, 라우터, 헬스체크, TestClient | 완료 | [x] | [x] | [x] | [x] | [x] | `/health`, CORS, 공통 API, pytest 결과 해석 완료 |
| 1 | 설정과 DB 세션 | `core/config.py`, `db/base.py`, `db/session.py` | Settings, engine, SessionLocal, dependency | 완료 | [x] | [x] | [x] | [x] | [x] | `BaseSettings`, `DeclarativeBase`, `create_engine`, `sessionmaker`, `get_db` 연결 완료 |
| 2 | User/Auth 모델과 스키마 | `models/user.py`, `models/refresh_token.py`, `schemas/auth.py` | User, RefreshToken, TokenResponse | 완료 | [x] | [x] | [x] | [x] | [x] | `User`, `RefreshToken`, Auth schema 구현 및 테스트 통과 |
| 3 | 인증 서비스 | `services/auth_service.py`, `tests/test_auth_service.py` | password hash, access JWT, refresh hash/rotation/revoke, current_user | 완료 | [x] | [x] | [x] | [x] | [x] | 비밀번호 hash/검증, access JWT, refresh token hash 저장/검증/회전/폐기, current_user 테스트 통과 |
| 4 | Auth API | `routers/auth.py` | signup, login, refresh, logout, me, cookie | 완료 | [x] | [x] | [x] | [x] | [x] | 회원가입/로그인/refresh/logout/me API 구현, cookie/access token 흐름 설명, 테스트 통과 |
| 5 | Post, Comment, Tag 모델 | `models/post.py`, `models/comment.py`, `models/tag.py` | 관계, ForeignKey, 다대다 | 완료 | [x] | [x] | [x] | [x] | [x] | 현재 프론트 폼 기준 최소 Post 필드, 댓글/태그 관계, post_tags 구현 |
| 6 | Tag API와 seed | `schemas/tag.py`, `services/tag_service.py`, `routers/tags.py`, `seed.py` | seed, tag list, popular count, 직접 입력 태그 정규화 | 미시작 | [ ] | [ ] | [ ] | [ ] | [ ] |  |
| 7 | Post 스키마와 응답 변환 | `schemas/post.py`, `services/post_service.py` | create/update/response, summary | 미시작 | [ ] | [ ] | [ ] | [ ] | [ ] |  |
| 8 | 게시글 목록과 상세 조회 | `routers/posts.py`, `services/post_service.py` | query, multi tags AND filter, paging, 404 | 미시작 | [ ] | [ ] | [ ] | [ ] | [ ] |  |
| 9 | 게시글 생성, 수정, 삭제 | `routers/posts.py`, `services/post_service.py`, `services/tag_service.py` | DB insert/update/delete, 권한, tag_names 저장 | 미시작 | [ ] | [ ] | [ ] | [ ] | [ ] |  |
| 10 | 댓글 API | `schemas/comment.py`, `routers/comments.py` | 댓글 CRUD, 권한, nested path | 미시작 | [ ] | [ ] | [ ] | [ ] | [ ] |  |
| 11 | 프론트 연동 점검 | `app/main.py`, `frontend/src/api/*` | CORS, token, 응답 필드, `/`/`/posts`, 다중 태그 URL 일치 | 미시작 | [ ] | [ ] | [ ] | [ ] | [ ] |  |

## 세션 종료 기록 양식

세션이 끝나면 아래 형식으로 메모를 남깁니다.

```md
### YYYY-MM-DD / Session NN

- 한 줄 요약:
- 막힌 지점:
- 테스트 확인:
- 다음에 다시 말로 설명할 개념:
- 다음 추천 행동:
```

### 2026-06-13 / Session 00

- 한 줄 요약: FastAPI 앱 입구인 `main.py`, CORS, 라우터 등록, `/health`의 역할을 이해하고 health test를 통과시킴.
- 막힌 지점: `main.py`가 실제 기능 로직인지, `/health`가 모든 라우터에 붙는 경로인지, `tests/README.md`가 무엇을 의미하는지 헷갈렸음.
- 테스트 확인: `python -m pytest tests/test_health.py` 실행 결과 `1 passed, 1 warning`; `GET /health`가 `200`과 `{"status": "ok"}`를 반환함.
- 다음에 다시 말로 설명할 개념: CORS가 브라우저의 다른 origin 요청 허용 규칙이라는 점, `tests/`는 기능 구현이 아니라 검증용 안전장치라는 점.
- 다음 추천 행동: Session 01 `설정과 DB 세션`에서 `Settings`, `DATABASE_URL`, SQLAlchemy `engine`, `SessionLocal`, `get_db` 흐름 이해하기.

### 2026-06-13 / Session 01

- 한 줄 요약: `core/config.py`와 `db/base.py`, `db/session.py`로 설정 기반 DB 연결 공통 구조를 구성하고 import/타입 흐름을 정리해 세션 01 공통 인프라를 완성함.
- 막힌 지점: `SessionLocal`의 생성 대상/옵션 오해(`Session` vs `sessionmaker`), `settings` 생성 방식(`Settings` 직접 생성 vs `get_settings` 캐시), `get_db` 반환 타입/`yield` 위치였습니다.
- 테스트 확인: `../.venv/bin/python -m pytest tests/test_health.py` (health baseline)로 마무리 체크.
- 다음에 다시 말로 설명할 개념: `DeclarativeBase`와 `create_engine`의 역할 분리, `get_db`에서 `yield`로 세션을 요청 생명주기 단위로 빌려주고 반납하는 방식.
- 다음 추천 행동: `Session 02` 진입 시 `models/user.py`, `models/refresh_token.py`, `schemas/auth.py` 오리엔테이션부터 시작.

### 2026-06-13 / Session 02

- 한 줄 요약: `User`, `RefreshToken` SQLAlchemy 모델과 Auth 요청/응답 Pydantic 스키마를 구현해 회원가입/로그인 데이터 계약을 완성함.
- 막힌 지점: 모델이 실제 테이블 생성 코드인지 설계도인지, refresh token cookie 이름과 실제 token 값의 차이, 원문 token과 hash 저장 방식, DB 모델과 응답 스키마의 필드 차이를 구분하는 부분.
- 테스트 확인: `../.venv/bin/python -m pytest tests/test_auth_schemas.py` 실행 결과 `7 passed`. `EmailStr` 검증을 위해 `email-validator` 의존성을 추가함.
- 다음에 다시 말로 설명할 개념: `models/*.py`는 SQLAlchemy DB 저장 구조, `schemas/*.py`는 Pydantic 요청/응답 JSON 구조라는 구분. refresh token 원문은 cookie에, hash는 DB에 저장한다는 흐름.
- 다음 추천 행동: Session 03 `인증 서비스`에서 비밀번호 해시, access token 생성, refresh token 생성/hash/검증/회전 로직을 구현하기.

### 2026-06-14 / Session 03

- 한 줄 요약: `auth_service.py`에서 비밀번호 hash/검증, access JWT 발급/검증, refresh token 원문 생성/hash 저장/검증/회전/폐기, `get_current_user` 흐름을 구현함.
- 막힌 지점: access token과 refresh token의 역할 차이, refresh token rotation이 필요한 이유, refresh token 원문과 DB hash의 차이, `datetime` timezone 비교 문제, SQLAlchemy query 대상과 컬럼 비교 위치.
- 테스트 확인: `../.venv/bin/python -m pytest tests/test_auth_schemas.py tests/test_auth_service.py` 실행 결과 `15 passed`. Session 03 단독 테스트는 `tests/test_auth_service.py` 기준 `8 passed`.
- 다음에 다시 말로 설명할 개념: refresh token은 cookie에 원문으로 있고 DB에는 hash만 저장한다는 점, `/auth/refresh`는 기존 refresh token을 검증한 뒤 폐기하고 새 access/refresh token을 발급한다는 점.
- 다음 추천 행동: Session 04 `Auth API`에서 `routers/auth.py`에 signup, login, refresh, logout, me API와 cookie 설정/삭제 흐름 구현하기.

### 2026-06-14 / Session 04

- 한 줄 요약: `routers/auth.py`에 회원가입, 로그인, refresh, logout, me API를 연결하고 access token body 응답과 refresh token HttpOnly cookie 흐름을 완성함.
- 막힌 지점: `Bearer` 인증 방식의 의미, `Depends`가 값을 주입하는 흐름, `main.py`의 `prefix="/auth"`와 `auth.py` 경로 조합, cookie `path="/auth"`와 프론트 라우터 경로의 차이.
- 테스트 확인: `../.venv/bin/python -m pytest` 실행 결과 `24 passed, 1 warning`. Session 04 API 테스트는 `tests/test_auth_api.py` 기준 `8 passed`.
- 다음에 다시 말로 설명할 개념: access token 만료 순간 자동 refresh가 아니라, 보호 API가 401을 반환했을 때 `/auth/refresh`를 시도한다는 점. 브라우저 refresh cookie 흐름에는 프론트 `credentials: "include"` 설정이 필요하다는 점.
- 다음 추천 행동: Session 05 `Post, Comment, Tag 모델`에서 게시글, 댓글, 태그, `post_tags` 관계 모델 오리엔테이션부터 시작.

### 2026-06-14 / Session 05

- 한 줄 요약: 현재 프론트 글쓰기 폼에 맞춰 `Post`는 `title`, `content`, `post_type`, `slime_type` 중심으로 단순화하고, `Comment`, `Tag`, `post_tags` 관계 모델을 구현함.
- 막힌 지점: API 설계서에는 레시피 재료, 비율, 제작 순서, 실패 증상 같은 확장 필드가 있었지만, 현재 프론트는 해당 입력칸을 보내지 않으므로 우선 `content` 본문에 저장하기로 결정함.
- 테스트 확인: `../.venv/bin/python -m pytest tests/test_models.py` 실행 결과 `5 passed`; 전체 `../.venv/bin/python -m pytest` 실행 결과 `29 passed, 1 warning`.
- 다음에 다시 말로 설명할 개념: `post_tags`가 왜 별도 중간 테이블인지, `relationship`은 DB 컬럼이 아니라 파이썬에서 연결 객체를 쉽게 탐색하게 해주는 설정이라는 점.
- 다음 추천 행동: Session 06 `Tag API와 seed`에서 초기 태그 seed, `GET /tags`, `GET /tags/popular`, 태그 정규화 흐름 구현하기.

