import type { Post } from "../types/post"
import { apiRequest } from "./client"

export type UserMe = {
  id: number
  email: string
  username: string
  profile_image_url: string | null
  role: string
  created_at: string
}

export type MyPostSummary = {
  posts: Post[]
  total_count: number
  selling_count: number
  reserved_count: number
  sold_count: number
}

export type MyComment = {
  id: number
  post_id: number
  post_title: string
  content: string
  is_secret: boolean
  parent_comment_id: number | null
  created_at: string
}

export const getMyProfile = () => apiRequest<UserMe>("/users/me")

export const getMyPosts = () => apiRequest<MyPostSummary>("/users/me/posts")

export const getMyComments = () => apiRequest<MyComment[]>("/users/me/comments")
