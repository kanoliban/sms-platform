'use client';

import { useState, useEffect } from 'react';
import type { User, UserIntent, TonePreference } from '@/lib/supabase/types';
import {
  Button,
  Card,
  Input,
  Textarea,
  Avatar,
  Badge,
  Progress,
} from '@/components/ui';
import { PageContainer, Header } from '@/components/layout';
import { StatsGrid } from '@/components/composed';
import { useToast } from '@/components/ui/toast';

// Check if Supabase is configured
const isSupabaseConfigured = () => {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
};

// Mock user for demo mode
const MOCK_USER: User = {
  id: 'demo-user',
  phone: '+16125551234',
  name: 'Alex Johnson',
  role: 'guest',
  intent: 'human_connection',
  tone_preference: 'deep',
  trust_score_overall: 78,
  trust_reliability: 85,
  trust_social: 72,
  trust_safety: 80,
  trust_tenure: 60,
  trust_status: 'active',
  rooms_attended: 12,
  rooms_hosted: 3,
  no_shows: 0,
  created_at: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
  updated_at: new Date().toISOString(),
};

const INTENT_OPTIONS: { value: UserIntent; label: string; description: string }[] = [
  { value: 'human_connection', label: 'Human Connection', description: 'Meaningful conversations and real friendships' },
  { value: 'professional', label: 'Professional', description: 'Professional connections and opportunities' },
  { value: 'curious', label: 'Curious', description: 'Exploring new experiences and meeting people' },
  { value: 'referred', label: 'Referred', description: 'Someone invited me to check it out' },
];

const TONE_OPTIONS: { value: TonePreference; label: string; description: string }[] = [
  { value: 'chill', label: 'Chill', description: 'Relaxed, low-pressure vibes' },
  { value: 'playful', label: 'Playful', description: 'Fun, games, and laughter' },
  { value: 'deep', label: 'Deep', description: 'Meaningful conversations' },
  { value: 'intense', label: 'Intense', description: 'High energy, challenging' },
];

export default function ProfilePage() {
  const { addToast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [demoMode, setDemoMode] = useState(false);

  // Editable fields
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [intent, setIntent] = useState<UserIntent | null>(null);
  const [tonePreference, setTonePreference] = useState<TonePreference | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    if (!isSupabaseConfigured()) {
      setDemoMode(true);
      setUser(MOCK_USER);
      setName(MOCK_USER.name || '');
      setIntent(MOCK_USER.intent);
      setTonePreference(MOCK_USER.tone_preference);
      setLoading(false);
      return;
    }

    const { createClient } = await import('@/lib/supabase/client');
    const supabase = createClient();

    const storedPhone = localStorage.getItem('sms_user_phone');
    if (storedPhone) {
      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('phone', storedPhone)
        .single();

      if (userData) {
        setUser(userData);
        setName(userData.name || '');
        setIntent(userData.intent);
        setTonePreference(userData.tone_preference);
      }
    }

    setLoading(false);
  }

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);

    if (demoMode) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setUser(prev => prev ? { ...prev, name, intent, tone_preference: tonePreference } : null);
      addToast({
        variant: 'success',
        title: 'Profile updated',
        description: 'Your changes have been saved.',
      });
      setSaving(false);
      return;
    }

    const { createClient } = await import('@/lib/supabase/client');
    const supabase = createClient();

    const { error } = await supabase
      .from('users')
      .update({
        name,
        intent,
        tone_preference: tonePreference,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (error) {
      addToast({
        variant: 'error',
        title: 'Error saving profile',
        description: 'Please try again.',
      });
    } else {
      setUser(prev => prev ? { ...prev, name, intent, tone_preference: tonePreference } : null);
      addToast({
        variant: 'success',
        title: 'Profile updated',
        description: 'Your changes have been saved.',
      });
    }

    setSaving(false);
  };

  const formatPhone = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 11 && cleaned.startsWith('1')) {
      return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
    }
    return phone;
  };

  const getMemberSince = () => {
    if (!user) return '';
    const date = new Date(user.created_at);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const getTrustColor = (score: number) => {
    if (score >= 80) return 'var(--success-text)';
    if (score >= 60) return 'var(--warning-text)';
    return 'var(--error-text)';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-base)] flex items-center justify-center">
        <div className="text-[var(--text-secondary)]">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[var(--bg-base)]">
        <Header />
        <PageContainer size="md" className="py-12 text-center">
          <Card className="p-8">
            <h1 className="text-[var(--text-xl)] font-semibold text-[var(--text-primary)] mb-4">
              Sign in to view your profile
            </h1>
            <p className="text-[var(--text-secondary)] mb-6">
              Join SMS to start meeting strangers and attending rooms.
            </p>
            <Button variant="primary" onClick={() => window.location.href = '/'}>
              Get Started
            </Button>
          </Card>
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

      <PageContainer size="md" className="py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-[var(--text-2xl)] font-bold text-[var(--text-primary)]">
            Profile
          </h1>
          <p className="text-[var(--text-sm)] text-[var(--text-secondary)] mt-1">
            Manage your personal information and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Profile Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Avatar & Basic Info */}
            <Card className="p-6">
              <div className="flex items-start gap-6 mb-6">
                <div className="relative">
                  <Avatar
                    name={user.name || 'User'}
                    size="lg"
                    className="w-24 h-24"
                  />
                  <button
                    type="button"
                    className="absolute bottom-0 right-0 w-8 h-8 bg-[var(--primary)] rounded-full flex items-center justify-center text-white shadow-lg hover:bg-[var(--primary-hover)] transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                    </svg>
                  </button>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-[var(--text-xl)] font-semibold text-[var(--text-primary)]">
                      {user.name || 'Anonymous'}
                    </h2>
                    {user.role === 'host' && (
                      <Badge variant="primary" size="sm">Host</Badge>
                    )}
                  </div>
                  <p className="text-[var(--text-sm)] text-[var(--text-secondary)]">
                    {formatPhone(user.phone)}
                  </p>
                  <p className="text-[var(--text-xs)] text-[var(--text-muted)] mt-1">
                    Member since {getMemberSince()}
                  </p>
                </div>
              </div>

              {/* Editable Fields */}
              <div className="space-y-5 pt-6 border-t border-[var(--border-subtle)]">
                <div>
                  <label className="block text-[var(--text-sm)] font-medium text-[var(--text-primary)] mb-2">
                    Display Name
                  </label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="What should we call you?"
                  />
                </div>

                <div>
                  <label className="block text-[var(--text-sm)] font-medium text-[var(--text-primary)] mb-2">
                    Bio
                  </label>
                  <Textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell others a bit about yourself..."
                    rows={3}
                  />
                  <p className="text-[var(--text-xs)] text-[var(--text-muted)] mt-1">
                    Visible to hosts and other guests
                  </p>
                </div>
              </div>
            </Card>

            {/* Preferences */}
            <Card className="p-6">
              <h3 className="text-[var(--text-lg)] font-semibold text-[var(--text-primary)] mb-6">
                Preferences
              </h3>

              {/* Intent */}
              <div className="mb-6">
                <label className="block text-[var(--text-sm)] font-medium text-[var(--text-primary)] mb-3">
                  What brings you to SMS?
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {INTENT_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setIntent(option.value)}
                      className={`
                        p-4 rounded-[var(--radius-lg)] border text-left
                        transition-all duration-[var(--duration-normal)]
                        ${intent === option.value
                          ? 'bg-[var(--primary-muted)] border-[var(--primary)]'
                          : 'bg-[var(--bg-subtle)] border-[var(--border-default)] hover:border-[var(--border-strong)]'
                        }
                      `}
                    >
                      <p className={`text-[var(--text-sm)] font-medium ${intent === option.value ? 'text-[var(--primary-light)]' : 'text-[var(--text-primary)]'}`}>
                        {option.label}
                      </p>
                      <p className="text-[var(--text-xs)] text-[var(--text-muted)] mt-1">
                        {option.description}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Tone Preference */}
              <div>
                <label className="block text-[var(--text-sm)] font-medium text-[var(--text-primary)] mb-3">
                  Preferred vibe
                </label>
                <div className="flex flex-wrap gap-3">
                  {TONE_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setTonePreference(option.value)}
                      className={`
                        px-4 py-2 rounded-full border text-[var(--text-sm)] font-medium
                        transition-all duration-[var(--duration-normal)]
                        ${tonePreference === option.value
                          ? 'bg-[var(--primary)] border-[var(--primary)] text-white'
                          : 'bg-[var(--bg-subtle)] border-[var(--border-default)] text-[var(--text-secondary)] hover:border-[var(--border-strong)]'
                        }
                      `}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end">
              <Button
                variant="primary"
                onClick={handleSave}
                loading={saving}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Trust Score */}
            <Card className="p-5">
              <h3 className="text-[var(--text-sm)] font-semibold text-[var(--text-primary)] mb-4">
                Trust Score
              </h3>
              <div className="text-center mb-6">
                <span
                  className="text-[var(--text-4xl)] font-bold"
                  style={{ color: getTrustColor(user.trust_score_overall || 0) }}
                >
                  {user.trust_score_overall || 0}
                </span>
                <span className="text-[var(--text-lg)] text-[var(--text-muted)]">/100</span>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-[var(--text-xs)] mb-1">
                    <span className="text-[var(--text-secondary)]">Reliability</span>
                    <span className="text-[var(--text-primary)]">{user.trust_reliability || 0}</span>
                  </div>
                  <Progress value={user.trust_reliability || 0} max={100} size="sm" />
                </div>
                <div>
                  <div className="flex justify-between text-[var(--text-xs)] mb-1">
                    <span className="text-[var(--text-secondary)]">Social</span>
                    <span className="text-[var(--text-primary)]">{user.trust_social || 0}</span>
                  </div>
                  <Progress value={user.trust_social || 0} max={100} size="sm" />
                </div>
                <div>
                  <div className="flex justify-between text-[var(--text-xs)] mb-1">
                    <span className="text-[var(--text-secondary)]">Safety</span>
                    <span className="text-[var(--text-primary)]">{user.trust_safety || 0}</span>
                  </div>
                  <Progress value={user.trust_safety || 0} max={100} size="sm" />
                </div>
                <div>
                  <div className="flex justify-between text-[var(--text-xs)] mb-1">
                    <span className="text-[var(--text-secondary)]">Tenure</span>
                    <span className="text-[var(--text-primary)]">{user.trust_tenure || 0}</span>
                  </div>
                  <Progress value={user.trust_tenure || 0} max={100} size="sm" />
                </div>
              </div>
            </Card>

            {/* Activity Stats */}
            <Card className="p-5">
              <h3 className="text-[var(--text-sm)] font-semibold text-[var(--text-primary)] mb-4">
                Activity
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[var(--text-sm)] text-[var(--text-secondary)]">Rooms Attended</span>
                  <span className="text-[var(--text-sm)] font-medium text-[var(--text-primary)]">
                    {user.rooms_attended || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--text-sm)] text-[var(--text-secondary)]">Rooms Hosted</span>
                  <span className="text-[var(--text-sm)] font-medium text-[var(--text-primary)]">
                    {user.rooms_hosted || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--text-sm)] text-[var(--text-secondary)]">No-Shows</span>
                  <span className={`text-[var(--text-sm)] font-medium ${(user.no_shows || 0) === 0 ? 'text-[var(--success-text)]' : 'text-[var(--error-text)]'}`}>
                    {user.no_shows || 0}
                  </span>
                </div>
              </div>
            </Card>

            {/* Quick Links */}
            <Card className="p-5">
              <h3 className="text-[var(--text-sm)] font-semibold text-[var(--text-primary)] mb-4">
                Quick Links
              </h3>
              <div className="space-y-2">
                <a
                  href="/my-rooms"
                  className="flex items-center gap-3 p-3 rounded-[var(--radius-lg)] bg-[var(--bg-subtle)] hover:bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-[var(--border-default)] transition-all"
                >
                  <svg className="w-5 h-5 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                  </svg>
                  <span className="text-[var(--text-sm)] text-[var(--text-primary)]">My Rooms</span>
                </a>
                <a
                  href="/settings"
                  className="flex items-center gap-3 p-3 rounded-[var(--radius-lg)] bg-[var(--bg-subtle)] hover:bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-[var(--border-default)] transition-all"
                >
                  <svg className="w-5 h-5 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-[var(--text-sm)] text-[var(--text-primary)]">Settings</span>
                </a>
              </div>
            </Card>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
