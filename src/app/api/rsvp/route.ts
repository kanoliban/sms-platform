import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import { createServerClient, createAdminClient } from '@/lib/supabase/server'
import { createCheckoutSession } from '@/lib/stripe/client'

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is required')
  }
  return new TextEncoder().encode(secret)
}

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
      const verified = await jwtVerify(token, getJwtSecret())
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
    const { space_id } = body

    if (!space_id) {
      return NextResponse.json(
        { error: 'Room ID required' },
        { status: 400 }
      )
    }

    const supabase = createServerClient()

    // Get the space
    const { data: space, error: spaceError } = await supabase
      .from('spaces')
      .select('*')
      .eq('id', space_id)
      .single()

    if (spaceError || !space) {
      return NextResponse.json({ error: 'Space not found' }, { status: 404 })
    }

    // Check space status
    if (space.status !== 'open') {
      return NextResponse.json(
        { error: 'This space is not accepting RSVPs' },
        { status: 400 }
      )
    }

    // Check space is not in the past
    const spaceDate = new Date(`${space.date}T${space.time}`)
    if (spaceDate < new Date()) {
      return NextResponse.json(
        { error: 'This space has already happened' },
        { status: 400 }
      )
    }

    // Check capacity
    const { count: acceptedCount } = await supabase
      .from('invitations')
      .select('*', { count: 'exact', head: true })
      .eq('space_id', space_id)
      .eq('status', 'accepted')

    if (acceptedCount && acceptedCount >= space.capacity) {
      return NextResponse.json(
        { error: 'This space is full' },
        { status: 400 }
      )
    }

    // Check for existing invitation
    const { data: existingInvitation } = await supabase
      .from('invitations')
      .select('*')
      .eq('space_id', space_id)
      .eq('user_id', userId)
      .single()

    let invitationId: string

    if (existingInvitation) {
      // Already has an invitation
      if (existingInvitation.status === 'accepted') {
        return NextResponse.json(
          { error: 'You have already RSVP\'d to this space' },
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
          space_id,
          user_id: userId,
          status: 'pending',
          amount_cents: space.price_cents,
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
    const successUrl = `${baseUrl}/spaces/${space_id}/success?invitation=${invitationId}`
    const cancelUrl = `${baseUrl}/spaces/${space_id}`

    // Create Stripe checkout session
    const session = await createCheckoutSession(
      space.price_cents,
      {
        invitation_id: invitationId,
        space_id: space_id,
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
