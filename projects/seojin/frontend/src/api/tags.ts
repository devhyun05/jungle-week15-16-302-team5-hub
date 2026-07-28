import { apiRequest } from "./client";

export function fetchTags<TResponse = unknown>() {
  return apiRequest<TResponse>("/tags");
}

export function fetchPopularTags<TResponse = unknown>() {
  return apiRequest<TResponse>("/tags/popular");
}
