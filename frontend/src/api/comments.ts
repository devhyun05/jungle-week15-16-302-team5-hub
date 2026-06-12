import { apiRequest } from "./client";
import type { ApiPayload } from "../types";

export function fetchComments<TResponse = unknown>(postId: number | string) {
  return apiRequest<TResponse>(`/posts/${postId}/comments`);
}

export function createComment<TResponse = unknown>(postId: number | string, payload: ApiPayload) {
  return apiRequest<TResponse>(`/posts/${postId}/comments`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function deleteComment<TResponse = unknown>(commentId: number | string) {
  return apiRequest<TResponse>(`/comments/${commentId}`, { method: "DELETE" });
}

export function updateComment<TResponse = unknown>(commentId: number | string, payload: ApiPayload) {
  return apiRequest<TResponse>(`/comments/${commentId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}
