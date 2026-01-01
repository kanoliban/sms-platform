'use client';

import { useEffect, useCallback, type ReactNode, type HTMLAttributes } from 'react';
import { createPortal } from 'react-dom';

export type SlideOverPosition = 'right' | 'left';
export type SlideOverSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

export interface SlideOverProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  open: boolean;
  onClose: () => void;
  position?: SlideOverPosition;
  size?: SlideOverSize;
  title?: ReactNode;
  subtitle?: ReactNode;
  headerActions?: ReactNode;
  footer?: ReactNode;
  showOverlay?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
}

const sizeStyles: Record<SlideOverSize, string> = {
  sm: 'max-w-sm',      // 384px
  md: 'max-w-md',      // 448px
  lg: 'max-w-lg',      // 512px
  xl: 'max-w-xl',      // 576px
  full: 'max-w-full',
};

const positionStyles: Record<SlideOverPosition, { panel: string; enter: string; leave: string }> = {
  right: {
    panel: 'right-0',
    enter: 'translate-x-0',
    leave: 'translate-x-full',
  },
  left: {
    panel: 'left-0',
    enter: 'translate-x-0',
    leave: '-translate-x-full',
  },
};

export function SlideOver({
  className = '',
  open,
  onClose,
  position = 'right',
  size = 'md',
  title,
  subtitle,
  headerActions,
  footer,
  showOverlay = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  children,
  ...props
}: SlideOverProps) {
  // Handle escape key
  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && closeOnEscape) {
        onClose();
      }
    },
    [onClose, closeOnEscape]
  );

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [open, handleEscape]);

  if (typeof window === 'undefined') return null;

  const styles = positionStyles[position];

  const content = (
    <div
      className={`
        fixed inset-0
        z-[var(--z-modal)]
        ${open ? 'pointer-events-auto' : 'pointer-events-none'}
      `}
      aria-hidden={!open}
    >
      {/* Overlay */}
      {showOverlay && (
        <div
          className={`
            absolute inset-0
            bg-[var(--overlay-backdrop)]
            transition-opacity duration-[var(--duration-slow)]
            ${open ? 'opacity-100' : 'opacity-0'}
          `}
          onClick={closeOnOverlayClick ? onClose : undefined}
          aria-hidden="true"
        />
      )}

      {/* Panel */}
      <div
        className={`
          absolute top-0 bottom-0
          ${styles.panel}
          w-full
          ${sizeStyles[size]}
          bg-[var(--bg-surface)]
          border-l border-[var(--border-subtle)]
          shadow-[var(--shadow-xl)]
          flex flex-col
          transition-transform duration-[var(--duration-slow)] ease-[var(--ease-out)]
          ${open ? styles.enter : styles.leave}
          ${className}
        `.trim().replace(/\s+/g, ' ')}
        {...props}
      >
        {/* Header */}
        <div className="flex-shrink-0 flex items-start justify-between gap-4 p-4 border-b border-[var(--border-subtle)]">
          <div className="min-w-0">
            {title && (
              <h2 className="text-[var(--text-lg)] font-semibold text-[var(--text-primary)] truncate">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="mt-0.5 text-[var(--text-sm)] text-[var(--text-secondary)]">
                {subtitle}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {headerActions}
            <button
              type="button"
              onClick={onClose}
              className="
                p-2
                rounded-[var(--radius-md)]
                text-[var(--text-muted)]
                hover:text-[var(--text-primary)]
                hover:bg-[var(--bg-surface-hover)]
                transition-colors duration-[var(--duration-normal)]
              "
              aria-label="Close"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex-shrink-0 p-4 border-t border-[var(--border-subtle)]">
            {footer}
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(content, document.body);
}

export default SlideOver;
