import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, createAdminClient } from '@/lib/supabase/server'
import { recordTrustEvent } from '@/lib/trust/scoring'

// GET /api/feedback - Get feedback for a room
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const { searchParams } = new URL(request.url)
    const roomId = searchParams.get('room_id')

    if (!roomId) {
      return NextResponse.json({ error: 'Room ID required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('feedback')
      .select(`
        *,
        user:users (
          id,
          name,
          phone
        )
      `)
      .eq('room_id', roomId)
      .order('submitted_at', { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ feedback: data })
  } catch (err) {
    console.error('Error fetching feedback:', err)
    return NextResponse.json({ error: 'Failed to fetch feedback' }, { status: 500 })
  }
}

// POST /api/feedback - Submit feedback
export async function POST(request: NextRequest) {
  try {
    const supabase = createAdminClient()
    const body = await request.json()

    const {
      room_id,
      user_id,
      role, // 'guest' or 'host'
      // Guest feedback fields
      felt_different,
      shared_something,
      agreements_followed,
      issues,
      attend_again,
      uncomfortable,
      // Host feedback fields
      felt_like_sms,
      prompts_helped,
      difficult_guests,
      exceptional_guests,
      what_would_help,
    } = body

    if (!room_id || !user_id || !role) {
      return NextResponse.json(
        { error: 'Room ID, user ID, and role required' },
        { status: 400 }
      )
    }

    // Check for existing feedback
    const { data: existing } = await supabase
      .from('feedback')
      .select('id')
      .eq('room_id', room_id)
      .eq('user_id', user_id)
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'Feedback already submitted' },
        { status: 400 }
      )
    }

    // Insert feedback
    const { data: feedback, error } = await supabase
      .from('feedback')
      .insert({
        room_id,
        user_id,
        role,
        // Guest fields
        felt_different: felt_different || null,
        shared_something: shared_something || null,
        agreements_followed: agreements_followed || null,
        issues: issues || null,
        attend_again: attend_again || null,
        uncomfortable: uncomfortable || null,
        // Host fields
        felt_like_sms: felt_like_sms || null,
        prompts_helped: prompts_helped || null,
        difficult_guests: difficult_guests || null,
        exceptional_guests: exceptional_guests || null,
        what_would_help: what_would_help || null,
        submitted_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error('Error submitting feedback:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Award trust points for submitting feedback
    await recordTrustEvent(
      user_id,
      'feedback_submitted',
      room_id,
      `Feedback submitted as ${role}`
    )

    // Process feedback for additional trust events
    if (role === 'guest') {
      // Positive feedback increases host's trust
      if (felt_different === 'much' || attend_again === 'definitely') {
        // Get room host
        const { data: room } = await supabase
          .from('rooms')
          .select('host_id')
          .eq('id', room_id)
          .single()

        if (room?.host_id) {
          await recordTrustEvent(
            room.host_id,
            'positive_guest_feedback',
            room_id,
            `Positive guest feedback: felt_different=${felt_different}, attend_again=${attend_again}`
          )
        }
      }

      // Report agreement violations
      if (agreements_followed === 'issues' && issues) {
        // Log for founder review - could trigger further investigation
        console.log(`Agreement violation reported in room ${room_id}: ${issues}`)
      }
    }

    if (role === 'host') {
      // Process host feedback about specific guests
      if (difficult_guests) {
        // Log for founder review
        console.log(`Difficult guests reported in room ${room_id}: ${difficult_guests}`)
      }

      if (exceptional_guests) {
        // Could award bonus trust to mentioned guests
        console.log(`Exceptional guests in room ${room_id}: ${exceptional_guests}`)
      }
    }

    return NextResponse.json({ feedback }, { status: 201 })
  } catch (err) {
    console.error('Error submitting feedback:', err)
    return NextResponse.json({ error: 'Failed to submit feedback' }, { status: 500 })
  }
}
