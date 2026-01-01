'use client';

import { forwardRef, type TextareaHTMLAttributes, useEffect, useRef } from 'react';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  autoResize?: boolean;
  minRows?: number;
  maxRows?: number;
  fullWidth?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className = '',
      label,
      error,
      hint,
      autoResize = false,
      minRows = 3,
      maxRows = 10,
      fullWidth = true,
      id,
      disabled,
      onInput,
      ...props
    },
    ref
  ) => {
    const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;
    const hasError = Boolean(error);
    const internalRef = useRef<HTMLTextAreaElement>(null);

    const textareaRef = (ref as React.RefObject<HTMLTextAreaElement>) || internalRef;

    const adjustHeight = () => {
      if (!autoResize || !textareaRef.current) return;

      const textarea = textareaRef.current;
      const lineHeight = parseInt(getComputedStyle(textarea).lineHeight) || 24;
      const minHeight = lineHeight * minRows;
      const maxHeight = lineHeight * maxRows;

      textarea.style.height = 'auto';
      const scrollHeight = textarea.scrollHeight;
      textarea.style.height = `${Math.min(Math.max(scrollHeight, minHeight), maxHeight)}px`;
    };

    useEffect(() => {
      adjustHeight();
    }, [props.value, autoResize]);

    const handleInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
      adjustHeight();
      onInput?.(e);
    };

    return (
      <div className={`${fullWidth ? 'w-full' : ''}`}>
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-[var(--text-sm)] font-medium text-[var(--text-primary)] mb-1.5"
          >
            {label}
          </label>
        )}
        <textarea
          ref={textareaRef}
          id={textareaId}
          rows={autoResize ? minRows : undefined}
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
            px-4 py-3
            text-[var(--text-base)]
            leading-relaxed
            resize-none
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            ${className}
          `.trim().replace(/\s+/g, ' ')}
          disabled={disabled}
          aria-invalid={hasError}
          aria-describedby={error ? `${textareaId}-error` : hint ? `${textareaId}-hint` : undefined}
          onInput={handleInput}
          {...props}
        />
        {error && (
          <p id={`${textareaId}-error`} className="mt-1.5 text-[var(--text-sm)] text-[var(--error-text)]">
            {error}
          </p>
        )}
        {hint && !error && (
          <p id={`${textareaId}-hint`} className="mt-1.5 text-[var(--text-sm)] text-[var(--text-muted)]">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export default Textarea;
