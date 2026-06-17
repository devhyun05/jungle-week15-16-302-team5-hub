export type Comment = {
  id: number
  post_id: number
  writer_id: number
  writer_name: string
  parent_comment_id: number | null
  content: string
  is_secret: boolean
  is_hidden: boolean
  can_delete: boolean
  created_at: string
  updated_at: string
}
