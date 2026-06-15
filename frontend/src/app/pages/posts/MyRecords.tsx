
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { BookOpen, FolderGit2, Globe, Lock, MessageSquare, Search, Wrench } from "lucide-react";
import { getMyPosts, type PostListApiItem } from "../../api/posts";
import { resolveApiAssetUrl } from "../../api/client";
import { Badge } from "../../components/ui/Badge";
import { Card, CardContent } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { categories, type CategorySlug } from "../../constants/categories";

type CategoryFilter = "all" | CategorySlug;
type VisibilityFilter = "all" | "public" | "private";

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

export function MyRecords() {
  // 내 기록 화면은 카테고리, 공개 여부, 검색어를 각각 state로 관리합니다.
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [visibilityFilter, setVisibilityFilter] = useState<VisibilityFilter>("all");
  const [keyword, setKeyword] = useState("");
  const [allRecords, setAllRecords] = useState<PostListApiItem[]>([]);
  const [records, setRecords] = useState<PostListApiItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let isActive = true;

    async function loadAllRecords() {
      try {
        const data = await getMyPosts({ page: 1, size: 50, visibility: "all" });

        if (isActive) {
          setAllRecords(data.items);
        }
      } catch {
        if (isActive) {
          setLoadError("내 기록 통계를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.");
        }
      }
    }

    void loadAllRecords();

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    let isActive = true;

    async function loadRecords() {
      setIsLoading(true);
      setLoadError("");

      try {
        const data = await getMyPosts({
          category: categoryFilter === "all" ? undefined : categoryFilter,
          keyword: keyword.trim() || undefined,
          visibility: visibilityFilter,
          page: 1,
          size: 50,
        });

        if (isActive) {
          setRecords(data.items);
        }
      } catch {
        if (isActive) {
          setRecords([]);
          setLoadError("내 기록 목록을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.");
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    void loadRecords();

    return () => {
      isActive = false;
    };
  }, [categoryFilter, keyword, visibilityFilter]);

  const statCards = [
    { label: "전체 기록", value: allRecords.length, icon: BookOpen, color: "text-blue-500" },
    { label: "트러블슈팅", value: allRecords.filter((post) => post.categorySlug === "troubleshooting").length, icon: Wrench, color: "text-orange-500" },
    { label: "회고/면접", value: allRecords.filter((post) => ["retrospective", "interview"].includes(post.categorySlug)).length, icon: MessageSquare, color: "text-purple-500" },
    { label: "포트폴리오", value: allRecords.filter((post) => post.categorySlug === "portfolio").length, icon: FolderGit2, color: "text-emerald-500" },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">내 기록</h1>
        <p className="mt-1 text-slate-500">내가 작성한 학습 기록과 포트폴리오 자료를 관리합니다.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {statCards.map((item) => (
          <Card key={item.label}>
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="text-xs text-slate-500">{item.label}</p>
                <p className="mt-1 text-xl font-bold text-slate-900">{item.value}</p>
              </div>
              <item.icon className={`h-5 w-5 ${item.color}`} />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="space-y-4 p-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="제목, 요약, 태그 검색"
              className="bg-white pl-9"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {[{ slug: "all", label: "전체" }, ...categories].map((category) => (
              <button
                key={category.slug}
                type="button"
                onClick={() => setCategoryFilter(category.slug as CategoryFilter)}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
                  categoryFilter === category.slug
                    ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                    : "border-slate-200 bg-white text-slate-600"
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { value: "all", label: "전체 공개 범위" },
              { value: "public", label: "공개" },
              { value: "private", label: "비공개" },
            ].map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setVisibilityFilter(item.value as VisibilityFilter)}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
                  visibilityFilter === item.value
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-200 bg-white text-slate-600"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
          <p className="text-xs text-slate-400">내가 작성한 글만 모아 확인하고 공개 범위별로 관리할 수 있습니다.</p>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {isLoading && (
          <Card>
            <CardContent className="p-6 text-sm text-slate-500">내 기록을 불러오는 중입니다.</CardContent>
          </Card>
        )}

        {loadError && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-6 text-sm text-red-700">{loadError}</CardContent>
          </Card>
        )}

        {!isLoading && !loadError && records.length === 0 && (
          <Card>
            <CardContent className="p-6 text-sm text-slate-500">아직 작성한 글이 없습니다.</CardContent>
          </Card>
        )}

        {!isLoading && !loadError && records.map((post) => (
          <Link key={post.id} to={`/posts/${post.id}`} className="block rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:border-emerald-200">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <Badge variant={categoryVariant(post.category)}>{post.category}</Badge>
              <span className="flex items-center gap-1 text-xs text-slate-400">
                {post.isPublic ? <Globe className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                {post.isPublic ? "공개" : "비공개"}
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-900">{post.title}</h2>
            <p className="mt-2 line-clamp-2 text-sm text-slate-600">{post.summary}</p>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
              <span className="flex items-center gap-2 text-slate-500">
                <Avatar name={post.author} imageUrl={post.authorProfileImageUrl} />
                {post.author}
              </span>
              <span>댓글 {post.comments} · 조회 {post.views}</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span key={tag} className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-500">
                  #{tag}
                </span>
              ))}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
