'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Truck, 
  ShieldCheck, 
  Calendar, 
  Phone, 
  MessageSquare, 
  ArrowRight, 
  CheckCircle2, 
  Cpu, 
  Flame, 
  Gauge, 
  Clock, 
  Wrench,
  ChevronRight
} from 'lucide-react';
import NeonButton from '@/components/common/NeonButton';
import GlassCard from '@/components/common/GlassCard';
import StatusBadge from '@/components/common/StatusBadge';
import WhatsAppBookingModal from '@/components/booking/WhatsAppBookingModal';
import { Equipment } from '@/types';
import { formatCurrency } from '@/lib/utils';

// Static Fleet Preview Data
const FEATURED_FLEET: Equipment[] = [
  {
    id: '11111111-1111-1111-1111-111111111101',
    name: 'Komatsu PC-200 Heavy Excavator',
    category: 'Excavator',
    model: 'Komatsu PC-200',
    daily_rate: 45000,
    status: 'AVAILABLE',
    image_url: '/images/equipment/komatsu_pc200.png',
    current_hour_meter: 342.5,
    specs: {
      engine_power: '110 kW / 148 HP',
      operating_weight: '20,500 kg',
      bucket_capacity: '1.0 m³',
      max_dig_depth: '6.62 m',
    }
  },
  {
    id: '11111111-1111-1111-1111-111111111102',
    name: 'Komatsu D155AX-8 Crawler Dozer',
    category: 'Dozer',
    model: 'Komatsu D155AX-8',
    daily_rate: 65000,
    status: 'AVAILABLE',
    image_url: '/images/equipment/komatsu_d155ax8.png',
    current_hour_meter: 490.0,
    specs: {
      engine_power: '268 kW / 360 HP',
      operating_weight: '41,200 kg',
      blade_capacity: '9.4 m³',
    }
  },
  {
    id: '11111111-1111-1111-1111-111111111103',
    name: 'JCB 3DXPLUS Backhoe Loader',
    category: 'Backhoe',
    model: 'JCB 3DXPLUS',
    daily_rate: 28000,
    status: 'AVAILABLE',
    image_url: '/images/equipment/jcb_3dxplus.png',
    current_hour_meter: 128.0,
    specs: {
      engine_power: '55 kW / 74 HP',
      loader_capacity: '1.1 m³',
      backhoe_depth: '4.77 m',
    }
  },
  {
    id: '11111111-1111-1111-1111-111111111104',
    name: 'Shantui SL60W-2 Heavy Wheel Loader',
    category: 'Wheel Loader',
    model: 'Shantui SL60W-2',
    daily_rate: 38000,
    status: 'AVAILABLE',
    image_url: '/images/equipment/shantui_sl60w2.png',
    current_hour_meter: 215.4,
    specs: {
      rated_load: '6,000 kg (6 Ton)',
      bucket_capacity: '3.5 m³',
      operating_weight: '21,000 kg',
    }
  },
  {
    id: '11111111-1111-1111-1111-111111111105',
    name: 'Shantui SG18-3 Motor Grader',
    category: 'Grader',
    model: 'Shantui SG18-3',
    daily_rate: 42000,
    status: 'AVAILABLE',
    image_url: '/images/equipment/shantui_sg183.png',
    current_hour_meter: 175.0,
    specs: {
      engine_power: '132 kW / 180 HP',
      blade_width: '3,965 mm',
      operating_weight: '16,200 kg',
    }
  },
  {
    id: '11111111-1111-1111-1111-111111111107',
    name: 'Isuzu FVZ 34 Heavy Tipper (15 Ton)',
    category: 'Tipper',
    model: 'Isuzu FVZ 34',
    daily_rate: 24000,
    status: 'AVAILABLE',
    image_url: '/images/equipment/isuzu_fvz34.png',
    current_hour_meter: 512.8,
    specs: {
      payload_capacity: '15,000 kg (15 Ton)',
      power_output: '280 HP',
      tipping_body: 'Heavy Duty Box',
    }
  }
];

export default function HomePage() {
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);

  const handleBookClick = (machine: Equipment) => {
    setSelectedEquipment(machine);
    setBookingModalOpen(true);
  };

  return (
    <div className="relative overflow-hidden">
      
      {/* Background Cyber-Industrial Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/10 blur-[140px] rounded-full pointer-events-none" />

      {/* --- HERO SECTION --- */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-24 lg:pt-20 lg:pb-32">
        <div className="text-center max-w-4xl mx-auto space-y-8">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/40 shadow-neon text-primary font-mono text-xs uppercase tracking-widest animate-pulse">
            <Cpu className="w-3.5 h-3.5" />
            <span>Meru Heavy Equipment & Logistics Platform</span>
          </div>

          {/* Headline */}
          <h1 className="font-heading font-black text-4xl sm:text-6xl lg:text-7xl tracking-tight text-white uppercase leading-none">
            POWERING <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-[#FF833B] to-yellow-500">INFRASTRUCTURE</span> ACROSS MERU
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-xl text-gray-300 font-light max-w-2xl mx-auto leading-relaxed">
            Direct, verified B2B booking for excavators, dozers, graders, and tippers. Backed by real-time calendar holds, instant WhatsApp dispatch, and automated telematics.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/catalog" className="w-full sm:w-auto">
              <NeonButton size="lg" className="w-full" icon={<Truck className="w-5 h-5" />}>
                Explore Fleet Catalog
              </NeonButton>
            </Link>

            <a
              href="https://wa.me/254717186396?text=Hello%20HLG%20Dispatch%20Team%2C%20I%20would%20like%20to%20inquire%20about%20heavy%20machinery%20availability%20for%20my%20site."
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto neon-btn-secondary text-sm py-3.5 px-6 flex items-center justify-center gap-2"
            >
              <MessageSquare className="w-4 h-4 text-primary" />
              <span>WhatsApp Dispatch: 0717 186396</span>
            </a>
          </div>

          {/* Dispatch phone reminder */}
          <p className="text-xs text-muted font-mono">
            Direct Lines: <strong className="text-white">0717 186396</strong> | Backup: <strong className="text-white">0748866823</strong>
          </p>

        </div>
      </section>

      {/* --- LIVE METRICS STRIP --- */}
      <section className="border-y border-border-neon/30 bg-surface/80 backdrop-blur-md py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            
            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-black font-heading text-primary">8+</div>
              <div className="text-xs text-muted uppercase tracking-wider font-mono">Heavy Machinery Units</div>
            </div>

            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-black font-heading text-white">100%</div>
              <div className="text-xs text-muted uppercase tracking-wider font-mono">GiST Double-Booking Guard</div>
            </div>

            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-black font-heading text-primary">&lt; 15 Min</div>
              <div className="text-xs text-muted uppercase tracking-wider font-mono">WhatsApp Dispatch Speed</div>
            </div>

            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-black font-heading text-white">24/7</div>
              <div className="text-xs text-muted uppercase tracking-wider font-mono">Meru Quarry & Site Haulage</div>
            </div>

          </div>
        </div>
      </section>

      {/* --- FEATURED MACHINERY SHOWCASE --- */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-primary block mb-2">
              Heavy Equipment Fleet
            </span>
            <h2 className="font-heading font-black text-3xl sm:text-4xl text-white uppercase">
              Brochure Certified Machinery
            </h2>
          </div>
          <Link href="/catalog" className="text-xs font-mono text-primary hover:text-white flex items-center gap-1">
            <span>View Full Fleet & Calendar</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURED_FLEET.map((machine) => (
            <GlassCard key={machine.id} className="flex flex-col justify-between group">
              <div>
                
                {/* Header & Status */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono text-muted uppercase tracking-wider">
                    {machine.category}
                  </span>
                  <StatusBadge status={machine.status} />
                </div>

                {/* Machine Graphic Box */}
                <div className="h-44 rounded-lg bg-neutral-900 border border-border flex items-center justify-center mb-5 relative overflow-hidden group-hover:border-primary/40 transition-colors">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10" />
                  <Truck className="w-20 h-20 text-primary/30 group-hover:scale-110 group-hover:text-primary/60 transition-all duration-500" />
                  <div className="absolute bottom-3 left-3 z-20 font-mono text-[11px] text-gray-300">
                    Model: <span className="text-white font-bold">{machine.model}</span>
                  </div>
                </div>

                {/* Title & Price */}
                <h3 className="font-heading font-bold text-lg text-white mb-2 line-clamp-1">
                  {machine.name}
                </h3>

                <div className="mb-4">
                  <span className="text-2xl font-black font-heading text-primary">
                    {formatCurrency(machine.daily_rate)}
                  </span>
                  <span className="text-xs text-muted font-mono ml-1">/ day</span>
                </div>

                {/* Specs Pill List */}
                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-gray-400 mb-6 bg-surface-card p-3 rounded border border-border/60">
                  {machine.specs.engine_power && (
                    <div>⚡ {machine.specs.engine_power}</div>
                  )}
                  {machine.specs.bucket_capacity && (
                    <div>🪣 {machine.specs.bucket_capacity}</div>
                  )}
                  {machine.specs.blade_capacity && (
                    <div>🚜 {machine.specs.blade_capacity}</div>
                  )}
                  {machine.specs.payload_capacity && (
                    <div>📦 {machine.specs.payload_capacity}</div>
                  )}
                  {machine.specs.operating_weight && (
                    <div>⚖️ {machine.specs.operating_weight}</div>
                  )}
                  {machine.specs.max_dig_depth && (
                    <div>⛏️ {machine.specs.max_dig_depth}</div>
                  )}
                </div>

              </div>

              {/* Book Action */}
              <NeonButton
                size="sm"
                onClick={() => handleBookClick(machine)}
                className="w-full text-xs"
                icon={<MessageSquare className="w-3.5 h-3.5" />}
              >
                Book via WhatsApp
              </NeonButton>

            </GlassCard>
          ))}
        </div>
      </section>

      {/* --- PLATFORM BLUEPRINT ARCHITECTURE HIGHLIGHTS --- */}
      <section className="bg-surface/50 border-t border-border-neon/30 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-mono uppercase tracking-widest text-primary block">
              High-Touch B2B Logistics
            </span>
            <h2 className="font-heading font-black text-3xl sm:text-4xl text-white uppercase">
              The HLG Operational Edge
            </h2>
            <p className="text-sm text-gray-400">
              Built specifically for civil contractors, site managers, and quarry fleet operators in Meru.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            <GlassCard className="space-y-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 border border-primary/40 flex items-center justify-center text-primary">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className="font-heading text-lg font-bold text-white">Direct B2B WhatsApp Flow</h3>
              <p className="text-xs text-muted leading-relaxed">
                Skip cumbersome checkout forms. Select dates, lock your hold tentatively, and negotiate project rates directly with our Meru dispatchers on WhatsApp (0717 186396 / 0748866823).
              </p>
            </GlassCard>

            <GlassCard className="space-y-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 border border-primary/40 flex items-center justify-center text-primary">
                <Gauge className="w-6 h-6" />
              </div>
              <h3 className="font-heading text-lg font-bold text-white">Mobile Operator Daily Logs</h3>
              <p className="text-xs text-muted leading-relaxed">
                Dedicated field portal for heavy machinery operators to log start/end hour meters, soil/gravel trips, and upload M-Pesa fuel receipts directly from active jobsites.
              </p>
            </GlassCard>

            <GlassCard className="space-y-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 border border-primary/40 flex items-center justify-center text-primary">
                <Flame className="w-6 h-6" />
              </div>
              <h3 className="font-heading text-lg font-bold text-white">AI Anomaly & Fuel Diagnostics</h3>
              <p className="text-xs text-muted leading-relaxed">
                Automated algorithms summarize weekly throughput and flag irregularities (e.g. unusually high fuel consumption vs. engine hours) and trigger preventive maintenance alerts.
              </p>
            </GlassCard>

          </div>
        </div>
      </section>

      {/* Booking Modal */}
      <WhatsAppBookingModal
        equipment={selectedEquipment}
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
      />

    </div>
  );
}
