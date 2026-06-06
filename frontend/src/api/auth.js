import { apiRequest } from "./client";

export function signup(payload) {
  // TODO: POST /auth/signup 호출.
  return apiRequest("/auth/signup", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function login(payload) {
  // TODO: POST /auth/login 호출 후 access token 저장.
  return apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function fetchMe() {
  // TODO: GET /auth/me로 현재 로그인 사용자를 조회한다.
  return apiRequest("/auth/me");
}
