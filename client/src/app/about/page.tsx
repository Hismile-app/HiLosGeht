'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Truck, 
  ShieldCheck, 
  Award, 
  MapPin, 
  Users, 
  Cpu, 
  Clock, 
  Activity, 
  CheckCircle2, 
  ArrowRight,
  Phone,
  HardHat,
  Compass,
  FileCheck,
  TrendingUp,
  Wrench
} from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white text-ink">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-surface to-white border-b border-border py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl space-y-5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-50 border border-orange-200 text-primary text-xs font-mono font-bold tracking-wider uppercase shadow-subtle">
              <HardHat className="w-4 h-4 text-primary" />
              <span>About Hi Los Geht (HLG) Heavy Machinery</span>
            </div>
            
            <h1 className="font-heading font-black text-3xl sm:text-5xl lg:text-6xl text-ink tracking-tight uppercase leading-[1.1]">
              Premier Heavy Plant & Infrastructure <span className="text-primary">Fleet Logistics</span>
            </h1>
            
            <p className="text-base sm:text-lg text-zinc-700 leading-relaxed">
              Hi Los Geht (HLG) is Mt. Kenya’s leading heavy construction equipment provider, serving Meru County, Isiolo, Embu, and the wider East African infrastructure sector with certified heavy plant machinery, ISO 15143-3 fleet telemetry, and turnkey civil contracting services.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link href="/catalog" className="btn-primary text-xs sm:text-sm py-3 px-6 flex items-center gap-2">
                <span>Explore Certified Fleet</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/contact" className="px-5 py-3 rounded-lg border border-border bg-white hover:bg-surface text-ink font-heading font-bold text-xs sm:text-sm uppercase tracking-wider transition-colors">
                Contact Dispatch
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Fast Operational Metrics */}
      <section className="border-b border-border bg-surface py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-4 bg-white rounded-xl border border-border shadow-subtle space-y-1">
              <div className="font-heading font-black text-2xl sm:text-3xl text-primary">98.4%</div>
              <div className="text-xs font-mono text-zinc-600 uppercase font-semibold">Fleet Availability Uptime</div>
            </div>
            <div className="p-4 bg-white rounded-xl border border-border shadow-subtle space-y-1">
              <div className="font-heading font-black text-2xl sm:text-3xl text-ink">50+</div>
              <div className="text-xs font-mono text-zinc-600 uppercase font-semibold">Regional Infrastructure Projects</div>
            </div>
            <div className="p-4 bg-white rounded-xl border border-border shadow-subtle space-y-1">
              <div className="font-heading font-black text-2xl sm:text-3xl text-primary">&lt; 2 Hrs</div>
              <div className="text-xs font-mono text-zinc-600 uppercase font-semibold">Meru Jobsite Mobilization</div>
            </div>
            <div className="p-4 bg-white rounded-xl border border-border shadow-subtle space-y-1">
              <div className="font-heading font-black text-2xl sm:text-3xl text-ink">ISO 15143-3</div>
              <div className="text-xs font-mono text-zinc-600 uppercase font-semibold">IoT Telematics Standards</div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-stretch">
          
          <div className="p-8 rounded-2xl bg-white border border-border shadow-card space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center text-primary">
                <Compass className="w-6 h-6" />
              </div>
              <h2 className="font-heading font-bold text-2xl text-ink uppercase">Our Mission</h2>
              <p className="text-sm text-zinc-700 leading-relaxed">
                To power sustainable infrastructure, road development, agricultural water harvesting, and quarry mining across Kenya by delivering fully maintained heavy equipment, transparent hourly telemetry, and certified operators who prioritize safety and jobsite productivity.
              </p>
            </div>
            <div className="pt-4 border-t border-border flex items-center gap-2 text-xs font-mono text-primary font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Reliable Heavy Plant When You Need It</span>
            </div>
          </div>

          <div className="p-8 rounded-2xl bg-white border border-border shadow-card space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center text-primary">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h2 className="font-heading font-bold text-2xl text-ink uppercase">Our Vision</h2>
              <p className="text-sm text-zinc-700 leading-relaxed">
                To be the most technologically advanced and trusted civil machinery rental platform in Eastern and Central Africa, setting the benchmark for conflict-free digital dispatch, telematics analytics, and operator accountability.
              </p>
            </div>
            <div className="pt-4 border-t border-border flex items-center gap-2 text-xs font-mono text-primary font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Modernized African Construction Logistics</span>
            </div>
          </div>

        </div>
      </section>

      {/* Fleet Capabilities & Engineering Standards */}
      <section className="py-16 bg-surface border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="text-xs font-mono uppercase text-primary font-bold tracking-wider">Industrial Excellence</div>
            <h2 className="font-heading font-black text-2xl sm:text-4xl text-ink uppercase">
              Heavy Plant Capabilities & Technical Standards
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600">
              Every unit in the HLG fleet undergoes rigorous 250-hour mechanical inspection cycles and operates with live engine telematics.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            <div className="bg-white p-6 rounded-2xl border border-border shadow-card space-y-4">
              <div className="w-10 h-10 rounded-lg bg-orange-50 border border-orange-200 flex items-center justify-center text-primary">
                <Truck className="w-5 h-5" />
              </div>
              <h3 className="font-heading font-bold text-lg text-ink uppercase">Earthmoving & Excavation</h3>
              <p className="text-xs text-zinc-700 leading-relaxed">
                Featuring Komatsu PC-200 hydraulic excavators, Komatsu D155AX-8 crawler dozers, and JCB 3DXPLUS backhoe loaders for deep quarry cutting, foundation trenching, and mass earthworks.
              </p>
              <ul className="text-xs space-y-1.5 font-mono text-zinc-600 pt-2 border-t border-border">
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-primary" /> Heavy Rock & Soil Buckets</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-primary" /> Hydraulic Breaker Attachments</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-primary" /> Reinforced Undercarriages</li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-border shadow-card space-y-4">
              <div className="w-10 h-10 rounded-lg bg-orange-50 border border-orange-200 flex items-center justify-center text-primary">
                <Wrench className="w-5 h-5" />
              </div>
              <h3 className="font-heading font-bold text-lg text-ink uppercase">Roadworks & Compaction</h3>
              <p className="text-xs text-zinc-700 leading-relaxed">
                Precision Shantui SG18-3 motor graders, Shantui SL60W-2 wheel loaders, and XCMG vibratory rollers engineered for KeNHA, KURA, and county road grading, cambering, and sub-base compaction.
              </p>
              <ul className="text-xs space-y-1.5 font-mono text-zinc-600 pt-2 border-t border-border">
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-primary" /> 14-Foot Precision Moldboards</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-primary" /> 3.0m³ High-Capacity Loaders</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-primary" /> Dynamic Dual-Frequency Compaction</li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-border shadow-card space-y-4">
              <div className="w-10 h-10 rounded-lg bg-orange-50 border border-orange-200 flex items-center justify-center text-primary">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="font-heading font-bold text-lg text-ink uppercase">Haulage & Telematics</h3>
              <p className="text-xs text-zinc-700 leading-relaxed">
                Heavy-duty Isuzu FVZ 34 (15T tipper trucks) coupled with ISO 15143-3 compliant IoT telematics sensors delivering live fuel usage diagnostics, engine rpm monitoring, and GPS geofencing.
              </p>
              <ul className="text-xs space-y-1.5 font-mono text-zinc-600 pt-2 border-t border-border">
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-primary" /> Real-time Hour Meter Logging</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-primary" /> AI Siphoning & Anomaly Alerts</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-primary" /> Direct M-Pesa Integrated Ledger</li>
              </ul>
            </div>

          </div>

        </div>
      </section>

      {/* Regional Operational Hubs */}
      <section className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="text-xs font-mono uppercase text-primary font-bold tracking-wider">Geographic Footprint</div>
            <h2 className="font-heading font-black text-2xl sm:text-3xl text-ink uppercase mt-1">
              Mt. Kenya Regional Mobilization Hubs
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-zinc-600 max-w-md">
            Our lowbed transport trailers and field service vans ensure rapid machinery deployment across Meru, Tharaka Nithi, Isiolo, and Embu counties.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { hub: 'Meru Central Yard', location: 'Meru Town Commercial Hub', coverage: 'Imenti North, Imenti Central, Bypass Works', phone: '0717 186396' },
            { hub: 'Nkubu Southern Hub', location: 'Nkubu – Meru South Corridor', coverage: 'Imenti South, Chuka, Tharaka Nithi Bridges', phone: '0717 186396' },
            { hub: 'Maua & Nyambene Hub', location: 'Maua – Igembe Region', coverage: 'Igembe Central, South & North Agricultural Works', phone: '0717 186396' },
            { hub: 'Timau & Isiolo Corridor', location: 'Timau – Northern Gateway', coverage: 'Buuri Sub-county, LAPSSET Corridor, Isiolo Plains', phone: '0717 186396' },
          ].map((item, idx) => (
            <div key={idx} className="p-5 bg-white rounded-xl border border-border shadow-subtle space-y-2 hover:border-primary/50 transition-colors">
              <div className="flex items-center gap-2 text-primary font-bold text-xs font-mono uppercase">
                <MapPin className="w-4 h-4 shrink-0" />
                <span>{item.hub}</span>
              </div>
              <div className="font-bold text-ink text-sm">{item.location}</div>
              <div className="text-xs text-zinc-600 leading-normal">{item.coverage}</div>
              <div className="pt-2 border-t border-border text-[11px] font-mono text-zinc-800">
                Dispatch: <strong className="text-primary">{item.phone}</strong>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Safety & Compliance Banner */}
      <section className="bg-surface border-t border-border py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl border border-border p-8 shadow-card flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>NTSA, OSHA & NEMA Compliant</span>
              </div>
              <h3 className="font-heading font-black text-2xl text-ink uppercase">
                Zero Compromise on Jobsite Safety & Plant Health
              </h3>
              <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                All HLG machinery operators hold valid Heavy Plant Operator Licenses (Class G), certified defensive driving credentials, and receive continuous training on slope stability and quarry safety protocols.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Link href="/contact" className="btn-primary py-3 px-6 text-xs font-heading font-bold uppercase tracking-wider">
                Request Equipment Quote
              </Link>
              <a
                href="https://wa.me/254717186396?text=Hello%20HLG%20Team%2C%20I%20would%20like%20to%20inquire%20about%20your%20fleet%20services."
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-lg border border-border bg-surface hover:bg-zinc-200 text-zinc-800 flex items-center gap-2 text-xs font-mono font-bold transition-colors"
              >
                <Phone className="w-4 h-4 text-primary" />
                <span>0717 186396</span>
              </a>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
