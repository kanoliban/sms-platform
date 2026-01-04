import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, createAdminClient } from '@/lib/supabase/server'
import { capturePayment, cancelPaymentIntent } from '@/lib/stripe/client'
import { recordTrustEvent } from '@/lib/trust/scoring'
import { sendSms } from '@/lib/twilio/client'

// Helper: Promote next person from waitlist when a spot opens
async function promoteFromWaitlist(spaceId: string): Promise<void> {
  const supabase = createAdminClient()

  // Get room details
  const { data: space } = await supabase
    .from('spaces')
    .select('id, name, capacity, status')
    .eq('id', spaceId)
    .single()

  if (!space || space.status !== 'open') return

  // Count current accepted invitations
  const { count: acceptedCount } = await supabase
    .from('invitations')
    .select('*', { count: 'exact', head: true })
    .eq('space_id', spaceId)
    .eq('status', 'accepted')

  // Only promote if there's room
  if ((acceptedCount || 0) >= space.capacity) return

  // Get next person on waitlist
  const { data: nextWaitlist } = await supabase
    .from('waitlist')
    .select(`
      *,
      user:users (id, name, phone)
    `)
    .eq('room_id', spaceId)
    .eq('status', 'waiting')
    .order('position', { ascending: true })
    .limit(1)
    .single()

  if (!nextWaitlist || !nextWaitlist.user) return

  // Mark waitlist entry as invited
  await supabase
    .from('waitlist')
    .update({
      status: 'invited',
      invited_at: new Date().toISOString()
    })
    .eq('id', nextWaitlist.id)

  // Create a notification for the user
  await supabase.from('notifications').insert({
    user_id: nextWaitlist.user_id,
    type: 'waitlist_promoted',
    title: 'A spot opened up!',
    message: `A spot has opened in "${space.name}". You're next on the waitlist!`,
    space_id: spaceId,
  })

  // Send SMS notification
  if (nextWaitlist.user.phone) {
    try {
      const message = `Great news! A spot opened up in "${space.name}" and you're next on the waitlist. RSVP now before it's gone!`
      await sendSms(nextWaitlist.user.phone, message)
    } catch (smsError) {
      console.error('Failed to send waitlist promotion SMS:', smsError)
    }
  }
}

// GET /api/invitations/[id] - Get a single invitation
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = createServerClient()

    const { data, error } = await supabase
      .from('invitations')
      .select(`
        *,
        user:users (
          id,
          name,
          phone,
          trust_score_overall
        ),
        space:spaces (
          id,
          name,
          date,
          time,
          location_hint,
          price_cents,
          status
        )
      `)
      .eq('id', id)
      .single()

    if (error) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 })
    }

    return NextResponse.json({ invitation: data })
  } catch (err) {
    console.error('Error fetching invitation:', err)
    return NextResponse.json({ error: 'Failed to fetch invitation' }, { status: 500 })
  }
}

// PATCH /api/invitations/[id] - Update invitation (status, attendance)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = createServerClient()
    const body = await request.json()

    const { status, attended } = body

    // Get current invitation
    const { data: invitation, error: fetchError } = await supabase
      .from('invitations')
      .select('*, space:spaces(*)')
      .eq('id', id)
      .single()

    if (fetchError || !invitation) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 })
    }

    const updates: Record<string, unknown> = {}

    // Handle status update
    if (status !== undefined) {
      const validStatuses = ['pending', 'sent', 'accepted', 'declined', 'expired', 'canceled']
      if (!validStatuses.includes(status)) {
        return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
      }
      updates.status = status

      if (status === 'accepted' || status === 'declined') {
        updates.responded_at = new Date().toISOString()
      }

      // If declining or canceling an accepted invitation, release payment hold
      if ((status === 'declined' || status === 'canceled') && invitation.status === 'accepted') {
        if (invitation.stripe_payment_intent_id && !invitation.captured) {
          try {
            await cancelPaymentIntent(invitation.stripe_payment_intent_id)
          } catch (paymentError) {
            console.error('Failed to cancel payment:', paymentError)
          }
        }

        // Promote next person from waitlist
        await promoteFromWaitlist(invitation.space_id)
      }
    }

    // Handle attendance marking
    if (attended !== undefined) {
      if (invitation.status !== 'accepted') {
        return NextResponse.json(
          { error: 'Can only mark attendance for accepted invitations' },
          { status: 400 }
        )
      }

      updates.attended = attended

      // Process payment and trust based on attendance
      if (attended === true) {
        // Guest attended - capture payment
        if (invitation.stripe_payment_intent_id && !invitation.captured) {
          try {
            await capturePayment(invitation.stripe_payment_intent_id)
            updates.captured = true
          } catch (paymentError) {
            console.error('Failed to capture payment:', paymentError)
            // Log but don't fail - can retry later
          }
        }

        // Update trust score for attendance
        await recordTrustEvent(
          invitation.user_id,
          'space_attended',
          invitation.space_id,
          `Attended room: ${invitation.space?.name}`
        )

        // Update user stats - increment spaces_attended
        const { data: userData } = await supabase
          .from('users')
          .select('spaces_attended')
          .eq('id', invitation.user_id)
          .single()

        if (userData) {
          await supabase
            .from('users')
            .update({ spaces_attended: (userData.spaces_attended || 0) + 1 })
            .eq('id', invitation.user_id)
        }

      } else if (attended === false) {
        // No-show - still capture payment, but penalize trust
        if (invitation.stripe_payment_intent_id && !invitation.captured) {
          try {
            await capturePayment(invitation.stripe_payment_intent_id)
            updates.captured = true
          } catch (paymentError) {
            console.error('Failed to capture payment for no-show:', paymentError)
          }
        }

        // Record no-show (severe trust penalty)
        await recordTrustEvent(
          invitation.user_id,
          'no_show',
          invitation.space_id,
          `No-show for room: ${invitation.space?.name}`
        )

        // Update user stats - increment no_shows
        const { data: noShowUser } = await supabase
          .from('users')
          .select('no_shows')
          .eq('id', invitation.user_id)
          .single()

        if (noShowUser) {
          await supabase
            .from('users')
            .update({ no_shows: (noShowUser.no_shows || 0) + 1 })
            .eq('id', invitation.user_id)
        }
      }
    }

    // Perform the update
    const { data: updated, error: updateError } = await supabase
      .from('invitations')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating invitation:', updateError)
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({ invitation: updated })
  } catch (err) {
    console.error('Error updating invitation:', err)
    return NextResponse.json({ error: 'Failed to update invitation' }, { status: 500 })
  }
}
