'use client';

import { type HTMLAttributes } from 'react';

export type ProgressVariant = 'default' | 'success' | 'warning' | 'danger' | 'capacity';
export type ProgressSize = 'sm' | 'md' | 'lg';

export interface ProgressProps extends HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  variant?: ProgressVariant;
  size?: ProgressSize;
  showLabel?: boolean;
  labelPosition?: 'inside' | 'outside' | 'top';
  label?: string;
  animated?: boolean;
  striped?: boolean;
}

const sizeStyles: Record<ProgressSize, string> = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-4',
};

const variantStyles: Record<ProgressVariant, string> = {
  default: 'bg-[var(--primary)]',
  success: 'bg-[var(--status-going)]',
  warning: 'bg-[var(--status-pending)]',
  danger: 'bg-[var(--status-declined)]',
  capacity: '', // Dynamic based on value
};

function getCapacityColor(percentage: number): string {
  if (percentage >= 90) return 'bg-[var(--status-declined)]';
  if (percentage >= 70) return 'bg-[var(--status-pending)]';
  return 'bg-[var(--status-going)]';
}

export function Progress({
  className = '',
  value,
  max = 100,
  variant = 'default',
  size = 'md',
  showLabel = false,
  labelPosition = 'outside',
  label,
  animated = false,
  striped = false,
  ...props
}: ProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const displayLabel = label ?? `${Math.round(percentage)}%`;

  const barColor = variant === 'capacity'
    ? getCapacityColor(percentage)
    : variantStyles[variant];

  return (
    <div className={`w-full ${className}`} {...props}>
      {/* Top label */}
      {showLabel && labelPosition === 'top' && (
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-[var(--text-sm)] text-[var(--text-primary)]">
            {displayLabel}
          </span>
          {variant === 'capacity' && (
            <span className="text-[var(--text-xs)] text-[var(--text-muted)]">
              {value}/{max}
            </span>
          )}
        </div>
      )}

      {/* Progress container */}
      <div className="flex items-center gap-3">
        {/* Track */}
        <div
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
          className={`
            flex-1
            ${sizeStyles[size]}
            bg-[var(--bg-muted)]
            rounded-full
            overflow-hidden
          `}
        >
          {/* Bar */}
          <div
            className={`
              h-full
              ${barColor}
              rounded-full
              transition-all duration-[var(--duration-slow)] ease-[var(--ease-out)]
              ${striped ? 'bg-stripes' : ''}
              ${animated ? 'animate-progress-stripes' : ''}
            `}
            style={{ width: `${percentage}%` }}
          >
            {/* Inside label */}
            {showLabel && labelPosition === 'inside' && size === 'lg' && (
              <span className="flex items-center justify-center h-full text-[10px] font-semibold text-white">
                {displayLabel}
              </span>
            )}
          </div>
        </div>

        {/* Outside label */}
        {showLabel && labelPosition === 'outside' && (
          <span className="flex-shrink-0 text-[var(--text-sm)] text-[var(--text-primary)] tabular-nums">
            {displayLabel}
          </span>
        )}
      </div>
    </div>
  );
}

// Capacity variant with specific styling
export interface CapacityBarProps extends Omit<ProgressProps, 'variant' | 'value' | 'max'> {
  current: number;
  capacity: number;
}

export function CapacityBar({
  current,
  capacity,
  ...props
}: CapacityBarProps) {
  return (
    <Progress
      {...props}
      value={current}
      max={capacity}
      variant="capacity"
      showLabel
      labelPosition="top"
      label={`${current} of ${capacity}`}
    />
  );
}

// Multi-segment progress (for showing multiple states)
export interface ProgressSegment {
  value: number;
  color: string;
  label?: string;
}

export interface MultiProgressProps extends HTMLAttributes<HTMLDivElement> {
  segments: ProgressSegment[];
  max?: number;
  size?: ProgressSize;
  showLegend?: boolean;
}

export function MultiProgress({
  className = '',
  segments,
  max,
  size = 'md',
  showLegend = false,
  ...props
}: MultiProgressProps) {
  const total = max ?? segments.reduce((sum, seg) => sum + seg.value, 0);

  return (
    <div className={`w-full ${className}`} {...props}>
      {/* Track */}
      <div
        className={`
          w-full
          ${sizeStyles[size]}
          bg-[var(--bg-muted)]
          rounded-full
          overflow-hidden
          flex
        `}
      >
        {segments.map((segment, index) => {
          const percentage = (segment.value / total) * 100;
          return (
            <div
              key={index}
              className={`
                h-full
                ${segment.color}
                ${index === 0 ? 'rounded-l-full' : ''}
                ${index === segments.length - 1 ? 'rounded-r-full' : ''}
              `}
              style={{ width: `${percentage}%` }}
            />
          );
        })}
      </div>

      {/* Legend */}
      {showLegend && (
        <div className="flex flex-wrap gap-4 mt-2">
          {segments.map((segment, index) => (
            <div key={index} className="flex items-center gap-1.5">
              <span
                className={`w-2.5 h-2.5 rounded-full ${segment.color}`}
              />
              <span className="text-[var(--text-xs)] text-[var(--text-secondary)]">
                {segment.label ?? segment.value}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Progress;
