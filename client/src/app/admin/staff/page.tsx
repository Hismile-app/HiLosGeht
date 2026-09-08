'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  Mail, 
  Phone, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle,
  Send,
  UserCheck
} from 'lucide-react';
import GlassCard from '@/components/common/GlassCard';
import StatusBadge from '@/components/common/StatusBadge';
import NeonButton from '@/components/common/NeonButton';
import { Profile } from '@/types';
import { formatDate } from '@/lib/utils';

export default function StaffManagementPage() {
  const [staffList, setStaffList] = useState<Profile[]>([]);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [role, setRole] = useState<'OPERATOR' | 'ADMIN'>('OPERATOR');
  
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchStaff = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
      const res = await fetch(`${apiUrl}/auth/staff`);
      if (res.ok) {
        const data = await res.json();
        setStaffList(data.data || []);
      }
    } catch (e) {
      // fallback
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
      const res = await fetch(`${apiUrl}/auth/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          email,
          phoneNumber,
          role,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Failed to dispatch invitation.');
      } else {
        setSuccessMsg(`✅ Invitation dispatched to ${email} (Routed to testing target: kbrian1237@gmail.com).`);
        setFullName('');
        setEmail('');
        setPhoneNumber('');
        fetchStaff();
        setTimeout(() => {
          setShowInviteModal(false);
          setSuccessMsg(null);
        }, 3000);
      }
    } catch (err: any) {
      setErrorMsg('Connection error sending invitation.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-primary font-mono text-xs uppercase mb-1">
            Module 4: Staff Management & Onboarding
          </div>
          <h1 className="font-heading font-black text-2xl sm:text-3xl text-white uppercase">
            Heavy Equipment Operators & Personnel
          </h1>
          <p className="text-xs text-muted">
            Invitation-only staff provisioning. Automated Nodemailer SMTP link dispatch.
          </p>
        </div>

        <NeonButton
          size="sm"
          onClick={() => setShowInviteModal(true)}
          icon={<UserPlus className="w-4 h-4" />}
        >
          Invite Staff Member
        </NeonButton>
      </div>

      {/* Staff Table */}
      <GlassCard className="p-0 overflow-x-auto border border-border">
        <table className="w-full text-left text-xs">
          <thead className="bg-surface-card border-b border-border text-gray-400 font-mono uppercase text-[11px]">
            <tr>
              <th className="p-4">Personnel Name</th>
              <th className="p-4">Email Address</th>
              <th className="p-4">Phone (WhatsApp)</th>
              <th className="p-4">Assigned Role</th>
              <th className="p-4">Account Status</th>
              <th className="p-4">Registered Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60 text-gray-300">
            {staffList.map((staff) => (
              <tr key={staff.id} className="hover:bg-neutral-900/60 transition-colors">
                <td className="p-4 font-bold text-white flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-heading font-bold text-xs">
                    {staff.full_name?.charAt(0) || 'U'}
                  </div>
                  <span>{staff.full_name}</span>
                </td>

                <td className="p-4 font-mono text-gray-300">
                  {staff.email}
                </td>

                <td className="p-4 font-mono">
                  {staff.phone_number || '—'}
                </td>

                <td className="p-4 font-mono">
                  <span className={staff.role === 'ADMIN' ? 'text-primary font-bold' : 'text-sky-400'}>
                    {staff.role}
                  </span>
                </td>

                <td className="p-4">
                  <StatusBadge status={staff.account_status} />
                </td>

                <td className="p-4 font-mono text-muted text-[11px]">
                  {formatDate(staff.created_at)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </GlassCard>

      {/* Invite Staff Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-surface border border-primary/40 rounded-xl p-6 space-y-4 text-white">
            <h2 className="font-heading text-lg font-bold">Invite Staff Operator</h2>
            <p className="text-xs text-muted">
              Entering name and email will generate a secure onboarding token and dispatch an activation link via SMTP.
            </p>

            {successMsg && (
              <div className="p-3 bg-emerald-950/80 border border-emerald-500 rounded text-emerald-300 text-xs">
                {successMsg}
              </div>
            )}

            {errorMsg && (
              <div className="p-3 bg-rose-950/80 border border-rose-700 rounded text-rose-300 text-xs">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleInvite} className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-300 font-mono mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Peter Mwiti (Grader Specialist)"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-neutral-900 border border-border rounded px-3 py-2 text-white focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-mono mb-1">Staff Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="operator.name@hilosgeht.ke"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-neutral-900 border border-border rounded px-3 py-2 text-white focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-mono mb-1">Phone Number (Optional)</label>
                <input
                  type="tel"
                  placeholder="0712 345678"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full bg-neutral-900 border border-border rounded px-3 py-2 text-white focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-mono mb-1">Portal Role *</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full bg-neutral-900 border border-border rounded px-3 py-2 text-white focus:border-primary focus:outline-none"
                >
                  <option value="OPERATOR">OPERATOR (Field Logging)</option>
                  <option value="ADMIN">ADMIN (Full Command)</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 rounded text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <NeonButton type="submit" size="sm" disabled={submitting} icon={<Send className="w-3.5 h-3.5" />}>
                  {submitting ? 'Dispatching...' : 'Send Invitation Email'}
                </NeonButton>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
