import React from 'react';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  const normalized = status?.toUpperCase() || 'UNKNOWN';

  const badgeStyles: Record<string, string> = {
    AVAILABLE: 'bg-emerald-950/60 text-emerald-400 border-emerald-700/50',
    BOOKED: 'bg-amber-950/60 text-amber-400 border-amber-700/50',
    MAINTENANCE: 'bg-rose-950/60 text-rose-400 border-rose-700/50',
    CONFIRMED: 'bg-emerald-950/60 text-emerald-400 border-emerald-700/50',
    PENDING: 'bg-amber-950/60 text-amber-400 border-amber-700/50',
    CANCELLED: 'bg-neutral-900 text-neutral-500 border-neutral-800',
    ACTIVE: 'bg-emerald-950/60 text-emerald-400 border-emerald-700/50',
    PENDING_SETUP: 'bg-sky-950/60 text-sky-400 border-sky-700/50',
    SUSPENDED: 'bg-rose-950/60 text-rose-400 border-rose-700/50',
    HIGH: 'bg-rose-950/60 text-rose-400 border-rose-700/50',
    CRITICAL: 'bg-red-950 text-red-300 border-red-600 animate-pulse',
    NORMAL: 'bg-sky-950/60 text-sky-400 border-sky-700/50',
    LOW: 'bg-neutral-900 text-neutral-400 border-neutral-800',
  };

  const style = badgeStyles[normalized] || 'bg-neutral-900 text-gray-300 border-neutral-800';

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium border uppercase tracking-wider',
        style,
        className
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      {normalized.replace('_', ' ')}
    </span>
  );
}
