'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/lib/auth/auth-context'

type Role = 'guest' | 'host' | 'founder'

const roleConfig: Record<Role, { label: string; color: string; bgColor: string }> = {
  guest: { label: 'Guest', color: 'text-blue-400', bgColor: 'bg-blue-500/20' },
  host: { label: 'Host', color: 'text-amber-400', bgColor: 'bg-amber-500/20' },
  founder: { label: 'Founder', color: 'text-purple-400', bgColor: 'bg-purple-500/20' },
}

const quickLinks = {
  guest: [
    { label: 'Discover', href: '/discover' },
    { label: 'My Spaces', href: '/my-spaces' },
    { label: 'Profile', href: '/profile' },
    { label: 'Become Host', href: '/host/onboarding' },
  ],
  host: [
    { label: 'Host Hub', href: '/host' },
    { label: 'Create Space', href: '/host/spaces/new' },
    { label: 'Discover', href: '/discover' },
    { label: 'Profile', href: '/profile' },
  ],
  founder: [
    { label: 'Founder', href: '/founder' },
    { label: 'Host Hub', href: '/host' },
    { label: 'Create Space', href: '/host/spaces/new' },
    { label: 'Discover', href: '/discover' },
  ],
}

export function DevToolbar() {
  const router = useRouter()
  const pathname = usePathname()
  const { user, loading, logout, refreshUser } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [switching, setSwitching] = useState<Role | null>(null)

  // Don't render in production
  if (process.env.NODE_ENV === 'production') {
    return null
  }

  const handleRoleSwitch = async (role: Role) => {
    setSwitching(role)
    try {
      const res = await fetch('/api/dev/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      })

      if (res.ok) {
        await refreshUser()
        setIsOpen(false)
        // Refresh page to pick up new auth state
        router.refresh()
      }
    } catch (err) {
      console.error('Role switch failed:', err)
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

  // Minimized state - just a small floating button
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
      {/* Main toolbar */}
      <div className="bg-zinc-900 border border-zinc-700 rounded-lg shadow-2xl overflow-hidden min-w-[280px]">
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2 bg-zinc-800 border-b border-zinc-700">
          <div className="flex items-center gap-2">
            <span className="text-sm">🛠️</span>
            <span className="text-xs font-semibold text-zinc-300">DEV MODE</span>
          </div>
          <div className="flex items-center gap-1">
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

        {/* Role Switcher */}
        <div className="px-3 py-3 border-b border-zinc-800">
          <div className="text-xs text-zinc-500 mb-2">Quick Login As:</div>
          <div className="flex gap-2">
            {(['guest', 'host', 'founder'] as Role[]).map((role) => (
              <button
                key={role}
                onClick={() => handleRoleSwitch(role)}
                disabled={switching !== null}
                className={`
                  flex-1 px-2 py-1.5 rounded text-xs font-medium transition-all
                  ${currentRole === role
                    ? `${roleConfig[role].bgColor} ${roleConfig[role].color} ring-1 ring-current`
                    : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200'
                  }
                  ${switching === role ? 'opacity-50' : ''}
                `}
              >
                {switching === role ? '...' : roleConfig[role].label}
              </button>
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
