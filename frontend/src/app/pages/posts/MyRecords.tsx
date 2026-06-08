
import { useMemo, useState } from "react";
import { Link } from "react-router";
import { BookOpen, FolderGit2, Globe, Lock, MessageSquare, Search, Wrench } from "lucide-react";
import { Badge } from "../../components/ui/Badge";
import { Card, CardContent } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { categories, posts, type CategorySlug } from "../../data/mockData";

type CategoryFilter = "all" | CategorySlug;
type VisibilityFilter = "all" | "public" | "private";

function categoryVariant(category: string) {
  if (category === "트러블슈팅") return "warning";
  if (category === "면접 질문") return "success";
  if (category === "포트폴리오 관리") return "outline";
  return "secondary";
}

export function MyRecords() {
  // 내 기록 화면은 카테고리, 공개 여부, 검색어를 각각 state로 관리합니다.
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [visibilityFilter, setVisibilityFilter] = useState<VisibilityFilter>("all");
  const [keyword, setKeyword] = useState("");

  // 전체 mock posts 중 현재 필터 조건에 맞는 기록만 화면에 보여줍니다.
  const filteredRecords = useMemo(
    () =>
      posts.filter((post) => {
        const categoryMatch = categoryFilter === "all" || post.categorySlug === categoryFilter;
        const visibilityMatch =
          visibilityFilter === "all" || (visibilityFilter === "public" ? post.isPublic : !post.isPublic);
        const query = keyword.trim().toLowerCase();
        const keywordMatch =
          !query ||
          post.title.toLowerCase().includes(query) ||
          post.summary.toLowerCase().includes(query) ||
          post.tags.some((tag) => tag.toLowerCase().includes(query));

        return categoryMatch && visibilityMatch && keywordMatch;
      }),
    [categoryFilter, keyword, visibilityFilter],
  );

  const statCards = [
    { label: "전체 기록", value: posts.length, icon: BookOpen, color: "text-blue-500" },
    { label: "트러블슈팅", value: posts.filter((post) => post.categorySlug === "troubleshooting").length, icon: Wrench, color: "text-orange-500" },
    { label: "회고/면접", value: posts.filter((post) => ["retrospective", "interview"].includes(post.categorySlug)).length, icon: MessageSquare, color: "text-purple-500" },
    { label: "포트폴리오", value: posts.filter((post) => post.categorySlug === "portfolio").length, icon: FolderGit2, color: "text-emerald-500" },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
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
          <p className="text-xs text-slate-400">실제 내 기록 조회와 검색 API는 백엔드 연결 후 구현 예정입니다.</p>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {filteredRecords.map((post) => (
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
