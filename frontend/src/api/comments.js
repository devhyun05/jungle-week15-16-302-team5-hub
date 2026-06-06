import { apiRequest } from "./client";

export function fetchComments(postId) {
  // TODO: 게시글 상세 화면에서 댓글 목록을 조회한다.
  return apiRequest(`/posts/${postId}/comments`);
}

export function createComment(postId, payload) {
  // TODO: 댓글 작성 후 댓글 목록을 갱신한다.
  return apiRequest(`/posts/${postId}/comments`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function deleteComment(commentId) {
  // TODO: 댓글 작성자만 삭제할 수 있도록 백엔드 응답을 처리한다.
  return apiRequest(`/comments/${commentId}`, { method: "DELETE" });
}
