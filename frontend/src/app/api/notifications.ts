import { API_BASE_URL, apiFetch, getErrorMessage } from "./client";

export type NotificationApiItem = {
  id: number;
  type: string;
  message: string;
  linkUrl: string | null;
  isRead: boolean;
  createdAt: string;
};

export type NotificationListResponse = {
  items: NotificationApiItem[];
  total: number;
  unreadCount: number;
};

export async function getNotifications(size = 10): Promise<NotificationListResponse> {
  const response = await apiFetch(`${API_BASE_URL}/notifications?size=${size}`, {
    credentials: "include",
  });

  if (!response.ok) {
    const message = await getErrorMessage(response);
    throw new Error(message);
  }

  return response.json();
}

export async function markNotificationRead(notificationId: number): Promise<NotificationApiItem> {
  const response = await apiFetch(`${API_BASE_URL}/notifications/${notificationId}/read`, {
    method: "PATCH",
    credentials: "include",
  });

  if (!response.ok) {
    const message = await getErrorMessage(response);
    throw new Error(message);
  }

  return response.json();
}

export async function markAllNotificationsRead(): Promise<void> {
  const response = await apiFetch(`${API_BASE_URL}/notifications/read-all`, {
    method: "PATCH",
    credentials: "include",
  });

  if (!response.ok) {
    const message = await getErrorMessage(response);
    throw new Error(message);
  }
}

export async function deleteNotification(notificationId: number): Promise<void> {
  const response = await apiFetch(`${API_BASE_URL}/notifications/${notificationId}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!response.ok) {
    const message = await getErrorMessage(response);
    throw new Error(message);
  }
}
