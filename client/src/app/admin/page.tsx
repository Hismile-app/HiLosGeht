'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Truck, 
  Inbox, 
  Users, 
  ClipboardList, 
  TrendingUp, 
  Sparkles, 
  AlertTriangle, 
  ArrowUpRight,
  ShieldCheck,
  Fuel,
  Clock,
  CheckCircle2
} from 'lucide-react';
import GlassCard from '@/components/common/GlassCard';
import StatusBadge from '@/components/common/StatusBadge';
import NeonButton from '@/components/common/NeonButton';
import { FuelAndHoursAreaChart, FleetUtilizationDonut } from '@/components/admin/RechartsWidgets';
import { formatCurrency } from '@/lib/utils';

export default function CommandOverviewPage() {
  const [overviewData, setOverviewData] = useState<any>(null);
  const [aiInsights, setAiInsights] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
        const [ovRes, aiRes] = await Promise.all([
          fetch(`${apiUrl}/analytics/overview`).catch(() => null),
          fetch(`${apiUrl}/analytics/ai-insights`).catch(() => null)
        ]);

        if (ovRes && ovRes.ok) {
          const ovData = await ovRes.json();
          setOverviewData(ovData.data);
        }

        if (aiRes && aiRes.ok) {
          const aData = await aiRes.json();
          setAiInsights(aData.data);
        }
      } catch (err) {
        console.error('Error loading overview:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, []);

  const totalFleet = overviewData?.fleet?.total_fleet || 8;
  const availableCount = overviewData?.fleet?.available_count || 6;
  const bookedCount = overviewData?.fleet?.booked_count || 2;
  const maintenanceCount = overviewData?.fleet?.maintenance_count || 0;
  const pendingInquiries = overviewData?.inquiries?.pending_count || 1;
  const activeStaff = overviewData?.todayOperations?.active_staff_today || 2;
  const projectedRevenue = overviewData?.financials?.projectedRevenueKES || 185000;
  const utilization = overviewData?.financials?.utilizationPercentage || 25.0;

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-primary/10 border border-primary/30 text-primary font-mono text-[11px] uppercase mb-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>HLG Command Center • Module 1</span>
          </div>
          <h1 className="font-heading font-black text-2xl sm:text-3xl text-white uppercase tracking-tight">
            Fleet Operations Overview
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/admin/inbox">
            <NeonButton size="sm" variant="secondary" icon={<Inbox className="w-4 h-4" />}>
              Inquiries ({pendingInquiries})
            </NeonButton>
          </Link>
          <Link href="/admin/fleet">
            <NeonButton size="sm" icon={<Truck className="w-4 h-4" />}>
              Manage Fleet
            </NeonButton>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Active Fleet */}
        <GlassCard className="p-5 space-y-3">
          <div className="flex items-center justify-between text-muted">
            <span className="font-mono text-xs uppercase tracking-wider">Total Machinery</span>
            <Truck className="w-5 h-5 text-primary" />
          </div>
          <div className="text-3xl font-black font-heading text-white">
            {totalFleet} <span className="text-xs font-mono font-normal text-muted">Units</span>
          </div>
          <div className="flex items-center gap-3 text-xs font-mono pt-1">
            <span className="text-emerald-400">● {availableCount} Avail</span>
            <span className="text-primary">● {bookedCount} Working</span>
          </div>
        </GlassCard>

        {/* Pending Inquiries */}
        <GlassCard className="p-5 space-y-3">
          <div className="flex items-center justify-between text-muted">
            <span className="font-mono text-xs uppercase tracking-wider">Pending Bookings</span>
            <Inbox className="w-5 h-5 text-primary" />
          </div>
          <div className="text-3xl font-black font-heading text-primary">
            {pendingInquiries} <span className="text-xs font-mono font-normal text-muted">Leads</span>
          </div>
          <div className="text-xs text-muted font-mono">
            Routing: WhatsApp (0717 186396)
          </div>
        </GlassCard>

        {/* Active Staff Today */}
        <GlassCard className="p-5 space-y-3">
          <div className="flex items-center justify-between text-muted">
            <span className="font-mono text-xs uppercase tracking-wider">Active Operators</span>
            <Users className="w-5 h-5 text-primary" />
          </div>
          <div className="text-3xl font-black font-heading text-white">
            {activeStaff} <span className="text-xs font-mono font-normal text-muted">On Site</span>
          </div>
          <div className="text-xs text-muted font-mono">
            Daily Log Submissions Active
          </div>
        </GlassCard>

        {/* Projected Revenue */}
        <GlassCard className="p-5 space-y-3">
          <div className="flex items-center justify-between text-muted">
            <span className="font-mono text-xs uppercase tracking-wider">Confirmed Revenue</span>
            <TrendingUp className="w-5 h-5 text-primary" />
          </div>
          <div className="text-2xl sm:text-3xl font-black font-heading text-primary truncate">
            {formatCurrency(projectedRevenue)}
          </div>
          <div className="text-xs text-muted font-mono">
            Utilization: {utilization}%
          </div>
        </GlassCard>

      </div>

      {/* AI Anomaly Alert Banner (if any) */}
      {aiInsights?.anomalies && aiInsights.anomalies.length > 0 && (
        <div className="p-4 rounded-xl bg-neutral-900 border border-primary/40 shadow-neon flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/20 text-primary flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 animate-spin" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading font-bold text-sm text-white">
                  AI Fuel Anomaly Alert
                </span>
                <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-400 font-mono text-[10px] border border-rose-800">
                  {aiInsights.anomalies.length} Flagged
                </span>
              </div>
              <p className="text-xs text-gray-300 mt-1 line-clamp-1">
                {aiInsights.anomalies[0].machine}: {aiInsights.anomalies[0].issue}
              </p>
            </div>
          </div>
          <Link href="/admin/ai-insights" className="shrink-0">
            <NeonButton size="sm" variant="secondary" className="text-xs">
              Review AI Diagnostics
            </NeonButton>
          </Link>
        </div>
      )}

      {/* Visual Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recharts Area Chart */}
        <GlassCard className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-heading text-sm font-bold text-white uppercase">
                Fleet Yield & Fuel Timeline
              </h2>
              <p className="text-[11px] text-muted font-mono">
                Engine hours worked vs. Fuel consumed across Meru jobsites
              </p>
            </div>
            <Link href="/admin/financials" className="text-xs font-mono text-primary hover:text-white flex items-center gap-1">
              <span>Detailed Report</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <FuelAndHoursAreaChart data={[]} />
        </GlassCard>

        {/* Utilization Donut */}
        <GlassCard className="space-y-4">
          <div>
            <h2 className="font-heading text-sm font-bold text-white uppercase">
              Fleet Status Distribution
            </h2>
            <p className="text-[11px] text-muted font-mono">
              Real-time equipment availability
            </p>
          </div>
          <FleetUtilizationDonut
            available={availableCount}
            booked={bookedCount}
            maintenance={maintenanceCount}
          />
        </GlassCard>

      </div>

    </div>
  );
}
