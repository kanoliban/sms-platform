'use client'

import { useState, useCallback, useEffect } from 'react'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from '@/components/ui/toast'

export interface WaitlistModalProps {
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

const INTEREST_OPTIONS = [
  'Dinner parties',
  'Deep conversations',
  'Creative activities',
  'Outdoor adventures',
  'Game nights',
  'Music & vinyl',
  'Wellness & mindfulness',
  'Professional networking',
]

const NEIGHBORHOOD_OPTIONS = [
  'Downtown',
  'North Loop',
  'Northeast',
  'Uptown',
  'South Minneapolis',
  'St. Paul',
  'Suburbs',
]

export function WaitlistModal({ open, onClose }: WaitlistModalProps) {
  const [step, setStep] = useState<'form' | 'success'>('form')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [interests, setInterests] = useState<string[]>([])
  const [neighborhoods, setNeighborhoods] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      setStep('form')
      setName('')
      setPhone('')
      setEmail('')
      setInterests([])
      setNeighborhoods([])
    }
  }, [open])

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 10)
    setPhone(digits)
  }

  const toggleInterest = (interest: string) => {
    setInterests(prev =>
      prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    )
  }

  const toggleNeighborhood = (neighborhood: string) => {
    setNeighborhoods(prev =>
      prev.includes(neighborhood)
        ? prev.filter(n => n !== neighborhood)
        : [...prev, neighborhood]
    )
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

    if (interests.length === 0) {
      toast({
        variant: 'error',
        title: 'Select interests',
        description: 'Please select at least one interest.',
      })
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'attendee',
          name: name.trim(),
          phone: `+1${phone}`,
          email: email.trim() || null,
          interests,
          neighborhoods: neighborhoods.length > 0 ? neighborhoods : null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to join waitlist')
      }

      setStep('success')
      toast({
        variant: 'success',
        title: "You're on the list!",
        description: "We'll text you when something fits.",
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
  }, [name, phone, email, interests, neighborhoods])

  const isFormValid = name.trim() && phone.length === 10 && interests.length > 0

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="md"
      title={step === 'form' ? <>Join <span className="font-bold italic">SMS</span></> : null}
      description={step === 'form' ? "Tell us a bit about yourself. We'll text you when something fits." : undefined}
    >
      {step === 'form' ? (
        <div className="space-y-4">
          {/* Name & Phone row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-[var(--text-secondary)] mb-1">
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
            <div>
              <label className="block text-xs text-[var(--text-secondary)] mb-1">
                Phone <span className="text-[var(--error-text)]">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-sm">
                  +1
                </span>
                <Input
                  type="tel"
                  placeholder="(555) 555-5555"
                  value={formatPhoneDisplay(phone)}
                  onChange={handlePhoneChange}
                  disabled={loading}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* Email (optional) */}
          <div>
            <label className="block text-xs text-[var(--text-secondary)] mb-1">
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

          {/* Interests */}
          <div>
            <label className="block text-xs text-[var(--text-secondary)] mb-1.5">
              What are you into? <span className="text-[var(--error-text)]">*</span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              {INTEREST_OPTIONS.map((interest) => (
                <button
                  key={interest}
                  type="button"
                  onClick={() => toggleInterest(interest)}
                  disabled={loading}
                  className={`px-2.5 py-1 rounded-full text-xs transition-all ${
                    interests.includes(interest)
                      ? 'bg-white text-black'
                      : 'bg-white/10 text-white/70 hover:bg-white/20'
                  }`}
                >
                  {interest}
                </button>
              ))}
            </div>
          </div>

          {/* Neighborhoods (optional) */}
          <div>
            <label className="block text-xs text-[var(--text-secondary)] mb-1.5">
              Preferred neighborhoods <span className="text-[var(--text-muted)]">(optional)</span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              {NEIGHBORHOOD_OPTIONS.map((neighborhood) => (
                <button
                  key={neighborhood}
                  type="button"
                  onClick={() => toggleNeighborhood(neighborhood)}
                  disabled={loading}
                  className={`px-2.5 py-1 rounded-full text-xs transition-all ${
                    neighborhoods.includes(neighborhood)
                      ? 'bg-white text-black'
                      : 'bg-white/10 text-white/70 hover:bg-white/20'
                  }`}
                >
                  {neighborhood}
                </button>
              ))}
            </div>
          </div>

          <Button
            variant="primary"
            fullWidth
            onClick={handleSubmit}
            loading={loading}
            disabled={!isFormValid || loading}
          >
            {loading ? 'Joining...' : 'Join the waitlist'}
          </Button>
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[#34c759]/20 flex items-center justify-center">
            <svg className="w-8 h-8 text-[#34c759]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">You're in!</h2>
          <p className="text-white/70 mb-6">
            We'll text you when there's an event that fits your vibe.
          </p>
          <Button variant="secondary" onClick={onClose}>
            Done
          </Button>
        </div>
      )}
    </Modal>
  )
}

export default WaitlistModal
