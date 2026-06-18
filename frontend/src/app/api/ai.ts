import { API_BASE_URL, apiFetch, getErrorMessage } from "./client";

export type AIOutputType = "portfolio" | "interview";
export type AIGenerationMode = "direct" | "rag" | "agent";

export type AIGeneratePayload = {
  projectId: number;
  outputType: AIOutputType;
  generationMode?: AIGenerationMode;
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
      ragContextCount: number;
      generationMode: AIGenerationMode;
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
      rag_context_count: number;
      generation_mode: AIGenerationMode;
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
      ragContextCount: data.references.rag_context_count,
      generationMode: data.references.generation_mode,
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
      generation_mode: payload.generationMode ?? "direct",
    }),
  });

  if (!response.ok) {
    const message = await getErrorMessage(response);
    throw new Error(message);
  }

  const data = (await response.json()) as RawAIGenerateResponse;

  return normalizeAIGenerateResponse(data);
}

export type AIAgentRunPayload = {
  projectId: number;
  outputType: AIOutputType;
  userGoal?: string;
};

export type AIAgentRunResponse = {
  projectId: number;
  outputType: AIOutputType;
  finalContent: string;
  stoppedReason: string;
  toolCalls: Array<{
    step: number;
    toolName: string;
    status: string;
    summary: string;
  }>;
};

type RawAIAgentRunResponse = {
  project_id: number;
  output_type: AIOutputType;
  final_content: string;
  stopped_reason: string;
  tool_calls: Array<{
    step: number;
    tool_name: string;
    status: string;
    summary: string;
  }>;
};

export async function runAIAgent(payload: AIAgentRunPayload): Promise<AIAgentRunResponse> {
  const response = await apiFetch(`${API_BASE_URL}/ai/agent/run`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      project_id: payload.projectId,
      output_type: payload.outputType,
      user_goal: payload.userGoal ?? "",
    }),
  });

  if (!response.ok) {
    const message = await getErrorMessage(response);
    throw new Error(message);
  }

  const data = (await response.json()) as RawAIAgentRunResponse;

  return {
    projectId: data.project_id,
    outputType: data.output_type,
    finalContent: data.final_content,
    stoppedReason: data.stopped_reason,
    toolCalls: data.tool_calls.map((toolCall) => ({
      step: toolCall.step,
      toolName: toolCall.tool_name,
      status: toolCall.status,
      summary: toolCall.summary,
    })),
  };
}
