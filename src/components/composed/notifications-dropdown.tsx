'use client';

import { useState, useCallback } from 'react';
import { Dropdown, DropdownTrigger, DropdownContent, Avatar } from '@/components/ui';

export type NotificationType =
  | 'registration'
  | 'invite_accepted'
  | 'approval_request'
  | 'payment'
  | 'reminder'
  | 'update'
  | 'location_reveal'
  | 'feedback'
  | 'waitlist'
  | 'waitlist_promoted'
  | 'gap_alert';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actor?: {
    name: string;
    avatar?: string;
  };
  space?: {
    id: string;
    name: string;
    thumbnail?: string;
  };
}

export interface NotificationsDropdownProps {
  notifications: Notification[];
  unreadCount: number;
  onMarkAllRead?: () => void;
  onMarkRead?: (notificationId: string) => void;
  onNotificationClick?: (notification: Notification) => void;
  onViewAll?: () => void;
}

const notificationIcons: Record<NotificationType, React.ReactNode> = {
  registration: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM3 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 019.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
    </svg>
  ),
  invite_accepted: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  approval_request: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
    </svg>
  ),
  payment: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
    </svg>
  ),
  reminder: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
    </svg>
  ),
  update: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
    </svg>
  ),
  location_reveal: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
    </svg>
  ),
  feedback: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
    </svg>
  ),
  waitlist: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
    </svg>
  ),
  waitlist_promoted: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l7.5-7.5 7.5 7.5m-15 6l7.5-7.5 7.5 7.5" />
    </svg>
  ),
  gap_alert: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
    </svg>
  ),
};

const notificationColors: Record<NotificationType, { icon: string; bg: string }> = {
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

export function NotificationsDropdown({
  notifications,
  unreadCount,
  onMarkAllRead,
  onMarkRead,
  onNotificationClick,
  onViewAll,
}: NotificationsDropdownProps) {
  const [open, setOpen] = useState(false);

  const handleNotificationClick = useCallback((notification: Notification) => {
    if (!notification.read && onMarkRead) {
      onMarkRead(notification.id);
    }
    if (onNotificationClick) {
      onNotificationClick(notification);
    }
    setOpen(false);
  }, [onMarkRead, onNotificationClick]);

  const handleMarkAllRead = useCallback(() => {
    if (onMarkAllRead) {
      onMarkAllRead();
    }
  }, [onMarkAllRead]);

  return (
    <Dropdown open={open} onOpenChange={setOpen}>
      <DropdownTrigger asChild>
        <button
          type="button"
          className="
            relative p-2 rounded-[var(--radius-md)]
            text-[var(--text-muted)]
            hover:text-[var(--text-primary)]
            hover:bg-[var(--bg-surface-hover)]
            transition-colors duration-[var(--duration-normal)]
          "
          aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
          </svg>
          {unreadCount > 0 && (
            <span className="
              absolute -top-0.5 -right-0.5
              min-w-[18px] h-[18px]
              flex items-center justify-center
              bg-[var(--error)] text-white
              text-[10px] font-bold
              rounded-full px-1
            ">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>
      </DropdownTrigger>

      <DropdownContent align="end" className="w-[380px] p-0 max-h-[480px] flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-[var(--border-subtle)]">
          <h3 className="text-[var(--text-base)] font-semibold text-[var(--text-primary)]">
            Notifications
          </h3>
          {unreadCount > 0 && onMarkAllRead && (
            <button
              type="button"
              onClick={handleMarkAllRead}
              className="
                text-[var(--text-xs)] text-[var(--primary)]
                hover:text-[var(--primary-light)]
                transition-colors duration-[var(--duration-normal)]
              "
            >
              Mark all read
            </button>
          )}
        </div>

        {/* Notification List */}
        <div className="flex-1 min-h-0 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <div className="w-12 h-12 rounded-full bg-[var(--bg-subtle)] flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                </svg>
              </div>
              <p className="text-[var(--text-sm)] font-medium text-[var(--text-primary)] mb-1">
                All caught up!
              </p>
              <p className="text-[var(--text-xs)] text-[var(--text-muted)] text-center">
                You have no notifications right now.
              </p>
            </div>
          ) : (
            <div>
              {notifications.map((notification) => {
                const colors = notificationColors[notification.type];
                return (
                  <button
                    key={notification.id}
                    type="button"
                    onClick={() => handleNotificationClick(notification)}
                    className={`
                      w-full flex items-start gap-3 p-4
                      text-left
                      hover:bg-[var(--bg-surface-hover)]
                      transition-colors duration-[var(--duration-normal)]
                      border-b border-[var(--border-subtle)] last:border-b-0
                      ${!notification.read ? 'bg-[var(--primary-muted)]' : ''}
                    `}
                  >
                    {/* Left: Avatar or Icon */}
                    <div className="flex-shrink-0">
                      {notification.actor ? (
                        <Avatar
                          src={notification.actor.avatar}
                          name={notification.actor.name}
                          size="sm"
                        />
                      ) : (
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center"
                          style={{
                            backgroundColor: colors.bg,
                            color: colors.icon,
                          }}
                        >
                          {notificationIcons[notification.type]}
                        </div>
                      )}
                    </div>

                    {/* Center: Content */}
                    <div className="flex-1 min-w-0">
                      <p className={`
                        text-[var(--text-sm)] line-clamp-2
                        ${!notification.read ? 'text-[var(--text-primary)] font-medium' : 'text-[var(--text-secondary)]'}
                      `}>
                        {notification.actor && (
                          <span className="font-semibold text-[var(--text-primary)]">
                            {notification.actor.name}
                          </span>
                        )}{' '}
                        {notification.message}
                      </p>
                      <p className="text-[var(--text-xs)] text-[var(--text-muted)] mt-1">
                        {notification.timestamp}
                      </p>
                    </div>

                    {/* Right: Space Thumbnail */}
                    {notification.space?.thumbnail && (
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 rounded-[var(--radius-md)] overflow-hidden bg-[var(--bg-subtle)]">
                          <img
                            src={notification.space.thumbnail}
                            alt={notification.space.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    )}

                    {/* Unread indicator */}
                    {!notification.read && (
                      <div className="flex-shrink-0 w-2 h-2 rounded-full bg-[var(--primary)] mt-2" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="flex-shrink-0 p-3 border-t border-[var(--border-subtle)] bg-[var(--bg-elevated)]">
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onViewAll?.();
              }}
              className="
                w-full text-center text-[var(--text-sm)]
                text-[var(--primary)] hover:text-[var(--primary-light)]
                transition-colors duration-[var(--duration-normal)]
                py-1
              "
            >
              View all notifications
            </button>
          </div>
        )}
      </DropdownContent>
    </Dropdown>
  );
}

export default NotificationsDropdown;
