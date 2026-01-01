'use client';

import { type HTMLAttributes, type ReactNode } from 'react';
import Link from 'next/link';

export interface SidebarItem {
  id: string;
  label: string;
  href?: string;
  icon?: ReactNode;
  badge?: ReactNode;
  active?: boolean;
  onClick?: () => void;
}

export interface SidebarSection {
  title?: string;
  items: SidebarItem[];
}

export interface SidebarProps extends HTMLAttributes<HTMLElement> {
  sections: SidebarSection[];
  header?: ReactNode;
  footer?: ReactNode;
  collapsed?: boolean;
}

export function Sidebar({
  className = '',
  sections,
  header,
  footer,
  collapsed = false,
  ...props
}: SidebarProps) {
  return (
    <aside
      className={`
        flex flex-col
        ${collapsed ? 'w-16' : 'w-[var(--width-sidebar)]'}
        h-full
        bg-[var(--bg-elevated)]
        border-r border-[var(--border-subtle)]
        transition-all duration-[var(--duration-slow)]
        ${className}
      `.trim().replace(/\s+/g, ' ')}
      {...props}
    >
      {/* Header */}
      {header && (
        <div className="flex-shrink-0 p-4 border-b border-[var(--border-subtle)]">
          {header}
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-2">
        {sections.map((section, sectionIndex) => (
          <div key={sectionIndex} className={sectionIndex > 0 ? 'mt-6' : ''}>
            {section.title && !collapsed && (
              <h3 className="px-3 mb-2 text-[var(--text-xs)] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                {section.title}
              </h3>
            )}
            <ul className="space-y-1">
              {section.items.map((item) => {
                const ItemContent = (
                  <>
                    {item.icon && (
                      <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
                        {item.icon}
                      </span>
                    )}
                    {!collapsed && (
                      <>
                        <span className="flex-1 truncate">{item.label}</span>
                        {item.badge && (
                          <span className="flex-shrink-0">{item.badge}</span>
                        )}
                      </>
                    )}
                  </>
                );

                const itemClassName = `
                  w-full
                  flex items-center gap-3
                  px-3 py-2
                  text-[var(--text-sm)] font-medium
                  rounded-[var(--radius-md)]
                  transition-colors duration-[var(--duration-normal)]
                  ${item.active
                    ? 'bg-[var(--primary-muted)] text-[var(--primary-light)]'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)]'
                  }
                  ${collapsed ? 'justify-center' : ''}
                `.trim().replace(/\s+/g, ' ');

                return (
                  <li key={item.id}>
                    {item.href ? (
                      <Link href={item.href} className={itemClassName}>
                        {ItemContent}
                      </Link>
                    ) : (
                      <button
                        type="button"
                        onClick={item.onClick}
                        className={itemClassName}
                      >
                        {ItemContent}
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer */}
      {footer && (
        <div className="flex-shrink-0 p-4 border-t border-[var(--border-subtle)]">
          {footer}
        </div>
      )}
    </aside>
  );
}

export default Sidebar;
