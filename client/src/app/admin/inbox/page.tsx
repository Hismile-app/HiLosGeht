'use client';

import React, { useState, useEffect } from 'react';
import { 
  Inbox, 
  MessageSquare, 
  Mail, 
  Calendar, 
  User, 
  Phone, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Truck,
  ArrowRight,
  AlertTriangle
} from 'lucide-react';
import GlassCard from '@/components/common/GlassCard';
import StatusBadge from '@/components/common/StatusBadge';
import NeonButton from '@/components/common/NeonButton';
import { Reservation } from '@/types';
import { formatCurrency, formatDate, buildWhatsAppBookingLink } from '@/lib/utils';

export default function InboxKanbanPage() {
  const [role, setRole] = useState<'ADMIN' | 'OPERATOR'>('ADMIN');
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInquiries = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
      const res = await fetch(`${apiUrl}/inquiries`);
      if (res.ok) {
        const data = await res.json();
        setInquiries(data?.data || []);
      }
    } catch (e) {
      // fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedRole = localStorage.getItem('hlg_role');
      if (storedRole === 'OPERATOR') {
        setRole('OPERATOR');
        setLoading(false);
        return;
      }
    }
    fetchInquiries();
  }, []);

  if (role === 'OPERATOR') {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 mx-auto flex items-center justify-center">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="font-heading font-black text-2xl text-ink uppercase">
          Access Restricted to Central Administrators
        </h2>
        <p className="text-xs text-muted max-w-md mx-auto leading-relaxed">
          Order inbox, client contract negotiations, and reservation approvals are restricted to HLG Chief Administrators.
        </p>
        <div className="pt-2">
          <a
            href="/staff"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-heading font-bold uppercase transition-all shadow-subtle"
          >
            Go to Operator Daily Log Portal
          </a>
        </div>
      </div>
    );
  }

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
      await fetch(`${apiUrl}/inquiries/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      fetchInquiries();
    } catch (e) {
      console.error(e);
    }
  };

  const pendingLeads = (inquiries ?? []).filter(i => i.status === 'PENDING');
  const confirmedBookings = (inquiries ?? []).filter(i => i.status === 'CONFIRMED');
  const cancelledInquiries = (inquiries ?? []).filter(i => i.status === 'CANCELLED');

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <div className="text-primary font-mono text-xs uppercase mb-1 font-semibold">
          Module 3: Order & Request Inbox
        </div>
        <h1 className="font-heading font-black text-2xl sm:text-3xl text-foreground uppercase">
          Client Booking Inquiries & Negotiations
        </h1>
        <p className="text-xs text-muted mt-0.5">
          High-touch B2B negotiation board. Tentative calendar holds are automatically logged upon lead capture.
        </p>
      </div>

      {/* Kanban Board Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Column 1: New Leads / Pending */}
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-amber-50 border border-amber-200">
            <span className="font-heading font-bold text-xs text-amber-800 uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600" />
              New Leads (Pending)
            </span>
            <span className="px-2 py-0.5 rounded-full bg-amber-200/80 text-amber-900 text-[10px] font-mono font-bold">
              {pendingLeads.length}
            </span>
          </div>

          <div className="space-y-3">
            {pendingLeads.map((item) => (
              <GlassCard key={item.id} className="p-4 space-y-3 border-amber-200 hover:border-amber-400">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-foreground text-sm">{item.client_name}</h3>
                    <div className="text-[11px] text-muted font-mono">{item.client_email}</div>
                  </div>
                  <StatusBadge status={item.status} />
                </div>

                <div className="p-2.5 rounded-lg bg-surface text-xs space-y-1 font-mono border border-border">
                  <div className="text-primary font-bold flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5" />
                    {item.equipment_name || item.equipment_model}
                  </div>
                  <div className="text-zinc-700 text-[11px] flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-muted" />
                    {formatDate(item.start_date)} → {formatDate(item.end_date)}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border text-xs">
                  <a
                    href={`https://wa.me/${(item.client_phone || '').replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(item.client_name)}%2C%20HLG%20Dispatch%20team%20confirming%20your%20inquiry%20for%20${encodeURIComponent(item.equipment_name || 'equipment')}.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-700 hover:text-emerald-800 font-mono text-[11px] font-bold flex items-center gap-1"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    Chat on WhatsApp
                  </a>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleStatusChange(item.id, 'CONFIRMED')}
                      className="px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100 text-[10px] font-bold uppercase font-mono cursor-pointer transition-colors"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => handleStatusChange(item.id, 'CANCELLED')}
                      className="px-2 py-1 rounded bg-surface hover:bg-rose-50 text-zinc-600 hover:text-rose-600 text-[10px] font-mono cursor-pointer transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </GlassCard>
            ))}

            {pendingLeads.length === 0 && (
              <div className="p-6 text-center text-xs text-muted font-mono rounded-xl border border-dashed border-border bg-surface">
                No pending inquiries.
              </div>
            )}
          </div>
        </div>

        {/* Column 2: Confirmed Booked */}
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-emerald-50 border border-emerald-200">
            <span className="font-heading font-bold text-xs text-emerald-800 uppercase tracking-wider flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Confirmed Bookings
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-200/80 text-emerald-900 text-[10px] font-mono font-bold">
              {confirmedBookings.length}
            </span>
          </div>

          <div className="space-y-3">
            {confirmedBookings.map((item) => (
              <GlassCard key={item.id} className="p-4 space-y-3 border-emerald-200 hover:border-emerald-400">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-foreground text-sm">{item.client_name}</h3>
                    <div className="text-[11px] text-muted font-mono">{item.client_phone}</div>
                  </div>
                  <StatusBadge status={item.status} />
                </div>

                <div className="p-2.5 rounded-lg bg-surface text-xs space-y-1 font-mono border border-border">
                  <div className="text-emerald-700 font-bold flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5" />
                    {item.equipment_name || item.equipment_model}
                  </div>
                  <div className="text-zinc-700 text-[11px]">
                    Dates: {formatDate(item.start_date)} → {formatDate(item.end_date)}
                  </div>
                  <div className="text-primary font-bold text-[11px]">
                    Rate: {formatCurrency(item.daily_rate)}/day
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border text-xs">
                  <span className="text-muted text-[10px] font-mono font-semibold">GiST Hold Active</span>
                  <button
                    onClick={() => handleStatusChange(item.id, 'CANCELLED')}
                    className="text-zinc-500 hover:text-rose-600 text-[10px] font-mono cursor-pointer transition-colors"
                  >
                    Release Hold
                  </button>
                </div>
              </GlassCard>
            ))}

            {confirmedBookings.length === 0 && (
              <div className="p-6 text-center text-xs text-muted font-mono rounded-xl border border-dashed border-border bg-surface">
                No active confirmed bookings.
              </div>
            )}
          </div>
        </div>

        {/* Column 3: Cancelled / Archived */}
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-100 border border-zinc-200">
            <span className="font-heading font-bold text-xs text-zinc-700 uppercase tracking-wider flex items-center gap-2">
              <XCircle className="w-4 h-4 text-zinc-500" />
              Cancelled / Archived
            </span>
            <span className="px-2 py-0.5 rounded-full bg-zinc-200 text-zinc-700 text-[10px] font-mono font-bold">
              {cancelledInquiries.length}
            </span>
          </div>

          <div className="space-y-3">
            {cancelledInquiries.map((item) => (
              <GlassCard key={item.id} className="p-4 space-y-2 opacity-70 hover:opacity-100 transition-opacity">
                <div className="flex items-start justify-between">
                  <h3 className="font-bold text-foreground text-xs">{item.client_name}</h3>
                  <StatusBadge status={item.status} />
                </div>
                <div className="text-[11px] font-mono text-muted">
                  {item.equipment_name || 'Equipment'} • {formatDate(item.start_date)}
                </div>
                <button
                  onClick={() => handleStatusChange(item.id, 'PENDING')}
                  className="text-xs text-primary font-mono hover:underline block pt-1 font-semibold cursor-pointer"
                >
                  Reopen Inquiry
                </button>
              </GlassCard>
            ))}

            {cancelledInquiries.length === 0 && (
              <div className="p-6 text-center text-xs text-muted font-mono rounded-xl border border-dashed border-border bg-surface">
                No archived inquiries.
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
