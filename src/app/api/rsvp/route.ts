import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import { createServerClient } from '@/lib/supabase/server'
import { createCheckoutSession } from '@/lib/stripe/client'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'sms-platform-secret-key-change-in-production'
)

// POST /api/rsvp - Create a Stripe checkout session to accept invitation
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('sms_auth_token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'Please sign in to RSVP' },
        { status: 401 }
      )
    }

    // Verify JWT token
    let payload
    try {
      const verified = await jwtVerify(token, JWT_SECRET)
      payload = verified.payload
    } catch {
      return NextResponse.json(
        { error: 'Invalid session. Please sign in again.' },
        { status: 401 }
      )
    }

    const userId = payload.userId as string
    const userPhone = payload.phone as string

    const body = await request.json()
    const { room_id } = body

    if (!room_id) {
      return NextResponse.json(
        { error: 'Room ID required' },
        { status: 400 }
      )
    }

    const supabase = createServerClient()

    // Get the room
    const { data: room, error: roomError } = await supabase
      .from('rooms')
      .select('*')
      .eq('id', room_id)
      .single()

    if (roomError || !room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 })
    }

    // Check room status
    if (room.status !== 'open') {
      return NextResponse.json(
        { error: 'This room is not accepting RSVPs' },
        { status: 400 }
      )
    }

    // Check room is not in the past
    const roomDate = new Date(`${room.date}T${room.time}`)
    if (roomDate < new Date()) {
      return NextResponse.json(
        { error: 'This room has already happened' },
        { status: 400 }
      )
    }

    // Check capacity
    const { count: acceptedCount } = await supabase
      .from('invitations')
      .select('*', { count: 'exact', head: true })
      .eq('room_id', room_id)
      .eq('status', 'accepted')

    if (acceptedCount && acceptedCount >= room.capacity) {
      return NextResponse.json(
        { error: 'This room is full' },
        { status: 400 }
      )
    }

    // Check for existing invitation
    const { data: existingInvitation } = await supabase
      .from('invitations')
      .select('*')
      .eq('room_id', room_id)
      .eq('user_id', userId)
      .single()

    let invitationId: string

    if (existingInvitation) {
      // Already has an invitation
      if (existingInvitation.status === 'accepted') {
        return NextResponse.json(
          { error: 'You have already RSVP\'d to this room' },
          { status: 400 }
        )
      }

      if (existingInvitation.status === 'declined') {
        return NextResponse.json(
          { error: 'You previously declined this invitation. Contact the host if you changed your mind.' },
          { status: 400 }
        )
      }

      // Use existing invitation (pending or sent)
      invitationId = existingInvitation.id
    } else {
      // Create new invitation as "pending" (request to join)
      const { data: newInvitation, error: inviteError } = await supabase
        .from('invitations')
        .insert({
          room_id,
          user_id: userId,
          status: 'pending',
          amount_cents: room.price_cents,
        })
        .select()
        .single()

      if (inviteError || !newInvitation) {
        console.error('Error creating invitation:', inviteError)
        return NextResponse.json(
          { error: 'Failed to create RSVP' },
          { status: 500 }
        )
      }

      invitationId = newInvitation.id
    }

    // Build URLs
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || request.headers.get('origin') || 'http://localhost:3000'
    const successUrl = `${baseUrl}/rooms/${room_id}/success?invitation=${invitationId}`
    const cancelUrl = `${baseUrl}/rooms/${room_id}`

    // Create Stripe checkout session
    const session = await createCheckoutSession(
      room.price_cents,
      {
        invitation_id: invitationId,
        room_id: room_id,
        user_id: userId,
        user_phone: userPhone,
      },
      successUrl,
      cancelUrl
    )

    return NextResponse.json({
      checkout_url: session.url,
      session_id: session.id,
    })

  } catch (err) {
    console.error('Error in RSVP:', err)
    return NextResponse.json(
      { error: 'Failed to process RSVP' },
      { status: 500 }
    )
  }
}
