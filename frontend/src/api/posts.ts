import type { Post, PostCategory, PostCreateInput, PostStatus } from "../types/post"
import { apiRequest } from "./client"

const postDetailRequestCache = new Map<number, Promise<Post>>()

type ListPostsParams = {
  keyword?: string
  status?: PostStatus
  category?: PostCategory
  sort?: "latest" | "popular" | "price_low"
}

export const listPosts = async ({
  keyword,
  status,
  category,
  sort = "latest",
}: ListPostsParams = {}) => {
  const params = new URLSearchParams()

  if (keyword) {
    params.set("keyword", keyword)
  }

  if (status) {
    params.set("status", status)
  }

  if (category) {
    params.set("category", category)
  }

  params.set("sort", sort)

  return apiRequest<Post[]>(`/posts?${params.toString()}`)
}

export const createPost = async (post: PostCreateInput) => {
  return apiRequest<Post>("/posts", {
    method: "POST",
    body: JSON.stringify(post),
  })
}

export const updatePost = async (
  postId: number,
  post: Partial<PostCreateInput>,
) => {
  const updatedPost = await apiRequest<Post>(`/posts/${postId}`, {
    method: "PATCH",
    body: JSON.stringify(post),
  })

  postDetailRequestCache.delete(postId)
  return updatedPost
}

export const deletePost = async (postId: number) => {
  await apiRequest<void>(`/posts/${postId}`, {
    method: "DELETE",
  })

  postDetailRequestCache.delete(postId)
}

export const getPost = async (postId: number) => {
  const cachedRequest = postDetailRequestCache.get(postId)
  if (cachedRequest) {
    return cachedRequest
  }

  const request = apiRequest<Post>(`/posts/${postId}`)

  postDetailRequestCache.set(postId, request)
  setTimeout(() => {
    postDetailRequestCache.delete(postId)
  }, 1000)

  return request
}
