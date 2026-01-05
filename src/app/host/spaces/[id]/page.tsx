'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';
import type { Space, User, Invitation } from '@/lib/supabase/types';
import {
  Button,
  Input,
  Card,
  Badge,
  Avatar,
  Tabs,
  TabsList,
  TabsTrigger,
  Progress,
} from '@/components/ui';
import { PageContainer } from '@/components/layout';
import {
  GuestRow,
  NoGuestsEmptyState,
  ShareSpaceModal,
} from '@/components/composed';
import { HostGuard, useHostUser } from '@/components/auth';
import { createClient } from '@/lib/supabase/client';

type SpaceTone = 'chill' | 'playful' | 'deep' | 'intense';

type InvitationWithUser = Invitation & {
  user: Pick<User, 'id' | 'name' | 'phone' | 'trust_score_overall'>;
};

// Tone configuration
const toneConfig: Record<SpaceTone, { label: string; gradient: string }> = {
  chill: { label: 'Chill', gradient: 'from-blue-500/20 to-cyan-500/20' },
  playful: { label: 'Playful', gradient: 'from-pink-500/20 to-orange-500/20' },
  deep: { label: 'Deep', gradient: 'from-purple-500/20 to-indigo-500/20' },
  intense: { label: 'Intense', gradient: 'from-red-500/20 to-amber-500/20' },
};

// Status badge mapping
const statusToBadgeVariant: Record<string, 'going' | 'invited' | 'pending' | 'declined' | 'checked-in' | 'no-show'> = {
  accepted: 'going',
  sent: 'invited',
  pending: 'pending',
  declined: 'declined',
};

function HostSpaceContent() {
  const params = useParams();
  const router = useRouter();
  const spaceId = typeof params.id === 'string' ? params.id : '';
  const host = useHostUser();

  const [space, setSpace] = useState<Space | null>(null);
  const [invitations, setInvitations] = useState<InvitationWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [phoneInput, setPhoneInput] = useState('');
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
    loadRoom();
  }, [spaceId, host.id]);

  async function loadRoom() {
    const supabase = createClient();

    // Get room
    const { data: spaceData } = await supabase
      .from('spaces')
      .select('*')
      .eq('id', spaceId)
      .single();

    if (!spaceData) {
      setLoading(false);
      return;
    }

    // Verify ownership - only allow access if user owns this space
    if (spaceData.host_id !== host.id) {
      setUnauthorized(true);
      setLoading(false);
      return;
    }

    setSpace(spaceData);

    // Get invitations with user info
    const { data: invitationsData } = await supabase
      .from('invitations')
      .select(`
        *,
        user:users (
          id,
          name,
          phone,
          trust_score_overall
        )
      `)
      .eq('space_id', spaceId)
      .order('created_at', { ascending: true });

    if (invitationsData) {
      setInvitations(invitationsData as InvitationWithUser[]);
    }

    setLoading(false);
  }

  async function sendInvitation(phone: string) {
    setSending(true);
    setMessage(null);

    try {
      const response = await fetch('/api/invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          space_id: spaceId,
          phone: phone.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send invitation');
      }

      setMessage({ type: 'success', text: `Invitation sent to ${phone}` });
      setPhoneInput('');
      loadRoom();
    } catch (err) {
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Something went wrong',
      });
    } finally {
      setSending(false);
    }
  }

  async function markAttendance(invitationId: string, attended: boolean) {
    try {
      const response = await fetch(`/api/invitations/${invitationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attended }),
      });

      if (!response.ok) {
        throw new Error('Failed to update attendance');
      }

      loadRoom();
    } catch (err) {
      console.error('Failed to mark attendance:', err);
    }
  }

  async function updateSpaceStatus(status: Space['status']) {
    try {
      const response = await fetch(`/api/spaces?id=${spaceId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error('Failed to update room status');
      }

      loadRoom();
    } catch (err) {
      console.error('Failed to update room:', err);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-base)] flex items-center justify-center">
        <div className="text-[var(--text-secondary)]">Loading...</div>
      </div>
    );
  }

  if (unauthorized) {
    return (
      <div className="min-h-screen bg-[var(--bg-base)] flex items-center justify-center p-4">
        <div className="max-w-md text-center">
          <div className="w-16 h-16 bg-[var(--bg-subtle)] rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-[var(--text-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-[var(--text-primary)] mb-2">
            Access Denied
          </h1>
          <p className="text-[var(--text-secondary)] mb-6">
            You don't have permission to manage this space. Only the host who created this space can access it.
          </p>
          <button
            onClick={() => router.push('/host')}
            className="px-6 py-3 bg-[var(--primary)] text-white rounded-lg font-medium hover:bg-[var(--primary-hover)] transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!space) {
    return (
      <div className="min-h-screen bg-[var(--bg-base)] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-[var(--text-2xl)] text-[var(--text-primary)] mb-4">Space not found</h1>
          <Link href="/host" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
            Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  const acceptedCount = invitations.filter((i) => i.status === 'accepted').length;
  const sentCount = invitations.filter((i) => i.status === 'sent').length;
  const pendingCount = invitations.filter((i) => i.status === 'pending').length;
  const isRoomFull = acceptedCount >= space.capacity;
  const tone = space.tone as SpaceTone;
  const toneInfo = toneConfig[tone] || toneConfig.chill;
  const spaceDate = new Date(`${space.date}T${space.time}`);

  // Room status badge variant
  const statusBadgeVariant = {
    draft: 'default' as const,
    open: 'success' as const,
    full: 'warning' as const,
    confirmed: 'primary' as const,
    completed: 'info' as const,
    canceled: 'error' as const,
  }[space.status] || 'default' as const;

  // Tab content
  type TabItem = { id: string; label: string; href?: string };
  const tabs: TabItem[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'guests', label: `Guests (${invitations.length})` },
    { id: 'insights', label: 'Insights', href: `/host/spaces/${spaceId}/insights` },
    { id: 'checkin', label: 'Check-In' },
    { id: 'settings', label: 'Settings', href: `/host/spaces/${spaceId}/settings` },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-base)]">
      {/* Header */}
      <header className="border-b border-[var(--border-subtle)] sticky top-0 bg-[var(--bg-base)]/95 backdrop-blur z-10">
        <PageContainer>
          <div className="flex justify-between items-center h-14 md:h-16">
            <div className="flex items-center gap-2 md:gap-4 min-w-0">
              <Link href="/" className="text-lg md:text-xl tracking-tight text-[var(--text-primary)] hover:opacity-80 transition-opacity flex-shrink-0">
                <strong><em>SMS</em></strong>
              </Link>
              <span className="text-[var(--text-muted)]">/</span>
              <Link href="/host" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-[var(--text-xs)] md:text-[var(--text-sm)] flex-shrink-0">
                Host
              </Link>
              <span className="text-[var(--text-muted)]">/</span>
              <span className="text-[var(--text-primary)] text-[var(--text-xs)] md:text-[var(--text-sm)] font-medium truncate">
                {space.name}
              </span>
            </div>
            <Link href={`/spaces/${spaceId}`} target="_blank" className="flex-shrink-0">
              <Button variant="secondary" size="sm">
                View Public
              </Button>
            </Link>
          </div>
        </PageContainer>
      </header>

      {/* Room Header */}
      <div className={`bg-gradient-to-r ${toneInfo.gradient} border-b border-[var(--border-subtle)]`}>
        <PageContainer className="py-4 md:py-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-[var(--text-xl)] md:text-[var(--text-2xl)] font-bold text-[var(--text-primary)] truncate">{space.name}</h1>
                <Badge variant={statusBadgeVariant} size="sm">{space.status}</Badge>
              </div>
              <p className="text-[var(--text-secondary)] text-[var(--text-xs)] md:text-[var(--text-sm)]">
                {spaceDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} at {spaceDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                {' · '}{space.location_hint || 'Location set'}
                {' · '}<span className="capitalize">{tone}</span>
              </p>
            </div>
            <div className="flex items-center gap-2 md:gap-3">
              {space.status === 'draft' && (
                <Button variant="primary" size="sm" className="md:!text-base md:!px-4 md:!py-2" onClick={() => updateSpaceStatus('open')}>
                  Open for Invites
                </Button>
              )}
              {space.status === 'open' && isRoomFull && (
                <Button variant="secondary" size="sm" onClick={() => updateSpaceStatus('full')}>
                  Mark as Full
                </Button>
              )}
              {(space.status === 'open' || space.status === 'full') && (
                <Button variant="primary" size="sm" onClick={() => updateSpaceStatus('confirmed')}>
                  Confirm Room
                </Button>
              )}
              {space.status === 'confirmed' && (
                <Button variant="primary" size="sm" onClick={() => updateSpaceStatus('completed')}>
                  Mark Completed
                </Button>
              )}
            </div>
          </div>
        </PageContainer>
      </div>

      {/* Tabs - Grid on mobile, inline on desktop */}
      <div className="border-b border-[var(--border-subtle)]">
        <PageContainer>
          {/* Mobile: 2-row grid */}
          <div className="md:hidden py-2">
            <div className="grid grid-cols-3 gap-1 mb-1">
              {['overview', 'guests', 'insights'].map((tabId) => {
                const tab = tabs.find(t => t.id === tabId);
                if (!tab) return null;

                const buttonContent = (
                  <span
                    className={`
                      block px-2 py-2 text-[var(--text-xs)] font-medium rounded-[var(--radius-md)] transition-colors text-center
                      ${activeTab === tab.id
                        ? 'bg-[var(--primary-muted)] text-[var(--primary-light)]'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]'}
                    `}
                  >
                    {tab.label}
                  </span>
                );

                return tab.href ? (
                  <Link key={tab.id} href={tab.href}>
                    {buttonContent}
                  </Link>
                ) : (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)}>
                    {buttonContent}
                  </button>
                );
              })}
            </div>
            <div className="grid grid-cols-2 gap-1">
              {['checkin', 'settings'].map((tabId) => {
                const tab = tabs.find(t => t.id === tabId);
                if (!tab) return null;

                const buttonContent = (
                  <span
                    className={`
                      block px-2 py-2 text-[var(--text-xs)] font-medium rounded-[var(--radius-md)] transition-colors text-center
                      ${activeTab === tab.id
                        ? 'bg-[var(--primary-muted)] text-[var(--primary-light)]'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]'}
                    `}
                  >
                    {tab.label}
                  </span>
                );

                return tab.href ? (
                  <Link key={tab.id} href={tab.href}>
                    {buttonContent}
                  </Link>
                ) : (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)}>
                    {buttonContent}
                  </button>
                );
              })}
            </div>
          </div>
          {/* Desktop: Regular tabs */}
          <div className="hidden md:block">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList variant="underline">
                {tabs.map((tab) => (
                  tab.href ? (
                    <Link key={tab.id} href={tab.href}>
                      <TabsTrigger value={tab.id}>
                        {tab.label}
                      </TabsTrigger>
                    </Link>
                  ) : (
                    <TabsTrigger key={tab.id} value={tab.id}>
                      {tab.label}
                    </TabsTrigger>
                  )
                ))}
              </TabsList>
            </Tabs>
          </div>
        </PageContainer>
      </div>

      {/* Main Content */}
      <PageContainer className="py-4 md:py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-4 md:space-y-6">
            {/* Mobile: Quick Actions Row - shown first on mobile */}
            <div className="flex gap-2 md:hidden">
              <Button
                variant="secondary"
                size="sm"
                className="flex-1 !inline-flex !items-center !justify-center whitespace-nowrap"
                onClick={() => setActiveTab('guests')}
              >
                <svg className="w-4 h-4 mr-1.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                <span>Invite</span>
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="flex-1 !inline-flex !items-center !justify-center whitespace-nowrap"
                onClick={() => setActiveTab('checkin')}
              >
                <svg className="w-4 h-4 mr-1.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5z" />
                </svg>
                <span>Check-In</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="!px-3"
                onClick={() => setShowShareModal(true)}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              </Button>
            </div>

            {/* Desktop: 3-column grid / Mobile: stacked */}
            <div className="grid gap-4 md:gap-6 lg:grid-cols-3">
              {/* Left Column - Stats */}
              <div className="lg:col-span-2 space-y-4 md:space-y-6">
                {/* Guest Summary Card - Compact on mobile */}
                <Card className="p-4 md:p-6">
                  <div className="flex items-center justify-between mb-3 md:mb-4">
                    <h2 className="text-[var(--text-base)] md:text-[var(--text-lg)] font-semibold text-[var(--text-primary)]">Guests</h2>
                    <span className="text-[var(--text-xs)] md:text-[var(--text-sm)] text-[var(--text-muted)]">cap {space.capacity}</span>
                  </div>

                  <div className="mb-3 md:mb-4">
                    <div className="flex items-center justify-between text-[var(--text-xs)] md:text-[var(--text-sm)] mb-2">
                      <span className="text-[var(--text-primary)] font-medium">{acceptedCount} confirmed</span>
                      <span className="text-[var(--text-muted)]">{space.capacity - acceptedCount} spots left</span>
                    </div>
                    <Progress value={(acceptedCount / space.capacity) * 100} size="sm" />
                  </div>

                  <div className="flex gap-3 md:gap-4 text-[var(--text-xs)] md:text-[var(--text-sm)]">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[var(--success-text)]" />
                      <span className="text-[var(--text-secondary)]">{acceptedCount} Going</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[var(--info-text)]" />
                      <span className="text-[var(--text-secondary)]">{sentCount} Invited</span>
                    </div>
                    {pendingCount > 0 && (
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[var(--warning-text)]" />
                        <span className="text-[var(--text-secondary)]">{pendingCount} Pending</span>
                      </div>
                    )}
                  </div>

                  {/* Recent Guests - Hidden on mobile to save space, show on md+ */}
                  {invitations.length > 0 && (
                    <div className="hidden md:block mt-6 pt-6 border-t border-[var(--border-subtle)]">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-[var(--text-sm)] font-medium text-[var(--text-muted)]">Recent Guests</h3>
                        <button
                          onClick={() => setActiveTab('guests')}
                          className="text-[var(--text-sm)] text-[var(--primary-light)] hover:underline"
                        >
                          All Guests →
                        </button>
                      </div>
                      <div className="space-y-2">
                        {invitations.slice(0, 3).map((inv) => (
                          <div key={inv.id} className="flex items-center justify-between py-2">
                            <div className="flex items-center gap-3">
                              <Avatar name={inv.user?.name || inv.user?.phone || 'Guest'} size="sm" />
                              <div>
                                <div className="text-[var(--text-sm)] font-medium text-[var(--text-primary)]">
                                  {inv.user?.name || inv.user?.phone}
                                </div>
                                <div className="text-[var(--text-xs)] text-[var(--text-muted)]">
                                  {inv.user?.phone}
                                </div>
                              </div>
                            </div>
                            <Badge variant={statusToBadgeVariant[inv.status] || 'default'} size="sm">
                              {inv.status === 'accepted' ? 'Going' : inv.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Mobile: Simple link to guests tab */}
                  {invitations.length > 0 && (
                    <button
                      onClick={() => setActiveTab('guests')}
                      className="md:hidden mt-3 text-[var(--text-xs)] text-[var(--primary-light)] hover:underline"
                    >
                      View all {invitations.length} guests →
                    </button>
                  )}
                </Card>

                {/* Stats Grid - 2x2 on mobile, 4 cols on desktop */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                  <Card className="p-3 md:p-4">
                    <div className="text-[var(--text-lg)] md:text-[var(--text-xl)] font-bold text-[var(--text-primary)]">
                      ${(space.price_cents / 100).toFixed(0)}
                    </div>
                    <div className="text-[var(--text-xs)] text-[var(--text-muted)]">Price</div>
                  </Card>
                  <Card className="p-3 md:p-4">
                    <div className="text-[var(--text-lg)] md:text-[var(--text-xl)] font-bold text-[var(--text-primary)]">
                      {space.duration_minutes / 60}h
                    </div>
                    <div className="text-[var(--text-xs)] text-[var(--text-muted)]">Duration</div>
                  </Card>
                  <Card className="p-3 md:p-4">
                    <div className="text-[var(--text-lg)] md:text-[var(--text-xl)] font-bold text-[var(--text-primary)]">
                      {acceptedCount}
                    </div>
                    <div className="text-[var(--text-xs)] text-[var(--text-muted)]">Confirmed</div>
                  </Card>
                  <Card className="p-3 md:p-4">
                    <div className="text-[var(--text-lg)] md:text-[var(--text-xl)] font-bold text-[var(--text-primary)]">
                      ${((acceptedCount * space.price_cents) / 100).toFixed(0)}
                    </div>
                    <div className="text-[var(--text-xs)] text-[var(--text-muted)]">Est. Revenue</div>
                  </Card>
                </div>
              </div>

              {/* Right Column - Quick Actions (hidden on mobile, shown as row above) */}
              <div className="hidden md:block space-y-6">
                {/* Quick Actions */}
                <Card className="p-6">
                  <h2 className="text-[var(--text-lg)] font-semibold text-[var(--text-primary)] mb-4">Quick Actions</h2>
                  <div className="space-y-3">
                    <Button
                      variant="secondary"
                      fullWidth
                      onClick={() => setActiveTab('guests')}
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                      </svg>
                      Invite Guests
                    </Button>
                    <Button
                      variant="secondary"
                      fullWidth
                      onClick={() => setActiveTab('checkin')}
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5z" />
                      </svg>
                      Check-In Mode
                    </Button>
                    <Button
                      variant="ghost"
                      fullWidth
                      onClick={() => setShowShareModal(true)}
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                      </svg>
                      Share Room
                    </Button>
                  </div>
                </Card>

                {/* Space Details */}
                <Card className="p-6">
                  <h2 className="text-[var(--text-lg)] font-semibold text-[var(--text-primary)] mb-4">Details</h2>
                  <div className="space-y-4 text-[var(--text-sm)]">
                    <div>
                      <div className="text-[var(--text-muted)] mb-1">Location</div>
                      <div className="text-[var(--text-primary)]">{space.location_hint || 'Location set'}</div>
                      <div className="text-[var(--text-secondary)] text-[var(--text-xs)]">{space.location_address}</div>
                    </div>
                    <div>
                      <div className="text-[var(--text-muted)] mb-1">Description</div>
                      <div className="text-[var(--text-secondary)]">{space.description || 'No description'}</div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>

            {/* Mobile: Details section at bottom */}
            <Card className="md:hidden p-4">
              <h2 className="text-[var(--text-base)] font-semibold text-[var(--text-primary)] mb-3">Details</h2>
              <div className="space-y-3 text-[var(--text-sm)]">
                <div>
                  <div className="text-[var(--text-muted)] text-[var(--text-xs)]">Location</div>
                  <div className="text-[var(--text-primary)]">{space.location_hint || 'Location set'}</div>
                  <div className="text-[var(--text-secondary)] text-[var(--text-xs)]">{space.location_address}</div>
                </div>
                {space.description && (
                  <div>
                    <div className="text-[var(--text-muted)] text-[var(--text-xs)]">Description</div>
                    <div className="text-[var(--text-secondary)]">{space.description}</div>
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}

        {/* Guests Tab */}
        {activeTab === 'guests' && (
          <div className="space-y-6">
            {/* Invite Form */}
            {space.status !== 'completed' && space.status !== 'canceled' && (
              <Card className="p-6">
                <h2 className="text-[var(--text-lg)] font-semibold text-[var(--text-primary)] mb-4">Invite a Guest</h2>
                <div className="flex gap-3">
                  <Input
                    type="tel"
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    placeholder="Phone number (e.g., 612-555-1234)"
                    className="flex-1"
                    disabled={isRoomFull}
                  />
                  <Button
                    variant="primary"
                    onClick={() => sendInvitation(phoneInput)}
                    disabled={sending || !phoneInput.trim() || isRoomFull}
                    loading={sending}
                  >
                    Send Invite
                  </Button>
                </div>
                {message && (
                  <p className={`mt-3 text-[var(--text-sm)] ${message.type === 'success' ? 'text-[var(--success-text)]' : 'text-[var(--error-text)]'}`}>
                    {message.text}
                  </p>
                )}
                {isRoomFull && (
                  <p className="mt-3 text-[var(--text-sm)] text-[var(--warning-text)]">
                    Room is at capacity. No more invitations can be sent.
                  </p>
                )}
              </Card>
            )}

            {/* Guest List */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-[var(--text-lg)] font-semibold text-[var(--text-primary)]">
                  All Guests ({invitations.length})
                </h2>
              </div>

              {invitations.length === 0 ? (
                <NoGuestsEmptyState />
              ) : (
                <div className="space-y-2">
                  {invitations.map((invitation) => (
                    <GuestRow
                      key={invitation.id}
                      name={invitation.user?.name || invitation.user?.phone || 'Unknown'}
                      phone={invitation.user?.phone || ''}
                      status={
                        invitation.status === 'accepted' ? 'going' :
                        invitation.status === 'sent' ? 'invited' :
                        invitation.status === 'expired' ? 'declined' :
                        invitation.status as 'pending' | 'declined'
                      }
                      invitedAt={new Date(invitation.created_at).toLocaleDateString()}
                      actions={
                        space.status === 'completed' && invitation.status === 'accepted' && invitation.attended === null ? (
                          <div className="flex gap-2">
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => markAttendance(invitation.id, true)}
                            >
                              Attended
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => markAttendance(invitation.id, false)}
                            >
                              No-show
                            </Button>
                          </div>
                        ) : invitation.attended !== null ? (
                          <Badge variant={invitation.attended ? 'checked-in' : 'no-show'} size="sm">
                            {invitation.attended ? 'Attended' : 'No-show'}
                          </Badge>
                        ) : undefined
                      }
                    />
                  ))}
                </div>
              )}
            </Card>
          </div>
        )}

        {/* Check-In Tab */}
        {activeTab === 'checkin' && (
          <div className="max-w-2xl mx-auto">
            <Card className="p-8 text-center">
              <h2 className="text-[var(--text-2xl)] font-bold text-[var(--text-primary)] mb-2">Guest Check-In</h2>
              <p className="text-[var(--text-secondary)] mb-8">Display this QR code for guests to scan and check in</p>

              <div className="inline-block p-6 bg-white rounded-[var(--radius-xl)]">
                <QRCodeSVG
                  value={`${typeof window !== 'undefined' ? window.location.origin : ''}/spaces/${spaceId}/checkin`}
                  size={240}
                  level="H"
                  includeMargin
                />
              </div>

              <div className="mt-8 space-y-3">
                <p className="text-[var(--text-sm)] text-[var(--text-muted)]">
                  Or share the check-in link directly:
                </p>
                <div className="flex items-center justify-center gap-3">
                  <code className="px-4 py-2 bg-[var(--bg-subtle)] rounded-[var(--radius-md)] text-[var(--text-sm)] text-[var(--text-secondary)]">
                    /spaces/{spaceId}/checkin
                  </code>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      const url = `${typeof window !== 'undefined' ? window.location.origin : ''}/spaces/${spaceId}/checkin`;
                      navigator.clipboard.writeText(url);
                    }}
                  >
                    Copy
                  </Button>
                </div>
              </div>

              <div className="mt-8 flex justify-center gap-3">
                <Link href={`/spaces/${spaceId}/checkin`} target="_blank">
                  <Button variant="primary">Open Check-In Page</Button>
                </Link>
                <Link href={`/spaces/${spaceId}`} target="_blank">
                  <Button variant="secondary">View Public Page</Button>
                </Link>
              </div>
            </Card>
          </div>
        )}

        {/* Settings Tab - redirects to dedicated settings page */}
      </PageContainer>

      {/* Share Room Modal */}
      <ShareSpaceModal
        open={showShareModal}
        onClose={() => setShowShareModal(false)}
        space={{
          id: spaceId,
          name: space.name,
          url: typeof window !== 'undefined' ? `${window.location.origin}/spaces/${spaceId}` : `/spaces/${spaceId}`,
        }}
      />
    </div>
  );
}

export default function HostSpacePage() {
  return (
    <HostGuard>
      <HostSpaceContent />
    </HostGuard>
  );
}
