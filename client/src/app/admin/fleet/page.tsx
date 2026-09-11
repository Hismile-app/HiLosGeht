'use client';

import React, { useState, useEffect } from 'react';
import { 
  Truck, 
  Plus, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  Wrench, 
  Search, 
  Filter,
  Cpu
} from 'lucide-react';
import GlassCard from '@/components/common/GlassCard';
import StatusBadge from '@/components/common/StatusBadge';
import NeonButton from '@/components/common/NeonButton';
import { Equipment } from '@/types';
import { formatCurrency } from '@/lib/utils';

export default function FleetManagementPage() {
  const [fleet, setFleet] = useState<Equipment[]>([]);
  const [search, setSearch] = useState('');
  const [editingItem, setEditingItem] = useState<Equipment | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    category: 'Excavator',
    model: '',
    status: 'AVAILABLE',
    imageUrl: '',
    telemetryApiId: '',
  });

  const fetchFleet = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
      const res = await fetch(`${apiUrl}/equipment`);
      if (res.ok) {
        const data = await res.json();
        setFleet(data?.data || []);
      }
    } catch (e) {
      // fallback
    }
  };

  useEffect(() => {
    fetchFleet();
  }, []);

  const handleStatusToggle = async (machine: Equipment, nextStatus: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
      await fetch(`${apiUrl}/equipment/${machine.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      fetchFleet();
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveEquipment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
      const method = editingItem ? 'PUT' : 'POST';
      const endpoint = editingItem ? `${apiUrl}/equipment/${editingItem.id}` : `${apiUrl}/equipment`;

      await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          category: formData.category,
          model: formData.model,
          dailyRate: 0,
          status: formData.status,
          imageUrl: formData.imageUrl,
          telemetryApiId: formData.telemetryApiId,
        }),
      });

      setShowAddModal(false);
      setEditingItem(null);
      fetchFleet();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this equipment profile?')) return;
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
      await fetch(`${apiUrl}/equipment/${id}`, { method: 'DELETE' });
      fetchFleet();
    } catch (e) {
      console.error(e);
    }
  };

  const filtered = (fleet ?? []).filter(f => 
    (f.name || '').toLowerCase().includes(search.toLowerCase()) || 
    (f.model || '').toLowerCase().includes(search.toLowerCase()) ||
    (f.category || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-primary font-mono text-xs uppercase mb-1 font-semibold">
            Module 2: Fleet Management (CRUD)
          </div>
          <h1 className="font-heading font-black text-2xl sm:text-3xl text-foreground uppercase">
            Machinery Fleet Profiles & Telemetry
          </h1>
          <p className="text-xs text-muted mt-0.5">
            Manage heavy construction equipment catalogue, daily hire rates, and OEM telemetry IDs.
          </p>
        </div>

        <NeonButton
          size="sm"
          onClick={() => {
            setEditingItem(null);
            setFormData({
              name: '',
              category: 'Excavator',
              model: '',
              status: 'AVAILABLE',
              imageUrl: '',
              telemetryApiId: '',
            });
            setShowAddModal(true);
          }}
          icon={<Plus className="w-4 h-4" />}
        >
          Add Machinery Asset
        </NeonButton>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-border flex items-center gap-3 shadow-subtle">
        <Search className="w-4 h-4 text-muted shrink-0" />
        <input
          type="text"
          placeholder="Filter fleet by name, make, model or category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-transparent text-sm text-foreground focus:outline-none placeholder-zinc-400"
        />
      </div>

      {/* Fleet Table */}
      <GlassCard className="p-0 overflow-x-auto border border-border shadow-subtle">
        <table className="w-full text-left text-xs">
          <thead className="bg-surface border-b border-border text-zinc-600 font-mono uppercase text-[11px]">
            <tr>
              <th className="p-4">Machinery Asset</th>
              <th className="p-4">Category & Model</th>
              <th className="p-4">Hour Meter</th>
              <th className="p-4">Status & Toggle</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border text-foreground">
            {filtered.map((item) => (
              <tr key={item.id} className="hover:bg-surface transition-colors">
                
                <td className="p-4 font-medium flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-orange-50 border border-orange-200 flex items-center justify-center shrink-0">
                    <Truck className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <div className="font-bold text-foreground text-sm">{item.name}</div>
                    <div className="text-[11px] text-muted font-mono flex items-center gap-1">
                      <Cpu className="w-3 h-3 text-primary" />
                      <span>{item.telemetry_api_id || 'OEM API Standby'}</span>
                    </div>
                  </div>
                </td>

                <td className="p-4 font-mono">
                  <span className="text-primary font-semibold">{item.category}</span>
                  <span className="block text-muted text-[11px]">{item.model}</span>
                </td>

                <td className="p-4 font-mono font-semibold text-zinc-700">
                  {item.current_hour_meter ?? 0} hrs
                </td>

                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={item.status} />
                    <select
                      value={item.status}
                      onChange={(e) => handleStatusToggle(item, e.target.value)}
                      className="bg-white border border-border rounded px-2 py-1 text-[11px] text-foreground focus:outline-none focus:border-primary cursor-pointer shadow-subtle"
                    >
                      <option value="AVAILABLE">Available</option>
                      <option value="BOOKED">Booked</option>
                      <option value="MAINTENANCE">Maintenance</option>
                    </select>
                  </div>
                </td>

                <td className="p-4 text-right space-x-2">
                  <button
                    onClick={() => {
                      setEditingItem(item);
                      setFormData({
                        name: item.name,
                        category: item.category,
                        model: item.model,
                        status: item.status,
                        imageUrl: item.image_url || '',
                        telemetryApiId: item.telemetry_api_id || '',
                      });
                      setShowAddModal(true);
                    }}
                    className="p-1.5 rounded hover:bg-surface-hover text-zinc-500 hover:text-primary transition-colors"
                    title="Edit"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 rounded hover:bg-rose-50 text-zinc-500 hover:text-rose-600 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      </GlassCard>

      {/* Add / Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white border border-border rounded-2xl p-6 sm:p-7 space-y-4 shadow-2xl">
            <h2 className="font-heading text-lg font-bold text-foreground">
              {editingItem ? 'Edit Machinery Asset' : 'Register New Heavy Machinery'}
            </h2>
            
            <form onSubmit={handleSaveEquipment} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-zinc-700 font-mono mb-1 font-semibold">Equipment Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Komatsu PC-200 Heavy Excavator"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-foreground focus:border-primary focus:bg-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-700 font-mono mb-1 font-semibold">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-foreground focus:border-primary focus:bg-white focus:outline-none cursor-pointer"
                  >
                    <option value="Excavator">Excavator</option>
                    <option value="Dozer">Dozer</option>
                    <option value="Backhoe">Backhoe</option>
                    <option value="Wheel Loader">Wheel Loader</option>
                    <option value="Grader">Grader</option>
                    <option value="Roller">Roller</option>
                    <option value="Tipper">Tipper</option>
                    <option value="Lowbed">Lowbed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-700 font-mono mb-1 font-semibold">Model Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Komatsu PC-200"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-foreground focus:border-primary focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">

                <div>
                  <label className="block text-zinc-700 font-mono mb-1 font-semibold">Telemetry Serial / API ID</label>
                  <input
                    type="text"
                    placeholder="KOM-PC200-KE-001"
                    value={formData.telemetryApiId}
                    onChange={(e) => setFormData({ ...formData, telemetryApiId: e.target.value })}
                    className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-foreground focus:border-primary focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg text-zinc-600 hover:bg-surface text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <NeonButton type="submit" size="sm">
                  Save Equipment
                </NeonButton>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
