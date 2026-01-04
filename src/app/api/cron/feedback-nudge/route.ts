import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { sendSms } from '@/lib/twilio/client'

// POST /api/cron/feedback-nudge
// Vercel Cron: runs daily at 10 AM (0 10 * * *)
// Sends feedback requests to guests the day after a space
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createAdminClient()
    const now = new Date()

    // Get yesterday's date
    const yesterday = new Date(now)
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]

    // Find completed spaces from yesterday
    const { data: spaces, error } = await supabase
      .from('spaces')
      .select(`
        id,
        name,
        date,
        host_id,
        invitations (
          id,
          user_id,
          status,
          attended,
          feedback_requested,
          user:users (
            id,
            name,
            phone
          )
        )
      `)
      .eq('date', yesterdayStr)
      .eq('status', 'completed')

    if (error) {
      console.error('Error fetching spaces:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    let nudgesSent = 0
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://strangersmeetingstrangers.com'

    for (const space of spaces || []) {
      // Get guests who attended and haven't been asked for feedback
      const eligibleGuests = space.invitations?.filter(
        (inv: { status: string; attended: boolean | null; feedback_requested: boolean | null }) =>
          inv.status === 'accepted' &&
          inv.attended === true &&
          !inv.feedback_requested
      ) || []

      for (const invitation of eligibleGuests) {
        const guest = invitation.user as { id: string; name: string | null; phone: string }[] | null
        const guestData = guest?.[0]
        if (!guestData?.phone) continue

        const feedbackUrl = `${baseUrl}/spaces/${space.id}/feedback?invitation=${invitation.id}`

        const message = `Hey${guestData.name ? ` ${guestData.name}` : ''}! Thanks for joining ${space.name} yesterday. Your feedback helps make future spaces better.\n\nShare your thoughts: ${feedbackUrl}`

        try {
          await sendSms(guestData.phone, message)

          // Mark as feedback requested
          await supabase
            .from('invitations')
            .update({ feedback_requested: true })
            .eq('id', invitation.id)

          // Log the outbound message
          await supabase.from('sms_conversations').insert({
            user_id: guestData.id,
            direction: 'outbound',
            message: message,
            context: 'feedback_request',
            space_id: space.id,
          })

          // Create notification
          await supabase.from('notifications').insert({
            user_id: guestData.id,
            type: 'feedback',
            title: 'Share Your Feedback',
            message: `How was ${space.name}? We'd love to hear your thoughts.`,
            space_id: space.id,
          })

          nudgesSent++
        } catch (err) {
          console.error(`Error sending feedback nudge to ${guestData.id}:`, err)
        }
      }
    }

    return NextResponse.json({
      message: 'Feedback nudges sent',
      spacesProcessed: spaces?.length || 0,
      nudgesSent,
    })
  } catch (err) {
    console.error('Feedback nudge cron error:', err)
    return NextResponse.json({ error: 'Cron job failed' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  return POST(request)
}
