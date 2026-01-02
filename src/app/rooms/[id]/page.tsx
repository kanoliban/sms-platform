'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import type { Room, User } from '@/lib/supabase/types';
import {
  Button,
  Card,
  Badge,
  Avatar,
  AvatarStack,
} from '@/components/ui';
import {
  TwoColumn,
  PageContainer,
} from '@/components/layout';
import {
  HostBadge,
  CountdownBadge,
  StatsCard,
  StatsGrid,
  ContactHostModal,
  ReportRoomModal,
} from '@/components/composed';

type RoomTone = 'chill' | 'playful' | 'deep' | 'intense';

type RoomWithHost = Room & {
  host: Pick<User, 'id' | 'name'>;
  accepted_count: number;
  guests?: Array<{ name: string; avatar?: string }>;
};

// Check if Supabase is configured
const isSupabaseConfigured = () => {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
};

// Mock data for demo mode
const MOCK_ROOM: RoomWithHost = {
  id: 'demo-1',
  host_id: 'demo-host',
  name: 'Dinner & Deep Talks',
  description: 'An intimate dinner for strangers who want real conversation. Come ready to be present, to listen deeply, and to share something true about yourself.\n\nWe\'ll gather around a long table, share a meal prepared by our host, and explore questions that matter. No small talk, no networking—just honest human connection.',
  tone: 'deep' as RoomTone,
  date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  time: '19:00',
  duration_minutes: 180,
  location_address: '123 Example St, Minneapolis, MN',
  location_hint: 'Northeast Minneapolis',
  capacity: 8,
  price_cents: 4500,
  status: 'open',
  location_revealed: false,
  feedback_requested: false,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  host: {
    id: 'demo-host',
    name: 'Liban',
  },
  accepted_count: 5,
  guests: [
    { name: 'Sarah K.' },
    { name: 'Marcus T.' },
    { name: 'Elena R.' },
    { name: 'James W.' },
    { name: 'Priya S.' },
  ],
};

// Tone configuration
const toneConfig: Record<RoomTone, { label: string; description: string; gradient: string; badge: 'info' | 'primary' | 'default' | 'error' }> = {
  chill: {
    label: 'Chill',
    description: 'Relaxed atmosphere, easy conversation',
    gradient: 'from-blue-500/30 to-cyan-500/30',
    badge: 'info',
  },
  playful: {
    label: 'Playful',
    description: 'Fun energy, games and laughter welcome',
    gradient: 'from-pink-500/30 to-orange-500/30',
    badge: 'primary',
  },
  deep: {
    label: 'Deep',
    description: 'Meaningful conversation, vulnerability encouraged',
    gradient: 'from-purple-500/30 to-indigo-500/30',
    badge: 'default',
  },
  intense: {
    label: 'Intense',
    description: 'Challenging topics, push your comfort zone',
    gradient: 'from-red-500/30 to-amber-500/30',
    badge: 'error',
  },
};

export default function PublicRoomPage() {
  const params = useParams();
  const roomId = params.id as string;

  const [room, setRoom] = useState<RoomWithHost | null>(null);
  const [loading, setLoading] = useState(true);
  const [demoMode, setDemoMode] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  useEffect(() => {
    loadRoom();
  }, [roomId]);

  async function loadRoom() {
    // Check for demo mode
    if (!isSupabaseConfigured() || roomId.startsWith('demo-')) {
      setDemoMode(true);
      setRoom(MOCK_ROOM);
      setLoading(false);
      return;
    }

    try {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();

      const { data: roomData } = await supabase
        .from('rooms')
        .select(`
          *,
          host:users!rooms_host_id_fkey (
            id,
            name
          )
        `)
        .eq('id', roomId)
        .single();

      if (roomData) {
        // Get accepted count
        const { count } = await supabase
          .from('invitations')
          .select('*', { count: 'exact', head: true })
          .eq('room_id', roomId)
          .eq('status', 'accepted');

        setRoom({
          ...roomData,
          accepted_count: count || 0,
        } as RoomWithHost);
      }
    } catch (err) {
      console.error('Failed to load room:', err);
    }

    setLoading(false);
  }

  // Generate calendar URLs
  function getGoogleCalendarUrl() {
    if (!room) return '';
    const startDate = new Date(`${room.date}T${room.time}`);
    const endDate = new Date(startDate.getTime() + room.duration_minutes * 60 * 1000);

    const formatDate = (d: Date) => d.toISOString().replace(/-|:|\.\d\d\d/g, '');

    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: `SMS: ${room.name}`,
      dates: `${formatDate(startDate)}/${formatDate(endDate)}`,
      details: `${room.description || ''}\n\nHosted by ${room.host?.name || 'SMS'}\n\nLocation will be revealed 24 hours before.`,
      location: room.location_hint || 'Location TBA',
    });

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  }

  function getAppleCalendarUrl() {
    if (!room) return '';
    const startDate = new Date(`${room.date}T${room.time}`);
    const endDate = new Date(startDate.getTime() + room.duration_minutes * 60 * 1000);

    const formatDate = (d: Date) => d.toISOString().replace(/-|:|\.\d\d\d/g, '').slice(0, -1);

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
    ].join('\n');

    return `data:text/calendar;charset=utf-8,${encodeURIComponent(icsContent)}`;
  }

  async function copyLink() {
    const url = window.location.href;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-base)] flex items-center justify-center">
        <div className="text-[var(--text-secondary)]">Loading...</div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-[var(--bg-base)] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-[var(--text-2xl)] text-[var(--text-primary)] mb-4">Room not found</h1>
          <Link href="/" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
            Go home
          </Link>
        </div>
      </div>
    );
  }

  const roomDate = new Date(`${room.date}T${room.time}`);
  const isPast = roomDate < new Date();
  const spotsLeft = room.capacity - room.accepted_count;
  const tone = room.tone as RoomTone;
  const toneInfo = toneConfig[tone] || toneConfig.chill;

  // Left column - Cover and details
  const LeftColumn = (
    <div className="space-y-6">
      {/* Cover Card with Tone Gradient */}
      <Card variant="elevated" className="overflow-hidden">
        <div className={`aspect-[4/3] bg-gradient-to-br ${toneInfo.gradient} relative flex items-center justify-center`}>
          <div className="text-center p-6">
            <Badge variant={toneInfo.badge} size="lg" className="mb-4">
              {toneInfo.label} Vibe
            </Badge>
            <h2 className="text-[var(--text-2xl)] font-bold text-[var(--text-primary)]">
              {room.name}
            </h2>
          </div>
        </div>
      </Card>

      {/* Host Section */}
      <Card className="p-5">
        <h3 className="text-[var(--text-sm)] font-medium text-[var(--text-muted)] mb-3">Hosted by</h3>
        <HostBadge
          name={room.host?.name || 'SMS Host'}
          role="creator"
          size="md"
        />
      </Card>

      {/* Going Section */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[var(--text-sm)] font-medium text-[var(--text-muted)]">Going</h3>
          <Badge variant="going" size="sm">{room.accepted_count} confirmed</Badge>
        </div>

        {room.guests && room.guests.length > 0 ? (
          <div className="flex items-center gap-3">
            <AvatarStack
              avatars={room.guests.map(g => ({ name: g.name, src: g.avatar }))}
              max={5}
              size="md"
            />
            <span className="text-[var(--text-sm)] text-[var(--text-secondary)]">
              {room.guests.slice(0, 2).map(g => g.name).join(', ')}
              {room.guests.length > 2 && ` +${room.guests.length - 2} more`}
            </span>
          </div>
        ) : (
          <p className="text-[var(--text-sm)] text-[var(--text-muted)]">Be the first to join!</p>
        )}
      </Card>

      {/* Footer Links */}
      <div className="flex gap-4 text-[var(--text-sm)]">
        <button
          onClick={() => setShowContactModal(true)}
          className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        >
          Contact Host
        </button>
        <span className="text-[var(--border-default)]">|</span>
        <button
          onClick={() => setShowReportModal(true)}
          className="text-[var(--text-secondary)] hover:text-[var(--error-text)] transition-colors"
        >
          Report Room
        </button>
      </div>
    </div>
  );

  // Right column - RSVP and details
  const RightColumn = (
    <div className="space-y-6">
      {/* RSVP Card */}
      <Card variant="elevated" className="p-6">
        {/* Countdown */}
        <div className="flex items-center justify-between mb-6">
          <CountdownBadge targetDate={roomDate} size="lg" />
          {isPast ? (
            <Badge variant="cancelled">Event Ended</Badge>
          ) : spotsLeft > 0 ? (
            <Badge variant="success">{spotsLeft} spots left</Badge>
          ) : (
            <Badge variant="error">Sold Out</Badge>
          )}
        </div>

        {/* Event Details */}
        <div className="space-y-4 mb-6">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-[var(--text-muted)] mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
            <div>
              <div className="text-[var(--text-sm)] font-medium text-[var(--text-primary)]">
                {roomDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </div>
              <div className="text-[var(--text-sm)] text-[var(--text-secondary)]">
                {room.time} - {new Date(roomDate.getTime() + room.duration_minutes * 60 * 1000).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-[var(--text-muted)] mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
            <div>
              <div className="text-[var(--text-sm)] font-medium text-[var(--text-primary)]">
                {room.location_hint || 'Location TBA'}
              </div>
              <div className="text-[var(--text-xs)] text-[var(--text-muted)]">
                Full address revealed 24h before
              </div>
            </div>
          </div>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between py-4 border-t border-b border-[var(--border-subtle)] mb-6">
          <span className="text-[var(--text-sm)] text-[var(--text-secondary)]">Price</span>
          <span className="text-[var(--text-lg)] font-semibold text-[var(--text-primary)]">
            ${room.price_cents / 100}
          </span>
        </div>

        {/* How to Join */}
        <div className="bg-[var(--bg-subtle)] rounded-[var(--radius-lg)] p-4 mb-6">
          <h4 className="text-[var(--text-sm)] font-medium text-[var(--text-primary)] mb-2">How to join</h4>
          <p className="text-[var(--text-sm)] text-[var(--text-secondary)]">
            SMS rooms are invite-only. If you've received an invitation via text, reply{' '}
            <code className="bg-[var(--bg-surface)] px-1.5 py-0.5 rounded text-[var(--primary)]">ACCEPT</code>
            {' '}to confirm your spot.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button variant="secondary" size="md" className="flex-1" onClick={copyLink}>
            {copied ? (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Copied!
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                Share
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* Add to Calendar */}
      <Card className="p-5">
        <h3 className="text-[var(--text-sm)] font-medium text-[var(--text-primary)] mb-4">Add to calendar</h3>
        <div className="flex flex-wrap gap-2">
          <a
            href={getGoogleCalendarUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3 py-2 text-[var(--text-sm)] bg-[var(--bg-subtle)] hover:bg-[var(--bg-surface-hover)] rounded-[var(--radius-md)] transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.5 22h-15A2.5 2.5 0 012 19.5v-15A2.5 2.5 0 014.5 2H9v2H4.5a.5.5 0 00-.5.5v15a.5.5 0 00.5.5h15a.5.5 0 00.5-.5V15h2v4.5a2.5 2.5 0 01-2.5 2.5z"/>
              <path d="M8.5 17a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm4 0a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm4 0a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm-8-4a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm4 0a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm4 0a1.5 1.5 0 110-3 1.5 1.5 0 010 3zM19 8h-5V2h2v4h3v2z"/>
            </svg>
            Google
          </a>
          <a
            href={getAppleCalendarUrl()}
            download={`sms-${room.name.replace(/\s+/g, '-').toLowerCase()}.ics`}
            className="inline-flex items-center gap-2 px-3 py-2 text-[var(--text-sm)] bg-[var(--bg-subtle)] hover:bg-[var(--bg-surface-hover)] rounded-[var(--radius-md)] transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
            </svg>
            Apple
          </a>
        </div>
      </Card>

      {/* About Section */}
      {room.description && (
        <Card className="p-5">
          <h3 className="text-[var(--text-sm)] font-medium text-[var(--text-primary)] mb-3">About this room</h3>
          <p className="text-[var(--text-sm)] text-[var(--text-secondary)] leading-relaxed whitespace-pre-line">
            {room.description}
          </p>
        </Card>
      )}

      {/* Tone Card */}
      <Card className="p-5">
        <div className="flex items-center gap-3 mb-2">
          <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${toneInfo.gradient.replace('/30', '')}`} />
          <span className="text-[var(--text-sm)] font-medium text-[var(--text-primary)] capitalize">{tone} vibe</span>
        </div>
        <p className="text-[var(--text-sm)] text-[var(--text-secondary)]">{toneInfo.description}</p>
      </Card>

      {/* The Contract */}
      <Card className="p-5">
        <h3 className="text-[var(--text-sm)] font-medium text-[var(--text-primary)] mb-4">The Contract</h3>
        <div className="space-y-4">
          <div className="flex gap-3">
            <span className="text-xl">🤫</span>
            <div>
              <h4 className="text-[var(--text-sm)] font-medium text-[var(--text-primary)]">Confidentiality</h4>
              <p className="text-[var(--text-xs)] text-[var(--text-muted)]">What's shared in the room stays in the room.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <span className="text-xl">📵</span>
            <div>
              <h4 className="text-[var(--text-sm)] font-medium text-[var(--text-primary)]">Presence</h4>
              <p className="text-[var(--text-xs)] text-[var(--text-muted)]">Phone away, attention here. Be fully present.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <span className="text-xl">🚫</span>
            <div>
              <h4 className="text-[var(--text-sm)] font-medium text-[var(--text-primary)]">Non-transactional</h4>
              <p className="text-[var(--text-xs)] text-[var(--text-muted)]">This isn't networking. Connect as humans first.</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Payment Info */}
      <Card variant="outlined" className="p-5 border-[var(--warning-border)] bg-[var(--warning-muted)]">
        <h3 className="text-[var(--text-sm)] font-medium text-[var(--warning-text)] mb-2">How payment works</h3>
        <p className="text-[var(--text-sm)] text-[var(--text-secondary)]">
          Your card is authorized when you accept, but only charged after you attend.
          Cancel 48+ hours before for a full release. No-shows are charged in full.
        </p>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-[var(--bg-base)]">
      {/* Demo Banner */}
      {demoMode && (
        <div className="bg-[var(--warning-muted)] border-b border-[var(--warning-border)] px-6 py-3 text-center text-[var(--warning-text)] text-[var(--text-sm)]">
          Demo Mode — This is a sample room page
        </div>
      )}

      {/* Header */}
      <header className="border-b border-[var(--border-subtle)] sticky top-0 bg-[var(--bg-base)]/95 backdrop-blur z-10">
        <PageContainer>
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="font-bold italic text-xl tracking-tight text-[var(--text-primary)] hover:opacity-80 transition-opacity">
              SMS
            </Link>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={copyLink}>
                {copied ? 'Link Copied!' : 'Share'}
              </Button>
            </div>
          </div>
        </PageContainer>
      </header>

      {/* Main Content */}
      <PageContainer className="py-8">
        {/* Page Title (Mobile) */}
        <div className="lg:hidden mb-6">
          <h1 className="text-[var(--text-2xl)] font-bold text-[var(--text-primary)] mb-2">{room.name}</h1>
          <div className="flex items-center gap-3">
            <CountdownBadge targetDate={roomDate} size="sm" />
            {spotsLeft > 0 ? (
              <Badge variant="success" size="sm">{spotsLeft} spots left</Badge>
            ) : (
              <Badge variant="error" size="sm">Sold Out</Badge>
            )}
          </div>
        </div>

        <TwoColumn
          left={LeftColumn}
          right={RightColumn}
          ratio="40/60"
          gap="lg"
          reverseOnMobile
        />
      </PageContainer>

      {/* Footer */}
      <footer className="border-t border-[var(--border-subtle)] py-8">
        <PageContainer>
          <div className="flex justify-between items-center text-[var(--text-sm)] text-[var(--text-muted)]">
            <Link href="/" className="font-bold italic hover:text-[var(--text-secondary)] transition-colors">SMS</Link>
            <div className="flex items-center gap-4">
              <Link href="/help" className="hover:text-[var(--text-secondary)] transition-colors">Help</Link>
              <span>Strangers Meeting Strangers</span>
            </div>
          </div>
        </PageContainer>
      </footer>

      {/* Contact Host Modal */}
      <ContactHostModal
        open={showContactModal}
        onClose={() => setShowContactModal(false)}
        host={{
          name: room.host?.name || 'Host',
        }}
        roomName={room.name}
        onSubmit={async (message) => {
          // In a real app, this would send the message via API
          console.log('Contact host message:', message);
          await new Promise((r) => setTimeout(r, 1000));
        }}
      />

      {/* Report Room Modal */}
      <ReportRoomModal
        open={showReportModal}
        onClose={() => setShowReportModal(false)}
        roomId={roomId}
        roomName={room.name}
        onSubmit={async (reason, category) => {
          // In a real app, this would submit the report via API
          console.log('Report:', { reason, category });
          await new Promise((r) => setTimeout(r, 1000));
        }}
      />
    </div>
  );
}
