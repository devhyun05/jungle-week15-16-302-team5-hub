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

export function fetchPosts<TResponse = unknown>(params: PostQueryParams = {}) {
  // TODO: page, size, keyword, post_type, tag query parameter를 조합한다.
  const query = toSearchParams(params).toString();
  return apiRequest<TResponse>(`/posts${query ? `?${query}` : ""}`);
}

export function fetchPost<TResponse = unknown>(postId: number | string) {
  // TODO: 게시글 상세와 유형별 상세 정보, 태그, 댓글 수를 조회한다.
  return apiRequest<TResponse>(`/posts/${postId}`);
}

export function createPost<TResponse = unknown>(payload: ApiPayload) {
  // TODO: 레시피/실패/후기 유형별 payload를 POST /posts로 보낸다.
  return apiRequest<TResponse>("/posts", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updatePost<TResponse = unknown>(postId: number | string, payload: ApiPayload) {
  // TODO: 작성자 권한이 있는 게시글을 수정한다.
  return apiRequest<TResponse>(`/posts/${postId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function deletePost<TResponse = unknown>(postId: number | string) {
  // TODO: 작성자 권한이 있는 게시글을 삭제한다.
  return apiRequest<TResponse>(`/posts/${postId}`, { method: "DELETE" });
}
