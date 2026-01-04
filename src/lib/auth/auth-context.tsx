'use client'

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'

// SMS Platform user from our database
export interface SMSUser {
  id: string
  name: string | null
  phone: string
  role: 'guest' | 'host' | 'founder'
  intent: string | null
  user_intent: 'attend' | 'host' | 'both' | null
  onboarding_completed: boolean
  onboarding_skipped: boolean
  onboarding_completed_at: string | null
  tone_preference: string | null
  trust_score_overall: number
  trust_status: string
  spaces_attended: number
  spaces_hosted: number
  no_shows: number
  created_at: string
}

interface AuthContextValue {
  user: SMSUser | null
  loading: boolean
  error: string | null
  // Phone auth (primary for SMS)
  sendCode: (phone: string) => Promise<{ success: boolean; error?: string }>
  verifyCode: (phone: string, code: string) => Promise<{ success: boolean; error?: string }>
  // OAuth
  signInWithGoogle: () => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SMSUser | null>(null)
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

  // Send verification code via SMS
  const sendCode = useCallback(async (phone: string): Promise<{ success: boolean; error?: string }> => {
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

  // Sign in with Google OAuth
  const signInWithGoogle = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    setError(null)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        setError(error.message)
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (err) {
      const errorMsg = 'Failed to sign in with Google'
      setError(errorMsg)
      return { success: false, error: errorMsg }
    }
  }, [])

  // Logout
  const logout = useCallback(async () => {
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      setUser(null)
    }
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        sendCode,
        verifyCode,
        signInWithGoogle,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
