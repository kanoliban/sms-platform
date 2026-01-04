import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { sendSms } from '@/lib/twilio/client'

// POST /api/cron/host-digest
// Vercel Cron: runs daily at 9 AM (0 9 * * *)
// Sends hosts a daily digest of their upcoming spaces
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createAdminClient()
    const now = new Date()

    // Get tomorrow's date
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const tomorrowStr = tomorrow.toISOString().split('T')[0]

    // Get spaces happening tomorrow
    const { data: tomorrowSpaces, error: tomorrowError } = await supabase
      .from('spaces')
      .select(`
        id,
        name,
        date,
        time,
        capacity,
        host_id,
        host:users!host_id (
          id,
          name,
          phone
        ),
        invitations (
          id,
          status
        )
      `)
      .eq('date', tomorrowStr)
      .in('status', ['open', 'full', 'confirmed'])

    if (tomorrowError) {
      console.error('Error fetching tomorrow spaces:', tomorrowError)
    }

    // Get spaces happening in the next 7 days (for weekly overview)
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    const { data: upcomingSpaces, error: upcomingError } = await supabase
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
      .gte('date', now.toISOString().split('T')[0])
      .lte('date', nextWeek.toISOString().split('T')[0])
      .in('status', ['open', 'full', 'confirmed'])

    if (upcomingError) {
      console.error('Error fetching upcoming spaces:', upcomingError)
    }

    // Group by host
    const hostDigests = new Map<string, {
      host: { id: string; name: string | null; phone: string }
      tomorrow: typeof tomorrowSpaces
      upcoming: typeof upcomingSpaces
    }>()

    // Process tomorrow's spaces
    for (const space of tomorrowSpaces || []) {
      // Supabase returns joined data; ensure we extract correctly
      const hostData = space.host as unknown as { id: string; name: string | null; phone: string } | null
      if (!hostData?.phone) continue
      const host = hostData

      if (!hostDigests.has(host.id)) {
        hostDigests.set(host.id, { host, tomorrow: [], upcoming: [] })
      }
      hostDigests.get(host.id)!.tomorrow!.push(space)
    }

    // Process upcoming spaces
    for (const space of upcomingSpaces || []) {
      const hostId = space.host_id
      if (!hostId) continue

      // Find or create digest entry
      if (!hostDigests.has(hostId)) {
        // Need to fetch host info
        const { data: hostData } = await supabase
          .from('users')
          .select('id, name, phone')
          .eq('id', hostId)
          .single()

        if (!hostData?.phone) continue

        hostDigests.set(hostId, {
          host: hostData,
          tomorrow: [],
          upcoming: []
        })
      }
      hostDigests.get(hostId)!.upcoming!.push(space)
    }

    let digestsSent = 0

    for (const [hostId, digest] of hostDigests) {
      const { host, tomorrow, upcoming } = digest

      // Build digest message
      let message = `SMS Daily Digest for ${host.name || 'Host'}:\n\n`

      // Tomorrow's spaces
      if (tomorrow && tomorrow.length > 0) {
        message += `📅 TOMORROW:\n`
        for (const space of tomorrow) {
          const accepted = space.invitations?.filter(
            (inv: { status: string }) => inv.status === 'accepted'
          ).length || 0
          message += `• ${space.name} at ${space.time} - ${accepted}/${space.capacity} guests\n`
        }
        message += `\n`
      }

      // Upcoming spaces summary
      const otherUpcoming = upcoming?.filter(s => s.date !== tomorrowStr) || []
      if (otherUpcoming.length > 0) {
        message += `📆 THIS WEEK: ${otherUpcoming.length} more space${otherUpcoming.length > 1 ? 's' : ''}\n`

        // Show spaces with low attendance
        const lowAttendance = otherUpcoming.filter(space => {
          const accepted = space.invitations?.filter(
            (inv: { status: string }) => inv.status === 'accepted'
          ).length || 0
          return accepted < space.capacity * 0.5
        })

        if (lowAttendance.length > 0) {
          message += `⚠️ ${lowAttendance.length} need${lowAttendance.length > 1 ? '' : 's'} more guests\n`
        }
      }

      // Only send if there's something to report
      if ((tomorrow && tomorrow.length > 0) || (upcoming && upcoming.length > 0)) {
        await sendSms(host.phone, message.trim())

        // Create notification too
        await supabase.from('notifications').insert({
          user_id: hostId,
          type: 'digest',
          title: 'Daily Digest',
          message: tomorrow && tomorrow.length > 0
            ? `You have ${tomorrow.length} space${tomorrow.length > 1 ? 's' : ''} tomorrow`
            : `You have ${upcoming?.length || 0} upcoming spaces this week`,
        })

        digestsSent++
      }
    }

    return NextResponse.json({
      message: 'Host digests sent',
      digestsSent,
      hostsProcessed: hostDigests.size,
    })
  } catch (err) {
    console.error('Host digest cron error:', err)
    return NextResponse.json({ error: 'Cron job failed' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  return POST(request)
}
