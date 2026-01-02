'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import type { Room } from '@/lib/supabase/types';
import { Button, Card, Textarea, EmojiRating } from '@/components/ui';
import { PageContainer } from '@/components/layout';
import { toast } from '@/components/ui/toast';

type RoomTone = 'chill' | 'playful' | 'deep' | 'intense';

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
  date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  time: '19:00',
  duration_minutes: 180,
  location_address: '123 Example St, Minneapolis, MN',
  location_hint: 'Northeast Minneapolis',
  capacity: 8,
  price_cents: 4500,
  status: 'completed',
  location_revealed: true,
  feedback_requested: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const MOCK_HOST = {
  name: 'Alex R.',
  avatar: undefined,
};

export default function FeedbackPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = params.id as string;

  const [room, setRoom] = useState<Room | null>(null);
  const [host, setHost] = useState<{ name: string; avatar?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [demoMode, setDemoMode] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Form state
  const [overallRating, setOverallRating] = useState<number | undefined>(undefined);
  const [wouldRecommend, setWouldRecommend] = useState<number | undefined>(undefined);
  const [hostRating, setHostRating] = useState<number | undefined>(undefined);
  const [suggestions, setSuggestions] = useState('');
  const [highlights, setHighlights] = useState('');

  useEffect(() => {
    loadRoom();
  }, [roomId]);

  async function loadRoom() {
    if (!isSupabaseConfigured() || roomId.startsWith('demo-')) {
      setDemoMode(true);
      setRoom(MOCK_ROOM);
      setHost(MOCK_HOST);
      setLoading(false);
      return;
    }

    try {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();

      const { data: roomData } = await supabase
        .from('rooms')
        .select('*, host:users!rooms_host_id_fkey(id, name, avatar_url)')
        .eq('id', roomId)
        .single();

      if (roomData) {
        setRoom(roomData);
        if (roomData.host) {
          setHost({
            name: roomData.host.name,
            avatar: roomData.host.avatar_url,
          });
        }
      }
    } catch (err) {
      console.error('Failed to load room:', err);
    }

    setLoading(false);
  }

  const handleSubmit = useCallback(async () => {
    if (!overallRating) {
      toast({
        variant: 'error',
        title: 'Rating required',
        description: 'Please rate your overall experience.',
      });
      return;
    }

    setSubmitting(true);

    try {
      // In a real app, we'd submit to an API
      // For demo, just simulate a delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setSubmitted(true);
      toast({
        variant: 'success',
        title: 'Feedback submitted!',
        description: 'Thank you for sharing your experience.',
      });
    } catch {
      toast({
        variant: 'error',
        title: 'Failed to submit',
        description: 'Could not submit your feedback. Please try again.',
      });
    }

    setSubmitting(false);
  }, [overallRating]);

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
          <Link href="/" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
            Go home
          </Link>
        </div>
      </div>
    );
  }

  // Success state
  if (submitted) {
    return (
      <div className="min-h-screen bg-[var(--bg-base)]">
        {/* Demo Banner */}
        {demoMode && (
          <div className="bg-[var(--warning-muted)] border-b border-[var(--warning-border)] px-6 py-3 text-center text-[var(--warning-text)] text-[var(--text-sm)]">
            Demo Mode
          </div>
        )}

        {/* Header */}
        <header className="border-b border-[var(--border-subtle)]">
          <PageContainer>
            <div className="flex justify-center items-center h-16">
              <Link href="/" className="font-bold italic text-xl tracking-tight text-[var(--text-primary)] hover:opacity-80 transition-opacity">
                SMS
              </Link>
            </div>
          </PageContainer>
        </header>

        <PageContainer className="py-16">
          <div className="max-w-md mx-auto text-center">
            <div className="w-20 h-20 rounded-full bg-[var(--success-muted)] flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-[var(--success-text)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <h1 className="text-[var(--text-2xl)] font-bold text-[var(--text-primary)] mb-3">
              Thank You!
            </h1>
            <p className="text-[var(--text-base)] text-[var(--text-secondary)] mb-8">
              Your feedback helps us create better experiences for everyone.
            </p>
            <div className="space-y-3">
              <Button variant="primary" className="w-full" onClick={() => router.push('/')}>
                Explore More Rooms
              </Button>
              <Button variant="secondary" className="w-full" onClick={() => router.push(`/rooms/${roomId}`)}>
                View Room Details
              </Button>
            </div>
          </div>
        </PageContainer>
      </div>
    );
  }

  // Format date
  const formattedDate = new Date(room.date).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="min-h-screen bg-[var(--bg-base)]">
      {/* Demo Banner */}
      {demoMode && (
        <div className="bg-[var(--warning-muted)] border-b border-[var(--warning-border)] px-6 py-3 text-center text-[var(--warning-text)] text-[var(--text-sm)]">
          Demo Mode
        </div>
      )}

      {/* Header */}
      <header className="border-b border-[var(--border-subtle)]">
        <PageContainer>
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="font-bold italic text-xl tracking-tight text-[var(--text-primary)] hover:opacity-80 transition-opacity">
              SMS
            </Link>
            <button
              type="button"
              onClick={() => router.back()}
              className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </PageContainer>
      </header>

      {/* Main Content */}
      <PageContainer className="py-8">
        <div className="max-w-lg mx-auto space-y-8">
          {/* Room Header */}
          <div className="text-center">
            <h1 className="text-[var(--text-2xl)] font-bold text-[var(--text-primary)] mb-2">
              How was your experience?
            </h1>
            <p className="text-[var(--text-base)] text-[var(--text-secondary)]">
              Share your feedback about {room.name}
            </p>
          </div>

          {/* Room Info Card */}
          <Card className="p-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-[var(--radius-lg)] bg-[var(--primary-muted)] flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-[var(--primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-[var(--text-base)] font-semibold text-[var(--text-primary)] truncate">
                  {room.name}
                </h3>
                <p className="text-[var(--text-sm)] text-[var(--text-muted)]">
                  {formattedDate} {host && <>• Hosted by {host.name}</>}
                </p>
              </div>
            </div>
          </Card>

          {/* Overall Experience */}
          <div>
            <label className="block text-[var(--text-base)] font-semibold text-[var(--text-primary)] mb-4 text-center">
              How was your overall experience? <span className="text-[var(--error-text)]">*</span>
            </label>
            <EmojiRating
              value={overallRating}
              onChange={setOverallRating}
              size="lg"
            />
          </div>

          {/* Would Recommend */}
          <Card className="p-6">
            <label className="block text-[var(--text-sm)] font-medium text-[var(--text-primary)] mb-4 text-center">
              How likely are you to recommend SMS to a friend?
            </label>
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setWouldRecommend(num)}
                  className={`
                    w-8 h-8 rounded-[var(--radius-md)]
                    text-[var(--text-sm)] font-medium
                    transition-all duration-[var(--duration-normal)]
                    ${
                      wouldRecommend === num
                        ? 'bg-[var(--primary)] text-white scale-110'
                        : 'bg-[var(--bg-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)]'
                    }
                  `}
                >
                  {num}
                </button>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-[var(--text-xs)] text-[var(--text-muted)]">
              <span>Not likely</span>
              <span>Very likely</span>
            </div>
          </Card>

          {/* Host Rating */}
          {host && (
            <div>
              <label className="block text-[var(--text-base)] font-semibold text-[var(--text-primary)] mb-4 text-center">
                How was {host.name} as a host?
              </label>
              <EmojiRating
                value={hostRating}
                onChange={setHostRating}
                size="md"
              />
            </div>
          )}

          {/* Highlights */}
          <div>
            <label className="block text-[var(--text-sm)] font-medium text-[var(--text-primary)] mb-2">
              What were the highlights?
            </label>
            <Textarea
              value={highlights}
              onChange={(e) => setHighlights(e.target.value)}
              placeholder="Tell us about your favorite moments..."
              rows={3}
              maxLength={500}
              className="resize-none"
            />
            <div className="text-right mt-1">
              <span className="text-[var(--text-xs)] text-[var(--text-muted)]">
                {highlights.length} / 500
              </span>
            </div>
          </div>

          {/* Suggestions */}
          <div>
            <label className="block text-[var(--text-sm)] font-medium text-[var(--text-primary)] mb-2">
              Any suggestions for improvement?
            </label>
            <Textarea
              value={suggestions}
              onChange={(e) => setSuggestions(e.target.value)}
              placeholder="Help us make future experiences even better..."
              rows={3}
              maxLength={500}
              className="resize-none"
            />
            <div className="text-right mt-1">
              <span className="text-[var(--text-xs)] text-[var(--text-muted)]">
                {suggestions.length} / 500
              </span>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            variant="primary"
            size="lg"
            className="w-full"
            onClick={handleSubmit}
            disabled={!overallRating || submitting}
            loading={submitting}
          >
            {submitting ? 'Submitting...' : 'Submit Feedback'}
          </Button>

          {/* Privacy Note */}
          <p className="text-[var(--text-xs)] text-[var(--text-muted)] text-center">
            Your feedback is anonymous and helps us improve the SMS experience.
          </p>
        </div>
      </PageContainer>
    </div>
  );
}
