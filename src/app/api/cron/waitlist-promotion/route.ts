import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { sendSms } from '@/lib/twilio/client'
import { contractInviteMessage } from '@/lib/twilio/messages'
import { sendWaitlistNotification } from '@/lib/email'

// POST /api/cron/waitlist-promotion
// Vercel Cron: runs every 15 minutes (*/15 * * * *)
// Auto-invites waitlisted guests when spots open up (cancellations)
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createAdminClient()
    const now = new Date()

    // Find open spaces with available capacity
    const { data: spaces, error } = await supabase
      .from('spaces')
      .select(`
        id,
        name,
        date,
        time,
        capacity,
        price_cents,
        location_hint,
        host_id,
        status,
        host:users!host_id (
          id,
          name
        ),
        invitations (
          id,
          status,
          user_id,
          waitlist_position,
          user:users (
            id,
            name,
            phone
          )
        )
      `)
      .in('status', ['open', 'full'])
      .gte('date', now.toISOString().split('T')[0])

    if (error) {
      console.error('Error fetching spaces:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    let promoted = 0
    let spacesUpdated = 0

    for (const space of spaces || []) {
      const invitations = space.invitations || []

      // Count accepted guests
      const acceptedCount = invitations.filter(
        (inv: { status: string }) => inv.status === 'accepted'
      ).length

      // Calculate available spots
      const availableSpots = space.capacity - acceptedCount

      if (availableSpots <= 0) continue

      // Get waitlisted users, sorted by position (FIFO)
      const waitlisted = invitations
        .filter((inv: { status: string }) => inv.status === 'waitlisted')
        .sort((a: { waitlist_position?: number }, b: { waitlist_position?: number }) =>
          (a.waitlist_position || 999) - (b.waitlist_position || 999)
        )
        .slice(0, availableSpots)

      if (waitlisted.length === 0) continue

      const spaceDate = new Date(`${space.date}T${space.time}`)

      for (const invitation of waitlisted) {
        const guestArr = invitation.user as { id: string; name: string | null; phone: string }[] | null
        const guest = guestArr?.[0]
        if (!guest?.phone) continue

        try {
          // Promote to 'sent' status
          await supabase
            .from('invitations')
            .update({
              status: 'sent',
              waitlist_position: null,
              promoted_from_waitlist: true,
              promoted_at: new Date().toISOString(),
            })
            .eq('id', invitation.id)

          // Send invitation SMS
          const msg = contractInviteMessage({
            spaceName: space.name,
            hostName: (space.host as unknown as { name?: string })?.name || 'Your host',
            date: spaceDate,
            time: space.time,
            locationHint: space.location_hint || 'Location revealed 24h before',
            priceDollars: space.price_cents / 100,
          })

          await sendSms(guest.phone, `🎉 A spot opened up!\n\n${msg}`)

          // Log outbound
          await supabase.from('sms_conversations').insert({
            user_id: guest.id,
            direction: 'outbound',
            message: msg,
            context: 'waitlist_promotion',
            space_id: space.id,
          })

          // Send waitlist email as backup
          const guestEmail = (guest as { email?: string }).email
          if (guestEmail) {
            try {
              const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://strangersmeetingstrangers.com'
              await sendWaitlistNotification(guestEmail, guest.name || 'Guest', {
                title: space.name,
                date: spaceDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }),
                time: space.time,
                rsvpUrl: `${baseUrl}/spaces/${space.id}`,
              })
            } catch (emailErr) {
              console.error('Failed to send waitlist email:', emailErr)
            }
          }

          // Create notification
          await supabase.from('notifications').insert({
            user_id: guest.id,
            type: 'waitlist',
            title: 'Spot Available!',
            message: `A spot opened up at ${space.name}! Reply ACCEPT to claim it.`,
            space_id: space.id,
          })

          // Notify host
          if (space.host_id) {
            await supabase.from('notifications').insert({
              user_id: space.host_id,
              type: 'waitlist',
              title: 'Waitlist Promoted',
              message: `${guest.name || 'Someone'} was promoted from the waitlist for ${space.name}`,
              space_id: space.id,
              actor_id: guest.id,
            })
          }

          promoted++
        } catch (err) {
          console.error(`Error promoting ${invitation.id}:`, err)
        }
      }

      // If space was full but now has room, update status to open
      const spaceStatus = (space as { status: string }).status
      if (spaceStatus === 'full' && promoted > 0) {
        const newAccepted = acceptedCount // Promoted users aren't accepted yet
        if (newAccepted < space.capacity) {
          await supabase
            .from('spaces')
            .update({ status: 'open' })
            .eq('id', space.id)
          spacesUpdated++
        }
      }
    }

    return NextResponse.json({
      message: 'Waitlist promotion completed',
      spacesChecked: spaces?.length || 0,
      promoted,
      spacesUpdated,
    })
  } catch (err) {
    console.error('Waitlist promotion cron error:', err)
    return NextResponse.json({ error: 'Cron job failed' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  return POST(request)
}
