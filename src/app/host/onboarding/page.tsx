'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/auth-context'
import { Button, Card } from '@/components/ui'
import { PageContainer } from '@/components/layout'
import { AppHeader } from '@/components/composed'
import { useToast } from '@/components/ui/toast'

const PHILOSOPHY_SECTIONS = [
  {
    title: 'What is SMS?',
    content: `Strangers Meeting Strangers is a movement. We believe that the best connections happen when people show up with intention, openness, and a willingness to be surprised.

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

export default function HostOnboardingPage() {
  const router = useRouter()
  const { user, loading: authLoading, refreshUser } = useAuth()
  const { addToast } = useToast()

  const [currentSection, setCurrentSection] = useState(0)
  const [readSections, setReadSections] = useState<Set<number>>(new Set())
  const [commitmentChecks, setCommitmentChecks] = useState<Set<number>>(new Set())
  const [submitting, setSubmitting] = useState(false)

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

  const handleSubmit = async () => {
    if (!canSubmit || !user) return

    setSubmitting(true)

    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()

      const { error } = await supabase
        .from('users')
        .update({ role: 'host' })
        .eq('id', user.id)

      if (error) throw error

      await refreshUser()

      addToast({
        variant: 'success',
        title: 'Welcome, Host!',
        description: 'You can now create spaces and invite guests.',
      })

      router.push('/host')
    } catch (err) {
      console.error('Error updating role:', err)
      addToast({
        variant: 'error',
        title: 'Something went wrong',
        description: 'Please try again or contact support.',
      })
    } finally {
      setSubmitting(false)
    }
  }

  // Show loading while auth is initializing
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[var(--bg-base)] flex items-center justify-center">
        <div className="text-[var(--text-secondary)]">Loading...</div>
      </div>
    )
  }

  // Redirect if not logged in
  if (!user) {
    router.push('/login?redirect=/host/onboarding')
    return null
  }

  // Already a host - redirect to host hub
  if (user.role === 'host' || user.role === 'founder') {
    router.push('/host')
    return null
  }

  const section = PHILOSOPHY_SECTIONS[currentSection]

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
            Before you can create spaces, let&apos;s make sure you understand what it means to host with SMS.
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
                      {s.title}
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
                {section.title}
              </h2>
              <div className="prose prose-sm text-[var(--text-secondary)] whitespace-pre-line">
                {section.content}
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
                By checking these boxes, you agree to uphold these principles as an SMS host.
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
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-[var(--text-lg)] font-semibold text-[var(--text-primary)] mb-1">
                    {canSubmit ? 'Ready to Host!' : 'Complete All Steps'}
                  </h3>
                  <p className="text-[var(--text-sm)] text-[var(--text-secondary)]">
                    {canSubmit
                      ? 'Click the button to activate your host account.'
                      : 'Read all sections and check all commitments to continue.'
                    }
                  </p>
                </div>
                <Button
                  variant="primary"
                  size="lg"
                  disabled={!canSubmit || submitting}
                  loading={submitting}
                  onClick={handleSubmit}
                >
                  {submitting ? 'Activating...' : 'Become a Host'}
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </PageContainer>
    </div>
  )
}
