# Setup Notes

## 2026-06-14 auth_refresh_tokens 테이블 생성 확인 명령

JWT refresh token 모델을 추가한 뒤에는 기존 DB 초기화 명령을 다시 실행하면 새 테이블이 생성된다.

```powershell
cd C:\junhee\WEEK15_AI_BOARD\backend
.\.venv\Scripts\python.exe -c "from app.db.init_db import init_db; init_db(); print('init_db done')"
```

실제 PostgreSQL 테이블 목록에서 `auth_refresh_tokens`가 보이는지 확인한다.

```powershell
cd C:\junhee\WEEK15_AI_BOARD\backend
.\.venv\Scripts\python.exe -c "from sqlalchemy import inspect; from app.db.session import engine; print(sorted(inspect(engine).get_table_names()))"
```

특정 테이블의 컬럼만 확인하려면 아래 명령을 사용한다.

```powershell
cd C:\junhee\WEEK15_AI_BOARD\backend
.\.venv\Scripts\python.exe -c "from sqlalchemy import inspect; from app.db.session import engine; print([column['name'] for column in inspect(engine).get_columns('auth_refresh_tokens')])"
```

## 2026-06-14 내 기록 API QA에 사용한 명령어

### 전체 내 기록 조회

```powershell
Invoke-RestMethod -Uri "http://localhost:8000/me/posts?visibility=all&size=50"
```

### 공개 글만 조회

```powershell
Invoke-RestMethod -Uri "http://localhost:8000/me/posts?visibility=public&size=50"
```

### 비공개 글만 조회

```powershell
Invoke-RestMethod -Uri "http://localhost:8000/me/posts?visibility=private&size=50"
```

### 카테고리 필터 조회

```powershell
Invoke-RestMethod -Uri "http://localhost:8000/me/posts?category=learning-log&visibility=all&size=50"
```

### 브라우저 확인 URL

```txt
http://localhost:5173/my-records
```

## 2026-06-14 댓글 삭제 API QA에 사용한 명령어

### 댓글 삭제 상태 코드 확인

```powershell
curl.exe -s -o NUL -w "%{http_code}" -X DELETE "http://localhost:8000/comments/{comment_id}"
```

기대 결과:

```txt
204
```

### 없는 댓글 삭제 확인

```powershell
curl.exe -s -o NUL -w "%{http_code}" -X DELETE "http://localhost:8000/comments/999999999"
```

기대 결과:

```txt
404
```

### 댓글 목록 확인

```powershell
Invoke-RestMethod -Uri "http://localhost:8000/posts/{post_id}/comments"
```

삭제 후 기대 결과:

```json
{
  "postId": 1,
  "items": [],
  "total": 0
}
```

## 2026-06-14 삭제 API QA에 사용한 명령어

### 백엔드 문법 검증

```powershell
cd C:\junhee\WEEK15_AI_BOARD\backend
.\.venv\Scripts\python.exe -m compileall app
```

### 프론트 빌드 검증

```powershell
cd C:\junhee\WEEK15_AI_BOARD\frontend
npm run build
```

### 삭제 API 상태 코드 확인

PowerShell `Invoke-WebRequest`가 `204 No Content`에서 내부 예외를 낼 수 있어서 상태 코드 확인에는 `curl.exe`를 사용했다.

```powershell
curl.exe -s -o NUL -w "%{http_code}" -X DELETE "http://localhost:8000/posts/{post_id}"
```

기대 결과:

```txt
204
```

### 삭제 후 상세 조회 확인

```powershell
curl.exe -s -o NUL -w "%{http_code}" "http://localhost:8000/posts/{post_id}"
```

기대 결과:

```txt
404
```

## 2026-06-14 게시글 수정 API 검증 명령과 확인 URL

백엔드 서버와 프론트엔드 서버가 모두 켜져 있어야 한다.

```powershell
# backend
cd C:\junhee\WEEK15_AI_BOARD\backend
.\.venv\Scripts\Activate.ps1
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000

# frontend
cd C:\junhee\WEEK15_AI_BOARD\frontend
npm run dev
```

게시글 생성 후 수정 API를 검증하는 PowerShell 흐름:

```powershell
$createPayload = @{
  title = "api patch flow seed"
  summary = "seed summary"
  content = "seed content"
  categorySlug = "learning-log"
  tags = @("FastAPI", "PatchSeed")
  isPublic = $true
  relatedCommit = "seed-commit"
} | ConvertTo-Json

$created = Invoke-RestMethod -Uri "http://localhost:8000/posts" -Method Post -ContentType "application/json" -Body $createPayload
$postId = $created.id

$updatePayload = @{
  title = "api patch flow updated"
  summary = "updated summary"
  content = "updated content"
  categorySlug = "troubleshooting"
  tags = @("FastAPI", "UpdateAPI")
  isPublic = $true
  relatedCommit = "updated-commit"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8000/posts/$postId" -Method Patch -ContentType "application/json" -Body $updatePayload
Invoke-RestMethod -Uri "http://localhost:8000/posts/$postId" -Method Get
```

브라우저 확인 URL:

```txt
http://localhost:5173/posts/{postId}/edit
```

확인할 것:

- 수정 화면 제목이 `게시글 수정`으로 보인다.
- 제목 input에 수정된 제목이 들어간다.
- 본문 textarea에 수정된 content가 들어간다.
- 카테고리 select가 수정된 카테고리를 보여준다.
- 수정 완료 버튼을 누르면 `PATCH /posts/{postId}`가 호출될 준비가 되어 있다.

## 2026-06-14 게시글 목록/상세 화면 확인 URL

프론트와 백엔드 서버가 모두 켜져 있어야 한다.

```powershell
# frontend
cd C:\junhee\WEEK15_AI_BOARD\frontend
npm run dev

# backend
cd C:\junhee\WEEK15_AI_BOARD\backend
.\.venv\Scripts\Activate.ps1
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

브라우저 확인 URL:

```txt
http://localhost:5173/posts
http://localhost:5173/posts/4
```

기대 결과:

- `/posts`에서 백엔드 `GET /posts` 응답 목록이 보인다.
- `/posts/4`에서 `post create api test` 상세가 보인다.
- 화면에 `Unexpected Application Error`가 없어야 한다.

## 2026-06-14 게시글 작성 API 검증 명령어

백엔드 서버가 켜져 있어야 한다.

```powershell
cd C:\junhee\WEEK15_AI_BOARD\backend
.\.venv\Scripts\Activate.ps1
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

OpenAPI에서 `/posts` method 확인:

```powershell
$openapi = Invoke-RestMethod -Uri http://127.0.0.1:8000/openapi.json
$openapi.paths.'/posts'.PSObject.Properties.Name
```

게시글 작성:

```powershell
$body = @{
  title = 'post create api test'
  summary = 'post create api summary'
  content = 'post create api content'
  categorySlug = 'learning-log'
  tags = @('FastAPI', 'CreateAPI')
  isPublic = $true
  relatedCommit = 'api-create-post-test'
} | ConvertTo-Json

Invoke-RestMethod -Uri http://127.0.0.1:8000/posts -Method Post -ContentType 'application/json' -Body $body
```

생성된 글 목록 조회:

```powershell
Invoke-RestMethod -Uri 'http://127.0.0.1:8000/posts?keyword=post%20create%20api%20test' | ConvertTo-Json -Depth 5
```

없는 카테고리 404 확인:

```powershell
try {
  $body = @{
    title = 'bad category test'
    content = 'bad category content'
    categorySlug = 'missing-category'
    tags = @()
    isPublic = $true
  } | ConvertTo-Json

  Invoke-RestMethod -Uri http://127.0.0.1:8000/posts -Method Post -ContentType 'application/json' -Body $body
} catch {
  $_.Exception.Response.StatusCode.value__
}
```

공백 제목/본문 400 확인:

```powershell
try {
  $body = @{
    title = ' '
    content = ' '
    categorySlug = 'learning-log'
    tags = @()
    isPublic = $true
  } | ConvertTo-Json

  Invoke-RestMethod -Uri http://127.0.0.1:8000/posts -Method Post -ContentType 'application/json' -Body $body
} catch {
  $_.Exception.Response.StatusCode.value__
}
```

## 2026-06-13 댓글 작성 API 검증 명령어

백엔드 서버가 켜져 있어야 한다.

```powershell
cd C:\junhee\WEEK15_AI_BOARD\backend
.\.venv\Scripts\Activate.ps1
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

OpenAPI에서 댓글 경로와 method 확인:

```powershell
$openapi = Invoke-RestMethod -Uri http://127.0.0.1:8000/openapi.json
$openapi.paths.'/posts/{post_id}/comments'.PSObject.Properties.Name
```

댓글 작성:

```powershell
$body = @{ content = 'comment api test' } | ConvertTo-Json
Invoke-RestMethod -Uri http://127.0.0.1:8000/posts/1/comments -Method Post -ContentType 'application/json' -Body $body
```

댓글 목록 조회:

```powershell
Invoke-RestMethod -Uri http://127.0.0.1:8000/posts/1/comments | ConvertTo-Json -Depth 5
```

없는 게시글 댓글 작성 404 확인:

```powershell
try {
  $body = @{ content = 'missing post test' } | ConvertTo-Json
  Invoke-RestMethod -Uri http://127.0.0.1:8000/posts/999999/comments -Method Post -ContentType 'application/json' -Body $body
} catch {
  $_.Exception.Response.StatusCode.value__
}
```

공백 댓글 400 확인:

```powershell
try {
  $body = @{ content = '   ' } | ConvertTo-Json
  Invoke-RestMethod -Uri http://127.0.0.1:8000/posts/1/comments -Method Post -ContentType 'application/json' -Body $body
} catch {
  $_.Exception.Response.StatusCode.value__
}
```

이 문서는 JungleLog 프로젝트를 처음 세팅하거나 다른 컴퓨터에서 다시 실행할 때 필요한 명령어와 이유를 기록한다.
README는 짧은 실행 방법을 담고, 이 문서는 세팅 과정과 확인 방법을 자세히 남긴다.

## 작성 규칙

- 실제로 실행한 명령어와 결과를 기록한다.
- 왜 그 명령어를 쓰는지 한 줄로 설명한다.
- 에러가 나면 해결 과정은 `troubleshooting.md`에 자세히 기록한다.
- 새 패키지를 설치하면 `requirements.txt` 또는 `package.json` 반영 여부를 확인한다.

## 현재 환경 기준

| 항목 | 값 |
| --- | --- |
| 프로젝트 루트 | `C:\junhee\WEEK15_AI_BOARD` |
| 프론트엔드 | React + Vite |
| 백엔드 | FastAPI |
| Python 권장 명령 | `python` |
| Python 버전 | `Python 3.11.9` |
| 주의 | `py --version`은 `Python 3.15.0a7` alpha 버전이므로 이 프로젝트에서는 사용하지 않는다. |

## Backend 초기 세팅

### 1. Python 확인

```powershell
python --version
py --version
```

확인 결과:

```txt
python --version -> Python 3.11.9
py --version -> Python 3.15.0a7
```

결론:

- 프로젝트에서는 안정 버전인 `python` 명령을 사용한다.
- `py`는 alpha 버전을 가리키므로 사용하지 않는다.

### 2. backend 폴더로 이동

```powershell
cd C:\junhee\WEEK15_AI_BOARD\backend
```

이유:

- 백엔드 가상환경과 Python 패키지는 `backend` 폴더 안에서 관리한다.

### 3. Python 가상환경 생성

```powershell
python -m venv .venv
```

이유:

- 프로젝트 전용 Python 패키지 공간을 만든다.
- 전역 Python 환경과 프로젝트 의존성이 섞이지 않게 한다.

확인:

```powershell
dir -Force
```

성공 기준:

```txt
backend/.venv 폴더가 보인다.
```

### 4. 가상환경 활성화

```powershell
.\.venv\Scripts\Activate.ps1
```

성공 기준:

```powershell
(.venv) PS C:\junhee\WEEK15_AI_BOARD\backend>
```

PowerShell 실행 정책 오류가 나면:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
.\.venv\Scripts\Activate.ps1
```

### 5. 가상환경 Python / pip 확인

```powershell
python --version
pip --version
```

확인 결과:

```txt
Python 3.11.9
pip 24.0 from C:\junhee\WEEK15_AI_BOARD\backend\.venv\Lib\site-packages\pip (python 3.11)
```

성공 기준:

- `pip --version` 경로에 `backend\.venv`가 포함되어 있다.

### 6. FastAPI / Uvicorn 설치

```powershell
pip install fastapi uvicorn
```

이유:

- `fastapi`: Python API 서버 프레임워크
- `uvicorn`: FastAPI 앱을 실행하는 ASGI 서버

설치 확인:

```powershell
pip list
```

확인할 패키지:

- `fastapi`
- `uvicorn`
- `pydantic`
- `starlette`

### 7. requirements.txt 생성

```powershell
pip freeze > requirements.txt
```

이유:

- 현재 백엔드 가상환경에 설치된 패키지와 버전을 기록한다.
- 다른 컴퓨터에서는 아래 명령으로 같은 패키지를 설치할 수 있다.

```powershell
pip install -r requirements.txt
```

현재 생성 확인:

```txt
backend/requirements.txt
```

### 8. FastAPI 서버 실행

```powershell
uvicorn app.main:app --reload
```

대체 명령:

```powershell
python -m uvicorn app.main:app --reload
```

읽는 법:

- `app.main`: `backend/app/main.py` 파일을 의미한다.
- `:app`: `main.py` 안의 `app = FastAPI(...)` 객체를 의미한다.
- `--reload`: 코드가 바뀌면 서버를 자동 재시작한다.

### 9. Health API 확인

브라우저:

```txt
http://127.0.0.1:8000/health
```

기대 응답:

```json
{
  "status": "ok",
  "service": "junglelog-backend"
}
```

Swagger 문서:

```txt
http://127.0.0.1:8000/docs
```

확인 기준:

- `/docs`에 `GET /health`가 보인다.
- `HealthResponse` schema에 `status`, `service`가 보인다.
- 실제 `/health` 응답과 `/docs` schema가 일치한다.

## Backend 환경변수 설정

### 1. pydantic-settings 설치

```powershell
pip install pydantic-settings
pip freeze > requirements.txt
```

이유:

- `.env` 파일의 설정값을 `config.py`에서 읽기 위해 사용한다.

확인:

```powershell
pip list
```

확인할 패키지:

- `pydantic-settings`
- `python-dotenv`

### 2. .env 생성

파일:

```txt
backend/.env
```

내용:

```env
APP_NAME=JungleLog API
BACKEND_CORS_ORIGINS=http://localhost:5173
```

주의:

- `.env`에는 나중에 `DATABASE_URL`, `JWT_SECRET_KEY`, `OPENAI_API_KEY`, `GITHUB_TOKEN` 같은 민감 정보가 들어갈 수 있다.
- 민감 정보가 들어가면 Git에 올리지 않아야 한다.

### 3. .env.example 생성

파일:

```txt
backend/.env.example
```

내용:

```env
APP_NAME=JungleLog API
BACKEND_CORS_ORIGINS=http://localhost:5173
```

이유:

- 실제 `.env`는 Git에 올리지 않는다.
- 대신 `.env.example`을 공유해서 팀원이 어떤 설정값이 필요한지 알 수 있게 한다.

### 4. config.py에서 설정 읽기

파일:

```txt
backend/app/core/config.py
```

역할:

- `.env`의 `APP_NAME`을 `settings.app_name`으로 읽는다.
- `.env`의 `BACKEND_CORS_ORIGINS`를 `settings.backend_cors_origins`로 읽는다.

### 5. main.py에서 settings 사용

파일:

```txt
backend/app/main.py
```

확인할 코드:

```python
app = FastAPI(title=settings.app_name)
allow_origins=[settings.backend_cors_origins]
```

## Frontend 실행

프론트엔드 개발 서버:

```powershell
cd C:\junhee\WEEK15_AI_BOARD\frontend
npm install
npm run dev
```

프론트엔드 빌드:

```powershell
npm run build
```

## PostgreSQL Docker 실행

프로젝트 루트에서:

```powershell
cd C:\junhee\WEEK15_AI_BOARD
docker compose up -d
```

실행 결과:

```txt
Image postgres:16 Pulled
Network week15_ai_board_default Created
Volume week15_ai_board_postgres_data Created
Container junglelog-postgres Started
```

확인:

```powershell
docker ps
```

확인 결과:

```txt
junglelog-postgres
postgres:16
Up
0.0.0.0:5432->5432/tcp
```

로그 확인:

```powershell
docker logs junglelog-postgres
```

성공 기준:

```txt
database system is ready to accept connections
```

데이터 유지용 volume 확인:

```powershell
docker volume ls --filter name=week15_ai_board_postgres_data
```

확인 결과:

```txt
week15_ai_board_postgres_data
```

접속 정보:

```txt
Host: localhost
Port: 5432
Database: junglelog
Username: junglelog
Password: junglelog
```

FastAPI에서 사용할 예정인 연결 문자열:

```txt
postgresql+psycopg://junglelog:junglelog@localhost:5432/junglelog
```

## SQLAlchemy / psycopg 설치

backend 가상환경이 켜진 상태에서 실행:

```powershell
cd C:\junhee\WEEK15_AI_BOARD\backend
.\.venv\Scripts\Activate.ps1
pip install sqlalchemy "psycopg[binary]"
pip freeze > requirements.txt
```

설치된 주요 패키지:

```txt
SQLAlchemy==2.0.50
psycopg==3.3.4
psycopg-binary==3.3.4
greenlet==3.5.1
```

역할:

- `SQLAlchemy`: Python 코드에서 DB 연결, 세션, 모델, 쿼리를 다루는 도구
- `psycopg`: Python이 PostgreSQL과 실제로 통신할 때 사용하는 드라이버
- `requirements.txt`: 다른 환경에서도 같은 패키지를 설치할 수 있도록 남기는 의존성 목록

## FastAPI DB 연결 확인

DB 연결과 초기 관리자 설정에서 사용할 값:

```env
DATABASE_URL=postgresql+psycopg://junglelog:junglelog@localhost:5432/junglelog
ADMIN_EMAILS=admin@junglelog.dev
```

`backend/app/core/config.py`에서 `database_url` 설정을 읽도록 추가했다.

```python
database_url: str = "postgresql+psycopg://junglelog:junglelog@localhost:5432/junglelog"
admin_emails: str = ""
```

`backend/app/db/session.py`에서 SQLAlchemy engine, session factory, FastAPI dependency를 구성했다.

```txt
settings.database_url
-> create_engine(...)
-> SessionLocal
-> get_db()
-> router에서 Depends(get_db)
```

DB 연결 확인 endpoint:

```txt
GET http://localhost:8000/health/db
```

응답:

```json
{
  "status": "ok",
  "database": "postgresql"
}
```

검증 명령:

```powershell
Invoke-RestMethod -Uri http://localhost:8000/health
Invoke-RestMethod -Uri http://localhost:8000/health/db
```

백엔드 문법/import 검증:

```powershell
python -m compileall app
```

Codex 샌드박스에서는 로컬 Python 실행 권한 때문에 직접 실행이 막힐 수 있으므로, 필요한 경우 권한을 올려 검증한다.

## 2026-06-13 DB 테이블 생성과 기본 카테고리 seed

백엔드 가상환경 Python으로 DB 초기화 함수를 실행한다.

```powershell
cd C:\junhee\WEEK15_AI_BOARD\backend
.\.venv\Scripts\python.exe -c "from app.db.init_db import init_db; init_db(); print('init_db done')"
```

실제 PostgreSQL에 테이블이 생겼는지 확인한다.

```powershell
cd C:\junhee\WEEK15_AI_BOARD\backend
.\.venv\Scripts\python.exe -c "from sqlalchemy import inspect; from app.db.session import engine; print(sorted(inspect(engine).get_table_names()))"
```

기본 카테고리 seed 데이터를 확인한다.

```powershell
cd C:\junhee\WEEK15_AI_BOARD\backend
.\.venv\Scripts\python.exe -c "from sqlalchemy import select; from app.db.models import PostCategory; from app.db.session import SessionLocal; db = SessionLocal(); rows = db.execute(select(PostCategory.slug, PostCategory.label).order_by(PostCategory.id)).all(); db.close(); print(rows)"
```

주의: PowerShell에서 시스템 Python을 쓰면 `sqlalchemy`가 없을 수 있다.
반드시 `backend\.venv\Scripts\python.exe`를 사용하거나 가상환경을 활성화한 뒤 실행한다.

## 2026-06-13 댓글/태그 테이블 생성 확인

댓글/태그 모델을 추가한 뒤 기존 DB 초기화 명령을 다시 실행한다.

```powershell
cd C:\junhee\WEEK15_AI_BOARD\backend
.\.venv\Scripts\python.exe -c "from app.db.init_db import init_db; init_db(); print('init_db done')"
```

실제 테이블 목록에 `comments`, `tags`, `post_tags`가 있는지 확인한다.

```powershell
cd C:\junhee\WEEK15_AI_BOARD\backend
.\.venv\Scripts\python.exe -c "from sqlalchemy import inspect; from app.db.session import engine; print(sorted(inspect(engine).get_table_names()))"
```

새 테이블 count를 확인한다.

```powershell
cd C:\junhee\WEEK15_AI_BOARD\backend
.\.venv\Scripts\python.exe -c "from sqlalchemy import func, select; from app.db.models import Comment, PostTag, Tag; from app.db.session import SessionLocal; db = SessionLocal(); print(db.scalar(select(func.count()).select_from(Comment))); print(db.scalar(select(func.count()).select_from(Tag))); print(db.scalar(select(func.count()).select_from(PostTag))); db.close()"
```
## 2026-06-13 게시글 조회 API seed와 검증 명령

4단계 게시글 조회 API를 확인하기 위해 개발용 demo 사용자/게시글/태그 seed를 추가했다.

### DB 테이블 생성과 seed 실행

```powershell
cd C:\junhee\WEEK15_AI_BOARD\backend
.\.venv\Scripts\python.exe -c "from app.db.init_db import init_db; init_db(); print('init_db done')"
```

### 백엔드 import 검증

```powershell
cd C:\junhee\WEEK15_AI_BOARD\backend
.\.venv\Scripts\python.exe -m compileall app
```

### posts API 수동 확인

서버를 켠 뒤 아래 주소를 확인한다.

```txt
http://127.0.0.1:8000/posts
http://127.0.0.1:8000/posts?category=learning-log
http://127.0.0.1:8000/posts?keyword=JWT
http://127.0.0.1:8000/posts/1
http://127.0.0.1:8000/docs
```

주의: 실제 id는 DB seed 상태에 따라 달라질 수 있다. 먼저 `/posts`에서 첫 번째 게시글의 `id`를 확인한 뒤 상세 API를 호출한다.

## 2026-06-13 실제 PostgreSQL 테이블 목록 확인

SQLAlchemy 모델을 추가한 뒤 실제 PostgreSQL에 테이블이 만들어졌는지 확인할 때 사용한다.

### init_db 실행

```powershell
cd C:\junhee\WEEK15_AI_BOARD\backend
.\.venv\Scripts\python.exe -c "from app.db.init_db import init_db; init_db(); print('init_db done')"
```

### SQLAlchemy inspect로 테이블 목록 확인

```powershell
cd C:\junhee\WEEK15_AI_BOARD\backend
.\.venv\Scripts\python.exe -c "from sqlalchemy import inspect; from app.db.session import engine; tables=inspect(engine).get_table_names(); print(len(tables)); print(sorted(tables))"
```

정상 결과는 12개 테이블이다.

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

## 2026-06-13 댓글 조회 API 확인 URL

백엔드 서버를 켠 뒤 댓글 조회 API를 확인한다.

```txt
http://localhost:8000/posts/1/comments
http://localhost:8000/posts/999999/comments
http://localhost:8000/docs
```

정상 응답 예시:

```json
{
  "postId": 1,
  "items": [],
  "total": 0
}
```

없는 게시글 id:

```json
{
  "detail": "게시글을 찾을 수 없습니다."
}
```
