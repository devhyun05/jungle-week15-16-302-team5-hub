import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { toast } from "sonner";
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
import { generateAIContent, runAIAgent } from "../../api/ai";
import { getDisplayTechStack } from "../../utils/techStack";
import { cleanInterviewQuestionsText } from "../../utils/interviewQuestions";

type OutputType = "portfolio" | "interview";

// /me/posts API는 한 번에 최대 50개까지만 조회할 수 있다.
const AI_ASSISTANT_REFERENCE_POST_PAGE_SIZE = 50;

const outputOptions = [
  {
    value: "portfolio",
    title: "포트폴리오 글 만들기",
    description: "프로젝트 소개, 역할, 문제 해결, 배운 점을 하나의 글로 정리합니다.",
    icon: LayoutTemplate,
  },
  {
    value: "interview",
    title: "면접 예상 질문 만들기",
    description: "프로젝트와 연결 기록을 바탕으로 예상 질문과 답변 포인트를 구성합니다.",
    icon: MessageSquare,
  },
] as const;

export function AIAssistant() {
  const [searchParams] = useSearchParams();
  const queryProjectParam = searchParams.get("project");
  const queryTypeParam = searchParams.get("type");
  const initialType: OutputType | null =
    queryTypeParam === "portfolio" || queryTypeParam === "interview" ? queryTypeParam : null;

  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [projects, setProjects] = useState<PortfolioProjectApiItem[]>([]);
  const [records, setRecords] = useState<PostListApiItem[]>([]);
  const [outputType, setOutputType] = useState<OutputType | null>(initialType);
  const [savedNotice, setSavedNotice] = useState("");
  const [copyNotice, setCopyNotice] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedText, setGeneratedText] = useState("");

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
  const selectedDisplayTechStack = selectedProject ? getDisplayTechStack(selectedProject.techStack) : [];
  const linkedRecords = useMemo(
    () => (selectedProject ? records.filter((post) => selectedProject.linkedPostIds.includes(post.id)) : []),
    [records, selectedProject],
  );
  const savedResultText =
    outputType === "portfolio"
      ? selectedProject?.savedPortfolioDraft ?? ""
      : outputType === "interview"
        ? cleanInterviewQuestionsText(selectedProject?.savedInterviewQuestions)
        : "";
  const resultText = generatedText || savedResultText;
  const hasResultText = resultText.trim().length > 0;

  const saveResult = async () => {
    if (!selectedProject) {
      return;
    }

    if (!outputType) {
      toast.info("저장할 AI 작업을 먼저 선택해주세요.");
      return;
    }

    if (!hasResultText) {
      toast.info(outputType === "portfolio" ? "저장할 포트폴리오 글을 먼저 생성해주세요." : "저장할 면접 예상 질문을 먼저 생성해주세요.");
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

  const generateResult = async () => {
    if (!selectedProject) {
      toast.info("프로젝트를 먼저 선택해주세요.");
      return;
    }

    if (!outputType) {
      toast.info("생성할 작업을 선택해주세요.");
      return;
    }

    setIsGenerating(true);
    setSavedNotice("");
    setErrorMessage("");
    setGeneratedText("");

    try {
      let generatedContent = "";

      try {
        const agentResult = await runAIAgent({
          projectId: selectedProject.id,
          outputType,
          userGoal: outputType === "portfolio" ? "포트폴리오 글 생성" : "면접 예상 질문 생성",
        });

        generatedContent = agentResult.finalContent;
      } catch (agentError) {
        console.warn("Agent generation failed. Falling back to RAG generation.", agentError);

        try {
          generatedContent = await generateAIContent({
            projectId: selectedProject.id,
            outputType,
            generationMode: "rag",
          }).then((response) => response.content);
        } catch (ragError) {
          console.warn("RAG generation failed. Falling back to direct generation.", ragError);

          generatedContent = await generateAIContent({
            projectId: selectedProject.id,
            outputType,
            generationMode: "direct",
          }).then((response) => response.content);
        }
      }

      setGeneratedText(generatedContent);
      toast.success(outputType === "portfolio" ? "AI 포트폴리오 글을 생성했습니다." : "AI 면접 예상 질문을 생성했습니다.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "AI 생성에 실패했습니다.";

      setErrorMessage(message);
      toast.error(message);
    } finally {
      setIsGenerating(false);
    }
  };

  const refreshResult = () => {
    void generateResult();
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
    if (!hasResultText) {
      setCopyNotice("복사할 생성 결과가 없습니다.");
      window.setTimeout(() => setCopyNotice(""), 1400);
      return;
    }

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
            AI는 선택한 프로젝트의 GitHub README, 커밋 메시지, 연결된 JungleLog 기록, 코치 피드백을 참고해 결과를 생성합니다.
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
                    setGeneratedText("");
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
                <p className="text-sm font-semibold text-slate-800">AI 작업</p>
                <div className="grid gap-3">
                  {outputOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        setOutputType(option.value);
                        setGeneratedText("");
                        setSavedNotice("");
                        setErrorMessage("");
                      }}
                      disabled={isGenerating}
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

                <p className="rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs leading-5 text-emerald-800">
                  화면에서는 만들 결과만 고릅니다. 생성하기를 누르면 내부 Agent가 RAG 검색과 필요한 도구 호출을 순서대로 사용합니다.
                </p>
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
                  <p className="rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs leading-5 text-emerald-800">
                    AI는 선택한 프로젝트의 GitHub README, 커밋 메시지, 연결된 JungleLog 기록, 코치 피드백을 참고해 결과를 생성합니다.
                  </p>

                  <section className="space-y-2">
                    <h3 className="text-xs font-semibold uppercase text-slate-400">GitHub</h3>
                    <div className="rounded-lg border border-slate-200 bg-white p-3">
                      <p className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                        <Github className="h-4 w-4 text-slate-500" />
                        {selectedProject.repoFullName}
                      </p>
                      <p className="mt-1 font-mono text-xs text-slate-500">branch: {selectedProject.githubBranch}</p>
                      <p className="mt-3 text-xs font-semibold text-slate-500">기술 스택</p>
                      <div className="mt-3 flex flex-wrap gap-1">
                        {selectedDisplayTechStack.map((stack) => (
                          <Badge key={stack} variant="secondary" className="text-[10px]">
                            {stack}
                          </Badge>
                        ))}
                        {selectedDisplayTechStack.length === 0 && (
                          <span className="text-xs text-slate-500">아직 기술 스택을 충분히 감지하지 못했습니다.</span>
                        )}
                      </div>
                    </div>
                    <details className="rounded-lg border border-slate-200 bg-white p-3">
                      <summary className="cursor-pointer text-sm font-semibold text-slate-900">
                        GitHub README 참고 자료
                      </summary>
                      <div className="ml-6 mt-2 space-y-3">
                        <p className="text-xs leading-5 text-slate-500">
                          화면에는 README 요약만 표시합니다. OpenAI/RAG 연결 후에는 저장된 README 원문 전체를 실제 생성 참고자료로 사용합니다.
                        </p>
                        <Badge variant={selectedProject.readmeContentSaved ? "success" : "secondary"}>
                          {selectedProject.readmeContentSaved ? "README 원문 저장됨" : "README 원문 저장 전"}
                        </Badge>
                        <p className="line-clamp-5 text-sm leading-6 text-slate-600">
                          {selectedProject.readmeSummary ?? "아직 README 요약이 없습니다."}
                        </p>
                      </div>
                    </details>
                    <div className="rounded-lg border border-slate-200 bg-white p-3">
                      <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-900">
                        <GitCommit className="h-4 w-4 text-emerald-600" />
                        GitHub 커밋 메시지 참고 자료
                      </p>
                      <div className="ml-6 space-y-2">
                        <p className="text-xs leading-5 text-slate-500">
                          화면에는 최근 커밋만 표시합니다. OpenAI/RAG 연결 후에는 수집된 커밋 메시지 전체를 생성 참고자료로 사용합니다.
                        </p>
                        <ul className="space-y-1 text-xs leading-5 text-slate-500">
                          {selectedProject.recentCommitSummary.slice(0, 4).map((commit) => (
                            <li key={commit}>- {commit}</li>
                          ))}
                          {selectedProject.recentCommitSummary.length === 0 && <li>- 아직 최근 커밋 요약이 없습니다.</li>}
                        </ul>
                      </div>
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

                  <section className="space-y-2">
                    <h3 className="text-xs font-semibold uppercase text-slate-400">코치 피드백</h3>
                    <div className="rounded-lg border border-slate-200 bg-white p-3">
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-slate-900">코치 리뷰 상태</p>
                        <Badge variant={selectedProject.coachFeedbackStatus === "피드백 완료" ? "success" : "secondary"}>
                          {selectedProject.coachFeedbackStatus}
                        </Badge>
                      </div>
                      <p className="text-xs leading-5 text-slate-500">
                        코치 피드백이 저장되면 이후 포트폴리오 글을 보완하거나 면접 답변 포인트를 정리할 때 함께 참고합니다.
                      </p>
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
                  <Button variant="ghost" size="icon" className="h-8 w-8" title="다시 구성" onClick={refreshResult} disabled={isGenerating}>
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col p-0">
                <div className="flex-1 overflow-y-auto p-6 text-sm leading-7 text-slate-700">
                  {hasResultText ? (
                    <pre className="whitespace-pre-wrap font-sans">{resultText}</pre>
                  ) : (
                    <div className="flex h-full min-h-[320px] items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 text-center text-sm text-slate-500">
                      AI 작업을 선택한 뒤 생성하기 버튼을 누르면 결과가 표시됩니다.
                    </div>
                  )}
                </div>
                <div className="space-y-2 border-t border-slate-100 bg-slate-50 p-4">
                  <Button variant="secondary" className="w-full" onClick={() => void generateResult()} disabled={isGenerating}>
                    <Sparkles className="mr-2 h-4 w-4" />
                    {isGenerating ? "AI 생성 중..." : "생성하기"}
                  </Button>
                  <Button className="w-full" onClick={() => void saveResult()} disabled={isSaving || !hasResultText || !outputType}>
                    <Save className="mr-2 h-4 w-4" />
                    {outputType === "portfolio" ? "포트폴리오 글로 저장" : outputType === "interview" ? "면접 질문으로 저장" : "결과 저장"}
                  </Button>
                  {savedNotice && <p className="text-center text-xs text-emerald-700">{savedNotice}</p>}
                  {copyNotice && <p className="text-center text-xs text-slate-500">{copyNotice}</p>}
                  <p className="text-center text-xs text-slate-400">
                    생성 결과는 저장 후 포트폴리오 관리와 포트폴리오 게시글 발행 흐름에서 다시 사용할 수 있습니다.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      ) : null}
    </div>
  );
}
