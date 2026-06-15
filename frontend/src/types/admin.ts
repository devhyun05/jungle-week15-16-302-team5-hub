import type { Tag } from './post'

export type AdminPost = {
    id: number
    author_id: number
    title: string
    body: string
    created_at: string
    updated_at: string
    deleted_at: string | null
    hidden_at: string | null
    hidden_by_id: number | null
    hidden_reason: string | null
    tags: Tag[]
}

export type AdminComment = {
    id: number
    post_id: number
    author_id: number
    body: string
    created_at: string
    updated_at: string
    deleted_at: string | null
    hidden_at: string | null
    hidden_by_id: number | null
    hidden_reason: string | null
}

export type AdminModerationResponse = {
    target_type: string
    target_id: number
    hidden_at: string | null
    hidden_by_id: number | null
    hidden_reason: string | null
}
