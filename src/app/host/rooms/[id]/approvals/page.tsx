'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import type { Room, User, Invitation } from '@/lib/supabase/types';
import {
  Button,
  Card,
  Badge,
  Avatar,
  Tabs,
  TabsList,
  TabsTrigger,
} from '@/components/ui';
import { PageContainer } from '@/components/layout';
import { EmptyState, AppHeader } from '@/components/composed';

type RoomTone = 'chill' | 'playful' | 'deep' | 'intense';

type RoomWithHost = Room & {
  host: Pick<User, 'id' | 'name'>;
};

type InvitationWithGuest = Invitation & {
  guest?: Pick<User, 'id' | 'name' | 'phone'> | null;
};

// Check if Supabase is configured
const isSupabaseConfigured = () => {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
};

// Mock data for demo mode
const MOCK_ROOM: RoomWithHost = {
  id: 'demo-1',
  host_id: 'demo-host',
  name: 'Dinner & Deep Talks',
  description: 'Join us for an evening of meaningful conversations over delicious food.',
  tone: 'deep' as RoomTone,
  date: new Date().toISOString().split('T')[0],
  time: '19:00',
  duration_minutes: 180,
  location_address: '123 Example St, Minneapolis, MN',
  location_hint: 'Northeast Minneapolis',
  capacity: 8,
  price_cents: 4500,
  status: 'confirmed',
  location_revealed: false,
  feedback_requested: false,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  host: { id: 'demo-host', name: 'Liban' },
};

const MOCK_PENDING_INVITATIONS: InvitationWithGuest[] = [
  {
    id: 'inv-1',
    room_id: 'demo-1',
    user_id: 'guest-1',
    status: 'pending',
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    sent_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    responded_at: null,
    stripe_payment_intent_id: null,
    amount_cents: 4500,
    captured: false,
    attended: null,
    guest: { id: 'guest-1', name: 'Sarah Chen', phone: '+16125551001' },
  },
  {
    id: 'inv-2',
    room_id: 'demo-1',
    user_id: 'guest-2',
    status: 'pending',
    created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    sent_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    responded_at: null,
    stripe_payment_intent_id: null,
    amount_cents: 4500,
    captured: false,
    attended: null,
    guest: { id: 'guest-2', name: 'Marcus Johnson', phone: '+16125551002' },
  },
  {
    id: 'inv-3',
    room_id: 'demo-1',
    user_id: 'guest-3',
    status: 'pending',
    created_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    sent_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    responded_at: null,
    stripe_payment_intent_id: null,
    amount_cents: 4500,
    captured: false,
    attended: null,
    guest: { id: 'guest-3', name: 'Emily Rodriguez', phone: '+16125551003' },
  },
];

// Format relative time
function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// Format phone for display
function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }
  return phone;
}

export default function ApprovalsPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = params.id as string;

  const [room, setRoom] = useState<RoomWithHost | null>(null);
  const [invitations, setInvitations] = useState<InvitationWithGuest[]>([]);
  const [loading, setLoading] = useState(true);
  const [demoMode, setDemoMode] = useState(false);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    loadData();
  }, [roomId]);

  // Auto-hide toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  async function loadData() {
    if (!isSupabaseConfigured() || roomId.startsWith('demo-')) {
      setDemoMode(true);
      setRoom(MOCK_ROOM);
      setInvitations(MOCK_PENDING_INVITATIONS);
      setLoading(false);
      return;
    }

    try {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();

      // Load room with host
      const { data: roomData } = await supabase
        .from('rooms')
        .select(`
          *,
          host:users!rooms_host_id_fkey (id, name)
        `)
        .eq('id', roomId)
        .single();

      if (roomData) {
        setRoom(roomData as RoomWithHost);
      }

      // Load pending invitations
      const { data: invData } = await supabase
        .from('invitations')
        .select(`
          *,
          guest:users!invitations_guest_id_fkey (id, name, phone)
        `)
        .eq('room_id', roomId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (invData) {
        setInvitations(invData as InvitationWithGuest[]);
      }
    } catch (err) {
      console.error('Failed to load data:', err);
    }

    setLoading(false);
  }

  async function handleApprove(invitationId: string) {
    setProcessingIds(prev => new Set(prev).add(invitationId));

    if (demoMode) {
      await new Promise(r => setTimeout(r, 500));
      setInvitations(prev => prev.filter(i => i.id !== invitationId));
      setToast({ message: 'Guest approved', type: 'success' });
      setProcessingIds(prev => {
        const next = new Set(prev);
        next.delete(invitationId);
        return next;
      });
      return;
    }

    try {
      const response = await fetch(`/api/invitations/${invitationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'accepted' }),
      });

      if (response.ok) {
        setInvitations(prev => prev.filter(i => i.id !== invitationId));
        setToast({ message: 'Guest approved', type: 'success' });
      } else {
        setToast({ message: 'Failed to approve guest', type: 'error' });
      }
    } catch {
      setToast({ message: 'Failed to approve guest', type: 'error' });
    }

    setProcessingIds(prev => {
      const next = new Set(prev);
      next.delete(invitationId);
      return next;
    });
  }

  async function handleDecline(invitationId: string) {
    setProcessingIds(prev => new Set(prev).add(invitationId));

    if (demoMode) {
      await new Promise(r => setTimeout(r, 500));
      setInvitations(prev => prev.filter(i => i.id !== invitationId));
      setToast({ message: 'Guest declined', type: 'success' });
      setProcessingIds(prev => {
        const next = new Set(prev);
        next.delete(invitationId);
        return next;
      });
      return;
    }

    try {
      const response = await fetch(`/api/invitations/${invitationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'declined' }),
      });

      if (response.ok) {
        setInvitations(prev => prev.filter(i => i.id !== invitationId));
        setToast({ message: 'Guest declined', type: 'success' });
      } else {
        setToast({ message: 'Failed to decline guest', type: 'error' });
      }
    } catch {
      setToast({ message: 'Failed to decline guest', type: 'error' });
    }

    setProcessingIds(prev => {
      const next = new Set(prev);
      next.delete(invitationId);
      return next;
    });
  }

  async function handleApproveAll() {
    const pending = invitations.filter(i => !processingIds.has(i.id));
    for (const inv of pending) {
      await handleApprove(inv.id);
    }
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
      <AppHeader />

      {/* Demo Banner */}
      {demoMode && (
        <div className="bg-[var(--warning-muted)] border-b border-[var(--warning-border)] px-6 py-3 text-center text-[var(--warning-text)] text-[var(--text-sm)]">
          Demo Mode - Changes will not persist
        </div>
      )}

      <PageContainer size="lg" className="py-8">
        {/* Back Link & Title */}
        <div className="mb-8">
          <Link
            href={`/host/rooms/${roomId}`}
            className="inline-flex items-center gap-2 text-[var(--text-sm)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] mb-4"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </Link>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-[var(--text-2xl)] font-bold text-[var(--text-primary)]">
                Approval Queue
              </h1>
              <p className="text-[var(--text-sm)] text-[var(--text-secondary)] mt-1">
                {room.name}
              </p>
            </div>

            {invitations.length > 0 && (
              <Button variant="primary" onClick={handleApproveAll}>
                Approve All ({invitations.length})
              </Button>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <Tabs defaultValue="approvals" className="mb-8">
          <TabsList>
            <TabsTrigger
              value="dashboard"
              onClick={() => router.push(`/host/rooms/${roomId}`)}
            >
              Dashboard
            </TabsTrigger>
            <TabsTrigger
              value="guests"
              onClick={() => router.push(`/host/rooms/${roomId}/guests`)}
            >
              Guests
            </TabsTrigger>
            <TabsTrigger value="approvals">
              Approvals
              {invitations.length > 0 && (
                <span className="ml-2 px-1.5 py-0.5 text-[10px] font-semibold rounded-full bg-[var(--warning-muted)] text-[var(--warning-text)]">
                  {invitations.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Pending Count */}
        {invitations.length > 0 && (
          <Card className="p-4 mb-6 border-l-4 border-l-[var(--warning)]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[var(--warning-muted)] flex items-center justify-center">
                <svg className="w-5 h-5 text-[var(--warning-text)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-[var(--text-sm)] font-medium text-[var(--text-primary)]">
                  {invitations.length} {invitations.length === 1 ? 'guest' : 'guests'} waiting for approval
                </p>
                <p className="text-[var(--text-xs)] text-[var(--text-muted)]">
                  Review and approve or decline requests below
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Pending Guest List */}
        {invitations.length === 0 ? (
          <EmptyState
            icon={
              <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            title="All caught up!"
            description="No pending approvals at the moment. New requests will appear here."
            action={{
              label: 'View All Guests',
              href: `/host/rooms/${roomId}/guests`,
              variant: 'secondary',
            }}
          />
        ) : (
          <div className="space-y-3">
            {invitations.map((invitation) => {
              const isProcessing = processingIds.has(invitation.id);
              const guestName = invitation.guest?.name || 'Unknown';
              const phone = invitation.guest?.phone || '';

              return (
                <Card
                  key={invitation.id}
                  className={`p-4 ${isProcessing ? 'opacity-50' : ''}`}
                >
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <Avatar
                      name={guestName}
                      size="lg"
                    />

                    {/* Guest Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-[var(--text-primary)]">
                          {guestName}
                        </span>
                        <Badge variant="pending" size="sm">
                          Pending
                        </Badge>
                      </div>
                      <p className="text-[var(--text-sm)] text-[var(--text-muted)]">
                        {formatPhone(phone)}
                      </p>
                      <p className="text-[var(--text-xs)] text-[var(--text-muted)]">
                        Requested {formatRelativeTime(invitation.created_at)}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleDecline(invitation.id)}
                        disabled={isProcessing}
                      >
                        <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Decline
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleApprove(invitation.id)}
                        disabled={isProcessing}
                      >
                        <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        Approve
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </PageContainer>

      {/* Toast Notification */}
      {toast && (
        <div
          className={`
            fixed bottom-6 left-1/2 transform -translate-x-1/2
            px-4 py-3 rounded-[var(--radius-lg)]
            flex items-center gap-2
            shadow-[var(--shadow-lg)]
            animate-slide-up
            ${toast.type === 'success'
              ? 'bg-[var(--success)] text-white'
              : 'bg-[var(--error)] text-white'
            }
          `.trim().replace(/\s+/g, ' ')}
        >
          {toast.type === 'success' ? (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
          <span className="text-[var(--text-sm)] font-medium">{toast.message}</span>
        </div>
      )}

      <style jsx>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translate(-50%, 20px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}
