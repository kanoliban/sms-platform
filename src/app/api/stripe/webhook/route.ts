import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createAdminClient } from '@/lib/supabase/server'
import { sendSms } from '@/lib/twilio/client'
import { confirmationAfterPaymentMessage } from '@/lib/twilio/messages'

// Lazy-load stripe to avoid initialization during build
let _stripe: Stripe | null = null

function getStripe(): Stripe {
  if (!_stripe) {
    const secretKey = process.env.STRIPE_SECRET_KEY
    if (!secretKey) {
      throw new Error('STRIPE_SECRET_KEY not configured')
    }
    _stripe = new Stripe(secretKey, {
      apiVersion: '2025-12-15.clover',
    })
  }
  return _stripe
}

// POST /api/stripe/webhook - Handle Stripe events
export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
    }

    let event: Stripe.Event

    try {
      event = getStripe().webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      )
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    const supabase = createAdminClient()

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        await handlePaymentSuccess(supabase, paymentIntent)
        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        await handlePaymentFailure(supabase, paymentIntent)
        break
      }

      case 'payment_intent.canceled': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        await handlePaymentCanceled(supabase, paymentIntent)
        break
      }

      case 'charge.captured': {
        // Payment was captured (after space completion)
        const charge = event.data.object as Stripe.Charge
        console.log('Payment captured:', charge.id)
        break
      }

      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        await handleCheckoutComplete(supabase, session)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error('Stripe webhook error:', err)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}

async function handlePaymentSuccess(
  supabase: ReturnType<typeof createAdminClient>,
  paymentIntent: Stripe.PaymentIntent
) {
  const invitationId = paymentIntent.metadata?.invitation_id
  if (!invitationId) return

  // Payment authorized - update invitation
  const { data: invitation } = await supabase
    .from('invitations')
    .select('*, user:users(*), space:spaces(*)')
    .eq('id', invitationId)
    .single()

  if (!invitation) {
    console.error('Invitation not found for payment:', invitationId)
    return
  }

  // Send confirmation
  const user = invitation.user
  const space = invitation.space

  if (user?.phone) {
    const msg = confirmationAfterPaymentMessage({
      spaceName: space.name,
      date: new Date(space.date),
      time: space.time,
      locationHint: space.location_hint || 'Location will be sent 24h before',
    })

    await sendSms(user.phone, msg)

    await supabase.from('sms_conversations').insert({
      user_id: user.id,
      direction: 'outbound',
      message: msg,
      context: 'payment_confirmation',
      space_id: space.id,
    })
  }
}

async function handlePaymentFailure(
  supabase: ReturnType<typeof createAdminClient>,
  paymentIntent: Stripe.PaymentIntent
) {
  const invitationId = paymentIntent.metadata?.invitation_id
  if (!invitationId) return

  const { data: invitation } = await supabase
    .from('invitations')
    .select('*, user:users(*), space:spaces(*)')
    .eq('id', invitationId)
    .single()

  if (!invitation) return

  // Revert to sent status so they can try again
  await supabase
    .from('invitations')
    .update({ status: 'sent' })
    .eq('id', invitationId)

  const user = invitation.user
  const space = invitation.space

  if (user?.phone) {
    await sendSms(
      user.phone,
      `Your payment for ${space.name} didn't go through. Reply ACCEPT to try again, or contact us if you need help.`
    )
  }
}

async function handlePaymentCanceled(
  supabase: ReturnType<typeof createAdminClient>,
  paymentIntent: Stripe.PaymentIntent
) {
  const invitationId = paymentIntent.metadata?.invitation_id
  if (!invitationId) return

  // Payment was canceled (user canceled or we released)
  console.log('Payment intent canceled:', paymentIntent.id, 'for invitation:', invitationId)
}

async function handleCheckoutComplete(
  supabase: ReturnType<typeof createAdminClient>,
  session: Stripe.Checkout.Session
) {
  const invitationId = session.metadata?.invitation_id
  if (!invitationId) return

  // Checkout completed - update invitation to accepted
  const { data: invitation } = await supabase
    .from('invitations')
    .select('*, user:users(*), space:spaces(*)')
    .eq('id', invitationId)
    .single()

  if (!invitation) return

  await supabase
    .from('invitations')
    .update({
      status: 'accepted',
      stripe_payment_intent_id: session.payment_intent as string,
    })
    .eq('id', invitationId)

  const user = invitation.user
  const space = invitation.space

  if (user?.phone) {
    const msg = confirmationAfterPaymentMessage({
      spaceName: space.name,
      date: new Date(space.date),
      time: space.time,
      locationHint: space.location_hint || 'Location will be sent 24h before',
    })

    await sendSms(user.phone, msg)
  }
}
