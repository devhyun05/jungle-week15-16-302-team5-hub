import type { UserRole } from "../data/mockData";

const API_BASE_URL = "http://localhost:8000";

export type PostListApiItem = {
  id: number;
  title: string;
  summary: string | null;
  category: string;
  categorySlug: string;
  tags: string[];
  author: string;
  authorRole: UserRole;
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
  relatedCommit: string | null;
  updatedAt: string;
};

export type PostCreatePayload = {
  title: string;
  summary?: string;
  content: string;
  categorySlug: string;
  tags: string[];
  isPublic: boolean;
  relatedCommit?: string;
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
  // 게시글 목록은 백엔드 GET /posts에서 가져온다.
  // category, keyword, page, size는 query string으로 전달한다.
  const searchParams = new URLSearchParams();

  if (params.category) {
    searchParams.set("category", params.category);
  }

  if (params.keyword) {
    searchParams.set("keyword", params.keyword);
  }

  searchParams.set("page", String(params.page ?? 1));
  searchParams.set("size", String(params.size ?? 50));

  const response = await fetch(`${API_BASE_URL}/posts?${searchParams.toString()}`);

  if (!response.ok) {
    const message = await getErrorMessage(response);
    throw new Error(message);
  }

  return response.json();
}

export async function getMyPosts(params: GetMyPostsParams = {}): Promise<PostListApiResponse> {
  // 내 기록 목록은 GET /me/posts에서 가져온다.
  // JWT/OAuth2 연결 전에는 백엔드가 demo student를 현재 사용자처럼 사용한다.
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

  const response = await fetch(`${API_BASE_URL}/me/posts?${searchParams.toString()}`);

  if (!response.ok) {
    const message = await getErrorMessage(response);
    throw new Error(message);
  }

  return response.json();
}

export async function getPostDetail(postId: string | number): Promise<PostDetailApiResponse> {
  // 게시글 상세는 URL의 id를 그대로 백엔드 GET /posts/{post_id}에 전달한다.
  const response = await fetch(`${API_BASE_URL}/posts/${postId}`);

  if (!response.ok) {
    const message = await getErrorMessage(response);
    throw new Error(message);
  }

  return response.json();
}

export async function createPost(payload: PostCreatePayload): Promise<PostCreateResponse> {
  // 게시글 작성은 POST /posts로 보낸다.
  // JWT/OAuth2 전 단계라 프론트는 작성자를 보내지 않고, 백엔드 demo user가 작성자로 저장된다.
  const response = await fetch(`${API_BASE_URL}/posts`, {
    method: "POST",
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
  // 게시글 수정은 PATCH /posts/{post_id}로 보낸다.
  // 작성 화면과 수정 화면의 입력 필드가 같아서 create payload 타입을 그대로 재사용한다.
  const response = await fetch(`${API_BASE_URL}/posts/${postId}`, {
    method: "PATCH",
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
  // 게시글 삭제는 DELETE /posts/{post_id}로 보낸다.
  // 백엔드는 실제 row를 없애지 않고 deleted_at을 채우는 soft delete로 처리한다.
  const response = await fetch(`${API_BASE_URL}/posts/${postId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const message = await getErrorMessage(response);
    throw new Error(message);
  }
}

async function getErrorMessage(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as { detail?: string };
    return data.detail ?? "게시글을 저장하지 못했습니다.";
  } catch {
    return "게시글을 저장하지 못했습니다.";
  }
}
