'use client';

import {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
  useCallback,
  type ReactNode,
  type HTMLAttributes,
} from 'react';

// Types
export interface SelectOption {
  value: string;
  label: string;
  icon?: ReactNode;
  disabled?: boolean;
}

// Context
interface SelectContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  highlightedIndex: number;
  setHighlightedIndex: (index: number) => void;
}

const SelectContext = createContext<SelectContextValue | null>(null);

function useSelectContext() {
  const context = useContext(SelectContext);
  if (!context) {
    throw new Error('Select compound components must be used within a Select component');
  }
  return context;
}

// Main Select
export type SelectSize = 'sm' | 'md' | 'lg';

export interface SelectProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  size?: SelectSize;
  disabled?: boolean;
  error?: boolean;
  label?: string;
  hint?: string;
  errorMessage?: string;
}

const sizeStyles: Record<SelectSize, { trigger: string; option: string }> = {
  sm: {
    trigger: 'px-3 py-1.5 text-[var(--text-sm)]',
    option: 'px-3 py-1.5 text-[var(--text-sm)]',
  },
  md: {
    trigger: 'px-3 py-2 text-[var(--text-sm)]',
    option: 'px-3 py-2 text-[var(--text-sm)]',
  },
  lg: {
    trigger: 'px-4 py-2.5 text-[var(--text-base)]',
    option: 'px-4 py-2.5 text-[var(--text-base)]',
  },
};

export function Select({
  className = '',
  value: controlledValue,
  defaultValue = '',
  onChange,
  options,
  placeholder = 'Select an option',
  size = 'md',
  disabled = false,
  error = false,
  label,
  hint,
  errorMessage,
  ...props
}: SelectProps) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const value = controlledValue !== undefined ? controlledValue : internalValue;

  const handleChange = useCallback((newValue: string) => {
    if (controlledValue === undefined) {
      setInternalValue(newValue);
    }
    onChange?.(newValue);
    setOpen(false);
    triggerRef.current?.focus();
  }, [controlledValue, onChange]);

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const enabledOptions = options.filter((opt) => !opt.disabled);

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setHighlightedIndex((prev) => {
            const next = prev + 1;
            return next >= enabledOptions.length ? 0 : next;
          });
          break;
        case 'ArrowUp':
          e.preventDefault();
          setHighlightedIndex((prev) => {
            const next = prev - 1;
            return next < 0 ? enabledOptions.length - 1 : next;
          });
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          if (highlightedIndex >= 0 && highlightedIndex < enabledOptions.length) {
            handleChange(enabledOptions[highlightedIndex].value);
          }
          break;
        case 'Escape':
          e.preventDefault();
          setOpen(false);
          triggerRef.current?.focus();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, options, highlightedIndex, handleChange]);

  // Close on click outside
  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        triggerRef.current &&
        !triggerRef.current.contains(target) &&
        listRef.current &&
        !listRef.current.contains(target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  // Reset highlight on open
  useEffect(() => {
    if (open) {
      const currentIndex = options.findIndex((opt) => opt.value === value);
      setHighlightedIndex(currentIndex >= 0 ? currentIndex : 0);
    }
  }, [open, options, value]);

  const selectedOption = options.find((opt) => opt.value === value);
  const styles = sizeStyles[size];

  return (
    <SelectContext.Provider
      value={{
        open,
        setOpen,
        value,
        onChange: handleChange,
        options,
        highlightedIndex,
        setHighlightedIndex,
      }}
    >
      <div className={`relative ${className}`} {...props}>
        {/* Label */}
        {label && (
          <label className="block mb-1.5 text-[var(--text-sm)] font-medium text-[var(--text-primary)]">
            {label}
          </label>
        )}

        {/* Trigger */}
        <button
          ref={triggerRef}
          type="button"
          role="combobox"
          aria-expanded={open}
          aria-haspopup="listbox"
          disabled={disabled}
          onClick={() => !disabled && setOpen(!open)}
          className={`
            w-full
            flex items-center justify-between gap-2
            ${styles.trigger}
            bg-[var(--bg-subtle)]
            border rounded-[var(--radius-md)]
            text-left
            transition-all duration-[var(--duration-normal)]
            ${error
              ? 'border-[var(--status-declined)] focus:ring-[var(--status-declined)]'
              : 'border-[var(--border-default)] focus:border-[var(--primary)] focus:ring-[var(--primary)]'
            }
            ${disabled
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:border-[var(--border-active)] cursor-pointer'
            }
            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--bg-base)]
          `.trim().replace(/\s+/g, ' ')}
        >
          <span className="flex items-center gap-2 min-w-0">
            {selectedOption?.icon && (
              <span className="flex-shrink-0">{selectedOption.icon}</span>
            )}
            <span className={`truncate ${!selectedOption ? 'text-[var(--text-muted)]' : 'text-[var(--text-primary)]'}`}>
              {selectedOption?.label || placeholder}
            </span>
          </span>
          <svg
            className={`
              w-4 h-4 flex-shrink-0
              text-[var(--text-muted)]
              transition-transform duration-[var(--duration-normal)]
              ${open ? 'rotate-180' : ''}
            `}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Dropdown */}
        {open && (
          <div
            ref={listRef}
            role="listbox"
            className="
              absolute z-[var(--z-dropdown)]
              w-full mt-1
              py-1
              bg-[var(--bg-elevated)]
              border border-[var(--border-default)]
              rounded-[var(--radius-lg)]
              shadow-[var(--shadow-lg)]
              max-h-60 overflow-y-auto
              animate-fade-in
            "
          >
            {options.map((option, index) => (
              <button
                key={option.value}
                role="option"
                type="button"
                aria-selected={option.value === value}
                disabled={option.disabled}
                onClick={() => !option.disabled && handleChange(option.value)}
                onMouseEnter={() => !option.disabled && setHighlightedIndex(index)}
                className={`
                  w-full
                  flex items-center gap-2
                  ${styles.option}
                  text-left
                  transition-colors duration-[var(--duration-fast)]
                  ${option.value === value
                    ? 'bg-[var(--primary-muted)] text-[var(--primary-light)]'
                    : highlightedIndex === index
                      ? 'bg-[var(--bg-surface-hover)] text-[var(--text-primary)]'
                      : 'text-[var(--text-primary)]'
                  }
                  ${option.disabled
                    ? 'opacity-50 cursor-not-allowed'
                    : 'cursor-pointer'
                  }
                `.trim().replace(/\s+/g, ' ')}
              >
                {option.icon && (
                  <span className="flex-shrink-0">{option.icon}</span>
                )}
                <span className="flex-1 truncate">{option.label}</span>
                {option.value === value && (
                  <svg
                    className="w-4 h-4 flex-shrink-0 text-[var(--primary)]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Hint/Error */}
        {(hint || errorMessage) && (
          <p className={`mt-1.5 text-[var(--text-xs)] ${error ? 'text-[var(--status-declined)]' : 'text-[var(--text-muted)]'}`}>
            {error ? errorMessage : hint}
          </p>
        )}
      </div>
    </SelectContext.Provider>
  );
}

export default Select;
