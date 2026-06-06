import { Link } from "react-router-dom";
import TagBadge from "./TagBadge.jsx";

export default function PostCard({ post }) {
  // TODO: 게시글 유형, 댓글 수, AI 진단 여부, 대표 태그를 카드에 표시한다.
  return (
    <article className="post-card">
      <Link to={`/posts/${post?.id || ""}`}>
        <h3>{post?.title || "게시글 제목"}</h3>
      </Link>
      <p>{post?.summary || "게시글 요약과 작성자 정보를 표시할 영역입니다."}</p>
      <div className="tag-row">
        {(post?.tags || ["실패해결"]).map((tag) => (
          <TagBadge key={tag} label={tag} />
        ))}
      </div>
    </article>
  );
}
