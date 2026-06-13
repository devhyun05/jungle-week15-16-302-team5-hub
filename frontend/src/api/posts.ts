import { apiRequest } from './client'
import type { Post, PostCreateRequest, PostListParams, PostPage, PostUpdateRequest } from '../types/post'

export function listPosts(params: PostListParams = {}) {
    const searchParams = new URLSearchParams()

    if (params.q) {
        searchParams.set('q', params.q)
    }

    if (params.tag) {
        searchParams.set('tag', params.tag)
    }

    if (params.tags) {
        params.tags.forEach((tag) => {
            const trimmedTag = tag.trim()

            if (trimmedTag) {
                searchParams.append('tags', trimmedTag)
            }
        })
    }

    if (params.page) {
        searchParams.set('page', String(params.page))
    }

    if (params.size) {
        searchParams.set('size', String(params.size))
    }

    const queryString = searchParams.toString()
    const path = queryString ? `/api/posts/?${queryString}` : '/api/posts/'

    return apiRequest<PostPage>(path)
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
