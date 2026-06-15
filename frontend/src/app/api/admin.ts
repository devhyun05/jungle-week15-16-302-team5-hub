import { API_BASE_URL, apiFetch, getErrorMessage } from "./client";
import type { ApprovalStatus, UserRole } from "./auth";

export type AdminUser = {
  id: number;
  email: string;
  name: string;
  profileImageUrl: string | null;
  role: UserRole;
  approvalStatus: ApprovalStatus;
  approvalNote: string | null;
  requestedAt: string;
  approvedAt: string | null;
  approvedBy: string | null;
  lastLoginAt: string | null;
  isSuperAdmin: boolean;
};

export type AdminUserListResponse = {
  items: AdminUser[];
  total: number;
  page: number;
  size: number;
};

export type AdminUserUpdateRequest = {
  role?: UserRole;
  approvalStatus?: ApprovalStatus;
  approvalNote?: string | null;
};

export async function getAdminUsers(): Promise<AdminUserListResponse> {
  // 관리자 화면은 전체 사용자 상태를 한 번에 보고 필터링해야 하므로 v1에서는 최대 100명까지 가져온다.
  const response = await apiFetch(`${API_BASE_URL}/admin/users?size=100`, {
    credentials: "include",
  });

  if (!response.ok) {
    const message = await getErrorMessage(response);
    throw new Error(message);
  }

  return response.json();
}

export async function updateAdminUser(
  userId: number,
  request: AdminUserUpdateRequest,
): Promise<AdminUser> {
  const response = await apiFetch(`${API_BASE_URL}/admin/users/${userId}`, {
    method: "PATCH",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const message = await getErrorMessage(response);
    throw new Error(message);
  }

  return response.json();
}
