'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/auth-context'

interface HostGuardProps {
  children: React.ReactNode
  /** If true, allows founders as well as hosts */
  allowFounder?: boolean
}

/**
 * Protects host pages by requiring authentication and host role.
 * Redirects to login if not authenticated.
 * Shows unauthorized message if authenticated but not a host.
 */
export function HostGuard({ children, allowFounder = true }: HostGuardProps) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      // Not authenticated - redirect to login with return URL
      const currentPath = window.location.pathname + window.location.search
      const redirect = encodeURIComponent(currentPath)
      router.push(`/auth/login?redirect=${redirect}`)
    }
  }, [user, loading, router])

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-base)] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[var(--text-secondary)]">Loading...</p>
        </div>
      </div>
    )
  }

  // Not authenticated - will redirect via useEffect
  if (!user) {
    return (
      <div className="min-h-screen bg-[var(--bg-base)] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[var(--text-secondary)]">Redirecting to login...</p>
        </div>
      </div>
    )
  }

  // Check role - host or founder (if allowed)
  const isHost = user.role === 'host'
  const isFounder = user.role === 'founder'
  const hasAccess = isHost || (allowFounder && isFounder)

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-[var(--bg-base)] flex items-center justify-center p-4">
        <div className="max-w-md text-center">
          <div className="w-16 h-16 bg-[var(--bg-subtle)] rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-[var(--text-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-[var(--text-primary)] mb-2">
            Host Access Required
          </h1>
          <p className="text-[var(--text-secondary)] mb-6">
            This area is only accessible to hosts. Want to become a host and create your own spaces?
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => router.push('/host/onboarding')}
              className="px-6 py-3 bg-[var(--primary)] text-white rounded-lg font-medium hover:bg-[var(--primary-hover)] transition-colors"
            >
              Become a Host
            </button>
            <button
              onClick={() => router.push('/discover')}
              className="px-6 py-3 bg-[var(--bg-subtle)] text-[var(--text-primary)] rounded-lg font-medium hover:bg-[var(--bg-surface)] transition-colors"
            >
              Browse Spaces
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Authorized - render children
  return <>{children}</>
}

/**
 * Hook to get the authenticated host user.
 * Use this inside components wrapped by HostGuard to access the user.
 */
export function useHostUser() {
  const { user } = useAuth()

  if (!user) {
    throw new Error('useHostUser must be used inside a HostGuard component')
  }

  return user
}
