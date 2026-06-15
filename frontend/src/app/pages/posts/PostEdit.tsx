
import { type FormEvent, type KeyboardEvent, useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router";
import { Lightbulb, Link as LinkIcon, Send, Sparkles } from "lucide-react";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Textarea } from "../../components/ui/Textarea";
import { createPost, getPostDetail, getPosts, updatePost, type PostListApiItem } from "../../api/posts";
import { getPortfolioProjects, type PortfolioProjectApiItem } from "../../api/portfolio";
import { categories } from "../../constants/categories";

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

  // 아래 state들은 입력값을 React가 직접 관리하는 controlled input 값입니다.
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(categories[0].label);
  const [isPublic, setIsPublic] = useState(true);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [body, setBody] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [isPostLoading, setIsPostLoading] = useState(isEditMode);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [referencePosts, setReferencePosts] = useState<PostListApiItem[]>([]);
  const [portfolioProjects, setPortfolioProjects] = useState<PortfolioProjectApiItem[]>([]);

  useEffect(() => {
    let isMounted = true;

    async function loadReferencePosts() {
      try {
        const [postData, projectData] = await Promise.all([
          getPosts({ page: 1, size: 3 }),
          getPortfolioProjects(),
        ]);

        if (isMounted) {
          setReferencePosts(postData.items);
          setPortfolioProjects(projectData.items);
        }
      } catch {
        if (isMounted) {
          setReferencePosts([]);
          setPortfolioProjects([]);
        }
      }
    }

    void loadReferencePosts();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    // 수정 화면은 URL의 id를 기준으로 백엔드에서 기존 게시글을 가져와 form state에 채운다.
    // useEffect를 쓰는 이유는 API 호출이 렌더링 이후에 일어나는 side effect이기 때문이다.
    if (!isEditMode) {
      return;
    }

    if (!id) {
      setError("수정할 게시글 id를 찾을 수 없습니다.");
      setIsPostLoading(false);
      return;
    }

    let isMounted = true;

    setIsPostLoading(true);
    setError("");

    getPostDetail(id)
      .then((post) => {
        if (!isMounted) return;

        setTitle(post.title);
        setCategory(post.category);
        setIsPublic(post.isPublic);
        setTags(post.tags);
        setBody(post.content);
        setGithubUrl(post.relatedGitHubUrl ?? "");
      })
      .catch((loadError) => {
        if (!isMounted) return;
        setError(loadError instanceof Error ? loadError.message : "게시글을 불러오지 못했습니다.");
      })
      .finally(() => {
        if (!isMounted) return;
        setIsPostLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id, isEditMode]);

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

    const selectedCategory = categories.find((item) => item.label === category);

    if (!selectedCategory) {
      setError("카테고리를 찾을 수 없습니다.");
      setNotice("");
      return;
    }

    const payload = {
      title: trimmedTitle,
      summary: buildSummary(trimmedBody),
      content: trimmedBody,
      categorySlug: selectedCategory.slug,
      tags,
      isPublic,
      relatedGitHubUrl: githubUrl.trim() || undefined,
    };

    setIsSubmitting(true);
    setError("");
    setNotice("");

    try {
      if (isEditMode) {
        if (!id) {
          throw new Error("수정할 게시글 id를 찾을 수 없습니다.");
        }

        const updatedPost = await updatePost(id, payload);

        setNotice("게시글이 수정되었습니다. 상세 화면으로 이동합니다.");
        window.setTimeout(() => navigate(`/posts/${updatedPost.id}`), 900);
        return;
      }

      const createdPost = await createPost(payload);

      setNotice("게시글이 발행되었습니다. 상세 화면으로 이동합니다.");
      // 목록/상세 화면이 API 응답 중심으로 바뀌었기 때문에 생성된 상세 화면으로 바로 이동할 수 있다.
      window.setTimeout(() => navigate(`/posts/${createdPost.id}`), 900);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "게시글을 저장하지 못했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mx-auto flex max-w-6xl flex-col gap-6 lg:flex-row">
      <div className="flex-1 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{isEditMode ? "게시글 수정" : "새 게시글 작성"}</h1>
            <p className="mt-1 text-sm text-slate-500">
              학습 기록과 해결 과정을 남기고, 관련 GitHub repo를 함께 연결할 수 있습니다.
            </p>
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting || isPostLoading}>
              <Send className="mr-2 h-4 w-4" />
              {isSubmitting ? (isEditMode ? "수정 중" : "발행 중") : isEditMode ? "수정 완료" : "발행하기"}
            </Button>
          </div>
        </div>

        {isPostLoading && (
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            기존 게시글을 불러오는 중입니다.
          </div>
        )}

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

          <div className="space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <LinkIcon className="h-4 w-4 text-slate-400" />
              관련 GitHub repo
            </div>
            <div className="grid gap-3 md:grid-cols-[260px_1fr]">
              <select
                value={portfolioProjects.some((project) => project.githubUrl === githubUrl) ? githubUrl : ""}
                onChange={(event) => setGithubUrl(event.target.value)}
                className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="">등록된 프로젝트 선택</option>
                {portfolioProjects.map((project) => (
                  <option key={project.id} value={project.githubUrl}>
                    {project.repoFullName}
                  </option>
                ))}
              </select>
              <Input
                value={githubUrl}
                onChange={(event) => setGithubUrl(event.target.value)}
                placeholder="https://github.com/username/repository"
                className="bg-white"
              />
            </div>
            <p className="text-xs text-slate-500">
              이 repo URL은 포트폴리오 정리와 GitHub 정보 분석에 활용됩니다.
            </p>
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
            <p className="mb-3 text-xs text-slate-500">작성 중인 내용과 어울리는 태그를 빠르게 추가해보세요.</p>
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
              최근 공개 기록
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-slate-500">최근 공개 기록을 참고해 비슷한 주제의 글 흐름을 확인할 수 있습니다.</p>
            {referencePosts.map((post) => (
              <Link
                key={post.id}
                to={`/posts/${post.id}`}
                className="block rounded-md border border-transparent p-2 transition-colors hover:border-slate-200 hover:bg-slate-50"
              >
                <p className="line-clamp-1 text-sm font-medium text-slate-800">{post.title}</p>
                <p className="mt-1 text-xs text-slate-400">{post.category}</p>
              </Link>
            ))}
            {referencePosts.length === 0 && <p className="text-xs text-slate-400">참고할 공개 기록이 아직 없습니다.</p>}
          </CardContent>
        </Card>
      </aside>
    </form>
  );
}
