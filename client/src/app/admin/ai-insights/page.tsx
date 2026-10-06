'use client';

import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  AlertTriangle, 
  TrendingUp, 
  Fuel, 
  Clock, 
  BrainCircuit, 
  RefreshCw, 
  CheckCircle2, 
  ShieldAlert,
  ArrowRight,
  Zap,
  Bot,
  Send
} from 'lucide-react';
import MarkdownRenderer from '@/components/common/MarkdownRenderer';

interface Anomaly {
  type: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  equipment: string;
  operator: string;
  detail: string;
  metric: string;
  recommendation: string;
}

interface CostSummary {
  equipment: string;
  hours: number;
  fuelLitres: number;
  costPerHourKES: string;
}

interface AIInsightData {
  timeWindowDays: number;
  totalLogsAnalyzed: number;
  anomaliesDetected: Anomaly[];
  costPerHourSummary: CostSummary[];
  weeklyExecutiveSummary: string;
}

export default function AIInsightsPage() {
  const [data, setData] = useState<AIInsightData | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(7);
  const [taskCreatedMsg, setTaskCreatedMsg] = useState<string | null>(null);

  // Interactive AI Advisory State
  const [customQuery, setCustomQuery] = useState('');
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [askingAI, setAskingAI] = useState(false);

  const fetchAIInsights = async () => {
    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api/v1';
      const res = await fetch(`${apiUrl}/analytics/ai-insights?days=${days}`);
      const json = await res.json();
      if (json?.success) {
        setData(json?.data);
      }
    } catch (err) {
      console.error('Failed to fetch AI Insights:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWorkOrder = async (anom: any) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api/v1';
      // Fetch equipment list to map machine name to ID
      const eqRes = await fetch(`${apiUrl}/equipment`);
      const eqJson = await eqRes.json();
      const match = (eqJson?.data || []).find((e: any) => 
        e.name.toLowerCase().includes((anom.equipment || '').toLowerCase()) || 
        e.model.toLowerCase().includes((anom.equipment || '').toLowerCase())
      );
      const equipmentId = match?.id || '11111111-1111-1111-1111-111111111101';

      const taskRes = await fetch(`${apiUrl}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          equipmentId,
          taskType: 'ANOMALY_INSPECTION',
          priority: anom.severity || 'HIGH',
          description: `Mechanical Inspection Order: ${anom.detail || anom.issue}. Action: ${anom.recommendation}`,
        }),
      });

      if (taskRes.ok) {
        setTaskCreatedMsg(`Work order dispatched to field mechanics for ${anom.equipment}!`);
        setTimeout(() => setTaskCreatedMsg(null), 4000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAskAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customQuery.trim() || askingAI) return;
    setAskingAI(true);
    setAiResponse(null);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api/v1';
      const res = await fetch(`${apiUrl}/ai/consultant`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: customQuery.trim() }),
      });
      const json = await res.json();
      if (json?.success) {
        setAiResponse(json?.data?.replyMarkdown);
      } else {
        setAiResponse('Unable to query Groq AI. Error: ' + (json?.error || 'Unknown error'));
      }
    } catch (err: any) {
      setAiResponse('Connection error querying Groq AI: ' + err.message);
    } finally {
      setAskingAI(false);
    }
  };

  useEffect(() => {
    fetchAIInsights();
  }, [days]);

  const anomalies = data?.anomaliesDetected ?? [];
  const costSummaries = data?.costPerHourSummary ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-primary font-mono tracking-wider uppercase">Module 6</span>
            <span className="text-muted">/</span>
            <span className="text-xs text-muted font-medium">Intelligence</span>
          </div>
          <h1 className="text-2xl font-heading font-black text-foreground flex items-center gap-2.5 mt-1">
            <Sparkles className="w-6 h-6 text-primary" />
            AI Operational Insights & Anomaly Detection
          </h1>
          <p className="text-sm text-muted mt-0.5">
            Gemini-powered heuristic audit analyzing operator shift yields, diesel consumption spikes, and equipment burn rates.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="bg-white border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary font-mono shadow-subtle cursor-pointer"
          >
            <option value={7}>Past 7 Days</option>
            <option value={14}>Past 14 Days</option>
            <option value={30}>Past 30 Days</option>
          </select>

          <button 
            onClick={fetchAIInsights}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-sm font-semibold transition-all shadow-subtle cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Re-Run Audit
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-16 text-center text-muted bg-white border border-border rounded-2xl shadow-subtle">
          <BrainCircuit className="w-12 h-12 animate-pulse mx-auto text-primary mb-3" />
          <div className="text-lg font-heading font-bold text-foreground">Synthesizing Machine Telematics & Logs...</div>
          <p className="text-xs text-muted mt-1">Evaluating fuel burn rates, meter jumps, and fatigue risks.</p>
        </div>
      ) : data ? (
        <>
          {/* Executive Summary Card */}
          <div className="bg-gradient-to-r from-orange-50 via-white to-orange-50 border border-orange-200 rounded-2xl p-6 sm:p-7 relative overflow-hidden shadow-subtle">
            <div className="flex items-center gap-2 text-primary font-mono text-xs uppercase tracking-wider font-bold mb-2">
              <Sparkles className="w-4 h-4" />
              <span>Weekly Executive Operations Summary</span>
            </div>

            <h2 className="text-xl font-heading font-bold text-foreground mb-3">
              Fleet Efficiency & Cost Analysis ({data.timeWindowDays} Day Window)
            </h2>

            <div className="bg-white/90 border border-orange-200/80 rounded-xl p-5 shadow-sm mt-3">
              <MarkdownRenderer content={data.weeklyExecutiveSummary} />
            </div>

            <div className="mt-4 pt-4 border-t border-orange-200/60 flex flex-wrap gap-4 text-xs font-mono text-muted">
              <div>Total Logs Audited: <span className="text-foreground font-bold">{data.totalLogsAnalyzed}</span></div>
              <div>•</div>
              <div>Anomalies Detected: <span className="text-rose-700 font-bold">{anomalies.length}</span></div>
              <div>•</div>
              <div>AI Engine: <span className="text-emerald-700 font-bold">Groq 120B Active (Markdown Compiled)</span></div>
            </div>
          </div>

          {/* Interactive Groq AI Advisory Console */}
          <div className="bg-white border border-border rounded-2xl p-6 shadow-subtle space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-orange-100 text-primary flex items-center justify-center font-bold">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-heading font-bold text-foreground">
                    Interactive Groq AI Fleet & Operations Consultant
                  </h3>
                  <p className="text-xs text-muted font-mono">
                    Powered by Groq 120B LLM • Instant industrial guidance for Kenyan quarry & plant operations
                  </p>
                </div>
              </div>
              <span className="hidden sm:inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-zinc-100 text-zinc-700 border border-border">
                Markdown UI Compiler Active
              </span>
            </div>

            <form onSubmit={handleAskAI} className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customQuery}
                  onChange={(e) => setCustomQuery(e.target.value)}
                  placeholder="e.g. 'Estimate fuel consumption for 5 days of Komatsu Excavator quarrying in Nkubu' or 'Recommend maintenance steps for hydraulic overheating'..."
                  className="flex-1 bg-surface border border-border rounded-xl px-4 py-2.5 text-xs text-foreground focus:outline-none focus:border-primary focus:bg-white transition-all font-mono"
                />
                <button
                  type="submit"
                  disabled={askingAI || !customQuery.trim()}
                  className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-heading font-bold uppercase transition-all shadow-subtle flex items-center gap-2 shrink-0 disabled:opacity-50 cursor-pointer"
                >
                  <Send className={`w-3.5 h-3.5 ${askingAI ? 'animate-pulse' : ''}`} />
                  <span>{askingAI ? 'Thinking...' : 'Consult AI'}</span>
                </button>
              </div>
            </form>

            {aiResponse && (
              <div className="p-5 bg-surface border border-border rounded-xl animate-in fade-in shadow-inner">
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-border text-xs font-mono text-muted">
                  <span className="text-primary font-bold">🤖 Groq Operations Intelligence Response:</span>
                  <button 
                    onClick={() => setAiResponse(null)}
                    className="text-zinc-500 hover:text-zinc-800 text-[11px]"
                  >
                    Clear
                  </button>
                </div>
                <MarkdownRenderer content={aiResponse} />
              </div>
            )}
          </div>

          {taskCreatedMsg && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-800 text-xs font-mono font-bold flex items-center gap-2 shadow-subtle animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{taskCreatedMsg}</span>
            </div>
          )}

          {/* Anomalies Detected Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-heading font-bold text-foreground flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-600" />
                Detected Operational Anomalies & Alerts ({anomalies.length})
              </h3>
              <span className="text-xs font-mono text-muted">Auto-generated via consumption & meter rules</span>
            </div>

            {anomalies.length === 0 ? (
              <div className="bg-white border border-border rounded-xl p-8 text-center text-muted shadow-subtle">
                <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-600 mb-2" />
                <div className="text-foreground font-semibold">All Equipment Within Nominal Thresholds</div>
                <p className="text-xs text-muted mt-1">No abnormal fuel drains or zero-work log spikes detected.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {anomalies.map((anom, idx) => {
                  const isHigh = anom.severity === 'HIGH';
                  return (
                    <div 
                      key={idx} 
                      className={`bg-white border rounded-xl p-5 space-y-3 transition-all shadow-subtle ${
                        isHigh ? 'border-rose-300 bg-rose-50/40' : 'border-amber-300 bg-amber-50/40'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
                          isHigh ? 'bg-rose-100 text-rose-800 border border-rose-200' : 'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}>
                          {anom.severity} PRIORITY • {anom.type}
                        </span>
                        <span className="text-xs font-mono text-muted">{anom.operator}</span>
                      </div>

                      <div>
                        <div className="text-base font-heading font-bold text-foreground">{anom.equipment}</div>
                        <p className="text-xs text-zinc-700 mt-1">{anom.detail}</p>
                      </div>

                      <div className="p-3 bg-white border border-border rounded-lg text-xs font-mono flex items-center justify-between">
                        <span className="text-muted">Recorded Metric:</span>
                        <span className="text-rose-700 font-bold">{anom.metric}</span>
                      </div>

                      <div className="text-xs text-zinc-600 flex items-start gap-1.5 pt-1">
                        <ArrowRight className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                        <span><strong className="text-foreground">Recommended Action:</strong> {anom.recommendation}</span>
                      </div>

                      <div className="pt-2 border-t border-border/60 flex justify-end">
                        <button
                          onClick={() => handleCreateWorkOrder(anom)}
                          className="px-3 py-1.5 bg-primary hover:bg-primary-hover text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-subtle cursor-pointer transition-colors"
                        >
                          <Zap className="w-3.5 h-3.5" /> Dispatch Work Order
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Cost Per Engine Hour Breakdown */}
          <div className="bg-white border border-border rounded-xl p-5 space-y-4 shadow-subtle">
            <h3 className="text-lg font-heading font-bold text-foreground flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Machine Fuel Burn & Cost-Per-Engine-Hour (KES)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {costSummaries.map((item, idx) => (
                <div key={idx} className="bg-surface border border-border rounded-xl p-4 space-y-2">
                  <div className="font-bold text-foreground text-sm truncate">{item.equipment}</div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted font-mono">Total Engine Hours:</span>
                    <span className="text-amber-700 font-mono font-bold">{item.hours.toFixed(1)} hrs</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted font-mono">Diesel Consumed:</span>
                    <span className="text-emerald-700 font-mono font-bold">{item.fuelLitres.toFixed(0)} L</span>
                  </div>
                  <div className="pt-2 border-t border-border flex justify-between items-center">
                    <span className="text-xs text-zinc-700 font-medium">Cost per Hour:</span>
                    <span className="text-sm font-heading font-bold text-primary font-mono">{item.costPerHourKES}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
