import Stripe from 'stripe'

// Lazy-load client to avoid initialization during build
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

interface PaymentIntentMetadata {
  invitation_id: string
  space_id: string
  user_id: string
  user_phone: string
  [key: string]: string  // Index signature for Stripe metadata
}

// Create a payment intent (authorize only, don't capture)
export async function createPaymentIntent(
  amountCents: number,
  metadata: PaymentIntentMetadata
): Promise<Stripe.PaymentIntent> {
  return getStripe().paymentIntents.create({
    amount: amountCents,
    currency: 'usd',
    capture_method: 'manual', // Authorize only, capture later
    metadata,
    description: `SMS Room - ${metadata.space_id}`,
  })
}

// Create a Checkout Session for payment
export async function createCheckoutSession(
  amountCents: number,
  metadata: PaymentIntentMetadata,
  successUrl: string,
  cancelUrl: string
): Promise<Stripe.Checkout.Session> {
  return getStripe().checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          unit_amount: amountCents,
          product_data: {
            name: 'SMS Room Reservation',
            description: 'Your card will only be charged after you attend.',
          },
        },
        quantity: 1,
      },
    ],
    payment_intent_data: {
      capture_method: 'manual',
      metadata,
    },
    metadata,
    success_url: successUrl,
    cancel_url: cancelUrl,
  })
}

// Capture an authorized payment (after guest attends)
export async function capturePayment(
  paymentIntentId: string
): Promise<Stripe.PaymentIntent> {
  return getStripe().paymentIntents.capture(paymentIntentId)
}

// Cancel a payment intent (guest cancels or no-show without charge)
export async function cancelPaymentIntent(
  paymentIntentId: string
): Promise<Stripe.PaymentIntent> {
  return getStripe().paymentIntents.cancel(paymentIntentId)
}

// Refund a captured payment
export async function refundPayment(
  paymentIntentId: string,
  amountCents?: number
): Promise<Stripe.Refund> {
  return getStripe().refunds.create({
    payment_intent: paymentIntentId,
    amount: amountCents, // If undefined, refunds full amount
  })
}

// Get payment intent details
export async function getPaymentIntent(
  paymentIntentId: string
): Promise<Stripe.PaymentIntent> {
  return getStripe().paymentIntents.retrieve(paymentIntentId)
}

// Platform fee calculation (for future host payouts)
export function calculatePlatformFee(amountCents: number): {
  platformFee: number
  hostPayout: number
  stripeFee: number
  total: number
} {
  // Platform takes 15%
  const platformFeeRate = 0.15
  const platformFee = Math.round(amountCents * platformFeeRate)

  // Stripe fee: 2.9% + $0.30
  const stripeFee = Math.round(amountCents * 0.029 + 30)

  // Host gets the rest
  const hostPayout = amountCents - platformFee - stripeFee

  return {
    platformFee,
    hostPayout,
    stripeFee,
    total: amountCents,
  }
}
