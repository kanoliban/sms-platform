'use client'

import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui'

interface SignatureModalProps {
  open: boolean
  onClose: () => void
  onSign: (signatureName: string) => void
  onViewTerms: () => void
  userName?: string // Used as placeholder hint
  isSubmitting?: boolean
}

export function SignatureModal({
  open,
  onClose,
  onSign,
  onViewTerms,
  userName,
  isSubmitting = false,
}: SignatureModalProps) {
  const [signatureName, setSignatureName] = useState('')
  const [error, setError] = useState('')

  // Reset when modal opens
  useEffect(() => {
    if (open) {
      setSignatureName('')
      setError('')
    }
  }, [open])

  const handleSign = () => {
    const trimmed = signatureName.trim()
    if (!trimmed) {
      setError('Please type your name to sign')
      return
    }

    // Require at least 2 characters for a valid signature
    if (trimmed.length < 2) {
      setError('Please enter your full name')
      return
    }

    onSign(trimmed)
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="sm"
      closeOnOverlayClick={!isSubmitting}
      closeOnEscape={!isSubmitting}
      title={
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[var(--bg-subtle)] flex items-center justify-center">
            <svg className="w-5 h-5 text-[var(--text-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
            </svg>
          </div>
          <span>Sign & Accept</span>
        </div>
      }
    >
      <div className="space-y-4">
        <p className="text-[var(--text-sm)] text-[var(--text-secondary)]">
          Type in your name to confirm you agree to the{' '}
          <button
            type="button"
            onClick={onViewTerms}
            className="text-[var(--primary)] hover:underline font-medium"
          >
            Host Terms
          </button>
          .
        </p>

        {/* Signature Input */}
        <div className="relative">
          <input
            type="text"
            value={signatureName}
            onChange={(e) => {
              setSignatureName(e.target.value)
              setError('')
            }}
            placeholder={userName || 'Your full name'}
            disabled={isSubmitting}
            className="w-full px-4 py-4 text-center text-[var(--text-xl)] bg-[var(--bg-subtle)] border border-[var(--border-default)] rounded-[var(--radius-lg)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-[var(--duration-normal)]"
            style={{
              fontFamily: "'Dancing Script', 'Brush Script MT', cursive",
              fontStyle: 'italic',
            }}
          />
          {/* Signature line */}
          <div className="absolute bottom-3 left-4 right-4 border-b border-[var(--border-default)] pointer-events-none" />
        </div>

        {error && (
          <p className="text-[var(--text-sm)] text-[var(--error-text)]">{error}</p>
        )}


        {/* Submit Button */}
        <Button
          variant="primary"
          size="lg"
          className="w-full"
          onClick={handleSign}
          disabled={!signatureName.trim() || isSubmitting}
          loading={isSubmitting}
        >
          {isSubmitting ? 'Submitting Application...' : 'Sign & Submit Application'}
        </Button>

        <p className="text-[var(--text-xs)] text-[var(--text-muted)] text-center">
          By signing, you agree to the <strong className="text-white"><em>SMS</em></strong> Host Terms and confirm all information provided is accurate.
        </p>
      </div>

      {/* Import cursive font */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;500;600;700&display=swap');
      `}</style>
    </Modal>
  )
}

export default SignatureModal
