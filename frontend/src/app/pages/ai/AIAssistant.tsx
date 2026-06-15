import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router";
import {
  Bot,
  BookOpen,
  Copy,
  Database,
  Github,
  GitCommit,
  LayoutTemplate,
  MessageSquare,
  RefreshCw,
  Save,
  Sparkles,
} from "lucide-react";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import { getMyPosts, type PostListApiItem } from "../../api/posts";
import { getPortfolioProjects, updatePortfolioProject, type PortfolioProjectApiItem } from "../../api/portfolio";

type OutputType = "portfolio" | "interview";

// /me/posts API는 한 번에 최대 50개까지만 조회할 수 있다.
const AI_ASSISTANT_REFERENCE_POST_PAGE_SIZE = 50;

const outputOptions = [
  {
    value: "portfolio",
    title: "포트폴리오 글",
    description: "프로젝트 소개, 역할, 문제 해결, 배운 점을 하나의 글로 정리",
    icon: LayoutTemplate,
  },
  {
    value: "interview",
    title: "면접 예상 질문",
    description: "프로젝트와 연결 기록을 바탕으로 꼬리 질문과 답변 포인트 구성",
    icon: MessageSquare,
  },
] as const;

function buildPortfolioDraft(project: PortfolioProjectApiItem, linkedRecords: PostListApiItem[]) {
  // 실제 OpenAI 연결 전까지 선택 프로젝트 정보를 이용해 포트폴리오 글 미리보기를 만든다.
  const stackText = project.techStack.length > 0 ? project.techStack.slice(0, 3).join(", ") : "등록된 기술 스택";
  const linkedRecordCount = linkedRecords.length;

  return `1. 프로젝트 한 줄 소개
${project.title}는 ${stackText} 기반으로 구현한 프로젝트입니다. GitHub ${project.repoFullName}의 ${project.githubBranch} branch와 JungleLog에 남긴 ${linkedRecordCount}개의 학습 기록을 연결해 구현 과정과 문제 해결 경험을 정리합니다.

2. 문제 정의
학습 로그, 트러블슈팅, 회고, 면접 질문이 흩어져 있으면 나중에 포트폴리오로 정리할 때 근거를 다시 찾기 어렵습니다.

3. 나의 역할
GitHub 프로젝트 등록, 학습 기록 연결, 포트폴리오 글 저장, 코치 리뷰 요청까지 이어지는 흐름을 설계하고 구현했습니다.

4. 기술 스택
${project.techStack.length > 0 ? project.techStack.join(", ") : "아직 기술 스택이 등록되지 않았습니다."}

5. 배운 점
AI 기능은 버튼 하나가 아니라 어떤 자료를 참고하고 어떤 결과로 저장되는지 UI에서 먼저 설명되어야 한다는 점을 배웠습니다.`;
}

function buildInterviewQuestions(project: PortfolioProjectApiItem, linkedRecords: PostListApiItem[]) {
  // 실제 AI 호출 전까지 선택 프로젝트 데이터 기반 면접 질문 미리보기를 만든다.
  return `1. ${project.title}에서 GitHub 정보는 어떤 방식으로 활용되나요?
- GitHub repo(${project.repoFullName})의 ${project.githubBranch} branch, 최근 커밋, README를 프로젝트 설명의 근거 자료로 활용합니다.

2. 연결된 학습 기록은 답변에 어떤 영향을 주나요?
- 현재 선택된 프로젝트에는 ${linkedRecords.length}개의 기록이 연결되어 있습니다. 학습 로그, 트러블슈팅, 회고를 함께 참고해 포트폴리오 문장에 근거를 붙입니다.

3. README를 화면에서 크게 강조하지 않는 이유는 무엇인가요?
- README는 이미 GitHub에 있는 참고 자료이고, JungleLog의 핵심 결과물은 포트폴리오 글과 면접 예상 질문이기 때문입니다.

4. AI 도우미 흐름을 먼저 설계한 이유는 무엇인가요?
- 인증, 포트폴리오, 기록 연결 흐름이 안정되어야 생성 결과도 실제 사용자 데이터와 자연스럽게 이어질 수 있습니다.`;
}

function getResultText(project: PortfolioProjectApiItem | null, linkedRecords: PostListApiItem[], outputType: OutputType) {
  // 현재 선택 상태에 맞는 생성 결과 미리보기를 반환한다.
  if (!project) {
    return "";
  }

  return outputType === "interview"
    ? buildInterviewQuestions(project, linkedRecords)
    : buildPortfolioDraft(project, linkedRecords);
}

export function AIAssistant() {
  const [searchParams] = useSearchParams();
  const queryProjectParam = searchParams.get("project");
  const initialType: OutputType = searchParams.get("type") === "interview" ? "interview" : "portfolio";

  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [projects, setProjects] = useState<PortfolioProjectApiItem[]>([]);
  const [records, setRecords] = useState<PostListApiItem[]>([]);
  const [outputType, setOutputType] = useState<OutputType>(initialType);
  const [savedNotice, setSavedNotice] = useState("");
  const [copyNotice, setCopyNotice] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let isActive = true;

    async function loadAIAssistantData() {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const [projectData, postData] = await Promise.all([
          getPortfolioProjects(),
          getMyPosts({ visibility: "all", size: AI_ASSISTANT_REFERENCE_POST_PAGE_SIZE }),
        ]);

        if (!isActive) {
          return;
        }

        const queryProjectId = Number(queryProjectParam);
        const nextSelectedProject =
          projectData.items.find((project) => project.id === queryProjectId) ?? projectData.items[0] ?? null;

        setProjects(projectData.items);
        setRecords(postData.items);
        setSelectedProjectId(nextSelectedProject?.id ?? null);
      } catch (error) {
        if (isActive) {
          setErrorMessage(error instanceof Error ? error.message : "AI 도우미 참고 자료를 불러오지 못했습니다.");
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    void loadAIAssistantData();

    return () => {
      isActive = false;
    };
  }, [queryProjectParam]);

  const selectedProject = projects.find((project) => project.id === selectedProjectId) ?? projects[0] ?? null;
  const linkedRecords = useMemo(
    () => (selectedProject ? records.filter((post) => selectedProject.linkedPostIds.includes(post.id)) : []),
    [records, selectedProject],
  );
  const resultText = getResultText(selectedProject, linkedRecords, outputType);

  const saveResult = async () => {
    if (!selectedProject) {
      return;
    }

    setIsSaving(true);
    setSavedNotice("");
    setErrorMessage("");

    try {
      const updatedProject =
        outputType === "portfolio"
          ? await updatePortfolioProject(selectedProject.id, {
              savedPortfolioDraft: resultText,
              portfolioStatus: "보완 필요",
            })
          : await updatePortfolioProject(selectedProject.id, {
              savedInterviewQuestions: resultText,
            });

      setProjects((prev) => prev.map((project) => (project.id === updatedProject.id ? updatedProject : project)));
      setSavedNotice(
        outputType === "portfolio"
          ? `${updatedProject.title} 포트폴리오 글을 저장했습니다.`
          : `${updatedProject.title} 면접 예상 질문을 저장했습니다.`,
      );
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "생성 결과를 저장하지 못했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  const refreshResult = () => {
    setSavedNotice("선택한 프로젝트 정보를 기준으로 결과를 다시 구성했습니다.");
  };

  const copyResultWithFallback = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      const textarea = document.createElement("textarea");

      textarea.value = text;
      textarea.setAttribute("readonly", "true");
      textarea.style.position = "fixed";
      textarea.style.left = "-9999px";
      document.body.appendChild(textarea);
      textarea.select();

      try {
        return document.execCommand("copy");
      } finally {
        document.body.removeChild(textarea);
      }
    }
  };

  const copyResult = async () => {
    const isCopied = await copyResultWithFallback(resultText);

    setCopyNotice(isCopied ? "결과를 복사했습니다." : "복사 권한을 확인해주세요.");
    window.setTimeout(() => setCopyNotice(""), 1400);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
          <Sparkles className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">AI 포트폴리오 도우미</h1>
          <p className="mt-1 text-slate-500">
            등록된 프로젝트와 연결 기록을 참고해 포트폴리오 글과 면접 예상 질문을 정리합니다.
          </p>
        </div>
      </div>

      {errorMessage && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{errorMessage}</div>}

      {isLoading ? (
        <Card>
          <CardContent className="p-8 text-center text-sm text-slate-500">AI 도우미 참고 자료를 불러오는 중입니다.</CardContent>
        </Card>
      ) : projects.length === 0 ? (
        <Card>
          <CardContent className="space-y-3 p-8 text-center">
            <p className="font-semibold text-slate-900">등록된 포트폴리오 프로젝트가 없습니다.</p>
            <p className="text-sm text-slate-500">먼저 포트폴리오 관리 화면에서 GitHub 프로젝트를 등록해 주세요.</p>
            <Button asChild>
              <Link to="/portfolio">포트폴리오 관리로 이동</Link>
            </Button>
          </CardContent>
        </Card>
      ) : selectedProject ? (
        <>
          <Card>
            <CardContent className="grid gap-5 p-5 lg:grid-cols-[1.4fr_1fr]">
              <div className="space-y-3">
                <label className="text-sm font-semibold text-slate-800">내 프로젝트 선택</label>
                <select
                  value={selectedProjectId ?? ""}
                  onChange={(event) => {
                    setSelectedProjectId(Number(event.target.value));
                    setSavedNotice("");
                  }}
                  className="h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.title} · {project.githubBranch}
                    </option>
                  ))}
                </select>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-base font-bold text-slate-900">{selectedProject.title}</p>
                    <Badge variant="secondary">{selectedProject.githubBranch}</Badge>
                  </div>
                  <p className="mt-2 break-all font-mono text-xs text-slate-500">{selectedProject.repoFullName}</p>
                  <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">
                    {selectedProject.summary ?? "아직 프로젝트 설명이 없습니다."}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-semibold text-slate-800">생성할 결과</p>
                <div className="grid gap-2">
                  {outputOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setOutputType(option.value)}
                      className={`flex items-start gap-3 rounded-lg border p-3 text-left transition-colors ${
                        outputType === option.value
                          ? "border-emerald-500 bg-emerald-50 text-emerald-900"
                          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <option.icon className="mt-0.5 h-4 w-4 shrink-0" />
                      <span>
                        <span className="block text-sm font-semibold">{option.title}</span>
                        <span className="mt-1 block text-xs leading-5 text-slate-500">{option.description}</span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="space-y-6">
              <Card>
                <CardHeader className="border-b border-slate-100 pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Database className="h-4 w-4 text-emerald-600" />
                    참고 자료
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5 p-5">
                  <section className="space-y-2">
                    <h3 className="text-xs font-semibold uppercase text-slate-400">GitHub</h3>
                    <div className="rounded-lg border border-slate-200 bg-white p-3">
                      <p className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                        <Github className="h-4 w-4 text-slate-500" />
                        {selectedProject.repoFullName}
                      </p>
                      <p className="mt-1 font-mono text-xs text-slate-500">branch: {selectedProject.githubBranch}</p>
                      <p className="mt-3 text-xs font-semibold text-slate-500">감지된 기술/문서 유형</p>
                      <div className="mt-3 flex flex-wrap gap-1">
                        {selectedProject.techStack.map((stack) => (
                          <Badge key={stack} variant="secondary" className="text-[10px]">
                            {stack}
                          </Badge>
                        ))}
                        {selectedProject.techStack.length === 0 && (
                          <span className="text-xs text-slate-500">아직 감지된 항목이 없습니다.</span>
                        )}
                      </div>
                    </div>
                    <details className="rounded-lg border border-slate-200 bg-white p-3">
                      <summary className="cursor-pointer text-sm font-semibold text-slate-900">
                        GitHub README 참고 자료
                      </summary>
                      <p className="mt-2 text-xs leading-5 text-slate-500">
                        AI가 포트폴리오 글과 면접 질문을 만들 때 참고하는 README 요약입니다. 최종 결과물은 아래 생성 결과 영역에서 정리합니다.
                      </p>
                      <p className="mt-2 line-clamp-5 text-sm leading-6 text-slate-600">
                        {selectedProject.readmeSummary ?? "아직 README 요약이 없습니다."}
                      </p>
                    </details>
                    <div className="rounded-lg border border-slate-200 bg-white p-3">
                      <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-900">
                        <GitCommit className="h-4 w-4 text-emerald-600" />
                        최근 커밋
                      </p>
                      <ul className="space-y-1 text-xs leading-5 text-slate-500">
                        {selectedProject.recentCommitSummary.slice(0, 4).map((commit) => (
                          <li key={commit}>- {commit}</li>
                        ))}
                        {selectedProject.recentCommitSummary.length === 0 && <li>- 아직 최근 커밋 요약이 없습니다.</li>}
                      </ul>
                    </div>
                  </section>

                  <section className="space-y-2">
                    <h3 className="text-xs font-semibold uppercase text-slate-400">JungleLog 기록</h3>
                    {linkedRecords.map((record) => (
                      <Link
                        key={record.id}
                        to={`/posts/${record.id}`}
                        className="block rounded-lg border border-slate-200 bg-white p-3 transition-colors hover:border-emerald-200 hover:bg-emerald-50/40"
                      >
                        <div className="mb-1 flex items-center gap-2">
                          <BookOpen className="h-3 w-3 text-emerald-600" />
                          <Badge variant={record.category === "트러블슈팅" ? "warning" : "secondary"} className="px-1.5 py-0 text-[10px]">
                            {record.category}
                          </Badge>
                        </div>
                        <p className="text-sm font-medium text-slate-800">{record.title}</p>
                        <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">{record.summary}</p>
                      </Link>
                    ))}
                    {linkedRecords.length === 0 && (
                      <div className="rounded-lg border border-dashed border-slate-200 bg-white p-4 text-sm text-slate-500">
                        연결된 학습 기록이 없습니다.
                      </div>
                    )}
                  </section>

                  <section className="space-y-2">
                    <h3 className="text-xs font-semibold uppercase text-slate-400">저장된 결과</h3>
                    <div className="grid gap-2 sm:grid-cols-2">
                      <div className="rounded-lg border border-slate-200 bg-white p-3">
                        <div className="mb-1 flex items-center justify-between">
                          <p className="text-sm font-semibold text-slate-900">포트폴리오 글</p>
                          <Badge variant={selectedProject.aiDraftSaved ? "success" : "secondary"}>
                            {selectedProject.aiDraftSaved ? "저장됨" : "저장 전"}
                          </Badge>
                        </div>
                        <p className="line-clamp-3 text-xs leading-5 text-slate-500">
                          {selectedProject.savedPortfolioDraft ?? "아직 저장된 포트폴리오 글이 없습니다."}
                        </p>
                      </div>
                      <div className="rounded-lg border border-slate-200 bg-white p-3">
                        <div className="mb-1 flex items-center justify-between">
                          <p className="text-sm font-semibold text-slate-900">면접 질문</p>
                          <Badge variant={selectedProject.aiInterviewSaved ? "success" : "secondary"}>
                            {selectedProject.aiInterviewSaved ? "저장됨" : "저장 전"}
                          </Badge>
                        </div>
                        <p className="line-clamp-3 text-xs leading-5 text-slate-500">
                          {selectedProject.savedInterviewQuestions ?? "아직 저장된 면접 예상 질문이 없습니다."}
                        </p>
                      </div>
                    </div>
                  </section>
                </CardContent>
              </Card>
            </div>

            <Card className="flex min-h-[620px] flex-col border-emerald-200 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 pb-3">
                <CardTitle className="flex items-center gap-2 text-base text-emerald-800">
                  <Bot className="h-4 w-4" />
                  생성 결과
                </CardTitle>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" title="복사하기" onClick={copyResult}>
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" title="다시 구성" onClick={refreshResult}>
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col p-0">
                <pre className="flex-1 overflow-y-auto whitespace-pre-wrap p-6 text-sm leading-7 text-slate-700">
                  {resultText}
                </pre>
                <div className="space-y-2 border-t border-slate-100 bg-slate-50 p-4">
                  <Button className="w-full" onClick={() => void saveResult()} disabled={isSaving}>
                    <Save className="mr-2 h-4 w-4" />
                    {outputType === "portfolio" ? "포트폴리오 글로 저장" : "면접 질문으로 저장"}
                  </Button>
                  {savedNotice && <p className="text-center text-xs text-emerald-700">{savedNotice}</p>}
                  {copyNotice && <p className="text-center text-xs text-slate-500">{copyNotice}</p>}
                  <p className="text-center text-xs text-slate-400">OpenAI 연결 전에는 선택한 프로젝트 데이터로 결과 형태를 미리 구성합니다.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      ) : null}
    </div>
  );
}
