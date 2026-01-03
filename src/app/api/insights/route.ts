import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

// GET /api/insights?space_id=xxx - Get insights for a space
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const { searchParams } = new URL(request.url)
    const spaceId = searchParams.get('space_id')

    if (!spaceId) {
      return NextResponse.json({ error: 'space_id required' }, { status: 400 })
    }

    // Get space details
    const { data: space, error: spaceError } = await supabase
      .from('spaces')
      .select('*')
      .eq('id', spaceId)
      .single()

    if (spaceError || !space) {
      return NextResponse.json({ error: 'Space not found' }, { status: 404 })
    }

    // Get all invitations for this space
    const { data: invitations, error: invError } = await supabase
      .from('invitations')
      .select('id, status, created_at, stripe_payment_intent_id')
      .eq('space_id', spaceId)

    if (invError) {
      console.error('Error fetching invitations:', invError)
      return NextResponse.json({ error: 'Failed to fetch invitations' }, { status: 500 })
    }

    // Calculate invitation stats
    const stats = {
      sent: 0,
      accepted: 0,
      declined: 0,
      pending: 0,
      expired: 0,
    }

    for (const inv of invitations || []) {
      switch (inv.status) {
        case 'sent':
          stats.sent++
          break
        case 'accepted':
          stats.accepted++
          break
        case 'declined':
          stats.declined++
          break
        case 'pending':
          stats.pending++
          break
        case 'expired':
          stats.expired++
          break
      }
    }

    const totalInvitations = invitations?.length || 0
    const conversionRate = totalInvitations > 0
      ? Math.round((stats.accepted / totalInvitations) * 100)
      : 0

    // Calculate revenue (accepted invitations × price)
    const revenue = stats.accepted * (space.price_cents / 100)

    // Calculate average time to RSVP
    let avgTimeToRsvp = 'N/A'
    const acceptedInvitations = invitations?.filter(i => i.status === 'accepted') || []
    if (acceptedInvitations.length > 0) {
      // For now, we'll use a placeholder since we don't track the exact acceptance time
      // In a full implementation, we'd calculate: (accepted_at - created_at) average
      avgTimeToRsvp = '~24 hours'
    }

    // Build guest breakdown for visualization
    const guestBreakdown = [
      {
        status: 'going',
        label: 'Going',
        count: stats.accepted,
        percentage: totalInvitations > 0 ? (stats.accepted / space.capacity) * 100 : 0,
        color: 'var(--status-going-bg)',
      },
      {
        status: 'invited',
        label: 'Invited',
        count: stats.sent,
        percentage: totalInvitations > 0 ? (stats.sent / totalInvitations) * 100 : 0,
        color: 'var(--status-invited-bg)',
      },
      {
        status: 'pending',
        label: 'Pending',
        count: stats.pending,
        percentage: totalInvitations > 0 ? (stats.pending / totalInvitations) * 100 : 0,
        color: 'var(--status-pending-bg)',
      },
      {
        status: 'declined',
        label: 'Declined',
        count: stats.declined,
        percentage: totalInvitations > 0 ? (stats.declined / totalInvitations) * 100 : 0,
        color: 'var(--status-declined-bg)',
      },
    ]

    const insights = {
      overview: {
        totalGuests: totalInvitations,
        confirmed: stats.accepted,
        conversionRate,
        revenue,
      },
      engagement: {
        // These would require analytics integration (Vercel Analytics, PostHog, etc.)
        // For now, we return placeholders
        pageViews: 0,
        uniqueVisitors: 0,
        shares: 0,
        avgTimeToRsvp,
      },
      guestBreakdown,
      inviteStats: {
        sent: totalInvitations,
        accepted: stats.accepted,
        declined: stats.declined,
        outstanding: stats.sent + stats.pending,
      },
    }

    return NextResponse.json({ insights })
  } catch (err) {
    console.error('Error fetching insights:', err)
    return NextResponse.json({ error: 'Failed to fetch insights' }, { status: 500 })
  }
}
