import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { sendSms } from '@/lib/twilio/client'
import { locationRevealMessage, hostLocationReminderMessage } from '@/lib/twilio/messages'

// POST /api/cron/location-reveal
// Vercel Cron: runs every 15 minutes (*/15 * * * *)
// Handles multiple space lifecycle tasks:
// 1. Location reveal - send address to guests 24h before
// 2. Pocket Liban - send prompts to hosts at scheduled times
// 3. Auto-complete - mark spaces as completed after they end
export async function POST(request: NextRequest) {
  try {
    // Verify cron secret (Vercel sends this header)
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createAdminClient()

    // Find spaces happening in approximately 24 hours
    // Window: 23-25 hours from now to account for hourly cron
    const now = new Date()
    const min24h = new Date(now.getTime() + 23 * 60 * 60 * 1000)
    const max24h = new Date(now.getTime() + 25 * 60 * 60 * 1000)

    // Get spaces in the window that haven't had location revealed
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
      console.error('Error fetching spaces:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!spaces || spaces.length === 0) {
      return NextResponse.json({ message: 'No spaces need location reveal', processed: 0 })
    }

    let processed = 0
    let errors = 0

    for (const space of spaces) {
      // Check if space time is actually in the 24h window
      const spaceDateTime = new Date(`${space.date}T${space.time}`)
      const hoursUntilSpace = (spaceDateTime.getTime() - now.getTime()) / (1000 * 60 * 60)

      if (hoursUntilSpace < 23 || hoursUntilSpace > 25) {
        continue
      }

      try {
        // Send to all accepted guests
        const acceptedGuests = space.invitations?.filter(
          (inv: { status: string }) => inv.status === 'accepted'
        ) || []

        for (const invitation of acceptedGuests) {
          const guest = invitation.user
          if (!guest?.phone) continue

          const msg = locationRevealMessage({
            spaceName: space.name,
            date: spaceDateTime,
            time: space.time,
            address: space.location_address,
            hostName: space.host?.name || 'Your host',
          })

          await sendSms(guest.phone, msg)

          // Log outbound
          await supabase.from('sms_conversations').insert({
            user_id: guest.id,
            direction: 'outbound',
            message: msg,
            context: 'location_reveal',
            space_id: space.id,
          })
        }

        // Send reminder to host
        if (space.host?.phone) {
          const hostMsg = hostLocationReminderMessage({
            spaceName: space.name,
            guestCount: acceptedGuests.length,
            date: spaceDateTime,
            time: space.time,
          })

          await sendSms(space.host.phone, hostMsg)
        }

        // Mark location as revealed
        await supabase
          .from('spaces')
          .update({ location_revealed: true })
          .eq('id', space.id)

        processed++
      } catch (err) {
        console.error(`Error processing space ${space.id}:`, err)
        errors++
      }
    }

    // --- Pocket Liban: Send host prompts ---
    const { data: prompts, error: promptsError } = await supabase
      .from('host_prompts')
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
      .eq('sent', false)
      .lte('send_at', now.toISOString())
      .order('send_at', { ascending: true })

    let promptsSent = 0
    if (!promptsError && prompts) {
      for (const prompt of prompts) {
        const space = prompt.space
        const host = space?.host

        // Skip if space is canceled or completed
        if (space?.status === 'canceled' || space?.status === 'completed') {
          await supabase
            .from('host_prompts')
            .update({ sent: true })
            .eq('id', prompt.id)
          continue
        }

        if (!host?.phone) continue

        try {
          await sendSms(host.phone, prompt.message)

          await supabase
            .from('host_prompts')
            .update({ sent: true })
            .eq('id', prompt.id)

          await supabase.from('sms_conversations').insert({
            user_id: host.id,
            direction: 'outbound',
            message: prompt.message,
            context: `pocket_liban_${prompt.prompt_type}`,
            space_id: space.id,
          })

          promptsSent++
        } catch (err) {
          console.error(`Error sending prompt ${prompt.id}:`, err)
        }
      }
    }

    // --- Auto-complete spaces that have ended ---
    // Find spaces that are past their end time and still in active status
    const { data: endedSpaces, error: endedError } = await supabase
      .from('spaces')
      .select('id, date, time, duration_hours')
      .in('status', ['open', 'full', 'confirmed'])

    let completedCount = 0
    if (!endedError && endedSpaces) {
      for (const space of endedSpaces) {
        const startTime = new Date(`${space.date}T${space.time}`)
        const durationHours = space.duration_hours || 3 // Default 3 hours if not set
        const endTime = new Date(startTime.getTime() + durationHours * 60 * 60 * 1000)

        // If end time has passed, mark as completed
        if (now > endTime) {
          const { error: updateError } = await supabase
            .from('spaces')
            .update({ status: 'completed' })
            .eq('id', space.id)

          if (!updateError) {
            completedCount++
            console.log(`Auto-completed space ${space.id}`)
          }
        }
      }
    }

    return NextResponse.json({
      message: `Space lifecycle processed`,
      locationReveals: processed,
      errors,
      promptsSent,
      autoCompleted: completedCount,
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
