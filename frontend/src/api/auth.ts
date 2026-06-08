import { apiRequest } from "./client";
import type { AuthPayload } from "../types";

export function signup<TResponse = unknown>(payload: AuthPayload) {
  // TODO: POST /auth/signup 호출.
  return apiRequest<TResponse>("/auth/signup", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function login<TResponse = unknown>(payload: Pick<AuthPayload, "email" | "password">) {
  // TODO: POST /auth/login 호출 후 access token 저장.
  return apiRequest<TResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function fetchMe<TResponse = unknown>() {
  // TODO: GET /auth/me로 현재 로그인 사용자를 조회한다.
  return apiRequest<TResponse>("/auth/me");
}
