-- PostgreSQL initialization plan for Malang Lab.
-- TODO: 실제 구현 단계에서 SQLAlchemy migration 또는 Alembic으로 전환한다.

-- 1. pgvector 확장 활성화
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. 주요 테이블 계획
-- users: 회원 정보
-- posts: recipe/failure/review/general 게시글 공통 정보
-- comments: 게시글 댓글
-- tags: 슬라임 종류, 실패 증상, 질감, 난이도 태그
-- post_tags: 게시글-태그 다대다 관계
-- recipes: 레시피 게시글 상세 정보
-- failure_cases: 실패 해결 게시글 상세 정보
-- ai_diagnoses: AI Agent 진단 결과
-- embeddings: RAG 검색용 벡터

-- 3. embeddings 예시
-- CREATE TABLE embeddings (
--   id BIGSERIAL PRIMARY KEY,
--   source_type VARCHAR(50) NOT NULL,
--   source_id BIGINT NOT NULL,
--   content TEXT NOT NULL,
--   embedding VECTOR(1536),
--   created_at TIMESTAMP DEFAULT NOW()
-- );
