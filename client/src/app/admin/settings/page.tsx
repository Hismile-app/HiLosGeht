'use client';

import React, { useState, useEffect } from 'react';
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
  AlertTriangle,
  Layers,
  MapPin,
  Package,
  Plus,
  Trash2,
  Fuel,
  Clock
} from 'lucide-react';

export default function SystemSettingsPage() {
  const [role, setRole] = useState<'ADMIN' | 'OPERATOR'>('ADMIN');
  const [primaryPhone, setPrimaryPhone] = useState('0717 186396');
  const [backupPhone, setBackupPhone] = useState('0748866823');
  const [supportEmail, setSupportEmail] = useState('hilosgehtinfo@gmail.com');
  const [devEmail, setDevEmail] = useState('kbrian1237@gmail.com');
  const [pmInterval, setPmInterval] = useState('500');
  const [fuelPrice, setFuelPrice] = useState('180');
  const [saved, setSaved] = useState(false);

  // Dynamic Options State (Stored in DB public.system_settings)
  const [serviceCategories, setServiceCategories] = useState<string[]>([
    'Quarry & Foundation Mass Excavation',
    'Road Grading & Sub-base Compaction',
    'Agricultural Water Dam Construction',
    'General Heavy Fleet Inquiry & Consultation'
  ]);
  const [operationalRegions, setOperationalRegions] = useState<string[]>([
    'Meru Town & Municipal Hub',
    'Nkubu & Imenti South',
    'Maua & Nyambene / Igembe',
    'Timau & Buuri Corridor',
    'Isiolo County / Northern Corridor',
    'Tharaka Nithi County / Chuka',
    'Embu County & Mt. Kenya East',
    'Other East Africa Region'
  ]);
  const [quarryMaterials, setQuarryMaterials] = useState<string[]>([
    'Machine-cut Stone Blocks (9x9)',
    'Machine-cut Stone Blocks (6x9)',
    'Ballast (3/4 Inch Aggregate)',
    'Quarry Dust',
    'Hardcore Foundation Rock',
    'Murram Sub-base'
  ]);

  const [newCategory, setNewCategory] = useState('');
  const [newRegion, setNewRegion] = useState('');
  const [newMaterial, setNewMaterial] = useState('');

  // Telemetry simulator state
  const [telemetryVin, setTelemetryVin] = useState('KOM-PC200-KE-001');
  const [telemetryHours, setTelemetryHours] = useState('501.5');
  const [telemetryFuel, setTelemetryFuel] = useState('85.0');
  const [telemetryStatus, setTelemetryStatus] = useState<string | null>(null);
  const [telemetryLoading, setTelemetryLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedRole = localStorage.getItem('hlg_role');
      if (storedRole === 'OPERATOR') {
        setRole('OPERATOR');
      }
    }

    const fetchSettings = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api/v1';
        const res = await fetch(`${apiUrl}/settings`);
        if (res.ok) {
          const json = await res.json();
          if (json?.data) {
            const hotlines = json.data.dispatch_hotlines;
            const notifs = json.data.notification_channels;
            const ops = json.data.operational_parameters;
            if (hotlines?.primary_phone) setPrimaryPhone(hotlines.primary_phone);
            if (hotlines?.backup_phone) setBackupPhone(hotlines.backup_phone);
            if (notifs?.support_email) setSupportEmail(notifs.support_email);
            if (notifs?.dev_email) setDevEmail(notifs.dev_email);
            if (ops?.pm_interval_hours) setPmInterval(String(ops.pm_interval_hours));
            if (ops?.fuel_price_kes_per_liter) setFuelPrice(String(ops.fuel_price_kes_per_liter));
            
            if (Array.isArray(json.data.service_categories)) {
              setServiceCategories(json.data.service_categories);
            }
            if (Array.isArray(json.data.operational_regions)) {
              setOperationalRegions(json.data.operational_regions);
            }
            if (Array.isArray(json.data.quarry_materials)) {
              setQuarryMaterials(json.data.quarry_materials);
            }
          }
        }
      } catch (err) {}
    };
    fetchSettings();
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

  const saveAllSettings = async (overrides?: any) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api/v1';
      await fetch(`${apiUrl}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dispatch_hotlines: {
            primary_phone: primaryPhone,
            backup_phone: backupPhone,
            international_primary: primaryPhone.startsWith('+') ? primaryPhone : `+254${primaryPhone.replace(/^0/, '')}`,
            international_backup: backupPhone.startsWith('+') ? backupPhone : `+254${backupPhone.replace(/^0/, '')}`,
          },
          notification_channels: {
            support_email: supportEmail,
            dev_email: devEmail,
            alert_on_breakdown: true,
          },
          operational_parameters: {
            fuel_price_kes_per_liter: parseFloat(fuelPrice) || 180.0,
            pm_interval_hours: parseFloat(pmInterval) || 500.0,
          },
          service_categories: overrides?.service_categories || serviceCategories,
          operational_regions: overrides?.operational_regions || operationalRegions,
          quarry_materials: overrides?.quarry_materials || quarryMaterials,
        }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    saveAllSettings();
  };

  // Add / Remove handlers with instant database persistence
  const handleAddCategory = () => {
    if (!newCategory.trim()) return;
    const updated = [...serviceCategories, newCategory.trim()];
    setServiceCategories(updated);
    setNewCategory('');
    saveAllSettings({ service_categories: updated });
  };

  const handleDeleteCategory = (idx: number) => {
    const updated = serviceCategories.filter((_, i) => i !== idx);
    setServiceCategories(updated);
    saveAllSettings({ service_categories: updated });
  };

  const handleAddRegion = () => {
    if (!newRegion.trim()) return;
    const updated = [...operationalRegions, newRegion.trim()];
    setOperationalRegions(updated);
    setNewRegion('');
    saveAllSettings({ operational_regions: updated });
  };

  const handleDeleteRegion = (idx: number) => {
    const updated = operationalRegions.filter((_, i) => i !== idx);
    setOperationalRegions(updated);
    saveAllSettings({ operational_regions: updated });
  };

  const handleAddMaterial = () => {
    if (!newMaterial.trim()) return;
    const updated = [...quarryMaterials, newMaterial.trim()];
    setQuarryMaterials(updated);
    setNewMaterial('');
    saveAllSettings({ quarry_materials: updated });
  };

  const handleDeleteMaterial = (idx: number) => {
    const updated = quarryMaterials.filter((_, i) => i !== idx);
    setQuarryMaterials(updated);
    saveAllSettings({ quarry_materials: updated });
  };

  const handleTestTelemetry = async () => {
    setTelemetryLoading(true);
    setTelemetryStatus(null);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api/v1';
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
            System Settings & Operations Configuration
          </h1>
          <p className="text-sm text-muted mt-0.5">
            Dynamic service options, operational zones, dispatch hotlines, KES diesel rates, and telematics triggers.
          </p>
        </div>

        {saved && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-300 rounded-lg text-xs font-mono font-bold">
            <CheckCircle2 className="w-4 h-4" /> System Settings Persisted to Database
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

        {/* Operational Parameters & Telematics */}
        <div className="space-y-6">
          <div className="bg-white border border-border rounded-xl p-6 space-y-4 shadow-subtle">
            <div className="flex items-center gap-2 text-foreground font-heading font-bold text-base">
              <Fuel className="w-5 h-5 text-primary" />
              Dynamic Economic & Maintenance Limits
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-mono text-zinc-700 font-semibold block mb-1">
                  CURRENT FUEL RATE (KES / LITRE)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.5"
                    value={fuelPrice}
                    onChange={(e) => setFuelPrice(e.target.value)}
                    className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-foreground font-mono text-sm focus:outline-none focus:border-primary focus:bg-white"
                  />
                  <button
                    onClick={() => saveAllSettings()}
                    className="px-3 py-2 bg-primary text-white rounded-lg text-xs font-mono font-bold hover:bg-primary-hover shrink-0 cursor-pointer"
                  >
                    Save
                  </button>
                </div>
                <span className="text-[11px] text-muted font-mono mt-0.5 block">
                  Used by Financials and AI fuel diagnostic engines.
                </span>
              </div>

              <div>
                <label className="text-xs font-mono text-zinc-700 font-semibold block mb-1">
                  PREVENTATIVE MAINTENANCE (HOURS)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={pmInterval}
                    onChange={(e) => setPmInterval(e.target.value)}
                    className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-foreground font-mono text-sm focus:outline-none focus:border-primary focus:bg-white"
                  />
                  <button
                    onClick={() => saveAllSettings()}
                    className="px-3 py-2 bg-primary text-white rounded-lg text-xs font-mono font-bold hover:bg-primary-hover shrink-0 cursor-pointer"
                  >
                    Save
                  </button>
                </div>
                <span className="text-[11px] text-muted font-mono mt-0.5 block">
                  Triggers inspection alert at 250h / 500h cycles.
                </span>
              </div>
            </div>
          </div>

          {/* Telematics Simulator */}
          <div className="bg-white border border-border rounded-xl p-6 space-y-4 shadow-subtle">
            <div className="flex items-center gap-2 text-foreground font-heading font-bold text-base">
              <Radio className="w-5 h-5 text-primary" />
              ISO 15143-3 / AEMP 2.0 Telemetry Gateway
            </div>
            <p className="text-xs text-muted">
              Live ingestion pipeline for Komtrax, Shantui SmartFleet, and JCB LiveLink telematics.
            </p>

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

      {/* DYNAMIC METADATA & FIELD OPTIONS MANAGERS */}
      <div className="border-t border-border pt-6 space-y-6">
        <div>
          <h2 className="text-xl font-heading font-black text-foreground flex items-center gap-2.5">
            <Layers className="w-5 h-5 text-primary" />
            Field Catalogs & Dynamic Options Management
          </h2>
          <p className="text-xs text-muted mt-0.5">
            Zero hardcoded data: Add, edit, or remove operational categories, logistics regions, and quarry materials stored in the database.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* 1. Service Inquiry Categories */}
          <div className="bg-white border border-border rounded-xl p-5 space-y-4 shadow-subtle flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-heading font-bold text-sm text-foreground flex items-center gap-2">
                  <Layers className="w-4 h-4 text-primary" /> Service Scopes
                </span>
                <span className="text-[11px] font-mono bg-orange-50 text-primary px-2 py-0.5 rounded font-bold">
                  {serviceCategories.length} items
                </span>
              </div>
              <p className="text-[11px] text-muted">
                Populates service category dropdowns on client quote requests & inquiries.
              </p>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {serviceCategories.map((cat, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-surface border border-border text-xs">
                    <span className="font-medium text-foreground truncate pr-2">{cat}</span>
                    <button
                      onClick={() => handleDeleteCategory(idx)}
                      title="Remove category"
                      className="text-zinc-600 hover:text-rose-600 p-1 rounded hover:bg-rose-50 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-border flex gap-2">
              <input
                type="text"
                placeholder="New service category..."
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                className="flex-1 px-2.5 py-1.5 text-xs bg-surface border border-border rounded-lg text-foreground focus:bg-white focus:outline-none focus:border-primary"
              />
              <button
                type="button"
                onClick={handleAddCategory}
                className="px-3 py-1.5 bg-primary hover:bg-primary-hover text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>
          </div>

          {/* 2. Operational Regions & Zones */}
          <div className="bg-white border border-border rounded-xl p-5 space-y-4 shadow-subtle flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-heading font-bold text-sm text-foreground flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" /> Logistics Regions
                </span>
                <span className="text-[11px] font-mono bg-orange-50 text-primary px-2 py-0.5 rounded font-bold">
                  {operationalRegions.length} zones
                </span>
              </div>
              <p className="text-[11px] text-muted">
                Deployment territories across Meru, Mt. Kenya, and Northern Corridor.
              </p>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {operationalRegions.map((reg, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-surface border border-border text-xs">
                    <span className="font-medium text-foreground truncate pr-2">{reg}</span>
                    <button
                      onClick={() => handleDeleteRegion(idx)}
                      title="Remove region"
                      className="text-zinc-600 hover:text-rose-600 p-1 rounded hover:bg-rose-50 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-border flex gap-2">
              <input
                type="text"
                placeholder="New region / corridor..."
                value={newRegion}
                onChange={(e) => setNewRegion(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddRegion()}
                className="flex-1 px-2.5 py-1.5 text-xs bg-surface border border-border rounded-lg text-foreground focus:bg-white focus:outline-none focus:border-primary"
              />
              <button
                type="button"
                onClick={handleAddRegion}
                className="px-3 py-1.5 bg-primary hover:bg-primary-hover text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>
          </div>

          {/* 3. Quarry Materials & Stock */}
          <div className="bg-white border border-border rounded-xl p-5 space-y-4 shadow-subtle flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-heading font-bold text-sm text-foreground flex items-center gap-2">
                  <Package className="w-4 h-4 text-primary" /> Quarry Materials
                </span>
                <span className="text-[11px] font-mono bg-orange-50 text-primary px-2 py-0.5 rounded font-bold">
                  {quarryMaterials.length} types
                </span>
              </div>
              <p className="text-[11px] text-muted">
                Material yield types tracked in Operator Daily Logs and Quarry yield reports.
              </p>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {quarryMaterials.map((mat, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-surface border border-border text-xs">
                    <span className="font-medium text-foreground truncate pr-2">{mat}</span>
                    <button
                      onClick={() => handleDeleteMaterial(idx)}
                      title="Remove material"
                      className="text-zinc-600 hover:text-rose-600 p-1 rounded hover:bg-rose-50 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-border flex gap-2">
              <input
                type="text"
                placeholder="New stone/ballast type..."
                value={newMaterial}
                onChange={(e) => setNewMaterial(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddMaterial()}
                className="flex-1 px-2.5 py-1.5 text-xs bg-surface border border-border rounded-lg text-foreground focus:bg-white focus:outline-none focus:border-primary"
              />
              <button
                type="button"
                onClick={handleAddMaterial}
                className="px-3 py-1.5 bg-primary hover:bg-primary-hover text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
