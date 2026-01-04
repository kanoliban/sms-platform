'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import type { User, UserIntent, TonePreference } from '@/lib/supabase/types';
import {
  Button,
  Card,
  Input,
  Textarea,
  Avatar,
  Badge,
  Progress,
  Toggle,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/ui';
import { PageContainer } from '@/components/layout';
import { UserMenu, LoginModal, NotificationsDropdown } from '@/components/composed';
import { useToast } from '@/components/ui/toast';
import { useAuth } from '@/lib/auth/auth-context';
import { useNotifications } from '@/hooks/use-notifications';
import { createClient } from '@/lib/supabase/client';

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

interface Settings {
  notifications: {
    spaceReminders: boolean;
    inviteAlerts: boolean;
    hostUpdates: boolean;
    marketingEmails: boolean;
  };
  privacy: {
    showProfile: boolean;
    allowHostContact: boolean;
    shareAttendance: boolean;
  };
}

const DEFAULT_SETTINGS: Settings = {
  notifications: {
    spaceReminders: true,
    inviteAlerts: true,
    hostUpdates: true,
    marketingEmails: false,
  },
  privacy: {
    showProfile: true,
    allowHostContact: true,
    shareAttendance: false,
  },
};

export default function ProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToast } = useToast();
  const { user: authUser, loading: authLoading } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Get initial tab from URL query param (?tab=settings)
  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(tabParam === 'settings' ? 'settings' : 'profile');

  // Sync tab state when URL param changes
  useEffect(() => {
    if (tabParam === 'settings') {
      setActiveTab('settings');
    }
  }, [tabParam]);

  // Notifications from hook
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications({ userId: authUser?.id });

  const handleNotificationClick = useCallback((notification: { id: string; space?: { id: string } }) => {
    markAsRead(notification.id);
    if (notification.space?.id) {
      router.push(`/spaces/${notification.space.id}`);
    }
  }, [markAsRead, router]);

  // Profile fields
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [intent, setIntent] = useState<UserIntent | null>(null);
  const [tonePreference, setTonePreference] = useState<TonePreference | null>(null);

  // Settings state
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);

  // Trust Score tooltip
  const [showTrustTooltip, setShowTrustTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState<'below' | 'above'>('below');
  const tooltipButtonRef = useRef<HTMLButtonElement>(null);

  // Calculate tooltip position based on available viewport space
  const updateTooltipPosition = useCallback(() => {
    if (!tooltipButtonRef.current) return;

    const rect = tooltipButtonRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const tooltipHeight = 120; // Approximate tooltip height

    // Prefer below, but use above if not enough space below
    if (spaceBelow < tooltipHeight && spaceAbove > tooltipHeight) {
      setTooltipPosition('above');
    } else {
      setTooltipPosition('below');
    }
  }, []);

  useEffect(() => {
    if (!authLoading) {
      loadProfile();
    }
  }, [authUser, authLoading]);

  async function loadProfile() {
    // No authenticated user
    if (!authUser) {
      setLoading(false);
      return;
    }

    // Load user profile and preferences
    const supabase = createClient();

    const { data: userData, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .single();

    if (userData) {
      setUser(userData);
      setName(userData.name || '');
      setIntent(userData.intent);
      setTonePreference(userData.tone_preference);

      // Load settings from preferences column
      if (userData.preferences) {
        setSettings({
          notifications: {
            ...DEFAULT_SETTINGS.notifications,
            ...(userData.preferences as Settings).notifications,
          },
          privacy: {
            ...DEFAULT_SETTINGS.privacy,
            ...(userData.preferences as Settings).privacy,
          },
        });
      }
    }

    if (error && error.code !== 'PGRST116' && error.code !== '42703') {
      console.error('Error loading profile:', error.message || error.code || 'Unknown error');
    }

    setLoading(false);
  }

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);

    const supabase = createClient();

    const { error } = await supabase
      .from('users')
      .update({
        name,
        intent,
        tone_preference: tonePreference,
        preferences: settings,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (error) {
      console.error('Error saving profile:', error.message || error.code || 'Unknown error');
      addToast({
        variant: 'error',
        title: 'Error saving',
        description: 'Please try again.',
      });
    } else {
      setUser(prev => prev ? { ...prev, name, intent, tone_preference: tonePreference } : null);
      addToast({
        variant: 'success',
        title: 'Changes saved',
        description: 'Your profile and settings have been updated.',
      });
    }

    setSaving(false);
  };

  const updateNotification = (key: keyof Settings['notifications'], value: boolean) => {
    setSettings(prev => ({
      ...prev,
      notifications: { ...prev.notifications, [key]: value },
    }));
  };

  const updatePrivacy = (key: keyof Settings['privacy'], value: boolean) => {
    setSettings(prev => ({
      ...prev,
      privacy: { ...prev.privacy, [key]: value },
    }));
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

  // Not authenticated - show sign in prompt
  if (!user) {
    return (
      <div className="min-h-screen bg-[var(--bg-base)]">
        {/* Header */}
        <header className="sticky top-0 z-[var(--z-header)] bg-[var(--bg-base)]/80 backdrop-blur-md border-b border-[var(--border-subtle)]">
          <PageContainer>
            <div className="flex justify-between items-center h-16">
              <Link href="/" className="font-bold text-xl tracking-tight text-[var(--text-primary)] hover:opacity-80 transition-opacity">
                SMS
              </Link>
              <div className="flex items-center gap-4">
                <Link href="/discover" className="text-[var(--text-sm)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                  Discover
                </Link>
                <Button variant="primary" size="sm" onClick={() => setShowLoginModal(true)}>
                  Sign In
                </Button>
              </div>
            </div>
          </PageContainer>
        </header>

        <PageContainer size="md" className="py-12 text-center">
          <Card className="p-8">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[var(--bg-subtle)] flex items-center justify-center">
              <svg className="w-8 h-8 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            </div>
            <h1 className="text-[var(--text-xl)] font-semibold text-[var(--text-primary)] mb-4">
              Sign in to view your profile
            </h1>
            <p className="text-[var(--text-secondary)] mb-6">
              Join SMS to start meeting strangers and attending spaces.
            </p>
            <Button variant="primary" onClick={() => setShowLoginModal(true)}>
              Sign In
            </Button>
          </Card>
        </PageContainer>

        <LoginModal
          open={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          onSuccess={() => {
            setShowLoginModal(false);
            window.location.reload();
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-base)]">
      {/* Header with UserMenu */}
      <header className="sticky top-0 z-[var(--z-header)] bg-[var(--bg-base)]/80 backdrop-blur-md border-b border-[var(--border-subtle)]">
        <PageContainer>
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="font-bold text-xl tracking-tight text-[var(--text-primary)] hover:opacity-80 transition-opacity">
              SMS
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/discover" className="text-[var(--text-sm)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                Discover
              </Link>
              <Link href="/my-spaces" className="text-[var(--text-sm)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                My Spaces
              </Link>
              <Link href="/profile" className="text-[var(--text-sm)] text-[var(--text-primary)] font-medium">
                Profile
              </Link>
            </nav>
            <div className="flex items-center gap-3">
              <NotificationsDropdown
                notifications={notifications}
                unreadCount={unreadCount}
                onMarkAllRead={markAllAsRead}
                onMarkRead={markAsRead}
                onNotificationClick={handleNotificationClick}
              />
              <UserMenu />
            </div>
          </div>
        </PageContainer>
      </header>

      <PageContainer size="md" className="py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-[var(--text-2xl)] font-bold text-[var(--text-primary)]">
            Profile
          </h1>
          <p className="text-[var(--text-sm)] text-[var(--text-secondary)] mt-1">
            Manage your profile and settings
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content with Tabs */}
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-6">
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              {/* Profile Tab */}
              <TabsContent value="profile">
                <div className="space-y-6">
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
                </div>
              </TabsContent>

              {/* Settings Tab */}
              <TabsContent value="settings">
                <div className="space-y-6">
                  {/* Notifications */}
                  <Card className="p-6">
                    <h3 className="text-[var(--text-lg)] font-semibold text-[var(--text-primary)] mb-6">
                      Notifications
                    </h3>

                    <div className="space-y-6">
                      <div className="flex items-start justify-between gap-4 pb-6 border-b border-[var(--border-subtle)]">
                        <div>
                          <h4 className="text-[var(--text-sm)] font-medium text-[var(--text-primary)]">
                            Space Reminders
                          </h4>
                          <p className="text-[var(--text-sm)] text-[var(--text-muted)] mt-1">
                            Get SMS reminders before spaces you're attending
                          </p>
                        </div>
                        <Toggle
                          checked={settings.notifications.spaceReminders}
                          onChange={(e) => updateNotification('spaceReminders', e.target.checked)}
                        />
                      </div>

                      <div className="flex items-start justify-between gap-4 pb-6 border-b border-[var(--border-subtle)]">
                        <div>
                          <h4 className="text-[var(--text-sm)] font-medium text-[var(--text-primary)]">
                            Invite Alerts
                          </h4>
                          <p className="text-[var(--text-sm)] text-[var(--text-muted)] mt-1">
                            Get notified when you receive a space invitation
                          </p>
                        </div>
                        <Toggle
                          checked={settings.notifications.inviteAlerts}
                          onChange={(e) => updateNotification('inviteAlerts', e.target.checked)}
                        />
                      </div>

                      <div className="flex items-start justify-between gap-4 pb-6 border-b border-[var(--border-subtle)]">
                        <div>
                          <h4 className="text-[var(--text-sm)] font-medium text-[var(--text-primary)]">
                            Host Updates
                          </h4>
                          <p className="text-[var(--text-sm)] text-[var(--text-muted)] mt-1">
                            Receive blasts and updates from space hosts
                          </p>
                        </div>
                        <Toggle
                          checked={settings.notifications.hostUpdates}
                          onChange={(e) => updateNotification('hostUpdates', e.target.checked)}
                        />
                      </div>

                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h4 className="text-[var(--text-sm)] font-medium text-[var(--text-primary)]">
                            Marketing Messages
                          </h4>
                          <p className="text-[var(--text-sm)] text-[var(--text-muted)] mt-1">
                            Occasional updates about new features and spaces near you
                          </p>
                        </div>
                        <Toggle
                          checked={settings.notifications.marketingEmails}
                          onChange={(e) => updateNotification('marketingEmails', e.target.checked)}
                        />
                      </div>
                    </div>
                  </Card>

                  {/* Privacy */}
                  <Card className="p-6">
                    <h3 className="text-[var(--text-lg)] font-semibold text-[var(--text-primary)] mb-6">
                      Privacy
                    </h3>

                    <div className="space-y-6">
                      <div className="flex items-start justify-between gap-4 pb-6 border-b border-[var(--border-subtle)]">
                        <div>
                          <h4 className="text-[var(--text-sm)] font-medium text-[var(--text-primary)]">
                            Show Profile to Others
                          </h4>
                          <p className="text-[var(--text-sm)] text-[var(--text-muted)] mt-1">
                            Allow hosts and guests to see your profile information
                          </p>
                        </div>
                        <Toggle
                          checked={settings.privacy.showProfile}
                          onChange={(e) => updatePrivacy('showProfile', e.target.checked)}
                        />
                      </div>

                      <div className="flex items-start justify-between gap-4 pb-6 border-b border-[var(--border-subtle)]">
                        <div>
                          <h4 className="text-[var(--text-sm)] font-medium text-[var(--text-primary)]">
                            Allow Host Contact
                          </h4>
                          <p className="text-[var(--text-sm)] text-[var(--text-muted)] mt-1">
                            Let hosts reach out about upcoming spaces you might like
                          </p>
                        </div>
                        <Toggle
                          checked={settings.privacy.allowHostContact}
                          onChange={(e) => updatePrivacy('allowHostContact', e.target.checked)}
                        />
                      </div>

                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h4 className="text-[var(--text-sm)] font-medium text-[var(--text-primary)]">
                            Share Attendance History
                          </h4>
                          <p className="text-[var(--text-sm)] text-[var(--text-muted)] mt-1">
                            Allow others to see which spaces you've attended
                          </p>
                        </div>
                        <Toggle
                          checked={settings.privacy.shareAttendance}
                          onChange={(e) => updatePrivacy('shareAttendance', e.target.checked)}
                        />
                      </div>
                    </div>
                  </Card>

                  {/* Danger Zone */}
                  <Card className="p-6 border-[var(--error-border)]">
                    <h3 className="text-[var(--text-lg)] font-semibold text-[var(--error-text)] mb-4">
                      Danger Zone
                    </h3>
                    <p className="text-[var(--text-sm)] text-[var(--text-secondary)] mb-6">
                      These actions are permanent and cannot be undone.
                    </p>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 rounded-[var(--radius-lg)] border border-[var(--border-default)]">
                        <div>
                          <p className="text-[var(--text-sm)] font-medium text-[var(--text-primary)]">
                            Export My Data
                          </p>
                          <p className="text-[var(--text-xs)] text-[var(--text-muted)]">
                            Download all your data in a portable format
                          </p>
                        </div>
                        <Button variant="secondary" size="sm">
                          Export
                        </Button>
                      </div>

                      <div className="flex items-center justify-between p-4 rounded-[var(--radius-lg)] border border-[var(--error-border)]">
                        <div>
                          <p className="text-[var(--text-sm)] font-medium text-[var(--error-text)]">
                            Delete Account
                          </p>
                          <p className="text-[var(--text-xs)] text-[var(--text-muted)]">
                            Permanently delete your account and all data
                          </p>
                        </div>
                        <Button variant="destructive" size="sm">
                          Delete
                        </Button>
                      </div>
                    </div>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>

            {/* Save Button */}
            <div className="mt-8 flex justify-end">
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
              <div className="flex items-center gap-2 mb-4">
                <h3 className="text-[var(--text-sm)] font-semibold text-[var(--text-primary)]">
                  Trust Score
                </h3>
                <div className="relative">
                  <button
                    ref={tooltipButtonRef}
                    type="button"
                    onClick={() => {
                      updateTooltipPosition();
                      setShowTrustTooltip(!showTrustTooltip);
                    }}
                    onMouseEnter={() => {
                      updateTooltipPosition();
                      setShowTrustTooltip(true);
                    }}
                    onMouseLeave={() => setShowTrustTooltip(false)}
                    className="w-4 h-4 rounded-full border border-[var(--text-muted)] text-[var(--text-muted)] flex items-center justify-center text-[10px] font-medium hover:border-[var(--text-secondary)] hover:text-[var(--text-secondary)] transition-colors"
                    aria-label="What is Trust Score?"
                  >
                    ?
                  </button>
                  {showTrustTooltip && (
                    <div
                      className={`
                        absolute z-50 w-64 sm:w-72 p-3
                        bg-[var(--bg-elevated)] border border-[var(--border-default)]
                        rounded-[var(--radius-lg)] shadow-[var(--shadow-xl)]
                        ${tooltipPosition === 'below'
                          ? 'top-full mt-2 right-0 sm:left-1/2 sm:-translate-x-1/2 sm:right-auto'
                          : 'bottom-full mb-2 right-0 sm:left-1/2 sm:-translate-x-1/2 sm:right-auto'
                        }
                      `}
                    >
                      {/* Arrow - position changes based on tooltip position */}
                      <div
                        className={`
                          absolute w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent
                          right-2 sm:left-1/2 sm:-translate-x-1/2 sm:right-auto
                          ${tooltipPosition === 'below'
                            ? 'bottom-full border-b-[6px] border-b-[var(--border-default)]'
                            : 'top-full border-t-[6px] border-t-[var(--border-default)]'
                          }
                        `}
                      />
                      <p className="text-[var(--text-xs)] text-[var(--text-secondary)] leading-relaxed">
                        <strong className="text-[var(--text-primary)] block mb-1">Why Trust Score?</strong>
                        Meeting strangers requires genuine trust. This score reflects your track record in our community—showing up when you say you will, contributing positively, and helping create safe spaces for everyone. It's not about points; it's about building real connections.
                      </p>
                    </div>
                  )}
                </div>
              </div>
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
                    {user.spaces_attended || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--text-sm)] text-[var(--text-secondary)]">Rooms Hosted</span>
                  <span className="text-[var(--text-sm)] font-medium text-[var(--text-primary)]">
                    {user.spaces_hosted || 0}
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
                  href="/my-spaces"
                  className="flex items-center gap-3 p-3 rounded-[var(--radius-lg)] bg-[var(--bg-subtle)] hover:bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-[var(--border-default)] transition-all"
                >
                  <svg className="w-5 h-5 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                  </svg>
                  <span className="text-[var(--text-sm)] text-[var(--text-primary)]">My Spaces</span>
                </a>
                <a
                  href="/discover"
                  className="flex items-center gap-3 p-3 rounded-[var(--radius-lg)] bg-[var(--bg-subtle)] hover:bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-[var(--border-default)] transition-all"
                >
                  <svg className="w-5 h-5 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                  </svg>
                  <span className="text-[var(--text-sm)] text-[var(--text-primary)]">Discover Spaces</span>
                </a>
              </div>
            </Card>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
