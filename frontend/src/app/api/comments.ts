import type { UserRole } from "../data/mockData";

const API_BASE_URL = "http://localhost:8000";

export type CommentApiItem = {
  id: number;
  postId: number;
  author: string;
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
  // 댓글 조회는 게시글 상세 화면에서 호출한다.
  // 백엔드 route는 GET /posts/{post_id}/comments 형태다.
  const response = await fetch(`${API_BASE_URL}/posts/${postId}/comments`);

  // fetch는 404/500이어도 Promise 자체는 성공 처리하므로 직접 검사해야 한다.
  if (!response.ok) {
    throw new Error("댓글 목록을 불러오지 못했습니다.");
  }

  return response.json();
}

export async function createPostComment(
  postId: string | number,
  content: string
): Promise<CommentApiItem> {
  // 댓글 작성은 POST /posts/{post_id}/comments로 보낸다.
  // JWT/OAuth2 전 단계라 프론트는 content만 보내고, 작성자는 백엔드 demo user가 맡는다.
  const response = await fetch(`${API_BASE_URL}/posts/${postId}/comments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ content }),
  });

  if (!response.ok) {
    throw new Error("댓글을 작성하지 못했습니다.");
  }

  return response.json();
}
