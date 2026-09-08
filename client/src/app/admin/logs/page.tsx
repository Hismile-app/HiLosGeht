'use client';

import React, { useState, useEffect } from 'react';
import { 
  ClipboardList, 
  Search, 
  Filter, 
  Fuel, 
  Clock, 
  Truck, 
  User, 
  FileText, 
  CheckCircle, 
  AlertTriangle,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import GlassCard from '@/components/common/GlassCard';

interface StaffLog {
  id: string;
  equipment_name: string;
  equipment_model: string;
  category: string;
  operator_name: string;
  operator_email: string;
  start_meter: string | number;
  end_meter: string | number;
  hours_worked: string | number;
  fuel_amount: string | number;
  yield_description: string;
  materials_received?: string;
  fuel_proof_image?: string;
  materials_proof_image?: string;
  date_submitted: string;
}

export default function DailyLogsPage() {
  const [logs, setLogs] = useState<StaffLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [selectedLog, setSelectedLog] = useState<StaffLog | null>(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
      const res = await fetch(`${apiUrl}/logs`);
      const data = await res.json();
      if (data?.success) {
        setLogs(data?.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch staff logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = (logs ?? []).filter(log => {
    const matchesSearch = 
      (log.equipment_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (log.equipment_model || '').toLowerCase().includes(search.toLowerCase()) ||
      (log.operator_name && log.operator_name.toLowerCase().includes(search.toLowerCase())) ||
      (log.yield_description && log.yield_description.toLowerCase().includes(search.toLowerCase()));
    
    const matchesCategory = filterCategory === 'ALL' || log.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const totalHoursLogged = (logs ?? []).reduce((acc, l) => acc + parseFloat(l.hours_worked as string || '0'), 0);
  const totalFuelLogged = (logs ?? []).reduce((acc, l) => acc + parseFloat(l.fuel_amount as string || '0'), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-primary font-mono tracking-wider uppercase">Module 5</span>
            <span className="text-muted">/</span>
            <span className="text-xs text-muted font-medium">Operations</span>
          </div>
          <h1 className="text-2xl font-heading font-black text-foreground flex items-center gap-2.5 mt-1">
            <ClipboardList className="w-6 h-6 text-primary" />
            Daily Staff Logs & Shift Ledger
          </h1>
          <p className="text-sm text-muted mt-0.5">
            Real-time feed of equipment hour meter readings, fuel receipts, materials tracking, and site output notes.
          </p>
        </div>

        <button 
          onClick={fetchLogs}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-surface text-foreground rounded-lg border border-border text-sm font-semibold transition-all shadow-subtle cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 text-primary ${loading ? 'animate-spin' : ''}`} />
          Refresh Ledger
        </button>
      </div>

      {/* Summary Stat Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-border rounded-xl p-4 flex items-center gap-3 shadow-subtle">
          <div className="p-3 bg-orange-50 rounded-lg text-primary">
            <ClipboardList className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-muted font-mono font-semibold">TOTAL LOGS RECORDED</div>
            <div className="text-xl font-heading font-bold text-foreground">{logs.length} entries</div>
          </div>
        </div>

        <div className="bg-white border border-border rounded-xl p-4 flex items-center gap-3 shadow-subtle">
          <div className="p-3 bg-amber-50 rounded-lg text-amber-600">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-muted font-mono font-semibold">TOTAL ENGINE HOURS</div>
            <div className="text-xl font-heading font-bold text-amber-700">{totalHoursLogged.toFixed(1)} hrs</div>
          </div>
        </div>

        <div className="bg-white border border-border rounded-xl p-4 flex items-center gap-3 shadow-subtle">
          <div className="p-3 bg-emerald-50 rounded-lg text-emerald-600">
            <Fuel className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-muted font-mono font-semibold">DIESEL CONSUMED</div>
            <div className="text-xl font-heading font-bold text-emerald-700">{totalFuelLogged.toFixed(0)} Litres</div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white border border-border rounded-xl p-3 shadow-subtle">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by machine, model, operator name, or shift tasks..."
            className="w-full pl-9 pr-4 py-2 bg-surface border border-border rounded-lg text-sm text-foreground placeholder-zinc-400 focus:outline-none focus:border-primary focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted" />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-surface border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary cursor-pointer"
          >
            <option value="ALL">All Machinery</option>
            <option value="EARTHMOVING">Earthmoving</option>
            <option value="COMPACTION">Compaction</option>
            <option value="ROADWORK">Roadwork</option>
            <option value="HAULAGE">Haulage</option>
          </select>
        </div>
      </div>

      {/* Logs Table / Cards */}
      <div className="bg-white border border-border rounded-xl overflow-hidden shadow-subtle">
        {loading ? (
          <div className="p-12 text-center text-muted">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-primary mb-2" />
            Loading shift logs from Meru operations...
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-muted">
            <ClipboardList className="w-10 h-10 mx-auto text-zinc-300 mb-2" />
            No shift logs found matching your filter criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-foreground">
              <thead className="bg-surface text-xs font-mono uppercase text-zinc-600 border-b border-border">
                <tr>
                  <th className="px-4 py-3">Date & Time</th>
                  <th className="px-4 py-3">Machinery / Model</th>
                  <th className="px-4 py-3">Operator</th>
                  <th className="px-4 py-3">Engine Hours</th>
                  <th className="px-4 py-3">Fuel (L)</th>
                  <th className="px-4 py-3">Shift Notes & Proof</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredLogs.map((log) => {
                  const hours = parseFloat(log.hours_worked as string || '0');
                  const fuel = parseFloat(log.fuel_amount as string || '0');
                  const fuelPerHour = hours > 0 ? (fuel / hours).toFixed(1) : '0';
                  const isHighFuel = parseFloat(fuelPerHour) > 40;

                  return (
                    <tr key={log.id} className="hover:bg-surface transition-colors">
                      <td className="px-4 py-3.5 whitespace-nowrap text-xs font-mono text-zinc-600">
                        {new Date(log.date_submitted).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-foreground flex items-center gap-1.5">
                          <Truck className="w-3.5 h-3.5 text-primary" />
                          {log.equipment_name}
                        </div>
                        <div className="text-xs text-muted font-mono">{log.equipment_model} • {log.category}</div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5 text-zinc-800">
                          <User className="w-3.5 h-3.5 text-zinc-500" />
                          <span>{log.operator_name || 'Assigned Operator'}</span>
                        </div>
                        <div className="text-xs text-muted font-mono">{log.operator_email || 'Meru Site Crew'}</div>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="font-bold text-amber-700">{hours.toFixed(1)} hrs</div>
                        <div className="text-xs text-muted font-mono">
                          {log.start_meter} &rarr; {log.end_meter}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="font-bold text-emerald-700">{fuel.toFixed(0)} L</div>
                        <div className={`text-[11px] font-mono ${isHighFuel ? 'text-rose-700 flex items-center gap-1 font-bold' : 'text-muted'}`}>
                          {isHighFuel && <AlertTriangle className="w-3 h-3" />}
                          {fuelPerHour} L/hr
                        </div>
                      </td>
                      <td className="px-4 py-3.5 max-w-xs">
                        <p className="text-xs text-zinc-700 truncate" title={log.yield_description}>
                          {log.yield_description || 'No work details provided.'}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          {log.fuel_proof_image && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <FileText className="w-3 h-3" /> Fuel Receipt
                            </span>
                          )}
                          {log.materials_proof_image && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-orange-50 text-primary border border-orange-200">
                              <FileText className="w-3 h-3" /> Delivery Note
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="px-2.5 py-1.5 bg-surface hover:bg-primary text-foreground hover:text-white rounded-lg text-xs font-semibold border border-border transition-all cursor-pointer"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Detail View */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-border rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-lg font-heading font-bold text-foreground flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-primary" />
                Shift Log Inspection
              </h3>
              <button 
                onClick={() => setSelectedLog(null)}
                className="text-zinc-400 hover:text-foreground text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-1 border-b border-border">
                <span className="text-muted">Machine</span>
                <span className="text-foreground font-bold">{selectedLog.equipment_name} ({selectedLog.equipment_model})</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border">
                <span className="text-muted">Operator</span>
                <span className="text-foreground">{selectedLog.operator_name || 'Site Crew'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border">
                <span className="text-muted">Hour Meter Range</span>
                <span className="text-amber-700 font-mono font-bold">
                  {selectedLog.start_meter} &rarr; {selectedLog.end_meter} ({selectedLog.hours_worked} hrs)
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-border">
                <span className="text-muted">Diesel Added</span>
                <span className="text-emerald-700 font-mono font-bold">{selectedLog.fuel_amount} Litres</span>
              </div>
              <div>
                <span className="text-muted block mb-1">Work Description & Site Output</span>
                <div className="p-3 bg-surface border border-border rounded-lg text-xs text-zinc-700 font-mono whitespace-pre-wrap">
                  {selectedLog.yield_description || 'Standard earthmoving/grading operations.'}
                </div>
              </div>

              {selectedLog.materials_received && (
                <div>
                  <span className="text-muted block mb-1">Materials / Haulage Details</span>
                  <div className="p-3 bg-surface border border-border rounded-lg text-xs text-zinc-700 font-mono">
                    {selectedLog.materials_received}
                  </div>
                </div>
              )}

              {(selectedLog.fuel_proof_image || selectedLog.materials_proof_image) && (
                <div className="pt-2">
                  <span className="text-muted block mb-2 font-mono text-xs uppercase font-semibold">Attached Proof Documents</span>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedLog.fuel_proof_image && (
                      <div className="p-2 bg-surface border border-border rounded-lg text-center">
                        <img 
                          src={selectedLog.fuel_proof_image} 
                          alt="Fuel Receipt" 
                          className="h-28 w-full object-cover rounded mb-1" 
                        />
                        <span className="text-[10px] text-zinc-500 font-mono">Fuel Receipt</span>
                      </div>
                    )}
                    {selectedLog.materials_proof_image && (
                      <div className="p-2 bg-surface border border-border rounded-lg text-center">
                        <img 
                          src={selectedLog.materials_proof_image} 
                          alt="Material Receipt" 
                          className="h-28 w-full object-cover rounded mb-1" 
                        />
                        <span className="text-[10px] text-zinc-500 font-mono">Delivery Note</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-sm font-semibold transition-all cursor-pointer"
              >
                Close Inspection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
