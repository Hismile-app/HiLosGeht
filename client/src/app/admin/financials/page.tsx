'use client';

import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  Fuel, 
  Clock, 
  Truck, 
  Calendar, 
  RefreshCw, 
  Download, 
  ArrowUpRight,
  ShieldCheck
} from 'lucide-react';
import { FuelAndHoursAreaChart, MachineCostBarChart } from '@/components/admin/RechartsWidgets';

interface FinancialData {
  machineBreakdown: Array<{
    machine_name: string;
    category: string;
    total_hours: number;
    total_fuel_litres: number;
    total_fuel_cost_kes: number;
    cost_per_hour_kes: number;
  }>;
  dailyTimeline: Array<{
    day_label: string;
    hours_yield: number;
    fuel_litres: number;
    fuel_cost_kes: number;
  }>;
}

export default function FinancialsPage() {
  const [data, setData] = useState<FinancialData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchFinancials = async () => {
    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
      const res = await fetch(`${apiUrl}/analytics/financials`);
      const json = await res.json();
      if (json?.success) {
        setData(json?.data);
      }
    } catch (err) {
      console.error('Failed to fetch financial analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinancials();
  }, []);

  const machineBreakdown = data?.machineBreakdown ?? [];
  const dailyTimeline = data?.dailyTimeline ?? [];

  const totalFuelCost = machineBreakdown.reduce((acc, m) => acc + parseFloat(m.total_fuel_cost_kes as any || 0), 0);
  const totalEngineHours = machineBreakdown.reduce((acc, m) => acc + parseFloat(m.total_hours as any || 0), 0);
  const totalFuelLitres = machineBreakdown.reduce((acc, m) => acc + parseFloat(m.total_fuel_litres as any || 0), 0);
  const avgCostPerHour = totalEngineHours > 0 ? (totalFuelCost / totalEngineHours) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-primary font-mono tracking-wider uppercase">Module 7</span>
            <span className="text-muted">/</span>
            <span className="text-xs text-muted font-medium">Finance & Fuel</span>
          </div>
          <h1 className="text-2xl font-heading font-black text-foreground flex items-center gap-2.5 mt-1">
            <TrendingUp className="w-6 h-6 text-primary" />
            Financial Ledger & Fuel Analytics
          </h1>
          <p className="text-sm text-muted mt-0.5">
            Real-time tracking of diesel consumption, operational burn rates @ KES 180/L, and equipment revenue yield.
          </p>
        </div>

        <button 
          onClick={fetchFinancials}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-surface text-foreground rounded-lg border border-border text-sm font-semibold transition-all shadow-subtle cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 text-primary ${loading ? 'animate-spin' : ''}`} />
          Refresh Financials
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-border rounded-xl p-5 space-y-1 shadow-subtle">
          <div className="text-xs text-muted font-mono uppercase font-semibold">TOTAL FUEL EXPENSE</div>
          <div className="text-2xl font-heading font-bold text-primary">
            KES {totalFuelCost.toLocaleString('en-KE', { maximumFractionDigits: 0 })}
          </div>
          <div className="text-[11px] text-muted font-mono">Calculated at standard rate of KES 180/L</div>
        </div>

        <div className="bg-white border border-border rounded-xl p-5 space-y-1 shadow-subtle">
          <div className="text-xs text-muted font-mono uppercase font-semibold">FLEET DIESEL BURN</div>
          <div className="text-2xl font-heading font-bold text-emerald-700">
            {totalFuelLitres.toLocaleString()} L
          </div>
          <div className="text-[11px] text-muted font-mono">Total fuel delivered & logged on sites</div>
        </div>

        <div className="bg-white border border-border rounded-xl p-5 space-y-1 shadow-subtle">
          <div className="text-xs text-muted font-mono uppercase font-semibold">BILLED ENGINE HOURS</div>
          <div className="text-2xl font-heading font-bold text-amber-700">
            {totalEngineHours.toFixed(1)} hrs
          </div>
          <div className="text-[11px] text-muted font-mono">Cumulative shift runtime recorded</div>
        </div>

        <div className="bg-white border border-border rounded-xl p-5 space-y-1 shadow-subtle">
          <div className="text-xs text-muted font-mono uppercase font-semibold">AVG COST PER HOUR</div>
          <div className="text-2xl font-heading font-bold text-foreground">
            KES {avgCostPerHour.toFixed(0)} <span className="text-xs font-mono text-muted">/ hr</span>
          </div>
          <div className="text-[11px] text-emerald-700 font-mono flex items-center gap-1 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" /> Nominal efficiency envelope
          </div>
        </div>
      </div>

      {/* Visual Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-border rounded-xl p-5 space-y-3 shadow-subtle">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-heading font-bold text-foreground uppercase tracking-wider font-mono">
              7-Day Runtime vs Diesel Ingestion
            </h3>
            <span className="text-xs text-muted font-mono">Timeline Trend</span>
          </div>
          <FuelAndHoursAreaChart data={dailyTimeline} />
        </div>

        <div className="bg-white border border-border rounded-xl p-5 space-y-3 shadow-subtle">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-heading font-bold text-foreground uppercase tracking-wider font-mono">
              Unit Cost Per Operating Hour (KES/hr)
            </h3>
            <span className="text-xs text-muted font-mono">Equipment Breakdown</span>
          </div>
          <MachineCostBarChart data={machineBreakdown} />
        </div>
      </div>

      {/* Machine Financial Breakdown Table */}
      <div className="bg-white border border-border rounded-xl overflow-hidden shadow-subtle">
        <div className="p-4 border-b border-border flex items-center justify-between bg-surface">
          <h3 className="text-base font-heading font-bold text-foreground">
            Equipment Unit Cost & Fuel Ledger Breakdown
          </h3>
          <span className="text-xs text-muted font-mono">Meru Fleet Summary</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-foreground">
            <thead className="bg-surface text-xs font-mono uppercase text-zinc-600 border-b border-border">
              <tr>
                <th className="px-4 py-3">Machinery</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Engine Hours</th>
                <th className="px-4 py-3">Diesel (L)</th>
                <th className="px-4 py-3">Fuel Cost (KES)</th>
                <th className="px-4 py-3">Burn Rate (L/hr)</th>
                <th className="px-4 py-3 text-right">Cost / Hour (KES)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {machineBreakdown.map((machine, idx) => {
                const hours = parseFloat(machine.total_hours as any || 0);
                const fuel = parseFloat(machine.total_fuel_litres as any || 0);
                const burnRate = hours > 0 ? (fuel / hours).toFixed(1) : '0';
                const costPerHour = parseFloat(machine.cost_per_hour_kes as any || 0);

                return (
                  <tr key={idx} className="hover:bg-surface transition-colors">
                    <td className="px-4 py-3.5 font-bold text-foreground flex items-center gap-2">
                      <Truck className="w-4 h-4 text-primary" />
                      {machine.machine_name}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-muted font-mono">{machine.category}</td>
                    <td className="px-4 py-3.5 font-mono text-amber-700 font-bold">{hours.toFixed(1)} hrs</td>
                    <td className="px-4 py-3.5 font-mono text-emerald-700 font-bold">{fuel.toFixed(0)} L</td>
                    <td className="px-4 py-3.5 font-mono text-zinc-800 font-semibold">
                      KES {parseFloat(machine.total_fuel_cost_kes as any || 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-3.5 font-mono text-zinc-700">{burnRate} L/hr</td>
                    <td className="px-4 py-3.5 text-right font-mono font-bold text-primary">
                      KES {costPerHour.toFixed(0)} / hr
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
