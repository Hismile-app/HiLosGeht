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
  AlertTriangle,
  CalendarPlus,
  X,
  RefreshCw,
  Edit3,
  Send,
  AlertCircle
} from 'lucide-react';
import GlassCard from '@/components/common/GlassCard';
import StatusBadge from '@/components/common/StatusBadge';
import NeonButton from '@/components/common/NeonButton';
import { formatCurrency, formatDate, buildWhatsAppBookingLink } from '@/lib/utils';

export default function InboxKanbanPage() {
  const [role, setRole] = useState<'ADMIN' | 'OPERATOR'>('ADMIN');
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Extend / Reschedule Modal State
  const [editingInquiry, setEditingInquiry] = useState<any | null>(null);
  const [editStartDate, setEditStartDate] = useState('');
  const [editEndDate, setEditEndDate] = useState('');
  const [savingSchedule, setSavingSchedule] = useState(false);
  const [modalFeedback, setModalFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchInquiries = async () => {
    try {
      const apiUrl = '/api/v1';
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

  // Optimistic Status Change Handler
  const handleStatusChange = async (id: string, newStatus: string) => {
    // 1. Optimistic local state update to prevent UI flickering / reverting
    setInquiries((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
    );

    try {
      const apiUrl = '/api/v1';
      const res = await fetch(`${apiUrl}/inquiries/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        // Re-sync with persistent storage
        await fetchInquiries();
      } else {
        const errJson = await res.json();
        console.error('Status update failed:', errJson?.error);
        await fetchInquiries();
      }
    } catch (e) {
      console.error(e);
      await fetchInquiries();
    }
  };

  // Open Schedule Edit / Extend Modal
  const handleOpenEditModal = (item: any) => {
    setEditingInquiry(item);
    const startStr = item.start_date ? new Date(item.start_date).toISOString().split('T')[0] : '';
    const endStr = item.end_date ? new Date(item.end_date).toISOString().split('T')[0] : '';
    setEditStartDate(startStr);
    setEditEndDate(endStr);
    setModalFeedback(null);
  };

  // Add Quick Extension Days
  const handleQuickExtend = (daysToAdd: number) => {
    if (!editEndDate) return;
    const current = new Date(editEndDate);
    current.setDate(current.getDate() + daysToAdd);
    setEditEndDate(current.toISOString().split('T')[0]);
  };

  // Save Schedule Changes
  const handleSaveSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingInquiry) return;

    if (new Date(editEndDate).getTime() < new Date(editStartDate).getTime()) {
      setModalFeedback({ type: 'error', text: 'End date cannot be earlier than start date.' });
      return;
    }

    setSavingSchedule(true);
    setModalFeedback(null);

    try {
      const apiUrl = '/api/v1';
      const res = await fetch(`${apiUrl}/inquiries/${editingInquiry.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startDate: editStartDate,
          endDate: editEndDate,
          equipmentId: editingInquiry.equipment_id || editingInquiry.physical_asset_id,
          status: editingInquiry.status === 'PENDING' ? 'CONFIRMED' : editingInquiry.status,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        setModalFeedback({
          type: 'error',
          text: json?.error || 'Failed to update schedule: Machine overlap detected.',
        });
      } else {
        setModalFeedback({
          type: 'success',
          text: 'Schedule updated! Confirmation email dispatched to client.',
        });

        // Optimistically update
        setInquiries((prev) =>
          prev.map((i) =>
            i.id === editingInquiry.id
              ? {
                  ...i,
                  start_date: new Date(editStartDate).toISOString(),
                  end_date: new Date(editEndDate).toISOString(),
                  status: editingInquiry.status === 'PENDING' ? 'CONFIRMED' : editingInquiry.status,
                }
              : i
          )
        );

        setTimeout(() => {
          setEditingInquiry(null);
        }, 1200);
      }
    } catch (err: any) {
      setModalFeedback({ type: 'error', text: 'Network error: ' + err.message });
    } finally {
      setSavingSchedule(false);
    }
  };

  const isPastEndDate = (endIso: string) => {
    if (!endIso) return false;
    return new Date(endIso).getTime() <= Date.now();
  };

  const pendingLeads = (inquiries ?? []).filter((i) => i.status === 'PENDING');
  const confirmedBookings = (inquiries ?? []).filter((i) => i.status === 'CONFIRMED');
  const cancelledInquiries = (inquiries ?? []).filter((i) => i.status === 'CANCELLED');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-primary font-mono text-xs uppercase mb-1 font-semibold">
            Module 3: Order & Request Inbox
          </div>
          <h1 className="font-heading font-black text-2xl sm:text-3xl text-foreground uppercase">
            Client Booking Inquiries & Negotiations
          </h1>
          <p className="text-xs text-muted mt-0.5">
            High-touch B2B negotiation board. Client receives automated notification email upon every date or status change.
          </p>
        </div>

        <button
          onClick={fetchInquiries}
          disabled={loading}
          className="self-start sm:self-auto flex items-center gap-2 px-3 py-2 bg-white hover:bg-surface text-foreground rounded-lg border border-border text-xs font-semibold transition-all shadow-subtle cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-primary ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
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
                  {item.location && (
                    <div className="text-[10px] text-muted">
                      📍 {item.location}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border text-xs">
                  <a
                    href={`https://wa.me/${(item.client_phone || '').replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(item.client_name)}%2C%20HLG%20Dispatch%20team%20confirming%20your%20inquiry%20for%20${encodeURIComponent(item.equipment_name || 'equipment')}.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-700 hover:text-emerald-800 font-mono text-[11px] font-bold flex items-center gap-1"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    WhatsApp
                  </a>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleStatusChange(item.id, 'CONFIRMED')}
                      className="px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100 text-[10px] font-bold uppercase font-mono cursor-pointer transition-colors"
                      title="Approves booking and emails client confirmation"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => handleOpenEditModal(item)}
                      className="px-2 py-1 rounded bg-surface border border-border hover:bg-amber-50 text-zinc-700 text-[10px] font-mono cursor-pointer transition-colors"
                      title="Edit dates before approving"
                    >
                      Dates
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
            {confirmedBookings.map((item) => {
              const pastEnd = isPastEndDate(item.end_date);
              return (
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

                    {pastEnd && (
                      <div className="mt-2 pt-1.5 border-t border-border flex items-center justify-between">
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                          Capacity Released (Project Ended)
                        </span>
                        <button
                          onClick={() => handleOpenEditModal(item)}
                          className="text-[10px] font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <CalendarPlus className="w-3 h-3" />
                          Extend Days
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border text-xs">
                    <button
                      onClick={() => handleOpenEditModal(item)}
                      className="text-primary hover:text-primary-hover font-mono text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="w-3 h-3" />
                      Extend / Reschedule
                    </button>

                    <button
                      onClick={() => handleStatusChange(item.id, 'CANCELLED')}
                      className="text-zinc-500 hover:text-rose-600 text-[10px] font-mono cursor-pointer transition-colors"
                      title="Releases calendar hold and notifies client"
                    >
                      Release Hold
                    </button>
                  </div>
                </GlassCard>
              );
            })}

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
              <GlassCard key={item.id} className="p-4 space-y-2 opacity-75 hover:opacity-100 transition-opacity">
                <div className="flex items-start justify-between">
                  <h3 className="font-bold text-foreground text-xs">{item.client_name}</h3>
                  <StatusBadge status={item.status} />
                </div>
                <div className="text-[11px] font-mono text-muted">
                  {item.equipment_name || 'Equipment'} • {formatDate(item.start_date)}
                </div>
                <div className="flex items-center justify-between pt-1">
                  <button
                    onClick={() => handleStatusChange(item.id, 'PENDING')}
                    className="text-xs text-primary font-mono hover:underline font-semibold cursor-pointer"
                    title="Reopens inquiry"
                  >
                    Reopen Inquiry
                  </button>
                  <button
                    onClick={() => handleOpenEditModal(item)}
                    className="text-xs text-zinc-500 hover:text-foreground font-mono cursor-pointer"
                  >
                    Adjust Dates
                  </button>
                </div>
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

      {/* Date Extension & Reschedule Modal */}
      {editingInquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-border space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between border-b border-border pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-primary">
                  Order Schedule & Extension Manager
                </span>
                <h3 className="text-lg font-heading font-black text-foreground">
                  {editingInquiry.client_name}
                </h3>
                <p className="text-xs text-muted">
                  {editingInquiry.equipment_name || 'Heavy Equipment'} • Ref #{editingInquiry.id}
                </p>
              </div>
              <button
                onClick={() => setEditingInquiry(null)}
                className="p-1.5 rounded-lg hover:bg-surface text-muted hover:text-foreground transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Email Notification Banner */}
            <div className="p-3 rounded-lg bg-orange-50/70 border border-orange-200 text-xs flex items-center gap-2 text-orange-950 font-medium">
              <Send className="w-4 h-4 text-primary shrink-0" />
              <span>
                Saving changes will automatically dispatch an official schedule update email to{' '}
                <strong>{editingInquiry.client_email}</strong>.
              </span>
            </div>

            {modalFeedback && (
              <div
                className={`p-3 rounded-lg text-xs font-medium flex items-center gap-2 ${
                  modalFeedback.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{modalFeedback.text}</span>
              </div>
            )}

            <form onSubmit={handleSaveSchedule} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1 uppercase font-mono">
                    Project Start Date
                  </label>
                  <input
                    type="date"
                    value={editStartDate}
                    onChange={(e) => setEditStartDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-foreground text-xs font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1 uppercase font-mono">
                    Project End Date
                  </label>
                  <input
                    type="date"
                    value={editEndDate}
                    onChange={(e) => setEditEndDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-foreground text-xs font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              </div>

              {/* Quick Extend Buttons */}
              <div>
                <label className="block text-[11px] font-bold text-muted mb-1.5 uppercase font-mono">
                  Quick Duration Extension:
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickExtend(3)}
                    className="px-3 py-1.5 rounded-lg border border-border bg-surface hover:bg-emerald-50 hover:border-emerald-300 text-foreground hover:text-emerald-800 text-xs font-mono font-bold transition-all cursor-pointer"
                  >
                    +3 Days
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickExtend(7)}
                    className="px-3 py-1.5 rounded-lg border border-border bg-surface hover:bg-emerald-50 hover:border-emerald-300 text-foreground hover:text-emerald-800 text-xs font-mono font-bold transition-all cursor-pointer"
                  >
                    +7 Days
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickExtend(14)}
                    className="px-3 py-1.5 rounded-lg border border-border bg-surface hover:bg-emerald-50 hover:border-emerald-300 text-foreground hover:text-emerald-800 text-xs font-mono font-bold transition-all cursor-pointer"
                  >
                    +14 Days
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setEditingInquiry(null)}
                  className="px-4 py-2 rounded-lg border border-border text-xs font-semibold hover:bg-surface transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingSchedule}
                  className="px-5 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-bold uppercase tracking-wider font-heading transition-all shadow-subtle cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  {savingSchedule && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  {savingSchedule ? 'Updating...' : 'Save & Send Client Email'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
