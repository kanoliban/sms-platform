/**
 * SMS Design System - Composed Components
 *
 * Higher-level components built from foundation pieces.
 * These are domain-specific components for the SMS platform.
 */

// Room Components
export {
  RoomCard,
  type RoomCardProps,
  type RoomTone,
} from './room-card';

// Guest Components
export {
  GuestRow,
  GuestList,
  type GuestRowProps,
  type GuestListProps,
  type GuestStatus,
} from './guest-row';

// Host Components
export {
  HostBadge,
  HostTeam,
  type HostBadgeProps,
  type HostTeamProps,
  type HostRole,
} from './host-badge';

// Status Components
export {
  StatusBadge,
  type StatusBadgeProps,
  type StatusType,
} from './status-badge';

// Stats Components
export {
  StatsCard,
  StatsGrid,
  type StatsCardProps,
  type StatsCardVariant,
  type StatsGridProps,
} from './stats-card';

// Empty State Components
export {
  EmptyState,
  NoGuestsEmptyState,
  NoRoomsEmptyState,
  NoResultsEmptyState,
  type EmptyStateProps,
} from './empty-state';

// Action Components
export {
  ActionCard,
  ActionCardGrid,
  type ActionCardProps,
  type ActionCardGridProps,
  type ActionCardColor,
} from './action-card';

// Countdown Components
export {
  CountdownBadge,
  CountdownDisplay,
  type CountdownBadgeProps,
  type CountdownDisplayProps,
} from './countdown-badge';

// Invite Components
export {
  InviteModal,
  type InviteModalProps,
  type InviteRecipient,
} from './invite-modal';

// Share Components
export {
  ShareRoomModal,
  type ShareRoomModalProps,
} from './share-room-modal';

// Contact Components
export {
  ContactHostModal,
  type ContactHostModalProps,
} from './contact-host-modal';

// Report Components
export {
  ReportRoomModal,
  type ReportRoomModalProps,
} from './report-room-modal';

// Guest Detail Components
export {
  GuestDetailSlideOver,
  type GuestDetailSlideOverProps,
  type GuestDetail,
  type GuestTag,
  type TagColor,
} from './guest-detail-slide-over';

// Notification Components
export {
  NotificationsDropdown,
  type NotificationsDropdownProps,
  type Notification,
  type NotificationType,
} from './notifications-dropdown';

// App Header (Header + Notifications)
export {
  AppHeader,
  type AppHeaderProps,
} from './app-header';
