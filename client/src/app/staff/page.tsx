'use client';

import React, { useState, useEffect } from 'react';
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
  UserCheck
} from 'lucide-react';
import GlassCard from '@/components/common/GlassCard';
import NeonButton from '@/components/common/NeonButton';
import { Equipment } from '@/types';

export default function OperatorDailyLogPage() {
  const [fleet, setFleet] = useState<Equipment[]>([]);
  const [selectedEquipmentId, setSelectedEquipmentId] = useState('');
  const [startMeter, setStartMeter] = useState('');
  const [endMeter, setEndMeter] = useState('');
  const [workDescription, setWorkDescription] = useState('');
  const [fuelAmount, setFuelAmount] = useState('');
  const [materialsReceived, setMaterialsReceived] = useState('');
  const [fuelImageFile, setFuelImageFile] = useState<string | null>(null);
  const [materialsImageFile, setMaterialsImageFile] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedLog, setSubmittedLog] = useState<any | null>(null);

  useEffect(() => {
    async function loadFleet() {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
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
      } catch (e) {
        // fallback
      }
    }
    loadFleet();
  }, []);

  const handleEquipmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const eqId = e.target.value;
    setSelectedEquipmentId(eqId);
    const eq = fleet.find(f => f.id === eqId);
    if (eq) {
      setStartMeter(String(eq.current_hour_meter || 0));
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'fuel' | 'mat') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (type === 'fuel') setFuelImageFile(reader.result as string);
      else setMaterialsImageFile(reader.result as string);
    };
    reader.readAsDataURL(file);
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
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
      const res = await fetch(`${apiUrl}/logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          equipmentId: selectedEquipmentId,
          startMeter: start,
          endMeter: end,
          workDescription,
          fuelAmount: parseFloat(fuelAmount) || 0.0,
          fuelProofImage: fuelImageFile,
          materialsReceived,
          materialsProofImage: materialsImageFile,
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
    <div className="max-w-2xl mx-auto px-4 py-10">
      
      {/* Top Header */}
      <div className="text-center mb-8 space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-orange-50 border border-orange-200 text-primary font-mono text-xs uppercase shadow-subtle">
          <ClipboardList className="w-3.5 h-3.5" />
          <span>Operator Field Portal • Meru Jobsite</span>
        </div>
        <h1 className="font-heading font-black text-2xl sm:text-3xl text-foreground uppercase">
          Daily Operational Log
        </h1>
        <p className="text-xs text-muted">
          Submit daily engine hours, quarry/site yield, and fuel purchase receipts for fleet tracking.
        </p>
      </div>

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
                <span className="text-muted">Meter Reading:</span>
                <span className="text-foreground font-semibold">{startMeter} → {endMeter}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Fuel Purchased:</span>
                <span className="text-foreground font-semibold">{fuelAmount || '0'} Litres</span>
              </div>
            </div>

            <NeonButton
              variant="outline"
              size="sm"
              onClick={() => {
                setSubmittedLog(null);
                setWorkDescription('');
                setFuelAmount('');
                setMaterialsReceived('');
                setFuelImageFile(null);
                setMaterialsImageFile(null);
              }}
            >
              Submit Another Operational Log
            </NeonButton>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 text-xs">
            
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-zinc-700 font-mono mb-1.5 flex items-center gap-1.5 font-semibold">
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

              <div>
                <label className="block text-zinc-700 font-mono mb-1.5 flex items-center gap-1.5 font-semibold">
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

            {/* Purchases / Fuel */}
            <div className="p-4 bg-surface rounded-xl border border-border space-y-3">
              <div className="flex items-center gap-2 font-mono text-foreground font-semibold">
                <Fuel className="w-4 h-4 text-primary" />
                <span>Fuel Purchase & Receipt</span>
              </div>
              
              <div>
                <label className="block text-muted text-[11px] font-mono mb-1">
                  Fuel Volume Purchased (Litres)
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="e.g. 92.12"
                  value={fuelAmount}
                  onChange={(e) => setFuelAmount(e.target.value)}
                  className="w-full bg-white border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-muted text-[11px] font-mono mb-1">
                  Upload M-Pesa Fuel Receipt / Physical Invoice
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'fuel')}
                  className="w-full text-xs text-muted file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-surface-hover file:text-foreground hover:file:bg-orange-50 hover:file:text-primary cursor-pointer"
                />
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
    </div>
  );
}
