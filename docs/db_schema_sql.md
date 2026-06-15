# 말랑 연구소 DB 테이블 생성 SQL

이 문서는 현재 프론트 글쓰기 폼과 백엔드 Session 05 모델에 맞춘 PostgreSQL 생성 SQL이다.

현재 글쓰기 화면은 `title`, `content`, `post_type`, `slime_type`, `image_url`, `tag_names`를 보낸다. 그래서 `posts` 테이블도 레시피 재료, 비율, 제작 순서, 실패 증상 같은 세부 컬럼을 아직 만들지 않는다. 그 정보는 지금은 `content` 본문에 저장하고, 나중에 프론트 입력칸을 추가할 때 DB 컬럼과 쿼리를 함께 확장한다.

## 사용 전 확인

- 새 DB를 만들 때는 아래 `최종 생성 쿼리`를 실행한다.
- 이미 예전 SQL로 테이블을 만든 DB라면 먼저 `기존 DB 수정 쿼리`를 1회 실행한다.
- RAG/Agent용 `embeddings`와 `pgvector`는 아직 기본 게시판 세션에서 쓰지 않으므로 이 문서의 기본 생성 SQL에서 제외한다.

## 기존 DB 수정 쿼리

아래 쿼리는 예전 스키마를 이미 만든 DB를 현재 프론트 기준으로 맞출 때 사용한다. 새 DB에는 실행하지 않아도 된다.

```sql
-- posts.user_id -> posts.author_id
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'posts'
          AND column_name = 'user_id'
    )
    AND NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'posts'
          AND column_name = 'author_id'
    ) THEN
        ALTER TABLE posts RENAME COLUMN user_id TO author_id;
    END IF;
END;
$$;

-- comments.user_id -> comments.author_id
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'comments'
          AND column_name = 'user_id'
    )
    AND NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'comments'
          AND column_name = 'author_id'
    ) THEN
        ALTER TABLE comments RENAME COLUMN user_id TO author_id;
    END IF;
END;
$$;

-- 현재 프론트가 보내지 않는 확장 컬럼 제거
ALTER TABLE posts
    DROP COLUMN IF EXISTS difficulty,
    DROP COLUMN IF EXISTS ingredients,
    DROP COLUMN IF EXISTS ratio,
    DROP COLUMN IF EXISTS steps,
    DROP COLUMN IF EXISTS texture_result,
    DROP COLUMN IF EXISTS storage_tip,
    DROP COLUMN IF EXISTS symptom,
    DROP COLUMN IF EXISTS attempted_solution,
    DROP COLUMN IF EXISTS solved_status;

-- SQLAlchemy 모델 길이에 맞추기
ALTER TABLE posts
    ALTER COLUMN post_type TYPE VARCHAR(20),
    ALTER COLUMN slime_type TYPE VARCHAR(80);

-- 게시글 사진 첨부 컬럼
ALTER TABLE posts
    ADD COLUMN IF NOT EXISTS image_url TEXT;

ALTER TABLE tags
    ALTER COLUMN name TYPE VARCHAR(80),
    ALTER COLUMN tag_type TYPE VARCHAR(40);

-- 현재 SQLAlchemy post_tags 모델에는 created_at 컬럼이 없다.
ALTER TABLE post_tags
    DROP COLUMN IF EXISTS created_at;

-- 인덱스 이름과 대상 컬럼 정리
DROP INDEX IF EXISTS idx_posts_user_id;
DROP INDEX IF EXISTS idx_comments_user_id;

CREATE INDEX IF NOT EXISTS idx_posts_author_id ON posts(author_id);
CREATE INDEX IF NOT EXISTS idx_comments_author_id ON comments(author_id);

-- embeddings는 아직 기본 게시판 기능에서 사용하지 않는다.
-- 이미 만들어 둔 테이블을 제거하고 싶을 때만 아래 주석을 해제한다.
-- DROP TABLE IF EXISTS embeddings;
```

## 최종 생성 쿼리

```sql
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
    author_id BIGINT NOT NULL,

    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    image_url TEXT,

    post_type VARCHAR(20) NOT NULL,
    slime_type VARCHAR(80),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_posts_author
        FOREIGN KEY (author_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT chk_posts_post_type
        CHECK (post_type IN ('recipe', 'failure', 'review', 'general'))
);


-- COMMENTS
CREATE TABLE comments (
    id BIGSERIAL PRIMARY KEY,
    post_id BIGINT NOT NULL,
    author_id BIGINT NOT NULL,

    content TEXT NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_comments_post
        FOREIGN KEY (post_id)
        REFERENCES posts(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_comments_author
        FOREIGN KEY (author_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);


-- TAGS
CREATE TABLE tags (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(80) NOT NULL,
    tag_type VARCHAR(40) NOT NULL DEFAULT 'custom',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_tags_name UNIQUE (name)
);


-- POST_TAGS
CREATE TABLE post_tags (
    post_id BIGINT NOT NULL,
    tag_id BIGINT NOT NULL,

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

-- 기본 조회 인덱스
CREATE INDEX idx_posts_author_id ON posts(author_id);
CREATE INDEX idx_posts_created_id ON posts(created_at DESC, id DESC);
CREATE INDEX idx_posts_type_created ON posts(post_type, created_at DESC);
CREATE INDEX idx_posts_slime_created ON posts(slime_type, created_at DESC);

CREATE INDEX idx_comments_post_created ON comments(post_id, created_at ASC);
CREATE INDEX idx_comments_author_id ON comments(author_id);

CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_family_id ON refresh_tokens(family_id);
CREATE INDEX idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);
CREATE INDEX idx_refresh_tokens_active
ON refresh_tokens(user_id, expires_at)
WHERE revoked_at IS NULL;

CREATE INDEX idx_tags_type ON tags(tag_type);
CREATE INDEX idx_tags_name ON tags(name);

CREATE INDEX idx_post_tags_tag_post ON post_tags(tag_id, post_id);
```

## 나중에 Agent/RAG 붙일 때

Agent/RAG 단계에서는 `embeddings` 테이블과 `pgvector` 확장을 별도 마이그레이션으로 추가한다. 이때도 `posts`에 레시피 세부 컬럼을 꼭 추가해야 하는 것은 아니다. 기본적으로는 `posts.title`, `posts.content`, `tags.name`, `comments.content`를 임베딩 원문으로 사용할 수 있다.
