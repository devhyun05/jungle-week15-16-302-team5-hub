# Deployment Guide

Jungle Market은 프론트엔드, 백엔드, PostgreSQL, 외부 서비스를 함께 설정해야 한다.

권장 배포 조합:

- Frontend: Vercel
- Backend: Render Web Service
- Database: Render PostgreSQL
- Images: AWS S3
- Auth: Google OAuth
- Notifications: Slack API
- AI: OpenAI API

## 1. Backend 배포

Render에서 `New Blueprint`를 선택하고 repository의 `render.yaml`을 사용한다.

배포 후 생성되는 백엔드 URL 예시:

```text
https://jungle-market-api.onrender.com
```

Render 환경변수에서 아래 값을 채운다.

| Name | Description |
| --- | --- |
| `FRONTEND_URL` | Vercel 프론트엔드 URL |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret |
| `GOOGLE_REDIRECT_URI` | `https://<backend-domain>/api/auth/google/callback` |
| `SLACK_BOT_TOKEN` | Slack Bot User OAuth Token |
| `ALLOWED_SLACK_TEAM_ID` | 알림을 허용할 Slack Workspace Team ID |
| `OPENAI_API_KEY` | OpenAI API Key |
| `AWS_ACCESS_KEY_ID` | S3 업로드용 IAM Access Key |
| `AWS_SECRET_ACCESS_KEY` | S3 업로드용 IAM Secret Key |
| `S3_BUCKET_NAME` | S3 Bucket Name |
| `S3_PUBLIC_BASE_URL` | S3 public base URL |

`render.yaml`에서 자동 설정되는 값:

- `DATABASE_URL`
- `JWT_SECRET_KEY`
- `COOKIE_SECURE=true`
- `COOKIE_SAMESITE=none`

## 2. Frontend 배포

Vercel에서 repository를 import하고 root directory를 `frontend`로 지정한다.

Build 설정:

```text
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

Vercel 환경변수:

| Name | Value |
| --- | --- |
| `VITE_API_BASE_URL` | `https://<backend-domain>/api` |

## 3. Google OAuth 설정

Google Cloud Console의 OAuth Client에 아래 Redirect URI를 추가한다.

```text
https://<backend-domain>/api/auth/google/callback
```

Authorized JavaScript origins에는 프론트엔드 도메인을 추가한다.

```text
https://<frontend-domain>
```

## 4. S3 CORS 설정

프론트엔드에서 Presigned URL로 직접 업로드하므로 S3 bucket CORS에 프론트엔드 도메인을 허용한다.

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["PUT", "GET"],
    "AllowedOrigins": ["https://<frontend-domain>"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

## 5. 배포 후 확인

Backend:

```text
GET https://<backend-domain>/api/health
```

Frontend:

```text
https://<frontend-domain>
```

확인할 기능:

- Google 로그인
- 게시글 목록 조회
- 게시글 작성
- 이미지 업로드
- 금지 품목 검사
- Slack 문의 전송
- 마이페이지 작성글/댓글 조회
