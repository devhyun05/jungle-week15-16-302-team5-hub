
import { useMemo, useState } from "react";
import { Link, useOutletContext } from "react-router";
import { AlertCircle, CheckCircle2, ChevronRight, MessageSquare, Search, Send, ShieldCheck, XCircle } from "lucide-react";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Textarea } from "../../components/ui/Textarea";
import {
  categories,
  coaches,
  portfolioProjects,
  posts,
  reviewRequests,
  type MockPost,
  type PortfolioProject,
  type ReviewRequest,
  type ReviewStatus,
} from "../../data/mockData";
import type { MainLayoutContext } from "../../layouts/MainLayout";

const statusColors: Record<ReviewStatus, string> = {
  "대기 중": "bg-slate-100 text-slate-700",
  "검토 중": "bg-blue-100 text-blue-700",
  "피드백 완료": "bg-emerald-100 text-emerald-700",
  "수정 요청": "bg-amber-100 text-amber-700",
  "최종 확인": "bg-indigo-100 text-indigo-700",
};

const reviewStatusOptions: ReviewStatus[] = ["대기 중", "검토 중", "피드백 완료", "수정 요청", "최종 확인"];

function ReviewStatusBadge({ status }: { status: ReviewStatus }) {
  return <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${statusColors[status]}`}>{status}</span>;
}

function StudentReviewView() {
  // 학생 화면은 리뷰 요청을 생성하고 내가 보낸 요청 목록을 관리합니다.
  const [targetType, setTargetType] = useState<"post" | "portfolio">("post");
  const [targetId, setTargetId] = useState(String(posts[0].id));
  const [selectedCoachIds, setSelectedCoachIds] = useState<string[]>([coaches[0].id]);
  const [message, setMessage] = useState("");
  const [notice, setNotice] = useState("");
  const [requests, setRequests] = useState<ReviewRequest[]>(
    reviewRequests.filter((request) => request.requesterId === "student-1"),
  );

  // 리뷰 대상 유형에 따라 게시글 목록 또는 포트폴리오 프로젝트 목록을 선택지로 사용합니다.
  const targetOptions: Array<MockPost | PortfolioProject> = targetType === "post" ? posts : portfolioProjects;
  const selectedTarget = targetOptions.find((item) => String(item.id) === targetId) ?? targetOptions[0];

  const toggleCoach = (coachId: string) => {
    setSelectedCoachIds((prev) => (prev.includes(coachId) ? prev.filter((id) => id !== coachId) : [...prev, coachId]));
  };

  const createRequest = () => {
    if (selectedCoachIds.length === 0) {
      setNotice("리뷰 받을 코치님을 1명 이상 선택해주세요.");
      return;
    }

    const selectedCoaches = coaches.filter((coach) => selectedCoachIds.includes(coach.id));
    const newRequest: ReviewRequest = {
      id: `review-local-${Date.now()}`,
      requesterId: "student-1",
      requesterName: "김정글",
      coachIds: selectedCoaches.map((coach) => coach.id),
      coachNames: selectedCoaches.map((coach) => coach.name),
      targetType,
      targetId: String(selectedTarget.id),
      targetTitle: selectedTarget.title,
      category: selectedTarget.category,
      categorySlug: selectedTarget.categorySlug,
      message: message.trim() || "리뷰 부탁드립니다.",
      status: "대기 중",
      createdAt: "방금 전",
      feedback: "",
    };

    // TODO backend: 실제 코치 리뷰 요청 생성 API는 백엔드 연결 후 구현 예정.
    setRequests((prev) => [newRequest, ...prev]);
    setMessage("");
    setNotice("mock으로 리뷰 요청을 보냈습니다.");
  };

  const cancelRequest = (requestId: string) => {
    // TODO backend: 실제 리뷰 요청 삭제 API는 백엔드 연결 후 구현 예정.
    setRequests((prev) => prev.filter((request) => request.id !== requestId));
    setNotice("대기 중 리뷰 요청을 mock 목록에서 제거했습니다.");
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">코치 리뷰 요청</h1>
        <p className="mt-1 text-slate-500">내 게시글이나 포트폴리오 프로젝트를 선택해서 코치님에게 리뷰를 요청합니다.</p>
      </div>

      {notice && <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{notice}</div>}

      <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">리뷰 요청 생성</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">리뷰 대상 유형</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: "post", label: "게시글" },
                  { value: "portfolio", label: "포트폴리오 프로젝트" },
                ].map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => {
                      setTargetType(item.value as "post" | "portfolio");
                      setTargetId(item.value === "post" ? String(posts[0].id) : portfolioProjects[0].id);
                    }}
                    className={`rounded-md border px-3 py-2 text-sm font-semibold transition-colors ${
                      targetType === item.value
                        ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">리뷰 대상 선택</label>
              <select
                value={targetId}
                onChange={(event) => setTargetId(event.target.value)}
                className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:ring-1 focus:ring-emerald-500"
              >
                {targetOptions.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">코치 선택</label>
              <div className="grid gap-2 md:grid-cols-3">
                {coaches.map((coach) => {
                  const isSelected = selectedCoachIds.includes(coach.id);
                  return (
                    <button
                      key={coach.id}
                      type="button"
                      onClick={() => toggleCoach(coach.id)}
                      className={`rounded-lg border p-3 text-left transition-colors ${
                        isSelected ? "border-emerald-300 bg-emerald-50" : "border-slate-200 bg-white hover:bg-slate-50"
                      }`}
                    >
                      <p className="text-sm font-semibold text-slate-900">{coach.name}</p>
                      <p className="text-xs text-slate-500">{coach.field}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">요청 메시지</label>
              <Textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="어떤 부분을 봐주셨으면 하는지 적어주세요."
                className="min-h-28 resize-none"
              />
            </div>

            <div className="flex items-center justify-between gap-3">
              <p className="text-xs text-slate-500">현재 단계에서는 서버 저장 없이 화면 상태에만 추가됩니다.</p>
              <Button onClick={createRequest} disabled={selectedCoachIds.length === 0}>
                <Send className="mr-2 h-4 w-4" />
                리뷰 요청 보내기
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">선택한 대상 미리보기</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="secondary">{selectedTarget.category}</Badge>
            <h2 className="mt-3 text-lg font-bold text-slate-900">{selectedTarget.title}</h2>
            <p className="mt-2 line-clamp-5 text-sm text-slate-600">
              {"readmeSummary" in selectedTarget ? selectedTarget.savedPortfolioDraft : selectedTarget.summary}
            </p>
            <Button asChild variant="outline" className="mt-4">
              <Link to={targetType === "post" ? `/posts/${selectedTarget.id}` : "/portfolio"}>
                원문 보기 <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">내가 보낸 요청 목록</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {requests.map((request) => (
            <div key={request.id} className="rounded-lg border border-slate-200 p-4">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary">{request.category}</Badge>
                  <ReviewStatusBadge status={request.status} />
                </div>
                <span className="text-xs text-slate-400">{request.createdAt}</span>
              </div>
              <h3 className="font-semibold text-slate-900">{request.targetTitle}</h3>
              <p className="mt-1 text-sm text-slate-500">담당 코치: {request.coachNames.join(", ")}</p>
              <p className="mt-2 text-sm text-slate-600">{request.message}</p>
              {request.feedback && <div className="mt-3 rounded-md bg-emerald-50 p-3 text-sm text-emerald-800">피드백: {request.feedback}</div>}
              <div className="mt-3 flex justify-end">
                {request.status === "대기 중" ? (
                  <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50" onClick={() => cancelRequest(request.id)}>
                    <XCircle className="mr-1 h-3 w-3" />
                    요청 취소
                  </Button>
                ) : (
                  <span className="text-xs text-slate-400">검토가 시작된 요청은 mock 화면에서도 취소할 수 없습니다.</span>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function CoachInboxView() {
  // 코치 화면은 들어온 리뷰 요청을 검색/필터링하고 상태와 피드백을 수정합니다.
  const [requests, setRequests] = useState<ReviewRequest[]>(reviewRequests);
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [selectedStatus, setSelectedStatus] = useState("전체");
  const [keyword, setKeyword] = useState("");
  const [selectedId, setSelectedId] = useState(reviewRequests[0].id);
  const selectedRequest = requests.find((request) => request.id === selectedId) ?? requests[0];
  const [feedback, setFeedback] = useState(selectedRequest.feedback);

  // 카테고리, 상태, 검색어 조건을 모두 만족하는 요청만 인박스에 보여줍니다.
  const filteredRequests = useMemo(
    () =>
      requests.filter((request) => {
        const categoryMatch = selectedCategory === "전체" || request.category === selectedCategory;
        const statusMatch = selectedStatus === "전체" || request.status === selectedStatus;
        const query = keyword.trim().toLowerCase();
        const keywordMatch =
          !query ||
          request.requesterName.toLowerCase().includes(query) ||
          request.targetTitle.toLowerCase().includes(query) ||
          request.category.toLowerCase().includes(query) ||
          request.message.toLowerCase().includes(query) ||
          request.coachNames.some((name) => name.toLowerCase().includes(query));

        return categoryMatch && statusMatch && keywordMatch;
      }),
    [keyword, requests, selectedCategory, selectedStatus],
  );

  const targetPost = posts.find((post) => String(post.id) === selectedRequest.targetId);
  const targetPortfolio = portfolioProjects.find((project) => project.id === selectedRequest.targetId);

  const selectRequest = (request: ReviewRequest) => {
    setSelectedId(request.id);
    setFeedback(request.feedback);
  };

  const updateStatus = (status: ReviewStatus) => {
    const savedFeedback = status === "최종 확인" && !feedback.trim() ? "이 정도면 만족합니다. 최종 확인 처리했습니다." : feedback;

    // TODO backend: 실제 코치 리뷰 상태 변경과 피드백 저장 API는 백엔드 연결 후 구현 예정.
    setRequests((prev) =>
      prev.map((request) => (request.id === selectedRequest.id ? { ...request, status, feedback: savedFeedback } : request)),
    );
    setFeedback(savedFeedback);
  };

  return (
    <div className="mx-auto flex h-[calc(100vh-8rem)] max-w-7xl flex-col">
      <div className="mb-6 shrink-0">
        <h1 className="text-2xl font-bold text-slate-900">코치 리뷰 인박스</h1>
        <p className="mt-1 text-slate-500">학생들이 보낸 리뷰 요청을 확인하고 피드백 상태를 관리합니다.</p>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-6 lg:flex-row">
        <Card className="flex w-full shrink-0 flex-col overflow-hidden border-slate-200 shadow-sm lg:w-[420px]">
          <div className="shrink-0 space-y-3 border-b border-slate-200 bg-slate-50/50 p-4">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                placeholder="학생, 제목, 카테고리, 메시지 검색"
                className="h-9 bg-white pl-9"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <select value={selectedCategory} onChange={(event) => setSelectedCategory(event.target.value)} className="h-9 rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-700">
                <option>전체</option>
                {categories.map((category) => (
                  <option key={category.slug}>{category.label}</option>
                ))}
              </select>
              <select value={selectedStatus} onChange={(event) => setSelectedStatus(event.target.value)} className="h-9 rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-700">
                <option>전체</option>
                {reviewStatusOptions.map((status) => (
                  <option key={status}>{status}</option>
                ))}
              </select>
            </div>
            <p className="text-xs text-slate-400">고급 DB full-text search는 백엔드 연결 후 구현 예정입니다.</p>
          </div>

          <div className="flex-1 space-y-2 overflow-y-auto p-2">
            {filteredRequests.map((request) => {
              const isActive = selectedRequest.id === request.id;
              return (
                <button
                  key={request.id}
                  type="button"
                  onClick={() => selectRequest(request)}
                  className={`w-full rounded-lg border p-3 text-left transition-colors ${
                    isActive ? "border-emerald-200 bg-emerald-50" : "border-transparent hover:border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <div className="mb-1 flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-900">{request.requesterName}</span>
                      <Badge variant="secondary" className="text-[10px]">
                        {request.category}
                      </Badge>
                    </div>
                    <span className="text-xs text-slate-400">{request.createdAt}</span>
                  </div>
                  <p className="truncate text-sm font-medium text-slate-700">{request.targetTitle}</p>
                  <div className="mt-2 flex items-center gap-2">
                    {request.status === "피드백 완료" || request.status === "최종 확인" ? (
                      <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                    ) : (
                      <AlertCircle className="h-3 w-3 text-amber-500" />
                    )}
                    <ReviewStatusBadge status={request.status} />
                  </div>
                </button>
              );
            })}
          </div>
        </Card>

        <div className="flex min-h-0 flex-1 flex-col gap-4">
          <Card className="flex min-h-0 flex-1 flex-col border-slate-200">
            <div className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white p-4 md:p-6">
              <div>
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <Badge variant="secondary">{selectedRequest.category}</Badge>
                  <ReviewStatusBadge status={selectedRequest.status} />
                </div>
                <h2 className="text-lg font-bold text-slate-900">{selectedRequest.targetTitle}</h2>
                <p className="mt-1 text-sm text-slate-500">
                  {selectedRequest.requesterName} · 담당 코치 {selectedRequest.coachNames.join(", ")}
                </p>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link to={selectedRequest.targetType === "post" ? `/posts/${selectedRequest.targetId}` : "/portfolio"}>
                  원문 보기 <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto bg-white p-6">
              <div className="mb-5 rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="mb-1 text-xs font-semibold text-slate-500">학생 요청 메시지</p>
                <p className="text-sm text-slate-700">{selectedRequest.message}</p>
              </div>

              <div className="prose prose-sm prose-slate max-w-none">
                <h3>미리보기</h3>
                <p>
                  {targetPortfolio?.savedPortfolioDraft ??
                    `${targetPost?.summary ?? selectedRequest.targetTitle} 실제 백엔드 연결 전까지는 mock 데이터로 원문 일부만 보여줍니다.`}
                </p>
                <h3>코치 확인 포인트</h3>
                <ul>
                  <li>문제 정의가 명확한가?</li>
                  <li>시도한 방법과 최종 해결이 구분되어 있는가?</li>
                  <li>포트폴리오 문장으로 옮길 수 있는 근거가 있는가?</li>
                </ul>
              </div>
            </div>
          </Card>

          <Card className="shrink-0 border-slate-200 bg-white shadow-sm">
            <CardContent className="flex flex-col gap-3 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                <MessageSquare className="h-4 w-4 text-indigo-500" />
                피드백 작성
              </div>
              <Textarea
                value={feedback}
                onChange={(event) => setFeedback(event.target.value)}
                placeholder="학생에게 전달할 피드백을 작성하세요."
                className="h-24 resize-none border-slate-300 focus-visible:ring-indigo-500"
              />
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" className="h-8 text-xs" onClick={() => updateStatus("검토 중")}>
                  검토 중
                </Button>
                <Button variant="outline" className="h-8 border-amber-200 bg-amber-50 text-xs text-amber-700" onClick={() => updateStatus("수정 요청")}>
                  <AlertCircle className="mr-1 h-3 w-3" />
                  수정 요청
                </Button>
                <Button className="h-8 bg-indigo-600 px-4 text-xs text-white hover:bg-indigo-700" onClick={() => updateStatus("피드백 완료")}>
                  피드백 완료
                </Button>
                <Button variant="outline" className="h-8 border-emerald-200 bg-emerald-50 text-xs text-emerald-700" onClick={() => updateStatus("최종 확인")}>
                  <ShieldCheck className="mr-1 h-3 w-3" />
                  최종 확인
                </Button>
              </div>
              <p className="text-xs text-slate-400">최종 확인은 코치가 “이 정도면 만족합니다”라고 판단한 상태입니다.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export function CoachReview() {
  // 같은 /coach-review 주소라도 role에 따라 완전히 다른 화면을 보여줍니다.
  const { role } = useOutletContext<MainLayoutContext>();
  return role === "STUDENT" ? <StudentReviewView /> : <CoachInboxView />;
}
