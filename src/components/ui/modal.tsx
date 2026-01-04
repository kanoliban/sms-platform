'use client';

import {
  useState,
  useEffect,
  useCallback,
  type ReactNode,
  type HTMLAttributes,
} from 'react';
import { createPortal } from 'react-dom';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

export interface ModalProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  open: boolean;
  onClose: () => void;
  size?: ModalSize;
  title?: ReactNode;
  description?: ReactNode;
  footer?: ReactNode;
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
}

const sizeStyles: Record<ModalSize, string> = {
  sm: 'max-w-sm',        // 384px
  md: 'max-w-md',        // 448px
  lg: 'max-w-lg',        // 512px
  xl: 'max-w-xl',        // 576px
  full: 'max-w-[calc(100vw-2rem)]',
};

export function Modal({
  className = '',
  open,
  onClose,
  size = 'md',
  title,
  description,
  footer,
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  children,
  ...props
}: ModalProps) {
  // Track mounted state to avoid hydration mismatch with createPortal
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  // Don't render portal until mounted (prevents hydration mismatch)
  if (!mounted) return null;

  const content = (
    <div
      className={`
        fixed inset-0
        z-[var(--z-modal)]
        flex items-center justify-center
        p-4
        ${open ? 'pointer-events-auto' : 'pointer-events-none'}
      `}
      aria-hidden={!open}
    >
      {/* Overlay */}
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

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
        aria-describedby={description ? 'modal-description' : undefined}
        className={`
          relative
          w-full
          ${sizeStyles[size]}
          max-h-[calc(100vh-2rem)]
          bg-[var(--bg-surface)]
          rounded-[var(--radius-xl)]
          shadow-[var(--shadow-xl)]
          flex flex-col
          transition-all duration-[var(--duration-slow)] ease-[var(--ease-out)]
          ${open
            ? 'opacity-100 scale-100 translate-y-0'
            : 'opacity-0 scale-95 translate-y-4'
          }
          ${className}
        `.trim().replace(/\s+/g, ' ')}
        {...props}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex-shrink-0 flex items-start justify-between gap-4 p-4 border-b border-[var(--border-subtle)]">
            <div className="min-w-0">
              {title && (
                <h2
                  id="modal-title"
                  className="text-[var(--text-lg)] font-semibold text-[var(--text-primary)]"
                >
                  {title}
                </h2>
              )}
              {description && (
                <p
                  id="modal-description"
                  className="mt-1 text-[var(--text-sm)] text-[var(--text-secondary)]"
                >
                  {description}
                </p>
              )}
            </div>
            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                className="
                  flex-shrink-0
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
            )}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex-shrink-0 p-4 border-t border-[var(--border-subtle)] bg-[var(--bg-elevated)]">
            {footer}
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(content, document.body);
}

export default Modal;
