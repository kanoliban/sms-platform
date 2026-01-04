'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import type { Space, User, Invitation } from '@/lib/supabase/types';
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
import { HostGuard, useHostUser } from '@/components/auth';
import { createClient } from '@/lib/supabase/client';

type SpaceTone = 'chill' | 'playful' | 'deep' | 'intense';

type SpaceWithHost = Space & {
  host: Pick<User, 'id' | 'name'>;
};

type InvitationWithGuest = Invitation & {
  guest?: Pick<User, 'id' | 'name' | 'phone'> | null;
};

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

function ApprovalsContent() {
  const params = useParams();
  const router = useRouter();
  const host = useHostUser();
  const spaceId = params.id as string;

  const [space, setSpace] = useState<SpaceWithHost | null>(null);
  const [invitations, setInvitations] = useState<InvitationWithGuest[]>([]);
  const [loading, setLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    loadData();
  }, [spaceId, host.id]);

  // Auto-hide toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  async function loadData() {
    try {
      const supabase = createClient();

      // Load room with host
      const { data: spaceData } = await supabase
        .from('spaces')
        .select(`
          *,
          host:users!spaces_host_id_fkey (id, name)
        `)
        .eq('id', spaceId)
        .single();

      if (!spaceData) {
        setLoading(false);
        return;
      }

      // Verify ownership
      if (spaceData.host_id !== host.id) {
        setUnauthorized(true);
        setLoading(false);
        return;
      }

      setSpace(spaceData as SpaceWithHost);

      // Load pending invitations
      const { data: invData } = await supabase
        .from('invitations')
        .select(`
          *,
          guest:users!invitations_guest_id_fkey (id, name, phone)
        `)
        .eq('space_id', spaceId)
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

  if (unauthorized) {
    return (
      <div className="min-h-screen bg-[var(--bg-base)] flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--error-muted)] flex items-center justify-center">
            <svg className="w-8 h-8 text-[var(--error)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-[var(--text-2xl)] font-bold text-[var(--text-primary)] mb-2">Access Denied</h1>
          <p className="text-[var(--text-secondary)] mb-6">You don&apos;t have permission to manage approvals for this space.</p>
          <button
            onClick={() => router.push('/host')}
            className="px-4 py-2 bg-[var(--primary)] text-white rounded-[var(--radius-md)] hover:opacity-90 transition-opacity"
          >
            Go to Host Hub
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
            Go to Host Hub
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-base)]">
      <AppHeader />

      <PageContainer size="lg" className="py-8">
        {/* Back Link & Title */}
        <div className="mb-8">
          <Link
            href={`/host/spaces/${spaceId}`}
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
                {space.name}
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
              onClick={() => router.push(`/host/spaces/${spaceId}`)}
            >
              Dashboard
            </TabsTrigger>
            <TabsTrigger
              value="guests"
              onClick={() => router.push(`/host/spaces/${spaceId}/guests`)}
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
              href: `/host/spaces/${spaceId}/guests`,
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

export default function ApprovalsPage() {
  return (
    <HostGuard>
      <ApprovalsContent />
    </HostGuard>
  );
}
