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
  redirectTo?: string // Optional redirect path after login (bypasses onboarding check)
}

type Step = 'phone' | 'verify'

// Format phone number as user types
function formatPhoneDisplay(value: string): string {
  const digits = value.replace(/\D/g, '')
  if (digits.length <= 3) return digits
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`
}

export function LoginModal({ open, onClose, onSuccess, redirectTo }: LoginModalProps) {
  const router = useRouter()
  const [step, setStep] = useState<Step>('phone')
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const { sendCode, verifyCode, signInWithGoogle, refreshUser } = useAuth()

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

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true)
    // Store redirect path in cookie before OAuth redirect (readable by server)
    if (redirectTo) {
      document.cookie = `auth_redirect=${encodeURIComponent(redirectTo)}; path=/; max-age=300; SameSite=Lax`
    }
    const result = await signInWithGoogle()
    if (!result.success) {
      toast({
        variant: 'error',
        title: 'Failed to sign in',
        description: result.error || 'Please try again.',
      })
      setGoogleLoading(false)
    }
    // If successful, the page will redirect to Google OAuth
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

    // If redirectTo is specified, go there directly (skip onboarding check)
    if (redirectTo) {
      router.push(redirectTo)
      return
    }

    // Otherwise check if user needs onboarding
    const res = await fetch('/api/auth/me')
    const data = await res.json()
    if (data.user && data.user.onboarding_completed === false) {
      router.push('/onboarding')
    } else {
      onSuccess?.()
    }
  }, [phone, code, verifyCode, onClose, onSuccess, refreshUser, router, redirectTo])

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
      title={step === 'phone' ? <>Sign in to <span className="font-bold italic">SMS</span></> : 'Enter verification code'}
      description={
        step === 'phone'
          ? 'Sign in with Google or your phone number.'
          : `We sent a 6-digit code to ${formatPhoneDisplay(phone)}`
      }
    >
      <div className="space-y-4">
        {step === 'phone' ? (
          <>
            {/* Google Sign In */}
            <Button
              type="button"
              variant="secondary"
              fullWidth
              onClick={handleGoogleSignIn}
              loading={googleLoading}
              disabled={googleLoading || loading}
            >
              <span className="inline-flex items-center justify-center gap-3">
                <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span>{googleLoading ? 'Signing in...' : 'Continue with Google'}</span>
              </span>
            </Button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[var(--border-subtle)]" />
              </div>
              <div className="relative flex justify-center text-[var(--text-sm)]">
                <span className="px-4 bg-[var(--bg-elevated)] text-[var(--text-muted)]">
                  or
                </span>
              </div>
            </div>

            {/* Phone Input */}
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
                  disabled={loading || googleLoading}
                  className="pl-12"
                />
              </div>
            </div>

            <Button
              variant="primary"
              fullWidth
              onClick={handleSendCode}
              loading={loading}
              disabled={phone.length !== 10 || loading || googleLoading}
            >
              {loading ? 'Sending...' : 'Continue with Phone'}
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
