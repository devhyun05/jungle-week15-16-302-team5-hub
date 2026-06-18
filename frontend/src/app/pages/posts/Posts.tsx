
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { Eye, Lock, MessageCircle, Search } from "lucide-react";
import { Badge } from "../../components/ui/Badge";
import { Input } from "../../components/ui/Input";
import { resolveApiAssetUrl } from "../../api/client";
import { getPosts, type PostListApiItem } from "../../api/posts";
import { categories, type CategorySlug } from "../../constants/categories";

const categoryTabs = [{ slug: "all", label: "전체" }, ...categories] as const;

function categoryVariant(category: string) {
  if (category === "트러블슈팅") return "warning";
  if (category === "면접 질문") return "success";
  if (category === "포트폴리오 관리") return "outline";
  return "secondary";
}

function Avatar({ name, imageUrl }: { name: string; imageUrl?: string | null }) {
  const resolvedImageUrl = resolveApiAssetUrl(imageUrl);

  if (resolvedImageUrl) {
    return <img src={resolvedImageUrl} alt={`${name} 프로필`} className="h-6 w-6 rounded-full object-cover" />;
  }

  return (
    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-xs font-semibold text-emerald-700">
      {name.slice(0, 1)}
    </div>
  );
}

export function Posts() {
  // category는 URL query string에 저장해서 /posts?category=... 형태로 공유할 수 있게 합니다.
  const [searchParams, setSearchParams] = useSearchParams();
  const [keyword, setKeyword] = useState("");
  const [postItems, setPostItems] = useState<PostListApiItem[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const selectedCategory = searchParams.get("category") ?? "all";

  useEffect(() => {
    let isActive = true;

    async function loadPosts() {
      setIsLoading(true);
      setLoadError("");

      try {
        const data = await getPosts({
          category: selectedCategory === "all" ? undefined : selectedCategory,
          keyword: keyword.trim() || undefined,
          page: 1,
          size: 50,
        });

        if (!isActive) {
          return;
        }

        setPostItems(data.items);
        setTotal(data.total);
      } catch {
        if (isActive) {
          setLoadError("게시글 목록을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.");
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    void loadPosts();

    return () => {
      isActive = false;
    };
  }, [keyword, selectedCategory]);

  const selectCategory = (slug: "all" | CategorySlug) => {
    // 탭을 누르면 state가 아니라 URL query string을 바꿔서 필터 상태를 표현합니다.
    if (slug === "all") setSearchParams({});
    else setSearchParams({ category: slug });
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">전체 게시글</h1>
          <p className="mt-1 text-slate-500">학습 로그, 트러블슈팅, 회고, 면접 질문을 한 곳에서 확인합니다.</p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="제목, 태그, 작성자 검색"
            className="bg-white pl-9"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {categoryTabs.map((category) => {
          const isActive = selectedCategory === category.slug;
          return (
            <button
              key={category.slug}
              type="button"
              onClick={() => selectCategory(category.slug as "all" | CategorySlug)}
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                isActive
                  ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              {category.label}
            </button>
          );
        })}
      </div>

      <p className="text-xs text-slate-400">검색어와 카테고리를 바꾸면 공개 게시글 목록이 갱신됩니다.</p>

      <div className="space-y-3">
        {isLoading && (
          <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
            게시글 목록을 불러오는 중입니다.
          </div>
        )}

        {loadError && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-10 text-center text-sm text-red-700">
            {loadError}
          </div>
        )}

        {!isLoading && !loadError && postItems.map((post) => (
          <Link
            key={post.id}
            to={`/posts/${post.id}`}
            className="block rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-colors hover:border-emerald-200 hover:bg-emerald-50/30"
          >
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={categoryVariant(post.category)}>{post.category}</Badge>
                {!post.isPublic && (
                  <Badge variant="outline" className="gap-1">
                    <Lock className="h-3 w-3" />
                    비공개
                  </Badge>
                )}
              </div>
              <span className="text-xs text-slate-400">{new Date(post.createdAt).toLocaleDateString("ko-KR")}</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900">{post.title}</h2>
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">{post.summary}</p>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-500">
                    #{tag}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-400">
                <span className="flex items-center gap-2 text-slate-500">
                  <Avatar name={post.author} imageUrl={post.authorProfileImageUrl} />
                  {post.author}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  {post.views}
                </span>
                <span className="flex items-center gap-1">
                  <MessageCircle className="h-3 w-3" />
                  {post.comments}
                </span>
              </div>
            </div>
          </Link>
        ))}

        {!isLoading && !loadError && postItems.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
            조건에 맞는 게시글이 없습니다.
          </div>
        )}
      </div>

      {!isLoading && !loadError && postItems.length > 0 && (
        <p className="text-right text-xs text-slate-400">총 {total}개의 게시글을 불러왔습니다.</p>
      )}
    </div>
  );
}
