import type { PostImage } from "./image"

export type PostStatus = "selling" | "reserved" | "sold"
export type PostCategory =
  | "전자기기"
  | "의류/잡화"
  | "도서"
  | "가구/인테리어"
  | "스포츠"
  | "기타"

export type Post = {
  id: number
  seller_id: number
  title: string
  description: string | null
  price: number
  trade_location: string
  category: PostCategory
  status: PostStatus
  view_count: number
  like_count: number
  comment_count: number
  created_at: string
  updated_at: string
  images: PostImage[]
}

export type PostCreateInput = {
  title: string
  description?: string | null
  price: number
  trade_location: string
  category: PostCategory
  status: PostStatus
}
