'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';

export type ToastVariant = 'default' | 'success' | 'error' | 'warning' | 'info';
export type ToastPosition = 'top-center' | 'top-right' | 'bottom-center' | 'bottom-right';

export interface Toast {
  id: string;
  title?: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastContextValue {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => string;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

// Simple toast function for quick access
let toastFn: ((toast: Omit<Toast, 'id'>) => string) | null = null;

export function toast(options: Omit<Toast, 'id'>) {
  if (toastFn) {
    return toastFn(options);
  }
  console.warn('ToastProvider not mounted');
  return '';
}

export interface ToastProviderProps {
  children: ReactNode;
  position?: ToastPosition;
  maxToasts?: number;
  defaultDuration?: number;
}

const positionStyles: Record<ToastPosition, string> = {
  'top-center': 'top-4 left-1/2 -translate-x-1/2',
  'top-right': 'top-4 right-4',
  'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
  'bottom-right': 'bottom-4 right-4',
};

export function ToastProvider({
  children,
  position = 'bottom-center',
  maxToasts = 5,
  defaultDuration = 5000,
}: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: Toast = {
      ...toast,
      id,
      duration: toast.duration ?? defaultDuration,
    };

    setToasts((prev) => {
      const updated = [...prev, newToast];
      return updated.slice(-maxToasts);
    });

    return id;
  }, [defaultDuration, maxToasts]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  // Expose toast function globally
  useEffect(() => {
    toastFn = addToast;
    return () => {
      toastFn = null;
    };
  }, [addToast]);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, clearToasts }}>
      {children}
      {mounted && createPortal(
        <div
          className={`
            fixed z-[var(--z-toast)]
            flex flex-col gap-2
            pointer-events-none
            ${positionStyles[position]}
          `}
          role="region"
          aria-label="Notifications"
        >
          {toasts.map((toast) => (
            <ToastItem
              key={toast.id}
              toast={toast}
              onDismiss={() => removeToast(toast.id)}
            />
          ))}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
}

// Toast Item Component
interface ToastItemProps {
  toast: Toast;
  onDismiss: () => void;
}

const variantStyles: Record<ToastVariant, { container: string; icon: ReactNode }> = {
  default: {
    container: 'bg-[var(--bg-surface)] border-[var(--border-default)]',
    icon: null,
  },
  success: {
    container: 'bg-[var(--bg-surface)] border-[var(--status-going-border)]',
    icon: (
      <svg className="w-5 h-5 text-[var(--status-going)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    ),
  },
  error: {
    container: 'bg-[var(--bg-surface)] border-[var(--status-declined-border)]',
    icon: (
      <svg className="w-5 h-5 text-[var(--status-declined)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
  },
  warning: {
    container: 'bg-[var(--bg-surface)] border-[var(--status-pending-border)]',
    icon: (
      <svg className="w-5 h-5 text-[var(--status-pending)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
  },
  info: {
    container: 'bg-[var(--bg-surface)] border-[var(--accent-blue)]',
    icon: (
      <svg className="w-5 h-5 text-[var(--accent-blue)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
};

function ToastItem({ toast, onDismiss }: ToastItemProps) {
  const { variant = 'default', title, description, duration, action } = toast;
  const styles = variantStyles[variant];

  // Auto dismiss
  useEffect(() => {
    if (duration && duration > 0) {
      const timer = setTimeout(onDismiss, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onDismiss]);

  return (
    <div
      role="alert"
      className={`
        pointer-events-auto
        w-[360px] max-w-[calc(100vw-2rem)]
        p-4
        rounded-[var(--radius-lg)]
        border
        shadow-[var(--shadow-lg)]
        flex items-start gap-3
        animate-slide-up
        ${styles.container}
      `}
    >
      {/* Icon */}
      {styles.icon && (
        <span className="flex-shrink-0 mt-0.5">
          {styles.icon}
        </span>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        {title && (
          <p className="text-[var(--text-sm)] font-semibold text-[var(--text-primary)]">
            {title}
          </p>
        )}
        {description && (
          <p className={`text-[var(--text-sm)] text-[var(--text-secondary)] ${title ? 'mt-1' : ''}`}>
            {description}
          </p>
        )}
        {action && (
          <button
            type="button"
            onClick={action.onClick}
            className="
              mt-2
              text-[var(--text-sm)] font-medium
              text-[var(--primary-light)]
              hover:text-[var(--primary)]
              transition-colors
            "
          >
            {action.label}
          </button>
        )}
      </div>

      {/* Close button */}
      <button
        type="button"
        onClick={onDismiss}
        className="
          flex-shrink-0
          p-1
          rounded-[var(--radius-sm)]
          text-[var(--text-muted)]
          hover:text-[var(--text-primary)]
          hover:bg-[var(--bg-surface-hover)]
          transition-colors
        "
        aria-label="Dismiss"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

export default ToastProvider;
