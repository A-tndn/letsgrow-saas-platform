import axios, { AxiosResponse } from 'axios'

// For Replit: Use the specific backend port URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || (
  process.env.REPLIT_DEV_DOMAIN 
    ? `https://${process.env.REPLIT_DEV_DOMAIN.split('-00-')[0]}-00-${process.env.REPLIT_DEV_DOMAIN.split('-00-')[1].replace('.pike.replit.dev', '')}-8000.pike.replit.dev/api`
    : 'http://127.0.0.1:8000/api'
)

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access - redirect to dashboard since no auth required
      localStorage.removeItem('auth_token')
      window.location.href = '/dashboard'
    }
    return Promise.reject(error)
  }
)

export { api }

// API response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
  status?: any  // For setup status API
  details?: any  // For setup initialize API
}

export interface User {
  id: number
  email: string
  first_name: string
  last_name: string
  subscription_tier: 'starter' | 'professional' | 'enterprise'
  created_at: string
}

export interface SocialAccount {
  id: number
  platform: 'twitter' | 'instagram' | 'linkedin' | 'reddit'
  username: string
  is_active: boolean
  connected_at: string
  followers_count?: number
  following_count?: number
}

export interface Automation {
  id: number
  name: string
  platform: string
  status: 'active' | 'paused' | 'draft'
  content_type: string
  schedule: any
  created_at: string
  last_run?: string
  next_run?: string
}

export interface ContentPost {
  id: number
  content: string
  platform: string
  scheduled_for: string
  status: 'scheduled' | 'published' | 'failed'
  hashtags: string[]
  media_urls: string[]
  engagement?: {
    likes: number
    comments: number
    shares: number
  }
}

export interface Analytics {
  total_posts: number
  total_likes: number
  total_comments: number
  total_shares: number
  average_engagement_rate: number
  follower_growth: number
  top_performing_posts: ContentPost[]
}

// Authentication API
export const authApi = {
  login: async (email: string, password: string): Promise<ApiResponse<{ user: User; token: string }>> => {
    const response = await api.post('/auth/login', { email, password })
    return response.data
  },

  register: async (userData: {
    email: string
    password: string
    first_name: string
    last_name: string
  }): Promise<ApiResponse<{ user: User; token: string }>> => {
    const response = await api.post('/auth/register', userData)
    return response.data
  },

  logout: async (): Promise<ApiResponse> => {
    const response = await api.post('/auth/logout')
    return response.data
  },

  getCurrentUser: async (): Promise<ApiResponse<User>> => {
    const response = await api.get('/auth/me')
    return response.data
  }
}

// Social Accounts API
export const socialAccountsApi = {
  getAccounts: async (): Promise<ApiResponse<{ accounts: SocialAccount[] }>> => {
    const response = await api.get('/social-accounts')
    return response.data
  },

  connectAccount: async (accountData: {
    platform: string
    access_token: string
    access_token_secret?: string
  }): Promise<ApiResponse<SocialAccount>> => {
    const response = await api.post('/social-accounts/connect', accountData)
    return response.data
  },

  disconnectAccount: async (accountId: number): Promise<ApiResponse> => {
    const response = await api.delete(`/social-accounts/${accountId}`)
    return response.data
  },

  refreshAccount: async (accountId: number): Promise<ApiResponse<SocialAccount>> => {
    const response = await api.post(`/social-accounts/${accountId}/refresh`)
    return response.data
  }
}

// Automations API
export const automationsApi = {
  getAutomations: async (): Promise<ApiResponse<{ automations: Automation[] }>> => {
    const response = await api.get('/automations')
    return response.data
  },

  createAutomation: async (automationData: {
    name: string
    social_account_id: number
    content_type: string
    schedule: any
    rules: any
  }): Promise<ApiResponse<Automation>> => {
    const response = await api.post('/automations', automationData)
    return response.data
  },

  updateAutomation: async (id: number, automationData: Partial<Automation>): Promise<ApiResponse<Automation>> => {
    const response = await api.put(`/automations/${id}`, automationData)
    return response.data
  },

  deleteAutomation: async (id: number): Promise<ApiResponse> => {
    const response = await api.delete(`/automations/${id}`)
    return response.data
  },

  toggleAutomation: async (id: number): Promise<ApiResponse<Automation>> => {
    const response = await api.post(`/automations/${id}/toggle`)
    return response.data
  }
}

// Content API
export const contentApi = {
  getContent: async (): Promise<ApiResponse<{ content: ContentPost[] }>> => {
    const response = await api.get('/content')
    return response.data
  },

  generateContent: async (data: {
    topic: string
    platform: string
    tone: string
    content_type: string
  }): Promise<ApiResponse<{ content: string; hashtags: string[] }>> => {
    const response = await api.post('/content/generate', data)
    return response.data
  },

  generateHashtags: async (data: {
    topic: string
    platform: string
    count: number
  }): Promise<ApiResponse<{ hashtags: string[] }>> => {
    const response = await api.post('/content/hashtags', data)
    return response.data
  },

  scheduleContent: async (data: {
    social_account_id: number
    content: string
    hashtags: string[]
    media_urls: string[]
    scheduled_for: string
  }): Promise<ApiResponse<ContentPost>> => {
    const response = await api.post('/content/schedule', data)
    return response.data
  },

  updateContent: async (id: number, data: Partial<ContentPost>): Promise<ApiResponse<ContentPost>> => {
    const response = await api.put(`/content/${id}`, data)
    return response.data
  },

  deleteContent: async (id: number): Promise<ApiResponse> => {
    const response = await api.delete(`/content/${id}`)
    return response.data
  }
}

// Analytics API
export const analyticsApi = {
  getOverview: async (timeRange: number = 30): Promise<ApiResponse<{ overview: Analytics; daily_data: any[] }>> => {
    const response = await api.get(`/analytics/overview?days=${timeRange}`)
    return response.data
  },

  getPlatformAnalytics: async (platform: string, timeRange: number = 30): Promise<ApiResponse<any>> => {
    const response = await api.get(`/analytics/platform/${platform}?days=${timeRange}`)
    return response.data
  }
}

// Personal Analysis API
export const personalAnalysisApi = {
  runAnalysis: async (accountId: number): Promise<ApiResponse<any>> => {
    const response = await api.post('/personal-analysis/run', { account_id: accountId })
    return response.data
  },

  getAnalysis: async (accountId: number): Promise<ApiResponse<any>> => {
    const response = await api.get(`/personal-analysis/${accountId}`)
    return response.data
  },

  generateContentIdeas: async (accountId: number, count: number = 10): Promise<ApiResponse<any>> => {
    const response = await api.post('/personal-analysis/content-ideas', { 
      account_id: accountId, 
      count 
    })
    return response.data
  },

  getVoiceAnalysis: async (accountId: number): Promise<ApiResponse<any>> => {
    const response = await api.get(`/personal-analysis/${accountId}/voice`)
    return response.data
  },

  getContentPerformance: async (accountId: number, timeRange: string = '90d'): Promise<ApiResponse<any>> => {
    const response = await api.get(`/personal-analysis/${accountId}/performance?range=${timeRange}`)
    return response.data
  },

  getHashtagAnalysis: async (accountId: number): Promise<ApiResponse<any>> => {
    const response = await api.get(`/personal-analysis/${accountId}/hashtags`)
    return response.data
  },

  getImprovementSuggestions: async (accountId: number): Promise<ApiResponse<any>> => {
    const response = await api.get(`/personal-analysis/${accountId}/suggestions`)
    return response.data
  }
}

// Setup API
export const setupApi = {
  initializeApp: async (): Promise<ApiResponse<any>> => {
    const response = await api.post('/setup/initialize')
    return response.data
  },

  getSetupStatus: async (): Promise<ApiResponse<any>> => {
    const response = await api.get('/setup/status')
    return response.data
  }
}

export default api