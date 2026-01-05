'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Button,
  Input,
  Textarea,
  Toggle,
  Card,
  Badge,
} from '@/components/ui';
import { TwoColumn, PageContainer } from '@/components/layout';
import { HostGuard, useHostUser } from '@/components/auth';

type SpaceTone = 'chill' | 'playful' | 'deep' | 'intense';

const toneConfig: Record<SpaceTone, { label: string; description: string; gradient: string; color: string }> = {
  chill: {
    label: 'Chill',
    description: 'Relaxed, easy conversation',
    gradient: 'from-blue-500/20 to-blue-600/20',
    color: 'text-blue-400',
  },
  playful: {
    label: 'Playful',
    description: 'Fun, light-hearted energy',
    gradient: 'from-pink-500/20 to-pink-600/20',
    color: 'text-pink-400',
  },
  deep: {
    label: 'Deep',
    description: 'Meaningful, vulnerable sharing',
    gradient: 'from-purple-500/20 to-purple-600/20',
    color: 'text-purple-400',
  },
  intense: {
    label: 'Intense',
    description: 'Challenging, high-energy dialogue',
    gradient: 'from-red-500/20 to-red-600/20',
    color: 'text-red-400',
  },
};

const durationOptions = [
  { value: 60, label: '1 hour' },
  { value: 90, label: '1.5 hours' },
  { value: 120, label: '2 hours' },
  { value: 150, label: '2.5 hours' },
  { value: 180, label: '3 hours' },
];

function CreateRoomContent() {
  const router = useRouter();
  const host = useHostUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [form, setForm] = useState({
    name: '',
    description: '',
    tone: 'chill' as SpaceTone,
    date: '',
    time: '19:00',
    duration_minutes: 120,
    location_address: '',
    location_hint: '',
    capacity: 8,
    price: 25,
    require_approval: true,
    waitlist_enabled: true,
  });

  // Progressive disclosure state
  const [showDescription, setShowDescription] = useState(false);
  const [showLocationHint, setShowLocationHint] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/spaces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          host_id: host.id,
          price_cents: form.price * 100,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create room');
      }

      router.push(`/host/spaces/${data.space.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const updateForm = <K extends keyof typeof form>(key: K, value: typeof form[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  // Preview panel (left column)
  const PreviewPanel = (
    <div className="sticky top-6">
      {/* Space Preview Card */}
      <Card variant="elevated" className="overflow-hidden">
        {/* Tone Gradient Header */}
        <div className={`h-32 bg-gradient-to-br ${toneConfig[form.tone].gradient} relative`}>
          <div className="absolute inset-0 flex items-center justify-center">
            <Badge variant={form.tone === 'chill' ? 'info' : form.tone === 'playful' ? 'primary' : form.tone === 'deep' ? 'default' : 'error'} size="lg">
              {toneConfig[form.tone].label}
            </Badge>
          </div>
        </div>

        <div className="p-5">
          <h3 className="text-[var(--text-lg)] font-semibold text-[var(--text-primary)] mb-2">
            {form.name || 'Space Name'}
          </h3>

          {(form.description || showDescription) && (
            <p className="text-[var(--text-sm)] text-[var(--text-secondary)] mb-4 line-clamp-2">
              {form.description || 'Space description will appear here...'}
            </p>
          )}

          <div className="space-y-2 text-[var(--text-sm)] text-[var(--text-muted)]">
            {form.date && (
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                </svg>
                <span>{new Date(form.date + 'T' + form.time).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} at {form.time}</span>
              </div>
            )}

            {form.location_hint && (
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
                <span>{form.location_hint}</span>
              </div>
            )}

            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
              <span>{form.capacity} guests max</span>
            </div>

            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{form.price > 0 ? `$${form.price}` : 'Free'}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Guidelines Card */}
      <Card variant="outlined" className="mt-4 p-4">
        <h4 className="text-[var(--text-sm)] font-medium text-[var(--text-primary)] mb-3">Remember</h4>
        <ul className="text-[var(--text-xs)] text-[var(--text-muted)] space-y-2">
          <li className="flex gap-2">
            <span className="text-[var(--primary)]">•</span>
            You're not hosting an event. You're creating a container.
          </li>
          <li className="flex gap-2">
            <span className="text-[var(--primary)]">•</span>
            Your calm sets the space's calm.
          </li>
          <li className="flex gap-2">
            <span className="text-[var(--primary)]">•</span>
            Three rules: confidentiality, presence, non-transactional.
          </li>
        </ul>
      </Card>
    </div>
  );

  // Form panel (right column)
  const FormPanel = (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Space Name - Large, prominent input */}
      <div>
        <Input
          value={form.name}
          onChange={(e) => updateForm('name', e.target.value)}
          placeholder="Space Name"
          required
          className="!text-2xl !font-semibold !py-4 !bg-transparent !border-0 !border-b !border-[var(--border-subtle)] !rounded-none focus:!border-[var(--primary)] placeholder:text-[var(--text-muted)]"
        />
      </div>

      {/* Description - Progressive disclosure */}
      {showDescription ? (
        <div>
          <label className="block text-[var(--text-sm)] font-medium text-[var(--text-primary)] mb-2">
            Description
          </label>
          <Textarea
            value={form.description}
            onChange={(e) => updateForm('description', e.target.value)}
            placeholder="What will this space be about? What should guests expect?"
            rows={3}
          />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowDescription(true)}
          className="flex items-center gap-2 text-[var(--text-sm)] text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add Description
        </button>
      )}

      {/* Tone Selector */}
      <div>
        <label className="block text-[var(--text-sm)] font-medium text-[var(--text-primary)] mb-2">
          Space Tone
        </label>
        <p className="text-[var(--text-xs)] text-[var(--text-muted)] mb-3">
          This helps match guests with the right energy for your space.
        </p>
        <div className="grid grid-cols-2 gap-3">
          {(Object.keys(toneConfig) as SpaceTone[]).map((tone) => (
            <button
              key={tone}
              type="button"
              onClick={() => updateForm('tone', tone)}
              className={`
                p-4 rounded-[var(--radius-lg)] text-left transition-all duration-[var(--duration-normal)]
                border
                ${form.tone === tone
                  ? `border-[var(--primary)] bg-[var(--primary-muted)] ${toneConfig[tone].color}`
                  : 'border-[var(--border-subtle)] hover:border-[var(--border-default)] bg-[var(--bg-surface)]'
                }
              `}
            >
              <div className={`font-medium mb-1 ${form.tone === tone ? toneConfig[tone].color : 'text-[var(--text-primary)]'}`}>
                {toneConfig[tone].label}
              </div>
              <div className="text-[var(--text-xs)] text-[var(--text-muted)]">
                {toneConfig[tone].description}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Date & Time */}
      <div>
        <label className="block text-[var(--text-sm)] font-medium text-[var(--text-primary)] mb-3">
          When
        </label>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[var(--text-xs)] text-[var(--text-muted)] mb-1.5">Date</label>
            <Input
              type="date"
              value={form.date}
              onChange={(e) => updateForm('date', e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-[var(--text-xs)] text-[var(--text-muted)] mb-1.5">Start Time</label>
            <Input
              type="time"
              value={form.time}
              onChange={(e) => updateForm('time', e.target.value)}
              required
            />
          </div>
        </div>
      </div>

      {/* Duration */}
      <div>
        <label className="block text-[var(--text-xs)] text-[var(--text-muted)] mb-1.5">Duration</label>
        <div className="flex gap-2 flex-wrap">
          {durationOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => updateForm('duration_minutes', option.value)}
              className={`
                px-4 py-2 rounded-full text-[var(--text-sm)] font-medium transition-all
                ${form.duration_minutes === option.value
                  ? 'bg-[var(--primary)] text-white'
                  : 'bg-[var(--bg-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)]'
                }
              `}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Location */}
      <div>
        <label className="block text-[var(--text-sm)] font-medium text-[var(--text-primary)] mb-2">
          Location
        </label>
        <p className="text-[var(--text-xs)] text-[var(--text-muted)] mb-3">
          Full address is revealed to guests 24 hours before the space.
        </p>
        <Input
          value={form.location_address}
          onChange={(e) => updateForm('location_address', e.target.value)}
          placeholder="Full address (e.g., 123 Main St, Minneapolis, MN)"
          required
        />

        {showLocationHint ? (
          <div className="mt-3">
            <label className="block text-[var(--text-xs)] text-[var(--text-muted)] mb-1.5">Location Hint</label>
            <Input
              value={form.location_hint}
              onChange={(e) => updateForm('location_hint', e.target.value)}
              placeholder="e.g., Northeast Minneapolis"
            />
            <p className="text-[var(--text-xs)] text-[var(--text-muted)] mt-1">
              Shown to guests before the full address is revealed.
            </p>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowLocationHint(true)}
            className="mt-2 flex items-center gap-2 text-[var(--text-sm)] text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add Location Hint
          </button>
        )}
      </div>

      {/* Capacity & Price */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-[var(--text-sm)] font-medium text-[var(--text-primary)] mb-2">
            Capacity
          </label>
          <Input
            type="number"
            value={form.capacity}
            onChange={(e) => updateForm('capacity', parseInt(e.target.value) || 0)}
            min={2}
            max={50}
            required
          />
        </div>
        <div>
          <label className="block text-[var(--text-sm)] font-medium text-[var(--text-primary)] mb-2">
            Price
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">$</span>
            <Input
              type="number"
              value={form.price}
              onChange={(e) => updateForm('price', parseInt(e.target.value) || 0)}
              min={0}
              max={500}
              className="!pl-8"
              required
            />
          </div>
        </div>
      </div>

      {/* Options */}
      <Card variant="outlined" className="p-4 space-y-4">
        <h4 className="text-[var(--text-sm)] font-medium text-[var(--text-primary)]">Options</h4>

        <div className="flex items-center justify-between">
          <div>
            <div className="text-[var(--text-sm)] text-[var(--text-primary)]">Require Approval</div>
            <div className="text-[var(--text-xs)] text-[var(--text-muted)]">Review guests before they can join</div>
          </div>
          <Toggle
            checked={form.require_approval}
            onChange={(e) => updateForm('require_approval', e.target.checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <div className="text-[var(--text-sm)] text-[var(--text-primary)]">Enable Waitlist</div>
            <div className="text-[var(--text-xs)] text-[var(--text-muted)]">Allow guests to join waitlist when full</div>
          </div>
          <Toggle
            checked={form.waitlist_enabled}
            onChange={(e) => updateForm('waitlist_enabled', e.target.checked)}
          />
        </div>
      </Card>

      {/* Error */}
      {error && (
        <div className="p-4 bg-[var(--error-muted)] border border-[var(--error-border)] rounded-[var(--radius-md)] text-[var(--error-text)] text-[var(--text-sm)]">
          {error}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={loading}
          className="flex-1"
        >
          Create Space
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="lg"
          onClick={() => router.push('/host')}
        >
          Cancel
        </Button>
      </div>
    </form>
  );

  return (
    <div className="min-h-screen bg-[var(--bg-base)]">
      {/* Header */}
      <header className="border-b border-[var(--border-subtle)] sticky top-0 bg-[var(--bg-base)]/95 backdrop-blur z-10">
        <PageContainer>
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-xl tracking-tight text-[var(--text-primary)]">
                <strong><em>SMS</em></strong>
              </Link>
              <span className="text-[var(--text-muted)]">/</span>
              <span className="text-[var(--text-secondary)]">Create Space</span>
            </div>
            <Link
              href="/host"
              className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors text-[var(--text-sm)]"
            >
              ← Back to Host
            </Link>
          </div>
        </PageContainer>
      </header>

      {/* Main Content */}
      <PageContainer className="py-8">
        <div className="mb-8">
          <h1 className="text-[var(--text-3xl)] font-semibold text-[var(--text-primary)]">Create a Space</h1>
          <p className="text-[var(--text-secondary)] mt-2">
            A space is a bounded space in time where strangers meet with intention.
          </p>
        </div>

        <TwoColumn
          left={PreviewPanel}
          right={FormPanel}
          ratio="40/60"
          gap="lg"
          reverseOnMobile
        />
      </PageContainer>
    </div>
  );
}

export default function CreateRoomPage() {
  return (
    <HostGuard>
      <CreateRoomContent />
    </HostGuard>
  );
}
