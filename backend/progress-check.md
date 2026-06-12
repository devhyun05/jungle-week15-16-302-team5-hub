# Backend 진도 체크

이 문서는 백엔드 구현 학습의 현재 위치를 기록하기 위한 표입니다. 세션을 시작하기 전에 Codex가 이 파일을 먼저 확인하고, 다음 추천 세션을 제안한 뒤 시작 여부를 물어봅니다.

## 상태 기준

- `미시작`: 아직 오리엔테이션을 시작하지 않음
- `진행중`: 오리엔테이션 또는 Level 3 작성 중
- `복습필요`: 작성은 했지만 개념 설명, 테스트, 재작성에서 막힘
- `완료`: Level 3을 채우고, 피드백을 반영하고, 테스트 확인법까지 말로 설명함

## 현재 위치

- 현재 추천 세션: Session 00 `FastAPI 앱과 health check`
- 다음 행동: `app/main.py`와 `tests/test_health.py` 오리엔테이션부터 시작하기
- 마지막 업데이트: 2026-06-11 / 백엔드 학습 골격 세팅

## 세션별 체크표

| 순서 | 세션 | 주요 파일 | 핵심 개념 | 상태 | 오리엔테이션 | Level 3 1회차 | 피드백 반영 | 테스트 확인 | 말로 설명 | 메모 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 0 | FastAPI 앱과 health check | `app/main.py`, `tests/test_health.py` | 앱 생성, 라우터, 헬스체크, TestClient | 미시작 | [ ] | [ ] | [ ] | [ ] | [ ] |  |
| 1 | 설정과 DB 세션 | `core/config.py`, `db/base.py`, `db/session.py` | Settings, engine, SessionLocal, dependency | 미시작 | [ ] | [ ] | [ ] | [ ] | [ ] |  |
| 2 | User 모델과 Auth 스키마 | `models/user.py`, `schemas/auth.py` | SQLAlchemy 모델, Pydantic schema | 미시작 | [ ] | [ ] | [ ] | [ ] | [ ] |  |
| 3 | 인증 서비스 | `services/auth_service.py` | password hash, JWT, current_user | 미시작 | [ ] | [ ] | [ ] | [ ] | [ ] |  |
| 4 | Auth API | `routers/auth.py` | signup, login, me, DB insert | 미시작 | [ ] | [ ] | [ ] | [ ] | [ ] |  |
| 5 | Post, Comment, Tag 모델 | `models/post.py`, `models/comment.py`, `models/tag.py` | 관계, ForeignKey, 다대다 | 미시작 | [ ] | [ ] | [ ] | [ ] | [ ] |  |
| 6 | Tag API와 seed | `schemas/tag.py`, `services/tag_service.py`, `routers/tags.py`, `seed.py` | seed, tag list, popular count | 미시작 | [ ] | [ ] | [ ] | [ ] | [ ] |  |
| 7 | Post 스키마와 응답 변환 | `schemas/post.py`, `services/post_service.py` | create/update/response, summary | 미시작 | [ ] | [ ] | [ ] | [ ] | [ ] |  |
| 8 | 게시글 목록과 상세 조회 | `routers/posts.py`, `services/post_service.py` | query, filter, paging, 404 | 미시작 | [ ] | [ ] | [ ] | [ ] | [ ] |  |
| 9 | 게시글 생성, 수정, 삭제 | `routers/posts.py`, `services/post_service.py`, `services/tag_service.py` | DB insert/update/delete, 권한 | 미시작 | [ ] | [ ] | [ ] | [ ] | [ ] |  |
| 10 | 댓글 API | `schemas/comment.py`, `routers/comments.py` | 댓글 CRUD, 권한, nested path | 미시작 | [ ] | [ ] | [ ] | [ ] | [ ] |  |
| 11 | 프론트 연동 점검 | `app/main.py`, `frontend/src/api/*` | CORS, token, 응답 필드 일치 | 미시작 | [ ] | [ ] | [ ] | [ ] | [ ] |  |

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
