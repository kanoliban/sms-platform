'use client';

import { useEffect, useCallback, type ReactNode, type HTMLAttributes } from 'react';
import { createPortal } from 'react-dom';

export type BottomSheetHeight = 'auto' | 'half' | 'full';

export interface BottomSheetProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  open: boolean;
  onClose: () => void;
  height?: BottomSheetHeight;
  title?: ReactNode;
  showHandle?: boolean;
  showOverlay?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
}

const heightStyles: Record<BottomSheetHeight, string> = {
  auto: 'max-h-[85vh]',
  half: 'h-1/2',
  full: 'h-[85vh]',
};

export function BottomSheet({
  className = '',
  open,
  onClose,
  height = 'auto',
  title,
  showHandle = true,
  showOverlay = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  children,
  ...props
}: BottomSheetProps) {
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

      {/* Sheet */}
      <div
        className={`
          absolute bottom-0 left-0 right-0
          ${heightStyles[height]}
          bg-[var(--bg-surface)]
          rounded-t-[var(--radius-xl)]
          shadow-[var(--shadow-xl)]
          flex flex-col
          transition-transform duration-[var(--duration-slow)] ease-[var(--ease-out)]
          ${open ? 'translate-y-0' : 'translate-y-full'}
          ${className}
        `.trim().replace(/\s+/g, ' ')}
        {...props}
      >
        {/* Handle */}
        {showHandle && (
          <div className="flex-shrink-0 pt-3 pb-2">
            <div className="w-12 h-1.5 mx-auto bg-[var(--border-default)] rounded-full" />
          </div>
        )}

        {/* Header */}
        {title && (
          <div className="flex-shrink-0 px-4 py-3 border-b border-[var(--border-subtle)]">
            <h2 className="text-[var(--text-lg)] font-semibold text-[var(--text-primary)] text-center">
              {title}
            </h2>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {children}
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}

export default BottomSheet;
