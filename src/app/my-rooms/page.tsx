'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import type { Room } from '@/lib/supabase/types';
import { Card, Badge, Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui';
import { PageContainer, Header } from '@/components/layout';
import { RoomCard, EmptyState } from '@/components/composed';

type RoomTone = 'chill' | 'playful' | 'deep' | 'intense';

type RoomWithDetails = Room & {
  host: { name: string };
  guest_count: number;
  user_status: 'going' | 'invited' | 'attended' | 'missed';
};

// Check if Supabase is configured
const isSupabaseConfigured = () => {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
};

// Mock rooms for demo mode
const MOCK_ROOMS: RoomWithDetails[] = [
  {
    id: 'room-1',
    host_id: 'host-1',
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
    host: { name: 'Sarah K.' },
    guest_count: 5,
    user_status: 'going',
  },
  {
    id: 'room-2',
    host_id: 'host-2',
    name: 'Strangers & Vinyl',
    description: 'Listen to records, share stories, meet new people.',
    tone: 'chill',
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    time: '20:00',
    duration_minutes: 120,
    location_address: '456 Demo Ave, Minneapolis, MN',
    location_hint: 'Uptown',
    capacity: 12,
    price_cents: 2500,
    status: 'open',
    location_revealed: false,
    feedback_requested: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    host: { name: 'Marcus T.' },
    guest_count: 8,
    user_status: 'invited',
  },
  {
    id: 'room-3',
    host_id: 'host-3',
    name: 'Game Night Strangers',
    description: 'Board games and new friendships.',
    tone: 'playful',
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    time: '18:00',
    duration_minutes: 150,
    location_address: '789 Fun Blvd, Minneapolis, MN',
    location_hint: 'Downtown',
    capacity: 10,
    price_cents: 2000,
    status: 'completed',
    location_revealed: true,
    feedback_requested: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    host: { name: 'Alex R.' },
    guest_count: 10,
    user_status: 'attended',
  },
  {
    id: 'room-4',
    host_id: 'host-4',
    name: 'Morning Coffee Club',
    description: 'Start your day meeting new people over coffee.',
    tone: 'chill',
    date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    time: '08:00',
    duration_minutes: 90,
    location_address: '321 Coffee St, Minneapolis, MN',
    location_hint: 'North Loop',
    capacity: 8,
    price_cents: 1500,
    status: 'completed',
    location_revealed: true,
    feedback_requested: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    host: { name: 'Jordan P.' },
    guest_count: 7,
    user_status: 'attended',
  },
];

export default function MyRoomsPage() {
  const [rooms, setRooms] = useState<RoomWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [demoMode, setDemoMode] = useState(false);
  const [activeTab, setActiveTab] = useState('upcoming');

  useEffect(() => {
    loadRooms();
  }, []);

  async function loadRooms() {
    if (!isSupabaseConfigured()) {
      setDemoMode(true);
      setRooms(MOCK_ROOMS);
      setLoading(false);
      return;
    }

    const { createClient } = await import('@/lib/supabase/client');
    const supabase = createClient();

    const storedPhone = localStorage.getItem('sms_user_phone');
    if (!storedPhone) {
      setLoading(false);
      return;
    }

    // Get user
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('phone', storedPhone)
      .single();

    if (!user) {
      setLoading(false);
      return;
    }

    // Get user's invitations with room details
    const { data: invitations } = await supabase
      .from('invitations')
      .select(`
        status,
        attended,
        room:rooms(
          *,
          host:users!rooms_host_id_fkey(name)
        )
      `)
      .eq('user_id', user.id);

    if (invitations) {
      const roomsWithStatus = invitations
        .filter((inv): inv is typeof inv & { room: Room & { host: { name: string } } } => inv.room !== null)
        .map((inv) => {
          let userStatus: 'going' | 'invited' | 'attended' | 'missed';
          if (inv.attended === true) {
            userStatus = 'attended';
          } else if (inv.attended === false) {
            userStatus = 'missed';
          } else if (inv.status === 'accepted') {
            userStatus = 'going';
          } else {
            userStatus = 'invited';
          }

          return {
            ...inv.room,
            guest_count: 0, // Would need additional query
            user_status: userStatus,
          };
        });

      setRooms(roomsWithStatus);
    }

    setLoading(false);
  }

  // Filter rooms by tab
  const upcomingRooms = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return rooms.filter(r => r.date >= today && (r.user_status === 'going' || r.user_status === 'invited'));
  }, [rooms]);

  const pastRooms = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return rooms.filter(r => r.date < today || r.user_status === 'attended' || r.user_status === 'missed');
  }, [rooms]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'going':
        return <Badge variant="going" size="sm">Going</Badge>;
      case 'invited':
        return <Badge variant="invited" size="sm">Invited</Badge>;
      case 'attended':
        return <Badge variant="success" size="sm">Attended</Badge>;
      case 'missed':
        return <Badge variant="error" size="sm">Missed</Badge>;
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-base)] flex items-center justify-center">
        <div className="text-[var(--text-secondary)]">Loading...</div>
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
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-[var(--text-2xl)] font-bold text-[var(--text-primary)]">
              My Rooms
            </h1>
            <p className="text-[var(--text-sm)] text-[var(--text-secondary)] mt-1">
              Track your upcoming rooms and past experiences
            </p>
          </div>
          <Link href="/discover">
            <button className="inline-flex items-center gap-2 px-4 py-2 rounded-[var(--radius-lg)] bg-[var(--primary)] text-white font-medium text-[var(--text-sm)] hover:bg-[var(--primary-hover)] transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              Find Rooms
            </button>
          </Link>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="upcoming">
              Upcoming
              {upcomingRooms.length > 0 && (
                <Badge variant="primary" size="sm" className="ml-2">
                  {upcomingRooms.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="past">
              Past
              {pastRooms.length > 0 && (
                <Badge variant="default" size="sm" className="ml-2">
                  {pastRooms.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Upcoming Rooms */}
          <TabsContent value="upcoming">
            {upcomingRooms.length === 0 ? (
              <Card className="p-12">
                <EmptyState
                  icon={
                    <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                    </svg>
                  }
                  title="No upcoming rooms"
                  description="You haven't joined any rooms yet. Discover rooms near you and start meeting strangers."
                  action={{
                    label: 'Discover Rooms',
                    href: '/discover',
                    variant: 'primary',
                  }}
                />
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcomingRooms.map((room) => (
                  <div key={room.id} className="relative">
                    <div className="absolute top-4 right-4 z-10">
                      {getStatusBadge(room.user_status)}
                    </div>
                    <RoomCard
                      id={room.id}
                      title={room.name}
                      tone={room.tone as RoomTone}
                      date={room.date}
                      time={room.time}
                      location={room.location_hint || undefined}
                      capacity={room.capacity}
                      guestCount={room.guest_count}
                      hostName={room.host.name}
                      href={`/rooms/${room.id}`}
                    />
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Past Rooms */}
          <TabsContent value="past">
            {pastRooms.length === 0 ? (
              <Card className="p-12">
                <EmptyState
                  icon={
                    <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  }
                  title="No past rooms"
                  description="Once you attend rooms, they'll appear here so you can look back on your experiences."
                />
              </Card>
            ) : (
              <div className="space-y-4">
                {pastRooms.map((room) => (
                  <Link key={room.id} href={`/rooms/${room.id}`}>
                    <Card className="p-5 hover:border-[var(--border-strong)] transition-colors cursor-pointer">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-[var(--text-base)] font-semibold text-[var(--text-primary)]">
                              {room.name}
                            </h3>
                            {getStatusBadge(room.user_status)}
                          </div>
                          <div className="flex flex-wrap items-center gap-3 text-[var(--text-sm)] text-[var(--text-secondary)]">
                            <span>{formatDate(room.date)}</span>
                            <span className="text-[var(--text-muted)]">at</span>
                            <span>{room.time}</span>
                            {room.location_hint && (
                              <>
                                <span className="text-[var(--text-muted)]">in</span>
                                <span>{room.location_hint}</span>
                              </>
                            )}
                          </div>
                          <p className="text-[var(--text-sm)] text-[var(--text-muted)] mt-2">
                            Hosted by {room.host.name}
                          </p>
                        </div>
                        <div className="flex-shrink-0">
                          <svg className="w-5 h-5 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                          </svg>
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </PageContainer>
    </div>
  );
}
