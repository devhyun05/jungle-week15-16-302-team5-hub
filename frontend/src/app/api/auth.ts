import { API_BASE_URL, getErrorMessage } from "./client";

export type UserRole = "STUDENT" | "COACH" | "ADMIN";
export type ApprovalStatus = "승인 대기" | "승인 완료" | "거절" | "정지";

export type CurrentUser = {
  id: number;
  email: string;
  name: string;
  profileImageUrl: string | null;
  role: UserRole;
  approvalStatus: ApprovalStatus;
};

export function startGoogleLogin() {
  // Google OAuth는 백엔드가 만든 로그인 URL에서 시작한다.
  // 브라우저를 FastAPI -> Google 로그인 화면 순서로 이동시키기 위해 location을 직접 바꾼다.
  window.location.href = `${API_BASE_URL}/auth/google/login`;
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  // access token은 HttpOnly cookie라서 JavaScript로 직접 읽을 수 없다.
  // credentials: "include"를 넣어야 브라우저가 인증 cookie를 API 요청에 함께 보낸다.
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    credentials: "include",
  });

  if (response.status === 401) {
    return null;
  }

  if (!response.ok) {
    const message = await getErrorMessage(response);
    throw new Error(message);
  }

  return response.json();
}

export async function refreshAuthSession(): Promise<boolean> {
  // access token이 만료됐을 때 refresh token cookie로 새 access token을 발급받는다.
  const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: "POST",
    credentials: "include",
  });

  return response.ok;
}

export async function logoutCurrentUser(): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/auth/logout`, {
    method: "POST",
    credentials: "include",
  });

  if (!response.ok) {
    const message = await getErrorMessage(response);
    throw new Error(message);
  }
}
