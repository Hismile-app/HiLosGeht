import React from 'react';
import { cn } from '@/lib/utils';

interface NeonButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  icon?: React.ReactNode;
}

export default function NeonButton({
  variant = 'primary',
  size = 'md',
  className,
  children,
  icon,
  ...props
}: NeonButtonProps) {
  const sizeClasses = {
    sm: 'py-1.5 px-3 text-xs',
    md: 'py-2 px-4 text-xs sm:text-sm',
    lg: 'py-3 px-6 text-sm sm:text-base',
  };

  const variantClasses = {
    primary: 'bg-primary text-white hover:bg-primary-hover border border-primary-hover shadow-subtle hover:shadow-orange',
    secondary: 'bg-surface hover:bg-surface-hover text-foreground border border-border hover:border-primary/40',
    outline: 'bg-white text-foreground hover:text-primary border border-border hover:border-primary',
    danger: 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100',
  };

  return (
    <button
      className={cn(
        'font-heading uppercase tracking-wider font-bold rounded-lg transition-all duration-200 inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer',
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </button>
  );
}
