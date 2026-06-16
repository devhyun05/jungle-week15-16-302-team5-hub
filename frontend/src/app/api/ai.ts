import { API_BASE_URL, apiFetch, getErrorMessage } from "./client";

export type AIOutputType = "portfolio" | "interview";

export type AIGeneratePayload = {
  projectId: number;
  outputType: AIOutputType;
};

export type AIGenerateResponse = {
  projectId: number;
  projectTitle: string;
  outputType: AIOutputType;
  model: string;
  content: string;
  references: {
    linkedRecordCount: number;
    githubCommitCount: number;
    readmeIncluded: boolean;
  };
};

type RawAIGenerateResponse = {
  project_id: number;
  project_title: string;
  output_type: AIOutputType;
  model: string;
  content: string;
  references: {
    linked_record_count: number;
    github_commit_count: number;
    readme_included: boolean;
  };
};

function normalizeAIGenerateResponse(data: RawAIGenerateResponse): AIGenerateResponse {
  return {
    projectId: data.project_id,
    projectTitle: data.project_title,
    outputType: data.output_type,
    model: data.model,
    content: data.content,
    references: {
      linkedRecordCount: data.references.linked_record_count,
      githubCommitCount: data.references.github_commit_count,
      readmeIncluded: data.references.readme_included,
    },
  };
}

export async function generateAIContent(payload: AIGeneratePayload): Promise<AIGenerateResponse> {
  const response = await apiFetch(`${API_BASE_URL}/ai/generate`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      project_id: payload.projectId,
      output_type: payload.outputType,
    }),
  });

  if (!response.ok) {
    const message = await getErrorMessage(response);
    throw new Error(message);
  }

  const data = (await response.json()) as RawAIGenerateResponse;

  return normalizeAIGenerateResponse(data);
}
