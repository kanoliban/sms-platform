'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import type { Space } from '@/lib/supabase/types';
import { Card, Progress } from '@/components/ui';
import { PageContainer } from '@/components/layout';
import { StatsCard } from '@/components/composed';

type SpaceTone = 'chill' | 'playful' | 'deep' | 'intense';

interface SpaceInsights {
  overview: {
    totalGuests: number;
    confirmed: number;
    conversionRate: number;
    revenue: number;
  };
  engagement: {
    pageViews: number;
    uniqueVisitors: number;
    shares: number;
    avgTimeToRsvp: string;
  };
  guestBreakdown: {
    status: string;
    label: string;
    count: number;
    percentage: number;
    color: string;
  }[];
  inviteStats: {
    sent: number;
    accepted: number;
    declined: number;
    outstanding: number;
  };
}

// Check if Supabase is configured
const isSupabaseConfigured = () => {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
};

// Mock data for demo mode
const MOCK_SPACE: Space = {
  id: 'demo-1',
  host_id: 'demo-host',
  name: 'Dinner & Deep Talks',
  description: 'An intimate dinner for strangers who want real conversation.',
  tone: 'deep' as SpaceTone,
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
};

const MOCK_INSIGHTS: SpaceInsights = {
  overview: {
    totalGuests: 24,
    confirmed: 6,
    conversionRate: 75,
    revenue: 270,
  },
  engagement: {
    pageViews: 342,
    uniqueVisitors: 187,
    shares: 12,
    avgTimeToRsvp: '2.4 hours',
  },
  guestBreakdown: [
    { status: 'going', label: 'Going', count: 6, percentage: 75, color: 'var(--status-going-bg)' },
    { status: 'invited', label: 'Invited', count: 3, percentage: 37.5, color: 'var(--status-invited-bg)' },
    { status: 'pending', label: 'Pending Approval', count: 2, percentage: 25, color: 'var(--status-pending-bg)' },
    { status: 'waitlist', label: 'Waitlist', count: 4, percentage: 50, color: 'var(--status-waitlist-bg)' },
    { status: 'declined', label: 'Declined', count: 9, percentage: 37.5, color: 'var(--status-declined-bg)' },
  ],
  inviteStats: {
    sent: 15,
    accepted: 8,
    declined: 3,
    outstanding: 4,
  },
};

export default function InsightsPage() {
  const params = useParams();
  const spaceId = params.id as string;

  const [space, setSpace] = useState<Space | null>(null);
  const [insights, setInsights] = useState<SpaceInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [demoMode, setDemoMode] = useState(false);

  useEffect(() => {
    loadInsights();
  }, [spaceId]);

  async function loadInsights() {
    if (!isSupabaseConfigured() || spaceId.startsWith('demo-')) {
      setDemoMode(true);
      setSpace(MOCK_SPACE);
      setInsights(MOCK_INSIGHTS);
      setLoading(false);
      return;
    }

    try {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();

      const { data: spaceData } = await supabase
        .from('spaces')
        .select('*')
        .eq('id', spaceId)
        .single();

      if (spaceData) {
        setSpace(spaceData);
      }

      // In a real app, we'd fetch insights from an analytics endpoint
      // For now, use mock data
      setInsights(MOCK_INSIGHTS);
    } catch (err) {
      console.error('Failed to load insights:', err);
    }

    setLoading(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-base)] flex items-center justify-center">
        <div className="text-[var(--text-secondary)]">Loading...</div>
      </div>
    );
  }

  if (!space || !insights) {
    return (
      <div className="min-h-screen bg-[var(--bg-base)] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-[var(--text-2xl)] text-[var(--text-primary)] mb-4">Space not found</h1>
          <Link href="/host" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
            Go to Host Hub
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-base)]">
      {/* Demo Banner */}
      {demoMode && (
        <div className="bg-[var(--warning-muted)] border-b border-[var(--warning-border)] px-6 py-3 text-center text-[var(--warning-text)] text-[var(--text-sm)]">
          Demo Mode — Analytics data is simulated
        </div>
      )}

      {/* Header */}
      <header className="border-b border-[var(--border-subtle)] sticky top-0 bg-[var(--bg-base)]/95 backdrop-blur z-10">
        <PageContainer>
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Link href="/" className="font-bold italic text-xl tracking-tight text-[var(--text-primary)] hover:opacity-80 transition-opacity">
                SMS
              </Link>
              <span className="text-[var(--text-muted)]">/</span>
              <Link href={`/host/spaces/${spaceId}`} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                {space.name}
              </Link>
              <span className="text-[var(--text-muted)]">/</span>
              <span className="text-[var(--text-primary)]">Insights</span>
            </div>
          </div>
        </PageContainer>
      </header>

      {/* Main Content */}
      <PageContainer className="py-8">
        <div className="space-y-8">
          {/* Page Title */}
          <div>
            <h1 className="text-[var(--text-2xl)] font-bold text-[var(--text-primary)]">Space Insights</h1>
            <p className="text-[var(--text-sm)] text-[var(--text-muted)] mt-1">
              Track performance and engagement for {space.name}
            </p>
          </div>

          {/* Overview Stats */}
          <section>
            <h2 className="text-[var(--text-lg)] font-semibold text-[var(--text-primary)] mb-4">Overview</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatsCard
                label="Total Guests"
                value={insights.overview.totalGuests}
                icon={
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                  </svg>
                }
                variant="default"
              />
              <StatsCard
                label={`Confirmed (of ${space.capacity})`}
                value={insights.overview.confirmed}
                icon={
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
                variant="success"
              />
              <StatsCard
                label="Conversion Rate"
                value={`${insights.overview.conversionRate}%`}
                icon={
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
                  </svg>
                }
                variant="highlight"
              />
              <StatsCard
                label="Revenue"
                value={`$${insights.overview.revenue}`}
                icon={
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
                variant="highlight"
              />
            </div>
          </section>

          {/* Engagement Stats */}
          <section>
            <h2 className="text-[var(--text-lg)] font-semibold text-[var(--text-primary)] mb-4">Engagement</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatsCard
                label="Page Views"
                value={insights.engagement.pageViews}
                icon={
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                }
                variant="default"
              />
              <StatsCard
                label="Unique Visitors"
                value={insights.engagement.uniqueVisitors}
                icon={
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                }
                variant="default"
              />
              <StatsCard
                label="Shares"
                value={insights.engagement.shares}
                icon={
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
                  </svg>
                }
                variant="highlight"
              />
              <StatsCard
                label="Avg. Time to RSVP"
                value={insights.engagement.avgTimeToRsvp}
                icon={
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
                variant="default"
              />
            </div>
          </section>

          {/* Guest Breakdown */}
          <section>
            <Card className="p-6">
              <h2 className="text-[var(--text-lg)] font-semibold text-[var(--text-primary)] mb-6">Guest Breakdown</h2>
              <div className="space-y-4">
                {insights.guestBreakdown.map((item) => (
                  <div key={item.status}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-[var(--text-sm)] text-[var(--text-primary)]">
                          {item.label}
                        </span>
                      </div>
                      <span className="text-[var(--text-sm)] font-medium text-[var(--text-primary)]">
                        {item.count}
                      </span>
                    </div>
                    <Progress
                      value={item.percentage}
                      size="sm"
                      className="h-2"
                    />
                  </div>
                ))}
              </div>
            </Card>
          </section>

          {/* Invite Funnel */}
          <section>
            <Card className="p-6">
              <h2 className="text-[var(--text-lg)] font-semibold text-[var(--text-primary)] mb-6">Invite Funnel</h2>
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center p-4 bg-[var(--bg-subtle)] rounded-[var(--radius-lg)]">
                  <div className="text-[var(--text-2xl)] font-bold text-[var(--text-primary)]">
                    {insights.inviteStats.sent}
                  </div>
                  <div className="text-[var(--text-sm)] text-[var(--text-muted)] mt-1">Sent</div>
                </div>
                <div className="text-center p-4 bg-[var(--status-going-bg)] rounded-[var(--radius-lg)]">
                  <div className="text-[var(--text-2xl)] font-bold text-[var(--status-going-text)]">
                    {insights.inviteStats.accepted}
                  </div>
                  <div className="text-[var(--text-sm)] text-[var(--status-going-text)] mt-1">Accepted</div>
                </div>
                <div className="text-center p-4 bg-[var(--status-declined-bg)] rounded-[var(--radius-lg)]">
                  <div className="text-[var(--text-2xl)] font-bold text-[var(--status-declined-text)]">
                    {insights.inviteStats.declined}
                  </div>
                  <div className="text-[var(--text-sm)] text-[var(--status-declined-text)] mt-1">Declined</div>
                </div>
                <div className="text-center p-4 bg-[var(--status-invited-bg)] rounded-[var(--radius-lg)]">
                  <div className="text-[var(--text-2xl)] font-bold text-[var(--status-invited-text)]">
                    {insights.inviteStats.outstanding}
                  </div>
                  <div className="text-[var(--text-sm)] text-[var(--status-invited-text)] mt-1">Outstanding</div>
                </div>
              </div>

              {/* Funnel Visualization */}
              <div className="mt-6 flex items-center justify-center gap-2 text-[var(--text-sm)] text-[var(--text-muted)]">
                <span>Sent</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
                <span className="text-[var(--status-going-text)]">Accepted</span>
                <span>/</span>
                <span className="text-[var(--status-declined-text)]">Declined</span>
                <span>/</span>
                <span className="text-[var(--status-invited-text)]">Outstanding</span>
              </div>
            </Card>
          </section>

          {/* Conversion Tips */}
          <section>
            <Card className="p-6 border-[var(--primary-muted)] bg-[var(--primary-muted)]/30">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-[var(--radius-lg)] bg-[var(--primary-muted)] flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-[var(--primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-[var(--text-base)] font-semibold text-[var(--text-primary)] mb-1">
                    Boost Your Conversion
                  </h3>
                  <p className="text-[var(--text-sm)] text-[var(--text-secondary)] mb-3">
                    Your conversion rate of {insights.overview.conversionRate}% is great! Here are some tips to fill remaining spots:
                  </p>
                  <ul className="text-[var(--text-sm)] text-[var(--text-secondary)] space-y-2">
                    <li className="flex items-start gap-2">
                      <svg className="w-4 h-4 text-[var(--primary)] mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                      Send a follow-up message to guests who haven&apos;t responded
                    </li>
                    <li className="flex items-start gap-2">
                      <svg className="w-4 h-4 text-[var(--primary)] mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                      Share your space on social media to attract new guests
                    </li>
                    <li className="flex items-start gap-2">
                      <svg className="w-4 h-4 text-[var(--primary)] mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                      Consider inviting guests from the waitlist
                    </li>
                  </ul>
                </div>
              </div>
            </Card>
          </section>
        </div>
      </PageContainer>
    </div>
  );
}
