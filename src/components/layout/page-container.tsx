'use client';

import { type HTMLAttributes } from 'react';

export type PageContainerSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

export interface PageContainerProps extends HTMLAttributes<HTMLDivElement> {
  size?: PageContainerSize;
  padded?: boolean;
  centered?: boolean;
}

const sizeStyles: Record<PageContainerSize, string> = {
  sm: 'max-w-2xl',      // 672px
  md: 'max-w-4xl',      // 896px
  lg: 'max-w-6xl',      // 1152px - matches Lu.ma's ~960px content
  xl: 'max-w-7xl',      // 1280px
  full: 'max-w-full',
};

export function PageContainer({
  className = '',
  size = 'lg',
  padded = true,
  centered = true,
  children,
  ...props
}: PageContainerProps) {
  return (
    <div
      className={`
        w-full
        ${sizeStyles[size]}
        ${centered ? 'mx-auto' : ''}
        ${padded ? 'px-4 sm:px-6 lg:px-8' : ''}
        ${className}
      `.trim().replace(/\s+/g, ' ')}
      {...props}
    >
      {children}
    </div>
  );
}

export default PageContainer;
