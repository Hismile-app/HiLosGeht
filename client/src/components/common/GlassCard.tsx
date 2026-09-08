import React from 'react';
import { cn } from '@/lib/utils';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  neonBorder?: boolean;
  hoverEffect?: boolean;
}

export default function GlassCard({
  children,
  neonBorder = false,
  hoverEffect = true,
  className,
  ...props
}: GlassCardProps) {
  return (
    <div
      className={cn(
        'bg-white border rounded-xl p-5 sm:p-6 transition-all duration-200 relative overflow-hidden shadow-subtle',
        neonBorder ? 'border-primary shadow-orange' : 'border-border',
        hoverEffect && 'hover:border-primary/50 hover:shadow-orange hover:-translate-y-0.5',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
