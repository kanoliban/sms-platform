import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { sendSms } from '@/lib/twilio/client'
import { guestFeedbackRequest, hostFeedbackRequest } from '@/lib/twilio/messages'

// POST /api/cron/post-room
// Vercel Cron: runs hourly
// Sends feedback requests after rooms complete
export async function POST(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createAdminClient()
    const now = new Date()

    // Find completed rooms that haven't sent feedback requests
    // Look for rooms that ended 1-2 hours ago
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000)

    // Get rooms that should have ended by now
    const { data: rooms, error } = await supabase
      .from('rooms')
      .select(`
        *,
        host:users!rooms_host_id_fkey (
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
      console.error('Error fetching rooms:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!rooms || rooms.length === 0) {
      return NextResponse.json({ message: 'No rooms need feedback requests', processed: 0 })
    }

    let processed = 0
    let errors = 0

    for (const room of rooms) {
      try {
        // Check if room actually ended (based on date/time/duration)
        const roomStart = new Date(`${room.date}T${room.time}`)
        const roomEnd = new Date(roomStart.getTime() + (room.duration_minutes || 120) * 60 * 1000)

        // Skip if room hasn't ended yet
        if (roomEnd > now) continue

        // Skip if room ended too long ago (more than 24 hours)
        const hoursSinceEnd = (now.getTime() - roomEnd.getTime()) / (1000 * 60 * 60)
        if (hoursSinceEnd > 24) {
          // Mark as sent to skip in future
          await supabase
            .from('rooms')
            .update({ feedback_requested: true })
            .eq('id', room.id)
          continue
        }

        // Send feedback to host
        if (room.host?.phone) {
          const hostMsg = hostFeedbackRequest(room.name)
          await sendSms(room.host.phone, hostMsg)

          await supabase.from('sms_conversations').insert({
            user_id: room.host.id,
            direction: 'outbound',
            message: hostMsg,
            context: 'feedback_request',
            room_id: room.id,
          })
        }

        // Send feedback to guests who attended
        const attendedGuests = room.invitations?.filter(
          (inv: { attended: boolean | null }) => inv.attended === true
        ) || []

        for (const invitation of attendedGuests) {
          const guest = invitation.user
          if (!guest?.phone) continue

          const guestMsg = guestFeedbackRequest({
            roomName: room.name,
            guestName: guest.name || 'there',
          })

          await sendSms(guest.phone, guestMsg)

          await supabase.from('sms_conversations').insert({
            user_id: guest.id,
            direction: 'outbound',
            message: guestMsg,
            context: 'feedback_request',
            room_id: room.id,
          })
        }

        // Mark feedback as requested
        await supabase
          .from('rooms')
          .update({ feedback_requested: true })
          .eq('id', room.id)

        processed++
        console.log(`Sent feedback requests for room ${room.id}`)
      } catch (err) {
        console.error(`Error processing room ${room.id}:`, err)
        errors++
      }
    }

    return NextResponse.json({
      message: 'Post-room feedback requests processed',
      processed,
      errors,
    })
  } catch (err) {
    console.error('Post-room cron error:', err)
    return NextResponse.json({ error: 'Cron job failed' }, { status: 500 })
  }
}

// Allow GET for manual testing
export async function GET(request: NextRequest) {
  return POST(request)
}
