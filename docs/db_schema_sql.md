# 말랑 연구소 DB 테이블 생성 SQL

이 문서는 현재 확정한 최소 DB 설계를 PostgreSQL에 생성하기 위한 SQL이다.

## 사용 전 확인

- PostgreSQL에 `pgvector` 확장이 설치되어 있어야 한다.
- `CREATE EXTENSION IF NOT EXISTS vector;`에서 에러가 나면 pgvector 설치가 먼저 필요하다.
- 마지막 HNSW 인덱스 생성은 pgvector 버전 또는 환경에 따라 실패할 수 있다. 실패하면 해당 `CREATE INDEX idx_embeddings_vector_hnsw` 구문만 제외하고 실행한다.

## 최종 생성 쿼리

```sql
-- pgvector 사용
CREATE EXTENSION IF NOT EXISTS vector;

-- updated_at 자동 갱신 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- USERS
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    nickname VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- REFRESH TOKENS
CREATE TABLE refresh_tokens (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,

    token_hash VARCHAR(255) NOT NULL,
    family_id VARCHAR(64) NOT NULL,

    user_agent TEXT,
    ip_address VARCHAR(45),

    expires_at TIMESTAMPTZ NOT NULL,
    revoked_at TIMESTAMPTZ,
    replaced_by_token_id BIGINT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_used_at TIMESTAMPTZ,

    CONSTRAINT uq_refresh_tokens_hash UNIQUE (token_hash),

    CONSTRAINT fk_refresh_tokens_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_refresh_tokens_replaced_by
        FOREIGN KEY (replaced_by_token_id)
        REFERENCES refresh_tokens(id)
        ON DELETE SET NULL
);


-- POSTS
CREATE TABLE posts (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,

    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,

    post_type VARCHAR(50) NOT NULL DEFAULT 'general',
    slime_type VARCHAR(50),
    difficulty VARCHAR(50),

    ingredients TEXT,
    ratio TEXT,
    steps TEXT,
    texture_result TEXT,
    storage_tip TEXT,

    symptom TEXT,
    attempted_solution TEXT,
    solved_status VARCHAR(50),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_posts_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT chk_posts_post_type
        CHECK (post_type IN ('recipe', 'failure', 'review', 'general'))
);


-- COMMENTS
CREATE TABLE comments (
    id BIGSERIAL PRIMARY KEY,
    post_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,

    content TEXT NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_comments_post
        FOREIGN KEY (post_id)
        REFERENCES posts(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_comments_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);


-- TAGS
CREATE TABLE tags (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    tag_type VARCHAR(50) NOT NULL DEFAULT 'custom',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_tags_name UNIQUE (name)
);


-- POST_TAGS
CREATE TABLE post_tags (
    post_id BIGINT NOT NULL,
    tag_id BIGINT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    PRIMARY KEY (post_id, tag_id),

    CONSTRAINT fk_post_tags_post
        FOREIGN KEY (post_id)
        REFERENCES posts(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_post_tags_tag
        FOREIGN KEY (tag_id)
        REFERENCES tags(id)
        ON DELETE CASCADE
);


-- EMBEDDINGS
CREATE TABLE embeddings (
    id BIGSERIAL PRIMARY KEY,

    source_type VARCHAR(50) NOT NULL,

    post_id BIGINT,
    comment_id BIGINT,

    content TEXT NOT NULL,

    -- 1536은 예시입니다.
    -- 사용하는 임베딩 모델의 차원에 맞게 변경하세요.
    embedding VECTOR(1536),

    embedding_model VARCHAR(100),
    embedding_dim INT,
    content_hash VARCHAR(255),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_embeddings_post
        FOREIGN KEY (post_id)
        REFERENCES posts(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_embeddings_comment
        FOREIGN KEY (comment_id)
        REFERENCES comments(id)
        ON DELETE CASCADE,

    CONSTRAINT chk_embeddings_source_match
        CHECK (
            (
                source_type = 'post'
                AND post_id IS NOT NULL
                AND comment_id IS NULL
            )
            OR
            (
                source_type = 'comment'
                AND post_id IS NULL
                AND comment_id IS NOT NULL
            )
        )
);


-- updated_at 트리거
CREATE TRIGGER trg_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_posts_updated_at
BEFORE UPDATE ON posts
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_comments_updated_at
BEFORE UPDATE ON comments
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_embeddings_updated_at
BEFORE UPDATE ON embeddings
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();


-- 기본 조회 인덱스
CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_created_id ON posts(created_at DESC, id DESC);
CREATE INDEX idx_posts_type_created ON posts(post_type, created_at DESC);
CREATE INDEX idx_posts_slime_created ON posts(slime_type, created_at DESC);

CREATE INDEX idx_comments_post_created ON comments(post_id, created_at ASC);
CREATE INDEX idx_comments_user_id ON comments(user_id);

CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_family_id ON refresh_tokens(family_id);
CREATE INDEX idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);
CREATE INDEX idx_refresh_tokens_active
ON refresh_tokens(user_id, expires_at)
WHERE revoked_at IS NULL;

CREATE INDEX idx_tags_type ON tags(tag_type);
CREATE INDEX idx_tags_name ON tags(name);

CREATE INDEX idx_post_tags_tag_post ON post_tags(tag_id, post_id);

CREATE INDEX idx_embeddings_post_id ON embeddings(post_id);
CREATE INDEX idx_embeddings_comment_id ON embeddings(comment_id);
CREATE INDEX idx_embeddings_source_type ON embeddings(source_type);
CREATE INDEX idx_embeddings_content_hash ON embeddings(content_hash);


-- 같은 게시글/댓글 안에서 같은 조각 중복 임베딩 방지
CREATE UNIQUE INDEX uq_embeddings_post_chunk
ON embeddings(post_id, content_hash)
WHERE post_id IS NOT NULL AND content_hash IS NOT NULL;

CREATE UNIQUE INDEX uq_embeddings_comment_chunk
ON embeddings(comment_id, content_hash)
WHERE comment_id IS NOT NULL AND content_hash IS NOT NULL;


-- pgvector 유사도 검색 인덱스
-- 데이터가 적은 초기에는 없어도 됩니다.
-- pgvector 버전 또는 환경에 따라 실패하면 이 줄만 빼고 실행하세요.
CREATE INDEX idx_embeddings_vector_hnsw
ON embeddings
USING hnsw (embedding vector_cosine_ops);
```
