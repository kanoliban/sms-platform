'use client';

import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';

export type InputSize = 'sm' | 'md' | 'lg';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  size?: InputSize;
  label?: string;
  error?: string;
  hint?: string;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

const sizeStyles: Record<InputSize, string> = {
  sm: 'h-8 px-3 text-[var(--text-sm)]',
  md: 'h-10 px-4 text-[var(--text-base)]',
  lg: 'h-12 px-4 text-[var(--text-base)]',
};

const iconPaddingLeft: Record<InputSize, string> = {
  sm: 'pl-8',
  md: 'pl-10',
  lg: 'pl-12',
};

const iconPaddingRight: Record<InputSize, string> = {
  sm: 'pr-8',
  md: 'pr-10',
  lg: 'pr-12',
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className = '',
      size = 'md',
      label,
      error,
      hint,
      icon,
      iconPosition = 'left',
      fullWidth = true,
      id,
      disabled,
      ...props
    },
    ref
  ) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const hasError = Boolean(error);

    return (
      <div className={`${fullWidth ? 'w-full' : ''}`}>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-[var(--text-sm)] font-medium text-[var(--text-primary)] mb-1.5"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && iconPosition === 'left' && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`
              w-full
              bg-[var(--bg-subtle)]
              text-[var(--text-primary)]
              placeholder:text-[var(--text-muted)]
              rounded-[var(--radius-input)]
              border
              ${hasError
                ? 'border-[var(--error)] focus:border-[var(--error)] focus:ring-2 focus:ring-[var(--error-muted)]'
                : 'border-[var(--border-default)] focus:border-[var(--border-focus)] focus:ring-2 focus:ring-[var(--primary-muted)]'
              }
              outline-none
              transition-all duration-[var(--duration-normal)] ease-[var(--ease-out)]
              ${sizeStyles[size]}
              ${icon && iconPosition === 'left' ? iconPaddingLeft[size] : ''}
              ${icon && iconPosition === 'right' ? iconPaddingRight[size] : ''}
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
              ${className}
            `.trim().replace(/\s+/g, ' ')}
            disabled={disabled}
            aria-invalid={hasError}
            aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
            {...props}
          />
          {icon && iconPosition === 'right' && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none">
              {icon}
            </span>
          )}
        </div>
        {error && (
          <p id={`${inputId}-error`} className="mt-1.5 text-[var(--text-sm)] text-[var(--error-text)]">
            {error}
          </p>
        )}
        {hint && !error && (
          <p id={`${inputId}-hint`} className="mt-1.5 text-[var(--text-sm)] text-[var(--text-muted)]">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
