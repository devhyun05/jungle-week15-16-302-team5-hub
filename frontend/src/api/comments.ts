import type { Comment } from "../types/comment"
import { apiRequest } from "./client"

export const listComments = async (postId: number) => {
  return apiRequest<Comment[]>(`/posts/${postId}/comments`)
}

type CreateCommentInput = {
  content: string
  parent_comment_id?: number | null
  is_secret?: boolean
}

export const createComment = async (
  postId: number,
  comment: CreateCommentInput,
) => {
  return apiRequest<Comment>(`/posts/${postId}/comments`, {
    method: "POST",
    body: JSON.stringify(comment),
  })
}

export const deleteComment = async (postId: number, commentId: number) => {
  return apiRequest<void>(`/posts/${postId}/comments/${commentId}`, {
    method: "DELETE",
  })
}
