import { API_BASE_URL, apiFetch, getErrorMessage } from "./client";

export type ReviewTargetType = "post" | "portfolio";
export type ReviewStatus = "대기 중" | "검토 중" | "피드백 완료" | "수정 요청" | "최종 확인";

export type CoachOption = {
  id: number;
  name: string;
  email: string;
  profileImageUrl: string | null;
};

export type CoachOptionListResponse = {
  items: CoachOption[];
};

export type ReviewRequestApiItem = {
  id: number;
  requesterId: number;
  requesterName: string;
  requesterProfileImageUrl: string | null;
  coachIds: number[];
  coachNames: string[];
  coachProfileImageUrls: (string | null)[];
  targetType: ReviewTargetType;
  targetId: number;
  targetTitle: string;
  targetSummary: string | null;
  targetPreview: string | null;
  targetLinkUrl: string | null;
  category: string;
  categorySlug: string;
  message: string | null;
  status: ReviewStatus;
  feedback: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ReviewRequestListResponse = {
  items: ReviewRequestApiItem[];
  total: number;
};

export type ReviewRequestCreatePayload = {
  targetType: ReviewTargetType;
  targetId: number;
  coachIds: number[];
  message?: string;
};

export type ReviewRequestUpdatePayload = {
  status?: ReviewStatus;
  feedback?: string;
};

export async function getCoachOptions(): Promise<CoachOptionListResponse> {
  const response = await apiFetch(`${API_BASE_URL}/review-requests/coaches`, {
    credentials: "include",
    cache: "no-store",
  });

  if (!response.ok) {
    const message = await getErrorMessage(response);
    throw new Error(message);
  }

  return response.json();
}

export async function createReviewRequest(payload: ReviewRequestCreatePayload): Promise<ReviewRequestApiItem> {
  const response = await apiFetch(`${API_BASE_URL}/review-requests`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const message = await getErrorMessage(response);
    throw new Error(message);
  }

  return response.json();
}

export async function getMyReviewRequests(): Promise<ReviewRequestListResponse> {
  const response = await apiFetch(`${API_BASE_URL}/review-requests/me`, {
    credentials: "include",
    cache: "no-store",
  });

  if (!response.ok) {
    const message = await getErrorMessage(response);
    throw new Error(message);
  }

  return response.json();
}

export async function getReviewInbox(): Promise<ReviewRequestListResponse> {
  const response = await apiFetch(`${API_BASE_URL}/review-requests/inbox`, {
    credentials: "include",
    cache: "no-store",
  });

  if (!response.ok) {
    const message = await getErrorMessage(response);
    throw new Error(message);
  }

  return response.json();
}

export async function updateReviewRequest(
  reviewRequestId: number,
  payload: ReviewRequestUpdatePayload,
): Promise<ReviewRequestApiItem> {
  const response = await apiFetch(`${API_BASE_URL}/review-requests/${reviewRequestId}`, {
    method: "PATCH",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const message = await getErrorMessage(response);
    throw new Error(message);
  }

  return response.json();
}

export async function cancelReviewRequest(reviewRequestId: number): Promise<void> {
  const response = await apiFetch(`${API_BASE_URL}/review-requests/${reviewRequestId}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!response.ok) {
    const message = await getErrorMessage(response);
    throw new Error(message);
  }
}
