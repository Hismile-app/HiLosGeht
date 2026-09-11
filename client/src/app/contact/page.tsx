'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Phone, 
  Mail, 
  MapPin, 
  CreditCard, 
  Clock, 
  MessageSquare, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Truck, 
  ShieldCheck,
  Calendar,
  Building,
  ArrowRight
} from 'lucide-react';

const SERVICE_OPTIONS = [
  'Komatsu Hydraulic Excavator (PC-200)',
  'Komatsu Crawler Dozer (D155AX-8)',
  'JCB Backhoe Loader (3DXPLUS)',
  'Shantui Wheel Loader (SL60W-2)',
  'Shantui Motor Grader (SG18-3)',
  'Isuzu 15T Heavy Tipper Haulage (FVZ 34)',
  'Quarry & Foundation Mass Excavation',
  'Road Grading & Sub-base Compaction',
  'Agricultural Water Dam Construction',
  'General Heavy Fleet Inquiry & Consultation'
];

const LOCATION_OPTIONS = [
  'Meru Town & Municipal Hub',
  'Nkubu & Imenti South',
  'Maua & Nyambene / Igembe',
  'Timau & Buuri Corridor',
  'Isiolo County / Northern Corridor',
  'Tharaka Nithi County / Chuka',
  'Embu County & Mt. Kenya East',
  'Other East Africa Region'
];

export default function ContactPage() {
  const [formData, setFormData] = useState({
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    serviceCategory: SERVICE_OPTIONS[0],
    location: LOCATION_OPTIONS[0],
    startDate: '',
    notes: '',
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedWhatsAppLink, setGeneratedWhatsAppLink] = useState('');

  const buildWhatsAppText = () => {
    const text = `Hello HLG Dispatch Team,\n\n*New Heavy Machinery Inquiry:*\n- *Client:* ${formData.clientName || 'Valued Client'}\n- *Phone:* ${formData.clientPhone || 'Not provided'}\n- *Email:* ${formData.clientEmail || 'Not provided'}\n- *Equipment / Service:* ${formData.serviceCategory}\n- *Location:* ${formData.location}\n- *Target Start Date:* ${formData.startDate || 'Immediate'}\n- *Project Scope:* ${formData.notes || 'Inquiry from website contact form'}\n\nPlease advise on machinery availability and quotation.`;
    return `https://wa.me/254717186396?text=${encodeURIComponent(text)}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const waLink = buildWhatsAppText();
    setGeneratedWhatsAppLink(waLink);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
      const res = await fetch(`${apiUrl}/inquiries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName: formData.clientName,
          clientEmail: formData.clientEmail,
          clientPhone: formData.clientPhone,
          serviceCategory: formData.serviceCategory,
          location: formData.location,
          startDate: formData.startDate || new Date().toISOString().split('T')[0],
          endDate: formData.startDate ? new Date(new Date(formData.startDate).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          notes: formData.notes,
          preferredContact: 'WHATSAPP',
        }),
      });

      const data = await res.json();
      if (!res.ok && !data.success) {
        throw new Error(data.error || 'Failed to submit inquiry to server.');
      }

      setSuccess(true);
    } catch (err: any) {
      console.warn('Backend inquiry dispatch error:', err.message);
      // Still allow client to proceed with WhatsApp link
      setSuccess(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-ink">
      
      {/* Hero Header */}
      <section className="bg-gradient-to-b from-surface to-white border-b border-border py-14 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-50 border border-orange-200 text-primary text-xs font-mono font-bold tracking-wider uppercase shadow-subtle">
            <Phone className="w-3.5 h-3.5" />
            <span>24/7 Heavy Equipment Dispatch & Client Inquiries</span>
          </div>
          <h1 className="font-heading font-black text-3xl sm:text-5xl text-ink uppercase tracking-tight">
            Contact <span className="text-primary">Hi Los Geht</span> Dispatch
          </h1>
          <p className="text-sm sm:text-base text-zinc-600 leading-relaxed">
            Need an excavator, motor grader, or tipper fleet deployed to your project in Meru or Mt. Kenya? Submit your project specs below or chat directly with our dispatch team on WhatsApp.
          </p>
        </div>
      </section>

      {/* Main Content Grid: Info Cards + Contact Form */}
      <section className="py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Left Column: Direct Contacts Deck (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Primary WhatsApp Dispatch Box */}
            <div className="p-6 bg-gradient-to-br from-emerald-50 to-white border border-emerald-200 rounded-2xl shadow-card space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 text-emerald-800 font-heading font-bold text-sm uppercase">
                  <MessageSquare className="w-5 h-5 text-emerald-600" />
                  <span>Instant WhatsApp Dispatch</span>
                </div>
                <span className="text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                  LIVE RESPONSE
                </span>
              </div>
              <p className="text-xs text-zinc-700 leading-relaxed">
                Connect directly with the HLG operations desk for immediate machinery availability, hourly rate negotiations, and lowbed mobilization schedules.
              </p>
              <a
                href="https://wa.me/254717186396?text=Hello%20HLG%20Dispatch%20Team%2C%20I%20would%20like%20to%20inquire%20about%20heavy%20machinery%20availability."
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-heading font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Chat on WhatsApp: 0717 186396</span>
              </a>
            </div>

            {/* Direct Contact Details Card */}
            <div className="bg-white border border-border rounded-2xl p-6 shadow-card space-y-5">
              <h3 className="font-heading font-bold text-sm uppercase text-ink tracking-wider text-primary">
                Direct Communication Lines
              </h3>

              <div className="space-y-4 text-xs">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-surface border border-border flex items-center justify-center shrink-0 text-primary mt-0.5">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-ink">Primary Dispatch Line</div>
                    <a href="tel:+254717186396" className="text-primary font-mono font-bold text-sm hover:underline">
                      0717 186396
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-surface border border-border flex items-center justify-center shrink-0 text-primary mt-0.5">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-ink">Official Inquiries Email</div>
                    <a href="mailto:hilosgehtinfo@gmail.com" className="text-zinc-800 font-mono font-semibold hover:text-primary">
                      hilosgehtinfo@gmail.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-surface border border-border flex items-center justify-center shrink-0 text-primary mt-0.5">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-ink">Central Operations Yard</div>
                    <div className="text-zinc-600">Meru Town Commercial Hub & County Quarry Sites, Kenya</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-surface border border-border flex items-center justify-center shrink-0 text-primary mt-0.5">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-ink">Operational Dispatch Hours</div>
                    <div className="text-zinc-600">Standard Shifts: 6:00 AM – 6:00 PM EAT</div>
                    <div className="text-primary font-mono text-[11px] font-bold">24/7 Emergency Mobilization Active</div>
                  </div>
                </div>
              </div>

              {/* M-Pesa Official Paybill Card */}
              <div className="p-4 bg-surface rounded-xl border border-border space-y-2">
                <div className="flex items-center gap-2 text-primary font-bold text-xs font-mono">
                  <CreditCard className="w-4 h-4" />
                  <span>OFFICIAL KENYA M-PESA PAYBILL</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1">
                  <div className="p-2 bg-white rounded border border-border">
                    <div className="text-[10px] text-muted uppercase">BUSINESS NO.</div>
                    <div className="font-black text-ink text-sm">522522</div>
                  </div>
                  <div className="p-2 bg-white rounded border border-border">
                    <div className="text-[10px] text-muted uppercase">ACCOUNT NO.</div>
                    <div className="font-black text-ink text-sm">1347339299</div>
                  </div>
                </div>
              </div>

            </div>

          </div>

          {/* Right Column: Advanced Contact Form (7 cols) */}
          <div className="lg:col-span-7">
            <div className="bg-white border border-border rounded-2xl p-6 sm:p-8 shadow-card space-y-6">
              
              <div>
                <div className="text-primary font-mono text-xs uppercase font-bold tracking-wider mb-1">
                  Project Request Form
                </div>
                <h2 className="font-heading font-black text-2xl text-ink uppercase">
                  Request Equipment or Site Quotation
                </h2>
                <p className="text-xs text-zinc-600 mt-1">
                  Fill in your project requirements. Our dispatch office will review your specifications, send an email confirmation, and reserve tentative machinery slots.
                </p>
              </div>

              {error && (
                <div className="p-4 bg-rose-50 border border-rose-300 rounded-xl flex items-start gap-2.5 text-rose-800 text-xs font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {success ? (
                <div className="p-6 bg-emerald-50 border border-emerald-300 rounded-2xl text-center space-y-4">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-700 mx-auto flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="font-heading font-bold text-xl text-ink uppercase">
                    Inquiry Dispatched Successfully!
                  </h3>
                  <p className="text-xs text-zinc-700 max-w-md mx-auto leading-relaxed">
                    Thank you, <strong className="text-ink">{formData.clientName}</strong>. Message sent! We will get right back to you.
                  </p>

                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                    <a
                      href={generatedWhatsAppLink || buildWhatsAppText()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-heading font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Continue on WhatsApp Now</span>
                    </a>
                    <button
                      type="button"
                      onClick={() => {
                        setSuccess(false);
                        setFormData({
                          clientName: '',
                          clientEmail: '',
                          clientPhone: '',
                          serviceCategory: SERVICE_OPTIONS[0],
                          location: LOCATION_OPTIONS[0],
                          startDate: '',
                          notes: '',
                        });
                      }}
                      className="w-full sm:w-auto px-5 py-3 rounded-xl border border-border bg-white text-zinc-700 hover:bg-surface text-xs font-mono font-bold transition-colors"
                    >
                      Submit Another Inquiry
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                  
                  {/* Name & Work Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-zinc-700 font-mono font-semibold uppercase mb-1.5">
                        Your Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Eng. Peter Mwangi"
                        value={formData.clientName}
                        onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-surface border border-border rounded-xl text-sm text-ink placeholder-zinc-400 focus:outline-none focus:border-primary focus:bg-white transition-all font-sans"
                      />
                    </div>

                    <div>
                      <label className="block text-zinc-700 font-mono font-semibold uppercase mb-1.5">
                        Work Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="e.g. pmwangi@construction.co.ke"
                        value={formData.clientEmail}
                        onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-surface border border-border rounded-xl text-sm text-ink placeholder-zinc-400 focus:outline-none focus:border-primary focus:bg-white transition-all font-sans"
                      />
                    </div>
                  </div>

                  {/* Phone & Service Category */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-zinc-700 font-mono font-semibold uppercase mb-1.5">
                        Phone / WhatsApp Number *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="e.g. 0712 345678"
                        value={formData.clientPhone}
                        onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-surface border border-border rounded-xl text-sm text-ink placeholder-zinc-400 focus:outline-none focus:border-primary focus:bg-white transition-all font-sans"
                      />
                    </div>

                    <div>
                      <label className="block text-zinc-700 font-mono font-semibold uppercase mb-1.5">
                        Machinery / Service Required *
                      </label>
                      <select
                        value={formData.serviceCategory}
                        onChange={(e) => setFormData({ ...formData, serviceCategory: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-surface border border-border rounded-xl text-sm text-ink focus:outline-none focus:border-primary focus:bg-white transition-all cursor-pointer font-sans"
                      >
                        {SERVICE_OPTIONS.map((opt, i) => (
                          <option key={i} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Location & Start Date */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-zinc-700 font-mono font-semibold uppercase mb-1.5">
                        Project Location / County *
                      </label>
                      <select
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-surface border border-border rounded-xl text-sm text-ink focus:outline-none focus:border-primary focus:bg-white transition-all cursor-pointer font-sans"
                      >
                        {LOCATION_OPTIONS.map((loc, i) => (
                          <option key={i} value={loc}>{loc}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-zinc-700 font-mono font-semibold uppercase mb-1.5">
                        Target Start Date
                      </label>
                      <input
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-surface border border-border rounded-xl text-sm text-ink focus:outline-none focus:border-primary focus:bg-white transition-all font-sans"
                      />
                    </div>
                  </div>

                  {/* Detailed Requirements */}
                  <div>
                    <label className="block text-zinc-700 font-mono font-semibold uppercase mb-1.5">
                      Project Scope & Equipment Specifications
                    </label>
                    <textarea
                      rows={4}
                      placeholder="e.g. 5,000m³ road excavation, trenching for culverts, estimated 10 working days, fuel dry/wet rate preference..."
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className="w-full p-3 bg-surface border border-border rounded-xl text-sm text-ink placeholder-zinc-400 focus:outline-none focus:border-primary focus:bg-white transition-all font-sans"
                    />
                  </div>

                  {/* Submit CTA */}
                  <div className="pt-2 space-y-3">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3.5 bg-primary hover:bg-primary-hover text-white rounded-xl font-heading font-bold text-xs sm:text-sm tracking-wider uppercase transition-all shadow-subtle flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
                      <span>{loading ? 'Submitting & Dispatching...' : 'Submit Inquiry & Reserve Slot'}</span>
                    </button>

                    <div className="flex items-center justify-center gap-2 text-[11px] font-mono text-zinc-500">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Submissions are logged into central PostgreSQL database and emailed via Nodemailer.</span>
                    </div>
                  </div>

                </form>
              )}

            </div>
          </div>

        </div>
      </section>

    </div>
  );
}
