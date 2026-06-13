export type Tag = {
    id: number
    normalized_name: string
    display_name: string
    created_at: string
}

export type Post = {
    id: number
    author_id: number
    title: string
    body: string
    created_at: string
    updated_at: string
    tags: Tag[]
}

export type PostPage = {
    items: Post[]
    page: number
    size: number
    total: number
    has_next: boolean
    has_prev: boolean
}

export type PostListParams = {
    q?: string
    tag?: string
    tags?: string[]
    page?: number
    size?: number
}

export type PostCreateRequest = {
    title: string
    body: string
    tag_names?: string[]
}

export type PostUpdateRequest = {
    title?: string
    body?: string
    tag_names?: string[]
}