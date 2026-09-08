'use client';

import React, { useState, useEffect } from 'react';
import { 
  Contact, 
  Search, 
  Phone, 
  Mail, 
  MessageSquare, 
  DollarSign, 
  Calendar, 
  RefreshCw, 
  Building2, 
  CheckCircle2, 
  ExternalLink,
  Award
} from 'lucide-react';

interface ClientEntry {
  client_email: string;
  client_name: string;
  client_phone: string;
  preferred_contact: string;
  total_bookings: string | number;
  confirmed_bookings: string | number;
  estimated_spend_kes: string | number;
  last_booking_date: string;
}

export default function ClientCRMPage() {
  const [clients, setClients] = useState<ClientEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchCRM = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/v1/analytics/crm');
      const json = await res.json();
      if (json.success) {
        setClients(json.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch CRM data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCRM();
  }, []);

  const filteredClients = clients.filter(c => {
    const term = search.toLowerCase();
    return (
      (c.client_name && c.client_name.toLowerCase().includes(term)) ||
      (c.client_email && c.client_email.toLowerCase().includes(term)) ||
      (c.client_phone && c.client_phone.toLowerCase().includes(term))
    );
  });

  const totalSpend = clients.reduce((acc, c) => acc + parseFloat(c.estimated_spend_kes as string || '0'), 0);
  const totalBookings = clients.reduce((acc, c) => acc + parseInt(c.total_bookings as string || '0', 10), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-primary font-mono tracking-wider uppercase">Module 10</span>
            <span className="text-muted">/</span>
            <span className="text-xs text-gray-400">Relations</span>
          </div>
          <h1 className="text-2xl font-heading font-black text-white flex items-center gap-2.5 mt-1">
            <Contact className="w-6 h-6 text-primary" />
            Client CRM & Contractor Directory
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Directory of infrastructure developers, contractors, and project managers renting heavy machinery across Kenya.
          </p>
        </div>

        <button 
          onClick={fetchCRM}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg border border-border text-sm font-medium transition-all"
        >
          <RefreshCw className={`w-4 h-4 text-primary ${loading ? 'animate-spin' : ''}`} />
          Refresh Directory
        </button>
      </div>

      {/* Summary KPI Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-surface border border-border rounded-xl p-4 flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-lg text-primary">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-muted font-mono">ACTIVE CONTRACTORS</div>
            <div className="text-xl font-heading font-bold text-white">{clients.length} Accounts</div>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-xl p-4 flex items-center gap-3">
          <div className="p-3 bg-emerald-500/10 rounded-lg text-emerald-400">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-muted font-mono">CUMULATIVE BOOKING VALUE</div>
            <div className="text-xl font-heading font-bold text-emerald-400">
              KES {totalSpend.toLocaleString('en-KE', { maximumFractionDigits: 0 })}
            </div>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-xl p-4 flex items-center gap-3">
          <div className="p-3 bg-amber-500/10 rounded-lg text-amber-400">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-muted font-mono">TOTAL MACHINERY HIRES</div>
            <div className="text-xl font-heading font-bold text-amber-400">{totalBookings} Dispatches</div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative bg-surface border border-border rounded-xl p-2">
        <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search contractor by company, representative name, email, or phone number..."
          className="w-full pl-9 pr-4 py-2 bg-neutral-900 border border-border rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary"
        />
      </div>

      {/* CRM Grid / Directory */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClients.map((client, idx) => {
          const spend = parseFloat(client.estimated_spend_kes as string || '0');
          const isHighValue = spend > 150000;
          const cleanPhone = client.client_phone ? client.client_phone.replace(/\D/g, '') : '254717186396';
          const whatsappPhone = cleanPhone.startsWith('0') ? `254${cleanPhone.slice(1)}` : cleanPhone;

          return (
            <div 
              key={idx} 
              className={`bg-surface border rounded-xl p-5 space-y-4 transition-all hover:border-primary/50 ${
                isHighValue ? 'border-primary/40 bg-gradient-to-br from-surface to-neutral-900' : 'border-border'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-heading font-bold text-white text-base flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-primary" />
                    {client.client_name || 'Anonymous Contractor'}
                  </div>
                  <div className="text-xs text-muted font-mono mt-0.5">
                    Preferred: {client.preferred_contact || 'WHATSAPP'}
                  </div>
                </div>

                {isHighValue && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-primary/20 text-primary border border-primary/30">
                    VIP CLIENT
                  </span>
                )}
              </div>

              {/* Spend and Orders */}
              <div className="p-3 bg-neutral-900 rounded-lg space-y-1 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-muted">Total Hires:</span>
                  <span className="text-white font-bold">{client.total_bookings} orders ({client.confirmed_bookings} confirmed)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Estimated Spend:</span>
                  <span className="text-emerald-400 font-bold">KES {spend.toLocaleString()}</span>
                </div>
                {client.last_booking_date && (
                  <div className="flex justify-between text-[11px] pt-1 border-t border-border/40 text-muted">
                    <span>Recent Activity:</span>
                    <span>{new Date(client.last_booking_date).toLocaleDateString()}</span>
                  </div>
                )}
              </div>

              {/* Direct Quick Actions */}
              <div className="flex items-center gap-2 pt-1">
                <a
                  href={`https://wa.me/${whatsappPhone}?text=Hello%20${encodeURIComponent(client.client_name || '')},%20following%20up%20from%20Hi%20Los%20Geht%20Machinery%20Dispatch.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-all"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  WhatsApp
                </a>

                {client.client_phone && (
                  <a
                    href={`tel:${client.client_phone}`}
                    className="p-2 bg-neutral-800 hover:bg-neutral-700 text-gray-300 hover:text-white rounded-lg transition-all"
                    title="Call Contractor"
                  >
                    <Phone className="w-4 h-4" />
                  </a>
                )}

                {client.client_email && (
                  <a
                    href={`mailto:${client.client_email}`}
                    className="p-2 bg-neutral-800 hover:bg-neutral-700 text-gray-300 hover:text-white rounded-lg transition-all"
                    title="Send Email"
                  >
                    <Mail className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
