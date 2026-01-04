import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { capturePayment, cancelPaymentIntent } from '@/lib/stripe/client'

// POST /api/cron/capture-payments
// Vercel Cron: runs daily
// Captures payments for attended guests, releases holds for no-shows
export async function POST(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createAdminClient()
    const now = new Date()

    // Find completed spaces where we need to process payments
    // Look for spaces that completed more than 2 hours ago (buffer for check-ins)
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000)

    // Get invitations that:
    // 1. Have a payment intent
    // 2. Are accepted
    // 3. Haven't been captured yet
    // 4. Space is completed
    const { data: invitations, error } = await supabase
      .from('invitations')
      .select(`
        id,
        stripe_payment_intent_id,
        attended,
        captured,
        amount_cents,
        user_id,
        space_id
      `)
      .eq('status', 'accepted')
      .eq('captured', false)
      .not('stripe_payment_intent_id', 'is', null)

    if (error) {
      console.error('Error fetching invitations:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!invitations || invitations.length === 0) {
      return NextResponse.json({
        message: 'No payments to process',
        captured: 0,
        released: 0
      })
    }

    let captured = 0
    let released = 0
    let errors = 0
    const results: { id: string; action: string; error?: string }[] = []

    for (const invitation of invitations) {
      if (!invitation.stripe_payment_intent_id || !invitation.space_id) continue

      // Fetch the space details
      const { data: space } = await supabase
        .from('spaces')
        .select('id, name, date, time, duration_minutes, status')
        .eq('id', invitation.space_id)
        .single()

      if (!space) continue

      // Check if space has ended
      const spaceStart = new Date(`${space.date}T${space.time}`)
      const spaceEnd = new Date(spaceStart.getTime() + (space.duration_minutes || 120) * 60 * 1000)

      // Skip if space hasn't ended yet
      if (spaceEnd > twoHoursAgo) {
        continue
      }

      try {
        if (invitation.attended === true) {
          // Guest attended - capture the payment
          await capturePayment(invitation.stripe_payment_intent_id)

          // Update database
          await supabase
            .from('invitations')
            .update({
              captured: true,
              captured_at: new Date().toISOString()
            })
            .eq('id', invitation.id)

          captured++
          results.push({ id: invitation.id, action: 'captured' })
          console.log(`Captured payment for invitation ${invitation.id}`)

        } else if (invitation.attended === false) {
          // Guest was marked as no-show - release the hold (no charge)
          // Policy: We don't charge no-shows, but their trust score takes a hit
          await cancelPaymentIntent(invitation.stripe_payment_intent_id)

          // Update database
          await supabase
            .from('invitations')
            .update({
              captured: true, // Mark as processed
              captured_at: new Date().toISOString()
            })
            .eq('id', invitation.id)

          // Update user's no-show count
          if (invitation.user_id) {
            // Fetch current no_shows and increment
            const { data: userData } = await supabase
              .from('users')
              .select('no_shows')
              .eq('id', invitation.user_id)
              .single()

            if (userData) {
              await supabase
                .from('users')
                .update({ no_shows: (userData.no_shows || 0) + 1 })
                .eq('id', invitation.user_id)
            }
          }

          released++
          results.push({ id: invitation.id, action: 'released_noshow' })
          console.log(`Released payment for no-show invitation ${invitation.id}`)

        } else {
          // Attendance not marked (null) - space ended but host didn't check in guests
          // Default: capture payment (assume they attended if not marked otherwise)
          // This incentivizes hosts to actually check in guests
          await capturePayment(invitation.stripe_payment_intent_id)

          await supabase
            .from('invitations')
            .update({
              captured: true,
              captured_at: new Date().toISOString(),
              attended: true, // Assume attended if not marked
              marked_at: new Date().toISOString()
            })
            .eq('id', invitation.id)

          captured++
          results.push({ id: invitation.id, action: 'captured_unmarked' })
          console.log(`Captured payment for unmarked invitation ${invitation.id} (assumed attended)`)
        }

      } catch (err) {
        console.error(`Error processing invitation ${invitation.id}:`, err)
        errors++
        results.push({
          id: invitation.id,
          action: 'error',
          error: err instanceof Error ? err.message : 'Unknown error'
        })
      }
    }

    return NextResponse.json({
      message: 'Payment capture completed',
      captured,
      released,
      errors,
      results,
    })
  } catch (err) {
    console.error('Capture payments cron error:', err)
    return NextResponse.json({ error: 'Cron job failed' }, { status: 500 })
  }
}

// Allow GET for manual testing
export async function GET(request: NextRequest) {
  return POST(request)
}
