'use client';

import {
  createContext,
  useContext,
  useState,
  type ReactNode,
  type HTMLAttributes,
} from 'react';

// Context
interface TabsContextValue {
  activeTab: string;
  setActiveTab: (value: string) => void;
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabsContext() {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('Tabs compound components must be used within a Tabs component');
  }
  return context;
}

// Root Tabs component
export interface TabsProps extends HTMLAttributes<HTMLDivElement> {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
}

export function Tabs({
  className = '',
  defaultValue = '',
  value,
  onValueChange,
  children,
  ...props
}: TabsProps) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const activeTab = value !== undefined ? value : internalValue;

  const setActiveTab = (newValue: string) => {
    if (value === undefined) {
      setInternalValue(newValue);
    }
    onValueChange?.(newValue);
  };

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={className} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

// Tabs List
export interface TabsListProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'pills' | 'underline';
}

export function TabsList({
  className = '',
  variant = 'default',
  children,
  ...props
}: TabsListProps) {
  const variantStyles = {
    default: `
      inline-flex items-center gap-1
      p-1
      bg-[var(--bg-muted)]
      rounded-[var(--radius-lg)]
    `,
    pills: `
      inline-flex items-center gap-2
    `,
    underline: `
      inline-flex items-center gap-6
      border-b border-[var(--border-default)]
    `,
  };

  return (
    <div
      role="tablist"
      className={`
        ${variantStyles[variant]}
        ${className}
      `.trim().replace(/\s+/g, ' ')}
      {...props}
    >
      {children}
    </div>
  );
}

// Tab Trigger
export interface TabsTriggerProps extends HTMLAttributes<HTMLButtonElement> {
  value: string;
  disabled?: boolean;
  icon?: ReactNode;
  count?: number;
}

export function TabsTrigger({
  className = '',
  value,
  disabled = false,
  icon,
  count,
  children,
  ...props
}: TabsTriggerProps) {
  const { activeTab, setActiveTab } = useTabsContext();
  const isActive = activeTab === value;

  return (
    <button
      role="tab"
      aria-selected={isActive}
      aria-controls={`tabpanel-${value}`}
      tabIndex={isActive ? 0 : -1}
      disabled={disabled}
      onClick={() => setActiveTab(value)}
      className={`
        inline-flex items-center justify-center gap-2
        px-3 py-1.5
        text-[var(--text-sm)] font-medium
        rounded-[var(--radius-md)]
        transition-all duration-[var(--duration-normal)] ease-[var(--ease-out)]
        outline-none
        ${isActive
          ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-[var(--shadow-sm)]'
          : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)]'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-base)]
        ${className}
      `.trim().replace(/\s+/g, ' ')}
      {...props}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
      {count !== undefined && (
        <span
          className={`
            px-1.5 py-0.5
            text-[10px] font-semibold
            rounded-full
            ${isActive
              ? 'bg-[var(--primary-muted)] text-[var(--primary-light)]'
              : 'bg-[var(--bg-subtle)] text-[var(--text-muted)]'
            }
          `}
        >
          {count}
        </span>
      )}
    </button>
  );
}

// Tab Content
export interface TabsContentProps extends HTMLAttributes<HTMLDivElement> {
  value: string;
  forceMount?: boolean;
}

export function TabsContent({
  className = '',
  value,
  forceMount = false,
  children,
  ...props
}: TabsContentProps) {
  const { activeTab } = useTabsContext();
  const isActive = activeTab === value;

  if (!isActive && !forceMount) {
    return null;
  }

  return (
    <div
      role="tabpanel"
      id={`tabpanel-${value}`}
      aria-labelledby={`tab-${value}`}
      hidden={!isActive}
      className={`
        outline-none
        ${isActive ? 'animate-fade-in' : ''}
        ${className}
      `.trim().replace(/\s+/g, ' ')}
      tabIndex={0}
      {...props}
    >
      {children}
    </div>
  );
}

export default Tabs;
