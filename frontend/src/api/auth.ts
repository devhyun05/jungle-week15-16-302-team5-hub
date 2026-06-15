import { apiRequest } from "./client";
import type { AuthPayload } from "../types";

export function signup<TResponse = unknown>(payload: AuthPayload) {
  return apiRequest<TResponse>("/auth/signup", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function login<TResponse = unknown>(payload: Pick<AuthPayload, "email" | "password">) {
  return apiRequest<TResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function refresh<TResponse = unknown>() {
  return apiRequest<TResponse>("/auth/refresh", {
    method: "POST",
  });
}

export function logout<TResponse = void>() {
  return apiRequest<TResponse>("/auth/logout", {
    method: "POST",
  });
}

export function fetchMe<TResponse = unknown>() {
  return apiRequest<TResponse>("/auth/me");
}
