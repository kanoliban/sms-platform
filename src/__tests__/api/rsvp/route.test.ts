import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// Set env vars before imports
process.env.JWT_SECRET = 'test-jwt-secret-key-for-unit-tests-only'
process.env.NEXT_PUBLIC_BASE_URL = 'http://localhost:3000'

// Create mock functions
const mockCookieGet = vi.fn()
const mockJwtVerify = vi.fn()
const mockSupabaseFrom = vi.fn()
const mockCreateCheckoutSession = vi.fn()

// Mock next/headers
vi.mock('next/headers', () => ({
  cookies: () => Promise.resolve({
    get: (...args: unknown[]) => mockCookieGet(...args),
  }),
}))

// Mock jose
vi.mock('jose', () => ({
  jwtVerify: (...args: unknown[]) => mockJwtVerify(...args),
}))

// Mock Supabase
vi.mock('@/lib/supabase/server', () => ({
  createServerClient: () => ({
    from: (...args: unknown[]) => mockSupabaseFrom(...args),
  }),
  createAdminClient: () => ({
    from: (...args: unknown[]) => mockSupabaseFrom(...args),
  }),
}))

// Mock Stripe
vi.mock('@/lib/stripe/client', () => ({
  createCheckoutSession: (...args: unknown[]) => mockCreateCheckoutSession(...args),
}))

import { POST } from '@/app/api/rsvp/route'

describe('POST /api/rsvp', () => {
  const mockSpace = {
    id: 'space-123',
    name: 'Test Space',
    date: '2026-12-15',
    time: '19:00',
    status: 'open',
    capacity: 8,
    price_cents: 4500,
    host_id: 'host-123',
  }

  const mockUser = {
    userId: 'user-123',
    phone: '+15551234567',
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 when no auth token', async () => {
    mockCookieGet.mockReturnValue(undefined)

    const request = new NextRequest('http://localhost/api/rsvp', {
      method: 'POST',
      body: JSON.stringify({ space_id: 'space-123' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('Please sign in to RSVP')
  })

  it('returns 401 when token is invalid', async () => {
    mockCookieGet.mockReturnValue({ value: 'invalid-token' })
    mockJwtVerify.mockRejectedValue(new Error('Invalid token'))

    const request = new NextRequest('http://localhost/api/rsvp', {
      method: 'POST',
      body: JSON.stringify({ space_id: 'space-123' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('Invalid session. Please sign in again.')
  })

  it('returns 400 when space_id is missing', async () => {
    mockCookieGet.mockReturnValue({ value: 'valid-token' })
    mockJwtVerify.mockResolvedValue({ payload: mockUser })

    const request = new NextRequest('http://localhost/api/rsvp', {
      method: 'POST',
      body: JSON.stringify({}),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Room ID required')
  })

  it('returns 404 when space not found', async () => {
    mockCookieGet.mockReturnValue({ value: 'valid-token' })
    mockJwtVerify.mockResolvedValue({ payload: mockUser })
    mockSupabaseFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: null, error: { message: 'Not found' } }),
        }),
      }),
    })

    const request = new NextRequest('http://localhost/api/rsvp', {
      method: 'POST',
      body: JSON.stringify({ space_id: 'nonexistent' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.error).toBe('Space not found')
  })

  it('returns 400 when space is not open', async () => {
    mockCookieGet.mockReturnValue({ value: 'valid-token' })
    mockJwtVerify.mockResolvedValue({ payload: mockUser })
    mockSupabaseFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { ...mockSpace, status: 'full' },
            error: null,
          }),
        }),
      }),
    })

    const request = new NextRequest('http://localhost/api/rsvp', {
      method: 'POST',
      body: JSON.stringify({ space_id: 'space-123' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('This space is not accepting RSVPs')
  })

  it('returns 400 when space date is in the past', async () => {
    mockCookieGet.mockReturnValue({ value: 'valid-token' })
    mockJwtVerify.mockResolvedValue({ payload: mockUser })
    mockSupabaseFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { ...mockSpace, date: '2020-01-01', time: '12:00' },
            error: null,
          }),
        }),
      }),
    })

    const request = new NextRequest('http://localhost/api/rsvp', {
      method: 'POST',
      body: JSON.stringify({ space_id: 'space-123' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('This space has already happened')
  })

  it('returns 400 with waitlist info when space is at capacity', async () => {
    mockCookieGet.mockReturnValue({ value: 'valid-token' })
    mockJwtVerify.mockResolvedValue({ payload: mockUser })

    let callCount = 0
    mockSupabaseFrom.mockImplementation((table: string) => {
      if (table === 'spaces') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: mockSpace, error: null }),
            }),
          }),
        }
      }
      if (table === 'invitations') {
        callCount++
        // First call is for capacity check
        if (callCount === 1) {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockResolvedValue({ count: 8, error: null }), // At capacity
              }),
            }),
          }
        }
      }
      if (table === 'waitlist') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: null, error: null }),
                // For count query
              }),
              // For count query
            }),
          }),
        }
      }
      return { select: vi.fn() }
    })

    const request = new NextRequest('http://localhost/api/rsvp', {
      method: 'POST',
      body: JSON.stringify({ space_id: 'space-123' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('This space is full')
    expect(data.code).toBe('SPACE_FULL')
    expect(data.waitlist).toBeDefined()
    expect(data.waitlist.available).toBe(true)
  })

  it('returns 400 when user already RSVPd', async () => {
    mockCookieGet.mockReturnValue({ value: 'valid-token' })
    mockJwtVerify.mockResolvedValue({ payload: mockUser })

    mockSupabaseFrom.mockImplementation((table: string) => {
      if (table === 'spaces') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: mockSpace, error: null }),
            }),
          }),
        }
      }
      if (table === 'invitations') {
        return {
          select: vi.fn().mockImplementation((selectArg?: string, options?: { count?: string }) => {
            if (options?.count === 'exact') {
              // Capacity check - not full
              return {
                eq: vi.fn().mockReturnValue({
                  eq: vi.fn().mockResolvedValue({ count: 3, error: null }),
                }),
              }
            }
            // Existing invitation check
            return {
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({
                    data: { id: 'inv-123', status: 'accepted' },
                    error: null,
                  }),
                }),
              }),
            }
          }),
        }
      }
      return { select: vi.fn() }
    })

    const request = new NextRequest('http://localhost/api/rsvp', {
      method: 'POST',
      body: JSON.stringify({ space_id: 'space-123' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe("You have already RSVP'd to this space")
  })

  it('returns 400 when user previously declined', async () => {
    mockCookieGet.mockReturnValue({ value: 'valid-token' })
    mockJwtVerify.mockResolvedValue({ payload: mockUser })

    mockSupabaseFrom.mockImplementation((table: string) => {
      if (table === 'spaces') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: mockSpace, error: null }),
            }),
          }),
        }
      }
      if (table === 'invitations') {
        return {
          select: vi.fn().mockImplementation((selectArg?: string, options?: { count?: string }) => {
            if (options?.count === 'exact') {
              return {
                eq: vi.fn().mockReturnValue({
                  eq: vi.fn().mockResolvedValue({ count: 3, error: null }),
                }),
              }
            }
            return {
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({
                    data: { id: 'inv-123', status: 'declined' },
                    error: null,
                  }),
                }),
              }),
            }
          }),
        }
      }
      return { select: vi.fn() }
    })

    const request = new NextRequest('http://localhost/api/rsvp', {
      method: 'POST',
      body: JSON.stringify({ space_id: 'space-123' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain('previously declined')
  })

  it('creates new invitation and returns checkout URL for new user', async () => {
    mockCookieGet.mockReturnValue({ value: 'valid-token' })
    mockJwtVerify.mockResolvedValue({ payload: mockUser })
    mockCreateCheckoutSession.mockResolvedValue({
      url: 'https://checkout.stripe.com/session/123',
      id: 'cs_123',
    })

    mockSupabaseFrom.mockImplementation((table: string) => {
      if (table === 'spaces') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: mockSpace, error: null }),
            }),
          }),
        }
      }
      if (table === 'invitations') {
        return {
          select: vi.fn().mockImplementation((selectArg?: string, options?: { count?: string }) => {
            if (options?.count === 'exact') {
              return {
                eq: vi.fn().mockReturnValue({
                  eq: vi.fn().mockResolvedValue({ count: 3, error: null }),
                }),
              }
            }
            // No existing invitation
            return {
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({ data: null, error: null }),
                }),
              }),
            }
          }),
          insert: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { id: 'new-inv-123', status: 'pending' },
                error: null,
              }),
            }),
          }),
        }
      }
      return { select: vi.fn() }
    })

    const request = new NextRequest('http://localhost/api/rsvp', {
      method: 'POST',
      body: JSON.stringify({ space_id: 'space-123' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.checkout_url).toBe('https://checkout.stripe.com/session/123')
    expect(data.session_id).toBe('cs_123')
    expect(mockCreateCheckoutSession).toHaveBeenCalledWith(
      4500,
      expect.objectContaining({
        invitation_id: 'new-inv-123',
        space_id: 'space-123',
        user_id: 'user-123',
      }),
      expect.stringContaining('/spaces/space-123/success'),
      expect.stringContaining('/spaces/space-123')
    )
  })

  it('uses existing pending invitation for returning user', async () => {
    mockCookieGet.mockReturnValue({ value: 'valid-token' })
    mockJwtVerify.mockResolvedValue({ payload: mockUser })
    mockCreateCheckoutSession.mockResolvedValue({
      url: 'https://checkout.stripe.com/session/456',
      id: 'cs_456',
    })

    mockSupabaseFrom.mockImplementation((table: string) => {
      if (table === 'spaces') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: mockSpace, error: null }),
            }),
          }),
        }
      }
      if (table === 'invitations') {
        return {
          select: vi.fn().mockImplementation((selectArg?: string, options?: { count?: string }) => {
            if (options?.count === 'exact') {
              return {
                eq: vi.fn().mockReturnValue({
                  eq: vi.fn().mockResolvedValue({ count: 3, error: null }),
                }),
              }
            }
            // Existing pending invitation
            return {
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({
                    data: { id: 'existing-inv-123', status: 'pending' },
                    error: null,
                  }),
                }),
              }),
            }
          }),
        }
      }
      return { select: vi.fn() }
    })

    const request = new NextRequest('http://localhost/api/rsvp', {
      method: 'POST',
      body: JSON.stringify({ space_id: 'space-123' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.checkout_url).toBeDefined()
    expect(mockCreateCheckoutSession).toHaveBeenCalledWith(
      4500,
      expect.objectContaining({
        invitation_id: 'existing-inv-123', // Uses existing, not new
      }),
      expect.any(String),
      expect.any(String)
    )
  })

  it('returns 500 when invitation creation fails', async () => {
    mockCookieGet.mockReturnValue({ value: 'valid-token' })
    mockJwtVerify.mockResolvedValue({ payload: mockUser })

    mockSupabaseFrom.mockImplementation((table: string) => {
      if (table === 'spaces') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: mockSpace, error: null }),
            }),
          }),
        }
      }
      if (table === 'invitations') {
        return {
          select: vi.fn().mockImplementation((selectArg?: string, options?: { count?: string }) => {
            if (options?.count === 'exact') {
              return {
                eq: vi.fn().mockReturnValue({
                  eq: vi.fn().mockResolvedValue({ count: 3, error: null }),
                }),
              }
            }
            return {
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({ data: null, error: null }),
                }),
              }),
            }
          }),
          insert: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: null,
                error: { message: 'DB error' },
              }),
            }),
          }),
        }
      }
      return { select: vi.fn() }
    })

    const request = new NextRequest('http://localhost/api/rsvp', {
      method: 'POST',
      body: JSON.stringify({ space_id: 'space-123' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Failed to create RSVP')
  })

  it('returns 500 when Stripe checkout fails', async () => {
    mockCookieGet.mockReturnValue({ value: 'valid-token' })
    mockJwtVerify.mockResolvedValue({ payload: mockUser })
    mockCreateCheckoutSession.mockRejectedValue(new Error('Stripe error'))

    mockSupabaseFrom.mockImplementation((table: string) => {
      if (table === 'spaces') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: mockSpace, error: null }),
            }),
          }),
        }
      }
      if (table === 'invitations') {
        return {
          select: vi.fn().mockImplementation((selectArg?: string, options?: { count?: string }) => {
            if (options?.count === 'exact') {
              return {
                eq: vi.fn().mockReturnValue({
                  eq: vi.fn().mockResolvedValue({ count: 3, error: null }),
                }),
              }
            }
            return {
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({ data: null, error: null }),
                }),
              }),
            }
          }),
          insert: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { id: 'new-inv-123', status: 'pending' },
                error: null,
              }),
            }),
          }),
        }
      }
      return { select: vi.fn() }
    })

    const request = new NextRequest('http://localhost/api/rsvp', {
      method: 'POST',
      body: JSON.stringify({ space_id: 'space-123' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Failed to process RSVP')
  })
})
