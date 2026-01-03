'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { SMSConversation } from '@/components/sms-conversation'
import { LoginModal } from '@/components/composed/login-modal'
import { UserMenu } from '@/components/composed/user-menu'
import { useAuth } from '@/lib/auth/auth-context'
import { Button } from '@/components/ui/button'

export default function Home() {
  const router = useRouter()
  const [showLogin, setShowLogin] = useState(false)
  const { user, loading } = useAuth()

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="font-bold italic text-xl">SMS</div>
          <div className="flex items-center gap-4">
            {!loading && (
              user ? (
                <UserMenu />
              ) : (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowLogin(true)}
                >
                  Sign in
                </Button>
              )
            )}
          </div>
        </div>
      </header>

      {/* Login Modal */}
      <LoginModal
        open={showLogin}
        onClose={() => setShowLogin(false)}
        onSuccess={() => router.push('/discover')}
      />

      {/* Ambient background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Gradient orbs */}
        <div
          className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full opacity-20 animate-float-slow"
          style={{
            background: 'radial-gradient(circle, rgba(52, 199, 89, 0.3) 0%, transparent 70%)',
          }}
        />
        <div
          className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full opacity-15 animate-float-slower"
          style={{
            background: 'radial-gradient(circle, rgba(255, 200, 150, 0.3) 0%, transparent 70%)',
          }}
        />
        <div
          className="absolute top-[40%] right-[10%] w-[300px] h-[300px] rounded-full opacity-10 animate-float"
          style={{
            background: 'radial-gradient(circle, rgba(52, 199, 89, 0.4) 0%, transparent 70%)',
          }}
        />

        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      {/* Main content */}
      <main className="relative z-10 min-h-screen flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16 px-6 py-12 lg:py-0">
        {/* Left side - Text content */}
        <div className="max-w-md text-center lg:text-left stagger-children">
          {/* Logo */}
          <div className="mb-8">
            <h1 className="font-bold italic text-5xl md:text-6xl tracking-tight">
              SMS
            </h1>
            <div className="w-20 h-1 bg-white mt-3 mx-auto lg:mx-0" />
          </div>

          {/* Tagline */}
          <h2 className="text-2xl md:text-3xl italic opacity-90 mb-6">
            Strangers Meeting Strangers.
          </h2>
          <p className="text-xl md:text-2xl font-semibold mb-8">
            Hosted by You.
          </p>

          {/* Description */}
          <div className="space-y-4 text-base md:text-lg opacity-70 mb-8">
            <p>
              Infrastructure for human connection.
            </p>
            <p>
              Text an idea. We find the strangers. They show up.
            </p>
          </div>

          {/* Stats */}
          <div className="flex justify-center lg:justify-start gap-8 mb-8">
            <div>
              <p className="text-3xl md:text-4xl font-bold">2,800+</p>
              <p className="text-sm uppercase tracking-wider opacity-50">strangers</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-bold">3.5</p>
              <p className="text-sm uppercase tracking-wider opacity-50">years</p>
            </div>
          </div>

          {/* Philosophy pills */}
          <div className="flex flex-wrap justify-center lg:justify-start gap-2">
            {['Genuine', 'Not networking', 'Trust-first'].map((pill) => (
              <span
                key={pill}
                className="px-4 py-2 rounded-full border border-white/20 text-sm opacity-60"
              >
                {pill}
              </span>
            ))}
          </div>
        </div>

        {/* Right side - iPhone with conversation */}
        <div className="relative phone-glow rounded-[55px]">
          <SMSConversation />
        </div>
      </main>

      {/* Bottom section - Additional info */}
      <section className="relative z-10 py-20 px-6 border-t border-white/10">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12">
            {/* For Hosts */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-[#34c759] flex items-center justify-center text-sm">
                  ✦
                </span>
                For Hosts
              </h3>
              <p className="opacity-70 leading-relaxed">
                You have an impulse. You text it. "Dinner for 8 Saturday. $40. Creatives, no networking energy."
                We create the gathering, find the right people, handle RSVPs and payment.
                Strangers show up. You host. You get paid.
              </p>
            </div>

            {/* For Attendees */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-amber-500/80 flex items-center justify-center text-sm">
                  ✦
                </span>
                For Attendees
              </h3>
              <p className="opacity-70 leading-relaxed">
                Tell us what you're into. Once. Then wait—not for a feed, for a text.
                "Friday 7pm. Strangers & Vinyl. 12 people. $25. Want in?"
                You reply yes. That's it. You show up.
              </p>
            </div>
          </div>

          {/* Philosophy section */}
          <div className="mt-16 text-center">
            <p className="text-sm uppercase tracking-widest opacity-40 mb-6">What we believe</p>
            <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 text-xl md:text-2xl italic opacity-80">
              <span>Genuine, not transactional.</span>
              <span>•</span>
              <span>Strangers, not networking.</span>
              <span>•</span>
              <span>Container, not curriculum.</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-12 text-center border-t border-white/10">
        <p className="text-lg italic opacity-80 mb-2">
          From one stranger to another,
        </p>
        <p className="font-medium">— Liban</p>
        <div className="mt-8">
          <div className="font-bold italic text-lg opacity-40">SMS</div>
          <p className="text-xs opacity-30 mt-2 tracking-widest">
            MINNEAPOLIS · SINCE 2022
          </p>
        </div>
      </footer>
    </div>
  )
}
