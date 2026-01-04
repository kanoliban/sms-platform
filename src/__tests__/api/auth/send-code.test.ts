import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// Mock dependencies before importing the route
vi.mock('@/lib/supabase/server', () => ({
  createServerClient: vi.fn(),
}))

vi.mock('@/lib/twilio/client', () => ({
  sendVerificationCode: vi.fn(),
  normalizePhoneNumber: vi.fn((phone: string) => {
    const digits = phone.replace(/\D/g, '')
    if (digits.length === 10) return `+1${digits}`
    if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`
    return `+${digits}`
  }),
}))

vi.mock('@/lib/rate-limit', () => ({
  checkOtpRateLimit: vi.fn(),
}))

import { POST } from '@/app/api/auth/send-code/route'
import { createServerClient } from '@/lib/supabase/server'
import { sendVerificationCode } from '@/lib/twilio/client'
import { checkOtpRateLimit } from '@/lib/rate-limit'

describe('POST /api/auth/send-code', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 400 when phone is missing', async () => {
    const request = new NextRequest('http://localhost/api/auth/send-code', {
      method: 'POST',
      body: JSON.stringify({}),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Phone number required')
  })

  it('returns 429 when rate limited', async () => {
    const resetAt = new Date(Date.now() + 60000)
    vi.mocked(checkOtpRateLimit).mockResolvedValue({
      success: false,
      remaining: 0,
      resetAt,
    })

    const request = new NextRequest('http://localhost/api/auth/send-code', {
      method: 'POST',
      body: JSON.stringify({ phone: '5551234567' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(429)
    expect(data.error).toBe('Too many verification requests. Please try again later.')
    expect(data.retryAfter).toBeGreaterThan(0)
  })

  it('creates new user when phone not found', async () => {
    vi.mocked(checkOtpRateLimit).mockResolvedValue({
      success: true,
      remaining: 4,
      resetAt: new Date(),
    })

    const mockSupabase = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: null, error: null }),
          }),
        }),
        insert: vi.fn().mockResolvedValue({ error: null }),
      }),
    }
    vi.mocked(createServerClient).mockReturnValue(mockSupabase as ReturnType<typeof createServerClient>)
    vi.mocked(sendVerificationCode).mockResolvedValue('verification-sid')

    const request = new NextRequest('http://localhost/api/auth/send-code', {
      method: 'POST',
      body: JSON.stringify({ phone: '5551234567' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.message).toBe('Verification code sent')
    expect(mockSupabase.from).toHaveBeenCalledWith('users')
    expect(sendVerificationCode).toHaveBeenCalledWith('+15551234567')
  })

  it('sends verification to existing user', async () => {
    vi.mocked(checkOtpRateLimit).mockResolvedValue({
      success: true,
      remaining: 4,
      resetAt: new Date(),
    })

    const mockSupabase = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: 'user-123' },
              error: null,
            }),
          }),
        }),
      }),
    }
    vi.mocked(createServerClient).mockReturnValue(mockSupabase as ReturnType<typeof createServerClient>)
    vi.mocked(sendVerificationCode).mockResolvedValue('verification-sid')

    const request = new NextRequest('http://localhost/api/auth/send-code', {
      method: 'POST',
      body: JSON.stringify({ phone: '5551234567' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(sendVerificationCode).toHaveBeenCalledWith('+15551234567')
  })

  it('returns 500 when Twilio fails', async () => {
    vi.mocked(checkOtpRateLimit).mockResolvedValue({
      success: true,
      remaining: 4,
      resetAt: new Date(),
    })

    const mockSupabase = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: 'user-123' },
              error: null,
            }),
          }),
        }),
      }),
    }
    vi.mocked(createServerClient).mockReturnValue(mockSupabase as ReturnType<typeof createServerClient>)
    vi.mocked(sendVerificationCode).mockRejectedValue(new Error('Twilio error'))

    const request = new NextRequest('http://localhost/api/auth/send-code', {
      method: 'POST',
      body: JSON.stringify({ phone: '5551234567' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Failed to send verification code')
  })

  it('returns 500 when user creation fails', async () => {
    vi.mocked(checkOtpRateLimit).mockResolvedValue({
      success: true,
      remaining: 4,
      resetAt: new Date(),
    })

    const mockSupabase = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: null, error: null }),
          }),
        }),
        insert: vi.fn().mockResolvedValue({ error: { message: 'DB error' } }),
      }),
    }
    vi.mocked(createServerClient).mockReturnValue(mockSupabase as ReturnType<typeof createServerClient>)

    const request = new NextRequest('http://localhost/api/auth/send-code', {
      method: 'POST',
      body: JSON.stringify({ phone: '5551234567' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Failed to create user')
  })
})
