import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

// GET /api/insights?space_id=xxx - Get insights for a space/room
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const { searchParams } = new URL(request.url)
    const spaceId = searchParams.get('space_id')

    if (!spaceId) {
      return NextResponse.json({ error: 'space_id required' }, { status: 400 })
    }

    // Get room details (UI uses "space" but DB uses "room")
    const { data: room, error: roomError } = await supabase
      .from('rooms')
      .select('*')
      .eq('id', spaceId)
      .single()

    if (roomError || !room) {
      return NextResponse.json({ error: 'Space not found' }, { status: 404 })
    }

    // Get all invitations for this room with attendance and payment data
    const { data: invitations, error: invError } = await supabase
      .from('invitations')
      .select('id, status, created_at, responded_at, attended, captured, amount_cents')
      .eq('room_id', spaceId)

    if (invError) {
      console.error('Error fetching invitations:', invError)
      return NextResponse.json({ error: 'Failed to fetch invitations' }, { status: 500 })
    }

    // Get feedback for this room
    const { data: feedbackData, error: feedbackError } = await supabase
      .from('feedback')
      .select('felt_different, attend_again, role')
      .eq('room_id', spaceId)

    if (feedbackError) {
      console.error('Error fetching feedback:', feedbackError)
    }

    // Calculate invitation stats
    const stats = {
      sent: 0,
      accepted: 0,
      declined: 0,
      pending: 0,
      expired: 0,
      attended: 0,
      capturedRevenueCents: 0,
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

      // Count attended guests
      if (inv.attended === true) {
        stats.attended++
      }

      // Sum captured payments (actual revenue)
      if (inv.captured === true && inv.amount_cents) {
        stats.capturedRevenueCents += inv.amount_cents
      }
    }

    const totalInvitations = invitations?.length || 0
    const conversionRate = totalInvitations > 0
      ? Math.round((stats.accepted / totalInvitations) * 100)
      : 0

    // Calculate attendance rate (attended / accepted)
    const attendanceRate = stats.accepted > 0
      ? Math.round((stats.attended / stats.accepted) * 100)
      : 0

    // Calculate revenue - show captured if available, otherwise projected
    const capturedRevenue = stats.capturedRevenueCents / 100
    const projectedRevenue = stats.accepted * (room.price_cents / 100)
    const revenue = capturedRevenue > 0 ? capturedRevenue : projectedRevenue
    const revenueIsCaptured = capturedRevenue > 0

    // Calculate average time to RSVP
    let avgTimeToRsvp = 'N/A'
    const respondedInvitations = invitations?.filter(i => i.responded_at && i.created_at) || []
    if (respondedInvitations.length > 0) {
      const totalMs = respondedInvitations.reduce((sum, inv) => {
        const created = new Date(inv.created_at).getTime()
        const responded = new Date(inv.responded_at!).getTime()
        return sum + (responded - created)
      }, 0)
      const avgMs = totalMs / respondedInvitations.length
      const avgHours = Math.round(avgMs / (1000 * 60 * 60))
      if (avgHours < 1) {
        avgTimeToRsvp = '< 1 hour'
      } else if (avgHours < 24) {
        avgTimeToRsvp = `~${avgHours} hours`
      } else {
        const avgDays = Math.round(avgHours / 24)
        avgTimeToRsvp = `~${avgDays} day${avgDays > 1 ? 's' : ''}`
      }
    }

    // Calculate feedback scores
    let feedbackScore = null
    let feedbackCount = 0
    if (feedbackData && feedbackData.length > 0) {
      // Score mapping for qualitative feedback
      const scoreMap: Record<string, number> = {
        // felt_different
        'much': 3,
        'somewhat': 2,
        'not_really': 1,
        // attend_again
        'definitely': 3,
        'maybe': 2,
        'no': 1,
      }

      let totalScore = 0
      let scoreCount = 0

      for (const fb of feedbackData) {
        if (fb.role === 'guest') {
          if (fb.felt_different && scoreMap[fb.felt_different]) {
            totalScore += scoreMap[fb.felt_different]
            scoreCount++
          }
          if (fb.attend_again && scoreMap[fb.attend_again]) {
            totalScore += scoreMap[fb.attend_again]
            scoreCount++
          }
        }
      }

      if (scoreCount > 0) {
        // Convert to percentage (3 = 100%, 1 = 33%)
        feedbackScore = Math.round((totalScore / scoreCount / 3) * 100)
        feedbackCount = feedbackData.filter(f => f.role === 'guest').length
      }
    }

    // Build guest breakdown for visualization
    const guestBreakdown = [
      {
        status: 'going',
        label: 'Going',
        count: stats.accepted,
        percentage: room.capacity > 0 ? (stats.accepted / room.capacity) * 100 : 0,
        color: 'var(--status-going-bg)',
      },
      {
        status: 'attended',
        label: 'Attended',
        count: stats.attended,
        percentage: stats.accepted > 0 ? (stats.attended / stats.accepted) * 100 : 0,
        color: 'var(--success)',
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
        revenueIsCaptured,
        attendanceRate,
        attended: stats.attended,
      },
      engagement: {
        // Page views, unique visitors, shares require analytics integration
        // (Vercel Analytics, PostHog, etc.)
        pageViews: 0,
        uniqueVisitors: 0,
        shares: 0,
        avgTimeToRsvp,
      },
      feedback: {
        score: feedbackScore,
        count: feedbackCount,
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
