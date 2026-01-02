'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import type { Room, User } from '@/lib/supabase/types';
import {
  Button,
  Card,
  Input,
  Textarea,
  Toggle,
  Tabs,
  TabsList,
  TabsTrigger,
} from '@/components/ui';
import { PageContainer } from '@/components/layout';
import { AppHeader } from '@/components/composed';

type RoomTone = 'chill' | 'playful' | 'deep' | 'intense';

type RoomWithHost = Room & {
  host: Pick<User, 'id' | 'name'>;
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
  description: 'An intimate dinner for strangers who want real conversation. We gather around good food and explore topics that matter.',
  tone: 'deep' as RoomTone,
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
  host: { id: 'demo-host', name: 'Liban' },
};

const toneOptions: { value: RoomTone; label: string; description: string }[] = [
  { value: 'chill', label: 'Chill', description: 'Relaxed, low-pressure vibes' },
  { value: 'playful', label: 'Playful', description: 'Fun, games, and laughter' },
  { value: 'deep', label: 'Deep', description: 'Meaningful conversations' },
  { value: 'intense', label: 'Intense', description: 'High energy, challenging' },
];

export default function RoomSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = params.id as string;

  const [room, setRoom] = useState<RoomWithHost | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [demoMode, setDemoMode] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [tone, setTone] = useState<RoomTone>('deep');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState(120);
  const [capacity, setCapacity] = useState(8);
  const [price, setPrice] = useState(45);
  const [locationAddress, setLocationAddress] = useState('');
  const [locationHint, setLocationHint] = useState('');
  const [locationRevealed, setLocationRevealed] = useState(false);

  useEffect(() => {
    loadRoom();
  }, [roomId]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  async function loadRoom() {
    if (!isSupabaseConfigured() || roomId.startsWith('demo-')) {
      setDemoMode(true);
      setRoom(MOCK_ROOM);
      populateForm(MOCK_ROOM);
      setLoading(false);
      return;
    }

    try {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();

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
        populateForm(roomData as RoomWithHost);
      }
    } catch (err) {
      console.error('Failed to load room:', err);
    }

    setLoading(false);
  }

  function populateForm(room: RoomWithHost) {
    setName(room.name);
    setDescription(room.description || '');
    setTone(room.tone as RoomTone);
    setDate(room.date);
    setTime(room.time);
    setDuration(room.duration_minutes);
    setCapacity(room.capacity);
    setPrice(room.price_cents / 100);
    setLocationAddress(room.location_address);
    setLocationHint(room.location_hint || '');
    setLocationRevealed(room.location_revealed);
  }

  async function handleSave() {
    setSaving(true);

    if (demoMode) {
      await new Promise(r => setTimeout(r, 500));
      setToast({ message: 'Settings saved (demo)', type: 'success' });
      setSaving(false);
      return;
    }

    try {
      const response = await fetch(`/api/rooms/${roomId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          tone,
          date,
          time,
          duration_minutes: duration,
          capacity,
          price_cents: Math.round(price * 100),
          location_address: locationAddress,
          location_hint: locationHint,
          location_revealed: locationRevealed,
        }),
      });

      if (response.ok) {
        setToast({ message: 'Settings saved', type: 'success' });
      } else {
        setToast({ message: 'Failed to save settings', type: 'error' });
      }
    } catch {
      setToast({ message: 'Failed to save settings', type: 'error' });
    }

    setSaving(false);
  }

  async function handleCancel() {
    if (!confirm('Are you sure you want to cancel this room? This cannot be undone.')) {
      return;
    }

    setSaving(true);

    if (demoMode) {
      await new Promise(r => setTimeout(r, 500));
      setToast({ message: 'Room cancelled (demo)', type: 'success' });
      router.push('/host');
      return;
    }

    try {
      const response = await fetch(`/api/rooms/${roomId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'canceled' }),
      });

      if (response.ok) {
        setToast({ message: 'Room cancelled', type: 'success' });
        router.push('/host');
      } else {
        setToast({ message: 'Failed to cancel room', type: 'error' });
      }
    } catch {
      setToast({ message: 'Failed to cancel room', type: 'error' });
    }

    setSaving(false);
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

      <PageContainer size="md" className="py-8">
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

          <h1 className="text-[var(--text-2xl)] font-bold text-[var(--text-primary)]">
            Room Settings
          </h1>
          <p className="text-[var(--text-sm)] text-[var(--text-secondary)] mt-1">
            {room.name}
          </p>
        </div>

        {/* Navigation Tabs */}
        <Tabs defaultValue="settings" className="mb-8">
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
            <TabsTrigger value="settings">
              Settings
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Settings Form */}
        <div className="space-y-8">
          {/* General */}
          <Card className="p-6">
            <h2 className="text-[var(--text-lg)] font-semibold text-[var(--text-primary)] mb-6">
              General
            </h2>

            <div className="space-y-6">
              <Input
                label="Room Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Give your room a name"
              />

              <Textarea
                label="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What's this room about?"
                rows={4}
              />

              {/* Tone Selection */}
              <div>
                <label className="block text-[var(--text-sm)] font-medium text-[var(--text-primary)] mb-3">
                  Tone
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {toneOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setTone(option.value)}
                      className={`
                        p-4 rounded-[var(--radius-lg)] border text-left transition-all
                        ${tone === option.value
                          ? 'bg-[var(--primary-muted)] border-[var(--primary)] text-[var(--text-primary)]'
                          : 'bg-[var(--bg-surface)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-[var(--border-default)]'
                        }
                      `.trim().replace(/\s+/g, ' ')}
                    >
                      <span className="block font-medium">{option.label}</span>
                      <span className="block text-[var(--text-xs)] text-[var(--text-muted)] mt-1">
                        {option.description}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Date & Time */}
          <Card className="p-6">
            <h2 className="text-[var(--text-lg)] font-semibold text-[var(--text-primary)] mb-6">
              Date & Time
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Input
                type="date"
                label="Date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
              <Input
                type="time"
                label="Start Time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>

            <div className="mt-6">
              <label className="block text-[var(--text-sm)] font-medium text-[var(--text-primary)] mb-3">
                Duration
              </label>
              <div className="flex gap-3">
                {[60, 90, 120, 150, 180].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setDuration(mins)}
                    className={`
                      px-4 py-2 rounded-[var(--radius-md)] border text-[var(--text-sm)] transition-all
                      ${duration === mins
                        ? 'bg-[var(--primary)] border-[var(--primary)] text-white'
                        : 'bg-[var(--bg-surface)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-[var(--border-default)]'
                      }
                    `.trim().replace(/\s+/g, ' ')}
                  >
                    {mins >= 60 ? `${mins / 60}h` : `${mins}m`}
                    {mins % 60 !== 0 && mins >= 60 ? ` ${mins % 60}m` : ''}
                  </button>
                ))}
              </div>
            </div>
          </Card>

          {/* Capacity & Pricing */}
          <Card className="p-6">
            <h2 className="text-[var(--text-lg)] font-semibold text-[var(--text-primary)] mb-6">
              Capacity & Pricing
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-[var(--text-sm)] font-medium text-[var(--text-primary)] mb-3">
                  Capacity
                </label>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => setCapacity(Math.max(2, capacity - 1))}
                    className="w-10 h-10 rounded-[var(--radius-md)] border border-[var(--border-default)] text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)]"
                  >
                    -
                  </button>
                  <span className="text-[var(--text-xl)] font-medium text-[var(--text-primary)] w-12 text-center">
                    {capacity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setCapacity(Math.min(20, capacity + 1))}
                    className="w-10 h-10 rounded-[var(--radius-md)] border border-[var(--border-default)] text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)]"
                  >
                    +
                  </button>
                </div>
              </div>

              <Input
                type="number"
                label="Price per guest ($)"
                value={price.toString()}
                onChange={(e) => setPrice(Number(e.target.value))}
                min={0}
                step={5}
              />
            </div>
          </Card>

          {/* Location */}
          <Card className="p-6">
            <h2 className="text-[var(--text-lg)] font-semibold text-[var(--text-primary)] mb-6">
              Location
            </h2>

            <div className="space-y-6">
              <Input
                label="Full Address"
                value={locationAddress}
                onChange={(e) => setLocationAddress(e.target.value)}
                placeholder="123 Main St, Minneapolis, MN 55401"
                hint="Shared with guests 4 hours before the event"
              />

              <Input
                label="Location Hint"
                value={locationHint}
                onChange={(e) => setLocationHint(e.target.value)}
                placeholder="Northeast Minneapolis"
                hint="Shown to guests before the address is revealed"
              />

              <Toggle
                label="Reveal location now"
                description="Show the full address to confirmed guests immediately"
                checked={locationRevealed}
                onChange={(e) => setLocationRevealed(e.target.checked)}
              />
            </div>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button
              variant="primary"
              size="lg"
              onClick={handleSave}
              loading={saving}
            >
              Save Changes
            </Button>
          </div>

          {/* Danger Zone */}
          <Card className="p-6 border-[var(--error)] border-opacity-50">
            <h2 className="text-[var(--text-lg)] font-semibold text-[var(--error-text)] mb-4">
              Danger Zone
            </h2>
            <p className="text-[var(--text-sm)] text-[var(--text-secondary)] mb-4">
              Cancelling this room will notify all guests and refund any payments.
              This action cannot be undone.
            </p>
            <Button
              variant="destructive"
              onClick={handleCancel}
              disabled={saving}
            >
              Cancel Room
            </Button>
          </Card>
        </div>
      </PageContainer>

      {/* Toast */}
      {toast && (
        <div
          className={`
            fixed bottom-6 left-1/2 transform -translate-x-1/2
            px-4 py-3 rounded-[var(--radius-lg)]
            flex items-center gap-2
            shadow-[var(--shadow-lg)]
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
    </div>
  );
}
