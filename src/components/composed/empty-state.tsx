'use client';

import { type HTMLAttributes, type ReactNode } from 'react';
import { Button, type ButtonProps } from '@/components/ui';

export interface EmptyStateProps extends HTMLAttributes<HTMLDivElement> {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick?: () => void;
    href?: string;
    variant?: ButtonProps['variant'];
  };
  secondaryAction?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'minimal' | 'card';
}

const sizeStyles = {
  sm: {
    container: 'py-6',
    icon: 'w-10 h-10 mb-3',
    title: 'text-[var(--text-sm)]',
    description: 'text-[var(--text-xs)]',
  },
  md: {
    container: 'py-12',
    icon: 'w-12 h-12 mb-4',
    title: 'text-[var(--text-base)]',
    description: 'text-[var(--text-sm)]',
  },
  lg: {
    container: 'py-16',
    icon: 'w-16 h-16 mb-6',
    title: 'text-[var(--text-lg)]',
    description: 'text-[var(--text-base)]',
  },
};

const variantStyles = {
  default: '',
  minimal: '',
  card: 'bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)]',
};

export function EmptyState({
  className = '',
  icon,
  title,
  description,
  action,
  secondaryAction,
  size = 'md',
  variant = 'default',
  ...props
}: EmptyStateProps) {
  const sizeStyle = sizeStyles[size];

  // Default icon if none provided
  const defaultIcon = (
    <svg
      className="w-full h-full text-[var(--text-muted)]"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
      />
    </svg>
  );

  return (
    <div
      className={`
        ${sizeStyle.container}
        ${variantStyles[variant]}
        flex flex-col items-center justify-center text-center px-4
        ${className}
      `.trim().replace(/\s+/g, ' ')}
      {...props}
    >
      {/* Icon */}
      <div className={`${sizeStyle.icon} text-[var(--text-muted)]`}>
        {icon || defaultIcon}
      </div>

      {/* Title */}
      <h3 className={`${sizeStyle.title} font-semibold text-[var(--text-primary)]`}>
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p className={`${sizeStyle.description} text-[var(--text-secondary)] mt-2 max-w-sm`}>
          {description}
        </p>
      )}

      {/* Actions */}
      {(action || secondaryAction) && (
        <div className="flex items-center gap-3 mt-6">
          {action && (
            action.href ? (
              <a
                href={action.href}
                className={`
                  inline-flex items-center justify-center
                  px-4 py-2
                  text-[var(--text-sm)] font-medium
                  rounded-[var(--radius-md)]
                  ${action.variant === 'secondary'
                    ? 'bg-[var(--bg-subtle)] text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)]'
                    : 'bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)]'
                  }
                  transition-colors duration-[var(--duration-normal)]
                `}
              >
                {action.label}
              </a>
            ) : (
              <Button
                variant={action.variant || 'primary'}
                size={size === 'lg' ? 'md' : 'sm'}
                onClick={action.onClick}
              >
                {action.label}
              </Button>
            )
          )}
          {secondaryAction && (
            secondaryAction.href ? (
              <a
                href={secondaryAction.href}
                className="
                  inline-flex items-center justify-center
                  px-4 py-2
                  text-[var(--text-sm)] font-medium
                  text-[var(--text-secondary)]
                  hover:text-[var(--text-primary)]
                  transition-colors duration-[var(--duration-normal)]
                "
              >
                {secondaryAction.label}
              </a>
            ) : (
              <Button
                variant="ghost"
                size={size === 'lg' ? 'md' : 'sm'}
                onClick={secondaryAction.onClick}
              >
                {secondaryAction.label}
              </Button>
            )
          )}
        </div>
      )}
    </div>
  );
}

// Preset empty states for common use cases
export function NoGuestsEmptyState(props: Partial<EmptyStateProps>) {
  return (
    <EmptyState
      icon={
        <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      }
      title="No guests yet"
      description="Share your room link or send invites to get the party started."
      {...props}
    />
  );
}

export function NoRoomsEmptyState(props: Partial<EmptyStateProps>) {
  return (
    <EmptyState
      icon={
        <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      }
      title="No rooms yet"
      description="Create your first room to start hosting amazing experiences."
      {...props}
    />
  );
}

export function NoResultsEmptyState(props: Partial<EmptyStateProps>) {
  return (
    <EmptyState
      icon={
        <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      }
      title="No results found"
      description="Try adjusting your search or filters to find what you're looking for."
      {...props}
    />
  );
}

export default EmptyState;
