import { apiRequest } from './client'
import type { Post, PostCreateRequest, PostUpdateRequest } from '../types/post'

export function listPosts() {
    return apiRequest<Post[]>('/api/posts/')
}

export function getPost(postId: number) {
    return apiRequest<Post>(`/api/posts/${postId}`)
}

export function createPost(payload: PostCreateRequest, token: string) {
    return apiRequest<Post>('/api/posts/', {
        method: 'POST',
        body: payload,
        token,
    })
}

export function updatePost(postId: number, payload: PostUpdateRequest, token: string) {
    return apiRequest<Post>(`/api/posts/${postId}`, {
        method: 'PUT',
        body: payload,
        token,
    })
}

export function deletePost(postId: number, token: string) {
    return apiRequest<void>(`/api/posts/${postId}`, {
        method: 'DELETE',
        token,
    })
}
