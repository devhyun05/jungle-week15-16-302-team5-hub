import { apiRequest } from './client'
import type {
    Comment,
    CommentCreateRequest,
    CommentUpdateRequest,
} from '../types/comment'

export function listComments(postId: number) {
    return apiRequest<Comment[]>(`/api/posts/${postId}/comments`)
}

export function createComment(
    postId: number,
    payload: CommentCreateRequest,
    token: string,
) {
    return apiRequest<Comment>(`/api/posts/${postId}/comments`, {
        method: 'POST',
        body: payload,
        token,
    })
}

export function updateComment(
    commentId: number,
    payload: CommentUpdateRequest,
    token: string,
) {
    return apiRequest<Comment>(`/api/comments/${commentId}`, {
        method: 'PUT',
        body: payload,
        token,
    })
}

export function deleteComment(commentId: number, token: string) {
    return apiRequest<void>(`/api/comments/${commentId}`, {
        method: 'DELETE',
        token,
    })
}
