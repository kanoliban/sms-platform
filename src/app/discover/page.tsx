'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { Space } from '@/lib/supabase/types';
import { Input, Card, Button } from '@/components/ui';
import { PageContainer } from '@/components/layout';
import { SpaceCard, EmptyState, UserMenu, LoginModal, NotificationsDropdown } from '@/components/composed';
import { useAuth } from '@/lib/auth/auth-context';
import { useNotifications } from '@/hooks/use-notifications';
import { createClient } from '@/lib/supabase/client';

type SpaceTone = 'chill' | 'playful' | 'deep' | 'intense';

type SpaceWithHost = Space & {
  host: { name: string };
  guest_count: number;
};

const TONE_OPTIONS: { value: SpaceTone | 'all'; label: string; color: string }[] = [
  { value: 'all', label: 'All Vibes', color: 'var(--text-secondary)' },
  { value: 'chill', label: 'Chill', color: 'var(--tone-chill)' },
  { value: 'playful', label: 'Playful', color: 'var(--tone-playful)' },
  { value: 'deep', label: 'Deep', color: 'var(--tone-deep)' },
  { value: 'intense', label: 'Intense', color: 'var(--tone-intense)' },
];

export default function DiscoverPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [spaces, setSpaces] = useState<SpaceWithHost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Notifications from hook
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications({ userId: user?.id });

  const handleNotificationClick = useCallback((notification: { id: string; space?: { id: string } }) => {
    markAsRead(notification.id);
    if (notification.space?.id) {
      router.push(`/spaces/${notification.space.id}`);
    }
  }, [markAsRead, router]);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTone, setSelectedTone] = useState<SpaceTone | 'all'>('all');
  const [priceFilter, setPriceFilter] = useState<'all' | 'free' | 'paid'>('all');

  useEffect(() => {
    loadSpaces();
  }, []);

  async function loadSpaces() {
    const supabase = createClient();

    // Get open spaces with host info
    const { data: spacesData } = await supabase
      .from('spaces')
      .select(`
        *,
        host:users!spaces_host_id_fkey(name),
        invitations(status)
      `)
      .eq('status', 'open')
      .gte('date', new Date().toISOString().split('T')[0])
      .order('date', { ascending: true });

    if (spacesData) {
      const roomsWithCounts = spacesData.map((space: Space & { host: { name: string }; invitations: { status: string }[] }) => ({
        ...space,
        guest_count: space.invitations?.filter((i: { status: string }) => i.status === 'accepted').length || 0,
      }));
      setSpaces(roomsWithCounts);
    }

    setLoading(false);
  }

  // Filter spaces
  const filteredSpaces = useMemo(() => {
    return spaces.filter((space) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          space.name.toLowerCase().includes(query) ||
          space.description?.toLowerCase().includes(query) ||
          space.location_hint?.toLowerCase().includes(query) ||
          space.host.name.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // Tone filter
      if (selectedTone !== 'all' && space.tone !== selectedTone) {
        return false;
      }

      // Price filter
      if (priceFilter === 'free' && space.price_cents > 0) {
        return false;
      }
      if (priceFilter === 'paid' && space.price_cents === 0) {
        return false;
      }

      return true;
    });
  }, [spaces, searchQuery, selectedTone, priceFilter]);

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
              <Link href="/my-spaces" className="text-[var(--text-sm)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                My Spaces
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

      {/* Hero Section */}
      <div className="border-b border-[var(--border-subtle)]">
        <PageContainer size="lg" className="py-12 text-center">
          <h1 className="text-[var(--text-3xl)] font-bold text-[var(--text-primary)] mb-3">
            Discover Spaces
          </h1>
          <p className="text-[var(--text-lg)] text-[var(--text-secondary)] max-w-2xl mx-auto">
            Find your next adventure with strangers in Minneapolis. Every space is a chance to meet someone new.
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
              placeholder="Search spaces, hosts, neighborhoods..."
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
            {filteredSpaces.length} space{filteredSpaces.length !== 1 ? 's' : ''} available
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

        {/* Space Grid */}
        {filteredSpaces.length === 0 ? (
          <Card className="p-12">
            <EmptyState
              icon={
                <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              }
              title="No spaces found"
              description="Check back soon for new spaces in your area."
            />
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSpaces.map((space) => (
              <SpaceCard
                key={space.id}
                id={space.id}
                title={space.name}
                tone={space.tone as SpaceTone}
                date={space.date}
                time={space.time}
                location={space.location_hint || undefined}
                capacity={space.capacity}
                guestCount={space.guest_count}
                hostName={space.host.name}
                href={`/spaces/${space.id}`}
              />
            ))}
          </div>
        )}

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <Card className="p-8 bg-gradient-to-br from-[var(--bg-surface)] to-[var(--bg-subtle)] border-[var(--border-default)]">
            <h2 className="text-[var(--text-xl)] font-semibold text-[var(--text-primary)] mb-3">
              Want to host your own space?
            </h2>
            <p className="text-[var(--text-secondary)] mb-6 max-w-md mx-auto">
              Create meaningful gatherings and meet interesting people in your neighborhood.
            </p>
            <Button variant="primary" size="lg" onClick={() => window.location.href = '/host/spaces/new'}>
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
