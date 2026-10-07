'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  User, 
  Mail, 
  Phone, 
  ShieldCheck, 
  Clock, 
  ArrowLeft,
  CheckCircle2,
  Award,
  AlertCircle,
  TrendingUp,
  Camera,
  Upload,
  Lock,
  Eye,
  EyeOff,
  Save,
  RefreshCw,
  Sparkles,
  Trash2,
  Check,
  ChevronRight
} from 'lucide-react';

interface PresetAvatar {
  id: string;
  url: string;
  title: string;
  category: string;
}

const PRESET_AVATARS: PresetAvatar[] = [
  { id: 'avatar-1', url: '/avatars/avatar-1.svg', title: 'Lead Plant Operator', category: 'Heavy Plant' },
  { id: 'avatar-2', url: '/avatars/avatar-2.svg', title: 'Safety Supervisor', category: 'Site Safety' },
  { id: 'avatar-3', url: '/avatars/avatar-3.svg', title: 'Heavy Haulage Driver', category: 'Logistics' },
  { id: 'avatar-4', url: '/avatars/avatar-4.svg', title: 'Motor Grader Specialist', category: 'Road Works' },
  { id: 'avatar-5', url: '/avatars/avatar-5.svg', title: 'Quarry Plant Technician', category: 'Quarrying' },
  { id: 'avatar-6', url: '/avatars/avatar-6.svg', title: 'Wheel Loader Operator', category: 'Earthmoving' },
  { id: 'avatar-7', url: '/avatars/avatar-7.svg', title: 'Meru Fleet Master', category: 'Command' },
  { id: 'avatar-8', url: '/avatars/avatar-8.svg', title: 'Hydraulic Compactor Lead', category: 'Compaction' },
];

export default function StaffProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  // Security / Password state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Status & Upload states
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('hlg_user');
      let parsedUser: any = null;
      if (stored) {
        try {
          parsedUser = JSON.parse(stored);
          setUser(parsedUser);
          setFullName(parsedUser.full_name || '');
          setEmail(parsedUser.email || '');
          setPhoneNumber(parsedUser.phone_number || '');
          setAvatarUrl(parsedUser.avatar_url || null);
        } catch (e) {
          console.error('Failed to parse cached user:', e);
        }
      }

      // Silently refresh latest profile from database/server
      if (parsedUser?.email || parsedUser?.id) {
        const query = new URLSearchParams();
        if (parsedUser.id) query.set('id', parsedUser.id);
        if (parsedUser.email) query.set('email', parsedUser.email);

        fetch(`/api/v1/auth/profile?${query.toString()}`)
          .then((res) => res.json())
          .then((data) => {
            if (data?.success && data?.data) {
              const fresh = data.data;
              setUser(fresh);
              setFullName(fresh.full_name || '');
              setEmail(fresh.email || '');
              setPhoneNumber(fresh.phone_number || '');
              setAvatarUrl(fresh.avatar_url || null);
              localStorage.setItem('hlg_user', JSON.stringify(fresh));
              window.dispatchEvent(new Event('hlg_user_updated'));
            }
          })
          .catch((err) => console.warn('Could not refresh profile from server:', err));
      }
    }
  }, []);

  // Handle custom photo upload via Vercel Blob store
  const handleCustomPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select a valid image file (PNG, JPG, WEBP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('Selected photo is too large. Maximum allowed size is 5MB.');
      return;
    }

    setErrorMsg(null);
    setSuccessMsg(null);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/v1/storage/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to upload image to storage.');
      }

      const uploadedUrl = data.viewUrl || data.url;
      setAvatarUrl(uploadedUrl);
      setSuccessMsg('Photo uploaded successfully! Remember to click "Save Profile Changes" below.');
    } catch (err: any) {
      console.error('Upload error:', err);
      setErrorMsg(err.message || 'Error uploading photo. Please try again.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Select preset avatar
  const handleSelectPreset = (url: string) => {
    setAvatarUrl(url);
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  // Revert / remove avatar
  const handleRemoveAvatar = () => {
    setAvatarUrl(null);
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  // Handle full profile save
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!fullName.trim()) {
      setErrorMsg('Full name is required.');
      return;
    }

    if (!email.trim()) {
      setErrorMsg('Email address is required.');
      return;
    }

    // Password validation
    if (newPassword) {
      if (newPassword.length < 6) {
        setErrorMsg('New password must be at least 6 characters long.');
        return;
      }
      if (newPassword !== confirmPassword) {
        setErrorMsg('New password and confirmation password do not match.');
        return;
      }
    }

    setIsSaving(true);

    try {
      const payload: any = {
        id: user?.id,
        currentEmail: user?.email,
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        phoneNumber: phoneNumber.trim() || null,
        avatarUrl: avatarUrl || null,
      };

      if (newPassword) {
        payload.newPassword = newPassword;
        payload.confirmPassword = confirmPassword;
      }

      const res = await fetch('/api/v1/auth/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const resData = await res.json();

      if (!res.ok || !resData.success) {
        throw new Error(resData.error || 'Failed to update profile.');
      }

      const updatedUser = resData.data;

      // Update local storage and dispatch real-time sync event
      localStorage.setItem('hlg_user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      setFullName(updatedUser.full_name || '');
      setEmail(updatedUser.email || '');
      setPhoneNumber(updatedUser.phone_number || '');
      setAvatarUrl(updatedUser.avatar_url || null);

      // Reset password inputs
      setNewPassword('');
      setConfirmPassword('');

      // Notify sidebar & navigation components
      window.dispatchEvent(new Event('hlg_user_updated'));

      setSuccessMsg('Your profile details and credentials have been updated successfully!');
    } catch (err: any) {
      console.error('Save error:', err);
      setErrorMsg(err.message || 'An error occurred while saving your profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return 'OP';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      {/* Top Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-muted mb-1">
            <Link 
              href="/staff" 
              className="hover:text-primary transition-colors flex items-center gap-1 font-semibold text-zinc-600"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Operator Daily Logs
            </Link>
            <span>/</span>
            <span className="text-primary font-bold">Profile & Settings</span>
          </div>
          <h1 className="text-2xl font-heading font-black text-ink tracking-tight">
            Operator Account & Profile
          </h1>
          <p className="text-xs text-muted font-mono mt-0.5">
            Manage your personal information, login credentials, and equipment certifications.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/staff/analytics"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-mono font-bold bg-orange-50 text-primary border border-primary/20 hover:bg-primary hover:text-white transition-all shadow-subtle"
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>My Shift Analytics</span>
          </Link>
        </div>
      </div>

      {/* Notification Banners */}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-mono flex items-start gap-3 shadow-subtle animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold">Error:</span> {errorMsg}
          </div>
          <button 
            type="button" 
            onClick={() => setErrorMsg(null)}
            className="text-rose-500 hover:text-rose-700 text-sm font-bold leading-none"
          >
            ×
          </button>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-mono flex items-start gap-3 shadow-subtle animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold">Success:</span> {successMsg}
          </div>
          <button 
            type="button" 
            onClick={() => setSuccessMsg(null)}
            className="text-emerald-500 hover:text-emerald-700 text-sm font-bold leading-none"
          >
            ×
          </button>
        </div>
      )}

      {/* Main Profile Summary Hero Card */}
      <div className="bg-white border border-border rounded-2xl p-6 relative overflow-hidden shadow-card">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Round Current Avatar */}
          <div className="relative group shrink-0">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={fullName || 'Operator'}
                className="w-24 h-24 rounded-full object-cover border-4 border-primary/20 shadow-lg bg-surface"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-primary to-amber-500 flex items-center justify-center text-white font-heading font-black text-3xl shadow-lg border-4 border-orange-100">
                {getInitials(fullName || user?.full_name)}
              </div>
            )}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 p-2 rounded-full bg-primary text-white hover:bg-orange-600 shadow-md transition-transform hover:scale-110 cursor-pointer"
              title="Upload new profile picture"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>

          {/* User Details Overview */}
          <div className="flex-1 text-center sm:text-left space-y-1.5">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <h2 className="text-2xl font-heading font-black text-ink">
                {fullName || user?.full_name || 'Field Machinery Operator'}
              </h2>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 w-fit mx-auto sm:mx-0">
                <ShieldCheck className="w-3.5 h-3.5" /> VERIFIED {user?.role || 'OPERATOR'}
              </span>
            </div>

            <p className="text-xs font-mono text-muted">
              {email || user?.email || 'operator@hilosgeht.co.ke'} • Meru Heavy Infrastructure Fleet
            </p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-2 text-xs font-mono text-zinc-600">
              <span className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-primary" />
                {phoneNumber || user?.phone_number || 'No phone recorded'}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-600" />
                Shift Status: <strong className="text-emerald-700 font-bold">Active On Site</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Quick Plant Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-6 border-t border-border">
          <div className="p-3 bg-surface border border-border rounded-xl">
            <div className="text-[10px] font-mono text-muted uppercase font-semibold">ASSIGNED REGION</div>
            <div className="text-xs font-bold text-ink mt-0.5">Meru County & Mt. Kenya Sites</div>
          </div>
          <div className="p-3 bg-surface border border-border rounded-xl">
            <div className="text-[10px] font-mono text-muted uppercase font-semibold">OPERATING PERMIT</div>
            <div className="text-xs font-bold text-emerald-700 mt-0.5">Heavy Plant Class G (Verified)</div>
          </div>
          <div className="p-3 bg-surface border border-border rounded-xl">
            <div className="text-[10px] font-mono text-muted uppercase font-semibold">STORAGE BACKEND</div>
            <div className="text-xs font-bold text-primary mt-0.5">Vercel Blob & PostgreSQL</div>
          </div>
        </div>
      </div>

      {/* Main Edit Form */}
      <form onSubmit={handleSaveProfile} className="space-y-6">
        {/* SECTION 1: Profile Picture & Avatar Selection */}
        <div className="bg-white border border-border rounded-2xl p-6 space-y-6 shadow-card">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div>
              <h3 className="text-base font-heading font-bold text-ink flex items-center gap-2">
                <Camera className="w-4 h-4 text-primary" />
                Profile Picture & Avatar
              </h3>
              <p className="text-xs text-muted font-mono mt-0.5">
                Upload your own photo to Vercel Blob storage, or choose one of the official operator avatars.
              </p>
            </div>
            {avatarUrl && (
              <button
                type="button"
                onClick={handleRemoveAvatar}
                className="text-xs font-mono text-rose-600 hover:text-rose-700 flex items-center gap-1 px-2.5 py-1 rounded-lg border border-rose-200 hover:bg-rose-50 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Remove Picture
              </button>
            )}
          </div>

          {/* Photo Actions: Upload Button */}
          <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-orange-50/50 border border-orange-200/60 rounded-xl">
            <div className="relative shrink-0">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Selected avatar"
                  className="w-16 h-16 rounded-full object-cover border-2 border-primary shadow-sm bg-white"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-primary to-amber-500 text-white font-bold text-xl flex items-center justify-center shadow-sm">
                  {getInitials(fullName || user?.full_name)}
                </div>
              )}
            </div>

            <div className="flex-1 text-center sm:text-left space-y-1">
              <div className="font-bold text-ink text-sm">Upload Custom Profile Photo</div>
              <div className="text-xs text-muted font-mono">
                Stored permanently on Vercel Blob storage. PNG, JPG, or WEBP up to 5MB.
              </div>
            </div>

            <div className="shrink-0">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleCustomPhotoUpload}
                accept="image/*"
                className="hidden"
                id="avatar-file-input"
              />
              <button
                type="button"
                disabled={isUploading}
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2.5 rounded-xl bg-white border border-primary/30 text-primary hover:bg-primary hover:text-white text-xs font-mono font-bold transition-all shadow-subtle flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isUploading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Uploading to Blob...
                  </>
                ) : (
                  <>
                    <Upload className="w-3.5 h-3.5" />
                    Upload Photo
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Preset Avatars Selection Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono font-bold text-ink uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Or Select an Official Operator Avatar Preset
              </label>
              <span className="text-[11px] font-mono text-muted">8 Avatars Available</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {PRESET_AVATARS.map((preset) => {
                const isSelected = avatarUrl === preset.url;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectPreset(preset.url)}
                    className={`p-3 rounded-xl border text-center transition-all relative flex flex-col items-center gap-2 cursor-pointer ${
                      isSelected
                        ? 'border-primary bg-orange-50/80 shadow-md ring-2 ring-primary/40'
                        : 'border-border bg-surface hover:bg-white hover:border-primary/40'
                    }`}
                  >
                    <div className="relative">
                      <img
                        src={preset.url}
                        alt={preset.title}
                        className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm bg-white"
                      />
                      {isSelected && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center shadow-xs">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </div>
                    <div className="space-y-0.5">
                      <div className="text-xs font-bold text-ink line-clamp-1">{preset.title}</div>
                      <div className="text-[10px] font-mono text-muted">{preset.category}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* SECTION 2: Personal & Contact Details */}
        <div className="bg-white border border-border rounded-2xl p-6 space-y-5 shadow-card">
          <div className="border-b border-border pb-4">
            <h3 className="text-base font-heading font-bold text-ink flex items-center gap-2">
              <User className="w-4 h-4 text-primary" />
              Personal & Contact Information
            </h3>
            <p className="text-xs text-muted font-mono mt-0.5">
              Edit your name, official email address, and active mobile number.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Full Name */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-mono font-bold text-ink uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-primary" />
                Full Legal Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Brian K. Mwenda"
                required
                className="w-full px-4 py-2.5 text-sm bg-surface border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-ink font-medium"
              />
              <p className="text-[11px] font-mono text-muted">
                Appears on all signed daily machinery logs and plant fuel verifications.
              </p>
            </div>

            {/* Email Address - Fully Editable */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-bold text-ink uppercase tracking-wider flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-primary" />
                Email Address <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. operator@hilosgeht.co.ke"
                required
                className="w-full px-4 py-2.5 text-sm bg-surface border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-ink font-medium"
              />
              <p className="text-[11px] font-mono text-muted">
                Used for platform login and dispatch alerts. You can change this anytime.
              </p>
            </div>

            {/* Phone Number */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-bold text-ink uppercase tracking-wider flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-primary" />
                Mobile Phone Number
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="e.g. +254 717 186396"
                className="w-full px-4 py-2.5 text-sm bg-surface border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-ink font-medium"
              />
              <p className="text-[11px] font-mono text-muted">
                Direct contact line for fleet dispatch and site emergency coordination.
              </p>
            </div>
          </div>
        </div>

        {/* SECTION 3: Security & Password Change */}
        <div className="bg-white border border-border rounded-2xl p-6 space-y-5 shadow-card">
          <div className="border-b border-border pb-4">
            <h3 className="text-base font-heading font-bold text-ink flex items-center gap-2">
              <Lock className="w-4 h-4 text-primary" />
              Security & Password
            </h3>
            <p className="text-xs text-muted font-mono mt-0.5">
              Leave blank if you do not wish to change your current password.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* New Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-bold text-ink uppercase tracking-wider">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Leave blank to keep unchanged"
                  className="w-full px-4 py-2.5 pr-10 text-sm bg-surface border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-ink font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink transition-colors"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] font-mono text-muted">
                Must be at least 6 characters long.
              </p>
            </div>

            {/* Confirm New Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-bold text-ink uppercase tracking-wider">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="w-full px-4 py-2.5 pr-10 text-sm bg-surface border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-ink font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {newPassword && confirmPassword && (
                <p className={`text-[11px] font-mono ${newPassword === confirmPassword ? 'text-emerald-600 font-bold' : 'text-rose-600'}`}>
                  {newPassword === confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Action Button Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white border border-border rounded-2xl shadow-card">
          <div className="text-xs font-mono text-muted">
            All updates sync immediately to PostgreSQL & Vercel storage.
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Link
              href="/staff"
              className="px-4 py-2.5 rounded-xl border border-border bg-surface hover:bg-zinc-100 text-xs font-mono font-bold text-zinc-600 transition-colors w-full sm:w-auto text-center"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 rounded-xl bg-primary text-white hover:bg-orange-600 font-bold text-xs font-mono transition-all shadow-orange flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Saving Profile...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Profile Changes
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Authorized Equipment Certifications Card */}
      <div className="bg-white border border-border rounded-2xl p-6 space-y-4 shadow-card">
        <h3 className="text-lg font-heading font-bold text-ink flex items-center gap-2">
          <Award className="w-5 h-5 text-primary" />
          Authorized Equipment Certifications
        </h3>
        <p className="text-xs text-muted font-mono">
          Equipment models calibrated and authorized under your operating permit across Meru quarry and civil sites.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {[
            { name: 'Komatsu PC-200', type: 'Hydraulic Excavator', status: 'Certified Level 3' },
            { name: 'JCB 3DXPLUS', type: 'Backhoe Loader', status: 'Certified Level 3' },
            { name: 'Shantui SL60W-2', type: 'Wheel Loader', status: 'Certified Level 2' },
            { name: 'Shantui SG18-3', type: 'Motor Grader', status: 'Certified Level 2' },
            { name: 'XCMG XS163J', type: 'Vibratory Road Roller', status: 'Certified Level 2' },
            { name: 'Isuzu FVZ 34', type: 'Heavy Tipper Truck', status: 'Commercial Class C/E' },
          ].map((mach, i) => (
            <div key={i} className="p-3.5 bg-surface border border-border rounded-xl flex items-center justify-between hover:border-primary/40 transition-colors">
              <div>
                <div className="font-bold text-ink text-sm">{mach.name}</div>
                <div className="text-xs text-muted font-mono">{mach.type}</div>
              </div>
              <span className="text-[11px] font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                {mach.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
