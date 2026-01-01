'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import type { Room, User, Invitation } from '@/lib/supabase/types';
import {
  Button,
  Card,
  Badge,
  Progress,
  Dropdown,
  DropdownTrigger,
  DropdownContent,
  DropdownItem,
  DropdownSeparator,
} from '@/components/ui';
import { PageContainer } from '@/components/layout';
import {
  GuestRow,
  ActionCard,
  NoGuestsEmptyState,
} from '@/components/composed';

type RoomTone = 'chill' | 'playful' | 'deep' | 'intense';

type InvitationWithUser = Invitation & {
  user: Pick<User, 'id' | 'name' | 'phone' | 'trust_score_overall'>;
};

// Check if Supabase is configured
const isSupabaseConfigured = () => {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
};

// Mock data for demo mode
const MOCK_ROOM: Room = {
  id: 'demo-1',
  host_id: 'demo-host',
  name: 'Dinner & Deep Talks',
  description: 'An intimate dinner for strangers who want real conversation.',
  tone: 'deep' as RoomTone,
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

const MOCK_INVITATIONS: InvitationWithUser[] = [
  {
    id: '1',
    room_id: 'demo-1',
    user_id: 'user-1',
    status: 'accepted',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    sent_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    responded_at: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000).toISOString(),
    amount_cents: 4500,
    captured: true,
    attended: null,
    stripe_payment_intent_id: 'pi_demo_1',
    user: { id: 'user-1', name: 'Sarah K.', phone: '+16125551234', trust_score_overall: 85 },
  },
  {
    id: '2',
    room_id: 'demo-1',
    user_id: 'user-2',
    status: 'accepted',
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    sent_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    responded_at: new Date(Date.now() - 0.5 * 24 * 60 * 60 * 1000).toISOString(),
    amount_cents: 4500,
    captured: true,
    attended: null,
    stripe_payment_intent_id: 'pi_demo_2',
    user: { id: 'user-2', name: 'Marcus T.', phone: '+16125555678', trust_score_overall: 92 },
  },
  {
    id: '3',
    room_id: 'demo-1',
    user_id: 'user-3',
    status: 'sent',
    created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    sent_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    responded_at: null,
    amount_cents: null,
    captured: false,
    attended: null,
    stripe_payment_intent_id: null,
    user: { id: 'user-3', name: 'Elena R.', phone: '+16125559012', trust_score_overall: 78 },
  },
  {
    id: '4',
    room_id: 'demo-1',
    user_id: 'user-4',
    status: 'pending',
    created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    sent_at: null,
    responded_at: null,
    amount_cents: null,
    captured: false,
    attended: null,
    stripe_payment_intent_id: null,
    user: { id: 'user-4', name: 'James W.', phone: '+16125553456', trust_score_overall: 88 },
  },
  {
    id: '5',
    room_id: 'demo-1',
    user_id: 'user-5',
    status: 'declined',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    sent_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    responded_at: new Date(Date.now() - 2.5 * 24 * 60 * 60 * 1000).toISOString(),
    amount_cents: null,
    captured: false,
    attended: null,
    stripe_payment_intent_id: null,
    user: { id: 'user-5', name: 'Maria L.', phone: '+16125557890', trust_score_overall: 80 },
  },
];

type FilterOption = 'all' | 'going' | 'invited' | 'pending' | 'declined';
type SortOption = 'recent' | 'name';

const filterLabels: Record<FilterOption, string> = {
  all: 'All Guests',
  going: 'Going',
  invited: 'Invited',
  pending: 'Pending',
  declined: 'Declined',
};

export default function GuestListPage() {
  const params = useParams();
  const roomId = params.id as string;

  const [room, setRoom] = useState<Room | null>(null);
  const [invitations, setInvitations] = useState<InvitationWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [demoMode, setDemoMode] = useState(false);
  const [filter, setFilter] = useState<FilterOption>('all');
  const [sort, setSort] = useState<SortOption>('recent');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadRoom();
  }, [roomId]);

  async function loadRoom() {
    if (!isSupabaseConfigured() || roomId.startsWith('demo-')) {
      setDemoMode(true);
      setRoom(MOCK_ROOM);
      setInvitations(MOCK_INVITATIONS);
      setLoading(false);
      return;
    }

    try {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();

      const { data: roomData } = await supabase
        .from('rooms')
        .select('*')
        .eq('id', roomId)
        .single();

      if (roomData) {
        setRoom(roomData);
      }

      const { data: invData } = await supabase
        .from('invitations')
        .select(`
          *,
          user:users!invitations_user_id_fkey (id, name, phone, trust_score_overall)
        `)
        .eq('room_id', roomId)
        .order('created_at', { ascending: false });

      if (invData) {
        setInvitations(invData as InvitationWithUser[]);
      }
    } catch (err) {
      console.error('Failed to load room:', err);
    }

    setLoading(false);
  }

  // Filter invitations
  const filteredInvitations = invitations.filter((inv) => {
    // Apply status filter
    if (filter !== 'all') {
      if (filter === 'going' && inv.status !== 'accepted') return false;
      if (filter === 'invited' && inv.status !== 'sent') return false;
      if (filter === 'pending' && inv.status !== 'pending') return false;
      if (filter === 'declined' && inv.status !== 'declined') return false;
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const name = inv.user?.name?.toLowerCase() || '';
      const phone = inv.user?.phone?.toLowerCase() || '';
      if (!name.includes(query) && !phone.includes(query)) return false;
    }

    return true;
  });

  // Sort invitations
  const sortedInvitations = [...filteredInvitations].sort((a, b) => {
    if (sort === 'name') {
      const nameA = a.user?.name || a.user?.phone || '';
      const nameB = b.user?.name || b.user?.phone || '';
      return nameA.localeCompare(nameB);
    }
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  // Calculate counts
  const counts = {
    all: invitations.length,
    going: invitations.filter((i) => i.status === 'accepted').length,
    invited: invitations.filter((i) => i.status === 'sent').length,
    pending: invitations.filter((i) => i.status === 'pending').length,
    declined: invitations.filter((i) => i.status === 'declined').length,
  };

  // Map invitation status to GuestRow status
  function mapStatus(status: string): 'going' | 'invited' | 'pending' | 'declined' {
    if (status === 'accepted') return 'going';
    if (status === 'sent') return 'invited';
    if (status === 'expired') return 'declined';
    return status as 'pending' | 'declined';
  }

  // Format relative time
  function formatRelativeTime(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return 'Just now';
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
          Demo Mode
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
              <Link href={`/host/rooms/${roomId}`} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                {room.name}
              </Link>
              <span className="text-[var(--text-muted)]">/</span>
              <span className="text-[var(--text-primary)]">Guests</span>
            </div>
          </div>
        </PageContainer>
      </header>

      {/* Main Content */}
      <PageContainer className="py-8">
        <div className="space-y-6">
          {/* At a Glance Card */}
          <Card className="p-6">
            <h2 className="text-[var(--text-lg)] font-semibold text-[var(--text-primary)] mb-4">At a Glance</h2>

            <div className="mb-4">
              <div className="flex items-center justify-between text-[var(--text-sm)] mb-2">
                <span className="text-[var(--text-primary)] font-medium">
                  {counts.going} {counts.going === 1 ? 'guest' : 'guests'}
                </span>
                <span className="text-[var(--text-muted)]">cap {room.capacity}</span>
              </div>
              <Progress value={(counts.going / room.capacity) * 100} size="sm" />
            </div>

            <div className="flex gap-4 text-[var(--text-sm)] mb-6">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[var(--success-text)]" />
                <span className="text-[var(--text-secondary)]">{counts.going} Going</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[var(--info-text)]" />
                <span className="text-[var(--text-secondary)]">{counts.invited} Invited</span>
              </div>
              {counts.pending > 0 && (
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[var(--warning-text)]" />
                  <span className="text-[var(--text-secondary)]">{counts.pending} Pending</span>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-3 gap-4">
              <ActionCard
                icon={
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                  </svg>
                }
                label="Invite Guests"
                onClick={() => {/* Open invite modal */}}
                color="info"
              />
              <ActionCard
                icon={
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 6.75h.75v.75h-.75v-.75zM6.75 16.5h.75v.75h-.75v-.75zM16.5 6.75h.75v.75h-.75v-.75zM13.5 13.5h.75v.75h-.75v-.75zM13.5 19.5h.75v.75h-.75v-.75zM19.5 13.5h.75v.75h-.75v-.75zM19.5 19.5h.75v.75h-.75v-.75zM16.5 16.5h.75v.75h-.75v-.75z" />
                  </svg>
                }
                label="Check-In"
                href={`/rooms/${roomId}/checkin`}
                color="secondary"
              />
              <ActionCard
                icon={
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                  </svg>
                }
                label="Approvals"
                href={`/host/rooms/${roomId}/approvals`}
                color="warning"
                badge={counts.pending > 0 ? counts.pending : undefined}
              />
            </div>
          </Card>

          {/* Guest List */}
          <Card>
            {/* Filters Header */}
            <div className="p-4 border-b border-[var(--border-subtle)]">
              <div className="flex items-center justify-between gap-4">
                {/* Search */}
                <div className="flex-1 max-w-sm">
                  <input
                    type="text"
                    placeholder="Search guests..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-3 py-2 bg-[var(--bg-subtle)] border border-[var(--border-default)] rounded-[var(--radius-md)] text-[var(--text-sm)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                  />
                </div>

                {/* Filter & Sort */}
                <div className="flex items-center gap-2">
                  {/* Filter Dropdown */}
                  <Dropdown>
                    <DropdownTrigger asChild>
                      <Button variant="secondary" size="sm">
                        <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
                        </svg>
                        {filterLabels[filter]}
                        <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      </Button>
                    </DropdownTrigger>
                    <DropdownContent>
                      {(Object.keys(filterLabels) as FilterOption[]).map((key) => (
                        <DropdownItem
                          key={key}
                          onClick={() => setFilter(key)}
                        >
                          <span className="flex-1">{filterLabels[key]}</span>
                          <span className="text-[var(--text-muted)]">{counts[key]}</span>
                        </DropdownItem>
                      ))}
                    </DropdownContent>
                  </Dropdown>

                  {/* Sort Dropdown */}
                  <Dropdown>
                    <DropdownTrigger asChild>
                      <Button variant="ghost" size="sm">
                        {sort === 'recent' ? 'Recent' : 'Name'}
                        <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      </Button>
                    </DropdownTrigger>
                    <DropdownContent>
                      <DropdownItem onClick={() => setSort('recent')}>
                        Recently Added
                      </DropdownItem>
                      <DropdownItem onClick={() => setSort('name')}>
                        Name
                      </DropdownItem>
                    </DropdownContent>
                  </Dropdown>
                </div>
              </div>
            </div>

            {/* Guest Rows */}
            {sortedInvitations.length === 0 ? (
              <div className="p-8">
                <NoGuestsEmptyState />
              </div>
            ) : (
              <div>
                {sortedInvitations.map((invitation) => (
                  <GuestRow
                    key={invitation.id}
                    name={invitation.user?.name || invitation.user?.phone || 'Unknown'}
                    phone={invitation.user?.phone || ''}
                    status={mapStatus(invitation.status)}
                    invitedAt={formatRelativeTime(invitation.created_at)}
                  />
                ))}
              </div>
            )}

            {/* Footer */}
            {sortedInvitations.length > 0 && (
              <div className="p-4 border-t border-[var(--border-subtle)] text-center">
                <span className="text-[var(--text-sm)] text-[var(--text-muted)]">
                  Showing {sortedInvitations.length} of {invitations.length} guests
                </span>
              </div>
            )}
          </Card>
        </div>
      </PageContainer>
    </div>
  );
}
