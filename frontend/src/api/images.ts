import type { PostImage, PresignedUrlResponse } from "../types/image"
import { apiRequest } from "./client"

export const createPresignedUrl = (file: File) => {
  return apiRequest<PresignedUrlResponse>("/images/presigned-url", {
    method: "POST",
    body: JSON.stringify({
      file_name: file.name,
      content_type: file.type,
    }),
  })
}

export const uploadImageToS3 = async ({
  uploadUrl,
  file,
}: {
  uploadUrl: string
  file: File
}) => {
  const response = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": file.type,
    },
    body: file,
  })

  if (!response.ok) {
    throw new Error("이미지를 업로드하지 못했습니다.")
  }
}

export const createPostImage = ({
  postId,
  imageUrl,
  objectKey,
}: {
  postId: number
  imageUrl: string
  objectKey: string
}) => {
  return apiRequest<PostImage>(`/posts/${postId}/images`, {
    method: "POST",
    body: JSON.stringify({
      image_url: imageUrl,
      object_key: objectKey,
      sort_order: 0,
    }),
  })
}
