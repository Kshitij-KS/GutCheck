// components/layout/PageShell.tsx

import { cn } from '@/lib/utils';

interface PageShellProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '7xl';
}

export function PageShell({ children, className, maxWidth = '7xl' }: PageShellProps) {
  const maxWidthClass = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '7xl': 'max-w-7xl',
  }[maxWidth];

  return (
    <main className={cn('mx-auto w-full px-4 py-8 sm:px-6', maxWidthClass, className)}>
      {children}
    </main>
  );
}
