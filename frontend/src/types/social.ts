export interface SocialAccount {
  id: number
  platform: SocialPlatform
  username: string
  display_name: string
  profile_image_url?: string
  is_active: boolean
  last_sync?: string
  created_at: string
}

export type SocialPlatform = 'twitter' | 'instagram' | 'linkedin' | 'reddit'

export interface SocialPost {
  id: string
  text: string
  created_at: string
  metrics?: PostMetrics
  url: string
}

export interface PostMetrics {
  likes?: number
  comments?: number
  shares?: number
  retweets?: number
  views?: number
  impressions?: number
}

export interface ConnectSocialAccountRequest {
  platform: SocialPlatform
  access_token: string
  refresh_token?: string
  platform_user_id: string
  username: string
  display_name: string
  profile_image_url?: string
}