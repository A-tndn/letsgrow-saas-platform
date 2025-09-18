'use client'

import { ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '../hooks/useAuth'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      retry: (failureCount, error) => {
        // Don't retry on 401/403 errors
        if (error && typeof error === 'object' && 'status' in error) {
          const status = (error as any).status
          if (status === 401 || status === 403) return false
        }
        return failureCount < 3
      },
    },
    mutations: {
      retry: false,
    },
  },
})

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Toaster position="top-right" />
        {children}
      </AuthProvider>
    </QueryClientProvider>
  )
}
