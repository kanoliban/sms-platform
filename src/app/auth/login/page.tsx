'use client'

import { Suspense, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button, Input, Card } from '@/components/ui'
import { PageContainer } from '@/components/layout'
import { useAuth } from '@/lib/auth/auth-context'

type Step = 'phone' | 'verify'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/'

  const { user, loading: authLoading, sendCode, verifyCode, signInWithGoogle } = useAuth()

  const [step, setStep] = useState<Step>('phone')
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resendCooldown, setResendCooldown] = useState(0)

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      router.push(redirectTo)
    }
  }, [user, authLoading, router, redirectTo])

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCooldown])

  // Format phone number as user types
  const formatPhoneDisplay = (value: string) => {
    const digits = value.replace(/\D/g, '')
    if (digits.length <= 3) return digits
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 10)
    setPhone(digits)
  }

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault()
    if (phone.length !== 10) {
      setError('Please enter a valid 10-digit phone number')
      return
    }

    setLoading(true)
    setError(null)

    const result = await sendCode(phone)

    setLoading(false)

    if (result.success) {
      setStep('verify')
      setResendCooldown(60)
    } else {
      setError(result.error || 'Failed to send code')
    }
  }

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    if (code.length !== 6) {
      setError('Please enter the 6-digit code')
      return
    }

    setLoading(true)
    setError(null)

    const result = await verifyCode(phone, code)

    setLoading(false)

    if (result.success) {
      router.push(redirectTo)
    } else {
      setError(result.error || 'Invalid code')
    }
  }

  const handleResendCode = async () => {
    if (resendCooldown > 0) return

    setLoading(true)
    setError(null)

    const result = await sendCode(phone)

    setLoading(false)

    if (result.success) {
      setResendCooldown(60)
      setCode('')
    } else {
      setError(result.error || 'Failed to resend code')
    }
  }

  const handleBack = () => {
    setStep('phone')
    setCode('')
    setError(null)
  }

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true)
    setError(null)
    const result = await signInWithGoogle()
    if (!result.success) {
      setError(result.error || 'Failed to sign in with Google')
      setGoogleLoading(false)
    }
  }

  if (authLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-[var(--text-secondary)]">Loading...</div>
      </div>
    )
  }

  return (
    <main className="flex-1 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-[var(--text-2xl)] font-bold text-[var(--text-primary)] mb-2">
            {step === 'phone' ? <>Welcome to <span className="italic">SMS</span></> : 'Enter your code'}
          </h1>
          <p className="text-[var(--text-secondary)]">
            {step === 'phone'
              ? 'Sign in with your phone number'
              : `We sent a 6-digit code to ${formatPhoneDisplay(phone)}`}
          </p>
        </div>

        <Card className="p-6">
          {step === 'phone' ? (
            <div className="space-y-6">
              {/* Google Sign In */}
              <Button
                type="button"
                variant="secondary"
                size="lg"
                className="w-full"
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
                    or continue with phone
                  </span>
                </div>
              </div>

              {/* Phone Form */}
              <form onSubmit={handleSendCode} className="space-y-6">
              <div>
                <label className="block text-[var(--text-sm)] font-medium text-[var(--text-primary)] mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
                    +1
                  </span>
                  <Input
                    type="tel"
                    placeholder="(555) 555-5555"
                    value={formatPhoneDisplay(phone)}
                    onChange={handlePhoneChange}
                    className="pl-12"
                    autoFocus
                    autoComplete="tel"
                  />
                </div>
                <p className="text-[var(--text-xs)] text-[var(--text-muted)] mt-2">
                  We'll send you a verification code via SMS
                </p>
              </div>

              {error && (
                <div className="p-3 rounded-[var(--radius-md)] bg-[var(--error-muted)] border border-[var(--error-border)]">
                  <p className="text-[var(--text-sm)] text-[var(--error-text)]">{error}</p>
                </div>
              )}

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full"
                  loading={loading}
                  disabled={phone.length !== 10 || loading || googleLoading}
                >
                  {loading ? 'Sending...' : 'Continue with Phone'}
                </Button>
              </form>
            </div>
          ) : (
            <form onSubmit={handleVerifyCode} className="space-y-6">
              <div>
                <label className="block text-[var(--text-sm)] font-medium text-[var(--text-primary)] mb-2">
                  Verification Code
                </label>
                <Input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="000000"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="text-center text-2xl tracking-[0.5em] font-mono"
                  autoFocus
                  autoComplete="one-time-code"
                />
              </div>

              {error && (
                <div className="p-3 rounded-[var(--radius-md)] bg-[var(--error-muted)] border border-[var(--error-border)]">
                  <p className="text-[var(--text-sm)] text-[var(--error-text)]">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                loading={loading}
                disabled={code.length !== 6 || loading}
              >
                {loading ? 'Verifying...' : 'Verify'}
              </Button>

              <div className="flex items-center justify-between text-[var(--text-sm)]">
                <button
                  type="button"
                  onClick={handleBack}
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
            </form>
          )}
        </Card>

        {/* Footer links */}
        <div className="mt-6 text-center text-[var(--text-sm)] text-[var(--text-muted)]">
          <p>
            By continuing, you agree to our{' '}
            <Link href="/terms" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] underline">
              Terms
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] underline">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}

function LoginFormFallback() {
  return (
    <main className="flex-1 flex items-center justify-center p-6">
      <div className="text-[var(--text-secondary)]">Loading...</div>
    </main>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-base)] flex flex-col">
      {/* Header */}
      <header className="border-b border-[var(--border-subtle)]">
        <PageContainer>
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="font-bold italic text-xl tracking-tight text-[var(--text-primary)] hover:opacity-80 transition-opacity">
              SMS
            </Link>
          </div>
        </PageContainer>
      </header>

      <Suspense fallback={<LoginFormFallback />}>
        <LoginForm />
      </Suspense>
    </div>
  )
}
