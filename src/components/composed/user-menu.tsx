'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth/auth-context'
import { toast } from '@/components/ui/toast'

export function UserMenu() {
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const { user, signOut } = useAuth()

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
      setOpen(false)
    }
  }, [])

  useEffect(() => {
    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [open, handleClickOutside])

  const handleSignOut = useCallback(async () => {
    await signOut()
    setOpen(false)
    toast({
      variant: 'success',
      title: 'Signed out',
      description: 'You have been signed out.',
    })
  }, [signOut])

  if (!user) return null

  const initial = user.email?.charAt(0).toUpperCase() || '?'

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className="
          w-9 h-9
          rounded-full
          bg-[var(--primary)]
          text-white
          font-medium
          text-[var(--text-sm)]
          flex items-center justify-center
          transition-all duration-[var(--duration-normal)]
          hover:opacity-90
          focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2 focus:ring-offset-black
        "
        aria-label="User menu"
        aria-expanded={open}
      >
        {initial}
      </button>

      {open && (
        <div
          className="
            absolute right-0 mt-2
            w-56
            bg-[var(--bg-surface)]
            border border-[var(--border-subtle)]
            rounded-[var(--radius-lg)]
            shadow-[var(--shadow-xl)]
            py-1
            z-50
          "
        >
          <div className="px-4 py-3 border-b border-[var(--border-subtle)]">
            <p className="text-[var(--text-sm)] font-medium text-[var(--text-primary)] truncate">
              {user.email}
            </p>
          </div>

          <div className="py-1">
            <Link
              href="/dashboard"
              onClick={() => setOpen(false)}
              className="
                block px-4 py-2
                text-[var(--text-sm)] text-[var(--text-secondary)]
                hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)]
                transition-colors duration-[var(--duration-normal)]
              "
            >
              Dashboard
            </Link>
            <Link
              href="/settings"
              onClick={() => setOpen(false)}
              className="
                block px-4 py-2
                text-[var(--text-sm)] text-[var(--text-secondary)]
                hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)]
                transition-colors duration-[var(--duration-normal)]
              "
            >
              Settings
            </Link>
          </div>

          <div className="border-t border-[var(--border-subtle)] py-1">
            <button
              onClick={handleSignOut}
              className="
                block w-full px-4 py-2 text-left
                text-[var(--text-sm)] text-[var(--error-text)]
                hover:bg-[var(--error-muted)]
                transition-colors duration-[var(--duration-normal)]
              "
            >
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default UserMenu
