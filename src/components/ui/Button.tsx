import type { ButtonHTMLAttributes } from 'react';
import { cn } from '../utils';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary';
};

export const Button = ({
  children,
  variant = 'primary',
  disabled,
  className,
  type = 'button',
  ...props
}: ButtonProps) => {
  const baseClasses = cn(
    'inline-flex items-center justify-center rounded-full transition-colors focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed',
    'px-6 py-3 text-sm font-bold',
    {
      primary:
        'bg-terracotta text-white hover:bg-terracotta-dark active:bg-terracotta-dark',
      secondary:
        'bg-white text-terracotta border-2 border-terracotta hover:bg-terracotta/5',
    }[variant]
  );

  return (
    <button
      type={type}
      className={cn(baseClasses, className)}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};