import { apiRequest } from './client'
import type {
    Comment,
    CommentCreateRequest,
    CommentListParams,
    CommentPage,
    CommentUpdateRequest,
} from '../types/comment'

export function listComments(postId: number, params: CommentListParams = {}) {
    const searchParams = new URLSearchParams()

    if (params.page) {
        searchParams.set('page', String(params.page))
    }

    if (params.size) {
        searchParams.set('size', String(params.size))
    }

    const queryString = searchParams.toString()
    const path = queryString
        ? `/api/posts/${postId}/comments?${queryString}`
        : `/api/posts/${postId}/comments`

    return apiRequest<CommentPage>(path)
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
