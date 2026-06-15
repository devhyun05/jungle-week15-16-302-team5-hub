import type { UserRole } from "./auth";
import { API_BASE_URL, getErrorMessage } from "./client";

export type CommentApiItem = {
  id: number;
  postId: number;
  author: string;
  authorId: number;
  authorRole: UserRole;
  content: string;
  createdAt: string;
  updatedAt: string;
};

export type CommentListApiResponse = {
  postId: number;
  items: CommentApiItem[];
  total: number;
};


export async function getPostComments(postId: string | number): Promise<CommentListApiResponse> {
  const response = await fetch(`${API_BASE_URL}/posts/${postId}/comments`, {
    credentials: "include",
  });

  if (!response.ok) {
    const message = await getErrorMessage(response);
    throw new Error(message);
  }

  return response.json();
}


export async function createPostComment(
  postId: string | number,
  content: string
): Promise<CommentApiItem> {
  const response = await fetch(`${API_BASE_URL}/posts/${postId}/comments`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ content }),
  });

  if (!response.ok) {
    const message = await getErrorMessage(response);
    throw new Error(message);
  }

  return response.json();
}


export async function deleteComment(commentId: string | number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/comments/${commentId}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!response.ok) {
    const message = await getErrorMessage(response);
    throw new Error(message);
  }
}
