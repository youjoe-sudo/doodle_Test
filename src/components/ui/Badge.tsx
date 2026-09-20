import type { ReactNode } from 'react';
import { cn } from '../utils';

type BadgeProps = {
  variant?: 'primary' | 'secondary';
  className?: string;
  children: ReactNode;
};

export const Badge = ({ variant = 'secondary', className, children }: BadgeProps) => {
  const baseClasses = cn(
    'inline-flex items-center justify-center rounded text-sm font-medium',
    'px-2 py-1',
    {
      primary: 'bg-terracotta text-white',
      secondary: 'bg-cream text-terracotta border border-terracotta',
    }[variant]
  );

  return (
    <span className={cn(baseClasses, className)}>
      {children}
    </span>
  );
};
