import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { sendSms } from '@/lib/twilio/client'
import { locationRevealMessage, hostLocationReminderMessage } from '@/lib/twilio/messages'

// POST /api/cron/location-reveal
// Vercel Cron: runs hourly
// Sends full address to accepted guests 24 hours before room
export async function POST(request: NextRequest) {
  try {
    // Verify cron secret (Vercel sends this header)
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createAdminClient()

    // Find rooms happening in approximately 24 hours
    // Window: 23-25 hours from now to account for hourly cron
    const now = new Date()
    const min24h = new Date(now.getTime() + 23 * 60 * 60 * 1000)
    const max24h = new Date(now.getTime() + 25 * 60 * 60 * 1000)

    // Get rooms in the window that haven't had location revealed
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
          user:users (
            id,
            name,
            phone
          )
        )
      `)
      .in('status', ['open', 'full', 'confirmed'])
      .eq('location_revealed', false)
      .gte('date', min24h.toISOString().split('T')[0])
      .lte('date', max24h.toISOString().split('T')[0])

    if (error) {
      console.error('Error fetching rooms:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!rooms || rooms.length === 0) {
      return NextResponse.json({ message: 'No rooms need location reveal', processed: 0 })
    }

    let processed = 0
    let errors = 0

    for (const room of rooms) {
      // Check if room time is actually in the 24h window
      const roomDateTime = new Date(`${room.date}T${room.time}`)
      const hoursUntilRoom = (roomDateTime.getTime() - now.getTime()) / (1000 * 60 * 60)

      if (hoursUntilRoom < 23 || hoursUntilRoom > 25) {
        continue
      }

      try {
        // Send to all accepted guests
        const acceptedGuests = room.invitations?.filter(
          (inv: { status: string }) => inv.status === 'accepted'
        ) || []

        for (const invitation of acceptedGuests) {
          const guest = invitation.user
          if (!guest?.phone) continue

          const msg = locationRevealMessage({
            roomName: room.name,
            date: roomDateTime,
            time: room.time,
            address: room.location_address,
            hostName: room.host?.name || 'Your host',
          })

          await sendSms(guest.phone, msg)

          // Log outbound
          await supabase.from('sms_conversations').insert({
            user_id: guest.id,
            direction: 'outbound',
            message: msg,
            context: 'location_reveal',
            room_id: room.id,
          })
        }

        // Send reminder to host
        if (room.host?.phone) {
          const hostMsg = hostLocationReminderMessage({
            roomName: room.name,
            guestCount: acceptedGuests.length,
            date: roomDateTime,
            time: room.time,
          })

          await sendSms(room.host.phone, hostMsg)
        }

        // Mark location as revealed
        await supabase
          .from('rooms')
          .update({ location_revealed: true })
          .eq('id', room.id)

        processed++
      } catch (err) {
        console.error(`Error processing room ${room.id}:`, err)
        errors++
      }
    }

    return NextResponse.json({
      message: `Location reveal processed`,
      processed,
      errors,
    })
  } catch (err) {
    console.error('Location reveal cron error:', err)
    return NextResponse.json({ error: 'Cron job failed' }, { status: 500 })
  }
}

// Allow GET for manual testing
export async function GET(request: NextRequest) {
  return POST(request)
}
