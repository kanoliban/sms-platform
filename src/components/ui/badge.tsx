'use client';

import { type HTMLAttributes, type ReactNode } from 'react';

export type BadgeVariant =
  | 'default'
  | 'primary'
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'live'
  | 'going'
  | 'invited'
  | 'pending'
  | 'waitlist'
  | 'declined'
  | 'checked-in'
  | 'no-show'
  | 'cancelled';

export type BadgeSize = 'sm' | 'md' | 'lg';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: ReactNode;
  dot?: boolean;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-[var(--bg-muted)] text-[var(--text-secondary)] border-[var(--border-default)]',
  primary: 'bg-[var(--primary-muted)] text-[var(--primary-light)] border-[var(--primary-border)]',
  success: 'bg-[var(--success-muted)] text-[var(--success-text)] border-transparent',
  warning: 'bg-[var(--warning-muted)] text-[var(--warning-text)] border-transparent',
  error: 'bg-[var(--error-muted)] text-[var(--error-text)] border-transparent',
  info: 'bg-[var(--info-muted)] text-[var(--info-text)] border-transparent',
  live: 'bg-[var(--status-live-bg)] text-[var(--status-live)] border-[var(--status-live-border)] animate-pulse',
  // Status-specific variants (Lu.ma patterns)
  going: 'bg-[var(--status-going-bg)] text-[var(--status-going-text)] border-[var(--status-going-border)]',
  invited: 'bg-[var(--status-invited-bg)] text-[var(--status-invited-text)] border-[var(--status-invited-border)]',
  pending: 'bg-[var(--status-pending-bg)] text-[var(--status-pending-text)] border-[var(--status-pending-border)]',
  waitlist: 'bg-[var(--status-waitlist-bg)] text-[var(--status-waitlist-text)] border-[var(--status-waitlist-border)]',
  declined: 'bg-[var(--status-declined-bg)] text-[var(--status-declined-text)] border-[var(--status-declined-border)]',
  'checked-in': 'bg-[var(--status-checked-in-bg)] text-[var(--status-checked-in-text)] border-[var(--status-checked-in-border)]',
  'no-show': 'bg-[var(--status-no-show-bg)] text-[var(--status-no-show-text)] border-[var(--status-no-show-border)]',
  cancelled: 'bg-[var(--status-cancelled-bg)] text-[var(--status-cancelled-text)] border-[var(--status-cancelled-border)]',
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'px-1.5 py-0.5 text-[10px]',
  md: 'px-2 py-0.5 text-[var(--text-xs)]',
  lg: 'px-2.5 py-1 text-[var(--text-sm)]',
};

const dotSizes: Record<BadgeSize, string> = {
  sm: 'w-1.5 h-1.5',
  md: 'w-2 h-2',
  lg: 'w-2.5 h-2.5',
};

export function Badge({
  className = '',
  variant = 'default',
  size = 'md',
  icon,
  dot,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center gap-1
        font-medium
        rounded-[var(--radius-badge)]
        border
        whitespace-nowrap
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `.trim().replace(/\s+/g, ' ')}
      {...props}
    >
      {dot && (
        <span
          className={`
            ${dotSizes[size]}
            rounded-full
            bg-current
            opacity-80
          `}
        />
      )}
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </span>
  );
}

export default Badge;
