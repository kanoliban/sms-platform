'use client';

import { type HTMLAttributes, type ReactNode } from 'react';
import Link from 'next/link';

export interface ActionCardProps {
  icon: ReactNode;
  title: string;
  description?: string;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  badge?: ReactNode;
  variant?: 'default' | 'outline' | 'ghost';
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

export function ActionCard({
  className = '',
  icon,
  title,
  description,
  href,
  onClick,
  disabled = false,
  badge,
  variant = 'default',
}: ActionCardProps) {
  const Content = (
    <>
      {/* Icon */}
      <div
        className={`
          w-12 h-12
          flex items-center justify-center
          rounded-[var(--radius-lg)]
          bg-[var(--bg-subtle)]
          text-[var(--text-primary)]
          transition-colors duration-[var(--duration-normal)]
          group-hover:bg-[var(--primary-muted)]
          group-hover:text-[var(--primary-light)]
          ${disabled ? 'opacity-50' : ''}
        `}
      >
        {icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-[var(--text-sm)] font-semibold text-[var(--text-primary)]">
            {title}
          </span>
          {badge}
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
        <ActionCard key={action.title + index} {...action} />
      ))}
    </div>
  );
}

export default ActionCard;
