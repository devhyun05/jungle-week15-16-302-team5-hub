export type Post = {
    id: number
    author_id: number
    title: string
    body: string
    created_at: string
    updated_at: string
}

export type PostCreateRequest = {
    title: string
    body: string
}

export type PostUpdateRequest = {
    title?: string
    body?: string
}