'use client'

import { useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/auth-context'
import { Button, Card } from '@/components/ui'
import { PageContainer } from '@/components/layout'
import { useToast } from '@/components/ui/toast'

type UserIntent = 'attend' | 'host' | 'both'
type OnboardingStep = 'intent' | 'philosophy' | 'commitments' | 'complete'

// Helper to render content with ***SMS*** as bold+italic+white
function renderContent(content: string) {
  const parts = content.split(/(\*\*\*SMS\*\*\*)/g)
  return parts.map((part, i) => {
    if (part === '***SMS***') {
      return <strong key={i} className="text-white"><em>SMS</em></strong>
    }
    return part
  })
}

// Helper to render title with SMS as bold+italic+white
function renderTitle(title: string) {
  const parts = title.split(/(SMS)/g)
  return parts.map((part, i) => {
    if (part === 'SMS') {
      return <strong key={i} className="text-white"><em>SMS</em></strong>
    }
    return part
  })
}

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

const PHILOSOPHY_SECTIONS = [
  {
    title: 'What is SMS?',
    content: `***SMS*** — Strangers Meeting Strangers — is a movement built on a simple belief: meaningful connections happen when people show up with intention, openness, and a willingness to be present.

This isn't another event platform. These are intimate gatherings in real spaces—someone's home, a rooftop, a studio. You're not buying a ticket. You're accepting an invitation to connect.`
  },
  {
    title: "The Guest's Role",
    content: `As a guest, you're not a passive attendee—you're an active participant in creating the experience. The energy you bring affects everyone in the room.

Great guests:
• Arrive on time (hosts prepare for your arrival)
• Put away distractions and be present
• Come with curiosity about the people you'll meet
• Respect the host's space and guidelines
• Leave your comfort zone—that's where connection happens`
  },
  {
    title: 'Trust & Safety',
    content: `Every space involves mutual trust. Hosts open their spaces to you. You're entering spaces with people you haven't met.

Your trust score reflects your reliability—showing up when you say you will, being a positive presence, and respecting the community. Hosts see this score when reviewing RSVPs.

No-shows without notice hurt everyone: the host who prepared, the guests who could have taken your spot, and your own standing in the community.`
  },
  {
    title: 'How It Works',
    content: `When you RSVP to a space, your payment is held—not charged. You're only charged after you attend.

The exact location is revealed closer to the event (typically 24-48 hours before). This protects hosts' privacy while giving you time to plan.

If you need to cancel, do it with as much notice as possible. Life happens, and reasonable cancellations don't affect your trust score. Ghosting does.`
  },
]

const GUEST_COMMITMENTS = [
  'I will show up on time, or cancel with reasonable notice',
  'I will be present and engaged during spaces',
  'I will respect the host\'s space, guidelines, and other guests',
  'I understand my trust score reflects my reliability as a guest',
]

export default function OnboardingPage() {
  const router = useRouter()
  const { user, loading: authLoading, refreshUser } = useAuth()
  const { addToast } = useToast()

  const [step, setStep] = useState<OnboardingStep>('intent')
  const [selectedIntent, setSelectedIntent] = useState<UserIntent | null>(null)
  const [currentSection, setCurrentSection] = useState(0)
  const [readSections, setReadSections] = useState<Set<number>>(new Set())
  const [commitmentChecks, setCommitmentChecks] = useState<Set<number>>(new Set())
  const [submitting, setSubmitting] = useState(false)
  const [showBothConfirmation, setShowBothConfirmation] = useState(false)

  // Mark section 0 as read when entering philosophy step
  useEffect(() => {
    if (step === 'philosophy') {
      setReadSections(prev => new Set([...prev, 0]))
    }
  }, [step])

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login?redirect=/onboarding')
    }
  }, [authLoading, user, router])

  const handleSectionView = (index: number) => {
    setCurrentSection(index)
    setReadSections(prev => new Set([...prev, index]))
  }

  const toggleCommitment = (index: number) => {
    setCommitmentChecks(prev => {
      const next = new Set(prev)
      if (next.has(index)) {
        next.delete(index)
      } else {
        next.add(index)
      }
      return next
    })
  }

  const allSectionsRead = readSections.size === PHILOSOPHY_SECTIONS.length
  const allCommitmentsChecked = commitmentChecks.size === GUEST_COMMITMENTS.length

  const handleIntentContinue = () => {
    if (!selectedIntent) return

    // If host only, skip guest onboarding and go straight to host onboarding
    if (selectedIntent === 'host') {
      handleCompleteOnboarding(true)
    } else {
      // For 'attend' or 'both', go through guest philosophy
      setStep('philosophy')
    }
  }

  const handleSkipOnboarding = async () => {
    if (!user) return

    setSubmitting(true)

    try {
      const res = await fetch('/api/auth/complete-onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          intent: selectedIntent || 'attend',
          skipped: true
        }),
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

  const handleCompleteOnboarding = async (skipToHost = false) => {
    if (!user || !selectedIntent) return

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
      if (skipToHost || selectedIntent === 'host') {
        router.push('/host/onboarding')
      } else if (selectedIntent === 'both') {
        setShowBothConfirmation(true)
        setSubmitting(false)
      } else {
        addToast({
          variant: 'success',
          title: 'Welcome to SMS!',
          description: "You're all set. Let's find your first space.",
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

  // "Both" confirmation screen after completing guest onboarding
  if (showBothConfirmation) {
    return (
      <PageContainer size="sm" className="py-16">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--success-muted)] mb-6">
            <svg className="w-8 h-8 text-[var(--success)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-[var(--text-2xl)] font-bold text-[var(--text-primary)] mb-3">
            You&apos;re ready to attend spaces!
          </h1>
          <p className="text-[var(--text-secondary)] max-w-md mx-auto">
            You can start exploring and RSVPing right away. Want to complete host setup now or explore first?
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

  // Step 1: Intent Selection
  if (step === 'intent') {
    return (
      <PageContainer size="sm" className="py-16">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--primary-muted)] mb-6">
            <svg className="w-8 h-8 text-[var(--primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
            </svg>
          </div>
          <h1 className="text-[var(--text-2xl)] font-bold text-[var(--text-primary)] mb-3">
            Welcome to {renderTitle('SMS')}
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
                  <h3 className="text-[var(--text-base)] font-medium mb-1 text-[var(--text-primary)]">
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
            onClick={handleIntentContinue}
          >
            Continue
          </Button>
        </div>
      </PageContainer>
    )
  }

  // Step 2 & 3: Philosophy + Commitments (combined view like host onboarding)
  const section = PHILOSOPHY_SECTIONS[currentSection]
  if (!section) return null

  return (
    <PageContainer size="md" className="py-12">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--primary-muted)] mb-6">
          <svg className="w-8 h-8 text-[var(--primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
          </svg>
        </div>
        <h1 className="text-[var(--text-2xl)] font-bold text-[var(--text-primary)] mb-3">
          Before You Dive In
        </h1>
        <p className="text-[var(--text-secondary)] max-w-lg mx-auto">
          Take a moment to understand what {renderTitle('SMS')} is about and what we ask of our guests.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Progress Sidebar */}
        <div className="lg:col-span-1">
          <Card className="p-5 sticky top-8">
            <h3 className="text-[var(--text-sm)] font-semibold text-[var(--text-primary)] mb-4">
              Your Progress
            </h3>

            <div className="space-y-2 mb-6">
              {PHILOSOPHY_SECTIONS.map((s, index) => (
                <button
                  key={index}
                  onClick={() => handleSectionView(index)}
                  className={`w-full flex items-center gap-3 p-3 rounded-[var(--radius-md)] text-left transition-all duration-[var(--duration-normal)] ${
                    currentSection === index
                      ? 'bg-[var(--primary-muted)] border border-[var(--primary)]'
                      : 'bg-[var(--bg-subtle)] border border-transparent hover:border-[var(--border-default)]'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                    readSections.has(index)
                      ? 'bg-[var(--success)] text-white'
                      : 'bg-[var(--bg-surface)] border border-[var(--border-default)]'
                  }`}>
                    {readSections.has(index) && (
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    )}
                  </div>
                  <span className={`text-[var(--text-sm)] ${
                    currentSection === index ? 'text-[var(--text-primary)] font-medium' : 'text-[var(--text-secondary)]'
                  }`}>
                    {renderTitle(s.title)}
                  </span>
                </button>
              ))}
            </div>

            <div className="pt-4 border-t border-[var(--border-subtle)]">
              <div className="flex items-center justify-between text-[var(--text-xs)] mb-2">
                <span className="text-[var(--text-muted)]">Sections read</span>
                <span className="text-[var(--text-primary)] font-medium">
                  {readSections.size} / {PHILOSOPHY_SECTIONS.length}
                </span>
              </div>
              <div className="flex items-center justify-between text-[var(--text-xs)]">
                <span className="text-[var(--text-muted)]">Commitments</span>
                <span className="text-[var(--text-primary)] font-medium">
                  {commitmentChecks.size} / {GUEST_COMMITMENTS.length}
                </span>
              </div>
            </div>

            {/* Skip Option */}
            <div className="pt-4 mt-4 border-t border-[var(--border-subtle)]">
              <button
                type="button"
                onClick={handleSkipOnboarding}
                disabled={submitting}
                className="w-full text-[var(--text-xs)] text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors py-2"
              >
                Skip for now, remind me later
              </button>
            </div>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Philosophy Section */}
          <Card className="p-8">
            <h2 className="text-[var(--text-xl)] font-semibold text-[var(--text-primary)] mb-4">
              {renderTitle(section.title)}
            </h2>
            <div className="prose prose-sm text-[var(--text-secondary)] whitespace-pre-line">
              {renderContent(section.content)}
            </div>

            <div className="flex items-center justify-between mt-8 pt-6 border-t border-[var(--border-subtle)]">
              <Button
                variant="secondary"
                size="sm"
                disabled={currentSection === 0}
                onClick={() => handleSectionView(currentSection - 1)}
              >
                Previous
              </Button>
              {currentSection < PHILOSOPHY_SECTIONS.length - 1 ? (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleSectionView(currentSection + 1)}
                >
                  Next Section
                </Button>
              ) : (
                <span className="text-[var(--text-xs)] text-[var(--success-text)] font-medium">
                  Last section
                </span>
              )}
            </div>
          </Card>

          {/* Commitments */}
          <Card className="p-8">
            <h2 className="text-[var(--text-xl)] font-semibold text-[var(--text-primary)] mb-2">
              Guest Commitments
            </h2>
            <p className="text-[var(--text-sm)] text-[var(--text-secondary)] mb-6">
              By checking these boxes, you agree to uphold these principles as an {renderTitle('SMS')} guest.
            </p>

            <div className="space-y-4">
              {GUEST_COMMITMENTS.map((commitment, index) => (
                <label
                  key={index}
                  className="flex items-start gap-3 cursor-pointer group"
                >
                  <input
                    type="checkbox"
                    checked={commitmentChecks.has(index)}
                    onChange={() => toggleCommitment(index)}
                    className="mt-1 w-4 h-4 rounded border-[var(--border-default)] text-[var(--primary)] focus:ring-[var(--primary)] focus:ring-offset-0 cursor-pointer"
                  />
                  <span className="text-[var(--text-sm)] text-[var(--text-primary)] group-hover:text-[var(--primary)] transition-colors">
                    {commitment}
                  </span>
                </label>
              ))}
            </div>
          </Card>

          {/* Complete Button */}
          <Card className={`p-8 ${allSectionsRead && allCommitmentsChecked ? 'bg-[var(--success-muted)] border-[var(--success-border)]' : ''}`}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="text-[var(--text-lg)] font-semibold text-[var(--text-primary)] mb-1">
                  {allSectionsRead && allCommitmentsChecked ? "You're Ready!" : 'Complete All Steps'}
                </h3>
                <p className="text-[var(--text-sm)] text-[var(--text-secondary)]">
                  {allSectionsRead && allCommitmentsChecked
                    ? 'Start discovering spaces and connecting with your community.'
                    : 'Read all sections and check all commitments to continue.'
                  }
                </p>
              </div>
              <Button
                variant="primary"
                size="lg"
                disabled={!allSectionsRead || !allCommitmentsChecked || submitting}
                loading={submitting}
                onClick={() => handleCompleteOnboarding()}
                className="sm:flex-shrink-0"
              >
                Let&apos;s Go
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </PageContainer>
  )
}
