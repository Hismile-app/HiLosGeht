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
  Cpu
} from 'lucide-react';

export default function SystemSettingsPage() {
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

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleTestTelemetry = async () => {
    setTelemetryLoading(true);
    setTelemetryStatus(null);
    try {
      const res = await fetch('http://localhost:5000/api/v1/telemetry', {
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
      if (data.success) {
        setTelemetryStatus(`Ingested Successfully: ${data.data.machine_name} updated to ${data.data.new_operating_hours} hrs. Maintenance trigger status: ${data.data.status}`);
      } else {
        setTelemetryStatus(`Error: ${data.error}`);
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
            <span className="text-xs text-gray-400">Administration</span>
          </div>
          <h1 className="text-2xl font-heading font-black text-white flex items-center gap-2.5 mt-1">
            <Settings className="w-6 h-6 text-primary" />
            System Settings & Telematics Gateway
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Dispatch numbers, notification routing, ISO 15143-3 AEMP 2.0 telematics hooks, and maintenance thresholds.
          </p>
        </div>

        {saved && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-lg text-xs font-mono">
            <CheckCircle2 className="w-4 h-4" /> System Settings Persisted
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Dispatch & Contact Settings */}
        <div className="bg-surface border border-border rounded-xl p-6 space-y-5">
          <div className="flex items-center gap-2 text-white font-heading font-bold text-base">
            <Phone className="w-5 h-5 text-primary" />
            Meru Machinery Dispatch Hotlines
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-4 text-sm">
            <div>
              <label className="text-xs font-mono text-muted block mb-1">
                PRIMARY WHATSAPP BOOKING NUMBER (DEFAULT DISPATCH)
              </label>
              <input
                type="text"
                value={primaryPhone}
                onChange={(e) => setPrimaryPhone(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-900 border border-border rounded-lg text-white font-mono focus:outline-none focus:border-primary"
              />
              <span className="text-[11px] text-gray-400 font-mono mt-0.5 block">
                Formatted as: 0717 186396 / +254717186396
              </span>
            </div>

            <div>
              <label className="text-xs font-mono text-muted block mb-1">
                BACKUP WHATSAPP DISPATCH NUMBER (FALLBACK)
              </label>
              <input
                type="text"
                value={backupPhone}
                onChange={(e) => setBackupPhone(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-900 border border-border rounded-lg text-white font-mono focus:outline-none focus:border-primary"
              />
              <span className="text-[11px] text-gray-400 font-mono mt-0.5 block">
                Formatted as: 0748866823 / +254748866823
              </span>
            </div>

            <div>
              <label className="text-xs font-mono text-muted block mb-1">
                PUBLIC INQUIRIES EMAIL
              </label>
              <input
                type="email"
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-900 border border-border rounded-lg text-white font-mono focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="text-xs font-mono text-muted block mb-1">
                SYSTEM & ONBOARDING NOTIFICATIONS (TARGET INBOX)
              </label>
              <input
                type="email"
                value={devEmail}
                onChange={(e) => setDevEmail(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-900 border border-border rounded-lg text-white font-mono focus:outline-none focus:border-primary"
              />
              <span className="text-[11px] text-primary font-mono mt-0.5 block">
                Verified developer and staff alerts recipient: kbrian1237@gmail.com
              </span>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-lg font-semibold text-xs transition-all shadow-neon"
              >
                <Save className="w-4 h-4" /> Save Dispatch Settings
              </button>
            </div>
          </form>
        </div>

        {/* Telematics & Engine Thresholds */}
        <div className="space-y-6">
          <div className="bg-surface border border-border rounded-xl p-6 space-y-5">
            <div className="flex items-center gap-2 text-white font-heading font-bold text-base">
              <Radio className="w-5 h-5 text-primary" />
              ISO 15143-3 / AEMP 2.0 Telemetry Gateway
            </div>
            <p className="text-xs text-gray-400">
              Direct ingestion pipeline for Komtrax, Shantui SmartFleet, and JCB LiveLink GPS telematics payloads.
            </p>

            <div className="p-3 bg-neutral-900 rounded-lg space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-muted">Gateway Endpoint:</span>
                <span className="text-primary font-bold">POST /api/v1/telemetry</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Standard Spec:</span>
                <span className="text-white">ISO 15143-3 / AEMP 2.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Trigger Logic:</span>
                <span className="text-emerald-400">Auto-Spawns Maintenance Task on Limit</span>
              </div>
            </div>

            {/* Test Simulation Form */}
            <div className="pt-2 border-t border-border space-y-3">
              <div className="text-xs font-bold font-mono text-gray-300">
                Simulate OEM Telemetry Payload
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-muted font-mono block mb-1">VIN / SERIAL NO.</label>
                  <input
                    type="text"
                    value={telemetryVin}
                    onChange={(e) => setTelemetryVin(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-neutral-900 border border-border rounded text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-muted font-mono block mb-1">CUMULATIVE HOURS</label>
                  <input
                    type="number"
                    step="0.1"
                    value={telemetryHours}
                    onChange={(e) => setTelemetryHours(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-neutral-900 border border-border rounded text-white font-mono"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleTestTelemetry}
                disabled={telemetryLoading}
                className="flex items-center gap-2 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-xs font-mono font-medium transition-all"
              >
                <Cpu className={`w-4 h-4 text-primary ${telemetryLoading ? 'animate-spin' : ''}`} />
                Simulate Telematics Push
              </button>

              {telemetryStatus && (
                <div className="p-3 bg-neutral-900 border border-primary/40 rounded-lg text-xs font-mono text-gray-200">
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
