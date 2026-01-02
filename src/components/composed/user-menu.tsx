'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth/auth-context'
import { toast } from '@/components/ui/toast'

// Format phone for display: (555) 555-5555
function formatPhoneDisplay(phone: string): string {
  const digits = phone.replace(/\D/g, '').slice(-10)
  if (digits.length !== 10) return phone
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`
}

export function UserMenu() {
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const { user, logout } = useAuth()

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
    await logout()
    setOpen(false)
    toast({
      variant: 'success',
      title: 'Signed out',
      description: 'You have been signed out.',
    })
  }, [logout])

  if (!user) return null

  // Use first letter of name, or first digit of phone, or '?'
  const initial = user.name?.charAt(0).toUpperCase() || user.phone?.slice(-4) || '?'
  const displayName = user.name || formatPhoneDisplay(user.phone)

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
              {displayName}
            </p>
            {user.name && (
              <p className="text-[var(--text-xs)] text-[var(--text-muted)] truncate">
                {formatPhoneDisplay(user.phone)}
              </p>
            )}
          </div>

          <div className="py-1">
            <Link
              href="/my-rooms"
              onClick={() => setOpen(false)}
              className="
                block px-4 py-2
                text-[var(--text-sm)] text-[var(--text-secondary)]
                hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)]
                transition-colors duration-[var(--duration-normal)]
              "
            >
              My Rooms
            </Link>
            <Link
              href="/profile"
              onClick={() => setOpen(false)}
              className="
                block px-4 py-2
                text-[var(--text-sm)] text-[var(--text-secondary)]
                hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)]
                transition-colors duration-[var(--duration-normal)]
              "
            >
              Profile
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
