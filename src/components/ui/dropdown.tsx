'use client';

import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
  useCallback,
  isValidElement,
  cloneElement,
  type ReactNode,
  type HTMLAttributes,
  type ButtonHTMLAttributes,
} from 'react';

// Context
interface DropdownContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
}

const DropdownContext = createContext<DropdownContextValue | null>(null);

function useDropdownContext() {
  const context = useContext(DropdownContext);
  if (!context) {
    throw new Error('Dropdown compound components must be used within a Dropdown component');
  }
  return context;
}

// Root Dropdown
export interface DropdownProps {
  children: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function Dropdown({
  children,
  open: controlledOpen,
  onOpenChange,
}: DropdownProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;

  const setOpen = useCallback((newOpen: boolean) => {
    if (controlledOpen === undefined) {
      setInternalOpen(newOpen);
    }
    onOpenChange?.(newOpen);
  }, [controlledOpen, onOpenChange]);

  // Close on escape
  useEffect(() => {
    if (!open) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open, setOpen]);

  // Close on click outside
  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (triggerRef.current && !triggerRef.current.contains(target)) {
        // Check if click is inside the content
        const content = document.querySelector('[data-dropdown-content]');
        if (content && !content.contains(target)) {
          setOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open, setOpen]);

  return (
    <DropdownContext.Provider value={{ open, setOpen, triggerRef }}>
      <div className="relative inline-block">
        {children}
      </div>
    </DropdownContext.Provider>
  );
}

// Trigger
export interface DropdownTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

export function DropdownTrigger({
  className = '',
  children,
  asChild = false,
  ...props
}: DropdownTriggerProps) {
  const { open, setOpen, triggerRef } = useDropdownContext();

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setOpen(!open);
  }, [open, setOpen]);

  // If asChild is true, clone the child and add trigger props
  if (asChild && isValidElement(children)) {
    const child = children as React.ReactElement<{
      onClick?: (e: React.MouseEvent) => void;
      className?: string;
    }>;

    return cloneElement(child, {
      ref: (node: HTMLButtonElement | null) => {
        // Assign to our ref
        (triggerRef as React.MutableRefObject<HTMLButtonElement | null>).current = node;
      },
      'aria-haspopup': 'menu' as const,
      'aria-expanded': open,
      onClick: (e: React.MouseEvent) => {
        handleClick(e);
        // Call original onClick if it exists
        if (child.props.onClick) {
          child.props.onClick(e);
        }
      },
    });
  }

  return (
    <button
      ref={triggerRef}
      type="button"
      aria-haspopup="menu"
      aria-expanded={open}
      onClick={handleClick}
      className={className}
      {...props}
    >
      {children}
    </button>
  );
}

// Content
export type DropdownAlign = 'start' | 'center' | 'end';
export type DropdownSide = 'top' | 'bottom';

export interface DropdownContentProps extends HTMLAttributes<HTMLDivElement> {
  align?: DropdownAlign;
  side?: DropdownSide;
  sideOffset?: number;
}

const alignStyles: Record<DropdownAlign, string> = {
  start: 'left-0',
  center: 'left-1/2 -translate-x-1/2',
  end: 'right-0',
};

const sideStyles: Record<DropdownSide, string> = {
  top: 'bottom-full mb-1',
  bottom: 'top-full mt-1',
};

export function DropdownContent({
  className = '',
  align = 'start',
  side = 'bottom',
  children,
  ...props
}: DropdownContentProps) {
  const { open } = useDropdownContext();

  if (!open) return null;

  return (
    <div
      data-dropdown-content
      role="menu"
      className={`
        absolute
        ${alignStyles[align]}
        ${sideStyles[side]}
        z-[var(--z-dropdown)]
        min-w-[180px]
        py-1
        bg-[var(--bg-elevated)]
        border border-[var(--border-default)]
        rounded-[var(--radius-lg)]
        shadow-[var(--shadow-lg)]
        animate-fade-in
        ${className}
      `.trim().replace(/\s+/g, ' ')}
      {...props}
    >
      {children}
    </div>
  );
}

// Item
export interface DropdownItemProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: ReactNode;
  shortcut?: string;
  destructive?: boolean;
}

export function DropdownItem({
  className = '',
  icon,
  shortcut,
  destructive = false,
  disabled = false,
  children,
  onClick,
  ...props
}: DropdownItemProps) {
  const { setOpen } = useDropdownContext();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled) {
      onClick?.(e);
      setOpen(false);
    }
  };

  return (
    <button
      role="menuitem"
      type="button"
      disabled={disabled}
      onClick={handleClick}
      className={`
        w-full
        flex items-center gap-3
        px-3 py-2
        text-[var(--text-sm)]
        text-left
        transition-colors duration-[var(--duration-fast)]
        ${destructive
          ? 'text-[var(--status-declined)] hover:bg-[var(--status-declined-bg)]'
          : 'text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)]'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `.trim().replace(/\s+/g, ' ')}
      {...props}
    >
      {icon && (
        <span className="flex-shrink-0 w-4 h-4 flex items-center justify-center">
          {icon}
        </span>
      )}
      <span className="flex-1">{children}</span>
      {shortcut && (
        <span className="flex-shrink-0 text-[var(--text-xs)] text-[var(--text-muted)]">
          {shortcut}
        </span>
      )}
    </button>
  );
}

// Separator
export function DropdownSeparator({ className = '' }: { className?: string }) {
  return (
    <div
      role="separator"
      className={`
        my-1
        h-px
        bg-[var(--border-subtle)]
        ${className}
      `}
    />
  );
}

// Label
export function DropdownLabel({
  className = '',
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={`
        px-3 py-1.5
        text-[var(--text-xs)] font-semibold
        text-[var(--text-muted)]
        uppercase tracking-wider
        ${className}
      `}
    >
      {children}
    </div>
  );
}

export default Dropdown;
