const API_BASE_URL = "http://localhost:8000";

export type PostCreatePayload = {
  title: string;
  summary?: string;
  content: string;
  categorySlug: string;
  tags: string[];
  isPublic: boolean;
  relatedCommit?: string;
};

export type PostCreateResponse = {
  id: number;
  title: string;
  summary: string | null;
  content: string;
  category: string;
  categorySlug: string;
  tags: string[];
  author: string;
  authorRole: string;
  isPublic: boolean;
  views: number;
  comments: number;
  relatedCommit: string | null;
  createdAt: string;
  updatedAt: string;
};

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
