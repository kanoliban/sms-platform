'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from '@/components/ui/toast'
import { useAuth } from '@/lib/auth/auth-context'

export interface LoginModalProps {
  open: boolean
  onClose: () => void
  onSuccess?: () => void
}

type Step = 'phone' | 'verify'

// Format phone number as user types
function formatPhoneDisplay(value: string): string {
  const digits = value.replace(/\D/g, '')
  if (digits.length <= 3) return digits
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`
}

export function LoginModal({ open, onClose, onSuccess }: LoginModalProps) {
  const router = useRouter()
  const [step, setStep] = useState<Step>('phone')
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const { sendCode, verifyCode, user, refreshUser } = useAuth()

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      setStep('phone')
      setPhone('')
      setCode('')
      setResendCooldown(0)
    }
  }, [open])

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return
    const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000)
    return () => clearTimeout(timer)
  }, [resendCooldown])

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 10)
    setPhone(digits)
  }

  const handleSendCode = useCallback(async () => {
    if (phone.length !== 10) {
      toast({
        variant: 'error',
        title: 'Invalid phone number',
        description: 'Please enter a valid 10-digit phone number.',
      })
      return
    }

    setLoading(true)
    const result = await sendCode(phone)
    setLoading(false)

    if (!result.success) {
      toast({
        variant: 'error',
        title: 'Failed to send code',
        description: result.error || 'Please try again.',
      })
      return
    }

    setStep('verify')
    setResendCooldown(60)
    toast({
      variant: 'success',
      title: 'Code sent',
      description: `We sent a verification code to your phone.`,
    })
  }, [phone, sendCode])

  const handleVerifyCode = useCallback(async () => {
    if (code.length !== 6) {
      toast({
        variant: 'error',
        title: 'Invalid code',
        description: 'Please enter the 6-digit code.',
      })
      return
    }

    setLoading(true)
    const result = await verifyCode(phone, code)
    setLoading(false)

    if (!result.success) {
      toast({
        variant: 'error',
        title: 'Invalid code',
        description: result.error || 'Please try again.',
      })
      return
    }

    // Refresh user to get latest data including onboarding_completed
    await refreshUser()

    toast({
      variant: 'success',
      title: 'Welcome!',
      description: 'You have been signed in.',
    })

    onClose()

    // Check if user needs onboarding (fetch fresh user data)
    const res = await fetch('/api/auth/me')
    const data = await res.json()
    if (data.user && data.user.onboarding_completed === false) {
      router.push('/onboarding')
    } else {
      onSuccess?.()
    }
  }, [phone, code, verifyCode, onClose, onSuccess, refreshUser, router])

  const handleResendCode = useCallback(async () => {
    if (resendCooldown > 0) return

    setLoading(true)
    const result = await sendCode(phone)
    setLoading(false)

    if (result.success) {
      setResendCooldown(60)
      setCode('')
      toast({
        variant: 'success',
        title: 'Code resent',
        description: 'A new verification code has been sent.',
      })
    } else {
      toast({
        variant: 'error',
        title: 'Failed to resend',
        description: result.error || 'Please try again.',
      })
    }
  }, [phone, resendCooldown, sendCode])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !loading) {
        if (step === 'phone' && phone.length === 10) {
          handleSendCode()
        } else if (step === 'verify' && code.length === 6) {
          handleVerifyCode()
        }
      }
    },
    [step, phone, code, loading, handleSendCode, handleVerifyCode]
  )

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="sm"
      title={step === 'phone' ? 'Sign in to SMS' : 'Enter verification code'}
      description={
        step === 'phone'
          ? "We'll send you a code to verify your phone number."
          : `We sent a 6-digit code to ${formatPhoneDisplay(phone)}`
      }
    >
      <div className="space-y-4">
        {step === 'phone' ? (
          <>
            <div>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
                  +1
                </span>
                <Input
                  type="tel"
                  placeholder="(555) 555-5555"
                  value={formatPhoneDisplay(phone)}
                  onChange={handlePhoneChange}
                  onKeyDown={handleKeyDown}
                  disabled={loading}
                  className="pl-12"
                  autoFocus
                />
              </div>
              <p className="text-[var(--text-xs)] text-[var(--text-muted)] mt-2">
                Standard message rates may apply
              </p>
            </div>

            <Button
              variant="primary"
              fullWidth
              onClick={handleSendCode}
              loading={loading}
              disabled={phone.length !== 10 || loading}
            >
              {loading ? 'Sending...' : 'Continue'}
            </Button>
          </>
        ) : (
          <>
            <Input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="000000"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              onKeyDown={handleKeyDown}
              disabled={loading}
              className="text-center text-2xl tracking-[0.5em] font-mono"
              autoFocus
            />

            <Button
              variant="primary"
              fullWidth
              onClick={handleVerifyCode}
              loading={loading}
              disabled={code.length !== 6 || loading}
            >
              {loading ? 'Verifying...' : 'Verify'}
            </Button>

            <div className="flex items-center justify-between text-[var(--text-sm)]">
              <button
                type="button"
                onClick={() => {
                  setStep('phone')
                  setCode('')
                }}
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                Change number
              </button>
              <button
                type="button"
                onClick={handleResendCode}
                disabled={resendCooldown > 0 || loading}
                className={`transition-colors ${
                  resendCooldown > 0 || loading
                    ? 'text-[var(--text-muted)] cursor-not-allowed'
                    : 'text-[var(--primary)] hover:text-[var(--primary-hover)]'
                }`}
              >
                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend code'}
              </button>
            </div>
          </>
        )}
      </div>
    </Modal>
  )
}

export default LoginModal
