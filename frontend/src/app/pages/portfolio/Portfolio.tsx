import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { BookOpen, ExternalLink, FileText, Github, GitCommit, Link2, Plus, RefreshCw, Search, Sparkles, X } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card, CardContent } from "../../components/ui/Card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Input } from "../../components/ui/Input";
import { RadioGroup, RadioGroupItem } from "../../components/ui/radio-group";
import { getMyPosts, type PostListApiItem } from "../../api/posts";
import {
  createPortfolioProject,
  getPortfolioProjects,
  linkPortfolioProjectPosts,
  publishPortfolioProjectPost,
  refreshPortfolioProjectGithubInfo,
  updatePortfolioProject,
  type PortfolioProjectApiItem,
  type PortfolioStatus,
} from "../../api/portfolio";
import { getDisplayTechStack } from "../../utils/techStack";

const portfolioStatuses: PortfolioStatus[] = ["작성중", "보완 필요", "정리 완료"];
// /me/posts API는 한 번에 최대 50개까지만 허용한다.
// 포트폴리오 기록 연결 목록도 같은 제한을 지켜야 422 validation error가 나지 않는다.
const PORTFOLIO_LINKABLE_POST_PAGE_SIZE = 50;
const sectionActionClass =
  "border-emerald-200 bg-emerald-50 text-emerald-700 shadow-sm hover:bg-emerald-100 hover:text-emerald-800";
const utilityActionClass =
  "border-slate-200 bg-white text-slate-700 shadow-sm hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-800";

function portfolioStatusClass(status: string) {
  if (status === "정리 완료") return "bg-emerald-100 text-emerald-700";
  if (status === "보완 필요") return "bg-amber-100 text-amber-700";
  return "bg-blue-100 text-blue-700";
}

function feedbackStatusClass(status: string) {
  if (status === "피드백 완료") return "bg-emerald-100 text-emerald-700";
  if (status === "수정 요청") return "bg-amber-100 text-amber-700";
  if (status === "검토 중") return "bg-blue-100 text-blue-700";
  return "bg-slate-100 text-slate-700";
}

function categoryVariant(category: string) {
  if (category === "트러블슈팅") return "warning";
  if (category === "면접 질문") return "success";
  if (category === "포트폴리오 관리") return "outline";
  return "secondary";
}

function formatDate(dateText: string | null) {
  if (!dateText) {
    return "분석 전";
  }

  return new Date(dateText).toLocaleString("ko-KR", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function parseGithubProjectReference(githubUrl: string) {
  const normalizedUrl = githubUrl.trim().replace(/\.git$/, "");

  if (!normalizedUrl) {
    return null;
  }

  try {
    const parsedUrl = new URL(normalizedUrl.includes("://") ? normalizedUrl : `https://${normalizedUrl}`);
    const pathParts = parsedUrl.pathname.split("/").filter(Boolean);

    if (!parsedUrl.hostname.includes("github.com") || pathParts.length < 2) {
      return null;
    }

    return {
      repoFullName: `${pathParts[0]}/${pathParts[1]}`.toLowerCase(),
      githubBranch: pathParts.length >= 4 && ["tree", "blob"].includes(pathParts[2]) ? pathParts.slice(3).join("/") : null,
    };
  } catch {
    const cleanedUrl = normalizedUrl.replace("github.com/", "").replace(/^\/+/, "");
    const pathParts = cleanedUrl.split("/").filter(Boolean);

    if (pathParts.length < 2) {
      return null;
    }

    return {
      repoFullName: `${pathParts[0]}/${pathParts[1]}`.toLowerCase(),
      githubBranch: pathParts.length >= 4 && ["tree", "blob"].includes(pathParts[2]) ? pathParts.slice(3).join("/") : null,
    };
  }
}

function getGithubHref(githubUrl: string) {
  const trimmedGithubUrl = githubUrl.trim();

  if (!trimmedGithubUrl) {
    return null;
  }

  const href = trimmedGithubUrl.includes("://") ? trimmedGithubUrl : `https://${trimmedGithubUrl}`;

  try {
    const parsedUrl = new URL(href);
    const isHttpUrl = parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:";
    const isGithubHost = parsedUrl.hostname === "github.com" || parsedUrl.hostname.endsWith(".github.com");

    return isHttpUrl && isGithubHost ? parsedUrl.toString() : null;
  } catch {
    return null;
  }
}

export function Portfolio() {
  const [projects, setProjects] = useState<PortfolioProjectApiItem[]>([]);
  const [availablePosts, setAvailablePosts] = useState<PostListApiItem[]>([]);
  const [repoUrl, setRepoUrl] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [isConnectOpen, setIsConnectOpen] = useState(false);
  const [isPublishDialogOpen, setIsPublishDialogOpen] = useState(false);
  const [publishVisibility, setPublishVisibility] = useState<"public" | "private">("public");
  const [selectedPostIds, setSelectedPostIds] = useState<number[]>([]);
  const [errorMessage, setErrorMessage] = useState("");

  async function loadPortfolioData(preferredProjectId?: number): Promise<PortfolioProjectApiItem[]> {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const [projectData, postData] = await Promise.all([
        getPortfolioProjects(),
        getMyPosts({ visibility: "all", size: PORTFOLIO_LINKABLE_POST_PAGE_SIZE }),
      ]);

      setProjects(projectData.items);
      setAvailablePosts(postData.items);

      const nextSelectedProject =
        projectData.items.find((project) => project.id === preferredProjectId) ??
        projectData.items.find((project) => project.id === selectedProjectId) ??
        projectData.items[0] ??
        null;

      setSelectedProjectId(nextSelectedProject?.id ?? null);
      setSelectedPostIds(nextSelectedProject?.linkedPostIds ?? []);

      return projectData.items;
    } catch (error) {
      console.error(error);
      setErrorMessage("데이터를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.");

      return [];
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadPortfolioData();
  }, []);

  const filteredProjects = useMemo(
    () =>
      projects.filter((project) => {
        const keyword = searchKeyword.trim().toLowerCase();
        if (!keyword) return true;

        return (
          project.title.toLowerCase().includes(keyword) ||
          project.repoFullName.toLowerCase().includes(keyword) ||
          project.githubBranch.toLowerCase().includes(keyword) ||
          project.githubUrl.toLowerCase().includes(keyword) ||
          project.techStack.some((stack) => stack.toLowerCase().includes(keyword))
        );
      }),
    [projects, searchKeyword],
  );

  const selectedProject =
    projects.find((project) => project.id === selectedProjectId) ?? filteredProjects[0] ?? projects[0] ?? null;
  const selectedProjectGithubHref = selectedProject ? getGithubHref(selectedProject.githubUrl) : null;
  const selectedDisplayTechStack = selectedProject ? getDisplayTechStack(selectedProject.techStack) : [];

  const linkedRecords = useMemo(
    () => (selectedProject ? availablePosts.filter((post) => selectedProject.linkedPostIds.includes(post.id)) : []),
    [availablePosts, selectedProject],
  );

  const selectProject = (project: PortfolioProjectApiItem) => {
    setSelectedProjectId(project.id);
    setSelectedPostIds(project.linkedPostIds);
    setErrorMessage("");
  };

  const upsertProject = (nextProject: PortfolioProjectApiItem) => {
    setProjects((prev) => {
      const exists = prev.some((project) => project.id === nextProject.id);

      if (!exists) {
        return [nextProject, ...prev];
      }

      return prev.map((project) => (project.id === nextProject.id ? nextProject : project));
    });
    setSelectedProjectId(nextProject.id);
    setSelectedPostIds(nextProject.linkedPostIds);
  };

  const registerGithubProject = async () => {
    const trimmedRepoUrl = repoUrl.trim();
    const projectReference = parseGithubProjectReference(trimmedRepoUrl);

    if (!trimmedRepoUrl) {
      setErrorMessage("GitHub repo URL을 입력해 주세요.");
      return;
    }

    if (!projectReference) {
      setErrorMessage("github.com의 owner/repository 또는 owner/repository/tree/branch 형식 URL을 입력해주세요.");
      return;
    }

    const existingProject = projects.find((project) => {
      const isSameRepo = project.repoFullName.toLowerCase() === projectReference.repoFullName;
      const isSameBranch = projectReference.githubBranch
        ? project.githubBranch.toLowerCase() === projectReference.githubBranch.toLowerCase()
        : false;

      return isSameRepo && isSameBranch;
    });

    if (existingProject) {
      setSearchKeyword("");
      selectProject(existingProject);
      toast.info("이미 등록된 GitHub 프로젝트입니다. 기존 프로젝트를 선택했습니다.");
      return;
    }

    setIsSaving(true);
    setErrorMessage("");

    try {
      const newProject = await createPortfolioProject({
        githubUrl: trimmedRepoUrl,
      });

      setRepoUrl("");
      setSearchKeyword("");
      await loadPortfolioData(newProject.id);
      toast.success("GitHub 프로젝트를 등록하고 README, 언어, 최근 커밋 정보를 가져왔습니다.");
    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : "GitHub 프로젝트를 등록하지 못했습니다.";

      if (message.includes("이미 등록된")) {
        setSearchKeyword("");
        const reloadedProjects = await loadPortfolioData();
        const reloadedProject = reloadedProjects.find((project) => {
          const isSameRepo = project.repoFullName.toLowerCase() === projectReference.repoFullName;
          const isSameBranch = projectReference.githubBranch
            ? project.githubBranch.toLowerCase() === projectReference.githubBranch.toLowerCase()
            : true;

          return isSameRepo && isSameBranch;
        });

        if (reloadedProject) {
          selectProject(reloadedProject);
          setErrorMessage("");
          toast.info("이미 등록된 GitHub 프로젝트입니다. 기존 프로젝트를 선택했습니다.");
          return;
        }
      }

      await loadPortfolioData();
      setErrorMessage(message);
    } finally {
      setIsSaving(false);
    }
  };

  const refreshGithubInfo = async () => {
    if (!selectedProject) {
      return;
    }

    setAnalyzing(true);
    setErrorMessage("");

    try {
      const updatedProject = await refreshPortfolioProjectGithubInfo(selectedProject.id);

      upsertProject(updatedProject);
      toast.success("GitHub README, 언어, 최근 커밋 정보를 새로 가져왔습니다.");
    } catch (error) {
      console.error(error);
      setErrorMessage(error instanceof Error ? error.message : "GitHub 정보를 새로고침하지 못했습니다.");
    } finally {
      setAnalyzing(false);
    }
  };

  const updatePortfolioStatus = async (status: PortfolioStatus) => {
    if (!selectedProject) {
      return;
    }

    setIsSaving(true);
    setErrorMessage("");

    try {
      const updatedProject = await updatePortfolioProject(selectedProject.id, {
        portfolioStatus: status,
      });

      upsertProject(updatedProject);
      toast.success("포트폴리오 상태를 저장했습니다.");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "포트폴리오 상태를 저장하지 못했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  const togglePostSelection = (postId: number) => {
    setSelectedPostIds((prev) => (prev.includes(postId) ? prev.filter((id) => id !== postId) : [...prev, postId]));
  };

  const applyConnectedRecords = async () => {
    if (!selectedProject) {
      return;
    }

    setIsSaving(true);
    setErrorMessage("");

    try {
      const updatedProject = await linkPortfolioProjectPosts(selectedProject.id, selectedPostIds);

      upsertProject(updatedProject);
      setIsConnectOpen(false);
      toast.success("연결된 학습 기록을 저장했습니다.");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "학습 기록 연결을 저장하지 못했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  const openPublishDialog = () => {
    if (!selectedProject) {
      return;
    }

    setPublishVisibility(selectedProject.publishedPostIsPublic === false ? "private" : "public");
    setIsPublishDialogOpen(true);
  };

  const publishPortfolioPost = async () => {
    if (!selectedProject) {
      return;
    }

    setIsSaving(true);
    setErrorMessage("");

    try {
      const updatedProject = await publishPortfolioProjectPost(selectedProject.id, publishVisibility === "public");
      const publishNoticeMap = {
        created: "포트폴리오 게시글을 발행했습니다.",
        updated: "포트폴리오 게시글을 최신 내용으로 갱신했습니다.",
        unchanged: "이미 최신 포트폴리오 게시글입니다.",
      };

      upsertProject(updatedProject);
      setIsPublishDialogOpen(false);

      const publishMessage = publishNoticeMap[updatedProject.publishStatus ?? "updated"];
      if (updatedProject.publishStatus === "unchanged") {
        toast.info(publishMessage);
      } else {
        toast.success(publishMessage);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "포트폴리오 게시글을 발행하지 못했습니다.";

      setErrorMessage(message);
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">포트폴리오 관리</h1>
        <p className="mt-1 text-slate-500">
          GitHub 프로젝트를 등록하고 내 기록을 연결한 뒤 AI 도우미에서 포트폴리오 글을 생성합니다.
        </p>
      </div>

      <Card className="border-emerald-100 bg-emerald-50/50">
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Github className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
              <Input
                value={repoUrl}
                onChange={(event) => setRepoUrl(event.target.value)}
                placeholder="https://github.com/username/repository 또는 /tree/branch"
                className="h-10 border-slate-200 bg-white pl-10"
              />
            </div>
            <Button className="h-10 px-6" onClick={() => void registerGithubProject()} disabled={isSaving}>
              <Plus className="mr-2 h-4 w-4" />
              {isSaving ? "등록 중" : "GitHub 프로젝트 등록"}
            </Button>
          </div>
          <p className="mt-3 text-xs text-emerald-700">
            branch URL을 넣으면 해당 branch 기준으로, repo URL만 넣으면 default branch 기준으로 분석합니다.
          </p>
        </CardContent>
      </Card>

      {errorMessage && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{errorMessage}</div>}

      {isLoading ? (
        <Card>
          <CardContent className="p-8 text-center text-sm text-slate-500">포트폴리오 프로젝트를 불러오는 중입니다.</CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-6 lg:flex-row">
          <section className="w-full space-y-4 lg:w-1/3">
            <div className="flex items-center justify-between gap-3 px-1">
              <h2 className="text-lg font-semibold text-slate-900">내 프로젝트</h2>
              <span className="text-xs text-slate-400">{filteredProjects.length}개</span>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                value={searchKeyword}
                onChange={(event) => setSearchKeyword(event.target.value)}
                placeholder="프로젝트, repo, branch, 기술 검색"
                className="bg-white pl-9"
              />
            </div>

            {filteredProjects.length === 0 && (
              <Card>
                <CardContent className="p-6 text-sm text-slate-500">
                  등록된 프로젝트가 없습니다. 위 입력창에 GitHub repo URL을 넣어 프로젝트를 등록해 주세요.
                </CardContent>
              </Card>
            )}

            {filteredProjects.map((project) => {
              const isActive = selectedProject?.id === project.id;
              const displayTechStack = getDisplayTechStack(project.techStack);
              return (
                <button key={project.id} type="button" onClick={() => selectProject(project)} className="block w-full text-left">
                  <Card className={`relative cursor-pointer overflow-hidden transition-colors ${isActive ? "border-emerald-500 shadow-sm ring-1 ring-emerald-500" : "hover:border-slate-300"}`}>
                    {isActive && <div className="absolute left-0 top-0 h-full w-1 bg-emerald-500" />}
                    <CardContent className="space-y-3 p-4">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="min-w-0 flex-1 truncate font-semibold text-slate-900" title={project.title}>
                          {project.title}
                        </h3>
                        <span className={`shrink-0 whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] font-semibold ${portfolioStatusClass(project.portfolioStatus)}`}>
                          {project.portfolioStatus}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <p className="break-all font-mono text-xs leading-5 text-slate-500">{project.repoFullName}</p>
                        <span className="inline-flex max-w-full rounded-full bg-slate-100 px-2 py-0.5 font-mono text-[10px] font-semibold text-slate-600">
                          branch: {project.githubBranch}
                        </span>
                      </div>
                      <span className={`inline-flex max-w-full break-words rounded-full px-2 py-0.5 text-[10px] font-semibold ${feedbackStatusClass(project.coachFeedbackStatus)}`}>
                        코치: {project.coachFeedbackStatus}
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {displayTechStack.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-[10px]">
                            {tag}
                          </Badge>
                        ))}
                        {displayTechStack.length === 0 && (
                          <span className="text-[10px] text-slate-400">기술 스택 감지 전</span>
                        )}
                      </div>
                      <div className="flex items-center justify-between border-t border-slate-100 pt-2 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <BookOpen className="h-3 w-3" /> 기록 {project.linkedPostIds.length}개
                        </span>
                        <span className="flex items-center gap-1">
                          <GitCommit className="h-3 w-3" /> {formatDate(project.lastCommitAt)}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </button>
              );
            })}
          </section>

          <section className="w-full space-y-6 lg:w-2/3">
            {selectedProject ? (
              <Card className="bg-white">
                <div className="border-b border-slate-100 p-6">
                  <div className="space-y-4">
                    <div className="min-w-0">
                      <h2 className="text-xl font-bold leading-7 text-slate-900">{selectedProject.title}</h2>
                      <a
                        href={selectedProjectGithubHref ?? undefined}
                        title={selectedProject.githubUrl}
                        className="mt-1 flex min-w-0 items-start gap-1 font-mono text-sm leading-5 text-emerald-600 hover:underline"
                        target="_blank"
                        rel="noreferrer"
                      >
                        <Github className="mt-0.5 h-4 w-4 shrink-0" />
                        <span className="break-all">
                          {selectedProject.repoFullName}
                          <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 font-sans text-xs font-semibold text-slate-600">
                            {selectedProject.githubBranch}
                          </span>
                        </span>
                      </a>
                    </div>
                    <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-4">
                      <Button variant="outline" size="sm" className={`whitespace-nowrap ${sectionActionClass}`} onClick={openPublishDialog} disabled={isSaving}>
                        포트폴리오 게시글로 발행
                      </Button>
                      {selectedProject.publishedPostId && (
                        <Button variant="outline" size="sm" className={`whitespace-nowrap ${sectionActionClass}`} asChild>
                          <Link to={`/posts/${selectedProject.publishedPostId}`}>게시글 보러가기</Link>
                        </Button>
                      )}
                      {selectedProjectGithubHref ? (
                        <Button variant="outline" size="sm" className={`whitespace-nowrap ${utilityActionClass}`} asChild>
                          <a href={selectedProjectGithubHref} target="_blank" rel="noreferrer">
                            <ExternalLink className="mr-1 h-3 w-3" />
                            GitHub 보기
                          </a>
                        </Button>
                      ) : (
                        <Button variant="outline" size="sm" className="whitespace-nowrap" disabled>
                          GitHub URL 확인 필요
                        </Button>
                      )}
                      <Button variant="outline" size="sm" className={`whitespace-nowrap ${utilityActionClass}`} onClick={() => void refreshGithubInfo()} disabled={analyzing}>
                        <RefreshCw className={`mr-1 h-3 w-3 ${analyzing ? "animate-spin" : ""}`} />
                        GitHub 정보 새로고침
                      </Button>
                    </div>
                  </div>
                </div>

                <CardContent className="space-y-6 p-6">
                  <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">포트폴리오 상태</p>
                      <p className="mt-1 text-xs text-slate-500">학생이 직접 현재 정리 상태를 표시합니다.</p>
                    </div>
                    <select
                      value={selectedProject.portfolioStatus}
                      onChange={(event) => void updatePortfolioStatus(event.target.value as PortfolioStatus)}
                      disabled={isSaving}
                      className="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:ring-1 focus:ring-emerald-500"
                    >
                      {portfolioStatuses.map((status) => (
                        <option key={status}>{status}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                      <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                        <FileText className="h-4 w-4 text-emerald-600" />
                        포트폴리오 글
                      </h3>
                      <Button variant="outline" size="sm" className={`whitespace-nowrap ${sectionActionClass}`} asChild>
                        <Link to={`/ai-assistant?project=${selectedProject.id}&type=portfolio`}>
                          <Sparkles className="mr-1 h-3 w-3" />
                          AI 도우미에서 포트폴리오 글 만들기
                        </Link>
                      </Button>
                    </div>
                    <div className="rounded-lg border border-emerald-100 bg-emerald-50/60 p-4 text-sm leading-6 text-slate-700">
                      <p className="line-clamp-5 whitespace-pre-line">
                        {selectedProject.savedPortfolioDraft ?? "아직 저장된 포트폴리오 글이 없습니다."}
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-lg border border-slate-200 bg-white p-4">
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-semibold text-slate-900">면접 예상 질문</p>
                          <Badge variant={selectedProject.aiInterviewSaved ? "success" : "secondary"}>
                            {selectedProject.aiInterviewSaved ? "저장됨" : "저장 전"}
                          </Badge>
                        </div>
                        <Button asChild variant="outline" size="sm" className={sectionActionClass}>
                          <Link to={`/ai-assistant?project=${selectedProject.id}&type=interview`}>면접 질문 만들기</Link>
                        </Button>
                      </div>
                      <p className="line-clamp-5 whitespace-pre-line text-sm leading-6 text-slate-600">
                        {selectedProject.savedInterviewQuestions ??
                          "AI 도우미에서 이 프로젝트를 선택하면 GitHub repo와 연결 기록을 기준으로 면접 예상 질문을 저장할 수 있습니다."}
                      </p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white p-4">
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-semibold text-slate-900">코치 리뷰/피드백</p>
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${feedbackStatusClass(selectedProject.coachFeedbackStatus)}`}>
                            {selectedProject.coachFeedbackStatus}
                          </span>
                        </div>
                        <Button asChild variant="outline" size="sm" className={sectionActionClass}>
                          <Link to="/coach-review">코치 리뷰 요청하기</Link>
                        </Button>
                      </div>
                      <p className="text-sm leading-6 text-slate-600">
                        포트폴리오 글을 저장한 뒤 코치 리뷰를 요청하면 피드백 이력과 상태를 이 프로젝트 기준으로 관리합니다.
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900">
                        <Github className="h-4 w-4 text-slate-500" />
                        GitHub 참고 정보
                      </h3>
                      <div className="space-y-4">
                        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                          <p className="text-xs font-semibold text-slate-500">기술 스택</p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {selectedDisplayTechStack.map((stack) => (
                              <span key={stack} className="rounded-md bg-white px-2 py-1 text-xs font-medium text-slate-700 shadow-sm">
                                {stack}
                              </span>
                            ))}
                            {selectedDisplayTechStack.length === 0 && (
                              <span className="rounded-md bg-white px-2 py-1 text-xs text-slate-500 shadow-sm">
                                아직 기술 스택을 충분히 감지하지 못했습니다.
                              </span>
                            )}
                          </div>
                        </div>
                        <ul className="space-y-2">
                          {selectedProject.recentCommitSummary.slice(0, 3).map((commit) => (
                            <li key={commit} className="flex gap-2 text-sm text-slate-700">
                              <GitCommit className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                              <span>{commit}</span>
                            </li>
                          ))}
                          {selectedProject.recentCommitSummary.length === 0 && (
                            <li className="rounded-md border border-dashed border-slate-200 bg-slate-50 p-3 text-sm text-slate-500">
                              아직 최근 커밋 요약이 없습니다.
                            </li>
                          )}
                        </ul>
                        <details className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                          <summary className="cursor-pointer text-xs font-semibold text-slate-600">
                            GitHub README 참고 자료 보기
                          </summary>
                          <p className="mt-2 text-xs leading-5 text-slate-500">
                            README는 포트폴리오 글의 최종 결과물이 아니라, AI가 프로젝트 배경을 이해할 때 참고하는 자료입니다.
                          </p>
                          <p className="mt-2 text-sm leading-6 text-slate-600">
                            {selectedProject.readmeSummary ?? "아직 README 요약이 없습니다."}
                          </p>
                        </details>
                      </div>
                    </div>

                    <div>
                      <div className="mb-3 flex items-center justify-between gap-2">
                        <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                          <Link2 className="h-4 w-4 text-slate-500" />
                          연결된 학습 기록
                        </h3>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-400">{linkedRecords.length}개</span>
                          <Button variant="outline" size="sm" className={sectionActionClass} onClick={() => setIsConnectOpen(true)}>
                            기록 연결하기
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {linkedRecords.map((record) => (
                          <Link key={record.id} to={`/posts/${record.id}`} className="block rounded-md border border-slate-200 bg-white p-3 transition-colors hover:border-emerald-200 hover:bg-emerald-50/40">
                            <div className="mb-1 flex items-center gap-2">
                              <Badge variant={categoryVariant(record.category)} className="px-1.5 py-0 text-[10px]">
                                {record.category}
                              </Badge>
                              <span className="text-xs text-slate-400">{new Date(record.createdAt).toLocaleDateString("ko-KR")}</span>
                            </div>
                            <p className="text-sm font-medium text-slate-800">{record.title}</p>
                            <p className="mt-1 line-clamp-2 text-xs text-slate-500">{record.summary}</p>
                          </Link>
                        ))}
                        {linkedRecords.length === 0 && (
                          <div className="rounded-md border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">
                            아직 연결된 기록이 없습니다.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-8 text-center text-sm text-slate-500">
                  GitHub 프로젝트를 등록하면 상세 정보와 연결 기록을 관리할 수 있습니다.
                </CardContent>
              </Card>
            )}
          </section>
        </div>
      )}

      <Dialog open={isPublishDialogOpen} onOpenChange={setIsPublishDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>포트폴리오 게시글 발행 설정</DialogTitle>
          </DialogHeader>
          <RadioGroup
            value={publishVisibility}
            onValueChange={(value) => setPublishVisibility(value as "public" | "private")}
            className="grid gap-3"
          >
            <label className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors ${publishVisibility === "public" ? "border-emerald-300 bg-emerald-50" : "border-slate-200 bg-white hover:border-emerald-200 hover:bg-emerald-50/70"}`}>
              <RadioGroupItem value="public" className="mt-1" />
              <span>
                <span className="block text-sm font-semibold text-slate-900">공개</span>
                <span className="mt-1 block text-xs leading-5 text-slate-600">전체 게시글과 내 기록에 함께 보입니다.</span>
              </span>
            </label>
            <label className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors ${publishVisibility === "private" ? "border-emerald-300 bg-emerald-50" : "border-slate-200 bg-white hover:border-emerald-200 hover:bg-emerald-50/70"}`}>
              <RadioGroupItem value="private" className="mt-1" />
              <span>
                <span className="block text-sm font-semibold text-slate-900">비공개</span>
                <span className="mt-1 block text-xs leading-5 text-slate-600">내 기록에서만 확인할 수 있습니다.</span>
              </span>
            </label>
          </RadioGroup>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsPublishDialogOpen(false)} disabled={isSaving}>
              취소
            </Button>
            <Button type="button" onClick={() => void publishPortfolioPost()} disabled={isSaving}>
              {isSaving ? "발행 중" : "선택한 범위로 발행"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {isConnectOpen && selectedProject && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-slate-900/40 p-4">
          <Card className="max-h-[85vh] w-full max-w-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 p-4">
              <div>
                <h2 className="font-bold text-slate-900">기록 연결하기</h2>
                <p className="text-sm text-slate-500">내 기록에서 이 프로젝트와 관련 있는 글을 선택합니다.</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsConnectOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="max-h-[56vh] space-y-2 overflow-y-auto p-4">
              {availablePosts.map((post) => {
                const isChecked = selectedPostIds.includes(post.id);
                return (
                  <label key={post.id} className={`flex cursor-pointer gap-3 rounded-lg border p-3 transition-colors ${isChecked ? "border-emerald-300 bg-emerald-50" : "border-slate-200 hover:bg-slate-50"}`}>
                    <input type="checkbox" checked={isChecked} onChange={() => togglePostSelection(post.id)} className="mt-1 accent-emerald-600" />
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex flex-wrap items-center gap-2">
                        <Badge variant={categoryVariant(post.category)} className="px-1.5 py-0 text-[10px]">
                          {post.category}
                        </Badge>
                        <span className="text-xs text-slate-400">{new Date(post.createdAt).toLocaleDateString("ko-KR")}</span>
                      </div>
                      <p className="font-medium text-slate-900">{post.title}</p>
                      <p className="mt-1 line-clamp-2 text-sm text-slate-500">{post.summary}</p>
                    </div>
                  </label>
                );
              })}
              {availablePosts.length === 0 && (
                <div className="rounded-lg border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">
                  연결할 수 있는 내 기록이 없습니다.
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2 border-t border-slate-100 p-4">
              <Button variant="outline" onClick={() => setIsConnectOpen(false)}>
                취소
              </Button>
              <Button onClick={() => void applyConnectedRecords()} disabled={isSaving}>
                {isSaving ? "저장 중" : "연결 완료"}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
