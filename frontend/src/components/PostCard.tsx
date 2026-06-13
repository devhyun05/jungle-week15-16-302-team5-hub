import { Link } from "react-router-dom";
import type { PostCardData, PostType } from "../types";
import { badgeBase, badgeTone, cardCopy, cn, h3, meta as metaText, tagRow } from "../styles/ui";
import TagBadge from "./TagBadge";

interface CategoryMeta {
  label: string;
  className: string;
}

interface PostCardProps {
  post?: PostCardData;
}

const categoryMeta: Record<PostType, CategoryMeta> = {
  recipe: { label: "레시피 공유", className: cn(badgeBase, badgeTone.mint) },
  failure: { label: "실패 질문", className: cn(badgeBase, badgeTone.coral) },
  review: { label: "후기", className: cn(badgeBase, badgeTone.lavender) },
  general: { label: "일반", className: cn(badgeBase, badgeTone.mint) },
};

export default function PostCard({ post }: PostCardProps) {
  const category = post?.type ? categoryMeta[post.type] : categoryMeta.failure;

  return (
    <article className="grid gap-3 rounded-md border border-line bg-white p-5 transition hover:border-mint/60 hover:shadow-subtle">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className={category.className}>{category.label}</span>
        <span className={metaText}>{post?.author || "연구원"} · {post?.time || "방금 전"}</span>
      </div>
      <Link to={`/posts/${post?.id || ""}`} aria-label={`${post?.title || "게시글"} 상세 보기`}>
        <h3 className={cn(h3, "transition hover:text-mint-dark")}>{post?.title || "게시글 제목"}</h3>
      </Link>
      <p className={cardCopy}>{post?.summary || "게시글 요약과 작성자 정보를 표시할 영역입니다."}</p>
      <footer className="flex flex-wrap items-center justify-between gap-3">
        <div className={tagRow}>
          {(post?.tags || ["실패해결"]).slice(0, 4).map((tag: string) => (
            <TagBadge key={tag} label={tag} />
          ))}
        </div>
        <span className="text-base font-medium text-muted">댓글 {post?.comments ?? 0}</span>
      </footer>
    </article>
  );
}
