import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { capturePayment } from '@/lib/stripe/client'
import { sendSms } from '@/lib/twilio/client'

// POST /api/cron/payment-retry
// Vercel Cron: runs every 30 minutes (*/30 * * * *)
// Retries failed payment captures and notifies on persistent failures
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createAdminClient()
    const now = new Date()

    // Find invitations that:
    // 1. Have a payment intent
    // 2. Are accepted
    // 3. Space is completed
    // 4. Not yet captured
    // 5. Have a capture_attempts count (meaning previous capture failed)
    const { data: invitations, error } = await supabase
      .from('invitations')
      .select(`
        id,
        stripe_payment_intent_id,
        attended,
        captured,
        capture_attempts,
        amount_cents,
        user_id,
        space_id,
        user:users (
          id,
          name,
          phone
        ),
        space:spaces (
          id,
          name,
          date,
          time,
          duration_minutes,
          status,
          host_id
        )
      `)
      .eq('status', 'accepted')
      .eq('captured', false)
      .not('stripe_payment_intent_id', 'is', null)
      .gt('capture_attempts', 0)
      .lt('capture_attempts', 5) // Stop after 5 attempts

    if (error) {
      console.error('Error fetching invitations:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    let retried = 0
    let succeeded = 0
    let failed = 0

    for (const invitation of invitations || []) {
      if (!invitation.stripe_payment_intent_id) continue

      const space = invitation.space as unknown as {
        id: string
        name: string
        date: string
        time: string
        duration_minutes: number
        status: string
        host_id: string
      } | null

      if (!space || space.status !== 'completed') continue

      try {
        await capturePayment(invitation.stripe_payment_intent_id)

        // Success! Update the invitation
        await supabase
          .from('invitations')
          .update({
            captured: true,
            captured_at: new Date().toISOString(),
          })
          .eq('id', invitation.id)

        succeeded++
        retried++

        // Notify host of successful retry
        await supabase.from('notifications').insert({
          user_id: space.host_id,
          type: 'payment',
          title: 'Payment Captured',
          message: `Payment retry successful for ${(invitation.user as { name?: string })?.name || 'a guest'} at ${space.name}`,
          space_id: space.id,
        })

      } catch (err) {
        console.error(`Retry failed for invitation ${invitation.id}:`, err)

        // Increment attempt count
        const attempts = (invitation.capture_attempts || 0) + 1
        await supabase
          .from('invitations')
          .update({ capture_attempts: attempts })
          .eq('id', invitation.id)

        failed++
        retried++

        // If this was the 5th attempt, notify host
        if (attempts >= 5) {
          await supabase.from('notifications').insert({
            user_id: space.host_id,
            type: 'payment',
            title: 'Payment Failed',
            message: `Unable to capture payment from ${(invitation.user as { name?: string })?.name || 'a guest'} for ${space.name} after 5 attempts. Manual intervention needed.`,
            space_id: space.id,
          })

          // Also notify guest
          const guestPhone = (invitation.user as { phone?: string })?.phone
          if (guestPhone) {
            await sendSms(
              guestPhone,
              `SMS: We had trouble processing your payment for ${space.name}. Please contact us to resolve this.`
            )
          }
        }
      }
    }

    return NextResponse.json({
      message: 'Payment retry completed',
      retried,
      succeeded,
      failed,
    })
  } catch (err) {
    console.error('Payment retry cron error:', err)
    return NextResponse.json({ error: 'Cron job failed' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  return POST(request)
}
