import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { sendSms, normalizePhoneNumber, validateTwilioSignature } from '@/lib/twilio/client'
import { createPaymentIntent } from '@/lib/stripe/client'
import {
  acceptedMessage,
  declinedMessage,
  paymentLinkMessage,
  confirmationAfterPaymentMessage,
} from '@/lib/twilio/messages'
import type { Invitation, Room, User } from '@/lib/supabase/types'

// Type for invitation with joined room data
type InvitationWithRoom = Invitation & {
  room: Room & {
    host: Pick<User, 'id' | 'name' | 'phone'>
  }
}

// POST /api/twilio/webhook - Handle incoming SMS
export async function POST(request: NextRequest) {
  try {
    // Parse form data from Twilio
    const formData = await request.formData()
    const from = formData.get('From') as string
    const body = (formData.get('Body') as string || '').trim().toUpperCase()
    const messageSid = formData.get('MessageSid') as string

    // Validate Twilio signature in production
    if (process.env.NODE_ENV === 'production') {
      const signature = request.headers.get('x-twilio-signature') || ''
      const url = request.url
      const params: Record<string, string> = {}
      formData.forEach((value, key) => {
        params[key] = value.toString()
      })

      if (!validateTwilioSignature(signature, url, params)) {
        console.error('Invalid Twilio signature')
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    const supabase = createAdminClient()
    const normalizedPhone = normalizePhoneNumber(from)

    // Find user by phone
    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('phone', normalizedPhone)
      .single()

    if (!user) {
      // Unknown sender - could be new signup attempt
      await sendSms(
        normalizedPhone,
        "SMS: We don't recognize this number. If you were invited to a room, please wait for an invitation."
      )
      return twimlResponse()
    }

    // Log incoming message
    await supabase.from('sms_conversations').insert({
      user_id: user.id,
      direction: 'inbound',
      message: body,
      context: 'response',
    })

    // Find most recent pending/sent invitation for this user
    const { data: invitation } = await supabase
      .from('invitations')
      .select(`
        *,
        room:rooms (
          *,
          host:users!rooms_host_id_fkey (
            id,
            name,
            phone
          )
        )
      `)
      .eq('user_id', user.id)
      .in('status', ['pending', 'sent'])
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    // Handle response
    if (body === 'ACCEPT' || body === 'YES' || body === 'Y') {
      return await handleAccept(supabase, user, invitation, normalizedPhone)
    } else if (body === 'DECLINE' || body === 'NO' || body === 'N') {
      return await handleDecline(supabase, user, invitation, normalizedPhone)
    } else if (body === 'CANCEL') {
      return await handleCancel(supabase, user, normalizedPhone)
    } else if (body === 'HELP') {
      await sendSms(
        normalizedPhone,
        `SMS Help:\n\nACCEPT - Accept an invitation\nDECLINE - Decline an invitation\nCANCEL - Cancel an accepted invite (48h+ before)\n\nQuestions? Reply here and we'll respond.`
      )
      return twimlResponse()
    } else {
      // Handle feedback responses or general messages
      return await handleGeneralMessage(supabase, user, body, normalizedPhone)
    }
  } catch (err) {
    console.error('Twilio webhook error:', err)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}

async function handleAccept(
  supabase: ReturnType<typeof createAdminClient>,
  user: User,
  invitation: InvitationWithRoom | null,
  phone: string
) {
  if (!invitation) {
    await sendSms(phone, "We couldn't find a pending invitation for you. If you believe this is an error, reply HELP.")
    return twimlResponse()
  }

  const room = invitation.room as Room & { host: Pick<User, 'id' | 'name' | 'phone'> }

  // Check room capacity
  const { count: acceptedCount } = await supabase
    .from('invitations')
    .select('*', { count: 'exact', head: true })
    .eq('room_id', room.id)
    .eq('status', 'accepted')

  if (acceptedCount && acceptedCount >= room.capacity) {
    await sendSms(
      phone,
      `Unfortunately, ${room.name} is now full. We'll let you know if a spot opens up.`
    )
    return twimlResponse()
  }

  // Create Stripe PaymentIntent (authorize only, don't capture)
  try {
    const paymentIntent = await createPaymentIntent(room.price_cents, {
      invitation_id: invitation.id,
      room_id: room.id,
      user_id: user.id,
      user_phone: phone,
    })

    // Update invitation with payment intent
    await supabase
      .from('invitations')
      .update({
        status: 'accepted',
        responded_at: new Date().toISOString(),
        stripe_payment_intent_id: paymentIntent.id,
        amount_cents: room.price_cents,
      })
      .eq('id', invitation.id)

    // For MVP, we'll send a confirmation without requiring payment link click
    // In production, you'd send a Stripe Checkout link
    const confirmationMsg = acceptedMessage({
      roomName: room.name,
      date: new Date(room.date),
      time: room.time,
    })

    await sendSms(phone, confirmationMsg)

    // Log outbound
    await supabase.from('sms_conversations').insert({
      user_id: user.id,
      direction: 'outbound',
      message: confirmationMsg,
      context: 'acceptance_confirmation',
      room_id: room.id,
    })

    // Notify host
    if (room.host?.phone) {
      await sendSms(
        room.host.phone,
        `SMS: ${user.name || phone} just accepted their invitation to ${room.name}!`
      )
    }
  } catch (err) {
    console.error('Payment intent creation failed:', err)
    await sendSms(
      phone,
      `We had trouble processing your acceptance. Please try again or reply HELP.`
    )
  }

  return twimlResponse()
}

async function handleDecline(
  supabase: ReturnType<typeof createAdminClient>,
  user: User,
  invitation: InvitationWithRoom | null,
  phone: string
) {
  if (!invitation) {
    await sendSms(phone, "We couldn't find a pending invitation for you.")
    return twimlResponse()
  }

  const room = invitation.room as Room

  // Update invitation
  await supabase
    .from('invitations')
    .update({
      status: 'declined',
      responded_at: new Date().toISOString(),
    })
    .eq('id', invitation.id)

  const msg = declinedMessage({ roomName: room.name })
  await sendSms(phone, msg)

  // Log outbound
  await supabase.from('sms_conversations').insert({
    user_id: user.id,
    direction: 'outbound',
    message: msg,
    context: 'decline_confirmation',
    room_id: room.id,
  })

  return twimlResponse()
}

async function handleCancel(
  supabase: ReturnType<typeof createAdminClient>,
  user: User,
  phone: string
) {
  // Find accepted invitation
  const { data: invitation } = await supabase
    .from('invitations')
    .select('*, room:rooms(*)')
    .eq('user_id', user.id)
    .eq('status', 'accepted')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (!invitation) {
    await sendSms(phone, "You don't have any accepted invitations to cancel.")
    return twimlResponse()
  }

  const room = invitation.room as Room
  const roomDate = new Date(`${room.date}T${room.time}`)
  const now = new Date()
  const hoursUntilRoom = (roomDate.getTime() - now.getTime()) / (1000 * 60 * 60)

  if (hoursUntilRoom < 48) {
    await sendSms(
      phone,
      `Cancellations must be made 48+ hours before the room. ${room.name} is in ${Math.round(hoursUntilRoom)} hours. Your card will still be charged if you don't attend.`
    )
    return twimlResponse()
  }

  // Cancel the invitation
  await supabase
    .from('invitations')
    .update({
      status: 'declined',
      responded_at: new Date().toISOString(),
    })
    .eq('id', invitation.id)

  // Cancel payment intent if exists
  if (invitation.stripe_payment_intent_id) {
    const { cancelPaymentIntent } = await import('@/lib/stripe/client')
    try {
      await cancelPaymentIntent(invitation.stripe_payment_intent_id)
    } catch (err) {
      console.error('Failed to cancel payment intent:', err)
    }
  }

  await sendSms(
    phone,
    `Your spot at ${room.name} has been released. No charge. Hope to see you at a future room.`
  )

  return twimlResponse()
}

async function handleGeneralMessage(
  supabase: ReturnType<typeof createAdminClient>,
  user: User,
  message: string,
  phone: string
) {
  // Check if this is a feedback response
  const { data: lastOutbound } = await supabase
    .from('sms_conversations')
    .select('*')
    .eq('user_id', user.id)
    .eq('direction', 'outbound')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (lastOutbound?.context === 'feedback_request' || lastOutbound?.context === 'feedback_followup') {
    // Store feedback response
    await supabase.from('sms_conversations').insert({
      user_id: user.id,
      direction: 'inbound',
      message: message,
      context: 'feedback_response',
      room_id: lastOutbound.room_id,
    })

    // For MVP, just acknowledge
    await sendSms(phone, "Thanks for sharing. Your feedback helps make SMS better.")
    return twimlResponse()
  }

  // General message - log for human review
  await supabase.from('sms_conversations').insert({
    user_id: user.id,
    direction: 'inbound',
    message: message,
    context: 'general',
  })

  // Auto-reply
  await sendSms(
    phone,
    `Thanks for your message. A real human will get back to you soon.\n\nFor quick actions, try: ACCEPT, DECLINE, CANCEL, or HELP.`
  )

  return twimlResponse()
}

// Return empty TwiML response (we send SMS via API, not TwiML)
function twimlResponse() {
  return new NextResponse(
    `<?xml version="1.0" encoding="UTF-8"?><Response></Response>`,
    {
      status: 200,
      headers: {
        'Content-Type': 'text/xml',
      },
    }
  )
}
