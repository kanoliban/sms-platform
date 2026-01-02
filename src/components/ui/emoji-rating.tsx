'use client';

import { forwardRef, useCallback } from 'react';

export interface EmojiRatingProps {
  value?: number;
  onChange?: (value: number) => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showLabels?: boolean;
  className?: string;
}

interface EmojiOption {
  value: number;
  emoji: string;
  label: string;
}

const emojiOptions: EmojiOption[] = [
  { value: 1, emoji: '😞', label: 'Very Bad' },
  { value: 2, emoji: '😐', label: 'Bad' },
  { value: 3, emoji: '🙂', label: 'Okay' },
  { value: 4, emoji: '😊', label: 'Good' },
  { value: 5, emoji: '🤩', label: 'Amazing' },
];

const sizeStyles = {
  sm: {
    container: 'gap-2',
    button: 'w-10 h-10 text-xl',
    label: 'text-[var(--text-xs)]',
  },
  md: {
    container: 'gap-3',
    button: 'w-14 h-14 text-2xl',
    label: 'text-[var(--text-sm)]',
  },
  lg: {
    container: 'gap-4',
    button: 'w-16 h-16 text-3xl',
    label: 'text-[var(--text-base)]',
  },
};

export const EmojiRating = forwardRef<HTMLDivElement, EmojiRatingProps>(
  function EmojiRating(
    {
      value,
      onChange,
      disabled = false,
      size = 'md',
      showLabels = true,
      className = '',
    },
    ref
  ) {
    const styles = sizeStyles[size];

    const handleSelect = useCallback(
      (newValue: number) => {
        if (!disabled && onChange) {
          onChange(newValue);
        }
      },
      [disabled, onChange]
    );

    return (
      <div
        ref={ref}
        className={`flex items-center justify-center ${styles.container} ${className}`}
        role="radiogroup"
        aria-label="Rating"
      >
        {emojiOptions.map((option) => {
          const isSelected = value === option.value;
          const isHovered = false; // We'll handle hover state visually via CSS

          return (
            <div key={option.value} className="flex flex-col items-center">
              <button
                type="button"
                role="radio"
                aria-checked={isSelected}
                aria-label={`${option.label} - ${option.value} out of 5`}
                disabled={disabled}
                onClick={() => handleSelect(option.value)}
                className={`
                  ${styles.button}
                  rounded-full flex items-center justify-center
                  transition-all duration-[var(--duration-normal)]
                  ${
                    isSelected
                      ? 'bg-[var(--primary-muted)] ring-2 ring-[var(--primary)] scale-110'
                      : 'bg-[var(--bg-subtle)] hover:bg-[var(--bg-surface-hover)] hover:scale-105'
                  }
                  ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                  focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2 focus:ring-offset-[var(--bg-base)]
                `}
              >
                <span className={isSelected ? 'animate-bounce-once' : ''}>
                  {option.emoji}
                </span>
              </button>
              {showLabels && (
                <span
                  className={`
                    ${styles.label}
                    mt-2 text-center
                    ${isSelected ? 'text-[var(--primary)] font-medium' : 'text-[var(--text-muted)]'}
                    transition-colors duration-[var(--duration-normal)]
                  `}
                >
                  {option.label}
                </span>
              )}
            </div>
          );
        })}
      </div>
    );
  }
);

export default EmojiRating;
