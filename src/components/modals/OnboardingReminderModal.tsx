'use client'

import { useRouter } from 'next/navigation'

interface OnboardingReminderModalProps {
  isOpen: boolean
  onClose: () => void
  onContinueAnyway: () => void
}

export function OnboardingReminderModal({
  isOpen,
  onClose,
  onContinueAnyway,
}: OnboardingReminderModalProps) {
  const router = useRouter()

  if (!isOpen) return null

  const handleCompleteOnboarding = () => {
    onClose()
    router.push('/onboarding')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md mx-4 bg-[var(--color-bg-secondary)] rounded-2xl shadow-2xl border border-[var(--color-border-primary)]">
        {/* Header */}
        <div className="p-6 border-b border-[var(--color-border-primary)]">
          <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">
            Complete Your Onboarding
          </h2>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-[var(--color-text-secondary)]">
            You skipped the onboarding earlier. Before your first RSVP, we recommend completing it to understand:
          </p>

          <ul className="space-y-2 text-[var(--color-text-secondary)]">
            <li className="flex items-start gap-2">
              <span className="text-[var(--color-accent-primary)] mt-1">•</span>
              <span>What <strong className="text-white"><em>SMS</em></strong> is all about</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--color-accent-primary)] mt-1">•</span>
              <span>Your role as a guest</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--color-accent-primary)] mt-1">•</span>
              <span>How trust and payments work</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--color-accent-primary)] mt-1">•</span>
              <span>Guest commitments we all share</span>
            </li>
          </ul>

          <p className="text-sm text-[var(--color-text-tertiary)]">
            It only takes a minute and helps everyone have better experiences.
          </p>
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-[var(--color-border-primary)] flex flex-col gap-3">
          <button
            onClick={handleCompleteOnboarding}
            className="w-full py-3 px-4 bg-[var(--color-accent-primary)] text-white rounded-xl font-medium hover:bg-[var(--color-accent-primary-hover)] transition-colors"
          >
            Complete Onboarding
          </button>
          <button
            onClick={onContinueAnyway}
            className="w-full py-3 px-4 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors text-sm"
          >
            Continue to RSVP anyway
          </button>
        </div>
      </div>
    </div>
  )
}
