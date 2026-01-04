'use client'

import { useState, useCallback } from 'react'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui'
import { HostTermsModal } from './host-terms-modal'
import { SignatureModal } from './signature-modal'

export interface HostTerms {
  id: string
  version: string
  title: string
  content: string
  summary: string
}

interface HostApplicationFlowProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: {
    termsVersionId: string
    signatureName: string
  }) => Promise<void>
  terms: HostTerms | null
  userName: string
}

type FlowStep = 'agreement' | 'terms' | 'signature'

export function HostApplicationFlow({
  open,
  onClose,
  onSubmit,
  terms,
  userName,
}: HostApplicationFlowProps) {
  const [currentStep, setCurrentStep] = useState<FlowStep>('agreement')
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [showTermsFromSignature, setShowTermsFromSignature] = useState(false)

  // Reset state when modal opens
  const handleClose = useCallback(() => {
    if (isSubmitting) return
    setCurrentStep('agreement')
    setTermsAccepted(false)
    setError('')
    setShowTermsFromSignature(false)
    onClose()
  }, [onClose, isSubmitting])

  const handleViewTerms = () => {
    if (currentStep === 'signature') {
      setShowTermsFromSignature(true)
    } else {
      setCurrentStep('terms')
    }
  }

  const handleAcceptTerms = () => {
    setTermsAccepted(true)
    setCurrentStep('agreement')
  }

  const handleCloseTerms = () => {
    setCurrentStep('agreement')
  }

  const handleContinueToSignature = () => {
    if (!termsAccepted) {
      setError('Please accept the Host Terms to continue')
      return
    }
    setCurrentStep('signature')
  }

  const handleSign = async (signatureName: string) => {
    if (!terms) return

    setIsSubmitting(true)
    setError('')

    try {
      await onSubmit({
        termsVersionId: terms.id,
        signatureName,
      })
      // Success! The parent component will handle the redirect
    } catch (err) {
      console.error('Error submitting application:', err)
      setError('Failed to submit application. Please try again.')
      setIsSubmitting(false)
    }
  }

  const handleBackFromSignature = () => {
    setCurrentStep('agreement')
  }

  if (!terms) {
    return null
  }

  // Main agreement step
  if (currentStep === 'agreement') {
    return (
      <Modal
        open={open}
        onClose={handleClose}
        size="sm"
        title={
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[var(--primary-muted)] flex items-center justify-center">
              <svg className="w-5 h-5 text-[var(--primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
            </div>
            <span>Host Application</span>
          </div>
        }
      >
        <div className="space-y-5">
          {/* User Info */}
          <div className="flex items-center gap-3 p-3 bg-[var(--bg-subtle)] rounded-[var(--radius-lg)]">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-medium">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-[var(--text-sm)] font-medium text-[var(--text-primary)]">{userName}</p>
              <p className="text-[var(--text-xs)] text-[var(--text-muted)]">Applying to become a host</p>
            </div>
          </div>

          {/* Terms Agreement Checkbox */}
          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={termsAccepted}
              onChange={(e) => {
                setTermsAccepted(e.target.checked)
                setError('')
              }}
              className="mt-0.5 w-5 h-5 rounded border-[var(--border-default)] text-[var(--primary)] focus:ring-[var(--primary)] focus:ring-offset-0 cursor-pointer"
            />
            <span className="text-[var(--text-sm)] text-[var(--text-primary)]">
              By applying, I agree to the{' '}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  handleViewTerms()
                }}
                className="text-[var(--primary)] hover:underline font-medium"
              >
                Host Terms
              </button>
              .<span className="text-[var(--error-text)]">*</span>
            </span>
          </label>

          {error && (
            <p className="text-[var(--text-sm)] text-[var(--error-text)]">{error}</p>
          )}

          {/* Summary of what they're agreeing to */}
          {terms.summary && (
            <div className="p-3 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-md)]">
              <p className="text-[var(--text-xs)] text-[var(--text-muted)]">
                {terms.summary}
              </p>
            </div>
          )}

          {/* Continue Button */}
          <Button
            variant="primary"
            size="lg"
            className="w-full"
            onClick={handleContinueToSignature}
            disabled={!termsAccepted}
          >
            Continue
          </Button>

          <p className="text-[var(--text-xs)] text-[var(--text-muted)] text-center">
            You&apos;ll be asked to sign the agreement in the next step.
          </p>
        </div>
      </Modal>
    )
  }

  // Terms viewing step
  if (currentStep === 'terms') {
    return (
      <HostTermsModal
        open={true}
        onClose={handleCloseTerms}
        onAccept={handleAcceptTerms}
        termsContent={terms.content}
        termsTitle={terms.title}
      />
    )
  }

  // Signature step
  if (currentStep === 'signature') {
    return (
      <>
        <SignatureModal
          open={!showTermsFromSignature}
          onClose={handleBackFromSignature}
          onSign={handleSign}
          onViewTerms={handleViewTerms}
          userName={userName}
          isSubmitting={isSubmitting}
        />
        {/* Terms modal for viewing from signature step */}
        <HostTermsModal
          open={showTermsFromSignature}
          onClose={() => setShowTermsFromSignature(false)}
          onAccept={() => setShowTermsFromSignature(false)}
          termsContent={terms.content}
          termsTitle={terms.title}
        />
      </>
    )
  }

  return null
}

export default HostApplicationFlow
