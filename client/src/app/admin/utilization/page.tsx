'use client';

import React, { useState, useEffect } from 'react';
import { 
  PieChart as PieIcon, 
  Truck, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  RefreshCw,
  Activity,
  MapPin,
  Calendar
} from 'lucide-react';
import { FleetUtilizationDonut } from '@/components/admin/RechartsWidgets';

interface Equipment {
  id: string;
  name: string;
  model: string;
  category: string;
  daily_rate: string | number;
  status: 'AVAILABLE' | 'BOOKED' | 'MAINTENANCE';
  operating_hours: string | number;
  maintenance_interval_hours: string | number;
  location: string;
}

export default function FleetUtilizationPage() {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFleet = async () => {
    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
      const res = await fetch(`${apiUrl}/equipment`);
      const json = await res.json();
      if (json?.success) {
        setEquipment(json?.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch fleet:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFleet();
  }, []);

  const totalMachines = equipment.length;
  const availableCount = equipment.filter(e => e.status === 'AVAILABLE').length;
  const bookedCount = equipment.filter(e => e.status === 'BOOKED').length;
  const maintenanceCount = equipment.filter(e => e.status === 'MAINTENANCE').length;
  const utilizationPercentage = totalMachines > 0 ? ((bookedCount / totalMachines) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-primary font-mono tracking-wider uppercase">Module 8</span>
            <span className="text-muted">/</span>
            <span className="text-xs text-muted font-medium">Operations</span>
          </div>
          <h1 className="text-2xl font-heading font-black text-foreground flex items-center gap-2.5 mt-1">
            <PieIcon className="w-6 h-6 text-primary" />
            Fleet Utilization & Deployment Rates
          </h1>
          <p className="text-sm text-muted mt-0.5">
            Real-time machine availability distribution, jobsite deployment ratios, and maintenance downtime tracking.
          </p>
        </div>

        <button 
          onClick={fetchFleet}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-surface text-foreground rounded-lg border border-border text-sm font-semibold transition-all shadow-subtle cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 text-primary ${loading ? 'animate-spin' : ''}`} />
          Refresh Status
        </button>
      </div>

      {/* Utilization Rate Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white border border-border rounded-xl p-5 sm:p-6 flex flex-col justify-between shadow-subtle">
          <div>
            <div className="text-xs text-muted font-mono uppercase font-semibold">CURRENT FLEET UTILIZATION</div>
            <div className="text-4xl font-heading font-black text-primary mt-1">
              {utilizationPercentage}%
            </div>
            <p className="text-xs text-muted mt-2">
              Ratio of machinery actively deployed and billed on construction jobsites vs idle yard capacity in Meru.
            </p>
          </div>

          <div className="pt-4 border-t border-border space-y-2 text-xs font-mono">
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Available for Hire:
              </span>
              <span className="font-bold text-foreground">{availableCount} units</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-1.5 text-primary font-semibold">
                <span className="w-2 h-2 rounded-full bg-primary"></span> Deployed on Site:
              </span>
              <span className="font-bold text-foreground">{bookedCount} units</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-1.5 text-rose-700 font-semibold">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span> In Workshop / PM:
              </span>
              <span className="font-bold text-foreground">{maintenanceCount} units</span>
            </div>
          </div>
        </div>

        {/* Visual Donut Chart */}
        <div className="lg:col-span-2 bg-white border border-border rounded-xl p-5 sm:p-6 flex flex-col items-center justify-center shadow-subtle">
          <div className="w-full flex items-center justify-between border-b border-border pb-2 mb-2">
            <h3 className="text-xs font-mono uppercase font-bold text-zinc-600">Fleet Availability Distribution</h3>
            <span className="text-xs font-mono text-muted">{totalMachines} Total Heavy Assets</span>
          </div>
          <FleetUtilizationDonut 
            available={availableCount} 
            booked={bookedCount} 
            maintenance={maintenanceCount} 
          />
        </div>
      </div>

      {/* Machinery Status Grid */}
      <div className="space-y-4">
        <h3 className="text-lg font-heading font-bold text-foreground flex items-center gap-2">
          <Truck className="w-5 h-5 text-primary" />
          Individual Machine Utilization Breakdown
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {equipment.map((item) => {
            const isAvail = item.status === 'AVAILABLE';
            const isBooked = item.status === 'BOOKED';
            const isMaint = item.status === 'MAINTENANCE';

            const currentHours = parseFloat(item.operating_hours as string || '0');
            const interval = parseFloat(item.maintenance_interval_hours as string || '250');
            const healthPercent = Math.min(100, Math.round((currentHours % interval) / interval * 100));

            return (
              <div key={item.id} className="bg-white border border-border rounded-xl p-4 space-y-3 shadow-subtle hover:border-primary/50 transition-colors">
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                    isAvail ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                    isBooked ? 'bg-orange-50 text-orange-700 border border-orange-200' :
                    'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}>
                    {item.status}
                  </span>
                  <span className="text-xs font-mono text-muted">{item.category}</span>
                </div>

                <div>
                  <div className="font-heading font-bold text-foreground text-base">{item.name}</div>
                  <div className="text-xs text-muted font-mono">{item.model}</div>
                </div>

                <div className="space-y-1.5 text-xs font-mono">
                  <div className="flex justify-between text-muted">
                    <span>Total Hours:</span>
                    <span className="text-amber-700 font-semibold">{currentHours.toFixed(1)} hrs</span>
                  </div>
                  <div className="flex justify-between text-muted">
                    <span>Yard / Site:</span>
                    <span className="text-zinc-700">{item.location || 'Meru Yard'}</span>
                  </div>
                </div>

                {/* PM Service Progress */}
                <div className="space-y-1 pt-1 border-t border-border">
                  <div className="flex justify-between text-[11px] font-mono">
                    <span className="text-muted">PM Interval Wear:</span>
                    <span className="text-zinc-700 font-semibold">{healthPercent}%</span>
                  </div>
                  <div className="w-full bg-surface-hover rounded-full h-1.5 overflow-hidden">
                    <div 
                      className={`h-full ${healthPercent > 80 ? 'bg-rose-500' : 'bg-primary'}`} 
                      style={{ width: `${healthPercent}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
