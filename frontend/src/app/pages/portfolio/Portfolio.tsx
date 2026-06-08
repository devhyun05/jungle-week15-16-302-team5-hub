
import { useMemo, useState } from "react";
import { Link } from "react-router";
import { BookOpen, FileText, Github, GitCommit, Link2, Plus, RefreshCw, Search, Sparkles, X } from "lucide-react";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card, CardContent } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { portfolioProjects, posts, type PortfolioProject, type PortfolioStatus } from "../../data/mockData";

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

export function Portfolio() {
  // projects는 서버 DB 대신 현재 화면에서만 유지되는 포트폴리오 프로젝트 목록입니다.
  const [projects, setProjects] = useState<PortfolioProject[]>(portfolioProjects);
  const [repoUrl, setRepoUrl] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState(portfolioProjects[0].id);
  const [isConnectOpen, setIsConnectOpen] = useState(false);
  const [selectedPostIds, setSelectedPostIds] = useState<number[]>(portfolioProjects[0].linkedPostIds);
  const [notice, setNotice] = useState("");

  // 프로젝트 검색창은 프로젝트명, repo, GitHub URL, 기술 스택을 기준으로 필터링합니다.
  const filteredProjects = useMemo(
    () =>
      projects.filter((project) => {
        const keyword = searchKeyword.trim().toLowerCase();
        if (!keyword) return true;

        return (
          project.title.toLowerCase().includes(keyword) ||
          project.repo.toLowerCase().includes(keyword) ||
          project.githubUrl.toLowerCase().includes(keyword) ||
          project.stack.some((stack) => stack.toLowerCase().includes(keyword))
        );
      }),
    [projects, searchKeyword],
  );

  // 왼쪽에서 선택한 프로젝트가 오른쪽 상세 패널의 기준 데이터가 됩니다.
  const selectedProject = projects.find((project) => project.id === selectedProjectId) ?? filteredProjects[0] ?? projects[0];
  const linkedRecords = useMemo(
    () => posts.filter((post) => selectedProject.linkedPostIds.includes(post.id)),
    [selectedProject.linkedPostIds],
  );

  const selectProject = (project: PortfolioProject) => {
    setSelectedProjectId(project.id);
    setSelectedPostIds(project.linkedPostIds);
    setNotice("");
  };

  const registerGithubProject = () => {
    if (!repoUrl.trim()) {
      setNotice("GitHub repo URL을 입력해주세요.");
      return;
    }

    const repo = repoUrl.replace("https://github.com/", "").replace("http://github.com/", "");
    const newProject: PortfolioProject = {
      id: `portfolio-local-${Date.now()}`,
      title: repo.split("/").at(-1) || "새 GitHub 프로젝트",
      category: "포트폴리오 관리",
      categorySlug: "portfolio",
      repo,
      githubUrl: repoUrl,
      stack: ["GitHub", "분석 예정"],
      readmeSummary: "GitHub README는 AI 생성 시 참고 자료로 사용할 예정입니다.",
      recentCommitSummary: ["GitHub 프로젝트 등록 mock 동작"],
      linkedRecordCount: 0,
      linkedPostIds: [],
      portfolioStatus: "작성중",
      coachFeedbackStatus: "요청 전",
      githubConnected: true,
      aiDraftSaved: false,
      savedPortfolioDraft: "아직 저장된 포트폴리오 글 초안이 없습니다. AI 도우미에서 초안을 생성해보세요.",
      summary: "GitHub repo URL로 등록한 mock 프로젝트입니다.",
      lastCommitAt: "방금 전",
    };

    // TODO backend: 실제 GitHub 프로젝트 등록과 분석 결과 저장 API는 백엔드/MCP 연결 후 구현 예정.
    // 지금은 입력한 repo URL로 mock 프로젝트를 만들어 목록에 추가합니다.
    setProjects((prev) => [newProject, ...prev]);
    setSelectedProjectId(newProject.id);
    setSelectedPostIds([]);
    setRepoUrl("");
    setNotice("mock으로 GitHub 프로젝트가 등록되었습니다.");
  };

  const refreshGithubInfo = () => {
    setAnalyzing(true);
    window.setTimeout(() => {
      setAnalyzing(false);
      setNotice("mock으로 GitHub 정보를 새로고침했습니다.");
    }, 700);
  };

  const updatePortfolioStatus = (status: PortfolioStatus) => {
    setProjects((prev) =>
      prev.map((project) => (project.id === selectedProject.id ? { ...project, portfolioStatus: status } : project)),
    );
  };

  const togglePostSelection = (postId: number) => {
    setSelectedPostIds((prev) => (prev.includes(postId) ? prev.filter((id) => id !== postId) : [...prev, postId]));
  };

  const applyConnectedRecords = () => {
    // TODO backend: 실제 프로젝트-게시글 연결 저장 API는 백엔드 연결 후 구현 예정.
    // 지금은 selectedPostIds를 현재 프로젝트의 linkedPostIds에 반영하는 mock 동작입니다.
    setProjects((prev) =>
      prev.map((project) =>
        project.id === selectedProject.id
          ? { ...project, linkedPostIds: selectedPostIds, linkedRecordCount: selectedPostIds.length }
          : project,
      ),
    );
    setIsConnectOpen(false);
    setNotice("mock으로 연결된 학습 기록을 변경했습니다.");
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
            <Button className="h-10 px-6" onClick={registerGithubProject}>
              <Plus className="mr-2 h-4 w-4" />
              GitHub 프로젝트 등록
            </Button>
          </div>
          <p className="mt-3 text-xs text-emerald-700">
            현재는 mock 등록입니다. 실제 GitHub API/MCP 분석과 프로젝트 저장은 백엔드 연결 후 구현 예정입니다.
          </p>
        </CardContent>
      </Card>

      {notice && <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{notice}</div>}

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

          {filteredProjects.map((project) => {
            const isActive = project.id === selectedProject.id;
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
                    <p className="font-mono text-xs text-slate-500">{project.repo}</p>
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${feedbackStatusClass(project.coachFeedbackStatus)}`}>
                      코치: {project.coachFeedbackStatus}
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {project.stack.slice(0, 3).map((tag) => (
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
                        <GitCommit className="h-3 w-3" /> {project.lastCommitAt}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </button>
            );
          })}
        </section>

        <section className="w-full space-y-6 lg:w-2/3">
          <Card className="bg-white">
            <div className="border-b border-slate-100 p-6">
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">{selectedProject.title}</h2>
                  <a href={selectedProject.githubUrl} className="mt-1 flex items-center gap-1 font-mono text-sm text-emerald-600 hover:underline">
                    <Github className="h-4 w-4" /> {selectedProject.repo}
                  </a>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" className="gap-2" asChild>
                    <Link to={`/ai-assistant?project=${selectedProject.id}&type=portfolio`}>
                      <Sparkles className="h-4 w-4" />
                      AI 도우미에서 포트폴리오 글 만들기
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setIsConnectOpen(true)}>
                    기록 연결하기
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/coach-review">코치 리뷰 요청하기</Link>
                  </Button>
                  <Button variant="ghost" size="sm" onClick={refreshGithubInfo} disabled={analyzing}>
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
                  onChange={(event) => updatePortfolioStatus(event.target.value as PortfolioStatus)}
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
                  {selectedProject.savedPortfolioDraft}
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
                      {selectedProject.stack.map((stack) => (
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
                          <span className="text-xs text-slate-400">{record.createdAt}</span>
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
                  <p className="mt-3 text-xs text-slate-400">
                    실제 프로젝트-게시글 연결 저장은 백엔드 연결 후 구현 예정입니다.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>

      {isConnectOpen && (
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
              {posts.map((post) => {
                const isChecked = selectedPostIds.includes(post.id);
                return (
                  <label key={post.id} className={`flex cursor-pointer gap-3 rounded-lg border p-3 transition-colors ${isChecked ? "border-emerald-300 bg-emerald-50" : "border-slate-200 hover:bg-slate-50"}`}>
                    <input type="checkbox" checked={isChecked} onChange={() => togglePostSelection(post.id)} className="mt-1 accent-emerald-600" />
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex flex-wrap items-center gap-2">
                        <Badge variant={categoryVariant(post.category)} className="px-1.5 py-0 text-[10px]">
                          {post.category}
                        </Badge>
                        <span className="text-xs text-slate-400">{post.createdAt}</span>
                      </div>
                      <p className="font-medium text-slate-900">{post.title}</p>
                      <p className="mt-1 line-clamp-2 text-sm text-slate-500">{post.summary}</p>
                    </div>
                  </label>
                );
              })}
            </div>
            <div className="flex justify-end gap-2 border-t border-slate-100 p-4">
              <Button variant="outline" onClick={() => setIsConnectOpen(false)}>
                취소
              </Button>
              <Button onClick={applyConnectedRecords}>연결 완료</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
