export type PostType = "recipe" | "failure" | "review" | "general";

export type Tone = "mint" | "lavender" | "coral";

export interface User {
  id: number;
  email: string;
  nickname: string;
  created_at: string;
}

export interface PostCardData {
  id?: number | string;
  type?: PostType;
  title?: string;
  summary?: string;
  tags?: string[];
  author?: string;
  time?: string;
  comments?: number;
  isOwner?: boolean;
}

export interface Post {
  id: number;
  title: string;
  content: string;
  summary: string;
  post_type: PostType;
  slime_type?: string | null;
  tags: string[];
  author: User;
  comment_count: number;
  is_owner: boolean;
  created_at: string;
  updated_at: string;
}

export interface PostListResponse {
  items: Post[];
  page: number;
  size: number;
  total: number;
  total_pages: number;
}

export interface Tag {
  id: number;
  name: string;
  tag_type: string;
  count?: number;
}

export interface TagListResponse {
  items: Tag[];
}

export interface Comment {
  id: number;
  post_id: number;
  content: string;
  author: User;
  is_owner: boolean;
  created_at: string;
  updated_at: string;
}

export interface CommentListResponse {
  items: Comment[];
}

export interface TokenResponse {
  access_token: string;
  token_type: "bearer";
  expires_in: number;
  user: User;
}

export interface AuthPayload {
  email: string;
  password: string;
  nickname?: string;
}

export type ApiPayload = Record<string, unknown>;
