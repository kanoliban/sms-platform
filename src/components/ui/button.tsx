'use client';

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive' | 'outline';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: `
    bg-[var(--primary)] text-white
    hover:bg-[var(--primary-hover)]
    focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-base)]
    shadow-[var(--shadow-button)]
    hover:shadow-[var(--shadow-button-hover)]
  `,
  secondary: `
    bg-[var(--bg-subtle)] text-[var(--text-primary)]
    hover:bg-[var(--bg-surface-hover)]
    border border-[var(--border-default)]
    hover:border-[var(--border-hover)]
    focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-base)]
  `,
  ghost: `
    bg-transparent text-[var(--text-secondary)]
    hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)]
    focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-base)]
  `,
  destructive: `
    bg-[var(--error)] text-white
    hover:bg-[var(--error-hover)]
    focus-visible:ring-2 focus-visible:ring-[var(--error)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-base)]
  `,
  outline: `
    bg-transparent text-[var(--primary)]
    border border-[var(--primary-border)]
    hover:bg-[var(--primary-muted)]
    focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-base)]
  `,
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-[var(--text-sm)] rounded-[var(--radius-button-sm)] gap-1.5',
  md: 'h-10 px-4 text-[var(--text-sm)] rounded-[var(--radius-button)] gap-2',
  lg: 'h-12 px-6 text-[var(--text-base)] rounded-[var(--radius-button-lg)] gap-2.5',
  icon: 'h-10 w-10 p-0 rounded-[var(--radius-button)] flex items-center justify-center',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className = '',
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled,
      icon,
      iconPosition = 'left',
      fullWidth = false,
      children,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        className={`
          inline-flex items-center justify-center
          font-medium
          transition-all duration-[var(--duration-normal)] ease-[var(--ease-out)]
          cursor-pointer
          select-none
          outline-none
          ${variantStyles[variant]}
          ${sizeStyles[size]}
          ${fullWidth ? 'w-full' : ''}
          ${isDisabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}
          ${className}
        `.trim().replace(/\s+/g, ' ')}
        disabled={isDisabled}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {!loading && icon && iconPosition === 'left' && (
          <span className="flex-shrink-0">{icon}</span>
        )}
        {size !== 'icon' && children && <span>{children}</span>}
        {size === 'icon' && !loading && (icon || children)}
        {!loading && icon && iconPosition === 'right' && (
          <span className="flex-shrink-0">{icon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
