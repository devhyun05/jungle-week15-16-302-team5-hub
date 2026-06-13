# Jungle Market Backend

FastAPI 기반 백엔드 서버입니다.

## 실행 방법

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app:app --reload --port 8000
```

## 확인 URL

- API 상태 확인: http://127.0.0.1:8000/api/health
- Swagger 문서: http://127.0.0.1:8000/docs
