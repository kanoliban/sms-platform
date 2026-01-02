'use client'

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'

export interface AuthUser {
  id: string
  name: string | null
  phone: string
  role: 'guest' | 'host' | 'founder'
  intent: string | null
  tone_preference: string | null
  trust_score_overall: number
  trust_status: string
  rooms_attended: number
  rooms_hosted: number
  no_shows: number
  created_at: string
}

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  error: string | null
  login: (phone: string) => Promise<{ success: boolean; error?: string }>
  verifyCode: (phone: string, code: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch current user on mount
  const refreshUser = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me')
      const data = await res.json()
      setUser(data.user || null)
    } catch (err) {
      console.error('Failed to fetch user:', err)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshUser()
  }, [refreshUser])

  // Send verification code
  const login = useCallback(async (phone: string): Promise<{ success: boolean; error?: string }> => {
    setError(null)
    try {
      const res = await fetch('/api/auth/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      })

      const data = await res.json()

      if (!res.ok) {
        const errorMsg = data.error || 'Failed to send code'
        setError(errorMsg)
        return { success: false, error: errorMsg }
      }

      return { success: true }
    } catch (err) {
      const errorMsg = 'Failed to send verification code'
      setError(errorMsg)
      return { success: false, error: errorMsg }
    }
  }, [])

  // Verify code and complete login
  const verifyCode = useCallback(async (phone: string, code: string): Promise<{ success: boolean; error?: string }> => {
    setError(null)
    try {
      const res = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, code }),
      })

      const data = await res.json()

      if (!res.ok) {
        const errorMsg = data.error || 'Invalid code'
        setError(errorMsg)
        return { success: false, error: errorMsg }
      }

      setUser(data.user)
      return { success: true }
    } catch (err) {
      const errorMsg = 'Failed to verify code'
      setError(errorMsg)
      return { success: false, error: errorMsg }
    }
  }, [])

  // Logout
  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      setUser(null)
    }
  }, [])

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      error,
      login,
      verifyCode,
      logout,
      refreshUser,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
