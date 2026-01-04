import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// Set env vars before imports
process.env.JWT_SECRET = 'test-jwt-secret-key-for-unit-tests-only'

// Create mock functions
const mockSupabaseFrom = vi.fn()
const mockSendSms = vi.fn()
const mockNormalizePhoneNumber = vi.fn((phone: string) => {
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 10) return `+1${digits}`
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`
  return `+${digits}`
})
const mockCheckInviteRateLimit = vi.fn()

// Mock Supabase
vi.mock('@/lib/supabase/server', () => ({
  createServerClient: () => ({
    from: (...args: unknown[]) => mockSupabaseFrom(...args),
  }),
}))

// Mock Twilio
vi.mock('@/lib/twilio/client', () => ({
  sendSms: (...args: unknown[]) => mockSendSms(...args),
  normalizePhoneNumber: (phone: string) => mockNormalizePhoneNumber(phone),
}))

// Mock messages
vi.mock('@/lib/twilio/messages', () => ({
  contractInviteMessage: () => 'You are invited to Test Space!',
}))

// Mock rate limiting
vi.mock('@/lib/rate-limit', () => ({
  checkInviteRateLimit: (...args: unknown[]) => mockCheckInviteRateLimit(...args),
}))

import { GET, POST } from '@/app/api/invitations/route'

describe('GET /api/invitations', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 400 when space_id is missing', async () => {
    const request = new NextRequest('http://localhost/api/invitations')

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Space ID required')
  })

  it('returns invitations list for a space', async () => {
    const mockInvitations = [
      {
        id: 'inv-1',
        space_id: 'space-123',
        user_id: 'user-1',
        status: 'accepted',
        user: { id: 'user-1', name: 'Alice', phone: '+15551111111', trust_score_overall: 100 },
      },
      {
        id: 'inv-2',
        space_id: 'space-123',
        user_id: 'user-2',
        status: 'sent',
        user: { id: 'user-2', name: 'Bob', phone: '+15552222222', trust_score_overall: 90 },
      },
    ]

    mockSupabaseFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: mockInvitations, error: null }),
        }),
      }),
    })

    const request = new NextRequest('http://localhost/api/invitations?space_id=space-123')

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.invitations).toHaveLength(2)
    expect(data.invitations[0].user.name).toBe('Alice')
  })

  it('returns 500 on database error', async () => {
    mockSupabaseFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: null, error: { message: 'DB error' } }),
        }),
      }),
    })

    const request = new NextRequest('http://localhost/api/invitations?space_id=space-123')

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('DB error')
  })
})

describe('POST /api/invitations', () => {
  const mockSpace = {
    id: 'space-123',
    name: 'Test Space',
    date: '2026-12-15',
    time: '19:00',
    status: 'open',
    capacity: 8,
    price_cents: 4500,
    host_id: 'host-123',
    location_hint: 'Downtown',
    host: { id: 'host-123', name: 'Host Name', phone: '+15550000000' },
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockCheckInviteRateLimit.mockResolvedValue({
      success: true,
      remaining: 49,
      resetAt: new Date(),
    })
    mockSendSms.mockResolvedValue('message-sid-123')
  })

  it('returns 400 when space_id is missing', async () => {
    const request = new NextRequest('http://localhost/api/invitations', {
      method: 'POST',
      body: JSON.stringify({ phone: '5551234567' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Space ID and phone number required')
  })

  it('returns 400 when phone is missing', async () => {
    const request = new NextRequest('http://localhost/api/invitations', {
      method: 'POST',
      body: JSON.stringify({ space_id: 'space-123' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Space ID and phone number required')
  })

  it('returns 404 when space not found', async () => {
    mockSupabaseFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: null, error: { message: 'Not found' } }),
        }),
      }),
    })

    const request = new NextRequest('http://localhost/api/invitations', {
      method: 'POST',
      body: JSON.stringify({ space_id: 'nonexistent', phone: '5551234567' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.error).toBe('Space not found')
  })

  it('returns 429 when rate limited', async () => {
    const resetAt = new Date(Date.now() + 60000)
    mockCheckInviteRateLimit.mockResolvedValue({
      success: false,
      remaining: 0,
      resetAt,
    })

    mockSupabaseFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: mockSpace, error: null }),
        }),
      }),
    })

    const request = new NextRequest('http://localhost/api/invitations', {
      method: 'POST',
      body: JSON.stringify({ space_id: 'space-123', phone: '5551234567' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(429)
    expect(data.error).toContain('Too many invitations')
    expect(response.headers.get('X-RateLimit-Remaining')).toBe('0')
  })

  it('returns 400 when space is not open or draft', async () => {
    mockSupabaseFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { ...mockSpace, status: 'completed' },
            error: null,
          }),
        }),
      }),
    })

    const request = new NextRequest('http://localhost/api/invitations', {
      method: 'POST',
      body: JSON.stringify({ space_id: 'space-123', phone: '5551234567' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Space is not accepting invitations')
  })

  it('returns 400 when space is at capacity', async () => {
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
        if (callCount === 1) {
          // Capacity check
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockResolvedValue({ count: 8, error: null }),
              }),
            }),
          }
        }
      }
      return { select: vi.fn() }
    })

    const request = new NextRequest('http://localhost/api/invitations', {
      method: 'POST',
      body: JSON.stringify({ space_id: 'space-123', phone: '5551234567' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Space is at capacity')
  })

  it('returns 400 when user already invited', async () => {
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
            // Existing invitation check
            return {
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({
                    data: { id: 'existing-inv', status: 'sent' },
                    error: null,
                  }),
                }),
              }),
            }
          }),
        }
      }
      if (table === 'users') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { id: 'user-123', phone: '+15551234567' },
                error: null,
              }),
            }),
          }),
        }
      }
      return { select: vi.fn() }
    })

    const request = new NextRequest('http://localhost/api/invitations', {
      method: 'POST',
      body: JSON.stringify({ space_id: 'space-123', phone: '5551234567' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('User already invited to this space')
  })

  it('creates invitation for new user and sends SMS', async () => {
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
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ error: null }),
          }),
        }
      }
      if (table === 'users') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: null, error: null }),
            }),
          }),
          insert: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { id: 'new-user-123', phone: '+15551234567' },
                error: null,
              }),
            }),
          }),
        }
      }
      if (table === 'sms_conversations') {
        return {
          insert: vi.fn().mockResolvedValue({ error: null }),
        }
      }
      return { select: vi.fn(), insert: vi.fn() }
    })

    const request = new NextRequest('http://localhost/api/invitations', {
      method: 'POST',
      body: JSON.stringify({ space_id: 'space-123', phone: '5551234567' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data.invitation.status).toBe('sent')
    expect(data.messageId).toBe('message-sid-123')
    expect(mockSendSms).toHaveBeenCalledWith('+15551234567', expect.any(String))
  })

  it('creates invitation with warning when SMS fails', async () => {
    mockSendSms.mockRejectedValue(new Error('SMS error'))

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
      if (table === 'users') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { id: 'existing-user', phone: '+15551234567' },
                error: null,
              }),
            }),
          }),
        }
      }
      return { select: vi.fn(), insert: vi.fn() }
    })

    const request = new NextRequest('http://localhost/api/invitations', {
      method: 'POST',
      body: JSON.stringify({ space_id: 'space-123', phone: '5551234567' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data.invitation).toBeDefined()
    expect(data.warning).toBe('Invitation created but SMS failed to send')
  })

  it('returns 500 when invitation creation fails', async () => {
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
      if (table === 'users') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { id: 'user-123', phone: '+15551234567' },
                error: null,
              }),
            }),
          }),
        }
      }
      return { select: vi.fn(), insert: vi.fn() }
    })

    const request = new NextRequest('http://localhost/api/invitations', {
      method: 'POST',
      body: JSON.stringify({ space_id: 'space-123', phone: '5551234567' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Failed to create invitation')
  })
})
