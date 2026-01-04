'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/lib/auth/auth-context'
import { Button, Card } from '@/components/ui'
import { PageContainer } from '@/components/layout'

interface HostAuthGuardProps {
  children: React.ReactNode
}

export function HostAuthGuard({ children }: HostAuthGuardProps) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)

  // Allow onboarding page for any logged-in user (not just hosts)
  const isOnboardingPage = pathname === '/host/onboarding'

  useEffect(() => {
    if (!loading && !user) {
      setShowLoginPrompt(true)
    }
  }, [loading, user])

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-base)] flex items-center justify-center">
        <div className="text-[var(--text-secondary)]">Loading...</div>
      </div>
    )
  }

  // Not logged in
  if (!user || showLoginPrompt) {
    return (
      <div className="min-h-screen bg-[var(--bg-base)]">
        <PageContainer size="sm" className="py-16">
          <Card className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[var(--bg-subtle)] flex items-center justify-center">
              <svg className="w-8 h-8 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
            </div>
            <h1 className="text-[var(--text-xl)] font-semibold text-[var(--text-primary)] mb-3">
              Sign in required
            </h1>
            <p className="text-[var(--text-secondary)] mb-6">
              Please sign in to access the host dashboard.
            </p>
            <Button variant="primary" size="lg" onClick={() => router.push('/auth/login?redirect=/host')}>
              Sign In
            </Button>
          </Card>
        </PageContainer>
      </div>
    )
  }

  // Check if user is a host or founder
  const isHost = user.role === 'host' || user.role === 'founder'

  // Allow logged-in non-hosts to access onboarding
  if (!isHost && !isOnboardingPage) {
    return (
      <div className="min-h-screen bg-[var(--bg-base)]">
        <PageContainer size="sm" className="py-16">
          <Card className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[var(--warning-muted)] flex items-center justify-center">
              <svg className="w-8 h-8 text-[var(--warning-text)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
            </div>
            <h1 className="text-[var(--text-xl)] font-semibold text-[var(--text-primary)] mb-3">
              Host access required
            </h1>
            <p className="text-[var(--text-secondary)] mb-6">
              You need to be approved as a host to access this area.
              Interested in hosting? Apply to become a host.
            </p>
            <div className="flex gap-3 justify-center">
              <Button variant="secondary" size="md" onClick={() => router.push('/')}>
                Go Home
              </Button>
              <Button variant="primary" size="md" onClick={() => router.push('/host/onboarding')}>
                Apply to Host
              </Button>
            </div>
          </Card>
        </PageContainer>
      </div>
    )
  }

  // User is authorized - render children
  return <>{children}</>
}
