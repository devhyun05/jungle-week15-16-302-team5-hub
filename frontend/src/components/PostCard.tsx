import { Link } from "react-router-dom";
import type { PostCardData, PostType } from "../types";
import TagBadge from "./TagBadge";

interface CategoryMeta {
  label: string;
  className: string;
}

interface PostCardProps {
  post?: PostCardData;
}

const categoryMeta: Record<PostType, CategoryMeta> = {
  recipe: { label: "레시피 공유", className: "badge badge-mint" },
  failure: { label: "실패 질문", className: "badge badge-coral" },
  review: { label: "후기", className: "badge badge-lavender" },
  tip: { label: "팁", className: "badge badge-mint" },
};

export default function PostCard({ post }: PostCardProps) {
  const meta = post?.type ? categoryMeta[post.type] : categoryMeta.failure;

  return (
    <article className="post-card">
      <div className="post-card-top">
        <span className={meta.className}>{meta.label}</span>
        {post?.hasImage && <span className="meta">사진 포함</span>}
      </div>
      <Link to={`/posts/${post?.id || ""}`} aria-label={`${post?.title || "게시글"} 상세 보기`}>
        <h3>{post?.title || "게시글 제목"}</h3>
      </Link>
      <p className="card-copy">{post?.summary || "게시글 요약과 작성자 정보를 표시할 영역입니다."}</p>
      <div className="tag-row">
        {(post?.tags || ["실패해결"]).slice(0, 4).map((tag: string) => (
          <TagBadge key={tag} label={tag} />
        ))}
      </div>
      <footer className="post-card-footer">
        <span className="meta">{post?.author || "민트연구원"} · {post?.time || "2시간 전"}</span>
        <span className="post-metrics">
          <span>댓글 {post?.comments ?? 12}</span>
          <span>저장 {post?.saves ?? 34}</span>
        </span>
      </footer>
    </article>
  );
}
