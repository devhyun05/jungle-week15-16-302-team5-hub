import { apiRequest } from "./client";
import type { ApiPayload } from "../types";

export function fetchComments<TResponse = unknown>(postId: number | string) {
  // TODO: 게시글 상세 화면에서 댓글 목록을 조회한다.
  return apiRequest<TResponse>(`/posts/${postId}/comments`);
}

export function createComment<TResponse = unknown>(postId: number | string, payload: ApiPayload) {
  // TODO: 댓글 작성 후 댓글 목록을 갱신한다.
  return apiRequest<TResponse>(`/posts/${postId}/comments`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function deleteComment<TResponse = unknown>(commentId: number | string) {
  // TODO: 댓글 작성자만 삭제할 수 있도록 백엔드 응답을 처리한다.
  return apiRequest<TResponse>(`/comments/${commentId}`, { method: "DELETE" });
}
