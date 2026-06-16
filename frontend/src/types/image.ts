export type PostImage = {
  id: number
  post_id: number
  image_url: string
  object_key: string
  sort_order: number
  created_at: string
}

export type PresignedUrlResponse = {
  upload_url: string
  image_url: string
  object_key: string
}
