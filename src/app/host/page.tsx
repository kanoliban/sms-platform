'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { Space, User } from '@/lib/supabase/types';
import { Button, Card } from '@/components/ui';
import { PageContainer } from '@/components/layout';
import { SpaceCard, StatsGrid, EmptyState, AppHeader } from '@/components/composed';

type SpaceTone = 'chill' | 'playful' | 'deep' | 'intense';

type SpaceWithCounts = Space & {
  accepted_count: number;
  total_invited: number;
};

// Check if Supabase is configured
const isSupabaseConfigured = () => {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
};

// Mock data for demo/preview mode
const MOCK_SPACES: SpaceWithCounts[] = [
  {
    id: 'demo-1',
    host_id: 'demo-host',
    name: 'Dinner & Deep Talks',
    description: 'An intimate dinner for strangers who want real conversation',
    tone: 'deep',
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
    accepted_count: 5,
    total_invited: 12,
  },
  {
    id: 'demo-2',
    host_id: 'demo-host',
    name: 'Strangers & Vinyl',
    description: 'Listen to records, meet new people',
    tone: 'chill',
    date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    time: '20:00',
    duration_minutes: 120,
    location_address: '456 Demo Ave, Minneapolis, MN',
    location_hint: 'Uptown',
    capacity: 12,
    price_cents: 2500,
    status: 'draft',
    location_revealed: false,
    feedback_requested: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    accepted_count: 0,
    total_invited: 0,
  },
  {
    id: 'demo-3',
    host_id: 'demo-host',
    name: 'Game Night Strangers',
    description: 'Board games and new friendships',
    tone: 'playful',
    date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    time: '18:00',
    duration_minutes: 150,
    location_address: '789 Fun Blvd, Minneapolis, MN',
    location_hint: 'Downtown',
    capacity: 10,
    price_cents: 2000,
    status: 'confirmed',
    location_revealed: true,
    feedback_requested: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    accepted_count: 8,
    total_invited: 10,
  },
];

const MOCK_HOST: User = {
  id: 'demo-host',
  phone: '+1234567890',
  email: 'demo@example.com',
  name: 'Demo Host',
  role: 'host',
  intent: 'human_connection',
  tone_preference: 'deep',
  trust_score_overall: 75,
  trust_reliability: 80,
  trust_social: 70,
  trust_safety: 75,
  trust_tenure: 50,
  trust_status: 'active',
  spaces_attended: 15,
  spaces_hosted: 8,
  no_shows: 0,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export default function HostDashboard() {
  const [spaces, setSpaces] = useState<SpaceWithCounts[]>([]);
  const [loading, setLoading] = useState(true);
  const [host, setHost] = useState<User | null>(null);
  const [demoMode, setDemoMode] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    // Check if Supabase is configured
    if (!isSupabaseConfigured()) {
      // Use mock data for demo
      setDemoMode(true);
      setHost(MOCK_HOST);
      setSpaces(MOCK_SPACES);
      setLoading(false);
      return;
    }

    // Dynamic import to avoid build-time errors
    const { createClient } = await import('@/lib/supabase/client');
    const supabase = createClient();

    // For MVP, we'll use a simple phone-based lookup
    // In production, this would use proper auth
    const storedPhone = localStorage.getItem('sms_host_phone');

    if (storedPhone) {
      const { data: user } = await supabase
        .from('users')
        .select('*')
        .eq('phone', storedPhone)
        .single();

      if (user) {
        setHost(user);

        // Get spaces with invitation counts
        const { data: spacesData } = await supabase
          .from('spaces')
          .select(`
            *,
            invitations (
              id,
              status
            )
          `)
          .eq('host_id', user.id)
          .order('date', { ascending: true });

        if (spacesData) {
          const spacesWithCounts = spacesData.map((space: Space & { invitations: { id: string; status: string }[] }) => ({
            ...space,
            accepted_count: space.invitations?.filter((i: { status: string }) => i.status === 'accepted').length || 0,
            total_invited: space.invitations?.length || 0,
          }));
          setSpaces(spacesWithCounts);
        }
      }
    }

    setLoading(false);
  }

  // Calculate stats
  const totalGuests = spaces.reduce((sum, r) => sum + r.accepted_count, 0);
  const upcomingSpaces = spaces.filter(r => r.status === 'open' || r.status === 'confirmed').length;
  const totalRevenue = spaces.reduce((sum, r) => sum + (r.accepted_count * r.price_cents), 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-base)] flex items-center justify-center">
        <div className="text-[var(--text-secondary)]">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-base)]">
      <AppHeader />

      {/* Demo Mode Banner */}
      {demoMode && (
        <div className="bg-[var(--warning-muted)] border-b border-[var(--warning-border)] px-6 py-3 text-center text-[var(--warning-text)] text-[var(--text-sm)]">
          Demo Mode - Supabase not configured
        </div>
      )}

      <PageContainer size="lg" className="py-8">
        {/* Welcome & Quick Action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-[var(--text-2xl)] font-bold text-[var(--text-primary)]">
              {host ? `Welcome back, ${host.name || 'Host'}` : 'Host Hub'}
            </h1>
            <p className="text-[var(--text-sm)] text-[var(--text-secondary)] mt-1">
              Manage your spaces and guests
            </p>
          </div>
          <Link href="/host/spaces/new">
            <Button variant="primary" size="lg">
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Create Space
            </Button>
          </Link>
        </div>

        {/* Stats Overview */}
        <StatsGrid
          stats={[
            {
              label: 'Total Spaces',
              value: spaces.length,
              icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                </svg>
              ),
            },
            {
              label: 'Upcoming',
              value: upcomingSpaces,
              icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                </svg>
              ),
              variant: 'highlight',
            },
            {
              label: 'Total Guests',
              value: totalGuests,
              icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                </svg>
              ),
            },
            {
              label: 'Revenue',
              value: `$${(totalRevenue / 100).toFixed(0)}`,
              icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ),
              variant: 'warning',
            },
          ]}
          className="mb-8"
        />

        {/* Room List */}
        <div className="mb-6">
          <h2 className="text-[var(--text-lg)] font-semibold text-[var(--text-primary)] mb-4">
            Your Spaces
          </h2>
        </div>

        {spaces.length === 0 ? (
          <EmptyState
            icon={
              <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
              </svg>
            }
            title="No spaces yet"
            description="Create your first space to start hosting strangers."
            action={{
              label: 'Create Your First Room',
              href: '/host/spaces/new',
              variant: 'primary',
            }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {spaces.map((space) => (
              <SpaceCard
                key={space.id}
                id={space.id}
                title={space.name}
                tone={space.tone as SpaceTone}
                date={space.date}
                time={space.time}
                location={space.location_hint || undefined}
                capacity={space.capacity}
                guestCount={space.accepted_count}
                hostName={host?.name || 'You'}
                href={`/host/spaces/${space.id}`}
                isLive={space.status === 'confirmed'}
              />
            ))}
          </div>
        )}

        {/* Host Onboarding (if new) */}
        {!host && (
          <Card className="mt-12 p-8 border-l-4 border-l-[var(--warning)]">
            <h2 className="text-[var(--text-xl)] font-semibold mb-4 text-[var(--warning-text)]">
              Become a Host
            </h2>
            <p className="text-[var(--text-secondary)] mb-6">
              To create spaces, you'll need to complete host onboarding.
              This includes reading the philosophy doc and understanding
              what it means to carry the SMS brand.
            </p>
            <Link href="/host/onboarding">
              <Button variant="secondary">
                Start Onboarding
              </Button>
            </Link>
          </Card>
        )}
      </PageContainer>
    </div>
  );
}
