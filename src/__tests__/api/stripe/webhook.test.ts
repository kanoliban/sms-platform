import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// Set env vars before imports
process.env.STRIPE_SECRET_KEY = 'sk_test_xxx'
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_xxx'

// Create mock functions that will be used in the factories
const mockConstructEvent = vi.fn()
const mockSupabaseFrom = vi.fn()
const mockSupabaseInsert = vi.fn()
const mockSupabaseUpdate = vi.fn()
const mockSendSms = vi.fn()
const mockSendRsvpConfirmation = vi.fn()

// Mock Stripe
vi.mock('stripe', () => ({
  default: class MockStripe {
    webhooks = {
      constructEvent: (...args: unknown[]) => mockConstructEvent(...args),
    }
  },
}))

// Mock Supabase
vi.mock('@/lib/supabase/server', () => ({
  createAdminClient: () => ({
    from: (...args: unknown[]) => mockSupabaseFrom(...args),
  }),
}))

// Mock Twilio
vi.mock('@/lib/twilio/client', () => ({
  sendSms: (...args: unknown[]) => mockSendSms(...args),
}))

// Mock email
vi.mock('@/lib/email', () => ({
  sendRsvpConfirmation: (...args: unknown[]) => mockSendRsvpConfirmation(...args),
}))

// Mock messages
vi.mock('@/lib/twilio/messages', () => ({
  confirmationAfterPaymentMessage: () => 'Your spot is confirmed!',
}))

import { POST } from '@/app/api/stripe/webhook/route'

describe('POST /api/stripe/webhook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Set default mock implementations
    mockSupabaseInsert.mockResolvedValue({ error: null })
    mockSupabaseUpdate.mockReturnValue({
      eq: vi.fn().mockResolvedValue({ error: null }),
    })
    mockSendSms.mockResolvedValue('message-sid')
    mockSendRsvpConfirmation.mockResolvedValue(undefined)
  })

  it('returns 400 when signature is missing', async () => {
    const request = new NextRequest('http://localhost/api/stripe/webhook', {
      method: 'POST',
      body: JSON.stringify({}),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Missing signature')
  })

  it('returns 400 when signature verification fails', async () => {
    mockConstructEvent.mockImplementation(() => {
      throw new Error('Invalid signature')
    })

    const request = new NextRequest('http://localhost/api/stripe/webhook', {
      method: 'POST',
      body: JSON.stringify({}),
      headers: {
        'stripe-signature': 'invalid-sig',
      },
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Invalid signature')
  })

  it('handles payment_intent.succeeded and sends confirmation SMS', async () => {
    const mockInvitation = {
      id: 'inv-123',
      user: { id: 'user-123', phone: '+15551234567', name: 'Test User' },
      space: {
        id: 'space-123',
        name: 'Test Space',
        date: '2026-01-15',
        time: '19:00',
        location_hint: 'Downtown',
      },
    }

    mockConstructEvent.mockReturnValue({
      type: 'payment_intent.succeeded',
      data: {
        object: {
          id: 'pi_123',
          metadata: { invitation_id: 'inv-123' },
        },
      },
    })

    mockSupabaseFrom.mockImplementation((table: string) => {
      if (table === 'invitations') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: mockInvitation, error: null }),
            }),
          }),
        }
      }
      if (table === 'sms_conversations') {
        return { insert: mockSupabaseInsert }
      }
      return { insert: mockSupabaseInsert }
    })

    const request = new NextRequest('http://localhost/api/stripe/webhook', {
      method: 'POST',
      body: JSON.stringify({}),
      headers: {
        'stripe-signature': 'valid-sig',
      },
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.received).toBe(true)
    expect(mockSendSms).toHaveBeenCalledWith('+15551234567', 'Your spot is confirmed!')
    expect(mockSupabaseInsert).toHaveBeenCalled()
  })

  it('handles payment_intent.payment_failed and reverts invitation status', async () => {
    const mockInvitation = {
      id: 'inv-123',
      user: { id: 'user-123', phone: '+15551234567', name: 'Test User' },
      space: { id: 'space-123', name: 'Test Space' },
    }

    mockConstructEvent.mockReturnValue({
      type: 'payment_intent.payment_failed',
      data: {
        object: {
          id: 'pi_123',
          metadata: { invitation_id: 'inv-123' },
        },
      },
    })

    mockSupabaseFrom.mockImplementation((table: string) => {
      if (table === 'invitations') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: mockInvitation, error: null }),
            }),
          }),
          update: mockSupabaseUpdate,
        }
      }
      return { insert: mockSupabaseInsert }
    })

    const request = new NextRequest('http://localhost/api/stripe/webhook', {
      method: 'POST',
      body: JSON.stringify({}),
      headers: {
        'stripe-signature': 'valid-sig',
      },
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.received).toBe(true)
    expect(mockSupabaseUpdate).toHaveBeenCalledWith({ status: 'sent' })
    expect(mockSendSms).toHaveBeenCalledWith(
      '+15551234567',
      expect.stringContaining("didn't go through")
    )
  })

  it('handles checkout.session.completed and updates invitation', async () => {
    const mockInvitation = {
      id: 'inv-123',
      user: { id: 'user-123', phone: '+15551234567', email: 'test@example.com', name: 'Test User' },
      space: {
        id: 'space-123',
        name: 'Test Space',
        date: '2026-01-15',
        time: '19:00',
        location_hint: 'Downtown',
        host_id: 'host-123',
        status: 'open',
        capacity: 8,
        price_cents: 4500,
      },
    }

    mockConstructEvent.mockReturnValue({
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_123',
          payment_intent: 'pi_123',
          amount_total: 4500,
          metadata: { invitation_id: 'inv-123' },
        },
      },
    })

    mockSupabaseFrom.mockImplementation((table: string) => {
      if (table === 'invitations') {
        return {
          select: vi.fn().mockImplementation((selectArg?: string, options?: { count?: string; head?: boolean }) => {
            // Handle count query with chained .eq().eq()
            if (options?.count === 'exact') {
              return {
                eq: vi.fn().mockReturnValue({
                  eq: vi.fn().mockResolvedValue({ count: 3, error: null }),
                }),
              }
            }
            // Handle regular select with .eq().single()
            return {
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: mockInvitation, error: null }),
              }),
            }
          }),
          update: mockSupabaseUpdate,
        }
      }
      if (table === 'notifications') {
        return { insert: mockSupabaseInsert }
      }
      if (table === 'spaces') {
        return { update: mockSupabaseUpdate }
      }
      return { insert: mockSupabaseInsert, update: mockSupabaseUpdate }
    })

    const request = new NextRequest('http://localhost/api/stripe/webhook', {
      method: 'POST',
      body: JSON.stringify({}),
      headers: {
        'stripe-signature': 'valid-sig',
      },
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.received).toBe(true)
    expect(mockSupabaseUpdate).toHaveBeenCalledWith({
      status: 'accepted',
      stripe_payment_intent_id: 'pi_123',
    })
    expect(mockSendSms).toHaveBeenCalledWith('+15551234567', 'Your spot is confirmed!')
    expect(mockSendRsvpConfirmation).toHaveBeenCalledWith(
      'test@example.com',
      'Test User',
      expect.objectContaining({
        title: 'Test Space',
        price: 45,
      })
    )
  })

  it('handles unhandled event types gracefully', async () => {
    mockConstructEvent.mockReturnValue({
      type: 'some.unknown.event',
      data: { object: {} },
    })

    const request = new NextRequest('http://localhost/api/stripe/webhook', {
      method: 'POST',
      body: JSON.stringify({}),
      headers: {
        'stripe-signature': 'valid-sig',
      },
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.received).toBe(true)
  })

  it('handles payment_intent.canceled event', async () => {
    mockConstructEvent.mockReturnValue({
      type: 'payment_intent.canceled',
      data: {
        object: {
          id: 'pi_123',
          metadata: { invitation_id: 'inv-123' },
        },
      },
    })

    const request = new NextRequest('http://localhost/api/stripe/webhook', {
      method: 'POST',
      body: JSON.stringify({}),
      headers: {
        'stripe-signature': 'valid-sig',
      },
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.received).toBe(true)
  })

  it('handles charge.captured event', async () => {
    mockConstructEvent.mockReturnValue({
      type: 'charge.captured',
      data: {
        object: { id: 'ch_123' },
      },
    })

    const request = new NextRequest('http://localhost/api/stripe/webhook', {
      method: 'POST',
      body: JSON.stringify({}),
      headers: {
        'stripe-signature': 'valid-sig',
      },
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.received).toBe(true)
  })

  it('skips processing when invitation_id is missing from metadata', async () => {
    mockConstructEvent.mockReturnValue({
      type: 'payment_intent.succeeded',
      data: {
        object: {
          id: 'pi_123',
          metadata: {}, // No invitation_id
        },
      },
    })

    const request = new NextRequest('http://localhost/api/stripe/webhook', {
      method: 'POST',
      body: JSON.stringify({}),
      headers: {
        'stripe-signature': 'valid-sig',
      },
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.received).toBe(true)
    expect(mockSendSms).not.toHaveBeenCalled()
  })

  it('handles missing invitation gracefully', async () => {
    mockConstructEvent.mockReturnValue({
      type: 'payment_intent.succeeded',
      data: {
        object: {
          id: 'pi_123',
          metadata: { invitation_id: 'inv-nonexistent' },
        },
      },
    })

    mockSupabaseFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
      }),
    })

    const request = new NextRequest('http://localhost/api/stripe/webhook', {
      method: 'POST',
      body: JSON.stringify({}),
      headers: {
        'stripe-signature': 'valid-sig',
      },
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.received).toBe(true)
    expect(mockSendSms).not.toHaveBeenCalled()
  })
})
