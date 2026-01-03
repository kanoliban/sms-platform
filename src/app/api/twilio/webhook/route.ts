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
import type { Invitation, Space, User } from '@/lib/supabase/types'

// Type for invitation with joined space data
type InvitationWithSpace = Invitation & {
  space: Space & {
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
        "SMS: We don't recognize this number. If you were invited to a space, please wait for an invitation."
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
        space:spaces (
          *,
          host:users!spaces_host_id_fkey (
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
  invitation: InvitationWithSpace | null,
  phone: string
) {
  if (!invitation) {
    await sendSms(phone, "We couldn't find a pending invitation for you. If you believe this is an error, reply HELP.")
    return twimlResponse()
  }

  const space = invitation.space as Space & { host: Pick<User, 'id' | 'name' | 'phone'> }

  // Check space capacity
  const { count: acceptedCount } = await supabase
    .from('invitations')
    .select('*', { count: 'exact', head: true })
    .eq('space_id', space.id)
    .eq('status', 'accepted')

  if (acceptedCount && acceptedCount >= space.capacity) {
    await sendSms(
      phone,
      `Unfortunately, ${space.name} is now full. We'll let you know if a spot opens up.`
    )
    return twimlResponse()
  }

  // Create Stripe PaymentIntent (authorize only, don't capture)
  try {
    const paymentIntent = await createPaymentIntent(space.price_cents, {
      invitation_id: invitation.id,
      space_id: space.id,
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
        amount_cents: space.price_cents,
      })
      .eq('id', invitation.id)

    // For MVP, we'll send a confirmation without requiring payment link click
    // In production, you'd send a Stripe Checkout link
    const confirmationMsg = acceptedMessage({
      spaceName: space.name,
      date: new Date(space.date),
      time: space.time,
    })

    await sendSms(phone, confirmationMsg)

    // Log outbound
    await supabase.from('sms_conversations').insert({
      user_id: user.id,
      direction: 'outbound',
      message: confirmationMsg,
      context: 'acceptance_confirmation',
      space_id: space.id,
    })

    // Notify host
    if (space.host?.phone) {
      await sendSms(
        space.host.phone,
        `SMS: ${user.name || phone} just accepted their invitation to ${space.name}!`
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
  invitation: InvitationWithSpace | null,
  phone: string
) {
  if (!invitation) {
    await sendSms(phone, "We couldn't find a pending invitation for you.")
    return twimlResponse()
  }

  const space = invitation.space as Space

  // Update invitation
  await supabase
    .from('invitations')
    .update({
      status: 'declined',
      responded_at: new Date().toISOString(),
    })
    .eq('id', invitation.id)

  const msg = declinedMessage({ spaceName: space.name })
  await sendSms(phone, msg)

  // Log outbound
  await supabase.from('sms_conversations').insert({
    user_id: user.id,
    direction: 'outbound',
    message: msg,
    context: 'decline_confirmation',
    space_id: space.id,
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
    .select('*, space:spaces(*)')
    .eq('user_id', user.id)
    .eq('status', 'accepted')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (!invitation) {
    await sendSms(phone, "You don't have any accepted invitations to cancel.")
    return twimlResponse()
  }

  const space = invitation.space as Space
  const spaceDate = new Date(`${space.date}T${space.time}`)
  const now = new Date()
  const hoursUntilSpace = (spaceDate.getTime() - now.getTime()) / (1000 * 60 * 60)

  if (hoursUntilSpace < 48) {
    await sendSms(
      phone,
      `Cancellations must be made 48+ hours before the space. ${space.name} is in ${Math.round(hoursUntilSpace)} hours. Your card will still be charged if you don't attend.`
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
    `Your spot at ${space.name} has been released. No charge. Hope to see you at a future space.`
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
      space_id: lastOutbound.space_id,
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
