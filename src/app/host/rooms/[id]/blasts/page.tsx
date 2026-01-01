'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import type { Room, User } from '@/lib/supabase/types';
import {
  Button,
  Card,
  Badge,
  Textarea,
  Tabs,
  TabsList,
  TabsTrigger,
} from '@/components/ui';
import { PageContainer, Header } from '@/components/layout';
import { EmptyState } from '@/components/composed';
import { useToast } from '@/components/ui/toast';

type RecipientFilter = 'all' | 'confirmed' | 'invited';

interface Blast {
  id: string;
  message: string;
  recipient_filter: RecipientFilter;
  recipient_count: number;
  sent_at: string;
  sent_by: string;
}

// Check if Supabase is configured
const isSupabaseConfigured = () => {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
};

// Mock room data
const MOCK_ROOM: Room = {
  id: 'demo-1',
  host_id: 'demo-host',
  name: 'Dinner & Deep Talks',
  description: 'An intimate dinner for strangers who want real conversation.',
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
};

// Mock guest counts
const MOCK_GUEST_COUNTS = {
  confirmed: 5,
  invited: 3,
  total: 8,
};

// Mock blast history
const MOCK_BLASTS: Blast[] = [
  {
    id: '1',
    message: "Hey everyone! Looking forward to seeing you all this Friday. Reminder: the theme is 'deep talks' so come ready to share and listen. See you soon!",
    recipient_filter: 'confirmed',
    recipient_count: 5,
    sent_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    sent_by: 'Demo Host',
  },
  {
    id: '2',
    message: "Quick update - parking is available on the street or in the lot behind the building. Spots fill up fast so arrive a few minutes early if you can!",
    recipient_filter: 'confirmed',
    recipient_count: 4,
    sent_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    sent_by: 'Demo Host',
  },
];

// SMS character limit (standard is 160, but we allow longer)
const SMS_SEGMENT_LENGTH = 160;

export default function BlastsPage() {
  const params = useParams();
  const router = useRouter();
  const { addToast } = useToast();
  const roomId = params.id as string;

  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [demoMode, setDemoMode] = useState(false);
  const [blasts, setBlasts] = useState<Blast[]>([]);
  const [guestCounts, setGuestCounts] = useState({ confirmed: 0, invited: 0, total: 0 });

  // Compose state
  const [message, setMessage] = useState('');
  const [recipientFilter, setRecipientFilter] = useState<RecipientFilter>('confirmed');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    loadData();
  }, [roomId]);

  async function loadData() {
    if (!isSupabaseConfigured()) {
      setDemoMode(true);
      setRoom(MOCK_ROOM);
      setBlasts(MOCK_BLASTS);
      setGuestCounts(MOCK_GUEST_COUNTS);
      setLoading(false);
      return;
    }

    const { createClient } = await import('@/lib/supabase/client');
    const supabase = createClient();

    // Load room
    const { data: roomData } = await supabase
      .from('rooms')
      .select('*')
      .eq('id', roomId)
      .single();

    if (roomData) {
      setRoom(roomData);

      // Get guest counts
      const { data: invitations } = await supabase
        .from('invitations')
        .select('status')
        .eq('room_id', roomId);

      if (invitations) {
        const confirmed = invitations.filter(i => i.status === 'accepted').length;
        const invited = invitations.filter(i => i.status === 'sent').length;
        setGuestCounts({
          confirmed,
          invited,
          total: confirmed + invited,
        });
      }

      // TODO: Load blast history from database when table exists
      // For now, use empty array in production mode
      setBlasts([]);
    }

    setLoading(false);
  }

  const getRecipientCount = () => {
    switch (recipientFilter) {
      case 'confirmed':
        return guestCounts.confirmed;
      case 'invited':
        return guestCounts.invited;
      case 'all':
        return guestCounts.total;
    }
  };

  const getSmsSegments = () => {
    if (!message) return 0;
    return Math.ceil(message.length / SMS_SEGMENT_LENGTH);
  };

  const handleSend = async () => {
    if (!message.trim()) {
      addToast({
        variant: 'error',
        title: 'Message required',
        description: 'Please enter a message to send.',
      });
      return;
    }

    const recipientCount = getRecipientCount();
    if (recipientCount === 0) {
      addToast({
        variant: 'error',
        title: 'No recipients',
        description: 'There are no guests to send this message to.',
      });
      return;
    }

    setSending(true);

    // In production, this would call an API to send SMS
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Add to blast history
    const newBlast: Blast = {
      id: `blast-${Date.now()}`,
      message: message.trim(),
      recipient_filter: recipientFilter,
      recipient_count: recipientCount,
      sent_at: new Date().toISOString(),
      sent_by: 'You',
    };

    setBlasts(prev => [newBlast, ...prev]);
    setMessage('');
    setSending(false);

    addToast({
      variant: 'success',
      title: 'Blast sent!',
      description: `Message sent to ${recipientCount} guest${recipientCount !== 1 ? 's' : ''}.`,
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Today at ' + date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday at ' + date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    } else if (diffDays < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'long' }) + ' at ' + date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' at ' + date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    }
  };

  const getRecipientLabel = (filter: RecipientFilter) => {
    switch (filter) {
      case 'confirmed':
        return 'Confirmed guests';
      case 'invited':
        return 'Pending invites';
      case 'all':
        return 'All guests';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-base)] flex items-center justify-center">
        <div className="text-[var(--text-secondary)]">Loading...</div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-[var(--bg-base)]">
        <Header />
        <PageContainer size="md" className="py-12">
          <EmptyState
            icon={
              <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            title="Room not found"
            description="This room doesn't exist or you don't have access to it."
            action={{
              label: 'Back to Dashboard',
              href: '/host',
              variant: 'primary',
            }}
          />
        </PageContainer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-base)]">
      <Header />

      {/* Demo Mode Banner */}
      {demoMode && (
        <div className="bg-[var(--warning-muted)] border-b border-[var(--warning-border)] px-6 py-3 text-center text-[var(--warning-text)] text-[var(--text-sm)]">
          Demo Mode - Supabase not configured
        </div>
      )}

      <PageContainer size="lg" className="py-8">
        {/* Breadcrumb & Header */}
        <div className="mb-8">
          <Link
            href={`/host/rooms/${roomId}`}
            className="inline-flex items-center gap-2 text-[var(--text-sm)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors mb-4"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Back to Room
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-[var(--text-2xl)] font-bold text-[var(--text-primary)]">
                Blasts
              </h1>
              <p className="text-[var(--text-sm)] text-[var(--text-secondary)] mt-1">
                Send messages to your guests for {room.name}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Compose Section */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <h2 className="text-[var(--text-lg)] font-semibold text-[var(--text-primary)] mb-6">
                New Blast
              </h2>

              {/* Recipient Selection */}
              <div className="mb-6">
                <label className="block text-[var(--text-sm)] font-medium text-[var(--text-primary)] mb-3">
                  Send to
                </label>
                <div className="flex flex-wrap gap-3">
                  {(['confirmed', 'invited', 'all'] as RecipientFilter[]).map((filter) => {
                    const count = filter === 'confirmed' ? guestCounts.confirmed :
                                 filter === 'invited' ? guestCounts.invited :
                                 guestCounts.total;
                    const isSelected = recipientFilter === filter;
                    return (
                      <button
                        key={filter}
                        type="button"
                        onClick={() => setRecipientFilter(filter)}
                        className={`
                          inline-flex items-center gap-2 px-4 py-2
                          rounded-[var(--radius-lg)] border
                          text-[var(--text-sm)] font-medium
                          transition-all duration-[var(--duration-normal)]
                          ${isSelected
                            ? 'bg-[var(--primary)] border-[var(--primary)] text-white'
                            : 'bg-[var(--bg-subtle)] border-[var(--border-default)] text-[var(--text-secondary)] hover:border-[var(--border-strong)]'
                          }
                        `}
                      >
                        {filter === 'confirmed' && 'Confirmed'}
                        {filter === 'invited' && 'Pending'}
                        {filter === 'all' && 'All Guests'}
                        <Badge
                          variant={isSelected ? 'primary' : 'default'}
                          size="sm"
                        >
                          {count}
                        </Badge>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Message Input */}
              <div className="mb-6">
                <label className="block text-[var(--text-sm)] font-medium text-[var(--text-primary)] mb-2">
                  Message
                </label>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Write your message here..."
                  rows={5}
                  className="w-full"
                />
                <div className="flex items-center justify-between mt-2 text-[var(--text-xs)] text-[var(--text-muted)]">
                  <span>
                    {message.length} characters
                    {getSmsSegments() > 1 && ` (${getSmsSegments()} SMS segments)`}
                  </span>
                  {message.length > 0 && (
                    <span className="text-[var(--text-secondary)]">
                      Will be sent via SMS
                    </span>
                  )}
                </div>
              </div>

              {/* Send Button */}
              <div className="flex items-center justify-between pt-4 border-t border-[var(--border-subtle)]">
                <div className="text-[var(--text-sm)] text-[var(--text-secondary)]">
                  {getRecipientCount() > 0 ? (
                    <>Sending to <span className="font-medium text-[var(--text-primary)]">{getRecipientCount()}</span> guest{getRecipientCount() !== 1 ? 's' : ''}</>
                  ) : (
                    <span className="text-[var(--warning-text)]">No recipients available</span>
                  )}
                </div>
                <Button
                  variant="primary"
                  onClick={handleSend}
                  disabled={!message.trim() || getRecipientCount() === 0 || sending}
                  loading={sending}
                >
                  {sending ? 'Sending...' : 'Send Blast'}
                </Button>
              </div>
            </Card>

            {/* Blast History */}
            <div className="mt-8">
              <h2 className="text-[var(--text-lg)] font-semibold text-[var(--text-primary)] mb-4">
                Sent Blasts
              </h2>

              {blasts.length === 0 ? (
                <Card className="p-8">
                  <EmptyState
                    icon={
                      <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                      </svg>
                    }
                    title="No blasts yet"
                    description="Send your first blast to communicate with your guests."
                  />
                </Card>
              ) : (
                <div className="space-y-4">
                  {blasts.map((blast) => (
                    <Card key={blast.id} className="p-5">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex items-center gap-2">
                          <Badge variant="default" size="sm">
                            {getRecipientLabel(blast.recipient_filter)}
                          </Badge>
                          <span className="text-[var(--text-xs)] text-[var(--text-muted)]">
                            {blast.recipient_count} recipient{blast.recipient_count !== 1 ? 's' : ''}
                          </span>
                        </div>
                        <span className="text-[var(--text-xs)] text-[var(--text-muted)]">
                          {formatDate(blast.sent_at)}
                        </span>
                      </div>
                      <p className="text-[var(--text-sm)] text-[var(--text-primary)] whitespace-pre-wrap">
                        {blast.message}
                      </p>
                      <div className="mt-3 pt-3 border-t border-[var(--border-subtle)]">
                        <span className="text-[var(--text-xs)] text-[var(--text-muted)]">
                          Sent by {blast.sent_by}
                        </span>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - Quick Stats & Tips */}
          <div className="space-y-6">
            {/* Guest Summary */}
            <Card className="p-5">
              <h3 className="text-[var(--text-sm)] font-semibold text-[var(--text-primary)] mb-4">
                Guest Summary
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[var(--text-sm)] text-[var(--text-secondary)]">Confirmed</span>
                  <span className="text-[var(--text-sm)] font-medium text-[var(--success-text)]">
                    {guestCounts.confirmed}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--text-sm)] text-[var(--text-secondary)]">Pending</span>
                  <span className="text-[var(--text-sm)] font-medium text-[var(--warning-text)]">
                    {guestCounts.invited}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-[var(--border-subtle)]">
                  <span className="text-[var(--text-sm)] text-[var(--text-secondary)]">Total</span>
                  <span className="text-[var(--text-sm)] font-medium text-[var(--text-primary)]">
                    {guestCounts.total}
                  </span>
                </div>
              </div>
            </Card>

            {/* Tips */}
            <Card className="p-5 bg-[var(--info-muted)] border-[var(--info-border)]">
              <h3 className="text-[var(--text-sm)] font-semibold text-[var(--info-text)] mb-3">
                Blast Tips
              </h3>
              <ul className="space-y-2 text-[var(--text-xs)] text-[var(--text-secondary)]">
                <li className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-[var(--info-text)] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Keep messages concise - under 160 characters for a single SMS</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-[var(--info-text)] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Send reminders 1-2 days before your event</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-[var(--info-text)] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Include practical info: parking, what to bring, dress code</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-[var(--info-text)] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Build excitement! Share a teaser about what to expect</span>
                </li>
              </ul>
            </Card>

            {/* Quick Actions */}
            <Card className="p-5">
              <h3 className="text-[var(--text-sm)] font-semibold text-[var(--text-primary)] mb-4">
                Quick Actions
              </h3>
              <div className="space-y-2">
                <Link
                  href={`/host/rooms/${roomId}/guests`}
                  className="flex items-center gap-3 p-3 rounded-[var(--radius-lg)] bg-[var(--bg-subtle)] hover:bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-[var(--border-default)] transition-all"
                >
                  <svg className="w-5 h-5 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                  </svg>
                  <span className="text-[var(--text-sm)] text-[var(--text-primary)]">Manage Guests</span>
                </Link>
                <Link
                  href={`/host/rooms/${roomId}/settings`}
                  className="flex items-center gap-3 p-3 rounded-[var(--radius-lg)] bg-[var(--bg-subtle)] hover:bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-[var(--border-default)] transition-all"
                >
                  <svg className="w-5 h-5 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-[var(--text-sm)] text-[var(--text-primary)]">Room Settings</span>
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
