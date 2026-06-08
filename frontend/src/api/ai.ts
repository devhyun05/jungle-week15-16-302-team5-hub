import { apiRequest } from "./client";
import type { ApiPayload } from "../types";

export function diagnosePost<TResponse = unknown>(postId: number | string, location = "Seoul") {
  // TODO: POST /ai/diagnose 호출.
  // 반환값은 상황 요약, 원인 후보, 유사 사례, 습도 정보, 해결 순서, 추천 태그이다.
  return apiRequest<TResponse>("/ai/diagnose", {
    method: "POST",
    body: JSON.stringify({ post_id: postId, location }),
  });
}

export function fetchSimilarPosts<TResponse = unknown>(postId: number | string) {
  // TODO: RAG 유사 실패 사례만 별도로 조회할 때 사용한다.
  return apiRequest<TResponse>(`/ai/similar-posts/${postId}`);
}

export function suggestTags<TResponse = unknown>(payload: ApiPayload) {
  // TODO: 게시글 작성 중 AI 자동 태그 추천에 사용한다.
  return apiRequest<TResponse>("/ai/tags/suggest", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
