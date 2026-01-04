'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import type { Space, User } from '@/lib/supabase/types';
import {
  Button,
  Card,
  Badge,
  Avatar,
  AvatarStack,
} from '@/components/ui';
import { toast } from '@/components/ui/toast';
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
  ReportSpaceModal,
  LoginModal,
  UserMenu,
} from '@/components/composed';
import { OnboardingReminderModal } from '@/components/modals/OnboardingReminderModal';
import { EventSchema, BreadcrumbSchema } from '@/components/seo/structured-data';
import { useAuth } from '@/lib/auth/auth-context';

type SpaceTone = 'chill' | 'playful' | 'deep' | 'intense';

type SpaceWithHost = Space & {
  host: Pick<User, 'id' | 'name'>;
  accepted_count: number;
  guests?: Array<{ name: string; avatar?: string }>;
};

type InvitationStatus = 'none' | 'pending' | 'sent' | 'accepted' | 'declined' | 'expired';

type UserInvitation = {
  id: string;
  status: InvitationStatus;
  amount_cents: number;
};

// Check if Supabase is configured
const isSupabaseConfigured = () => {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
};

// Mock data for demo mode
const MOCK_SPACE: SpaceWithHost = {
  id: 'demo-1',
  host_id: 'demo-host',
  name: 'Dinner & Deep Talks',
  description: 'An intimate dinner for strangers who want real conversation. Come ready to be present, to listen deeply, and to share something true about yourself.\n\nWe\'ll gather around a long table, share a meal prepared by our host, and explore questions that matter. No small talk, no networking—just honest human connection.',
  tone: 'deep' as SpaceTone,
  date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] ?? '',
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
const toneConfig: Record<SpaceTone, { label: string; description: string; gradient: string; badge: 'info' | 'primary' | 'default' | 'error' }> = {
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
  const spaceId = typeof params.id === 'string' ? params.id : '';
  const { user, loading: authLoading } = useAuth();

  const [space, setSpace] = useState<SpaceWithHost | null>(null);
  const [loading, setLoading] = useState(true);
  const [demoMode, setDemoMode] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showOnboardingReminder, setShowOnboardingReminder] = useState(false);
  const [userInvitation, setUserInvitation] = useState<UserInvitation | null>(null);
  const [rsvpLoading, setRsvpLoading] = useState(false);

  useEffect(() => {
    loadRoom();
  }, [spaceId]);

  // Load user's invitation status when user changes
  useEffect(() => {
    if (user && space && !demoMode) {
      loadUserInvitation();
    }
  }, [user, space, demoMode]);

  async function loadRoom() {
    // Check for demo mode
    if (!isSupabaseConfigured() || spaceId.startsWith('demo-')) {
      setDemoMode(true);
      setSpace(MOCK_SPACE);
      setLoading(false);
      return;
    }

    try {
      // Use API endpoint to avoid RLS issues with browser client
      const res = await fetch(`/api/spaces/${spaceId}`);

      if (res.ok) {
        const data = await res.json();
        setSpace(data.space as SpaceWithHost);
      }
    } catch (err) {
      console.error('Failed to load room:', err);
    }

    setLoading(false);
  }

  async function loadUserInvitation() {
    if (!user) return;

    try {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();

      const { data } = await supabase
        .from('invitations')
        .select('id, status, amount_cents')
        .eq('space_id', spaceId)
        .eq('user_id', user.id)
        .single();

      if (data) {
        setUserInvitation(data as UserInvitation);
      }
    } catch {
      // No invitation found is fine
      setUserInvitation(null);
    }
  }

  async function handleRSVP(skipOnboardingCheck = false) {
    // If not logged in, show login modal
    if (!user) {
      setShowLoginModal(true);
      return;
    }

    // Check if user skipped onboarding (only on first RSVP attempt)
    if (!skipOnboardingCheck && user.onboarding_skipped && !user.onboarding_completed) {
      setShowOnboardingReminder(true);
      return;
    }

    // Already accepted
    if (userInvitation?.status === 'accepted') {
      toast({
        variant: 'info',
        title: 'Already RSVP\'d',
        description: 'You\'ve already confirmed your spot for this space.',
      });
      return;
    }

    setRsvpLoading(true);

    try {
      const response = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ space_id: spaceId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process RSVP');
      }

      // Handle dev mode (no Stripe)
      if (data.dev_mode && data.redirect_url) {
        toast({
          variant: 'success',
          title: 'RSVP Accepted!',
          description: data.message || 'Your spot is confirmed (dev mode).',
        });
        window.location.href = data.redirect_url;
        return;
      }

      // Redirect to Stripe checkout
      if (data.checkout_url) {
        window.location.href = data.checkout_url;
      }
    } catch (err) {
      toast({
        variant: 'error',
        title: 'RSVP Failed',
        description: err instanceof Error ? err.message : 'Please try again.',
      });
      setRsvpLoading(false);
    }
  }

  // Handle successful login from modal - continue with RSVP
  function handleLoginSuccess() {
    setShowLoginModal(false);
    // Wait a moment for auth state to update, then trigger RSVP
    setTimeout(() => {
      handleRSVP();
    }, 500);
  }

  // Handle "Continue Anyway" from onboarding reminder modal
  function handleContinueWithoutOnboarding() {
    setShowOnboardingReminder(false);
    // Continue with RSVP, skipping the onboarding check
    handleRSVP(true);
  }

  // Generate calendar URLs
  function getGoogleCalendarUrl() {
    if (!space) return '';
    const startDate = new Date(`${space.date}T${space.time}`);
    const endDate = new Date(startDate.getTime() + space.duration_minutes * 60 * 1000);

    const formatDate = (d: Date) => d.toISOString().replace(/-|:|\.\d\d\d/g, '');

    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: `SMS: ${space.name}`,
      dates: `${formatDate(startDate)}/${formatDate(endDate)}`,
      details: `${space.description || ''}\n\nHosted by ${space.host?.name || 'SMS'}\n\nLocation will be revealed 24 hours before.`,
      location: space.location_hint || 'Location TBA',
    });

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  }

  function getAppleCalendarUrl() {
    if (!space) return '';
    const startDate = new Date(`${space.date}T${space.time}`);
    const endDate = new Date(startDate.getTime() + space.duration_minutes * 60 * 1000);

    const formatDate = (d: Date) => d.toISOString().replace(/-|:|\.\d\d\d/g, '').slice(0, -1);

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'BEGIN:VEVENT',
      `DTSTART:${formatDate(startDate)}`,
      `DTEND:${formatDate(endDate)}`,
      `SUMMARY:SMS: ${space.name}`,
      `DESCRIPTION:${space.description || ''} - Hosted by ${space.host?.name || 'SMS'}`,
      `LOCATION:${space.location_hint || 'Location TBA'}`,
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

  if (!space) {
    return (
      <div className="min-h-screen bg-[var(--bg-base)] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-[var(--text-2xl)] text-[var(--text-primary)] mb-4">Space not found</h1>
          <Link href="/" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
            Go home
          </Link>
        </div>
      </div>
    );
  }

  const spaceDate = new Date(`${space.date}T${space.time}`);
  const isPast = spaceDate < new Date();
  const spotsLeft = space.capacity - space.accepted_count;
  const tone = space.tone as SpaceTone;
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
              {space.name}
            </h2>
          </div>
        </div>
      </Card>

      {/* Host Section */}
      <Card className="p-5">
        <h3 className="text-[var(--text-sm)] font-medium text-[var(--text-muted)] mb-3">Hosted by</h3>
        <HostBadge
          name={space.host?.name || 'SMS Host'}
          role="creator"
          size="md"
        />
      </Card>

      {/* Going Section */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[var(--text-sm)] font-medium text-[var(--text-muted)]">Going</h3>
          <Badge variant="going" size="sm">{space.accepted_count} confirmed</Badge>
        </div>

        {space.guests && space.guests.length > 0 ? (
          <div className="flex items-center gap-3">
            <AvatarStack
              avatars={space.guests.map(g => ({ name: g.name, src: g.avatar }))}
              max={5}
              size="md"
            />
            <span className="text-[var(--text-sm)] text-[var(--text-secondary)]">
              {space.guests.slice(0, 2).map(g => g.name).join(', ')}
              {space.guests.length > 2 && ` +${space.guests.length - 2} more`}
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
          <CountdownBadge targetDate={spaceDate} size="lg" />
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
                {spaceDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </div>
              <div className="text-[var(--text-sm)] text-[var(--text-secondary)]">
                {space.time} - {new Date(spaceDate.getTime() + space.duration_minutes * 60 * 1000).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
              </div>
            </div>
          </div>

          {/* Location - Show full address if revealed and user is accepted */}
          {space.location_revealed && userInvitation?.status === 'accepted' ? (
            <div className="flex items-start gap-3 p-3 -mx-3 rounded-[var(--radius-lg)] bg-[var(--success-muted)] border border-[var(--success-border)]">
              <svg className="w-5 h-5 text-[var(--success-text)] mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[var(--text-xs)] font-medium text-[var(--success-text)] uppercase tracking-wide">Location Revealed</span>
                </div>
                <div className="text-[var(--text-sm)] font-medium text-[var(--text-primary)]">
                  {space.location_address}
                </div>
                <div className="flex gap-3 mt-2">
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(space.location_address)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[var(--text-xs)] text-[var(--primary)] hover:underline"
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    Google Maps
                  </a>
                  <a
                    href={`http://maps.apple.com/?address=${encodeURIComponent(space.location_address)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[var(--text-xs)] text-[var(--primary)] hover:underline"
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    Apple Maps
                  </a>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-[var(--text-muted)] mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
              <div className="flex-1">
                <div className="text-[var(--text-sm)] font-medium text-[var(--text-primary)]">
                  {space.location_hint || 'Location TBA'}
                </div>
                {userInvitation?.status === 'accepted' ? (
                  (() => {
                    const revealTime = new Date(spaceDate.getTime() - 24 * 60 * 60 * 1000);
                    const now = new Date();
                    const msUntilReveal = revealTime.getTime() - now.getTime();

                    if (msUntilReveal <= 0) {
                      // Should be revealed but isn't yet (cron hasn't run)
                      return (
                        <div className="text-[var(--text-xs)] text-[var(--warning-text)]">
                          Location will be revealed shortly...
                        </div>
                      );
                    }

                    const hoursUntilReveal = Math.floor(msUntilReveal / (1000 * 60 * 60));
                    const daysUntilReveal = Math.floor(hoursUntilReveal / 24);
                    const remainingHours = hoursUntilReveal % 24;

                    if (daysUntilReveal > 0) {
                      return (
                        <div className="text-[var(--text-xs)] text-[var(--text-muted)]">
                          Location reveals in <span className="text-[var(--primary)] font-medium">{daysUntilReveal}d {remainingHours}h</span>
                        </div>
                      );
                    }

                    return (
                      <div className="text-[var(--text-xs)] text-[var(--primary)] font-medium">
                        Location reveals in {hoursUntilReveal}h!
                      </div>
                    );
                  })()
                ) : (
                  <div className="text-[var(--text-xs)] text-[var(--text-muted)]">
                    Full address revealed 24h before
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Price */}
        <div className="flex items-center justify-between py-4 border-t border-b border-[var(--border-subtle)] mb-6">
          <span className="text-[var(--text-sm)] text-[var(--text-secondary)]">Price</span>
          <span className="text-[var(--text-lg)] font-semibold text-[var(--text-primary)]">
            ${space.price_cents / 100}
          </span>
        </div>

        {/* RSVP Button */}
        {!isPast && spotsLeft > 0 && (
          <div className="mb-6">
            {userInvitation?.status === 'accepted' ? (
              // Already confirmed
              <div className="bg-[var(--success-muted)] rounded-[var(--radius-lg)] p-4 text-center">
                <div className="flex items-center justify-center gap-2 text-[var(--success-text)] mb-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="font-medium">You're going!</span>
                </div>
                <p className="text-[var(--text-sm)] text-[var(--text-secondary)]">
                  We'll send the full address 24 hours before.
                </p>
              </div>
            ) : userInvitation?.status === 'declined' ? (
              // Declined
              <div className="bg-[var(--bg-subtle)] rounded-[var(--radius-lg)] p-4 text-center">
                <p className="text-[var(--text-sm)] text-[var(--text-secondary)]">
                  You declined this invitation. Contact the host if you changed your mind.
                </p>
              </div>
            ) : (
              // Show RSVP button
              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={() => handleRSVP()}
                loading={rsvpLoading}
                disabled={rsvpLoading || isPast || spotsLeft <= 0}
              >
                {rsvpLoading ? 'Processing...' : (
                  user ? 'Request to Join' : 'Sign in to Join'
                )}
              </Button>
            )}
          </div>
        )}

        {/* Sold out or past event message */}
        {(isPast || spotsLeft <= 0) && !userInvitation && (
          <div className="bg-[var(--bg-subtle)] rounded-[var(--radius-lg)] p-4 mb-6 text-center">
            <p className="text-[var(--text-sm)] text-[var(--text-secondary)]">
              {isPast ? 'This event has ended.' : 'This space is full. Check back later for cancellations.'}
            </p>
          </div>
        )}

        {/* How payment works hint */}
        {!isPast && spotsLeft > 0 && !userInvitation?.status && (
          <p className="text-[var(--text-xs)] text-[var(--text-muted)] text-center mb-6">
            Your card is authorized but only charged after you attend
          </p>
        )}

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
            download={`sms-${space.name.replace(/\s+/g, '-').toLowerCase()}.ics`}
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
      {space.description && (
        <Card className="p-5">
          <h3 className="text-[var(--text-sm)] font-medium text-[var(--text-primary)] mb-3">About this space</h3>
          <p className="text-[var(--text-sm)] text-[var(--text-secondary)] leading-relaxed whitespace-pre-line">
            {space.description}
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
              <p className="text-[var(--text-xs)] text-[var(--text-muted)]">What's shared in the space stays in the space.</p>
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

      {/* Pre-event Preparation - Only shown for confirmed attendees */}
      {userInvitation?.status === 'accepted' && !isPast && (
        <Card className="p-5 border-[var(--primary)] border bg-gradient-to-br from-[var(--primary)]/5 to-transparent">
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-5 h-5 text-[var(--primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
            </svg>
            <h3 className="text-[var(--text-sm)] font-medium text-[var(--primary)]">Prepare for Your Room</h3>
          </div>

          <div className="space-y-4">
            {/* Arrival tips */}
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-[var(--bg-subtle)] flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-[var(--text-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h4 className="text-[var(--text-sm)] font-medium text-[var(--text-primary)]">Arrive 5-10 minutes early</h4>
                <p className="text-[var(--text-xs)] text-[var(--text-muted)]">Get settled before introductions begin. The host will greet you at the door.</p>
              </div>
            </div>

            {/* What to bring */}
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-[var(--bg-subtle)] flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-[var(--text-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
              </div>
              <div>
                <h4 className="text-[var(--text-sm)] font-medium text-[var(--text-primary)]">What to bring</h4>
                <p className="text-[var(--text-xs)] text-[var(--text-muted)]">Just yourself and an open mind. Dress casually and comfortably—no need to impress.</p>
              </div>
            </div>

            {/* Mindset */}
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-[var(--bg-subtle)] flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-[var(--text-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                </svg>
              </div>
              <div>
                <h4 className="text-[var(--text-sm)] font-medium text-[var(--text-primary)]">The right mindset</h4>
                <p className="text-[var(--text-xs)] text-[var(--text-muted)]">Be curious, not performative. Ask questions. Listen. Everyone's here for the same thing—real connection.</p>
              </div>
            </div>

            {/* First time tip */}
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-[var(--bg-subtle)] flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-[var(--text-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                </svg>
              </div>
              <div>
                <h4 className="text-[var(--text-sm)] font-medium text-[var(--text-primary)]">First time?</h4>
                <p className="text-[var(--text-xs)] text-[var(--text-muted)]">It's normal to feel nervous. Most guests are too! The host will guide the conversation—just follow along.</p>
              </div>
            </div>

            {/* Get Directions - only if location is revealed */}
            {space.location_revealed && (
              <div className="pt-3 mt-3 border-t border-[var(--border-subtle)]">
                <div className="flex gap-2">
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(space.location_address)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-[var(--text-sm)] font-medium bg-[var(--primary)] text-white rounded-[var(--radius-md)] hover:bg-[var(--primary-hover)] transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                    </svg>
                    Get Directions
                  </a>
                </div>
                <p className="text-[var(--text-xs)] text-[var(--text-muted)] text-center mt-2">{space.location_address}</p>
              </div>
            )}
          </div>
        </Card>
      )}

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

  // Calculate end date for schema
  const endDate = new Date(spaceDate.getTime() + space.duration_minutes * 60 * 1000);

  return (
    <div className="min-h-screen bg-[var(--bg-base)]">
      {/* SEO Schemas */}
      <EventSchema
        name={space.name}
        description={space.description || `A ${tone} social gathering hosted by ${space.host?.name || 'SMS'}`}
        startDate={spaceDate.toISOString()}
        endDate={endDate.toISOString()}
        location={space.location_hint || 'Minneapolis, MN'}
        url={`https://strangersmeetingstrangers.com/spaces/${space.id}`}
        price={space.price_cents}
        capacity={space.capacity}
      />
      <BreadcrumbSchema
        items={[
          { name: 'Home', url: 'https://strangersmeetingstrangers.com' },
          { name: 'Discover', url: 'https://strangersmeetingstrangers.com/discover' },
          { name: space.name, url: `https://strangersmeetingstrangers.com/spaces/${space.id}` },
        ]}
      />

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
              {user ? (
                <UserMenu />
              ) : (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setShowLoginModal(true)}
                >
                  Sign In
                </Button>
              )}
            </div>
          </div>
        </PageContainer>
      </header>

      {/* Main Content */}
      <PageContainer className="py-8">
        {/* Page Title (Mobile) */}
        <div className="lg:hidden mb-6">
          <h1 className="text-[var(--text-2xl)] font-bold text-[var(--text-primary)] mb-2">{space.name}</h1>
          <div className="flex items-center gap-3">
            <CountdownBadge targetDate={spaceDate} size="sm" />
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
          name: space.host?.name || 'Host',
        }}
        spaceName={space.name}
        onSubmit={async (message) => {
          // In a real app, this would send the message via API
          console.log('Contact host message:', message);
          await new Promise((r) => setTimeout(r, 1000));
        }}
      />

      {/* Report Room Modal */}
      <ReportSpaceModal
        open={showReportModal}
        onClose={() => setShowReportModal(false)}
        spaceId={spaceId}
        spaceName={space.name}
        onSubmit={async (reason, category) => {
          // In a real app, this would submit the report via API
          console.log('Report:', { reason, category });
          await new Promise((r) => setTimeout(r, 1000));
        }}
      />

      {/* Login Modal */}
      <LoginModal
        open={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSuccess={handleLoginSuccess}
      />

      {/* Onboarding Reminder Modal */}
      <OnboardingReminderModal
        isOpen={showOnboardingReminder}
        onClose={() => setShowOnboardingReminder(false)}
        onContinueAnyway={handleContinueWithoutOnboarding}
      />
    </div>
  );
}
