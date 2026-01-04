import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock dependencies before importing the route
const mockCookieStore = {
  get: vi.fn(),
  set: vi.fn(),
  delete: vi.fn(),
}

vi.mock('next/headers', () => ({
  cookies: vi.fn(() => Promise.resolve(mockCookieStore)),
}))

vi.mock('@/lib/supabase/server', () => ({
  createServerClient: vi.fn(),
}))

vi.mock('jose', () => ({
  jwtVerify: vi.fn(),
}))

import { GET } from '@/app/api/auth/me/route'
import { createServerClient } from '@/lib/supabase/server'
import { jwtVerify } from 'jose'

describe('GET /api/auth/me', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockCookieStore.get.mockReset()
    mockCookieStore.set.mockReset()
    mockCookieStore.delete.mockReset()
  })

  it('returns null user when no token cookie exists', async () => {
    mockCookieStore.get.mockReturnValue(undefined)

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.user).toBeNull()
  })

  it('returns null user and clears cookies when token is invalid', async () => {
    mockCookieStore.get.mockReturnValue({ value: 'invalid-token' })
    vi.mocked(jwtVerify).mockRejectedValue(new Error('Invalid token'))

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.user).toBeNull()
    expect(mockCookieStore.delete).toHaveBeenCalledWith('sms_auth_token')
    expect(mockCookieStore.delete).toHaveBeenCalledWith('sms_user')
  })

  it('returns null user and clears cookies when user not found in database', async () => {
    mockCookieStore.get.mockReturnValue({ value: 'valid-token' })
    vi.mocked(jwtVerify).mockResolvedValue({
      payload: {
        userId: 'user-123',
        phone: '+15551234567',
        role: 'guest',
      },
      protectedHeader: { alg: 'HS256' },
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

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.user).toBeNull()
    expect(mockCookieStore.delete).toHaveBeenCalledWith('sms_auth_token')
    expect(mockCookieStore.delete).toHaveBeenCalledWith('sms_user')
  })

  it('returns user data when token is valid and user exists', async () => {
    mockCookieStore.get.mockReturnValue({ value: 'valid-token' })
    vi.mocked(jwtVerify).mockResolvedValue({
      payload: {
        userId: 'user-123',
        phone: '+15551234567',
        role: 'guest',
      },
      protectedHeader: { alg: 'HS256' },
    })

    const mockUser = {
      id: 'user-123',
      name: 'Test User',
      phone: '+15551234567',
      role: 'guest',
      intent: 'both',
      tone_preference: 'chill',
      trust_score_overall: 100,
      trust_status: 'trusted',
      spaces_attended: 5,
      spaces_hosted: 0,
      no_shows: 0,
      created_at: '2024-01-01T00:00:00Z',
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

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.user).toEqual({
      id: 'user-123',
      name: 'Test User',
      phone: '+15551234567',
      role: 'guest',
      intent: 'both',
      tone_preference: 'chill',
      trust_score_overall: 100,
      trust_status: 'trusted',
      spaces_attended: 5,
      spaces_hosted: 0,
      no_shows: 0,
      created_at: '2024-01-01T00:00:00Z',
    })
  })

  it('returns null user and clears cookies on database error', async () => {
    mockCookieStore.get.mockReturnValue({ value: 'valid-token' })
    vi.mocked(jwtVerify).mockResolvedValue({
      payload: {
        userId: 'user-123',
        phone: '+15551234567',
        role: 'guest',
      },
      protectedHeader: { alg: 'HS256' },
    })

    const mockSupabase = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { message: 'Database error' },
            }),
          }),
        }),
      }),
    }
    vi.mocked(createServerClient).mockReturnValue(mockSupabase as ReturnType<typeof createServerClient>)

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.user).toBeNull()
    expect(mockCookieStore.delete).toHaveBeenCalledWith('sms_auth_token')
    expect(mockCookieStore.delete).toHaveBeenCalledWith('sms_user')
  })
})
