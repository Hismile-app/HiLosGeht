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
        'rounded-xl p-6 transition-all duration-300 relative overflow-hidden',
        neonBorder ? 'glass-panel-neon' : 'glass-panel',
        hoverEffect && 'hover:border-primary/50 hover:shadow-neon/40 hover:-translate-y-0.5',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
