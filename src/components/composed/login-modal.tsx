'use client'

import { useState, useCallback } from 'react'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from '@/components/ui/toast'
import { useAuth } from '@/lib/auth/auth-context'

export interface LoginModalProps {
  open: boolean
  onClose: () => void
}

export function LoginModal({ open, onClose }: LoginModalProps) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const { signInWithMagicLink, signInWithGoogle } = useAuth()

  const handleMagicLink = useCallback(async () => {
    if (!email.trim()) {
      toast({
        variant: 'error',
        title: 'Email required',
        description: 'Please enter your email address.',
      })
      return
    }

    setLoading(true)
    const { error } = await signInWithMagicLink(email.trim())
    setLoading(false)

    if (error) {
      toast({
        variant: 'error',
        title: 'Failed to send link',
        description: error.message || 'Please try again.',
      })
      return
    }

    setSent(true)
    toast({
      variant: 'success',
      title: 'Check your email',
      description: 'We sent you a magic link to sign in.',
    })
  }, [email, signInWithMagicLink])

  const handleGoogleSignIn = useCallback(async () => {
    setLoading(true)
    const { error } = await signInWithGoogle()
    setLoading(false)

    if (error) {
      toast({
        variant: 'error',
        title: 'Sign in failed',
        description: error.message || 'Could not sign in with Google.',
      })
    }
  }, [signInWithGoogle])

  const handleClose = useCallback(() => {
    setEmail('')
    setSent(false)
    onClose()
  }, [onClose])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !loading && !sent) {
        handleMagicLink()
      }
    },
    [handleMagicLink, loading, sent]
  )

  return (
    <Modal
      open={open}
      onClose={handleClose}
      size="sm"
      title={sent ? 'Check your inbox' : 'Sign in to SMS'}
      description={
        sent
          ? `We sent a magic link to ${email}`
          : 'Enter your email to receive a sign-in link.'
      }
    >
      <div className="space-y-4">
        {sent ? (
          <div className="text-center py-4">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--success-muted)] flex items-center justify-center">
              <svg
                className="w-8 h-8 text-[var(--success-text)]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <p className="text-[var(--text-secondary)] text-[var(--text-sm)]">
              Click the link in your email to sign in. You can close this window.
            </p>
            <Button
              variant="ghost"
              onClick={() => setSent(false)}
              className="mt-4"
            >
              Use a different email
            </Button>
          </div>
        ) : (
          <>
            <Input
              type="email"
              label="Email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              icon={
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                  />
                </svg>
              }
            />

            <Button
              variant="primary"
              fullWidth
              onClick={handleMagicLink}
              loading={loading}
            >
              Send magic link
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[var(--border-subtle)]" />
              </div>
              <div className="relative flex justify-center text-[var(--text-xs)]">
                <span className="bg-[var(--bg-surface)] px-2 text-[var(--text-muted)]">
                  or continue with
                </span>
              </div>
            </div>

            <Button
              variant="secondary"
              fullWidth
              onClick={handleGoogleSignIn}
              disabled={loading}
              icon={
                <svg className="w-5 h-5" viewBox="0 0 24 24">
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
              }
            >
              Google
            </Button>
          </>
        )}
      </div>
    </Modal>
  )
}

export default LoginModal
