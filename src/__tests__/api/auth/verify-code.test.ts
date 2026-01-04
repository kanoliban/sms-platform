import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// Mock dependencies before importing the route
const mockCookieStore = {
  get: vi.fn(),
  set: vi.fn(),
  delete: vi.fn(),
}

vi.mock('next/headers', () => ({
  cookies: vi.fn(() => Promise.resolve(mockCookieStore)),
}))

vi.mock('jose', () => {
  class MockSignJWT {
    setProtectedHeader() { return this }
    setIssuedAt() { return this }
    setExpirationTime() { return this }
    async sign() { return 'mock-jwt-token' }
  }
  return { SignJWT: MockSignJWT }
})

vi.mock('@/lib/supabase/server', () => ({
  createServerClient: vi.fn(),
}))

vi.mock('@/lib/twilio/client', () => ({
  checkVerificationCode: vi.fn(),
  normalizePhoneNumber: vi.fn((phone: string) => {
    const digits = phone.replace(/\D/g, '')
    if (digits.length === 10) return `+1${digits}`
    if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`
    return `+${digits}`
  }),
}))

import { POST } from '@/app/api/auth/verify-code/route'
import { createServerClient } from '@/lib/supabase/server'
import { checkVerificationCode } from '@/lib/twilio/client'

describe('POST /api/auth/verify-code', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockCookieStore.get.mockReset()
    mockCookieStore.set.mockReset()
    mockCookieStore.delete.mockReset()
  })

  it('returns 400 when phone is missing', async () => {
    const request = new NextRequest('http://localhost/api/auth/verify-code', {
      method: 'POST',
      body: JSON.stringify({ code: '123456' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Phone and code required')
  })

  it('returns 400 when code is missing', async () => {
    const request = new NextRequest('http://localhost/api/auth/verify-code', {
      method: 'POST',
      body: JSON.stringify({ phone: '5551234567' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Phone and code required')
  })

  it('returns 400 when verification code is invalid', async () => {
    vi.mocked(checkVerificationCode).mockResolvedValue({
      valid: false,
      status: 'pending',
    })

    const request = new NextRequest('http://localhost/api/auth/verify-code', {
      method: 'POST',
      body: JSON.stringify({ phone: '5551234567', code: '000000' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Invalid code')
  })

  it('returns 400 when verification is expired', async () => {
    vi.mocked(checkVerificationCode).mockResolvedValue({
      valid: false,
      status: 'expired',
    })

    const request = new NextRequest('http://localhost/api/auth/verify-code', {
      method: 'POST',
      body: JSON.stringify({ phone: '5551234567', code: '123456' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Verification expired')
  })

  it('returns 404 when user not found', async () => {
    vi.mocked(checkVerificationCode).mockResolvedValue({
      valid: true,
      status: 'approved',
    })

    const mockSupabase = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: null, error: null }),
          }),
        }),
      }),
    }
    vi.mocked(createServerClient).mockReturnValue(mockSupabase as ReturnType<typeof createServerClient>)

    const request = new NextRequest('http://localhost/api/auth/verify-code', {
      method: 'POST',
      body: JSON.stringify({ phone: '5551234567', code: '123456' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.error).toBe('User not found')
  })

  it('successfully verifies code and returns user with JWT', async () => {
    vi.mocked(checkVerificationCode).mockResolvedValue({
      valid: true,
      status: 'approved',
    })

    const mockUser = {
      id: 'user-123',
      name: 'Test User',
      phone: '+15551234567',
      role: 'guest',
      intent: 'both',
      tone_preference: null,
      trust_score_overall: 100,
      spaces_attended: 0,
    }

    const mockSupabase = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockUser, error: null }),
          }),
        }),
      }),
    }
    vi.mocked(createServerClient).mockReturnValue(mockSupabase as ReturnType<typeof createServerClient>)

    const request = new NextRequest('http://localhost/api/auth/verify-code', {
      method: 'POST',
      body: JSON.stringify({ phone: '5551234567', code: '123456' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.user.id).toBe('user-123')
    expect(data.user.name).toBe('Test User')
    expect(data.user.role).toBe('guest')

    // Check cookies were set (uses the module-level mockCookieStore)
    expect(mockCookieStore.set).toHaveBeenCalledTimes(2)
    expect(mockCookieStore.set).toHaveBeenCalledWith(
      'sms_auth_token',
      expect.any(String),
      expect.objectContaining({
        httpOnly: true,
        path: '/',
      })
    )
    expect(mockCookieStore.set).toHaveBeenCalledWith(
      'sms_user',
      expect.any(String),
      expect.objectContaining({
        httpOnly: false,
        path: '/',
      })
    )
  })

  it('returns 400 when Twilio check throws error', async () => {
    vi.mocked(checkVerificationCode).mockRejectedValue(new Error('Twilio error'))

    const request = new NextRequest('http://localhost/api/auth/verify-code', {
      method: 'POST',
      body: JSON.stringify({ phone: '5551234567', code: '123456' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Invalid verification code')
  })
})
