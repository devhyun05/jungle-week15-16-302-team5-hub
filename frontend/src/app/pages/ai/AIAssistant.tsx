
import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { Bot, Copy, Database, Github, GitCommit, LayoutTemplate, MessageSquare, RefreshCw, Save, Sparkles } from "lucide-react";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import { getMyPosts, type PostListApiItem } from "../../api/posts";
import { getPortfolioProjects, updatePortfolioProject, type PortfolioProjectApiItem } from "../../api/portfolio";

type OutputType = "portfolio" | "interview";

// /me/posts API는 한 번에 최대 50개까지만 조회할 수 있다.
// AI 도우미 참고 기록도 이 API 계약을 지켜야 프로젝트 로딩 전체가 실패하지 않는다.
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
    description: "프로젝트와 연결 기록을 바탕으로 꼬리 질문과 답변 포인트 생성",
    icon: MessageSquare,
  },
] as const;

function buildPortfolioDraft(project: PortfolioProjectApiItem, linkedRecords: PostListApiItem[]) {
  // 실제 OpenAI 호출 전까지는 선택 프로젝트 정보를 이용해 미리보기 초안을 만듭니다.
  const stackText = project.techStack.length > 0 ? project.techStack.slice(0, 3).join(", ") : "등록된 기술 스택";
  const linkedRecordCount = linkedRecords.length;

  return `1. 프로젝트 한 줄 소개
${project.title}는 ${stackText} 기반으로 구현한 프로젝트입니다. GitHub 커밋 기록과 JungleLog에 남긴 ${linkedRecordCount}개의 학습 기록을 연결해 구현 과정과 문제 해결 경험을 포트폴리오 글로 정리합니다.

2. 문제 정의
학습 로그, 트러블슈팅, 회고, 면접 질문이 흩어져 있으면 나중에 포트폴리오로 정리할 때 근거를 다시 찾기 어렵습니다.

3. 나의 역할
JungleLog 안에서 GitHub 프로젝트 등록, 학습 기록 연결, 포트폴리오 초안 저장, 코치 리뷰 요청까지 이어지는 흐름을 설계했습니다.

4. 기술 스택
${project.techStack.length > 0 ? project.techStack.join(", ") : "아직 기술 스택이 등록되지 않았습니다."}

5. 배운 점
AI 기능은 버튼 하나가 아니라 어떤 자료를 참고하고 어떤 결과로 저장되는지 UI에서 먼저 설명되어야 한다는 점을 배웠습니다.`;
}

function buildInterviewQuestions(project: PortfolioProjectApiItem, linkedRecords: PostListApiItem[]) {
  // 면접 질문도 현재는 RAG/Agent 결과가 아니라 선택 프로젝트 데이터 기반 미리보기입니다.
  return `1. ${project.title}에서 GitHub 정보는 어떤 방식으로 활용되나요?
- GitHub repo URL(${project.githubUrl}), 최근 커밋, README를 프로젝트 설명의 근거 자료로 활용합니다.

2. 연결된 학습 기록은 AI 답변에 어떤 영향을 주나요?
- 현재 선택된 프로젝트에는 ${linkedRecords.length}개의 기록이 연결되어 있습니다. 게시글, 트러블슈팅, 회고를 함께 참고해 포트폴리오 문장에 근거를 붙입니다.

3. README 생성 기능을 핵심에서 제외한 이유는 무엇인가요?
- README는 이미 GitHub에 있는 참고 자료에 가깝고, 서비스의 핵심 결과물은 포트폴리오 글과 면접 예상 질문이기 때문입니다.

4. AI 도우미 흐름을 먼저 설계한 이유는 무엇인가요?
- 인증, 포트폴리오, 기록 연결 흐름이 안정되어야 생성 결과도 실제 사용자 데이터와 자연스럽게 이어질 수 있습니다.`;
}

export function AIAssistant() {
  // 포트폴리오 화면에서 넘어올 때 project와 type query string으로 초기 선택값을 맞춥니다.
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

  // AI 도우미는 직접 입력 대신 포트폴리오 관리에 등록된 프로젝트를 기준으로 동작합니다.
  const selectedProject = projects.find((project) => project.id === selectedProjectId) ?? projects[0] ?? null;
  const linkedRecords = useMemo(
    () => (selectedProject ? records.filter((post) => selectedProject.linkedPostIds.includes(post.id)) : []),
    [records, selectedProject],
  );

  const resultText = selectedProject
    ? outputType === "interview"
      ? buildInterviewQuestions(selectedProject, linkedRecords)
      : buildPortfolioDraft(selectedProject, linkedRecords)
    : "";

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
          ? `${updatedProject.title} 결과를 포트폴리오 초안으로 저장했습니다.`
          : `${updatedProject.title} 면접 질문을 보관함에 저장했습니다.`,
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
            포트폴리오 관리에 등록된 프로젝트와 연결 기록을 참고해 포트폴리오 글과 면접 예상 질문을 만듭니다.
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
            <p className="text-sm text-slate-500">먼저 포트폴리오 관리 화면에서 GitHub 프로젝트를 등록해야 AI 도우미가 참고 자료를 구성할 수 있습니다.</p>
            <Button asChild>
              <Link to="/portfolio">포트폴리오 관리로 이동</Link>
            </Button>
          </CardContent>
        </Card>
      ) : selectedProject ? (
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-4">
          <Card>
            <CardHeader className="border-b border-slate-100 pb-4">
                <CardTitle className="text-lg">생성 기준 선택</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 pt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">내 프로젝트 선택</label>
                <select
                  value={selectedProjectId}
                  onChange={(event) => {
                    setSelectedProjectId(Number(event.target.value));
                    setSavedNotice("");
                  }}
                  className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="text-sm font-semibold text-slate-900">{selectedProject.title}</p>
                <p className="mt-1 font-mono text-xs text-slate-500">{selectedProject.repoFullName}</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {selectedProject.techStack.map((stack) => (
                    <Badge key={stack} variant="secondary" className="text-[10px]">
                      {stack}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4">
                <label className="mb-3 block text-sm font-medium text-slate-700">생성할 결과</label>
                <div className="grid grid-cols-1 gap-2">
                  {outputOptions.map((option) => (
                    <label
                      key={option.value}
                      className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${
                        outputType === option.value
                          ? "border-emerald-500 bg-emerald-50"
                          : "border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="outputType"
                        checked={outputType === option.value}
                        onChange={() => setOutputType(option.value)}
                        className="mt-1 accent-emerald-600"
                      />
                      <div>
                        <div className="flex items-center gap-1 text-sm font-medium">
                          <option.icon className="h-3 w-3" />
                          {option.title}
                        </div>
                        <div className="mt-0.5 text-xs text-slate-500">{option.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <Button className="mt-2 h-12 w-full text-base" onClick={refreshResult}>
                <Sparkles className="mr-2 h-5 w-5" />
                결과 다시 구성
              </Button>
              <p className="text-xs text-slate-400">
                선택한 프로젝트와 연결 기록을 기준으로 결과를 구성합니다. 저장된 기록이 많을수록 더 구체적인 결과를 만들 수 있습니다.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b border-slate-100 pb-4">
              <CardTitle className="text-lg">생성 결과 보관함</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-4">
              <div className="rounded-lg border border-slate-200 bg-white p-3">
                <div className="mb-1 flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-slate-900">저장된 포트폴리오 초안</p>
                  <Badge variant={selectedProject.aiDraftSaved ? "success" : "secondary"}>
                    {selectedProject.aiDraftSaved ? "저장됨" : "저장 전"}
                  </Badge>
                </div>
                <p className="line-clamp-4 text-xs leading-5 text-slate-500">
                  {selectedProject.savedPortfolioDraft ?? "아직 저장된 포트폴리오 초안이 없습니다."}
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-3">
                <div className="mb-1 flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-slate-900">저장된 면접 예상 질문</p>
                  <Badge variant={selectedProject.aiInterviewSaved ? "success" : "secondary"}>
                    {selectedProject.aiInterviewSaved ? "저장됨" : "저장 전"}
                  </Badge>
                </div>
                <p className="line-clamp-4 text-xs leading-5 text-slate-500">
                  {selectedProject.savedInterviewQuestions ?? "아직 저장된 면접 예상 질문이 없습니다."}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-6 lg:col-span-8">
          <div className="flex flex-wrap gap-3 rounded-xl bg-slate-900 p-3 text-sm text-slate-300">
            <div className="flex items-center gap-2 rounded border border-slate-700 bg-slate-800 px-3 py-1">
              <Bot className="h-4 w-4 text-emerald-400" />
                <span>AI 생성 모델</span>
            </div>
            <div className="flex items-center gap-2 rounded border border-slate-700 bg-slate-800 px-3 py-1">
              <Github className="h-4 w-4 text-blue-400" />
                <span>GitHub 참고</span>
            </div>
            <div className="flex items-center gap-2 rounded border border-slate-700 bg-slate-800 px-3 py-1">
              <Database className="h-4 w-4 text-purple-400" />
                <span>JungleLog 기록 참고</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Card className="flex h-full flex-col border-slate-200 bg-slate-50">
              <CardHeader className="rounded-t-xl border-b border-slate-200 bg-white pb-3">
                <CardTitle className="flex items-center gap-2 text-sm text-slate-700">
                  <Database className="h-4 w-4" />
                  AI 참고 자료 패널
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 space-y-4 overflow-y-auto p-4">
                <section className="space-y-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">선택된 프로젝트</h4>
                  <div className="rounded border border-slate-200 bg-white p-3 text-xs text-slate-700">
                    <p className="font-semibold text-slate-900">{selectedProject.title}</p>
                    <div className="mt-2 flex items-center gap-2 font-mono text-slate-500">
                      <Github className="h-3 w-3" />
                      {selectedProject.githubUrl}
                    </div>
                    <p className="mt-2 text-slate-500">포트폴리오 초안 상태: {selectedProject.aiDraftSaved ? "저장됨" : "저장 전"}</p>
                  </div>
                </section>

                <section className="space-y-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">GitHub에서 참고할 정보</h4>
                  <div className="rounded border border-slate-200 bg-white p-3 text-xs text-slate-700">
                    <p className="mb-2 font-medium">기술 스택</p>
                    <div className="flex flex-wrap gap-1">
                      {selectedProject.techStack.map((stack) => (
                        <Badge key={stack} variant="secondary" className="text-[10px]">
                          {stack}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="rounded border border-slate-200 bg-white p-3 text-xs text-slate-700">
                    <div className="mb-1 flex items-center gap-2 font-medium">
                      <GitCommit className="h-3 w-3" />
                      최근 커밋 요약
                    </div>
                    <ul className="list-inside list-disc space-y-1 pl-4 text-slate-500">
                      {selectedProject.recentCommitSummary.map((commit) => (
                        <li key={commit}>{commit}</li>
                      ))}
                      {selectedProject.recentCommitSummary.length === 0 && <li>아직 GitHub 커밋 요약이 없습니다.</li>}
                    </ul>
                  </div>
                  <details className="rounded border border-slate-200 bg-white p-3 text-xs text-slate-700">
                    <summary className="cursor-pointer font-medium">GitHub README는 AI가 참고하는 자료입니다</summary>
                    <p className="mt-2 leading-5 text-slate-500">{selectedProject.readmeSummary ?? "아직 README 요약이 없습니다."}</p>
                  </details>
                </section>

                <section className="space-y-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">JungleLog에서 참고할 기록</h4>
                  {linkedRecords.map((record) => (
                    <div key={record.id} className="rounded border border-l-emerald-500 border-slate-200 bg-white p-3 text-xs text-slate-700">
                      <div className="mb-1 flex items-center gap-2 font-medium text-emerald-800">
                        <Badge variant={record.category === "트러블슈팅" ? "warning" : "secondary"} className="px-1.5 py-0 text-[10px]">
                          {record.category}
                        </Badge>
                        {record.title}
                      </div>
                      <p className="line-clamp-3 text-slate-500">{record.summary}</p>
                    </div>
                  ))}
                  {linkedRecords.length === 0 && (
                    <div className="rounded border border-dashed border-slate-200 bg-white p-3 text-xs text-slate-500">
                      연결된 학습 기록이 없습니다. 포트폴리오 관리 화면에서 기록을 연결하면 생성 결과의 참고 자료로 사용할 수 있습니다.
                    </div>
                  )}
                </section>
              </CardContent>
            </Card>

            <Card className="flex h-full flex-col border-emerald-200 shadow-md">
              <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 pb-3">
                <CardTitle className="flex items-center gap-2 text-sm text-emerald-800">
                  <Sparkles className="h-4 w-4" />
                  생성 결과
                </CardTitle>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500" title="복사하기" onClick={copyResult}>
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500" title="다시 구성" onClick={refreshResult}>
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col overflow-hidden rounded-b-xl bg-white p-0">
                <pre className="flex-1 overflow-y-auto whitespace-pre-wrap p-6 text-sm leading-6 text-slate-700">
                  {resultText}
                </pre>
                <div className="space-y-2 border-t border-slate-100 bg-slate-50 p-4">
                  <Button className="w-full shadow-sm" onClick={() => void saveResult()} disabled={isSaving}>
                    <Save className="mr-2 h-4 w-4" />
                    {outputType === "portfolio" ? "포트폴리오 초안으로 저장" : "면접 질문 보관함에 저장"}
                  </Button>
                  {savedNotice && <p className="text-center text-xs text-emerald-700">{savedNotice}</p>}
                  {copyNotice && <p className="text-center text-xs text-slate-500">{copyNotice}</p>}
                  <p className="text-center text-xs text-slate-400">현재 결과는 선택한 프로젝트와 연결 기록을 바탕으로 구성됩니다.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      ) : null}
    </div>
  );
}
