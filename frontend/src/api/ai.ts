import { apiRequest } from "./client";

export interface RagResult {
  post_id?: number | null;
  title: string;
  post_type: string;
  score: number;
  excerpt: string;
  tags: string[];
}

export interface RagSearchResponse {
  query: string;
  items: RagResult[];
}

export interface ProductResult {
  material: string;
  search_keyword: string;
  estimated_price: string;
  source: string;
  link: string;
}

export interface ProductSearchResponse {
  query: string;
  inferred_materials: string[];
  items: ProductResult[];
  adapter: string;
}

export interface AgentRouteResponse {
  route: "rag" | "mcp" | "rag+mcp";
  tool_calls: string[];
  answer: string;
  rag?: RagSearchResponse | null;
  products?: ProductSearchResponse | null;
  recommended_tags: string[];
}

export function routeAgent(message: string) {
  return apiRequest<AgentRouteResponse>("/ai/agent/route", {
    method: "POST",
    body: JSON.stringify({ message }),
  });
}
