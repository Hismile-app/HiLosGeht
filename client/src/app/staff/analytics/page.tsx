'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  Clock,
  Fuel,
  Truck,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Download,
  RefreshCw,
  ClipboardList,
  User,
  Gauge,
  FileCheck,
  ChevronRight,
  ExternalLink,
  Search,
  Filter,
  X,
  Eye,
  ArrowUpRight,
  ShieldCheck,
  Sparkles,
  Send,
  HelpCircle,
  Lightbulb,
  CheckCircle,
  Zap,
  Info
} from 'lucide-react';
import {
  StaffYieldTimelineAreaChart,
  StaffEquipmentHoursBarChart,
  StaffVerificationDonutChart,
  TimelinePoint,
  MachineBreakdownItem,
  VerificationStatItem,
} from '@/components/staff/StaffAnalyticsCharts';
import { marked } from 'marked';

interface OperatorAnalyticsData {
  summary: {
    totalShifts: number;
    totalHours: number;
    totalFuelLitres: number;
    avgFuelBurnRate: number;
    approvedShifts: number;
    pendingShifts: number;
    rejectedShifts: number;
    approvalRate: number;
    machinesOperatedCount: number;
  };
  timeline: TimelinePoint[];
  machineBreakdown: MachineBreakdownItem[];
  verificationStats: VerificationStatItem[];
  recentLogs: any[];
  operatorProfile?: {
    id: string;
    full_name: string;
    email: string;
    role: string;
    phone_number?: string;
  };
  availableOperators?: Array<{
    id: string;
    full_name: string;
    email: string;
    role: string;
  }>;
  aiInsights?: {
    assessmentMarkdown: string;
    burnRateRating: 'OPTIMAL' | 'EFFICIENT' | 'MODERATE' | 'HIGH';
    tips: string[];
  };
}

export default function StaffAnalyticsPage() {
  const [data, setData] = useState<OperatorAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [days, setDays] = useState<'7' | '30' | '90' | 'all'>('30');
  const [loggedUser, setLoggedUser] = useState<{ id?: string; email?: string; full_name?: string; role?: string } | null>(null);
  const [selectedOperatorId, setSelectedOperatorId] = useState<string>('');
  const [isClientInitialized, setIsClientInitialized] = useState(false);
  const [selectedMachine, setSelectedMachine] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Interactive Operator AI Chat state
  const [aiQuery, setAiQuery] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);

  const [selectedProofModal, setSelectedProofModal] = useState<{
    url: string;
    title: string;
    type: string;
    meter?: number | string;
    shiftId?: string;
  } | null>(null);

  // Load initial operator identity from local storage if available
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('hlg_user');
        if (stored) {
          const user = JSON.parse(stored);
          setLoggedUser(user);
          if (user?.id) {
            setSelectedOperatorId(user.id);
          }
        }
      } catch (e) {}
      setIsClientInitialized(true);
    }
  }, []);

  const fetchAnalytics = async (showRefreshSpinner = false, operatorIdOverride?: string) => {
    if (showRefreshSpinner) setRefreshing(true);
    else setLoading(true);

    try {
      const activeStaffId = operatorIdOverride !== undefined ? operatorIdOverride : (selectedOperatorId || loggedUser?.id || '');
      const activeEmail = loggedUser?.email || '';

      const params = new URLSearchParams();
      if (activeStaffId) params.append('staffId', activeStaffId);
      if (activeEmail && !activeStaffId) params.append('email', activeEmail);
      if (days !== 'all') params.append('days', days);

      const res = await fetch(`/api/v1/analytics/operator?${params.toString()}`);
      const json = await res.json();
      if (json?.success && json?.data) {
        setData(json.data);
        if (json.data.operatorProfile?.id) {
          setSelectedOperatorId(json.data.operatorProfile.id);
        }
      }
    } catch (err) {
      console.error('Failed to load operator analytics:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!isClientInitialized) return;
    fetchAnalytics();
  }, [isClientInitialized, days, selectedOperatorId]);

  // Handle asking the AI Operator Coach
  const handleAskAICoach = async (promptToAsk?: string) => {
    const query = promptToAsk || aiQuery;
    if (!query || query.trim().length === 0) return;

    setAiLoading(true);
    setAiResponse(null);

    try {
      const res = await fetch('/api/v1/ai/consultant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: query.trim(),
          role: 'OPERATOR',
          context: 'OPERATOR_ANALYTICS',
          projectDetails: {
            operatorId: currentOperator?.id,
            operatorName: currentOperator?.full_name,
            summary: data?.summary,
            recentLogs: data?.recentLogs?.slice(0, 5),
            machineBreakdown: data?.machineBreakdown,
          },
        }),
      });

      const json = await res.json();
      if (json?.success && json?.data?.replyMarkdown) {
        setAiResponse(json.data.replyMarkdown);
      } else {
        setAiResponse('Your AI Field Coach is currently offline. Please verify engine idle times and gauge photos with your jobsite supervisor.');
      }
    } catch (err: any) {
      setAiResponse('Unable to reach AI Coach service. Please check network connection.');
    } finally {
      setAiLoading(false);
      if (!promptToAsk) setAiQuery('');
    }
  };

  const handleExportCSV = () => {
    if (!data?.recentLogs || data.recentLogs.length === 0) return;

    const headers = [
      'Log ID',
      'Date Submitted',
      'Operator Name',
      'Equipment Asset',
      'Start Meter (hrs)',
      'End Meter (hrs)',
      'Hours Worked',
      'Diesel Added (L)',
      'Work Description',
      'Verification Status',
      'Start Meter Proof URL',
      'End Meter Proof URL',
      'Fuel Slip URL',
      'Audit Notes'
    ];

    const rows = data.recentLogs.map((log) => [
      `"${log.id}"`,
      `"${new Date(log.date_submitted).toLocaleString('en-KE')}"`,
      `"${currentOperator?.full_name || 'Operator'}"`,
      `"${log.equipment_name || 'Machine'}"`,
      log.start_meter,
      log.end_meter,
      parseFloat(log.hours_worked || (log.end_meter - log.start_meter) || '0').toFixed(1),
      log.fuel_amount || 0,
      `"${(log.work_description || '').replace(/"/g, '""')}"`,
      log.verification_status || 'PENDING',
      `"${log.start_meter_proof_image || ''}"`,
      `"${log.end_meter_proof_image || ''}"`,
      `"${log.fuel_proof_image || ''}"`,
      `"${(log.audit_notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `HLG_Operator_Ledger_${(currentOperator?.full_name || 'MyShifts').replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter logs based on machine and search query
  const filteredLogs = useMemo(() => {
    if (!data?.recentLogs) return [];
    return data.recentLogs.filter((log) => {
      const matchMachine = selectedMachine === 'ALL' || log.equipment_name === selectedMachine;
      const matchSearch =
        !searchQuery ||
        log.equipment_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.work_description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.id?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchMachine && matchSearch;
    });
  }, [data?.recentLogs, selectedMachine, searchQuery]);

  const uniqueMachines = useMemo(() => {
    if (!data?.recentLogs) return [];
    const set = new Set<string>();
    data.recentLogs.forEach((l) => {
      if (l.equipment_name) set.add(l.equipment_name);
    });
    return Array.from(set);
  }, [data?.recentLogs]);

  const summary = data?.summary || {
    totalShifts: 0,
    totalHours: 0,
    totalFuelLitres: 0,
    avgFuelBurnRate: 0,
    approvedShifts: 0,
    pendingShifts: 0,
    rejectedShifts: 0,
    approvalRate: 0,
    machinesOperatedCount: 0,
  };

  const currentOperator = data?.operatorProfile;

  return (
    <div className="space-y-6 pb-16 max-w-7xl mx-auto">
      {/* ======================================================== */}
      {/* 1. Header & Operator Identity Control Bar                */}
      {/* ======================================================== */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-primary font-mono tracking-wider uppercase">
              Operator Field Portal
            </span>
            <span className="text-muted">/</span>
            <span className="text-xs text-muted font-medium">Personal Telematics Ledger</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-black text-foreground flex items-center gap-2.5 mt-1">
            <TrendingUp className="w-7 h-7 text-primary" />
            My Operational Analytics & Telematics
          </h1>
          <p className="text-xs sm:text-sm text-muted mt-1">
            Track your personal shift engine hours, machine fuel burn rates, meter proofs, and supervisor audit approvals.
          </p>
        </div>

        {/* Quick Action Navigation */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/staff"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-primary text-white hover:bg-primary-hover shadow-orange transition-all cursor-pointer"
          >
            <ClipboardList className="w-4 h-4" />
            <span>Submit Daily Log</span>
          </Link>

          <button
            type="button"
            onClick={handleExportCSV}
            disabled={!data?.recentLogs?.length}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border border-border bg-white text-foreground hover:bg-surface-hover hover:text-primary transition-all disabled:opacity-50 cursor-pointer shadow-subtle"
            title="Download personal shift log ledger"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export My Ledger</span>
          </button>

          <button
            type="button"
            onClick={() => fetchAnalytics(true)}
            disabled={loading || refreshing}
            className="p-2 rounded-xl border border-border bg-white text-muted hover:text-primary hover:bg-surface-hover transition-colors cursor-pointer shadow-subtle"
            title="Refresh my telematics"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-primary' : ''}`} />
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. Operator Profile Selection & Time Filter Banner        */}
      {/* ======================================================== */}
      <div className="bg-gradient-to-r from-orange-50/70 via-amber-50/40 to-white border border-orange-200 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-subtle">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-primary text-white flex items-center justify-center font-heading font-black text-lg shadow-md shrink-0">
            {currentOperator?.full_name ? currentOperator.full_name.slice(0, 2).toUpperCase() : 'OP'}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-heading font-black text-ink text-base sm:text-lg">
                {currentOperator?.full_name || 'Certified Operator'}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
                ACTIVE OPERATOR
              </span>
            </div>
            <div className="text-xs text-muted font-mono flex items-center gap-2 mt-0.5">
              <span>{currentOperator?.email || 'operator@hilosgeht.co.ke'}</span>
              <span>•</span>
              <span className="text-primary font-bold">Personal Shift Ledger</span>
            </div>
          </div>
        </div>

        {/* Right Controls: Operator Account Switcher + Date Filter */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Operator Switcher (Allows testing different operator records from DB) */}
          {data?.availableOperators && data.availableOperators.length > 1 && (
            <div className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-xl border border-border shadow-subtle">
              <User className="w-3.5 h-3.5 text-primary shrink-0" />
              <label htmlFor="operator-select" className="text-[10px] font-mono text-muted uppercase font-bold shrink-0">
                Account:
              </label>
              <select
                id="operator-select"
                value={selectedOperatorId || currentOperator?.id || ''}
                onChange={(e) => setSelectedOperatorId(e.target.value)}
                className="text-xs font-mono font-bold text-ink bg-transparent border-0 focus:outline-none cursor-pointer max-w-[220px] truncate"
              >
                {data.availableOperators.map((op) => (
                  <option key={op.id} value={op.id}>
                    {op.full_name} {op.email ? `(${op.email})` : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Date Filter Range */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-border shadow-inner">
            {(['7', '30', '90', 'all'] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setDays(r)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                  days === r
                    ? 'bg-primary text-white shadow-subtle'
                    : 'text-muted hover:text-foreground hover:bg-surface-hover'
                }`}
              >
                {r === 'all' ? 'All Shifts' : `${r}D`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. Personalized Operator AI Telematics Coach Card        */}
      {/* ======================================================== */}
      <div className="bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 text-white rounded-2xl p-5 sm:p-6 border border-zinc-800 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-zinc-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/40 flex items-center justify-center text-primary shadow-orange shrink-0">
              <Sparkles className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-heading font-black text-base sm:text-lg text-white uppercase tracking-wider flex items-center gap-1.5">
                  AI Plant Telematics Coach
                </h2>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/30">
                  {data?.aiInsights?.burnRateRating || 'OPTIMAL'} BURN RATING
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Intelligent operational feedback analyzing your real shift logs, fuel economy, and meter photo compliance.
              </p>
            </div>
          </div>
        </div>

        {/* AI Appraisal Narrative */}
        <div className="mt-4 text-xs sm:text-sm text-zinc-200 leading-relaxed font-sans bg-zinc-800/40 p-4 rounded-xl border border-zinc-800">
          {loading ? (
            <div className="flex items-center gap-2 text-zinc-400 font-mono text-xs">
              <RefreshCw className="w-4 h-4 animate-spin text-primary" />
              <span>Analyzing your shift telematics and machine hours...</span>
            </div>
          ) : (
            <div
              className="prose prose-invert prose-xs max-w-none text-zinc-200"
              dangerouslySetInnerHTML={{
                __html: marked.parse(
                  data?.aiInsights?.assessmentMarkdown ||
                    `**${currentOperator?.full_name}**, you have logged **${summary.totalHours} engine hours** across **${summary.totalShifts} site shifts**. Your average diesel burn rate of **${summary.avgFuelBurnRate} L/hr** reflects steady throttle management. Continue attaching sharp meter gauge photos to ensure rapid shift voucher sign-off.`
                ),
              }}
            />
          )}
        </div>

        {/* Actionable Field Coaching Tips */}
        {data?.aiInsights?.tips && data.aiInsights.tips.length > 0 && (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
            {data.aiInsights.tips.map((tip, idx) => (
              <div
                key={idx}
                className="bg-zinc-800/60 border border-zinc-700/60 rounded-xl p-3 flex items-start gap-2.5 text-xs text-zinc-300"
              >
                <div className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-[10px] font-mono font-bold">{idx + 1}</span>
                </div>
                <span>{tip}</span>
              </div>
            ))}
          </div>
        )}

        {/* Interactive Ask AI Input & Prompt Pills */}
        <div className="mt-5 pt-4 border-t border-zinc-800/80 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-mono text-zinc-400 flex items-center gap-1">
              <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
              Quick Telematics Queries:
            </span>
            <button
              type="button"
              onClick={() => handleAskAICoach('Analyze my fuel burn efficiency on the Komatsu PC-200 and give me tips')}
              disabled={aiLoading}
              className="px-2.5 py-1 rounded-lg text-[11px] font-mono bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors cursor-pointer border border-zinc-700"
            >
              Fuel Burn Analysis
            </button>
            <button
              type="button"
              onClick={() => handleAskAICoach('What steps do I need to follow so my shift vouchers get approved faster?')}
              disabled={aiLoading}
              className="px-2.5 py-1 rounded-lg text-[11px] font-mono bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors cursor-pointer border border-zinc-700"
            >
              Voucher Approval Tips
            </button>
            <button
              type="button"
              onClick={() => handleAskAICoach('Give me operational idling tips for Meru quarry earthmoving')}
              disabled={aiLoading}
              className="px-2.5 py-1 rounded-lg text-[11px] font-mono bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors cursor-pointer border border-zinc-700"
            >
              Idle Reduction Guide
            </button>
          </div>

          {/* Chat Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAskAICoach();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder={`Ask your AI Coach about your hours, fuel burn, or machinery technique...`}
              value={aiQuery}
              onChange={(e) => setAiQuery(e.target.value)}
              disabled={aiLoading}
              className="flex-1 bg-zinc-800/90 border border-zinc-700 rounded-xl px-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-primary font-sans"
            />
            <button
              type="submit"
              disabled={aiLoading || !aiQuery.trim()}
              className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold text-xs flex items-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer shadow-orange shrink-0"
            >
              {aiLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              <span>Ask Coach</span>
            </button>
          </form>

          {/* AI Response Display */}
          {aiResponse && (
            <div className="mt-3 p-4 bg-zinc-800/90 border border-primary/40 rounded-xl text-xs text-zinc-200 space-y-2 animate-in fade-in duration-200">
              <div className="flex items-center justify-between text-[11px] font-mono text-primary font-bold">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-orange-400" />
                  AI Field Coach Direct Guidance
                </span>
                <button
                  type="button"
                  onClick={() => setAiResponse(null)}
                  className="text-zinc-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <div
                className="prose prose-invert prose-xs max-w-none text-zinc-200 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: marked.parse(aiResponse) }}
              />
            </div>
          )}
        </div>
      </div>

      {/* ======================================================== */}
      {/* 4. Operator Personal Metric Cards (4 Cards)              */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: My Operating Hours */}
        <div className="bg-white border border-border rounded-2xl p-5 shadow-card relative overflow-hidden group hover:border-primary/40 transition-all">
          <div className="flex items-center justify-between text-muted text-xs font-mono">
            <span className="uppercase tracking-wider">My Engine Hours</span>
            <div className="w-8 h-8 rounded-lg bg-orange-50 text-primary flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-heading font-black text-ink tracking-tight">
              {loading ? '...' : summary.totalHours}
            </span>
            <span className="text-xs font-mono text-muted uppercase">Hours Logged</span>
          </div>
          <div className="mt-2 text-[11px] text-muted flex items-center gap-1 font-mono">
            <span className="text-primary font-bold">
              {summary.totalShifts > 0 ? (summary.totalHours / summary.totalShifts).toFixed(1) : '0'} hrs
            </span>
            <span>average per logged shift</span>
          </div>
        </div>

        {/* Card 2: My Voucher Verification Compliance */}
        <div className="bg-white border border-border rounded-2xl p-5 shadow-card relative overflow-hidden group hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between text-muted text-xs font-mono">
            <span className="uppercase tracking-wider">My Voucher Approval</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-heading font-black text-ink tracking-tight">
              {loading ? '...' : `${summary.approvalRate}%`}
            </span>
            <span className="text-xs font-mono text-emerald-600 font-bold uppercase">Approval Rate</span>
          </div>
          <div className="mt-2 text-[11px] text-muted flex items-center gap-1 font-mono">
            <span className="text-emerald-700 font-bold">{summary.approvedShifts} Approved</span>
            <span>•</span>
            <span className="text-amber-600 font-bold">{summary.pendingShifts} In Review</span>
          </div>
        </div>

        {/* Card 3: My Diesel Consumption & Burn */}
        <div className="bg-white border border-border rounded-2xl p-5 shadow-card relative overflow-hidden group hover:border-amber-300 transition-all">
          <div className="flex items-center justify-between text-muted text-xs font-mono">
            <span className="uppercase tracking-wider">Diesel Logged</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Fuel className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-heading font-black text-ink tracking-tight">
              {loading ? '...' : summary.totalFuelLitres}
            </span>
            <span className="text-xs font-mono text-muted uppercase">Litres</span>
          </div>
          <div className="mt-2 text-[11px] text-muted flex items-center gap-1 font-mono">
            <span className="text-amber-700 font-bold">{summary.avgFuelBurnRate} L/hr</span>
            <span>average burn efficiency</span>
          </div>
        </div>

        {/* Card 4: Machinery Assigned to Me */}
        <div className="bg-white border border-border rounded-2xl p-5 shadow-card relative overflow-hidden group hover:border-primary/40 transition-all">
          <div className="flex items-center justify-between text-muted text-xs font-mono">
            <span className="uppercase tracking-wider">Assigned Plants</span>
            <div className="w-8 h-8 rounded-lg bg-orange-50 text-primary flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-heading font-black text-ink tracking-tight">
              {loading ? '...' : summary.machinesOperatedCount}
            </span>
            <span className="text-xs font-mono text-muted uppercase">Machines Operated</span>
          </div>
          <div className="mt-2 text-[11px] text-muted flex items-center gap-1 font-mono truncate">
            <span className="text-ink font-bold">
              {data?.machineBreakdown?.[0]?.machine_name?.split(' ')[0] || 'Equipment'}
            </span>
            <span>primary plant assigned</span>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 5. Interactive Charts Deck                               */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Shift Yield & Fuel Burn Timeline Area Chart (2 cols) */}
        <div className="lg:col-span-2 bg-white border border-border rounded-2xl p-5 sm:p-6 shadow-card space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/80 pb-3">
            <div>
              <h2 className="font-heading font-black text-base text-ink flex items-center gap-2">
                <Gauge className="w-4 h-4 text-primary" />
                My Shift Yield & Fuel Consumption Timeline
              </h2>
              <p className="text-xs text-muted">
                Daily record of engine hours clocked and diesel fuel added on your assigned machines.
              </p>
            </div>
            <div className="text-[11px] font-mono text-primary font-bold px-2.5 py-1 rounded-lg bg-orange-50 border border-orange-200 self-start sm:self-auto">
              {data?.timeline?.length || 0} Shift Days
            </div>
          </div>

          <StaffYieldTimelineAreaChart data={data?.timeline || []} />
        </div>

        {/* Right Column: Verification Status Ratio Donut Chart (1 col) */}
        <div className="bg-white border border-border rounded-2xl p-5 sm:p-6 shadow-card space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-border/80 pb-3">
              <h2 className="font-heading font-black text-base text-ink flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-emerald-600" />
                My Shift Vouchers
              </h2>
              <span className="text-[10px] font-mono font-bold text-muted uppercase">
                Supervisor Sign-off
              </span>
            </div>
            <p className="text-xs text-muted mt-2">
              Status of your submitted daily logs and proof photos reviewed by dispatch.
            </p>
          </div>

          <StaffVerificationDonutChart data={data?.verificationStats || []} />

          <div className="pt-2 border-t border-border/80 space-y-2 font-mono text-xs">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-zinc-600">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                Approved Vouchers:
              </span>
              <span className="font-bold text-emerald-700">{summary.approvedShifts}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-zinc-600">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                Pending Verification:
              </span>
              <span className="font-bold text-amber-700">{summary.pendingShifts}</span>
            </div>
            {summary.rejectedShifts > 0 && (
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-zinc-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
                  Flagged for Audit:
                </span>
                <span className="font-bold text-rose-700">{summary.rejectedShifts}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Equipment Hours Breakdown & Burn Index */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Machinery Hours Bar Chart (2 cols) */}
        <div className="lg:col-span-2 bg-white border border-border rounded-2xl p-5 sm:p-6 shadow-card space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/80 pb-3">
            <div>
              <h2 className="font-heading font-black text-base text-ink flex items-center gap-2">
                <Truck className="w-4 h-4 text-primary" />
                Hours Clocked Per Machine Asset
              </h2>
              <p className="text-xs text-muted">
                Operating time distribution across machines assigned to you.
              </p>
            </div>
          </div>

          <StaffEquipmentHoursBarChart data={data?.machineBreakdown || []} />
        </div>

        {/* Machinery Fuel Efficiency Matrix (1 col) */}
        <div className="bg-white border border-border rounded-2xl p-5 sm:p-6 shadow-card space-y-4">
          <div className="border-b border-border/80 pb-3">
            <h2 className="font-heading font-black text-base text-ink flex items-center gap-2">
              <Fuel className="w-4 h-4 text-amber-600" />
              Machine Fuel Burn Index
            </h2>
            <p className="text-xs text-muted mt-1">
              Your average diesel consumption rate per engine operating hour.
            </p>
          </div>

          <div className="space-y-3 overflow-y-auto max-h-[300px] pr-1">
            {data?.machineBreakdown && data.machineBreakdown.length > 0 ? (
              data.machineBreakdown.map((machine, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl border border-border bg-surface/50 hover:bg-orange-50/40 transition-colors space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-ink truncate max-w-[180px]">
                      {machine.machine_name}
                    </span>
                    <span className="text-[11px] font-mono font-bold text-primary">
                      {machine.total_hours} hrs
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-mono text-muted">
                    <span>{machine.category}</span>
                    <span>
                      {machine.avg_burn_rate > 0 ? (
                        <span className="text-amber-700 font-bold">{machine.avg_burn_rate} L/hr</span>
                      ) : (
                        <span>N/A</span>
                      )}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-xs text-muted font-mono">
                No machine breakdown data recorded yet.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 6. My Verified Shifts Telematics Ledger Table            */}
      {/* ======================================================== */}
      <div className="bg-white border border-border rounded-2xl p-5 sm:p-6 shadow-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/80 pb-4">
          <div>
            <h2 className="font-heading font-black text-lg text-ink flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-primary" />
              My Shift Telematics & Gauge Proofs
            </h2>
            <p className="text-xs text-muted mt-0.5">
              Verified record of your daily shift logs, hour meters, and attached camera proof photos.
            </p>
          </div>

          {/* Machine Filter & Search */}
          <div className="flex flex-wrap items-center gap-2">
            {uniqueMachines.length > 1 && (
              <div className="relative">
                <select
                  value={selectedMachine}
                  onChange={(e) => setSelectedMachine(e.target.value)}
                  className="px-3 py-1.5 text-xs font-mono bg-surface border border-border rounded-xl text-ink cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="ALL">All My Machinery ({uniqueMachines.length})</option>
                  {uniqueMachines.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="text"
                placeholder="Search my shift work..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-surface border border-border rounded-xl text-ink focus:outline-none focus:ring-1 focus:ring-primary w-40 sm:w-48 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Ledger Table Container */}
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-surface border-b border-border font-mono text-muted uppercase text-[10px] tracking-wider">
                <th className="py-3 px-3.5">Date & Shift</th>
                <th className="py-3 px-3.5">Machine Plant</th>
                <th className="py-3 px-3.5">Meter Interval</th>
                <th className="py-3 px-3.5 text-right">Hours Clocked</th>
                <th className="py-3 px-3.5 text-right">Fuel Added</th>
                <th className="py-3 px-3.5 text-center">Gauge Proofs</th>
                <th className="py-3 px-3.5 text-center">Status</th>
                <th className="py-3 px-3.5">Work Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-muted font-mono">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto text-primary mb-2" />
                    Loading your personal shift telematics...
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 px-4 text-center">
                    <div className="max-w-md mx-auto space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-orange-50 text-primary mx-auto flex items-center justify-center shadow-subtle">
                        <ClipboardList className="w-6 h-6" />
                      </div>
                      <div className="font-heading font-black text-ink text-base">
                        No Shift Logs Found for {currentOperator?.full_name || 'Your Account'}
                      </div>
                      <p className="text-xs text-muted leading-relaxed font-sans">
                        You have not recorded any machine shift logs yet. Once you complete a shift and submit your hour meter proof photos, your personal telematics ledger and fuel burn graphs will appear here.
                      </p>
                      <div className="pt-2">
                        <Link
                          href="/staff"
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-primary text-white hover:bg-primary-hover shadow-orange transition-all cursor-pointer"
                        >
                          <ClipboardList className="w-4 h-4" />
                          <span>Submit My First Shift Log</span>
                        </Link>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const hours = Math.max(0, parseFloat(log.hours_worked || (log.end_meter - log.start_meter) || '0')).toFixed(1);
                  const isApproved = (log.verification_status || 'PENDING') === 'APPROVED';
                  const isRejected = (log.verification_status || 'PENDING') === 'REJECTED';
                  const hasStartProof = Boolean(log.start_meter_proof_image);
                  const hasEndProof = Boolean(log.end_meter_proof_image || log.meter_proof_image);
                  const hasFuelProof = Boolean(log.fuel_proof_image);

                  return (
                    <tr key={log.id} className="hover:bg-orange-50/20 transition-colors">
                      {/* Date & Shift */}
                      <td className="py-3 px-3.5 whitespace-nowrap font-mono text-[11px]">
                        <div className="font-bold text-ink">
                          {new Date(log.date_submitted).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </div>
                        <div className="text-muted text-[10px]">
                          {new Date(log.date_submitted).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </td>

                      {/* Equipment */}
                      <td className="py-3 px-3.5">
                        <div className="font-bold text-ink truncate max-w-[180px]">
                          {log.equipment_name || 'Machine'}
                        </div>
                        <div className="text-[10px] text-muted font-mono truncate max-w-[180px]">
                          {log.equipment_model || 'Plant Machinery'}
                        </div>
                      </td>

                      {/* Meter Interval */}
                      <td className="py-3 px-3.5 font-mono text-[11px] whitespace-nowrap">
                        <span className="text-zinc-600">{log.start_meter}h</span>
                        <span className="mx-1 text-primary">→</span>
                        <span className="font-bold text-ink">{log.end_meter}h</span>
                      </td>

                      {/* Hours Logged */}
                      <td className="py-3 px-3.5 font-mono text-[11px] text-right font-black text-primary whitespace-nowrap">
                        +{hours} hrs
                      </td>

                      {/* Fuel Added */}
                      <td className="py-3 px-3.5 font-mono text-[11px] text-right whitespace-nowrap">
                        {log.fuel_amount > 0 ? (
                          <span className="font-bold text-amber-700">{log.fuel_amount} L</span>
                        ) : (
                          <span className="text-muted">—</span>
                        )}
                      </td>

                      {/* Gauge Proofs */}
                      <td className="py-3 px-3.5 whitespace-nowrap text-center">
                        <div className="inline-flex items-center gap-1.5">
                          {hasStartProof && (
                            <button
                              type="button"
                              onClick={() =>
                                setSelectedProofModal({
                                  url: log.start_meter_proof_image,
                                  title: `Start Hour Meter: ${log.start_meter} hrs`,
                                  type: 'START_METER',
                                  meter: log.start_meter,
                                  shiftId: log.id,
                                })
                              }
                              className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 transition-colors flex items-center gap-1 cursor-pointer"
                              title="View start meter photo"
                            >
                              <Gauge className="w-3 h-3 text-amber-600" />
                              <span>Start</span>
                            </button>
                          )}

                          {hasEndProof && (
                            <button
                              type="button"
                              onClick={() =>
                                setSelectedProofModal({
                                  url: log.end_meter_proof_image || log.meter_proof_image,
                                  title: `End Hour Meter: ${log.end_meter} hrs`,
                                  type: 'END_METER',
                                  meter: log.end_meter,
                                  shiftId: log.id,
                                })
                              }
                              className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-orange-50 text-primary border border-orange-200 hover:bg-orange-100 transition-colors flex items-center gap-1 cursor-pointer"
                              title="View end meter photo"
                            >
                              <Gauge className="w-3 h-3 text-primary" />
                              <span>End</span>
                            </button>
                          )}

                          {hasFuelProof && (
                            <button
                              type="button"
                              onClick={() =>
                                setSelectedProofModal({
                                  url: log.fuel_proof_image,
                                  title: `Diesel Fuel Slip: ${log.fuel_amount} L`,
                                  type: 'FUEL_RECEIPT',
                                  shiftId: log.id,
                                })
                              }
                              className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-zinc-100 text-zinc-800 border border-zinc-200 hover:bg-zinc-200 transition-colors flex items-center gap-1 cursor-pointer"
                              title="View fuel slip"
                            >
                              <Fuel className="w-3 h-3 text-zinc-600" />
                              <span>Fuel</span>
                            </button>
                          )}

                          {!hasStartProof && !hasEndProof && !hasFuelProof && (
                            <span className="text-[10px] font-mono text-muted">No photo</span>
                          )}
                        </div>
                      </td>

                      {/* Audit Status */}
                      <td className="py-3 px-3.5 whitespace-nowrap text-center">
                        <span
                          className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-full border inline-flex items-center gap-1 ${
                            isApproved
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : isRejected
                              ? 'bg-rose-50 text-rose-800 border-rose-200'
                              : 'bg-amber-50 text-amber-800 border-amber-200'
                          }`}
                        >
                          {isApproved && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                          {!isApproved && !isRejected && <Clock className="w-3 h-3 text-amber-600" />}
                          {isRejected && <AlertCircle className="w-3 h-3 text-rose-600" />}
                          <span>{log.verification_status || 'PENDING'}</span>
                        </span>
                      </td>

                      {/* Work Description */}
                      <td className="py-3 px-3.5 max-w-xs text-zinc-700 truncate" title={log.work_description}>
                        {log.work_description || 'Daily operational earthmoving work'}
                        {log.audit_notes && (
                          <span className="block text-[10px] text-primary italic font-mono truncate">
                            Supervisor note: {log.audit_notes}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 7. Full-Screen Photo Proof Inspection Modal              */}
      {/* ======================================================== */}
      {selectedProofModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-border rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-4 border-b border-border flex items-center justify-between bg-surface">
              <div className="flex items-center gap-2">
                <Gauge className="w-5 h-5 text-primary" />
                <div>
                  <h3 className="font-heading font-black text-sm text-ink uppercase">
                    {selectedProofModal.title}
                  </h3>
                  <span className="text-[10px] font-mono text-muted">
                    Shift ID: {selectedProofModal.shiftId}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedProofModal(null)}
                className="p-1.5 rounded-lg text-muted hover:text-ink hover:bg-surface-hover transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Image Display */}
            <div className="p-4 bg-zinc-950 flex items-center justify-center min-h-[300px] max-h-[500px] overflow-hidden">
              <img
                src={selectedProofModal.url}
                alt={selectedProofModal.title}
                className="max-h-[460px] w-auto max-w-full object-contain rounded-lg"
              />
            </div>

            {/* Modal Footer */}
            <div className="p-3.5 border-t border-border bg-white flex items-center justify-between">
              <div className="text-xs font-mono text-zinc-600">
                {selectedProofModal.meter !== undefined && (
                  <span>Verified Gauge: <strong className="text-primary">{selectedProofModal.meter} hrs</strong></span>
                )}
              </div>
              <a
                href={selectedProofModal.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-primary hover:bg-orange-50 transition-colors"
              >
                <span>Open Full Size</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
