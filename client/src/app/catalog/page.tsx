'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Truck, 
  Search, 
  Filter, 
  Calendar, 
  CheckCircle2, 
  Fuel, 
  Gauge, 
  Wrench, 
  Layers, 
  Clock, 
  ArrowRight,
  RefreshCw,
  Phone,
  MessageSquare,
  Sparkles,
  SlidersHorizontal,
  X
} from 'lucide-react';
import WhatsAppBookingModal from '@/components/booking/WhatsAppBookingModal';
import { Equipment } from '@/types';
import { formatCurrency } from '@/lib/utils';

// Static Verified Brochure Fleet Seed
const INITIAL_FLEET: Equipment[] = [
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

export default function CatalogPage() {
  const [fleet, setFleet] = useState<Equipment[]>(INITIAL_FLEET);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [compareList, setCompareList] = useState<Equipment[]>([]);

  // Fetch live fleet from API
  useEffect(() => {
    async function fetchFleet() {
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
    fetchFleet();
  }, []);

  const filteredFleet = fleet.filter((item) => {
    const matchesCategory = selectedCategory === 'ALL' || item.category.toUpperCase() === selectedCategory.toUpperCase();
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.model.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleBook = (item: Equipment) => {
    setSelectedEquipment(item);
    setModalOpen(true);
  };

  const toggleCompare = (item: Equipment) => {
    if (compareList.some(c => c.id === item.id)) {
      setCompareList(compareList.filter(c => c.id !== item.id));
    } else {
      if (compareList.length < 3) {
        setCompareList([...compareList, item]);
      }
    }
  };

  const getSlug = (item: Equipment) => {
    return item.model.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 bg-white text-ink">
      
      {/* Page Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-primary font-mono text-xs uppercase font-bold">
          <Truck className="w-3.5 h-3.5" />
          <span>HLG Fleet Catalog • Meru, Kenya</span>
        </div>
        <h1 className="font-heading font-black text-3xl sm:text-5xl text-ink uppercase">
          HEAVY MACHINERY & EQUIPMENT FLEET
        </h1>
        <p className="text-sm text-zinc-600 max-w-3xl">
          Browse verified plant machinery available for daily and long-term project hire across Mt. Kenya infrastructure sites. Instant quotation, live availability checks, and direct WhatsApp negotiation.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="industrial-panel p-4 space-y-4 shadow-subtle">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          
          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Search Komatsu, JCB, Shantui, Isuzu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-border rounded-lg text-sm text-ink placeholder-zinc-400 focus:outline-none focus:border-primary"
            />
          </div>

          {/* Date Filter */}
          <div className="flex items-center gap-2 w-full md:w-auto text-xs font-mono">
            <Calendar className="w-4 h-4 text-primary shrink-0" />
            <input
              type="date"
              value={startDate}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-white border border-border rounded-lg px-2.5 py-1.5 text-xs text-ink focus:border-primary focus:outline-none"
              placeholder="Start Date"
            />
            <span className="text-muted">&rarr;</span>
            <input
              type="date"
              value={endDate}
              min={startDate || new Date().toISOString().split('T')[0]}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-white border border-border rounded-lg px-2.5 py-1.5 text-xs text-ink focus:border-primary focus:outline-none"
              placeholder="End Date"
            />
            {(startDate || endDate || searchQuery || selectedCategory !== 'ALL') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setStartDate('');
                  setEndDate('');
                  setSelectedCategory('ALL');
                }}
                className="text-xs text-primary font-bold hover:underline ml-2"
              >
                Reset Filters
              </button>
            )}
          </div>

        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
          {[
            { label: 'All Fleet', val: 'ALL' },
            { label: 'Earthmoving', val: 'EXCAVATOR' },
            { label: 'Dozers', val: 'DOZER' },
            { label: 'Backhoes', val: 'BACKHOE' },
            { label: 'Wheel Loaders', val: 'WHEEL LOADER' },
            { label: 'Motor Graders', val: 'GRADER' },
            { label: 'Rollers / Compaction', val: 'ROLLER' },
            { label: 'Tippers / Haulage', val: 'TIPPER' },
            { label: 'Lowbed Hauler', val: 'HAULAGE' },
          ].map((cat) => (
            <button
              key={cat.val}
              onClick={() => setSelectedCategory(cat.val)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                selectedCategory === cat.val
                  ? 'bg-primary text-white shadow-subtle'
                  : 'bg-white text-zinc-700 border border-border hover:border-primary/50'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Machinery Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFleet.map((item) => {
          const isSelectedForCompare = compareList.some(c => c.id === item.id);
          const slug = getSlug(item);

          return (
            <div 
              key={item.id} 
              className="industrial-card flex flex-col justify-between overflow-hidden"
            >
              <div className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {item.status || 'AVAILABLE'}
                  </span>
                  <span className="text-xs font-mono text-muted">{item.category}</span>
                </div>

                <div>
                  <Link href={`/catalog/${slug}`} className="hover:text-primary transition-colors">
                    <h3 className="font-heading font-bold text-lg text-ink">
                      {item.name}
                    </h3>
                  </Link>
                  <div className="text-xs text-muted font-mono">{item.model}</div>
                </div>

                {/* Specs Box */}
                {item.specs && (
                  <div className="p-3 bg-surface rounded-xl border border-border space-y-1.5 text-xs font-mono text-zinc-700">
                    {Object.entries(item.specs).slice(0, 3).map(([key, val], idx) => (
                      <div key={idx} className="flex justify-between">
                        <span className="text-muted capitalize">{key.replace(/_/g, ' ')}:</span>
                        <span className="font-bold text-ink">{String(val)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-5 pt-0 space-y-3">
                <div className="pt-3 border-t border-border flex items-baseline justify-between">
                  <span className="text-xs text-muted font-mono">Daily Rate:</span>
                  <div className="font-heading font-black text-xl text-primary">
                    {formatCurrency(item.daily_rate)}
                    <span className="text-xs font-normal text-muted font-sans"> / day</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href={`/catalog/${slug}`}
                    className="btn-secondary text-xs py-2 text-center"
                  >
                    View Specs
                  </Link>

                  <button
                    onClick={() => handleBook(item)}
                    className="btn-primary text-xs py-2"
                  >
                    Quote & Book
                  </button>
                </div>

                {/* Compare Checkbox */}
                <div className="pt-1 flex items-center justify-between text-[11px] text-muted">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isSelectedForCompare}
                      onChange={() => toggleCompare(item)}
                      className="accent-primary"
                    />
                    <span>Compare specs</span>
                  </label>
                  <span className="font-mono text-[10px]">Meru Yard</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredFleet.length === 0 && (
        <div className="p-16 text-center text-zinc-500 industrial-panel space-y-3">
          <Truck className="w-12 h-12 mx-auto text-zinc-400" />
          <div className="font-heading font-bold text-lg text-ink">No Machinery Found</div>
          <p className="text-xs text-muted">Try adjusting your search terms or category filters.</p>
        </div>
      )}

      {/* Floating Compare Toolbar */}
      {compareList.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-white border border-border shadow-2xl rounded-2xl p-4 max-w-2xl w-full mx-4 flex items-center justify-between animate-in slide-in-from-bottom-6">
          <div className="flex items-center gap-3">
            <span className="font-heading font-bold text-xs text-primary uppercase">
              Comparing ({compareList.length}/3):
            </span>
            <div className="flex items-center gap-2">
              {compareList.map((c) => (
                <span key={c.id} className="text-xs bg-surface border border-border px-2 py-1 rounded font-mono text-ink">
                  {c.model}
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCompareList([])}
              className="text-xs text-zinc-500 hover:text-ink font-semibold px-2 py-1"
            >
              Clear
            </button>
            <button
              onClick={() => handleBook(compareList[0])}
              className="btn-primary text-xs py-1.5 px-3"
            >
              Book Selected
            </button>
          </div>
        </div>
      )}

      {/* Booking Modal */}
      {selectedEquipment && (
        <WhatsAppBookingModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          equipment={selectedEquipment}
          prefillDates={{ startDate, endDate }}
        />
      )}

    </div>
  );
}
