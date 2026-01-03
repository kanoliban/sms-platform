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

// Check if Supabase is configured
const isSupabaseConfigured = () => {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
};

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
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [demoMode, setDemoMode] = useState(false);
  const [activeTab, setActiveTab] = useState('notifications');

  // Settings state
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    if (!isSupabaseConfigured()) {
      setDemoMode(true);
      // Load from localStorage in demo mode
      const savedSettings = localStorage.getItem('sms_settings');
      if (savedSettings) {
        try {
          setSettings(JSON.parse(savedSettings));
        } catch {
          setSettings(DEFAULT_SETTINGS);
        }
      }
      setLoading(false);
      return;
    }

    // In production, load from user preferences in database
    // For now, use defaults
    setLoading(false);
  }

  const handleSave = async () => {
    setSaving(true);

    if (demoMode) {
      await new Promise(resolve => setTimeout(resolve, 800));
      localStorage.setItem('sms_settings', JSON.stringify(settings));
      addToast({
        variant: 'success',
        title: 'Settings saved',
        description: 'Your preferences have been updated.',
      });
      setSaving(false);
      return;
    }

    // In production, save to database
    await new Promise(resolve => setTimeout(resolve, 800));
    addToast({
      variant: 'success',
      title: 'Settings saved',
      description: 'Your preferences have been updated.',
    });
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
