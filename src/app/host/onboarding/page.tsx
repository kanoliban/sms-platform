'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/auth-context'
import { Button, Card } from '@/components/ui'
import { Confetti } from '@/components/ui/confetti'
import { PageContainer } from '@/components/layout'
import { AppHeader } from '@/components/composed'
import { useToast } from '@/components/ui/toast'
import { HostApplicationFlow, type HostTerms } from '@/components/host'

// Helper to render content with ***SMS*** as bold+italic+white
function renderContent(content: string) {
  const parts = content.split(/(\*\*\*SMS\*\*\*)/g);
  return parts.map((part, i) => {
    if (part === '***SMS***') {
      return <strong key={i} className="text-white"><em>SMS</em></strong>;
    }
    return part;
  });
}

// Helper to render title with SMS as bold+italic+white
function renderTitle(title: string) {
  const parts = title.split(/(SMS)/g);
  return parts.map((part, i) => {
    if (part === 'SMS') {
      return <strong key={i} className="text-white"><em>SMS</em></strong>;
    }
    return part;
  });
}

const PHILOSOPHY_SECTIONS = [
  {
    title: 'What is SMS?',
    content: `***SMS*** — Strangers Meeting Strangers — is a movement. We believe that the best connections happen when people show up with intention, openness, and a willingness to be surprised.

As a host, you're not just throwing an event—you're creating a container for human connection. You're inviting strangers into a space where they can be themselves, share stories, and leave with new perspectives.`
  },
  {
    title: "The Host's Role",
    content: `You are the curator of the experience. You set the tone, create the environment, and hold space for others. Your job is not to be the life of the party—it's to make sure everyone feels welcome and engaged.

Great hosts:
• Arrive early and prepare the space
• Welcome each guest individually
• Facilitate introductions and conversation
• Keep the energy flowing
• Know when to step back and let magic happen`
  },
  {
    title: 'Trust & Safety',
    content: `Every guest trusts you with their time, money, and vulnerability. Honor that trust.

• Screen guests thoughtfully—you can approve or decline anyone
• Create clear expectations in your space description
• Be responsive to messages and questions
• Address any issues quickly and with care
• Never share guest information outside the platform`
  },
  {
    title: 'The Money Part',
    content: `Guests pay when they RSVP, but we only capture the payment after they attend. No-shows aren't charged (though their trust score takes a hit).

You'll receive payouts after each space, minus a small platform fee. This isn't about getting rich—it's about covering your costs and valuing your time as a host.`
  },
]

const COMMITMENTS = [
  'I will create spaces with intention and care',
  'I will respond to guests within 24 hours',
  'I will show up on time and prepared',
  'I will treat every guest with respect and kindness',
  'I will address issues promptly and fairly',
  'I understand that my hosting privileges can be revoked if I violate community guidelines',
]

type ApplicationStatus = 'none' | 'pending' | 'approved' | 'rejected'

export default function HostOnboardingPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { addToast } = useToast()

  const [currentSection, setCurrentSection] = useState(0)
  const [readSections, setReadSections] = useState<Set<number>>(new Set())
  const [commitmentChecks, setCommitmentChecks] = useState<Set<number>>(new Set())

  // New state for application flow
  const [showApplicationFlow, setShowApplicationFlow] = useState(false)
  const [terms, setTerms] = useState<HostTerms | null>(null)
  const [applicationStatus, setApplicationStatus] = useState<ApplicationStatus>('none')
  const [showPendingScreen, setShowPendingScreen] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [loadingTerms, setLoadingTerms] = useState(true)


  // Mark section 0 as read on initial load (user is viewing it)
  useEffect(() => {
    setReadSections(prev => new Set([...prev, 0]))
  }, [])

  // Fetch terms and application status
  const fetchTermsAndStatus = useCallback(async () => {
    try {
      const response = await fetch('/api/host/apply', {
        credentials: 'include', // Include cookies
      })

      if (response.ok) {
        const data = await response.json()
        setTerms(data.terms)

        if (data.application) {
          setApplicationStatus(data.application.status as ApplicationStatus)
          if (data.application.status === 'pending') {
            setShowPendingScreen(true)
          }
        }
      }
    } catch (error) {
      console.error('Error fetching terms:', error)
    } finally {
      setLoadingTerms(false)
    }
  }, [])

  useEffect(() => {
    if (!authLoading && user) {
      fetchTermsAndStatus()
    }
  }, [authLoading, user, fetchTermsAndStatus])

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
  const allCommitmentsChecked = commitmentChecks.size === COMMITMENTS.length
  const canSubmit = allSectionsRead && allCommitmentsChecked

  const handleRequestToHost = () => {
    if (!canSubmit) return
    setShowApplicationFlow(true)
  }

  const handleApplicationSubmit = async (data: {
    termsVersionId: string
    signatureName: string
  }) => {
    const response = await fetch('/api/host/apply', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Include cookies
      body: JSON.stringify(data),
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.error || 'Failed to submit application')
    }

    // Success! Show pending screen with confetti
    setShowApplicationFlow(false)
    setShowConfetti(true)
    setApplicationStatus('pending')

    // Short delay then show pending screen
    setTimeout(() => {
      setShowPendingScreen(true)
    }, 1500)

    addToast({
      variant: 'success',
      title: 'Application Submitted!',
      description: 'We\'ll review your application and get back to you soon.',
    })
  }

  // Handle redirects in useEffect to avoid setState during render
  useEffect(() => {
    if (authLoading) return

    if (!user) {
      router.push('/login?redirect=/host/onboarding')
    } else if (user.role === 'host' || user.role === 'founder') {
      router.push('/host')
    }
  }, [user, authLoading, router])

  // Show loading while auth is initializing or redirecting
  if (authLoading || !user || user.role === 'host' || user.role === 'founder') {
    return (
      <div className="min-h-screen bg-[var(--bg-base)] flex items-center justify-center">
        <div className="text-[var(--text-secondary)]">Loading...</div>
      </div>
    )
  }

  // Show pending screen if application is pending
  if (showPendingScreen || applicationStatus === 'pending') {
    return (
      <div className="min-h-screen bg-[var(--bg-base)]">
        {showConfetti && <Confetti duration={5000} count={300} />}
        <AppHeader />

        <PageContainer size="sm" className="py-24">
          <div className="text-center">
            {/* Pending Icon */}
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[var(--warning-muted)] mb-8">
              <svg className="w-10 h-10 text-[var(--warning)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>

            <h1 className="text-[var(--text-2xl)] font-bold text-[var(--text-primary)] mb-4">
              Application Submitted
            </h1>

            <p className="text-[var(--text-secondary)] max-w-md mx-auto mb-8">
              Thank you for your interest in hosting with <strong className="text-white"><em>SMS</em></strong>.
              We review all applications personally to ensure the quality of our community.
            </p>

            <Card className="p-6 text-left max-w-md mx-auto mb-8">
              <h3 className="text-[var(--text-sm)] font-semibold text-[var(--text-primary)] mb-3">
                What happens next?
              </h3>
              <ul className="space-y-2 text-[var(--text-sm)] text-[var(--text-secondary)]">
                <li className="flex items-start gap-2">
                  <span className="text-[var(--primary)] mt-0.5">•</span>
                  We&apos;ll review your application within 24-48 hours
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[var(--primary)] mt-0.5">•</span>
                  You&apos;ll receive a text message when approved
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[var(--primary)] mt-0.5">•</span>
                  Once approved, you can start creating spaces immediately
                </li>
              </ul>
            </Card>

            <Button
              variant="secondary"
              onClick={() => router.push('/discover')}
            >
              Explore Spaces While You Wait
            </Button>
          </div>
        </PageContainer>
      </div>
    )
  }

  const section = PHILOSOPHY_SECTIONS[currentSection]
  if (!section) return null

  return (
    <div className="min-h-screen bg-[var(--bg-base)]">
      <AppHeader />

      <PageContainer size="md" className="py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--primary-muted)] mb-6">
            <svg className="w-8 h-8 text-[var(--primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />
            </svg>
          </div>
          <h1 className="text-[var(--text-2xl)] font-bold text-[var(--text-primary)] mb-3">
            Become a Host
          </h1>
          <p className="text-[var(--text-secondary)] max-w-lg mx-auto">
            Before you can create spaces, let&apos;s make sure you understand what it means to host with <strong><em>SMS</em></strong>.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
                    {commitmentChecks.size} / {COMMITMENTS.length}
                  </span>
                </div>
              </div>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-8">
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

            <Card className="p-8">
              <h2 className="text-[var(--text-xl)] font-semibold text-[var(--text-primary)] mb-2">
                Host Commitments
              </h2>
              <p className="text-[var(--text-sm)] text-[var(--text-secondary)] mb-6">
                By checking these boxes, you agree to uphold these principles as an <strong><em>SMS</em></strong> host.
              </p>

              <div className="space-y-4">
                {COMMITMENTS.map((commitment, index) => (
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

            <Card className={`p-8 ${canSubmit ? 'bg-[var(--success-muted)] border-[var(--success-border)]' : ''}`}>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 className="text-[var(--text-lg)] font-semibold text-[var(--text-primary)] mb-1">
                    {canSubmit ? 'Ready to Apply!' : 'Complete All Steps'}
                  </h3>
                  <p className="text-[var(--text-sm)] text-[var(--text-secondary)]">
                    {canSubmit
                      ? <>Submit your application to become an <strong className="text-white"><em>SMS</em></strong> host.</>
                      : 'Read all sections and check all commitments to continue.'
                    }
                  </p>
                </div>
                <Button
                  variant="primary"
                  size="lg"
                  disabled={!canSubmit || loadingTerms}
                  onClick={handleRequestToHost}
                  className="sm:flex-shrink-0"
                >
                  Request to Host
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </PageContainer>

      {/* Host Application Flow Modal */}
      <HostApplicationFlow
        open={showApplicationFlow}
        onClose={() => setShowApplicationFlow(false)}
        onSubmit={handleApplicationSubmit}
        terms={terms}
        userName={user?.name || user?.phone || 'User'}
      />
    </div>
  )
}
