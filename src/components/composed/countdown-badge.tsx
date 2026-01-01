'use client';

import { useState, useEffect, type HTMLAttributes } from 'react';

export interface CountdownBadgeProps extends HTMLAttributes<HTMLDivElement> {
  targetDate: Date | string;
  variant?: 'default' | 'live' | 'minimal';
  size?: 'sm' | 'md' | 'lg';
  showSeconds?: boolean;
  onComplete?: () => void;
  prefix?: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}

function calculateTimeLeft(targetDate: Date): TimeLeft {
  const now = new Date();
  const difference = targetDate.getTime() - now.getTime();

  if (difference <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
  }

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / 1000 / 60) % 60),
    seconds: Math.floor((difference / 1000) % 60),
    total: difference,
  };
}

function formatTimeUnit(value: number, unit: string): string {
  return `${value}${unit}`;
}

const sizeStyles = {
  sm: {
    container: 'px-2 py-1 text-[10px]',
    unit: 'font-semibold',
    separator: 'mx-0.5',
  },
  md: {
    container: 'px-3 py-1.5 text-[var(--text-xs)]',
    unit: 'font-semibold',
    separator: 'mx-1',
  },
  lg: {
    container: 'px-4 py-2 text-[var(--text-sm)]',
    unit: 'font-bold',
    separator: 'mx-1.5',
  },
};

const variantStyles = {
  default: {
    container: 'bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-[var(--text-primary)]',
    highlight: 'text-[var(--primary-light)]',
  },
  live: {
    container: 'bg-[var(--status-live-bg)] border border-[var(--status-live-border)] text-[var(--status-live)]',
    highlight: 'text-[var(--status-live)]',
  },
  minimal: {
    container: 'text-[var(--text-secondary)]',
    highlight: 'text-[var(--text-primary)]',
  },
};

export function CountdownBadge({
  className = '',
  targetDate,
  variant = 'default',
  size = 'md',
  showSeconds = false,
  onComplete,
  prefix = 'Starting in',
  ...props
}: CountdownBadgeProps) {
  const target = typeof targetDate === 'string' ? new Date(targetDate) : targetDate;
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(calculateTimeLeft(target));
  const [hasCompleted, setHasCompleted] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft(target);
      setTimeLeft(newTimeLeft);

      if (newTimeLeft.total <= 0 && !hasCompleted) {
        setHasCompleted(true);
        onComplete?.();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [target, hasCompleted, onComplete]);

  const sizeStyle = sizeStyles[size];
  const variantStyle = variantStyles[variant];

  // If countdown is complete
  if (timeLeft.total <= 0) {
    return (
      <div
        className={`
          inline-flex items-center
          ${sizeStyle.container}
          ${variantStyles.live.container}
          rounded-full
          ${className}
        `.trim().replace(/\s+/g, ' ')}
        {...props}
      >
        <span className="w-2 h-2 rounded-full bg-[var(--status-live)] animate-pulse mr-2" />
        <span className={sizeStyle.unit}>Live Now</span>
      </div>
    );
  }

  // Build countdown string
  const parts: { value: number; unit: string }[] = [];

  if (timeLeft.days > 0) {
    parts.push({ value: timeLeft.days, unit: 'd' });
  }
  if (timeLeft.hours > 0 || timeLeft.days > 0) {
    parts.push({ value: timeLeft.hours, unit: 'h' });
  }
  if (timeLeft.minutes > 0 || timeLeft.hours > 0 || timeLeft.days > 0) {
    parts.push({ value: timeLeft.minutes, unit: 'm' });
  }
  if (showSeconds) {
    parts.push({ value: timeLeft.seconds, unit: 's' });
  }

  return (
    <div
      className={`
        inline-flex items-center
        ${sizeStyle.container}
        ${variantStyle.container}
        rounded-full
        ${className}
      `.trim().replace(/\s+/g, ' ')}
      {...props}
    >
      {prefix && (
        <span className="opacity-75 mr-1.5">{prefix}</span>
      )}
      <span className="flex items-center">
        {parts.map((part, index) => (
          <span key={part.unit} className="flex items-center">
            <span className={`${sizeStyle.unit} ${variantStyle.highlight}`}>
              {part.value}
            </span>
            <span className="opacity-75">{part.unit}</span>
            {index < parts.length - 1 && (
              <span className={sizeStyle.separator} />
            )}
          </span>
        ))}
      </span>
    </div>
  );
}

// Countdown Display - larger format for event pages
export interface CountdownDisplayProps extends HTMLAttributes<HTMLDivElement> {
  targetDate: Date | string;
  title?: string;
  onComplete?: () => void;
}

export function CountdownDisplay({
  className = '',
  targetDate,
  title,
  onComplete,
  ...props
}: CountdownDisplayProps) {
  const target = typeof targetDate === 'string' ? new Date(targetDate) : targetDate;
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(calculateTimeLeft(target));
  const [hasCompleted, setHasCompleted] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft(target);
      setTimeLeft(newTimeLeft);

      if (newTimeLeft.total <= 0 && !hasCompleted) {
        setHasCompleted(true);
        onComplete?.();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [target, hasCompleted, onComplete]);

  if (timeLeft.total <= 0) {
    return (
      <div className={`text-center ${className}`} {...props}>
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--status-live-bg)] rounded-full">
          <span className="w-3 h-3 rounded-full bg-[var(--status-live)] animate-pulse" />
          <span className="text-[var(--text-lg)] font-bold text-[var(--status-live)]">
            Live Now
          </span>
        </div>
      </div>
    );
  }

  const units = [
    { value: timeLeft.days, label: 'Days' },
    { value: timeLeft.hours, label: 'Hours' },
    { value: timeLeft.minutes, label: 'Minutes' },
    { value: timeLeft.seconds, label: 'Seconds' },
  ];

  return (
    <div className={`text-center ${className}`} {...props}>
      {title && (
        <p className="text-[var(--text-sm)] text-[var(--text-muted)] mb-4">
          {title}
        </p>
      )}
      <div className="flex items-center justify-center gap-4">
        {units.map((unit, index) => (
          <div key={unit.label} className="flex items-center gap-4">
            <div className="flex flex-col items-center">
              <span className="text-[var(--text-3xl)] font-bold text-[var(--text-primary)] tabular-nums">
                {unit.value.toString().padStart(2, '0')}
              </span>
              <span className="text-[var(--text-xs)] text-[var(--text-muted)] uppercase tracking-wider">
                {unit.label}
              </span>
            </div>
            {index < units.length - 1 && (
              <span className="text-[var(--text-2xl)] text-[var(--text-muted)] font-light">
                :
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default CountdownBadge;
