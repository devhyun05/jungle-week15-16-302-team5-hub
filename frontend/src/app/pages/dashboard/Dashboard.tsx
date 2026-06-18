
import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useOutletContext } from "react-router";
import { Briefcase, GitCommit, MessageSquare, PenSquare, Sparkles } from "lucide-react";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import { getMyPosts, type PostListApiItem } from "../../api/posts";
import { getMyReviewRequests, type ReviewRequestApiItem } from "../../api/reviews";
import { categories } from "../../constants/categories";
import type { MainLayoutContext } from "../../layouts/MainLayout";

function formatDate(dateText: string) {
  return new Date(dateText).toLocaleDateString("ko-KR", {
    month: "2-digit",
    day: "2-digit",
  });
}

function isReviewWaiting(request: ReviewRequestApiItem) {
  return request.status !== "피드백 완료" && request.status !== "최종 확인";
}

export function Dashboard() {
  // MainLayout에서 넘긴 role로 접근 가능한 기본 화면을 나눈다.
  // 코치는 대시보드보다 리뷰 인박스가 핵심 업무 화면이므로 /coach-review로 보낸다.
  const { role } = useOutletContext<MainLayoutContext>();
  const [studentRecords, setStudentRecords] = useState<PostListApiItem[]>([]);
  const [studentReviews, setStudentReviews] = useState<ReviewRequestApiItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let isActive = true;

    async function loadDashboardData() {
      if (role === "ADMIN" || role === "COACH") {
        return;
      }

      setIsLoading(true);
      setLoadError("");

      try {
        const [recordData, reviewData] = await Promise.all([
          getMyPosts({ visibility: "all", size: 50 }),
          getMyReviewRequests(),
        ]);

        if (isActive) {
          setStudentRecords(recordData.items);
          setStudentReviews(reviewData.items);
        }
      } catch (error) {
        if (isActive) {
          setLoadError(error instanceof Error ? error.message : "대시보드 데이터를 불러오지 못했습니다.");
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    void loadDashboardData();

    return () => {
      isActive = false;
    };
  }, [role]);

  const recentRecords = studentRecords.slice(0, 3);
  const categoryCards = useMemo(
    () =>
      categories.map((category) => ({
        ...category,
        count: studentRecords.filter((post) => post.categorySlug === category.slug).length,
      })),
    [studentRecords],
  );
  const waitingStudentReviews = studentReviews.filter(isReviewWaiting);

  if (role === "ADMIN") {
    return <Navigate to="/admin/users" replace />;
  }

  if (role === "COACH") {
    return <Navigate to="/coach-review" replace />;
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <section className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div>
            <Badge variant="success">JungleLog</Badge>
            <h1 className="mt-3 text-3xl font-bold text-slate-900">오늘의 학습 기록을 남겨보세요</h1>
            <p className="mt-2 max-w-2xl text-slate-500">
              학습 로그와 트러블슈팅을 쌓아두면 나중에 포트폴리오와 면접 답변의 근거가 됩니다.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild>
              <Link to="/posts/new">
                <PenSquare className="mr-2 h-4 w-4" />
                오늘 기록 작성
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/portfolio">
                <Briefcase className="mr-2 h-4 w-4" />
                포트폴리오 관리
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-5">
        {categoryCards.map((category) => (
          <Link key={category.slug} to={`/posts?category=${category.slug}`} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:border-emerald-200">
            <category.icon className={`h-5 w-5 ${category.color}`} />
            <p className="mt-3 font-semibold text-slate-900">{category.label}</p>
            <p className="mt-1 text-xs text-slate-500">{category.count}개 기록</p>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">최근 기록</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/my-records">전체보기</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading && <p className="text-sm text-slate-500">최근 기록을 불러오는 중입니다.</p>}
            {loadError && <p className="text-sm text-red-600">{loadError}</p>}
            {!isLoading && !loadError && recentRecords.map((post) => (
              <Link key={post.id} to={`/posts/${post.id}`} className="block rounded-lg border border-slate-200 p-4 hover:bg-slate-50">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary">{post.category}</Badge>
                  <span className="text-xs text-slate-400">{formatDate(post.createdAt)}</span>
                </div>
                <p className="mt-2 font-semibold text-slate-900">{post.title}</p>
                <p className="mt-1 line-clamp-2 text-sm text-slate-500">{post.summary}</p>
              </Link>
            ))}
            {!isLoading && !loadError && recentRecords.length === 0 && <p className="text-sm text-slate-500">아직 작성한 기록이 없습니다.</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="h-4 w-4 text-emerald-500" />
              다음 작업
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start" asChild>
              <Link to="/ai-assistant">
                <Sparkles className="mr-2 h-4 w-4" />
                AI 도우미 실행
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link to="/portfolio">
                <GitCommit className="mr-2 h-4 w-4" />
                포트폴리오 업데이트하러가기
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link to="/coach-review">
                <MessageSquare className="mr-2 h-4 w-4" />
                코치 리뷰 요청 {waitingStudentReviews.length > 0 ? `(${waitingStudentReviews.length})` : ""}
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
