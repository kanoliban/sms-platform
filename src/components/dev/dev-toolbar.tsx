'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/lib/auth/auth-context'

type Role = 'guest' | 'host' | 'founder'

const roleConfig: Record<Role, { label: string; color: string; bgColor: string }> = {
  guest: { label: 'Guest', color: 'text-blue-400', bgColor: 'bg-blue-500/20' },
  host: { label: 'Host', color: 'text-amber-400', bgColor: 'bg-amber-500/20' },
  founder: { label: 'Founder', color: 'text-purple-400', bgColor: 'bg-purple-500/20' },
}

// Dev accounts - matches the API
const devAccounts: Record<Role, Array<{ name: string; phone: string; variant: string }>> = {
  guest: [
    { name: 'Alex Guest', phone: '+15550000001', variant: 'guest' },
    { name: 'Jordan Guest', phone: '+15550000011', variant: 'guest:2' },
    { name: 'Riley Guest', phone: '+15550000021', variant: 'guest:3' },
  ],
  host: [
    { name: 'Sam Host', phone: '+15550000002', variant: 'host' },
    { name: 'Morgan Host', phone: '+15550000012', variant: 'host:2' },
    { name: 'Casey Host', phone: '+15550000022', variant: 'host:3' },
  ],
  founder: [
    { name: 'Dev Founder', phone: '+15550000003', variant: 'founder' },
  ],
}

const quickLinks = {
  guest: [
    { label: 'Discover', href: '/discover' },
    { label: 'My Spaces', href: '/my-spaces' },
    { label: 'Onboarding', href: '/onboarding' },
    { label: 'Profile', href: '/profile' },
    { label: 'Become Host', href: '/host/onboarding' },
  ],
  host: [
    { label: 'Host Hub', href: '/host' },
    { label: 'Create Space', href: '/host/spaces/new' },
    { label: 'Host Onboarding', href: '/host/onboarding' },
    { label: 'Discover', href: '/discover' },
    { label: 'Onboarding', href: '/onboarding' },
    { label: 'Profile', href: '/profile' },
  ],
  founder: [
    { label: 'Founder', href: '/founder' },
    { label: 'Host Hub', href: '/host' },
    { label: 'Create Space', href: '/host/spaces/new' },
    { label: 'Discover', href: '/discover' },
    { label: 'Onboarding', href: '/onboarding' },
  ],
}

export function DevToolbar() {
  const router = useRouter()
  const pathname = usePathname()
  const { user, loading, logout, refreshUser } = useAuth()
  const [isMinimized, setIsMinimized] = useState(false)
  const [switching, setSwitching] = useState<string | null>(null)
  const [expandedRole, setExpandedRole] = useState<Role | null>(null)
  const [skipOnboarding, setSkipOnboarding] = useState(false)

  // Don't render in production
  if (process.env.NODE_ENV === 'production') {
    return null
  }

  const handleAccountLogin = async (variant: string) => {
    setSwitching(variant)
    try {
      const res = await fetch('/api/dev/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: variant, onboarding_skipped: skipOnboarding }),
      })

      if (res.ok) {
        await refreshUser()
        setExpandedRole(null)
        router.refresh()
      }
    } catch (err) {
      console.error('Login failed:', err)
    } finally {
      setSwitching(null)
    }
  }

  const handleLogout = async () => {
    await logout()
    router.push('/')
    router.refresh()
  }

  const currentRole = user?.role as Role | undefined

  // Minimized state
  if (isMinimized) {
    return (
      <button
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-4 right-4 z-[9999] w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 shadow-lg flex items-center justify-center hover:bg-zinc-700 transition-colors"
        title="Open Dev Toolbar"
      >
        <span className="text-lg">🛠️</span>
      </button>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-[9999] font-sans">
      <div className="bg-zinc-900 border border-zinc-700 rounded-lg shadow-2xl overflow-hidden min-w-[300px]">
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2 bg-zinc-800 border-b border-zinc-700">
          <div className="flex items-center gap-2">
            <span className="text-sm">🛠️</span>
            <span className="text-xs font-semibold text-zinc-300">DEV MODE</span>
          </div>
          <button
            onClick={() => setIsMinimized(true)}
            className="p-1 hover:bg-zinc-700 rounded text-zinc-400 hover:text-zinc-200"
            title="Minimize"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {/* Current User */}
        <div className="px-3 py-3 border-b border-zinc-800">
          {loading ? (
            <div className="text-xs text-zinc-500">Loading...</div>
          ) : user ? (
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-zinc-200">{user.name}</div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`text-xs px-1.5 py-0.5 rounded ${roleConfig[currentRole!]?.bgColor} ${roleConfig[currentRole!]?.color}`}>
                    {roleConfig[currentRole!]?.label}
                  </span>
                  <span className="text-xs text-zinc-500">{user.phone}</span>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="text-xs text-zinc-400 hover:text-red-400 transition-colors"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="text-xs text-zinc-500">Not logged in</div>
          )}
        </div>

        {/* Account Switcher */}
        <div className="px-3 py-3 border-b border-zinc-800">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs text-zinc-500">Switch Account:</div>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={skipOnboarding}
                onChange={(e) => setSkipOnboarding(e.target.checked)}
                className="w-3 h-3 rounded border-zinc-600 bg-zinc-800 text-amber-500 focus:ring-amber-500 focus:ring-offset-0"
              />
              <span className="text-[10px] text-amber-400">Skip Onboarding</span>
            </label>
          </div>
          <div className="space-y-2">
            {(['guest', 'host', 'founder'] as Role[]).map((role) => (
              <div key={role}>
                {/* Role header button */}
                <button
                  onClick={() => setExpandedRole(expandedRole === role ? null : role)}
                  className={`
                    w-full flex items-center justify-between px-2 py-1.5 rounded text-xs font-medium transition-all
                    ${currentRole === role
                      ? `${roleConfig[role].bgColor} ${roleConfig[role].color}`
                      : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200'
                    }
                  `}
                >
                  <span>{roleConfig[role].label}</span>
                  <div className="flex items-center gap-1">
                    <span className="text-zinc-500">{devAccounts[role].length}</span>
                    <svg
                      className={`w-3 h-3 transition-transform ${expandedRole === role ? 'rotate-180' : ''}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {/* Expanded account list */}
                {expandedRole === role && (
                  <div className="mt-1 ml-2 space-y-1">
                    {devAccounts[role].map((account) => (
                      <button
                        key={account.variant}
                        onClick={() => handleAccountLogin(account.variant)}
                        disabled={switching !== null}
                        className={`
                          w-full flex items-center justify-between px-2 py-1.5 rounded text-xs transition-all
                          ${user?.phone === account.phone
                            ? 'bg-zinc-700 text-zinc-200'
                            : 'bg-zinc-800/50 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200'
                          }
                          ${switching === account.variant ? 'opacity-50' : ''}
                        `}
                      >
                        <span>{account.name}</span>
                        <span className="text-zinc-500 text-[10px]">{account.phone}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        {currentRole && (
          <div className="px-3 py-3">
            <div className="text-xs text-zinc-500 mb-2">Quick Links:</div>
            <div className="flex flex-wrap gap-1.5">
              {quickLinks[currentRole].map((link) => (
                <button
                  key={link.href}
                  onClick={() => router.push(link.href)}
                  className={`
                    px-2 py-1 rounded text-xs transition-colors
                    ${pathname === link.href
                      ? 'bg-zinc-700 text-zinc-200'
                      : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200'
                    }
                  `}
                >
                  {link.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Current Path */}
        <div className="px-3 py-2 bg-zinc-800/50 border-t border-zinc-800">
          <div className="text-xs text-zinc-500 truncate" title={pathname}>
            📍 {pathname}
          </div>
        </div>
      </div>
    </div>
  )
}
