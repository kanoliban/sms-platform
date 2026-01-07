'use client'

import { useState, useCallback, useEffect } from 'react'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { toast } from '@/components/ui/toast'

export interface HostApplicationModalProps {
  open: boolean
  onClose: () => void
}

// Format phone number as user types
function formatPhoneDisplay(value: string): string {
  const digits = value.replace(/\D/g, '')
  if (digits.length <= 3) return digits
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`
}

export function HostApplicationModal({ open, onClose }: HostApplicationModalProps) {
  const [step, setStep] = useState<'form' | 'success'>('form')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [eventIdea, setEventIdea] = useState('')
  const [whyHost, setWhyHost] = useState('')
  const [loading, setLoading] = useState(false)

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      setStep('form')
      setName('')
      setPhone('')
      setEmail('')
      setEventIdea('')
      setWhyHost('')
    }
  }, [open])

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 10)
    setPhone(digits)
  }

  const handleSubmit = useCallback(async () => {
    if (!name.trim()) {
      toast({
        variant: 'error',
        title: 'Name required',
        description: 'Please enter your name.',
      })
      return
    }

    if (phone.length !== 10) {
      toast({
        variant: 'error',
        title: 'Invalid phone number',
        description: 'Please enter a valid 10-digit phone number.',
      })
      return
    }

    if (!eventIdea.trim()) {
      toast({
        variant: 'error',
        title: 'Event idea required',
        description: 'Tell us about your event idea.',
      })
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'host',
          name: name.trim(),
          phone: `+1${phone}`,
          email: email.trim() || null,
          event_idea: eventIdea.trim(),
          why_host: whyHost.trim() || null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit application')
      }

      setStep('success')
      toast({
        variant: 'success',
        title: 'Application received!',
        description: "We'll be in touch soon.",
      })
    } catch (error) {
      toast({
        variant: 'error',
        title: 'Something went wrong',
        description: error instanceof Error ? error.message : 'Please try again.',
      })
    } finally {
      setLoading(false)
    }
  }, [name, phone, email, eventIdea, whyHost])

  const isFormValid = name.trim() && phone.length === 10 && eventIdea.trim()

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="md"
      title={step === 'form' ? <>Become an <span className="font-bold italic">SMS</span> Host</> : null}
      description={step === 'form' ? "Tell us about yourself and the experience you want to create." : undefined}
    >
      {step === 'form' ? (
        <div className="space-y-6">
          {/* Name */}
          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-2">
              Name <span className="text-[var(--error-text)]">*</span>
            </label>
            <Input
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              autoFocus
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-2">
              Phone <span className="text-[var(--error-text)]">*</span>
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
                disabled={loading}
                className="pl-12"
              />
            </div>
          </div>

          {/* Email (optional) */}
          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-2">
              Email <span className="text-[var(--text-muted)]">(optional)</span>
            </label>
            <Input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>

          {/* Event Idea */}
          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-2">
              What kind of experience do you want to host? <span className="text-[var(--error-text)]">*</span>
            </label>
            <Textarea
              placeholder="e.g., Dinner for 8, strangers only. Good food, deep conversation, no networking energy."
              value={eventIdea}
              onChange={(e) => setEventIdea(e.target.value)}
              disabled={loading}
              rows={3}
              maxLength={500}
            />
            <div className="text-right mt-1">
              <span className="text-xs text-[var(--text-muted)]">
                {eventIdea.length} / 500
              </span>
            </div>
          </div>

          {/* Why Host (optional) */}
          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-2">
              Why do you want to host? <span className="text-[var(--text-muted)]">(optional)</span>
            </label>
            <Textarea
              placeholder="Tell us a bit about yourself and what drives you to bring people together."
              value={whyHost}
              onChange={(e) => setWhyHost(e.target.value)}
              disabled={loading}
              rows={3}
              maxLength={500}
            />
            <div className="text-right mt-1">
              <span className="text-xs text-[var(--text-muted)]">
                {whyHost.length} / 500
              </span>
            </div>
          </div>

          <Button
            variant="primary"
            fullWidth
            onClick={handleSubmit}
            loading={loading}
            disabled={!isFormValid || loading}
          >
            {loading ? 'Submitting...' : 'Submit application'}
          </Button>
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[#34c759]/20 flex items-center justify-center">
            <svg className="w-8 h-8 text-[#34c759]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Application received!</h2>
          <p className="text-white/70 mb-6">
            Thanks for your interest in hosting. We'll review your application and text you soon.
          </p>
          <Button variant="secondary" onClick={onClose}>
            Done
          </Button>
        </div>
      )}
    </Modal>
  )
}

export default HostApplicationModal
