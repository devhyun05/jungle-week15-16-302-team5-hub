
import { type FormEvent, type KeyboardEvent, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router";
import { Lightbulb, Link as LinkIcon, Save, Send, Sparkles } from "lucide-react";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Textarea } from "../../components/ui/Textarea";
import { createPost } from "../../api/posts";
import { categories, posts } from "../../data/mockData";

function bodyFromPost(postId?: string) {
  // 수정 화면에서는 기존 mock 게시글의 section들을 하나의 textarea 본문으로 합칩니다.
  const post = posts.find((item) => String(item.id) === postId);
  if (!post) return "";

  return post.contentSections
    .map((section) => {
      const code = section.code ? `\n\n\`\`\`\n${section.code}\n\`\`\`` : "";
      return `## ${section.heading}\n${section.body}${code}`;
    })
    .join("\n\n");
}

function buildSummary(content: string) {
  // 목록 카드에 보여줄 짧은 요약을 본문 앞부분으로 만든다.
  // 나중에 백엔드/AI 요약 기능이 붙으면 이 로직은 서버 응답으로 대체될 수 있다.
  return content.replace(/\s+/g, " ").trim().slice(0, 150);
}

export function PostEdit() {
  // /posts/new와 /posts/:id/edit이 같은 컴포넌트를 공유하기 때문에 URL로 작성/수정 모드를 구분합니다.
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const isEditMode = location.pathname.includes("/edit");
  const existingPost = posts.find((post) => String(post.id) === id);

  // 아래 state들은 입력값을 React가 직접 관리하는 controlled input 값입니다.
  const [title, setTitle] = useState(isEditMode ? existingPost?.title ?? "" : "");
  const [category, setCategory] = useState(isEditMode ? existingPost?.category ?? categories[0].label : categories[0].label);
  const [isPublic, setIsPublic] = useState(isEditMode ? existingPost?.isPublic ?? true : true);
  const [tags, setTags] = useState<string[]>(isEditMode ? existingPost?.tags ?? ["FastAPI", "JWT"] : []);
  const [tagInput, setTagInput] = useState("");
  const [body, setBody] = useState(isEditMode ? bodyFromPost(id) : "");
  const [githubUrl, setGithubUrl] = useState(isEditMode ? existingPost?.relatedCommit ?? "" : "");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddTag = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && tagInput.trim()) {
      event.preventDefault();
      if (!tags.includes(tagInput.trim())) setTags((prev) => [...prev, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    const trimmedTitle = title.trim();
    const trimmedBody = body.trim();

    if (!trimmedTitle || !trimmedBody) {
      setError("제목과 본문을 입력해주세요.");
      setNotice("");
      return;
    }

    if (isEditMode) {
      // TODO backend: 게시글 수정 PATCH API는 다음 CRUD 단계에서 구현 예정.
      setError("");
      setNotice("mock으로 수정되었습니다. 상세 화면으로 이동합니다.");
      window.setTimeout(() => navigate(`/posts/${id ?? existingPost?.id ?? 1}`), 700);
      return;
    }

    const selectedCategory = categories.find((item) => item.label === category);

    if (!selectedCategory) {
      setError("카테고리를 찾을 수 없습니다.");
      setNotice("");
      return;
    }

    setIsSubmitting(true);
    setError("");
    setNotice("");

    try {
      const createdPost = await createPost({
        title: trimmedTitle,
        summary: buildSummary(trimmedBody),
        content: trimmedBody,
        categorySlug: selectedCategory.slug,
        tags,
        isPublic,
        relatedCommit: githubUrl.trim() || undefined,
      });

      setNotice(`백엔드에 게시글이 발행되었습니다. 생성된 게시글 id: ${createdPost.id}`);
      // 목록/상세 화면이 API 응답 중심으로 바뀌었기 때문에 생성된 상세 화면으로 바로 이동할 수 있다.
      window.setTimeout(() => navigate(`/posts/${createdPost.id}`), 900);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "게시글을 저장하지 못했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const saveDraft = () => {
    // TODO backend: 실제 임시저장 API는 백엔드 연결 후 구현 예정.
    setError("");
    setNotice("mock으로 임시저장되었습니다. 새로고침하면 유지되지는 않습니다.");
  };

  return (
    <form onSubmit={handleSubmit} className="mx-auto flex max-w-6xl flex-col gap-6 lg:flex-row">
      <div className="flex-1 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{isEditMode ? "게시글 수정" : "새 게시글 작성"}</h1>
            <p className="mt-1 text-sm text-slate-500">
              새 글 발행은 백엔드 API에 저장되고, 수정/임시저장은 아직 mock 단계입니다.
            </p>
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" className="text-slate-600" onClick={saveDraft}>
              <Save className="mr-2 h-4 w-4" />
              임시저장
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              <Send className="mr-2 h-4 w-4" />
              {isSubmitting ? "발행 중" : isEditMode ? "수정 완료" : "발행하기"}
            </Button>
          </div>
        </div>

        {(error || notice) && (
          <div
            className={`rounded-lg border px-4 py-3 text-sm ${
              error ? "border-red-200 bg-red-50 text-red-700" : "border-emerald-200 bg-emerald-50 text-emerald-800"
            }`}
          >
            {error || notice}
          </div>
        )}

        <Card className="space-y-6 p-6">
          <Input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="제목을 입력하세요"
            className="h-12 border-slate-200 text-xl font-semibold"
          />

          <div className="flex flex-wrap gap-4">
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="h-10 min-w-[150px] rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:ring-1 focus:ring-emerald-500"
            >
              {categories.map((item) => (
                <option key={item.slug} value={item.label}>
                  {item.label}
                </option>
              ))}
            </select>

            <div className="flex h-10 items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3">
              <span className="text-sm font-medium text-slate-600">공개 여부</span>
              <label className="relative inline-flex cursor-pointer items-center">
                <input type="checkbox" className="peer sr-only" checked={isPublic} onChange={(event) => setIsPublic(event.target.checked)} />
                <div className="peer h-5 w-9 rounded-full bg-slate-200 after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:border after:border-slate-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-emerald-500 peer-checked:after:translate-x-full peer-checked:after:border-white" />
              </label>
              <span className="w-12 text-sm text-slate-700">{isPublic ? "공개" : "비공개"}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="flex items-center gap-1 px-2 py-1">
                #{tag}
                <button
                  type="button"
                  onClick={() => setTags(tags.filter((item) => item !== tag))}
                  className="ml-1 text-slate-500 hover:text-red-500"
                  aria-label={`${tag} 태그 삭제`}
                >
                  &times;
                </button>
              </Badge>
            ))}
            <Input
              value={tagInput}
              onChange={(event) => setTagInput(event.target.value)}
              onKeyDown={handleAddTag}
              placeholder="태그 입력 후 Enter"
              className="h-8 w-44 text-sm"
            />
          </div>

          <Textarea
            value={body}
            onChange={(event) => setBody(event.target.value)}
            placeholder="본문을 작성하세요. 학습한 내용, 막힌 부분, 해결 과정, 배운 점을 정리하면 좋습니다."
            className="min-h-[400px] resize-y p-4"
          />

          <div className="flex items-center gap-2">
            <LinkIcon className="h-4 w-4 text-slate-400" />
            <Input
              value={githubUrl}
              onChange={(event) => setGithubUrl(event.target.value)}
              placeholder="관련 GitHub 저장소 URL 또는 커밋 메모"
              className="flex-1"
            />
          </div>
        </Card>
      </div>

      <aside className="w-full space-y-6 lg:w-80">
        <Card className="border-emerald-100 bg-emerald-50/50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm text-emerald-800">
              <Sparkles className="h-4 w-4" />
              AI 태그 추천
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-3 text-xs text-slate-500">작성 중인 내용 분석 태그 추천은 백엔드/AI 연결 후 구현 예정입니다.</p>
            <div className="flex flex-wrap gap-2">
              {["Authentication", "Python", "Security"].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => !tags.includes(tag) && setTags((prev) => [...prev, tag])}
                  className="rounded-full border border-emerald-200 bg-white px-2 py-1 text-xs text-emerald-700 transition-colors hover:bg-emerald-100"
                >
                  + {tag}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Lightbulb className="h-4 w-4 text-amber-500" />
              비슷한 이전 기록
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-slate-500">실제 유사 글 검색은 RAG/검색 API 연결 후 구현 예정입니다.</p>
            {posts.slice(0, 2).map((post) => (
              <Link
                key={post.id}
                to={`/posts/${post.id}`}
                className="block rounded-md border border-transparent p-2 transition-colors hover:border-slate-200 hover:bg-slate-50"
              >
                <p className="line-clamp-1 text-sm font-medium text-slate-800">{post.title}</p>
                <p className="mt-1 text-xs text-slate-400">{post.category}</p>
              </Link>
            ))}
          </CardContent>
        </Card>
      </aside>
    </form>
  );
}
