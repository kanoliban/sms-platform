'use client';

import { type HTMLAttributes, type ReactNode } from 'react';

export type StatusType =
  | 'going'
  | 'not-going'
  | 'maybe'
  | 'invited'
  | 'pending'
  | 'waitlist'
  | 'approved'
  | 'declined'
  | 'checked-in'
  | 'live'
  | 'upcoming'
  | 'past'
  | 'draft'
  | 'cancelled';

export interface StatusBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  status: StatusType;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  showDot?: boolean;
  pulse?: boolean;
}

interface StatusConfig {
  label: string;
  bg: string;
  text: string;
  border: string;
  dot?: string;
  icon?: ReactNode;
}

const CheckIcon = () => (
  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

const XIcon = () => (
  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const QuestionIcon = () => (
  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ClockIcon = () => (
  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const statusConfigs: Record<StatusType, StatusConfig> = {
  going: {
    label: 'Going',
    bg: 'bg-[var(--status-going-bg)]',
    text: 'text-[var(--status-going)]',
    border: 'border-[var(--status-going-border)]',
    dot: 'bg-[var(--status-going)]',
    icon: <CheckIcon />,
  },
  'not-going': {
    label: 'Not Going',
    bg: 'bg-[var(--status-declined-bg)]',
    text: 'text-[var(--status-declined)]',
    border: 'border-[var(--status-declined-border)]',
    dot: 'bg-[var(--status-declined)]',
    icon: <XIcon />,
  },
  maybe: {
    label: 'Maybe',
    bg: 'bg-[var(--status-pending-bg)]',
    text: 'text-[var(--status-pending)]',
    border: 'border-[var(--status-pending-border)]',
    dot: 'bg-[var(--status-pending)]',
    icon: <QuestionIcon />,
  },
  invited: {
    label: 'Invited',
    bg: 'bg-[var(--status-invited-bg)]',
    text: 'text-[var(--status-invited)]',
    border: 'border-[var(--status-invited-border)]',
    dot: 'bg-[var(--status-invited)]',
  },
  pending: {
    label: 'Pending',
    bg: 'bg-[var(--status-pending-bg)]',
    text: 'text-[var(--status-pending)]',
    border: 'border-[var(--status-pending-border)]',
    dot: 'bg-[var(--status-pending)]',
    icon: <ClockIcon />,
  },
  waitlist: {
    label: 'Waitlist',
    bg: 'bg-[var(--status-waitlist-bg)]',
    text: 'text-[var(--status-waitlist)]',
    border: 'border-[var(--status-waitlist-border)]',
    dot: 'bg-[var(--status-waitlist)]',
  },
  approved: {
    label: 'Approved',
    bg: 'bg-[var(--status-going-bg)]',
    text: 'text-[var(--status-going)]',
    border: 'border-[var(--status-going-border)]',
    dot: 'bg-[var(--status-going)]',
    icon: <CheckIcon />,
  },
  declined: {
    label: 'Declined',
    bg: 'bg-[var(--status-declined-bg)]',
    text: 'text-[var(--status-declined)]',
    border: 'border-[var(--status-declined-border)]',
    dot: 'bg-[var(--status-declined)]',
    icon: <XIcon />,
  },
  'checked-in': {
    label: 'Checked In',
    bg: 'bg-[var(--status-going-bg)]',
    text: 'text-[var(--status-going)]',
    border: 'border-[var(--status-going-border)]',
    dot: 'bg-[var(--status-going)]',
    icon: <CheckIcon />,
  },
  live: {
    label: 'Live Now',
    bg: 'bg-[var(--status-live-bg)]',
    text: 'text-[var(--status-live)]',
    border: 'border-[var(--status-live-border)]',
    dot: 'bg-[var(--status-live)]',
  },
  upcoming: {
    label: 'Upcoming',
    bg: 'bg-[var(--bg-subtle)]',
    text: 'text-[var(--text-secondary)]',
    border: 'border-[var(--border-default)]',
    dot: 'bg-[var(--text-muted)]',
  },
  past: {
    label: 'Past',
    bg: 'bg-[var(--bg-subtle)]',
    text: 'text-[var(--text-muted)]',
    border: 'border-[var(--border-subtle)]',
    dot: 'bg-[var(--text-muted)]',
  },
  draft: {
    label: 'Draft',
    bg: 'bg-[var(--bg-subtle)]',
    text: 'text-[var(--text-muted)]',
    border: 'border-[var(--border-subtle)]',
    dot: 'bg-[var(--text-muted)]',
  },
  cancelled: {
    label: 'Cancelled',
    bg: 'bg-[var(--status-declined-bg)]',
    text: 'text-[var(--status-declined)]',
    border: 'border-[var(--status-declined-border)]',
    dot: 'bg-[var(--status-declined)]',
    icon: <XIcon />,
  },
};

const sizeStyles = {
  sm: 'px-2 py-0.5 text-[10px] gap-1',
  md: 'px-2.5 py-1 text-[var(--text-xs)] gap-1.5',
  lg: 'px-3 py-1.5 text-[var(--text-sm)] gap-2',
};

export function StatusBadge({
  className = '',
  status,
  size = 'md',
  showIcon = false,
  showDot = false,
  pulse = false,
  ...props
}: StatusBadgeProps) {
  const config = statusConfigs[status];

  return (
    <span
      className={`
        inline-flex items-center
        ${sizeStyles[size]}
        ${config.bg}
        ${config.text}
        ${config.border}
        border
        font-semibold
        rounded-full
        uppercase tracking-wide
        ${className}
      `.trim().replace(/\s+/g, ' ')}
      {...props}
    >
      {/* Dot indicator */}
      {showDot && config.dot && (
        <span
          className={`
            w-2 h-2
            ${config.dot}
            rounded-full
            ${pulse && status === 'live' ? 'animate-pulse' : ''}
          `}
        />
      )}

      {/* Icon */}
      {showIcon && config.icon && (
        <span className="flex-shrink-0">{config.icon}</span>
      )}

      {/* Label */}
      {config.label}
    </span>
  );
}

export default StatusBadge;
