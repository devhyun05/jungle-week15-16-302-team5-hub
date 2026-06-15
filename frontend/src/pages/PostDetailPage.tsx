import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { createComment, deleteComment, fetchComments, updateComment } from "../api/comments";
import { deletePost, fetchPost } from "../api/posts";
import TagBadge from "../components/TagBadge";
import type { Comment, CommentListResponse, Post, PostType } from "../types";
import {
  articleH1,
  badgeBase,
  badgeTone,
  button,
  cn,
  featureLinkTone,
  ghostButton,
  h2,
  h3,
  iconBase,
  iconTone,
  meta,
  muted,
  pageHeader,
  pageStack,
  surfaceCard,
  tagRow,
  textarea,
} from "../styles/ui";

const categoryMeta: Record<PostType, { label: string; className: string }> = {
  recipe: { label: "레시피 공유", className: cn(badgeBase, badgeTone.mint) },
  failure: { label: "실패 질문", className: cn(badgeBase, badgeTone.coral) },
  review: { label: "후기", className: cn(badgeBase, badgeTone.lavender) },
  general: { label: "일반", className: cn(badgeBase, badgeTone.mint) },
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function PostDetailPage() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [comment, setComment] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editingContent, setEditingContent] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const category = useMemo(
    () => post ? categoryMeta[post.post_type] : categoryMeta.failure,
    [post],
  );

  async function loadDetail() {
    if (!postId) {
      return;
    }
    setIsLoading(true);
    setMessage("");
    try {
      const [postResponse, commentsResponse] = await Promise.all([
        fetchPost<Post>(postId),
        fetchComments<CommentListResponse>(postId),
      ]);
      setPost(postResponse);
      setComments(commentsResponse.items);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "게시글을 불러오지 못했습니다.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadDetail();
  }, [postId]);

  async function handleCommentSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!postId || !comment.trim()) {
      return;
    }
    setMessage("");
    try {
      await createComment(postId, { content: comment });
      setComment("");
      await loadDetail();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "댓글 작성에 실패했습니다.");
    }
  }

  async function handlePostDelete() {
    if (!postId || !confirm("게시글을 삭제할까요?")) {
      return;
    }
    try {
      await deletePost(postId);
      navigate("/posts");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "게시글 삭제에 실패했습니다.");
    }
  }

  async function handleCommentUpdate(commentId: number) {
    if (!editingContent.trim()) {
      return;
    }
    try {
      await updateComment(commentId, { content: editingContent });
      setEditingCommentId(null);
      setEditingContent("");
      await loadDetail();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "댓글 수정에 실패했습니다.");
    }
  }

  async function handleCommentDelete(commentId: number) {
    if (!confirm("댓글을 삭제할까요?")) {
      return;
    }
    try {
      await deleteComment(commentId);
      await loadDetail();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "댓글 삭제에 실패했습니다.");
    }
  }

  if (isLoading) {
    return <p className={muted}>게시글을 불러오는 중입니다.</p>;
  }

  if (!post) {
    return (
      <section className={pageStack}>
        <Link className="text-base font-bold text-mint-dark" to="/posts">게시판으로 돌아가기</Link>
        <div className={surfaceCard}>
          <p className="font-bold text-ink">게시글을 찾을 수 없습니다.</p>
          {message && <p className={muted}>{message}</p>}
        </div>
      </section>
    );
  }

  return (
    <section className={pageStack}>
      <Link className="text-base font-bold text-mint-dark" to="/posts">게시판으로 돌아가기</Link>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div>
          <article className="grid gap-6 rounded-md border border-line bg-white p-5 shadow-subtle md:p-8">
            <div className={pageHeader}>
              <div className="flex flex-wrap items-center gap-2.5">
                <span className={category.className}>{category.label}</span>
                <span className={meta}>{formatDate(post.created_at)}</span>
              </div>
              <h1 className={articleH1}>{post.title}</h1>
              <div className="flex items-start gap-2.5">
                <span className={cn(iconBase, iconTone.mint)}>{post.author.nickname.slice(0, 1)}</span>
                <p className={meta}><strong className="text-ink">{post.author.nickname}</strong><br />{post.author.email}</p>
              </div>
            </div>
            <div className={tagRow}>
              {post.tags.length ? post.tags.map((tag) => <TagBadge key={tag} label={tag} />) : <TagBadge label="태그없음" />}
            </div>
            {post.slime_type && <p className={muted}><strong>슬라임 종류</strong> {post.slime_type}</p>}
            {post.image_url && (
              <figure className="overflow-hidden rounded-md border border-line bg-page">
                <img
                  className="max-h-[560px] w-full object-contain"
                  src={post.image_url}
                  alt={`${post.title} 슬라임 사진`}
                />
              </figure>
            )}
            <div className="grid gap-4 whitespace-pre-wrap border-y border-line py-6 text-[18px] leading-8 text-ink">
              {post.content}
            </div>
            {post.is_owner && (
              <footer className="flex items-center justify-end gap-2.5">
                <Link className={ghostButton} to={`/posts/${post.id}/edit`}>수정</Link>
                <button className={ghostButton} type="button" onClick={handlePostDelete}>삭제</button>
              </footer>
            )}
          </article>

          <section className="mt-4 grid gap-5 rounded-md border border-line bg-white p-5 shadow-subtle md:p-6">
            <h2 className={h2}>댓글 {comments.length}개</h2>
            {message && <p className="rounded-md border border-coral/20 bg-orange-50 p-3 text-base font-bold text-coral">{message}</p>}
            <div className="grid gap-5">
              {comments.map((item, index) => (
                <div className="flex items-start gap-3 border-b border-line pb-5 last:border-b-0 last:pb-0" key={item.id}>
                  <span className={cn(iconBase, index % 2 === 0 ? iconTone.lavender : iconTone.mint)}>
                    {item.author.nickname.slice(0, 1)}
                  </span>
                  <div className="grid flex-1 gap-2">
                    <p><strong>{item.author.nickname}</strong> <span className={meta}>{formatDate(item.created_at)}</span></p>
                    {editingCommentId === item.id ? (
                      <div className="grid gap-2">
                        <textarea className={textarea} value={editingContent} onChange={(event) => setEditingContent(event.target.value)} />
                        <div className="flex gap-2">
                          <button className={button} type="button" onClick={() => handleCommentUpdate(item.id)}>저장</button>
                          <button className={ghostButton} type="button" onClick={() => setEditingCommentId(null)}>취소</button>
                        </div>
                      </div>
                    ) : (
                      <p className={muted}>{item.content}</p>
                    )}
                    {item.is_owner && editingCommentId !== item.id && (
                      <div className="flex gap-2">
                        <button
                          className={cn("text-base font-bold", featureLinkTone.mint)}
                          type="button"
                          onClick={() => {
                            setEditingCommentId(item.id);
                            setEditingContent(item.content);
                          }}
                        >
                          수정
                        </button>
                        <button className={cn("text-base font-bold", featureLinkTone.coral)} type="button" onClick={() => handleCommentDelete(item.id)}>
                          삭제
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <form className="grid gap-3" onSubmit={handleCommentSubmit}>
              <textarea className={textarea} aria-label="댓글 입력" placeholder="도움이 되는 댓글을 남겨주세요." value={comment} onChange={(event) => setComment(event.target.value)} />
              <button className={button} type="submit">댓글 등록</button>
            </form>
          </section>
        </div>

        <aside className="grid content-start gap-4 lg:sticky lg:top-24">
          <section className={cn(surfaceCard, "grid gap-4")}>
            <div>
              <span className={cn(badgeBase, badgeTone.coral)}>AI Agent</span>
              <h3 className={cn(h3, "mt-2")}>진단 흐름</h3>
            </div>
            {["게시글과 댓글 내용을 함께 참고합니다.", "Agent가 비슷한 사례와 도구 결과를 함께 확인합니다.", "결과에서 해결 순서와 추천 태그를 확인합니다."].map((title) => (
              <div className="flex items-start gap-2.5" key={title}>
                <span className={cn(badgeBase, badgeTone.mint)}>흐름</span>
                <p className={muted}>{title}</p>
              </div>
            ))}
            <Link className={ghostButton} to="/agent">Agent에서 확인하기</Link>
          </section>
        </aside>
      </div>
    </section>
  );
}
