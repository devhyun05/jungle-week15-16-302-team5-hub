
import { useState, useEffect } from "react";
import { Link, useNavigate, useOutletContext, useParams } from "react-router";
import { FileText, Github, Globe, Lightbulb, Lock, MessageSquare, Trash2 } from "lucide-react";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card, CardContent } from "../../components/ui/Card";
import { createPostComment, deleteComment, getPostComments } from "../../api/comments";
import { deletePost, getPostDetail, getPosts, type PostDetailApiResponse, type PostListApiItem } from "../../api/posts";
import type { UserRole } from "../../api/auth";
import { resolveApiAssetUrl } from "../../api/client";
import type { MainLayoutContext } from "../../layouts/MainLayout";

type CommentItem = {
  id: string;
  authorId: number;
  author: string;
  authorProfileImageUrl: string | null;
  role: UserRole;
  createdAt: string;
  content: string;
};

function getRoleLabel(role: UserRole) {
  const labels: Record<UserRole, string> = {
    STUDENT: "학생",
    COACH: "코치",
    ADMIN: "관리자",
  };

  return labels[role];
}

function categoryVariant(category: string) {
  if (category === "트러블슈팅") return "warning";
  if (category === "면접 질문") return "success";
  if (category === "포트폴리오 관리") return "outline";
  return "secondary";
}

function formatDate(dateText: string) {
  return new Date(dateText).toLocaleDateString("ko-KR");
}

function isValidExternalUrl(url: string | null | undefined) {
  if (!url) {
    return false;
  }

  try {
    const parsedUrl = new URL(url);
    return parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:";
  } catch {
    return false;
  }
}

function Avatar({ name, imageUrl, className }: { name: string; imageUrl?: string | null; className: string }) {
  const resolvedImageUrl = resolveApiAssetUrl(imageUrl);

  if (resolvedImageUrl) {
    return <img src={resolvedImageUrl} alt={`${name} 프로필`} className={`${className} object-cover`} />;
  }

  return <div className={className}>{name.slice(0, 1)}</div>;
}

export function PostDetail() {
  // /posts/:id의 id 값을 읽어서 백엔드 상세 API에 전달합니다.
  const { id } = useParams();
  const navigate = useNavigate();
  const { role, user } = useOutletContext<MainLayoutContext>();

  const [post, setPost] = useState<PostDetailApiResponse | null>(null);
  const [isPostLoading, setIsPostLoading] = useState(true);
  const [postLoadError, setPostLoadError] = useState("");
  // 삭제 확인 UI는 local state로 관리하고, 실제 삭제 처리는 DELETE /posts/{id} API가 담당합니다.
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [deleteNotice, setDeleteNotice] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [commentInput, setCommentInput] = useState("");
  const [commentError, setCommentError] = useState("");
  const [commentLoadError, setCommentLoadError] = useState("");
  const [isCommentLoading, setIsCommentLoading] = useState(false);
  const [isCommentSubmitting, setIsCommentSubmitting] = useState(false);
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);
  const [commentDeleteError, setCommentDeleteError] = useState("");
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [relatedPosts, setRelatedPosts] = useState<PostListApiItem[]>([]);

  useEffect(() => {
    if (!id) {
      setIsPostLoading(false);
      setPostLoadError("게시글 id를 찾을 수 없습니다.");
      return;
    }

    const postId = id;
    let isActive = true;

    async function loadPostDetail() {
      setIsPostLoading(true);
      setPostLoadError("");

      try {
        const data = await getPostDetail(postId);

        if (!isActive) {
          return;
        }

        setPost(data);
      } catch {
        if (isActive) {
          setPost(null);
          setPostLoadError("게시글을 찾을 수 없습니다. 잠시 후 다시 시도해주세요.");
        }
      } finally {
        if (isActive) {
          setIsPostLoading(false);
        }
      }
    }

    void loadPostDetail();

    return () => {
      isActive = false;
    };
  }, [id]);

  useEffect(() => {
    if (!post) {
      setRelatedPosts([]);
      return;
    }

    let isActive = true;

    async function loadRelatedPosts() {
      try {
        const data = await getPosts({
          category: post.categorySlug,
          page: 1,
          size: 5,
        });

        if (isActive) {
          setRelatedPosts(data.items.filter((item) => item.id !== post.id).slice(0, 2));
        }
      } catch {
        if (isActive) {
          setRelatedPosts([]);
        }
      }
    }

    void loadRelatedPosts();

    return () => {
      isActive = false;
    };
  }, [post]);

  useEffect(() => {
    if (!id) {
      return;
    }

    // useParams의 id는 타입상 string | undefined다.
    // 위에서 undefined를 걸렀더라도, 중첩 async 함수 안에서는 에디터가 다시 의심할 수 있어서
    // 확정된 string 값을 postId로 따로 잡아둔다.
    const postId = id;
    let isActive = true;

    async function loadComments() {
      setIsCommentLoading(true);
      setCommentLoadError("");

      try {
        const data = await getPostComments(postId);

        if (!isActive) {
          return;
        }

        // 백엔드 응답은 authorRole이고, 화면 state는 role 이름을 사용한다.
        // 여기서 API 응답 모양을 화면에서 쓰는 CommentItem 모양으로 변환한다.
        setComments(
          data.items.map((comment) => ({
            id: String(comment.id),
            authorId: comment.authorId,
            author: comment.author,
            authorProfileImageUrl: comment.authorProfileImageUrl,
            role: comment.authorRole,
            createdAt: comment.createdAt,
            content: comment.content,
          }))
        );
      } catch {
        if (isActive) {
          setCommentLoadError("댓글을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.");
        }
      } finally {
        if (isActive) {
          setIsCommentLoading(false);
        }
      }
    }

    void loadComments();

    return () => {
      isActive = false;
    };
  }, [id]);

  if (isPostLoading) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-xl items-center justify-center">
        <Card className="w-full">
          <CardContent className="p-8 text-center">
            <h1 className="text-xl font-bold text-slate-900">게시글을 불러오는 중입니다</h1>
            <p className="mt-2 text-sm text-slate-500">백엔드 게시글 상세 API 응답을 기다리고 있습니다.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!post) {
    // URL id와 맞는 백엔드 게시글이 없을 때 보여주는 안전 화면입니다.
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-xl items-center justify-center">
        <Card className="w-full">
          <CardContent className="p-8 text-center">
            <h1 className="text-xl font-bold text-slate-900">게시글을 찾을 수 없습니다</h1>
            <p className="mt-2 text-sm text-slate-500">{postLoadError || "요청한 id에 해당하는 게시글이 없습니다."}</p>
            <Button asChild className="mt-5">
              <Link to="/posts">전체 게시글로 이동</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleDelete = async () => {
    if (!id) {
      setDeleteError("삭제할 게시글 id를 찾을 수 없습니다.");
      return;
    }

    setIsDeleting(true);
    setDeleteError("");
    setDeleteNotice("");

    try {
      await deletePost(id);
      setDeleteNotice("게시글이 삭제되었습니다. 게시글 목록으로 이동합니다.");
      window.setTimeout(() => navigate("/posts"), 700);
    } catch {
      setDeleteError("게시글을 삭제하지 못했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setIsDeleting(false);
    }
  };

  const addComment = async () => {
    const content = commentInput.trim();

    if (!content) {
      setCommentError("댓글 내용을 입력해주세요.");
      return;
    }

    if (!id) {
      setCommentError("게시글 id를 찾을 수 없습니다.");
      return;
    }

    setIsCommentSubmitting(true);
    setCommentError("");

    try {
      const savedComment = await createPostComment(id, content);

      // 백엔드 응답은 authorRole이고, 화면 state는 role 이름을 사용한다.
      // 댓글 작성 직후에는 전체 목록을 다시 받지 않고 방금 저장된 댓글만 화면 state에 추가한다.
      setComments((prev) => [
        ...prev,
        {
          id: String(savedComment.id),
          authorId: savedComment.authorId,
          author: savedComment.author,
          authorProfileImageUrl: savedComment.authorProfileImageUrl,
          role: savedComment.authorRole,
          createdAt: savedComment.createdAt,
          content: savedComment.content,
        },
      ]);
      setCommentInput("");
    } catch {
      setCommentError("댓글을 작성하지 못했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setIsCommentSubmitting(false);
    }
  };

  const removeComment = async (commentId: string) => {
    setDeletingCommentId(commentId);
    setCommentDeleteError("");

    try {
      await deleteComment(commentId);

      // 실제 DB에서는 soft delete가 되었고, 화면에서는 바로 사라진 것처럼 보여준다.
      setComments((prev) => prev.filter((comment) => comment.id !== commentId));
    } catch {
      setCommentDeleteError("댓글을 삭제하지 못했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setDeletingCommentId(null);
    }
  };

  const canManagePost = role === "ADMIN" || post.authorId === user.id;
  const hasValidGitHubUrl = isValidExternalUrl(post.relatedGitHubUrl);

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            <Badge variant={categoryVariant(post.category)}>{post.category}</Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              {post.isPublic ? <Globe className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
              {post.isPublic ? "공개" : "비공개"}
            </Badge>
          </div>

          {canManagePost ? (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link to={`/posts/${post.id}/edit`}>수정</Link>
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-red-600 hover:bg-red-50"
                onClick={() => {
                  setDeleteError("");
                  setIsDeleteConfirmOpen(true);
                }}
              >
                <Trash2 className="mr-1 h-3 w-3" />
                삭제
              </Button>
            </div>
          ) : role === "COACH" ? (
            <Button variant="outline" size="sm" asChild>
              <Link to="/coach-review">리뷰 인박스</Link>
            </Button>
          ) : (
            <Button variant="outline" size="sm" asChild>
              <Link to="/admin/users">사용자 승인</Link>
            </Button>
          )}
        </div>

        {isDeleteConfirmOpen && (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm font-semibold text-red-700">이 게시글을 삭제할까요?</p>
            <p className="mt-1 text-xs text-red-600">실제 row를 없애지 않고 deleted_at을 채우는 soft delete로 처리합니다.</p>
            {deleteError && <p className="mt-2 text-xs font-medium text-red-700">{deleteError}</p>}
            <div className="mt-3 flex gap-2">
              <Button type="button" variant="destructive" size="sm" onClick={handleDelete} disabled={isDeleting}>
                {isDeleting ? "삭제 중" : "삭제 확인"}
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={() => setIsDeleteConfirmOpen(false)} disabled={isDeleting}>
                취소
              </Button>
            </div>
          </div>
        )}

        {deleteNotice && (
          <div className="mb-5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            {deleteNotice}
          </div>
        )}

        <h1 className="mb-4 text-3xl font-bold text-slate-900">{post.title}</h1>

        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-6 text-sm text-slate-500">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 font-medium text-slate-900">
              <Avatar
                name={post.author}
                imageUrl={post.authorProfileImageUrl}
                className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-xs text-emerald-700"
              />
              {post.author}
            </div>
            <span>·</span>
            <span>{formatDate(post.createdAt)}</span>
          </div>
          <div className="text-xs text-slate-400">
            조회 {post.views} · 댓글 {comments.length}
          </div>
        </div>

        <p className="mt-6 rounded-lg bg-slate-50 p-4 text-sm leading-6 text-slate-700">{post.summary}</p>

        <div className="prose prose-slate max-w-none py-6">
          <div className="whitespace-pre-line text-sm leading-7 text-slate-700">{post.content}</div>
        </div>

        <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-6">
          {post.tags.map((tag) => (
            <Badge key={tag} variant="secondary">
              #{tag}
            </Badge>
          ))}
        </div>
      </article>

      {post.relatedGitHubUrl && (
        <Card className="border-slate-200 bg-slate-50">
          <CardContent className="flex items-center justify-between gap-4 p-4">
            <div className="flex items-center gap-3">
              <Github className="h-5 w-5 text-slate-700" />
              <div>
                <p className="text-sm font-medium text-slate-900">관련 GitHub repo</p>
                <p className="break-all text-xs text-slate-500">{post.relatedGitHubUrl}</p>
              </div>
            </div>
            {hasValidGitHubUrl ? (
              <Button variant="outline" size="sm" asChild>
                <a href={post.relatedGitHubUrl} target="_blank" rel="noreferrer">
                  GitHub 보기
                </a>
              </Button>
            ) : (
              <Button variant="outline" size="sm" disabled>
                URL 확인 필요
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      <section className="rounded-xl border border-emerald-100 bg-emerald-50 p-5">
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-emerald-900">
          <Lightbulb className="h-4 w-4 text-emerald-600" />
          AI가 추천하는 관련 기록
        </h3>
        <ul className="space-y-2 text-sm">
          {relatedPosts.map((item) => (
              <li key={item.id}>
                <Link to={`/posts/${item.id}`} className="flex items-center gap-2 text-emerald-700 hover:underline">
                  <FileText className="h-3 w-3" />
                  {item.title}
                </Link>
              </li>
            ))}
          {relatedPosts.length === 0 && <li className="text-emerald-700">같은 카테고리의 공개 기록이 아직 없습니다.</li>}
        </ul>
        <p className="mt-3 text-xs text-emerald-700">현재는 같은 카테고리의 공개 기록을 보여주며, 실제 유사도 추천은 RAG 연결 후 구현 예정입니다.</p>
      </section>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-6">
          <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900">
            <MessageSquare className="h-5 w-5" />
            댓글 및 코치 피드백 <span className="text-emerald-600">{comments.length}</span>
          </h3>
        </div>

        <div className="divide-y divide-slate-100">
          {isCommentLoading && (
            <div className="p-6 text-sm text-slate-500">댓글을 불러오는 중입니다.</div>
          )}

          {commentLoadError && (
            <div className="bg-red-50 p-6 text-sm text-red-700">{commentLoadError}</div>
          )}

          {commentDeleteError && (
            <div className="bg-red-50 p-6 text-sm text-red-700">{commentDeleteError}</div>
          )}

          {!isCommentLoading && !commentLoadError && comments.length === 0 && (
            <div className="p-6 text-sm text-slate-500">아직 등록된 댓글이 없습니다.</div>
          )}

          {comments.map((comment) => (
            <div key={comment.id} className={comment.role === "COACH" ? "bg-indigo-50/30 p-6" : "bg-white p-6"}>
              <div className="mb-2 flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Avatar
                    name={comment.author}
                    imageUrl={comment.authorProfileImageUrl}
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                      comment.role === "COACH" ? "bg-indigo-100 text-indigo-700" : "bg-emerald-100 text-emerald-700"
                    }`}
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900">{comment.author}</span>
                      <Badge variant={comment.role === "COACH" ? "success" : "secondary"} className="text-[10px]">
                        {getRoleLabel(comment.role)}
                      </Badge>
                    </div>
                    <span className="text-xs text-slate-500">{comment.createdAt}</span>
                  </div>
                </div>

                {(role === "ADMIN" || comment.authorId === user.id) && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-xs text-red-600 hover:bg-red-50"
                    onClick={() => void removeComment(comment.id)}
                    disabled={deletingCommentId === comment.id}
                  >
                    {deletingCommentId === comment.id ? "삭제 중" : "삭제"}
                  </Button>
                )}
              </div>
              <p className="mt-2 text-sm text-slate-700">{comment.content}</p>
            </div>
          ))}

          <div className="p-6">
            <div className="flex gap-4">
              <Avatar
                name={user.name}
                imageUrl={user.profileImageUrl}
                className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-600"
              />
              <div className="flex-1 space-y-2">
                <textarea
                  value={commentInput}
                  onChange={(event) => setCommentInput(event.target.value)}
                  className="h-24 w-full resize-none rounded-lg border border-slate-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="댓글을 남겨보세요."
                />
                {commentError && <p className="text-xs text-red-600">{commentError}</p>}
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs text-slate-400">댓글은 현재 로그인 사용자 이름으로 저장됩니다.</p>
                  <Button type="button" size="sm" onClick={addComment} disabled={isCommentSubmitting}>
                    {isCommentSubmitting ? "작성 중" : "댓글 작성"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
