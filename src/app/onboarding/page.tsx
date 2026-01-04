'use client'

import { useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/auth-context'
import { Button, Card } from '@/components/ui'
import { PageContainer } from '@/components/layout'
import { useToast } from '@/components/ui/toast'

type UserIntent = 'attend' | 'host' | 'both'

const INTENT_OPTIONS: Array<{
  value: UserIntent
  title: string
  description: string
  icon: ReactNode
}> = [
  {
    value: 'attend',
    title: 'I want to discover and attend spaces',
    description: 'Find gatherings hosted by others in your area',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
      </svg>
    ),
  },
  {
    value: 'host',
    title: 'I want to create and host spaces',
    description: 'Host your own gatherings and build community',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />
      </svg>
    ),
  },
  {
    value: 'both',
    title: 'Both - I want to attend and host',
    description: 'Experience spaces as a guest and create your own',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
      </svg>
    ),
  },
]

export default function OnboardingPage() {
  const router = useRouter()
  const { user, loading: authLoading, refreshUser } = useAuth()
  const { addToast } = useToast()

  const [selectedIntent, setSelectedIntent] = useState<UserIntent | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login')
    }
  }, [authLoading, user, router])

  const handleContinue = async () => {
    if (!selectedIntent || !user) return

    setSubmitting(true)

    try {
      const res = await fetch('/api/auth/complete-onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intent: selectedIntent }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to save preferences')
      }

      await refreshUser()

      // Route based on intent
      if (selectedIntent === 'host') {
        router.push('/host/onboarding')
      } else if (selectedIntent === 'both') {
        setShowConfirmation(true)
      } else {
        addToast({
          variant: 'success',
          title: 'Welcome to SMS!',
          description: "Let's find your first space.",
        })
        router.push('/discover')
      }
    } catch (err) {
      console.error('Error completing onboarding:', err)
      addToast({
        variant: 'error',
        title: 'Something went wrong',
        description: 'Please try again.',
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleSkip = async () => {
    if (!user) return

    setSubmitting(true)

    try {
      const res = await fetch('/api/auth/complete-onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intent: 'attend', skipped: true }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to save preferences')
      }

      await refreshUser()
      router.push('/discover')
    } catch (err) {
      console.error('Error skipping onboarding:', err)
      addToast({
        variant: 'error',
        title: 'Something went wrong',
        description: 'Please try again.',
      })
    } finally {
      setSubmitting(false)
    }
  }

  // Show loading while auth is initializing or redirecting
  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-[var(--bg-base)] flex items-center justify-center">
        <div className="text-[var(--text-secondary)]">Loading...</div>
      </div>
    )
  }

  // "Both" confirmation screen
  if (showConfirmation) {
    return (
      <PageContainer size="sm" className="py-16">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--primary-muted)] mb-6">
            <svg className="w-8 h-8 text-[var(--primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-[var(--text-2xl)] font-bold text-[var(--text-primary)] mb-3">
            Perfect!
          </h1>
          <p className="text-[var(--text-secondary)] max-w-md mx-auto">
            You can attend spaces right away. Want to complete host setup now or explore first?
          </p>
        </div>

        <div className="space-y-4 max-w-md mx-auto">
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={() => router.push('/host/onboarding')}
          >
            Set up hosting now
          </Button>
          <Button
            variant="secondary"
            size="lg"
            fullWidth
            onClick={() => router.push('/discover')}
          >
            Explore first, host later
          </Button>
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer size="sm" className="py-16">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--primary-muted)] mb-6">
          <svg className="w-8 h-8 text-[var(--primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
          </svg>
        </div>
        <h1 className="text-[var(--text-2xl)] font-bold text-[var(--text-primary)] mb-3">
          Welcome to SMS
        </h1>
        <p className="text-[var(--text-secondary)] max-w-md mx-auto">
          Strangers Meeting Strangers is about intentional human connection. What brings you here?
        </p>
      </div>

      <div className="space-y-4 mb-8">
        {INTENT_OPTIONS.map((option) => (
          <Card
            key={option.value}
            className={`p-5 cursor-pointer transition-all duration-[var(--duration-normal)] ${
              selectedIntent === option.value
                ? 'border-[var(--primary)] bg-[var(--primary-muted)]'
                : 'border-transparent hover:border-[var(--border-default)]'
            }`}
            onClick={() => setSelectedIntent(option.value)}
          >
            <div className="flex items-start gap-4">
              <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                selectedIntent === option.value
                  ? 'bg-[var(--primary)] text-white'
                  : 'bg-[var(--bg-subtle)] text-[var(--text-secondary)]'
              }`}>
                {option.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className={`text-[var(--text-base)] font-medium mb-1 ${
                  selectedIntent === option.value
                    ? 'text-[var(--text-primary)]'
                    : 'text-[var(--text-primary)]'
                }`}>
                  {option.title}
                </h3>
                <p className="text-[var(--text-sm)] text-[var(--text-secondary)]">
                  {option.description}
                </p>
              </div>
              <div className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                selectedIntent === option.value
                  ? 'border-[var(--primary)] bg-[var(--primary)]'
                  : 'border-[var(--border-default)]'
              }`}>
                {selectedIntent === option.value && (
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="space-y-3">
        <Button
          variant="primary"
          size="lg"
          fullWidth
          disabled={!selectedIntent || submitting}
          loading={submitting}
          onClick={handleContinue}
        >
          Continue
        </Button>
        <button
          type="button"
          onClick={handleSkip}
          disabled={submitting}
          className="w-full text-[var(--text-sm)] text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors py-2"
        >
          Skip for now
        </button>
      </div>
    </PageContainer>
  )
}
