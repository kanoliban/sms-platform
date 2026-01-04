import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { sendSms } from '@/lib/twilio/client'
import { guestFeedbackRequest, hostFeedbackRequest } from '@/lib/twilio/messages'
import { sendPostEventFollowUp } from '@/lib/email'

// POST /api/cron/post-space
// Vercel Cron: runs daily
// 1. Updates space statuses (open/full → in_progress → completed)
// 2. Sends feedback requests after spaces complete
export async function POST(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createAdminClient()
    const now = new Date()

    // ========================================
    // STEP 1: Update space statuses
    // ========================================

    // Get all active spaces (open, full, confirmed, in_progress)
    const { data: activeSpaces, error: activeError } = await supabase
      .from('spaces')
      .select('id, date, time, duration_minutes, status')
      .in('status', ['open', 'full', 'confirmed', 'in_progress'])

    if (activeError) {
      console.error('Error fetching active spaces:', activeError)
    }

    let statusUpdates = { toInProgress: 0, toCompleted: 0 }

    if (activeSpaces) {
      for (const space of activeSpaces) {
        const spaceStart = new Date(`${space.date}T${space.time}`)
        const spaceEnd = new Date(spaceStart.getTime() + (space.duration_minutes || 120) * 60 * 1000)

        if (space.status !== 'in_progress' && space.status !== 'completed') {
          // Check if space should be in_progress
          if (spaceStart <= now && spaceEnd > now) {
            await supabase
              .from('spaces')
              .update({ status: 'in_progress' })
              .eq('id', space.id)
            statusUpdates.toInProgress++
            console.log(`Space ${space.id} → in_progress`)
          }
          // Check if space should be completed
          else if (spaceEnd <= now) {
            await supabase
              .from('spaces')
              .update({ status: 'completed' })
              .eq('id', space.id)
            statusUpdates.toCompleted++
            console.log(`Space ${space.id} → completed`)
          }
        }
        // Already in_progress - check if should be completed
        else if (space.status === 'in_progress' && spaceEnd <= now) {
          await supabase
            .from('spaces')
            .update({ status: 'completed' })
            .eq('id', space.id)
          statusUpdates.toCompleted++
          console.log(`Space ${space.id} → completed`)
        }
      }
    }

    // ========================================
    // STEP 2: Send feedback requests
    // ========================================

    // Get spaces that should have ended by now
    const { data: spaces, error } = await supabase
      .from('spaces')
      .select(`
        *,
        host:users!spaces_host_id_fkey (
          id,
          name,
          phone
        ),
        invitations (
          id,
          status,
          attended,
          user:users (
            id,
            name,
            phone
          )
        )
      `)
      .eq('status', 'completed')
      .eq('feedback_requested', false)

    if (error) {
      console.error('Error fetching spaces:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!spaces || spaces.length === 0) {
      return NextResponse.json({ message: 'No spaces need feedback requests', processed: 0 })
    }

    let processed = 0
    let errors = 0

    for (const space of spaces) {
      try {
        // Check if space actually ended (based on date/time/duration)
        const spaceStart = new Date(`${space.date}T${space.time}`)
        const spaceEnd = new Date(spaceStart.getTime() + (space.duration_minutes || 120) * 60 * 1000)

        // Skip if space hasn't ended yet
        if (spaceEnd > now) continue

        // Skip if space ended too long ago (more than 24 hours)
        const hoursSinceEnd = (now.getTime() - spaceEnd.getTime()) / (1000 * 60 * 60)
        if (hoursSinceEnd > 24) {
          // Mark as sent to skip in future
          await supabase
            .from('spaces')
            .update({ feedback_requested: true })
            .eq('id', space.id)
          continue
        }

        // Send feedback to host
        if (space.host?.phone) {
          const hostMsg = hostFeedbackRequest(space.name)
          await sendSms(space.host.phone, hostMsg)

          await supabase.from('sms_conversations').insert({
            user_id: space.host.id,
            direction: 'outbound',
            message: hostMsg,
            context: 'feedback_request',
            space_id: space.id,
          })
        }

        // Send feedback to guests who attended
        const attendedGuests = space.invitations?.filter(
          (inv: { attended: boolean | null }) => inv.attended === true
        ) || []

        for (const invitation of attendedGuests) {
          const guest = invitation.user
          if (!guest?.phone) continue

          const guestMsg = guestFeedbackRequest({
            spaceName: space.name,
            guestName: guest.name || 'there',
          })

          await sendSms(guest.phone, guestMsg)

          await supabase.from('sms_conversations').insert({
            user_id: guest.id,
            direction: 'outbound',
            message: guestMsg,
            context: 'feedback_request',
            space_id: space.id,
          })

          // Send feedback email as backup
          const guestEmail = (guest as { email?: string }).email
          if (guestEmail) {
            try {
              const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://strangersmeetingstrangers.com'
              await sendPostEventFollowUp(guestEmail, guest.name || 'Guest', {
                title: space.name,
                feedbackUrl: `${baseUrl}/feedback/${space.id}`,
              })
            } catch (emailErr) {
              console.error('Failed to send feedback email:', emailErr)
            }
          }
        }

        // Mark feedback as requested
        await supabase
          .from('spaces')
          .update({ feedback_requested: true })
          .eq('id', space.id)

        processed++
        console.log(`Sent feedback requests for space ${space.id}`)
      } catch (err) {
        console.error(`Error processing space ${space.id}:`, err)
        errors++
      }
    }

    return NextResponse.json({
      message: 'Post-space processing completed',
      statusUpdates,
      feedbackRequests: { processed, errors },
    })
  } catch (err) {
    console.error('Post-space cron error:', err)
    return NextResponse.json({ error: 'Cron job failed' }, { status: 500 })
  }
}

// Allow GET for manual testing
export async function GET(request: NextRequest) {
  return POST(request)
}
