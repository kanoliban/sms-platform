'use client';

import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';

export type CardVariant = 'default' | 'elevated' | 'outlined' | 'ghost';
export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  padding?: CardPadding;
  interactive?: boolean;
  selected?: boolean;
  as?: 'div' | 'article' | 'section';
}

const variantStyles: Record<CardVariant, string> = {
  default: `
    bg-[var(--bg-surface)]
    border border-[var(--border-default)]
  `,
  elevated: `
    bg-[var(--bg-surface)]
    border border-[var(--border-subtle)]
    shadow-[var(--shadow-card)]
  `,
  outlined: `
    bg-transparent
    border border-[var(--border-default)]
  `,
  ghost: `
    bg-transparent
    border-none
  `,
};

const paddingStyles: Record<CardPadding, string> = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className = '',
      variant = 'default',
      padding = 'md',
      interactive = false,
      selected = false,
      as: Component = 'div',
      children,
      ...props
    },
    ref
  ) => {
    return (
      <Component
        ref={ref}
        className={`
          rounded-[var(--radius-card)]
          ${variantStyles[variant]}
          ${paddingStyles[padding]}
          ${interactive
            ? `
              cursor-pointer
              transition-all duration-[var(--duration-normal)] ease-[var(--ease-out)]
              hover:bg-[var(--bg-surface-hover)]
              hover:border-[var(--border-hover)]
              ${variant === 'elevated' ? 'hover:shadow-[var(--shadow-card-hover)]' : ''}
            `
            : ''
          }
          ${selected
            ? 'border-[var(--primary)] bg-[var(--primary-muted)]'
            : ''
          }
          ${className}
        `.trim().replace(/\s+/g, ' ')}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

Card.displayName = 'Card';

// Card subcomponents for compound pattern
export interface CardHeaderProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
}

export function CardHeader({
  className = '',
  title,
  subtitle,
  action,
  children,
  ...props
}: CardHeaderProps) {
  return (
    <div
      className={`
        flex items-start justify-between gap-4
        ${className}
      `.trim().replace(/\s+/g, ' ')}
      {...props}
    >
      <div className="flex-1 min-w-0">
        {title && (
          <h3 className="text-[var(--text-lg)] font-semibold text-[var(--text-primary)] truncate">
            {title}
          </h3>
        )}
        {subtitle && (
          <p className="text-[var(--text-sm)] text-[var(--text-secondary)] mt-0.5">
            {subtitle}
          </p>
        )}
        {children}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}

export interface CardContentProps extends HTMLAttributes<HTMLDivElement> {}

export function CardContent({
  className = '',
  children,
  ...props
}: CardContentProps) {
  return (
    <div className={`mt-4 ${className}`} {...props}>
      {children}
    </div>
  );
}

export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  align?: 'left' | 'center' | 'right' | 'between';
}

export function CardFooter({
  className = '',
  align = 'right',
  children,
  ...props
}: CardFooterProps) {
  const alignStyles = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
    between: 'justify-between',
  };

  return (
    <div
      className={`
        flex items-center gap-3
        mt-4 pt-4
        border-t border-[var(--border-subtle)]
        ${alignStyles[align]}
        ${className}
      `.trim().replace(/\s+/g, ' ')}
      {...props}
    >
      {children}
    </div>
  );
}

export default Card;
