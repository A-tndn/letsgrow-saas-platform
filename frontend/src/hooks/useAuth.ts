'use client'

// Simplified auth hook - no authentication required
// This is a placeholder for when auth is added back later

interface AuthState {
  user: null
  isLoading: boolean
  isAuthenticated: boolean
}

const authState: AuthState = {
  user: null,
  isLoading: false,
  isAuthenticated: false,
}

// No-op functions to prevent runtime errors when components call auth actions
const noOp = async () => {}
const noOpSync = () => {}

// Hook for components - returns empty auth state with no-op functions
export const useAuth = () => {
  return {
    ...authState,
    // Computed values
    isAdmin: false,
    subscriptionTier: 'free' as const,
    apiUsagePercentage: 0,
    // No-op action functions to prevent runtime errors
    login: noOp,
    register: noOp,
    logout: noOp,
    checkAuth: noOp,
    updateUser: noOpSync,
  }
}