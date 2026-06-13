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

export type GetPostsParams = {
  category?: string;
  keyword?: string;
  page?: number;
  size?: number;
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

async function getErrorMessage(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as { detail?: string };
    return data.detail ?? "게시글을 저장하지 못했습니다.";
  } catch {
    return "게시글을 저장하지 못했습니다.";
  }
}
