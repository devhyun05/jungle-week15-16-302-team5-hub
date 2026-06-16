import json
import math
from dataclasses import dataclass

from openai import OpenAI, OpenAIError
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.models import PortfolioProject, RagDocument, User
from app.repositories import portfolio_repository, rag_repository


class RagIndexError(RuntimeError):
    pass


class RagSearchError(RuntimeError):
    pass


@dataclass
class RagSourceChunk:
    source_type: str
    source_id: str
    title: str
    content: str


@dataclass
class RagSearchResult:
    document_id: int
    source_type: str
    source_id: str
    title: str
    content: str
    score: float


CHUNK_SIZE = 1600
CHUNK_OVERLAP = 160


def index_project_documents(db: Session, project_id: int, current_user: User) -> tuple[PortfolioProject | None, int]:
    project = portfolio_repository.get_project_by_id(db=db, project_id=project_id, current_user=current_user)

    if project is None:
        return None, 0

    chunks = build_project_chunks(project)

    if not chunks:
        rag_repository.delete_project_documents(db=db, project_id=project.id)
        db.commit()

        return project, 0

    embeddings = embed_texts([chunk.content for chunk in chunks])
    documents = [
        RagDocument(
            project_id=project.id,
            owner_id=project.owner_id,
            source_type=chunk.source_type,
            source_id=chunk.source_id,
            title=chunk.title,
            content=chunk.content,
            embedding_json=json.dumps(embedding),
            token_estimate=estimate_tokens(chunk.content),
        )
        for chunk, embedding in zip(chunks, embeddings, strict=True)
    ]

    rag_repository.delete_project_documents(db=db, project_id=project.id)
    rag_repository.create_documents(db=db, documents=documents)
    db.commit()

    return project, len(documents)


def search_project_documents(
    db: Session,
    project_id: int,
    query: str,
    current_user: User,
    top_k: int = 5,
) -> tuple[PortfolioProject | None, list[RagSearchResult]]:
    project = portfolio_repository.get_project_by_id(db=db, project_id=project_id, current_user=current_user)

    if project is None:
        return None, []

    documents = rag_repository.get_project_documents(db=db, project_id=project.id)

    if not documents:
        project, _indexed_count = index_project_documents(db=db, project_id=project.id, current_user=current_user)
        documents = rag_repository.get_project_documents(db=db, project_id=project_id)

    if not documents:
        return project, []

    query_embedding = embed_texts([query])[0]
    scored_documents = []

    for document in documents:
        if not document.embedding_json:
            continue

        try:
            document_embedding = json.loads(document.embedding_json)
        except json.JSONDecodeError:
            continue

        scored_documents.append(
            RagSearchResult(
                document_id=document.id,
                source_type=document.source_type,
                source_id=document.source_id,
                title=document.title,
                content=document.content,
                score=cosine_similarity(query_embedding, document_embedding),
            ),
        )

    scored_documents.sort(key=lambda item: item.score, reverse=True)

    return project, scored_documents[:top_k]


def build_rag_context(db: Session, project_id: int, query: str, current_user: User, top_k: int = 5) -> str:
    _project, results = search_project_documents(
        db=db,
        project_id=project_id,
        query=query,
        current_user=current_user,
        top_k=top_k,
    )

    if not results:
        return ""

    return "\n\n".join(
        f"[{result.source_type}] {result.title}\nscore: {result.score:.3f}\n{result.content}"
        for result in results
    )


def build_project_chunks(project: PortfolioProject) -> list[RagSourceChunk]:
    sources: list[RagSourceChunk] = []

    if project.readme_content:
        sources.extend(
            split_text_into_chunks(
                source_type="github_readme",
                source_id=f"project-{project.id}-readme",
                title=f"{project.title} README",
                text=project.readme_content,
            ),
        )

    for commit in project.github_commits:
        sources.append(
            RagSourceChunk(
                source_type="github_commit",
                source_id=f"commit-{commit.id}",
                title=commit.sha[:7],
                content=commit.message,
            ),
        )

    for link in project.portfolio_project_posts:
        post = link.post

        if post is None or post.deleted_at is not None:
            continue

        category_label = post.category.label if post.category is not None else "record"
        text = f"{post.title}\n\n{post.summary or ''}\n\n{post.content}"
        sources.extend(
            split_text_into_chunks(
                source_type="linked_post",
                source_id=f"post-{post.id}",
                title=f"{category_label}: {post.title}",
                text=text,
            ),
        )

    if project.saved_portfolio_draft:
        sources.extend(
            split_text_into_chunks(
                source_type="saved_portfolio",
                source_id=f"project-{project.id}-portfolio",
                title=f"{project.title} portfolio draft",
                text=project.saved_portfolio_draft,
            ),
        )

    if project.saved_interview_questions:
        sources.extend(
            split_text_into_chunks(
                source_type="saved_interview",
                source_id=f"project-{project.id}-interview",
                title=f"{project.title} interview questions",
                text=project.saved_interview_questions,
            ),
        )

    return [source for source in sources if source.content.strip()]


def split_text_into_chunks(source_type: str, source_id: str, title: str, text: str) -> list[RagSourceChunk]:
    normalized_text = "\n".join(line.rstrip() for line in text.strip().splitlines())

    if len(normalized_text) <= CHUNK_SIZE:
        return [RagSourceChunk(source_type=source_type, source_id=source_id, title=title, content=normalized_text)]

    chunks = []
    start = 0
    index = 1

    while start < len(normalized_text):
        end = min(start + CHUNK_SIZE, len(normalized_text))
        chunk_text = normalized_text[start:end].strip()

        if chunk_text:
            chunks.append(
                RagSourceChunk(
                    source_type=source_type,
                    source_id=f"{source_id}-chunk-{index}",
                    title=f"{title} #{index}",
                    content=chunk_text,
                ),
            )
            index += 1

        if end == len(normalized_text):
            break

        start = max(0, end - CHUNK_OVERLAP)

    return chunks


def embed_texts(texts: list[str]) -> list[list[float]]:
    if not texts:
        return []

    if not settings.openai_api_key:
        raise RagIndexError("OPENAI_API_KEY is required for RAG embeddings.")

    try:
        client = OpenAI(api_key=settings.openai_api_key)
        response = client.embeddings.create(
            model=settings.openai_embedding_model,
            input=texts,
        )
    except OpenAIError as error:
        raise RagIndexError("OpenAI embedding request failed.") from error

    return [item.embedding for item in response.data]


def cosine_similarity(left: list[float], right: list[float]) -> float:
    if not left or not right or len(left) != len(right):
        return 0.0

    dot = sum(left_value * right_value for left_value, right_value in zip(left, right, strict=True))
    left_norm = math.sqrt(sum(value * value for value in left))
    right_norm = math.sqrt(sum(value * value for value in right))

    if left_norm == 0 or right_norm == 0:
        return 0.0

    return dot / (left_norm * right_norm)


def estimate_tokens(text: str) -> int:
    # This rough estimate is enough for cost guardrails before adding a tokenizer.
    return max(1, len(text) // 4)
