'use client';

import { type HTMLAttributes, type ReactNode } from 'react';

export type StatsCardVariant = 'default' | 'highlight' | 'success' | 'warning' | 'danger';

export interface StatsCardProps extends HTMLAttributes<HTMLDivElement> {
  value: string | number;
  label: string;
  icon?: ReactNode;
  trend?: {
    value: number;
    direction: 'up' | 'down';
    label?: string;
  };
  variant?: StatsCardVariant;
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

const variantStyles: Record<StatsCardVariant, { bg: string; accent: string }> = {
  default: {
    bg: 'bg-[var(--bg-surface)]',
    accent: 'text-[var(--text-primary)]',
  },
  highlight: {
    bg: 'bg-[var(--primary-muted)]',
    accent: 'text-[var(--primary-light)]',
  },
  success: {
    bg: 'bg-[var(--status-going-bg)]',
    accent: 'text-[var(--status-going)]',
  },
  warning: {
    bg: 'bg-[var(--status-pending-bg)]',
    accent: 'text-[var(--status-pending)]',
  },
  danger: {
    bg: 'bg-[var(--status-declined-bg)]',
    accent: 'text-[var(--status-declined)]',
  },
};

const sizeStyles = {
  sm: {
    container: 'p-3',
    value: 'text-[var(--text-xl)]',
    label: 'text-[var(--text-xs)]',
    icon: 'w-8 h-8',
  },
  md: {
    container: 'p-4',
    value: 'text-[var(--text-2xl)]',
    label: 'text-[var(--text-sm)]',
    icon: 'w-10 h-10',
  },
  lg: {
    container: 'p-6',
    value: 'text-[var(--text-3xl)]',
    label: 'text-[var(--text-base)]',
    icon: 'w-12 h-12',
  },
};

export function StatsCard({
  className = '',
  value,
  label,
  icon,
  trend,
  variant = 'default',
  size = 'md',
  loading = false,
  ...props
}: StatsCardProps) {
  const variantStyle = variantStyles[variant];
  const sizeStyle = sizeStyles[size];

  return (
    <div
      className={`
        ${sizeStyle.container}
        ${variantStyle.bg}
        border border-[var(--border-subtle)]
        rounded-[var(--radius-lg)]
        ${className}
      `.trim().replace(/\s+/g, ' ')}
      {...props}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {/* Value */}
          {loading ? (
            <div className={`${sizeStyle.value} h-8 w-16 bg-[var(--bg-subtle)] rounded animate-pulse`} />
          ) : (
            <div className={`${sizeStyle.value} font-bold ${variantStyle.accent} tabular-nums`}>
              {value}
            </div>
          )}

          {/* Label */}
          <div className={`${sizeStyle.label} text-[var(--text-muted)] mt-1`}>
            {label}
          </div>

          {/* Trend */}
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              <span
                className={`
                  inline-flex items-center
                  text-[var(--text-xs)] font-medium
                  ${trend.direction === 'up'
                    ? 'text-[var(--status-going)]'
                    : 'text-[var(--status-declined)]'
                  }
                `}
              >
                {trend.direction === 'up' ? (
                  <svg className="w-3 h-3 mr-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                  </svg>
                ) : (
                  <svg className="w-3 h-3 mr-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                )}
                {trend.value}%
              </span>
              {trend.label && (
                <span className="text-[var(--text-xs)] text-[var(--text-muted)]">
                  {trend.label}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Icon */}
        {icon && (
          <div
            className={`
              ${sizeStyle.icon}
              flex items-center justify-center
              rounded-[var(--radius-md)]
              bg-[var(--bg-subtle)]
              text-[var(--text-muted)]
            `}
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

// Stats Grid - displays multiple stats in a grid
export interface StatsGridProps extends HTMLAttributes<HTMLDivElement> {
  stats: StatsCardProps[];
  columns?: 2 | 3 | 4;
}

export function StatsGrid({
  className = '',
  stats,
  columns = 4,
  ...props
}: StatsGridProps) {
  const colStyles = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div
      className={`grid ${colStyles[columns]} gap-4 ${className}`}
      {...props}
    >
      {stats.map((stat, index) => (
        <StatsCard key={stat.label + index} {...stat} />
      ))}
    </div>
  );
}

export default StatsCard;
