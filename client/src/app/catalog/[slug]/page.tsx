'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Truck, 
  Calendar, 
  ShieldCheck, 
  ArrowLeft, 
  Clock, 
  FileText, 
  Download, 
  CheckCircle2, 
  AlertTriangle,
  Phone,
  MessageSquare,
  Wrench,
  Fuel,
  Activity,
  Layers,
  Sparkles
} from 'lucide-react';
import WhatsAppBookingModal from '@/components/booking/WhatsAppBookingModal';
import { Equipment } from '@/types';
import { formatCurrency } from '@/lib/utils';

// Static Verified Brochure Fleet
const ALL_MACHINES: Equipment[] = [
  {
    id: '11111111-1111-1111-1111-111111111101',
    name: 'Komatsu PC-200 Heavy Excavator',
    category: 'Excavator',
    model: 'Komatsu PC-200',
    daily_rate: 45000,
    status: 'AVAILABLE',
    image_url: '/images/equipment/excavator.jpg',
    current_hour_meter: 342.5,
    specs: {
      engine_power: '110 kW / 148 HP',
      operating_weight: '20,500 kg',
      bucket_capacity: '1.0 m³',
      max_dig_depth: '6.62 m',
      hydraulic_flow: '450 L/min',
      fuel_tank_capacity: '400 L',
    }
  },
  {
    id: '11111111-1111-1111-1111-111111111102',
    name: 'Komatsu D155AX-8 Crawler Dozer',
    category: 'Dozer',
    model: 'Komatsu D155AX-8',
    daily_rate: 65000,
    status: 'AVAILABLE',
    image_url: '/images/equipment/dozer.jpg',
    current_hour_meter: 490.0,
    specs: {
      engine_power: '268 kW / 360 HP',
      operating_weight: '41,200 kg',
      blade_capacity: '9.4 m³',
      track_gauge: '2,140 mm',
      ground_pressure: '77.0 kPa',
    }
  },
  {
    id: '11111111-1111-1111-1111-111111111103',
    name: 'JCB 3DXPLUS Backhoe Loader',
    category: 'Backhoe',
    model: 'JCB 3DXPLUS',
    daily_rate: 28000,
    status: 'AVAILABLE',
    image_url: '/images/equipment/backhoe.jpg',
    current_hour_meter: 128.0,
    specs: {
      engine_power: '55 kW / 74 HP',
      loader_capacity: '1.1 m³',
      backhoe_depth: '4.77 m',
      transmission: 'Synchroshuttle 4WD',
      breakout_force: '5,730 kgf',
    }
  },
  {
    id: '11111111-1111-1111-1111-111111111104',
    name: 'Shantui SL60W-2 Heavy Wheel Loader',
    category: 'Wheel Loader',
    model: 'Shantui SL60W-2',
    daily_rate: 38000,
    status: 'AVAILABLE',
    image_url: '/images/equipment/wheel_loader.jpg',
    current_hour_meter: 215.4,
    specs: {
      rated_load: '6,000 kg (6 Ton)',
      bucket_capacity: '3.5 m³',
      operating_weight: '21,000 kg',
      dump_clearance: '3,180 mm',
      engine_type: 'Weichai Steyr WD10G240',
    }
  },
  {
    id: '11111111-1111-1111-1111-111111111105',
    name: 'Shantui SG18-3 Motor Grader',
    category: 'Grader',
    model: 'Shantui SG18-3',
    daily_rate: 42000,
    status: 'AVAILABLE',
    image_url: '/images/equipment/grader.jpg',
    current_hour_meter: 175.0,
    specs: {
      engine_power: '132 kW / 180 HP',
      blade_width: '3,965 mm',
      operating_weight: '16,200 kg',
      max_cut_depth: '500 mm',
      turning_radius: '7,800 mm',
    }
  },
  {
    id: '11111111-1111-1111-1111-111111111106',
    name: 'XCMG XS163J Vibratory Road Roller',
    category: 'Roller',
    model: 'XCMG XS163J',
    daily_rate: 32000,
    status: 'AVAILABLE',
    image_url: '/images/equipment/roller.jpg',
    current_hour_meter: 89.5,
    specs: {
      operating_weight: '16,000 kg (16 Ton)',
      drum_width: '2,130 mm',
      vibration_frequency: '28/33 Hz',
      linear_load: '375 N/cm',
    }
  },
  {
    id: '11111111-1111-1111-1111-111111111107',
    name: 'Isuzu FVZ 34 Heavy Tipper (15 Ton)',
    category: 'Tipper',
    model: 'Isuzu FVZ 34',
    daily_rate: 24000,
    status: 'AVAILABLE',
    image_url: '/images/equipment/tipper.jpg',
    current_hour_meter: 512.8,
    specs: {
      payload_capacity: '15,000 kg (15 Ton)',
      power_output: '280 HP',
      tipping_body: 'Heavy Duty Box',
      engine: '6HK1-TCN Turbo Diesel',
    }
  },
  {
    id: '11111111-1111-1111-1111-111111111108',
    name: 'Heavy Lowbed Semi-Trailer',
    category: 'Haulage',
    model: 'Multi-Axle Heavy Hauler',
    daily_rate: 55000,
    status: 'AVAILABLE',
    image_url: '/images/equipment/lowbed.jpg',
    current_hour_meter: 620.0,
    specs: {
      payload_capacity: '60,000 kg (60 Ton)',
      deck_length: '12.5 m',
      axles: '3-Axle Heavy Duty',
      loading_ramps: 'Hydraulic Heavy Duty',
    }
  }
];

export default function MachineDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const [machine, setMachine] = useState<Equipment | null>(null);
  const [activeTab, setActiveTab] = useState<'SPECS' | 'DOCS' | 'CALENDAR'>('SPECS');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [dateConflictToast, setDateConflictToast] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9]+/g, '');
    const found = ALL_MACHINES.find(m => {
      const mSlug = m.model.toLowerCase().replace(/[^a-z0-9]+/g, '');
      const nSlug = m.name.toLowerCase().replace(/[^a-z0-9]+/g, '');
      return cleanSlug.includes(mSlug) || mSlug.includes(cleanSlug) || cleanSlug.includes(nSlug);
    });
    setMachine(found || ALL_MACHINES[0]);
  }, [slug]);

  if (!machine) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <Truck className="w-12 h-12 mx-auto text-primary animate-pulse mb-3" />
        <p className="text-zinc-600">Loading machine details...</p>
      </div>
    );
  }

  const handleDateSelect = (dateStr: string) => {
    // Simulated existing booking: 2026-09-01 to 2026-09-05 is reserved
    if (dateStr >= '2026-09-01' && dateStr <= '2026-09-05') {
      setDateConflictToast('Asset Unavailable for Selected Dates (In Use on Site)');
      setTimeout(() => setDateConflictToast(null), 4000);
      return;
    }

    if (!startDate || (startDate && endDate)) {
      setStartDate(dateStr);
      setEndDate('');
    } else {
      if (dateStr >= startDate) {
        setEndDate(dateStr);
      } else {
        setStartDate(dateStr);
        setEndDate('');
      }
    }
  };

  const getDays = () => {
    if (!startDate || !endDate) return 1;
    const diff = Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 1;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 bg-white text-ink">
      
      {/* Top Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs font-mono text-zinc-500">
        <Link href="/catalog" className="hover:text-primary transition-colors flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Fleet Catalog
        </Link>
        <span>/</span>
        <span className="text-zinc-900 font-bold">{machine.name}</span>
      </div>

      {dateConflictToast && (
        <div className="p-4 bg-rose-50 border border-rose-300 rounded-xl text-rose-800 text-sm font-semibold flex items-center gap-2 shadow-subtle animate-in fade-in">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{dateConflictToast}</span>
        </div>
      )}

      {/* Hero Header */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Info Column */}
        <div className="lg:col-span-8 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                {machine.status}
              </span>
              <span className="text-xs font-mono text-muted">{machine.category}</span>
            </div>
            <h1 className="font-heading font-black text-3xl sm:text-5xl text-ink uppercase">
              {machine.name}
            </h1>
            <p className="text-sm text-zinc-600 font-mono">
              Model: {machine.model} • Operating Hours: {machine.current_hour_meter} hrs • Meru Fleet
            </p>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-2 border-b border-border pb-2">
            <button
              onClick={() => setActiveTab('SPECS')}
              className={`px-4 py-2 rounded-lg text-xs font-heading font-bold uppercase tracking-wider transition-all ${
                activeTab === 'SPECS' ? 'bg-primary text-white' : 'bg-surface text-zinc-600 hover:text-ink'
              }`}
            >
              Detailed Specs
            </button>
            <button
              onClick={() => setActiveTab('CALENDAR')}
              className={`px-4 py-2 rounded-lg text-xs font-heading font-bold uppercase tracking-wider transition-all ${
                activeTab === 'CALENDAR' ? 'bg-primary text-white' : 'bg-surface text-zinc-600 hover:text-ink'
              }`}
            >
              Availability Calendar
            </button>
            <button
              onClick={() => setActiveTab('DOCS')}
              className={`px-4 py-2 rounded-lg text-xs font-heading font-bold uppercase tracking-wider transition-all ${
                activeTab === 'DOCS' ? 'bg-primary text-white' : 'bg-surface text-zinc-600 hover:text-ink'
              }`}
            >
              Manual & Safety Guides
            </button>
          </div>

          {/* Tab 1: Engineering Specs */}
          {activeTab === 'SPECS' && (
            <div className="space-y-4 animate-in fade-in">
              <h3 className="text-base font-heading font-bold text-ink">Engineering & Operating Specifications</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {machine.specs && Object.entries(machine.specs).map(([key, val], idx) => (
                  <div key={idx} className="p-3.5 bg-surface border border-border rounded-xl space-y-1">
                    <span className="text-xs text-muted font-mono uppercase">{key.replace(/_/g, ' ')}</span>
                    <div className="font-heading font-bold text-ink text-sm">{String(val)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 2: Availability Calendar */}
          {activeTab === 'CALENDAR' && (
            <div className="industrial-panel p-6 space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-heading font-bold text-ink flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  Select Project Dates (15-Min Event Lock)
                </h3>
                <span className="text-[11px] font-mono text-muted">Click Start then End Date</span>
              </div>

              {/* 30-Day Grid */}
              <div className="grid grid-cols-7 gap-1.5 text-center text-xs font-mono">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                  <div key={d} className="text-muted font-bold py-1">{d}</div>
                ))}
                {Array.from({ length: 30 }).map((_, i) => {
                  const day = i + 1;
                  const dateStr = `2026-09-${String(day).padStart(2, '0')}`;
                  const isBlocked = day >= 1 && day <= 5;
                  const isSelected = (startDate && dateStr === startDate) || (endDate && dateStr === endDate);
                  const isInRange = startDate && endDate && dateStr > startDate && dateStr < endDate;

                  return (
                    <button
                      key={i}
                      disabled={isBlocked}
                      onClick={() => handleDateSelect(dateStr)}
                      title={isBlocked ? 'Reserved: In Use on Site' : `Click to select ${dateStr}`}
                      className={`h-11 rounded-lg flex flex-col items-center justify-center font-mono text-xs transition-all ${
                        isBlocked
                          ? 'bg-zinc-200 text-zinc-400 cursor-not-allowed line-through'
                          : isSelected
                          ? 'bg-primary text-white font-bold shadow-subtle'
                          : isInRange
                          ? 'bg-primary-light text-primary font-semibold'
                          : 'bg-white hover:bg-zinc-100 text-ink border border-border'
                      }`}
                    >
                      <span>{day}</span>
                      {isBlocked && <span className="text-[8px] text-zinc-500">BUSY</span>}
                    </button>
                  );
                })}
              </div>

              {startDate && (
                <div className="p-3 bg-white border border-primary/30 rounded-xl flex items-center justify-between text-xs font-mono">
                  <span>Selected Window: <strong>{startDate}</strong> &rarr; <strong>{endDate || 'Select End Date'}</strong> ({getDays()} days)</span>
                  <button
                    onClick={() => { setStartDate(''); setEndDate(''); }}
                    className="text-primary hover:underline font-bold"
                  >
                    Clear Range
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Technical Docs */}
          {activeTab === 'DOCS' && (
            <div className="industrial-panel p-6 space-y-4 animate-in fade-in">
              <h3 className="text-base font-heading font-bold text-ink">Technical Manuals & ISO Safety Certification</h3>
              <div className="space-y-3">
                {[
                  { title: `${machine.model} Operator & Field Maintenance Guide`, size: '4.2 MB', date: '2026 Edition' },
                  { title: `${machine.model} Load Chart & Stability Diagram`, size: '1.8 MB', date: 'ISO 15143 Compliant' },
                  { title: 'Meru Infrastructure Fleet Safety Protocol & Risk Assessment', size: '2.5 MB', date: 'Kenya OSHA Validated' },
                ].map((doc, idx) => (
                  <div key={idx} className="p-4 bg-white border border-border rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-primary" />
                      <div>
                        <div className="text-sm font-bold text-ink">{doc.title}</div>
                        <div className="text-xs text-muted font-mono">{doc.size} • {doc.date}</div>
                      </div>
                    </div>
                    <a
                      href={`/documents/${slug}-manual.pdf`}
                      download
                      onClick={(e) => { e.preventDefault(); alert(`Downloading verified technical documentation: ${doc.title}`); }}
                      className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5 text-primary" />
                      <span>Download PDF</span>
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Right Quick Quotation Card */}
        <div className="lg:col-span-4 sticky top-24">
          <div className="industrial-card p-6 space-y-5 shadow-card">
            
            <div className="space-y-3 text-xs font-mono">
              <div className="flex justify-between text-zinc-600">
                <span>Mobilization:</span>
                <span className="font-bold text-ink">Lowbed Dispatch Available</span>
              </div>
              <div className="flex justify-between text-zinc-600">
                <span>Operator:</span>
                <span className="font-bold text-ink">Certified Plant Operator Included</span>
              </div>
              <div className="flex justify-between text-zinc-600">
                <span>Fuel Policy:</span>
                <span className="font-bold text-ink">Dry / Wet Lease Options</span>
              </div>
            </div>

            {startDate && endDate && (
              <div className="p-3 bg-surface rounded-xl border border-primary/30 space-y-1 text-xs font-mono">
                <div className="flex justify-between text-zinc-600">
                  <span>Selected Duration:</span>
                  <span className="font-bold text-ink">{getDays()} Days</span>
                </div>
              </div>
            )}

            <button
              onClick={() => setModalOpen(true)}
              className="w-full py-3 bg-primary hover:bg-primary-hover text-white rounded-lg font-heading font-bold text-xs uppercase tracking-wider transition-all shadow-subtle flex items-center justify-center gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              Calculate Quote & Book
            </button>

            <div className="p-3 bg-surface rounded-xl border border-border space-y-1 text-center text-xs text-muted font-mono">
              <div>Direct Dispatch Hotline:</div>
              <a href="tel:+254717186396" className="text-primary font-bold hover:underline block text-sm">
                0717 186396 / 0748866823
              </a>
            </div>

          </div>
        </div>

      </div>

      {/* Booking Modal */}
      <WhatsAppBookingModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        equipment={machine}
        prefillDates={{ startDate, endDate }}
      />

    </div>
  );
}
