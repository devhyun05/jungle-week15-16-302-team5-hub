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

export type TradeHelperRecommendation = {
  kind: "related_item" | "deal_tip" | "safety_tip"
  title: string
  description: string
  reason: string
}

export type TradeHelperRecommendationResponse = {
  post_id: number
  recommendations: TradeHelperRecommendation[]
  sources: RagSource[]
  agent_steps: {
    step: string
    detail: string
  }[]
  used_fallback: boolean
}

export type RelatedAdRecommendation = {
  ad_id: string
  title: string
  description: string
  category: string
  image_url: string
  display_price: string
  call_to_action: string
  reason: string
}

export type RelatedAdRecommendationResponse = {
  post_id: number
  ads: RelatedAdRecommendation[]
  sources: RagSource[]
  agent_steps: {
    step: string
    detail: string
  }[]
  used_fallback: boolean
}

export type RestrictedItemStatus = "allowed" | "warning" | "blocked"

export type PolicySource = {
  policy_id: string
  title: string
  category: string
  severity: RestrictedItemStatus
  score: number
  source_url: string
}

export type RestrictedItemCheckInput = {
  title: string
  description?: string | null
  category?: string | null
}

export type RestrictedItemCheckResponse = {
  status: RestrictedItemStatus
  message: string
  matched_policy_titles: string[]
  sources: PolicySource[]
  agent_steps: {
    step: string
    detail: string
  }[]
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

export const getTradeHelperRecommendations = (postId: number) => {
  return apiRequest<TradeHelperRecommendationResponse>(
    `/ai/posts/${postId}/trade-helper-recommendations`,
  )
}

export const getRelatedAds = (postId: number) => {
  return apiRequest<RelatedAdRecommendationResponse>(
    `/ai/posts/${postId}/related-ads`,
  )
}

export const checkRestrictedItem = (input: RestrictedItemCheckInput) => {
  return apiRequest<RestrictedItemCheckResponse>("/ai/restricted-item-check", {
    method: "POST",
    body: JSON.stringify(input),
  })
}
