'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import type { Space, User } from '@/lib/supabase/types';
import {
  Button,
  Input,
  Card,
  Badge,
  Avatar,
} from '@/components/ui';
import { PageContainer } from '@/components/layout';
import { HostBadge } from '@/components/composed';

type SpaceTone = 'chill' | 'playful' | 'deep' | 'intense';

type SpaceWithHost = Space & {
  host: Pick<User, 'id' | 'name'>;
};

// Check if Supabase is configured
const isSupabaseConfigured = () => {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
};

// Mock data for demo mode
const MOCK_SPACE: SpaceWithHost = {
  id: 'demo-1',
  host_id: 'demo-host',
  name: 'Dinner & Deep Talks',
  description: 'Demo room',
  tone: 'deep' as SpaceTone,
  date: new Date().toISOString().split('T')[0] ?? '',
  time: '19:00',
  duration_minutes: 180,
  location_address: '123 Example St, Minneapolis, MN',
  location_hint: 'Northeast Minneapolis',
  capacity: 8,
  price_cents: 4500,
  status: 'confirmed',
  location_revealed: true,
  feedback_requested: false,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  host: { id: 'demo-host', name: 'Liban' },
};

// Tone configuration
const toneConfig: Record<SpaceTone, { gradient: string }> = {
  chill: { gradient: 'from-blue-500/30 to-cyan-500/30' },
  playful: { gradient: 'from-pink-500/30 to-orange-500/30' },
  deep: { gradient: 'from-purple-500/30 to-indigo-500/30' },
  intense: { gradient: 'from-red-500/30 to-amber-500/30' },
};

export default function CheckInPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const spaceId = typeof params.id === 'string' ? params.id : '';
  const phoneParam = searchParams.get('phone');

  const [space, setSpace] = useState<SpaceWithHost | null>(null);
  const [loading, setLoading] = useState(true);
  const [phone, setPhone] = useState(phoneParam || '');
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    guestName?: string;
  } | null>(null);
  const [demoMode, setDemoMode] = useState(false);

  useEffect(() => {
    loadRoom();
  }, [spaceId]);

  // Auto-check if phone param is provided
  useEffect(() => {
    if (phoneParam && space && !result) {
      handleCheckIn();
    }
  }, [phoneParam, space]);

  async function loadRoom() {
    if (!isSupabaseConfigured() || spaceId.startsWith('demo-')) {
      setDemoMode(true);
      setSpace(MOCK_SPACE);
      setLoading(false);
      return;
    }

    try {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();

      const { data: spaceData } = await supabase
        .from('spaces')
        .select(`
          *,
          host:users!spaces_host_id_fkey (id, name)
        `)
        .eq('id', spaceId)
        .single();

      if (spaceData) {
        setSpace(spaceData as SpaceWithHost);
      }
    } catch (err) {
      console.error('Failed to load room:', err);
    }

    setLoading(false);
  }

  async function handleCheckIn() {
    if (!phone.trim()) return;

    setChecking(true);
    setResult(null);

    // Demo mode simulation
    if (demoMode) {
      await new Promise((r) => setTimeout(r, 1000));
      setResult({
        success: true,
        message: "You're checked in! Welcome to the space.",
        guestName: 'Demo Guest',
      });
      setChecking(false);
      return;
    }

    try {
      const response = await fetch(`/api/spaces/${spaceId}/checkin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phone.trim() }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult({
          success: true,
          message: data.message || "You're checked in!",
          guestName: data.guestName,
        });
      } else {
        setResult({
          success: false,
          message: data.error || 'Check-in failed. Please see the host.',
        });
      }
    } catch {
      setResult({
        success: false,
        message: 'Connection error. Please see the host.',
      });
    }

    setChecking(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-base)] flex items-center justify-center">
        <div className="text-[var(--text-secondary)]">Loading...</div>
      </div>
    );
  }

  if (!space) {
    return (
      <div className="min-h-screen bg-[var(--bg-base)] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-[var(--text-2xl)] text-[var(--text-primary)] mb-4">Space not found</h1>
          <Link href="/" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
            Go home
          </Link>
        </div>
      </div>
    );
  }

  const tone = space.tone as SpaceTone;
  const toneInfo = toneConfig[tone] || toneConfig.chill;

  return (
    <div className="min-h-screen bg-[var(--bg-base)] flex flex-col">
      {/* Demo Banner */}
      {demoMode && (
        <div className="bg-[var(--warning-muted)] border-b border-[var(--warning-border)] px-6 py-3 text-center text-[var(--warning-text)] text-[var(--text-sm)]">
          Demo Mode
        </div>
      )}

      {/* Header */}
      <header className="border-b border-[var(--border-subtle)]">
        <div className="max-w-md mx-auto px-6 py-4">
          <Link href="/" className="text-xl tracking-tight text-[var(--text-primary)] hover:opacity-80 transition-opacity">
            <strong><em>SMS</em></strong>
          </Link>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {result ? (
            // Result State
            <div className="text-center">
              {result.success ? (
                <>
                  {/* Success Icon */}
                  <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-[var(--success-muted)] border border-[var(--success-border)] flex items-center justify-center">
                    <svg className="w-12 h-12 text-[var(--success-text)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>

                  <h1 className="text-[var(--text-3xl)] font-bold text-[var(--text-primary)] mb-2">
                    Welcome{result.guestName ? `, ${result.guestName}` : ''}!
                  </h1>
                  <p className="text-[var(--text-secondary)] mb-8">{result.message}</p>

                  {/* Room Card */}
                  <Card className={`p-6 bg-gradient-to-br ${toneInfo.gradient}`}>
                    <h2 className="font-semibold text-[var(--text-primary)] text-[var(--text-lg)] mb-3">
                      {space.name}
                    </h2>
                    <HostBadge
                      name={space.host?.name || 'SMS Host'}
                      role="creator"
                      size="sm"
                    />
                  </Card>

                  {/* Space Details */}
                  <div className="mt-6 p-4 bg-[var(--bg-subtle)] rounded-[var(--radius-lg)]">
                    <div className="flex items-center gap-3 text-[var(--text-sm)]">
                      <svg className="w-4 h-4 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                      </svg>
                      <span className="text-[var(--text-secondary)]">
                        {space.location_revealed ? space.location_address : space.location_hint}
                      </span>
                    </div>
                  </div>

                  {/* Contract Reminder */}
                  <Card variant="outlined" className="mt-6 p-4">
                    <h3 className="text-[var(--text-sm)] font-medium text-[var(--text-primary)] mb-3">Remember</h3>
                    <div className="space-y-2 text-[var(--text-sm)] text-[var(--text-secondary)]">
                      <div className="flex items-center gap-2">
                        <span>📵</span>
                        <span>Phones away, presence on</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>🤫</span>
                        <span>What's shared here stays here</span>
                      </div>
                    </div>
                  </Card>
                </>
              ) : (
                <>
                  {/* Failure Icon */}
                  <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-[var(--error-muted)] border border-[var(--error-border)] flex items-center justify-center">
                    <svg className="w-12 h-12 text-[var(--error-text)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>

                  <h1 className="text-[var(--text-3xl)] font-bold text-[var(--text-primary)] mb-2">
                    Check-in Failed
                  </h1>
                  <p className="text-[var(--text-secondary)] mb-8">{result.message}</p>

                  <Button
                    variant="primary"
                    size="lg"
                    onClick={() => {
                      setResult(null);
                      setPhone('');
                    }}
                  >
                    Try Again
                  </Button>
                </>
              )}
            </div>
          ) : (
            // Check-in Form
            <>
              {/* Room Header */}
              <Card className={`p-6 mb-8 bg-gradient-to-br ${toneInfo.gradient} text-center`}>
                <Badge variant="checked-in" size="lg" className="mb-4">
                  Check In
                </Badge>
                <h1 className="text-[var(--text-2xl)] font-bold text-[var(--text-primary)] mb-2">
                  {space.name}
                </h1>
                <p className="text-[var(--text-sm)] text-[var(--text-secondary)]">
                  Hosted by {space.host?.name || 'SMS'}
                </p>
              </Card>

              {/* Phone Input Card */}
              <Card className="p-6">
                <label className="block text-[var(--text-sm)] text-[var(--text-secondary)] mb-3">
                  Enter your phone number to check in
                </label>
                <Input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(612) 555-1234"
                  size="lg"
                  className="mb-4 text-center text-lg"
                  autoFocus
                />

                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  onClick={handleCheckIn}
                  disabled={checking || !phone.trim()}
                  loading={checking}
                >
                  {checking ? 'Checking in...' : 'Check In'}
                </Button>
              </Card>

              {/* Help Text */}
              <p className="text-center text-[var(--text-muted)] text-[var(--text-sm)] mt-6">
                Having trouble? Ask your host for help.
              </p>
            </>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--border-subtle)] py-6">
        <div className="max-w-md mx-auto text-center text-[var(--text-sm)] text-[var(--text-muted)]">
          Strangers Meeting Strangers
        </div>
      </footer>
    </div>
  );
}
