import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// Set env vars before imports
process.env.JWT_SECRET = 'test-jwt-secret-key-for-unit-tests-only'

// Create mock functions
const mockSupabaseFrom = vi.fn()
const mockCapturePayment = vi.fn()
const mockCancelPaymentIntent = vi.fn()
const mockRecordTrustEvent = vi.fn()
const mockSendSms = vi.fn()

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
  capturePayment: (...args: unknown[]) => mockCapturePayment(...args),
  cancelPaymentIntent: (...args: unknown[]) => mockCancelPaymentIntent(...args),
}))

// Mock trust scoring
vi.mock('@/lib/trust/scoring', () => ({
  recordTrustEvent: (...args: unknown[]) => mockRecordTrustEvent(...args),
}))

// Mock Twilio
vi.mock('@/lib/twilio/client', () => ({
  sendSms: (...args: unknown[]) => mockSendSms(...args),
}))

import { GET, PATCH } from '@/app/api/invitations/[id]/route'

describe('GET /api/invitations/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns invitation with user and space data', async () => {
    const mockInvitation = {
      id: 'inv-123',
      space_id: 'space-123',
      user_id: 'user-123',
      status: 'accepted',
      user: { id: 'user-123', name: 'Test User', phone: '+15551234567', trust_score_overall: 100 },
      space: {
        id: 'space-123',
        name: 'Test Space',
        date: '2026-12-15',
        time: '19:00',
        location_hint: 'Downtown',
        price_cents: 4500,
        status: 'open',
      },
    }

    mockSupabaseFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: mockInvitation, error: null }),
        }),
      }),
    })

    const request = new NextRequest('http://localhost/api/invitations/inv-123')
    const response = await GET(request, { params: Promise.resolve({ id: 'inv-123' }) })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.invitation.id).toBe('inv-123')
    expect(data.invitation.user.name).toBe('Test User')
    expect(data.invitation.space.name).toBe('Test Space')
  })

  it('returns 404 when invitation not found', async () => {
    mockSupabaseFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: null, error: { message: 'Not found' } }),
        }),
      }),
    })

    const request = new NextRequest('http://localhost/api/invitations/nonexistent')
    const response = await GET(request, { params: Promise.resolve({ id: 'nonexistent' }) })
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.error).toBe('Invitation not found')
  })
})

describe('PATCH /api/invitations/[id]', () => {
  const mockInvitation = {
    id: 'inv-123',
    space_id: 'space-123',
    user_id: 'user-123',
    status: 'sent',
    stripe_payment_intent_id: 'pi_123',
    captured: false,
    space: { id: 'space-123', name: 'Test Space', status: 'open', capacity: 8 },
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockCapturePayment.mockResolvedValue({ id: 'pi_123', status: 'succeeded' })
    mockCancelPaymentIntent.mockResolvedValue({ id: 'pi_123', status: 'canceled' })
    mockRecordTrustEvent.mockResolvedValue(undefined)
    mockSendSms.mockResolvedValue('message-sid')
  })

  it('returns 404 when invitation not found', async () => {
    mockSupabaseFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: null, error: { message: 'Not found' } }),
        }),
      }),
    })

    const request = new NextRequest('http://localhost/api/invitations/nonexistent', {
      method: 'PATCH',
      body: JSON.stringify({ status: 'accepted' }),
    })
    const response = await PATCH(request, { params: Promise.resolve({ id: 'nonexistent' }) })
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.error).toBe('Invitation not found')
  })

  it('returns 400 for invalid status', async () => {
    mockSupabaseFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: mockInvitation, error: null }),
        }),
      }),
    })

    const request = new NextRequest('http://localhost/api/invitations/inv-123', {
      method: 'PATCH',
      body: JSON.stringify({ status: 'invalid_status' }),
    })
    const response = await PATCH(request, { params: Promise.resolve({ id: 'inv-123' }) })
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Invalid status')
  })

  it('updates invitation status to accepted', async () => {
    mockSupabaseFrom.mockImplementation((table: string) => {
      if (table === 'invitations') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: mockInvitation, error: null }),
            }),
          }),
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: { ...mockInvitation, status: 'accepted' },
                  error: null,
                }),
              }),
            }),
          }),
        }
      }
      return { select: vi.fn() }
    })

    const request = new NextRequest('http://localhost/api/invitations/inv-123', {
      method: 'PATCH',
      body: JSON.stringify({ status: 'accepted' }),
    })
    const response = await PATCH(request, { params: Promise.resolve({ id: 'inv-123' }) })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.invitation.status).toBe('accepted')
  })

  it('cancels payment and promotes from waitlist when declining accepted invitation', async () => {
    const acceptedInvitation = { ...mockInvitation, status: 'accepted' }

    mockSupabaseFrom.mockImplementation((table: string) => {
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
                single: vi.fn().mockResolvedValue({ data: acceptedInvitation, error: null }),
              }),
            }
          }),
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: { ...acceptedInvitation, status: 'declined' },
                  error: null,
                }),
              }),
            }),
          }),
        }
      }
      if (table === 'spaces') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { id: 'space-123', name: 'Test Space', status: 'open', capacity: 8 },
                error: null,
              }),
            }),
          }),
        }
      }
      if (table === 'waitlist') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                order: vi.fn().mockReturnValue({
                  limit: vi.fn().mockReturnValue({
                    single: vi.fn().mockResolvedValue({ data: null, error: null }),
                  }),
                }),
              }),
            }),
          }),
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ error: null }),
          }),
        }
      }
      if (table === 'notifications') {
        return {
          insert: vi.fn().mockResolvedValue({ error: null }),
        }
      }
      return { select: vi.fn(), update: vi.fn(), insert: vi.fn() }
    })

    const request = new NextRequest('http://localhost/api/invitations/inv-123', {
      method: 'PATCH',
      body: JSON.stringify({ status: 'declined' }),
    })
    const response = await PATCH(request, { params: Promise.resolve({ id: 'inv-123' }) })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.invitation.status).toBe('declined')
    expect(mockCancelPaymentIntent).toHaveBeenCalledWith('pi_123')
  })

  it('returns 400 when marking attendance for non-accepted invitation', async () => {
    mockSupabaseFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { ...mockInvitation, status: 'sent' },
            error: null,
          }),
        }),
      }),
    })

    const request = new NextRequest('http://localhost/api/invitations/inv-123', {
      method: 'PATCH',
      body: JSON.stringify({ attended: true }),
    })
    const response = await PATCH(request, { params: Promise.resolve({ id: 'inv-123' }) })
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Can only mark attendance for accepted invitations')
  })

  it('captures payment and records trust event when guest attended', async () => {
    const acceptedInvitation = { ...mockInvitation, status: 'accepted' }

    mockSupabaseFrom.mockImplementation((table: string) => {
      if (table === 'invitations') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: acceptedInvitation, error: null }),
            }),
          }),
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: { ...acceptedInvitation, attended: true, captured: true },
                  error: null,
                }),
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
                data: { id: 'user-123', spaces_attended: 5 },
                error: null,
              }),
            }),
          }),
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ error: null }),
          }),
        }
      }
      return { select: vi.fn(), update: vi.fn() }
    })

    const request = new NextRequest('http://localhost/api/invitations/inv-123', {
      method: 'PATCH',
      body: JSON.stringify({ attended: true }),
    })
    const response = await PATCH(request, { params: Promise.resolve({ id: 'inv-123' }) })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.invitation.attended).toBe(true)
    expect(data.invitation.captured).toBe(true)
    expect(mockCapturePayment).toHaveBeenCalledWith('pi_123')
    expect(mockRecordTrustEvent).toHaveBeenCalledWith(
      'user-123',
      'space_attended',
      'space-123',
      expect.any(String)
    )
  })

  it('captures payment and records no-show trust penalty', async () => {
    const acceptedInvitation = { ...mockInvitation, status: 'accepted' }

    mockSupabaseFrom.mockImplementation((table: string) => {
      if (table === 'invitations') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: acceptedInvitation, error: null }),
            }),
          }),
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: { ...acceptedInvitation, attended: false, captured: true },
                  error: null,
                }),
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
                data: { id: 'user-123', no_shows: 0 },
                error: null,
              }),
            }),
          }),
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ error: null }),
          }),
        }
      }
      return { select: vi.fn(), update: vi.fn() }
    })

    const request = new NextRequest('http://localhost/api/invitations/inv-123', {
      method: 'PATCH',
      body: JSON.stringify({ attended: false }),
    })
    const response = await PATCH(request, { params: Promise.resolve({ id: 'inv-123' }) })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.invitation.attended).toBe(false)
    expect(mockCapturePayment).toHaveBeenCalledWith('pi_123')
    expect(mockRecordTrustEvent).toHaveBeenCalledWith(
      'user-123',
      'no_show',
      'space-123',
      expect.any(String)
    )
  })

  it('returns 500 on database update error', async () => {
    mockSupabaseFrom.mockImplementation((table: string) => {
      if (table === 'invitations') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: mockInvitation, error: null }),
            }),
          }),
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: null,
                  error: { message: 'Update failed' },
                }),
              }),
            }),
          }),
        }
      }
      return { select: vi.fn(), update: vi.fn() }
    })

    const request = new NextRequest('http://localhost/api/invitations/inv-123', {
      method: 'PATCH',
      body: JSON.stringify({ status: 'accepted' }),
    })
    const response = await PATCH(request, { params: Promise.resolve({ id: 'inv-123' }) })
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Update failed')
  })
})
