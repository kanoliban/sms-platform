'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { Space } from '@/lib/supabase/types';
import { Card, Badge, Tabs, TabsList, TabsTrigger, TabsContent, Button } from '@/components/ui';
import { PageContainer, Header } from '@/components/layout';
import { SpaceCard, EmptyState, UserMenu, LoginModal, NotificationsDropdown } from '@/components/composed';
import { useAuth } from '@/lib/auth/auth-context';
import { useNotifications } from '@/hooks/use-notifications';

type SpaceTone = 'chill' | 'playful' | 'deep' | 'intense';

type SpaceWithDetails = Space & {
  host: { name: string };
  guest_count: number;
  user_status: 'going' | 'invited' | 'attended' | 'missed';
};

// Check if Supabase is configured
const isSupabaseConfigured = () => {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
};

// Mock spaces for demo mode
const MOCK_SPACES: SpaceWithDetails[] = [
  {
    id: 'room-1',
    host_id: 'host-1',
    name: 'Dinner & Deep Talks',
    description: 'An intimate dinner for strangers who want real conversation.',
    tone: 'deep',
    date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
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
    host: { name: 'Sarah K.' },
    guest_count: 5,
    user_status: 'going',
  },
  {
    id: 'room-2',
    host_id: 'host-2',
    name: 'Strangers & Vinyl',
    description: 'Listen to records, share stories, meet new people.',
    tone: 'chill',
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    time: '20:00',
    duration_minutes: 120,
    location_address: '456 Demo Ave, Minneapolis, MN',
    location_hint: 'Uptown',
    capacity: 12,
    price_cents: 2500,
    status: 'open',
    location_revealed: false,
    feedback_requested: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    host: { name: 'Marcus T.' },
    guest_count: 8,
    user_status: 'invited',
  },
  {
    id: 'room-3',
    host_id: 'host-3',
    name: 'Game Night Strangers',
    description: 'Board games and new friendships.',
    tone: 'playful',
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    time: '18:00',
    duration_minutes: 150,
    location_address: '789 Fun Blvd, Minneapolis, MN',
    location_hint: 'Downtown',
    capacity: 10,
    price_cents: 2000,
    status: 'completed',
    location_revealed: true,
    feedback_requested: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    host: { name: 'Alex R.' },
    guest_count: 10,
    user_status: 'attended',
  },
  {
    id: 'room-4',
    host_id: 'host-4',
    name: 'Morning Coffee Club',
    description: 'Start your day meeting new people over coffee.',
    tone: 'chill',
    date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    time: '08:00',
    duration_minutes: 90,
    location_address: '321 Coffee St, Minneapolis, MN',
    location_hint: 'North Loop',
    capacity: 8,
    price_cents: 1500,
    status: 'completed',
    location_revealed: true,
    feedback_requested: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    host: { name: 'Jordan P.' },
    guest_count: 7,
    user_status: 'attended',
  },
];

export default function MyRoomsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [spaces, setSpaces] = useState<SpaceWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [demoMode, setDemoMode] = useState(false);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Notifications from hook
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications({ userId: user?.id });

  const handleNotificationClick = useCallback((notification: { id: string; space?: { id: string } }) => {
    markAsRead(notification.id);
    if (notification.space?.id) {
      router.push(`/spaces/${notification.space.id}`);
    }
  }, [markAsRead, router]);

  useEffect(() => {
    if (!authLoading) {
      loadSpaces();
    }
  }, [user, authLoading]);

  async function loadSpaces() {
    if (!isSupabaseConfigured()) {
      setDemoMode(true);
      setSpaces(MOCK_SPACES);
      setLoading(false);
      return;
    }

    // If no user, show empty state (will prompt to sign in)
    if (!user) {
      setLoading(false);
      return;
    }

    const { createClient } = await import('@/lib/supabase/client');
    const supabase = createClient();

    // Get user's invitations with room details
    const { data: invitations } = await supabase
      .from('invitations')
      .select(`
        status,
        attended,
        space:spaces(
          *,
          host:users!spaces_host_id_fkey(name)
        )
      `)
      .eq('user_id', user.id);

    if (invitations) {
      const spacesWithStatus = invitations
        .filter((inv): inv is typeof inv & { space: Space & { host: { name: string } } } => inv.space !== null)
        .map((inv) => {
          let userStatus: 'going' | 'invited' | 'attended' | 'missed';
          if (inv.attended === true) {
            userStatus = 'attended';
          } else if (inv.attended === false) {
            userStatus = 'missed';
          } else if (inv.status === 'accepted') {
            userStatus = 'going';
          } else {
            userStatus = 'invited';
          }

          return {
            ...inv.space,
            guest_count: 0, // Would need additional query
            user_status: userStatus,
          };
        });

      setSpaces(spacesWithStatus);
    }

    setLoading(false);
  }

  // Filter spaces by tab
  const upcomingSpaces = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return spaces.filter(r => r.date >= today && (r.user_status === 'going' || r.user_status === 'invited'));
  }, [spaces]);

  const pastRooms = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return spaces.filter(r => r.date < today || r.user_status === 'attended' || r.user_status === 'missed');
  }, [spaces]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'going':
        return <Badge variant="going" size="sm">Going</Badge>;
      case 'invited':
        return <Badge variant="invited" size="sm">Invited</Badge>;
      case 'attended':
        return <Badge variant="success" size="sm">Attended</Badge>;
      case 'missed':
        return <Badge variant="error" size="sm">Missed</Badge>;
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-[var(--bg-base)] flex items-center justify-center">
        <div className="text-[var(--text-secondary)]">Loading...</div>
      </div>
    );
  }

  // Show sign-in prompt if not authenticated
  if (!user && !demoMode) {
    return (
      <div className="min-h-screen bg-[var(--bg-base)]">
        <Header />
        <PageContainer size="md" className="py-12">
          <Card className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[var(--bg-subtle)] flex items-center justify-center">
              <svg className="w-8 h-8 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
            </div>
            <h1 className="text-[var(--text-xl)] font-semibold text-[var(--text-primary)] mb-3">
              Sign in to see your spaces
            </h1>
            <p className="text-[var(--text-secondary)] mb-6">
              Track your upcoming spaces and past experiences all in one place.
            </p>
            <Button variant="primary" size="lg" onClick={() => setShowLoginModal(true)}>
              Sign In
            </Button>
          </Card>
        </PageContainer>
        <LoginModal
          open={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          onSuccess={() => {
            setShowLoginModal(false);
            loadSpaces();
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-base)]">
      {/* Custom Header with UserMenu */}
      <header className="border-b border-[var(--border-subtle)] sticky top-0 bg-[var(--bg-base)]/95 backdrop-blur z-10">
        <PageContainer>
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="font-bold italic text-xl tracking-tight text-[var(--text-primary)] hover:opacity-80 transition-opacity">
              SMS
            </Link>
            <div className="flex items-center gap-3">
              {user && (
                <NotificationsDropdown
                  notifications={notifications}
                  unreadCount={unreadCount}
                  onMarkAllRead={markAllAsRead}
                  onMarkRead={markAsRead}
                  onNotificationClick={handleNotificationClick}
                />
              )}
              {user ? (
                <UserMenu />
              ) : (
                <Button variant="primary" size="sm" onClick={() => setShowLoginModal(true)}>
                  Sign In
                </Button>
              )}
            </div>
          </div>
        </PageContainer>
      </header>

      {/* Demo Mode Banner */}
      {demoMode && (
        <div className="bg-[var(--warning-muted)] border-b border-[var(--warning-border)] px-6 py-3 text-center text-[var(--warning-text)] text-[var(--text-sm)]">
          Demo Mode - Supabase not configured
        </div>
      )}

      <PageContainer size="lg" className="py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-[var(--text-2xl)] font-bold text-[var(--text-primary)]">
              My Spaces
            </h1>
            <p className="text-[var(--text-sm)] text-[var(--text-secondary)] mt-1">
              Track your upcoming spaces and past experiences
            </p>
          </div>
          <Link href="/discover">
            <Button variant="primary" size="md">
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              Find Rooms
            </Button>
          </Link>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="upcoming">
              Upcoming
              {upcomingSpaces.length > 0 && (
                <Badge variant="primary" size="sm" className="ml-2">
                  {upcomingSpaces.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="past">
              Past
              {pastRooms.length > 0 && (
                <Badge variant="default" size="sm" className="ml-2">
                  {pastRooms.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Upcoming Rooms */}
          <TabsContent value="upcoming">
            {upcomingSpaces.length === 0 ? (
              <Card className="p-12">
                <EmptyState
                  icon={
                    <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                    </svg>
                  }
                  title="No upcoming spaces"
                  description="You haven't joined any spaces yet. Discover rooms near you and start meeting strangers."
                  action={{
                    label: 'Discover Spaces',
                    href: '/discover',
                    variant: 'primary',
                  }}
                />
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcomingSpaces.map((space) => (
                  <div key={space.id} className="relative">
                    <div className="absolute top-4 right-4 z-10">
                      {getStatusBadge(space.user_status)}
                    </div>
                    <SpaceCard
                      id={space.id}
                      title={space.name}
                      tone={space.tone as SpaceTone}
                      date={space.date}
                      time={space.time}
                      location={space.location_revealed && space.user_status === 'going' ? space.location_address : space.location_hint || undefined}
                      capacity={space.capacity}
                      guestCount={space.guest_count}
                      hostName={space.host.name}
                      href={`/spaces/${space.id}`}
                    />
                    {/* Show directions when location is revealed */}
                    {space.location_revealed && space.user_status === 'going' && (
                      <div className="mt-2 p-3 rounded-[var(--radius-md)] bg-[var(--success-muted)] border border-[var(--success-border)]">
                        <div className="flex items-center gap-2 mb-2">
                          <svg className="w-4 h-4 text-[var(--success-text)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                          </svg>
                          <span className="text-[var(--text-xs)] font-medium text-[var(--success-text)] uppercase tracking-wide">Location Revealed</span>
                        </div>
                        <div className="flex gap-3">
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(space.location_address)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-[var(--text-xs)] text-[var(--success-text)] hover:underline flex items-center gap-1"
                          >
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                            </svg>
                            Google Maps
                          </a>
                          <a
                            href={`http://maps.apple.com/?address=${encodeURIComponent(space.location_address)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-[var(--text-xs)] text-[var(--success-text)] hover:underline flex items-center gap-1"
                          >
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                            </svg>
                            Apple Maps
                          </a>
                        </div>
                      </div>
                    )}
                    {/* Show countdown when location not yet revealed */}
                    {!space.location_revealed && space.user_status === 'going' && (
                      (() => {
                        const spaceDate = new Date(`${space.date}T${space.time}`);
                        const revealTime = new Date(spaceDate.getTime() - 24 * 60 * 60 * 1000);
                        const now = new Date();
                        const msUntilReveal = revealTime.getTime() - now.getTime();

                        if (msUntilReveal <= 0) {
                          return (
                            <div className="mt-2 p-2 rounded-[var(--radius-md)] bg-[var(--warning-muted)] border border-[var(--warning-border)]">
                              <div className="flex items-center gap-2">
                                <svg className="w-4 h-4 text-[var(--warning-text)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="text-[var(--text-xs)] text-[var(--warning-text)]">Location reveals shortly...</span>
                              </div>
                            </div>
                          );
                        }

                        const hoursUntilReveal = Math.floor(msUntilReveal / (1000 * 60 * 60));
                        const daysUntilReveal = Math.floor(hoursUntilReveal / 24);
                        const remainingHours = hoursUntilReveal % 24;

                        const timeText = daysUntilReveal > 0
                          ? `${daysUntilReveal}d ${remainingHours}h`
                          : `${hoursUntilReveal}h`;

                        return (
                          <div className="mt-2 p-2 rounded-[var(--radius-md)] bg-[var(--bg-subtle)] border border-[var(--border-subtle)]">
                            <div className="flex items-center gap-2">
                              <svg className="w-4 h-4 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                              </svg>
                              <span className="text-[var(--text-xs)] text-[var(--text-muted)]">
                                Location reveals in <span className="text-[var(--primary)] font-medium">{timeText}</span>
                              </span>
                            </div>
                          </div>
                        );
                      })()
                    )}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Past Rooms */}
          <TabsContent value="past">
            {pastRooms.length === 0 ? (
              <Card className="p-12">
                <EmptyState
                  icon={
                    <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  }
                  title="No past spaces"
                  description="Once you attend rooms, they'll appear here so you can look back on your experiences."
                />
              </Card>
            ) : (
              <div className="space-y-4">
                {pastRooms.map((space) => (
                  <Link key={space.id} href={`/spaces/${space.id}`}>
                    <Card className="p-5 hover:border-[var(--border-strong)] transition-colors cursor-pointer">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-[var(--text-base)] font-semibold text-[var(--text-primary)]">
                              {space.name}
                            </h3>
                            {getStatusBadge(space.user_status)}
                          </div>
                          <div className="flex flex-wrap items-center gap-3 text-[var(--text-sm)] text-[var(--text-secondary)]">
                            <span>{formatDate(space.date)}</span>
                            <span className="text-[var(--text-muted)]">at</span>
                            <span>{space.time}</span>
                            {space.location_hint && (
                              <>
                                <span className="text-[var(--text-muted)]">in</span>
                                <span>{space.location_hint}</span>
                              </>
                            )}
                          </div>
                          <p className="text-[var(--text-sm)] text-[var(--text-muted)] mt-2">
                            Hosted by {space.host.name}
                          </p>
                        </div>
                        <div className="flex-shrink-0">
                          <svg className="w-5 h-5 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                          </svg>
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </PageContainer>

      {/* Login Modal */}
      <LoginModal
        open={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSuccess={() => {
          setShowLoginModal(false);
          loadSpaces();
        }}
      />
    </div>
  );
}
