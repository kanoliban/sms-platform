'use client'

import { useEffect, useState, Suspense } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button, Card, Badge } from '@/components/ui'
import { PageContainer } from '@/components/layout'
import type { Room } from '@/lib/supabase/types'

type RoomWithHost = Room & {
  host?: { name: string }
}

function SuccessContent() {
  const params = useParams()
  const searchParams = useSearchParams()
  const roomId = params.id as string
  const invitationId = searchParams.get('invitation')

  const [room, setRoom] = useState<RoomWithHost | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadRoom()
  }, [roomId])

  async function loadRoom() {
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()

      const { data } = await supabase
        .from('rooms')
        .select(`
          *,
          host:users!rooms_host_id_fkey (name)
        `)
        .eq('id', roomId)
        .single()

      if (data) {
        setRoom(data as RoomWithHost)
      }
    } catch (err) {
      console.error('Failed to load room:', err)
    }
    setLoading(false)
  }

  // Generate calendar URLs
  function getGoogleCalendarUrl() {
    if (!room) return ''
    const startDate = new Date(`${room.date}T${room.time}`)
    const endDate = new Date(startDate.getTime() + room.duration_minutes * 60 * 1000)

    const formatDate = (d: Date) => d.toISOString().replace(/-|:|\.\d\d\d/g, '')

    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: `SMS: ${room.name}`,
      dates: `${formatDate(startDate)}/${formatDate(endDate)}`,
      details: `${room.description || ''}\n\nHosted by ${room.host?.name || 'SMS'}\n\nLocation will be revealed 24 hours before.`,
      location: room.location_hint || 'Location TBA',
    })

    return `https://calendar.google.com/calendar/render?${params.toString()}`
  }

  function getAppleCalendarUrl() {
    if (!room) return ''
    const startDate = new Date(`${room.date}T${room.time}`)
    const endDate = new Date(startDate.getTime() + room.duration_minutes * 60 * 1000)

    const formatDate = (d: Date) => d.toISOString().replace(/-|:|\.\d\d\d/g, '').slice(0, -1)

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'BEGIN:VEVENT',
      `DTSTART:${formatDate(startDate)}`,
      `DTEND:${formatDate(endDate)}`,
      `SUMMARY:SMS: ${room.name}`,
      `DESCRIPTION:${room.description || ''} - Hosted by ${room.host?.name || 'SMS'}`,
      `LOCATION:${room.location_hint || 'Location TBA'}`,
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\n')

    return `data:text/calendar;charset=utf-8,${encodeURIComponent(icsContent)}`
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-[var(--text-secondary)]">Loading...</div>
      </div>
    )
  }

  const roomDate = room ? new Date(`${room.date}T${room.time}`) : null

  return (
    <main className="flex-1 flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        {/* Success Icon */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[var(--success-muted)] flex items-center justify-center">
            <svg
              className="w-10 h-10 text-[var(--success-text)]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-[var(--text-2xl)] font-bold text-[var(--text-primary)] mb-2">
            You're in!
          </h1>
          <p className="text-[var(--text-secondary)]">
            Your spot is confirmed. We'll send you the full address 24 hours before.
          </p>
        </div>

        {/* Room Details Card */}
        {room && (
          <Card className="p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[var(--text-lg)] font-semibold text-[var(--text-primary)]">
                {room.name}
              </h2>
              <Badge variant="going">Going</Badge>
            </div>

            <div className="space-y-3 text-[var(--text-sm)]">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-[var(--text-muted)] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                </svg>
                <div>
                  <div className="font-medium text-[var(--text-primary)]">
                    {roomDate?.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                  </div>
                  <div className="text-[var(--text-secondary)]">
                    {room.time}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-[var(--text-muted)] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
                <div>
                  <div className="font-medium text-[var(--text-primary)]">
                    {room.location_hint || 'Location TBA'}
                  </div>
                  <div className="text-[var(--text-muted)] text-[var(--text-xs)]">
                    Full address sent 24h before
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Add to Calendar */}
        <Card className="p-5 mb-6">
          <h3 className="text-[var(--text-sm)] font-medium text-[var(--text-primary)] mb-4">
            Add to your calendar
          </h3>
          <div className="flex flex-wrap gap-2">
            <a
              href={getGoogleCalendarUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 text-[var(--text-sm)] bg-[var(--bg-subtle)] hover:bg-[var(--bg-surface-hover)] rounded-[var(--radius-md)] transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.5 22h-15A2.5 2.5 0 012 19.5v-15A2.5 2.5 0 014.5 2H9v2H4.5a.5.5 0 00-.5.5v15a.5.5 0 00.5.5h15a.5.5 0 00.5-.5V15h2v4.5a2.5 2.5 0 01-2.5 2.5z"/>
                <path d="M8.5 17a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm4 0a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm4 0a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm-8-4a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm4 0a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm4 0a1.5 1.5 0 110-3 1.5 1.5 0 010 3zM19 8h-5V2h2v4h3v2z"/>
              </svg>
              Google Calendar
            </a>
            <a
              href={getAppleCalendarUrl()}
              download={`sms-${room?.name?.replace(/\s+/g, '-').toLowerCase() || 'event'}.ics`}
              className="inline-flex items-center gap-2 px-4 py-2 text-[var(--text-sm)] bg-[var(--bg-subtle)] hover:bg-[var(--bg-surface-hover)] rounded-[var(--radius-md)] transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
              Apple Calendar
            </a>
          </div>
        </Card>

        {/* What's Next */}
        <Card variant="outlined" className="p-5 mb-6 border-[var(--primary)] bg-[var(--primary)]/5">
          <h3 className="text-[var(--text-sm)] font-medium text-[var(--primary)] mb-3">What happens next</h3>
          <ul className="space-y-2 text-[var(--text-sm)] text-[var(--text-secondary)]">
            <li className="flex items-start gap-2">
              <span className="text-[var(--primary)]">1.</span>
              <span>You'll receive a confirmation text</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--primary)]">2.</span>
              <span>24 hours before, we'll send you the exact address</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--primary)]">3.</span>
              <span>Your card is only charged after you attend</span>
            </li>
          </ul>
        </Card>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <Link href={`/rooms/${roomId}`}>
            <Button variant="secondary" fullWidth>
              View Room Details
            </Button>
          </Link>
          <Link href="/my-rooms">
            <Button variant="ghost" fullWidth>
              Go to My Rooms
            </Button>
          </Link>
        </div>
      </div>
    </main>
  )
}

function SuccessFallback() {
  return (
    <main className="flex-1 flex items-center justify-center p-6">
      <div className="text-[var(--text-secondary)]">Loading...</div>
    </main>
  )
}

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-base)] flex flex-col">
      {/* Header */}
      <header className="border-b border-[var(--border-subtle)]">
        <PageContainer>
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="font-bold italic text-xl tracking-tight text-[var(--text-primary)] hover:opacity-80 transition-opacity">
              SMS
            </Link>
          </div>
        </PageContainer>
      </header>

      <Suspense fallback={<SuccessFallback />}>
        <SuccessContent />
      </Suspense>
    </div>
  )
}
