import { API_BASE_URL, getErrorMessage } from "./client";
import type { UserRole } from "./auth";

export type PostListApiItem = {
  id: number;
  title: string;
  summary: string | null;
  category: string;
  categorySlug: string;
  tags: string[];
  author: string;
  authorId: number;
  authorRole: UserRole;
  authorProfileImageUrl: string | null;
  isPublic: boolean;
  views: number;
  comments: number;
  createdAt: string;
};

export type PostListApiResponse = {
  items: PostListApiItem[];
  total: number;
  page: number;
  size: number;
};

export type PostDetailApiResponse = PostListApiItem & {
  content: string;
  relatedGitHubUrl: string | null;
  updatedAt: string;
};

export type PostCreatePayload = {
  title: string;
  summary?: string;
  content: string;
  categorySlug: string;
  tags: string[];
  isPublic: boolean;
  relatedGitHubUrl?: string;
};

export type PostCreateResponse = PostDetailApiResponse;
export type PostUpdatePayload = PostCreatePayload;
export type PostUpdateResponse = PostDetailApiResponse;

export type GetPostsParams = {
  category?: string;
  keyword?: string;
  page?: number;
  size?: number;
};

export type GetMyPostsParams = GetPostsParams & {
  visibility?: "all" | "public" | "private";
};


export async function getPosts(params: GetPostsParams = {}): Promise<PostListApiResponse> {
  const searchParams = new URLSearchParams();

  if (params.category) {
    searchParams.set("category", params.category);
  }

  if (params.keyword) {
    searchParams.set("keyword", params.keyword);
  }

  searchParams.set("page", String(params.page ?? 1));
  searchParams.set("size", String(params.size ?? 50));

  const response = await fetch(`${API_BASE_URL}/posts?${searchParams.toString()}`, {
    credentials: "include",
  });

  if (!response.ok) {
    const message = await getErrorMessage(response);
    throw new Error(message);
  }

  return response.json();
}


export async function getMyPosts(params: GetMyPostsParams = {}): Promise<PostListApiResponse> {
  const searchParams = new URLSearchParams();

  if (params.category) {
    searchParams.set("category", params.category);
  }

  if (params.keyword) {
    searchParams.set("keyword", params.keyword);
  }

  searchParams.set("visibility", params.visibility ?? "all");
  searchParams.set("page", String(params.page ?? 1));
  searchParams.set("size", String(params.size ?? 50));

  const response = await fetch(`${API_BASE_URL}/me/posts?${searchParams.toString()}`, {
    credentials: "include",
  });

  if (!response.ok) {
    const message = await getErrorMessage(response);
    throw new Error(message);
  }

  return response.json();
}


export async function getPostDetail(postId: string | number): Promise<PostDetailApiResponse> {
  const response = await fetch(`${API_BASE_URL}/posts/${postId}`, {
    credentials: "include",
  });

  if (!response.ok) {
    const message = await getErrorMessage(response);
    throw new Error(message);
  }

  return response.json();
}


export async function createPost(payload: PostCreatePayload): Promise<PostCreateResponse> {
  const response = await fetch(`${API_BASE_URL}/posts`, {
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


export async function updatePost(postId: string | number, payload: PostUpdatePayload): Promise<PostUpdateResponse> {
  const response = await fetch(`${API_BASE_URL}/posts/${postId}`, {
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


export async function deletePost(postId: string | number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/posts/${postId}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!response.ok) {
    const message = await getErrorMessage(response);
    throw new Error(message);
  }
}
