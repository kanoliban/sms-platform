import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import { createAdminClient } from '@/lib/supabase/server'

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is required')
  }
  return new TextEncoder().encode(secret)
}

// POST /api/rsvp/cancel - Cancel an RSVP
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('sms_auth_token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'Please sign in to cancel your RSVP' },
        { status: 401 }
      )
    }

    // Verify JWT token
    let payload
    try {
      const verified = await jwtVerify(token, getJwtSecret())
      payload = verified.payload
    } catch {
      return NextResponse.json(
        { error: 'Invalid session. Please sign in again.' },
        { status: 401 }
      )
    }

    const userId = payload.userId as string
    const body = await request.json()
    const { invitation_id } = body

    if (!invitation_id) {
      return NextResponse.json(
        { error: 'Invitation ID required' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Get the invitation and verify ownership
    const { data: invitation, error: invError } = await supabase
      .from('invitations')
      .select('*, space:spaces(id, name, host_id, date, time)')
      .eq('id', invitation_id)
      .single()

    if (invError || !invitation) {
      return NextResponse.json(
        { error: 'Invitation not found' },
        { status: 404 }
      )
    }

    // Verify the user owns this invitation
    if (invitation.user_id !== userId) {
      return NextResponse.json(
        { error: 'Not authorized to cancel this RSVP' },
        { status: 403 }
      )
    }

    // Check if already canceled
    if (invitation.status === 'canceled') {
      return NextResponse.json(
        { error: 'RSVP already canceled' },
        { status: 400 }
      )
    }

    // Check if space is in the past
    const spaceData = invitation.space as { id: string; name: string; host_id: string; date: string; time: string }
    const spaceDateTime = new Date(`${spaceData.date}T${spaceData.time}`)
    if (spaceDateTime < new Date()) {
      return NextResponse.json(
        { error: 'Cannot cancel RSVP for past events' },
        { status: 400 }
      )
    }

    // Update invitation status to canceled
    const { error: updateError } = await supabase
      .from('invitations')
      .update({ status: 'canceled' })
      .eq('id', invitation_id)

    if (updateError) {
      console.error('Error canceling invitation:', updateError)
      return NextResponse.json(
        { error: 'Failed to cancel RSVP' },
        { status: 500 }
      )
    }

    // Notify the host about the cancellation
    const { data: guest } = await supabase
      .from('users')
      .select('name')
      .eq('id', userId)
      .single()

    const guestName = guest?.name || 'A guest'
    await supabase.from('notifications').insert({
      user_id: spaceData.host_id,
      type: 'cancellation',
      title: 'Guest Canceled',
      message: `${guestName} canceled their RSVP for ${spaceData.name}.`,
      space_id: spaceData.id,
    })

    return NextResponse.json({
      success: true,
      message: 'RSVP canceled successfully',
    })

  } catch (err) {
    console.error('Error canceling RSVP:', err)
    return NextResponse.json(
      { error: 'Failed to cancel RSVP' },
      { status: 500 }
    )
  }
}
