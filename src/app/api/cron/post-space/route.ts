import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { sendSms } from '@/lib/twilio/client'
import { guestFeedbackRequest, hostFeedbackRequest } from '@/lib/twilio/messages'

// POST /api/cron/post-space
// Vercel Cron: runs hourly
// Sends feedback requests after spaces complete
export async function POST(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createAdminClient()
    const now = new Date()

    // Find completed spaces that haven't sent feedback requests
    // Look for spaces that ended 1-2 hours ago
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000)

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
      message: 'Post-space feedback requests processed',
      processed,
      errors,
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
