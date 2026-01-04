'use client'

import { useState } from 'react'

type SignupType = 'host' | 'attendee'

interface SignupViewProps {
  type: SignupType
  onBack: () => void
  onSuccess?: (type: SignupType, name: string) => void
  animate?: boolean
}

export function SignupView({ type, onBack, onSuccess, animate = false }: SignupViewProps) {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, ...formData }),
      })

      if (!response.ok) throw new Error('Failed to submit')

      // Call success callback to return to conversation with confirmation
      if (onSuccess) {
        onSuccess(type, formData.name)
      } else {
        setSubmitted(true)
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBack = () => {
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
    onBack()
  }

  return (
    <div className={`h-full flex flex-col bg-black ${animate ? 'animate-slide-in-right' : ''}`}>
      {/* Status bar */}
      <div className="h-[54px] px-[20px] flex items-end justify-between pb-[8px]"
        style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", sans-serif' }}>
        <span className="text-[15px] font-semibold text-white">9:41</span>
        <div className="flex items-center gap-[5px]">
          <svg className="w-[18px] h-[12px]" viewBox="0 0 18 12" fill="white">
            <rect x="0" y="3" width="3" height="9" rx="1" fillOpacity="0.3"/>
            <rect x="5" y="2" width="3" height="10" rx="1" fillOpacity="0.5"/>
            <rect x="10" y="1" width="3" height="11" rx="1" fillOpacity="0.7"/>
            <rect x="15" y="0" width="3" height="12" rx="1"/>
          </svg>
          <svg className="w-[16px] h-[12px]" viewBox="0 0 16 12" fill="white">
            <path d="M8 2.4c2.7 0 5.2 1.1 7 2.9.3.3.3.7 0 1-.3.3-.7.3-1 0C12.5 4.8 10.3 3.9 8 3.9S3.5 4.8 2 6.3c-.3.3-.7.3-1 0-.3-.3-.3-.7 0-1C2.8 3.5 5.3 2.4 8 2.4zm0 3c1.8 0 3.5.7 4.7 1.9.3.3.3.7 0 1-.3.3-.7.3-1 0-1-.9-2.3-1.4-3.7-1.4s-2.7.5-3.7 1.4c-.3.3-.7.3-1 0-.3-.3-.3-.7 0-1C4.5 6.1 6.2 5.4 8 5.4zm0 3c.9 0 1.8.4 2.4 1 .3.3.3.7 0 1-.3.3-.7.3-1 0-.4-.4-.9-.6-1.4-.6s-1 .2-1.4.6c-.3.3-.7.3-1 0-.3-.3-.3-.7 0-1 .6-.6 1.5-1 2.4-1z"/>
          </svg>
          <svg className="w-[25px] h-[12px]" viewBox="0 0 25 12" fill="white">
            <rect x="0" y="1" width="21" height="10" rx="2.5" stroke="white" strokeWidth="1" fill="none"/>
            <rect x="22" y="4" width="2" height="4" rx="0.5"/>
            <rect x="2" y="3" width="17" height="6" rx="1" fill="#34c759"/>
          </svg>
        </div>
      </div>

      {/* Header with back button */}
      <div className="h-[44px] px-[8px] flex items-center justify-between">
        <button
          onClick={handleBack}
          className="flex items-center gap-[4px] text-[#007aff] active:opacity-50 transition-opacity px-[8px] py-[8px] -ml-[8px]"
        >
          <svg className="w-[12px] h-[20px]" viewBox="0 0 12 20" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <path d="M10 2L2 10L10 18" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-[17px]" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", sans-serif' }}>
            Back
          </span>
        </button>

        <div className="absolute left-1/2 -translate-x-1/2">
          <span className="text-[17px] font-semibold text-white"
            style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", sans-serif' }}>
            {type === 'host' ? 'Apply to Host' : 'Join the Pool'}
          </span>
        </div>

        <div className="w-[80px]" />
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-y-auto" style={{ overscrollBehavior: 'contain' }}>
        {submitted ? (
          <div className="flex flex-col items-center justify-center h-full px-[20px] text-center">
            <div className="w-[80px] h-[80px] bg-[#34c759] rounded-full flex items-center justify-center mb-[20px]">
              <svg className="w-[40px] h-[40px] text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-[28px] font-bold text-white mb-[8px]"
              style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", sans-serif' }}>
              You're in.
            </h2>
            <p className="text-[15px] text-white/60 mb-[32px] leading-relaxed"
              style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", sans-serif' }}>
              {type === 'host'
                ? "We'll review your application and text you soon."
                : "Welcome to the pool. Watch for a text when the right space opens."
              }
            </p>
            <button
              onClick={handleBack}
              className="px-[32px] py-[14px] bg-[#1c1c1e] text-white rounded-[12px] text-[17px] font-semibold active:opacity-80"
              style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", sans-serif' }}
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-[16px] py-[20px]">
            {/* Description */}
            <p className="text-[13px] text-white/50 uppercase tracking-wide px-[16px] mb-[8px]"
              style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", sans-serif' }}>
              {type === 'host' ? 'Host Application' : 'Join the Pool'}
            </p>
            <p className="text-[15px] text-white/60 px-[16px] mb-[20px]"
              style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", sans-serif' }}>
              {type === 'host'
                ? "Tell us about yourself and the space you want to create."
                : "Tell us what you're into. We'll text you when the right gathering opens."
              }
            </p>

            {/* Contact Info Group */}
            <div className="bg-[#1c1c1e] rounded-[12px] overflow-hidden mb-[24px]">
              <div className="border-b border-white/10">
                <div className="flex items-center px-[16px] py-[12px]">
                  <label className="text-[17px] text-white w-[100px]"
                    style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", sans-serif' }}>
                    Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="flex-1 bg-transparent text-[17px] text-white placeholder-white/30 focus:outline-none"
                    style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", sans-serif' }}
                    placeholder="Your name"
                  />
                </div>
              </div>
              <div className="border-b border-white/10">
                <div className="flex items-center px-[16px] py-[12px]">
                  <label className="text-[17px] text-white w-[100px]"
                    style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", sans-serif' }}>
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="flex-1 bg-transparent text-[17px] text-white placeholder-white/30 focus:outline-none"
                    style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", sans-serif' }}
                    placeholder="you@email.com"
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center px-[16px] py-[12px]">
                  <label className="text-[17px] text-white w-[100px]"
                    style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", sans-serif' }}>
                    Phone
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="flex-1 bg-transparent text-[17px] text-white placeholder-white/30 focus:outline-none"
                    style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", sans-serif' }}
                    placeholder="(612) 555-1234"
                  />
                </div>
              </div>
            </div>

            {/* Type-specific fields */}
            {type === 'host' ? (
              <>
                <p className="text-[13px] text-white/50 uppercase tracking-wide px-[16px] mb-[8px]"
                  style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", sans-serif' }}>
                  Your Vision
                </p>
                <div className="bg-[#1c1c1e] rounded-[12px] overflow-hidden mb-[24px]">
                  <div className="border-b border-white/10">
                    <div className="px-[16px] py-[12px]">
                      <label className="text-[13px] text-white/50 block mb-[4px]"
                        style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", sans-serif' }}>
                        Your event idea
                      </label>
                      <textarea
                        required
                        value={formData.eventIdea}
                        onChange={(e) => setFormData(prev => ({ ...prev, eventIdea: e.target.value }))}
                        className="w-full bg-transparent text-[17px] text-white placeholder-white/30 focus:outline-none resize-none"
                        style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", sans-serif' }}
                        rows={2}
                        placeholder="e.g., Dinner for 8. Saturday 7pm. $40. Creatives only."
                      />
                    </div>
                  </div>
                  <div>
                    <div className="px-[16px] py-[12px]">
                      <label className="text-[13px] text-white/50 block mb-[4px]"
                        style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", sans-serif' }}>
                        Why do you want to host?
                      </label>
                      <textarea
                        value={formData.whyHost}
                        onChange={(e) => setFormData(prev => ({ ...prev, whyHost: e.target.value }))}
                        className="w-full bg-transparent text-[17px] text-white placeholder-white/30 focus:outline-none resize-none"
                        style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", sans-serif' }}
                        rows={2}
                        placeholder="What draws you to creating spaces for strangers?"
                      />
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <p className="text-[13px] text-white/50 uppercase tracking-wide px-[16px] mb-[8px]"
                  style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", sans-serif' }}>
                  About You
                </p>
                <div className="bg-[#1c1c1e] rounded-[12px] overflow-hidden mb-[24px]">
                  <div className="border-b border-white/10">
                    <div className="px-[16px] py-[12px]">
                      <label className="text-[13px] text-white/50 block mb-[4px]"
                        style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", sans-serif' }}>
                        What are you into?
                      </label>
                      <textarea
                        required
                        value={formData.interests}
                        onChange={(e) => setFormData(prev => ({ ...prev, interests: e.target.value }))}
                        className="w-full bg-transparent text-[17px] text-white placeholder-white/30 focus:outline-none resize-none"
                        style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", sans-serif' }}
                        rows={2}
                        placeholder="e.g., art, music, food, deep conversations..."
                      />
                    </div>
                  </div>
                  <div>
                    <div className="px-[16px] py-[12px]">
                      <label className="text-[13px] text-white/50 block mb-[4px]"
                        style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", sans-serif' }}>
                        Preferred neighborhoods
                      </label>
                      <input
                        type="text"
                        value={formData.neighborhoods}
                        onChange={(e) => setFormData(prev => ({ ...prev, neighborhoods: e.target.value }))}
                        className="w-full bg-transparent text-[17px] text-white placeholder-white/30 focus:outline-none"
                        style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", sans-serif' }}
                        placeholder="e.g., Northeast, Uptown, Downtown..."
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            {error && (
              <p className="text-[#ff453a] text-[15px] text-center mb-[16px] px-[16px]"
                style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", sans-serif' }}>
                {error}
              </p>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-[16px] bg-[#34c759] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-[12px] text-[17px] active:opacity-80 transition-opacity"
              style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", sans-serif' }}
            >
              {isSubmitting ? 'Submitting...' : type === 'host' ? 'Submit Application' : 'Join the Pool'}
            </button>

            {/* Footer text */}
            <p className="text-[13px] text-white/40 text-center mt-[16px] px-[16px]"
              style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", sans-serif' }}>
              By continuing, you agree to receive texts from SMS about upcoming gatherings.
            </p>
          </form>
        )}
      </div>

      {/* Home indicator */}
      <div className="h-[34px] flex items-center justify-center">
        <div className="w-[134px] h-[5px] bg-white/30 rounded-full" />
      </div>
    </div>
  )
}
