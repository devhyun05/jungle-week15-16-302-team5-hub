import { apiRequest } from "./client";
import type { ApiPayload } from "../types";

type QueryValue = string | number | boolean | null | undefined;
type PostQueryParams = Record<string, QueryValue>;

function toSearchParams(params: PostQueryParams) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      query.set(key, String(value));
    }
  });

  return query;
}

// 게시글 목록 가져오기
export function fetchPosts<TResponse = unknown>(params: PostQueryParams = {}) {
  const query = toSearchParams(params).toString();
  return apiRequest<TResponse>(`/posts${query ? `?${query}` : ""}`);
}

// 게시글 하나 가져오기
export function fetchPost<TResponse = unknown>(postId: number | string) {
  return apiRequest<TResponse>(`/posts/${postId}`);
}

// 새 게시글 만들기
export function createPost<TResponse = unknown>(payload: ApiPayload) {
  return apiRequest<TResponse>("/posts", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// 기존 게시글 수정하기
export function updatePost<TResponse = unknown>(postId: number | string, payload: ApiPayload) {
  return apiRequest<TResponse>(`/posts/${postId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

// 게시글 삭제하기
export function deletePost<TResponse = unknown>(postId: number | string) {
  return apiRequest<TResponse>(`/posts/${postId}`, { method: "DELETE" });
}
