export interface ContentItem {
  id: number
  content: string
  media_urls: string[]
  hashtags: string[]
  scheduled_for: string
  status: ContentStatus
  posted_at?: string
  platform_post_id?: string
  engagement_data?: any
  created_at: string
}

export type ContentStatus = 'scheduled' | 'posting' | 'posted' | 'failed' | 'cancelled'

export interface GenerateContentRequest {
  topic: string
  platform: string
  tone?: string
  content_type?: string
  hashtags?: string[]
  target_audience?: string
  include_call_to_action?: boolean
}

export interface GenerateContentResponse {
  success: boolean
  content?: string
  hashtags?: string[]
  word_count?: number
  character_count?: number
  is_valid_length?: boolean
  validation_message?: string
  error?: string
}

export interface ScheduleContentRequest {
  social_account_id: number
  content: string
  media_urls?: string[]
  hashtags?: string[]
  platform_specific_data?: any
  scheduled_for: string
}

export interface ContentMetrics {
  likes: number
  comments: number
  shares: number
  views: number
  engagement_rate: number
}