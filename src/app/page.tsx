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
      <main className="relative z-10 min-h-screen flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16 px-6 py-24 lg:py-0">
        {/* Left side - Text content */}
        <div className="max-w-md text-center lg:text-left">
          {/* Tagline */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold italic tracking-tight mb-4">
            Strangers Meeting Strangers.
          </h1>
          <p className="text-2xl md:text-3xl font-semibold mb-8">
            Hosted by You.
          </p>

          {/* Stats - single line */}
          <p className="text-sm uppercase tracking-wider opacity-50 mb-8">
            2,800+ strangers · 3.5 years · Minneapolis
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
            <Button
              size="lg"
              onClick={() => setShowLogin(true)}
              className="!bg-white !text-black hover:!bg-white/90 font-semibold px-8"
            >
              I want in
            </Button>
            <a
              href="/host/onboarding"
              className="text-white/70 hover:text-white transition-colors group"
            >
              Become a host
              <span className="inline-block ml-1 group-hover:translate-x-1 transition-transform">→</span>
            </a>
          </div>
        </div>

        {/* Right side - iPhone with conversation */}
        <div className="relative phone-glow rounded-[55px]">
          <SMSConversation />
        </div>
      </main>

      {/* Two paths section */}
      <section className="relative z-10 py-20 px-6 border-t border-white/10">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12">
            {/* For Attendees */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-amber-500/80 flex items-center justify-center text-sm">
                  ✦
                </span>
                For Attendees
              </h3>
              <div className="space-y-4 opacity-80 leading-relaxed">
                <p>Tell us what you're into. Once.</p>
                <p>We'll text you when something fits.</p>
                <p className="text-white/60 italic border-l-2 border-white/20 pl-4">
                  "Friday 7pm. Strangers & Vinyl. 12 people. $25. Want in?"
                </p>
                <p>You reply yes. You show up.</p>
              </div>
              <Button
                variant="outline"
                onClick={() => setShowLogin(true)}
                className="border-white/30 hover:bg-white/10"
              >
                Get invited
              </Button>
            </div>

            {/* For Hosts */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-[#34c759] flex items-center justify-center text-sm">
                  ✦
                </span>
                For Hosts
              </h3>
              <div className="space-y-4 opacity-80 leading-relaxed">
                <p>You have an idea. You text it.</p>
                <p className="text-white/60 italic border-l-2 border-white/20 pl-4">
                  "Dinner for 8 Saturday. $40. Creatives, no networking energy."
                </p>
                <p>We find the strangers. They show up.</p>
                <p>You host. You get paid.</p>
              </div>
              <a
                href="/host/onboarding"
                className="inline-flex items-center justify-center rounded-md border border-white/30 bg-transparent px-4 py-2 text-sm font-medium hover:bg-white/10 transition-colors"
              >
                Start hosting
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Story teaser section */}
      <section className="relative z-10 py-16 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-sm uppercase tracking-widest opacity-40 mb-6">The Story</p>
          <p className="text-xl md:text-2xl leading-relaxed opacity-80 mb-8">
            I lost 90% of my life savings. I call it a purchase. This is how <span className="font-bold italic text-white">SMS</span> was born.
          </p>
          <a
            href="/about"
            className="inline-flex items-center gap-2 text-lg opacity-60 hover:opacity-100 transition-opacity group"
          >
            Read the full story
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </a>
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
