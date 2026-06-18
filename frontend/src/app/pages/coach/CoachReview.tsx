import { useEffect, useMemo, useState } from "react";
import { Link, useOutletContext } from "react-router";
import {
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  MessageSquare,
  RefreshCw,
  Search,
  Send,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Textarea } from "../../components/ui/Textarea";
import { getMyPosts, type PostListApiItem } from "../../api/posts";
import { getPortfolioProjects, type PortfolioProjectApiItem } from "../../api/portfolio";
import { resolveApiAssetUrl } from "../../api/client";
import {
  cancelReviewRequest,
  createReviewRequest,
  getCoachOptions,
  getMyReviewRequests,
  getReviewInbox,
  updateReviewRequest,
  type CoachOption,
  type ReviewRequestApiItem,
  type ReviewStatus,
  type ReviewTargetType,
} from "../../api/reviews";
import type { MainLayoutContext } from "../../layouts/MainLayout";

const statusColors: Record<ReviewStatus, string> = {
  "대기 중": "bg-slate-100 text-slate-700",
  "검토 중": "bg-blue-100 text-blue-700",
  "피드백 완료": "bg-emerald-100 text-emerald-700",
  "수정 요청": "bg-amber-100 text-amber-700",
  "최종 확인": "bg-indigo-100 text-indigo-700",
};

const reviewStatusOptions: ReviewStatus[] = ["대기 중", "검토 중", "피드백 완료", "수정 요청"];
const feedbackSendStatusOptions = ["검토 중", "수정 요청", "피드백 완료"] as const;
// /me/posts API는 한 번에 최대 50개까지만 조회할 수 있다.
// 프론트에서 더 큰 값을 보내면 FastAPI Query 검증에서 422가 발생한다.
const REVIEW_TARGET_POST_PAGE_SIZE = 50;

type FeedbackSendStatus = (typeof feedbackSendStatusOptions)[number];

function ReviewStatusBadge({ status }: { status: ReviewStatus }) {
  return <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${statusColors[status]}`}>{status}</span>;
}

function getFeedbackStatusButtonClass(status: FeedbackSendStatus, selectedStatus: FeedbackSendStatus) {
  const isSelected = status === selectedStatus;

  if (status === "검토 중") {
    return isSelected
      ? "border-blue-300 bg-blue-100 text-blue-800 shadow-sm"
      : "border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700";
  }

  if (status === "수정 요청") {
    return isSelected
      ? "border-amber-300 bg-amber-100 text-amber-800 shadow-sm"
      : "border-slate-200 bg-white text-slate-600 hover:border-amber-200 hover:bg-amber-50 hover:text-amber-700";
  }

  return isSelected
    ? "border-emerald-300 bg-emerald-100 text-emerald-800 shadow-sm"
    : "border-slate-200 bg-white text-slate-600 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700";
}

function getDefaultFeedbackSendStatus(status?: ReviewStatus): FeedbackSendStatus {
  if (status === "수정 요청" || status === "피드백 완료" || status === "검토 중") {
    return status;
  }

  return "검토 중";
}

function getFeedbackSuccessMessage(status: FeedbackSendStatus) {
  if (status === "검토 중") return "검토 중 상태로 전송했습니다.";
  if (status === "수정 요청") return "수정 요청을 전송했습니다.";
  return "피드백을 전송했습니다.";
}

function formatDate(dateText: string) {
  return new Date(dateText).toLocaleString("ko-KR", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function isValidExternalUrl(url?: string | null) {
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

function Avatar({ name, imageUrl }: { name: string; imageUrl?: string | null }) {
  const resolvedImageUrl = resolveApiAssetUrl(imageUrl);

  if (resolvedImageUrl) {
    return <img src={resolvedImageUrl} alt={`${name} 프로필`} className="h-8 w-8 rounded-full object-cover" />;
  }

  return (
    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">
      {name.slice(0, 1)}
    </div>
  );
}

function StudentReviewView() {
  const [targetType, setTargetType] = useState<ReviewTargetType>("post");
  const [targetId, setTargetId] = useState<number | null>(null);
  const [posts, setPosts] = useState<PostListApiItem[]>([]);
  const [projects, setProjects] = useState<PortfolioProjectApiItem[]>([]);
  const [coaches, setCoaches] = useState<CoachOption[]>([]);
  const [requests, setRequests] = useState<ReviewRequestApiItem[]>([]);
  const [selectedCoachIds, setSelectedCoachIds] = useState<number[]>([]);
  const [message, setMessage] = useState("");
  const [notice, setNotice] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function loadStudentReviewData() {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const [postData, projectData, coachData, requestData] = await Promise.all([
        getMyPosts({ visibility: "all", size: REVIEW_TARGET_POST_PAGE_SIZE }),
        getPortfolioProjects(),
        getCoachOptions(),
        getMyReviewRequests(),
      ]);

      setPosts(postData.items);
      setProjects(projectData.items);
      setCoaches(coachData.items);
      setRequests(requestData.items);
      setTargetId((prev) => {
        const targetItems = targetType === "post" ? postData.items : projectData.items;
        const hasPreviousTarget = targetItems.some((item) => item.id === prev);

        if (hasPreviousTarget) {
          return prev;
        }

        return targetItems[0]?.id ?? null;
      });
      setSelectedCoachIds((prev) => (prev.length > 0 ? prev : coachData.items[0] ? [coachData.items[0].id] : []));
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "리뷰 요청 데이터를 불러오지 못했습니다.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadStudentReviewData();
  }, []);

  const targetOptions = targetType === "post" ? posts : projects;
  const selectedTarget = targetOptions.find((item) => item.id === targetId) ?? targetOptions[0] ?? null;

  const toggleCoach = (coachId: number) => {
    setSelectedCoachIds((prev) => (prev.includes(coachId) ? prev.filter((id) => id !== coachId) : [...prev, coachId]));
  };

  const changeTargetType = (nextType: ReviewTargetType) => {
    setTargetType(nextType);
    setTargetId(nextType === "post" ? posts[0]?.id ?? null : projects[0]?.id ?? null);
    setNotice("");
  };

  const submitReviewRequest = async () => {
    if (!selectedTarget || targetId === null) {
      setErrorMessage("리뷰 요청 대상을 먼저 선택해 주세요.");
      return;
    }

    if (selectedCoachIds.length === 0) {
      setErrorMessage("리뷰 받을 코치님을 1명 이상 선택해 주세요.");
      return;
    }

    setIsSubmitting(true);
    setNotice("");
    setErrorMessage("");

    try {
      const createdRequest = await createReviewRequest({
        targetType,
        targetId,
        coachIds: selectedCoachIds,
        message: message.trim() || "리뷰 부탁드립니다.",
      });

      setRequests((prev) => [createdRequest, ...prev]);
      setMessage("");
      setNotice("리뷰 요청을 보냈습니다.");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "리뷰 요청을 보내지 못했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const removePendingRequest = async (requestId: number) => {
    setErrorMessage("");
    setNotice("");

    try {
      await cancelReviewRequest(requestId);
      setRequests((prev) => prev.filter((request) => request.id !== requestId));
      setNotice("대기 중 리뷰 요청을 취소했습니다.");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "리뷰 요청을 취소하지 못했습니다.");
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">코치 리뷰 요청</h1>
        <p className="mt-1 text-slate-500">내 게시글이나 포트폴리오 프로젝트를 선택해서 코치님에게 리뷰를 요청합니다.</p>
      </div>

      {errorMessage && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{errorMessage}</div>}
      {notice && <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{notice}</div>}

      {isLoading ? (
        <Card>
          <CardContent className="p-8 text-center text-sm text-slate-500">리뷰 요청 데이터를 불러오는 중입니다.</CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <CardTitle className="text-base">리뷰 요청 생성</CardTitle>
                <Button type="button" variant="outline" size="sm" onClick={() => void loadStudentReviewData()}>
                  <RefreshCw className="mr-1 h-3 w-3" />
                  대상 새로고침
                </Button>
              </div>
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
                        onClick={() => changeTargetType(item.value as ReviewTargetType)}
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
                    value={targetId ?? ""}
                    onChange={(event) => setTargetId(Number(event.target.value))}
                    className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    {targetOptions.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.title}
                      </option>
                    ))}
                  </select>
                  {targetOptions.length === 0 && (
                    <p className="mt-2 text-xs text-slate-500">
                      {targetType === "post"
                        ? "선택할 수 있는 게시글이 없습니다."
                        : "선택할 수 있는 포트폴리오 프로젝트가 없습니다."}
                    </p>
                  )}
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
                          <div className="flex items-center gap-2">
                            <Avatar name={coach.name} imageUrl={coach.profileImageUrl} />
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-slate-900">{coach.name}</p>
                              <p className="truncate text-xs text-slate-500">{coach.email}</p>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                    {coaches.length === 0 && <p className="text-sm text-slate-500">승인 완료된 코치가 아직 없습니다.</p>}
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
                  <p className="text-xs text-slate-500">요청을 보내면 선택한 코치님 인박스에 표시됩니다.</p>
                  <Button onClick={() => void submitReviewRequest()} disabled={isSubmitting || !selectedTarget || selectedCoachIds.length === 0}>
                    <Send className="mr-2 h-4 w-4" />
                    {isSubmitting ? "전송 중" : "리뷰 요청 보내기"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">선택한 대상 미리보기</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedTarget ? (
                  <>
                    <Badge variant="secondary">{targetType === "post" ? (selectedTarget as PostListApiItem).category : "포트폴리오 관리"}</Badge>
                    <h2 className="mt-3 text-lg font-bold text-slate-900">{selectedTarget.title}</h2>
                    <p className="mt-2 line-clamp-5 text-sm text-slate-600">
                      {targetType === "post"
                        ? (selectedTarget as PostListApiItem).summary
                        : (selectedTarget as PortfolioProjectApiItem).savedPortfolioDraft ?? (selectedTarget as PortfolioProjectApiItem).summary}
                    </p>
                    <Button asChild variant="outline" className="mt-4">
                      <Link to={targetType === "post" ? `/posts/${selectedTarget.id}` : "/portfolio"}>
                        원문 보기 <ChevronRight className="ml-1 h-4 w-4" />
                      </Link>
                    </Button>
                  </>
                ) : (
                  <p className="text-sm text-slate-500">리뷰를 요청할 게시글이나 포트폴리오 프로젝트를 먼저 만들어 주세요.</p>
                )}
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
                    <span className="text-xs text-slate-400">{formatDate(request.createdAt)}</span>
                  </div>
                  <h3 className="font-semibold text-slate-900">{request.targetTitle}</h3>
                    <p className="mt-1 text-sm text-slate-500">담당 코치: {request.coachNames.join(", ")}</p>
                  <p className="mt-2 text-sm text-slate-600">{request.message}</p>
                  {request.feedback && <div className="mt-3 rounded-md bg-emerald-50 p-3 text-sm text-emerald-800">피드백: {request.feedback}</div>}
                  <div className="mt-3 flex justify-end">
                    {request.status === "대기 중" ? (
                      <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50" onClick={() => void removePendingRequest(request.id)}>
                        <XCircle className="mr-1 h-3 w-3" />
                        요청 취소
                      </Button>
                    ) : (
                      <span className="text-xs text-slate-400">검토가 시작된 요청은 취소할 수 없습니다.</span>
                    )}
                  </div>
                </div>
              ))}
              {requests.length === 0 && <p className="text-sm text-slate-500">아직 보낸 리뷰 요청이 없습니다.</p>}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

function CoachInboxView() {
  const [requests, setRequests] = useState<ReviewRequestApiItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [selectedStatus, setSelectedStatus] = useState<ReviewStatus | "전체">("전체");
  const [keyword, setKeyword] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [feedback, setFeedback] = useState("");
  const [feedbackStatus, setFeedbackStatus] = useState<FeedbackSendStatus>("검토 중");
  const [feedbackError, setFeedbackError] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  async function loadInbox() {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const data = await getReviewInbox();

      setRequests(data.items);
      setSelectedId((prev) => {
        const hasPreviousRequest = data.items.some((request) => request.id === prev);

        return hasPreviousRequest ? prev : data.items[0]?.id ?? null;
      });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "리뷰 인박스를 불러오지 못했습니다.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadInbox();
  }, []);

  const categoryOptions = Array.from(new Set(requests.map((request) => request.category)));

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
          (request.message ?? "").toLowerCase().includes(query) ||
          request.coachNames.some((name) => name.toLowerCase().includes(query));

        return categoryMatch && statusMatch && keywordMatch;
      }),
    [keyword, requests, selectedCategory, selectedStatus],
  );
  const selectedRequest = filteredRequests.find((request) => request.id === selectedId) ?? filteredRequests[0] ?? null;

  useEffect(() => {
    setFeedback(selectedRequest?.feedback ?? "");
    setFeedbackStatus(getDefaultFeedbackSendStatus(selectedRequest?.status));
    setFeedbackError("");
  }, [selectedRequest?.feedback, selectedRequest?.id, selectedRequest?.status]);

  useEffect(() => {
    // 필터가 바뀌어 기존 선택 요청이 목록에서 사라지면 상세 패널도 필터된 첫 요청으로 맞춘다.
    const nextSelectedId = selectedRequest?.id ?? null;

    if (selectedId !== nextSelectedId) {
      setSelectedId(nextSelectedId);
    }
  }, [selectedId, selectedRequest?.id]);

  const selectRequest = (request: ReviewRequestApiItem) => {
    setSelectedId(request.id);
    setFeedback(request.feedback ?? "");
    setFeedbackStatus(getDefaultFeedbackSendStatus(request.status));
    setFeedbackError("");
    setErrorMessage("");
  };

  const saveReview = async () => {
    if (!selectedRequest) {
      return;
    }

    const trimmedFeedback = feedback.trim();

    if ((feedbackStatus === "수정 요청" || feedbackStatus === "피드백 완료") && !trimmedFeedback) {
      const message = "피드백 내용을 입력해 주세요.";

      setFeedbackError(message);
      toast.error(message);
      return;
    }

    setIsSaving(true);
    setFeedbackError("");
    setErrorMessage("");

    try {
      const updatedRequest = await updateReviewRequest(selectedRequest.id, {
        status: feedbackStatus,
        feedback: trimmedFeedback || undefined,
      });

      setRequests((prev) => prev.map((request) => (request.id === updatedRequest.id ? updatedRequest : request)));
      setSelectedId(updatedRequest.id);
      setFeedback(updatedRequest.feedback ?? "");
      setFeedbackStatus(getDefaultFeedbackSendStatus(updatedRequest.status));
      toast.success(getFeedbackSuccessMessage(feedbackStatus));
    } catch (error) {
      const message = error instanceof Error ? error.message : "피드백을 저장하지 못했습니다.";

      setFeedbackError(message);
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mx-auto flex h-[calc(100vh-8rem)] max-w-7xl flex-col">
      <div className="mb-6 shrink-0">
        <h1 className="text-2xl font-bold text-slate-900">코치 리뷰 인박스</h1>
        <p className="mt-1 text-slate-500">학생들이 보낸 리뷰 요청을 확인하고 피드백 상태를 관리합니다.</p>
      </div>

      {errorMessage && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{errorMessage}</div>}

      {isLoading ? (
        <Card>
          <CardContent className="p-8 text-center text-sm text-slate-500">리뷰 인박스를 불러오는 중입니다.</CardContent>
        </Card>
      ) : (
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
                  {categoryOptions.map((category) => (
                    <option key={category}>{category}</option>
                  ))}
                </select>
                <select value={selectedStatus} onChange={(event) => setSelectedStatus(event.target.value as ReviewStatus | "전체")} className="h-9 rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-700">
                  <option>전체</option>
                  {reviewStatusOptions.map((status) => (
                    <option key={status}>{status}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex-1 space-y-2 overflow-y-auto p-2">
              {filteredRequests.map((request) => {
                const isActive = selectedRequest?.id === request.id;
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
                        <Avatar name={request.requesterName} imageUrl={request.requesterProfileImageUrl} />
                        <span className="text-sm font-semibold text-slate-900">{request.requesterName}</span>
                        <Badge variant="secondary" className="text-[10px]">
                          {request.category}
                        </Badge>
                      </div>
                      <span className="text-xs text-slate-400">{formatDate(request.createdAt)}</span>
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
              {filteredRequests.length === 0 && <p className="p-4 text-sm text-slate-500">조건에 맞는 리뷰 요청이 없습니다.</p>}
            </div>
          </Card>

          <div className="flex min-h-0 flex-1 flex-col gap-4">
            {selectedRequest ? (
              <>
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
                    {selectedRequest.targetType === "post" ? (
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/posts/${selectedRequest.targetId}`}>
                          원문 보기 <ChevronRight className="ml-1 h-4 w-4" />
                        </Link>
                      </Button>
                    ) : isValidExternalUrl(selectedRequest.targetLinkUrl) ? (
                      <Button variant="outline" size="sm" asChild>
                        <a href={selectedRequest.targetLinkUrl ?? "#"} target="_blank" rel="noreferrer">
                          GitHub 보기 <ExternalLink className="ml-1 h-4 w-4" />
                        </a>
                      </Button>
                    ) : (
                      <Button variant="outline" size="sm" disabled>
                        링크 없음
                      </Button>
                    )}
                  </div>

                  <div className="flex-1 overflow-y-auto bg-white p-6">
                    <div className="mb-5 rounded-lg border border-slate-200 bg-slate-50 p-4">
                      <p className="mb-1 text-xs font-semibold text-slate-500">학생 요청 메시지</p>
                      <p className="text-sm text-slate-700">{selectedRequest.message}</p>
                    </div>

                    <div className="mb-5 rounded-lg border border-emerald-100 bg-emerald-50/40 p-4">
                      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                        <p className="text-xs font-semibold text-emerald-700">리뷰 대상 미리보기</p>
                        <Badge variant="secondary">{selectedRequest.targetType === "post" ? "게시글" : "포트폴리오 프로젝트"}</Badge>
                      </div>
                      {selectedRequest.targetSummary && <p className="mb-3 text-sm font-medium text-slate-800">{selectedRequest.targetSummary}</p>}
                      {selectedRequest.targetPreview ? (
                        <p className="line-clamp-8 whitespace-pre-line text-sm leading-6 text-slate-600">{selectedRequest.targetPreview}</p>
                      ) : (
                        <p className="text-sm text-slate-500">저장된 미리보기 내용이 없습니다. 필요한 경우 원문 또는 GitHub 링크를 함께 확인해 주세요.</p>
                      )}
                      {isValidExternalUrl(selectedRequest.targetLinkUrl) && (
                        <a
                          href={selectedRequest.targetLinkUrl ?? "#"}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-3 inline-flex items-center text-xs font-semibold text-emerald-700 hover:text-emerald-800"
                        >
                          관련 링크 열기 <ExternalLink className="ml-1 h-3 w-3" />
                        </a>
                      )}
                    </div>

                    <div className="prose prose-sm prose-slate max-w-none">
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
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                        <MessageSquare className="h-4 w-4 text-indigo-500" />
                        피드백 작성 및 전송
                      </div>
                      <div className="inline-flex gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1">
                        {feedbackSendStatusOptions.map((status) => (
                          <button
                            key={status}
                            type="button"
                            className={`h-8 rounded-md border px-3 text-xs font-semibold transition-colors ${getFeedbackStatusButtonClass(status, feedbackStatus)}`}
                            onClick={() => {
                              setFeedbackStatus(status);
                              setFeedbackError("");
                            }}
                            disabled={isSaving}
                          >
                            {status}
                          </button>
                        ))}
                      </div>
                    </div>
                    <Textarea
                      value={feedback}
                      onChange={(event) => setFeedback(event.target.value)}
                      placeholder="학생에게 전달할 피드백을 작성하세요."
                      className="h-24 resize-none border-slate-300 focus-visible:ring-indigo-500"
                    />
                    {feedbackError && <p className="text-xs font-medium text-red-600">{feedbackError}</p>}
                    <div className="flex justify-end">
                      <Button className="h-9 bg-emerald-600 px-5 text-sm text-white shadow-sm hover:bg-emerald-700" onClick={() => void saveReview()} disabled={isSaving}>
                        {isSaving ? "전송 중" : "피드백 전송"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="p-8 text-center text-sm text-slate-500">받은 리뷰 요청이 없습니다.</CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function CoachReview() {
  const { role } = useOutletContext<MainLayoutContext>();

  return role === "STUDENT" ? <StudentReviewView /> : <CoachInboxView />;
}
