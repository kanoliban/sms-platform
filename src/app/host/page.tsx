'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { Space } from '@/lib/supabase/types';
import { Button } from '@/components/ui';
import { PageContainer } from '@/components/layout';
import { SpaceCard, StatsGrid, EmptyState, AppHeader } from '@/components/composed';
import { HostGuard, useHostUser } from '@/components/auth';
import { createClient } from '@/lib/supabase/client';

type SpaceTone = 'chill' | 'playful' | 'deep' | 'intense';

type SpaceWithCounts = Space & {
  accepted_count: number;
  total_invited: number;
};

function HostDashboardContent() {
  const host = useHostUser();
  const [spaces, setSpaces] = useState<SpaceWithCounts[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const supabase = createClient();

    // Get spaces with invitation counts for the authenticated host
    const { data: spacesData } = await supabase
      .from('spaces')
      .select(`
        *,
        invitations (
          id,
          status
        )
      `)
      .eq('host_id', host.id)
      .order('date', { ascending: true });

    if (spacesData) {
      const spacesWithCounts = spacesData.map((space: Space & { invitations: { id: string; status: string }[] }) => ({
        ...space,
        accepted_count: space.invitations?.filter((i: { status: string }) => i.status === 'accepted').length || 0,
        total_invited: space.invitations?.length || 0,
      }));
      setSpaces(spacesWithCounts);
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
        <div className="text-[var(--text-secondary)]">Loading spaces...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-base)]">
      <AppHeader />

      <PageContainer size="lg" className="py-8">
        {/* Welcome & Quick Action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-[var(--text-2xl)] font-bold text-[var(--text-primary)]">
              Welcome back, {host.name || 'Host'}
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
                hostName={host.name || 'You'}
                href={`/host/spaces/${space.id}`}
                isLive={space.status === 'confirmed'}
              />
            ))}
          </div>
        )}
      </PageContainer>
    </div>
  );
}

export default function HostDashboard() {
  return (
    <HostGuard>
      <HostDashboardContent />
    </HostGuard>
  );
}
