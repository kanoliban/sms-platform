'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';
import type { Room, User, Invitation } from '@/lib/supabase/types';
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
  StatsCard,
  StatsGrid,
  GuestRow,
  EmptyState,
  NoGuestsEmptyState,
  ShareRoomModal,
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
];

// Tone configuration
const toneConfig: Record<RoomTone, { label: string; gradient: string }> = {
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

export default function HostDashboard() {
  const params = useParams();
  const roomId = params.id as string;

  const [room, setRoom] = useState<Room | null>(null);
  const [invitations, setInvitations] = useState<InvitationWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [demoMode, setDemoMode] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [phoneInput, setPhoneInput] = useState('');
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showQR, setShowQR] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
    loadRoom();
  }, [roomId]);

  async function loadRoom() {
    // Check for demo mode
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

      // Get room
      const { data: roomData } = await supabase
        .from('rooms')
        .select('*')
        .eq('id', roomId)
        .single();

      if (roomData) {
        setRoom(roomData);

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
          .eq('room_id', roomId)
          .order('created_at', { ascending: true });

        if (invitationsData) {
          setInvitations(invitationsData as InvitationWithUser[]);
        }
      }
    } catch (err) {
      console.error('Failed to load room:', err);
    }

    setLoading(false);
  }

  async function sendInvitation(phone: string) {
    setSending(true);
    setMessage(null);

    // Demo mode simulation
    if (demoMode) {
      await new Promise((r) => setTimeout(r, 1000));
      setMessage({ type: 'success', text: `Invitation sent to ${phone}` });
      setPhoneInput('');
      // Add mock invitation
      const newInvitation: InvitationWithUser = {
        id: `new-${Date.now()}`,
        room_id: roomId,
        user_id: `user-${Date.now()}`,
        status: 'sent',
        created_at: new Date().toISOString(),
        sent_at: new Date().toISOString(),
        responded_at: null,
        amount_cents: null,
        captured: false,
        attended: null,
        stripe_payment_intent_id: null,
        user: { id: `user-${Date.now()}`, name: phone, phone, trust_score_overall: 75 },
      };
      setInvitations([...invitations, newInvitation]);
      setSending(false);
      return;
    }

    try {
      const response = await fetch('/api/invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          room_id: roomId,
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
    if (demoMode) {
      setInvitations(invitations.map(inv =>
        inv.id === invitationId ? { ...inv, attended } : inv
      ));
      return;
    }

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

  async function updateRoomStatus(status: Room['status']) {
    if (demoMode) {
      setRoom(room ? { ...room, status } : null);
      return;
    }

    try {
      const response = await fetch(`/api/rooms?id=${roomId}`, {
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

  async function copyLink() {
    const url = `${typeof window !== 'undefined' ? window.location.origin : ''}/rooms/${roomId}`;
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
  const isRoomFull = acceptedCount >= room.capacity;
  const tone = room.tone as RoomTone;
  const toneInfo = toneConfig[tone] || toneConfig.chill;
  const roomDate = new Date(`${room.date}T${room.time}`);

  // Room status badge variant
  const statusBadgeVariant = {
    draft: 'default' as const,
    open: 'success' as const,
    full: 'warning' as const,
    confirmed: 'primary' as const,
    completed: 'info' as const,
    canceled: 'error' as const,
  }[room.status] || 'default' as const;

  // Tab content
  type TabItem = { id: string; label: string; href?: string };
  const tabs: TabItem[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'guests', label: `Guests (${invitations.length})` },
    { id: 'insights', label: 'Insights', href: `/host/rooms/${roomId}/insights` },
    { id: 'checkin', label: 'Check-In' },
    { id: 'settings', label: 'Settings' },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-base)]">
      {/* Demo Banner */}
      {demoMode && (
        <div className="bg-[var(--warning-muted)] border-b border-[var(--warning-border)] px-6 py-3 text-center text-[var(--warning-text)] text-[var(--text-sm)]">
          Demo Mode — This is a sample dashboard
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
              <Link href="/host" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-[var(--text-sm)]">
                Host
              </Link>
              <span className="text-[var(--text-muted)]">/</span>
              <span className="text-[var(--text-primary)] text-[var(--text-sm)] font-medium truncate max-w-48">
                {room.name}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={copyLink}>
                {copied ? 'Copied!' : 'Copy Link'}
              </Button>
              <Link href={`/rooms/${roomId}`} target="_blank">
                <Button variant="secondary" size="sm">
                  View Public Page
                </Button>
              </Link>
            </div>
          </div>
        </PageContainer>
      </header>

      {/* Room Header */}
      <div className={`bg-gradient-to-r ${toneInfo.gradient} border-b border-[var(--border-subtle)]`}>
        <PageContainer className="py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-[var(--text-2xl)] font-bold text-[var(--text-primary)]">{room.name}</h1>
                <Badge variant={statusBadgeVariant} size="md">{room.status}</Badge>
              </div>
              <p className="text-[var(--text-secondary)] text-[var(--text-sm)]">
                {roomDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} at {room.time}
                {' · '}{room.location_hint || 'Location set'}
                {' · '}<span className="capitalize">{tone}</span> vibe
              </p>
            </div>
            <div className="flex items-center gap-3">
              {room.status === 'draft' && (
                <Button variant="primary" onClick={() => updateRoomStatus('open')}>
                  Open for Invites
                </Button>
              )}
              {room.status === 'open' && isRoomFull && (
                <Button variant="secondary" onClick={() => updateRoomStatus('full')}>
                  Mark as Full
                </Button>
              )}
              {(room.status === 'open' || room.status === 'full') && (
                <Button variant="primary" onClick={() => updateRoomStatus('confirmed')}>
                  Confirm Room
                </Button>
              )}
              {room.status === 'confirmed' && (
                <Button variant="primary" onClick={() => updateRoomStatus('completed')}>
                  Mark Completed
                </Button>
              )}
            </div>
          </div>
        </PageContainer>
      </div>

      {/* Tabs */}
      <div className="border-b border-[var(--border-subtle)]">
        <PageContainer>
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
        </PageContainer>
      </div>

      {/* Main Content */}
      <PageContainer className="py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left Column - Stats */}
            <div className="lg:col-span-2 space-y-6">
              {/* Guest Summary Card */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-[var(--text-lg)] font-semibold text-[var(--text-primary)]">Guests</h2>
                  <span className="text-[var(--text-sm)] text-[var(--text-muted)]">cap {room.capacity}</span>
                </div>

                <div className="mb-4">
                  <div className="flex items-center justify-between text-[var(--text-sm)] mb-2">
                    <span className="text-[var(--text-primary)] font-medium">{acceptedCount} confirmed</span>
                    <span className="text-[var(--text-muted)]">{room.capacity - acceptedCount} spots left</span>
                  </div>
                  <Progress value={(acceptedCount / room.capacity) * 100} size="sm" />
                </div>

                <div className="flex gap-4 text-[var(--text-sm)]">
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

                {invitations.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-[var(--border-subtle)]">
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
              </Card>

              {/* Stats Grid */}
              <StatsGrid
                columns={4}
                stats={[
                  { value: `$${(room.price_cents / 100).toFixed(0)}`, label: 'Price', size: 'sm' as const },
                  { value: `${room.duration_minutes / 60}h`, label: 'Duration', size: 'sm' as const },
                  { value: acceptedCount, label: 'Confirmed', size: 'sm' as const },
                  { value: `$${((acceptedCount * room.price_cents) / 100).toFixed(0)}`, label: 'Est. Revenue', size: 'sm' as const },
                ]}
              />
            </div>

            {/* Right Column - Quick Actions */}
            <div className="space-y-6">
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

              {/* Room Details */}
              <Card className="p-6">
                <h2 className="text-[var(--text-lg)] font-semibold text-[var(--text-primary)] mb-4">Details</h2>
                <div className="space-y-4 text-[var(--text-sm)]">
                  <div>
                    <div className="text-[var(--text-muted)] mb-1">Location</div>
                    <div className="text-[var(--text-primary)]">{room.location_hint || 'Location set'}</div>
                    <div className="text-[var(--text-secondary)] text-[var(--text-xs)]">{room.location_address}</div>
                  </div>
                  <div>
                    <div className="text-[var(--text-muted)] mb-1">Description</div>
                    <div className="text-[var(--text-secondary)]">{room.description || 'No description'}</div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* Guests Tab */}
        {activeTab === 'guests' && (
          <div className="space-y-6">
            {/* Invite Form */}
            {room.status !== 'completed' && room.status !== 'canceled' && (
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
                        room.status === 'completed' && invitation.status === 'accepted' && invitation.attended === null ? (
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
                  value={`${typeof window !== 'undefined' ? window.location.origin : ''}/rooms/${roomId}/checkin`}
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
                    /rooms/{roomId}/checkin
                  </code>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      const url = `${typeof window !== 'undefined' ? window.location.origin : ''}/rooms/${roomId}/checkin`;
                      navigator.clipboard.writeText(url);
                    }}
                  >
                    Copy
                  </Button>
                </div>
              </div>

              <div className="mt-8 flex justify-center gap-3">
                <Link href={`/rooms/${roomId}/checkin`} target="_blank">
                  <Button variant="primary">Open Check-In Page</Button>
                </Link>
                <Link href={`/rooms/${roomId}`} target="_blank">
                  <Button variant="secondary">View Public Page</Button>
                </Link>
              </div>
            </Card>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="max-w-2xl space-y-6">
            {/* Contract Preview */}
            <Card className="p-6">
              <h2 className="text-[var(--text-lg)] font-semibold text-[var(--text-primary)] mb-4">Invite Message Preview</h2>
              <div className="p-4 bg-[var(--bg-subtle)] rounded-[var(--radius-lg)] font-mono text-[var(--text-sm)] text-[var(--text-secondary)] whitespace-pre-wrap">
{`SMS ROOM INVITATION

You're invited to: ${room.name}
Hosted by: SMS Host
${new Date(room.date).toLocaleDateString('en-US', {
  weekday: 'short',
  month: 'short',
  day: 'numeric',
})} at ${room.time} · ${room.location_hint || 'Location TBA'}

This is a room where strangers meet with intention.

BY ACCEPTING, YOU COMMIT TO:
• Confidentiality - what's shared stays here
• Presence - phone away, attention here
• Non-transactional - no networking

Your card will be charged $${(room.price_cents / 100).toFixed(0)} only after you attend.

Reply ACCEPT to join or DECLINE to pass.

Cancel 48+ hours before: no charge.`}
              </div>
            </Card>

            {/* Danger Zone */}
            {room.status !== 'completed' && room.status !== 'canceled' && (
              <Card className="p-6 border-[var(--error-border)]">
                <h2 className="text-[var(--text-lg)] font-semibold text-[var(--error-text)] mb-4">Danger Zone</h2>
                <p className="text-[var(--text-sm)] text-[var(--text-secondary)] mb-4">
                  Canceling this room will notify all invited guests and cannot be undone.
                </p>
                <Button
                  variant="destructive"
                  onClick={() => updateRoomStatus('canceled')}
                >
                  Cancel Room
                </Button>
              </Card>
            )}
          </div>
        )}
      </PageContainer>

      {/* Share Room Modal */}
      <ShareRoomModal
        open={showShareModal}
        onClose={() => setShowShareModal(false)}
        room={{
          id: roomId,
          name: room.name,
          url: typeof window !== 'undefined' ? `${window.location.origin}/rooms/${roomId}` : `/rooms/${roomId}`,
        }}
      />
    </div>
  );
}
