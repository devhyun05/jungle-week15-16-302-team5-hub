# JungleLog Setup Notes

이 문서는 JungleLog를 로컬에서 다시 실행하거나 환경을 재구성할 때 필요한 명령어와 설정을 기록한다.

## 프로젝트 위치

```txt
C:\junhee\WEEK15_AI_BOARD
```

기본 구조:

```txt
WEEK15_AI_BOARD/
  frontend/
  backend/
  docs/
  README.md
  docker-compose.yml
```

## Python / Backend 환경

확인한 Python 버전:

```powershell
python --version
# Python 3.11.9
```

가상환경 위치:

```txt
backend/.venv
```

가상환경 활성화:

```powershell
cd C:\junhee\WEEK15_AI_BOARD\backend
.\.venv\Scripts\Activate.ps1
```

패키지 설치:

```powershell
pip install -r requirements.txt
```

requirements 갱신:

```powershell
pip freeze > requirements.txt
```

백엔드 서버 실행:

```powershell
cd C:\junhee\WEEK15_AI_BOARD\backend
.\.venv\Scripts\Activate.ps1
uvicorn app.main:app --reload --port 8000
```

8000 포트가 막힐 때 임시 실행:

```powershell
uvicorn app.main:app --reload --port 8010
```

백엔드 compile 확인:

```powershell
cd C:\junhee\WEEK15_AI_BOARD\backend
.\.venv\Scripts\python.exe -m compileall app
```

## PostgreSQL / Docker

Docker 확인:

```powershell
docker --version
docker compose version
```

PostgreSQL 실행:

```powershell
cd C:\junhee\WEEK15_AI_BOARD
docker compose up -d
```

컨테이너 확인:

```powershell
docker ps
docker logs junglelog-postgres
```

PostgreSQL 접속:

```powershell
docker exec -it junglelog-postgres psql -U junglelog -d junglelog
```

자주 쓰는 psql 명령:

```sql
\dt
\d users
select id, email, role, approval_status from users;
\q
```

## Backend 환경변수

파일 위치:

```txt
backend/.env
backend/.env.example
```

주요 값:

```txt
DATABASE_URL=postgresql+psycopg://junglelog:junglelog@localhost:5432/junglelog
BACKEND_CORS_ORIGINS=http://localhost:5173
FRONTEND_URL=http://localhost:5173
JWT_SECRET_KEY=로컬용_긴_랜덤_문자열
GOOGLE_CLIENT_ID=Google OAuth Client ID
GOOGLE_CLIENT_SECRET=Google OAuth Client Secret
GOOGLE_REDIRECT_URI=http://localhost:8000/auth/google/callback
ADMIN_EMAILS=최고관리자이메일@example.com
GITHUB_API_BASE_URL=https://api.github.com
GITHUB_API_VERSION=2022-11-28
GITHUB_TOKEN=
```

주의:

- `GOOGLE_CLIENT_SECRET`, `JWT_SECRET_KEY`, `GITHUB_TOKEN`, 이후 `OPENAI_API_KEY`는 GitHub/README/채팅에 노출하지 않는다.
- `ADMIN_EMAILS`는 comma-separated 형식으로 여러 이메일을 넣을 수 있다.
- `GITHUB_TOKEN`은 public repo만 조회할 때는 비워도 된다. private repo나 rate limit 대응이 필요하면 넣는다.

## Google OAuth 설정

Google Cloud Console에서 OAuth Client를 만든다.

필수 설정:

```txt
Application type: Web application
Authorized JavaScript origins: http://localhost:5173
Authorized redirect URIs: http://localhost:8000/auth/google/callback
```

OAuth 동의 화면:

- 앱 이름: JungleLog
- 테스트 사용자: 실제 로그인할 Gmail 추가

설정 후 `.env`에 Client ID/Secret을 넣는다.

검증:

```txt
GET http://localhost:8000/auth/google/login
```

예상 결과:

- Google OAuth 로그인 URL로 redirect된다.
- OAuth state cookie가 응답에 포함된다.

주의:

- OAuth Client Secret은 절대 프론트 `.env`에 넣지 않는다.
- Google redirect URI는 backend callback URL과 정확히 일치해야 한다.

## Frontend 환경

프론트 패키지 설치:

```powershell
cd C:\junhee\WEEK15_AI_BOARD\frontend
npm install
```

프론트 실행:

```powershell
npm run dev
```

기본 접속:

```txt
http://localhost:5173
```

프론트 build:

```powershell
cd C:\junhee\WEEK15_AI_BOARD\frontend
npm run build
```

프론트 환경변수:

```txt
frontend/.env.example
```

내용:

```txt
VITE_API_BASE_URL=http://localhost:8000
```

주의:

- `VITE_`로 시작하는 값은 브라우저 bundle에 포함될 수 있다.
- Secret 값은 절대 `VITE_` 환경변수로 두지 않는다.

## GitHub REST API 설정

포트폴리오 프로젝트 등록과 새로고침은 GitHub REST API를 사용한다.

수집하는 데이터:

- repository metadata
- README 원문
- languages
- commit message

검증 명령 예시:

```powershell
cd C:\junhee\WEEK15_AI_BOARD\backend
.\.venv\Scripts\python.exe -c "from app.services.github_service import analyze_repository; a=analyze_repository('octocat/Hello-World'); print(a.repo_full_name); print(a.github_url); print(a.tech_stack[:3]); print(len(a.recent_commit_summary)); print(bool(a.readme_summary))"
```

예상 결과 예시:

```txt
octocat/hello-world
https://github.com/octocat/Hello-World
['GitHub']
3
True
```

GitHub token 주의:

- public repo 조회는 token 없이도 가능하다.
- token을 쓰면 rate limit에 유리하다.
- token은 backend `.env`에만 둔다.
- frontend에 노출하지 않는다.

## 서버 종료

PowerShell에서 실행 중인 서버는 해당 터미널에서 `Ctrl + C`로 종료한다.

포트 점유 확인이 필요하면:

```powershell
netstat -ano | findstr :8000
netstat -ano | findstr :5173
```

특정 PID 종료:

```powershell
taskkill /PID <PID> /F
```

주의: 어떤 프로세스인지 확인한 뒤 종료한다.

## 자주 하는 QA 명령

문서 깨짐 확인:

```powershell
rg -n "\?\?\?" README.md docs
```

백엔드 compile:

```powershell
cd C:\junhee\WEEK15_AI_BOARD\backend
.\.venv\Scripts\python.exe -m compileall app
```

프론트 build:

```powershell
cd C:\junhee\WEEK15_AI_BOARD\frontend
npm run build
```

Git 상태 확인:

```powershell
cd C:\junhee\WEEK15_AI_BOARD
git status --short
```

## 인코딩 주의

한글 문서를 수정할 때는 UTF-8로 저장한다.

주의할 점:

- PowerShell here-string이나 pipe로 긴 한글 문서를 만들면 깨질 수 있다.
- VSCode 오른쪽 아래 encoding이 UTF-8인지 확인한다.
- 문서 수정 후 `rg -n "\?\?\?" README.md docs`로 물음표 손상을 확인한다.
- 한글 exact match가 필요한 QA 스크립트는 코드 내부 상수나 unicode escape를 사용하는 편이 안전하다.
