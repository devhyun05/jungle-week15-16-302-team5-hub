
import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useOutletContext } from "react-router";
import { ArrowRight, Briefcase, GitCommit, Inbox, MessageSquare, PenSquare, Sparkles } from "lucide-react";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import { getMyPosts, getPosts, type PostListApiItem } from "../../api/posts";
import { getMyReviewRequests, getReviewInbox, type ReviewRequestApiItem } from "../../api/reviews";
import { categories } from "../../data/mockData";
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
  // MainLayout에서 넘긴 role로 학생용 대시보드와 코치용 대시보드를 나눕니다.
  const { role } = useOutletContext<MainLayoutContext>();
  const [studentRecords, setStudentRecords] = useState<PostListApiItem[]>([]);
  const [studentReviews, setStudentReviews] = useState<ReviewRequestApiItem[]>([]);
  const [coachReviews, setCoachReviews] = useState<ReviewRequestApiItem[]>([]);
  const [publicPosts, setPublicPosts] = useState<PostListApiItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let isActive = true;

    async function loadDashboardData() {
      if (role === "ADMIN") {
        return;
      }

      setIsLoading(true);
      setLoadError("");

      try {
        if (role === "COACH") {
          const [reviewData, postData] = await Promise.all([
            getReviewInbox(),
            getPosts({ size: 50 }),
          ]);

          if (isActive) {
            setCoachReviews(reviewData.items);
            setPublicPosts(postData.items);
          }
          return;
        }

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
  const waitingCoachReviews = coachReviews.filter(isReviewWaiting);
  const waitingStudentReviews = studentReviews.filter(isReviewWaiting);

  if (role === "ADMIN") {
    return <Navigate to="/admin/users" replace />;
  }

  if (role === "COACH") {
    // 코치는 글 작성보다 들어온 리뷰 요청을 처리하는 흐름을 우선으로 봅니다.
    return (
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">코치 리뷰 대시보드</h1>
            <p className="mt-1 text-slate-500">학생들이 보낸 리뷰 요청과 전체 게시글을 빠르게 확인합니다.</p>
          </div>
          <Button asChild size="lg">
            <Link to="/coach-review">
              리뷰 인박스 열기 <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="p-5">
              <p className="text-sm text-slate-500">검토 필요 요청</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">{waitingCoachReviews.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <p className="text-sm text-slate-500">전체 게시글</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">{publicPosts.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <p className="text-sm text-slate-500">포트폴리오 관련 요청</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">
                {coachReviews.filter((request) => request.categorySlug === "portfolio").length}
              </p>
            </CardContent>
          </Card>
        </div>

        {loadError && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4 text-sm text-red-700">{loadError}</CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Inbox className="h-4 w-4" />
              최근 리뷰 요청
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading && <p className="text-sm text-slate-500">리뷰 요청을 불러오는 중입니다.</p>}
            {!isLoading && coachReviews.slice(0, 5).map((request) => (
              <Link key={request.id} to="/coach-review" className="block rounded-lg border border-slate-200 p-4 hover:bg-slate-50">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-900">{request.targetTitle}</p>
                    <p className="mt-1 text-sm text-slate-500">{request.requesterName} · {request.category} · {formatDate(request.createdAt)}</p>
                  </div>
                  <Badge variant="secondary">{request.status}</Badge>
                </div>
              </Link>
            ))}
            {!isLoading && coachReviews.length === 0 && <p className="text-sm text-slate-500">아직 들어온 리뷰 요청이 없습니다.</p>}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8">
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
