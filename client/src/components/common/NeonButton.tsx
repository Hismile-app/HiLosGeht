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
    md: 'py-2.5 px-5 text-sm',
    lg: 'py-3.5 px-7 text-base',
  };

  const variantClasses = {
    primary: 'bg-primary text-white hover:bg-primary-hover border border-[#FF833B] shadow-neon hover:shadow-neon-lg',
    secondary: 'bg-primary/10 text-primary hover:bg-primary/20 border border-primary/30',
    outline: 'bg-transparent text-gray-300 hover:text-white border border-border hover:border-primary/50',
    danger: 'bg-red-950/40 text-red-400 border border-red-800/50 hover:bg-red-900/50',
  };

  return (
    <button
      className={cn(
        'font-heading uppercase tracking-wider font-semibold rounded-md transition-all duration-300 inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed',
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
