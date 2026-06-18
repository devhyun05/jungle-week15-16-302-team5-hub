# JungleLog DB Design

이 문서는 JungleLog의 PostgreSQL 테이블 설계와 ERD를 관리한다.
dbdiagram.io에는 아래 DBML을 붙여넣고, 설계 변경이 생기면 이 문서도 함께 업데이트한다.

## ERD v1 범위

v1은 기본 게시판, 포트폴리오 관리, 코치 리뷰 요청, 알림까지 다룬다.
RAG, MCP, Agent, OpenAI 호출 기록은 기본 CRUD가 안정화된 뒤 v2에서 추가한다.

## v1 테이블 목록

| 테이블 | 역할 |
| --- | --- |
| `users` | Google OAuth 기반 학생, 코치, 관리자 계정 |
| `auth_refresh_tokens` | JWT access token 재발급을 위한 refresh token 해시, 만료, 폐기 이력 |
| `user_approval_logs` | 운영자가 사용자 권한과 승인 상태를 변경한 이력 |
| `post_categories` | 학습 로그, 트러블슈팅, 프로젝트 회고, 면접 질문, 포트폴리오 관리 카테고리 |
| `posts` | 게시글 본문 |
| `comments` | 게시글 댓글 |
| `tags` | 태그 마스터 |
| `post_tags` | 게시글과 태그의 N:M 연결 |
| `portfolio_projects` | GitHub repo 기반 포트폴리오 프로젝트 |
| `portfolio_project_posts` | 포트폴리오 프로젝트와 게시글의 N:M 연결 |
| `review_requests` | 학생이 코치에게 보낸 리뷰 요청 |
| `review_request_coaches` | 리뷰 요청과 코치의 N:M 연결 |
| `notifications` | 사용자별 알림 |

## 핵심 설계 판단

- 로그인은 Google OAuth로 통일하고, 별도 이메일/비밀번호 회원가입은 만들지 않는다.
- Google 계정의 고유 식별자는 `users.google_sub`에 저장한다.
- 학생, 코치, 관리자는 `users.role`로 구분한다.
- 첫 Google 로그인 사용자는 기본 `STUDENT`, `승인 대기` 상태로 생성한다.
- v1에서는 관리자 화면에서 학생/코치/관리자 role과 승인 상태를 변경한다.
- 초기 관리자는 `ADMIN_EMAILS` 환경변수 또는 seed script로 지정한다.
- 승인/거절/정지/role 변경 이력은 `user_approval_logs`에 남긴다.
- `role`은 사용자의 종류이고, `approval_status`는 서비스 사용 가능 여부다.
- 승인 상태는 `승인 대기`, `승인 완료`, `거절`, `정지`를 사용한다.
- 초기 관리자 자동 생성처럼 실행한 관리자가 없는 경우 `user_approval_logs.actor_id`는 비워둘 수 있다.
- 게시글 카테고리는 문자열만 저장하지 않고 `post_categories` 테이블로 분리한다.
- 게시글과 태그는 N:M 관계라서 `post_tags` 연결 테이블을 둔다.
- 포트폴리오 프로젝트와 게시글도 N:M 관계라서 `portfolio_project_posts` 연결 테이블을 둔다.
- 리뷰 요청 하나는 여러 코치에게 보낼 수 있으므로 `review_request_coaches` 연결 테이블을 둔다.
- 리뷰 대상은 게시글 또는 포트폴리오 프로젝트가 될 수 있으므로 `target_type`, `target_post_id`, `target_project_id`를 함께 둔다.
- 리뷰 요청 상태는 `대기 중`, `검토 중`, `수정 요청`, `피드백 완료`, `최종 확인`을 사용한다.
- v1에서는 `tech_stack`을 text로 저장하고, 기술 스택 마스터 테이블은 v2에서 필요할 때 분리한다.
- AI 생성 로그, RAG chunk, MCP tool call, Agent run은 v2에서 추가한다.

## dbdiagram.io 그림 갱신 방법

`db-design.md`를 수정해도 dbdiagram.io에 이미 떠 있는 ERD 그림은 자동으로 바뀌지 않는다.
아래 `dbdiagram.io DBML v1` 코드블록 전체를 다시 복사해서 dbdiagram.io에 붙여넣어야 테이블/필드 변경이 반영된다.

또 dbdiagram.io는 테이블 위치를 자동 배치하므로 `users`처럼 관계가 많은 테이블 주변이 복잡해질 수 있다.
이건 관계 설계 오류가 아니라 화면 배치 문제다.
테이블을 직접 드래그해서 `users`를 왼쪽, `post_categories`를 `posts`와 `review_requests` 근처로 옮기면 읽기 좋아진다.

## 타입 읽는 법

DBML에 적힌 타입은 PostgreSQL에 만들 컬럼의 저장 방식이다.
아래 기준을 먼저 알고 보면 각 테이블 필드가 덜 낯설다.

| 타입 | 의미 | 이 프로젝트에서 쓰는 이유 |
| --- | --- | --- |
| `bigint` | 큰 정수 id | 게시글, 사용자, 프로젝트처럼 데이터가 계속 늘어나는 주요 테이블의 PK/FK에 사용한다. |
| `int` | 일반 정수 id | 카테고리처럼 개수가 많지 않은 기준 테이블에 사용한다. |
| `varchar(n)` | 최대 길이가 정해진 짧은 문자열 | 이메일, 제목, 상태값처럼 길이를 제한할 수 있는 값에 사용한다. |
| `text` | 길이 제한을 크게 두지 않는 긴 문자열 | 게시글 본문, 댓글, 피드백, 포트폴리오 초안처럼 길어질 수 있는 값에 사용한다. |
| `boolean` | 참/거짓 | 공개 여부, 읽음 여부, GitHub 연결 여부처럼 두 가지 상태만 필요한 값에 사용한다. |
| `timestamp` | 날짜와 시간 | 생성일, 수정일, 승인일, 마지막 로그인처럼 시간 기록이 필요한 값에 사용한다. |

`[pk]`는 primary key, `[not null]`은 반드시 값이 있어야 한다는 뜻이다.
`[unique]`는 같은 값이 두 번 들어갈 수 없다는 뜻이고, `[increment]`는 id가 자동 증가한다는 뜻이다.

## 테이블/필드 상세 설명

### users

Google OAuth로 로그인한 사용자 계정이다.
학생, 코치, 관리자 모두 같은 `users` 테이블에 저장하고 `role`로 구분한다.

| 필드 | 타입 | 화면/기능 | 왜 이 타입인가 |
| --- | --- | --- | --- |
| `id` | `bigint` | 모든 사용자 구분 | 사용자 수는 계속 늘 수 있으므로 큰 정수 PK를 쓴다. |
| `email` | `varchar(255)` | 로그인 사용자 이메일, 관리자 승인 목록 | 이메일은 길이 제한이 있고 중복되면 안 되므로 `unique`를 둔다. |
| `google_sub` | `varchar(255)` | Google OAuth 사용자 식별 | 이메일보다 안정적인 Google 고유 id라 문자열로 저장하고 `unique`를 둔다. |
| `name` | `varchar(50)` | 프로필, 작성자, 리뷰 요청자 | 화면에 보이는 이름이라 짧은 문자열로 제한한다. |
| `profile_image_url` | `varchar(500)` | Google 프로필 이미지 | URL은 길 수 있어서 500자로 넉넉하게 잡는다. |
| `role` | `varchar(20)` | STUDENT/COACH/ADMIN 화면 분기 | 값 종류가 짧고 제한적이라 20자 문자열이면 충분하다. |
| `approval_status` | `varchar(20)` | 승인 대기/승인 완료/거절/정지 | 승인 상태도 짧은 상태값이라 20자 문자열로 둔다. |
| `last_login_at` | `timestamp` | 마지막 로그인 기록 | 로그인 시점을 날짜와 시간으로 저장한다. |
| `approved_by` | `bigint` | 누가 승인했는지 | 승인한 관리자도 `users.id`를 가리키므로 FK용 정수다. |
| `approved_at` | `timestamp` | 언제 승인됐는지 | 승인 시점을 저장한다. |
| `approval_note` | `text` | 승인/거절/정지 메모 | 사유가 길어질 수 있어 `text`로 둔다. |
| `created_at` | `timestamp` | 가입 시점 | row 생성 시간을 저장한다. |
| `updated_at` | `timestamp` | 사용자 정보 수정 시점 | role, 승인 상태 변경 시간을 추적한다. |

### auth_refresh_tokens

JWT access token은 짧게 만료시키고, refresh token으로 다시 access token을 발급받게 한다.
이 테이블은 refresh token의 원문이 아니라 해시값과 만료/폐기 상태를 저장한다.

| 필드 | 타입 | 화면/기능 | 왜 이 타입인가 |
| --- | --- | --- | --- |
| `id` | `bigint` | refresh token row 구분 | 로그인 세션 기록이 계속 쌓일 수 있으므로 큰 정수 PK를 쓴다. |
| `user_id` | `bigint` | 토큰 소유 사용자 | `users.id`를 참조해 어떤 사용자의 로그인 세션인지 연결한다. |
| `token_hash` | `varchar(64)` | refresh token 검증 | refresh token 원문을 DB에 저장하지 않고 sha256 해시만 저장한다. sha256 hex 문자열은 64자다. |
| `expires_at` | `timestamp` | refresh token 만료 검사 | access token 재발급 요청 시 아직 유효한 refresh token인지 판단한다. |
| `revoked_at` | `timestamp` | 로그아웃/강제 만료 | 값이 있으면 더 이상 사용할 수 없는 refresh token으로 본다. |
| `replaced_by_token_id` | `bigint` | refresh token rotation | 기존 refresh token을 새 토큰으로 교체했을 때 새 row를 가리킨다. 재사용 공격 추적에 필요하다. |
| `user_agent` | `varchar(500)` | 접속 브라우저/기기 참고 | 같은 사용자가 여러 브라우저에서 로그인했을 때 구분할 수 있는 보조 정보다. |
| `ip_address` | `varchar(45)` | 접속 IP 참고 | IPv4와 IPv6를 모두 담을 수 있도록 45자를 사용한다. |
| `created_at` | `timestamp` | 로그인 세션 생성 시점 | refresh token이 언제 발급되었는지 추적한다. |

이 테이블은 로그인 세션을 관리하는 보안 테이블이다.
게시글 화면에 직접 보이지는 않지만 `/auth/refresh`, `/auth/logout`, 관리자 강제 로그아웃 같은 인증 기능의 기반이 된다.

### user_approval_logs

관리자가 사용자 권한을 바꾼 이력을 남긴다.
현재 상태는 `users`에 있고, 과거 변경 기록은 이 테이블에 쌓인다.

| 필드 | 타입 | 화면/기능 | 왜 이 타입인가 |
| --- | --- | --- | --- |
| `id` | `bigint` | 승인 이력 구분 | 이력은 계속 쌓이므로 큰 정수 PK를 쓴다. |
| `user_id` | `bigint` | 권한이 바뀐 사용자 | `users.id`를 참조한다. |
| `actor_id` | `bigint` | 변경을 실행한 관리자 | 관리자도 `users.id`다. 초기 관리자 자동 생성 때는 null 가능하다. |
| `action` | `varchar(30)` | APPROVE/REJECT/SUSPEND 등 | 이력 종류를 짧은 문자열로 저장한다. |
| `before_role` | `varchar(20)` | 변경 전 role | 이전 상태를 남겨 되돌아볼 수 있게 한다. |
| `after_role` | `varchar(20)` | 변경 후 role | 변경 결과 role을 저장한다. |
| `before_status` | `varchar(20)` | 변경 전 승인 상태 | 이전 승인 상태를 남긴다. |
| `after_status` | `varchar(20)` | 변경 후 승인 상태 | 변경 결과 승인 상태를 저장한다. |
| `reason` | `text` | 변경 사유 | 운영자가 남기는 사유가 길 수 있다. |
| `created_at` | `timestamp` | 이력 생성 시점 | 언제 변경됐는지 저장한다. |

### post_categories

게시글 카테고리 기준 테이블이다.
화면의 `전체 / 학습 로그 / 트러블슈팅 / 프로젝트 회고 / 면접 질문 / 포트폴리오 관리` 탭과 연결된다.

| 필드 | 타입 | 화면/기능 | 왜 이 타입인가 |
| --- | --- | --- | --- |
| `id` | `int` | posts, review_requests의 category_id | 카테고리는 개수가 적어서 `int`면 충분하다. |
| `slug` | `varchar(50)` | URL query, 필터 값 | `learning-log`처럼 코드에서 쓰는 짧은 고유 문자열이다. |
| `label` | `varchar(50)` | 화면 표시명 | `학습 로그`처럼 사용자에게 보이는 짧은 이름이다. |
| `created_at` | `timestamp` | 카테고리 생성 시점 | 기준 데이터도 생성 시간을 남긴다. |
| `updated_at` | `timestamp` | 카테고리 수정 시점 | label 변경 같은 수정 시간을 남긴다. |

`post_categories`는 관계가 없는 테이블이 아니다.
아래 두 관계가 있다.

```txt
posts.category_id -> post_categories.id
review_requests.category_id -> post_categories.id
```

dbdiagram.io에서 선이 겹치거나 테이블이 가까이 붙으면 관계가 없는 것처럼 보일 수 있다.
그림에서는 `post_categories`를 `posts`와 `review_requests` 사이 근처로 직접 드래그해서 옮기면 읽기 좋아진다.

### posts

게시글 본문 테이블이다.
전체 게시글, 내 기록, 게시글 상세, 글쓰기/수정 화면의 중심 데이터다.

| 필드 | 타입 | 화면/기능 | 왜 이 타입인가 |
| --- | --- | --- | --- |
| `id` | `bigint` | `/posts/:id` 상세 주소 | 게시글 수가 계속 늘 수 있으므로 큰 정수 PK를 쓴다. |
| `author_id` | `bigint` | 작성자 | `users.id`를 참조한다. |
| `category_id` | `int` | 카테고리 필터 | `post_categories.id`를 참조하므로 `int`다. |
| `title` | `varchar(200)` | 게시글 제목 | 제목은 너무 길 필요가 없어 200자로 제한한다. |
| `summary` | `text` | 목록 요약, 검색 | 요약은 길이가 유동적이라 `text`로 둔다. |
| `content` | `text` | 게시글 본문 | 본문은 길어질 수 있어서 `text`가 맞다. |
| `is_public` | `boolean` | 공개/비공개 필터 | 참/거짓만 필요하다. |
| `view_count` | `int` | 조회수 | 조회수는 정수다. |
| `created_at` | `timestamp` | 작성일 | 게시글 생성 시간을 저장한다. |
| `updated_at` | `timestamp` | 수정일 | 게시글 수정 시간을 저장한다. |
| `deleted_at` | `timestamp` | soft delete | 실제 삭제 대신 삭제 시점을 남기면 복구와 추적이 가능하다. |

### comments

게시글 상세 화면의 댓글이다.
코치가 원문에 댓글을 남기는 기능을 나중에 붙이면 이 테이블에 들어간다.

| 필드 | 타입 | 화면/기능 | 왜 이 타입인가 |
| --- | --- | --- | --- |
| `id` | `bigint` | 댓글 구분 | 댓글 수가 늘 수 있으므로 큰 정수 PK를 쓴다. |
| `post_id` | `bigint` | 댓글이 달린 게시글 | `posts.id`를 참조한다. |
| `author_id` | `bigint` | 댓글 작성자 | `users.id`를 참조한다. |
| `content` | `text` | 댓글 내용 | 댓글은 길이가 유동적이라 `text`다. |
| `created_at` | `timestamp` | 댓글 작성일 | 생성 시간을 저장한다. |
| `updated_at` | `timestamp` | 댓글 수정일 | 수정 시간을 저장한다. |
| `deleted_at` | `timestamp` | 댓글 삭제 처리 | soft delete를 위해 삭제 시점을 저장한다. |

### tags

태그 기준 테이블이다.
게시글 하나에 여러 태그가 붙고, 같은 태그가 여러 게시글에 재사용된다.

| 필드 | 타입 | 화면/기능 | 왜 이 타입인가 |
| --- | --- | --- | --- |
| `id` | `bigint` | 태그 구분 | 태그가 늘어날 수 있으므로 큰 정수 PK를 쓴다. |
| `name` | `varchar(50)` | 화면 표시 태그 | `React`, `FastAPI`처럼 짧은 이름이다. |
| `slug` | `varchar(50)` | URL/검색용 태그 값 | `fastapi`처럼 고유한 문자열로 관리한다. |
| `created_at` | `timestamp` | 태그 생성 시점 | 기준 데이터 생성 시간을 남긴다. |
| `updated_at` | `timestamp` | 태그 수정 시점 | 태그 이름 수정 시간을 남긴다. |

### post_tags

게시글과 태그의 연결 테이블이다.
N:M 관계를 풀기 위해 필요하다.

| 필드 | 타입 | 화면/기능 | 왜 이 타입인가 |
| --- | --- | --- | --- |
| `post_id` | `bigint` | 태그가 붙은 게시글 | `posts.id`를 참조한다. |
| `tag_id` | `bigint` | 게시글에 붙은 태그 | `tags.id`를 참조한다. |

`post_id + tag_id`를 PK로 둬서 같은 게시글에 같은 태그가 중복으로 붙지 않게 한다.

### portfolio_projects

포트폴리오 관리 화면의 프로젝트 카드다.
GitHub repo 하나를 프로젝트 하나로 등록하는 기준이다.

| 필드 | 타입 | 화면/기능 | 왜 이 타입인가 |
| --- | --- | --- | --- |
| `id` | `bigint` | 프로젝트 구분 | 프로젝트가 계속 늘 수 있으므로 큰 정수 PK를 쓴다. |
| `owner_id` | `bigint` | 프로젝트 소유 학생 | `users.id`를 참조한다. |
| `title` | `varchar(200)` | 프로젝트 이름 | 화면 제목이라 200자로 제한한다. |
| `repo_full_name` | `varchar(200)` | GitHub repo 식별 | `owner/repo` 형태의 짧은 고유 문자열이다. |
| `github_url` | `varchar(500)` | GitHub 링크 | URL은 길 수 있어 500자로 둔다. |
| `tech_stack` | `text` | 기술 스택 표시/검색 | v1에서는 단순 문자열 목록으로 저장한다. |
| `readme_summary` | `text` | AI 참고용 README 요약 | README 요약은 길어질 수 있다. |
| `recent_commit_summary` | `text` | 최근 커밋 요약 | 커밋 여러 개를 요약할 수 있어 `text`다. |
| `saved_portfolio_draft` | `text` | 저장된 포트폴리오 글 초안 | AI 생성 결과가 길어질 수 있다. |
| `portfolio_status` | `varchar(30)` | 작성중/보완 필요/정리 완료 | 짧은 상태값이다. |
| `coach_feedback_status` | `varchar(30)` | 요청 전/검토 중/최종 확인 등 | 짧은 상태값이다. |
| `github_connected` | `boolean` | GitHub 연결 여부 | 연결됨/안 됨 두 상태다. |
| `ai_draft_saved` | `boolean` | AI 초안 저장 여부 | 저장됨/안 됨 두 상태다. |
| `last_commit_at` | `timestamp` | 마지막 커밋 시점 | GitHub 분석 결과의 시간을 저장한다. |
| `created_at` | `timestamp` | 프로젝트 등록일 | 생성 시간을 저장한다. |
| `updated_at` | `timestamp` | 프로젝트 수정일 | 상태/초안 수정 시간을 저장한다. |

`owner_id + repo_full_name`은 unique다.
한 학생이 같은 GitHub repo를 프로젝트로 두 번 등록하지 못하게 하기 위해서다.

### portfolio_project_posts

포트폴리오 프로젝트와 게시글의 연결 테이블이다.
포트폴리오 관리 화면의 `기록 연결하기`가 이 테이블로 저장된다.

| 필드 | 타입 | 화면/기능 | 왜 이 타입인가 |
| --- | --- | --- | --- |
| `project_id` | `bigint` | 연결할 포트폴리오 프로젝트 | `portfolio_projects.id`를 참조한다. |
| `post_id` | `bigint` | 연결할 학습 기록 게시글 | `posts.id`를 참조한다. |

`project_id + post_id`를 PK로 둬서 같은 프로젝트에 같은 글이 중복 연결되지 않게 한다.

### review_requests

학생이 코치에게 보내는 리뷰 요청이다.
대상은 게시글일 수도 있고 포트폴리오 프로젝트일 수도 있다.

| 필드 | 타입 | 화면/기능 | 왜 이 타입인가 |
| --- | --- | --- | --- |
| `id` | `bigint` | 리뷰 요청 구분 | 요청이 계속 쌓이므로 큰 정수 PK를 쓴다. |
| `requester_id` | `bigint` | 요청한 학생 | `users.id`를 참조한다. |
| `category_id` | `int` | 리뷰 요청 카테고리 | `post_categories.id`를 참조한다. |
| `target_type` | `varchar(20)` | 대상 종류 | `post` 또는 `portfolio` 같은 짧은 값이다. |
| `target_post_id` | `bigint` | 게시글 리뷰 대상 | `posts.id`를 참조하며, 대상이 포트폴리오면 비어 있다. |
| `target_project_id` | `bigint` | 포트폴리오 리뷰 대상 | `portfolio_projects.id`를 참조하며, 대상이 게시글이면 비어 있다. |
| `message` | `text` | 학생 요청 메시지 | 요청 메시지는 길어질 수 있다. |
| `status` | `varchar(30)` | 대기 중/검토 중/최종 확인 | 짧은 상태값이다. |
| `feedback` | `text` | 코치 피드백 | 피드백은 길어질 수 있다. |
| `created_at` | `timestamp` | 요청 생성일 | 생성 시간을 저장한다. |
| `updated_at` | `timestamp` | 요청 수정일 | 상태/피드백 변경 시간을 저장한다. |

### review_request_coaches

리뷰 요청과 코치를 연결하는 테이블이다.
리뷰 요청 하나를 여러 코치에게 보낼 수 있기 때문에 필요하다.

| 필드 | 타입 | 화면/기능 | 왜 이 타입인가 |
| --- | --- | --- | --- |
| `review_request_id` | `bigint` | 리뷰 요청 | `review_requests.id`를 참조한다. |
| `coach_id` | `bigint` | 배정된 코치 | `users.id`를 참조한다. |

`review_request_id + coach_id`를 PK로 둬서 같은 리뷰 요청이 같은 코치에게 중복 배정되지 않게 한다.

### notifications

상단 알림 드롭다운에 표시될 사용자별 알림이다.

| 필드 | 타입 | 화면/기능 | 왜 이 타입인가 |
| --- | --- | --- | --- |
| `id` | `bigint` | 알림 구분 | 알림이 계속 쌓이므로 큰 정수 PK를 쓴다. |
| `user_id` | `bigint` | 알림을 받을 사용자 | `users.id`를 참조한다. |
| `type` | `varchar(50)` | 알림 종류 | `feedback`, `portfolio`, `ai` 같은 짧은 값이다. |
| `message` | `varchar(255)` | 알림 문구 | 드롭다운에 보이는 짧은 문장이다. |
| `link_url` | `varchar(500)` | 클릭 시 이동할 주소 | URL은 길 수 있어 500자로 둔다. |
| `is_read` | `boolean` | 읽음 여부 | 읽음/안 읽음 두 상태다. |
| `created_at` | `timestamp` | 알림 생성일 | 생성 시간을 저장한다. |

## ERD 그림 읽는 법

dbdiagram.io는 테이블 위치를 자동으로 배치하기 때문에 관계선이 테이블을 지나가거나, `users`처럼 연결이 많은 테이블 주변이 복잡하게 보일 수 있다.
이건 설계가 잘못됐다는 뜻이 아니라, 화면 배치 문제다.

현재 ERD에서 `users`가 복잡해 보이는 이유는 거의 모든 기능이 사용자와 연결되기 때문이다.

- 게시글 작성자: `posts.author_id -> users.id`
- 댓글 작성자: `comments.author_id -> users.id`
- 포트폴리오 소유자: `portfolio_projects.owner_id -> users.id`
- 리뷰 요청자: `review_requests.requester_id -> users.id`
- 리뷰 코치: `review_request_coaches.coach_id -> users.id`
- 알림 수신자: `notifications.user_id -> users.id`
- 승인한 관리자: `users.approved_by -> users.id`
- 승인 이력 대상/행위자: `user_approval_logs.user_id`, `user_approval_logs.actor_id -> users.id`

그림이 너무 복잡하면 dbdiagram.io에서 아래처럼 직접 드래그해서 배치하면 된다.

```txt
users                 post_categories
  |                         |
  |                         |
posts ----- post_tags ----- tags
  |
comments

portfolio_projects -- portfolio_project_posts -- posts

review_requests -- review_request_coaches -- users(coach)

notifications -> users
user_approval_logs -> users
```

`post_categories`는 관계가 없는 테이블이 아니라, `posts`와 `review_requests`에서 공통으로 참조하는 기준 테이블이다.
사진에서 관계가 안 보이는 것처럼 느껴지는 건 선이 다른 테이블과 겹치거나 자동 배치가 가까이 붙었기 때문이다.

## dbdiagram.io DBML v1

```dbml
Table users {
  id bigint [pk, increment]
  email varchar(255) [not null, unique]
  google_sub varchar(255) [not null, unique]
  name varchar(50) [not null]
  profile_image_url varchar(500)
  role varchar(20) [not null, default: 'STUDENT', note: 'STUDENT, COACH, or ADMIN']
  approval_status varchar(20) [not null, default: '승인 대기', note: '승인 대기, 승인 완료, 거절, 정지']
  last_login_at timestamp
  approved_by bigint
  approved_at timestamp
  approval_note text
  created_at timestamp [not null]
  updated_at timestamp [not null]
}

Table auth_refresh_tokens {
  id bigint [pk, increment]
  user_id bigint [not null]
  token_hash varchar(64) [not null, unique, note: 'sha256 hash of refresh token, never store raw token']
  expires_at timestamp [not null]
  revoked_at timestamp
  replaced_by_token_id bigint
  user_agent varchar(500)
  ip_address varchar(45)
  created_at timestamp [not null]
}

Table user_approval_logs {
  id bigint [pk, increment]
  user_id bigint [not null]
  actor_id bigint [note: 'null when system bootstrap creates first admin']
  action varchar(30) [not null, note: 'APPROVE, REJECT, SUSPEND, ROLE_CHANGE, BOOTSTRAP_ADMIN']
  before_role varchar(20)
  after_role varchar(20) [not null]
  before_status varchar(20)
  after_status varchar(20) [not null]
  reason text
  created_at timestamp [not null]
}

Table post_categories {
  id int [pk, increment]
  slug varchar(50) [not null, unique]
  label varchar(50) [not null]
  created_at timestamp [not null]
  updated_at timestamp [not null]
}

Table posts {
  id bigint [pk, increment]
  author_id bigint [not null]
  category_id int [not null]
  title varchar(200) [not null]
  summary text
  content text [not null]
  related_commit text
  is_public boolean [not null, default: true]
  view_count int [not null, default: 0]
  created_at timestamp [not null]
  updated_at timestamp [not null]
  deleted_at timestamp
}

Table comments {
  id bigint [pk, increment]
  post_id bigint [not null]
  author_id bigint [not null]
  content text [not null]
  created_at timestamp [not null]
  updated_at timestamp [not null]
  deleted_at timestamp
}

Table tags {
  id bigint [pk, increment]
  name varchar(50) [not null, unique]
  slug varchar(50) [not null, unique]
  created_at timestamp [not null]
  updated_at timestamp [not null]
}

Table post_tags {
  post_id bigint [not null]
  tag_id bigint [not null]

  indexes {
    (post_id, tag_id) [pk]
  }
}

Table portfolio_projects {
  id bigint [pk, increment]
  owner_id bigint [not null]
  title varchar(200) [not null]
  repo_full_name varchar(200) [not null]
  github_url varchar(500) [not null]
  summary text
  tech_stack text
  readme_summary text
  recent_commit_summary text
  saved_portfolio_draft text
  portfolio_status varchar(30) [not null, default: '작성중', note: '작성중, 보완 필요, 정리 완료']
  coach_feedback_status varchar(30) [not null, default: '요청 전', note: '요청 전, 요청함, 검토 중, 피드백 완료, 수정 요청, 최종 확인']
  github_connected boolean [not null, default: false]
  ai_draft_saved boolean [not null, default: false]
  last_commit_at timestamp
  created_at timestamp [not null]
  updated_at timestamp [not null]

  indexes {
    (owner_id, repo_full_name) [unique]
  }
}

Table portfolio_project_posts {
  project_id bigint [not null]
  post_id bigint [not null]

  indexes {
    (project_id, post_id) [pk]
  }
}

Table review_requests {
  id bigint [pk, increment]
  requester_id bigint [not null]
  category_id int [not null]
  target_type varchar(20) [not null, note: 'post or portfolio']
  target_post_id bigint
  target_project_id bigint
  message text
  status varchar(30) [not null, default: '대기 중', note: '대기 중, 검토 중, 수정 요청, 피드백 완료, 최종 확인']
  feedback text
  created_at timestamp [not null]
  updated_at timestamp [not null]
}

Table review_request_coaches {
  review_request_id bigint [not null]
  coach_id bigint [not null]

  indexes {
    (review_request_id, coach_id) [pk]
  }
}

Table notifications {
  id bigint [pk, increment]
  user_id bigint [not null]
  type varchar(50) [not null]
  message varchar(255) [not null]
  link_url varchar(500)
  is_read boolean [not null, default: false]
  created_at timestamp [not null]
}

Ref: posts.author_id > users.id
Ref: users.approved_by > users.id
Ref: auth_refresh_tokens.user_id > users.id
Ref: auth_refresh_tokens.replaced_by_token_id > auth_refresh_tokens.id
Ref: user_approval_logs.user_id > users.id
Ref: user_approval_logs.actor_id > users.id
Ref: posts.category_id > post_categories.id

Ref: comments.post_id > posts.id
Ref: comments.author_id > users.id

Ref: post_tags.post_id > posts.id
Ref: post_tags.tag_id > tags.id

Ref: portfolio_projects.owner_id > users.id
Ref: portfolio_project_posts.project_id > portfolio_projects.id
Ref: portfolio_project_posts.post_id > posts.id

Ref: review_requests.requester_id > users.id
Ref: review_requests.category_id > post_categories.id
Ref: review_requests.target_post_id > posts.id
Ref: review_requests.target_project_id > portfolio_projects.id
Ref: review_request_coaches.review_request_id > review_requests.id
Ref: review_request_coaches.coach_id > users.id

Ref: notifications.user_id > users.id
```

## 관계 읽기

### Google OAuth와 users

JungleLog는 자체 이메일/비밀번호 로그인을 만들지 않는다.
사용자가 Google 로그인을 완료하면 백엔드는 Google에서 받은 사용자 식별자 `google_sub`를 기준으로 기존 사용자를 찾는다.
기존 사용자가 없으면 `users` row를 새로 만든다.
정글 내부 서비스이므로 Google 로그인만으로 서비스 접근을 허용하지 않고, 운영자의 승인을 받아야 한다.

```txt
Google login success
-> google_sub 확인
-> users.google_sub로 사용자 조회
-> 없으면 STUDENT/승인 대기로 자동 가입
-> email이 ADMIN_EMAILS에 있으면 ADMIN/승인 완료로 생성
-> 일반 사용자는 pending approval 화면만 접근
-> ADMIN이 학생/코치/관리자로 승인
-> 승인 완료 사용자에게 JungleLog JWT 발급 또는 API 접근 허용
```

초기 관리자는 아래 방식으로 만든다.

```env
ADMIN_EMAILS=admin@junglelog.dev,junhee@example.com
```

OAuth callback에서 로그인한 이메일이 `ADMIN_EMAILS`에 포함되어 있으면 `role=ADMIN`, `approval_status=승인 완료`로 생성한다.
이후부터는 관리자 화면에서 다른 사용자를 승인한다.

### role과 approval_status

`role`과 `approval_status`는 다른 책임을 가진다.

| 컬럼 | 의미 | 예시 |
| --- | --- | --- |
| `role` | 사용자의 역할 | `STUDENT`, `COACH`, `ADMIN` |
| `approval_status` | JungleLog 서비스 사용 가능 상태 | `승인 대기`, `승인 완료`, `거절`, `정지` |

예를 들어 `role=STUDENT`여도 `approval_status=승인 대기`이면 게시글 화면에 접근할 수 없다.
반대로 `approval_status=승인 완료`여도 `role=STUDENT`이면 관리자 승인 화면에는 접근할 수 없다.

### user_approval_logs

`user_approval_logs`는 운영자가 사용자 권한과 승인 상태를 바꾼 이력을 남긴다.
일반적인 승인/거절/정지/role 변경은 `actor_id`에 실행한 관리자 id를 저장한다.
다만 `ADMIN_EMAILS`로 첫 관리자를 자동 생성하는 경우에는 실행한 관리자가 아직 없으므로 `actor_id`를 비워둘 수 있다.

`action`은 이력이 어떤 종류의 변경인지 구분한다.

- `APPROVE`: 승인 적용
- `REJECT`: 거절
- `SUSPEND`: 정지
- `ROLE_CHANGE`: role 변경
- `BOOTSTRAP_ADMIN`: 초기 관리자 자동 생성

### users 1:N posts

사용자 한 명은 여러 게시글을 작성할 수 있다.
게시글 하나는 작성자 한 명을 가진다.

### posts 1:N comments

게시글 하나에는 여러 댓글이 달릴 수 있다.
댓글 하나는 게시글 하나에 속한다.

### posts N:M tags

게시글 하나는 여러 태그를 가질 수 있고, 태그 하나도 여러 게시글에 붙을 수 있다.
그래서 `post_tags` 연결 테이블이 필요하다.

### portfolio_projects N:M posts

포트폴리오 프로젝트 하나는 여러 학습 기록과 연결될 수 있다.
게시글 하나도 여러 프로젝트에 참고 기록으로 연결될 수 있으므로 `portfolio_project_posts`를 둔다.

### review_requests N:M users(coach)

학생은 리뷰 요청 하나를 여러 코치에게 보낼 수 있다.
코치 한 명도 여러 리뷰 요청을 받을 수 있으므로 `review_request_coaches`를 둔다.

리뷰 요청 상태는 아래 흐름을 기준으로 한다.

```txt
대기 중
-> 검토 중
-> 수정 요청 또는 피드백 완료
-> 최종 확인
```

`최종 확인`은 코치가 "이 정도면 만족합니다"라고 판단한 완료 상태다.

## v1 확정 결정

| 항목 | 결정 | 이유 |
| --- | --- | --- |
| 게시글 카테고리 | `post_categories` 테이블로 분리 | 카테고리 slug/label을 안정적으로 관리하고 검색/필터에 재사용하기 위해 |
| 기술 스택 | v1에서는 `portfolio_projects.tech_stack` text | 우선 프로젝트 저장과 조회를 단순하게 만들고, 검색/통계가 필요해지면 v2에서 분리 |
| 리뷰 대상 | `target_type` + nullable FK 2개 | 게시글/포트폴리오 프로젝트 중 하나를 명확히 연결하면서 FK 관계를 유지하기 위해 |
| 승인 상태 사유 | `users.approval_note`와 `user_approval_logs.reason` | 현재 상태에 대한 메모와 변경 이력을 모두 남기기 위해 |

## v1에서 일부러 미룬 것

- AI 생성 기록: `ai_generation_logs`
- RAG 문서 원본: `rag_documents`
- RAG chunk와 embedding: `rag_chunks`
- GitHub 분석 상세 로그: `github_repositories`, `github_commits`
- MCP 호출 로그: `mcp_tool_calls`
- Agent 실행 기록: `agent_runs`

이 테이블들은 기본 게시글, 포트폴리오, 코치 리뷰 데이터가 실제 DB에 저장된 뒤 v2에서 추가한다.

## 2026-06-12 화면 매핑 QA 보정

현재 React mock 화면에서 실제로 쓰는 필드와 ERD v1을 다시 대조했다.
전체 구조는 현재 화면 흐름과 맞지만, 화면에서 보이는 값 중 DBML에 직접 저장 위치가 애매한 값이 있어 아래처럼 보정했다.

| 화면/mock 필드 | 보정한 DB 필드 | 이유 |
| --- | --- | --- |
| `MockPost.relatedCommit` | `posts.related_commit text` | 게시글 상세 화면에서 연결 커밋을 보여준다. GitHub 연동 v2 전에도 게시글 단위로 커밋 메모를 저장할 수 있어야 한다. |
| `PortfolioProject.summary` | `portfolio_projects.summary text` | 포트폴리오 프로젝트 카드의 짧은 설명과 검색 대상에 쓰인다. README 요약이나 포트폴리오 초안과 역할이 다르다. |

게시글의 `contentSections`는 v1에서는 별도 테이블로 분리하지 않고 `posts.content text`에 Markdown 또는 본문 문자열로 저장하는 것으로 본다.
나중에 제목/본문/코드 블록을 각각 구조화해서 저장해야 하면 `post_sections` 테이블이나 JSON 컬럼을 v2에서 검토한다.

`comments`, `views`, `linkedRecordCount`, `targetTitle`, `coachNames`, `requesterName`처럼 화면에 보이는 일부 값은 DB에 그대로 중복 저장하지 않고 조회 시 계산하거나 JOIN으로 가져온다.

## 2026-06-12 필드별 선언 이유 학습표

이 섹션은 DB 모델을 만들기 전에 각 필드가 왜 필요한지 학습하기 위한 표다.
필드 이름을 외우는 것보다 "이 화면에서 어떤 값을 저장해야 해서 이 컬럼이 생겼는가"를 보는 것이 더 중요하다.

### users

사용자 계정 테이블이다. 학생, 코치, 관리자 모두 이 테이블에 저장하고 `role`로 구분한다.

| 필드 | 왜 선언했나 | 왜 필요한가 |
| --- | --- | --- |
| `id` | 사용자 한 명을 고유하게 구분하려고 선언했다. | 게시글 작성자, 댓글 작성자, 프로젝트 소유자, 리뷰 요청자를 모두 이 id로 연결한다. |
| `email` | Google 계정의 이메일을 저장하려고 선언했다. | 관리자 승인 화면에서 사용자를 식별하고, 초기 관리자 이메일 판별에도 사용한다. |
| `google_sub` | Google이 제공하는 고유 사용자 id를 저장하려고 선언했다. | 이메일은 바뀔 수 있지만 `google_sub`는 더 안정적이라 OAuth 로그인 사용자를 찾는 기준이 된다. |
| `name` | 화면에 표시할 사용자 이름을 저장하려고 선언했다. | 게시글 작성자, 코치 이름, 리뷰 요청자 이름으로 보여준다. |
| `profile_image_url` | Google 프로필 이미지를 저장하려고 선언했다. | 나중에 헤더, 프로필, 댓글 UI에서 아바타를 보여줄 수 있다. |
| `role` | 사용자 역할을 저장하려고 선언했다. | STUDENT, COACH, ADMIN에 따라 접근 가능한 화면과 API가 달라진다. |
| `approval_status` | 서비스 사용 승인 상태를 저장하려고 선언했다. | 정글 내부 서비스라 Google 로그인만으로는 부족하고 운영자 승인이 필요하다. |
| `last_login_at` | 마지막 로그인 시간을 저장하려고 선언했다. | 사용자가 최근에 서비스를 사용했는지 운영자가 확인할 수 있다. |
| `approved_by` | 누가 승인했는지 저장하려고 선언했다. | 운영자 승인 책임자를 추적하기 위해 `users.id`를 다시 참조한다. |
| `approved_at` | 언제 승인됐는지 저장하려고 선언했다. | 승인 처리 시점을 기록하고 관리자 화면에서 보여줄 수 있다. |
| `approval_note` | 승인/거절/정지 사유를 저장하려고 선언했다. | 왜 거절됐는지, 왜 정지됐는지 운영 기록으로 남긴다. |
| `created_at` | 사용자 row 생성 시간을 저장하려고 선언했다. | 첫 로그인/가입 시점을 알 수 있다. |
| `updated_at` | 사용자 정보 수정 시간을 저장하려고 선언했다. | role, 승인 상태, 프로필 변경 시점을 추적한다. |

### user_approval_logs

사용자 권한과 승인 상태가 바뀐 이력을 저장하는 테이블이다.
현재 상태는 `users`에 있고, 과거 변경 기록은 이 테이블에 쌓는다.

| 필드 | 왜 선언했나 | 왜 필요한가 |
| --- | --- | --- |
| `id` | 승인 이력 한 건을 구분하려고 선언했다. | 승인/거절/정지/role 변경 기록이 계속 쌓이기 때문이다. |
| `user_id` | 권한이 변경된 사용자를 저장하려고 선언했다. | 어떤 사용자에게 일어난 변경인지 알아야 한다. |
| `actor_id` | 변경을 실행한 관리자를 저장하려고 선언했다. | 누가 승인했는지 추적한다. 초기 관리자 자동 생성처럼 실행자가 없으면 비워둘 수 있다. |
| `action` | 어떤 종류의 변경인지 저장하려고 선언했다. | APPROVE, REJECT, SUSPEND, ROLE_CHANGE, BOOTSTRAP_ADMIN을 구분한다. |
| `before_role` | 변경 전 role을 저장하려고 선언했다. | 이전 역할이 무엇이었는지 추적한다. |
| `after_role` | 변경 후 role을 저장하려고 선언했다. | 최종 적용된 역할을 기록한다. |
| `before_status` | 변경 전 승인 상태를 저장하려고 선언했다. | 승인 대기에서 승인 완료로 갔는지, 승인 완료에서 정지로 갔는지 알 수 있다. |
| `after_status` | 변경 후 승인 상태를 저장하려고 선언했다. | 변경 결과를 명확히 남긴다. |
| `reason` | 변경 사유를 저장하려고 선언했다. | 운영자가 왜 승인/거절/정지했는지 기록한다. |
| `created_at` | 이력 생성 시간을 저장하려고 선언했다. | 언제 권한 변경이 일어났는지 확인한다. |

### post_categories

게시글 카테고리 기준 테이블이다.
카테고리를 문자열로만 저장하지 않고 별도 테이블로 두면 slug와 화면 표시명을 안정적으로 관리할 수 있다.

| 필드 | 왜 선언했나 | 왜 필요한가 |
| --- | --- | --- |
| `id` | 카테고리 한 개를 고유하게 구분하려고 선언했다. | `posts.category_id`, `review_requests.category_id`가 이 값을 참조한다. |
| `slug` | 코드와 URL에서 쓸 카테고리 값을 저장하려고 선언했다. | `/posts?category=learning-log` 같은 필터에 사용한다. |
| `label` | 화면에 보여줄 카테고리 이름을 저장하려고 선언했다. | `학습 로그`, `트러블슈팅`처럼 사용자에게 보이는 이름이다. |
| `created_at` | 카테고리 생성 시간을 저장하려고 선언했다. | 기준 데이터도 언제 만들어졌는지 알 수 있다. |
| `updated_at` | 카테고리 수정 시간을 저장하려고 선언했다. | 카테고리 이름 변경 같은 이력을 추적한다. |

### posts

게시글 본문 테이블이다. 전체 게시글, 내 기록, 게시글 상세, 작성/수정 화면의 중심 데이터다.

| 필드 | 왜 선언했나 | 왜 필요한가 |
| --- | --- | --- |
| `id` | 게시글 한 개를 고유하게 구분하려고 선언했다. | `/posts/:id`, 댓글 연결, 포트폴리오 기록 연결, 리뷰 요청 대상 연결에 사용한다. |
| `author_id` | 작성자를 저장하려고 선언했다. | 누가 쓴 글인지 보여주고, 내 기록 화면에서 내 글만 필터링한다. |
| `category_id` | 게시글 카테고리를 저장하려고 선언했다. | 전체 게시글의 카테고리 탭, 검색, 코치 리뷰 분류에 사용한다. |
| `title` | 게시글 제목을 저장하려고 선언했다. | 목록, 상세, 검색 결과에서 가장 먼저 보이는 값이다. |
| `summary` | 게시글 요약을 저장하려고 선언했다. | 목록 카드와 검색 결과에서 본문을 짧게 보여준다. |
| `content` | 게시글 본문을 저장하려고 선언했다. | 상세 화면과 수정 화면에서 핵심 내용으로 사용한다. |
| `related_commit` | 관련 커밋 메모를 저장하려고 선언했다. | 현재 mock 화면의 연결 커밋 영역에 대응한다. |
| `is_public` | 공개/비공개 여부를 저장하려고 선언했다. | 내 기록 공개 필터와 다른 사용자에게 보일지 여부를 판단한다. |
| `view_count` | 조회수를 저장하려고 선언했다. | 게시글 목록과 상세 화면에서 조회수 표시가 가능하다. |
| `created_at` | 작성 시간을 저장하려고 선언했다. | 게시글 날짜 정렬과 작성일 표시가 가능하다. |
| `updated_at` | 수정 시간을 저장하려고 선언했다. | 수정된 글인지, 마지막으로 언제 바뀌었는지 알 수 있다. |
| `deleted_at` | 삭제 시간을 저장하려고 선언했다. | 실제로 row를 지우지 않고 soft delete 처리하기 위해 사용한다. |

### comments

게시글 댓글 테이블이다. 댓글은 게시글에 종속되지만 독립적으로 작성자와 시간을 가진다.

| 필드 | 왜 선언했나 | 왜 필요한가 |
| --- | --- | --- |
| `id` | 댓글 한 개를 고유하게 구분하려고 선언했다. | 댓글 수정/삭제 기능을 만들 때 필요하다. |
| `post_id` | 댓글이 달린 게시글을 저장하려고 선언했다. | 특정 게시글 상세 화면에서 해당 댓글만 가져온다. |
| `author_id` | 댓글 작성자를 저장하려고 선언했다. | 학생/코치/관리자 중 누가 댓글을 남겼는지 보여준다. |
| `content` | 댓글 내용을 저장하려고 선언했다. | 댓글 본문으로 화면에 표시된다. |
| `created_at` | 댓글 작성 시간을 저장하려고 선언했다. | 댓글 정렬과 작성 시간 표시가 가능하다. |
| `updated_at` | 댓글 수정 시간을 저장하려고 선언했다. | 댓글 수정 기능을 만들 때 마지막 수정 시점을 알 수 있다. |
| `deleted_at` | 댓글 삭제 시간을 저장하려고 선언했다. | 댓글을 바로 지우지 않고 복구/추적 가능한 soft delete를 하기 위해 사용한다. |

### tags

태그 기준 테이블이다. 게시글 하나가 여러 태그를 가질 수 있고, 같은 태그가 여러 게시글에 붙을 수 있다.

| 필드 | 왜 선언했나 | 왜 필요한가 |
| --- | --- | --- |
| `id` | 태그 한 개를 고유하게 구분하려고 선언했다. | `post_tags.tag_id`가 이 값을 참조한다. |
| `name` | 화면에 표시할 태그 이름을 저장하려고 선언했다. | `React`, `FastAPI`, `JWT`처럼 사용자에게 보이는 값이다. |
| `slug` | 검색/URL용 태그 값을 저장하려고 선언했다. | 나중에 `/posts?tag=fastapi` 같은 기능에 사용할 수 있다. |
| `created_at` | 태그 생성 시간을 저장하려고 선언했다. | 태그가 언제 처음 등록됐는지 알 수 있다. |
| `updated_at` | 태그 수정 시간을 저장하려고 선언했다. | 태그 이름 변경 시점을 추적한다. |

### post_tags

게시글과 태그의 N:M 관계를 풀기 위한 연결 테이블이다.

| 필드 | 왜 선언했나 | 왜 필요한가 |
| --- | --- | --- |
| `post_id` | 어떤 게시글에 태그가 붙었는지 저장하려고 선언했다. | 게시글 상세와 목록에서 해당 글의 태그를 가져온다. |
| `tag_id` | 어떤 태그가 붙었는지 저장하려고 선언했다. | 특정 태그가 붙은 게시글을 검색할 수 있다. |

`post_id + tag_id`를 묶어 primary key로 두면 같은 게시글에 같은 태그가 중복으로 붙는 것을 막을 수 있다.

### portfolio_projects

GitHub repo 하나를 JungleLog 포트폴리오 프로젝트 하나로 관리하는 테이블이다.

| 필드 | 왜 선언했나 | 왜 필요한가 |
| --- | --- | --- |
| `id` | 포트폴리오 프로젝트 한 개를 고유하게 구분하려고 선언했다. | 프로젝트 상세, AI 도우미 선택, 코치 리뷰 요청 대상에 사용한다. |
| `owner_id` | 프로젝트 소유 학생을 저장하려고 선언했다. | 내 포트폴리오 관리 화면에서 내 프로젝트만 보여준다. |
| `title` | 프로젝트 이름을 저장하려고 선언했다. | 포트폴리오 카드와 상세 화면의 제목으로 사용한다. |
| `repo_full_name` | GitHub repo 식별자를 저장하려고 선언했다. | `owner/repo` 형태로 repo를 중복 없이 관리한다. |
| `github_url` | GitHub repo URL을 저장하려고 선언했다. | 프로젝트 등록, GitHub 이동, GitHub API 분석 기준으로 사용한다. |
| `summary` | 프로젝트 카드 요약을 저장하려고 선언했다. | README 요약과 다르게 프로젝트를 한 줄로 설명하는 화면용 요약이다. |
| `tech_stack` | 기술 스택을 저장하려고 선언했다. | 포트폴리오 카드, 검색, AI 도우미 참고 자료에 사용한다. v1에서는 text로 단순 저장한다. |
| `readme_summary` | GitHub README 요약을 저장하려고 선언했다. | AI가 포트폴리오 글을 만들 때 참고 자료로 사용한다. |
| `recent_commit_summary` | 최근 커밋 요약을 저장하려고 선언했다. | 프로젝트 진행 과정과 AI 생성 참고 자료로 사용한다. |
| `saved_portfolio_draft` | 저장된 포트폴리오 글 초안을 저장하려고 선언했다. | AI 도우미가 만든 포트폴리오 글을 프로젝트에 저장한다. |
| `portfolio_status` | 학생이 정하는 포트폴리오 정리 상태를 저장하려고 선언했다. | 작성중, 보완 필요, 정리 완료 상태를 프로젝트 카드에 보여준다. |
| `coach_feedback_status` | 코치 리뷰 상태를 저장하려고 선언했다. | 요청 전, 요청함, 검토 중, 피드백 완료, 수정 요청 같은 상태를 보여준다. |
| `github_connected` | GitHub 연결 여부를 저장하려고 선언했다. | repo 등록이 완료됐는지, GitHub 정보를 가져왔는지 판단한다. |
| `ai_draft_saved` | AI 초안 저장 여부를 저장하려고 선언했다. | AI 도우미에서 만든 결과가 저장됐는지 보여준다. |
| `last_commit_at` | 마지막 커밋 시간을 저장하려고 선언했다. | GitHub 프로젝트가 최근에 얼마나 갱신됐는지 보여준다. |
| `created_at` | 프로젝트 등록 시간을 저장하려고 선언했다. | 포트폴리오 프로젝트가 언제 등록됐는지 알 수 있다. |
| `updated_at` | 프로젝트 수정 시간을 저장하려고 선언했다. | 상태, 초안, GitHub 분석 결과가 언제 바뀌었는지 추적한다. |

`owner_id + repo_full_name`을 unique로 두면 같은 학생이 같은 GitHub repo를 두 번 등록하는 것을 막을 수 있다.

### portfolio_project_posts

포트폴리오 프로젝트와 게시글의 N:M 관계를 풀기 위한 연결 테이블이다.

| 필드 | 왜 선언했나 | 왜 필요한가 |
| --- | --- | --- |
| `project_id` | 어떤 프로젝트에 기록을 연결했는지 저장하려고 선언했다. | 포트폴리오 관리 화면의 연결된 학습 기록 목록을 만든다. |
| `post_id` | 어떤 게시글이 연결됐는지 저장하려고 선언했다. | 프로젝트와 관련된 학습 로그, 트러블슈팅, 회고를 가져온다. |

`project_id + post_id`를 묶어 primary key로 두면 같은 기록이 같은 프로젝트에 중복 연결되는 것을 막을 수 있다.

### review_requests

학생이 코치에게 보내는 리뷰 요청 테이블이다.
대상은 게시글일 수도 있고 포트폴리오 프로젝트일 수도 있다.

| 필드 | 왜 선언했나 | 왜 필요한가 |
| --- | --- | --- |
| `id` | 리뷰 요청 한 건을 고유하게 구분하려고 선언했다. | 학생 요청 목록과 코치 인박스에서 특정 요청을 선택한다. |
| `requester_id` | 요청한 학생을 저장하려고 선언했다. | 학생은 본인이 보낸 요청만 보고, 코치는 요청자를 확인한다. |
| `category_id` | 리뷰 요청 카테고리를 저장하려고 선언했다. | 학습 로그, 트러블슈팅, 프로젝트 회고, 면접 질문, 포트폴리오 관리를 필터링한다. |
| `target_type` | 리뷰 대상 종류를 저장하려고 선언했다. | 대상이 게시글인지 포트폴리오 프로젝트인지 구분한다. |
| `target_post_id` | 게시글 대상일 때 게시글 id를 저장하려고 선언했다. | 코치가 원문 게시글을 확인할 수 있다. |
| `target_project_id` | 포트폴리오 대상일 때 프로젝트 id를 저장하려고 선언했다. | 코치가 포트폴리오 초안과 프로젝트 정보를 확인할 수 있다. |
| `message` | 학생의 요청 메시지를 저장하려고 선언했다. | 학생이 어떤 부분을 봐달라는지 코치에게 전달한다. |
| `status` | 리뷰 요청 진행 상태를 저장하려고 선언했다. | 대기 중, 검토 중, 수정 요청, 피드백 완료, 최종 확인을 화면에 보여준다. |
| `feedback` | 코치가 작성한 피드백을 저장하려고 선언했다. | 학생이 요청 목록에서 코치 피드백을 확인한다. |
| `created_at` | 요청 생성 시간을 저장하려고 선언했다. | 리뷰 요청 목록 정렬과 요청일 표시가 가능하다. |
| `updated_at` | 요청 수정 시간을 저장하려고 선언했다. | 상태나 피드백이 마지막으로 바뀐 시점을 추적한다. |

### review_request_coaches

리뷰 요청과 코치의 N:M 관계를 풀기 위한 연결 테이블이다.
학생은 한 요청을 여러 코치에게 보낼 수 있고, 코치 한 명은 여러 요청을 받을 수 있다.

| 필드 | 왜 선언했나 | 왜 필요한가 |
| --- | --- | --- |
| `review_request_id` | 어떤 리뷰 요청인지 저장하려고 선언했다. | 특정 요청에 배정된 코치 목록을 찾는다. |
| `coach_id` | 어떤 코치에게 보냈는지 저장하려고 선언했다. | 코치 인박스에서 자기에게 온 요청만 필터링한다. |

`review_request_id + coach_id`를 묶어 primary key로 두면 같은 요청이 같은 코치에게 중복 배정되는 것을 막을 수 있다.

### notifications

상단 알림 드롭다운에 보여줄 사용자별 알림 테이블이다.

| 필드 | 왜 선언했나 | 왜 필요한가 |
| --- | --- | --- |
| `id` | 알림 한 건을 고유하게 구분하려고 선언했다. | 알림 읽음 처리나 삭제 기능을 만들 때 필요하다. |
| `user_id` | 알림을 받을 사용자를 저장하려고 선언했다. | 사용자마다 다른 알림 목록을 보여준다. |
| `type` | 알림 종류를 저장하려고 선언했다. | 코치 피드백, 포트폴리오, AI 완료 같은 알림을 구분한다. |
| `message` | 알림 문구를 저장하려고 선언했다. | 드롭다운에 직접 표시되는 텍스트다. |
| `link_url` | 알림 클릭 시 이동할 주소를 저장하려고 선언했다. | 피드백 상세, 포트폴리오 관리, AI 도우미 결과로 이동할 수 있다. |
| `is_read` | 읽음 여부를 저장하려고 선언했다. | 읽지 않은 알림 표시와 배지를 만들 수 있다. |
| `created_at` | 알림 생성 시간을 저장하려고 선언했다. | "1시간 전" 같은 상대 시간을 만들 수 있다. |

### 저장하지 않고 계산하거나 JOIN하는 화면 값

아래 값들은 화면에 보이지만 별도 컬럼으로 만들지 않는 편이 좋다.

| 화면 값 | DB에서 만드는 방법 | 따로 저장하지 않는 이유 |
| --- | --- | --- |
| 게시글 댓글 수 | `comments`에서 `post_id` 기준 count | 댓글이 추가/삭제될 때마다 중복 컬럼을 갱신하지 않아도 된다. |
| 포트폴리오 연결 기록 수 | `portfolio_project_posts`에서 `project_id` 기준 count | 실제 연결 테이블이 원본이므로 개수는 계산하면 된다. |
| 게시글 작성자 이름 | `posts.author_id -> users.name` JOIN | 사용자가 이름을 바꾸면 최신 이름을 보여줄 수 있다. |
| 리뷰 요청자 이름 | `review_requests.requester_id -> users.name` JOIN | 이름 문자열을 중복 저장하지 않는다. |
| 담당 코치 이름 | `review_request_coaches.coach_id -> users.name` JOIN | 코치가 여러 명일 수 있어 연결 테이블이 기준이다. |
| 리뷰 대상 제목 | `target_post_id -> posts.title` 또는 `target_project_id -> portfolio_projects.title` JOIN | 대상 제목이 바뀌어도 최신 제목을 보여줄 수 있다. |

## 2026-06-12 Google 이름과 서비스 표시 이름 정책

Google OAuth에서 `email`, `sub`, `name`, `picture`를 받을 수 있다.
하지만 사용자가 JungleLog 안에서 이름을 바꿀 수 있어야 하므로 `users.name`은 Google 원본 이름이 아니라 **JungleLog 서비스 안에서 표시할 이름**으로 정의한다.

### 저장 정책

| 값 | DB 필드 | 정책 |
| --- | --- | --- |
| Google 고유 id | `users.google_sub` | 로그인 사용자를 찾는 기준이다. 사용자가 수정할 수 없다. |
| Google 이메일 | `users.email` | 계정 식별과 관리자 승인 목록에 사용한다. 일반 사용자가 직접 수정하지 않는다. |
| Google 이름 | `users.name` 초기값 | 첫 로그인 때 표시 이름의 초기값으로만 사용한다. |
| 서비스 표시 이름 | `users.name` | JungleLog 안에서 사용자가 수정할 수 있는 이름이다. 게시글 작성자, 댓글 작성자, 리뷰 요청자 이름으로 보인다. |
| Google 프로필 이미지 | `users.profile_image_url` | 첫 로그인 또는 로그인 동기화 때 저장할 수 있다. v1에서는 단순 저장한다. |

### 중요한 규칙

- 첫 로그인 때 `users.name`이 비어 있으면 Google `name`으로 초기화한다.
- 사용자가 JungleLog 설정 화면에서 이름을 바꾸면 `users.name`을 수정한다.
- 이후 Google 로그인 때마다 Google `name`으로 `users.name`을 덮어쓰지 않는다.
- Google 원본 이름까지 따로 보존해야 할 필요가 생기면 v2에서 `google_name` 또는 `oauth_name` 컬럼을 추가한다.

### 예시

```txt
Google name: 이준희
users.name 초기값: 이준희

사용자가 설정에서 이름을 "준희"로 변경
users.name: 준희

다음 Google 로그인
users.google_sub로 기존 사용자 찾기
users.name은 "준희" 유지
```

이렇게 해야 Google OAuth를 쓰면서도 서비스 안의 닉네임/표시 이름 변경 기능을 만들 수 있다.

---

## 2026-06-16 추가: `portfolio_projects.saved_interview_questions`

AI 도우미가 만든 면접 예상 질문을 프로젝트별로 보관하기 위해 `portfolio_projects`에 `saved_interview_questions`를 추가했다.

| 필드 | 타입 | 왜 선언했나 | 왜 필요한가 |
| --- | --- | --- | --- |
| `saved_interview_questions` | `text`, nullable | 면접 예상 질문은 여러 줄의 긴 텍스트가 될 수 있어서 `varchar`보다 `text`가 적합하다. 아직 질문을 저장하지 않은 프로젝트도 있으므로 nullable이다. | AI 도우미에서 생성한 면접 예상 질문을 프로젝트 상세와 포트폴리오 관리 화면에서 다시 보여주기 위해 필요하다. |

관련 화면:

- `/ai-assistant`: 면접 예상 질문 생성 결과를 선택한 프로젝트에 저장한다.
- `/portfolio`: 선택한 프로젝트의 저장된 면접 예상 질문과 저장 여부를 보여준다.

설계 메모:

- 지금은 AI 연결 전 샘플 결과를 저장하지만, 나중에 OpenAI/RAG/MCP/Agent 결과도 같은 필드에 저장할 수 있다.
- 더 복잡한 버전 관리가 필요해지면 v2에서 `ai_generation_results` 같은 별도 테이블로 분리할 수 있다.

---

## 2026-06-16 �߰�: `portfolio_projects.saved_interview_questions`

AI ����̰� ���� ���� ���� ������ ������Ʈ���� �����ϱ� ���� `portfolio_projects`�� `saved_interview_questions`�� �߰��ߴ�.

| �ʵ� | Ÿ�� | �� �����߳� | �� �ʿ��Ѱ� |
| --- | --- | --- | --- |
| `saved_interview_questions` | `text`, nullable | ���� ���� ������ ���� ���� �� �ؽ�Ʈ�� �� �� �־ `varchar`���� `text`�� �����ϴ�. ���� ������ �������� ���� ������Ʈ�� �����Ƿ� nullable�̴�. | AI ����̿��� ������ ���� ���� ������ ������Ʈ �󼼿� ��Ʈ������ ���� ȭ�鿡�� �ٽ� �����ֱ� ���� �ʿ��ϴ�. |

���� ȭ��:

- `/ai-assistant`: ���� ���� ���� ���� ����� ������ ������Ʈ�� �����Ѵ�.
- `/portfolio`: ������ ������Ʈ�� ����� ���� ���� ������ ���� ���θ� �����ش�.

���� �޸�:

- ������ AI ���� �� ���� ����� ����������, ���߿� OpenAI/RAG/MCP/Agent ����� ���� �ʵ忡 ������ �� �ִ�.
- �� ������ ���� ������ �ʿ������� v2���� `ai_generation_results` ���� ���� ���̺��� �и��� �� �ִ�.

---

## 2026-06-16 DB 설계 추가: portfolio_projects.github_branch

`portfolio_projects`에 `github_branch` 필드를 추가했다.

| 필드 | 타입 | 이유 |
| --- | --- | --- |
| `github_branch` | varchar(200) | 같은 repo라도 branch마다 README와 최근 커밋이 달라질 수 있으므로 분석 기준 branch를 저장한다. |

관계/제약 변경:

- 기존 중복 기준: `owner_id + repo_full_name`
- 변경 중복 기준: `owner_id + repo_full_name + github_branch`

왜 필요한가:

- 사용자가 `main`, `dev`, `feature/...` branch를 각각 포트폴리오 프로젝트로 관리할 수 있다.
- GitHub README와 commit 조회 시 어떤 branch를 기준으로 가져왔는지 명확해진다.
- AI 도우미가 나중에 포트폴리오 글을 만들 때 정확한 branch 자료를 참고할 수 있다.

---

## 2026-06-16 DB 설계 추가: portfolio_projects.published_post_id

`portfolio_projects`에 `published_post_id` 필드를 추가했다.

| 필드 | 타입 | 이유 |
| --- | --- | --- |
| `published_post_id` | bigint nullable FK(posts.id) | 프로젝트가 전체 게시글에 발행한 대표 포트폴리오 글을 명확히 연결하기 위해 사용한다. |

왜 `portfolio_project_posts`를 재사용하지 않았나:

- `portfolio_project_posts`는 프로젝트가 참고하는 학습 기록 연결이다.
- 발행된 포트폴리오 글은 참고 기록이 아니라 프로젝트를 대표하는 결과물이다.
- 두 의미를 섞으면 연결된 기록 수와 AI 참고 자료가 꼬일 수 있다.
