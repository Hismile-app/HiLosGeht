'use client';

import React, { useState } from 'react';
import { Equipment } from '@/types';
import { formatCurrency, buildWhatsAppBookingLink } from '@/lib/utils';
import { 
  X, 
  MessageSquare, 
  Mail, 
  Calendar, 
  User, 
  Phone, 
  AlertTriangle, 
  CheckCircle2, 
  Truck, 
  ArrowRight 
} from 'lucide-react';
import NeonButton from '../common/NeonButton';

interface WhatsAppBookingModalProps {
  equipment: Equipment | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function WhatsAppBookingModal({
  equipment,
  isOpen,
  onClose,
}: WhatsAppBookingModalProps) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [preferredContact, setPreferredContact] = useState<'WHATSAPP' | 'EMAIL'>('WHATSAPP');
  const [whatsappLine, setWhatsappLine] = useState<'PRIMARY' | 'BACKUP'>('PRIMARY');
  const [notes, setNotes] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [conflictError, setConflictError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<any | null>(null);

  if (!isOpen || !equipment) return null;

  // Calculate estimated days and total
  const getDaysCount = () => {
    if (!startDate || !endDate) return 1;
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 1;
  };

  const days = getDaysCount();
  const estimatedTotal = days * equipment.daily_rate;

  const targetWhatsApp = whatsappLine === 'PRIMARY' ? '254717186396' : '254748866823';
  const displayPhone = whatsappLine === 'PRIMARY' ? '0717 186396 (Primary)' : '0748866823 (Backup)';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setConflictError(null);
    setLoading(true);

    try {
      // 1. Submit inquiry to API to register hold in DB
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
      const res = await fetch(`${apiUrl}/inquiries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          equipmentId: equipment.id,
          clientName,
          clientEmail,
          clientPhone,
          startDate,
          endDate,
          preferredContact,
          notes,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.error?.includes('already booked') || res.status === 409) {
          setConflictError('⚠️ Exclusion Conflict: This machine has an active reservation during your selected dates. Please adjust your date range.');
        } else {
          setConflictError(data.error || 'Failed to submit inquiry.');
        }
        setLoading(false);
        return;
      }

      setSuccessData(data.data);

      // 2. If preferred contact is WhatsApp, open click-to-chat link
      if (preferredContact === 'WHATSAPP') {
        const link = buildWhatsAppBookingLink(
          targetWhatsApp,
          equipment.name,
          startDate,
          endDate,
          clientName,
          clientEmail
        );
        window.open(link, '_blank');
      }
    } catch (err: any) {
      console.error('Booking submission error:', err);
      // Fallback: If backend is offline, still open WhatsApp directly with pre-filled message
      const link = buildWhatsAppBookingLink(
        targetWhatsApp,
        equipment.name,
        startDate,
        endDate,
        clientName,
        clientEmail
      );
      window.open(link, '_blank');
      setSuccessData({ client_name: clientName });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-surface border border-primary/40 rounded-xl shadow-2xl overflow-hidden text-white">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-surface-card border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-primary/20 border border-primary/50 flex items-center justify-center">
              <Truck className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-heading text-lg font-bold text-white tracking-wide">
                Direct Machinery Booking
              </h2>
              <p className="text-xs text-muted font-mono">{equipment.name} • {equipment.model}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-surface hover:bg-neutral-800 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        {successData ? (
          <div className="p-8 text-center space-y-5">
            <div className="w-16 h-16 rounded-full bg-emerald-950/80 border border-emerald-500 text-emerald-400 mx-auto flex items-center justify-center shadow-neon">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="font-heading text-2xl font-bold text-white">
              Booking Hold Registered!
            </h3>
            <p className="text-sm text-gray-300 max-w-md mx-auto">
              Your inquiry for <strong className="text-primary">{equipment.name}</strong> from <strong>{startDate}</strong> to <strong>{endDate}</strong> has been logged in the HLG Dispatch Command Center.
            </p>
            
            <div className="p-4 bg-surface-card rounded-lg border border-border text-xs text-muted space-y-2 text-left max-w-md mx-auto">
              <p><strong>Client:</strong> {clientName} ({clientEmail})</p>
              <p><strong>Estimated Total:</strong> {formatCurrency(estimatedTotal)} ({days} days @ {formatCurrency(equipment.daily_rate)}/day)</p>
              <p><strong>Routing:</strong> {preferredContact === 'WHATSAPP' ? `WhatsApp Chat (${displayPhone})` : 'Email Negotiation'}</p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              {preferredContact === 'WHATSAPP' && (
                <a
                  href={buildWhatsAppBookingLink(targetWhatsApp, equipment.name, startDate, endDate, clientName, clientEmail)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="neon-btn text-xs py-3 px-6"
                >
                  <MessageSquare className="w-4 h-4" />
                  Re-Open WhatsApp Chat
                </a>
              )}
              <NeonButton variant="outline" onClick={onClose} size="sm">
                Close & Return to Catalog
              </NeonButton>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
            
            {/* Machine Summary Pill */}
            <div className="flex items-center justify-between p-3.5 rounded-lg bg-surface-card border border-border text-xs">
              <div>
                <span className="text-muted block">Category: {equipment.category}</span>
                <span className="text-primary font-bold text-base font-heading">
                  {formatCurrency(equipment.daily_rate)} <span className="text-xs text-muted font-normal">/ day</span>
                </span>
              </div>
              <div className="text-right">
                <span className="text-muted block">Status</span>
                <span className="text-emerald-400 font-mono font-semibold">Available for Project Dates</span>
              </div>
            </div>

            {conflictError && (
              <div className="p-3.5 rounded-lg bg-rose-950/60 border border-rose-700 text-rose-300 text-xs flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                <span>{conflictError}</span>
              </div>
            )}

            {/* Date Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-gray-300 mb-1.5 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-primary" />
                  Project Start Date *
                </label>
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-neutral-900 border border-border rounded px-3 py-2 text-sm text-white focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-gray-300 mb-1.5 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-primary" />
                  Project End Date *
                </label>
                <input
                  type="date"
                  required
                  min={startDate || new Date().toISOString().split('T')[0]}
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-neutral-900 border border-border rounded px-3 py-2 text-sm text-white focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            {/* Client Contact Info */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-gray-300 mb-1.5 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-primary" />
                  Full Name / Contractor Entity *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Mutwiri (Meru Highway Contractors)"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full bg-neutral-900 border border-border rounded px-3 py-2 text-sm text-white focus:border-primary focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-gray-300 mb-1.5 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-primary" />
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="site.manager@contractor.ke"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    className="w-full bg-neutral-900 border border-border rounded px-3 py-2 text-sm text-white focus:border-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-gray-300 mb-1.5 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-primary" />
                    Phone / WhatsApp Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 0712 345678"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    className="w-full bg-neutral-900 border border-border rounded px-3 py-2 text-sm text-white focus:border-primary focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Communication Routing Choice */}
            <div className="space-y-2 pt-1">
              <label className="block text-xs font-mono text-gray-300">
                Preferred Negotiation Channel:
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPreferredContact('WHATSAPP')}
                  className={`p-3 rounded-lg border flex items-center justify-center gap-2 text-xs font-medium transition-all ${
                    preferredContact === 'WHATSAPP'
                      ? 'bg-emerald-950/70 border-emerald-500 text-emerald-300 shadow-neon'
                      : 'bg-surface-card border-border text-gray-400 hover:text-white'
                  }`}
                >
                  <MessageSquare className="w-4 h-4 text-emerald-400" />
                  <span>WhatsApp Chat (Instant)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPreferredContact('EMAIL')}
                  className={`p-3 rounded-lg border flex items-center justify-center gap-2 text-xs font-medium transition-all ${
                    preferredContact === 'EMAIL'
                      ? 'bg-primary/20 border-primary text-primary shadow-neon'
                      : 'bg-surface-card border-border text-gray-400 hover:text-white'
                  }`}
                >
                  <Mail className="w-4 h-4 text-primary" />
                  <span>Email Thread</span>
                </button>
              </div>
            </div>

            {/* WhatsApp Line Selection if WhatsApp is active */}
            {preferredContact === 'WHATSAPP' && (
              <div className="p-3 bg-surface-card rounded-lg border border-border/70 text-xs space-y-2">
                <span className="text-muted block text-[11px] font-mono">Select Dispatch Line:</span>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="waLine"
                      checked={whatsappLine === 'PRIMARY'}
                      onChange={() => setWhatsappLine('PRIMARY')}
                      className="accent-primary"
                    />
                    <span className="text-gray-200">0717 186396 <span className="text-primary font-bold">(Primary)</span></span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="waLine"
                      checked={whatsappLine === 'BACKUP'}
                      onChange={() => setWhatsappLine('BACKUP')}
                      className="accent-primary"
                    />
                    <span className="text-gray-200">0748866823 (Backup)</span>
                  </label>
                </div>
              </div>
            )}

            {/* Price Estimation */}
            {startDate && endDate && (
              <div className="p-3.5 bg-neutral-900 rounded-lg border border-primary/30 flex items-center justify-between text-xs">
                <div>
                  <span className="text-muted block">Duration: {days} Day(s)</span>
                  <span className="text-gray-200">{startDate} → {endDate}</span>
                </div>
                <div className="text-right">
                  <span className="text-muted block">Estimated Quotation</span>
                  <span className="text-primary font-bold text-lg font-heading">
                    {formatCurrency(estimatedTotal)}
                  </span>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded text-xs text-gray-400 hover:text-white"
              >
                Cancel
              </button>
              <NeonButton
                type="submit"
                disabled={loading}
                className="text-xs py-3 px-6"
                icon={preferredContact === 'WHATSAPP' ? <MessageSquare className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
              >
                {loading ? 'Processing...' : preferredContact === 'WHATSAPP' ? 'Open WhatsApp Negotiation' : 'Send Booking Request'}
              </NeonButton>
            </div>

          </form>
        )}

      </div>
    </div>
  );
}
