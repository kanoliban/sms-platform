'use client';

import { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, Tabs, TabsList, TabsTrigger, TabsContent, Avatar } from '@/components/ui';
import { PageContainer, Header } from '@/components/layout';
import { useAuth } from '@/lib/auth/auth-context';
import { useNotifications } from '@/hooks/use-notifications';
import type { Notification, NotificationType } from '@/components/composed/notifications-dropdown';

// Extended notification types that exist in the system
type ExtendedNotificationType = NotificationType | 'location_reveal' | 'feedback' | 'waitlist' | 'waitlist_promoted' | 'gap_alert';

// Filter categories
type FilterCategory = 'all' | 'unread' | 'spaces' | 'payments' | 'updates';

const filterCategories: Record<FilterCategory, { label: string; types: ExtendedNotificationType[] | 'all' | 'unread' }> = {
  all: { label: 'All', types: 'all' },
  unread: { label: 'Unread', types: 'unread' },
  spaces: {
    label: 'Spaces',
    types: ['registration', 'invite_accepted', 'location_reveal', 'reminder']
  },
  payments: {
    label: 'Payments',
    types: ['payment', 'waitlist', 'waitlist_promoted']
  },
  updates: {
    label: 'Updates',
    types: ['update', 'feedback', 'approval_request', 'gap_alert']
  },
};

// Icons for all notification types
const notificationIcons: Record<string, React.ReactNode> = {
  registration: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM3 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 019.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
    </svg>
  ),
  invite_accepted: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  approval_request: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
    </svg>
  ),
  payment: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
    </svg>
  ),
  reminder: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
    </svg>
  ),
  update: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
    </svg>
  ),
  location_reveal: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
    </svg>
  ),
  feedback: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
    </svg>
  ),
  waitlist: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
    </svg>
  ),
  waitlist_promoted: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l7.5-7.5 7.5 7.5m-15 6l7.5-7.5 7.5 7.5" />
    </svg>
  ),
  gap_alert: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
    </svg>
  ),
};

// Colors for all notification types
const notificationColors: Record<string, { icon: string; bg: string }> = {
  registration: { icon: 'var(--success-text)', bg: 'var(--success-muted)' },
  invite_accepted: { icon: 'var(--info-text)', bg: 'var(--info-muted)' },
  approval_request: { icon: 'var(--warning-text)', bg: 'var(--warning-muted)' },
  payment: { icon: 'var(--primary)', bg: 'var(--primary-muted)' },
  reminder: { icon: 'var(--secondary)', bg: 'var(--secondary-muted)' },
  update: { icon: 'var(--text-secondary)', bg: 'var(--bg-subtle)' },
  location_reveal: { icon: 'var(--info-text)', bg: 'var(--info-muted)' },
  feedback: { icon: 'var(--primary)', bg: 'var(--primary-muted)' },
  waitlist: { icon: 'var(--warning-text)', bg: 'var(--warning-muted)' },
  waitlist_promoted: { icon: 'var(--success-text)', bg: 'var(--success-muted)' },
  gap_alert: { icon: 'var(--error-text)', bg: 'var(--error-muted)' },
};

export default function NotificationsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    refresh
  } = useNotifications({ userId: user?.id });

  const [activeFilter, setActiveFilter] = useState<FilterCategory>('all');

  // Filter notifications based on active tab
  const filteredNotifications = useMemo(() => {
    const filter = filterCategories[activeFilter];

    if (filter.types === 'all') {
      return notifications;
    }

    if (filter.types === 'unread') {
      return notifications.filter(n => !n.read);
    }

    return notifications.filter(n =>
      (filter.types as ExtendedNotificationType[]).includes(n.type as ExtendedNotificationType)
    );
  }, [notifications, activeFilter]);

  const handleNotificationClick = useCallback((notification: Notification) => {
    // Mark as read if unread
    if (!notification.read) {
      markAsRead(notification.id);
    }

    // Navigate to relevant page based on notification type and space
    if (notification.space?.id) {
      // Host-related notifications go to host dashboard
      const hostTypes = ['registration', 'invite_accepted', 'approval_request', 'payment', 'gap_alert'];
      if (hostTypes.includes(notification.type) && user?.role !== 'guest') {
        router.push(`/host/spaces/${notification.space.id}`);
      } else {
        // Guest notifications go to public space page
        router.push(`/spaces/${notification.space.id}`);
      }
    }
  }, [markAsRead, router, user?.role]);

  const handleMarkAllRead = useCallback(async () => {
    await markAllAsRead();
  }, [markAllAsRead]);

  // Loading state
  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-[var(--bg-base)]">
        <Header />
        <PageContainer size="md" className="py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-48 bg-[var(--bg-subtle)] rounded" />
            <div className="h-12 w-full bg-[var(--bg-subtle)] rounded" />
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-20 bg-[var(--bg-subtle)] rounded-lg" />
              ))}
            </div>
          </div>
        </PageContainer>
      </div>
    );
  }

  // Not signed in
  if (!user) {
    return (
      <div className="min-h-screen bg-[var(--bg-base)]">
        <Header />
        <PageContainer size="md" className="py-12">
          <Card className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[var(--bg-subtle)] flex items-center justify-center">
              <svg className="w-8 h-8 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
              </svg>
            </div>
            <h1 className="text-[var(--text-xl)] font-semibold text-[var(--text-primary)] mb-3">
              Sign in to view notifications
            </h1>
            <p className="text-[var(--text-secondary)] mb-6">
              Stay updated on your spaces, invitations, and more.
            </p>
            <Button variant="primary" size="lg" onClick={() => router.push('/auth/login?redirect=/notifications')}>
              Sign In
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
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-[var(--text-2xl)] font-bold text-[var(--text-primary)]">
              Notifications
            </h1>
            {unreadCount > 0 && (
              <p className="text-[var(--text-sm)] text-[var(--text-secondary)] mt-1">
                {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllRead}
              >
                Mark all as read
              </Button>
            )}
            <Button
              variant="secondary"
              size="sm"
              onClick={refresh}
            >
              <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
              Refresh
            </Button>
          </div>
        </div>

        {/* Filter Tabs */}
        <Tabs value={activeFilter} onValueChange={(v) => setActiveFilter(v as FilterCategory)}>
          <TabsList className="mb-6">
            {Object.entries(filterCategories).map(([key, { label }]) => {
              // Show count badge for each filter
              const count = key === 'all'
                ? notifications.length
                : key === 'unread'
                  ? unreadCount
                  : notifications.filter(n =>
                      (filterCategories[key as FilterCategory].types as ExtendedNotificationType[]).includes(n.type as ExtendedNotificationType)
                    ).length;

              return (
                <TabsTrigger key={key} value={key}>
                  {label}
                  {count > 0 && (
                    <span className="ml-1.5 px-1.5 py-0.5 text-[10px] font-medium rounded-full bg-[var(--bg-subtle)] text-[var(--text-muted)]">
                      {count}
                    </span>
                  )}
                </TabsTrigger>
              );
            })}
          </TabsList>

          {/* Notification Content - Same for all tabs, just filtered */}
          {Object.keys(filterCategories).map((key) => (
            <TabsContent key={key} value={key}>
              {filteredNotifications.length === 0 ? (
                <Card className="p-12 text-center">
                  <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[var(--bg-subtle)] flex items-center justify-center">
                    <svg className="w-8 h-8 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                    </svg>
                  </div>
                  <h2 className="text-[var(--text-lg)] font-semibold text-[var(--text-primary)] mb-2">
                    {key === 'unread' ? 'All caught up!' : 'No notifications'}
                  </h2>
                  <p className="text-[var(--text-sm)] text-[var(--text-muted)]">
                    {key === 'unread'
                      ? 'You have no unread notifications.'
                      : key === 'all'
                        ? "When you receive notifications, they'll appear here."
                        : `No ${filterCategories[key as FilterCategory].label.toLowerCase()} notifications yet.`
                    }
                  </p>
                </Card>
              ) : (
                <Card className="divide-y divide-[var(--border-subtle)] overflow-hidden">
                  {filteredNotifications.map((notification) => {
                    const defaultColors = { icon: 'var(--text-secondary)', bg: 'var(--bg-subtle)' };
                    const colors = notificationColors[notification.type as keyof typeof notificationColors] ?? defaultColors;
                    const icon = notificationIcons[notification.type as keyof typeof notificationIcons] ?? notificationIcons.update;

                    return (
                      <button
                        key={notification.id}
                        type="button"
                        onClick={() => handleNotificationClick(notification)}
                        className={`
                          w-full flex items-start gap-4 p-4 text-left
                          hover:bg-[var(--bg-surface-hover)]
                          transition-colors duration-[var(--duration-normal)]
                          ${!notification.read ? 'bg-[var(--primary-muted)]' : ''}
                        `}
                      >
                        {/* Left: Avatar or Icon */}
                        <div className="flex-shrink-0">
                          {notification.actor ? (
                            <Avatar
                              src={notification.actor.avatar}
                              name={notification.actor.name}
                              size="md"
                            />
                          ) : (
                            <div
                              className="w-10 h-10 rounded-full flex items-center justify-center"
                              style={{
                                backgroundColor: colors.bg,
                                color: colors.icon,
                              }}
                            >
                              {icon}
                            </div>
                          )}
                        </div>

                        {/* Center: Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className={`
                                text-[var(--text-sm)]
                                ${!notification.read
                                  ? 'text-[var(--text-primary)] font-medium'
                                  : 'text-[var(--text-secondary)]'
                                }
                              `}>
                                {notification.actor && (
                                  <span className="font-semibold text-[var(--text-primary)]">
                                    {notification.actor.name}
                                  </span>
                                )}{' '}
                                {notification.message}
                              </p>
                              {notification.space && (
                                <p className="text-[var(--text-xs)] text-[var(--text-muted)] mt-0.5">
                                  {notification.space.name}
                                </p>
                              )}
                            </div>

                            {/* Unread indicator */}
                            {!notification.read && (
                              <div className="flex-shrink-0 w-2 h-2 rounded-full bg-[var(--primary)] mt-1.5" />
                            )}
                          </div>

                          <p className="text-[var(--text-xs)] text-[var(--text-muted)] mt-1.5">
                            {notification.timestamp}
                          </p>
                        </div>

                        {/* Right: Space Thumbnail */}
                        {notification.space?.thumbnail && (
                          <div className="flex-shrink-0">
                            <div className="w-14 h-14 rounded-[var(--radius-md)] overflow-hidden bg-[var(--bg-subtle)]">
                              <img
                                src={notification.space.thumbnail}
                                alt={notification.space.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </Card>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </PageContainer>
    </div>
  );
}
