'use client';

import React, { useState, useEffect } from 'react';
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
  ShieldCheck
} from 'lucide-react';

interface Equipment {
  id: string;
  name: string;
  model: string;
  category: string;
  status: string;
}

interface Reservation {
  id: string;
  equipment_id: string;
  equipment_name: string;
  client_name: string;
  client_phone: string;
  start_date: string;
  end_date: string;
  status: string;
}

export default function MasterCalendarPage() {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const fetchData = async () => {
    setLoading(true);
    try {
      const [eqRes, inqRes] = await Promise.all([
        fetch('http://localhost:5000/api/v1/equipment'),
        fetch('http://localhost:5000/api/v1/inquiries'),
      ]);
      const eqJson = await eqRes.json();
      const inqJson = await inqRes.json();

      if (eqJson.success) setEquipment(eqJson.data || []);
      if (inqJson.success) setReservations(inqJson.data || []);
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
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-primary font-mono tracking-wider uppercase">Module 9</span>
            <span className="text-muted">/</span>
            <span className="text-xs text-gray-400">Scheduling</span>
          </div>
          <h1 className="text-2xl font-heading font-black text-white flex items-center gap-2.5 mt-1">
            <CalendarIcon className="w-6 h-6 text-primary" />
            Master Fleet Calendar & Reactive Lock Schedule
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Visual reservation timeline powered by PostgreSQL GiST exclusion locks preventing overlapping equipment hire.
          </p>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-surface border border-border rounded-lg p-1">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 hover:bg-neutral-800 text-gray-300 hover:text-white rounded transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-4 text-xs font-mono font-bold text-white min-w-[130px] text-center">
              {monthNames[currentMonth]} {currentYear}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1.5 hover:bg-neutral-800 text-gray-300 hover:text-white rounded transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button 
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg border border-border text-xs font-medium transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-primary ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Calendar Grid / Matrix */}
      <div className="bg-surface border border-border rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="flex items-center gap-1.5 text-primary">
              <span className="w-2.5 h-2.5 rounded-sm bg-primary"></span> Confirmed Reservation (Locked)
            </span>
            <span className="flex items-center gap-1.5 text-amber-400">
              <span className="w-2.5 h-2.5 rounded-sm bg-amber-400"></span> Pending Site Inquiry
            </span>
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500/30 border border-emerald-500/50"></span> Open for Hire
            </span>
          </div>
          <div className="text-xs font-mono text-muted flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-primary" /> GiST Double-Booking Guard Active
          </div>
        </div>

        {/* Machine Schedule Rows */}
        <div className="space-y-4 pt-2">
          {equipment.map((machine) => {
            const machineReservations = reservations.filter(
              r => r.equipment_id === machine.id || r.equipment_name === machine.name
            );

            return (
              <div key={machine.id} className="bg-neutral-900 border border-border/80 rounded-xl p-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/50 pb-2">
                  <div className="flex items-center gap-2.5">
                    <Truck className="w-4 h-4 text-primary" />
                    <div>
                      <span className="font-heading font-bold text-white text-sm">{machine.name}</span>
                      <span className="text-xs text-muted font-mono ml-2">({machine.model})</span>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-primary font-semibold">
                    {machineReservations.length} Active Schedules
                  </span>
                </div>

                {/* Days Strip */}
                <div className="grid grid-cols-7 sm:grid-cols-10 md:grid-cols-15 lg:grid-cols-31 gap-1">
                  {Array.from({ length: daysInMonth }).map((_, dIndex) => {
                    const dayNum = dIndex + 1;
                    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                    
                    const matchingBooking = machineReservations.find(r => {
                      const start = new Date(r.start_date).toISOString().split('T')[0];
                      const end = new Date(r.end_date).toISOString().split('T')[0];
                      return dateStr >= start && dateStr <= end;
                    });

                    const isConfirmed = matchingBooking?.status === 'CONFIRMED';
                    const isPending = matchingBooking?.status === 'PENDING';

                    return (
                      <div
                        key={dIndex}
                        title={
                          matchingBooking 
                            ? `${matchingBooking.client_name} (${matchingBooking.status}): ${matchingBooking.start_date} to ${matchingBooking.end_date}`
                            : `Open for booking on ${dateStr}`
                        }
                        className={`h-11 rounded flex flex-col items-center justify-center text-[10px] font-mono transition-all cursor-pointer ${
                          isConfirmed
                            ? 'bg-primary text-white font-bold shadow-sm'
                            : isPending
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 font-bold'
                            : 'bg-surface hover:bg-neutral-800 text-gray-500 border border-border/50'
                        }`}
                      >
                        <span className="text-[9px] opacity-70">{dayNum}</span>
                        {isConfirmed ? (
                          <Lock className="w-3 h-3 text-white mt-0.5" />
                        ) : isPending ? (
                          <Clock className="w-3 h-3 text-amber-400 mt-0.5" />
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
