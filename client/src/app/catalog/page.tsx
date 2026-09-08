'use client';

import React, { useState, useEffect } from 'react';
import { 
  Truck, 
  Filter, 
  Calendar, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  MessageSquare,
  ChevronDown
} from 'lucide-react';
import GlassCard from '@/components/common/GlassCard';
import StatusBadge from '@/components/common/StatusBadge';
import NeonButton from '@/components/common/NeonButton';
import WhatsAppBookingModal from '@/components/booking/WhatsAppBookingModal';
import { Equipment } from '@/types';
import { formatCurrency } from '@/lib/utils';

const CATEGORIES = [
  'ALL',
  'Excavator',
  'Dozer',
  'Backhoe',
  'Wheel Loader',
  'Grader',
  'Roller',
  'Tipper',
  'Lowbed'
];

const INITIAL_FLEET: Equipment[] = [
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
      fuel_capacity: '400 L'
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
      transmission: 'Automatic with Lockup',
      ground_pressure: '84.3 kPa'
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
      operating_weight: '7,460 kg',
      loader_capacity: '1.1 m³',
      backhoe_depth: '4.77 m',
      telematics: 'JCB LiveLink Ready'
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
      operating_weight: '21,000 kg',
      bucket_capacity: '3.5 m³',
      dumping_height: '3,180 mm',
      engine_power: '178 kW'
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
      operating_weight: '16,200 kg',
      blade_width: '3,965 mm',
      max_speed: '38 km/h',
      articulated_frame: 'Yes'
    }
  },
  {
    id: '11111111-1111-1111-1111-111111111106',
    name: 'XCMG XS163J Vibratory Compactor Roller',
    category: 'Roller',
    model: 'XCMG XS163J',
    daily_rate: 32000,
    status: 'AVAILABLE',
    image_url: '/images/equipment/xcmg_xs163j.png',
    current_hour_meter: 95.2,
    specs: {
      operating_weight: '16,000 kg',
      drum_width: '2,130 mm',
      vibration_frequency: '28/33 Hz',
      centrifugal_force: '290/190 kN',
      engine_power: '103 kW'
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
      gross_vehicle_mass: '26,000 kg',
      power_output: '280 HP',
      tipping_body: 'Heavy Duty Box'
    }
  },
  {
    id: '11111111-1111-1111-1111-111111111108',
    name: 'Heavy Lowbed Semi-Trailer (Machinery Haulage)',
    category: 'Lowbed',
    model: 'HLG Heavy Lowbed 60T',
    daily_rate: 50000,
    status: 'AVAILABLE',
    image_url: '/images/equipment/lowbed_trailer.png',
    current_hour_meter: 420.0,
    specs: {
      haulage_capacity: '60,000 kg (60 Ton)',
      axles: '3-Axle Heavy Duty',
      deck_length: '12.5 m',
      ramps: 'Hydraulic Folding Ramps'
    }
  }
];

export default function CatalogPage() {
  const [fleet, setFleet] = useState<Equipment[]>(INITIAL_FLEET);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Fetch real fleet from API if available
  useEffect(() => {
    async function fetchFleet() {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
        const res = await fetch(`${apiUrl}/equipment`);
        if (res.ok) {
          const data = await res.json();
          if (data.data && data.data.length > 0) {
            setFleet(data.data);
          }
        }
      } catch (err) {
        // Fallback to static seed
      }
    }
    fetchFleet();
  }, []);

  const filteredFleet = fleet.filter((item) => {
    const matchesCategory = selectedCategory === 'ALL' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.model.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleBook = (item: Equipment) => {
    setSelectedEquipment(item);
    setModalOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      
      {/* Page Header */}
      <div className="mb-10 space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-primary/10 border border-primary/30 text-primary font-mono text-xs uppercase">
          <Truck className="w-3.5 h-3.5" />
          <span>HLG Fleet Catalog • Meru, Kenya</span>
        </div>
        <h1 className="font-heading font-black text-3xl sm:text-5xl text-white uppercase">
          HEAVY MACHINERY & EQUIPMENT FLEET
        </h1>
        <p className="text-sm text-gray-400 max-w-2xl">
          Certified construction machinery available for immediate site deployment. Double-booking prevented by kernel-level GiST constraints.
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-panel p-5 rounded-xl border border-border mb-10 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by model or equipment name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-neutral-900 border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:border-primary focus:outline-none"
            />
          </div>

          {/* Date Range Filter */}
          <div className="flex items-center gap-2">
            <input
              type="date"
              min={new Date().toISOString().split('T')[0]}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-neutral-900 border border-border rounded-lg px-3 py-2 text-xs text-white focus:border-primary focus:outline-none"
              title="Project Start Date"
            />
            <span className="text-muted text-xs">to</span>
            <input
              type="date"
              min={startDate || new Date().toISOString().split('T')[0]}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-neutral-900 border border-border rounded-lg px-3 py-2 text-xs text-white focus:border-primary focus:outline-none"
              title="Project End Date"
            />
          </div>

          {/* Dispatch Phone Badge */}
          <div className="flex items-center justify-end gap-3 text-xs font-mono text-gray-300">
            <span className="text-muted">Instant Dispatch:</span>
            <a 
              href="https://wa.me/254717186396" 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-3 py-2 rounded bg-emerald-950/60 border border-emerald-600 text-emerald-400 font-bold flex items-center gap-1.5 hover:bg-emerald-900/60 transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              0717 186396
            </a>
          </div>

        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-2 border-t border-border/50">
          <Filter className="w-4 h-4 text-primary shrink-0 mr-1" />
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-mono transition-all shrink-0 ${
                selectedCategory === cat
                  ? 'bg-primary text-white font-bold shadow-neon'
                  : 'bg-surface-card text-gray-400 border border-border hover:border-primary/40 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

      </div>

      {/* Fleet Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFleet.map((machine) => (
          <GlassCard key={machine.id} className="flex flex-col justify-between group">
            <div>
              
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono text-primary font-semibold uppercase tracking-wider">
                  {machine.category}
                </span>
                <StatusBadge status={machine.status} />
              </div>

              {/* Machinery Visual Box */}
              <div className="h-48 rounded-lg bg-neutral-900 border border-border flex items-center justify-center mb-5 relative overflow-hidden group-hover:border-primary/50 transition-colors">
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10" />
                <Truck className="w-24 h-24 text-primary/25 group-hover:scale-110 group-hover:text-primary/60 transition-all duration-500" />
                
                <div className="absolute bottom-3 left-3 z-20 font-mono text-xs">
                  <span className="text-gray-400">Model: </span>
                  <span className="text-white font-bold">{machine.model}</span>
                </div>

                {machine.current_hour_meter > 0 && (
                  <div className="absolute top-3 right-3 z-20 font-mono text-[10px] bg-black/80 border border-border px-2 py-0.5 rounded text-gray-300">
                    Meter: {machine.current_hour_meter} hrs
                  </div>
                )}
              </div>

              {/* Title & Daily Rate */}
              <h3 className="font-heading font-bold text-lg text-white mb-2 line-clamp-1">
                {machine.name}
              </h3>

              <div className="mb-4">
                <span className="text-2xl font-black font-heading text-primary">
                  {formatCurrency(machine.daily_rate)}
                </span>
                <span className="text-xs text-muted font-mono ml-1">/ day</span>
              </div>

              {/* Brochure Specifications */}
              <div className="space-y-1.5 text-xs font-mono text-gray-400 mb-6 bg-surface-card p-3.5 rounded-lg border border-border/70">
                {Object.entries(machine.specs || {}).slice(0, 4).map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between">
                    <span className="text-muted capitalize">{k.replace('_', ' ')}:</span>
                    <span className="text-gray-200 font-semibold">{String(v)}</span>
                  </div>
                ))}
              </div>

            </div>

            {/* CTA Button */}
            <NeonButton
              size="sm"
              onClick={() => handleBook(machine)}
              className="w-full text-xs"
              icon={<MessageSquare className="w-3.5 h-3.5" />}
            >
              Book via WhatsApp (0717 186396)
            </NeonButton>

          </GlassCard>
        ))}
      </div>

      {filteredFleet.length === 0 && (
        <div className="text-center py-16 space-y-3">
          <AlertCircle className="w-12 h-12 text-muted mx-auto" />
          <h3 className="font-heading text-lg text-white">No Machinery Found</h3>
          <p className="text-xs text-muted">Try adjusting your search terms or category filter.</p>
        </div>
      )}

      {/* Booking Modal */}
      <WhatsAppBookingModal
        equipment={selectedEquipment}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />

    </div>
  );
}
