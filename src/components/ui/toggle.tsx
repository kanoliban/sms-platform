'use client';

import { forwardRef, type InputHTMLAttributes } from 'react';

export type ToggleSize = 'sm' | 'md' | 'lg';

export interface ToggleProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'> {
  size?: ToggleSize;
  label?: string;
  description?: string;
}

const sizeStyles: Record<ToggleSize, { track: string; thumb: string; translate: string }> = {
  sm: {
    track: 'w-8 h-5',
    thumb: 'w-3.5 h-3.5',
    translate: 'translate-x-3.5',
  },
  md: {
    track: 'w-11 h-6',
    thumb: 'w-4 h-4',
    translate: 'translate-x-5',
  },
  lg: {
    track: 'w-14 h-7',
    thumb: 'w-5 h-5',
    translate: 'translate-x-7',
  },
};

export const Toggle = forwardRef<HTMLInputElement, ToggleProps>(
  (
    {
      className = '',
      size = 'md',
      label,
      description,
      id,
      disabled,
      checked,
      ...props
    },
    ref
  ) => {
    const toggleId = id || `toggle-${Math.random().toString(36).substr(2, 9)}`;
    const styles = sizeStyles[size];

    return (
      <label
        htmlFor={toggleId}
        className={`
          inline-flex items-start gap-3
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${className}
        `.trim().replace(/\s+/g, ' ')}
      >
        <div className="relative flex-shrink-0">
          <input
            ref={ref}
            type="checkbox"
            id={toggleId}
            className="sr-only peer"
            disabled={disabled}
            checked={checked}
            {...props}
          />
          {/* Track */}
          <div
            className={`
              ${styles.track}
              bg-[var(--bg-subtle)]
              border border-[var(--border-default)]
              rounded-full
              transition-all duration-[var(--duration-normal)] ease-[var(--ease-out)]
              peer-checked:bg-[var(--primary)]
              peer-checked:border-[var(--primary)]
              peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--primary)] peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-[var(--bg-base)]
            `}
          />
          {/* Thumb */}
          <div
            className={`
              absolute top-1 left-1
              ${styles.thumb}
              bg-white
              rounded-full
              shadow-[var(--shadow-sm)]
              transition-transform duration-[var(--duration-normal)] ease-[var(--ease-out)]
              peer-checked:${styles.translate}
            `}
          />
        </div>
        {(label || description) && (
          <div className="flex flex-col">
            {label && (
              <span className="text-[var(--text-sm)] font-medium text-[var(--text-primary)]">
                {label}
              </span>
            )}
            {description && (
              <span className="text-[var(--text-sm)] text-[var(--text-muted)]">
                {description}
              </span>
            )}
          </div>
        )}
      </label>
    );
  }
);

Toggle.displayName = 'Toggle';

export default Toggle;
