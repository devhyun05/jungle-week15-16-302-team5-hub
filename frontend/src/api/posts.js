import { apiRequest } from "./client";

export function fetchPosts(params = {}) {
  // TODO: page, size, keyword, post_type, tag query parameter를 조합한다.
  const query = new URLSearchParams(params).toString();
  return apiRequest(`/posts${query ? `?${query}` : ""}`);
}

export function fetchPost(postId) {
  // TODO: 게시글 상세와 유형별 상세 정보, 태그, 댓글 수를 조회한다.
  return apiRequest(`/posts/${postId}`);
}

export function createPost(payload) {
  // TODO: 레시피/실패/후기 유형별 payload를 POST /posts로 보낸다.
  return apiRequest("/posts", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updatePost(postId, payload) {
  // TODO: 작성자 권한이 있는 게시글을 수정한다.
  return apiRequest(`/posts/${postId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function deletePost(postId) {
  // TODO: 작성자 권한이 있는 게시글을 삭제한다.
  return apiRequest(`/posts/${postId}`, { method: "DELETE" });
}
