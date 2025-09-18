export interface Automation {
  id: number
  name: string
  description: string
  platforms: string[]
  content_settings: ContentSettings
  posting_schedule: PostingSchedule
  ai_settings?: AISettings
  hashtag_settings?: HashtagSettings
  status: AutomationStatus
  last_run?: string
  next_run?: string
  run_count: number
  error_count: number
  created_at: string
}

export type AutomationStatus = 'active' | 'paused' | 'inactive' | 'error'

export interface ContentSettings {
  topic: string
  tone: ContentTone
  content_type: ContentType
  target_audience?: string
  include_call_to_action: boolean
}

export type ContentTone = 'professional' | 'casual' | 'friendly' | 'formal' | 'humorous' | 'inspiring'
export type ContentType = 'post' | 'story' | 'article' | 'announcement' | 'question' | 'tip'

export interface PostingSchedule {
  type: ScheduleType
  interval?: number
  days_of_week?: number[]
  time_of_day?: string
  timezone?: string
}

export type ScheduleType = 'daily' | 'weekly' | 'monthly' | 'hourly' | 'custom'

export interface AISettings {
  model: string
  temperature: number
  max_tokens: number
  creativity_level: 'low' | 'medium' | 'high'
}

export interface HashtagSettings {
  auto_generate: boolean
  max_hashtags: number
  preferred_hashtags: string[]
  avoid_hashtags: string[]
}

export interface CreateAutomationRequest {
  name: string
  description?: string
  platforms: string[]
  content_settings: ContentSettings
  posting_schedule: PostingSchedule
  ai_settings?: AISettings
  hashtag_settings?: HashtagSettings
}