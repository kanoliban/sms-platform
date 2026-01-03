'use client'

import { useState } from 'react'

type SignupType = 'host' | 'attendee'

interface SignupModalProps {
  type: SignupType
  isOpen: boolean
  onClose: () => void
}

export function SignupModal({ type, isOpen, onClose }: SignupModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    eventIdea: '',
    whyHost: '',
    interests: '',
    neighborhoods: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, ...formData }),
      })

      if (!response.ok) throw new Error('Failed to submit')

      setSubmitted(true)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      eventIdea: '',
      whyHost: '',
      interests: '',
      neighborhoods: '',
    })
    setSubmitted(false)
    setError(null)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-[#1c1c1e] rounded-[20px] w-full max-w-md p-6 shadow-2xl animate-fade-in-up">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {submitted ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-[#34c759] rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">You're in.</h2>
            <p className="text-white/70 mb-6">
              {type === 'host'
                ? "We'll review your application and text you soon."
                : "Welcome to the pool. Watch for a text when the right space opens."
              }
            </p>
            <button
              onClick={handleClose}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
            >
              Close
            </button>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-white mb-2">
              {type === 'host' ? 'Apply to Host' : 'Join the Pool'}
            </h2>
            <p className="text-white/60 mb-6 text-sm">
              {type === 'host'
                ? "Tell us about yourself and the space you want to create."
                : "Tell us what you're into. We'll text you when the right gathering opens."
              }
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-white/70 mb-1">Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-[#34c759] transition-colors"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label className="block text-sm text-white/70 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-[#34c759] transition-colors"
                  placeholder="you@email.com"
                />
              </div>

              <div>
                <label className="block text-sm text-white/70 mb-1">Phone</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-[#34c759] transition-colors"
                  placeholder="(612) 555-1234"
                />
              </div>

              {type === 'host' ? (
                <>
                  <div>
                    <label className="block text-sm text-white/70 mb-1">Your event idea</label>
                    <textarea
                      required
                      value={formData.eventIdea}
                      onChange={(e) => setFormData(prev => ({ ...prev, eventIdea: e.target.value }))}
                      className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-[#34c759] transition-colors resize-none"
                      rows={2}
                      placeholder="e.g., Dinner for 8. Saturday 7pm. $40. Creatives only."
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-white/70 mb-1">Why do you want to host?</label>
                    <textarea
                      value={formData.whyHost}
                      onChange={(e) => setFormData(prev => ({ ...prev, whyHost: e.target.value }))}
                      className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-[#34c759] transition-colors resize-none"
                      rows={2}
                      placeholder="What draws you to creating spaces for strangers?"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm text-white/70 mb-1">What are you into?</label>
                    <textarea
                      required
                      value={formData.interests}
                      onChange={(e) => setFormData(prev => ({ ...prev, interests: e.target.value }))}
                      className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-[#34c759] transition-colors resize-none"
                      rows={2}
                      placeholder="e.g., art, music, food, deep conversations, outdoor adventures..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-white/70 mb-1">Preferred neighborhoods</label>
                    <input
                      type="text"
                      value={formData.neighborhoods}
                      onChange={(e) => setFormData(prev => ({ ...prev, neighborhoods: e.target.value }))}
                      className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-[#34c759] transition-colors"
                      placeholder="e.g., Northeast, Uptown, Downtown..."
                    />
                  </div>
                </>
              )}

              {error && (
                <p className="text-red-400 text-sm">{error}</p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-[#34c759] hover:bg-[#2db550] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors"
              >
                {isSubmitting ? 'Submitting...' : type === 'host' ? 'Submit Application' : 'Join the Pool'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
