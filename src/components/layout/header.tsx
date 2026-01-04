'use client';

import { type HTMLAttributes, type ReactNode } from 'react';
import Link from 'next/link';

export interface NavItem {
  label: string;
  href: string;
  active?: boolean;
  icon?: ReactNode;
}

export interface HeaderProps extends HTMLAttributes<HTMLElement> {
  logo?: ReactNode;
  logoHref?: string;
  navItems?: NavItem[];
  actions?: ReactNode;
  sticky?: boolean;
  transparent?: boolean;
}

export function Header({
  className = '',
  logo,
  logoHref = '/',
  navItems = [],
  actions,
  sticky = true,
  transparent = false,
  ...props
}: HeaderProps) {
  return (
    <header
      className={`
        w-full
        h-[var(--height-header)]
        ${sticky ? 'sticky top-0 z-[var(--z-header)]' : ''}
        ${transparent
          ? 'bg-transparent'
          : 'bg-[var(--bg-base)]/80 backdrop-blur-md border-b border-[var(--border-subtle)]'
        }
        ${className}
      `.trim().replace(/\s+/g, ' ')}
      {...props}
    >
      <div className="h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Logo */}
        <div className="flex-shrink-0">
          <Link
            href={logoHref}
            className="flex items-center gap-2 text-[var(--text-primary)] hover:opacity-80 transition-opacity"
          >
            {logo || (
              <span className="text-[var(--text-xl)] font-bold tracking-tight">
                <strong><em>SMS</em></strong>
              </span>
            )}
          </Link>
        </div>

        {/* Navigation */}
        {navItems.length > 0 && (
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  inline-flex items-center gap-2
                  px-3 py-2
                  text-[var(--text-sm)] font-medium
                  rounded-[var(--radius-md)]
                  transition-colors duration-[var(--duration-normal)]
                  ${item.active
                    ? 'text-[var(--text-primary)] bg-[var(--bg-surface)]'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)]'
                  }
                `}
              >
                {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
                {item.label}
              </Link>
            ))}
          </nav>
        )}

        {/* Actions */}
        {actions && (
          <div className="flex items-center gap-3">
            {actions}
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;
