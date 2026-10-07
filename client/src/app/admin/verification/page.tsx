'use client';

import React, { useState, useEffect } from 'react';
import { 
  FileCheck, 
  Search, 
  Fuel, 
  FileText, 
  Truck, 
  User, 
  Calendar, 
  RefreshCw, 
  ExternalLink,
  CheckCircle2,
  XCircle,
  Eye,
  Gauge
} from 'lucide-react';

interface AuditItem {
  log_id: string;
  date_submitted: string;
  fuel_amount: string | number;
  fuel_proof_image?: string;
  materials_received?: string;
  materials_proof_image?: string;
  start_meter?: string | number;
  end_meter?: string | number;
  start_meter_proof_image?: string;
  end_meter_proof_image?: string;
  meter_proof_image?: string;
  operator_name: string;
  machine_name: string;
  machine_model: string;
}

export default function DocumentVerificationPage() {
  const [items, setItems] = useState<AuditItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<'ALL' | 'METERS' | 'FUEL' | 'MATERIALS'>('ALL');
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const fetchAudits = async () => {
    setLoading(true);
    try {
      const apiUrl = '/api/v1';
      const res = await fetch(`${apiUrl}/analytics/documents`);
      const json = await res.json();
      if (json?.success) {
        setItems(json?.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch document audit gallery:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (logId: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      const apiUrl = '/api/v1';
      await fetch(`${apiUrl}/logs/${logId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verificationStatus: status }),
      });
      fetchAudits();
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchAudits();
  }, []);

  const filteredItems = (items ?? []).filter(item => {
    if (filterType === 'METERS') return !!(item.meter_proof_image || item.start_meter_proof_image || item.end_meter_proof_image);
    if (filterType === 'FUEL') return !!item.fuel_proof_image;
    if (filterType === 'MATERIALS') return !!item.materials_proof_image;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-primary font-mono tracking-wider uppercase">Module 11</span>
            <span className="text-muted">/</span>
            <span className="text-xs text-muted font-medium">Compliance & Audit</span>
          </div>
          <h1 className="text-2xl font-heading font-black text-foreground flex items-center gap-2.5 mt-1">
            <FileCheck className="w-6 h-6 text-primary" />
            Document & Receipt Audit Gallery
          </h1>
          <p className="text-sm text-muted mt-0.5">
            Visual inspection deck for fuel purchase receipts, weight bridge slips, and site delivery notes uploaded by mobile operators.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-white border border-border rounded-lg p-1 shadow-subtle">
            <button
              onClick={() => setFilterType('ALL')}
              className={`px-3 py-1.5 rounded text-xs font-mono font-bold transition-all cursor-pointer ${
                filterType === 'ALL' ? 'bg-primary text-white' : 'text-zinc-600 hover:text-foreground'
              }`}
            >
              All Uploads
            </button>
            <button
              onClick={() => setFilterType('METERS')}
              className={`px-3 py-1.5 rounded text-xs font-mono font-bold transition-all cursor-pointer ${
                filterType === 'METERS' ? 'bg-primary text-white' : 'text-zinc-600 hover:text-foreground'
              }`}
            >
              Meter Photos
            </button>
            <button
              onClick={() => setFilterType('FUEL')}
              className={`px-3 py-1.5 rounded text-xs font-mono font-bold transition-all cursor-pointer ${
                filterType === 'FUEL' ? 'bg-primary text-white' : 'text-zinc-600 hover:text-foreground'
              }`}
            >
              Fuel Receipts
            </button>
            <button
              onClick={() => setFilterType('MATERIALS')}
              className={`px-3 py-1.5 rounded text-xs font-mono font-bold transition-all cursor-pointer ${
                filterType === 'MATERIALS' ? 'bg-primary text-white' : 'text-zinc-600 hover:text-foreground'
              }`}
            >
              Delivery Notes
            </button>
          </div>

          <button 
            onClick={fetchAudits}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 bg-white hover:bg-surface text-foreground rounded-lg border border-border text-xs font-semibold transition-all shadow-subtle cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-primary ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Gallery Grid */}
      {loading ? (
        <div className="p-16 text-center text-muted bg-white border border-border rounded-xl shadow-subtle">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-primary mb-2" />
          Loading audit documents...
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="p-16 text-center text-muted bg-white border border-border rounded-xl shadow-subtle">
          <FileCheck className="w-10 h-10 mx-auto text-zinc-300 mb-2" />
          No receipt or delivery documents found for audit.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => {
            const hasMeterProof = !!(item.meter_proof_image || item.end_meter_proof_image || item.start_meter_proof_image);
            const displayImage = item.meter_proof_image || item.end_meter_proof_image || item.start_meter_proof_image || item.fuel_proof_image || item.materials_proof_image;

            return (
              <div key={item.log_id} className="bg-white border border-border rounded-xl overflow-hidden flex flex-col justify-between shadow-subtle hover:border-primary/40 transition-colors">
                <div>
                  {/* Proof Media Preview */}
                  <div className="relative h-48 bg-surface border-b border-border group">
                    {displayImage ? (
                      <img 
                        src={displayImage} 
                        alt="Audit Proof Document" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted font-mono text-xs">
                        No Image File
                      </div>
                    )}

                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        onClick={() => setPreviewImage(displayImage || null)}
                        className="p-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-subtle cursor-pointer"
                      >
                        <Eye className="w-4 h-4" /> Full View
                      </button>
                      {item.start_meter_proof_image && item.end_meter_proof_image && item.start_meter_proof_image !== item.end_meter_proof_image && (
                        <button
                          onClick={() => setPreviewImage(item.start_meter_proof_image || null)}
                          className="p-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-subtle cursor-pointer"
                          title="View Start Shift Gauge"
                        >
                          Start Gauge
                        </button>
                      )}
                    </div>

                    <div className="absolute top-2 left-2 flex items-center gap-1.5 flex-wrap">
                      {hasMeterProof ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-600 text-white shadow-subtle flex items-center gap-1">
                          <Gauge className="w-3 h-3" /> METER GAUGE • {item.end_meter ?? item.start_meter} hrs
                        </span>
                      ) : item.fuel_proof_image ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-600 text-white shadow-subtle">
                          FUEL RECEIPT • {item.fuel_amount} L
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-primary text-white shadow-subtle">
                          DELIVERY SLIP
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Metadata details */}
                  <div className="p-4 space-y-2 text-xs">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-heading font-bold text-foreground text-sm flex items-center gap-1.5">
                          <Truck className="w-3.5 h-3.5 text-primary" />
                          {item.machine_name}
                        </div>
                        <div className="text-[11px] text-muted font-mono">{item.machine_model}</div>
                      </div>
                      <span className="text-[10px] font-mono text-zinc-500">
                        {new Date(item.date_submitted).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="p-2.5 bg-surface border border-border rounded-lg space-y-1 font-mono text-[11px]">
                      <div className="flex justify-between">
                        <span className="text-muted">Operator:</span>
                        <span className="text-foreground font-semibold">{item.operator_name || 'Site Crew'}</span>
                      </div>
                      {(item.start_meter !== undefined || item.end_meter !== undefined) && (
                        <div className="flex justify-between">
                          <span className="text-muted">Meter Reading:</span>
                          <span className="text-amber-800 font-bold">{item.start_meter} &rarr; {item.end_meter} hrs</span>
                        </div>
                      )}
                      {item.materials_received && (
                        <div className="flex justify-between">
                          <span className="text-muted">Material Note:</span>
                          <span className="text-primary font-semibold truncate max-w-[140px]">{item.materials_received}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

              {/* Approval Stamp & Actions */}
              <div className="p-3 bg-surface border-t border-border flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleUpdateStatus(item.log_id, 'APPROVED')}
                    className="px-2 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-300 rounded font-mono font-bold text-[10px] flex items-center gap-1 transition-colors cursor-pointer"
                    title="Mark voucher as verified and audited"
                  >
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Approve
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(item.log_id, 'REJECTED')}
                    className="px-2 py-1 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-300 rounded font-mono font-bold text-[10px] flex items-center gap-1 transition-colors cursor-pointer"
                    title="Flag blurry or incorrect voucher"
                  >
                    <XCircle className="w-3 h-3 text-rose-600" /> Reject
                  </button>
                </div>
                <span className="text-muted font-mono text-[10px]">Log #{item.log_id.slice(0, 8)}</span>
              </div>
            </div>
          );
        })}
        </div>
      )}

      {/* Full Preview Modal */}
      {previewImage && (
        <div 
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
        >
          <div className="max-w-3xl max-h-[85vh] bg-white p-3 rounded-2xl border border-border shadow-2xl relative">
            <img 
              src={previewImage} 
              alt="Full Document Preview" 
              className="max-h-[80vh] w-auto rounded-xl object-contain mx-auto" 
            />
            <div className="text-center text-xs text-muted font-mono mt-2">
              Click anywhere to close preview
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
