'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ClipboardList, 
  Truck, 
  Clock, 
  Fuel, 
  FileText, 
  Upload, 
  CheckCircle2, 
  AlertTriangle, 
  PackageCheck,
  UserCheck,
  Calendar,
  MessageSquare,
  MapPin,
  Inbox,
  Camera,
  Gauge,
  TrendingUp
} from 'lucide-react';
import GlassCard from '@/components/common/GlassCard';
import NeonButton from '@/components/common/NeonButton';
import StatusBadge from '@/components/common/StatusBadge';
import { Equipment } from '@/types';
import { formatDate } from '@/lib/utils';

export default function OperatorDailyLogPage() {
  const [activeTab, setActiveTab] = useState<'LOG' | 'INQUIRIES'>('LOG');
  const [fleet, setFleet] = useState<Equipment[]>([]);
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [inquiriesLoading, setInquiriesLoading] = useState(false);
  const [selectedEquipmentId, setSelectedEquipmentId] = useState('');
  const [startMeter, setStartMeter] = useState('');
  const [endMeter, setEndMeter] = useState('');
  const [startFuelReading, setStartFuelReading] = useState('');
  const [endFuelReading, setEndFuelReading] = useState('');
  const [workDescription, setWorkDescription] = useState('');
  const [fuelAmount, setFuelAmount] = useState('');
  const [materialsReceived, setMaterialsReceived] = useState('');
  const [fuelImageFile, setFuelImageFile] = useState<string | null>(null);
  const [materialsImageFile, setMaterialsImageFile] = useState<string | null>(null);
  const [startMeterImageFile, setStartMeterImageFile] = useState<string | null>(null);
  const [endMeterImageFile, setEndMeterImageFile] = useState<string | null>(null);
  const [startFuelProofImage, setStartFuelProofImage] = useState<string | null>(null);
  const [endFuelProofImage, setEndFuelProofImage] = useState<string | null>(null);

  const [currentUser, setCurrentUser] = useState<{ id?: string; full_name?: string; email?: string; role?: string; avatar_url?: string | null } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedLog, setSubmittedLog] = useState<any | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('hlg_user');
        if (stored) {
          setCurrentUser(JSON.parse(stored));
        }
      } catch (e) {}
    }
  }, []);

  const loadInquiries = async () => {
    setInquiriesLoading(true);
    try {
      const apiUrl = '/api/v1';
      const res = await fetch(`${apiUrl}/inquiries`);
      if (res.ok) {
        const data = await res.json();
        setInquiries(data?.data || []);
      }
    } catch (e) {
    } finally {
      setInquiriesLoading(false);
    }
  };

  useEffect(() => {
    async function loadFleet() {
      try {
        const apiUrl = '/api/v1';
        const res = await fetch(`${apiUrl}/equipment`);
        if (res.ok) {
          const data = await res.json();
          const list = data?.data || [];
          setFleet(list);
          if (list.length > 0) {
            setSelectedEquipmentId(list[0].id);
            setStartMeter(String(list[0].current_hour_meter || 0));
          }
        }
      } catch (e) {}
    }
    loadFleet();
    loadInquiries();
  }, []);

  const handleEquipmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const eqId = e.target.value;
    setSelectedEquipmentId(eqId);
    const eq = fleet.find(f => f.id === eqId);
    if (eq) {
      setStartMeter(String(eq.current_hour_meter || 0));
    }
  };

  const [uploadingFuel, setUploadingFuel] = useState(false);
  const [uploadingMat, setUploadingMat] = useState(false);
  const [uploadingStartMeter, setUploadingStartMeter] = useState(false);
  const [uploadingEndMeter, setUploadingEndMeter] = useState(false);
  const [uploadingStartFuel, setUploadingStartFuel] = useState(false);
  const [uploadingEndFuel, setUploadingEndFuel] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'fuel' | 'mat' | 'startMeter' | 'endMeter' | 'startFuel' | 'endFuel') => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Instant local preview
    const reader = new FileReader();
    reader.onload = () => {
      if (type === 'fuel') setFuelImageFile(reader.result as string);
      else if (type === 'mat') setMaterialsImageFile(reader.result as string);
      else if (type === 'startMeter') setStartMeterImageFile(reader.result as string);
      else if (type === 'endMeter') setEndMeterImageFile(reader.result as string);
      else if (type === 'startFuel') setStartFuelProofImage(reader.result as string);
      else if (type === 'endFuel') setEndFuelProofImage(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to Vercel Blob Storage in background
    try {
      if (type === 'fuel') setUploadingFuel(true);
      else if (type === 'mat') setUploadingMat(true);
      else if (type === 'startMeter') setUploadingStartMeter(true);
      else if (type === 'endMeter') setUploadingEndMeter(true);
      else if (type === 'startFuel') setUploadingStartFuel(true);
      else if (type === 'endFuel') setUploadingEndFuel(true);

      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/v1/storage/upload', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        if (data?.viewUrl) {
          if (type === 'fuel') setFuelImageFile(data.viewUrl);
          else if (type === 'mat') setMaterialsImageFile(data.viewUrl);
          else if (type === 'startMeter') setStartMeterImageFile(data.viewUrl);
          else if (type === 'endMeter') setEndMeterImageFile(data.viewUrl);
          else if (type === 'startFuel') setStartFuelProofImage(data.viewUrl);
          else if (type === 'endFuel') setEndFuelProofImage(data.viewUrl);
        }
      }
    } catch (err) {
      console.warn('Storage upload fallback:', err);
    } finally {
      if (type === 'fuel') setUploadingFuel(false);
      else if (type === 'mat') setUploadingMat(false);
      else if (type === 'startMeter') setUploadingStartMeter(false);
      else if (type === 'endMeter') setUploadingEndMeter(false);
      else if (type === 'startFuel') setUploadingStartFuel(false);
      else if (type === 'endFuel') setUploadingEndFuel(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const start = parseFloat(startMeter);
    const end = parseFloat(endMeter);

    if (isNaN(start) || isNaN(end)) {
      setError('Please enter valid numeric start and end hour meters.');
      return;
    }

    if (end < start) {
      setError('End hour meter cannot be less than start hour meter.');
      return;
    }

    setLoading(true);

    try {
      const apiUrl = '/api/v1';
      const selectedEquipment = fleet.find(f => f.id === selectedEquipmentId);

      const res = await fetch(`${apiUrl}/logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          staffId: currentUser?.id || null,
          staffName: currentUser?.full_name || 'Certified Operator',
          staffEmail: currentUser?.email || null,
          equipmentId: selectedEquipmentId,
          equipmentName: selectedEquipment?.name || 'Heavy Equipment',
          startMeter: start,
          endMeter: end,
          workDescription,
          fuelAmount: parseFloat(fuelAmount) || 0.0,
          startFuelReading: startFuelReading !== '' ? parseFloat(startFuelReading) : null,
          endFuelReading: endFuelReading !== '' ? parseFloat(endFuelReading) : null,
          fuelProofImage: fuelImageFile,
          startFuelProofImage: startFuelProofImage,
          endFuelProofImage: endFuelProofImage,
          materialsReceived,
          materialsProofImage: materialsImageFile,
          startMeterProofImage: startMeterImageFile,
          endMeterProofImage: endMeterImageFile,
          meterProofImage: endMeterImageFile || startMeterImageFile || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || 'Failed to submit daily log.');
      } else {
        setSubmittedLog(data?.data);
      }
    } catch (err: any) {
      setError('Connection error submitting operational log.');
    } finally {
      setLoading(false);
    }
  };

  const hoursWorked = !isNaN(parseFloat(endMeter)) && !isNaN(parseFloat(startMeter))
    ? Math.max(0, parseFloat(endMeter) - parseFloat(startMeter)).toFixed(1)
    : '0.0';

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-6">
      
      {/* Top Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-orange-50 border border-orange-200 text-primary font-mono text-xs uppercase shadow-subtle">
          <ClipboardList className="w-3.5 h-3.5" />
          <span>Operator Field Portal • Meru Jobsite</span>
        </div>
        <h1 className="font-heading font-black text-2xl sm:text-3xl text-foreground uppercase">
          Operations & Daily Field Logs
        </h1>
        <p className="text-xs text-muted">
          Submit daily engine hours, site yield, and track active machinery dispatches.
        </p>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center justify-center gap-1.5 p-1.5 bg-surface border border-border rounded-xl max-w-lg mx-auto">
        <button
          type="button"
          onClick={() => setActiveTab('LOG')}
          className={`flex-1 py-2 px-2.5 rounded-lg text-xs font-heading font-bold uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'LOG'
              ? 'bg-primary text-white shadow-subtle'
              : 'text-zinc-600 hover:text-ink'
          }`}
        >
          <ClipboardList className="w-3.5 h-3.5" />
          <span>Daily Log</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('INQUIRIES')}
          className={`flex-1 py-2 px-2.5 rounded-lg text-xs font-heading font-bold uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'INQUIRIES'
              ? 'bg-primary text-white shadow-subtle'
              : 'text-zinc-600 hover:text-ink'
          }`}
        >
          <Inbox className="w-3.5 h-3.5" />
          <span>Inquiries ({inquiries.length})</span>
        </button>

        <Link
          href="/staff/analytics"
          className="flex-1 py-2 px-2.5 rounded-lg text-xs font-heading font-bold uppercase transition-all flex items-center justify-center gap-1.5 text-zinc-600 hover:text-primary hover:bg-orange-50 cursor-pointer"
        >
          <TrendingUp className="w-3.5 h-3.5 text-primary" />
          <span>My Analytics</span>
        </Link>
      </div>

      {activeTab === 'INQUIRIES' ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h2 className="font-heading font-bold text-sm uppercase text-ink flex items-center gap-2">
              <Truck className="w-4 h-4 text-primary" />
              <span>Assigned Machinery Inquiries & Site Mobilizations</span>
            </h2>
            <button
              onClick={loadInquiries}
              className="text-xs font-mono text-primary hover:underline font-bold"
            >
              Refresh Feed
            </button>
          </div>

          <div className="space-y-3">
            {inquiries.map((inq) => (
              <GlassCard key={inq.id} className="p-4 sm:p-5 border border-border bg-white shadow-card space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
                      <span>{inq.client_name}</span>
                      <span className="text-xs font-mono text-muted font-normal">({inq.client_phone})</span>
                    </h3>
                    <div className="text-xs font-mono text-primary font-semibold mt-0.5 flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5" />
                      {inq.equipment_name || inq.equipment_model}
                    </div>
                  </div>
                  <StatusBadge status={inq.status} />
                </div>

                <div className="p-3 rounded-lg bg-surface text-xs font-mono border border-border space-y-1 text-zinc-700">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-muted" />
                    <span>Dates: {formatDate(inq.start_date)} → {formatDate(inq.end_date)}</span>
                  </div>
                  {inq.notes && (
                    <div className="text-[11px] text-zinc-600 pt-1 border-t border-border mt-1">
                      {inq.notes}
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-border flex items-center justify-between text-xs font-mono">
                  <a
                    href={`https://wa.me/${(inq.client_phone || '').replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(inq.client_name)}%2C%20HLG%20Field%20Operator%20confirming%20machinery%20deployment.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>WhatsApp Dispatch</span>
                  </a>
                  <span className="text-muted text-[10px]">Logged: {formatDate(inq.created_at)}</span>
                </div>
              </GlassCard>
            ))}

            {inquiries.length === 0 && !inquiriesLoading && (
              <div className="p-8 text-center text-xs text-muted font-mono bg-surface rounded-xl border border-dashed border-border">
                No active inquiries recorded in system.
              </div>
            )}
          </div>
        </div>
      ) : (
      <GlassCard className="p-6 sm:p-8 space-y-6 border border-border shadow-subtle bg-white">
        
        {error && (
          <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-300 text-rose-800 text-xs flex items-start gap-2.5 font-medium">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {submittedLog ? (
          <div className="text-center py-8 space-y-5">
            <div className="w-16 h-16 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-700 mx-auto flex items-center justify-center shadow-subtle">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="font-heading text-xl font-bold text-foreground uppercase">
              Log Successfully Recorded!
            </h2>
            <p className="text-xs text-muted max-w-md mx-auto">
              Your daily submission has been logged into the central ledger. Fleet hour meter and AI fuel diagnostic engines updated.
            </p>

            <div className="p-4 bg-surface rounded-xl border border-border text-xs text-left space-y-2 max-w-md mx-auto font-mono">
              <div className="flex justify-between">
                <span className="text-muted">Hours Worked:</span>
                <span className="text-primary font-bold">{hoursWorked} hrs</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Hour Meter Reading:</span>
                <span className="text-foreground font-semibold">{startMeter} → {endMeter}</span>
              </div>
              {(startFuelReading || endFuelReading) && (
                <div className="flex justify-between">
                  <span className="text-muted">Fuel Gauge Reading:</span>
                  <span className="text-foreground font-semibold">{startFuelReading || '-'} → {endFuelReading || '-'}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted">Fuel Purchased:</span>
                <span className="text-foreground font-semibold">{fuelAmount || '0'} Litres</span>
              </div>
              {(startFuelProofImage || endFuelProofImage || fuelImageFile || startMeterImageFile || endMeterImageFile) && (
                <div className="pt-2 border-t border-border mt-2">
                  <span className="text-muted block text-[10px] mb-1.5 font-semibold uppercase">Attached Proof & Gauge Photos:</span>
                  <div className="flex items-center gap-2 flex-wrap">
                    {startFuelProofImage && (
                      <div className="text-center">
                        <img src={startFuelProofImage} alt="Start fuel gauge" className="w-14 h-14 object-cover rounded border border-border" />
                        <span className="text-[9px] text-muted block mt-0.5">Start Fuel Gauge</span>
                      </div>
                    )}
                    {endFuelProofImage && (
                      <div className="text-center">
                        <img src={endFuelProofImage} alt="End fuel gauge" className="w-14 h-14 object-cover rounded border border-border" />
                        <span className="text-[9px] text-muted block mt-0.5">End Fuel Gauge</span>
                      </div>
                    )}
                    {fuelImageFile && (
                      <div className="text-center">
                        <img src={fuelImageFile} alt="Fuel receipt" className="w-14 h-14 object-cover rounded border border-border" />
                        <span className="text-[9px] text-muted block mt-0.5">Fuel Receipt</span>
                      </div>
                    )}
                    {startMeterImageFile && (
                      <div className="text-center">
                        <img src={startMeterImageFile} alt="Start hour meter" className="w-14 h-14 object-cover rounded border border-border" />
                        <span className="text-[9px] text-muted block mt-0.5">Start Meter</span>
                      </div>
                    )}
                    {endMeterImageFile && (
                      <div className="text-center">
                        <img src={endMeterImageFile} alt="End hour meter" className="w-14 h-14 object-cover rounded border border-border" />
                        <span className="text-[9px] text-muted block mt-0.5">End Meter</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Link
                href="/staff/analytics"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-primary text-white hover:bg-primary-hover shadow-orange transition-all cursor-pointer"
              >
                <TrendingUp className="w-4 h-4" />
                <span>View in My Analytics</span>
              </Link>
              <NeonButton
                variant="outline"
                size="sm"
                onClick={() => {
                  setSubmittedLog(null);
                  setWorkDescription('');
                  setFuelAmount('');
                  setStartFuelReading('');
                  setEndFuelReading('');
                  setMaterialsReceived('');
                  setFuelImageFile(null);
                  setStartFuelProofImage(null);
                  setEndFuelProofImage(null);
                  setMaterialsImageFile(null);
                  setStartMeterImageFile(null);
                  setEndMeterImageFile(null);
                }}
              >
                Submit Another Operational Log
              </NeonButton>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 text-xs">
            {/* Operator Identity Indicator */}
            <div className="p-3 bg-orange-50/70 border border-orange-200 rounded-xl flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2.5">
                {currentUser?.avatar_url ? (
                  <img
                    src={currentUser.avatar_url || undefined}
                    alt={currentUser.full_name || 'Operator'}
                    className="w-8 h-8 rounded-full object-cover border border-primary/30 shadow-subtle shrink-0"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 text-primary font-bold text-xs flex items-center justify-center shrink-0">
                    {(currentUser?.full_name || 'OP').slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-muted text-[11px]">Operator:</span>
                    <span className="font-bold text-ink">{currentUser?.full_name || 'Certified Operator'}</span>
                  </div>
                  {currentUser?.email && (
                    <span className="text-muted text-[10px] block">{currentUser.email}</span>
                  )}
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                LOGGED IN
              </span>
            </div>
            
            {/* Machinery Selector */}
            <div>
              <label className="block text-zinc-700 font-mono mb-1.5 flex items-center gap-1.5 font-semibold">
                <Truck className="w-3.5 h-3.5 text-primary" />
                Active Heavy Machinery *
              </label>
              <select
                required
                value={selectedEquipmentId}
                onChange={handleEquipmentChange}
                className="w-full bg-surface border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:border-primary focus:bg-white focus:outline-none cursor-pointer"
              >
                {fleet.map((eq) => (
                  <option key={eq.id} value={eq.id}>
                    {eq.name} ({eq.category} • {eq.model})
                  </option>
                ))}
              </select>
            </div>

            {/* Hour Meter Inputs */}
            <div className="p-4 bg-orange-50/50 border border-orange-200/80 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-zinc-800 text-xs flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-primary" />
                  Machine Hour Meter Readings *
                </span>
                <span className="text-[10px] font-mono text-primary font-semibold">
                  Required for Billing & PM Audit
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Start Hour Meter */}
                <div className="p-3 bg-white border border-border rounded-lg space-y-2">
                  <label className="block text-zinc-700 font-mono mb-1 flex items-center gap-1.5 font-semibold">
                    <Clock className="w-3.5 h-3.5 text-primary" />
                    Start Hour Meter (hrs) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    placeholder="e.g. 41.0"
                    value={startMeter}
                    onChange={(e) => setStartMeter(e.target.value)}
                    className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:border-primary focus:bg-white focus:outline-none"
                  />
                </div>

                {/* End Hour Meter */}
                <div className="p-3 bg-white border border-border rounded-lg space-y-2">
                  <label className="block text-zinc-700 font-mono mb-1 flex items-center gap-1.5 font-semibold">
                    <Clock className="w-3.5 h-3.5 text-primary" />
                    End Hour Meter (hrs) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    placeholder="e.g. 48.0"
                    value={endMeter}
                    onChange={(e) => setEndMeter(e.target.value)}
                    className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:border-primary focus:bg-white focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Calculated Hours Banner */}
            <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg flex items-center justify-between font-mono">
              <span className="text-zinc-700 font-semibold">Calculated Today's Yield:</span>
              <span className="text-primary font-bold text-sm">
                {hoursWorked} Operational Hours
              </span>
            </div>

            {/* Trips & Work Done */}
            <div>
              <label className="block text-zinc-700 font-mono mb-1.5 flex items-center gap-1.5 font-semibold">
                <FileText className="w-3.5 h-3.5 text-primary" />
                Trips / Work Done Summary *
              </label>
              <textarea
                required
                rows={3}
                placeholder="e.g. Moved 5 trips of soil from site A to Meru bypass road section 3."
                value={workDescription}
                onChange={(e) => setWorkDescription(e.target.value)}
                className="w-full bg-surface border border-border rounded-lg p-3 text-sm text-foreground focus:border-primary focus:bg-white focus:outline-none"
              />
            </div>

            {/* Fuel Readings & Gauge Photos Proof Section */}
            <div className="p-4 bg-surface rounded-xl border border-border space-y-4">
              <div className="flex items-center justify-between border-b border-border/80 pb-2">
                <span className="font-mono font-bold text-foreground text-xs flex items-center gap-1.5">
                  <Gauge className="w-4 h-4 text-primary" />
                  Fuel Gauge Readings & Gauge Photos Proof
                </span>
                <span className="text-[10px] font-mono text-primary font-semibold">
                  Tank Level Diagnostics
                </span>
              </div>

              {/* Start & End Fuel Gauge Readings + Gauge Photos Proof */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Start Fuel Gauge & Photo */}
                <div className="p-3 bg-white border border-border rounded-lg space-y-2.5">
                  <div>
                    <label className="block text-zinc-700 font-mono mb-1 flex items-center gap-1.5 font-semibold">
                      <Fuel className="w-3.5 h-3.5 text-primary" />
                      Start Fuel Reading (Litres / Level)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="e.g. 120.0"
                      value={startFuelReading}
                      onChange={(e) => setStartFuelReading(e.target.value)}
                      className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:border-primary focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-muted text-[11px] font-mono mb-1 flex items-center gap-1">
                      <Camera className="w-3 h-3 text-primary" />
                      Start Gauge Photo Proof
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'startFuel')}
                      className="w-full text-xs text-muted file:mr-2 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-[11px] file:font-semibold file:bg-surface-hover file:text-foreground hover:file:bg-orange-50 hover:file:text-primary cursor-pointer"
                    />
                    {uploadingStartFuel && (
                      <p className="text-[10px] text-primary font-mono mt-1 animate-pulse">Uploading start gauge photo...</p>
                    )}
                    {startFuelProofImage && (
                      <div className="mt-1.5 flex items-center gap-2 p-1.5 bg-surface border border-border rounded-lg">
                        <img src={startFuelProofImage} alt="Start fuel gauge proof" className="w-10 h-10 object-cover rounded" />
                        <div className="flex-1 min-w-0">
                          <span className="text-[10px] text-emerald-700 font-mono font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Start Gauge Photo
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setStartFuelProofImage(null)}
                          className="text-zinc-400 hover:text-rose-600 p-1 text-xs"
                          title="Remove photo"
                        >
                          ✕
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* End Fuel Gauge & Photo */}
                <div className="p-3 bg-white border border-border rounded-lg space-y-2.5">
                  <div>
                    <label className="block text-zinc-700 font-mono mb-1 flex items-center gap-1.5 font-semibold">
                      <Fuel className="w-3.5 h-3.5 text-primary" />
                      End Fuel Reading (Litres / Level)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="e.g. 75.0"
                      value={endFuelReading}
                      onChange={(e) => setEndFuelReading(e.target.value)}
                      className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:border-primary focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-muted text-[11px] font-mono mb-1 flex items-center gap-1">
                      <Camera className="w-3 h-3 text-primary" />
                      End Gauge Photo Proof
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'endFuel')}
                      className="w-full text-xs text-muted file:mr-2 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-[11px] file:font-semibold file:bg-surface-hover file:text-foreground hover:file:bg-orange-50 hover:file:text-primary cursor-pointer"
                    />
                    {uploadingEndFuel && (
                      <p className="text-[10px] text-primary font-mono mt-1 animate-pulse">Uploading end gauge photo...</p>
                    )}
                    {endFuelProofImage && (
                      <div className="mt-1.5 flex items-center gap-2 p-1.5 bg-surface border border-border rounded-lg">
                        <img src={endFuelProofImage} alt="End fuel gauge proof" className="w-10 h-10 object-cover rounded" />
                        <div className="flex-1 min-w-0">
                          <span className="text-[10px] text-emerald-700 font-mono font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> End Gauge Photo
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setEndFuelProofImage(null)}
                          className="text-zinc-400 hover:text-rose-600 p-1 text-xs"
                          title="Remove photo"
                        >
                          ✕
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Fuel Purchased & Receipt Upload */}
              <div className="pt-2 border-t border-border space-y-3">
                <div className="flex items-center gap-2 font-mono text-zinc-800 text-xs font-semibold">
                  <Fuel className="w-3.5 h-3.5 text-primary" />
                  <span>Diesel Refueling & Receipt Slip (If Refueled)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-muted text-[11px] font-mono mb-1">
                      Fuel Volume Purchased (Litres)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="e.g. 50.0"
                      value={fuelAmount}
                      onChange={(e) => setFuelAmount(e.target.value)}
                      className="w-full bg-white border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-muted text-[11px] font-mono mb-1">
                      Upload Fuel Receipt / Invoice Photo
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'fuel')}
                      className="w-full text-xs text-muted file:mr-2 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-[11px] file:font-semibold file:bg-surface-hover file:text-foreground hover:file:bg-orange-50 hover:file:text-primary cursor-pointer"
                    />
                    {uploadingFuel && (
                      <p className="text-[10px] text-primary font-mono mt-1 animate-pulse">Uploading fuel invoice...</p>
                    )}
                    {fuelImageFile && (
                      <div className="mt-1.5 flex items-center gap-2 p-1.5 bg-white border border-border rounded-lg">
                        <img src={fuelImageFile} alt="Fuel proof" className="w-10 h-10 object-cover rounded" />
                        <span className="text-[10px] text-emerald-700 font-mono font-bold flex-1 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Fuel Receipt Attached
                        </span>
                        <button
                          type="button"
                          onClick={() => setFuelImageFile(null)}
                          className="text-zinc-400 hover:text-rose-600 p-1 text-xs"
                        >
                          ✕
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Materials Received */}
            <div className="p-4 bg-surface rounded-xl border border-border space-y-3">
              <div className="flex items-center gap-2 font-mono text-foreground font-semibold">
                <PackageCheck className="w-4 h-4 text-primary" />
                <span>Materials Received / Site Haulage</span>
              </div>

              <div>
                <label className="block text-muted text-[11px] font-mono mb-1">
                  Materials Description
                </label>
                <input
                  type="text"
                  placeholder="e.g. 1 truck of ballast / 20 tons quarry rock"
                  value={materialsReceived}
                  onChange={(e) => setMaterialsReceived(e.target.value)}
                  className="w-full bg-white border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-muted text-[11px] font-mono mb-1">
                  Upload Delivery Proof Photo
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'mat')}
                  className="w-full text-xs text-muted file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-surface-hover file:text-foreground hover:file:bg-orange-50 hover:file:text-primary cursor-pointer"
                />
                {uploadingMat && (
                  <p className="text-[10px] text-primary font-mono mt-1 animate-pulse">Uploading delivery note...</p>
                )}
                {materialsImageFile && (
                  <div className="mt-1.5 flex items-center gap-2 p-1.5 bg-white border border-border rounded-lg">
                    <img src={materialsImageFile} alt="Materials delivery proof" className="w-10 h-10 object-cover rounded" />
                    <span className="text-[10px] text-emerald-700 font-mono font-bold flex-1 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Delivery Note Attached
                    </span>
                    <button
                      type="button"
                      onClick={() => setMaterialsImageFile(null)}
                      className="text-zinc-400 hover:text-rose-600 p-1 text-xs"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>
            </div>

            <NeonButton
              type="submit"
              disabled={loading}
              className="w-full py-3 text-xs"
              icon={<ClipboardList className="w-4 h-4" />}
            >
              {loading ? 'Submitting Field Report...' : 'Submit Daily Operational Log'}
            </NeonButton>

          </form>
        )}

      </GlassCard>
      )}
    </div>
  );
}

