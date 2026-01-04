'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Button,
  Card,
  Toggle,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/ui';
import { PageContainer, Header } from '@/components/layout';
import { useToast } from '@/components/ui/toast';
import { useAuth } from '@/lib/auth/auth-context';
import { createClient } from '@/lib/supabase/client';

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

export default function SettingsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('notifications');

  // Settings state
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);

  useEffect(() => {
    if (!authLoading) {
      loadSettings();
    }
  }, [user, authLoading]);

  async function loadSettings() {
    if (!user) {
      setLoading(false);
      return;
    }

    const supabase = createClient();

    // Load preferences from database
    const { data: userData, error } = await supabase
      .from('users')
      .select('preferences')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error loading settings:', error);
      setSettings(DEFAULT_SETTINGS);
    } else if (userData?.preferences) {
      // Merge with defaults to handle missing keys
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
    } else {
      setSettings(DEFAULT_SETTINGS);
    }

    setLoading(false);
  }

  const handleSave = async () => {
    if (!user) {
      addToast({
        variant: 'error',
        title: 'Not signed in',
        description: 'Please sign in to save your settings.',
      });
      return;
    }

    setSaving(true);

    const supabase = createClient();

    const { error } = await supabase
      .from('users')
      .update({ preferences: settings })
      .eq('id', user.id);

    if (error) {
      console.error('Error saving settings:', error);
      addToast({
        variant: 'error',
        title: 'Failed to save',
        description: 'There was an error saving your settings. Please try again.',
      });
    } else {
      addToast({
        variant: 'success',
        title: 'Settings saved',
        description: 'Your preferences have been updated.',
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

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-[var(--bg-base)] flex items-center justify-center">
        <div className="text-[var(--text-secondary)]">Loading...</div>
      </div>
    );
  }

  // Show sign-in prompt if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-[var(--bg-base)]">
        <Header />
        <PageContainer size="md" className="py-12">
          <Card className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[var(--bg-subtle)] flex items-center justify-center">
              <svg className="w-8 h-8 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h1 className="text-[var(--text-xl)] font-semibold text-[var(--text-primary)] mb-3">
              Sign in to manage settings
            </h1>
            <p className="text-[var(--text-secondary)] mb-6">
              Access your notification and privacy preferences.
            </p>
            <Button variant="primary" size="lg" onClick={() => router.push('/discover')}>
              Go to Discover
            </Button>
          </Card>
        </PageContainer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-base)]">
      <Header />

      <PageContainer size="md" className="py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-[var(--text-2xl)] font-bold text-[var(--text-primary)]">
            Settings
          </h1>
          <p className="text-[var(--text-sm)] text-[var(--text-secondary)] mt-1">
            Manage your notifications and privacy preferences
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="privacy">Privacy</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
          </TabsList>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <Card className="p-6">
              <h2 className="text-[var(--text-lg)] font-semibold text-[var(--text-primary)] mb-6">
                Notification Preferences
              </h2>

              <div className="space-y-6">
                <div className="flex items-start justify-between gap-4 pb-6 border-b border-[var(--border-subtle)]">
                  <div>
                    <h3 className="text-[var(--text-sm)] font-medium text-[var(--text-primary)]">
                      Space Reminders
                    </h3>
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
                    <h3 className="text-[var(--text-sm)] font-medium text-[var(--text-primary)]">
                      Invite Alerts
                    </h3>
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
                    <h3 className="text-[var(--text-sm)] font-medium text-[var(--text-primary)]">
                      Host Updates
                    </h3>
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
                    <h3 className="text-[var(--text-sm)] font-medium text-[var(--text-primary)]">
                      Marketing Messages
                    </h3>
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
          </TabsContent>

          {/* Privacy Tab */}
          <TabsContent value="privacy">
            <Card className="p-6">
              <h2 className="text-[var(--text-lg)] font-semibold text-[var(--text-primary)] mb-6">
                Privacy Settings
              </h2>

              <div className="space-y-6">
                <div className="flex items-start justify-between gap-4 pb-6 border-b border-[var(--border-subtle)]">
                  <div>
                    <h3 className="text-[var(--text-sm)] font-medium text-[var(--text-primary)]">
                      Show Profile to Others
                    </h3>
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
                    <h3 className="text-[var(--text-sm)] font-medium text-[var(--text-primary)]">
                      Allow Host Contact
                    </h3>
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
                    <h3 className="text-[var(--text-sm)] font-medium text-[var(--text-primary)]">
                      Share Attendance History
                    </h3>
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
          </TabsContent>

          {/* Account Tab */}
          <TabsContent value="account">
            <div className="space-y-6">
              <Card className="p-6">
                <h2 className="text-[var(--text-lg)] font-semibold text-[var(--text-primary)] mb-6">
                  Account
                </h2>

                <div className="space-y-4">
                  <a
                    href="/profile"
                    className="flex items-center justify-between p-4 rounded-[var(--radius-lg)] bg-[var(--bg-subtle)] hover:bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-[var(--border-default)] transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                      </svg>
                      <div>
                        <p className="text-[var(--text-sm)] font-medium text-[var(--text-primary)]">
                          Edit Profile
                        </p>
                        <p className="text-[var(--text-xs)] text-[var(--text-muted)]">
                          Update your name, bio, and preferences
                        </p>
                      </div>
                    </div>
                    <svg className="w-5 h-5 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  </a>

                  <a
                    href="/my-spaces"
                    className="flex items-center justify-between p-4 rounded-[var(--radius-lg)] bg-[var(--bg-subtle)] hover:bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-[var(--border-default)] transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                      </svg>
                      <div>
                        <p className="text-[var(--text-sm)] font-medium text-[var(--text-primary)]">
                          My Spaces
                        </p>
                        <p className="text-[var(--text-xs)] text-[var(--text-muted)]">
                          View your upcoming and past spaces
                        </p>
                      </div>
                    </div>
                    <svg className="w-5 h-5 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  </a>
                </div>
              </Card>

              {/* Danger Zone */}
              <Card className="p-6 border-[var(--error-border)]">
                <h2 className="text-[var(--text-lg)] font-semibold text-[var(--error-text)] mb-4">
                  Danger Zone
                </h2>
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
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </PageContainer>
    </div>
  );
}
