# Backend Tests

세션 구현이 끝날 때마다 이 폴더에 테스트를 하나씩 추가합니다.

테스트는 완성 코드를 대신 주기 위한 파일이 아니라, 직접 구현한 코드가 실제로 API 계약을 지키는지 확인하기 위한 안전장치입니다.

세션별 테스트 코드는 Codex가 작성합니다. 사용자는 `backend/app` 구현을 직접 작성하고, Codex는 그 구현을 검증할 요청, 응답, DB, 권한 테스트를 `backend/tests`에 추가합니다.

## 실행

백엔드 폴더에서 실행합니다. 루트 `.venv`를 그대로 쓸 때는 `../.venv/bin/python`을 사용합니다.

```bash
python -m pytest
```

특정 세션 테스트만 실행할 때:

```bash
python -m pytest tests/test_health.py
```

현재 로컬 환경 예시:

```bash
../.venv/bin/python -m pytest tests/test_health.py
```

## 세션별 테스트 파일 이름

- Session 00: `tests/test_health.py`
- Session 02: `tests/test_auth_schemas.py`
- Session 03: `tests/test_auth_service.py`
- Session 04: `tests/test_auth_api.py`
- Session 05: `tests/test_models.py`
- Session 06: `tests/test_tags_api.py`
- Session 07: `tests/test_post_schemas.py`
- Session 08: `tests/test_posts_read_api.py`
- Session 09: `tests/test_posts_write_api.py`
- Session 10: `tests/test_comments_api.py`

## 테스트에서 볼 것

- status code가 API 명세와 맞는가
- response JSON field 이름이 프론트 타입과 맞는가
- DB에 insert/update/delete가 실제로 반영되는가
- 로그인 필요한 API가 token 없을 때 401을 주는가
- 작성자가 아닌 사용자가 수정/삭제할 때 403을 주는가
- 로그인 성공 시 access token body와 refresh token HttpOnly cookie가 함께 내려오는가
- access token 만료 상황에서 `/auth/refresh`가 새 access token을 발급하는가
- refresh token 재발급 성공 시 기존 refresh token이 revoked되고 새 token으로 회전되는가
- revoked되었거나 만료된 refresh token은 401을 반환하는가
- 로그아웃 시 refresh token이 revoked되고 cookie 삭제 header가 내려오는가
- `GET /posts?tags=...&tags=...`가 선택한 태그를 모두 포함한 글만 반환하는가
- 기존 `GET /posts?tag=...` 단일 태그 URL도 계속 동작하는가
- 글쓰기에서 보낸 `tag_names`가 새 태그 생성과 `post_tags` 연결로 이어지는가
- `/tags/popular`가 사용 횟수 기준으로 정렬되고 프론트에서 최대 8개 노출하기 쉬운 형태인가
