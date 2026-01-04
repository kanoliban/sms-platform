import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

// POST /api/cron/gap-alerts
// Vercel Cron: runs every 5 minutes (*/5 * * * *)
// Alerts hosts when their space has cancellations or low RSVP rates
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createAdminClient()
    const now = new Date()

    // Find open spaces happening in the next 7 days
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

    const { data: spaces, error } = await supabase
      .from('spaces')
      .select(`
        id,
        name,
        date,
        time,
        capacity,
        host_id,
        invitations (
          id,
          status
        )
      `)
      .in('status', ['open', 'confirmed'])
      .gte('date', now.toISOString().split('T')[0])
      .lte('date', nextWeek.toISOString().split('T')[0])

    if (error) {
      console.error('Error fetching spaces:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    let alertsSent = 0

    for (const space of spaces || []) {
      const acceptedCount = space.invitations?.filter(
        (inv: { status: string }) => inv.status === 'accepted'
      ).length || 0

      const fillRate = acceptedCount / space.capacity
      const spaceDate = new Date(`${space.date}T${space.time}`)
      const hoursUntil = (spaceDate.getTime() - now.getTime()) / (1000 * 60 * 60)

      // Alert conditions:
      // 1. Less than 48h away and under 50% capacity
      // 2. Less than 24h away and under 75% capacity
      let shouldAlert = false
      let alertMessage = ''

      if (hoursUntil <= 24 && fillRate < 0.75) {
        shouldAlert = true
        alertMessage = `${space.name} is tomorrow with only ${acceptedCount}/${space.capacity} guests. Consider sending a blast or adjusting capacity.`
      } else if (hoursUntil <= 48 && fillRate < 0.5) {
        shouldAlert = true
        alertMessage = `${space.name} is in 2 days with ${acceptedCount}/${space.capacity} guests (${Math.round(fillRate * 100)}% full). Time to promote!`
      }

      if (shouldAlert && space.host_id) {
        // Check if we already sent this alert today
        const todayStart = new Date(now)
        todayStart.setHours(0, 0, 0, 0)

        const { count: existingAlert } = await supabase
          .from('notifications')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', space.host_id)
          .eq('space_id', space.id)
          .eq('type', 'gap_alert')
          .gte('created_at', todayStart.toISOString())

        if (!existingAlert || existingAlert === 0) {
          await supabase.from('notifications').insert({
            user_id: space.host_id,
            type: 'gap_alert',
            title: 'Low Attendance Alert',
            message: alertMessage,
            space_id: space.id,
          })
          alertsSent++
        }
      }
    }

    return NextResponse.json({
      message: 'Gap alerts processed',
      spacesChecked: spaces?.length || 0,
      alertsSent,
    })
  } catch (err) {
    console.error('Gap alerts cron error:', err)
    return NextResponse.json({ error: 'Cron job failed' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  return POST(request)
}
