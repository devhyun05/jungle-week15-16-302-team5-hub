# JungleLog DB Design

이 문서는 JungleLog의 PostgreSQL 테이블 설계와 ERD를 관리한다.
dbdiagram.io에는 아래 DBML을 붙여넣고, 설계 변경이 생기면 이 문서도 함께 업데이트한다.

## ERD v1 범위

v1은 기본 게시판, 포트폴리오 관리, 코치 리뷰 요청, 알림까지 다룬다.
RAG, MCP, Agent, OpenAI 호출 기록은 기본 CRUD가 안정화된 뒤 v2에서 추가한다.

## v1 테이블 목록

| 테이블 | 역할 |
| --- | --- |
| `users` | 학생과 코치 계정 |
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

- 학생과 코치는 `users.role`로 구분한다.
- 게시글 카테고리는 문자열만 저장하지 않고 `post_categories` 테이블로 분리한다.
- 게시글과 태그는 N:M 관계라서 `post_tags` 연결 테이블을 둔다.
- 포트폴리오 프로젝트와 게시글도 N:M 관계라서 `portfolio_project_posts` 연결 테이블을 둔다.
- 리뷰 요청 하나는 여러 코치에게 보낼 수 있으므로 `review_request_coaches` 연결 테이블을 둔다.
- 리뷰 대상은 게시글 또는 포트폴리오 프로젝트가 될 수 있으므로 `target_type`, `target_post_id`, `target_project_id`를 함께 둔다.
- AI 생성 로그, RAG chunk, MCP tool call, Agent run은 v2에서 추가한다.

## dbdiagram.io DBML v1

```dbml
Table users {
  id bigint [pk, increment]
  email varchar(255) [not null, unique]
  password_hash varchar(255) [not null]
  name varchar(50) [not null]
  role varchar(20) [not null, note: 'STUDENT or COACH']
  track varchar(100)
  coach_field varchar(100)
  created_at timestamp [not null]
  updated_at timestamp [not null]
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
  tech_stack text
  readme_summary text
  recent_commit_summary text
  saved_portfolio_draft text
  portfolio_status varchar(30) [not null, default: '작성중']
  coach_feedback_status varchar(30) [not null, default: '요청 전']
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
  status varchar(30) [not null, default: '대기 중']
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

## v1에서 일부러 미룬 것

- AI 생성 기록: `ai_generation_logs`
- RAG 문서 원본: `rag_documents`
- RAG chunk와 embedding: `rag_chunks`
- GitHub 분석 상세 로그: `github_repositories`, `github_commits`
- MCP 호출 로그: `mcp_tool_calls`
- Agent 실행 기록: `agent_runs`

이 테이블들은 기본 게시글, 포트폴리오, 코치 리뷰 데이터가 실제 DB에 저장된 뒤 v2에서 추가한다.

## 다음 확인 질문

1. `post_categories`를 별도 테이블로 둘지, `posts.category_slug` 문자열 컬럼만 둘지 결정한다.
2. `portfolio_projects.tech_stack`을 v1에서는 text로 둘지, 별도 기술 스택 테이블로 분리할지 결정한다.
3. `review_requests`의 대상 구조를 현재처럼 nullable FK 2개로 둘지, `target_type + target_id`만 둘지 결정한다.
