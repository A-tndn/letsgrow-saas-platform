export interface User {
  id: number
  email: string
  first_name: string
  last_name: string
  avatar_url?: string
  subscription_tier: SubscriptionTier
  api_usage_percentage: number
  is_admin: boolean
  created_at: string
}

export type SubscriptionTier = 'free' | 'starter' | 'professional' | 'business' | 'enterprise'

export interface LoginRequest {
  email: string
  password: string
  remember_me?: boolean
}

export interface RegisterRequest {
  email: string
  password: string
  first_name: string
  last_name: string
}

export interface AuthResponse {
  message: string
  user: User
}

export interface AuthError {
  error: string
}