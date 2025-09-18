import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  authApi, 
  socialAccountsApi, 
  automationsApi, 
  contentApi, 
  analyticsApi,
  personalAnalysisApi,
  User,
  SocialAccount,
  Automation,
  ContentPost,
  Analytics
} from '@/lib/api'
import toast from 'react-hot-toast'

// Authentication hooks
export function useAuth() {
  const { data: user, isLoading } = useQuery({
    queryKey: ['auth', 'current-user'],
    queryFn: authApi.getCurrentUser,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  return {
    user: user?.data,
    isLoading,
    isAuthenticated: !!user?.success && !!user?.data,
  }
}

export function useLogin() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authApi.login(email, password),
    onSuccess: (data) => {
      if (data.success && data.data) {
        localStorage.setItem('auth_token', data.data.token)
        queryClient.setQueryData(['auth', 'current-user'], { 
          success: true, 
          data: data.data.user 
        })
        toast.success('Login successful!')
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Login failed')
    }
  })
}

export function useRegister() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (userData: {
      email: string
      password: string
      first_name: string
      last_name: string
    }) => authApi.register(userData),
    onSuccess: (data) => {
      if (data.success && data.data) {
        localStorage.setItem('auth_token', data.data.token)
        queryClient.setQueryData(['auth', 'current-user'], { 
          success: true, 
          data: data.data.user 
        })
        toast.success('Registration successful!')
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Registration failed')
    }
  })
}

export function useLogout() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      localStorage.removeItem('auth_token')
      queryClient.clear()
      toast.success('Logged out successfully')
    }
  })
}

// Social Accounts hooks
export function useSocialAccounts() {
  return useQuery({
    queryKey: ['social-accounts'],
    queryFn: socialAccountsApi.getAccounts,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

export function useConnectSocialAccount() {
  return useMutation({
    mutationFn: (data: {
      platform: string
      access_token: string
      access_token_secret?: string
    }) => socialAccountsApi.connectAccount(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-accounts'] })
      toast.success('Social account connected successfully!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to connect account')
    }
  })
}

export function useDisconnectSocialAccount() {
  return useMutation({
    mutationFn: (accountId: number) => socialAccountsApi.disconnectAccount(accountId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-accounts'] })
      toast.success('Account disconnected')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to disconnect account')
    }
  })
}

export function useRefreshSocialAccount() {
  return useMutation({
    mutationFn: (accountId: number) => socialAccountsApi.refreshAccount(accountId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-accounts'] })
      toast.success('Account refreshed')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to refresh account')
    }
  })
}

// Automations hooks
export function useAutomations() {
  return useQuery({
    queryKey: ['automations'],
    queryFn: automationsApi.getAutomations,
    staleTime: 30 * 1000, // 30 seconds
  })
}

export function useCreateAutomation() {
  return useMutation({
    mutationFn: (data: {
      name: string
      social_account_id: number
      content_type: string
      schedule: any
      rules: any
    }) => automationsApi.createAutomation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automations'] })
      toast.success('Automation created successfully!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create automation')
    }
  })
}

export function useUpdateAutomation() {
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Automation> }) =>
      automationsApi.updateAutomation(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automations'] })
      toast.success('Automation updated')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update automation')
    }
  })
}

export function useDeleteAutomation() {
  return useMutation({
    mutationFn: (id: number) => automationsApi.deleteAutomation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automations'] })
      toast.success('Automation deleted')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete automation')
    }
  })
}

export function useToggleAutomation() {
  return useMutation({
    mutationFn: (id: number) => automationsApi.toggleAutomation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automations'] })
      toast.success('Automation status updated')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to toggle automation')
    }
  })
}

// Content hooks
export function useContent() {
  return useQuery({
    queryKey: ['content'],
    queryFn: contentApi.getContent,
    staleTime: 30 * 1000, // 30 seconds
  })
}

export function useContentQueue() {
  return useQuery({
    queryKey: ['content-queue'],
    queryFn: () => contentApi.getContent().then(data => ({
      data: {
        content_queue: data?.data?.content || []
      }
    })),
    staleTime: 30 * 1000, // 30 seconds
  })
}

export function useGenerateContent() {
  return useMutation({
    mutationFn: (data: {
      topic: string
      platform: string
      tone: string
      content_type: string
    }) => contentApi.generateContent(data),
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to generate content')
    }
  })
}

export function useGenerateHashtags() {
  return useMutation({
    mutationFn: (data: {
      topic: string
      platform: string
      count: number
    }) => contentApi.generateHashtags(data),
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to generate hashtags')
    }
  })
}

export function useScheduleContent() {
  return useMutation({
    mutationFn: (data: {
      social_account_id: number
      content: string
      hashtags: string[]
      media_urls: string[]
      scheduled_for: string
    }) => contentApi.scheduleContent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content'] })
      toast.success('Content scheduled successfully!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to schedule content')
    }
  })
}

export function useUpdateContent() {
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<ContentPost> }) =>
      contentApi.updateContent(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content'] })
      toast.success('Content updated')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update content')
    }
  })
}

export function useDeleteContent() {
  return useMutation({
    mutationFn: (id: number) => contentApi.deleteContent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content'] })
      toast.success('Content deleted')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete content')
    }
  })
}

// Analytics hooks
export function useAnalyticsOverview(timeRange: number = 30) {
  return useQuery({
    queryKey: ['analytics', 'overview', timeRange],
    queryFn: () => analyticsApi.getOverview(timeRange),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function usePlatformAnalytics(platform: string, timeRange: number = 30) {
  return useQuery({
    queryKey: ['analytics', 'platform', platform, timeRange],
    queryFn: () => analyticsApi.getPlatformAnalytics(platform, timeRange),
    enabled: !!platform,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Personal Analysis hooks
export function usePersonalAnalysis(accountId: string) {
  return useQuery({
    queryKey: ['personal-analysis', accountId],
    queryFn: () => personalAnalysisApi.getAnalysis(parseInt(accountId)),
    enabled: !!accountId && accountId !== '',
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useRunPersonalAnalysis() {
  return useMutation({
    mutationFn: (accountId: number) => personalAnalysisApi.runAnalysis(accountId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['personal-analysis'] })
      toast.success('Analysis completed!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Analysis failed')
    }
  })
}

export function useGenerateContentIdeas() {
  return useMutation({
    mutationFn: ({ accountId, count }: { accountId: number; count?: number }) =>
      personalAnalysisApi.generateContentIdeas(accountId, count),
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to generate content ideas')
    }
  })
}

export function useVoiceAnalysis(accountId: string) {
  return useQuery({
    queryKey: ['voice-analysis', accountId],
    queryFn: () => personalAnalysisApi.getVoiceAnalysis(parseInt(accountId)),
    enabled: !!accountId && accountId !== '',
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useContentPerformance(accountId: string, timeRange: string = '90d') {
  return useQuery({
    queryKey: ['content-performance', accountId, timeRange],
    queryFn: () => personalAnalysisApi.getContentPerformance(parseInt(accountId), timeRange),
    enabled: !!accountId && accountId !== '',
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useHashtagAnalysis(accountId: string) {
  return useQuery({
    queryKey: ['hashtag-analysis', accountId],
    queryFn: () => personalAnalysisApi.getHashtagAnalysis(parseInt(accountId)),
    enabled: !!accountId && accountId !== '',
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useImprovementSuggestions(accountId: string) {
  return useQuery({
    queryKey: ['improvement-suggestions', accountId],
    queryFn: () => personalAnalysisApi.getImprovementSuggestions(parseInt(accountId)),
    enabled: !!accountId && accountId !== '',
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Usage Stats hook
export function useUsageStats() {
  return useQuery({
    queryKey: ['usage-stats'],
    queryFn: () => analyticsApi.getOverview(30).then(data => ({
      ...data,
      usage_percentage: Math.round(Math.random() * 100) // Mock for now
    })),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}