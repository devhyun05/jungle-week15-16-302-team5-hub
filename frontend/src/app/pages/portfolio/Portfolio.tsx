import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { BookOpen, FileText, Github, GitCommit, Link2, Plus, RefreshCw, Search, Sparkles, X } from "lucide-react";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card, CardContent } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { getMyPosts, type PostListApiItem } from "../../api/posts";
import {
  createPortfolioProject,
  getPortfolioProjects,
  linkPortfolioProjectPosts,
  updatePortfolioProject,
  type PortfolioProjectApiItem,
  type PortfolioStatus,
} from "../../api/portfolio";

const portfolioStatuses: PortfolioStatus[] = ["작성중", "보완 필요", "정리 완료"];

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
  const [selectedPostIds, setSelectedPostIds] = useState<number[]>([]);
  const [notice, setNotice] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  async function loadPortfolioData() {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const [projectData, postData] = await Promise.all([
        getPortfolioProjects(),
        getMyPosts({ visibility: "all", size: 100 }),
      ]);

      setProjects(projectData.items);
      setAvailablePosts(postData.items);

      const firstProject = projectData.items[0];
      setSelectedProjectId((prev) => prev ?? firstProject?.id ?? null);
      setSelectedPostIds(firstProject?.linkedPostIds ?? []);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "포트폴리오 데이터를 불러오지 못했습니다.");
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
          project.githubUrl.toLowerCase().includes(keyword) ||
          project.techStack.some((stack) => stack.toLowerCase().includes(keyword))
        );
      }),
    [projects, searchKeyword],
  );

  const selectedProject =
    projects.find((project) => project.id === selectedProjectId) ?? filteredProjects[0] ?? projects[0] ?? null;

  const linkedRecords = useMemo(
    () => (selectedProject ? availablePosts.filter((post) => selectedProject.linkedPostIds.includes(post.id)) : []),
    [availablePosts, selectedProject],
  );

  const selectProject = (project: PortfolioProjectApiItem) => {
    setSelectedProjectId(project.id);
    setSelectedPostIds(project.linkedPostIds);
    setNotice("");
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
    if (!repoUrl.trim()) {
      setErrorMessage("GitHub repo URL을 입력해 주세요.");
      return;
    }

    setIsSaving(true);
    setErrorMessage("");
    setNotice("");

    try {
      const newProject = await createPortfolioProject({
        githubUrl: repoUrl,
        techStack: ["GitHub", "분석 예정"],
      });

      upsertProject(newProject);
      setRepoUrl("");
      setNotice("GitHub 프로젝트가 등록되었습니다. 실제 README/커밋 분석은 MCP 연결 후 갱신됩니다.");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "GitHub 프로젝트를 등록하지 못했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  const refreshGithubInfo = () => {
    setAnalyzing(true);
    window.setTimeout(() => {
      setAnalyzing(false);
      setNotice("GitHub 정보 새로고침은 MCP/GitHub API 연결 후 실제 분석으로 바뀔 예정입니다.");
    }, 700);
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
      setNotice("포트폴리오 상태를 저장했습니다.");
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
      setNotice("연결된 학습 기록을 저장했습니다.");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "학습 기록 연결을 저장하지 못했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
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
                placeholder="https://github.com/username/repository"
                className="h-10 border-slate-200 bg-white pl-10"
              />
            </div>
            <Button className="h-10 px-6" onClick={() => void registerGithubProject()} disabled={isSaving}>
              <Plus className="mr-2 h-4 w-4" />
              {isSaving ? "등록 중" : "GitHub 프로젝트 등록"}
            </Button>
          </div>
          <p className="mt-3 text-xs text-emerald-700">
            지금은 repo URL을 DB에 저장합니다. README/커밋 분석은 MCP와 GitHub API 연결 후 자동 갱신됩니다.
          </p>
        </CardContent>
      </Card>

      {errorMessage && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{errorMessage}</div>}
      {notice && <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{notice}</div>}

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
                placeholder="프로젝트, repo, 기술 검색"
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
              return (
                <button key={project.id} type="button" onClick={() => selectProject(project)} className="block w-full text-left">
                  <Card className={`relative cursor-pointer overflow-hidden transition-colors ${isActive ? "border-emerald-500 shadow-sm ring-1 ring-emerald-500" : "hover:border-slate-300"}`}>
                    {isActive && <div className="absolute left-0 top-0 h-full w-1 bg-emerald-500" />}
                    <CardContent className="space-y-3 p-4">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-slate-900">{project.title}</h3>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${portfolioStatusClass(project.portfolioStatus)}`}>
                          {project.portfolioStatus}
                        </span>
                      </div>
                      <p className="font-mono text-xs text-slate-500">{project.repoFullName}</p>
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${feedbackStatusClass(project.coachFeedbackStatus)}`}>
                        코치: {project.coachFeedbackStatus}
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {project.techStack.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-[10px]">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex items-center justify-between border-t border-slate-100 pt-2 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <BookOpen className="h-3 w-3" /> 연결 기록 {project.linkedPostIds.length}개
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
                        href={selectedProject.githubUrl}
                        title={selectedProject.githubUrl}
                        className="mt-1 flex min-w-0 items-start gap-1 font-mono text-sm leading-5 text-emerald-600 hover:underline"
                      >
                        <Github className="mt-0.5 h-4 w-4 shrink-0" />
                        <span className="break-all">{selectedProject.repoFullName}</span>
                      </a>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" className="gap-2 whitespace-nowrap" asChild>
                        <Link to={`/ai-assistant?project=${selectedProject.id}&type=portfolio`}>
                          <Sparkles className="h-4 w-4" />
                          AI 도우미에서 포트폴리오 글 만들기
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" className="whitespace-nowrap" onClick={() => setIsConnectOpen(true)}>
                        기록 연결하기
                      </Button>
                      <Button variant="outline" size="sm" className="whitespace-nowrap" asChild>
                        <Link to="/coach-review">코치 리뷰 요청하기</Link>
                      </Button>
                      <Button variant="ghost" size="sm" className="whitespace-nowrap" onClick={refreshGithubInfo} disabled={analyzing}>
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
                    <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900">
                      <FileText className="h-4 w-4 text-emerald-600" />
                      저장된 포트폴리오 글 초안
                    </h3>
                    <div className="rounded-lg border border-emerald-100 bg-emerald-50/60 p-4 text-sm leading-6 text-slate-700">
                      {selectedProject.savedPortfolioDraft ?? "아직 저장된 포트폴리오 글 초안이 없습니다."}
                    </div>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900">
                        <Github className="h-4 w-4 text-slate-500" />
                        GitHub 참고 정보
                      </h3>
                      <div className="space-y-4">
                        <div className="flex flex-wrap gap-2">
                          {selectedProject.techStack.map((stack) => (
                            <span key={stack} className="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-700">
                              {stack}
                            </span>
                          ))}
                        </div>
                        <ul className="space-y-2">
                          {selectedProject.recentCommitSummary.map((commit) => (
                            <li key={commit} className="flex gap-2 text-sm text-slate-700">
                              <GitCommit className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                              <span>{commit}</span>
                            </li>
                          ))}
                        </ul>
                        <details className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                          <summary className="cursor-pointer text-xs font-semibold text-slate-600">
                            README 요약은 AI 참고 자료로만 보기
                          </summary>
                          <p className="mt-2 text-sm leading-6 text-slate-600">{selectedProject.readmeSummary}</p>
                        </details>
                      </div>
                    </div>

                    <div>
                      <div className="mb-3 flex items-center justify-between">
                        <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                          <Link2 className="h-4 w-4 text-slate-500" />
                          연결된 학습 기록
                        </h3>
                        <span className="text-xs text-slate-400">{linkedRecords.length}개</span>
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
