'use client';

import { useState, useCallback, type ReactNode } from 'react';
import Link from 'next/link';
import { Header, type HeaderProps, type NavItem } from '@/components/layout/header';
import { NotificationsDropdown, type Notification } from './notifications-dropdown';

// Demo notifications for preview mode
const DEMO_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    type: 'registration',
    title: 'New Registration',
    message: 'Alex Chen registered for Dinner & Deep Talks',
    timestamp: '4m',
    read: false,
    actor: { name: 'Alex Chen' },
    space: { id: 'demo-1', name: 'Dinner & Deep Talks' },
  },
  {
    id: '2',
    type: 'invite_accepted',
    title: 'Invite Accepted',
    message: 'Jordan Lee accepted your invite to Game Night',
    timestamp: '2h',
    read: false,
    actor: { name: 'Jordan Lee' },
    space: { id: 'demo-3', name: 'Game Night Strangers' },
  },
  {
    id: '3',
    type: 'approval_request',
    title: 'Approval Needed',
    message: 'Sam Rivera requested to join Strangers & Vinyl',
    timestamp: '5h',
    read: true,
    actor: { name: 'Sam Rivera' },
    space: { id: 'demo-2', name: 'Strangers & Vinyl' },
  },
  {
    id: '4',
    type: 'payment',
    title: 'Payment Received',
    message: 'You received $45.00 from Taylor Kim',
    timestamp: 'Mon',
    read: true,
    actor: { name: 'Taylor Kim' },
    space: { id: 'demo-1', name: 'Dinner & Deep Talks' },
  },
];

export interface AppHeaderProps extends Omit<HeaderProps, 'actions'> {
  showNotifications?: boolean;
  extraActions?: ReactNode;
}

export function AppHeader({
  showNotifications = true,
  extraActions,
  navItems,
  ...props
}: AppHeaderProps) {
  const [notifications, setNotifications] = useState<Notification[]>(DEMO_NOTIFICATIONS);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const handleMarkRead = useCallback((notificationId: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === notificationId ? { ...n, read: true } : n))
    );
  }, []);

  const handleNotificationClick = useCallback((notification: Notification) => {
    handleMarkRead(notification.id);
    // Navigate to the relevant space if available
    if (notification.space?.id) {
      window.location.href = `/host/spaces/${notification.space.id}`;
    }
  }, [handleMarkRead]);

  const handleViewAll = useCallback(() => {
    // TODO: Navigate to /notifications page when built
    alert('View All Notifications clicked! (Notifications page coming soon)');
  }, []);

  // Default nav items for host pages
  const defaultNavItems: NavItem[] = [
    { label: 'Dashboard', href: '/host', active: false },
    { label: 'Discover', href: '/discover', active: false },
    { label: 'My Spaces', href: '/my-spaces', active: false },
  ];

  const actions = (
    <div className="flex items-center gap-3">
      {showNotifications && (
        <NotificationsDropdown
          notifications={notifications}
          unreadCount={unreadCount}
          onMarkAllRead={handleMarkAllRead}
          onMarkRead={handleMarkRead}
          onNotificationClick={handleNotificationClick}
          onViewAll={handleViewAll}
        />
      )}
      {extraActions}
    </div>
  );

  return (
    <Header
      navItems={navItems || defaultNavItems}
      actions={actions}
      {...props}
    />
  );
}

export default AppHeader;
