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
  Download, 
  Gauge,
  CheckSquare,
  Square,
  Check,
  X,
  ShieldCheck,
  ChevronDown
} from 'lucide-react';

interface StaffLog {
  id: string;
  equipment_name: string;
  equipment_model: string;
  category?: string;
  equipment_category?: string;
  operator_name?: string;
  staff_name?: string;
  operator_email?: string;
  staff_email?: string;
  start_meter: string | number;
  end_meter: string | number;
  hours_worked: string | number;
  fuel_amount: string | number;
  yield_description?: string;
  work_description?: string;
  materials_received?: string;
  fuel_proof_image?: string;
  materials_proof_image?: string;
  start_meter_proof_image?: string;
  end_meter_proof_image?: string;
  meter_proof_image?: string;
  date_submitted: string;
  verification_status?: 'PENDING' | 'APPROVED' | 'REJECTED';
  audit_notes?: string;
}

export default function DailyLogsPage() {
  const [logs, setLogs] = useState<StaffLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [selectedLog, setSelectedLog] = useState<StaffLog | null>(null);
  
  // Selection and batch actions state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [batchUpdating, setBatchUpdating] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showFeedback = (text: string, type: 'success' | 'error' = 'success') => {
    setFeedbackMsg({ type, text });
    setTimeout(() => {
      setFeedbackMsg(null);
    }, 4500);
  };

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/logs');
      const data = await res.json();
      if (data?.success) {
        setLogs(data?.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch staff logs:', err);
      showFeedback('Failed to load shift logs from server.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  // Single Log Status Update
  const handleSingleStatusChange = async (logId: string, newStatus: 'PENDING' | 'APPROVED' | 'REJECTED') => {
    setUpdatingId(logId);
    
    // Optimistic UI update
    setLogs(prev => prev.map(l => l.id === logId ? { ...l, verification_status: newStatus } : l));
    if (selectedLog && selectedLog.id === logId) {
      setSelectedLog(prev => prev ? { ...prev, verification_status: newStatus } : null);
    }

    try {
      const res = await fetch(`/api/v1/logs/${logId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verificationStatus: newStatus }),
      });
      const data = await res.json();

      if (data?.success) {
        showFeedback(`Log marked as ${newStatus}`);
      } else {
        throw new Error(data?.error || 'Update failed');
      }
    } catch (err: any) {
      console.error('Failed to update status:', err);
      showFeedback(`Failed to update log: ${err.message}`, 'error');
      // Revert from server
      fetchLogs();
    } finally {
      setUpdatingId(null);
    }
  };

  // Batch update for selected logs
  const handleBatchStatusChange = async (newStatus: 'PENDING' | 'APPROVED' | 'REJECTED') => {
    if (selectedIds.length === 0) return;
    setBatchUpdating(true);

    const idsToUpdate = [...selectedIds];
    // Optimistic UI update
    setLogs(prev => prev.map(l => idsToUpdate.includes(l.id) ? { ...l, verification_status: newStatus } : l));

    try {
      const res = await fetch('/api/v1/logs', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ids: idsToUpdate,
          verificationStatus: newStatus,
        }),
      });
      const data = await res.json();

      if (data?.success) {
        showFeedback(`Successfully updated ${data.count || idsToUpdate.length} logs to ${newStatus}`);
        setSelectedIds([]);
      } else {
        throw new Error(data?.error || 'Batch update failed');
      }
    } catch (err: any) {
      console.error('Batch status update failed:', err);
      showFeedback(`Batch update failed: ${err.message}`, 'error');
      fetchLogs();
    } finally {
      setBatchUpdating(false);
    }
  };

  // Approve all pending logs
  const handleApproveAllPending = async () => {
    const pendingLogs = logs.filter(l => (l.verification_status || 'PENDING') === 'PENDING');
    if (pendingLogs.length === 0) {
      showFeedback('No pending logs require approval.');
      return;
    }

    if (!confirm(`Are you sure you want to approve all ${pendingLogs.length} pending shift logs?`)) {
      return;
    }

    setBatchUpdating(true);
    // Optimistic UI update
    setLogs(prev => prev.map(l => (l.verification_status || 'PENDING') === 'PENDING' ? { ...l, verification_status: 'APPROVED' } : l));

    try {
      const res = await fetch('/api/v1/logs', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          approveAllPending: true,
          verificationStatus: 'APPROVED',
        }),
      });
      const data = await res.json();

      if (data?.success) {
        showFeedback(`Approved all ${data.count || pendingLogs.length} pending shift logs!`);
        setSelectedIds([]);
      } else {
        throw new Error(data?.error || 'Approve all failed');
      }
    } catch (err: any) {
      console.error('Approve all pending failed:', err);
      showFeedback(`Approve all failed: ${err.message}`, 'error');
      fetchLogs();
    } finally {
      setBatchUpdating(false);
    }
  };

  const handleExportCSV = () => {
    if (!logs.length) return;
    const headers = ['Date Submitted', 'Equipment', 'Model', 'Category', 'Operator Name', 'Operator Email', 'Start Meter', 'End Meter', 'Hours Worked', 'Fuel (L)', 'Status', 'Work Description'];
    const rows = logs.map(l => [
      `"${new Date(l.date_submitted).toLocaleDateString()}"`,
      `"${l.equipment_name || ''}"`,
      `"${l.equipment_model || ''}"`,
      `"${l.category || l.equipment_category || ''}"`,
      `"${l.operator_name || l.staff_name || 'Certified Operator'}"`,
      `"${l.operator_email || l.staff_email || 'operator@hilosgeht.co.ke'}"`,
      l.start_meter,
      l.end_meter,
      l.hours_worked,
      l.fuel_amount,
      `"${l.verification_status || 'PENDING'}"`,
      `"${(l.yield_description || l.work_description || '').replace(/"/g, '""')}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `HLG_Daily_Shift_Logs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredLogs = (logs ?? []).filter(log => {
    const operatorName = (log.operator_name || log.staff_name || '').toLowerCase();
    const operatorEmail = (log.operator_email || log.staff_email || '').toLowerCase();
    const equipName = (log.equipment_name || '').toLowerCase();
    const equipModel = (log.equipment_model || '').toLowerCase();
    const desc = (log.yield_description || log.work_description || '').toLowerCase();
    const q = search.toLowerCase();

    const matchesSearch = 
      equipName.includes(q) ||
      equipModel.includes(q) ||
      operatorName.includes(q) ||
      operatorEmail.includes(q) ||
      desc.includes(q);
    
    const categoryVal = log.category || log.equipment_category || '';
    const matchesCategory = filterCategory === 'ALL' || categoryVal.toUpperCase().includes(filterCategory.toUpperCase());
    
    const currentStatus = log.verification_status || 'PENDING';
    const matchesStatus = filterStatus === 'ALL' || currentStatus === filterStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const totalHoursLogged = (logs ?? []).reduce((acc, l) => acc + parseFloat(l.hours_worked as string || '0'), 0);
  const totalFuelLogged = (logs ?? []).reduce((acc, l) => acc + parseFloat(l.fuel_amount as string || '0'), 0);
  const pendingLogsCount = (logs ?? []).filter(l => (l.verification_status || 'PENDING') === 'PENDING').length;

  const toggleSelectRow = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredLogs.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredLogs.map(l => l.id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {feedbackMsg && (
        <div className={`p-4 rounded-xl border flex items-center justify-between shadow-lg transition-all animate-in fade-in slide-in-from-top-2 duration-300 ${
          feedbackMsg.type === 'success' 
            ? 'bg-emerald-50 border-emerald-300 text-emerald-900' 
            : 'bg-rose-50 border-rose-300 text-rose-900'
        }`}>
          <div className="flex items-center gap-2.5 text-sm font-semibold">
            {feedbackMsg.type === 'success' ? <CheckCircle className="w-5 h-5 text-emerald-600" /> : <AlertTriangle className="w-5 h-5 text-rose-600" />}
            <span>{feedbackMsg.text}</span>
          </div>
          <button onClick={() => setFeedbackMsg(null)} className="text-zinc-500 hover:text-zinc-800 text-sm font-bold">✕</button>
        </div>
      )}

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

        <div className="flex flex-wrap items-center gap-2.5">
          {pendingLogsCount > 0 && (
            <button
              onClick={handleApproveAllPending}
              disabled={batchUpdating}
              className="flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-bold transition-all shadow-subtle cursor-pointer disabled:opacity-50"
              title="Batch approve all unverified logs"
            >
              <ShieldCheck className="w-4 h-4" />
              Approve All Pending ({pendingLogsCount})
            </button>
          )}

          <button 
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-surface text-foreground rounded-lg border border-border text-sm font-semibold transition-all shadow-subtle cursor-pointer"
          >
            <Download className="w-4 h-4 text-primary" />
            Export CSV
          </button>
          
          <button 
            onClick={fetchLogs}
            disabled={loading || batchUpdating}
            className="flex items-center gap-2 px-3.5 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-sm font-semibold transition-all shadow-subtle cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Summary Stat Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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

        <div className="bg-white border border-border rounded-xl p-4 flex items-center gap-3 shadow-subtle">
          <div className={`p-3 rounded-lg ${pendingLogsCount > 0 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-50 text-emerald-600'}`}>
            {pendingLogsCount > 0 ? <Clock className="w-5 h-5 animate-pulse" /> : <CheckCircle className="w-5 h-5" />}
          </div>
          <div>
            <div className="text-xs text-muted font-mono font-semibold">PENDING APPROVAL</div>
            <div className={`text-xl font-heading font-bold ${pendingLogsCount > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
              {pendingLogsCount} {pendingLogsCount === 1 ? 'shift' : 'shifts'}
            </div>
          </div>
        </div>
      </div>

      {/* Batch Action Bar (Appears when rows are selected) */}
      {selectedIds.length > 0 && (
        <div className="bg-zinc-900 text-white rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl border border-zinc-700">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 bg-primary text-white text-xs font-bold rounded-full">
              {selectedIds.length} Marked
            </span>
            <span className="text-sm font-medium text-zinc-300">
              Apply bulk status verification to selected logs:
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleBatchStatusChange('APPROVED')}
              disabled={batchUpdating}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
            >
              <Check className="w-3.5 h-3.5" />
              Approve Marked ({selectedIds.length})
            </button>
            <button
              onClick={() => handleBatchStatusChange('REJECTED')}
              disabled={batchUpdating}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
            >
              <X className="w-3.5 h-3.5" />
              Flag / Reject Marked
            </button>
            <button
              onClick={() => handleBatchStatusChange('PENDING')}
              disabled={batchUpdating}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
            >
              <Clock className="w-3.5 h-3.5" />
              Mark Pending
            </button>
            <button
              onClick={() => setSelectedIds([])}
              className="px-2.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs font-medium cursor-pointer"
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white border border-border rounded-xl p-3 shadow-subtle">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by operator name, email, machine, model, or shift notes..."
            className="w-full pl-9 pr-4 py-2 bg-surface border border-border rounded-lg text-sm text-foreground placeholder-zinc-400 focus:outline-none focus:border-primary focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-surface border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary cursor-pointer font-medium"
          >
            <option value="ALL">All Verification Statuses</option>
            <option value="PENDING">⏳ Pending Review</option>
            <option value="APPROVED">✅ Approved Only</option>
            <option value="REJECTED">❌ Flagged / Rejected</option>
          </select>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-surface border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary cursor-pointer font-medium"
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
                  <th className="px-3 py-3 w-10 text-center">
                    <input 
                      type="checkbox"
                      checked={filteredLogs.length > 0 && selectedIds.length === filteredLogs.length}
                      onChange={toggleSelectAll}
                      className="rounded border-zinc-300 text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                      title="Select all logs"
                    />
                  </th>
                  <th className="px-4 py-3">Date & Time</th>
                  <th className="px-4 py-3">Machinery / Model</th>
                  <th className="px-4 py-3">Operator</th>
                  <th className="px-4 py-3">Engine Hours</th>
                  <th className="px-4 py-3">Fuel (L)</th>
                  <th className="px-4 py-3">Status & Shift Notes</th>
                  <th className="px-4 py-3 text-right">Actions & Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredLogs.map((log) => {
                  const hours = parseFloat(log.hours_worked as string || '0');
                  const fuel = parseFloat(log.fuel_amount as string || '0');
                  const fuelPerHour = hours > 0 ? (fuel / hours).toFixed(1) : '0';
                  const isHighFuel = parseFloat(fuelPerHour) > 40;
                  const isSelected = selectedIds.includes(log.id);
                  const status = log.verification_status || 'PENDING';

                  const opName = log.operator_name || log.staff_name || 'Certified Operator';
                  const opEmail = log.operator_email || log.staff_email || 'operator@hilosgeht.co.ke';

                  return (
                    <tr 
                      key={log.id} 
                      className={`hover:bg-surface transition-colors ${isSelected ? 'bg-orange-50/50' : ''}`}
                    >
                      <td className="px-3 py-3.5 text-center">
                        <input 
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectRow(log.id)}
                          className="rounded border-zinc-300 text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                        />
                      </td>

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
                          <Truck className="w-3.5 h-3.5 text-primary shrink-0" />
                          <span className="truncate max-w-[180px]">{log.equipment_name}</span>
                        </div>
                        <div className="text-xs text-muted font-mono">{log.equipment_model} • {log.category || log.equipment_category || 'Fleet'}</div>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5 text-zinc-900 font-medium">
                          <User className="w-3.5 h-3.5 text-primary shrink-0" />
                          <span className="truncate max-w-[200px]" title={opName}>
                            {opName}
                          </span>
                        </div>
                        <div className="text-xs text-muted font-mono truncate max-w-[200px]" title={opEmail}>
                          {opEmail}
                        </div>
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
                        {/* Status Badge */}
                        <div className="mb-1">
                          {status === 'APPROVED' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                              <CheckCircle className="w-3 h-3 text-emerald-600" /> Approved
                            </span>
                          )}
                          {status === 'PENDING' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                              <Clock className="w-3 h-3 text-amber-600" /> Pending Review
                            </span>
                          )}
                          {status === 'REJECTED' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                              <AlertTriangle className="w-3 h-3 text-rose-600" /> Flagged / Rejected
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-zinc-700 truncate" title={log.yield_description || log.work_description}>
                          {log.yield_description || log.work_description || 'No work details provided.'}
                        </p>

                        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                          {(log.meter_proof_image || log.start_meter_proof_image || log.end_meter_proof_image) && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-amber-50 text-amber-800 border border-amber-200">
                              <Gauge className="w-3 h-3 text-amber-600" /> Meter Photo
                            </span>
                          )}
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

                      {/* Actions & Status Dropdown */}
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <div className="relative">
                            <select
                              value={status}
                              disabled={updatingId === log.id || batchUpdating}
                              onChange={(e) => handleSingleStatusChange(log.id, e.target.value as any)}
                              className={`px-2.5 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer focus:outline-none shadow-xs ${
                                status === 'APPROVED'
                                  ? 'bg-emerald-50 border-emerald-400 text-emerald-800 hover:bg-emerald-100'
                                  : status === 'REJECTED'
                                  ? 'bg-rose-50 border-rose-400 text-rose-800 hover:bg-rose-100'
                                  : 'bg-amber-50 border-amber-400 text-amber-800 hover:bg-amber-100'
                              }`}
                              title="Change log approval status"
                            >
                              <option value="PENDING">⏳ Mark Pending</option>
                              <option value="APPROVED">✅ Approve Log</option>
                              <option value="REJECTED">❌ Flag / Reject</option>
                            </select>
                          </div>

                          <button
                            onClick={() => setSelectedLog(log)}
                            className="px-2.5 py-1.5 bg-surface hover:bg-primary text-foreground hover:text-white rounded-lg text-xs font-semibold border border-border transition-all cursor-pointer whitespace-nowrap"
                          >
                            View Details
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Detail Inspection View */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-border rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
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
                <div className="text-right">
                  <div className="text-foreground font-bold">
                    {selectedLog.operator_name || selectedLog.staff_name || 'Certified Operator'}
                  </div>
                  <div className="text-xs text-muted font-mono">
                    {selectedLog.operator_email || selectedLog.staff_email || 'operator@hilosgeht.co.ke'}
                  </div>
                </div>
              </div>

              <div className="flex justify-between py-1 border-b border-border">
                <span className="text-muted">Verification Status</span>
                <div>
                  {(selectedLog.verification_status || 'PENDING') === 'APPROVED' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Approved
                    </span>
                  )}
                  {(selectedLog.verification_status || 'PENDING') === 'PENDING' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                      <Clock className="w-3.5 h-3.5 text-amber-600" /> Pending Review
                    </span>
                  )}
                  {(selectedLog.verification_status || 'PENDING') === 'REJECTED' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600" /> Flagged / Rejected
                    </span>
                  )}
                </div>
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
                  {selectedLog.yield_description || selectedLog.work_description || 'Standard earthmoving/grading operations.'}
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

              {(selectedLog.fuel_proof_image || selectedLog.materials_proof_image || selectedLog.meter_proof_image || selectedLog.start_meter_proof_image || selectedLog.end_meter_proof_image) && (
                <div className="pt-2">
                  <span className="text-muted block mb-2 font-mono text-xs uppercase font-semibold">Attached Proof Documents</span>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedLog.start_meter_proof_image && (
                      <div className="p-2 bg-surface border border-border rounded-lg text-center">
                        <img 
                          src={selectedLog.start_meter_proof_image} 
                          alt="Start Meter Gauge" 
                          className="h-28 w-full object-cover rounded mb-1 cursor-pointer hover:opacity-90" 
                          onClick={() => window.open(selectedLog.start_meter_proof_image, '_blank')}
                        />
                        <span className="text-[10px] text-zinc-600 font-mono font-medium">Start Gauge ({selectedLog.start_meter}h)</span>
                      </div>
                    )}
                    {selectedLog.end_meter_proof_image && (
                      <div className="p-2 bg-surface border border-border rounded-lg text-center">
                        <img 
                          src={selectedLog.end_meter_proof_image} 
                          alt="End Meter Gauge" 
                          className="h-28 w-full object-cover rounded mb-1 cursor-pointer hover:opacity-90" 
                          onClick={() => window.open(selectedLog.end_meter_proof_image, '_blank')}
                        />
                        <span className="text-[10px] text-zinc-600 font-mono font-medium">End Gauge ({selectedLog.end_meter}h)</span>
                      </div>
                    )}
                    {selectedLog.meter_proof_image && !selectedLog.start_meter_proof_image && !selectedLog.end_meter_proof_image && (
                      <div className="p-2 bg-surface border border-border rounded-lg text-center">
                        <img 
                          src={selectedLog.meter_proof_image} 
                          alt="Machine Meter Gauge" 
                          className="h-28 w-full object-cover rounded mb-1 cursor-pointer hover:opacity-90" 
                          onClick={() => window.open(selectedLog.meter_proof_image, '_blank')}
                        />
                        <span className="text-[10px] text-zinc-600 font-mono font-medium">Meter Gauge Proof</span>
                      </div>
                    )}
                    {selectedLog.fuel_proof_image && (
                      <div className="p-2 bg-surface border border-border rounded-lg text-center">
                        <img 
                          src={selectedLog.fuel_proof_image} 
                          alt="Fuel Receipt" 
                          className="h-28 w-full object-cover rounded mb-1 cursor-pointer hover:opacity-90" 
                          onClick={() => window.open(selectedLog.fuel_proof_image, '_blank')}
                        />
                        <span className="text-[10px] text-zinc-500 font-mono">Fuel Receipt</span>
                      </div>
                    )}
                    {selectedLog.materials_proof_image && (
                      <div className="p-2 bg-surface border border-border rounded-lg text-center">
                        <img 
                          src={selectedLog.materials_proof_image} 
                          alt="Material Receipt" 
                          className="h-28 w-full object-cover rounded mb-1 cursor-pointer hover:opacity-90" 
                          onClick={() => window.open(selectedLog.materials_proof_image, '_blank')}
                        />
                        <span className="text-[10px] text-zinc-500 font-mono">Delivery Note</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Quick Actions */}
            <div className="pt-3 border-t border-border flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleSingleStatusChange(selectedLog.id, 'APPROVED')}
                  disabled={updatingId === selectedLog.id}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  Approve Log
                </button>
                <button
                  onClick={() => handleSingleStatusChange(selectedLog.id, 'REJECTED')}
                  disabled={updatingId === selectedLog.id}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                  Flag / Reject
                </button>
              </div>

              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 bg-surface hover:bg-zinc-200 text-foreground rounded-lg text-xs font-semibold transition-all cursor-pointer"
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
