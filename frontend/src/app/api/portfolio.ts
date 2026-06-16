import { API_BASE_URL, apiFetch, getErrorMessage } from "./client";

export type PortfolioStatus = "작성중" | "보완 필요" | "정리 완료";

export type PortfolioProjectApiItem = {
  id: number;
  title: string;
  publishedPostId: number | null;
  publishedPostIsPublic: boolean | null;
  publishStatus?: "created" | "updated" | "unchanged" | null;
  repoFullName: string;
  githubBranch: string;
  githubUrl: string;
  summary: string | null;
  techStack: string[];
  readmeSummary: string | null;
  readmeContentSaved: boolean;
  recentCommitSummary: string[];
  githubCommits: {
    sha: string;
    message: string;
    authorName: string | null;
    committedAt: string | null;
    htmlUrl: string | null;
  }[];
  savedPortfolioDraft: string | null;
  savedInterviewQuestions: string | null;
  portfolioStatus: PortfolioStatus;
  coachFeedbackStatus: string;
  githubConnected: boolean;
  aiDraftSaved: boolean;
  aiInterviewSaved: boolean;
  lastCommitAt: string | null;
  linkedPostIds: number[];
  linkedRecordCount: number;
  createdAt: string;
  updatedAt: string;
};

export type PortfolioProjectListResponse = {
  items: PortfolioProjectApiItem[];
  total: number;
};

export type PortfolioProjectCreatePayload = {
  githubUrl: string;
  title?: string;
  summary?: string;
  techStack?: string[];
};

export type PortfolioProjectUpdatePayload = {
  title?: string;
  summary?: string;
  techStack?: string[];
  portfolioStatus?: PortfolioStatus;
  savedPortfolioDraft?: string;
  savedInterviewQuestions?: string;
};

type RawPortfolioProjectApiItem = Partial<PortfolioProjectApiItem> & {
  id: number;
  title?: string | null;
};

function normalizeStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function normalizeNumberArray(value: unknown): number[] {
  return Array.isArray(value) ? value.filter((item): item is number => typeof item === "number") : [];
}

function normalizeGithubCommits(value: unknown): PortfolioProjectApiItem["githubCommits"] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((commit): commit is Record<string, unknown> => commit !== null && typeof commit === "object")
    .map((commit) => ({
      sha: typeof commit.sha === "string" ? commit.sha : "",
      message: typeof commit.message === "string" ? commit.message : "",
      authorName: typeof commit.authorName === "string" ? commit.authorName : null,
      committedAt: typeof commit.committedAt === "string" ? commit.committedAt : null,
      htmlUrl: typeof commit.htmlUrl === "string" ? commit.htmlUrl : null,
    }))
    .filter((commit) => commit.sha && commit.message);
}

function normalizePortfolioProject(item: RawPortfolioProjectApiItem): PortfolioProjectApiItem {
  // 백엔드가 재시작되기 전이거나 과거 응답 캐시가 남아 있으면 새 필드가 없을 수 있다.
  // 화면 컴포넌트가 배열/boolean 필드를 바로 읽어도 런타임에서 깨지지 않도록 API 경계에서 기본값을 맞춘다.
  return {
    id: item.id,
    title: item.title ?? "이름 없는 프로젝트",
    publishedPostId: item.publishedPostId ?? null,
    publishedPostIsPublic: item.publishedPostIsPublic ?? null,
    publishStatus: item.publishStatus ?? null,
    repoFullName: item.repoFullName ?? "",
    githubBranch: item.githubBranch ?? "main",
    githubUrl: item.githubUrl ?? "",
    summary: item.summary ?? null,
    techStack: normalizeStringArray(item.techStack),
    readmeSummary: item.readmeSummary ?? null,
    readmeContentSaved: Boolean(item.readmeContentSaved),
    recentCommitSummary: normalizeStringArray(item.recentCommitSummary),
    githubCommits: normalizeGithubCommits(item.githubCommits),
    savedPortfolioDraft: item.savedPortfolioDraft ?? null,
    savedInterviewQuestions: item.savedInterviewQuestions ?? null,
    portfolioStatus: item.portfolioStatus ?? "작성중",
    coachFeedbackStatus: item.coachFeedbackStatus ?? "요청 전",
    githubConnected: Boolean(item.githubConnected),
    aiDraftSaved: Boolean(item.aiDraftSaved),
    aiInterviewSaved: Boolean(item.aiInterviewSaved),
    lastCommitAt: item.lastCommitAt ?? null,
    linkedPostIds: normalizeNumberArray(item.linkedPostIds),
    linkedRecordCount: item.linkedRecordCount ?? normalizeNumberArray(item.linkedPostIds).length,
    createdAt: item.createdAt ?? new Date().toISOString(),
    updatedAt: item.updatedAt ?? new Date().toISOString(),
  };
}

function normalizePortfolioProjectList(data: unknown): PortfolioProjectListResponse {
  const rawItems =
    data !== null &&
    typeof data === "object" &&
    "items" in data &&
    Array.isArray((data as { items: unknown }).items)
      ? (data as { items: RawPortfolioProjectApiItem[] }).items
      : [];

  return {
    items: rawItems.map(normalizePortfolioProject),
    total:
      data !== null && typeof data === "object" && "total" in data && typeof (data as { total: unknown }).total === "number"
        ? (data as { total: number }).total
        : rawItems.length,
  };
}

export async function getPortfolioProjects(): Promise<PortfolioProjectListResponse> {
  const response = await apiFetch(`${API_BASE_URL}/portfolio/projects`, {
    credentials: "include",
  });

  if (!response.ok) {
    const message = await getErrorMessage(response);
    throw new Error(message);
  }

  const data = await response.json();

  return normalizePortfolioProjectList(data);
}

export async function createPortfolioProject(payload: PortfolioProjectCreatePayload): Promise<PortfolioProjectApiItem> {
  const response = await apiFetch(`${API_BASE_URL}/portfolio/projects`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const message = await getErrorMessage(response);
    throw new Error(message);
  }

  const data = await response.json();

  return normalizePortfolioProject(data);
}

export async function updatePortfolioProject(
  projectId: number,
  payload: PortfolioProjectUpdatePayload,
): Promise<PortfolioProjectApiItem> {
  const response = await apiFetch(`${API_BASE_URL}/portfolio/projects/${projectId}`, {
    method: "PATCH",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const message = await getErrorMessage(response);
    throw new Error(message);
  }

  const data = await response.json();

  return normalizePortfolioProject(data);
}

export async function linkPortfolioProjectPosts(projectId: number, postIds: number[]): Promise<PortfolioProjectApiItem> {
  const response = await apiFetch(`${API_BASE_URL}/portfolio/projects/${projectId}/posts`, {
    method: "PUT",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ postIds }),
  });

  if (!response.ok) {
    const message = await getErrorMessage(response);
    throw new Error(message);
  }

  const data = await response.json();

  return normalizePortfolioProject(data);
}

export async function refreshPortfolioProjectGithubInfo(projectId: number): Promise<PortfolioProjectApiItem> {
  const response = await apiFetch(`${API_BASE_URL}/portfolio/projects/${projectId}/github/refresh`, {
    method: "POST",
    credentials: "include",
  });

  if (!response.ok) {
    const message = await getErrorMessage(response);
    throw new Error(message);
  }

  const data = await response.json();

  return normalizePortfolioProject(data);
}

export async function publishPortfolioProjectPost(projectId: number, isPublic: boolean): Promise<PortfolioProjectApiItem> {
  const response = await apiFetch(`${API_BASE_URL}/portfolio/projects/${projectId}/publish-post`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ isPublic }),
  });

  if (!response.ok) {
    const message = await getErrorMessage(response);
    throw new Error(message);
  }

  const data = await response.json();

  return normalizePortfolioProject(data);
}

export async function deletePortfolioProject(projectId: number): Promise<void> {
  const response = await apiFetch(`${API_BASE_URL}/portfolio/projects/${projectId}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!response.ok) {
    const message = await getErrorMessage(response);
    throw new Error(message);
  }
}
