import React from 'react';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  const normalized = (status || 'UNKNOWN').toUpperCase();

  const badgeStyles: Record<string, string> = {
    AVAILABLE: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    BOOKED: 'bg-orange-50 text-orange-700 border-orange-200',
    MAINTENANCE: 'bg-rose-50 text-rose-700 border-rose-200',
    CONFIRMED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
    CANCELLED: 'bg-zinc-100 text-zinc-600 border-zinc-200',
    ACTIVE: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    PENDING_SETUP: 'bg-sky-50 text-sky-700 border-sky-200',
    SUSPENDED: 'bg-rose-50 text-rose-700 border-rose-200',
    HIGH: 'bg-rose-50 text-rose-700 border-rose-200 font-bold',
    CRITICAL: 'bg-rose-100 text-rose-800 border-rose-300 font-bold animate-pulse',
    NORMAL: 'bg-sky-50 text-sky-700 border-sky-200',
    LOW: 'bg-zinc-100 text-zinc-600 border-zinc-200',
  };

  const style = badgeStyles[normalized] || 'bg-zinc-100 text-zinc-700 border-zinc-200';

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold border uppercase tracking-wider',
        style,
        className
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      {normalized.replace(/_/g, ' ')}
    </span>
  );
}
