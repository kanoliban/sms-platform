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
    room: { id: 'demo-1', name: 'Dinner & Deep Talks' },
  },
  {
    id: '2',
    type: 'invite_accepted',
    title: 'Invite Accepted',
    message: 'Jordan Lee accepted your invite to Game Night',
    timestamp: '2h',
    read: false,
    actor: { name: 'Jordan Lee' },
    room: { id: 'demo-3', name: 'Game Night Strangers' },
  },
  {
    id: '3',
    type: 'approval_request',
    title: 'Approval Needed',
    message: 'Sam Rivera requested to join Strangers & Vinyl',
    timestamp: '5h',
    read: true,
    actor: { name: 'Sam Rivera' },
    room: { id: 'demo-2', name: 'Strangers & Vinyl' },
  },
  {
    id: '4',
    type: 'payment',
    title: 'Payment Received',
    message: 'You received $45.00 from Taylor Kim',
    timestamp: 'Mon',
    read: true,
    actor: { name: 'Taylor Kim' },
    room: { id: 'demo-1', name: 'Dinner & Deep Talks' },
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
    // Navigate to the relevant room if available
    if (notification.room?.id) {
      window.location.href = `/host/rooms/${notification.room.id}`;
    }
  }, [handleMarkRead]);

  // Default nav items for host pages
  const defaultNavItems: NavItem[] = [
    { label: 'Dashboard', href: '/host', active: false },
    { label: 'Discover', href: '/discover', active: false },
    { label: 'My Rooms', href: '/my-rooms', active: false },
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
