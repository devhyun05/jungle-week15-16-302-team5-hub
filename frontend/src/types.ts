export type PostType = "recipe" | "failure" | "review" | "tip";

export type Tone = "mint" | "lavender" | "coral";

export interface PostCardData {
  id?: number | string;
  type?: PostType;
  title?: string;
  summary?: string;
  tags?: string[];
  hasImage?: boolean;
  author?: string;
  time?: string;
  comments?: number;
  saves?: number;
}

export interface DiagnosisResult {
  summary?: string;
  cause?: string;
  solutionSteps?: string[];
  weather?: string;
}

export interface AuthPayload {
  email: string;
  password: string;
  nickname?: string;
}

export type ApiPayload = Record<string, unknown>;
