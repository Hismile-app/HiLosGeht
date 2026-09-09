'use client';

import React, { useState } from 'react';
import { 
  Settings, 
  Phone, 
  Mail, 
  Radio, 
  ShieldCheck, 
  Save, 
  CheckCircle2, 
  Server, 
  Zap, 
  Bell,
  Cpu,
  AlertTriangle
} from 'lucide-react';

export default function SystemSettingsPage() {
  const [role, setRole] = useState<'ADMIN' | 'OPERATOR'>('ADMIN');
  const [primaryPhone, setPrimaryPhone] = useState('0717 186396');
  const [backupPhone, setBackupPhone] = useState('0748866823');
  const [supportEmail, setSupportEmail] = useState('hilosgehtinfo@gmail.com');
  const [devEmail, setDevEmail] = useState('kbrian1237@gmail.com');
  const [pmInterval, setPmInterval] = useState('500');
  const [saved, setSaved] = useState(false);

  // Telemetry simulator state
  const [telemetryVin, setTelemetryVin] = useState('KOM-PC200-KE-001');
  const [telemetryHours, setTelemetryHours] = useState('501.5');
  const [telemetryFuel, setTelemetryFuel] = useState('85.0');
  const [telemetryStatus, setTelemetryStatus] = useState<string | null>(null);
  const [telemetryLoading, setTelemetryLoading] = useState(false);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedRole = localStorage.getItem('hlg_role');
      if (storedRole === 'OPERATOR') {
        setRole('OPERATOR');
      }
    }
  }, []);

  if (role === 'OPERATOR') {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 mx-auto flex items-center justify-center">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="font-heading font-black text-2xl text-ink uppercase">
          Access Restricted to Central Administrators
        </h2>
        <p className="text-xs text-muted max-w-md mx-auto leading-relaxed">
          System telemetry gateway settings, notification dispatch hooks, and maintenance thresholds are restricted to HLG Chief Administrators.
        </p>
        <div className="pt-2">
          <a
            href="/staff"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-heading font-bold uppercase transition-all shadow-subtle"
          >
            Go to Operator Daily Log Portal
          </a>
        </div>
      </div>
    );
  }

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleTestTelemetry = async () => {
    setTelemetryLoading(true);
    setTelemetryStatus(null);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
      const res = await fetch(`${apiUrl}/telemetry`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vin: telemetryVin,
          cumulativeOperatingHours: parseFloat(telemetryHours),
          fuelRemainingPercent: parseFloat(telemetryFuel),
          gpsLatitude: 0.0463,
          gpsLongitude: 37.6559,
          snapshotTimestamp: new Date().toISOString()
        })
      });
      const data = await res.json();
      if (data?.success) {
        setTelemetryStatus(`Ingested Successfully: ${data.data.machine_name} updated to ${data.data.new_operating_hours} hrs. Maintenance trigger status: ${data.data.status}`);
      } else {
        setTelemetryStatus(`Error: ${data?.error || 'Failed to ingest payload'}`);
      }
    } catch (err: any) {
      setTelemetryStatus(`Failed: ${err.message}`);
    } finally {
      setTelemetryLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-primary font-mono tracking-wider uppercase">Module 12</span>
            <span className="text-muted">/</span>
            <span className="text-xs text-muted font-medium">Administration</span>
          </div>
          <h1 className="text-2xl font-heading font-black text-foreground flex items-center gap-2.5 mt-1">
            <Settings className="w-6 h-6 text-primary" />
            System Settings & Telematics Gateway
          </h1>
          <p className="text-sm text-muted mt-0.5">
            Dispatch numbers, notification routing, ISO 15143-3 AEMP 2.0 telematics hooks, and maintenance thresholds.
          </p>
        </div>

        {saved && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-300 rounded-lg text-xs font-mono font-bold">
            <CheckCircle2 className="w-4 h-4" /> System Settings Persisted
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Dispatch & Contact Settings */}
        <div className="bg-white border border-border rounded-xl p-6 space-y-5 shadow-subtle">
          <div className="flex items-center gap-2 text-foreground font-heading font-bold text-base">
            <Phone className="w-5 h-5 text-primary" />
            Meru Machinery Dispatch Hotlines
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-4 text-sm">
            <div>
              <label className="text-xs font-mono text-zinc-700 font-semibold block mb-1">
                PRIMARY WHATSAPP BOOKING NUMBER (DEFAULT DISPATCH)
              </label>
              <input
                type="text"
                value={primaryPhone}
                onChange={(e) => setPrimaryPhone(e.target.value)}
                className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-foreground font-mono focus:outline-none focus:border-primary focus:bg-white"
              />
              <span className="text-[11px] text-muted font-mono mt-0.5 block">
                Formatted as: 0717 186396 / +254717186396
              </span>
            </div>

            <div>
              <label className="text-xs font-mono text-zinc-700 font-semibold block mb-1">
                BACKUP WHATSAPP DISPATCH NUMBER (FALLBACK)
              </label>
              <input
                type="text"
                value={backupPhone}
                onChange={(e) => setBackupPhone(e.target.value)}
                className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-foreground font-mono focus:outline-none focus:border-primary focus:bg-white"
              />
              <span className="text-[11px] text-muted font-mono mt-0.5 block">
                Formatted as: 0748866823 / +254748866823
              </span>
            </div>

            <div>
              <label className="text-xs font-mono text-zinc-700 font-semibold block mb-1">
                PUBLIC INQUIRIES EMAIL
              </label>
              <input
                type="email"
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-foreground font-mono focus:outline-none focus:border-primary focus:bg-white"
              />
            </div>

            <div>
              <label className="text-xs font-mono text-zinc-700 font-semibold block mb-1">
                SYSTEM & ONBOARDING NOTIFICATIONS (TARGET INBOX)
              </label>
              <input
                type="email"
                value={devEmail}
                onChange={(e) => setDevEmail(e.target.value)}
                className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-foreground font-mono focus:outline-none focus:border-primary focus:bg-white"
              />
              <span className="text-[11px] text-primary font-mono mt-0.5 block font-medium">
                Verified developer and staff alerts recipient: kbrian1237@gmail.com
              </span>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-lg font-semibold text-xs transition-all shadow-subtle cursor-pointer"
              >
                <Save className="w-4 h-4" /> Save Dispatch Settings
              </button>
            </div>
          </form>
        </div>

        {/* Telematics & Engine Thresholds */}
        <div className="space-y-6">
          <div className="bg-white border border-border rounded-xl p-6 space-y-5 shadow-subtle">
            <div className="flex items-center gap-2 text-foreground font-heading font-bold text-base">
              <Radio className="w-5 h-5 text-primary" />
              ISO 15143-3 / AEMP 2.0 Telemetry Gateway
            </div>
            <p className="text-xs text-muted">
              Direct ingestion pipeline for Komtrax, Shantui SmartFleet, and JCB LiveLink GPS telematics payloads.
            </p>

            <div className="p-3 bg-surface border border-border rounded-lg space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-muted">Gateway Endpoint:</span>
                <span className="text-primary font-bold">POST /api/v1/telemetry</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Standard Spec:</span>
                <span className="text-foreground font-semibold">ISO 15143-3 / AEMP 2.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Trigger Logic:</span>
                <span className="text-emerald-700 font-bold">Auto-Spawns Maintenance Task on Limit</span>
              </div>
            </div>

            {/* Test Simulation Form */}
            <div className="pt-2 border-t border-border space-y-3">
              <div className="text-xs font-bold font-mono text-zinc-700">
                Simulate OEM Telemetry Payload
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-muted font-mono block mb-1 font-semibold">VIN / SERIAL NO.</label>
                  <input
                    type="text"
                    value={telemetryVin}
                    onChange={(e) => setTelemetryVin(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-surface border border-border rounded text-foreground font-mono focus:bg-white focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="text-muted font-mono block mb-1 font-semibold">CUMULATIVE HOURS</label>
                  <input
                    type="number"
                    step="0.1"
                    value={telemetryHours}
                    onChange={(e) => setTelemetryHours(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-surface border border-border rounded text-foreground font-mono focus:bg-white focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleTestTelemetry}
                disabled={telemetryLoading}
                className="flex items-center gap-2 px-4 py-2 bg-surface hover:bg-surface-hover text-foreground border border-border rounded-lg text-xs font-mono font-bold transition-all cursor-pointer shadow-subtle"
              >
                <Cpu className={`w-4 h-4 text-primary ${telemetryLoading ? 'animate-spin' : ''}`} />
                Simulate Telematics Push
              </button>

              {telemetryStatus && (
                <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg text-xs font-mono text-zinc-800">
                  {telemetryStatus}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
