'use client';

import React, { useState, useEffect } from 'react';
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
  ChevronRight,
  Layers,
  MapPin,
  FileText,
  Activity,
  Award
} from 'lucide-react';
import WhatsAppBookingModal from '@/components/booking/WhatsAppBookingModal';
import { Equipment } from '@/types';
import { formatCurrency } from '@/lib/utils';

// Core 8 Machinery Models matching brochure
const FEATURED_FLEET: Equipment[] = [
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
    }
  }
];

// Core 8 Infrastructure Services
const CORE_SERVICES = [
  { title: 'Excavation & Trenching', desc: 'Deep quarry mining, foundation digging, and stormwater drainage channels.', icon: Truck },
  { title: 'Sub-Base Paving & Grading', desc: 'Precision highway leveling, camber formation, and gravel spreading with Shantui SG18-3.', icon: Layers },
  { title: 'Mass Earthmoving & Land Clearing', desc: 'Bulk site leveling, dam construction, and bush clearing via Komatsu D155AX-8.', icon: Flame },
  { title: 'Heavy Aggregate Haulage', desc: '15-ton tipping and site transport for ballast, murram, and quarry sand across Meru.', icon: Gauge },
  { title: 'Vibratory Soil Compaction', desc: '16-ton dynamic roadbed compaction ensuring maximum proctor density on subgrade.', icon: Activity },
  { title: 'Heavy Plant Mobilization', desc: 'Multi-axle 60-ton lowbed semi-trailer haulage for site-to-site machinery moves.', icon: Wrench },
  { title: 'Civil Trench & Utility Digging', desc: 'JCB 3DXPLUS dual backhoe trenching for piping, power cables, and culverts.', icon: Clock },
  { title: 'ISO 15143-3 Telemetry Fleet', desc: 'AEMP 2.0 connected telematics monitoring hourly burn rates, wear, and preventive service.', icon: Cpu },
];

export default function HomePage() {
  const [fleet, setFleet] = useState<Equipment[]>(FEATURED_FLEET);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    async function loadRealFleet() {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
        const res = await fetch(`${apiUrl}/equipment`);
        if (res.ok) {
          const json = await res.json();
          if (json?.data && Array.isArray(json.data) && json.data.length > 0) {
            setFleet(json.data);
          }
        }
      } catch (err) {
        // Fallback to static verified brochure data
      }
    }
    loadRealFleet();
  }, []);

  const handleBookNow = (item: Equipment) => {
    setSelectedEquipment(item);
    setModalOpen(true);
  };

  return (
    <div className="bg-white text-ink">
      
      {/* Hero Section */}
      <section className="relative pt-12 pb-20 border-b border-border bg-grid-light overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-7 space-y-6">
              


              <h1 className="font-heading font-black text-4xl sm:text-6xl text-ink leading-tight tracking-tight uppercase">
                HEAVY MACHINERY <span className="text-primary">RENTAL & FLEET</span> LOGISTICS
              </h1>

              <p className="text-base sm:text-lg text-zinc-600 max-w-2xl leading-relaxed">
                Direct B2B equipment dispatch in Meru, Kenya. Rent Komatsu excavators, Shantui graders, JCB backhoes, and Isuzu tipper trucks with real-time availability and verified operator logs.
              </p>

              {/* Call-to-action buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link 
                  href="/catalog" 
                  className="btn-primary"
                >
                  <Truck className="w-4 h-4" />
                  Explore Machinery Catalog
                </Link>

                <a 
                  href="https://wa.me/254717186396?text=Hi%20HLG,%20I%20would%20like%20to%20inquire%20about%20booking%20heavy%20machinery."
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn-secondary flex items-center gap-2"
                >
                  <MessageSquare className="w-4 h-4 text-emerald-600" />
                  <span>WhatsApp: 0717 186396</span>
                </a>
              </div>



            </div>

            {/* Hero Quick Quotation Card */}
            <div className="lg:col-span-5">
              <div className="industrial-panel p-6 shadow-card space-y-5">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <div className="font-heading font-bold text-sm text-ink flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-primary" />
                    Rapid Site Dispatch & Quotes
                  </div>
                  <span className="text-[11px] font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    24/7 ACTIVE
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-border">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-ink block font-sans">Guaranteed GiST Availability</strong>
                      <span className="text-muted">PostgreSQL temporal locks prevent double bookings.</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-border">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-ink block font-sans">Verified Shift Hour Meters</strong>
                      <span className="text-muted">Daily operator fuel and runtime logs with receipt proofs.</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-border">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-ink block font-sans">Direct Mobilization Haulage</strong>
                      <span className="text-muted">60-ton lowbed semi-trailers for on-site delivery in Meru.</span>
                    </div>
                  </div>
                </div>

                <Link
                  href="/catalog"
                  className="w-full py-3 bg-primary hover:bg-primary-hover text-white rounded-lg font-heading font-bold text-xs uppercase tracking-wider text-center block transition-all shadow-subtle"
                >
                  View Active Fleet Rates &rarr;
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Services Overview Section (Smooth Scroll target: #services) */}
      <section id="services" className="py-16 bg-surface border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-primary/10 border border-primary/20 text-primary font-mono text-xs uppercase font-bold">
              <span>Core Infrastructure Solutions</span>
            </div>
            <h2 className="font-heading font-black text-3xl sm:text-4xl text-ink uppercase">
              HEAVY PLANT CAPACITIES & SERVICES
            </h2>
            <p className="text-sm text-zinc-600">
              End-to-end heavy equipment logistics for road construction, quarry development, civil trenching, and mass site leveling across Kenya.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {CORE_SERVICES.map((svc, i) => {
              const Icon = svc.icon;
              return (
                <div key={i} className="industrial-card p-5 space-y-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-heading font-bold text-sm text-ink">{svc.title}</h3>
                  <p className="text-xs text-zinc-600 leading-relaxed">{svc.desc}</p>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* Featured Heavy Machinery Grid */}
      <section className="py-16 bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 text-primary font-mono text-xs uppercase font-bold">
                <Truck className="w-4 h-4" />
                <span>Verified Equipment Brochure</span>
              </div>
              <h2 className="font-heading font-black text-2xl sm:text-4xl text-ink uppercase mt-1">
                FEATURED MACHINERY FLEET
              </h2>
            </div>

            <Link 
              href="/catalog" 
              className="text-xs font-mono font-bold text-primary hover:underline flex items-center gap-1.5"
            >
              <span>Explore All 8 Models</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {fleet.slice(0, 8).map((machine) => (
              <div key={machine.id} className="industrial-card flex flex-col justify-between overflow-hidden">
                <div className="w-full h-48 bg-zinc-100 overflow-hidden relative border-b border-border">
                  <img src={machine.image_url} alt={machine.name} className="w-full h-full object-cover transition-transform hover:scale-105 duration-300" />
                </div>
                <div className="p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {machine.status || 'AVAILABLE'}
                    </span>
                    <span className="text-xs font-mono text-muted">{machine.category}</span>
                  </div>

                  <div>
                    <h3 className="font-heading font-bold text-base text-ink line-clamp-1">
                      {machine.name}
                    </h3>
                    <div className="text-xs text-muted font-mono">{machine.model}</div>
                  </div>

                  {machine.specs && (
                    <div className="p-3 bg-surface rounded-lg space-y-1 text-[11px] font-mono text-zinc-700 border border-border">
                      {Object.entries(machine.specs).slice(0, 2).map(([k, v], idx) => (
                        <div key={idx} className="flex justify-between">
                          <span className="text-muted capitalize">{k.replace(/_/g, ' ')}:</span>
                          <span className="font-semibold text-ink">{String(v)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="p-5 pt-0 space-y-3">
                  <div className="pt-3 border-t border-border flex items-baseline justify-between">
                    <span className="text-xs text-muted font-mono">Daily Rate:</span>
                    <div className="font-heading font-black text-lg text-primary">
                      {formatCurrency(machine.daily_rate)}
                      <span className="text-[10px] font-normal text-muted font-sans"> / day</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleBookNow(machine)}
                    className="w-full py-2.5 bg-primary hover:bg-primary-hover text-white rounded-lg text-xs font-heading font-bold uppercase tracking-wider transition-all"
                  >
                    Quick Quote & Hire
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Direct Booking Modal */}
      {selectedEquipment && (
        <WhatsAppBookingModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          equipment={selectedEquipment}
          prefillDates={{
            startDate: '',
            endDate: ''
          }}
        />
      )}

    </div>
  );
}
