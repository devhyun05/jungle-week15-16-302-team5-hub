import { apiRequest } from "./client"

export type PostWritingAction = "refine" | "fix_typos" | "suggest_tags"

export type RagSource = {
  post_id: number
  title: string
  category: string
  score: number
}

export type PostWritingAssistInput = {
  action: PostWritingAction
  title: string
  description?: string | null
  category?: string | null
  price?: number | null
  trade_location?: string | null
}

export type PostWritingAssistResponse = {
  action: PostWritingAction
  description: string
  suggested_tags: string[]
  sources: RagSource[]
  agent_steps: {
    step: string
    detail: string
  }[]
  used_fallback: boolean
}

export type SlackTradeAlertResponse = {
  status: "sent" | "skipped" | "failed"
  message: string
  tool_name: string
  request_payload: Record<string, unknown>
}

export const assistPostWriting = (input: PostWritingAssistInput) => {
  return apiRequest<PostWritingAssistResponse>("/ai/post-writing-assist", {
    method: "POST",
    body: JSON.stringify(input),
  })
}

export const sendSlackTradeAlert = (postId: number, message?: string) => {
  return apiRequest<SlackTradeAlertResponse>(`/ai/posts/${postId}/slack-alert`, {
    method: "POST",
    body: JSON.stringify({
      message: message ?? null,
    }),
  })
}
