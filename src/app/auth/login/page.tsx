'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button, Input, Card } from '@/components/ui'
import { PageContainer } from '@/components/layout'
import { useAuth } from '@/lib/auth/context'

type Step = 'phone' | 'verify'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/'

  const { user, loading: authLoading, login, verifyCode } = useAuth()

  const [step, setStep] = useState<Step>('phone')
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
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

    const result = await login(phone)

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

    const result = await login(phone)

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

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[var(--bg-base)] flex items-center justify-center">
        <div className="text-[var(--text-secondary)]">Loading...</div>
      </div>
    )
  }

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

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-[var(--text-2xl)] font-bold text-[var(--text-primary)] mb-2">
              {step === 'phone' ? 'Welcome to SMS' : 'Enter your code'}
            </h1>
            <p className="text-[var(--text-secondary)]">
              {step === 'phone'
                ? 'Sign in with your phone number'
                : `We sent a 6-digit code to ${formatPhoneDisplay(phone)}`}
            </p>
          </div>

          <Card className="p-6">
            {step === 'phone' ? (
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
                  disabled={phone.length !== 10 || loading}
                >
                  {loading ? 'Sending...' : 'Continue'}
                </Button>
              </form>
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
    </div>
  )
}
