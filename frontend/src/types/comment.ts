export type Comment = {
    id: number
    post_id: number
    author_id: number
    body: string
    created_at: string
    updated_at: string
    deleted_at: string | null
}

export type CommentCreateRequest = {
    body: string
}

export type CommentUpdateRequest = {
    body: string
}
