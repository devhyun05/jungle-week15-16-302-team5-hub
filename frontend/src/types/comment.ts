export type Comment = {
    id: number
    post_id: number
    author_id: number
    body: string
    created_at: string
    updated_at: string
    deleted_at: string | null
}

export type CommentPage = {
    items: Comment[]
    page: number
    size: number
    total: number
    has_next: boolean
    has_prev: boolean
}

export type CommentListParams = {
    page?: number
    size?: number
}

export type CommentCreateRequest = {
    body: string
}

export type CommentUpdateRequest = {
    body: string
}
