'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Truck, 
  Lock, 
  CheckCircle2, 
  Clock, 
  RefreshCw, 
  User, 
  Phone,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  X,
  CalendarPlus,
  Edit3,
  MessageSquare,
  Sparkles,
  HelpCircle
} from 'lucide-react';
import { formatDate, formatCurrency } from '@/lib/utils';

interface Equipment {
  id: string;
  name: string;
  model: string;
  category: string;
  status: string;
}

interface Reservation {
  id: string;
  equipment_id?: string;
  physical_asset_id?: string;
  equipment_name?: string;
  equipment_model?: string;
  equipment_category?: string;
  client_name: string;
  client_email?: string;
  client_phone: string;
  start_date: string;
  end_date: string;
  daily_rate?: number;
  total_amount?: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
  notes?: string;
}

export default function MasterCalendarPage() {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  // Modal State for Project Date Management & Extensions
  const [selectedBooking, setSelectedBooking] = useState<Reservation | null>(null);
  const [editStartDate, setEditStartDate] = useState('');
  const [editEndDate, setEditEndDate] = useState('');
  const [editEquipmentId, setEditEquipmentId] = useState('');
  const [saving, setSaving] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const apiUrl = '/api/v1';
      const [eqRes, inqRes] = await Promise.all([
        fetch(`${apiUrl}/equipment`),
        fetch(`${apiUrl}/inquiries`),
      ]);
      const eqJson = await eqRes.json();
      const inqJson = await inqRes.json();

      if (eqJson?.success) setEquipment(eqJson?.data || []);
      if (inqJson?.success) setReservations(inqJson?.data || []);
    } catch (err) {
      console.error('Failed to fetch calendar schedule:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  /**
   * Robust matching of an inquiry reservation to a specific fleet asset.
   */
  const matchReservationToMachine = (r: Reservation, machine: Equipment) => {
    const assignedId = r.equipment_id || r.physical_asset_id;
    if (assignedId && assignedId === machine.id) return true;

    const rName = (r.equipment_name || '').toLowerCase();
    const mName = machine.name.toLowerCase();
    const mModel = (machine.model || '').toLowerCase();
    const mCat = (machine.category || '').toLowerCase();

    if (rName.includes(mName) || mName.includes(rName)) return true;
    if (mModel && rName.includes(mModel)) return true;
    if (mCat && rName.includes(mCat) && !rName.includes('grader') && !rName.includes('dozer')) {
      if (mCat === 'excavator' && rName.includes('excavator')) return true;
    }

    return false;
  };

  // Open the schedule management modal
  const openBookingModal = (booking: Reservation) => {
    setSelectedBooking(booking);
    setEditStartDate(booking.start_date ? new Date(booking.start_date).toISOString().split('T')[0] : '');
    setEditEndDate(booking.end_date ? new Date(booking.end_date).toISOString().split('T')[0] : '');
    setEditEquipmentId(booking.equipment_id || booking.physical_asset_id || equipment[0]?.id || '');
    setFeedbackMsg(null);
  };

  // Check for conflicts within local state
  const overlapConflict = useMemo(() => {
    if (!selectedBooking || !editStartDate || !editEndDate || !editEquipmentId) return null;

    const newStart = new Date(editStartDate).getTime();
    const newEnd = new Date(editEndDate).getTime();

    if (newEnd < newStart) return null; // handled separately by validation

    for (const r of reservations) {
      if (r.id === selectedBooking.id) continue;
      if (r.status !== 'CONFIRMED') continue;

      const rEqId = r.equipment_id || r.physical_asset_id;
      if (rEqId !== editEquipmentId) continue;

      const rStart = new Date(r.start_date).getTime();
      const rEnd = new Date(r.end_date).getTime();

      // Check overlap
      if (newStart < rEnd && newEnd > rStart) {
        return r;
      }
    }
    return null;
  }, [selectedBooking, editStartDate, editEndDate, editEquipmentId, reservations]);

  // Quick Extension handlers (+3, +7, +14 days)
  const addExtensionDays = (days: number) => {
    if (!editEndDate) return;
    const currentEnd = new Date(editEndDate);
    currentEnd.setDate(currentEnd.getDate() + days);
    setEditEndDate(currentEnd.toISOString().split('T')[0]);
    setFeedbackMsg(null);
  };

  // Save updated schedule / extension
  const handleSaveSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBooking) return;

    if (new Date(editEndDate).getTime() < new Date(editStartDate).getTime()) {
      setFeedbackMsg({ type: 'error', text: 'End date cannot be earlier than start date.' });
      return;
    }

    if (overlapConflict) {
      setFeedbackMsg({
        type: 'error',
        text: `Cannot save: This machine is already locked for ${overlapConflict.client_name} from ${formatDate(overlapConflict.start_date)} to ${formatDate(overlapConflict.end_date)}. Please choose another date or reassign machine.`
      });
      return;
    }

    setSaving(true);
    setFeedbackMsg(null);

    try {
      const apiUrl = '/api/v1';
      const res = await fetch(`${apiUrl}/inquiries/${selectedBooking.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startDate: editStartDate,
          endDate: editEndDate,
          equipmentId: editEquipmentId,
          status: 'CONFIRMED',
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        setFeedbackMsg({ type: 'error', text: json?.error || 'Failed to update booking schedule.' });
      } else {
        setFeedbackMsg({ type: 'success', text: 'Schedule updated! Client notification email dispatched.' });
        
        // Optimistically update local reservations state
        setReservations(prev => prev.map(r => {
          if (r.id === selectedBooking.id) {
            const matchedEq = equipment.find(e => e.id === editEquipmentId);
            return {
              ...r,
              start_date: new Date(editStartDate).toISOString(),
              end_date: new Date(editEndDate).toISOString(),
              equipment_id: editEquipmentId,
              physical_asset_id: editEquipmentId,
              equipment_name: matchedEq?.name || r.equipment_name,
              status: 'CONFIRMED',
            };
          }
          return r;
        }));

        setTimeout(() => {
          setSelectedBooking(null);
        }, 1200);
      }
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: 'Connection error updating schedule: ' + err.message });
    } finally {
      setSaving(false);
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-primary font-mono tracking-wider uppercase">Module 9</span>
            <span className="text-muted">/</span>
            <span className="text-xs text-muted font-medium">Scheduling & Allocation</span>
          </div>
          <h1 className="text-2xl font-heading font-black text-foreground flex items-center gap-2.5 mt-1">
            <CalendarIcon className="w-6 h-6 text-primary" />
            Master Fleet Calendar & Dispatch Matrix
          </h1>
          <p className="text-sm text-muted mt-0.5">
            Single-machine exclusive deployment lock. Automatic capacity release on project end-date with conflict-guarded extensions.
          </p>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-white border border-border rounded-lg p-1 shadow-subtle">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 hover:bg-surface text-zinc-600 hover:text-foreground rounded transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-4 text-xs font-mono font-bold text-foreground min-w-[130px] text-center">
              {monthNames[currentMonth]} {currentYear}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1.5 hover:bg-surface text-zinc-600 hover:text-foreground rounded transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button 
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 bg-white hover:bg-surface text-foreground rounded-lg border border-border text-xs font-semibold transition-all shadow-subtle cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-primary ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Legend & Policy Notice */}
      <div className="bg-white border border-border rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-subtle text-xs font-mono">
        <div className="flex flex-wrap items-center gap-4">
          <span className="flex items-center gap-1.5 text-primary font-bold">
            <span className="w-3 h-3 rounded-sm bg-primary"></span> Active Confirmed Project (Locked)
          </span>
          <span className="flex items-center gap-1.5 text-amber-800 font-bold">
            <span className="w-3 h-3 rounded-sm bg-amber-400"></span> Pending Quotation
          </span>
          <span className="flex items-center gap-1.5 text-zinc-600 font-medium">
            <span className="w-3 h-3 rounded-sm bg-zinc-200 border border-zinc-400"></span> End Date Passed (Released)
          </span>
          <span className="flex items-center gap-1.5 text-emerald-800 font-bold">
            <span className="w-3 h-3 rounded-sm bg-white border border-border"></span> Open for Hire
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-emerald-800 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Exclusive Site Lock: 1 Machine = 1 Project</span>
        </div>
      </div>

      {/* Calendar Grid / Matrix */}
      <div className="bg-white border border-border rounded-xl p-5 sm:p-6 space-y-5 shadow-subtle">
        
        {/* Machine Schedule Rows */}
        <div className="space-y-4">
          {equipment.map((machine) => {
            const machineReservations = (reservations ?? []).filter(r => matchReservationToMachine(r, machine));
            const confirmedCount = machineReservations.filter(r => r.status === 'CONFIRMED').length;

            return (
              <div key={machine.id} className="bg-surface border border-border rounded-xl p-4 space-y-3 hover:border-primary/40 transition-colors">
                
                {/* Machine Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-orange-100 border border-orange-200 text-primary flex items-center justify-center shrink-0">
                      <Truck className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-heading font-bold text-foreground text-sm">{machine.name}</span>
                      <span className="text-xs text-muted font-mono ml-2">({machine.model})</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-xs font-mono">
                    <span className="text-zinc-600">
                      Confirmed Bookings: <span className="font-bold text-primary">{confirmedCount}</span>
                    </span>
                    <span className="text-muted">•</span>
                    <span className="text-zinc-500">
                      Rate: <span className="font-bold">{formatCurrency(machine.category === 'Excavator' ? 45000 : 50000)}/day</span>
                    </span>
                  </div>
                </div>

                {/* Days Strip (1..31) */}
                <div className="grid grid-cols-7 sm:grid-cols-10 md:grid-cols-15 lg:grid-cols-31 gap-1">
                  {Array.from({ length: daysInMonth }).map((_, dIndex) => {
                    const dayNum = dIndex + 1;
                    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                    
                    // Find any booking covering this date
                    const matchingBooking = machineReservations.find(r => {
                      if (!r.start_date || !r.end_date) return false;
                      const start = new Date(r.start_date).toISOString().split('T')[0];
                      const end = new Date(r.end_date).toISOString().split('T')[0];
                      return dateStr >= start && dateStr <= end;
                    });

                    const isConfirmed = matchingBooking?.status === 'CONFIRMED';
                    const isPending = matchingBooking?.status === 'PENDING';
                    
                    // Check if the booking has reached or passed its end date
                    const isExpired = matchingBooking && (new Date(matchingBooking.end_date).toISOString().split('T')[0] < todayStr);

                    return (
                      <div
                        key={dIndex}
                        onClick={() => {
                          if (matchingBooking) {
                            openBookingModal(matchingBooking);
                          }
                        }}
                        title={
                          matchingBooking 
                            ? `${matchingBooking.client_name} (${matchingBooking.status}): ${formatDate(matchingBooking.start_date)} → ${formatDate(matchingBooking.end_date)}. Click to edit or extend!`
                            : `Open for booking on ${dateStr}`
                        }
                        className={`h-11 rounded flex flex-col items-center justify-center text-[10px] font-mono transition-all cursor-pointer select-none ${
                          isConfirmed && !isExpired
                            ? 'bg-primary text-white font-bold shadow-subtle hover:bg-primary-hover ring-1 ring-primary/40'
                            : isConfirmed && isExpired
                            ? 'bg-zinc-200 text-zinc-700 border border-zinc-300 font-semibold hover:bg-zinc-300'
                            : isPending
                            ? 'bg-amber-100 text-amber-900 border border-amber-300 font-bold hover:bg-amber-200'
                            : 'bg-white hover:bg-orange-50 text-zinc-500 border border-border'
                        }`}
                      >
                        <span className="text-[9px] opacity-80">{dayNum}</span>
                        {isConfirmed && !isExpired ? (
                          <Lock className="w-3 h-3 text-white mt-0.5" />
                        ) : isConfirmed && isExpired ? (
                          <CheckCircle2 className="w-3 h-3 text-zinc-600 mt-0.5" />
                        ) : isPending ? (
                          <Clock className="w-3 h-3 text-amber-700 mt-0.5" />
                        ) : null}
                      </div>
                    );
                  })}
                </div>

                {/* Active Bookings Summary Pills for this machine */}
                {machineReservations.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                    <span className="text-[11px] font-mono text-muted uppercase font-bold">Projects on this machine:</span>
                    {machineReservations.map(r => {
                      const isExpired = new Date(r.end_date).toISOString().split('T')[0] < todayStr;
                      return (
                        <button
                          key={r.id}
                          onClick={() => openBookingModal(r)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono transition-colors border cursor-pointer ${
                            r.status === 'CONFIRMED' && !isExpired
                              ? 'bg-orange-50 border-orange-300 text-primary hover:bg-orange-100 font-bold'
                              : isExpired
                              ? 'bg-zinc-100 border-zinc-300 text-zinc-700 hover:bg-zinc-200'
                              : 'bg-amber-50 border-amber-300 text-amber-900 hover:bg-amber-100'
                          }`}
                        >
                          <span>{r.client_name.split('(')[0]}</span>
                          <span className="text-[10px] opacity-75">
                            ({formatDate(r.start_date).slice(0, 6)} → {formatDate(r.end_date).slice(0, 6)})
                          </span>
                          {isExpired && (
                            <span className="text-[9px] px-1.5 py-0.2 bg-zinc-300 rounded font-bold uppercase text-zinc-800">
                              Released • Extend +
                            </span>
                          )}
                          <Edit3 className="w-3 h-3 ml-0.5" />
                        </button>
                      );
                    })}
                  </div>
                )}

              </div>
            );
          })}
        </div>
      </div>

      {/* Project Schedule & Machine Allocation Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white border border-border rounded-2xl w-full max-w-xl p-6 shadow-2xl space-y-5 animate-in zoom-in-95">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-3 border-b border-border">
              <div>
                <div className="text-xs font-mono font-bold text-primary uppercase">
                  Project Schedule & Dispatch Manager
                </div>
                <h3 className="text-lg font-heading font-black text-foreground mt-0.5">
                  {selectedBooking.client_name}
                </h3>
                <p className="text-xs text-muted font-mono">
                  {selectedBooking.client_email} • {selectedBooking.client_phone}
                </p>
              </div>

              <button
                onClick={() => setSelectedBooking(null)}
                className="p-1 rounded-lg hover:bg-surface text-muted hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* End Date Reached / Release Notice */}
            {new Date(selectedBooking.end_date).toISOString().split('T')[0] <= todayStr && (
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-mono space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-amber-600" />
                  <span>Project End Date Reached ({formatDate(selectedBooking.end_date)})</span>
                </div>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  The scheduled hire duration for this machine has completed. Capacity is automatically released back to the yard. You can extend this project below using the quick extension buttons.
                </p>
              </div>
            )}

            {/* Conflict Warning Banner */}
            {overlapConflict && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-300 text-rose-900 text-xs font-mono space-y-1.5 animate-in shake">
                <div className="font-bold flex items-center gap-1.5 text-rose-700">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>SCHEDULE COLLISION DETECTED</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  This machine is already locked for <strong className="underline">{overlapConflict.client_name}</strong> from <strong>{formatDate(overlapConflict.start_date)}</strong> to <strong>{formatDate(overlapConflict.end_date)}</strong>!
                </p>
                <p className="text-[11px] text-rose-700 italic">
                  Rule Enforced: One heavy machine cannot operate on two project sites simultaneously. Please change the start/end date or reassign this project to another machine below.
                </p>
              </div>
            )}

            {feedbackMsg && (
              <div className={`p-3 rounded-xl text-xs font-mono font-bold flex items-center gap-2 ${
                feedbackMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-300' : 'bg-rose-50 text-rose-800 border border-rose-300'
              }`}>
                {feedbackMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 text-rose-600" />}
                <span>{feedbackMsg.text}</span>
              </div>
            )}

            {/* Edit Form */}
            <form onSubmit={handleSaveSchedule} className="space-y-4">
              
              {/* Assigned Machine Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold text-foreground flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-primary" />
                  <span>Allocated Heavy Machinery:</span>
                </label>
                <select
                  value={editEquipmentId}
                  onChange={(e) => {
                    setEditEquipmentId(e.target.value);
                    setFeedbackMsg(null);
                  }}
                  className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-xs font-mono text-foreground focus:outline-none focus:border-primary"
                >
                  {equipment.map((eq) => (
                    <option key={eq.id} value={eq.id}>
                      {eq.name} ({eq.category} - {eq.model})
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-bold text-foreground">
                    Project Start Date:
                  </label>
                  <input
                    type="date"
                    value={editStartDate}
                    onChange={(e) => {
                      setEditStartDate(e.target.value);
                      setFeedbackMsg(null);
                    }}
                    required
                    className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-xs font-mono text-foreground focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-bold text-foreground">
                    Project End Date:
                  </label>
                  <input
                    type="date"
                    value={editEndDate}
                    onChange={(e) => {
                      setEditEndDate(e.target.value);
                      setFeedbackMsg(null);
                    }}
                    required
                    className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-xs font-mono text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Quick Extend Buttons */}
              <div className="pt-1">
                <span className="text-[11px] font-mono text-muted uppercase font-bold block mb-1.5">
                  Quick Extend Actions:
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => addExtensionDays(3)}
                    className="px-3 py-1.5 bg-orange-50 hover:bg-orange-100 text-primary border border-orange-200 rounded-lg text-xs font-mono font-bold cursor-pointer transition-colors"
                  >
                    +3 Days Extension
                  </button>
                  <button
                    type="button"
                    onClick={() => addExtensionDays(7)}
                    className="px-3 py-1.5 bg-orange-50 hover:bg-orange-100 text-primary border border-orange-200 rounded-lg text-xs font-mono font-bold cursor-pointer transition-colors"
                  >
                    +7 Days Extension (1 Wk)
                  </button>
                  <button
                    type="button"
                    onClick={() => addExtensionDays(14)}
                    className="px-3 py-1.5 bg-orange-50 hover:bg-orange-100 text-primary border border-orange-200 rounded-lg text-xs font-mono font-bold cursor-pointer transition-colors"
                  >
                    +14 Days Extension (2 Wks)
                  </button>
                </div>
              </div>

              {/* Client WhatsApp Communication link */}
              <div className="pt-2 flex items-center justify-between text-xs font-mono border-t border-border">
                <a
                  href={`https://wa.me/${(selectedBooking.client_phone || '').replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(selectedBooking.client_name)}%2C%20HLG%20Dispatch%20regarding%20schedule%20for%20your%20project.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1.5"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Notify Client via WhatsApp</span>
                </a>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedBooking(null)}
                    className="px-4 py-2 rounded-xl text-xs font-mono text-zinc-600 hover:bg-surface border border-border cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={saving || !!overlapConflict}
                    className="px-5 py-2 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white rounded-xl text-xs font-heading font-bold uppercase transition-all shadow-subtle cursor-pointer flex items-center gap-1.5"
                  >
                    {saving ? 'Updating...' : 'Save & Send Client Email'}
                  </button>
                </div>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
