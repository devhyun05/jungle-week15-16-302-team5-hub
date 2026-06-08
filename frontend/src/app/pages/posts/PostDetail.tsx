
import { useState } from "react";
import { Link, useNavigate, useOutletContext, useParams } from "react-router";
import { FileText, Github, Globe, Lightbulb, Lock, MessageSquare, Trash2 } from "lucide-react";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card, CardContent } from "../../components/ui/Card";
import { posts } from "../../data/mockData";
import type { MainLayoutContext } from "../../layouts/MainLayout";

type CommentItem = {
  id: string;
  author: string;
  role: "STUDENT" | "COACH";
  createdAt: string;
  content: string;
};

function categoryVariant(category: string) {
  if (category === "트러블슈팅") return "warning";
  if (category === "면접 질문") return "success";
  if (category === "포트폴리오 관리") return "outline";
  return "secondary";
}

export function PostDetail() {
  // /posts/:id의 id 값을 읽어서 mock posts 중 해당 글을 찾습니다.
  const { id } = useParams();
  const navigate = useNavigate();
  const { role } = useOutletContext<MainLayoutContext>();
  const post = posts.find((item) => String(item.id) === id);

  // 삭제 확인, 안내 문구, 댓글 입력은 아직 서버가 아닌 local state로만 관리합니다.
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [deleteNotice, setDeleteNotice] = useState("");
  const [commentInput, setCommentInput] = useState("");
  const [commentError, setCommentError] = useState("");
  const [comments, setComments] = useState<CommentItem[]>([
    {
      id: "comment-coach-1",
      author: "이코치",
      role: "COACH",
      createdAt: "2026.06.05 15:00",
      content: "문제 해결 과정과 배운 점을 더 구체적으로 작성하면 포트폴리오 자료로 쓰기 좋겠습니다.",
    },
  ]);

  if (!post) {
    // URL id와 맞는 mock 게시글이 없을 때 보여주는 안전 화면입니다.
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-xl items-center justify-center">
        <Card className="w-full">
          <CardContent className="p-8 text-center">
            <h1 className="text-xl font-bold text-slate-900">게시글을 찾을 수 없습니다</h1>
            <p className="mt-2 text-sm text-slate-500">요청한 id에 해당하는 mock 게시글이 없습니다.</p>
            <Button asChild className="mt-5">
              <Link to="/posts">전체 게시글로 이동</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleDelete = () => {
    // TODO backend: 실제 게시글 삭제 API는 백엔드 연결 후 구현 예정.
    setDeleteNotice("mock으로 삭제되었습니다. 게시글 목록으로 이동합니다.");
    window.setTimeout(() => navigate("/posts"), 700);
  };

  const addComment = () => {
    if (!commentInput.trim()) {
      setCommentError("댓글 내용을 입력해주세요.");
      return;
    }

    // TODO backend: 실제 댓글 저장 API는 백엔드 연결 후 구현 예정.
    // 지금은 현재 상세 화면의 comments state에만 댓글을 추가합니다.
    setComments((prev) => [
      ...prev,
      {
        id: `comment-local-${Date.now()}`,
        author: role === "COACH" ? "이코치" : "김정글",
        role,
        createdAt: "방금 전",
        content: commentInput.trim(),
      },
    ]);
    setCommentInput("");
    setCommentError("");
  };

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

          {role === "STUDENT" ? (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link to={`/posts/${post.id}/edit`}>수정</Link>
              </Button>
              <Button type="button" variant="outline" size="sm" className="text-red-600 hover:bg-red-50" onClick={() => setIsDeleteConfirmOpen(true)}>
                <Trash2 className="mr-1 h-3 w-3" />
                삭제
              </Button>
            </div>
          ) : (
            <Button variant="outline" size="sm" asChild>
              <Link to="/coach-review">리뷰 인박스</Link>
            </Button>
          )}
        </div>

        {isDeleteConfirmOpen && (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm font-semibold text-red-700">이 게시글을 삭제할까요?</p>
            <p className="mt-1 text-xs text-red-600">현재는 mock 삭제라 실제 데이터는 지워지지 않습니다.</p>
            <div className="mt-3 flex gap-2">
              <Button type="button" variant="destructive" size="sm" onClick={handleDelete}>
                삭제 확인
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={() => setIsDeleteConfirmOpen(false)}>
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
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-xs text-emerald-700">
                {post.author.slice(0, 1)}
              </div>
              {post.author}
            </div>
            <span>·</span>
            <span>{post.createdAt}</span>
          </div>
          <div className="text-xs text-slate-400">
            조회 {post.views} · 댓글 {comments.length}
          </div>
        </div>

        <p className="mt-6 rounded-lg bg-slate-50 p-4 text-sm leading-6 text-slate-700">{post.summary}</p>

        <div className="prose prose-slate max-w-none py-6">
          {post.contentSections.map((section) => (
            <section key={section.heading}>
              <h3>{section.heading}</h3>
              <p>{section.body}</p>
              {section.code && (
                <pre className="overflow-x-auto rounded-md bg-slate-900 p-4 text-sm text-slate-50">
                  <code>{section.code}</code>
                </pre>
              )}
            </section>
          ))}
        </div>

        <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-6">
          {post.tags.map((tag) => (
            <Badge key={tag} variant="secondary">
              #{tag}
            </Badge>
          ))}
        </div>
      </article>

      {post.relatedCommit && (
        <Card className="border-slate-200 bg-slate-50">
          <CardContent className="flex items-center justify-between gap-4 p-4">
            <div className="flex items-center gap-3">
              <Github className="h-5 w-5 text-slate-700" />
              <div>
                <p className="text-sm font-medium text-slate-900">관련 커밋</p>
                <p className="text-xs text-slate-500">{post.relatedCommit}</p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              GitHub 보기
            </Button>
          </CardContent>
        </Card>
      )}

      <section className="rounded-xl border border-emerald-100 bg-emerald-50 p-5">
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-emerald-900">
          <Lightbulb className="h-4 w-4 text-emerald-600" />
          AI가 추천하는 관련 기록
        </h3>
        <ul className="space-y-2 text-sm">
          {posts
            .filter((item) => item.id !== post.id)
            .slice(0, 2)
            .map((item) => (
              <li key={item.id}>
                <Link to={`/posts/${item.id}`} className="flex items-center gap-2 text-emerald-700 hover:underline">
                  <FileText className="h-3 w-3" />
                  {item.title}
                </Link>
              </li>
            ))}
        </ul>
        <p className="mt-3 text-xs text-emerald-700">실제 유사 기록 추천은 RAG 연결 후 구현 예정입니다.</p>
      </section>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-6">
          <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900">
            <MessageSquare className="h-5 w-5" />
            댓글 및 코치 피드백 <span className="text-emerald-600">{comments.length}</span>
          </h3>
        </div>

        <div className="divide-y divide-slate-100">
          {comments.map((comment) => (
            <div key={comment.id} className={comment.role === "COACH" ? "bg-indigo-50/30 p-6" : "bg-white p-6"}>
              <div className="mb-2 flex items-center gap-2">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                    comment.role === "COACH" ? "bg-indigo-100 text-indigo-700" : "bg-emerald-100 text-emerald-700"
                  }`}
                >
                  {comment.author.slice(0, 1)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900">{comment.author}</span>
                    <Badge variant={comment.role === "COACH" ? "success" : "secondary"} className="text-[10px]">
                      {comment.role}
                    </Badge>
                  </div>
                  <span className="text-xs text-slate-500">{comment.createdAt}</span>
                </div>
              </div>
              <p className="mt-2 text-sm text-slate-700">{comment.content}</p>
            </div>
          ))}

          <div className="p-6">
            <div className="flex gap-4">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-600">
                {role === "COACH" ? "C" : "S"}
              </div>
              <div className="flex-1 space-y-2">
                <textarea
                  value={commentInput}
                  onChange={(event) => setCommentInput(event.target.value)}
                  className="h-24 w-full resize-none rounded-lg border border-slate-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="댓글을 남겨보세요."
                />
                {commentError && <p className="text-xs text-red-600">{commentError}</p>}
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs text-slate-400">실제 댓글 저장 API는 백엔드 연결 후 구현 예정입니다.</p>
                  <Button type="button" size="sm" onClick={addComment}>
                    댓글 작성
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
