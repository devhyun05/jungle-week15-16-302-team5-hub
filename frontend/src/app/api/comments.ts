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
