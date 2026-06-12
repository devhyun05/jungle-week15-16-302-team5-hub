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
