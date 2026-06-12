# Backend Tests

세션 구현이 끝날 때마다 이 폴더에 테스트를 하나씩 추가합니다.

테스트는 완성 코드를 대신 주기 위한 파일이 아니라, 직접 구현한 코드가 실제로 API 계약을 지키는지 확인하기 위한 안전장치입니다.

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
