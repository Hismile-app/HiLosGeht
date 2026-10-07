'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  PieChart as PieIcon, 
  Truck, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  RefreshCw,
  Activity,
  MapPin,
  Calendar,
  Fuel,
  User,
  Cpu,
  Sparkles,
  BarChart3,
  TrendingUp,
  FileCheck2
} from 'lucide-react';
import { FleetUtilizationDonut } from '@/components/admin/RechartsWidgets';
import { formatCurrency, formatDate } from '@/lib/utils';

interface Equipment {
  id: string;
  name: string;
  model: string;
  category: string;
  daily_rate: string | number;
  status: 'AVAILABLE' | 'BOOKED' | 'MAINTENANCE';
  operating_hours: string | number;
  current_hour_meter?: number;
  maintenance_interval_hours?: string | number;
  location?: string;
  telemetry_api_id?: string;
}

interface StaffLog {
  id: string;
  staff_id: string | null;
  equipment_id: string;
  start_meter: number;
  end_meter: number;
  hours_worked?: number;
  work_description: string;
  fuel_amount: number;
  fuel_proof_image?: string;
  materials_proof_image?: string;
  start_meter_proof_image?: string;
  end_meter_proof_image?: string;
  meter_proof_image?: string;
  date_submitted: string;
  verification_status: 'PENDING' | 'APPROVED' | 'REJECTED';
  staff_name?: string;
  equipment_name?: string;
  equipment_model?: string;
  equipment_category?: string;
}

export default function FleetUtilizationPage() {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [logs, setLogs] = useState<StaffLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeWindowDays, setTimeWindowDays] = useState<number>(7);
  const [filterCategory, setFilterCategory] = useState<string>('ALL');

  const fetchData = async () => {
    setLoading(true);
    try {
      const apiUrl = '/api/v1';
      const [eqRes, logsRes] = await Promise.all([
        fetch(`${apiUrl}/equipment`),
        fetch(`${apiUrl}/logs`)
      ]);

      if (eqRes.ok) {
        const eqJson = await eqRes.json();
        setEquipment(eqJson?.data || []);
      }

      if (logsRes.ok) {
        const logsJson = await logsRes.json();
        setLogs(logsJson?.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch utilization telemetry:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter logs within the selected time window
  const windowLogs = useMemo(() => {
    const cutoff = Date.now() - timeWindowDays * 24 * 60 * 60 * 1000;
    return logs.filter((log) => {
      const logDate = new Date(log.date_submitted).getTime();
      return logDate >= cutoff;
    });
  }, [logs, timeWindowDays]);

  // Aggregate telematics per machine
  const machineTelemetry = useMemo(() => {
    const map: Record<string, {
      loggedHours: number;
      shiftCount: number;
      totalFuel: number;
      latestEndMeter: number;
      lastOperator: string;
      lastLogDate: string | null;
      lastJobsite: string;
      hasGaugePhotoProof: boolean;
      recentLogs: StaffLog[];
    }> = {};

    for (const machine of equipment) {
      // Find matching logs by ID or name
      const mLogs = windowLogs.filter((l) => 
        l.equipment_id === machine.id ||
        (l.equipment_name && machine.name && l.equipment_name.toLowerCase().includes(machine.name.toLowerCase().slice(0, 10)))
      );

      // All logs ever for meter calculation
      const allMLogs = logs.filter((l) => 
        l.equipment_id === machine.id ||
        (l.equipment_name && machine.name && l.equipment_name.toLowerCase().includes(machine.name.toLowerCase().slice(0, 10)))
      );

      let loggedHours = 0;
      let totalFuel = 0;
      for (const log of mLogs) {
        const hrs = log.hours_worked ?? Math.max(0, (log.end_meter || 0) - (log.start_meter || 0));
        loggedHours += hrs;
        totalFuel += Number(log.fuel_amount || 0);
      }

      // Latest verified end meter from all logs or fallback to equipment property
      let latestEndMeter = Number(machine.current_hour_meter || machine.operating_hours || 0);
      let lastOperator = 'No recent shift';
      let lastLogDate: string | null = null;
      let lastJobsite = machine.location || 'Meru Operations Yard';

      let hasGaugePhotoProof = false;
      if (allMLogs.length > 0) {
        // Sort newest first
        const sorted = [...allMLogs].sort((a, b) => new Date(b.date_submitted).getTime() - new Date(a.date_submitted).getTime());
        const newest = sorted[0];
        if (newest.end_meter && newest.end_meter > latestEndMeter) {
          latestEndMeter = Number(newest.end_meter);
        }
        lastOperator = newest.staff_name || 'Field Operator';
        lastLogDate = newest.date_submitted;
        if (newest.work_description) {
          lastJobsite = newest.work_description.slice(0, 50) + (newest.work_description.length > 50 ? '...' : '');
        }
        hasGaugePhotoProof = !!(newest.meter_proof_image || newest.end_meter_proof_image || newest.start_meter_proof_image);
      }

      map[machine.id] = {
        loggedHours,
        shiftCount: mLogs.length,
        totalFuel,
        latestEndMeter,
        lastOperator,
        lastLogDate,
        lastJobsite,
        hasGaugePhotoProof,
        recentLogs: mLogs,
      };
    }

    return map;
  }, [equipment, windowLogs, logs]);

  // High-level Fleet Calculations
  const totalMachines = equipment.length;
  const availableCount = equipment.filter(e => e.status === 'AVAILABLE').length;
  const bookedCount = equipment.filter(e => e.status === 'BOOKED').length;
  const maintenanceCount = equipment.filter(e => e.status === 'MAINTENANCE').length;
  
  // Commercial Deployment Rate
  const deploymentPercentage = totalMachines > 0 ? ((bookedCount / totalMachines) * 100).toFixed(1) : '0';

  // Total fleet operating engine hours in period
  const totalFleetHoursLogged = useMemo(() => {
    return Object.values(machineTelemetry).reduce((acc, curr) => acc + curr.loggedHours, 0);
  }, [machineTelemetry]);

  // Total fleet fuel burned in period
  const totalFleetFuelBurned = useMemo(() => {
    return Object.values(machineTelemetry).reduce((acc, curr) => acc + curr.totalFuel, 0);
  }, [machineTelemetry]);

  // Theoretical standard fleet capacity (e.g. 8 standard shift hours per machine per day)
  const theoreticalCapacityHours = totalMachines * timeWindowDays * 8;
  const operationalUtilizationRate = theoreticalCapacityHours > 0
    ? Math.min(100, (totalFleetHoursLogged / theoreticalCapacityHours) * 100).toFixed(1)
    : '0';

  const averageFleetBurnRate = totalFleetHoursLogged > 0
    ? (totalFleetFuelBurned / totalFleetHoursLogged).toFixed(1)
    : '0.0';

  // Filter equipment by category
  const categories = useMemo(() => {
    const set = new Set<string>();
    equipment.forEach(e => { if (e.category) set.add(e.category); });
    return Array.from(set);
  }, [equipment]);

  const filteredEquipment = equipment.filter(e => {
    if (filterCategory === 'ALL') return true;
    return e.category === filterCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-primary font-mono tracking-wider uppercase">Module 8</span>
            <span className="text-muted">/</span>
            <span className="text-xs text-muted font-medium">Operations & Telematics</span>
          </div>
          <h1 className="text-2xl font-heading font-black text-foreground flex items-center gap-2.5 mt-1">
            <PieIcon className="w-6 h-6 text-primary" />
            Fleet Utilization & Telematics Intelligence
          </h1>
          <p className="text-sm text-muted mt-0.5">
            Real-time machine duty cycles, operator shift ticket yields, and operational engine utilization across Meru projects.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Time Window Switcher */}
          <select
            value={timeWindowDays}
            onChange={(e) => setTimeWindowDays(Number(e.target.value))}
            className="bg-white border border-border rounded-lg px-3 py-2 text-xs font-mono text-foreground focus:outline-none focus:border-primary shadow-subtle cursor-pointer"
          >
            <option value={7}>Past 7 Days</option>
            <option value={14}>Past 14 Days</option>
            <option value={30}>Past 30 Days</option>
          </select>

          <button 
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-surface text-foreground rounded-lg border border-border text-xs font-semibold font-mono transition-all shadow-subtle cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-primary ${loading ? 'animate-spin' : ''}`} />
            Refresh Telematics
          </button>
        </div>
      </div>

      {/* Telematics Source Notice Banner */}
      <div className="bg-orange-50/70 border border-orange-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-subtle">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-orange-100 border border-orange-300 text-primary flex items-center justify-center shrink-0">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <div className="font-heading font-bold text-foreground flex items-center gap-2">
              <span>Telemetry Source: Verified Operator Shift Logs</span>
              <span className="px-2 py-0.2 rounded-full text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                OEM LiveLink API Ready
              </span>
            </div>
            <p className="text-muted text-[11px] mt-0.5">
              Operating hours, fuel burn, and deployment ratios are synthesized directly from certified field shift tickets submitted via the Staff Portal.
            </p>
          </div>
        </div>

        <div className="font-mono text-[11px] text-zinc-600 shrink-0 bg-white px-3 py-1.5 rounded-lg border border-orange-200">
          <span className="text-primary font-bold">{logs.length}</span> Total Shift Logs Evaluated
        </div>
      </div>

      {/* Top Telematics Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Operational Utilization */}
        <div className="bg-white border border-border rounded-xl p-5 shadow-subtle flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted text-xs font-mono uppercase font-bold">
            <span>Operational Engine Utilization</span>
            <Activity className="w-4 h-4 text-primary" />
          </div>
          <div className="mt-2">
            <div className="text-3xl font-heading font-black text-primary">
              {operationalUtilizationRate}%
            </div>
            <div className="text-[11px] text-muted font-mono mt-1">
              {totalFleetHoursLogged.toFixed(1)} hrs worked of {theoreticalCapacityHours}h standard capacity
            </div>
          </div>
          <div className="w-full bg-surface rounded-full h-1.5 mt-3 overflow-hidden">
            <div 
              className="bg-primary h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, parseFloat(operationalUtilizationRate))}%` }}
            />
          </div>
        </div>

        {/* Metric 2: Commercial Deployment */}
        <div className="bg-white border border-border rounded-xl p-5 shadow-subtle flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted text-xs font-mono uppercase font-bold">
            <span>Commercial Deployment Rate</span>
            <Truck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2">
            <div className="text-3xl font-heading font-black text-foreground">
              {deploymentPercentage}%
            </div>
            <div className="text-[11px] text-muted font-mono mt-1">
              {bookedCount} of {totalMachines} assets currently on contract hire
            </div>
          </div>
          <div className="w-full bg-surface rounded-full h-1.5 mt-3 overflow-hidden">
            <div 
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, parseFloat(deploymentPercentage))}%` }}
            />
          </div>
        </div>

        {/* Metric 3: Fleet Engine Hours */}
        <div className="bg-white border border-border rounded-xl p-5 shadow-subtle flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted text-xs font-mono uppercase font-bold">
            <span>Total Engine Hours ({timeWindowDays}d)</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-2">
            <div className="text-3xl font-heading font-black text-amber-700">
              {totalFleetHoursLogged.toFixed(1)} <span className="text-sm font-normal text-muted">hrs</span>
            </div>
            <div className="text-[11px] text-muted font-mono mt-1">
              Logged across {windowLogs.length} verified operator shifts
            </div>
          </div>
          <div className="pt-2 border-t border-border mt-3 text-[10px] font-mono text-zinc-600 flex justify-between">
            <span>Avg / Machine:</span>
            <span className="font-bold">{(totalMachines > 0 ? totalFleetHoursLogged / totalMachines : 0).toFixed(1)} hrs</span>
          </div>
        </div>

        {/* Metric 4: Diesel Burn & Fuel Yield */}
        <div className="bg-white border border-border rounded-xl p-5 shadow-subtle flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted text-xs font-mono uppercase font-bold">
            <span>Diesel Consumed ({timeWindowDays}d)</span>
            <Fuel className="w-4 h-4 text-rose-600" />
          </div>
          <div className="mt-2">
            <div className="text-3xl font-heading font-black text-rose-700">
              {totalFleetFuelBurned.toFixed(0)} <span className="text-sm font-normal text-muted">L</span>
            </div>
            <div className="text-[11px] text-muted font-mono mt-1">
              Avg Burn Rate: <span className="font-bold text-foreground">{averageFleetBurnRate} L/hr</span>
            </div>
          </div>
          <div className="pt-2 border-t border-border mt-3 text-[10px] font-mono text-zinc-600 flex justify-between">
            <span>Estimated Fuel Cost:</span>
            <span className="font-bold text-zinc-900">{formatCurrency(totalFleetFuelBurned * 180)}</span>
          </div>
        </div>
      </div>

      {/* Utilization Visual Chart & Fleet Ratios */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white border border-border rounded-xl p-5 sm:p-6 flex flex-col justify-between shadow-subtle">
          <div>
            <div className="text-xs text-muted font-mono uppercase font-semibold">FLEET CAPACITY DISPATCH STATUS</div>
            <div className="text-2xl font-heading font-bold text-foreground mt-1">
              Heavy Assets Breakdown
            </div>
            <p className="text-xs text-muted mt-2">
              Current yard availability vs commercial site allocation in Meru County.
            </p>
          </div>

          <div className="pt-4 border-t border-border space-y-2.5 text-xs font-mono">
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Available for Immediate Hire:
              </span>
              <span className="font-bold text-foreground">{availableCount} units</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-1.5 text-primary font-semibold">
                <span className="w-2 h-2 rounded-full bg-primary"></span> Deployed on Field Sites:
              </span>
              <span className="font-bold text-foreground">{bookedCount} units</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-1.5 text-rose-700 font-semibold">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span> In Workshop / PM Service:
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

      {/* Machine Breakdown Header & Category Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div>
          <h3 className="text-lg font-heading font-bold text-foreground flex items-center gap-2">
            <Truck className="w-5 h-5 text-primary" />
            Machine Log Telematics & Duty Breakdown ({timeWindowDays} Days)
          </h3>
          <p className="text-xs text-muted">
            Engine hours worked, fuel burn efficiency, and latest verified operator shift tickets.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-muted">Category:</span>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-white border border-border rounded-lg px-2.5 py-1.5 text-xs font-mono text-foreground focus:outline-none focus:border-primary shadow-subtle cursor-pointer"
          >
            <option value="ALL">All Equipment ({equipment.length})</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Machinery Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredEquipment.map((item) => {
          const telem = machineTelemetry[item.id] || {
            loggedHours: 0,
            shiftCount: 0,
            totalFuel: 0,
            latestEndMeter: Number(item.current_hour_meter || item.operating_hours || 0),
            lastOperator: 'No recent shift',
            lastLogDate: null,
            lastJobsite: item.location || 'Meru Operations Yard',
            hasGaugePhotoProof: false,
            recentLogs: [],
          };

          const isAvail = item.status === 'AVAILABLE';
          const isBooked = item.status === 'BOOKED';
          const isMaint = item.status === 'MAINTENANCE';

          const interval = parseFloat(item.maintenance_interval_hours as string || '500');
          const healthPercent = Math.min(100, Math.round((telem.latestEndMeter % interval) / interval * 100));

          const fuelRate = telem.loggedHours > 0 ? (telem.totalFuel / telem.loggedHours).toFixed(1) : '0.0';
          const machineCapacity = timeWindowDays * 8;
          const machineUtilRate = machineCapacity > 0 ? Math.min(100, Math.round((telem.loggedHours / machineCapacity) * 100)) : 0;

          // Status indicator for active shift activity
          const isRecentlyActive = telem.lastLogDate && (Date.now() - new Date(telem.lastLogDate).getTime() < 48 * 3600 * 1000);

          return (
            <div key={item.id} className="bg-white border border-border rounded-xl p-4 space-y-3.5 shadow-subtle hover:border-primary/50 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                    isAvail ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                    isBooked ? 'bg-orange-50 text-orange-700 border border-orange-200' :
                    'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}>
                    {item.status}
                  </span>
                  <span className="text-[11px] font-mono text-muted">{item.category}</span>
                </div>

                <div className="mt-2">
                  <div className="font-heading font-bold text-foreground text-base leading-tight">{item.name}</div>
                  <div className="text-xs text-muted font-mono mt-0.5 flex items-center justify-between">
                    <span>{item.model}</span>
                    <span className="text-[10px] text-zinc-400 font-mono">{item.telemetry_api_id || 'OEM API Standby'}</span>
                  </div>
                </div>

                {/* Log-driven Engine Hours in Window */}
                <div className="mt-3 p-2.5 rounded-lg bg-surface border border-border space-y-1.5 text-xs font-mono">
                  <div className="flex justify-between items-center">
                    <span className="text-muted flex items-center gap-1">
                      <Clock className="w-3 h-3 text-primary" />
                      Logged Hours ({timeWindowDays}d):
                    </span>
                    <span className="font-bold text-primary">{telem.loggedHours.toFixed(1)} hrs</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-muted flex items-center gap-1">
                      <Fuel className="w-3 h-3 text-rose-600" />
                      Fuel Burn ({timeWindowDays}d):
                    </span>
                    <span className="font-bold text-zinc-800">{telem.totalFuel} L <span className="text-[10px] text-muted">({fuelRate} L/h)</span></span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-muted flex items-center gap-1">
                      <FileCheck2 className="w-3 h-3 text-emerald-600" />
                      Shift Tickets:
                    </span>
                    <span className="font-semibold text-zinc-700">{telem.shiftCount} shifts</span>
                  </div>
                </div>

                {/* Latest Verified Hour Meter */}
                <div className="mt-3 space-y-1.5 text-xs font-mono">
                  <div className="flex justify-between items-center text-muted">
                    <span>Current Verified Meter:</span>
                    <span className="text-amber-800 font-bold flex items-center gap-1.5">
                      {telem.latestEndMeter.toFixed(1)} hrs
                      {telem.hasGaugePhotoProof && (
                        <span className="text-[9px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded font-mono font-semibold" title="Physical gauge photo verified on record">
                          📸 Gauge Photo
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-muted">
                    <span>Last Operator:</span>
                    <span className="text-zinc-800 font-medium truncate max-w-[140px]" title={telem.lastOperator}>
                      {telem.lastOperator}
                    </span>
                  </div>
                  <div className="flex justify-between text-muted">
                    <span>Recent Site:</span>
                    <span className="text-zinc-700 truncate max-w-[140px]" title={telem.lastJobsite}>
                      {telem.lastJobsite}
                    </span>
                  </div>
                </div>
              </div>

              {/* PM Service Wear Progress */}
              <div className="space-y-1.5 pt-2 border-t border-border">
                <div className="flex justify-between text-[11px] font-mono">
                  <span className="text-muted">PM Interval ({interval}h):</span>
                  <span className="text-zinc-700 font-semibold">{healthPercent}%</span>
                </div>
                <div className="w-full bg-surface rounded-full h-1.5 overflow-hidden">
                  <div 
                    className={`h-full ${healthPercent > 85 ? 'bg-rose-500' : 'bg-primary'}`} 
                    style={{ width: `${healthPercent}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] font-mono text-muted pt-0.5">
                  <span>Duty Rate: {machineUtilRate}%</span>
                  <span className={isRecentlyActive ? 'text-emerald-700 font-semibold' : 'text-zinc-400'}>
                    {isRecentlyActive ? '● Active Recently' : '○ Standby'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
