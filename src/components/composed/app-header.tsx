'use client';

import { useCallback, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { Header, type HeaderProps, type NavItem } from '@/components/layout/header';
import { NotificationsDropdown, type Notification } from './notifications-dropdown';
import { useAuth } from '@/lib/auth/auth-context';
import { useNotifications } from '@/hooks/use-notifications';

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
  const router = useRouter();
  const { user } = useAuth();
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
  } = useNotifications({ userId: user?.id });

  const handleNotificationClick = useCallback((notification: Notification) => {
    markAsRead(notification.id);
    // Navigate to the relevant space if available
    if (notification.space?.id) {
      router.push(`/host/spaces/${notification.space.id}`);
    }
  }, [markAsRead, router]);

  const handleViewAll = useCallback(() => {
    router.push('/notifications');
  }, [router]);

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
          onMarkAllRead={markAllAsRead}
          onMarkRead={markAsRead}
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
