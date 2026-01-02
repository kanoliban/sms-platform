'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { Room } from '@/lib/supabase/types';
import { Input, Card, Badge, Button } from '@/components/ui';
import { PageContainer } from '@/components/layout';
import { RoomCard, EmptyState, UserMenu, LoginModal, NotificationsDropdown, type Notification } from '@/components/composed';
import { useAuth } from '@/lib/auth/auth-context';

// Demo notifications
const DEMO_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    type: 'reminder',
    title: 'Room Tomorrow',
    message: 'Dinner & Deep Talks is tomorrow at 7 PM',
    timestamp: '2h ago',
    read: false,
    room: { id: 'demo-1', name: 'Dinner & Deep Talks' },
  },
  {
    id: '2',
    type: 'update',
    title: 'Location Revealed',
    message: 'The location for Game Night has been revealed! Check it out.',
    timestamp: 'Yesterday',
    read: false,
    room: { id: 'demo-3', name: 'Game Night Strangers' },
  },
  {
    id: '3',
    type: 'invite_accepted',
    title: 'You\'re in!',
    message: 'Your request to join Strangers & Vinyl was approved',
    timestamp: '3 days ago',
    read: true,
    room: { id: 'demo-2', name: 'Strangers & Vinyl' },
  },
];

type RoomTone = 'chill' | 'playful' | 'deep' | 'intense';

type RoomWithHost = Room & {
  host: { name: string };
  guest_count: number;
};

// Check if Supabase is configured
const isSupabaseConfigured = () => {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
};

// Mock rooms for demo mode
const MOCK_ROOMS: RoomWithHost[] = [
  {
    id: 'demo-1',
    host_id: 'host-1',
    name: 'Dinner & Deep Talks',
    description: 'An intimate dinner for strangers who want real conversation. No small talk, just the good stuff.',
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
  },
  {
    id: 'demo-2',
    host_id: 'host-2',
    name: 'Strangers & Vinyl',
    description: 'Listen to records, share stories, meet new people. Bring your favorite album.',
    tone: 'chill',
    date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
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
  },
  {
    id: 'demo-3',
    host_id: 'host-3',
    name: 'Game Night Strangers',
    description: 'Board games and new friendships. All skill levels welcome.',
    tone: 'playful',
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    time: '18:00',
    duration_minutes: 150,
    location_address: '789 Fun Blvd, Minneapolis, MN',
    location_hint: 'Downtown',
    capacity: 10,
    price_cents: 2000,
    status: 'open',
    location_revealed: false,
    feedback_requested: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    host: { name: 'Alex R.' },
    guest_count: 6,
  },
  {
    id: 'demo-4',
    host_id: 'host-4',
    name: 'Debate Club for Strangers',
    description: 'Structured debates on hot topics. Come with opinions, leave with friends.',
    tone: 'intense',
    date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    time: '19:30',
    duration_minutes: 120,
    location_address: '321 Debate Way, Minneapolis, MN',
    location_hint: 'North Loop',
    capacity: 16,
    price_cents: 3000,
    status: 'open',
    location_revealed: false,
    feedback_requested: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    host: { name: 'Jordan P.' },
    guest_count: 10,
  },
  {
    id: 'demo-5',
    host_id: 'host-5',
    name: 'Sunrise Yoga & Coffee',
    description: 'Start your morning with strangers. Yoga, meditation, then great coffee.',
    tone: 'chill',
    date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    time: '06:30',
    duration_minutes: 90,
    location_address: '555 Zen St, Minneapolis, MN',
    location_hint: 'Loring Park',
    capacity: 15,
    price_cents: 1500,
    status: 'open',
    location_revealed: false,
    feedback_requested: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    host: { name: 'Maya L.' },
    guest_count: 12,
  },
  {
    id: 'demo-6',
    host_id: 'host-6',
    name: 'Strangers Cook Together',
    description: 'Learn to make authentic Thai food with other curious strangers.',
    tone: 'playful',
    date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    time: '17:00',
    duration_minutes: 180,
    location_address: '888 Kitchen Lane, Minneapolis, MN',
    location_hint: 'Seward',
    capacity: 8,
    price_cents: 6500,
    status: 'open',
    location_revealed: false,
    feedback_requested: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    host: { name: 'Chris N.' },
    guest_count: 4,
  },
];

const TONE_OPTIONS: { value: RoomTone | 'all'; label: string; color: string }[] = [
  { value: 'all', label: 'All Vibes', color: 'var(--text-secondary)' },
  { value: 'chill', label: 'Chill', color: 'var(--tone-chill)' },
  { value: 'playful', label: 'Playful', color: 'var(--tone-playful)' },
  { value: 'deep', label: 'Deep', color: 'var(--tone-deep)' },
  { value: 'intense', label: 'Intense', color: 'var(--tone-intense)' },
];

export default function DiscoverPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [rooms, setRooms] = useState<RoomWithHost[]>([]);
  const [loading, setLoading] = useState(true);
  const [demoMode, setDemoMode] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Notifications state
  const [notifications, setNotifications] = useState<Notification[]>(DEMO_NOTIFICATIONS);
  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const handleMarkRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const handleNotificationClick = useCallback((notification: Notification) => {
    handleMarkRead(notification.id);
    if (notification.room?.id) {
      router.push(`/rooms/${notification.room.id}`);
    }
  }, [handleMarkRead, router]);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTone, setSelectedTone] = useState<RoomTone | 'all'>('all');
  const [priceFilter, setPriceFilter] = useState<'all' | 'free' | 'paid'>('all');

  useEffect(() => {
    loadRooms();
  }, []);

  async function loadRooms() {
    if (!isSupabaseConfigured()) {
      setDemoMode(true);
      setRooms(MOCK_ROOMS);
      setLoading(false);
      return;
    }

    const { createClient } = await import('@/lib/supabase/client');
    const supabase = createClient();

    // Get open rooms with host info
    const { data: roomsData } = await supabase
      .from('rooms')
      .select(`
        *,
        host:users!rooms_host_id_fkey(name),
        invitations(status)
      `)
      .eq('status', 'open')
      .gte('date', new Date().toISOString().split('T')[0])
      .order('date', { ascending: true });

    if (roomsData) {
      const roomsWithCounts = roomsData.map((room: Room & { host: { name: string }; invitations: { status: string }[] }) => ({
        ...room,
        guest_count: room.invitations?.filter((i: { status: string }) => i.status === 'accepted').length || 0,
      }));
      setRooms(roomsWithCounts);
    }

    setLoading(false);
  }

  // Filter rooms
  const filteredRooms = useMemo(() => {
    return rooms.filter((room) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          room.name.toLowerCase().includes(query) ||
          room.description?.toLowerCase().includes(query) ||
          room.location_hint?.toLowerCase().includes(query) ||
          room.host.name.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // Tone filter
      if (selectedTone !== 'all' && room.tone !== selectedTone) {
        return false;
      }

      // Price filter
      if (priceFilter === 'free' && room.price_cents > 0) {
        return false;
      }
      if (priceFilter === 'paid' && room.price_cents === 0) {
        return false;
      }

      return true;
    });
  }, [rooms, searchQuery, selectedTone, priceFilter]);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-base)] flex items-center justify-center">
        <div className="text-[var(--text-secondary)]">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-base)]">
      {/* Header with UserMenu */}
      <header className="sticky top-0 z-[var(--z-header)] bg-[var(--bg-base)]/80 backdrop-blur-md border-b border-[var(--border-subtle)]">
        <PageContainer>
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="font-bold text-xl tracking-tight text-[var(--text-primary)] hover:opacity-80 transition-opacity">
              SMS
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/discover" className="text-[var(--text-sm)] text-[var(--text-primary)] font-medium">
                Discover
              </Link>
              <Link href="/my-rooms" className="text-[var(--text-sm)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                My Rooms
              </Link>
              <Link href="/profile" className="text-[var(--text-sm)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                Profile
              </Link>
            </nav>
            <div className="flex items-center gap-3">
              {user && (
                <NotificationsDropdown
                  notifications={notifications}
                  unreadCount={unreadCount}
                  onMarkAllRead={handleMarkAllRead}
                  onMarkRead={handleMarkRead}
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

      {/* Hero Section */}
      <div className="border-b border-[var(--border-subtle)]">
        <PageContainer size="lg" className="py-12 text-center">
          <h1 className="text-[var(--text-3xl)] font-bold text-[var(--text-primary)] mb-3">
            Discover Rooms
          </h1>
          <p className="text-[var(--text-lg)] text-[var(--text-secondary)] max-w-2xl mx-auto">
            Find your next adventure with strangers in Minneapolis. Every room is a chance to meet someone new.
          </p>
        </PageContainer>
      </div>

      <PageContainer size="lg" className="py-8">
        {/* Search & Filters */}
        <div className="mb-8">
          {/* Search */}
          <div className="relative mb-6">
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <Input
              type="text"
              placeholder="Search rooms, hosts, neighborhoods..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 py-3"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4">
            {/* Tone Filter */}
            <div className="flex flex-wrap gap-2">
              {TONE_OPTIONS.map((tone) => (
                <button
                  key={tone.value}
                  type="button"
                  onClick={() => setSelectedTone(tone.value)}
                  className={`
                    inline-flex items-center gap-2 px-4 py-2
                    rounded-full border text-[var(--text-sm)] font-medium
                    transition-all duration-[var(--duration-normal)]
                    ${selectedTone === tone.value
                      ? 'bg-[var(--primary)] border-[var(--primary)] text-white'
                      : 'bg-[var(--bg-subtle)] border-[var(--border-default)] text-[var(--text-secondary)] hover:border-[var(--border-strong)]'
                    }
                  `}
                >
                  {tone.value !== 'all' && (
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: tone.color }}
                    />
                  )}
                  {tone.label}
                </button>
              ))}
            </div>

            {/* Price Filter */}
            <div className="flex gap-2 ml-auto">
              {(['all', 'free', 'paid'] as const).map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setPriceFilter(filter)}
                  className={`
                    px-4 py-2 rounded-full border text-[var(--text-sm)] font-medium
                    transition-all duration-[var(--duration-normal)]
                    ${priceFilter === filter
                      ? 'bg-[var(--bg-surface)] border-[var(--border-strong)] text-[var(--text-primary)]'
                      : 'bg-transparent border-[var(--border-subtle)] text-[var(--text-muted)] hover:border-[var(--border-default)]'
                    }
                  `}
                >
                  {filter === 'all' && 'Any Price'}
                  {filter === 'free' && 'Free'}
                  {filter === 'paid' && 'Paid'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-[var(--text-sm)] text-[var(--text-secondary)]">
            {filteredRooms.length} room{filteredRooms.length !== 1 ? 's' : ''} available
          </p>
          {(searchQuery || selectedTone !== 'all' || priceFilter !== 'all') && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedTone('all');
                setPriceFilter('all');
              }}
              className="text-[var(--text-sm)] text-[var(--primary)] hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Room Grid */}
        {filteredRooms.length === 0 ? (
          <Card className="p-12">
            <EmptyState
              icon={
                <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              }
              title="No rooms found"
              description={
                searchQuery || selectedTone !== 'all' || priceFilter !== 'all'
                  ? "Try adjusting your filters to find more rooms."
                  : "Check back soon for new rooms in your area."
              }
            />
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRooms.map((room) => (
              <RoomCard
                key={room.id}
                id={room.id}
                title={room.name}
                tone={room.tone as RoomTone}
                date={room.date}
                time={room.time}
                location={room.location_hint || undefined}
                capacity={room.capacity}
                guestCount={room.guest_count}
                hostName={room.host.name}
                href={`/rooms/${room.id}`}
              />
            ))}
          </div>
        )}

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <Card className="p-8 bg-gradient-to-br from-[var(--bg-surface)] to-[var(--bg-subtle)] border-[var(--border-default)]">
            <h2 className="text-[var(--text-xl)] font-semibold text-[var(--text-primary)] mb-3">
              Want to host your own room?
            </h2>
            <p className="text-[var(--text-secondary)] mb-6 max-w-md mx-auto">
              Create meaningful gatherings and meet interesting people in your neighborhood.
            </p>
            <Button variant="primary" size="lg" onClick={() => window.location.href = '/host/rooms/new'}>
              Become a Host
            </Button>
          </Card>
        </div>
      </PageContainer>

      {/* Login Modal */}
      <LoginModal
        open={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSuccess={() => {
          setShowLoginModal(false);
          window.location.reload();
        }}
      />
    </div>
  );
}
