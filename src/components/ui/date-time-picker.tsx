'use client';

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  type HTMLAttributes,
} from 'react';

export interface DateTimePickerProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  value?: Date;
  onChange?: (date: Date | null) => void;
  minDate?: Date;
  maxDate?: Date;
  showTime?: boolean;
  timeStep?: number; // minutes
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  label?: string;
  hint?: string;
  errorMessage?: string;
  clearable?: boolean;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

function formatDate(date: Date, includeTime: boolean): string {
  const month = (MONTHS[date.getMonth()] ?? 'Jan').slice(0, 3);
  const day = date.getDate();
  const year = date.getFullYear();

  if (!includeTime) {
    return `${month} ${day}, ${year}`;
  }

  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const hour12 = hours % 12 || 12;
  const minuteStr = minutes.toString().padStart(2, '0');

  return `${month} ${day}, ${year} at ${hour12}:${minuteStr} ${ampm}`;
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

export function DateTimePicker({
  className = '',
  value,
  onChange,
  minDate,
  maxDate,
  showTime = true,
  timeStep = 15,
  placeholder = 'Select date & time',
  disabled = false,
  error = false,
  label,
  hint,
  errorMessage,
  clearable = true,
  ...props
}: DateTimePickerProps) {
  const [open, setOpen] = useState(false);
  const [viewDate, setViewDate] = useState(value || new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(value || null);
  const [selectedHour, setSelectedHour] = useState(value ? value.getHours() % 12 || 12 : 12);
  const [selectedMinute, setSelectedMinute] = useState(value ? value.getMinutes() : 0);
  const [selectedAmPm, setSelectedAmPm] = useState<'AM' | 'PM'>(
    value ? (value.getHours() >= 12 ? 'PM' : 'AM') : 'AM'
  );

  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        triggerRef.current &&
        !triggerRef.current.contains(target) &&
        popoverRef.current &&
        !popoverRef.current.contains(target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

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
  }, [open]);

  const handleDateSelect = useCallback((day: number) => {
    const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);

    if (showTime) {
      let hours = selectedHour;
      if (selectedAmPm === 'PM' && hours !== 12) hours += 12;
      if (selectedAmPm === 'AM' && hours === 12) hours = 0;
      newDate.setHours(hours, selectedMinute);
    }

    setSelectedDate(newDate);
    onChange?.(newDate);

    if (!showTime) {
      setOpen(false);
    }
  }, [viewDate, showTime, selectedHour, selectedMinute, selectedAmPm, onChange]);

  const handleTimeChange = useCallback(() => {
    if (!selectedDate) return;

    let hours = selectedHour;
    if (selectedAmPm === 'PM' && hours !== 12) hours += 12;
    if (selectedAmPm === 'AM' && hours === 12) hours = 0;

    const newDate = new Date(selectedDate);
    newDate.setHours(hours, selectedMinute);

    setSelectedDate(newDate);
    onChange?.(newDate);
  }, [selectedDate, selectedHour, selectedMinute, selectedAmPm, onChange]);

  useEffect(() => {
    if (selectedDate && showTime) {
      handleTimeChange();
    }
  }, [selectedHour, selectedMinute, selectedAmPm]);

  const handlePrevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedDate(null);
    onChange?.(null);
  };

  const isDateDisabled = (day: number): boolean => {
    const date = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    return false;
  };

  const isToday = (day: number): boolean => {
    const today = new Date();
    return (
      today.getDate() === day &&
      today.getMonth() === viewDate.getMonth() &&
      today.getFullYear() === viewDate.getFullYear()
    );
  };

  const isSelected = (day: number): boolean => {
    if (!selectedDate) return false;
    return (
      selectedDate.getDate() === day &&
      selectedDate.getMonth() === viewDate.getMonth() &&
      selectedDate.getFullYear() === viewDate.getFullYear()
    );
  };

  const daysInMonth = getDaysInMonth(viewDate.getFullYear(), viewDate.getMonth());
  const firstDay = getFirstDayOfMonth(viewDate.getFullYear(), viewDate.getMonth());
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: firstDay }, (_, i) => i);

  // Generate time options
  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutes = Array.from({ length: 60 / timeStep }, (_, i) => i * timeStep);

  return (
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
        disabled={disabled}
        onClick={() => !disabled && setOpen(!open)}
        className={`
          w-full
          flex items-center gap-2
          px-3 py-2
          bg-[var(--bg-subtle)]
          border rounded-[var(--radius-md)]
          text-[var(--text-sm)] text-left
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
        {/* Calendar icon */}
        <svg
          className="w-5 h-5 flex-shrink-0 text-[var(--text-muted)]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
          />
        </svg>

        {/* Value */}
        <span className={`flex-1 truncate ${!selectedDate ? 'text-[var(--text-muted)]' : 'text-[var(--text-primary)]'}`}>
          {selectedDate ? formatDate(selectedDate, showTime) : placeholder}
        </span>

        {/* Clear button */}
        {clearable && selectedDate && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className="
              p-0.5
              rounded-full
              text-[var(--text-muted)]
              hover:text-[var(--text-primary)]
              hover:bg-[var(--bg-surface-hover)]
            "
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </button>

      {/* Popover */}
      {open && (
        <div
          ref={popoverRef}
          className="
            absolute z-[var(--z-dropdown)]
            mt-1 left-0
            p-4
            bg-[var(--bg-elevated)]
            border border-[var(--border-default)]
            rounded-[var(--radius-xl)]
            shadow-[var(--shadow-xl)]
            animate-fade-in
          "
        >
          {/* Calendar */}
          <div className="w-[280px]">
            {/* Month navigation */}
            <div className="flex items-center justify-between mb-4">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="
                  p-1.5
                  rounded-[var(--radius-md)]
                  text-[var(--text-muted)]
                  hover:text-[var(--text-primary)]
                  hover:bg-[var(--bg-surface-hover)]
                "
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <span className="text-[var(--text-sm)] font-semibold text-[var(--text-primary)]">
                {MONTHS[viewDate.getMonth()]} {viewDate.getFullYear()}
              </span>
              <button
                type="button"
                onClick={handleNextMonth}
                className="
                  p-1.5
                  rounded-[var(--radius-md)]
                  text-[var(--text-muted)]
                  hover:text-[var(--text-primary)]
                  hover:bg-[var(--bg-surface-hover)]
                "
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Days header */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {DAYS.map((day) => (
                <div
                  key={day}
                  className="text-center text-[var(--text-xs)] font-medium text-[var(--text-muted)] py-1"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Days grid */}
            <div className="grid grid-cols-7 gap-1">
              {emptyDays.map((_, i) => (
                <div key={`empty-${i}`} />
              ))}
              {days.map((day) => {
                const isDisabled = isDateDisabled(day);
                return (
                  <button
                    key={day}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => !isDisabled && handleDateSelect(day)}
                    className={`
                      w-9 h-9
                      flex items-center justify-center
                      text-[var(--text-sm)]
                      rounded-full
                      transition-colors duration-[var(--duration-fast)]
                      ${isSelected(day)
                        ? 'bg-[var(--primary)] text-white font-semibold'
                        : isToday(day)
                          ? 'bg-[var(--primary-muted)] text-[var(--primary-light)] font-medium'
                          : 'text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)]'
                      }
                      ${isDisabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}
                    `.trim().replace(/\s+/g, ' ')}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time picker */}
          {showTime && (
            <div className="mt-4 pt-4 border-t border-[var(--border-subtle)]">
              <div className="flex items-center justify-center gap-2">
                {/* Hour */}
                <select
                  value={selectedHour}
                  onChange={(e) => setSelectedHour(Number(e.target.value))}
                  className="
                    px-2 py-1.5
                    bg-[var(--bg-subtle)]
                    border border-[var(--border-default)]
                    rounded-[var(--radius-md)]
                    text-[var(--text-sm)] text-[var(--text-primary)]
                    focus:outline-none focus:border-[var(--primary)]
                  "
                >
                  {hours.map((h) => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>

                <span className="text-[var(--text-primary)] font-medium">:</span>

                {/* Minute */}
                <select
                  value={selectedMinute}
                  onChange={(e) => setSelectedMinute(Number(e.target.value))}
                  className="
                    px-2 py-1.5
                    bg-[var(--bg-subtle)]
                    border border-[var(--border-default)]
                    rounded-[var(--radius-md)]
                    text-[var(--text-sm)] text-[var(--text-primary)]
                    focus:outline-none focus:border-[var(--primary)]
                  "
                >
                  {minutes.map((m) => (
                    <option key={m} value={m}>{m.toString().padStart(2, '0')}</option>
                  ))}
                </select>

                {/* AM/PM */}
                <select
                  value={selectedAmPm}
                  onChange={(e) => setSelectedAmPm(e.target.value as 'AM' | 'PM')}
                  className="
                    px-2 py-1.5
                    bg-[var(--bg-subtle)]
                    border border-[var(--border-default)]
                    rounded-[var(--radius-md)]
                    text-[var(--text-sm)] text-[var(--text-primary)]
                    focus:outline-none focus:border-[var(--primary)]
                  "
                >
                  <option value="AM">AM</option>
                  <option value="PM">PM</option>
                </select>
              </div>
            </div>
          )}

          {/* Done button */}
          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="
                px-4 py-2
                bg-[var(--primary)]
                text-white
                text-[var(--text-sm)] font-medium
                rounded-[var(--radius-md)]
                hover:bg-[var(--primary-hover)]
                transition-colors
              "
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Hint/Error */}
      {(hint || errorMessage) && (
        <p className={`mt-1.5 text-[var(--text-xs)] ${error ? 'text-[var(--status-declined)]' : 'text-[var(--text-muted)]'}`}>
          {error ? errorMessage : hint}
        </p>
      )}
    </div>
  );
}

export default DateTimePicker;
