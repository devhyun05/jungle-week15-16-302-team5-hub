import { apiRequest } from './client'
import type {
    AdminComment,
    AdminModerationResponse,
    AdminPost,
} from '../types/admin'

function moderationBody(reason: string) {
    const trimmedReason = reason.trim()

    return trimmedReason ? { reason: trimmedReason } : undefined
}

export function listAdminPosts(token: string) {
    return apiRequest<AdminPost[]>('/api/admin/posts', {
        token,
    })
}

export function listAdminComments(token: string) {
    return apiRequest<AdminComment[]>('/api/admin/comments', {
        token,
    })
}

export function hideAdminPost(postId: number, reason: string, token: string) {
    return apiRequest<AdminModerationResponse>(`/api/admin/posts/${postId}/hide`, {
        method: 'POST',
        body: moderationBody(reason),
        token,
    })
}

export function restoreAdminPost(postId: number, token: string) {
    return apiRequest<AdminModerationResponse>(`/api/admin/posts/${postId}/restore`, {
        method: 'POST',
        token,
    })
}

export function hideAdminComment(commentId: number, reason: string, token: string) {
    return apiRequest<AdminModerationResponse>(
        `/api/admin/comments/${commentId}/hide`,
        {
            method: 'POST',
            body: moderationBody(reason),
            token,
        },
    )
}

export function restoreAdminComment(commentId: number, token: string) {
    return apiRequest<AdminModerationResponse>(
        `/api/admin/comments/${commentId}/restore`,
        {
            method: 'POST',
            token,
        },
    )
}
