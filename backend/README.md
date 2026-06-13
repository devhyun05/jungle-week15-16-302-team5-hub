# Backend Practice

이 폴더는 말랑 연구소 백엔드를 실제 파일에 직접 구현하며 학습하는 공간입니다.

기준 계약은 [`api-spec.md`](./api-spec.md)입니다. 지금 단계에서는 RAG, MCP, Agent를 구현하지 않고, 현재 프론트가 필요로 하는 인증, 게시글, 댓글, 태그 API를 먼저 완성합니다.

## 진행 문서

- [`00-learning-plan.md`](./00-learning-plan.md): 세션 순서, 각 세션 목표, 구현 파일, 테스트 확인법
- [`progress-check.md`](./progress-check.md): 현재 진도와 완료 조건 기록
- [`tests/README.md`](./tests/README.md): 테스트 파일을 어떻게 늘려갈지 정리

## 진행 방식

1. 세션을 시작하기 전에 Codex가 `progress-check.md`를 먼저 읽습니다.
2. 완료되지 않은 가장 앞 세션을 추천합니다.
3. 오리엔테이션에서는 이 세션이 프론트의 어떤 페이지 기능을 살리는지 분명하게 말합니다.
4. 개념, 문법, 파일 역할, 요청/응답 흐름, DB 흐름을 설명합니다.
5. Level 3 빈칸 문제는 사용자가 요청할 때만, 파일에 저장하지 않고 채팅으로만 냅니다. 각 함수/클래스 위에는 핵심 역할을 1~2줄 주석으로 먼저 적고, 모든 `____` 빈칸에는 바로 옆이나 위에 힌트 주석을 붙입니다.
6. 사용자가 실제 `backend/app` 파일에 직접 코드를 작성합니다.
7. Codex는 정답을 바로 붙이지 않고 작성분을 읽고 힌트와 수정 방향을 줍니다.
8. 세션별 테스트 코드는 Codex가 `tests/`에 작성합니다.
9. 세션 코드 구현이 끝나면 Codex가 테스트 실행 방법과 결과 해석을 함께 안내합니다.

## 현재 상태

완성되어 있던 백엔드 코드는 세션 학습용 골격으로 줄였습니다.

현재 바로 살아있는 기능은 `/health`뿐입니다. 나머지 라우터, 모델, 스키마, 서비스는 사용자가 세션 흐름에 맞춰 직접 채울 예정입니다.

프론트 변경 후 백엔드가 맞춰야 할 핵심 계약:

- 인증은 access token + refresh token 방식으로 구현한다.
- access token은 짧게 만료되는 JWT이고, API 요청에서는 `Authorization: Bearer`로 전달한다.
- refresh token은 원문을 저장하지 않고 hash만 DB에 저장하며, HttpOnly cookie로 전달하는 방식을 목표로 한다.
- `/auth/refresh` 요청마다 refresh token을 회전시키고, `/auth/logout`에서 폐기한다.
- `/`와 `/posts`는 모두 같은 게시판 메인 화면이며, 백엔드는 `GET /posts` 하나로 목록을 제공한다.
- `GET /posts`는 `keyword`, `post_type`, `tag`, 반복 `tags` query를 지원한다.
- 반복 `tags`는 선택한 태그를 모두 포함하는 AND 필터다.
- 글쓰기/수정 요청의 `tag_names`는 추천 태그뿐 아니라 사용자가 직접 입력한 태그도 포함한다.
- `GET /tags/popular`는 많이 사용된 태그를 반환하고, 프론트는 최대 8개만 노출한다.

## 로컬 실행

백엔드 폴더에서 의존성을 설치한 뒤 실행합니다.

```bash
pip install -r requirements.txt
uvicorn app.main:app --reload
```

상태 확인:

```bash
curl http://localhost:8000/health
```

## 테스트

```bash
python -m pytest
```

루트 `.venv`를 그대로 쓰는 현재 로컬 환경에서는 백엔드 폴더에서 아래처럼 실행할 수 있습니다.

```bash
../.venv/bin/python -m pytest
```

세션별 구현이 끝날 때마다 `tests/`에 해당 기능 테스트를 추가하고, 그 테스트를 먼저 통과시키는 방식으로 진행합니다.
