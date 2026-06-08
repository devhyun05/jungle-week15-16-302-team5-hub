# 말랑 연구소 DB ERD 보강안

## 기준

- Notion `전체 아키텍처`와 하위 `DB 설계` 페이지는 PostgreSQL + pgvector를 기준으로, 게시판 데이터가 RAG와 AI 진단의 지식 베이스가 되는 구조를 정의한다.
- 현재 코드의 `backend/app/models`는 실제 SQLAlchemy 컬럼 정의가 아직 없고 TODO 문서 문자열만 있다.
- `db/init.sql`도 `CREATE EXTENSION IF NOT EXISTS vector;`와 테이블 계획 주석, `embeddings` 예시만 있는 상태다.

## 현재 설계에 있는 핵심 테이블

- `users`: 회원 정보
- `posts`: 모든 게시글 공통 정보
- `comments`: 게시글 댓글
- `tags`, `post_tags`: 태그와 게시글-태그 다대다 관계
- `recipes`: 레시피 게시글 상세
- `failure_cases`: 실패 질문/해결 게시글 상세
- `ai_diagnoses`: AI Agent 진단 결과
- `embeddings`: RAG 검색용 pgvector 임베딩

## 테이블 역할 설명

| 테이블 | 역할 | 주요 연결 |
| --- | --- | --- |
| `users` | 회원 계정 정보를 저장한다. 이메일, 비밀번호 해시, 닉네임을 관리하며 게시글, 댓글, 반응의 주체가 된다. | `posts.user_id`, `comments.user_id`, `post_reactions.user_id` |
| `posts` | 레시피, 실패 질문, 후기, 일반 글의 공통 게시글 정보를 저장하는 중심 테이블이다. 화면의 목록/상세 조회와 RAG 원본 데이터의 출발점이다. | `users`, `comments`, `post_tags`, `recipes`, `failure_cases`, `review_details`, `post_images`, `ai_diagnoses` |
| `comments` | 게시글에 달린 댓글과 답글을 저장한다. 실제 해결 팁이 포함될 수 있으므로 RAG 검색용 지식 데이터로도 사용한다. | `posts`, `users`, `comments.parent_comment_id`, `embeddings` |
| `tags` | 슬라임 종류, 실패 증상, 질감, 난이도 같은 태그 마스터 데이터를 저장한다. 검색/필터와 AI 추천 태그의 기준이 된다. | `post_tags` |
| `post_tags` | 게시글과 태그의 다대다 관계를 저장하는 조인 테이블이다. 하나의 게시글에 여러 태그를 붙이고, 하나의 태그로 여러 게시글을 찾게 해준다. | `posts`, `tags` |
| `recipes` | `post_type=recipe` 게시글의 상세 레시피 정보를 저장한다. 재료, 비율, 제작 단계, 완성 질감, 보관 팁처럼 레시피에만 필요한 필드를 분리한다. | `posts`, `embeddings` |
| `failure_cases` | `post_type=failure` 게시글의 실패 증상과 해결 상태를 저장한다. AI 진단과 RAG 유사 사례 검색에서 가장 중요한 실패 데이터다. | `posts`, `ai_diagnoses`, `embeddings` |
| `review_details` | `post_type=review` 게시글의 후기 전용 정보를 저장한다. 완성 질감, 만족도, 사용한 레시피 스냅샷, 후기 메모를 분리해 관리한다. | `posts`, `embeddings` |
| `post_images` | 게시글에 첨부된 이미지 URL과 표시 순서를 저장한다. 작성 화면의 이미지 업로드와 상세 화면의 사진 영역을 지원한다. | `posts` |
| `post_reactions` | 좋아요, 저장 같은 사용자 반응을 저장한다. 한 사용자가 같은 게시글에 같은 반응을 중복으로 남기지 않도록 제약을 둔다. | `posts`, `users` |
| `ai_diagnoses` | AI Agent가 생성한 진단 요약, 원인 후보, 해결 단계, 추천 태그를 저장한다. 진단 결과 자체도 이후 RAG 지식으로 재사용할 수 있다. | `posts`, `weather_observations`, `ai_diagnosis_sources`, `embeddings` |
| `ai_diagnosis_sources` | AI 진단이 참고한 RAG 근거를 정규화해 저장한다. 어떤 게시글/댓글/레시피가 몇 점의 유사도로 사용됐는지 추적할 수 있다. | `ai_diagnoses`, polymorphic `source_type/source_id` |
| `weather_observations` | MCP 서버가 조회한 날씨/습도 정보를 진단 시점의 스냅샷으로 저장한다. 나중에 같은 진단을 재현하거나 습도와 실패 증상의 관계를 분석할 때 필요하다. | `ai_diagnoses`, `embeddings` |
| `embeddings` | RAG 검색을 위한 벡터와 임베딩 원문을 저장한다. 게시글, 댓글, 상세 테이블, AI 진단 결과를 `source_type/source_id`로 연결하는 polymorphic 테이블이다. | polymorphic `source_type/source_id` |

## 보강이 필요한 부분

- `review_details`: `post_type=review`가 있지만 후기 상세 테이블이 없어 완성 질감, 만족도, 사용 기간 같은 후기 전용 정보를 담기 어렵다.
- `post_images`: 화면과 작성 폼에 이미지 업로드가 있으나 이미지 메타데이터 저장 구조가 없다.
- `post_reactions`: 좋아요, 저장 같은 사용자 반응이 UI에 보이지만 저장 테이블이 없다.
- `ai_diagnosis_sources`: `rag_sources`를 JSON으로만 저장하면 어떤 게시글/댓글/진단이 근거였는지 정규화 조회가 어렵다.
- `weather_observations`: MCP 날씨/습도 결과를 진단 당시 스냅샷으로 보존하면 재현성과 분석에 좋다.
- `embeddings` 메타데이터: 재임베딩 관리를 위해 `embedding_model`, `embedding_dim`, `content_hash`가 있으면 좋다.

## 전체 ERD

PDF 발표 자료에서 추출한 ERD 이미지다. 문서 렌더링 환경에서 Mermaid가 보이지 않을 때도 전체 관계를 빠르게 확인할 수 있도록 함께 둔다.

![말랑 연구소 DB 전체 ERD](assets/malrang-erd.png)

```
    USERS {
      bigint id PK
      varchar email UK
      varchar password_hash
      varchar nickname
      timestamp created_at
      timestamp updated_at
    }

    POSTS {
      bigint id PK
      bigint user_id FK
      varchar title
      text content
      varchar post_type
      varchar slime_type
      varchar difficulty
      int view_count
      timestamp created_at
      timestamp updated_at
      timestamp deleted_at
    }

    COMMENTS {
      bigint id PK
      bigint post_id FK
      bigint user_id FK
      bigint parent_comment_id FK
      text content
      timestamp created_at
      timestamp updated_at
      timestamp deleted_at
    }

    TAGS {
      bigint id PK
      varchar name
      varchar tag_type
      timestamp created_at
    }

    POST_TAGS {
      bigint post_id PK,FK
      bigint tag_id PK,FK
      timestamp created_at
    }

    RECIPES {
      bigint id PK
      bigint post_id FK,UK
      text ingredients
      text ratio
      text steps
      text texture_result
      text storage_tip
    }

    FAILURE_CASES {
      bigint id PK
      bigint post_id FK,UK
      text symptom
      text attempted_solution
      varchar solved_status
      text resolved_solution
      timestamp resolved_at
    }

    REVIEW_DETAILS {
      bigint id PK
      bigint post_id FK,UK
      text final_texture
      int satisfaction_score
      text used_recipe_snapshot
      text review_note
    }

    POST_IMAGES {
      bigint id PK
      bigint post_id FK
      varchar image_url
      varchar alt_text
      int sort_order
      timestamp created_at
    }

    POST_REACTIONS {
      bigint id PK
      bigint post_id FK
      bigint user_id FK
      varchar reaction_type
      timestamp created_at
    }

    AI_DIAGNOSES {
      bigint id PK
      bigint post_id FK
      text diagnosis_summary
      jsonb cause_candidates
      jsonb solution_steps
      jsonb recommended_tags
      bigint weather_observation_id FK
      timestamp created_at
    }

    AI_DIAGNOSIS_SOURCES {
      bigint id PK
      bigint ai_diagnosis_id FK
      varchar source_type
      bigint source_id
      float similarity_score
      text evidence_excerpt
      timestamp created_at
    }

    WEATHER_OBSERVATIONS {
      bigint id PK
      varchar location
      numeric temperature_c
      numeric humidity_percent
      varchar provider
      jsonb raw_payload
      timestamp observed_at
    }

    EMBEDDINGS {
      bigint id PK
      varchar source_type
      bigint source_id
      text content
      vector embedding
      varchar embedding_model
      int embedding_dim
      varchar content_hash
      timestamp created_at
    }
```

## 주요 제약 조건

- `users.email` unique
- `tags(name, tag_type)` unique
- `post_tags(post_id, tag_id)` unique
- `recipes.post_id`, `failure_cases.post_id`, `review_details.post_id` unique
- `post_reactions(user_id, post_id, reaction_type)` unique
- `ai_diagnosis_sources(source_type, source_id)`는 polymorphic reference이므로 애플리케이션 레벨 검증 필요
- `embeddings(source_type, source_id)`도 polymorphic reference이므로 애플리케이션 레벨 검증 필요

## 인덱스 후보

- `posts(post_type, created_at DESC)`
- `posts(user_id, created_at DESC)`
- `comments(post_id, created_at ASC)`
- `tags(name)`, `tags(tag_type)`
- `post_tags(post_id)`, `post_tags(tag_id)`
- `post_reactions(post_id, reaction_type)`
- `ai_diagnoses(post_id, created_at DESC)`
- `ai_diagnosis_sources(ai_diagnosis_id, similarity_score DESC)`
- `embeddings(source_type, source_id)`
- `embeddings.embedding` HNSW 또는 IVFFLAT vector index
- 검색 품질이 필요하면 `posts.title`, `posts.content`, `comments.content`에 PostgreSQL full-text index 추가
