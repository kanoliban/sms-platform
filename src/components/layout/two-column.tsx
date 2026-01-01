'use client';

import { type HTMLAttributes, type ReactNode } from 'react';

export type TwoColumnRatio = '40/60' | '50/50' | '60/40' | '33/67' | '67/33';

export interface TwoColumnProps extends HTMLAttributes<HTMLDivElement> {
  ratio?: TwoColumnRatio;
  gap?: 'sm' | 'md' | 'lg' | 'xl';
  reverseOnMobile?: boolean;
  stackOnMobile?: boolean;
  left: ReactNode;
  right: ReactNode;
}

const ratioStyles: Record<TwoColumnRatio, { left: string; right: string }> = {
  '40/60': { left: 'lg:w-[40%]', right: 'lg:w-[60%]' },
  '50/50': { left: 'lg:w-1/2', right: 'lg:w-1/2' },
  '60/40': { left: 'lg:w-[60%]', right: 'lg:w-[40%]' },
  '33/67': { left: 'lg:w-1/3', right: 'lg:w-2/3' },
  '67/33': { left: 'lg:w-2/3', right: 'lg:w-1/3' },
};

const gapStyles = {
  sm: 'gap-4 lg:gap-4',
  md: 'gap-6 lg:gap-6',
  lg: 'gap-8 lg:gap-8',
  xl: 'gap-10 lg:gap-12',
};

export function TwoColumn({
  className = '',
  ratio = '40/60',
  gap = 'lg',
  reverseOnMobile = false,
  stackOnMobile = true,
  left,
  right,
  ...props
}: TwoColumnProps) {
  const styles = ratioStyles[ratio];

  return (
    <div
      className={`
        flex
        ${stackOnMobile ? 'flex-col lg:flex-row' : 'flex-row'}
        ${reverseOnMobile ? 'flex-col-reverse lg:flex-row' : ''}
        ${gapStyles[gap]}
        ${className}
      `.trim().replace(/\s+/g, ' ')}
      {...props}
    >
      <div
        className={`
          w-full
          ${styles.left}
          flex-shrink-0
        `}
      >
        {left}
      </div>
      <div
        className={`
          w-full
          ${styles.right}
          min-w-0
        `}
      >
        {right}
      </div>
    </div>
  );
}

export default TwoColumn;
