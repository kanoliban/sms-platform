'use client';

import { type HTMLAttributes, type ReactNode } from 'react';
import Link from 'next/link';

export type ActionCardColor = 'default' | 'primary' | 'info' | 'success' | 'warning' | 'error' | 'secondary';

export interface ActionCardProps {
  icon: ReactNode;
  title?: string;
  label?: string; // alias for title
  description?: string;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  badge?: ReactNode | number;
  variant?: 'default' | 'outline' | 'ghost';
  color?: ActionCardColor;
  className?: string;
}

const variantStyles = {
  default: `
    bg-[var(--bg-surface)]
    border border-[var(--border-subtle)]
    hover:border-[var(--border-default)]
    hover:shadow-[var(--shadow-md)]
  `,
  outline: `
    bg-transparent
    border border-[var(--border-default)]
    hover:bg-[var(--bg-surface)]
    hover:border-[var(--primary)]
  `,
  ghost: `
    bg-transparent
    hover:bg-[var(--bg-surface)]
  `,
};

const colorStyles: Record<ActionCardColor, { bg: string; text: string; hoverBg: string; hoverText: string }> = {
  default: {
    bg: 'bg-[var(--bg-subtle)]',
    text: 'text-[var(--text-primary)]',
    hoverBg: 'group-hover:bg-[var(--primary-muted)]',
    hoverText: 'group-hover:text-[var(--primary-light)]',
  },
  primary: {
    bg: 'bg-[var(--primary-muted)]',
    text: 'text-[var(--primary-light)]',
    hoverBg: 'group-hover:bg-[var(--primary)]',
    hoverText: 'group-hover:text-white',
  },
  info: {
    bg: 'bg-blue-500/20',
    text: 'text-blue-400',
    hoverBg: 'group-hover:bg-blue-500/30',
    hoverText: 'group-hover:text-blue-300',
  },
  success: {
    bg: 'bg-green-500/20',
    text: 'text-green-400',
    hoverBg: 'group-hover:bg-green-500/30',
    hoverText: 'group-hover:text-green-300',
  },
  warning: {
    bg: 'bg-amber-500/20',
    text: 'text-amber-400',
    hoverBg: 'group-hover:bg-amber-500/30',
    hoverText: 'group-hover:text-amber-300',
  },
  error: {
    bg: 'bg-red-500/20',
    text: 'text-red-400',
    hoverBg: 'group-hover:bg-red-500/30',
    hoverText: 'group-hover:text-red-300',
  },
  secondary: {
    bg: 'bg-pink-500/20',
    text: 'text-pink-400',
    hoverBg: 'group-hover:bg-pink-500/30',
    hoverText: 'group-hover:text-pink-300',
  },
};

export function ActionCard({
  className = '',
  icon,
  title,
  label,
  description,
  href,
  onClick,
  disabled = false,
  badge,
  variant = 'default',
  color = 'default',
}: ActionCardProps) {
  const displayTitle = title || label;
  const colorStyle = colorStyles[color];

  const Content = (
    <>
      {/* Icon */}
      <div
        className={`
          w-12 h-12
          flex items-center justify-center
          rounded-[var(--radius-lg)]
          ${colorStyle.bg}
          ${colorStyle.text}
          transition-colors duration-[var(--duration-normal)]
          ${colorStyle.hoverBg}
          ${colorStyle.hoverText}
          ${disabled ? 'opacity-50' : ''}
        `}
      >
        {icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-[var(--text-sm)] font-semibold text-[var(--text-primary)]">
            {displayTitle}
          </span>
          {badge !== undefined && (
            typeof badge === 'number' ? (
              <span className="px-1.5 py-0.5 text-[10px] font-semibold rounded-full bg-[var(--error-muted)] text-[var(--error-text)]">
                {badge}
              </span>
            ) : badge
          )}
        </div>
        {description && (
          <p className="text-[var(--text-xs)] text-[var(--text-muted)] mt-0.5 line-clamp-2">
            {description}
          </p>
        )}
      </div>

      {/* Arrow */}
      <svg
        className={`
          w-5 h-5 flex-shrink-0
          text-[var(--text-muted)]
          transition-transform duration-[var(--duration-normal)]
          group-hover:translate-x-0.5
          group-hover:text-[var(--text-primary)]
          ${disabled ? 'opacity-50' : ''}
        `}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </>
  );

  const baseClassName = `
    group
    flex items-center gap-4
    p-4
    rounded-[var(--radius-lg)]
    transition-all duration-[var(--duration-normal)]
    ${variantStyles[variant]}
    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  if (href && !disabled) {
    return (
      <Link href={href} className={baseClassName}>
        {Content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={!disabled ? onClick : undefined}
      disabled={disabled}
      className={baseClassName}
    >
      {Content}
    </button>
  );
}

// Action Card Grid
export interface ActionCardGridProps extends HTMLAttributes<HTMLDivElement> {
  actions: ActionCardProps[];
  columns?: 1 | 2 | 3;
}

export function ActionCardGrid({
  className = '',
  actions,
  columns = 2,
  ...props
}: ActionCardGridProps) {
  const colStyles = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  };

  return (
    <div className={`grid ${colStyles[columns]} gap-4 ${className}`} {...props}>
      {actions.map((action, index) => (
        <ActionCard key={(action.title || action.label || '') + index} {...action} />
      ))}
    </div>
  );
}

export default ActionCard;
