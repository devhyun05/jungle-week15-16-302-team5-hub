import { API_BASE_URL, apiFetch, getErrorMessage } from "./client";

export type PortfolioStatus = "작성중" | "보완 필요" | "정리 완료";

export type PortfolioProjectApiItem = {
  id: number;
  title: string;
  repoFullName: string;
  githubUrl: string;
  summary: string | null;
  techStack: string[];
  readmeSummary: string | null;
  recentCommitSummary: string[];
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

export async function getPortfolioProjects(): Promise<PortfolioProjectListResponse> {
  const response = await apiFetch(`${API_BASE_URL}/portfolio/projects`, {
    credentials: "include",
  });

  if (!response.ok) {
    const message = await getErrorMessage(response);
    throw new Error(message);
  }

  return response.json();
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

  return response.json();
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

  return response.json();
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

  return response.json();
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

  return response.json();
}
