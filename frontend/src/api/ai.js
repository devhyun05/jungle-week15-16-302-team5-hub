import { apiRequest } from "./client";

export function diagnosePost(postId, location = "Seoul") {
  // TODO: POST /ai/diagnose 호출.
  // 반환값은 상황 요약, 원인 후보, 유사 사례, 습도 정보, 해결 순서, 추천 태그이다.
  return apiRequest("/ai/diagnose", {
    method: "POST",
    body: JSON.stringify({ post_id: postId, location }),
  });
}

export function fetchSimilarPosts(postId) {
  // TODO: RAG 유사 실패 사례만 별도로 조회할 때 사용한다.
  return apiRequest(`/ai/similar-posts/${postId}`);
}

export function suggestTags(payload) {
  // TODO: 게시글 작성 중 AI 자동 태그 추천에 사용한다.
  return apiRequest("/ai/tags/suggest", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
