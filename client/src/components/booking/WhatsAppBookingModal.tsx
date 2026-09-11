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
  ArrowRight,
  ShieldCheck 
} from 'lucide-react';

interface WhatsAppBookingModalProps {
  equipment: Equipment | null;
  isOpen: boolean;
  onClose: () => void;
  prefillDates?: {
    startDate?: string;
    endDate?: string;
  };
}

export default function WhatsAppBookingModal({
  equipment,
  isOpen,
  onClose,
  prefillDates
}: WhatsAppBookingModalProps) {
  const [startDate, setStartDate] = useState(prefillDates?.startDate || '');
  const [endDate, setEndDate] = useState(prefillDates?.endDate || '');
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
  const dailyRate = typeof equipment.daily_rate === 'number' ? equipment.daily_rate : parseFloat(equipment.daily_rate as string || '0');
  const estimatedTotal = days * dailyRate;

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
        if (data?.error?.includes('already booked') || res.status === 409) {
          setConflictError('⚠️ Exclusion Conflict: This machine has an active reservation during your selected dates. Please adjust your date range.');
        } else {
          setConflictError(data?.error || 'Failed to submit inquiry.');
        }
        setLoading(false);
        return;
      }

      setSuccessData(data.data || { client_name: clientName });

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white border border-border rounded-2xl shadow-2xl overflow-hidden text-ink">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-surface border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center">
              <Truck className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-heading text-lg font-bold text-ink tracking-wide">
                Machinery Booking & Inquiry
              </h2>
              <p className="text-xs text-muted font-mono">{equipment.name} • {equipment.model}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-zinc-200 text-zinc-500 hover:text-ink transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        {successData ? (
          <div className="p-8 text-center space-y-5">
            <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-600 mx-auto flex items-center justify-center shadow-subtle">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="font-heading text-2xl font-bold text-ink">
              Inquiry & Hold Registered!
            </h3>
            <p className="text-sm text-zinc-600 max-w-md mx-auto">
              Your booking inquiry for <strong className="text-primary">{equipment.name}</strong> from <strong>{startDate}</strong> to <strong>{endDate}</strong> has been logged in the HLG Dispatch Command Center.
            </p>
            
            <div className="p-4 bg-surface rounded-xl border border-border text-xs text-zinc-700 space-y-2 text-left max-w-md mx-auto font-mono">
              <p><strong>Contractor:</strong> {clientName} ({clientEmail || clientPhone})</p>
              <p><strong>Duration:</strong> {days} days</p>
              <p><strong>Dispatch Channel:</strong> {preferredContact === 'WHATSAPP' ? `WhatsApp (${displayPhone})` : 'Email Negotiation'}</p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
              {preferredContact === 'WHATSAPP' && (
                <a
                  href={buildWhatsAppBookingLink(targetWhatsApp, equipment.name, startDate, endDate, clientName, clientEmail)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary py-2.5 px-5 text-xs flex items-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  Start WhatsApp Chat
                </a>
              )}
              {preferredContact === 'EMAIL' && (
                <a
                  href={`mailto:hilosgehtinfo@gmail.com?subject=Booking%20Inquiry:%20${encodeURIComponent(equipment.name)}&body=Hello%20HLG%20Dispatch,%0D%0A%0D%0AMy%20name%20is%20${encodeURIComponent(clientName)}.%20I%20would%20like%20to%20hire%20the%20${encodeURIComponent(equipment.name)}%20from%20${startDate}%20to%20${endDate}.`}
                  className="btn-primary py-2.5 px-5 text-xs flex items-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  Open Email Thread
                </a>
              )}
              <button 
                onClick={onClose}
                className="btn-secondary py-2.5 px-5 text-xs"
              >
                Close Window
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
            
            {/* Machine Summary Pill */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-surface border border-border text-xs">
              <div>
                <span className="text-muted block">Category: {equipment.category}</span>
                <span className="text-primary font-bold text-base font-heading">
                  {equipment.category}
                </span>
              </div>
              <div className="text-right">
                <span className="text-muted block">Status</span>
                <span className="text-emerald-600 font-mono font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Available for Project
                </span>
              </div>
            </div>

            {conflictError && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 text-xs flex items-start gap-2.5 font-sans">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                <span>{conflictError}</span>
              </div>
            )}

            {/* Date Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-zinc-700 mb-1.5 flex items-center gap-1.5 font-bold">
                  <Calendar className="w-3.5 h-3.5 text-primary" />
                  Project Start Date *
                </label>
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-ink focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-zinc-700 mb-1.5 flex items-center gap-1.5 font-bold">
                  <Calendar className="w-3.5 h-3.5 text-primary" />
                  Project End Date *
                </label>
                <input
                  type="date"
                  required
                  min={startDate || new Date().toISOString().split('T')[0]}
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-ink focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            {/* Client Contact Info */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-zinc-700 mb-1.5 flex items-center gap-1.5 font-bold">
                  <User className="w-3.5 h-3.5 text-primary" />
                  Full Name / Contractor Entity *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Mutwiri (Meru Highway Contractors)"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-ink focus:border-primary focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-zinc-700 mb-1.5 flex items-center gap-1.5 font-bold">
                    <Mail className="w-3.5 h-3.5 text-primary" />
                    Email Address {preferredContact === 'EMAIL' ? '*' : '(Optional)'}
                  </label>
                  <input
                    type="email"
                    required={preferredContact === 'EMAIL'}
                    placeholder="site.manager@contractor.ke"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-ink focus:border-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-zinc-700 mb-1.5 flex items-center gap-1.5 font-bold">
                    <Phone className="w-3.5 h-3.5 text-primary" />
                    Phone / WhatsApp Number {preferredContact === 'WHATSAPP' ? '*' : '(Optional)'}
                  </label>
                  <input
                    type="tel"
                    required={preferredContact === 'WHATSAPP'}
                    placeholder="e.g. 0712 345678"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-ink focus:border-primary focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Communication Routing Choice */}
            <div className="space-y-2 pt-1">
              <label className="block text-xs font-mono text-zinc-700 font-bold">
                Preferred Negotiation Channel:
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPreferredContact('WHATSAPP')}
                  className={`p-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-semibold transition-all ${
                    preferredContact === 'WHATSAPP'
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-sm'
                      : 'bg-surface border-border text-zinc-600 hover:text-ink'
                  }`}
                >
                  <MessageSquare className="w-4 h-4 text-emerald-600" />
                  <span>WhatsApp Chat (Instant)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPreferredContact('EMAIL')}
                  className={`p-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-semibold transition-all ${
                    preferredContact === 'EMAIL'
                      ? 'bg-primary-light border-primary text-primary shadow-sm'
                      : 'bg-surface border-border text-zinc-600 hover:text-ink'
                  }`}
                >
                  <Mail className="w-4 h-4 text-primary" />
                  <span>Email Thread</span>
                </button>
              </div>
            </div>

            {/* WhatsApp Line Selection if WhatsApp is active */}
            {preferredContact === 'WHATSAPP' && (
              <div className="p-3 bg-surface rounded-xl border border-border text-xs space-y-2">
                <span className="text-muted block text-[11px] font-mono font-bold">Select Dispatch Line:</span>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="waLine"
                      checked={whatsappLine === 'PRIMARY'}
                      onChange={() => setWhatsappLine('PRIMARY')}
                      className="accent-primary"
                    />
                    <span className="text-zinc-800 font-mono">0717 186396 <span className="text-primary font-bold">(Primary)</span></span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="waLine"
                      checked={whatsappLine === 'BACKUP'}
                      onChange={() => setWhatsappLine('BACKUP')}
                      className="accent-primary"
                    />
                    <span className="text-zinc-800 font-mono">0748866823 (Backup)</span>
                  </label>
                </div>
              </div>
            )}

            {startDate && endDate && (
              <div className="p-3.5 bg-surface rounded-xl border border-primary/30 flex items-center justify-between text-xs">
                <div>
                  <span className="text-muted block font-mono">Duration: {days} Day(s)</span>
                  <span className="text-zinc-800 font-mono font-semibold">{startDate} &rarr; {endDate}</span>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-xs text-zinc-600 hover:text-ink font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary text-xs py-2.5 px-5"
              >
                {loading ? 'Processing...' : preferredContact === 'WHATSAPP' ? 'Confirm Inquiry & Open WhatsApp' : 'Submit Booking Inquiry'}
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
}
